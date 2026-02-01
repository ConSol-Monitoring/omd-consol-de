---
author: Gerhard Laußer
date: '2013-06-02T18:29:09+00:00'
slug: meine-fritzdect-200-sind-endlich-da
tags:
- avm
title: Meine FRITZ!DECT 200 sind endlich da!
---

<p><a href="fritzdect200-small.jpg"><img title="fritzdect200-small" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; margin: 3px 20px 7px; display: inline; padding-right: 0px; border-top-width: 0px" border="0" alt="fritzdect200-small" src="fritzdect200-small_thumb.jpg" width="226" height="244" /></a>Im Februar bestellt und in der letzten Mai-Woche eingetroffen. Die intelligenten Steckdosen von AVM scheinen heiss begehrt zu sein. Jedenfalls kann ich jetzt über meine FRITZ!BOX aufzeichnen, wieviel Strom gewisse Geräte momentan oder aber über einen langen Zeitraum verbrauchen.     <br />Von Berufs wegen juckt's mich natürlich jedesmal in den Fingern, wenn irgendwo Messwerte anfallen. Mein Plugin check_nwc_health kann ja bereits CPU, Speicher und Interfaces einer FRITZ!BOX 7390 abfragen, also war klar, daß die Überwachung der FRITZ!DECT 200 bzw. des gemessenen Energieverbrauchs unbedingt dazugehört.</p>  <p>Die fünfte Ausgabe der <a href="http://www.youtube.com/watch?v=S6jogBPvfyo" target="_blank">ConSol Monitoring Minutes</a>, die sich mit diesem Thema befasst, ist heute ebenfalls entstanden.</p><!--more--><p>Die Kommunikation zwischen Plugin und Steckdose findet nicht direkt statt, sondern über die FRITZ!BOX. Man ruft check_nwc_health daher mit folgenden Kommandozeilenparametern auf:</p>  <div class="listingblock">   <div class="content">     <pre><tt>
$ check_nwc_health --hostname <i>fritz.box</i> --port 49000 --community <i>passwort</i> ....
</tt></pre>
  </div>
</div>

<p>In den folgenden Beispielen werden diese der Übersichtlichkeit halber weggelassen. Zunächst kann man prüfen, ob alle der FRITZ!BOX bekannten Smart-Home-Devices per DECT verbunden sind und ob sie Strom durchlassen:</p>

<div class="listingblock">
  <div class="content">
    <pre><tt>
$ check_nwc_health --mode smart-home-device-status
OK - device FRITZ!DECT 200 #1 WZ ok, device FRITZ!DECT 200 #2 ok

$ check_nwc_health --mode smart-home-device-status
CRITICAL - device FRITZ!DECT 200 #1 WZ is not connected, device FRITZ!DECT 200 #2 ok

$ check_nwc_health --mode smart-home-device-status
CRITICAL - device FRITZ!DECT 200 #1 WZ is switched off, device FRITZ!DECT 200 #2 ok


$ check_nwc_health --mode smart-home-device-status --name 'FRITZ!DECT 200 #2'
OK - device FRITZ!DECT 200 #2 ok
</tt></pre>
  </div>
</div>

<p>
  <br />

  <br />Dann das wohl wichtigste neue Feature: die Messung des Energieverbrauchs der an einer Steckdose angeschlossenen Geräte. </p>

<div class="listingblock">
  <div class="content">
    <pre><tt>
OMD[consol]:~$ check_nwc_health --mode smart-home-device-energy --name 'FRITZ!DECT 200 #1 WZ'
OK - device FRITZ!DECT 200 #1 WZ consumes 38.83 watts at 222.46 volts | 'watt'=38.83;1760;1980 'watt_min'=32.25 'watt_max'=42.48 'volt'=222.46
</tt></pre>
  </div>
</div>

<p>
  <br />

  <br />und zuletzt die geschätzten Kilowattstunden pro Tag, Monat und Jahr, die beim derzeitigen Stromverbrauch anfallen werden.</p>

<div class="listingblock">
  <div class="content">
    <pre><tt>
OMD[consol]:~$ check_nwc_health --hostname 192.168.1.1 --port 49000 --community frotzbix --mode smart-home-device-consumption --name 'FRITZ!DECT 200 #1 WZ'
OK - FRITZ!DECT 200 #1 WZ consumes 0.15 kwh per day | 'kwh_day'=0.15;1000;1000 'kwh_month'=0.46 'kwh_year'=5.51
</tt></pre>
  </div>
</div>

<br />

<p>
  <br />

  <br />Etwas ausführlicher und anschaulicher wird all das in der fünften Ausgabe der ConSol Monitoring Minutes beschrieben. Viel Spass beim Anschauen! </p>

{{< youtube S6jogBPvfyo >}}