---
title: NSCA
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](None)
### Overview

|||
|---|---|
|Homepage:|https://exchange.nagios.org/directory/Addons/Passive-Checks/NSCA--2D-Nagios-Service-Check-Acceptor/details|
|Documentation:|https://exchange.nagios.org/directory/Addons/Passive-Checks/NSCA--2D-Nagios-Service-Check-Acceptor/details|
|Get version:|nsca --version|
|OMD default:|disabled|
|OMD connectivity:|TCP:5667|

NSCA is a Linux/Unix daemon allows you to integrate passive alerts and checks from remote machines and applications with Nagios. Useful for processing security alerts, as well as redundant and distributed Nagios setups.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/nsca/|
|Logfiles:|Just debug mode send logs to syslog facility|

&#x205F;

### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| NSCA | on <br> **off** | default disabled |
| NSCA_TCP_PORT | variable | default is **localhost:5667** |