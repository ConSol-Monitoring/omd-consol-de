---
author: Gerhard Laußer
date: '2009-11-13T13:31:23+00:00'
slug: heartbeat-cluster-ocf-agent-fr-ndo2db
tags:
- cluster
title: Heartbeat-Cluster OCF-Agent für ndo2db
---

<p>Betreibt man eine hochverfügbare Nagios-Installation mit dem Heartbeat-Cluster, so benötigt man für die einzelnen Softwarekomponenten (Resourcen genannt) Agenten, die sich um Start, Stop und Überwachung derselben kümmern. Folgendes Script ermöglicht die Einbindung des NDO2DB-Daemons in so einen Cluster. Dazu muss man es nur nach <i>/usr/lib/ocf/resource.d/&lt;heartbeat oder ein eigener Provider&gt;/ndo2db</i> kopieren.</p>  <p>Download: <a title="ndo2db ocf resource" href="/assets/downloads/nagios/ndo2db.txt">ndo2db</a></p>