---
title: check_mssql_health
tags:
  - plugins
  - check_mssql_health
  - sql server
  - mssql
  - database
---
## Description ##
check_mssql_health is a plugin, which is used to monitor different parameters of a MS SQL server.

## Documentation ##

### Command line parameters ###
* --hostname \<hostname>
  The database server
* --username \<username>
  The database user
* --password \<password>
  The database passwort
* --port \<port>
  The port, where the server listens (Default: 1433)
* --server \<server>
  An alternative to hostname+port. &lt;server&gt; will be looked up in the file freetds.conf.
* --mode \<modus>
  With the mode-parameter you tell the plugin what you want it to do. See list below for possible values.
* --name \<objectname>
  Several checks can be limited to a single object (e.g. a specific database). It is also used for mode=sql. (See the examples)
* --name2 \<string>
  If you use --mode=sql, the SQL-statement will be shown in the plugin output and the performance data (which looks ugly). The parameter name2 can be used to provide a used-defined string.
* --warning \<range>
  Values outside this range result in a WARNING.
* --critical \<range>
  Values outside this range result in a CRITICAL.
* --environment \<variable>=\<wert>
  It is possible to set environment variables at runtime with htis parameter. It can be used multiple times.
* --method \<connectmethode>
  With this parameter you tell the plugin, which connection method it should use. Known values are: dbi for the perl module DBD::Sybase (default) and sqlrelay for the SQLRelay proxy..
* --units \<%\|KB\|MB\|GB>
  This parameter adds units to the performance, when using mode=sql
* --dbthresholds
  With this parameter thresholds are read from the database table check_mssql_health_thresholds

### Modes ###

| Keyword | Meaning | Threshold range
|---------|---------|----------------|
| connection-time | Measures how long it takes to login | 0..n Sek (1, 5)
| connected-users | Number of connected users | 0..n (50, 80)
| cpu-busy | CPU Busy Time | 0%..100% (80, 90)
| io-busy | IO Busy Time | 0%..100% (80, 90)
| full-scans | Number of full table scans per second | 0..n (100, 500)
| transactions | Number of transactions per second | 0..n (10000, 50000)
| batch-requests | Number of batch requests per second | 0..n (100, 200)
| latches-waits | Number of Latch-Requests per second, which could not be fulfilled | 0..n (10, 50)
| latches-wait-time | Average time a Latch-Request had to wait until it was granted | 0..n ms (1, 5)
| locks-waits | Number of Lock-Requests per second, which could not be satisfied | 0..n (100, 500)
| locks-timeouts | Number of Lock-Requests per second, which resulted in a timeout | 0..n (1, 5)
| locks-deadlocks | Number of Deadlocks per second | 0..n (1, 5)
| sql-recompilations | Number of Re-Compilations per second | 0..n (1, 10)
| sql-initcompilations | Number of Initial Compilations per second | 0..n (100, 200)
| total-server-memory | The main memory reserved for the SQL Server | 0..n (nearly 1G, 1G)
| mem-pool-data-buffer-hit-ratio | Data Buffer Cache Hit Ratio | 0%..100% (90, 80:)
| lazy-writes | Number of Lazy Writes per second | 0..n (20, 40)
| page-life-expectancy | Average time a page stays in main memory | 0..n (300:, 180:)
| free-list-stalls | Free List Stalls per second | 0..n (4, 10)
| checkpoint-pages | Number of Flushed Dirty Pages per second | 0..n ()
| database-online | Prüft, ob eine Datenbank online ist und Verbindungen akzeptiert | -
| database-free | Free space in a database (Default is percent, but –units can be used also). You can select a single database with the name parameter | 0%..100% (5%, 2%)
| database-backup-age | Elapsed time since a database was last backupped (in hours). The performancedata also cover the time needed for the backup (in minutes) | 0..n
| database-logbackup-age | Elapsed time since a database log was last backupped (in hours). The performancedata also cover the time needed for the backup (in minutes) | 0..n
| database-file-auto-growths | The number of File Auto Grow events (either data or log) in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-logfile-auto-growths | The number of Log File Auto Grow events in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-datafile-auto-growths | The number of Data File Auto Grow events in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-file-auto-shrinks | The number of File Auto Shrink events (either data or log) in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-logfile-auto-shrinks | The number of Log File Auto Shrink events in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-datafile-auto-shrinks | The number of Data File Auto Shrink events in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| database-file-dbcc-shrinks | The number of DBCC File Shrink events (either data or log) in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| failed-jobs | The number of jobs which did not exit successful in the last \<n> minutes (use --lookback) | 0..n (1, 5)
| sql | Result of a user-defined SQL statement, which returns a numerical value. The statement is passed to the plugin as an argument to the –sql parameter. A label for the performancedata can be defined with the –name2 parameter. A unit can be appended by using –units. If the SQL statement contains special characters, it is recommended to encode it first by calling check_mssql_health with the –encode parameter and sending the statement to STDIN | 0..n
| sql-runtime | Runtime of a custom sql statement in seconds | 0..n (1, 5)
| list-databases | Returns a list of all databases | -
| list-locks | Returns a list of all locks | -

