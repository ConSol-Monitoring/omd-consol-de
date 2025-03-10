---
title: Grafana
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](logo.jpg)
### Overview

|||
|---|---|
|Homepage:|https://grafana.org/|
|Changelog:|https://github.com/grafana/grafana/blob/master/CHANGELOG.md|
|Documentation:|https://docs.grafana.org/|
|OMD default:|disabled|

Grafana is a leading open source application for visualizing large-scale measurement data.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/grafana/|
|Data Directory:|&lt;site&gt;/var/grafana/|
|Logfiles:|&lt;site&gt;/var/log/grafana/|

&#x205F;
### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| GRAFANA | **on** <br> off | enable grafana (default off) |

### Grafana Graphing

Read more on Nagflux/Histou/Grafana performance graphing on the [graphing page](../../howtos/grafana/).