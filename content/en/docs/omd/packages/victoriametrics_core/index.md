---
title: Victoriametrics
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](victoriametrics.png)
### Overview

|||
|---|---|
|Homepage:|https://victoriametrics.com|
|Changelog:|https://github.com/VictoriaMetrics/VictoriaMetrics/releases|
|Documentation:|https://docs.victoriametrics.com/victoriametrics|
|Get version:|/&lt;site&gt;/victoriametrics/status|
|OMD default:|disabled|
|OMD URL:|/&lt;site&gt;/victoriametrics|

VictoriaMetrics is a fast and scalable open source time series database and monitoring solution that lets users build a monitoring platform without scalability issues and minimal operational burden.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/victoriametrics|
|Logfiles:|&lt;site&gt;/var/victoriametrics/victoriametrics.log|
|Data Directory:|&lt;site&gt;/var/victoriametrics/data|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| VICTORIAMETRICS | on <br> **off** | Enable VictoriaMetrics |
| VICTORIAMETRICS_RETENTION | variable | Number of Days VictoriaMetrics will keep data. Data older than this will be deleted automatically|
| VICTORIAMETRICS_MODE | http | Default,m can be https also |
| VICTORIAMETRICS_TCP_ADDR | 127.0.0.1 | IP to listen on |
| VICTORIAMETRICS_TCP_PORT | 8428 | Default on first site |
