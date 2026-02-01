---
author: Sven Nierlein
date: '2012-07-19T21:32:03+00:00'
slug: thruk-1-36-released
tags:
- Nagios
title: Thruk 1.36 Released
---

Version 1.36 of the Thruk monitoring gui has just been released. The changelog is quite huge this time. There is a new dashboard plugin called the 'Panorama View' Addon. There are a lot more reports included now. And finally there is a plugin manager included in the config tool which lets you easily manage your plugins and addons.

<!--more-->
<br>
<h1>Panaorama View Dashboard</h1>
The 'Panorama' plugin is a nice, fully customizable dashboard allowing you to build your own panorama views. There are quite
a few, so called Panlets already and there are a lot more to come. Besides the normal panlets, there is a generic url panlet which lets you include any page (currently only from the same origin). You choose to only view a part of a page by using a css selector.
<a href="panorama1.png"><img src="panorama1.png" alt="" title="Panorama View" width="35%" height="35%" class="alignnone size-medium" style="border:0; clear:both;"/></a><br><br><br><br><br><br><br><br><br><br><br>


<br>
<h1>Custom Reports</h1>
Every page can be put into a report from the preferences button on the top right. When the page results in an Excel file, then this file will be send as attachment. Basically you can put anything into a report now, an image, html, xls or csv data. You could, for example, create a filter to only show any service which is down for more than a week and send that page once every week by mail.


<br>
<h1>Plugin Manager</h1>
The plugin manager lets you choose your plugins. After making changes you have to restart Thruk anyway, but at least you have a small description and a preview of what you get.
<a href="pluginmanager.png"><img src="pluginmanager.png" alt="" title="Plugin Manager" width="35%" height="35%" class="alignnone size-medium" style="border:0; clear:both;"/></a><br><br><br><br><br><br><br><br><br>

<br>
<h1>Changelog</h1>

<pre>
1.36     Thu Jul 19 13:49:01 CEST 2012
          - added panorama view plugin
          - support flexible downtimes from the status page quick command
          - support recurring flexible downtimes
          - allow human readable values for duration filter like 5h or 10m
          - check version when using the check for updates link
          - clean up menu (don't show grid links in extra row)
          - allow wildcards in 'show_custom_vars'
          - added cgi sounds to tac page (if enabled)
          - added link for bug reports on internal errors (idea by the icinga team)
          - reporting:
            - reports can now be created for every page (html, xls, ...)
          - config tool:
            - added plugin & addon manager
            - show hostgroup name on hosts service list
            - fixed unregistered hostgroups showing up as warning
            - fixed commands in orphaned objects list
          - Bug Fixes
            - downtimes: fixed display of flexible downtimes
            - recurring downtimes: fixed adding downtimes on sunday
            - config tool: allowed hostgroups with register 0
            - fixed reloading pages when multiple filters used (Rupert Roesler-Schmidt)
            - fixed sounds in IE and Windows Firefox
</pre>

<br>
<h1>Download</h1>
<a href="http://www.thruk.org/download.html">Normal Download</a><br>
<a href="https://labs.consol.de/repo/">Repository</a><br>
<a href="http://thruk.org/">thruk.org</a><br>
<br><br><br>