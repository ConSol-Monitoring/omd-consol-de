---
author: Gerhard Laußer
date: '2016-06-28'
summary: null
tags:
- Nagios
title: Schnelles Anlegen eines Monitoring-Users mit check_mssql_health
---

Seit der Version 2.6.3 von [check_mssql_health](https://labs.consol.de/nagios/check_mssql_health/index.html) ist es möglich, den für das Monitoring benötigten Datenbankbenutzer direkt vom Plugin erzeugen zu lassen. Angenommen, der Benutzer soll *NAGIOS* heißen und das dazugehörige Passwort *ES_ku_el*. Der Plugin-Aufruf lautet dann:
```bash
$ check_mssql_health --hostname dbsrv1 --port 1433 \
    --username sa --password 'Str3ng!g3heim' \
    --mode create-monitoring-user \
    --name NAGIOS --name2 'ES_Ku_el'
```
Anstelle des Benutzers *sa* kann man auch jeden beliebigen Administrator-Account nehmen. NAGIOS wird in jeder einzelnen Datenbank angelegt. Kommen neue Datenbanken dazu, so wiederholt man einfach den create-monitoring-user-Befehl.