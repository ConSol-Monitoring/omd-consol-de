---
author: Gerhard Laußer
date: '2010-10-01T17:15:36+00:00'
slug: extra-opts-fr-die-check__health-plugins
tags:
- check_mysql_health
title: Extra-opts für die check_*_health-Plugins
---

<p>Die Datenbank-Plugins check_oracle_health, check_mysql_health, check_mssql_health und check_db2_health unterstützen auf vielfachen Wunsch auch den Parameter <a href="http://nagiosplugins.org/extra-opts" target="_blank">--extra-opts</a>. Damit ist es jetzt möglich, z.B. Login-Daten von den Kommandozeilenparametern in Konfigurationsdateien zu verlagern. Neben Environmentvariablen gibt es somit eine weitere Alternative, Passwörter aus der Prozessliste zu entfernen und dadurch vor neugierigen Blicken zu schützen.</p> <!--more-->  <p>Auf der Homepage der Nagios-Plugins ist eigentlich schon alles <a href="http://nagiosplugins.org/extra-opts" target="_blank">beschrieben</a>, aber zur Verdeutlichung hier nochmal ein Beispiel mit check_mysql_health:</p> Man erstellt eine Datei, z.B. etc/plugins-config/mysql-dbs.ini   ```text
[webdb]
hostname=wwwsrv8.naprax.de
username=nagios
password=pfu1de1fl
method=mysql

[essensdb]
hostname=kantine.naprax.de
username=nagios
password=imouschbeim
method=mysql
```
und übergibt den Dateinamen und die gewünschte Sektion als Argument von --extra-opts an.

```bash
check_mysql_health --mode connection-time \
                   --extra-opts webdb@etc/plugins-config/mysql-dbs.ini
```
Dieser Plugin-Aufruf entspricht exakt diesem hier in der alten Form:

```bash
check_mysql_health --mode connection-time --hostname wwwsrv8.naprax.de \
                   --username nagios --password pfu1de1fl --method mysql
```