---
title: Nagios
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
|Homepage:|https://www.nagios.org/|
|Changelog:|https://www.nagios.org/projects/nagioscore/history|
|Documentation:|http://nagios.sourceforge.net/docs/nagioscore/3/en/toc.html|
|Get version:|nagios --version|
|OMD default:|enabled|
|OMD URL:|/&lt;site&gt;/nagios|

Nagios, an open-source software application, monitors systems, networks and infrastructure. Nagios offers monitoring and alerting services for servers, switches, applications and services. It alerts users when things go wrong and alerts them a second time when a the problem has been resolved.

&#x205F;
### Directory Layout

|||
|---|---|
|Global Config Directory:|&lt;site&gt;/etc/nagios &amp; &lt;site&gt;/etc/nagios/nagios.d|
|Object Config Directory:|&lt;site&gt;/etc/nagios/conf.d|
|Logfiles:|&lt;site&gt;/var/nagios/|

&#x205F;
### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| CORE |  none <br> **nagios** <br> naemon <br> icinga  | to disable core <br>  core to use |