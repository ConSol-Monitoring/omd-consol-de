---
title: Workshop 2019
---

## Veranstaltungsdaten

Unter dem Motto **Monitors2019** findet

  * von **27.5. bis 28.5.2019**

der 14. Workshop der deutschsprachigen Open-Source-Monitoring-Community statt und zwar in der Evangelischen Stadtakademie München. Die Adresse lautet:

  * **[Herzog-Wilhelm-Straße 24, 80331 München](https://goo.gl/maps/hVMnCxwQjYA2)**

<hr>
## Ablauf

|Sonntag, 26.05.2019||
|---|---|
|19:00|[Vorabendtreff](vorabendtreff)|
|Montag, 27.05.2019||
|09:30 - 10:00|Check-In Workshop2019, Begrüßung|
|10:00 - 10:45|VMware-Monitoring mit check_vmware_esx (Martin Fürstenau)|
|10:45 - 11:00|Kaffeepause|
|11:00 - 11:45|Check_MK Automation mit Ansible (Bastian Kuhn)|
|11:45 - 12:30|Thanos - Prometheus (Michael Kraus)|
|12:30 - 13:30|Mittagspause|
|13:30 - 14:15|End-to-End Monitoring mit Sakuli2 (Katja Batra)|
|14:15 - 15:00|Netzwerkmonitoring mit Icinga und automatisches Discovery per SNMP an der Leibniz Universität Hannover (Hajo Kessener)|
|15:00 - 15:30|Kaffeepause|
|15:30 - 16:30|Speakers-Corner|
|16:30|Ende offizieller Teil - Veranstaltungspause|
|19:00|[Abendveranstaltung](abendveranstaltung)|
|Dienstag, 28.05.2019||
|09:00 - 09:45|Thruk (Sven Nierlein)|
|09:45 - 10:15|Kaffeepause|
|10:15 - 11:00|Was Punkiges mit Check_MK (Marcel Schulte)|
|11:00 - 11:45|Roadmap Sakuli 2.0 (Simon Hofmann)|
|11:45 - 12:30|Openshift Infrastrukturmonitoring (Ulrike Klusik)|
|12:30 - 13:30|Mittagspause|
|13:30 - 14:15| Kubernetes als Basis für die Monitoring-Infrastruktur (Daniel Klüh)|
|14:15 - 15:00| Monitoring Salat (Alessandro Warnecke)|
|15:15 - 16:00|Jammern auf hohem Niveau|
|16:00|offizielles Ende bzw. "open end"|

<hr>
## Vorträge/Tutorials

  * Michael Kraus - Thanos - Prometheus  [Thanos](https://github.com/m-kraus/prometheus_experiments/tree/master/thanos und )  [Prometheus](https://github.com/m-kraus/prometheus_training)
  * Bastian Kuhn - Check_MK Automation mit Ansible   [bastian-kuhn-ansible-checkmk.pdf](../bastian-kuhn-ansible-checkmk.pdf)
  * Ulrike Klusik - Openshift Infrastrukturmonitoring  [ulrike-klusik-consol-prometheus-openshift-infra-monitoring_wks.pdf](../ulrike-klusik-consol-prometheus-openshift-infra-monitoring_wks.pdf)
  * Martin Fürstenau - VMware-Monitoring mit check_vmware_esx  [martin-fuerstenau-monitoring_esx.pdf](../martin-fuerstenau-monitoring_esx.pdf)
  * Simon Hofmann - Roadmap Sakuli 2.0  [simon-hofmann-sakuli2.pdf](../simon-hofmann-sakuli2.pdf)
  * Sven Nierlein - Thruk  [sven-nierlein-thruk-2019-muenchen.pdf](../sven-nierlein-thruk-2019-muenchen.pdf)
  * Daniel Klüh - Kubernetes als Basis für die Monitoring-Infrastruktur  [daniel-klueh-kubernetes.pdf](../daniel-klueh-kubernetes.pdf)

Das war das Ankündigungsblabla und die Vorbereitungen...

Ursprünglich war der Workshop als Nagios-Event initiiert - wir werden wie die letzten Jahre über den Tellerrand blicken und uns auch Themen wie Prometheus, InfluxDB, etc. informieren beziehungsweise Möglichkeiten ausloten, wie man diese Tools optimal kombiniert.

Obige Einteilung in Dreiviertelstunden bedeutet nicht, daß es ein starres Zeitraster gibt. Neben den 45-Minuten-Vorträgen sind auch Lightning-Talks von 10 oder gar 5 Minuten möglich. Oder Vorträge von maximal einer halben Stunde. Es gilt nicht, eine vorgegebene Dauer mit Inhalt zu füllen und sich womöglich abzumühen, sondern jeglichen Gedanken vorzutragen und sei er noch so klein. Beim Workshop geht es ja nicht ums Berieseln, sondern um den Austausch von Ideen und Werkzeugen. Sogar sowas ist möglich: du erzählst zehn Minuten von deiner Umgebung und schließt mit "wer kann mit Tipps zur Umsetzung geben?" War alles schon da und hat was gebracht...

Hier stehen erstmal Vorschläge:
  * Sven Nierlein - Thruk: Ich werde die Neuigkeiten der letzten 12 Monate vorstellen. Schwerpunkt je nach Wunsch:
    * Thruk in Grafana Dashboards und Grafana in Thruk Dashboards
    * Federation: Verteilte Multi-Tier Thruk Instanzen
    * Die REST API in der Praxis
    * Dynamische Javascript Action Menus
  * Bastian Kuhn - Check_MK Automation mit Ansible. Ich kann ich auch wieder (hab ich damals in Hannover und Hamburg gemacht) einen Workshop zum Check Programmieren anbieten
  * Gerhard Laußer - Coshsh: Du bringst deine CMDB/Datenbank/Sheets mit und ich zeige, wie man mit coshsh Konfigurationsdateien generiert.
  * Michael Kraus: ich kann folgendes anbieten:
    * [Vortrag] Thanos - Prometheus mit unbegrenztem Speicher und flottenweiter Übersicht (ca. 30 Minuten basierend auf https://github.com/m-kraus/prometheus_experiments/tree/master/thanos)
    * [Workshop] Prometheus für Einsteiger (ca. 2-3 Stunden, basierend auf https://github.com/m-kraus/prometheus_training, eigener Laptop mit Docker/docker-compose ist Voraussetzung)
  * Martin Fürstenau - VMware-Monitoring mit check_vmware_esx
  * Marcel Schulte - Wieder was Punkiges mit Check_MK.
  * Hajo Kessener - Netzwerkmonitoring mit Icinga und automatisches Discovery per SNMP an der Leibniz Universität Hannover.
  * Simon Hofmann - Roadmap Sakuli 2.0
  * Rika Denia - End-to-End Monitoring mit Sakuli2
  * Alessandro Warnecke - Konsolidierung der gewachsenen IT-Landschaft bei der Kali und Salz AG.
  * Daniel Klüh - Kubernetes als Basis für die Monitoring-Infrastruktur

Lightning Talks:
  * OMD 3 - was steckt an kleinen Helfern drin, was ist neu, was flog raus und warum?

**Freiwillige vor!** Schickt mir eure Vorschläge an [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de), ich führe sie dann in der Liste auf. Einzige Bedingung: ein Zusammenhang mit Open-Source-Monitoring muss erkennbar sein. :-)

<hr>
## Anmeldung

Mit Eingang der [Anmeldung](https://eveeno.com/monitors2019)  werden wir die Teilnehmerliste aktualisieren.
Mit dem Eintrag in der Liste ist somit die[Anmeldung](https://eveeno.com/monitors2019) bestätigt.

Wie in den vergangenen Jahren ist die Teilnahme am Workshop wieder kostenlos. Die Unterbringung und Anreise ist jedoch komplett von den Teilnehmern selbst zu organisieren und zu tragen. Für Raummiete, Verpflegung und Getränke tagsüber wird ein Unkostenbeitrag erhoben. Rechnet mit ca. 50€.

## Anmeldeformlar

Die Anmeldung erfolgt über eine externe Ticketing-Seite
<html><div><a class='eveenoButton orange' href='https://eveeno.com/monitors2019' target='_blank'>Anmelden über eveeno »</a><style scoped>.eveenoButton:link, .eveenoButton:visited, .eveenoButton:focus, .eveenoButton:hover, .eveenoButton:active {color: #fff; text-decoration: none;}.eveenoButton {border-radius:3px; color: #fff; cursor: pointer; display: inline-block; font-family: arial,helvetica,sans-serif; font-weight: bold; font-size: 15px; padding: 4px 8px; text-align: center;}.eveenoButton.orange {background-color: #fb9d23; border: 1px solid #fb9d23;}.eveenoButton.orange:hover,.eveenoButton.orange:focus,.eveenoButton.orange:active {border:1px solid #e78404; background-color:#e78404;}</style></div></html>

Mit Eintrag der Daten in der Teilnehmerliste gilt die Anmeldung als bestätigt. Dieses Jahr ist die Teilnahme auf **75 Personen** begrenzt.

<hr>
## Anreise / Hotel

Anreise und Unterbringung ist von jedem Teilnehmer selbst zu organisieren.

## Hotelempfehlungen

  * [Motel One Sendlinger Tor (direkt neben dem Workshop)](https://www.motel-one.com/de/hotels/muenchen/hotel-muenchen-sendlinger-tor/)

<hr>
## Vorabendtreff

Alle, die am Sonntag schon in München sind und die anderen Teilnehmer beschnuppern oder wiedersehen wollen, treffen sich **ab 19 Uhr** am Sendlinger Tor im [Kennedys](https://www.kennedysmunich.com/).

<hr>
## Abendveranstaltung

Nach dem ersten Workshoptag (Montag) gehen wir ins [Hackerhaus](http://www.hackerhaus.de/) in der Sendlinger Straße 14. (Auf eigene Rechnung)

Vom Workshop aus sind es ein paar Minuten zu Fuß dorthin. Wer anderweitig unterwegs ist, der kann auch vom Marienplatz (U- und S-Bahnhof) hingehen.

<hr>
## Code of Conduct

Haben wir nicht, brauchen wir nicht. Wir sind normale Leute.