Please note, that the thresholds must be specified according to the Nagios plug-in development Guidelines.

* "10" means "Alarm, if > 10" and
* "90:" means "Alarm, if \< 90"

## Preparation of the database ##
In order for the plugin to operate correctly, a database user with specific privileges is required.

The most simple way is to assign the Nagios-user the role "serveradmin". As an alternative you can use the sa-User for the database connection. Alas, this opens a serious security hole, as the (cleartext) administrator password can be found in the nagios configuration files

Birk Bohne wrote the following script which allows the automated creation of a minimal, yet sufficient privileged monitoring-user.
``` sql
declare @dbname varchar(255)
declare @check_mssql_health_USER varchar(255)
declare @check_mssql_health_PASS varchar(255)
declare @check_mssql_health_ROLE varchar(255)
declare @source varchar(255)
declare @options varchar(255)
declare @backslash int

/*******************************************************************/
SET @check_mssql_health_USER = '"[Servername|Domainname]\Username"'
SET @check_mssql_health_PASS = 'Password'
SET @check_mssql_health_ROLE = 'Rolename'
/******************************************************************

PLEASE CHANGE THE ABOVE VALUES ACCORDING TO YOUR REQUIREMENTS

- Example for Windows authentication:
  SET @check_mssql_health_USER = '"[Servername|Domainname]\Username"'
  SET @check_mssql_health_ROLE = 'Rolename'

- Example for SQL Server authentication:
  SET @check_mssql_health_USER = 'Username'
  SET @check_mssql_health_PASS = 'Password'
  SET @check_mssql_health_ROLE = 'Rolename'

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
It is strongly recommended to use Windows authentication. Otherwise
you will get no reliable results for database usage.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

*********** NO NEED TO CHANGE ANYTHING BELOW THIS LINE *************/

SET @options = 'DEFAULT_DATABASE=MASTER, DEFAULT_LANGUAGE=English'
SET @backslash = (SELECT CHARINDEX('\', @check_mssql_health_USER))
IF @backslash > 0
  BEGIN
    SET @source = ' FROM WINDOWS'
    SET @options = ' WITH ' + @options
  END
ELSE
  BEGIN
    SET @source = ''
    SET @options = ' WITH PASSWORD=''' + @check_mssql_health_PASS + ''',' + @options
  END

PRINT 'create Nagios plugin user ' + @check_mssql_health_USER
EXEC ('CREATE LOGIN ' + @check_mssql_health_USER + @source + @options)
EXEC ('USE MASTER GRANT VIEW SERVER STATE TO ' + @check_mssql_health_USER)
EXEC ('USE MASTER GRANT ALTER trace TO ' + @check_mssql_health_USER)
EXEC ('USE MSDB CREATE USER ' + @check_mssql_health_USER + ' FOR LOGIN ' + @check_mssql_health_USER)
EXEC ('USE MSDB GRANT SELECT ON sysjobhistory TO ' + @check_mssql_health_USER)
EXEC ('USE MSDB GRANT SELECT ON sysjobschedules TO ' + @check_mssql_health_USER)
EXEC ('USE MSDB GRANT SELECT ON sysjobs TO ' + @check_mssql_health_USER)
PRINT 'User ' + @check_mssql_health_USER + ' created.'
PRINT ''

declare dblist cursor for
  select name from sysdatabases WHERE name NOT IN ('master', 'tempdb', 'msdb') open dblist
    fetch next from dblist into @dbname
    while @@fetch_status = 0 begin
      EXEC ('USE [' + @dbname + '] print ''Grant permissions in the db '' + ''"'' + DB_NAME() + ''"''')
      EXEC ('USE [' + @dbname + '] CREATE ROLE ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] GRANT EXECUTE TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] GRANT VIEW DATABASE STATE TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] GRANT VIEW DEFINITION TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] CREATE USER ' + @check_mssql_health_USER + ' FOR LOGIN ' + @check_mssql_health_USER)
      EXEC ('USE [' + @dbname + '] EXEC sp_addrolemember ' + @check_mssql_health_ROLE + ' , ' + @check_mssql_health_USER)
      EXEC ('USE [' + @dbname + '] print ''Permissions in the db '' + ''"'' + DB_NAME() + ''" granted.''')
      fetch next from dblist into @dbname
    end
close dblist
deallocate dblist
```

