---
author: Gerhard Laußer
date: '2009-10-02T16:59:04+00:00'
slug: neues-datenbank-plugin-check_db2_health
tags:
- DB2
title: Neues Datenbank-Plugin check_db2_health
---

Es gibt ein neues Mitglied in der check_&lt;datenbank&gt;_health-Familie. Nach Oracle, MS SQL und MySQL habe ich mir DB2 vorgenommen und ein Plugin geschrieben, das leicht erweiterbar ist und grundlegende Anforderungen out of the box abdeckt.

<!--more-->Das Plugin setzt die Installation von DBD::DB2 voraus, das man bei IBM herunterladen kann: <a href="http://www.ibm.com/software/data/db2/perl" target="_blank">http://www.ibm.com/software/data/db2/perl</a>
<p>&nbsp;</p>
<a rel="lightbox" href="check_db2_health.png"><img class="size-full wp-image-698 aligncenter" title="check_db2_health_s" src="check_db2_health_s.png" alt="check_db2_health_s" width="228" height="84" /></a>
<a rel="lightbox" href="service_detail.png"><img class="size-full wp-image-696 aligncenter" title="service_detail_s" src="service_detail_s.png" alt="service_detail_s" width="286" height="216" /></a>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p><p>&nbsp;</p>
<p>Zur Speicherung von Zwischenergebnissen wird das Verzeichnis /var/tmp/check_db2_health angelegt. Es ist darauf zu achten, dass der Nagios-Benutzer die dazu nötigen Privilegien besitzt.</p>