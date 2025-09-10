---
title: Prometheus
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](prometheus.png)
### Overview

|||
|---|---|
|Homepage:|https://prometheus.io|
|Changelog:|https://github.com/prometheus/prometheus/releases|
|Documentation:|https://prometheus.io/docs/introduction/overview/|
|Get version:|/&lt;site&gt;/prometheus/status|
|OMD default:|disabled|
|OMD URL:|/&lt;site&gt;/prometheus|

Prometheus is an open-source systems monitoring and alerting toolkit originally built at SoundCloud.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/dokuwiki|
|Logfiles:|&lt;site&gt;/var/prometheus/prometheus.log|
|Data Directory:|&lt;site&gt;/var/prometheus/data|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| PROMETHEUS | on <br> **off** | Enable Prometheus |
| PROMETHEUS_RETENTION | variable | Number of Days Prometheus will keep data. Data older than this will be deleted automatically|
| PROMETHEUS_TCP_ADDR | 127.0.0.1 | IP to listen on |
| PROMETHEUS_TCP_PORT | 9090 | Default on first site |