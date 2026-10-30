---
title: "Vorträge"
date: 2017-09-12
url: /blog/insights/monitoring-workshop-2017/vortraege/
aliases:
  - /wiki/workshop/2017/vortraege/
---

[Monitoring-Workshop 2017: Übersicht](/blog/insights/monitoring-workshop-2017/)

Ursprünglich war der Workshop als Nagios-Event initiiert - wir werden dieses Jahr u.a. über den Tellerrand blicken und uns auch über Newcomer wie Prometheus informieren beziehungsweise Möglichkeiten ausloten, wie man die beiden Welten optimal kombiniert.

## Was ist Prometheus?

//(Fabian Stäber)//

Wo sich Container-basierte Microservices verbreiten, kommen klassische Monitoring-Tools wie Nagios und Icinga an ihre Grenzen. Sie sind einfach nicht dafür ausgelegt, kurzlebige Objekte wie Container zu überwachen. In Cloud-Native-Umgebungen mausert sich daher Prometheus mit seinem auf Zeitreihen-Daten beruhenden Ansatz zu einem unverzichtbaren Werkzeug.

[Notizen](https://gist.github.com/fstab/3b4dc2b253174773a80bd86634da7523)
## Prometheus überwacht Kubernetes

//(Fabian Stäber)//

Kubernetes ist eine Plattform, mit der Docker-Container aufgesetzt, skaliert und über Rechnergrenzen hinweg verteilt werden. Viele microsoervice-basierte Anwendungen werden auf diese Weise betrieben. Zur Überwachung so einer dynamischen Umgebung bietet sich wiederum Prometheus an. Dennoch gibt es in einem Kubernetes-Cluster noch jede Menge klassischer IT-Komponenten, welche sich leicht mit Nagios monitoren lassen. Beide Tools zusammen findet man in der Open Monitoring Distribution, die somit der ideale Partner für Kubernetes ist.

[Notizen](https://gist.github.com/fstab/eab5df0c249c9645875966d252c27572)
## SNMP-Traps ohne Datenbank

//(Gerhard Laußer)//

In neueren OMD-Versionen ist es möglich, SNMP-Traps am mehrere Sites (Test, Prod, etc.) weiterzuleiten. Dort landen sie dann in einem Logfile. Es wird gezeigt, wie man dieses überwacht, um bestimmte Traps weiterzumelden. Weiterhin wird vorgestellt, wie man mit coshsh und vorgefertigten Mib-Dateien vollautomatisch passive Trap-Services für Netzwerkgeräte generiert.

Folien: [ws2017-traps-mit-coshsh.pdf](/blog/insights/monitoring-workshop-2017/ws2017-traps-mit-coshsh.pdf)
<span id="iapetosein_naemon-exporter_fuer_prometheus"></span>

## Iapetos: ein Naemon-Exporter für Prometheus

//(Philip Griesbacher)//

Mit Hilfe des in Go geschriebenen NEB-Moduls ist es möglich, sämtliche Checkergebnisse und Metriken, die ein Naemon oder Nagios4 sammelt, im Prometheus-Format zu exportieren. Auf diese Weise kann man die vorhandene Monitoringlandschaft ohne Aufwand in eine zeitreihenbasierte Überwachung integrieren.

Folien: [https://www.slideshare.net/PhilipGriesbacher/monitoring-workshop-2017-philip-griesbacher-iapetos](https://www.slideshare.net/PhilipGriesbacher/monitoring-workshop-2017-philip-griesbacher-iapetos)

<span id="storage_monitoring_per_api_statt_snmp_python_vs_perl"></span>

## Storage Monitoring per API statt SNMP, Python vs. Perl

//(Björn Müller, Marcel Denia)//

Zur Abfrage von Geräteinformationen im Netzwerk wird traditionell das Simple Network Management Protocol eingesetzt. Bei den Storage Herstellern ist immer häufiger zu beobachten, dass nur per RESTful HTTP API alle fürs Monitoring relevanten Informationen zur Verfügung gestellt werden. In diesem Vortrag beleuchten wir die Abfragen eines Huawei OceanStore per API. Hierbei vergleichen sich die Programmiersprachen Python und Perl. Möge der bessere gewinnen!

Folien: [pythonperlbattle.pdf](/blog/insights/monitoring-workshop-2017/pythonperlbattle.pdf)
## End-to-End mit Sakuli: Durchmarsch

//(Simon Meggle)//

Mit dem Open-Source-Tool [Sakuli](http://www.sakuli.org) können beliebige Benutzeroberflächen (Web und Rich-Clients) automatisiert getestet werden. Die integrierten Forwarder-Module reichen die Ergebnisse solcher Roboter-Tests an Monitoring-Systeme wie Nagios/Naemon, Icinga1/2 und seit kurzem auch an check_mk weiter. In diesem Vortrag geht es wörtlich "vom Ende bis zum Ende": ich zeige, wie Sakuli auf einem blanken Windows installiert wird, erstelle einen realen Testcase, binde OMD zum Empfang der Ergbnisse an und zeige zu guter Letzt, welche Grafana-Graphen sich aus den Performancedaten holen lassen. Zugunsten eines möglichst umfassenden Überblicks werde ich bewusst das ein oder andere technische Detail zu Sakuli verzichten.

<span id="sakuliskalierungsmoeglichkeiten"></span>

## Sakuli: Skalierungsmöglichkeiten

//(Simon Meggle)//

Eine Handvoll Sakuli-Testclients sind schnell manuell aufgesetzt, einzelne Tests noch manuell verwaltbar. Ab einer bestimmten Installationsgröße jedoch kommt man um Automatisierung nicht mehr herum, damit das E2E-Monitoring weiter skalieren kann. Ich zeige hierfür verschiedene Lösungsansätze bzw. -konzepte.

[Folien (Slideshare)](https://www.slideshare.net/simmerl121/sakuli-skalierungsmglichkeiten-windows-openshift-kubernetes)
<span id="Verteiltes_Monitoring_mit_OMD-Labs_-_Design_patterns"></span>

## Verteiltes Monitoring mit OMD-Labs - Design patterns

//(Matthias Gallinger)//

Beim Monitoring großer bzw. global verteilter IT-Infrastrukturen sind viele Aspekte zu berücksichtigen: Automatisierung der Konfiguration, Ausfallsicherheit, Visualisierung der Performancedaten und Leitungsengpässe zu entlegenen Standorten um nur einige zu nennen. In diesem Vortrag möchte ich aufzeigen, wie man solche Herausforderungen mit OMD-Labs und den darin enthaltenen Tools meistert, "wenn es ein oder zwei Schuhnummern größer sein darf". Ein Vortrag quasi aus dem Nähkästchen!

Folien: [distribute-monitoring-workshop2017.pdf](/blog/insights/monitoring-workshop-2017/distribute-monitoring-workshop2017.pdf)

<span id="Neues_bei_Thruk"></span>

## Neues bei Thruk

//(Sven Nierlein)//

Der obligatorische Thruk Vortrag mit Neuigkeiten aus einem Jahr Entwicklung. Neben den visuellen Erweiterungen in Form eines neuen Standard Themes hat sich auch unter der Haube viel getan. Eine einfachere Pluginverwaltung mit Online Repository, das Broadcast System, LMD und vieles mehr. Der Vortrag stellt den aktuellen Stand der Entwicklung vor.

Folien: [thruk-2017.pdf](/blog/insights/monitoring-workshop-2017/thruk-2017.pdf) [grafana-pnp.pdf](/blog/insights/monitoring-workshop-2017/grafana-pnp.pdf)
## Überwachen der IT Landschaft einer Uniklinik

//(Paul Dvoran)//

Ein kurzer Überblick der IT einer Uniklinik (uk-koeln.de) und der Versuch diese sinnvoll zu überwachen.

Folien: [monitoring_workshop_2017_praesentation_ukkoeln.pdf](/blog/insights/monitoring-workshop-2017/monitoring_workshop_2017_praesentation_ukkoeln.pdf)

### Workshops

## coshsh-Aha-Effekt

//(Gerhard Laußer)//

Du bringst eine Datenbank o.ä. mit und wir flanschen eine minimale coshsh-Datasource dran, mit der du dann weiterarbeiten kannst.

## Sakuli

//(Simon Meggle)//

Du hast bereits mit Sakuli gearbeitet, hängst aber an einem konkreten Problem und kommst nicht weiter? Wir können uns das zusammen ansehen.

## Jammern auf hohem Niveau

//(Teilnehmer)//

Es gab ja mal auf vergangenen Workshops die sog. Speakers Corner. Bei diesen spontanen Minivorträgen konnten Admins erzählen, wie ihre IT-Umgebung und das zugehörige Monitoring aussieht. Wir drehen den Spieß um und geben Admins die Gelegenheit, über weiße Flecken ihres Monitorings zu klagen, Wünsche zu äußern, wie denn ein ideales Monitoring aussehen könnte. Die anwesenden Entwickler werden möglicherweise bald nach dem Workshop mit entsprechender Software aufwarten können.

## OMD-Labs Edition: Hidden Features

//(...)//

Mit OMD-Labs werden einige nützliche "Helferlein" ausgeliefert, die wir in dem Workshop mal ans Tageslicht befördern und vorstellen wollen.

