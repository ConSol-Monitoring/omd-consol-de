---
author: Gerhard Laußer
date: '2016-07-22'
summary: null
tags:
- Nagios
title: IDoc-Monitoring mit check_sap_health
---

IDoc ist das Austauschformat von SAP ERP-Systemen, welches benutzt wird, um per Import und Export Daten sowohl untereinander als auch mit Fremdsystemen auszutauschen. Typische Beispiele solcher Daten sind Bestellungen, Lieferscheine, Überweisungen, Stundenbuchungen, etc. Ein IDoc besitzt neben Control- und Data-Records auch Status-Records, in denen jeder einzelne Verarbeitungsschritt protokolliert wird. Diese Status-Records werden in der Tabelle *EDIDS* gespeichert. Die neue Version 1.9 von [check_sap_health](/docs/plugins/check_sap_health/index.html) kennt den Mode *failed-idocs*, mit dem in *EDIDS* nach Fehlermeldungen gesucht wird. 
<!--more-->
Dabei wird der Zeitraum der letzten Stunde betrachtet. Will man den CRITICAL-Status länger aufrecht erhalten, so kann man mit \--lookback <Sekunden> die Suche nach Fehlern (Status *E* oder *W*) in den Status-Records weiter in die Vergangenheit ausdehnen.
```bash
$ check_sap_health --mode failed-idocs
OK - idoc 0000000000143130 has status "Data passed to port OK" (Information) at Tue Jun  7 05:02:42 2016, idoc 0000000000143131 has status "Data passed to port OK" (Information) at Tue Jun  7 05:02:42 2016, idoc 0000000000143132 has status "IDoc generated" (Information) at Tue Jun  7 05:02:48 2016

$ check_sap_health --mode failed-idocs --report short
OK - no idoc problems

$ check_sap_health --mode failed-idocs --report short
CRITICAL - idoc 0000000000143133 has status "Error passing data to port" (Error) at Tue Jun  7 05:08:11 2016
```

Ebenfalls neu ist der Modus *count-processes*, mit dem die Anzahl laufender Workprozesse der Typen DIA, UPD, UP2, BGD, ENQ und SPO (mit Hilfe des Funktionsaufrufs *TH_WPINFO*) ausgelesen werden. Defaultmäßig wird ein CRITICAL zurückgegeben, wenn kein Prozess eines Typs mehr läuft. Mittels geeigneter Schwellwerte kann man aber auch so etwas wie "WARNING, wenn weniger als einer oder mehr als neunzig, CRITICAL, wenn mehr als hundert Prozesse laufen" implementieren.
```bash
$ check_sap_health --mode count-processes
OK - 4 DIA processes, 1 UPD process, 1 UP2 process, 2 BGD processes, 1 ENQ process, 1 SPO process | 'num_dia'=4;1:;1:;; 'num_upd'=1;1:;1:;; 'num_up2'=1;1:;1:;; 'num_bgd'=2;1:;1:;; 'num_enq'=1;1:;1:;; 'num_spo'=1;1:;1:;;

$ check_sap_health --mode count-processes --warningx num_dia=10: --criticalx num_dia=:3
WARNING - 4 DIA processes, 1 UPD process, 1 UP2 process, 2 BGD processes, 1 ENQ process, 1 SPO process | 'num_dia'=4;10:;:3;; 'num_upd'=1;1:;1:;; 'num_up2'=1;1:;1:;; 'num_bgd'=2;1:;1:;; 'num_enq'=1;1:;1:;; 'num_spo'=1;1:;1:;;
```