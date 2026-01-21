---
author: Tobias Schneck
date: '2016-10-25'
tags:
- Sakuli
title: Software-Test im Container - Graphical User Interfaces mit Docker und Sakuli
  testen
---

Stabile und skalierbare Testumgebungen für End-2-End-Tests sind seit jeher schwer aufzusetzen und zu warten. Besonders in Kombination mit automatisierten UI-Tests stellen sie Tester und Entwickler immer wieder vor große Herausforderungen. Einen eleganten Ausweg bieten in Container verpackte Testumgebungen, die sowohl Web- als auch Rich-Clients in echten Desktop-Umgebungen testen können. Als "Immutable Infrastruktur" betrieben, wird es dadurch möglich, einen definierten Systemstand jederzeit reproduzierbar aufzurufen und Tests darin performant auszuführen.

<!--more-->

## Anforderungen an modernes End-2-End-Testing

Die Architektur eines modernen Softwaresystems orientiert sich zunehmend an den Anforderungen der Cloud. Skalierbarkeit, Flexibilität, Fehlertoleranz, Ausfallsicherheit bis hin zu Continuous Deployment sind meist die Schlagworte, die in diesem Zusammenhang genannt werden. Architektur-Trends wie [Microservices] oder die [Serverless Architektur] bieten hierfür praktikable Lösungsansätze. Deren technologische Umsetzung wird durch die sehr beliebte Container-Technologie ([Docker], [rkt]) sowie deren Ökosystem mit Orchestrierungslösungen wie [Kubernetes] oder Monitoringsysteme wie [Prometheus] unterstützt. Durch diese Technologien werden die neuartigen Architekturkonzepte erst marktreif umsetzbar. Damit die Qualität der Software durch die neu gewonnene Flexibilität dementsprechend mit skaliert, ist es auch im Bereich des Testings notwendig, sich der neuen Architektur anzupassen und deren Technologie zu nutzen. Die Testpyramide in Abbildung 1 definiert mehrere bekannte Bereiche  des Testings. Welche davon sich besonders anpassen müssen, lässt sich anhand einer kurzen Analyse wie folgt ableiten: Auswirkungen auf das Unit-Testing sind nicht vorhanden, da ausschließlich kleine Code-Funktionalitäten wie Klassen oder Methoden getestet werden, die keine verteilten, sondern nur lokale, in sich abgeschlossene Aufgaben abbilden. In den Bereichen der Integrations- und End-2-End-Tests sieht dies anders aus, da dort die gesamtheitliche Funktionalität eines Systems von außen getestet wird. Wie das sogenannte "System Under Test"(SUT) selbst, wird auch das Testsystem durch die verteilte Architektur komplexer.


Der vollständige Artikel wie [Sakuli] und [Docker] in der Praxis eingesetzt werden können, ist bei [Informatik Aktuell - Software-Test im Container] zu finden:

<div style="margin: 1em; margin-top: 2em; text-align: center;"><a href="https://www.informatik-aktuell.de/entwicklung/methoden/graphical-user-interface-gui-in-containern-testen.html"><img src="ia_artikel_sakuli.png" alt=""></a></div>

### Links

* [Microservices]
* [Serverless Architektur]
* [Docker]
* [rkt]
* [Kubernetes]
* [Prometheus]
* [Sakuli]
* [Informatik Aktuell - Software-Test im Container]

[Microservices]: http://martinfowler.com/microservices/
[Serverless Architektur]: http://martinfowler.com/articles/serverless.html
[Docker]: https://www.docker.com/
[rkt]: https://coreos.com/rkt/           
[Kubernetes]: http://kubernetes.io/
[Prometheus]: https://prometheus.io/
[Sakuli]: https://github.com/ConSol/sakuli
[Informatik Aktuell - Software-Test im Container]: https://www.informatik-aktuell.de/entwicklung/methoden/graphical-user-interface-gui-in-containern-testen.html

 ---

For more posts about Sakuli, view [https://labs.consol.de/tags/sakuli]()