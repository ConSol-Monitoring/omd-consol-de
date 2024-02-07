---
title: Promtail
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](loki.png)
### Overview

|||
|---|---|
|Homepage:|https://grafana.com/oss/loki/|
|Changelog:|https://github.com/grafana/loki/releases|
|Documentation:|https://grafana.com/docs/loki/latest/send-data/promtail/|
|Get version:|promtail --version|
|OMD default:|disabled|

Promtail is an agent which ships the contents of local logs to a private Grafana Loki instance. It is usually deployed to every machine that runs applications which need to be monitored.
OMD shipps with scrape configs for Apache, mod-gearman, Grafana, InfluxDB, Livestatus, Loki, Naemon, OMD and Thruk Logfiles.

&#x205F;
### Directory Layout

|||
|---|---|
|Config File:|&lt;site&gt;/etc/loki/promtail.yaml|
|Scrape-Config Directory:|&lt;site&gt;/etc/loki/promtail.d|
|Logfiles:|&lt;site&gt;/var/log/promtail.log|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| LOKI_PROMTAIL | on <br> **off** | Enable Promtail |
| LOKI_PORT | 3101 | TCP Port to listen on |