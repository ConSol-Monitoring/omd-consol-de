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
In system monitoring, logs are a valuable source for detecting upcoming or existing issues. Especially for Windows, collecting all logs in one place has not been easy. Forwarding Windows event logs to a syslog server, which then writes the logs to files, was one approach—but this is quite outdated. Here, you will set up a modern solution based on state-of-the-art observability tools.

On the client side, you will use the agent [SNClient+](/docs/snclient) with its helper, [Grafana Alloy](https://grafana.com/oss/alloy-opentelemetry-collector/). On the monitoring side, you will use the [Open Monitoring Distribution](/docs/omd) with [Loki](https://grafana.com/oss/loki/).

Schemazeichnung, Teaser-Screenshot

### Step one - Install OMD and open the Loki API.
To keep things short, I assume that you already have OMD installed and have created a site. In this example, use the site name *demo*. (And the OMD server is called *omd-server*)  

Loki is not enabled by default, so you need to run the following commands:
```bash
omd stop
omd config set GRAFANA on
omd config set LOKI on
```

In an OMD setup, Loki listens by default only on the loopback interface. To make it accessible from Windows servers, create the file *~/etc/apache/conf.d/loki.conf* with the following content:
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

The Loki API is now accessible externally via *https://omd-server/demo/loki/api/v1/push*.
Access is controlled via the Thruk login page. Using basic authentication makes the login transparent, so the client believes it is communicating directly with the API:
```bash
htpasswd ~/etc/htpasswd loki L0k1
```

Finally start the OMD site.
```bash
omd start
```
Loki is now ready to receive Windows events. (Or any other data sent by Alloy/journald, Open Telemetry Logs, Fluent Bit, Docker, Promtail,...)


### Step two - Install the SNClient+ on the Windows server
For the base installation, follow the instructions [here](/docs/snclient/install/windows/).

Next, change the default password by creating a new file *C:\Program Files\snclient\snclient_local_auth.ini* with the following content:

```ini
[/settings/default]
allowed hosts = 127.0.0.1, 10.0.1.2
password = SHA256:9f86d081884...
```
The password is stored as a hashed value. Refer to the [Security page](https://omd.consol.de/docs/snclient/security/) for instructions.  
(*allowed hosts* restricts access to the snclient agent, i suggest you edit the list so that it consists of 127.0.0.1 and yout omd-server's ip address)

After saving the file, restart the service **snclient** using the service manager or by running
```powershell
net stop snclient
net start snclient
```

At this point, you can monitor the Windows host with *Naemon* and the *check_nsc_web* plugin, but this article focuses on log forwarding.

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
This config instructs snclient to start (and eventually restart) Grafana Alloy.

Next, go to the [Grafana Alloy release page](https://github.com/grafana/alloy/releases), download *alloy-windows-amd64.exe.zip*, unpack it and move the extracted *alloy-windows-amd64.exe* to *C:\Program Files\snclient\exporter*.  
Then, create a folder *C:\Program Files\snclient\alloy* and add the file *windows_event.alloy* with the following content:
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

When you have saved the file, you have to restart snclient again with **net stop snclient** and **net start snclient**.  
Now, your Windows event logs are forwarded to Loki via Grafana Alloy.

### Step four - Testing and Searching

On the Windows server, open a PowerShell and run the command
```powershell
eventcreate /t INFORMATION /id 100 /so MyApp /d "Application started successfully"
```

Then, open the url https://omd-server/demo/grafana and you should see the event.
Looking for EventID 817
{channel="Application"} | json | event_id=817 
