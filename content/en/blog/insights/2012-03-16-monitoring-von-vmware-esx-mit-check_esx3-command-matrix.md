---
author: Simon Meggle
date: '2012-03-16T17:57:54+00:00'
slug: monitoring-von-vmware-esx-mit-check_esx3-command-matrix
tags:
- esx
title: 'Monitoring von VMWare ESX mit check_esx3: "command matrix"'
---

Virtualisierung spart Kosten und Ressourcen, stellt aber hohe Ansprüche an Verwaltung und Monitoring. Die schwedische Firma <strong>op5</strong> entwickelte für ihr gleichnamiges Nagios-basierendes Produkt das Plugin <em>check_esx3</em>, welches ein umfassendes Monitoring von VMWare ESX-Umgebungen ermöglicht.

<!--more-->
Am 1.3.2012 war Christian Anton (op5) zu Gast im <a href="http://www.consol.de/open-source-monitoring/webcast-archiv/">ConSol-Webcast "ESX-Monitoring"</a>, worin er wertvolle Tipps zum Monitoring solcher Umgebungen gab. Zusammen mit Moderator Simon Meggle erklärte er die wichtigsten Messpunkte und Metriken, die sich mit check_esx3 abfragen lassen.

Die von ConSol entwickelte und am Ende des Webcasts vorgestellte <strong>"command matrix"</strong> für check_esx3 ist nun <a href="/assets/howtos/monitoring/check_esx3_command_matrix.pdf">online verfügbar</a>. Sie stellt die über 100 Sub-Commands des Plugins in ihrer Anwendbarkeit gegenüber, zeigt Möglichkeiten für Exclude-Patterns und erleichtert die Definition von Thresholds.

Ein hilfreicher Spickzettel für alle Administratoren, die bei der Überwachung ihrer VMWare-Umgebungen Nagios-kompatible Monitoringsysteme einsetzen.