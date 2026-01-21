---
author: Simon Meggle
date: '2014-07-01T09:54:52+00:00'
slug: sakuli-open-source-end2end-monitoring-mit-nagios
tags:
- e2e
title: Sakuli - Open Source End2End-Monitoring mit Nagios
---

Mit <strong>Sakuli</strong> lassen sich unabhängig vom Betriebssystem User-Aktionen in Anwendungen (Fat-Client, Citrix, Web, …) simulieren; die Stati und dabei gemessenen Laufzeiten werden von Nagios ausgewertet und visualisiert. Unter der Haube stecken die Tools
<ul>
	<li><strong>Sahi</strong> (<a title="www.sahi.co.in" href="http://www.sahi.co.in" target="_blank">www.sahi.co.in</a>) für webbasierte Tests und</li>
	<li><strong>Sikuli</strong> (<a title="www.sikuli.org" href="http://www.sikuli.org" target="_blank">www.sikuli.org</a>) zum Ausführen von „echten“ Maus/Tastatur-Aktionen,</li>
</ul>
die wir unter dem Namen "<strong>Sakuli</strong>" über ihre gemeinsame API zu einem Team zusammenspannt und <a title="und auf Github veröffentlicht haben" href="https://github.com/ConSol/sakuli" target="_blank">auf GitHub veröffentlicht haben</a>.

<!--more-->


Einige Produktiv-Installationen laufen bereits:
<ul>
	<li><strong>Sakuli</strong> prüft das Intranet-Portal einer Risikomanagement-Software, in welchem die Zustände von aktuellen Berechnungen tabellarisch aufgeführt sind. Mit Monitoring-Schnittstellen geizt die Software, sodass sich Sakuli - hier als reiner Web-Test mit Sahi - die Tabelle über das DOM angelt und alle Einträge auf ihr Alter hin überprüft.</li>
	<li><strong>Sakuli</strong> überwacht die Verfügbarkeit und Ausführungszeit verschiedener Reports in SAP NetWeaver BI.</li>
	<li><strong>Sakuli</strong> testet kontinulierlich die End User Experience verschiedener Citrix-Applikationen. Jeder Check ist unterteilt in "Steps" ("Open Browser", "Citrix Login", "Start Application", "Enter report data", "Open Report", u.ä.), die über PNP4Nagios visualisiert und von Nagios bei Überschreitung der jeweils erlaubten Ausführungszeit alarmiert werden.</li>
</ul>
&nbsp;

[caption id="attachment_5739" align="aligncenter" width="240"]<a href="/assets/2014-07-01-sakuli-open-source-end2end-monitoring-mit-nagios/thruk_details.png"><img class="wp-image-5739 size-medium" src="/assets/2014-07-01-sakuli-open-source-end2end-monitoring-mit-nagios/thruk_details-240x300.png" alt="thruk_details" width="240" height="300" /></a> <strong>Sakuli</strong> erstellt im Fehlerfall einen Screenshot, den Nagios in den Service-Details anzeigt.[/caption]

[caption id="attachment_5737" align="aligncenter" width="248"]<a href="/assets/2014-07-01-sakuli-open-source-end2end-monitoring-mit-nagios/thruk_rrd.png"><img class="wp-image-5737 size-medium" src="/assets/2014-07-01-sakuli-open-source-end2end-monitoring-mit-nagios/thruk_rrd-248x300.png" alt="thruk_rrd" width="248" height="300" /></a> Ein spezielles PNP4Nagios-Template erlaubt die Visualisierung von Suite-, Case-, und Step-Laufzeiten.[/caption]

Auf dem <a title="Monitoring-Workshop in Berlin" href="http://wiki.monitoring-portal.org/workshop/2014/start" target="_blank">Monitoring-Workshop 2014 in Berlin</a> durfte ich den aktuellen Entwicklungsstand des Projekts, unsere bisher gewonnenen Erfahrungen, sowie die geplanten Features (wie z.B. Video-Mitschnitt der Tests und GearmanD-basierte Architektur) vorstellen - hier die Folien dazu:

<a href="/assets/2014-07-01-sakuli-open-source-end2end-monitoring-mit-nagios/20140520_Sakuli_MM_WS.pdf">Simon_Meggle_Sakuli_Monitoring_Workshop_2014_Berlin</a>
<iframe type="opt-in" data-name="youtube" style="border: 1px solid #CCC; border-width: 1px 1px 0; margin-bottom: 5px; max-width: 100%;" data-src="//www.slideshare.net/slideshow/embed_code/36501130" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" allowfullscreen="allowfullscreen"> </iframe>
<div style="margin-bottom: 5px;"><strong> <a title="Simon Meggle - Open Source End2End Monitoring with Sakuli and Nagios " href="https://de.slideshare.net/simmerl121/simonmegglesakulimonitoringworkshopberlin2014" target="_blank">Simon Meggle - Open Source End2End Monitoring with Sakuli and Nagios </a> </strong> from <strong><a href="http://www.slideshare.net/simmerl121" target="_blank">simmerl121</a></strong></div>
&nbsp;