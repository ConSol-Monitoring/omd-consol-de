---
author: Gerhard Laußer
date: '2013-09-20T20:59:51+00:00'
slug: omd-1-00-raspberry-pi-ist-fertig
tags:
- arm
title: OMD-1.00 für Raspberry Pi ist fertig
---

<p>Lange hat’s gedauert, aber seit heute kann man sich das Debian-Paket für <a href="http://omdistro.org" target="_blank">OMD-1.00</a> vom <a href="https://labs.consol.de/repo/" target="_blank">ConSol-Labs-Repository</a> herunterladen.</p>  <div class="listingblock">   <div class="content">     <pre>root@raspberrypi:~# apt-get install omd-1.00</pre>
  </div>
</div>

<p>Die Maschinen unserer Kunden, auf denen wir uns tagtäglich bewegen und Monitoring-Systeme betreiben, haben üblicherweise CPUs und Gigabytes im zweistelligen Bereich. Da wird es schon zur Geduldsprobe, wenn ein Build auf dem Raspberry Pi den halben Tag braucht. Ein ARM11 ist eben kein Xeon und SD ist nicht SSD. </p><!--more--><p>Ein <a href="http://www.hardkernel.com/renewal_2011/products/prdt_info.php?g_code=G137510300620" target="_blank">Odroid-XU</a>, den ich letzte Woche bekommen habe, hat mir sehr geholfen. Mit seinen 8 Cores (wobei 4 stromsparende, langsame Cores und 4 stromfressende, schnelle Cores sich die Arbeit je nach Lastprofil teilen) dauert es keine zwei Stunden, OMD zu kompilieren. (Kostet an die 100€, ist aber eine Rakete im Vergleich zum Raspberry und stemmt 1000 Services incl. PNP mit 5/1er-Checkintervall mit &lt; 1s Latency). Er wird künftig unsere Build-Maschine für die Nightly-Releases werden. Auf dem Raspberry laufen dann nur die abschliessenden Tests.</p>

<p><a href="/assets/2013-09-20-omd-1-00-raspberry-pi-ist-fertig/raspberrypiodroidxuomd.png"><img title="raspberry-pi-odroid-xu-omd-" style="border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px; display: inline" border="0" alt="raspberry-pi-odroid-xu-omd-" src="/assets/2013-09-20-omd-1-00-raspberry-pi-ist-fertig/raspberrypiodroidxuomd_thumb.png" width="244" height="184" /></a></p>