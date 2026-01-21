---
author: Sven Nierlein
date: '2011-09-23T09:19:34+00:00'
slug: omd-0-50-is-available
tags:
- check_mysql_health
title: OMD 0.50 is available
---

The developer team of <a href="http://omdistro.org">OMD</a> (Open Monitoring Distribution) released the version 0.50 today. This version contains bugfixes and lots of updated packages including Shinken, Thruk, PNP4Nagios, Mod-Gearman, check_oracle_health and check_mysql_health.

<!--more-->
Using the <a href="/repo/">OMD Repository</a> an update is now as simple as a "apt-get install omd". Or similar on rpm based distributions. After installation of OMD, you have to update your sites. Better try this with a copy of your production site first.

# Update

<pre>
 #> apt-get update
 #> apt-get install omd
 #> omd cp prod update_test
 #> omd update update_test
</pre>

# Reuse Option
OMD 0.50 comes with a nice new feature. It is now possible to reuse existing users. This makes integration of OMD with puppet, chef or cfengine or any other management software easier. The reused user must still be exclusively reserved for the omd site and has to match the criteria of a normal omd user.

<pre>
 #> omd create --reuse \<site\>
</pre>