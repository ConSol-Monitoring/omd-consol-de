---
author: Gerhard Laußer
date: '2013-02-10T15:05:34+00:00'
slug: allesfresser-check_nwc_health-kriegt-nicht-genug
tags:
- blue coat
title: Allesfresser check_nwc_health kriegt nicht genug
---

<p>Consulting im Bereich Monitoring wird nie langweilig. Ständig wird man mit neuen Anforderungen konfrontiert, so wie vergangene Woche:</p>  <p><a href="http://www.bluecoat.de/products/sg/index.php" target="_blank">Blue Coat ProxyNG Appliances</a> sollten überwacht werden, genauer gesagt das Modell SG600. Diese Appliances finden Verwendung in Application Delivery Networks (ADN), wo sie für die performante Auslieferung von Geschäftsanwendungen und Schutz vor web-basierten Bedrohungen sorgen.     <br />Und jetzt zum Monitoring…</p><!--more--><p>Als erstes schauen wir uns den Speicherverbrauch an:</p>  <pre><tt>$ ./check_nwc_health --hostname bc-prox-2 --community public --mode memory-usage
OK - memory usage is 17.00% | 'memory_usage'=17%;75;90</tt></pre>

<p>Dann kommt die CPU:</p>

<pre><tt>$ ./check_nwc_health --hostname bc-prox-2 --community public --mode cpu-load
OK - cpu 1 usage is 18.00% | 'cpu_1_usage'=18%;80;90</tt></pre>

<p>Wie geht’s der Hardware? Sensoren und Festplatten:</p>

<pre><tt>$ ./check_nwc_health --hostname bc-prox-2 --community public --mode hardware-health
OK - environmental hardware working fine | 'sensor_Motherboard temperature 1'=18.70 'sensor_+12V bus voltage'=12.13 'sensor_CPU core voltage'=1.10 'sensor_CPU +1.8V bus voltage'=1.81 'sensor_Motherboard temperature 2'=20.50 'sensor_CPU temperature'=28 'sensor_System Fan 1 speed'=8280 'sensor_System Fan 2 speed'=8400 'sensor_System Fan 3 speed'=9764.80 'sensor_System Fan 4 speed'=8460 'sensor_+2.5Vbus voltage'=2.51 'sensor_+5V bus voltage'=5.07</tt></pre>

<p>Gab es eine ernstzunehmende Bedrohung während der letzten Stunde?</p>

<pre><tt>$ ./check_nwc_health --hostname bc-prox-2 --community public --mode security-status --lookback $((3600*24*2))
CRITICAL - Sat Feb&#160; 9 18:45:43 2013 Back_Door_Probe (TCP 3128) under-attack, 1 serious incidents (of 2)</tt></pre>

<p>Mit den Parameter –lookback gibt man an, wieviele Sekunden das Plugin in die Vergangenheit blicken soll, um security-relevante Incidents zu zählen. Der Defaultwert ist 3600, also eine Stunde. Im Beispiel habe ich den Wert 3600*24*2, also zwei Tage, gewählt, weil es aktuell keine Vorfälle gab. </p>

<p>Das Plugin gibts <a href="/de/nagios/check_nwc_health" target="_blank">hier...</a></p>