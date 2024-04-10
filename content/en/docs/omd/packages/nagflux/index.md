---
title: Nagflux
---

### Overview

|||
|---|---|
|Homepage:|https://github.com/Griesbacher/nagflux|
|Changelog:|None|
|Documentation:|https://github.com/Griesbacher/nagflux|
|OMD default:|disabled|

Nagflux writes perfromance data from Nagios/Icinga to InfluxDB for visualizing using Histou and Grafana.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/nagflux/|
|Import Directory:|&lt;site&gt;/var/nagflux/|
|Logfiles:|&lt;site&gt;/var/log/nagflux/|

&#x205F;
### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| NAGFLUX | **on** <br> off | enable nagflux (default off) |

### Grafana Graphing

Read more on Nagflux/Histou/Grafana performance graphing on the [graphing page](../../howtos/grafana/).