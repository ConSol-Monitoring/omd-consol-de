---
author: Gerhard Laußer
date: '2011-08-10T22:39:54+00:00'
slug: check_oracle_health-kann-ezconnect
title: check_oracle_health kann EZCONNECT
---

<p>Üblicherweise ruft man check_oracle_health mit den Kommandozeilenparametern </p>
```bash
check_oracle_health --username <user> --password <pass> --connect <sid>
```

<p>auf. Voraussetzung dafür ist natürlich, dass die SID in einem Verzeichnisdienst oder in einer Datei tnsnames.ora vorhanden sein muss. </p><!--more--><p>Ein Eintrag in der tnsnames.ora sieht beispielsweise so aus:</p>

```text
NPX1 =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = dbsrv1.naprax.de)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = ORCL)
    )
  )
```

<p>Manchem ist bekannt, dass man dies in “flachgeklopfter” Form anstelle der SID beim Aufruf von check_oracle_health angeben kann, damit man sich die Pflege der tnsnames.ora ersparen kann.</p>

```bash
check_oracle_health --username <user> --password <pass> --connect (DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = dbsrv1.naprax.de)(PORT = 1521))(CONNECT_DATA = (SERVER = DEDICATED)(SERVICE_NAME = ORCL)))
```

<p>Tatsächlich geht es aber noch viel einfacher. Verbindungsdaten lassen sich auch im folgenden Format, genannt EZCONNECT, schreiben:</p>

```text
Datenbankserver[:Listener-Port]/Servicename
```

<p>Und so einfach sieht das dann aus: </p>

```bash
check_oracle_health --username <user> \
                    --password <pass> \
                    --connect dbsrv1.naprax.de:1521/ORCL
```