---
title: Loki
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
|Documentation:|https://grafana.com/docs/loki/latest/?pg=oss-loki&plcmt=quick-links|
|Get version:|/&lt;site&gt;/prometheus/status|
|OMD default:|disabled|
|OMD URL:|/&lt;site&gt;/prometheus|

Loki is a horizontally scalable, highly available, multi-tenant log aggregation system inspired by Prometheus. It is designed to be very cost effective and easy to operate. It does not index the contents of the logs, but rather a set of labels for each log stream.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/loki|
|Logfiles:|&lt;site&gt;/var/log/loki.log|
|Data Directory:|&lt;site&gt;/var/loki|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| LOKI | on <br> **off** | Enable Loki |
| LOKI_RETENTION | variable | Amount of time (1w, 7d, 168h) Loki will keep data. Data older than this will be deleted automatically |
| LOKI_HTTP_PORT | 3100 | TCP Port to listen on |