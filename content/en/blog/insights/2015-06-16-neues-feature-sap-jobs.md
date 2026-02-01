---
author: Gerhard Laußer
date: '2015-06-16'
tags:
- Nagios
title: Monitoring von Background-Jobs in SAP
---

Beim Monitoring von SAP mit [check_sap_health]({{ page.language_prefix }}/docs/plugins/check_sap_health) wurden bisher die Bereiche CCMS, Verbuchungssystem und Shortdumps abgedeckt. Mit der neuen Version können nun auch Hintergrundjobs überwacht werden. Folgende Anforderungen wurden implementiert:

* check_sap_health soll Jobs melden, welche einen fehlerhaften Status haben. Würde man in SM37 nachschauen, dann würde man bei diese(n) Job(s) den Status *aborted* angezeigt bekommen
* Defaultmäßig interessiert sich das Plugin nur für die vergangenen 60 Minuten, also die Jobs die in der letzten Stunde fertig geworden (oder abgebrochen) sind. Eine andere Zeitspanne ist einstellbar (so gibt es das auch beim Shortdump-Check).  Dadurch hat der Service bei einem üblichen 5-Minuten-Check-1-Minute-Retry-Intervall die Gelegenheit, kritisch zu werden und eine Notification zu verschicken und nach kurzer Zeit wieder grün zu werden.
* Die Sicht des Plugins kann mit Hilfe des Parameters \-\-name auch auf bestimmte Jobs eingegrenzt werden. Es interessiert sich dann ausschließlich für Jobs dieses Namens. Damit lassen sich eigene Services einrichten, die speziell die Jobs bestimmter Applikationen bzw. des Systeme überwachen.
* Bei allen Jobs, die in den letzten 30 Minuten fertig geworden sind, wird die Laufzeit mit vorgegebenen Schwellwerten verglichen. (\-\-warning/critical). Bei Überschreitung gibt es Alarm. Die Laufzeit wird als *\<jobname>_runtime=...* in den Performancedaten auftauchen.

<!--more-->
**Die Entwicklung der neuen Features wurde von der Firma [XIT-cross information technologies GmbH](http://crossit.at), einem SAP Beratungsunternehmen mit Sitz in Wien, in Auftrag gegeben und somit gesponsort. Herzlichen Dank dafür!**

Zunächst kann man sich mit **\--mode list-jobs** einen Überblick verschaffen, welche Jobs existieren bzw. im lookback-Intervall gelaufen sind.
Ich habe als User SAP* einen Job CROSSIT, der alle zehn Minuten läuft:

```bash
$ check_sap_health --ashost 10.0.12.210 --sysnr 42 --group PUBLIC \
    --username 'SAP*' --password grklxnrk \
    --mode list-jobs --lookback 3600
SAP*         CROSSIT                          24.03.2015 19:32:37    4   25 F
SAP*         CROSSIT                          24.03.2015 19:42:37   32   25 F
SAP*         CROSSIT                          24.03.2015 19:52:37   31   25 F
SAP*         CROSSIT                          24.03.2015 20:02:37    9   25 F
SAP*         EU_REORG                         24.03.2015 20:10:22   16   22 F
SAP*         CROSSIT                          24.03.2015 20:12:37    7   25 F
SAP*         CROSSIT                          24.03.2015 20:22:37   26   25 F
OK
```
\-\-lookback 3600 zeigt mir alle Läufe der vergangenen Stunde. Die Spalten sind: User, Jobname, Enddate+Endtime, Runtime, Delay, Status. (Sie werden der Tabelle TBTCO entnommen)

Für die Überwachung gibt es die Modi

* *--mode failed-jobs*
  womit geprüft wird, ob es unter den Jobs, welche in der letzten Stunde liefen (Das ist der Defaultwert, mit \-\-lookback &lt;sekunden> kann der Blick in die Vergangenheit länger oder kürzer werden), solche mit Endestatus **A**, also **ABORTED**, gab.
* *--mode exceeded-failed-jobs*
  womit zusätzlich zum Endestatus der Jobs auch deren Laufzeit auf Überschreitung eines Schwellwerts geprüft wird.

```bash
$ check_sap_health --ashost 10.0.12.210 --sysnr 42 --group PUBLIC \
    --username 'SAP*' --password grklxnrk \
    --mode exceeded-failed-jobs --lookback 3600 \
    --warning 20
WARNING - job CROSSIT of user SAP* ran for 26s | 'SAP*_CROSSIT_runtime'=26s;20;300;;
```

Die Defaultschwellwerte für die maximale Laufzeit sind 60s und 300s. Dies kann man mit \-\-warning und \-\-critical ändern. Falls einzelne Jobs jeweils ihre ganz eigenen Schwellwerte haben sollen, dann schreibt man:

```bash
--warningx 'benutzername_jobname_runtime'=schwellwert \
--criticalx 'benutzername_jobname_runtime'=schwellwert
```
(wobei *benutzername_jobname_runtime* das Label des entspr. Performancedatums ist)

Weiterhin sind die folgenden Kommandozeilenparameter von Bedeutung:

* *--lookback \<anzahl sekunden>*
  Normalerweise werden nur die Jobs betrachtet, die seit dem letzten Lauf von check_sap_health fertig geworden sind. Da das jedesmal andere sind und ein failed-Zustand eines Jobs dadurch nur ein einziges mal sichtbar ist, müsste man den Service dazu mit *max_check_attempts=1* und *is_volatile=1* konfigurieren.  Mit \-\-lookback=1800 sorgt man dafür, daß immer die vergangene halbe Stunde betrachtet wird. Damit kann man dann die normalen check_attempts verwenden.
* *--name \<job-name>*
  Damit pickt man einen ganz bestimmten Job heraus. Fügt man noch \-\-regexp dazu, dann kann man auch einen regulären Ausdruck angeben.
* *--name2 \<benutzer>*
  Da es möglich ist, daß unterschiedliche Benutzer gleichnamige Jobs haben, kann man hier noch weiter eingrenzen.
* *--unique*
  Ob man \-\-lookback verwendet oder nicht, es kann in jedem Fall vorkommen, daß der gleiche Job im untersuchten Zeitraum mehrmals gelaufen ist. Bewertet werden sie alle. D.h. das Plugin endet mit CRITICAL, wenn der vorletzte oder vorvorletzte Lauf eines Jobs abgebrochen ist. Gleiches gilt für Laufzeitüberschreitungen. So kann es vorkommen, daß ein Job mehrmals in der Plugin-Ausgabe vorkommt. Mit \-\-unique gibt es keine Mehrfachnennungen mehr. Es wird von Haus aus nur der letzte Lauf eines Jobs (genauer gesagt: die Kombination aus Jobname und Benutzername) betrachtet, sei es hinsichtlich Status oder Laufzeit.

Wenn ich einen Job überwachen will, der jede halbe Stunde läuft, dann würde ich \-\-lookback auf 1800 stellen. So bleibt der letzte Lauf immer im Blick.