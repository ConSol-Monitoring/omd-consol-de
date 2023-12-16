+++
title = "notificationforwarder"
tags = [
  "notifications"
]
+++

In this framework, two aspects are in the focus. How to transport a notification to the recipient system and in which format.
In the beginning, Naemon or one of the other monitoring cores will execute a command line. The actual script and the individual command line parameters are defined in a command definition. Typical parameters are (i use the notation of Nagios macros) HOSTNAME, SERVICEDESC, SERVICESTATE, SERVICEOUTPUT. These snippets need to be put together to some kind of payload suitable for the receiving system. And then this payload must be transported to it. We call the two components *formatter* and *forwarder*. The formatter takes the raw input data and creates a payload and the forwarder transmits the payload to the destination.
What the framework does for you behind the scenes: when forwarding to a recipient fails, the event is saved in a local sqlite database for a certain time and re-sent when the script is called next time and the recipient is available again. Logging of successful and of course failed deliveries is also done automatically.

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

Of course json is not json, the attributes and values are different depending on the recipient.


For every notification recipient you need such a pair, practically it means, you have to write two python files. 
Imagine you have a command definition like this:
```
define command{
    command_name    notify-service-victorops
    command_line    $USER1$/notificationforwarder \
                        --forwarder myspecialreceiver \
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
                    >> $USER4$/var/log/notificationforwarder_victorops.log 2>&1
}
```
Your service notifications should be sent to some ticket tool. The notification script will talk to a REST api and upload a a well-formatted Json payload. Therefore the notifcation framework has two jobs. 
First, take the event attributes (all the --eventopt arguments) and transform them to a Json structure. Then, upload it with a POST request.

In your OMD site you create a folder *~/local/lib/python/notificationforwarder/myspecialreceiver* and add two files, *formatter.py* and *forwarder.py*.
A skeleton for the *formatter.py* looks like this:

```python
from notificationforwarder.baseclass import NotificationFormatter

class MyspecialreceiverFormatter(NotificationFormatter):

    def format_event(self, event):
        json_payload = {}
        # fill the payload with whatever is required
        json_payload['hostname'] = event.eventopts['HOSTNAME']
        json_payload['remark'] = "here is a ticket for you, haha"
       
        event.payload = json_payload
        event.summary = "this is a one-line summary which will be used to write a log"
```
The class name is by default the argument of the *\-\-forwarder* parameter with the first letter in upper case plus "Formatter". An alternative is to use the parameter *\-\-formatter*. The formatter class must have a method *format_event*. This method is called with an event object, which has an attribute *event.eventopts*. This is a dictionary where keys and values are taken from the *\-\-eventopt* parameters of the **\\$USER1\\$/notificationforwarder** command. The method shall set the attributes *payload* and *summary* of the event object.

A skeleton for the *forwarder.py* looks like this:

```python
import requests
from notificationforwarder.baseclass import NotificationForwarder, NotificationFormatter, timeout

class MyspecialreceiverForwarder(NotificationForwarder):
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
The next time Naemon is executing the notificationforwarder script for this receiver, it will try to submit the events which have been spooled so far. If the Forwarder class has an optional method *probe()*, it will first check if the receiver is now up again before it flushes the spooled events with the *submit()* method.

## Forwarders/Formatters which come with the module

### WebhookForwarder

This is a generic class, which is used to upload random json payloads (that's why there is no WebhookFormatter as there are so many possibilities) with a POST request to an Api. The parameters it takes are *url*, *username* and *password* for basic auth, *headers* to add to the post request. The latter can be used for token based authentication.

|parameter|description               |default|
|---------|--------------------------|-------|
|url      |the url of the api        |-      |
|username |a username for basic auth |-      |
|password |a basic auth passwod      |-      |
|headers  |a string in json format   |-      |

First the fowarder will make a plain, unauthorized post request.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://cm.consol.de/api/v2/crticket \
                        --eventopt HOSTNAME='$HOSTNAME$' \

```

Second, the same but with basic auth.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://cm.consol.de/api/v2/crticket \
                        --forwarderopt username=lausser \
                        --forwarderopt username=consol123 \
                        --eventopt HOSTNAME='$HOSTNAME$' \

```

And this one shows how to set additional headers.
```
    command_line    $USER1$/notificationforwarder \
                        --forwarder webhook \
                        --forwarderopt url=https://cm.consol.de/api/v2/crticket \
                        --forwarderopt headers='{"Authentication": "Bearer 0x00hex0der8ase64schlonz", "Max-Livetime": "10"}' \
                        --eventopt HOSTNAME='$HOSTNAME$' \
```

What's missing here is *\-\-formatter myownpayload*, where you call a formatter specifically written for the payload format your api wants.

#### Demo setup

Let's configure sending notification to a public REST Api, where you can watch the incoming event live.
First, open https://webhook.site in your browser and copy the random url you are presented. You need it in the argument *url=* in the following commands. If you don't care if anybody can see your events, then just use [the one from the command definitions](https://webhook.site/#!/3864baed-d861-4e33-a5d6-3d9104d696d2).

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
                     >> $USER4$/var/log/notificationforwarder_webhook.log 2>&1
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
                     >> $USER4$/var/log/notificationforwarder_webhook.log 2>&1
}
```

The forwarder webhook is already builtin, we only need to write the formatter in *~/local/lib/python/notificationforwarder/vong/formatter.py*
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

After you added the two notification commands to your default contact (or created a new contact which is assigned to all hosts and services), you can watch the notifications appear on [https://webhook.site](https://webhook.site).
Also check the logfile *var/log/notificationforwarder_webhook.log*


### SyslogForwarder

The SyslogForwarder class takes a simple event, where the payload is one line of text. It sends this text to a syslog server. The possible value for *\-\-forwarderopts*  are:

|parameter|description                          |default   |
|---------|-------------------------------------|----------|
|server   |the syslog server name or ip address |localhost |
|port     |the port where the server listens    |514       |
|protocol |the transport protocol               |udp       |
|facility |the syslog facility                  |local0    |
|priority |the syslog priority                  |info      |

There is also a SyslogFormatter, which creates the log line as:  
*host: \<HOSTNAME\>, service: \<SERVICEDESC\>, state: \<SERVICESTATE\>, output: \<SERVICEOUTPUT\>*

If you want a different format, then copy *lib/python/notificationforwarder/syslog/formatter.py* to *local/lib/python/notificationforwarder/syslog/formatter.py* and modify it like you want. Or, with *\-\-formatter*, you can use whatever formatter is suitable, as long as it's payload attribute consists of a line of text.


