---
author: Gerhard Laußer
author_email: gerhard.lausser@consol.de
author_twitter: lausser
date: 2015-07-31T00:00:00+0200
tags:
- Nagios
title: check_nwc_health und Solaris-Interfaces
---

<span style="float: right"><img src="oracle_solaris_logo.png" alt=""></span> Aller guten Dinge sind drei. Bisher konnte man mit [check_nwc_health][1] die lokalen Interfaces von Linux und Windows-Rechnern überwachen, jetzt geht das auch bei Solaris. Das Betriebsteam eines MySQL-Cluster auf Oracle Solaris wollte die Auslastung der Netzwerk-Interfaces aufzeichen, da die übertragene Datenmenge sich allmählich dem GBit/s-Bereich nähert.

<!--more-->
Kundenwünsche sind Befehl, also wurde check_nwc_health entsprechend erweitert. 
Auf Basis der **kstat**-Schnittstelle bzw. des bei Solaris um Standard-Umfang von Perl beiliegenden Moduls Sun::Solaris::Kstat lassen sich Counterwerte direkt aus dem Kernel auslesen. Auch die Bandbreite der Interfaces gehört zu den Metriken. So errechnet man, wieviel Prozent der maximal möglichen Übertragungsrate der derzeitige Traffic ausmacht.
```bash
$ check_nwc_health --hostname localhost --servertype solarislocal --mode list-interfaces
e1000g0
e1000g1
e1000g2
e1000g3
lo0

$ check_nwc_health --hostname localhost --servertype solarislocal --mode interface-usage --unit MB --name e1000g0
OK - interface e1000g0 usage is in:0.04% (0.05MB/s) out:1.93% (2.31MB/s) | 'e1000g0_usage_in'=0.04%;80;90;0;100 'e1000g0_usage_out'=1.93%;80;90;0;100 'e1000g0_traffic_in'=0.05MB;95.3674;107.2884;0;119.2093 'e1000g0_traffic_out'=2.31MB;95.3674;107.2884;0;119.2093
```

Wichtig ist die Angabe von *--servertype solarislocal*.

[1]: https://labs.consol.de/nagios/check_nwc_health/index.html