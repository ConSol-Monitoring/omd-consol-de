+++
title = "notificationforwarder"
tags = [
  "notificationforwarder",
  "notifications"
]
+++

This framework focuses on two aspects: how to transport a notification to the recipient system and which format to use.
In the beginning, Naemon or one of the other monitoring cores will execute a command line. The actual script and the individual command line parameters are defined in a command definition. Typical parameters are (I use the notation of Nagios macros) HOSTNAME, SERVICEDESC, SERVICESTATE, SERVICEOUTPUT. These snippets need to be combined into a payload suitable for the receiving system. And then this payload must be transported to it. We call the two components *formatter* and *forwarder*. The formatter takes the raw input data and creates a payload and the forwarder transmits the payload to the destination.
What the framework does for you behind the scenes: When forwarding to a recipient fails, the event is saved in a local SQLite database for a certain time and re-sent when the script is next called and the recipient is available again. Logging of successful and of course failed deliveries is also done automatically.\
There is also a component *reporter* which will rarely be used. Its purpose is to run additional code after a successful or failed delivery.\

Let me list some of the formatter/forwarder combinations which are usually found in enterprise environments:

|formatter     |forwarder |
|--------------|----------|
|plain text    |smtp      |
|html          |smtp      |
|json          |ServiceNow api|
|json          |Remedy api|
|json          |SMS gateway api|
|line of text  |Syslog |
|json          |Splunk HEC |
|json          |RabbitMQ |

JSON payloads differ in their attributes and values depending on the recipient.


For every notification recipient you need such a pair. In practice, this means writing two Python files.
Imagine you have a command definition like this:
```
define command{
    command_name    notify-service-victorops
    command_line    $USER1$/notificationforwarder \
                        --forwarder myspecialforwarder \
                        --forwarderopt company_id='$_CONTACTCOMPANY_ID$' \
                        --forwarderopt company_key='$_CONTACTCOMPANY_KEY$' \
                        --forwarderopt routing_key='$_CONTACTROUTING_KEY$' \
...
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt HOSTSTATE='$HOSTSTATE$' \
                        --eventopt HOSTADDRESS='$HOSTADDRESS$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
                        --eventopt LONGSERVICEOUTPUT='$LONGSERVICEOUTPUT$' \
                    >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}
```
Your service notifications should be sent to some ticket tool. The notification script will talk to a REST API and upload a well-formatted JSON payload. Therefore the notification framework has two jobs.
First, take the event attributes (all the --eventopt arguments) and transform them into a JSON structure. Then, upload it with a POST request.

In your OMD site you create a folder *~/local/lib/python/notificationforwarder/myspecialforwarder* and add two files, *formatter.py* and *forwarder.py*.
A skeleton for the *formatter.py* looks like this:

```python
from notificationforwarder.baseclass import NotificationFormatter

class MyspecialforwarderFormatter(NotificationFormatter):

    def format_event(self, event):
        json_payload = {}
        # fill the payload with whatever is required
        json_payload['hostname'] = event.eventopts['HOSTNAME']
        json_payload['remark'] = "here is a ticket for you, haha"
       
        event.payload = json_payload
        event.summary = "this is a one-line summary which will be used to write a log"
        if event.eventopts['NOTIFICATIONTYPE'] == "DOWNTIMEEND":
            event.discard()
        elif event.eventopts['NOTIFICATIONTYPE'] == "DOWNTIMECANCELLED":
            event.discard(silently=False)
```
A formatter can also split one event into several. If the formatter class has a method *split_events(raw_event)* which returns a list of raw events, the framework will call *format_event* for each of the returned events and forward them individually. This is useful for a destination which wants one message per item of a bulk event.

The class name is, by default, derived from the argument provided to the *\-\-forwarder* parameter with the first letter capitalized, followed by "Formatter". Alternatively, the parameter *\-\-formatter* can be used. The formatter class must have a method *format_event*. This method is called with an event object, which has an attribute *event.eventopts*. This is a dictionary consisting of keys and values extracted from the *\-\-eventopt* parameters of the **\\$USER1\\$/notificationforwarder** command. The method should then set the attributes *payload* and *summary* of the event object.  
The formatter also has the ability to decide not to forward an event at all. If it chooses to halt the processing of an event, it can invoke the method *discard()*. The event will then simply be dropped without any trace. Invoking *discard* with the parameter *silently=False* will log a discard message in the log file. If event.summary has not yet been created, a dump of the raw event will be written.