Please keep in mind that check_mssql_health’s functionality is limited when using SQL Server authentication. **This method is strongly discouraged** . Normally there is already a Nagios-(Windows-)-user which can be used for the Windows authentication method.

Another script from the same author removes the monitoring user from the database.
``` sql
declare @dbname varchar(255)
declare @check_mssql_health_USER varchar(255)
declare @check_mssql_health_ROLE varchar(255)

SET @check_mssql_health_USER = '"[Servername|Domainname]\Username"'
SET @check_mssql_health_ROLE = 'Rolename'

declare dblist cursor for
  select name from sysdatabases WHERE name NOT IN ('master', 'tempdb', 'msdb') open dblist
    fetch next from dblist into @dbname
    while @@fetch_status = 0 begin
      EXEC ('USE [' + @dbname + '] print ''Revoke permissions in the db '' + ''"'' + DB_NAME() + ''"''')
      EXEC ('USE [' + @dbname + '] EXEC sp_droprolemember ' + @check_mssql_health_ROLE + ' , ' + @check_mssql_health_USER)
      EXEC ('USE [' + @dbname + '] DROP USER ' + @check_mssql_health_USER)
      EXEC ('USE [' + @dbname + '] REVOKE VIEW DEFINITION TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] REVOKE VIEW DATABASE STATE TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] REVOKE EXECUTE TO ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] DROP ROLE ' + @check_mssql_health_ROLE)
      EXEC ('USE [' + @dbname + '] print ''Permissions in the db '' + ''"'' + DB_NAME() + ''" revoked.''')
      fetch next from dblist into @dbname
    end
close dblist
deallocate dblist

PRINT ''
PRINT 'drop Nagios plugin user ' + @check_mssql_health_USER
EXEC ('USE MSDB DROP USER ' + @check_mssql_health_USER)
EXEC ('USE MASTER REVOKE VIEW SERVER STATE TO ' + @check_mssql_health_USER)
EXEC ('DROP LOGIN ' + @check_mssql_health_USER)
PRINT 'User ' + @check_mssql_health_USER + ' dropped.'
```
Many thanks to Birk Bohne for the excellent scripts.

