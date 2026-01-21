---
author: Gerhard Laußer
date: '2009-10-16T14:43:10+00:00'
slug: ms-sql-server-backups-uberwachen-mit-check_mssql_health
tags:
- Backup
title: MS SQL Server Backups überwachen mit check_mssql_health
---

<p>Die check_[datenbank]_health-Plugins lassen sich leicht in ihrem Funktionsumfang erweitern, indem sie zur Laufzeit Zusatzmodule einlesen. Dieses Feature wurde eingebaut, damit für vorhandenen, u.U. firmenspezifischen Code kein eigenes Plugin geschrieben werden muss. Man steckt ihn einfach in Dateien, die einer bestimmten Namenskonvention folgen.    <br />Als Beispiel soll hier gezeigt werden, wie man das Alter des letzten Backups einer Datenbank überwacht. </p>  <!--more--> Dazu legt man eine Datei /usr/local/nagios/libexec/CheckMSSQLHealthExt1.pm folgenden Inhalts an:   <br />
```perl
sub init {
    my $self = shift;
    my %params = @_;
    $self->{backup} = {};
    if ($params{mode} =~ /my::backup::age/) {
        my @databaseresult = ();
        if (DBD::MSSQL::Server::return_first_server()->version_is_minimum("9.x")) {
            @databaseresult = $params{handle}->fetchall_array(q{
            SELECT
            a.name,
            DATEDIFF(HH, MAX(b.backup_finish_date), GETDATE()),
            DATEDIFF(MI, MAX(b.backup_start_date), MAX(b.backup_finish_date))
            FROM sys.sysdatabases a LEFT OUTER JOIN msdb.dbo.backupset b
            ON b.database_name = a.name
            GROUP BY a.name
            ORDER BY a.name
            });
        } else {
            @databaseresult = $params{handle}->fetchall_array(q{
            SELECT
            a.name,
            DATEDIFF(HH, MAX(b.backup_finish_date), GETDATE()),
            DATEDIFF(MI, MAX(b.backup_start_date), MAX(b.backup_finish_date))
            FROM master.dbo.sysdatabases a LEFT OUTER JOIN msdb.dbo.backupset b
            ON b.database_name = a.name
            GROUP BY a.name
            ORDER BY a.name
            });
        }
        foreach (@databaseresult) {
            my ($name, $age, $duration) = @{$_};
            next if $params{database} && $name ne $params{database};
            if ($params{regexp}) {
                next if $params{selectname} && $name !~ /$params{selectname}/;
            } else {
                next if $params{selectname} && lc $params{selectname} ne lc $name;
            }
            $self->{backup}->{lc $name}->{age} = $age;
            $self->{backup}->{lc $name}->{duration} = $duration;
        }
    }
}
```

Ruft man nun check_mssql_health auf, so wird diese Datei sozusagen als Plugin im Plugin geladen und der Parameter --mode kennt nun ein neues Argument &quot;my-backup-age&quot;.
<pre lang='text'>
$ check_mssql_health ... --mode my-backup-age
CRITICAL - calendar backupped 1579h ago communication_box was never
backupped fas_amil backupped 5h ago |
'calendar_bck_age'=1579;48;72 'calendar_bck_time'=0 'communication_box_bck_age'=0;48;
72 'communication_box_bck_time'=0 'fas_amil_bck_age'=5;48;72 'fas_amil_bck_time'=1
...
</pre>

Das Plugin liefert einen CRITICAL-Status, wenn eine Datenbank gefunden wurde, die noch niemals gesichert wurde oder wenn bei einer Datenbank das letzte Backup länger als 3 Tage (= 72 Stunden) zurückliegt. Die Defaultschwellwerte sind 48 bzw. 72 Stunden. Man kann aber mit --warning und --critical auch selber Werte vergeben. Mit Hilfe des Parameters --name lassen sich gezielt einzelne Datenbanken überwachen.

```text
$ check_mssql_health ... --mode my-backup-age --name fas_asia \
    --warning 5000 --critical 10000
WARNING - fas_asia backupped 7442h ago |
'fas_asia_bck_age'=7442;5000;8000 'fas_asia_bck_time'=0
```

Will man hingegen einzelne Datenbanken gezielt ignorieren, aber ansonsten alle mit einem einzigen Service überprüfen, so geht das mit einem regulären Ausdruck.

```text
--name '^(?!(tempdb))' –regexp
```

<p>Für jede Datenbank werden zwei Performancedaten ausgegeben.</p>


<ul>
  <li>&lt;db&gt;_bck_age= Anzahl der Stunden, die seit dem letzten Backup vergangen sind </li>

  <li>&lt;db&gt;_bck_time= Anzahl der Minuten, die das Backup gedauert hat
    <br /></li>
</ul>