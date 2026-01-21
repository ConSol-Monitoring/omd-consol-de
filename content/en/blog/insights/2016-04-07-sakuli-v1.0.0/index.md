---
author: Simon Meggle
date: '2016-04-07T16:00:00+02:00'
tags:
- e2e
title: Sakuli v1.0.0 stable release
---

<span style="float: right" width="45%"><img src="sakuli_logo_small.png" alt=""></span> "Sakuli", das Open-Source-Framework zum [automatisierten Testen von Applikationen](http://www.sakuli.org), ist vor kurzem in Version 1.0 erschienen. Ein kleiner Blick auf die zurückliegenden Änderungen.

<!--more-->

## Installationsassistent
Der **grafische Installer** vereinfacht die Installation eines Sakuli-Clients deutlich. Java 8 (JRE) ist die einzige Voraussetzung, um Sakuli auf Windows oder Linux zu installieren. Mit im Gepäck sind unter anderem der **Firefox Portable** (um die System-Browser unangetastet zu lassen) und eine Reihe von **Beispiel-Tests**, die als Funktionstest und Vorlage für eigene Tests dienen. Unter Windows empfohlene **Registry-Settings** (z.B. zur Deaktivierung von visueller Effekte, welche die Sikuli-Bilderkennung stören könnten) nimmt der Installer ebenfalls vor.

Am Ende der Installation können alle Parameter in einem XML-File gespeichert werden; folgende Installationen lassen sich damit parametrisieren und damit **headless** ausführen.

<span style="float: center"><img src="sakuli_installation.gif" alt="">

## Sakuli-Starter

Deutlich vereinfacht - und vor allem vereinheitlicht - hat sich der Aufruf von Sakuli-Tests, die bisherigen Shell- und Batchscripte für Linux und Windows sind obsolet. Der **generische Starter** `sakuli` startet einen Testlauf mit nur zwei Parametern ("run" + Suite-Pfad). Die übrigen Informationen werden aus den Property-Files gelesen, die entweder global, für den Suite-Ordner oder für die Suite speziell gelten.

`-preHook` und `-postHook` können als Startparameter angegeben werden, wenn vor und/oder nach dem Test weitere Aktionen ausgeführt werden sollen. In verteilten Umgebungen, in denen Sakuli-Tests in einem GIT-Repository vorgehalten werden, kann ein PreHook beispielsweise verwendet werden, um die Testdefinition noch vor dem Start **über GIT zu aktualisieren**.    

Während der Implementierung von Tests erweist sich der Parameter "loop" als praktisch: mit ihm kann ein Sakuli-Test in einer **Dauerschleife** ausgeführt werden (im Produktiv-Betrieb hingegen empfiehlt sich nach wie vor der Start per Task Scheduler bzw. cron).  

```text
$ sakuli
Generic Sakuli test starter.
2016 - The Sakuli team <sakuli@consol.de>
http://www.sakuli.org
https://github.com/ConSol/sakuli

Usage: sakuli[.exe] COMMAND ARGUMENT [OPTIONS]

       sakuli -help
       sakuli -version
       sakuli run <sakuli suite path> [OPTIONS]
       sakuli encrypt <secret> [OPTIONS]

Commands:
       run 	      <sakuli suite path>
       encrypt 	   <secret>

Options:
       -loop	     <seconds>	    Loop this suite, wait n seconds between
                                  executions, 0 means no loops (default: 0)
       -javaHome   <folder>       Java bin dir (overrides PATH)
       -javaOption <java option>  JVM option parameter, e.g. '-agentlib:...'
       -preHook    <programpath>  A program which will be executed before a
                                  suite run (can be added multiple times)
       -postHook   <programpath>  A program which will be executed after a
                                  suite run (can be added multiple times)
       -D 	       <JVM option>   JVM option to set a property at runtime,
                                  overrides file based properties
       -browser    <browser>      Browser for the test execution
                                  (default: Firefox)
       -interface  <interface>    Network interface card name, used by
                                  command 'encrypt' as salt
       -sahiHome   <folder>       Sahi installation folder
       -version                   Version info
       -help                      This help text
```

## neuer Forwarder: Icinga2-API

**Forwarder** transportieren die Ergebnisse von E2E-Tests an Systeme, die diese dann weiter verarbeiten. Zu den bisher zwei Forwardern [mod-Gearman](https://github.com/ConSol/sakuli/blob/master/docs/forwarder-gearman.md) (Monitoring-Systeme mit mod-gearman an Bord) und [database](https://github.com/ConSol/sakuli/blob/master/docs/forwarder-database.md) (Ablegen der Ergebnisse in einer Datenbank, von wo andere Systeme lesen) kommt nun [icinga2](https://github.com/ConSol/sakuli/blob/master/docs/forwarder-icinga2api.md) als dritter im Bunde. Mit ihm ist es möglich, E2E-Ergebnisse ähnlich wie beim gearman-Forwarder in Echtzeit an die **REST-Schnittstelle** von [Icinga2](http://icinga.org) zu übertragen (vorgestellt auf dem [Icinga Camp 2016](https://www.icinga.org/community/events/archive/2016-archive/icinga-camp-berlin/talks/#sm) in Berlin).

<span style="float: center"><img src="icinga_ok.png" alt="">

## Tutorial

Für Sakuli-Einsteiger gibt es nun ein [First-Steps-Tutorial](https://github.com/ConSol/sakuli/blob/master/docs/first-steps.md). Es wird gezeigt, wie mit den beiden Tools Sahi und Sikuli automatisierte Benutzeraktionen sowohl auf Webseiten, als auch nicht-Web-Inhalten ausgeführt werden können.

## Docker, Docker, Docker...

Die Ausführung von Sakuli in **Docker-Containern** ist kein wirklich neues Feature; an dieser Stelle sei aber erwähnt, dass natürlich auch die Docker-Images für [CentOS](https://hub.docker.com/r/consol/sakuli-centos-xfce/) und [Ubuntu](https://hub.docker.com/r/consol/sakuli-ubuntu-xfce/) mit der aktuellen Stable-Version aus dem master-Branch (Tag: latest) bestückt sind. Wer es noch etwas aktueller haben will, kann auch die mit "dev" getaggten Images verwenden.

## Wie wird Sakuli eingesetzt?

Die [LIDL Stiftung & Co. KG](http:/www.lidl.de) setzt Sakuli ein, um die Applikations-Performance stiftungs-/**europaweit** zu messen. Die Messsonden (Windows) werden mit einem auf LIDL angepassten Paket installiert und von zentraler Stelle aus mit stets aktuellen Testfällen versorgt. Ein **Thruk-Dashboard** visualisiert die Verfügbarkeit und Güte der Applikationen, wie Felix Winkemann (IT-Projektleiter International) auf dem ConSol-Event ["Von Monitoring bis Managed Service"](https://www.consol.de/it-services/news/details/von-monitoring-bis-managed-services-veranstaltung-am-03-maerz-2016-in-der-muenchner-allianz-arena/) am 3. März 2016 in der Allianz-Arena erklärte.

Auch die [pbb Deutsche Pfandbriefbank](http://pfandbriefbank.com/) hat Sakuli im Einsatz. Die europäische Spezialbank für die Immobilienfinanzierung und die öffentliche Investitionsfinanzierung sichert mit Sakuli die Qualität und Verfügbarkeit ihrer zentralen Anwendungen und IT-Services, darunter **SAP** und **Summit**.

Sakuli ist darüber hinaus nicht nur in Monitoring-Umgebungen einsetzbar, sondern eignet sich auch zur Integration in **Continuous-Integration-Systeme**. Folgendes Video zeigt, wie Sakuli den **Bestellprozess im Online-Portal** der [M-net Telekommunikations GmbH](http:/m-net.de) prüft:

{% youtube z3opwqqy3io %}

## Sneak Preview

Die nächste Stable-Version ermöglicht u.a. die Anzeige vergangener Screenshots samt Fehlermeldung in Thruk. Die Bilder können in einer **Lightbox** per Maus/Tastatur durchgeblättert werden:

<span style="float: center"><img src="screenshot_history.gif" alt="">

## Release history
siehe [GitHub](https://github.com/ConSol/sakuli/releases/)

## Download

[zum Download](https://labs.consol.de/sakuli/install/)