---
author: Gerhard Laußer
date: '2012-11-25T23:17:27+00:00'
slug: check_hpasm-unterstutzt-jetzt-proliant-gen8
tags:
- check_hpasm
title: check_hpasm unterstützt jetzt Proliant Gen8
---

Die neuen Proliant Gen8 scheinen seit September Einzug in die Rechenzentren zu halten. Damals erhielt ich die erste Mail, in der mir von unrealistischen Ergebnissen berichtet wurde. Anscheinend waren bei mehreren Temperatursensoren im Server Schwellwerte von -99 Grad registriert. Zumindest war das der Wert, den die Sensoren meldeten, wenn sie mit check_hpasm abfragt wurden.
<!--more-->
Mangels Zeit fiel mir nicht mehr ein, als den Anwendern zu raten, die betroffenen Sensoren mit dem Parameter --blacklist zu ignorieren.
Allerdings tauchte noch ein weiterer Fehler bei Gen8-Servern auf, der ein echter Showstopper war:

<pre>Use of uninitialized value in lc at ./check_hpasm line 3581.
Argument "\0\0\0\0\0\0" isn't numeric in numeric ne (!=) at ./check_hpasm line 477.
</pre>

Ein Kunde mit Supportvertrag spendierte mir die Zeit und ich konnte mir endlich genauer ansehen, was da los war. Der uninitialized-Fehler tritt auf, wenn das Eventlog eines Proliant gelesen wird und der Wert von EventUpdateTime aus binären Nullen anstatt eines Datumswertes besteht. Scheint ein Bug in der HP-Firmware zu sein. Den Zeitstempel rekonstruiere ich nun einfach aus den Zeiten benachbarter Events.
Was hat es nun mit den Minusgraden auf sich? Besagte Sensoren liefern realistische Temperaturwerte, dienen aber nicht dazu, bei einer Schwellwertverletzung den Server herunterzufahren oder die Leistung zu drosseln. Sie gehören zum neuen Feature <i>sea of sensors</i>. Damit wird ein 3D-Abbild der Temperaturverteilung im Server und sogar im ganzen Rechenzentrum erstellt. Es hilft dabei, überlastete Rechner zu identifizieren und die Workload gleichmässiger zu verteilen. Für check_hpasm bedeutet es schlichtweg, dass die Temperaturmesswerte solcher Sensoren nur noch als Performancedaten ausgegeben werden. Ein Vergleich mit Thresholds findet nicht mehr statt.
Das neue Release von check_hpasm heisst 4.6.3 und ist an gewohnter Stelle zu finden:
<a href="/docs/plugins/check_hpasm/">check_hpasm</a>