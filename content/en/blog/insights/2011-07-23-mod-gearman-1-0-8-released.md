---
author: Sven Nierlein
date: '2011-07-23T14:09:38+00:00'
slug: mod-gearman-1-0-8-released
tags:
- Mod-Gearman
title: Mod-Gearman 1.0.8 Released
---

Mod-Gearman 1.0.8 has been released (<a href="http://www.mod-gearman.org/">download</a>).
This release mostly contains bugfixes only and a minor change to use the identifier more often.
<!--more-->

## Identifier used in error messages
Mod-Gearman adds the workers hostname to some common errors. For example the 127 exit code, file not found error. This helps the admin to easily determine which worker had the problem. From this version on, the identifier will be used (which is usually the hostname unless overwritten). This makes it even easier when running multiple worker on the same host.

## Changelog
The full changelog since the last announcement
<pre>
1.0.8  Fri Jul 22 22:21:34 CEST 2011
          - use identifier for error messages if set
          - fixed ld options (fixes debian bug #632431) thanks Ilya Barygin
          - fixed memory leak in gearman_top
          - fixed memory leak when reloading neb module
1.0.7  Sun Jul  3 15:18:16 CEST 2011
          - show plugin output for exit codes &gt; 3
          - fixed send_multi timestamps when client clock is screwed
          - fixed send_multi for libgearman &gt; 0.14
1.0.6  Sat Jun  4 11:47:02 CEST 2011
          - expand server definitions from :4730 to localhost:4730
          - fixed latency calculation (was below zero sometimes)
1.0.5  Tue May 17 17:46:36 CEST 2011
          - added dupserver option to send_gearman and send_multi too
          - removed warning for the passive only mode
1.0.4  Sun Apr 17 17:58:47 CEST 2011
          - added generic logger
            - enables logging to stdout, file, syslog or nagios
          - changed latency calculation (use time of next_check instead of time of job submission)
          - added nsca replacements docs
1.0.3  Wed Mar 23 21:53:09 CET 2011
          - fixed worker handling exit codes &gt; 127
1.0.2  Fri Mar 11 10:30:21 CET 2011
          - added new option do_hostchecks to completly disable hostchecks
          - fixed reading keyfiles
1.0.1  Sat Mar  5 15:47:22 CET 2011
          - added spawn-rate option for worker
          - added perfdata_mode option to prevent perfdata queue getting to big
          - made gearmand init script work with old libevent versions
          - fixed make dist
          - fixed "make rpm" for SLES11
</pre>

<a href="http://www.mod-gearman.org/">Read more about Mod-Gearman</a>