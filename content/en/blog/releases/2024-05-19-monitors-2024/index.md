---
date: 2024-05-19T00:00:00.000Z
title: "Das war der Open-Source-Monitoring-Workshop 2024"
linkTitle: "Rueckblick Monitoring-WS 2024"
tags:
  - workshop
---
Der Open-Source-Monitoring-Workshop, der vergangene Woche in Neckarsulm stattfand, blickt auf eine lange Tradition zurück. Seit seiner Premiere, damals noch als Wochenendtreffen von Nagios-Anwendern, im Jahr 2005 wird er jährlich in einer anderen Stadt veranstaltet. Aufgrund Covid gab es jedoch eine vierjährige Unterbrechung, aber ab diesem Jahr wird der Workshop wieder regelmäßig stattfinden. Gastgeber der diesjährigen Veranstaltung war die Schwarz IT, ein Unternehmen der Schwarz Gruppe, dem Konzern, der hinter den bekannten Einzelhandelsketten Lidl und Kaufland steht.

Die Veranstaltung begann mit einer Begrüßung durch Timo Schumacher, der in seiner Präsentation Einblicke in die Schwarz Gruppe bot. Wachstums-, Mitarbeiter- und Geschäftszahlen unterstrichen die immense Bedeutung des Konzerns, der auch weitaus mehr als Supermärkte zu bieten hat.

Nach der Einführung folgte Simon Meggle, der das ROBOT Framework vorstellte. Dieses auf den ersten Blick unscheinbare Tool wird von einer beachtlichen Anzahl von Entwicklern getrieben und umfasst unzählige Module zur Testautomatisierung. Simon benutzt es, um Checkmk für End-to-End-Checks fit zu machen. Anschließend führte Frank Aigner von der Schwarz IT in das Thema "End-2-End-Webseiten-Monitoring" mit dem SPACE-Tool ein, das innerhalb der Schwarz Gruppe genutzt wird, um die Performance und Verfügbarkeit von Webseiten zu überwachen. Es basiert auf dem Framework Playwright von Microsoft und wurde mittels Containerisierung in die OMD-Landschaft integriert.

Nach einer kurzen Pause berichteten H. Bogner, S. Rauh und O. Gnapp über ihre Reise zum Aufbau eines Cloud-Observability-Services. Die drei gehören zum Geschäftsbereich StackIT, dem Cloud-Angebot von Schwarz. Mittel der Wahl beim Monitoring der Cloud und des physikalischen Unterbaus ist Prometheus.

Die darauf folgende Mittagspause verbrachten wir in der tolle Kantine von Lidl Digital. Vielen Dank nochmal dafür, daß wir eingeladen waren.

Gerhard Laußer gab einen Einblick in die Komponenten des Konfigurationsgenerators Coshsh. Tobias Kempf erzählte von der Implementierung von OMD Labs als Monitoring-Lösung für die Schwarz Gruppe und zeigte mit aktuellen Zahlen das immense Wachstum der Landschaft. Sven Nierlein schloss den Tag mit einem Vortrag über Windows-Monitoring mit SNClient+ ab. Dieses Tool schafft die Securityprobleme mit dem Vorgänger NSClient++ aus der Welt und hat auch in Sachen Features und Performance mehr zu bieten.

Der zweite Tag begann mit einer Übersicht über versteckte Kosten im IT-Monitoring. Martin Hirschvogel von Checkmk hatte hierfür das Kleingedruckte in den Preislisten der Cloud-Anbieter unter die Lupe genommen. Ingrida Tamošaitytė-Ehrig und Eduard Schander von Novatec setzten das Programm mit einem Vortrag über Application Performance Monitoring bei der VHV fort. Dieses basiert auf dem Tool InspectIT Ocelot, welches Java-Klassen automatisch instrumentiert.

Michael Kraus entwickelt Monitoring bei Witty, einem Hersteller von Schwimmbadtechnik. Er zeigte, wie Wartungsaufwände dank Telemetriedaten reduziert werden können. Anschließend fanden Lightning Talks statt, bei denen mehrere kurze, prägnante Präsentationen zu verschiedenen Monitoring-Themen gehalten wurden. Darunter war Marc Lückert aus der Schweiz, der mit Naemon und Prometheus die IT des Nahrungsmittelverarbeitungsmaschinenherstellers Bühler überwacht. Frank Aigner zeigte noch einmal das E2E-Monitoring der Schwarz Gruppe, speziell die Grafana-Dashboards.

Nach der Mittagspause gab Matthias Gallinger einen Überblick über die Verarbeitung und Analyse von Zeitreihenmetriken innerhalb von OMD. PNP, InfluxDB und Victoriametrics sind die Produkte, welche von Naemon und Prometheus mit Meßwerten befüllt und von Grafana wieder ausgelesen werden.

Zwei Tage hatten Entwickler und Anwender zum regen Austausch genutzt und das sicher nicht zum letzten Mal.

