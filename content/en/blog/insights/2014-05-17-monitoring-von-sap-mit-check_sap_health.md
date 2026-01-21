---
author: Gerhard Laußer
date: '2014-05-17T00:30:31+00:00'
slug: monitoring-von-sap-mit-check_sap_health
tags:
- bapi
title: Monitoring von SAP mit check_sap_health
---

Monitoring von SAP mit den bisher vorhandenen Plugins beschränkte sich auf die Abfrage von CCMS-Metriken. In einem SAP-System steckt aber noch viel mehr, das sich überwachen lässt. Check_sap_health ist ein neues Plugin, welches in Perl geschrieben wurde. Es entstand in einem Projekt, bei dem von unterschiedlichen Standorten aus die Laufzeiten von BAPI-Aufrufen gemessen werden sollten. Durch die einfache Erweiterung des Plugins um selbstgeschriebene Perl-Elemente lassen sich beliebige Funktionen per RFC aufrufen und somit firmenspezifische Logik implementieren.

<!--more-->


Hier sind die Folien des Vortrags, den ich auf dem 2014er Workshop der <a href="http://monitoring-portal.de" target="_blank">Open-Source-Monitoring-Community</a> in Berlin gehalten habe.

<iframe type="opt-in" data-name="youtube" data-src="http://www.slideshare.net/slideshow/embed_code/34785583?rel=0" width="597" height="486" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; margin-left:22px;max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px;margin-left:22px;"> <strong> <a href="https://de.slideshare.net/lausser/monitoring-von-sap-mit-checksaphealth" title="Monitoring von SAP mit check_sap_health" target="_blank">Monitoring von SAP mit check_sap_health</a> </strong> from <strong><a href="http://www.slideshare.net/lausser" target="_blank">lausser</a></strong> </div>