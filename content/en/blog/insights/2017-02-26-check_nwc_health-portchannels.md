---
author: Gerhard Laußer
date: '2017-02-26'
featured_image: assets/2017-02-26-check_nwc_health-portchannels/switch.png
tags:
- OMD
title: Portchannel-Monitoring mit check_nwc_health
---

Version 6.0 von [check_nwc_health] ist erschienen und hat neben Aufräumarbeiten unter der Haube ein paar neue Features zu bieten:

* interface-etherstats
* F5 Wide IPs
* Juniper VSD Memberstatus
* interface-stack-status
<!--more-->

### Interface-Monitoring auf Ethernet-Ebene

Die Anforderung lautete, diese ganzen Ethernet-bezogenen Zähler von Interfaces zu monitoren, also CRC-Errors, Late Collisions, Broadcasts, etc.
Das ist ab jetzt möglich mit dem Mode _interface-etherstats_.

```bash
$ check_nwc_health ... --mode interface-etherstats --name GigabitEthernet2/0/3
OK - interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsAlignmentErrorsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsFCSErrorsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsSingleCollisionFramesPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsMultipleCollisionFramesPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsSQETestErrorsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsDeferredTransmissionsPercent is 0.01%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsLateCollisionsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsExcessiveCollisionsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsInternalMacTransmitErrorsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsCarrierSenseErrorsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsFrameTooLongsPercent is 0.00%, interface GigabitEthernet2/0/3 (alias BCKMUC33212, 002-03) dot3StatsInternalMacReceiveErrorsPercent is 0.00% | 'GigabitEthernet2/0/3_alignment_errors_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_FCSErrors_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_single_collision_frames_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_multiple_collision_frames_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_SQETest_errors_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_deferred_transmissions_percent'=0.01%;1;10;0;100 'GigabitEthernet2/0/3_late_collisions_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_excessive_collisions_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_internal_mac_transmit_errors_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_carrier_sense_errors_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_frame_too_longs_percent'=0%;1;10;0;100 'GigabitEthernet2/0/3_internal_mac_receive_errors_percent'=0%;1;10;0;100
```
Ich rate dringend dazu, sich die wirklich relevanten Interfaces herauszusuchen und jedem von ihnen mit Hilfe von \--name einen eigenen Service zu spendieren.
Immerhin erhält man 12 Metriken pro Interface. 
Ein Rundumschlag-Service ist schon auch möglich, also ein Service, der sämtliche Interfaces eines Netzwerkgeräts auf einmal abfrägt. Nur...wenn da fünfzig Nexus im Spiel sind mit jeweils mehreren Hundert Interfaces, dann hat man hoffentlich vorher für die InfluxDB angemessen viel Speicher vorgesehen.
Mit _\--report short_ verkürzt man die Ausgabe, so daß nur noch die aus dem Rahmen fallenden Metriken angezeigt werden.


### F5 Loadbalancer WideIPs

Bei Wide IPs liefert die _F5-BIGIP-GLOBAL-MIB_ die Info _gtmWideipStatusAvailState_. Check_nwc_health reicht den durch und gibt noch die Ursache _gtmWideipStatusDetailReason_ aus.

```bash
$ check_nwc_health --hostname 7.1.0.2 --timeout 180 --community 'trpublic' --mode wideip-status --report short
CRITICAL - wide IP login.coshsh.com has status red, is enabled, wide IP gkf.glbu.coshsh.com has status red, is enabled
```


### Juniper [VSD] Status

Mehrere physikalische Geräte zu einem sog. Virtual Security Device zusammenzufassen ist bei Juniper gang und gäbe, so daß ich hierfür einen Check implementiert habe.

```bash
$ check_nwc_health --hostname 6.7.0.3 --timeout 30 --community 'trpublic' --mode ha-status --warning 0: --critical 0:
OK - vsd member 0_1103421 has status master
```

```bash
$ check_nwc_health --hostname 6.7.0.3 --timeout 30 --community 'trpublic' --mode ha-status --warning 0: --critical 0: -vv
I am a NetScreen-ISG 1000 version 6.3.0r17b.0 (SN: 0222062099000, Firewall+VPN)
[VSDSUBSYSTEM]
info: checking clusters

[CLUSTER_0]
nsrpClusterTblIndex: 0
nsrpClusterUnitCtrlMac: 
nsrpClusterUnitDataMac: 
nsrpClusterUnitId: 1103421

[MEMBER_0]
nsrpVsdMemberGroupId: 0
nsrpVsdMemberPreempt: 2
nsrpVsdMemberPriority: 50
nsrpVsdMemberStatus: master
nsrpVsdMemberUnitId: 1103421
info: vsd member 0_1103421 has status master

OK - vsd member 0_1103421 has status master
checking members
vsd member 0_1103421 has status master
checking clusters
```


### Portchannels (oder wie auch immer die Herstellerbezeichnung lautet)

Zu diesem Thema gab es bereits einen Mode, nämlich \--mode link-aggregation-availability. Bei diesem war allerdings zu viel manuelle Vorarbeit nötig, mit dem Parameter \--name musste man die Liste der zu einer Aggregierung gehörenden Interfaces explizit angeben plus einer Bezeichnung für das Gesamtkonstrukt.
Die Information ist aber bereits in der IF-MIB vorhanden. Der neue Mode interface-stack-status macht sich das zunutze und prüft alle Interfaces, welche Sublayer-Einträge haben.

```bash
$ check_nwc_health ... --mode interface-stack-status 
OK - interface Port-Channel10 has 2 sub-layers, interface Port-Channel18 has 2 sub-layers, interface Port-Channel201 has 4 sub-layers
$
$ check_nwc_health ... --mode interface-stack-status 
$ CRITICAL - Port-channel3 (nwh11cas03b) has a sub-layer interface GigabitEthernet0/2 with status down
```

Eingrenzen kann man die Liste der Top-Layer-Interfaces mit \--name. (Bei Cisco z.b. mit \--name Port-Channel \--regexp). Damit erwischt man auch solche Interfaces, die laut ifStackTable keine Sub-Interfaces haben, ihrem Namen nach aber welche haben sollten.

```bash
$ check_nwc_health ... --mode interface-stack-status --name Port-Channel --regexp
WARNING - Port-channel4 (nwf45ctt002a) has stack status active but no sub-layer interfaces
```

Bei einem Huawei schaut es ähnlich aus:
```bash
OK - interface Eth-Trunk5 has 2 sub-layers, interface Eth-Trunk1 has 2 sub-layers
```



[check_nwc_health]: /docs/plugins/check_nwc_health/index.html
[VSD]: http://help.juniper.net/help/english/6.2.0/nsrp_vsd_group_cnt.htm