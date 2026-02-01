---
author: Gerhard Laußer
date: '2011-02-19T13:52:20+00:00'
slug: omd-0-46-is-there
tags:
- Nagios
title: OMD 0.46 is there!
---

The developer team of <a href="http://omdistro.org">OMD</a> released the version 0.46 last week. Now you will not only be able to run <a href="http://www.nagios.org">Nagios</a> out of the box. <a href="http://www.shinken-monitoring.org">Shinken</a> has been added as an alternative core. This enables you to create <em>one</em> set of configuration files and switch between <em>two</em> monitoring technologies with only a few commands.

<!--more-->
<p>For those of you who haven&#8217;t heard of the Open Monitoring Distribution yet, it&#8217;s a Linux based collection of the most popular Plugins, AddOns and GUIs as well as Nagios and Shinken. It&#8217;s a monitoring starter kit in one rpm/deb package which even allows you to run multiple Nagios/Shinken installations in parallel.
OMD is available for the major Linux brands (SLES, Debian, Ubuntu, RedHat/CentOS). Have a look at the website of <a href="http://omdistro.org">OMD</a> to learn how easy it is to get it installed and ready to run. OMD is a community effort, where ConSol guys are some part of.</p>
<p>Now let's create your first instance</p>
<div class="listingblock">
<div class="content">
<pre><tt>$ omd create testme</tt></pre>
</div></div>
<p>What did you get? OMD created a new instance &quot;testme&quot; which includes a user and a directory with everything you need to monitor your IT landscape. The only thing left to you is to create the config files. (A sample config for localhost is already there). Now switch to that newly created user and start the instance.</p>
<div class="listingblock">
<div class="content">
<pre><tt>$ su - testme
testme$ omd start</tt></pre>
</div></div>
<p>Your monitoring system is now up and running. Look and see!<br>
Point your browser to http://<i>ip_of_your_test_machine</i>/testme to see a selection of possible GUIs, which are</p>
<ul>	<li>classic cgi-based Nagios interface (http://ip_of_your_test_machine/testme/nagios)</li>
<li>Thruk (http://<i>ip_of_your_test_machine</i>/testme/thruk)</li>
<li>Multisite (http://<i>ip_of_your_test_machine</i>/testme/check_mk)</li>
<li>Nagvis (http://<i>ip_of_your_test_machine</i>/testme/nagvis)</li>
</ul>
<p>Cool, eh? All you had to do was to install one single package. But the best is yet to come.</p>
<img style="border: white 0px solid;" src="timewarp1.gif" alt="Do the time warp" />
<div class="listingblock">
<div class="content">
<pre><tt>testme$ omd stop
testme$ omd config set CORE shinken
testme$ omd start</tt></pre>
</div></div>
Now your monitoring still looks the same (remember the list of GUIs?), but under the hood it's using a modern programming language and a radically new multi-process architecture.