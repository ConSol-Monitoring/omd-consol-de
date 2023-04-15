---
title: InfluxDB
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
### Overview

|||
|---|---|
|Homepage:|https://influxdb.com/|
|Changelog:|https://github.com/influxdb/influxdb/blob/master/CHANGELOG.md|
|Documentation:|https://influxdb.com/docs/|
|OMD default:|disabled|

InfluxDB is a time series, metrics, and analytics database to store Nagios/Icinga performance data.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/influxdb/|
|Data Directory:|&lt;site&gt;/var/influxdb/|
|Logfiles:|&lt;site&gt;/var/log/influxdb.log|

&#x205F;
### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| INFLUXDB | **on** <br> off | enable influxdb database (default off) |
| INFLUXDB_RETENTION | variable | default is 12 <br> The number of weeks InfluxDB will keep data. Data older than this will be deleted automatically |



### Grafana Graphing

Read more on Nagflux/Histou/Grafana performance graphing on the [graphing page](../../howtos/grafana/).


### Selfmonitoring

OMD ships a influxdb nagios plugin in `lib/nagios/plugins/check_influxdb.pl` which can
be used to setup a selfmonitoring and graphing for the influxdb itself.