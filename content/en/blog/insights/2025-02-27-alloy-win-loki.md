---
draft: true
date: 2025-02-27T10:00:00.000Z
title: "Forwarding Windows Eventlogs to Loki with Alloy"
linkTitle: "windows-eventlogs-loki-alloy"
author: Gerhard Lausser
tags:
  - omd
  - loki
  - windows
  - grafana
  - alloy
  - snclient
---
### Forwarding Windows Eventlogs to a central log console
In system monitoring, logs are a valuable source where signs of upcoming or existing problems can be found. Especially for Windows, it was not easy to collect all of the computer's logs in one place. Forwarding Windows event logs with syslog to a syslog server, which then wrote the logs to files, was one way—but this is a very old-fashioned approach. Here, we present a state-of-the-art solution based on modern observability tools.

On the client side, we have the agent [SNClient+](/docs/snclient) with its helper, [Grafana Alloy](https://grafana.com/oss/alloy-opentelemetry-collector/). On the monitoring side, we are using the [Open Monitoring Distribution](/docs/omd) with [Loki](https://grafana.com/oss/loki/).

Schemazeichnung, Teaser-Screenshot

### Step one - Install OMD and open the Loki API.
To keep things short, i assume that you already have an installation of OMD and have created a site. Let's give the site the name *demo*, which is used in the samples here.
Loki is not enabled by default, so you have to run the following commands:
```bash
omd stop
omd config set GRAFANA on
omd config set LOKI on
```

Also, by default Loki listens only on the loopback interface. In order to make it reachable by Windows servers, you need to add the file *~/etc/apacke/conf.d/loki.conf* with the following content:
```apache
<IfModule !mod_proxy.c>
    LoadModule proxy_module /usr/lib64/httpd/modules/mod_proxy.so
</IfModule>
<IfModule !mod_proxy_http.c>
    LoadModule proxy_http_module /usr/lib64/httpd/modules/mod_proxy_http.so
</IfModule>

<Location /${OMD_SITE}/loki>
    ProxyPassInterpolateEnv on
    ProxyPass http://127.0.0.1:${CONFIG_LOKI_HTTP_PORT}/loki
    ProxyPassReverse http://127.0.0.1:${CONFIG_LOKI_HTTP_PORT}/loki
    RequestHeader set X-WEBAUTH-USER %{REMOTE_USER}e

    ErrorDocument 503 /503.html?LOKI=on
</Location>
```

The Loki API can now be accessed from outside of the OMD server by using the url *https://\<omd-server\>/demo/loki*  
Access is controlled by the Thruk login page. Using basic auth with a username and a password makes the login transparent. The client will think it's directly talking with the API.
```bash
htpasswd ~/etc/htpasswd loki L0k1
```

Finally start the OMD site and Loki is now ready to receive Windows events.
```bash
omd start
```


### Step two - Install the SNClient+ on the Windows server
I won't repeat the base installation, follow simply the instructions you can find [here](/docs/snclient/install/windows/)

Next, change the default password. This can be best achieved by creating a new file *C:\Program Files\snclient\snclient_local_auth.ini* with the following content:

```ini
[/settings/default]
allowed hosts = 127.0.0.1, 10.0.1.2
password = SHA256:9f86d081884...
```
The password is saved here in its hashed representation. See the [Security page](https://omd.consol.de/docs/snclient/security/) for instructions.

After you saved the file, restart the service **snclient** with the service manager or by running **net stop snclient** and **net start snclient**.  
Now you're able to monitor the Windows host with Naemon and the plugin check_nsc_web, but that's not what we cover in this article.

### Step three - Add Alloy to SNClient+'s exporters
Create a file *C:\Program Files\snclient\snclient_local_alloy.ini* with the following contents:
```ini
[/modules]
ManagedExporterServer = enabled

[/settings/ManagedExporter/alloy]
;password =
agent path = ${shared-path}/exporter/alloy-windows-amd64.exe
agent args = run ./alloy
agent address = 127.0.0.1:12345
;;agent max memory = 256M
url prefix = /alloy

```
This config tells snclient to start (and eventually restart) Grafana Alloy.

Next, go to the [download page](https://github.com/grafana/alloy/releases), download *alloy-windows-amd64.exe.zip*, unpack it and move the extracted file *alloy-windows-amd64.exe* to *C:\Program Files\nclient\exporter*.  
Then create a folder *C:\Program Files\snclient\alloy* and put the file *windows_event.alloy* inside. The contents of this file are:

```
loki.source.windowsevent "application"  {
    eventlog_name = "Application"
    use_incoming_timestamp = true
    exclude_event_data = true 
    forward_to = [loki.process.windows_eventlog.receiver]
    labels = {    
       job = "windows_eventlog", 
       instance = constants.hostname,
    }             
}                 

loki.source.windowsevent "security"  {
    eventlog_name = "Security"
    use_incoming_timestamp = true
    forward_to = [loki.process.windows_eventlog.receiver]
    labels = { 
       job = "windows_eventlog",
       instance = constants.hostname,
    }             
}                 

loki.source.windowsevent "system"  {
    eventlog_name = "System"
    use_incoming_timestamp = true
    forward_to = [loki.process.windows_eventlog.receiver]
    labels = {
       job = "windows_eventlog",
       instance = constants.hostname,
    } 
}     

loki.source.windowsevent "setup"  {
    eventlog_name = "Setup"
    use_incoming_timestamp = true
    forward_to = [loki.process.windows_eventlog.receiver]
    labels = {
       job = "windows_eventlog",
       instance = constants.hostname,
    }
} 

loki.process "windows_eventlog" {

  // In rare cases the message is empty (either empty string or nil)
  // To avoid fill it with "empty_message"
  stage.template {
      source   = "message"
      template = `{{- $message := .Value -}}
                  {{- if eq $message "" -}}empty_message
                  {{- else if eq $message nil -}}empty_message
                  {{- else -}}{{- $message -}}{{- end -}}`
  }

  // Loki has a builtin parser for windows messages. If it finds a field
  // in the message which already existed, then it will overwrite its value
  // instead of creating a new label.
  stage.eventlogmessage { 
      source = "message"  
      overwrite_existing = true
  }    
  // at this moment stage.windowsevent is experimental, but soon it will
  // replace the deprecated stage.eventlogmessage
  //stage.windowsevent {
  //    source = "message"
  //    overwrite_existing = true
  //}

  // Select (as few as possible) fields in an event which should be used
  // as labels for Loki.
  // Syntax is: 
  // The symbol on the left side will be a key name in the json.
  // The symbol on the right side is the name of an existing event field.
  // "" means, that you expect a field with the same name as the left side
  // and that you copy its value the the json key.
  // xy = "abc" means that you expect a field "abc" in the event and you
  // want key "xy" in the event to get its value.
  stage.labels {
      values = {
          // One of Application, System, Security, Setup
          // This could also be hard-coded in the loki.source.windowsevent
          channel = "",
          // For example, source = Windows-Security-Auditing
          // If you expect very few sources, you can create a label.
          // But usually in a normal Windows environment they are so numerous
          // that they have an impact on Loki's performance.
          // source = "",
      }
  }

  // We don't want to see Alloy's own logs
  stage.drop {
      source = "source"
      value  = "Alloy"
      drop_counter_reason = "source_alloy"
  }

  // By default, an event's timestamp is the time when it was first
  // ingested by Alloy. This might not be exact enough,
  // so we parse the original time from the event data and
  // update the timestamp.
  stage.timestamp {
      source      = "timeCreated"
      format      = "2025-02-27T17:45:00.0000000Z"
  }

  forward_to = [loki.write.endpoint.receiver]
} 


loki.write "endpoint" {
    endpoint {
        // CHANGE THIS URL
        // Use the hostname of your OMD server and
        // replace the sitename.
        url ="https://omd-thruk.demodemo.svc.cluster.local/demo/loki/api/v1/push"
        tls_config {
            insecure_skip_verify = true
        }
        basic_auth {
            // These are the credentials we created with
            // the htpasswd command.
            username = "loki"
            password = "L0ki"
        } 
    }
}
```

Looking for EventID 817
{channel="Application"} | json | event_id=817 
