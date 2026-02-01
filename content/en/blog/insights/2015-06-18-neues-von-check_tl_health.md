---
layout: post
status: publish
title: Neues von check_tl_health
author: Gerhard Laußer
date: 2015-06-18 19:10:25+02:00
categories:
- Nagios
- OMD
tags:
- Nagios
- HP
- Quantum
- StorEver
- FlexStor
- i6000
---
Das Tape-Library-Plugin [check_tl_health](/docs/plugins/check_tl_health) kann mittlerweile die meisten Geräte überwachen, die bei unseren Kunden im Einsatz sind. Kommen neue Modellvarianten hinzu, so werden diese i.d.R. vom Plugin erkannt. Möglich ist dies, weil gängige MIBs wie QUANTUM-SMALL-TAPE-LIBRARY-MIB, SEMI-MIB, SL-HW-LIB-T950-MIB, UCD-SNMP-MIB, ADIC-INTELLIGENT-STORAGE-MIB, ADIC-INTELLIGENT-STORAGE-MIB, BDT-MIB, ... bereits enthalten sind. Durch Prüfen charakteristischer OIDs wird ermittelt, welche MIBs die zu überwachende Library implementiert hat, danach wird der entsprechende Zweig mit den spezifischen Abfragen ausgeführt.
<!--more-->
Seit dem letzten Release von [check_tl_health](/docs/plugins/check_tl_health) auf Labs wurden die Libraries **Quantum i6000** und **BDT FlexStorII** in die Liste der unterstützten Hardware aufgenommen. Durch die automatische Erkennung stehen die Chancen gut, daß auch das Monitoring "naher Verwandter" dieser Modelle auf Anhieb funktioniert.

**Die Implementierung des Laufwerkstyps BDT FlexStor II wurde von der Firma [pinguin AG](http://www.pinguin.ag), einem Unternehmen für agile Softwareentwicklung mit Sitz in Berlin, in Auftrag gegeben und somit gesponsort. Herzlichen Dank dafür!**

{% highlight bash %}
# So sieht's bei einem Quantum Scalar i6000 aus
#
$ check_tl_health --hostname 10.12.18.114 --community bs-snmp-733 \
    --mode hardware-health
OK - hardware working fine

$ check_tl_health --hostname 10.12.18.114 --community bs-snmp-733 \
    --mode hardware-health --verbose
I am a Linux MUC-TAPE-2-4 3.10.26 #1 SMP Wed Mar 21 15:50:38 MDT 2014 ppc
OK - hardware working fine
checking rassystems
connectivity has status good
control has status good
media has status good
drives has status good
powerAndCooling has status good
robotics has status good


# und jetzt ein BDT FlexStor II
#
$ check_tl_health --hostname 10.12.18.103 --community bs-snmp-733 \
    --mode hardware-health
OK - MUC-TAPE-8-1 status is ok, hardware working fine
{% endhighlight %}