## Examples ##
``` bash
nagsrv$ check_mssql_health --mode mem-pool-data-buffer-hit-ratio
CRITICAL - buffer cache hit ratio is 71.21% | buffer_cache_hit_ratio=71.21%;90:;80:

nagsrv$ check_mssql_health --mode batch-requests
OK - 9.00 batch requests / sec | batch_requests_per_sec=9.00;100;200

nagsrv$ check_mssql_health --mode full-scans
OK - 6.14 full table scans / sec | full_scans_per_sec=6.14;100;500

nagsrv$ check_mssql_health --mode cpu-busy
OK - CPU busy 55.00% | cpu_busy=55.00;80;90

nagsrv$ check_mssql_health --mode database-free --name AdventureWorks
OK - database AdventureWorks has 21.59% free space left | 'db_adventureworks_free_pct'=21.59%;5:;2: 'db_adventureworks_free'=703MB;4768371582.03:;1907348632.81:;0;95367431640.62

nagsrv$ check_mssql_health --mode database-free --name AdventureWorks \
--warning 700: --critical 200: --units MB
WARNING - database AdventureWorks has 694.12MB free space left | 'db_adventureworks_free_pct'=21.31%;0.00:;0.00: 'db_adventureworks_free'=694.12MB;700.00:;200.00:;0;95367431640.62

nagsrv$ check_mssql_health --mode page-life-expectancy
OK - page life expectancy is 8950 seconds | page_life_expectancy=8950;300:;180:

nagsrv$ check_mssql_health --mode database-backup-age --name AHLE_WORSCHT \
--warning 72 --critical 120
WARNING - AHLE_WORSCHT backupped 102h ago | 'AHLE_WORSCHT_bck_age'=102;72;120 'AHLE_WORSCHT_bck_time'=12
```

## Using environment variables ##
You can omit the parameters --hostname, --port (or the alternative --server), --username und --password completely, if you pass the respective data via environment variables. Since version 3.x of Nagios you can add your own attributes to service definittions (custom object variables). They appear as environment variables during the runtime of a plugin.

The environment variables are:

* NAGIOS__SERVICEMSSQL_HOST (_mssql_host in the servicedefinition)
* NAGIOS__SERVICEMSSQL_USER (_mssql_user in the servicedefinition)
* NAGIOS__SERVICEMSSQL_PASS (_mssql_pass in the servicedefinition)
* NAGIOS__SERVICEMSSQL_PORT (_mssql_port in the servicedefinition)
* NAGIOS__SERVICEMSSQL_SERVER (_mssql_server in the servicedefinition)

## Installation ##
This Plugin requires the installation of the **Perl-module DBD::Sybase**.
After you unpacked the archive you have to execute ./configure aufgerufen. With ./configure --help you get a list of possible options.

* --prefix=BASEDIRECTORY - The directory where check_mssql_health will be installed (default: /usr/local/nagios)
* --with-nagios-user=SOMEUSER - The user who owns check_mssql_health sein. (default: nagios)
* --with-nagios-group=SOMEGROUP - The group which owns check_mssql_health Binaries. (default: nagios)
* --with-perl=PATHTOPERL - The path to a perl interpreter if you want to use a non-standard one. (default: the perl found in $PATH)

## Security advice ##
The Perl-module DBD::Sybase is based on an installation of FreeTDS auf. This package is responsible for the communication with the database server. The default settings use protocol version 4.x which results in cleartext passwords sent over the wire. Please do change the following parameter in the file /etc/freetds.conf.
``` ini
[global]
# TDS protocol version
# tds version = 4.2
tds version = 8.0
```

## Instances ##
If multiple named instances are listening on the same port of your database server, you need to register them individually in the file /etc/freetds.conf.
``` ini
[dbsrv1instance01]
        host = 192.168.1.19
        port = 1433
        instance = instance01

[dbsrv1instance02]
        host = 192.168.1.19
        port = 1433
        instance = instance02
```

Now you can address the instances e.g. with **\--server dbsrv1instance02** . By using **\--host 192.168.1.19 \--port 1433** you would reach the Default instance.

With recent versions of fteetds it is no longer necessary to maintain a freetds.conf. With **\--server \<FQDN>\\\<Instanz>** it should be possible to establish a connection. This requires a running Service Browser on the database server.

## Download
[Github](https://github.com/lausser/check_mssql_health/tags)

## Changelog
You can find the changelog [here](https://github.com/lausser/check_mssql_health/blob/master/ChangeLog).

## Copyright ##
Gerhard Laußer

Check_mssql_health is published under the GNU General Public License. [GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author
Gerhard Laußer ([gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)) will gladly sell you consulting for MS SQL monitoring.

