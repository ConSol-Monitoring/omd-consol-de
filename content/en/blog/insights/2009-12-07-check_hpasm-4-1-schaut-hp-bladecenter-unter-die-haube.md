---
author: Gerhard Laußer
date: '2009-12-07T20:14:30+00:00'
slug: check_hpasm-4-1-schaut-hp-bladecenter-unter-die-haube
tags:
- Blade
title: check_hpasm 4.1 schaut HP BladeCenter unter die Haube
---

<p>Das neueste Release von check_hpasm ermittelt jetzt nicht mehr nur den globalen Status der cpqRack-MIB eines BladeCenters, sondern liest die wichtigsten Tabellen detailliert aus. Aufgerufen mit -v liefert check_hpasm eine Übersicht der verbauten Komponenten samt deren Status. Und so sieht das dann aus:</p> <!--more-->  ```text
check_hpasm --192.168.29.174 -v
OK - System: 'bladesystem c7000 enclosure', S/N: 'GB5826CG32', hardware working fine
common enclosure ENC_A condition is ok
fan 1:1:1 is present, location is 1, redundance is other
fan 1:1:10 is present, location is 10, redundance is other
fan 1:1:2 is present, location is 2, redundance is other
fan 1:1:3 is present, location is 3, redundance is other
fan 1:1:4 is present, location is 4, redundance is other
fan 1:1:5 is present, location is 5, redundance is other
fan 1:1:6 is present, location is 6, redundance is other
fan 1:1:7 is present, location is 7, redundance is other
fan 1:1:8 is present, location is 8, redundance is other
fan 1:1:9 is present, location is 9, redundance is other
power enclosure ENC_A condition is ok
power supply 1:1:1 is present, condition is ok
power supply 1:1:2 is present, condition is ok
power supply 1:1:3 is present, condition is ok
power supply 1:1:4 is present, condition is ok
power supply 1:1:5 is present, condition is ok
power supply 1:1:6 is present, condition is ok
net connector 1:1:1 is present, model is HP HP 1/10Gb VC-Enet Module
net connector 1:1:2 is present, model is HP HP 1/10Gb VC-Enet Module
net connector 1:1:3 is present, model is HP HP 4Gb VC-FC Module
net connector 1:1:4 is present, model is HP HP 4Gb VC-FC Module
net connector 1:1:5 is present, model is Cisco Systems, Inc. Cisco Catalyst Blade Switch 3020 for HP
net connector 1:1:6 is present, model is Cisco Systems, Inc. Cisco Catalyst Blade Switch 3020 for HP
server blade SRV_03 is present, status is ok, powered is on
server blade SRV_13 is present, status is ok, powered is on
server blade SRV_18 is present, status is ok, powered is on
server blade SRV_98 is present, status is ok, powered is on
server blade SRV_91 is present, status is ok, powered is on
server blade SRV_14 is present, status is ok, powered is on
server blade SRV_17 is present, status is ok, powered is on
server blade SRV_12 is present, status is ok, powered is on
server blade SRV_11 is present, status is ok, powered is on
server blade SRV_10 is present, status is ok, powered is on
server blade SRV_97 is present, status is ok, powered is on
```

<p>Einen Wermutstropfen gibt es leider...manche Systeme liefern keinen Status für die einzelnen Serverblades. Die Ausgabe sieht dann so aus:</p>

```text
server blade FK82S9 is present, status is value_unknown, powered is value_unknown
```

<p>Ein Firmwareupdate könnte da eventuell helfen.</p>