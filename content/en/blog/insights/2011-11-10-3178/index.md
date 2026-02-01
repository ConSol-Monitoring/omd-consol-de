---
author: Sven Nierlein
date: '2011-11-10T12:50:03+00:00'
slug: '3178'
title: Thruk Benchmarks
---

<div id="preamble">
<div class="sectionbody">
<div class="paragraph"><p>I often get asked if there are any benchmarks for <a href="http://www.thruk.org">Thruk</a> so i finally
decided to do some tests.</p></div>
</div>
</div>

<!--more-->
<div id="content">
<h2 id="_test_setup">Test Setup</h2>
<div class="sectionbody">
<div class="paragraph"><p>Since <a href="http://omdistro.org">OMD</a> made it so easy and fast to setup a test environment i would
be a fool to not use it for tests too.</p></div>
<div class="paragraph"><p>In order to create test hosts and services i used the
<a href="http://search.cpan.org/dist/Monitoring-Generator-TestConfig/">Monitoring::Generator::TestConfig</a>
Perl module and wrapped a simple perl script around (
<a href="https://github.com/sni/omd_utils/blob/master/benchmark/gui_benchmark.pl">gui_benchmark.pl
on GitHub</a>).</p></div>
<div class="ulist"><div class="title">Used Versions:</div><ul>
<li>
<p>
Thruk 1.1.1
</p>
</li>
<li>
<p>
Nagios 3.2.3
</p>
</li>
<li>
<p>
Icinga 1.5.1
</p>
</li>
</ul></div>
<div class="olist arabic"><div class="title">Test:</div><ol class="arabic">
<li>
<p>
create test services
</p>
</li>
<li>
<p>
stop the core so it does not waste cpu cycles
</p>
</li>
<li>
<p>
submit some passive check results
</p>
</li>
<li>
<p>
wait till the checks are processed by the core
</p>
</li>
<li>
<p>
run Apache Bench (ab) 5 times for each gui and take the fastest result
</p>
</li>
</ol></div>
<div class="paragraph"><p>The rests itself consists of 100 requests with 5 concurrent requests.</p></div>
</div>
<h2 id="_result">Result</h2>
<div class="sectionbody">
<div style="white-space: nowrap">
<a title="Tactical Overview" rel="lightbox[benchmark]" href="tac.png"><img src="tac.png" alt="Tactical Overview" width="30%" height="30%" style="clear: inherit" /></a>
<a title="Service Problems" rel="lightbox[benchmark]" href="problems.png"><img src="problems.png" alt="Service Problems" width="30%" height="30%" style="clear: inherit" /></a>
</div>
<br style="clear: both;">
<a title="Processinfo" rel="lightbox[benchmark]" href="processinfo.png"><img src="processinfo.png" alt="Processinfo" width="30%" height="30%" style="clear: inherit" /></a>
<a title="Eventlog" rel="lightbox[benchmark]" href="eventlog.png"><img src="eventlog.png" alt="Eventlog" width="30%" height="30%" style="clear: inherit" /></a>
<br style="clear: both;">
<div class="paragraph"><p>The response time contains only the response of the main page content.
Your browser will propably take longer because it has to fetch images
and css stylesheets and render the hole page.</p></div>
</div>
<h2 id="_conclusion">Conclusion</h2>
<div class="sectionbody">
<div class="paragraph"><p>The images speak for themselves, parsing the status.dat for every
request takes time and increases linear with the amount of services.
Requesting only the needed data for the specific page via livestatus
has a much lower overhead and is therefor much faster, but still
increases linear with the amount of services of course. Just at a much
lower rate.</p></div>
<div class="paragraph"><p>The biggest performance issues for the status.dat based CGIs is on
pages where no or nearly no data is needed, like the process info page
or the commands page. The repsonse time for Thruk stays nearly
constant where Nagios or Icinga still need to parse the hole
status.dat.</p></div>
<div class="paragraph"><p>Main factor for Thruks response time is the amount of data returned
for each query. The more data on a page, the longer it takes. That&#8217;s
one reason why Thruk usually uses paging on larger pages.</p></div>
</div>
</div>