---
author: Roland Huß
date: '2009-12-11T07:20:10+00:00'
excerpt: Glassfish Enterprise Server v3 has been released yesterday and it brings
  some exciting news related to monitoring. Here are some links to the new monitoring
  features of v3.
slug: a-very-first-look-at-glassfish-v3-and-jmx
tags:
- glassfish
title: A very first look at monitoring in Glassfish v3
---

Glassfish Enterprise Server v3 has been released yesterday and it brings some exciting news related to monitoring. Here are some links to the new monitoring features of v3.

<!--more-->Glassfish v3 has quite a bunch of extensions related to JMX and monitoring. I didn't yet dive deep into it, but here are some links of blogs published yesterday (aggregated from [@glassfish](https://twitter.com/glassfish)):

* [Monitoring in GlassFih v3 - It's Different and Cool!](http://blogs.sun.com/msreddy/entry/monitoring_in_glassfih_v3_it)
* [Easy 1-2-3 Monitoring in v3](http://blogs.sun.com/jenblog/entry/monitoring_in_v3)
* [Top Ten features of Monitoring](http://blogs.sun.com/Prashanth/entry/top_ten_features_of_monitoring)
* [GlassFish V3 management and monitoring MBeans — AMX](http://blogs.sun.com/lchambers/entry/glassfish_v3_management_and_monitoring)
* [GlassFish REST Interface for Management and Monitoring](http://blogs.sun.com/aquatic/entry/glassfish_rest_interface_for_management)
* ['mx' — JMX command line especially for GlassFish V3](http://blogs.sun.com/lchambers/entry/mx_jmx_command_line_especially)
* [Navigating the GlassFish V3 MBean hierarchy using 'mx' command line](http://blogs.sun.com/lchambers/entry/navigating_the_glassfish_v3_mbean)
* [Making your Application monitorable in GlassFish v3](http://blogs.sun.com/Prashanth/entry/making_your_app_monitoring_in)
* [Adhoc Monitoring with Scripting-Client in GlassFish v3](http://blogs.sun.com/Prashanth/entry/adhoc_monitoring_with_scripting_client)

The *mx* shell is quite interesting because it is more or less the exact thing which I planned for the jmx4perl shell mode. Except that jmx4perl will use Perl and Readline and is vendor neutral. Seems that I have to hurry up ;-). It's also interesting that Glassfish now provides also REST access to its management interfaces. But here, as it looks like, jmx4perl was a bit faster ;-).