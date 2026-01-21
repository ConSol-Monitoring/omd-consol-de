---
author: Gerhard Laußer
date: '2013-09-10T19:15:12+00:00'
slug: offline-modus-fur-check_nwc_health
title: Offline-Modus für check_nwc_health
---

<h2 id="_offline_betrieb_von_check_nwc_health">Offline-Betrieb von check_nwc_health</h2>
<div class="paragraph"><p>Der eine oder andere check_nwc_health-Anwender dürfte <strong>--mode walk</strong> schon kennen. Damit kann man sich eine Liste von snmpwalk-Anweisungen ausgeben lassen, deren Resultat mir beim Debugging hilft.</p></div>

<!--more-->
<div class="sectionbody">
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode walk --hostname 172.23.60.28 --community public
rm -f /tmp/snmpwalk_check_nwc_health_172.23.60.28
snmpwalk -ObentU -v2c -c public 172.23.60.28 1.3.6.1.2.1 &gt;&gt; /tmp/snmpwalk_check_nwc_health_172.23.60.28
snmpwalk -ObentU -v2c -c public 172.23.60.28 1.3.6.1.4.1.9 &gt;&gt; /tmp/snmpwalk_check_nwc_health_172.23.60.28
snmpwalk -ObentU -v2c -c public 172.23.60.28 1.3.6.1.4.1.9.1 &gt;&gt; /tmp/snmpwalk_check_nwc_health_172.23.60.28
snmpwalk -ObentU -v2c -c public 172.23.60.28 1.3.6.1.4.1.9.2 &gt;&gt; /tmp/snmpwalk_check_nwc_health_172.23.60.28
...</tt></pre></div></div>
<div class="paragraph"><p>Die resultierende Datei snmpwalk_check_nwc_health_172.23.60.28 lade ich dann in einen SNMP-Simulator und kann damit rumexperimentieren, als hätte ich die Hardware des Anwenders hier bei mir rumstehen.
Was ich aber auch machen kann, ist:</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode cpu-load --snmpwalk /tmp/snmpwalk_check_nwc_health_172.23.60.28
OK - cpu 0 usage (5 min avg.) is 21.00% | 'cpu_0_usage'=21%;80;90</tt></pre></div></div>
<div class="paragraph"><p>Anstelle der Parameter <strong>--hostname</strong> und <strong>--community</strong> kann ich also <strong>--snmpwalk</strong> verwenden, um die benötigten OIDs aus einer Datei zu lesen.</p></div>
<div class="paragraph"><p>Dieses Feature setzen wir seit Neuestem jetzt auch bei einem Kunden ein. Das Problem war hier, dass einige SAN-Switches endlos lang brauchten, um SNMP-Requests zu beantworten. Dies führte immer wieder zu Timeouts und somit UNKNOWN-Fehlern.
Die Idee war daher, im Hintergrund und ohne Eile die Daten von den SNMP-Agenten zu holen und in eine Cache-Datei zu schreiben. Das Monitoring würde dann gegen diese Datei laufen.</p></div>
</div>
<h2 id="_einsammeln_der_oids">Einsammeln der OIDs</h2>
<div class="sectionbody">
<div class="paragraph"><p>Es gibt eine neue Kommandozeilenoption <strong>--offline</strong>, die check_nwc_health anweist, die snmpwalk-Befehle nicht auszugeben, sondern sie direkt auszuführen.</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode walk --hostname 172.23.60.28 --community public \
    --timeout 600 --offline
OK - all requested oids are in /tmp/snmpwalk_check_nwc_health_172.23.60.28</tt></pre></div></div>
<div class="paragraph"><p>In dieser Form aufgerufen, sammelt check_nwc_health haufenweise OIDs ein, zum Teil auch solche, die nicht benötigt werden. Das hat seinen Grund darin, dass check_nwc_health nicht nur die im abgefragten Gerät implementierten Mibs vorschlägt, sondern mehrere Mibs des betreffenden Herstellers.
Dies lässt sich vermeiden, indem man eine Liste von OIDs angibt:</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode walk --hostname 172.23.60.28 --community public \
    --timeout 600 --offline \
    --oids 1.3.6.1.2.1.2.2.1,1.3.6.1.2.1.1.1,1.3.6.1.2.1.1.3,1.3.6.1.4.1.9.9.109.1.1.1,1.3.6.1.4.1.9.9.305.1.1.2,1.3.6.1.4.1.9.9.91.1.1.1,1.3.6.1.4.1.9.9.91.1.2.1</tt></pre></div></div>
<div class="paragraph"><p>Damit schont man auch den SNMP-Agenten. Falls man in einer geclusterten
Umgebuung arbeitet, kann man mit Hilfe des Parameters <strong>--snmpwalk filename</strong>
die Datei auch auf einem gesharten Verzeichnis ablegen lassen.</p></div>
</div>
<h2 id="_cronjob_zum_einsammeln_der_oids">Cronjob zum Einsammeln der OIDs</h2>
<div class="sectionbody">
<div class="paragraph"><p>Wir wollen, dass automatisch snmpwalk-Dateien mit möglichst aktuellen Daten vorliegen. Dazu habe ich das Script <strong>local/bin/walk_sanswitches</strong> erstellt.</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>#! /bin/bash

