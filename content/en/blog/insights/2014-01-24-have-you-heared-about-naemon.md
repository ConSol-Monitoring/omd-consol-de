---
author: Sven Nierlein
date: '2014-01-24T22:14:32+00:00'
slug: have-you-heared-about-naemon
title: Have you heared about Naemon
---

A few months ago, Andreas Ericsson, the main developer of Nagios 4, has been kicked from the Nagios Developer Team for personal reasons. So he decided to continue development in a new fork called Naemon. The result so far is quite impressive. <!--more-->

<p>Right after closing the Nagios users and developer mailing lists, Andreas got kicked so it seems like someone did not
want give people a place to discuss about such behaviour. Although the official <a href="http://monitoring-plugins.org" target="_blank">Monitoring Plugins Team</a> has already setup <a href="https://www.monitoring-lists.org/" target="_blank">replacement nagios mailing lists.</a>. At that point nobody knew that the Plugins Team will be kicked later too, but thats a different story.
</p>

<p>
Since then, a lot of things have already been done to make Naemon the better alternative to Nagios 4.
<ul>
  <li>the CGIs have been replaced with <a href="http://www.thruk.org" target="blank">Thruk</a></li>
  <li>Livestatus API is already included</li>
  <li>Worker Model for faster Host/Service Check execution</li>
  <li>Easy installation with RPM/DEB packages</li>
</ul>
</p>
<p>
So far, the Naemon Developer Team consists of 4 people already, and there are likely more to come. Especially since there is a <a href="https://bugzilla.redhat.com/show_bug.cgi?id=1054340" target="_blank">break</a> in between the community and Nagios Enterprise.
</p>

<p>
There are several resources if you are interested in Naemon:
<ul>
  <li><a href="http://naemon.org">naemon.org</a></li>
  <li>Users list: <a href="https://www.monitoring-lists.org/list/listinfo/naemon-users/">https://www.monitoring-lists.org/list/listinfo/naemon-users/</a></li>
  <li>Developers list: <a href="https://www.monitoring-lists.org/list/listinfo/naemon-dev/">https://www.monitoring-lists.org/list/listinfo/naemon-dev/</a></li>
  <li>IRC Channel: #naemon and #naemon-devel on freenode - irc://freenode.net/naemon</li>
</ul>
</p>

<p>
It is possible to test Naemon already. There are packages for redhat, sles, debian and ubuntu on <a href="http://labs.consol.de/naemon/testing/">labs.consol.de</a> as well as in the testing <a href="http://labs.consol.de/repo/testing/">Labs Repository.</a>.
</p>
<p>
Do not use in production yet, the project just has started. But there will be a stable release soon.
</p>
<br><br><br>