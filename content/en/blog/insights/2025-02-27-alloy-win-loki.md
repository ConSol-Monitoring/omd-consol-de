---
draft = true
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
        url ="https://omd-thruk.demodemo.svc.cluster.local/demo/loki/api/v1/push"
        tls_config {
            insecure_skip_verify = true
        }
        basic_auth {
            username = "loki"
            password = "L0ki"
        } 
    }
}
```

Looking for EventID 817
{channel="Application"} | json | event_id=817 
