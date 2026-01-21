---
author: Gerhard Laußer
date: '2010-08-12T19:33:27+00:00'
slug: wie-man-das-setzen-der-schwellwerte-an-den-dba-delegiert
tags:
- check_mssql_health
title: Wie man das Setzen der Schwellwerte an den DBA delegiert
---

<p>Die Plugins check_oracle_health und check_mssql_health haben mit den Versionen 1.6.6 bzw. 1.5.6 ein neues Feature bekommen. Critical- und Warning-Schwellwerte können jetzt auch direkt in der Datenbank hinterlegt werden. Bei Änderungswünschen muss der DBA nun nicht mehr den Nagios-Administrator belästigen, damit dieser die entsprechenden Servicedefinitionen anpasst. </p> <!--more-->  <p>Mit dem neuen Kommandozeilenparameter --dbthresholds werden die Plugins angewiesen, eine bestimmte Tabelle in der Datenbank auszulesen und, falls in dieser die passenden Einträge gefunden wurden, die Argumente von --warning bzw. --critical zu überschreiben. Am Beispiel von check_oracle_health soll gezeigt werden, wie so eine Tabelle auszusehen hat.</p>  ```sql
create table check_oracle_health_thresholds (
  pluginmode varchar2(32),
  name varchar2(32) NULL,
  warning varchar2(8) NULL,
  critical varchar2(8) NULL
);
```

<p>Beim Aufruf von check_oracle_health wird in der Tabelle nach Zeilen gesucht, deren Feld pluginmode dem Argument von --mode entspricht. Die Spalten warning und critical werden dann als neue Schwellwerte verwendet. Hat man beim Aufruf die Kommandozeilenparameter --warning und --critical angegeben, so werden deren Argumente durch die Werte aus der Datenbank überschrieben. Sollen in jedem Fall die Schwellwerte von der Kommandozeile Vorrang haben, so lässt man den Parameter --dbthresholds weg oder legt erst gar keine Zeile für den betreffenden Mode an. </p>

<p>Wenn nun der DBA z.B. die Schwellwerte für die Überprüfung es freien Speicherplatzes in den Tablespaces selbst einstellen möchte, so trägt er folgende Zeilen ein:</p>

```sql
insert into check_oracle_health_thresholds values ('tablespace-free', 'USERS', '12:', '7:');
insert into check_oracle_health_thresholds values ('tablespace-free', NULL, '13:', '8:');
```

<p>Damit sorgt er dafür, daß für den Tablespace USERS die Schwellwerte --warning 12: --critical 7: gelten. Für alle anderen Tablespaces gilt defaultmäßig --warning 13: --critical 8:. Gäbe es die zweite Zeile nicht, so würden die Defaultwerte aus den Kommandozeilenparametern übernommen.</p>

```text
check_oracle_health
   --mode tablespace-free -3 --dbthresholds
OK - tbs USERSOFT has 98.75% free space left
tbs USERS has 100.00% free space left
tbs UNDOTBS1 has 99.99% free space left
tbs TTT has 100.00% free space left
tbs TEST_TBS has 17.98% free space left
tbs TEMP has 100.00% free space left
tbs SYSTEM has 85.60% free space left
tbs SYSAUX has 98.00% free space left | 'tbs_usersoft_free_pct'=98.75%;13:;8:
'tbs_usersoft_free'=9MB;1.30:;0.80:;0;10.00
'tbs_users_free_pct'=100.00%;12:;7:
'tbs_users_free'=32767MB;3932.16:;2293.76:;0;32767.98
'tbs_undotbs1_free_pct'=99.99%;13:;8:
'tbs_undotbs1_free'=32765MB;4259.84:;2621.44:;0;32767.98
'tbs_ttt_free_pct'=100.00%;13:;8:
'tbs_ttt_free'=3072MB;399.36:;245.76:;0;3072.00
'tbs_test_tbs_free_pct'=17.98%;13:;8:
'tbs_test_tbs_free'=128MB;92.56:;56.96:;0;712.00
'tbs_temp_free_pct'=100.00%;13:;8:
'tbs_temp_free'=32767MB;4259.84:;2621.44:;0;32767.98
'tbs_system_free_pct'=85.60%;13:;8:
'tbs_system_free'=28048MB;4259.84:;2621.44:;0;32767.98
'tbs_sysaux_free_pct'=98.00%;13:;8:
'tbs_sysaux_free'=32112MB;4259.84:;2621.44:;0;32767.98
```

<p>Mit dieser Methode lassen sich Schwellwerte feingranularer als bisher angeben. Indem man für jeden Tablespace eine eigene Zeile einträgt, kann man unterschiedliche Schwellwerte pro Tablespace angeben. Bisher war das nicht möglich. Da es auf der Kommandozeile nur jeweils einen Parameter --warning bzw. --critical geben kann, gab es auch nur einen Satz von Schwellwerten, der für alle Tablespaces gleichermaßen galt.</p>

<p>Bei check_mssql_health sieht das Statement zum Anlegen der Tabelle geringfügig anders aus:</p>

```sql
create table check_mssql_health_thresholds (
  pluginmode varchar(32),
  name varchar(32) NULL,
  warning varchar(8) NULL,
  critical varchar(8) NULL
);
```

<p>Das Eintragen der Schwellwerte funktioniert genauso wie bei Oracle:</p>

```sql
insert into check_mssql_health_thresholds values ('connected-users', NULL, '100', '200');
insert into check_mssql_health_thresholds values ('database-free', 'tempdb', '11:', '5:');
insert into check_mssql_health_thresholds values ('database-free', 'master', '12:', '7:');
insert into check_mssql_health_thresholds values ('database-free', NULL, '22:', '17:');
```