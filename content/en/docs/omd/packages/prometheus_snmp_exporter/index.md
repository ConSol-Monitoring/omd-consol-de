---
title: Prometheus SNMP Exporter
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](prom_small.png)
### Overview

|||
|---|---|
|Homepage:|https://prometheus.io|
|Changelog:|https://github.com/prometheus/snmp_exporter/releases|
|Documentation:|https://github.com/prometheus/snmp_exporter/blob/master/README.md or https://www.diycode.cc/projects/prometheus/snmp_exporter|
|Get version:|~$ snmp_exporter --version|
|OMD default:|disabled|
|OMD URL:|no WUI available|

This is an exporter that exposes information gathered from SNMP for use by the Prometheus monitoring system. There are two components. An exporter that does the actual scraping, and a generator (which depends on NetSNMP) that creates the configuration for use by the exporter.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/prometheus_snmp_exporter/|
|Logfiles:|&lt;site&gt;/var/log/snmp_exporter.log|
|scrape config:|&lt;site&gt;/var/prometheus/data|

&#x205F;

### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| PROMETHEUS_SNMP_EXPORTER | on <br> **off** | Enable SNMP Exporter |
| PROMETHEUS_SNMP_ADDR | 127.0.0.1 | IP to listen on |
| PROMETHEUS_SNMP_PORT | 9119 | Default on first site |

### Generate exporter configuration

Further informations are available at [our howto section](../../howtos/prometheus_snmp_exporter/ "snmp_exporter howto")