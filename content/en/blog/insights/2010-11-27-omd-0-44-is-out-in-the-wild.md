---
author: Roland Huß
date: '2010-11-27T15:50:35+00:00'
excerpt: "[OMD](http://www.omdistro.org), the new star on the open monitoring scene,\
  \ has just been released in version 0.44 with a **lot** of enhancements and new\
  \ addons. \n"
slug: omd-0-44-is-out-in-the-wild
tags:
- check_logfiles
title: OMD 0.44 is out in the wild
---

[OMD](http://www.omdistro.org), the new star on the open monitoring scene, has been released in version 0.44 two weeks ago with a **lot** of enhancements and new addons.

<!--more-->
For those, who don't know yet the *Open Monitoring Distribution*, it is a Linux based distribution containing Nagios **and** important plugins, addons and GUIs in their latests versions all together in a single package. OMD is available for the major Linux brands (SLES, Debian, Ubuntu, RedHat/CentOS). Installing and starting OMD is a piece of cake, involving essentially only three steps. Really. It has fine support for upgrades and multiple installations and much more. More information on OMD can be found on its [website][1]. OMD is a community effort, where ConSol guys are some part of.

Starting with OMD 0.44 many of our Nagios work coming out of the ConSol Labs is included. Especially, the following ConSol labs plugins and addons are directly startable out of the OMD box:

* [Thruk][2], the one and only UI for Nagios ;-). Ok, just kidding, there are of course other UIs which are all good alternatives to the classical Nagios Webinterface. Thruk is fast, optimized for bulk operations, supports multiple nagios hosts and much more. Beside Thruk, OMD 0.44 includes the classical, CGI-based Nagios UI and the fine [Multisite][3]. You have the choice.
* [check_logfiles][4], the swiss-army knife for tracking log files.
* [check_mysql_health][5] and [check_oracle_health][6], the king and queen of database Nagios plugins. Please note, that for check_oracle_health an additional Oracle client needs to be installed (and `ORACLE_HOME` must be set accordingly)
* [check_webinject][7], a powerful web application testing plugin which goes far beyond simple HTTP checking.
* [jmx4perl][8], the best tool for monitoring Java application servers via JMX with Nagios. Beside the plugin `check_jmx4perl`, the JMX shell `j4psh` and the command line tool `jmx4perl` are included, too.

Please give OMD a try. You will be suprised how easy the installation of a full featured Nagios setup can be.

  [1]: http://www.omdistro.org
  [2]: http://www.thruk.org
  [3]: http://mathias-kettner.de/checkmk_multisite.html
  [4]: /docs/plugins/check_logfiles
  [5]: /docs/plugins/check_mysql_health
  [6]: /docs/plugins/check_oracle_health
  [7]: /docs/plugins/check_webinject
  [8]: http://www.jmx4perl.org