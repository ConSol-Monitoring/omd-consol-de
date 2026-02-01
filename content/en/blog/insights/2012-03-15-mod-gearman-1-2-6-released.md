---
author: Sven Nierlein
date: '2012-03-15T14:37:58+00:00'
slug: mod-gearman-1-2-6-released
tags:
- Mod-Gearman
title: Mod-Gearman 1.2.6 released
---

Version 1.2.6 of Mod-Gearman has just been released. You may now configure the worker queues by custom variables instead of host/servicegroups.

<!--more-->
<br>
<h1>queues from custom variables</h1>

Sometimes you don't want to create hostgroups to split up your checks for different worker (groups). So now you can assign a queue by custom variables. Read more about that feature in the <a href="/docs/mod-gearman/">documentation</a>.

<br>
<h1>discarded too old service job</h1>

The error above should no longer occur. From now on there is now check on the job age by default. This is a relict from old versions and has been disabled by default now. You can enable it again by setting a 'max-age' value higher than zero. Although there is no need for this, as there will be only one check job per host and service at a time.

<br>
<h1>dup_results_are_passive</h1>

This new setting allows you to send duplicate results as active check. Default is to send them as passive check but active checks contain a few more very useful information like latency and check runtime.

<br>
<h1>download</h1>

<a href="http://www.mod-gearman.org/#_download">Normal Download</a><br>
<a href="http://mod-gearman.org/download/v1.2.6/">RPM packages</a><br>
Debian and Ubuntu have official packages already. Thanks to the packager.