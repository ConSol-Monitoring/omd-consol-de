---
title: Naemon
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](naemon.png)
### Overview

|||
|---|---|
|Homepage:|https://www.naemon.io/|
|Changelog:|https://www.naemon.io/documentation/usersguide/whatsnew.html|
|Documentation:|https://www.naemon.io/documentation/|
|Get version:|naemon --version|
|OMD default:|enabled|
|OMD URL:|/&lt;site&gt;/thruk|

The Naemon core is a network monitoring tool based on the Nagios 4 core, but with many bug fixes, new features, and performance enhancements.

&#x205F;
### Directory Layout

|||
|---|---|
|Global Config Directory:|&lt;site&gt;/etc/naemon &amp; &lt;site&gt;/etc/naemon/naemon.d|
|Object Config Directory:|&lt;site&gt;/etc/naemon/conf.d|
|Logfiles:|&lt;site&gt;/var/naemon/|

&#x205F;
### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| CORE |  none <br> **naemon** <br> icinga2  | to disable core <br>  core to use |