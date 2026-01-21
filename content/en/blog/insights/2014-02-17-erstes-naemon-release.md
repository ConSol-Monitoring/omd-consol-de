---
author: Sven Nierlein
date: '2014-02-17T13:27:12+00:00'
slug: erstes-naemon-release
tags:
- monitoring
title: Erstes Naemon Release
---

Der als Nagios 4 Nachfolger angetretene Fork "Naemon" veröffentlichte heute sein erstes Stable Release mit der Nummer 0.8.0.
Aber was macht Naemon nun besser als Nagios?<!--more-->

<h2>Was ist neu?</h2>
<ul>
  <li>Performanceoptimiert durch Worker Modell</li>
  <li>CGIs durch Thruk ersetzt</li>
  <li>Einfache Installation durch Standard Pakete</li>
  <li>Freies Community Projekt</li>
  <li>Aktiv weiterentwickelt</li>
  <li>Sinnvolle Standards, z.b. Logrotate</li>
</ul>

<h2>Stabil?</h2>
<p>
Sieht man sich die aktuelle an <a href="http://www.naemon.org/documentation/developer/bugs/">Übersicht der offenen Nagios Bugs</a> sieht man schnell warum viele noch von Nagios 4 abraten. Umso schöner allerdings ist zu sehen, dass die Naemon Entwickler hier bereits vieles gefixt haben. Ein Großteil der offenen Issues und Security Advisoris in Nagios beziehen sich auf die CGIs. Hier hat sich Naemon aus der Affäre gezogen indem sie die schwer wartbaren C CGIs durch Thruk ersetzt haben.
</p>

<p>
Da Naemon durch den ehemaligen Hauptentwickler von Nagios 4 gegründet wurde, fängt Naemon nicht bei 0 an, sondern macht genau an der Stelle weiter, an der Nagios aufgehört hat. Das begründet auch die Versionsnummer 0.8, welche schon sehr nah an der 1.0 ist.
</p>

<p>
Mit Travis wendet Naemon die Prinzipien der Continuous Integration an und somit lassen sich sehr schnell Fehler entdecken und damit natürlich auch schneller beheben. Daneben werden auf den Consol Build Servern täglich neue Pakete für die wichtigsten Linux Systeme erstellt. Zum einen gibt das Testern die Möglichkeit schnell aktuelle Versionen zu überprüfen, hilft aber auch eher seltene Problem im
Zusammenspiel mit speziellen Linux Systemen zu finden bevor der Enduser dies im Produktivbetrieb feststellt.
Letztlich führt beides zu einer besseren Code Qualität welche gerade bei einem Monitoring Projekt sehr wichtig ist.
</p>

<h2>Frei?</h2>
<p>
Politischen Querelen will Naemon direkt vermeiden und wird daher als Non-Profit-Organization (NPO) geführt. Naemon zeigt somit seine Unabhängigkeit. Zudem wird somit verhindert, dass OpenSource Projekte am Ende nicht doch wieder als Enterprise/Premium/OpenCore oder sonstwie halbherzig enden.
</p>


<h2>Download</h2>
<p>
Downloads und weitere Informationen sind auf der Naemon Website selbst: <a href="http://www.naemon.org">www.naemon.org</a>
</p>

<h2>Fazit</h2>
<p>
Mit Naemon kommt wieder Schwung in den Monitoringmarkt. Naemon entpuppt sich als echte Alternative zu Nagios 4.
</p>


<br><br>