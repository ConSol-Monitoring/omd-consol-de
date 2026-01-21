---
author: Sven Nierlein
date: '2012-02-14T22:43:19+00:00'
slug: mod-gearman-1-2-2-released
tags:
- Mod-Gearman
title: Mod-Gearman 1.2.2 released
---

Version 1.2.2 of Mod-Gearman has just been released. It now comes with better orphaned check detection and easier installation for rpm based linux systems.

<!--more-->

<br>
<h1>Orphaned Check Detection</h1>

Orphaned Checks occur whenever there are checks to do but no worker available. The two main reasons:
<ul>
  <li>network outages</li>
  <li>misconfiguration</li>
</ul>

The Mod-Gearman NEB module will now submit a fake result for each orphaned check. This should
help detecting errors and misconfigurations earlier. The old behaviour can be restored with

orphan_host_checks=no<br>
orphan_service_checks=no

This should help generating more accurate reports. Monitoring the Gearman daemon is also advisable to detect queues without workers.

<br>
<h1>RPM Packages</h1>

There are Debian and Ubuntu Packages for a long time already and now there will be packages for RPM based linux systems too. Starting with SLES and Centos/Redhat we will create <a href="http://mod-gearman.org/download/v1.2.2/">binary packages</a> for each release including the gearmand daemon itself.<br>
For other RPM based systems, it should be easy to build packages by yourself using rpmbuild.

<br>
<h1>Download</h1>

<a href="http://www.mod-gearman.org/">Normal Download</a><br>
<a href="http://mod-gearman.org/download/v1.2.2/">RPM packages</a><br>
Debian and Ubuntu have official packages already. Thanks to the packager.