# liste der devices
IPS="172.23.60.28 172.23.60.29"
# liste der tatsaechlich benoetigten tables
OIDS="1.3.6.1.2.1.2.2.1,1.3.6.1.2.1.1.1,1.3.6.1.2.1.1.3,1.3.6.1.4.1.9.9.109.1.1.1,1.3.6.1.4.1.9.9.305.1.1.2,1.3.6.1.4.1.9.9.91.1.1.1,1.3.6.1.4.1.9.9.91.1.2.1"

if [ -n "$1" ]; then
  $OMD_ROOT/local/lib/nagios/plugins/check_nwc_health --mode walk \
      --hostname $1 --community public \
      --timeout 600 --offline --oids $OIDS
else
  IFS=" "
  for ip in $IPS
  do
    # die geraete sollen parallel abgefragt werden
    nohup $0 $ip &gt;/dev/null 2&gt;&amp;1 &amp;
  done
fi</tt></pre></div></div>
<div class="paragraph"><p>In <strong>etc/cron.d/walk_sanswitches</strong> trägt man nun noch folgende Zeile ein:</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>*/2 * * * * $OMD_ROOT/local/bin/walk_sanswitches</tt></pre></div></div>
<div class="paragraph"><p>Wenn man jetzt mit <strong>omd restart crontab</strong> den Cron-Daemon durchstartet, werden alle zwei Minuten frische Daten von den San-Switches geholt.</p></div>
</div>
<h2 id="_monitoring_der_cache_dateien">Monitoring der Cache-Dateien</h2>
<div class="sectionbody">
<div class="paragraph"><p>Weiter oben steht der Aufruf von check_nwc_health mit dem Parameter <strong>--snmpwalk</strong>, für den produktiven Betrieb ist es aber unerlässlich, das Alter der Cache-Datei zu prüfen. Es könnte ja sein, dass die snmpwalks keine Verbindung bekommen und keine neuen Daten wegschreiben können. Daher kommt auch hier wieder der Parameter <strong>--offline</strong> ins Spiel. Mit seiner Hilfe gibt man an, wie alt die Cache-Datei maximal sein darf (in Sekunden).</p></div>
<div class="paragraph"><p>In diesem Beispiel liegt der letzte erfolgreiche Lauf von <strong>--mode walk</strong> länger als zwei Minuten zurück.</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode cpu-load \
    --snmpwalk /tmp/snmpwalk_check_nwc_health_172.23.60.28 --offline 120
UNKNOWN - snmpwalk file /tmp/snmpwalk_check_nwc_health_172.23.60.28 is too old</tt></pre></div></div>
<div class="paragraph"><p>Im Normalfall sieht es aber so aus:</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>check_nwc_health --mode cpu-load \
    --snmpwalk /tmp/snmpwalk_check_nwc_health_172.23.60.28 --offline 120
OK - cpu 0 usage (5 min avg.) is 26.00% | 'cpu_0_usage'=26%;80;90</tt></pre></div></div>
</div>
<h2 id="_verwendung_des_offline_modus_ohne_nderung_der_check_commands">Verwendung des Offline-Modus ohne Änderung der check_commands</h2>
<div class="sectionbody">
<div class="paragraph"><p>Normalerweise wird ja check_snmp_health mit <strong>--hostname</strong> und <strong>--community</strong> aufgerufen. Um die Abfragemethode mit der Cache-Datei zu verwenden, kann man <strong>--snmpwalk</strong> einfach an die Parameterliste dranhängen. <strong>--hostname</strong> und <strong>--community</strong> können dann zwar vorhanden sein, werden aber nicht mehr beachtet.
Eleganter ist es allerdings, das alte check_command weiterzuverwenden, also mit ausschliesslich <strong>--hostname</strong> und <strong>--community</strong> und den snmpwalk-Parameter per Environment zu übergeben.</p></div>
<div class="listingblock">
<div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
<pre><tt>NAGIOS__SERVICESNMPWALK=/tmp/snmpwalk_check_nwc_health_172.23.60.28 \
NAGIOS__SERVICEOFFLINE=120 \
check_nwc_health --mode cpu-load --hostname 172.23.60.28 --community public
UNKNOWN - snmpwalk file /tmp/snmpwalk_check_nwc_health_172.23.60.28 is too old</tt></pre></div></div>
<div class="paragraph"><p>Diese Environmentvariablen werden erzeugt, indem man den entspr. Servicedefinitionen die Custom-Macros <strong>_SNMPWALK</strong> und <strong>_OFFLINE</strong> hinzufügt.</p></div>
<div class="paragraph"><p>Den Offline-Modus von check_nwc_health kann man übrigens auch verwenden, um Netzwerkgeräte in strengstens abgeschotteten Netzsegmenten zu überwachen. Wenn noch nicht mal erlaubt ist, einen Mod-Gearman-Worker dort aufzustellen und
einen Port in der Firewall freizuschalten, kann man eventuell die
Cache-Dateien transferieren.</p></div>
</div>