A skeleton for the *forwarder.py* looks like this:

```python
import requests
from notificationforwarder.baseclass import NotificationForwarder, NotificationFormatter, timeout

class MyspecialforwarderForwarder(NotificationForwarder):
    def __init__(self, opts):
        super(self.__class__, self).__init__(opts)
        self.url = "https://alert.someapi.com/v1/tickets/"+self.company_id+"/alert/"+self.company_key+"/"+self.routing_key

    @timeout(30)
    def submit(self, event):
        try:
            logger.info("submit "+event.summary)
            response = requests.post(self.url, json=event.payload)
            if response.status_code != 200:
                logger.critical("POST returned "+str(response.status_code)+" "+response.text)
                return False
            else:
                logger.debug("POST returned "+str(response.status_code)+" "+response.text)
                return True
        except Exception as e:
            logger.critical("POST had an exception: {}".format(str(e)))
            return False

    def probe(self):
        r = requests.head(self.url)
        return r.status_code == 200
```

Again, the class name has to be the argument of the *\-\-forwarder* parameter with the first letter in upper case, but this time with "Forwarder" appended. This class must have a method *submit()*, which gets the event object which was supplied with payload and summary in the formatting step. If submit() returns a False value, the framework will spool the event in a database.
The next time Naemon is executing the notificationforwarder script for this forwarder instance, it will try to submit the events which have been spooled so far. If the Forwarder class has an optional method *probe()*, it will first check if the receiving system is now up again before it flushes the spooled events with the *submit()* method.

## Multiple forwarder instances: \-\-forwardertag

The *--forwarder* parameter selects the forwarder module, the optional *--forwardertag* selects the *instance* of it. Two instances of the same forwarder with different tags are completely independent: each has its own spool database and its own logfile (*var/log/notificationforwarder_*\<forwarder\>_*\<tag\>***.log**). This lets you use one forwarder module for several destinations with different settings, e.g. a *webhook* for ServiceNow and a *webhook* for a local Splunk forwarder, without writing a new module.

```
    --forwarder webhook --forwardertag servicenow --forwarderopt url='...' \
    --forwarder webhook --forwardertag splunk     --forwarderopt url='...' \
```

Note: the old parameter names *\-\-receiver* and *\-\-receivertag* are deprecated and will soon be removed; use *\-\-forwarder* and *\-\-forwardertag*.

There are two special *forwarderopt* parameters.
* \-\-forwarderopt logfile_backups=n  
  Besides the default logfile *var/log/notificationforwarder_...* there will be n rotated archive files. (Rotation takes place after the logfile reaches 20MB, default is 3 archives)  
* \-\-forwarderopt max_spool_minutes=n  
  When submitting an event fails, it will be spooled for n minutes. Within this time re-submitting will be attempted on every call to notificationforwarder. (Default is 5)  

## Forwarders/Formatters which come with the module

### WebhookForwarder

