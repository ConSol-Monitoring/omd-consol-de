---
author: Gerhard Laußer
date: '2010-03-30T18:57:29+00:00'
excerpt: Es gibt mal wieder ein Update für check_hpasm, diesmal mit dem Schwerpunkt
  auf HP Bladesystems. Neu hinzugekommen ist die Überwachung von Sicherungen (Fuses)
  und Enclosure Managern. Ausserdem werden jetzt bei fehlerhaften Komponenten auch
  gleich die Spare-Part-Nummern angezeigt.
slug: neues-release-4-2-von-check_hpasm
tags:
- BladeCenter
title: Neues Release 4.2 von check_hpasm
---

<p>Es gibt mal wieder ein Update für check_hpasm, diesmal mit dem Schwerpunkt auf HP Bladesystems. Neu hinzugekommen ist die Überwachung von Sicherungen (Fuses) und Enclosure Managern. Ausserdem werden jetzt bei fehlerhaften Komponenten auch gleich die Spare-Part-Nummern angezeigt. </p> <!--more-->  <p>Ein Beispiel: </p>```text
check_hpasm --hostname blp121948
CRITICAL - power supply 1:1:6 is present, condition is failed (Ser: 2QGUD0AHLYY2JX, FW: ) (SparePartNum 500242-001), common enclosure c01 condition is degraded (Ser: GB3353DS6B, FW: 2.60) (SparePartNum 519345-001), power enclosure 1:1 'pwc1' condition is degraded, System: 'bladesystem c7000 enclosure g2', S/N: 'GB8953DS6B'
common enclosure c01 condition is degraded (Ser: GB3353DW6B, FW: 2.60)
fan 1:1:1 is present, location is 1, redundance is other, condition is ok
fan 1:1:10 is present, location is 10, redundance is other, condition is ok
fan 1:1:2 is present, location is 2, redundance is other, condition is ok
fan 1:1:3 is present, location is 3, redundance is other, condition is ok
fan 1:1:4 is present, location is 4, redundance is other, condition is ok
fan 1:1:5 is present, location is 5, redundance is other, condition is ok
fan 1:1:6 is present, location is 6, redundance is other, condition is ok
fan 1:1:7 is present, location is 7, redundance is other, condition is ok
fan 1:1:8 is present, location is 8, redundance is other, condition is ok
fan 1:1:9 is present, location is 9, redundance is other, condition is ok
power enclosure 1:1 'pwc1' condition is degraded
power supply 1:1:1 is present, condition is ok (Ser: 5AGUFSAHLY2AJJ, FW: )
power supply 1:1:2 is present, condition is ok (Ser: 5AGUFSAHLY2AJH, FW: )
power supply 1:1:4 is present, condition is ok (Ser: 5AGUFSAHLY2AJF, FW: )
power supply 1:1:5 is present, condition is ok (Ser: 5AGUFSAHLY2AJM, FW: )
power supply 1:1:6 is present, condition is failed (Ser: 5AGUFSAHLY72AJX, FW: )
power supply 1:1:6 status is generalFailure, inp.line status is linePowerLoss
net connector 1:1:1 is present, model is HP HP VC Flex-10 Enet Module (Ser: TW1238008G, FW: )
net connector 1:1:2 is present, model is HP HP VC Flex-10 Enet Module (Ser: TW1238008H, FW: )
net connector 1:1:3 is present, model is HP HP VC 8Gb 20-Port FC Module (Ser: MY54350107, FW: )
net connector 1:1:4 is present, model is HP HP VC 8Gb 20-Port FC Module (Ser: MY54370011, FW: )
server blade 1:1:1 'BLADENR1' is present, status is value_unknown, powered is value_unknown
```
<p>Auch Temperaturen werden jetzt abgefragt, allerdings ist mir noch kein einziges BladeSystem unter die Finger gekommen, bei dem dieser Teil der CPQRACK-MIB implementiert wurde. Falls jemand von seiner Maschine eine Antwort auf folgende Anfrage bekommt, möge er sich bei mir melden. </p>```text
snmpwalk .... 1.3.6.1.4.1.232.6.2.6.8.1
```
<p>Ich wäre sehr an einem kompletten snmpwalk-Output (1.3.6.1.4.1.232) interessiert.</p>
<p> Ein weiterer Wermutstropfen ist der Wert "value_unknown" in der letzten Zeile der obigen Ausgabe. Auch die Tabelle CpqRackServerBladeEntry der CPQRACK-MIB wurde wohl nur teilweise implementiert, zumindest bei den Systemen, die mir bekannt sind. Sie ist folgendermassen aufgebaut:</p>```text
CpqRackServerBladeEntry ::= SEQUENCE {
        cpqRackServerBladeRack               INTEGER,
        cpqRackServerBladeChassis            INTEGER,
        cpqRackServerBladeIndex              INTEGER,
        cpqRackServerBladeName               DisplayString,
        cpqRackServerBladeEnclosureName      DisplayString,
        cpqRackServerBladePartNumber         DisplayString,
        cpqRackServerBladeSparePartNumber    DisplayString,
        cpqRackServerBladePosition           INTEGER,
        cpqRackServerBladeHeight             INTEGER,
        cpqRackServerBladeWidth              INTEGER,
        cpqRackServerBladeDepth              INTEGER,
        cpqRackServerBladePresent            INTEGER,
        cpqRackServerBladeHasFuses           INTEGER,
        cpqRackServerBladeEnclosureSerialNum DisplayString,
        cpqRackServerBladeSlotsUsed          INTEGER,
        cpqRackServerBladeSerialNum          DisplayString,
        cpqRackServerBladeProductId          DisplayString,
        cpqRackServerBladeUid                DisplayString,
        cpqRackServerBladeSlotsUsedX         INTEGER,
        cpqRackServerBladeSlotsUsedY         INTEGER,
&lt;-----------------------------------------------------------------&gt;
        cpqRackServerBladeStatus             INTEGER,
        cpqRackServerBladeFaultMajor         INTEGER,
        cpqRackServerBladeFaultMinor         INTEGER,
        cpqRackServerBladeFaultDiagnosticString  DisplayString,
        cpqRackServerBladePowered            INTEGER,
        cpqRackServerBladeUIDState                          INTEGER,
        cpqRackServerBladeSystemBIOSRevision                DisplayString,
        cpqRackServerBladeSystemBIOSFlashingStatus          INTEGER,
        cpqRackServerBladeHasManagementDevice               INTEGER,
        cpqRackServerBladeManagementDeviceFirmwareRevision        DisplayString,
        cpqRackServerBladeManagementDeviceFirmwareFlashingStatus  INTEGER,
        cpqRackServerBladeDiagnosticAdaptorPresence               INTEGER,
        cpqRackServerBladeASREnabled                              INTEGER,
        cpqRackServerBladeFrontIOBlankingModeStatus               INTEGER,
        cpqRackServerBladePOSTStatus                              INTEGER,
        cpqRackServerBladePXEBootModeStatus                       INTEGER,
        cpqRackServerBladePendingBootOrderChange                  INTEGER
    }
```
<p>Leider bekommt man keine Antwort, wenn man die OIDs der Einträge unterhalb der gestrichelten Linie abfragt. Dabei wären gerade die für das Monitoring besonders interessant. Vielleicht möchte ja der eine oder andere mal bei HP nachfragen, weshalb die Systeme den Wert von z.B. cpqRackServerBladeStatus nicht rausrücken.</p>

Sollte jemand dennoch von seinem BladeSystem eine Antwort auf
```text
snmpwalk .... 1.3.6.1.4.1.232.22.2.4.1.1.1.21
```
entlocken können, würde ich mich auch hier über einen vollständigen snmpwalk-Dump freuen.