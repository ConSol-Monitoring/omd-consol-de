---
title: Mod-Gearman
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
|Homepage:|http://mod-gearman.org|
|Changelog:|https://github.com/sni/mod_gearman/blob/master/Changes|
|Documentation:|https://labs.consol.de/nagios/mod-gearman/|
|Get version:|mongod --version|
|OMD default:|disabled|
|OMD connectivity:|TCP:4730|

Mod-Gearman is a Naemon (formerly Nagios) addon which extends Naemon to run scalable and distributed setups. Worker nodes can be placed all over your network while keeping the simplicity of a central configuration. Mod-Gearman can even help to reduce the load on a single Naemon host, because of its smaller and more efficient way of executing host- and servicechecks.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/mod-gearman/|
|Logfiles:|&lt;site&gt;/var/log/gearman/|

&#x205F;

### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| MOD_GEARMAN | on <br> **off** | must be on to use other GEARMAN options |
| GEARMAND | on <br> **off** | "server" part |
| GEARMAND_PORT | variable | default is **localhost:4730** <br> Port is stored in etc/mod-gearman/ports.conf and use for both, gearmand and worker|
| GEARMAN_WORKER | on <br> **off** | |
| GEARMAN_NEB | on <br> **off** | |