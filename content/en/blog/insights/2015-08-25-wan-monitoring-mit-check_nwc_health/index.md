---
layout: post
status: published
title: WAN-Monitoring mit check_nwc_health
author: Gerhard Laußer
date: 2015-08-25 23:10:25+02:00
categories:
- Nagios
- OMD
tags:
- plugin
- Nagios
- Icinga
- check_nwc_health
- ospf
- wan
- cisco
- bgp
- mpls
- vpn
featured_image: cisco-wan.png
---
<span style="float: right">![cisco-wan.png](cisco-wan.png)</span>Das Plugin [check_nwc_health](/docs/plugins/check_nwc_health) erfreut sich größter Beliebtheit beim Monitoring von Komponenten in den Core-, Access- und Distribution-Layern, oder kurz: den Netzwerkkomponenten innerhalb von Gebäuden und Standorten. 
Das WAN-Monitoring geht aber weit über die üblichen Hardware/CPU/Memory/Interfaces-Checks hinaus.
Für einen OMD-Kunden wurde das Plugin so erweitert, daß er sein europaumspannendes Netzwerk, bestehend aus mehreren tausend WAN-Knoten, umfassend überwachen kann. Den Vergleich mit schweineteuren proprietären Lösungen braucht das Gespann OMD/check_nwc_health seitdem nicht mehr zu fürchten.
<!--more-->
Gefordert waren:

* Status der Anbindung an MPLS und VPN.
* Zustand der OSPF- und BGP-Nachbarschaft.
* Alarmieren, wenn plötzlich eine größere Anzahl von BGP-Neighbors verschwindet.
* Alarmieren, wenn plötzlich die Anzahl der Routen zu einem Ziel einbricht.
* Muß mit RFC4750 umgehen können, d.h. mit mehreren Instanzen von OSPF, welche jeweils über einen eigenen Context in IOS angesprochen werden.

Dafür wurden nun die folgenden Modi eingeführt:

* route-exists - prüft mittels *--name &lt;destination&gt;*, ob es eine Route zur Destination gibt. Die Destination kann eine IP-Adresse sein oder Netzwerk/Netzmaske. Optional kann man mit *--name2 &lt;hop;&gt;* prüfen, ob die Route über einen bestimmten Hop führt.
* count-routes - zählt die Anzahl der alternativen Routen zu einem Ziel.
* watch-bgp-peers - prüft, ob seit dem letzten Lauf des Plugins BGP-Peers verschwunden sind.
* count-bgp-prefixes - Zählt die Zahl der *accepted Route Prefixes* einer Peer-Connection.
* bgp-peer-status - prüft den Zustand der BGP-Peers. Ist dieser nicht *established* oder *admin down*, wird alarmiert.
* ospf-neighbor-status - prüft den Zustand der OSPF-Neighbors. Mit *--name &lt;neighbor&gt;* kann auch nur ein einzelner Neighbor herausgepickt werden. Alarmiert wird, wenn dessen Zustand nicht *full* oder *twoWay* ist.

