---
author: Gerhard Laußer
date: '2010-12-20T18:56:53+00:00'
slug: verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten
tags:
- check_db2_health
title: Verkürzen der Ausgabe von check_oracle_health und Konsorten
---

Überwacht man mit check_oracle_health den Füllgrad von Tablespaces einer Oracle-Datenbank, so werden in der Ausgabe des Plugins grundsätzlich alle Tablespaces aufgeführt. Dabei spielt es keine Rolle, ob ein Tablespace genügend freien Speicherplatz hat oder bereits zu voll ist. Dies hatte in der Vergangenheit zur Folge, daß die Ausgabe bei großen Datenbanken mit vielen Tablespaces sehr, sehr lang war und somit in der Web-Oberfläche von Nagios etwas unübersichtlich erschien. Mit den neuesten Releases von check_oracle_health, check_db2_health, check_mysql_health und check_mssql_health ist es nun möglich, nur noch diejenigen Tablespaces/Datenbanken anzeigen zu lassen, die voller sind als es die Schwellwerte erlauben.
<!--more-->
Dazu wurde eine neuer Kommandozeilenparameter *&minus;&minus;report* eingeführt, welcher die Argumente *short*, *long* und *html* annehmen kann.
Der Defaultwert ist *long*, damit verhalten sich die Plugins wie in den vorherigen Releases. Folgende Screenshots sollen illustrieren, wie sich der neue Parameter auswirkt:

* **−−report long, Status OK**  
Sämtliche Tablespaces werden angezeigt, alle haben noch genug freien Speicherplatz. Diese lange Zeile wird von manchen Anwendern als störend empfunden.
<img class="img-responsive" src="/assets/2010-12-20-verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten/dbreportlongok.png">

* **−−report long, Status CRITICAL**  
Tritt nun ein Fehler auf, d.h. der freie Speicherplatz eines oder mehrerer Tablespaces fällt unter den Warning- oder Critical-Schwellwert, dann werden zwar der/die betroffenen Tablespaces als Erste in der Liste angezeigt, die Zeile ist aber immer noch sehr lang. Dies wurde häufig bemängelt. Außerdem ist es ohne einen Blick auf die Prozentwerte und ohne Kenntnis der Schwellwerte nicht möglich zu sagen, welche Tablespaces nun genau betroffen sind. Es könnte nur der erste, aber genausogut die ersten drei sein. Werden Notifications per SMS versandt, so kann diese Zeile zu lang sein und abgeschnitten werden.  
<img class="img-responsive" src="/assets/2010-12-20-verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten/dbreportlongcrit.png">

* **−−report short, Status OK**  
Mit der neuen Option **&minus;&minus;report short** wird einfach nur eine "*no-problems*"-Meldung ausgegeben, solange es keine Störung gibt. (Die Performancedaten sind davon nicht betroffen. Sie werden Nagios in voller Länge zur Verfügung gestellt)
<img class="img-responsive" src="/assets/2010-12-20-verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten/dbreportshortok.png">

* **−−report short, Status CRITICAL**  
Hier sieht man den Vorteil der neuen Option am deutlichsten: es werden ausschliesslich die fehlerhaften Tablespaces ausgegeben
<img class="img-responsive" src="/assets/2010-12-20-verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten/dbreportshortcrit.png">

* **−−report html, Status CRITICAL**  
Wer es bunt mag, kann auch **&minus;&minus;report html** angeben. Die erste Zeile der Ausgabe ist ebenfalls eine verkürzte Liste mit den fehlerhaften Tablespaces. Zusätzlich wird aber noch eine Übersicht über sämtliche Tablespaces in Form einer HTML-Tabelle ausgegeben, wobei die einzelnen Zeilen ihrer Kritikalität entsprechend eingefärbt wurden
<img class="img-responsive" src="/assets/2010-12-20-verkrzen-der-ausgabe-von-check_oracle_health-und-konsorten/dbreporthtmlcrit.png">