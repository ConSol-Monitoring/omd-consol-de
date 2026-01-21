---
author: Sven Nierlein
date: '2011-02-08T20:54:46+00:00'
slug: mod-gearman-1-0-released
tags:
- Distribution
title: Mod-Gearman 1.0 released
---

Mod-Gearman 1.0 has been released (<a href="http://www.mod-gearman.org/">download</a>).
About half a year after starting development of Mod-Gearman it's time to finish main development and release the stable 1.0.

 * use gearman to spread the load of your nagios box onto several worker
 * avoid core blocking events like eventhandler
 * distribute writing performance data

<!--more-->

## Reduce Load
Mod-Gearman reduces the load of your nagios box, even on the same hardware. Mod-Gearman worker don't fork as much as nagios does and the worker is much smaller than the nagios core process which reduces the system load for each fork. You can define worker for specific host or servicegroups to organize your checks.

## Avoid Blocking Events
There are blocking events, for example eventhandler and running oscp commands from Nagios. Running eventhandler with Mod-Gearman does not block the core anymore and they could be run on different hosts.

## Distribute Performance Data
Besides host and servicechecks, it's possible to distribute performance data too. PNP4nagios will offer the possibility to work on performance data jobs in the next version.


<a href="http://www.mod-gearman.org/">Read more about Mod-Gearman</a>