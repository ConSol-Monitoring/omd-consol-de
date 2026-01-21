---
author: Sven Nierlein
date: '2013-11-03T11:47:01+00:00'
slug: business-prozesse-mit-nagios-und-thruk
title: Business Prozesse mit Nagios und Thruk
---

Business Prozesse in Nagios zu modellieren gehört zu den beinahe täglich anstehenden Aufgaben beim Thema Monitoring. Die neueste
Thruk Version (v1.78) bringt nun ein Business Prozess Addon mit dem sich Prozesse einfach per Gui modellieren lassen.

<!--more-->

## Und so siehts aus
<a title="Business Prozesse mit Nagios und Thruk" rel="lightbox[thruk]" href="/assets/2013-11-03-business-prozesse-mit-nagios-und-thruk/bp.png"><img src="/assets/2013-11-03-business-prozesse-mit-nagios-und-thruk/bp.png" alt="thruk architecture " width="50%" height="50%" style="border:0" /></a>

Die zur Berechnung benötigten Daten werden von Livestatus bezogen, somit sind zum einen Business Prozesse über mehrere Sites hinweg möglich und zum anderen beschleunigt das die Berechnung immens. So können mehrere hundert Prozesse pro Sekunde durchgerechnet werden.
<br style="clear:both">

<br>
Die neueste Version steht unter [www.thruk.org][1] zum Download bereit. Wer nur mal schauen will, kann dies auf der [Demo Instanz][2] machen.


## Die wichtigsten Features
<ul>
  <li>Web-Editor</li>
  <li>Aggregation von Hosts, Services, Hostgruppen und Servicegruppen</li>
  <li>Auswahl nach Hard oder Soft States</li>
  <li>Einfache Integration in Nagios</li>
  <li>Übersichtliche Darstellung</li>
  <li>Business Impact Analyse Modus</li>
  <li>Unterstützt sämtliche Kernfeatures, wie z.B.: Trends, SLA Reports und Logfileanalysen</li>
</ul>

Neben dem Web Editor können die Business Prozesse auch geskriptet als JSON Textdatei abgelegt werden. Dies erleichtert die automatische Generierung z.b. aus einer CMDB heraus.

<br><br><br>

[1]: http://www.thruk.org
[2]: http://demo.thruk.org