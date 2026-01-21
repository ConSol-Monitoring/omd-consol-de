---
author: Sven Nierlein
date: '2012-10-23T11:18:07+00:00'
slug: monitoring-core-benchmarks
title: Monitoring Core Benchmarks
---

We often get asked about nagios server sizing, so we did some benchmarking. Here are the results.

<!--more-->

<br>
<h1>Test Setup</h1>

To get proper results all tests were made on the same system:
<ul>
  <li>Debian 6 Squeeze</li>
  <li>Virtual Machine based on VMware</li>
  <li>512MB Ram</li>
  <li>2x2.5GHz Xeon</li>
  <li>16gb disk</li>
</ul>

All tests were made with a loaded livestatus module to fetch actual numbers of executed checks. The test setup was based on <a href="http://omdistro.org">OMD</a>
so it contains some best practice tuning already like using a ram disk, large installation tweaks and disabled environment macros. We created different sites for each test environment:

<ul>
  <li><a href="http://nagios.org">Nagios 3.2.3</a></li>
  <li>Nagios 4 (alpha version)</li>
  <li><a href="http://icinga.org">Icinga 1.7.2</a></li>
  <li><a href="/nagios/mod-gearman">Mod-Gearman 1.3.8</a></li>
</ul>




<br>
<h1>Test Plugins</h1>

In order to meassure the overhead of different cores, we used several test plugins. Perl plugins were tested with and without embedded perl for cores which support EPN.

A simple c plugin:

```c
#include <stdio.h>

int main(void) {
    printf("simple c plugin\n");
    return 0;
}
```


A simple shell plugin:

```bash
#!/bin/bash

echo "simple bash plugin"
exit 0
```


A simple perl plugin:

```perl
#!/usr/bin/perl

print "simple perl plugin\n";
exit 0;
```


A huge perl plugin:

```perl
#!/usr/bin/perl

use warnings;
use strict;
use Moose;
use Catalyst;

print "not so simple perl epn plugin\n";
exit 0;
```



<br>
<h1>Running the Benchmark</h1>

For each benchmark the testscript started with a small number of hosts/service (1 minute interval) and increased that number as long as the latency was below 5seconds and the cpu isn't working at maximum. Graphs werde created including the calculated average number of checks which should run per second (red line) and the actual number of checks per second (blue line).


<br>
<h1>Results</h1>

<a href="/assets/2012-10-23-monitoring-core-benchmarks/nagios3_simple_check.png"><img src="/assets/2012-10-23-monitoring-core-benchmarks/nagios3_simple_check.png" alt="" title="Nagios 3, Simple Check Plugin" width="40%" height="40%" class="alignnone size-medium" style="border:0; clear:both;"/></a>
Running the benchmark with a Nagios 3 Core tops out at around 100 Checks per second.
<br><br><br><br><br><br><br><br><br><br><br>

<a href="/assets/2012-10-23-monitoring-core-benchmarks/nagios4_gearman.png"><img src="/assets/2012-10-23-monitoring-core-benchmarks/nagios4_gearman.png" alt="" title="Nagios 4 with Mod-Gearman, Simple Check Plugin" width="40%" height="40%" class="alignnone size-medium" style="border:0; clear:both;"/></a>
Using Mod-Gearman increases the upper limit to almost 400 checks per second.
<br><br><br><br><br><br><br><br><br><br><br>


<a href="/assets/2012-10-23-monitoring-core-benchmarks/core_benchmark_results.png"><img src="/assets/2012-10-23-monitoring-core-benchmarks/core_benchmark_results.png" alt="" title="Result Overview" width="40%" height="40%" class="alignnone size-medium" style="border:0; clear:both;"/></a>
Putting all results into a single graph.
<br><br><br><br><br><br><br><br><br><br><br>

There is nearly no difference between small C, Perl or Shell plugins, but when plugins get heavier using embedded perl helps a lot. It's faster
to run perl plugins with embedded perl than running native compiled c plugins. The huge perl check is mainly limited by the underlying disk which is
not very fast in our test lab but it shows the power of Embedded Perl.


<br>
<h1>Nagios 3 vs. Nagios 4</h1>

<a href="/assets/2012-10-23-monitoring-core-benchmarks/nagios3vs4.png"><img src="/assets/2012-10-23-monitoring-core-benchmarks/nagios3vs4.png" alt="" title="Nagios 3 with Mod-Gearman vs. Nagios 4 with Mod-Gearman" width="40%" height="40%" class="alignnone size-medium" style="border:0; clear:both;"/></a>
This time we used external worker to just measure how fast the Nagios Core can process result. And as we can see, Nagios 4 processes about 4x times more than Nagios 3. The checks are still active checks but executed on remote workers.
<br><br><br>


<br>
<h1>Conclusion</h1>
The load on your monitoring box is mainly related to what kind of plugin you run. Mod-Gearman helps a lot to reduce some overhead and spread the load over multiple hosts when one is not enough. Mod-Gearman cannot solve all performance problems, for example bad configuration or when using other plugins like ndo,
but when doing it right, you can check up to 2000 Services/Hosts per second which is equivalent to 600.000 Services at a 5 Minute interval with a single Nagios core.

<br><br><br>