This is a generic class, which is used to upload arbitrary JSON payloads (that's why there is no WebhookFormatter as there are so many possibilities) with a POST request to an API. The parameters it takes are *url*, *username* and *password* for basic auth, *headers* to add to the post request. The latter can be used for token-based authentication.

|parameter|description               |default|
|---------|--------------------------|-------|
|url      |the url of the api        |-      |
|username |a username for basic auth |-      |
|password |a basic auth passwod      |-      |
|headers  |a string in json format   |-      |
|insecure |set to `no` to verify TLS certificates|yes   |

The payload is submitted in one of three modes, selected per event with `event.forwarderopts['mode']` (default `json`):
* `json` — the payload is sent as a JSON body
* `form` — a dict payload is sent as url-encoded form data (anything else is wrapped as `{"data": ...}`)
* `raw`  — a string payload is sent as-is; a dict or list payload is JSON-encoded and labeled `text/xml` unless the headers set a Content-Type

A formatter can also steer the request by setting `event.forwarderopts['headers']` (extra headers, merged into that request's headers only) or `event.forwarderopts['url']`. Note the asymmetry: the headers override is per request, but the url override replaces the forwarder's url for the rest of the process and is not restored afterwards.

First, the forwarder will make a plain, unauthenticated POST request.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://api.example.com/api/v2/crticket \
                        --eventopt HOSTNAME='$HOSTNAME$' \
 
```

Second, the same but with basic auth.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://api.example.com/api/v2/crticket \
                        --forwarderopt username=svcaccount \
                        --forwarderopt password=supersecret \
                        --eventopt HOSTNAME='$HOSTNAME$' \

```

And this one shows how to set additional headers.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://api.example.com/api/v2/crticket \
                        --forwarderopt headers='{"Authentication": "Bearer 0x00hex0der8ase64schlonz", "Max-Livetime": "10"}' \
                        --eventopt HOSTNAME='$HOSTNAME$' \
```

What's missing here is *--formatter myownpayload*, where you call a formatter specifically written for the payload format your API expects.

#### Demo setup

Let's configure sending notifications to a public REST API, where you can watch the incoming event live.
First, open https://webhook.site in your browser and copy the random URL you are given. You need it in the argument *url=* in the following commands. If you don't care if anybody can see your events, then just use [the one from the command definitions](https://webhook.site/#!/3864baed-d861-4e33-a5d6-3d9104d696d2).

```
define command {
  command_name    notify-service-webhooksite
  command_line    $USER1$/notificationforwarder \
                     --forwarder webhook \
                     --forwarderopt url=https://webhook.site/3864baed-d861-4e33-a5d6-3d9104d696d2 \
                     --formatter vong \
                     --eventopt HOSTNAME='$HOSTNAME$' \
                     --eventopt HOSTSTATE='$HOSTSTATE$' \
                     --eventopt HOSTADDRESS='$HOSTADDRESS$' \
                     --eventopt SERVICEDESC='$SERVICEDESC$' \
                     --eventopt SERVICESTATE='$SERVICESTATE$' \
                     --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
                     --eventopt LONGSERVICEOUTPUT='$LONGSERVICEOUTPUT$' \
                     >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}

define command {
  command_name    notify-host-webhooksite
  command_line    $USER1$/notificationforwarder \
                     --forwarder webhook \
                     --forwarderopt url=https://webhook.site/3864baed-d861-4e33-a5d6-3d9104d696d2 \
                     --formatter vong \
                     --eventopt HOSTNAME='$HOSTNAME$' \
                     --eventopt HOSTSTATE='$HOSTSTATE$' \
                     --eventopt HOSTADDRESS='$HOSTADDRESS$' \
                     --eventopt HOSTOUTPUT='$HOSTOUTPUT$' \
                     >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}
```

The forwarder webhook is already built in; we only need to write the formatter in *~/local/lib/python/notificationforwarder/vong/formatter.py*
```python
from notificationforwarder.baseclass import NotificationFormatter

class VongFormatter(NotificationFormatter):

    def format_event(self, event):
        json_payload = {
            'greeting': 'Halo i bims 1 eveng vong Naemon her',
            'host_name': event.eventopts["HOSTNAME"],
        }
        if "SERVICEDESC" in event.eventopts:
            json_payload['service_description'] = event.eventopts['SERVICEDESC']
            if event.eventopts["SERVICESTATE"] == "WARNING":
                json_payload['output'] = "dem {} vong {} is schlecht".format(event.eventopts['SERVICEDESC'], event.eventopts['HOSTNAME'])
            elif event.eventopts["SERVICESTATE"] == "CRITICAL":
                json_payload['output'] = "dem {} vong {} is vol kaputt".format(event.eventopts['SERVICEDESC'], event.eventopts['HOSTNAME'])
            else:
                json_payload['output'] = "i bim mit dem Serviz {} vong {} voll zufriedn".format(event.eventopts['SERVICEDESC'], event.eventopts['HOSTNAME'])
        else:
            json_payload['output'] = event.eventopts["HOSTOUTPUT"]
            if event.eventopts["HOSTSTATE"] == "DOWN":
                json_payload['output'] = "dem {} is vol kaputt".format(event.eventopts["HOSTNAME"])
            else:
                json_payload['output'] = "dem {} is 1 host mid Niceigkeit".format(event.eventopts["HOSTNAME"])

        event.payload = json_payload
        event.summary = "i hab dem post gepost"
```

After you have added the two notification commands to your default contact (or created a new contact which is assigned to all hosts and services), you can watch the notifications appear on [https://webhook.site](https://webhook.site).
Also check the logfile *var/log/notificationforwarder_webhook.log*


### SyslogForwarder

The SyslogForwarder class takes a simple event, where the payload is one line of text. It sends this text to a syslog server. The possible values for *--forwarderopts*  are:

|parameter|description                          |default   |
|---------|-------------------------------------|----------|
|server   |the syslog server name or ip address |localhost |
|port     |the port where the server listens    |514       |
|protocol |the transport protocol               |udp       |
|facility |the syslog facility                  |local0    |
|priority |the syslog priority                  |info      |

There is also a SyslogFormatter, which creates the log line as:  
*host: \<HOSTNAME\>, service: \<SERVICEDESC\>, state: \<SERVICESTATE\>, output: \<SERVICEOUTPUT\>*

If you want a different format, then copy *lib/python/notificationforwarder/syslog/formatter.py* to *local/lib/python/notificationforwarder/syslog/formatter.py* and modify it as needed. Or, with *--formatter*, you can use whatever formatter is suitable, as long as its payload attribute consists of a line of text.

### Oauth2WebhookForwarder

The Oauth2WebhookForwarder is a WebhookForwarder with OAuth2 client-credentials support. It fetches an access token from the token endpoint, caches it in *$OMD_ROOT/var/tmp/notificationforwarder_*\<forwarder_name\>*\_oauth2token.json* (for a tagged instance, *\<forwarder_name\>* includes the tag, e.g. *notificationforwarder_oauth2webhook_prod_oauth2token.json*; shared between processes via a file lock), and re-fetches it before it expires. All parameters of the WebhookForwarder are supported, and as with the webhook it needs a formatter which creates the payload.

|parameter|description|default|
|---------|-----------|-------|
|token_url|the OAuth2 token endpoint|-|
|client_id|the client id|-|
|client_secret|the client secret|-|
|token_scope|the scope requested for the token|-|
|token_grant_type|the grant type|client_credentials|
|token_expiry_buffer|re-fetch the token this many seconds before expiry|30|

```
    command_line    $USER1$/notificationforwarder \
                        --forwarder oauth2webhook \
                        --forwarderopt url=https://api.example.com/events \
                        --forwarderopt token_url=https://auth.example.com/oauth/token \
                        --forwarderopt client_id='...' \
                        --forwarderopt client_secret='...' \
                        --formatter syslog \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
```

### TelegramForwarder

The TelegramForwarder posts the event to a chat of a Telegram bot. The payload is one line of text; it is URL-quoted and then sent with `parse_mode=MarkdownV2`, so the chat shows the quoted line.

|parameter|description|default|
|---------|-----------|-------|
|bot_token|the bot token|-|
|chat_id|the chat id|-|

```
    command_line    $USER1$/notificationforwarder \
                        --forwarder telegram \
                        --forwarderopt bot_token='123456:ABC-DEF' \
                        --forwarderopt chat_id='42' \
                        --formatter syslog \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
```

### EmailForwarder / EmailFormatter

The EmailForwarder sends the event as an SMTP mail. The payload must carry *subject* and either *html* or *text*; if both *html* and *text* are present, only the *html* part is sent. The built-in EmailFormatter creates both from the event attributes (Jinja2 templates) and uses the fixed subject *thesubtschek*.

|parameter|description|default|
|---------|-----------|-------|
|smtp_server|the smtp server|localhost|
|smtp_port|the port|25|
|sender|the SMTP envelope sender (the visible From header stays the OS user)|the OS user|
|recipient|the recipient address (required)|-|

```
    command_line    $USER1$/notificationforwarder \
                        --forwarder email \
                        --formatter email \
                        --forwarderopt recipient='admin@example.com' \
                        --eventopt HOSTNAME='$HOSTNAME$' \
```

### RabbitMQ

The RabbitMQ pair publishes the event as a JSON message to a queue. The formatter builds a payload with the host/service attributes, the state, and the check output; extra attributes can be added with the *extra_payload_attributes* eventopt (comma-separated key=value pairs). The payload is a list, so the forwarder can publish several messages.

|parameter|description|default|
|---------|-----------|-------|
|server|the rabbitmq server|localhost|
|port|the port|5672|
|vhost|the virtual host|/|
|queue|the queue|AE|
|username|the username|guest|
|password|the password|guest|

```
    command_line    $USER1$/notificationforwarder \
                        --forwarder rabbitmq \
                        --formatter rabbitmq \
                        --forwarderopt server='rabbit.example.com' \
                        --forwarderopt queue='alerts' \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt NOTIFICATIONTYPE='$NOTIFICATIONTYPE$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
```

### Nostr

The Nostr plugin pair publishes an encrypted direct message with labeled lines and default monitoring tags so the alert appears in chat-oriented clients.

Install the optional Nostr support with `pip install notificationforwarder[nostr]`.

|parameter|description|default|
|---------|-----------|-------|
|relays|comma-separated relay URLs|`wss://relay.damus.io`|
|nsec|bech32 private key for signing|required|
|tags|extra Nostr tags to include|`monitoring` plus host/service/state tags|

The recipient is identified by a `p` tag containing the recipient's public key (npub). The `p` tag must be present in the tags list — the forwarder will raise an error if no recipient is found.

#### Static recipient

If all notifications go to the same recipient, pass the `p` tag via `--forwarderopt tags`:

```bash
$USER1$/notificationforwarder \
    --forwarder nostr \
    --forwarderopt relays='wss://relay.damus.io,wss://nostr-pub.wellorder.net' \
    --forwarderopt nsec='$NSEC$' \
    --forwarderopt tags='[["p", "npub1xyz..."]]' \
    --formatter nostr \
    --eventopt HOSTNAME='$HOSTNAME$' \
    --eventopt SERVICEDESC='$SERVICEDESC$' \
    --eventopt SERVICESTATE='$SERVICESTATE$' \
    --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$'
```

#### Per-contact recipient

In a real monitoring setup, different contacts may have different Nostr public keys. Use a custom contact variable (e.g., `$CONTACTNOSTRNPUB$`) and pass it as an eventopt. The formatter then adds it as the `p` tag.

**Contact definition:**

```
define contact {
    contact_name    admin-team
    ...
    _NOSTRNPUB      npub1xyz...
}
```

**Command definition:**

```
define command {
    command_name    notify-service-nostr
    command_line    $USER1$/notificationforwarder \
                        --forwarder nostr \
                        --forwarderopt relays='wss://relay.damus.io' \
                        --forwarderopt nsec='$NSEC$' \
                        --formatter nostr_custom \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
                        --eventopt NOSTR_PUBKEY='$_CONTACTNOSTRNPUB$' \
                    >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}
```

**Custom formatter** in `~/local/lib/python/notificationforwarder/nostr_custom/formatter.py`:

```python
from notificationforwarder.nostr.formatter import NostrFormatter

class NostrCustomFormatter(NostrFormatter):
    def format_event(self, event):
        super().format_event(event)
        pubkey = event.eventopts.get("NOSTR_PUBKEY", "")
        if pubkey:
            event.payload["tags"].append(["p", pubkey])
```

The `p` tag is appended to the tags list that the default Nostr formatter already builds with monitoring tags. The forwarder picks it up and uses it as the recipient for the encrypted DM.

The message content is encrypted before relay publication, so it shows up as a DM in clients that support NIP-04 direct messages.

## Loggers

The framework uses a modular logging architecture similar to formatters, forwarders, and reporters. By default, notificationforwarder uses **text format logging** - you don't need to do anything, logging works exactly as it did before. The traditional text format is backward compatible with all existing installations.

### Why JSON Logging?

In enterprise environments, the gateway from monitoring systems to incident management platforms like Remedy, ServiceNow, or other ITSM tools is crucial for operational reliability. For comprehensive monitoring and troubleshooting of this critical path, logs need to be ingested into log aggregation systems like Splunk for analysis, alerting, and correlation.

The JSON logger provides structured logging optimized for ingestion into Splunk and other log management systems. It outputs single-line JSON with:
- Splunk-friendly underscore field naming (e.g., `event_host_name`, `event_service_name`)
- Complete event details including state, output, and summary
- Operational metrics (queue length, spool counts, retry attempts)
- Structured exception traces
- Timezone-aware timestamps

### Usage

**Default (text logging):**
```bash
$USER1$/notificationforwarder \
    --forwarder webhook \
    --forwarderopt url=https://api.example.com/tickets \
    --eventopt HOSTNAME='$HOSTNAME$' \
    --eventopt SERVICESTATE='$SERVICESTATE$'
```

**JSON logging for Splunk ingestion:**
```bash
$USER1$/notificationforwarder \
    --forwarder webhook \
    --forwarderopt url=https://api.example.com/tickets \
    --logger json \
    --eventopt HOSTNAME='$HOSTNAME$' \
    --eventopt SERVICESTATE='$SERVICESTATE$'
```

**Custom logger:**
```bash
$USER1$/notificationforwarder \
    --forwarder webhook \
    --logger mycustomlogger \
    --eventopt HOSTNAME='$HOSTNAME$'
```

### Example Log Output

**Text format (default):**
```
2025-11-13 17:00:57,987 3468977 - INFO - forwarded dbserver02.example.com/MySQL: WARNING - Slow queries
```

**JSON format:**
```json
{
  "timestamp": "2025-11-13T17:00:57.987487+01:00",
  "host_name": "oasch.example.com",
  "version": "2.9",
  "level": "INFO",
  "logger": "notificationforwarder_webhook",
  "omd_site": "demo_site",
  "event_host_name": "dbserver02.example.com",
  "event_service_name": "MySQL",
  "event_state": "WARNING",
  "event_notification_type": "PROBLEM",
  "event_service_output": "MySQL WARNING - Slow queries detected",
  "event_summary": "dbserver02.example.com/MySQL: WARNING - Slow queries",
  "msg": {
    "message": "forwarded",
    "status": "success"
  }
}
```

### Custom Loggers

You can create custom loggers by:
1. Creating `~/local/lib/python/notificationforwarder/mylogger/logger.py`
2. Inheriting from the `NotificationLogger` base class
3. Implementing the `log(level, message, context)` method

```python
from notificationforwarder.baseclass import NotificationLogger

class MyloggerLogger(NotificationLogger):
    def log(self, level, message, context=None):
        # Custom logging implementation
        pass
```

## Reporters

Like *forwarder* and *formatter*, a *reporter* is an instance of a *NotificationReporter* class defined in a file named *reporter.py*. One class is included with notificationforwarder, the *NaemonlogReporter*. Its purpose is to write a message to the Naemon logfile. When notificationforwarder is run as a standalone script (and not triggered as a notification handler by Naemon), the *NaemonlogReporter* can nevertheless leave a line in the Naemon log.
Or you can write an extra log showing success or failure of the notification delivery.

```
define command{
    command_name    notify-service-servicenow
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt username='$_CONTACTUSERNAME$' \
                        --forwarderopt password='$_CONTACTPASSWORD$' \
                        --forwarderopt url='$_CONTACTURL$' \
...
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt HOSTSTATE='$HOSTSTATE$' \
                        --eventopt HOSTADDRESS='$HOSTADDRESS$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
                        --eventopt LONGSERVICEOUTPUT='$LONGSERVICEOUTPUT$' \
....
                        --reporter naemonlog \
                    >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}
```

## Spool Flushing

When forwarding to a recipient fails, the event is saved in a local SQLite database. The framework automatically attempts to re-submit these spooled events on every subsequent call to notificationforwarder for the same forwarder.

The flush mechanism runs inside `forward_formatted()` for **every event** — not just heartbeats or special cases. Before submitting the current event, the framework checks if there are spooled events waiting. If there are — and the forwarder has no `probe()` method or `probe()` returns true (see the Probe Method below) — it takes a flush lock, replays the spooled events by calling `submit()` for each one, and releases the lock. Events that are successfully submitted are deleted from the spool. **The replay stops at the first event which still fails** — if the receiving system is down, all the following submits would fail as well, and paying the submit timeout for every one of a large backlog would far exceed the notification timeout.

A failed replay does not poison the queue. If the live event of the same process has been submitted successfully, the process tries to move the failed event to the end of the spool: it gets a new record id behind all the other events, keeps its payload and its original spool time, and therefore still expires on schedule. This move only happens if the process gets the flush lock again and the failed row is not already the last one; if it is the last row, it stays in place until it expires. Either way a receiving system rejecting one event permanently (e.g. HTTP 400 for a broken payload) cannot block the queue — it is re-tried once per live event and then expires.

Several notificationforwarder processes of the same forwarder instance share the spool. Only one of them takes the flush lock at a time; the others log *concurrent flush suppressed* and skip the flush.

This means that in a busy monitoring environment where notifications flow regularly, spooled events get drained naturally — each new notification triggers a flush attempt on its way through.

### Spool log lines

Every spool-related log line carries the spool record id, and most of them carry the event content (summary and raw payload) as well, so the lines can be correlated with each other. With the default text logger the lines read:

* `forward failed, spool id <id>` — the event was spooled (with summary and raw payload)
* `delete spooled event <id>` — the event was re-submitted successfully (with summary and raw payload)
* `event <id> stays in spool` — the replay stopped at this event (with summary and raw payload)
* `event <id> was rejected while the receiver accepts other events and moved to the end of the spool as <new id>` — the failed event was moved to the end; this line names only the old and the new id, not the payload
* `expired spooled event <id>` — the event expired from the spool (with the raw payload)

An operator can follow one event from its spooling to its deletion — or to its expiry — through these lines alone. With `--logger json` the same lines carry the structured fields `event_id` and, for the queue length line, `queue_length`.

The log line `spooling queue length is <n>` is written when an event is spooled and additionally at the end of every flush which took the flush lock, so that the queue length also goes down again while the spool drains. A flush which lost the lock (`concurrent flush suppressed`) does not write a queue length. This is the value to monitor and alert on.

### Probe Method

Forwarders can implement an optional `probe()` method to optimize the flush behavior. The `probe()` method checks whether the receiving system is reachable *before* the framework attempts to flush spooled events via `submit()`.

The framework uses `probe()` as a pre-check with three possible scenarios:

|Forwarder has probe()?|probe() result|What happens|Why|
|---|---|---|---|
|No|—|flush proceeds|No way to check availability, must try|
|Yes|True|flush proceeds|The receiving system is confirmed reachable|
|Yes|False|flush skipped|The receiving system is known to be down, avoid wasted submit() calls|

Without `probe()`, every flush attempt would call `submit()` for each spooled event even when the receiving system is known to be down — wasting time and producing noisy error logs. With `probe()`, the framework can short-circuit: if the receiving system is unreachable, the flush is skipped entirely and spooled events wait in the database until the next call.

Example implementation:

```python
def probe(self):
    r = requests.head(self.url)
    return r.status_code == 200
```

### Heartbeat Events

Formatters can mark an event as a heartbeat by setting `event.is_heartbeat = True` on the `FormattedEvent` object. Heartbeat events have two special properties:

1. **They skip spooling on failure.** If a heartbeat event cannot be delivered, it is NOT saved to the spool database. This prevents periodic check-in events from accumulating in the retry queue.

2. **They guarantee regular flush attempts.** While every event triggers the flush phase, heartbeat events ensure this happens at regular intervals — but only when scheduled. A cronjob or Nagios service using notificationforwarder as its check command provides this scheduling, creating a steady pulse of heartbeat events. Without such a schedule, heartbeats don't exist and spooled events could sit in the queue for hours waiting for the next real notification to trigger a flush.

Example formatter that sets the heartbeat flag:

```python
class MyFormatter(NotificationFormatter):
    def format_event(self, event):
        notification_type = event.eventopts.get("NOTIFICATIONTYPE", "")
        event.is_heartbeat = notification_type == "HEARTBEAT"

        event.payload = {
            "hostname": event.eventopts.get("HOSTNAME", ""),
            "heartbeat": event.is_heartbeat,
        }
        event.summary = "heartbeat from {}".format(event.eventopts.get("HOSTNAME", ""))
```

### Scheduling Heartbeats in Nagios/Naemon

Since notificationforwarder always exits with code 0, it can be used as a Nagios check command to schedule periodic heartbeats. The service will always be in OK status — it's using Nagios purely as a scheduling mechanism.

**Command definition:**

```
define command {
    command_name    notificationforwarder_heartbeat
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://xxx.service-now.com/api/now/import/u_notification \
                        --formatter myformatter \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt NOTIFICATIONTYPE=HEARTBEAT \
                        --eventopt SERVICEOUTPUT='heartbeat from $HOSTNAME$' \
                    >> $USER4$/var/log/notificationforwarder_errors.log 2>&1
}
```

**Service definition:**

```
define service {
    host_name               monitoring-server
    service_description     notificationforwarder-heartbeat
    check_command           notificationforwarder_heartbeat
    max_check_attempts      1
    check_interval          5
    retry_interval          1
    notification_interval   0
    notification_options    n
    notification_period     24x7
}
```

The key settings:
- `check_interval 5` — runs the heartbeat every 5 minutes
- `notification_interval 0` — no Nagios-level notifications
- `notification_options n` — don't send notifications on state changes

The heartbeat goes through the normal notificationforwarder flow: the formatter sets `is_heartbeat = True`, the flush phase checks for spooled events (and calls `probe()` if available), and the heartbeat itself is submitted to the destination. If the destination accepts it, the receiving system knows the monitoring infrastructure is alive (dead-man switch). If the destination is down, the heartbeat is simply dropped — it won't add to the spool queue.

The two use cases for periodic heartbeats:
- **Dead-man switch**: The receiving system (e.g., ServiceNow) gets a regular "I'm alive" signal. If heartbeats stop, it knows the monitoring system is down.
- **Spool draining**: Even when nothing breaks, the heartbeat triggers flush attempts at regular intervals, so spooled events are delivered quickly once the receiving system recovers — without waiting for the next real notification.

## Spool Inspection: \-\-dump-spool

The spool is a local sqlite database per forwarder instance. To inspect which events are stuck, when they were spooled, and what they contain, without hand-crafting `sqlite3` queries, the notificationforwarder command has a read-only dump mode:

```
$USER1$/notificationforwarder --forwarder webhook --forwardertag prod --dump-spool
```

The dump mode reads the spool database and table of the forwarder instance named by *--forwarder* and, optionally, *--forwardertag* — the same instance the delivery path writes to. In this mode *--forwarder* is required (the syslog default of the regular command does not apply), and whenever the spool is opened or reported empty, the resolved database path and table are named on standard error.

The dump is strictly read-only. It does not load the forwarder, formatter, or reporter modules, does not contact the destination, does not acquire the flush lock, and does not modify the spool. It also works when the forwarder module cannot be imported — that is often exactly the situation in which the spool has to be inspected.

|parameter|description|default|
|---------|-----------|-------|
|--dump-spool|dump the spool of the selected forwarder instance and exit|-|
|--order|`oldest` lists the records oldest spool time first, `newest` the reverse (ties broken by record id)|oldest|
|--limit|display at most N records, applied after ordering|all|
|--dump-format|`text`: one line per record on stdout; `json`: one parseable JSON array on stdout|text|

Record data goes to standard output, the header (database path, table, order, total and shown record counts) to standard error, in both formats — so `--dump-format json` can be piped into `jq`. The text output carries exactly one line per record: *#\<record id\> \<spool time\> \<payload\>*. The JSON output is one array with one element per record, with the keys `id`, `spooled_at`, and `payload`. The spool time is the stored timestamp verbatim (UTC); it is the original spool time and survives the move-to-end replays.

An empty spool (missing database file or empty table) is a healthy outcome: the dump reports *spool empty* on standard error and exits with status 0. Note that a wrong forwarder name produces a healthy empty spool for a database which was never written — a typo in *--forwarder* looks like an empty queue. A spool database which cannot be read (locked, corrupt, or missing the expected table) is an error with a non-zero exit status, and an invalid *--limit* is a usage error with an empty standard output. A record whose stored content is not valid JSON is listed with the marker `[undecodable payload]` and the first 120 characters of the stored text (the JSON element additionally carries `undecodable: true` and `raw_prefix` with `payload` null); the dump never aborts on a corrupt record.


