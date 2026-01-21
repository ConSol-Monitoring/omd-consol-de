---
author: Gerhard Laußer
date: '2015-02-02'
tags:
- sap
title: Monitoring von SAP-Loadbalancing
---

Mit den bisherigen Versionen von check_sap_health verband man sich unter Angabe von Hostname und System-Nummer direkt mit einem NetWeaver Application Server, um CCMS-Metriken abzufragen oder Gesch&auml;ftslogik zu monitoren. In einer gr&ouml;&szlig;eren Umgebung mit mehreren Application Servern gibt es noch eine weitere Komponente, die in der &Uuml;berwachung nicht fehlen darf: Der Message Server der Zentralinstanz.
Seit der Version 1.4 kann sich check_sap_health nun auch zu diesem Server verbinden. Sogar der Weg &uuml;ber einen SAProuter ist m&ouml;glich, so da&szlig; auch noch dieser wichtige Bestandteil einer SAP-Landschaft vom Monitoring abgedeckt wird.
<!--more-->
Die Zeit f&uuml;r den Verbindungsaufbau zu einem Application Server (bzw. dessen grunds&auml;tzliche Verf&uuml;gbarkeit) wird mit dem folgenden Aufruf &uuml;berwacht:

```sh
OMD[corebank]:~$ check_sap_health --ashost spcred3.muc.crb.loc
    --sysnr 08 \
    --username NAGIOS --password soigan \
    --mode connection-time
OK - 0.04 seconds to connect as NAGIOS@CRP | 'connection_time'=0.04;1;5;;
```

Seit dem neuen Release kann sich das Plugin auch mit dem Message Server verbinden. Anstelle der Parameter --ashost und --sysnr verwendet man --mshost und --r3name. &Uuml;blicherweise muss man auch noch die Logon-Gruppe mit --group angeben.

```sh
OMD[corebank]:~$ check_sap_health --mshost spcred1.muc.crb.loc \
    --r3name CRP \
    --username NAGIOS --password soigan \
    --mode connection-time
OK - 0.05 seconds to connect as NAGIOS@CRP | 'connection_time'=0.05;1;5;;
```

Dazu muss aber einen Eintrag f&uuml;r sapmsCRP in der /etc/services existieren. Alternativ kann man die Portnummer f&uuml;r den Verbindungsaufbau auch mit --msserv \<port\> angeben.
Der Message Server sucht dann den am wenigsten belasteten Application Server heraus und weist den Client, also check_sap_health an, sich mit diesem zu verbinden. Auf diese Weise wird das Loadbalancing von SAP gemonitort.
Soll nun auch ein eventuell vorhandener SAProuter mit einbezogen werden, so benutzt man als Argument f&uuml;r den Parameter --mshost einfach den Route-String.

```sh
OMD[corebank]:~$ check_sap_health --mshost /H/spgw.muc.crb.loc/H/spcred1.muc.crb.loc \
    --r3name CRP \
    --username NAGIOS --password soigan \
    --mode connection-time
OK - 0.04 seconds to connect as NAGIOS@CRP | 'connection_time'=0.04;1;5;;
```