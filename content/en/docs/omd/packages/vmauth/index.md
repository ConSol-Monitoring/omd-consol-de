---
title: VMauth
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
|Documentation:|https://docs.victoriametrics.com/vmauth/||
|Get version:|bin/vmauth-prod -version|
|OMD default:|disabled|
|OMD PORT:|8528 (Default for the first site)|

vmauth is an HTTP proxy, which can authorize , route and load balance requests across VictoriaMetrics components or any other HTTP backends.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/victoriametrics/vmauth|
|Logfiles:|&lt;site&gt;/var/victoriametrics/victoriametrics.log|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| VMAUTH | on <br> **off** | Enable VictoriaMetrics |
| VMAUTH_MODE | http | Default,can be https also |
| VMAUTH_TCP_ADDR | 127.0.0.1 | IP to listen on |
| VMAUTH_TCP_PORT | 8528 | Default on first site |

### VMauth example config

Take note of $OMD_ROOT/etc/victoriametrics/vmauth/README.md