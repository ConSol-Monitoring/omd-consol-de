---
author: Admin
comments: false
date: 2009-07-06 00:22:05+00:00
layout: page
slug: check_mysql_health
title: check_mysql_health
wordpress_id: 37
---
* TOC
{:toc}
While i'm busy rewriting and refactoring check_mysql_health, i want to know what's your preferred algorithm to calculate the query cache hit rate. Personally, i am 100% neutral. I will implement the algorithm with the most votes. The poll will end at Jul 17.

## Description
check_mysql_health is a plugin to check various parameters of a MySQL database.

## Documentation

### Command line parameters

* \--hostname 
The database server which should be monitored. In case of "localhost" this parameter can be omitted.
* \--username 
The database user.
* \--password 
Password of the database user.
* \--database 
The database the plugin will connect to. Default: information_schema.
* \--mode 
With the mode-parameter you tell the plugin what it should do. See the list of possible values further down.
* \--name 
Here the check can be limited to a single object. (Momentarily this parameter is only used for mode=sql)
* \--name2 
If you use \--mode=sql, then the SQL-Statement appears in the output and performance values. With the parameter name2 you're able to specify a string for this..
* \--warning 
Determined values outside of this range trigger a WARNING.
* \--critical 
Determined values outside of this range trigger a CRITICAL.
* \--environment =
With this you can pass environment variables to the script. Multiple declarations are possible.
* \--method 
With this parameter you tell the plugin how it should connect to the database. (dbi for using DBD::mysql (default), mysql for mysql-Tool).
* \--units <%|KB|MB|GB>
The declaration from units serves the "beautification" of the output from mode=sql

Use the option \--mode with various keywords to tell the Plugin which values it should determine and check.

| Keyword |  Description |  Range |
|---------|-------------|--------------|
| connection-time |  Determines how long connection establishment and login take |  0..n Seconds (1, 5) |
| uptime |  Time since start of the database server (recognizes DB-Crash+Restart) |  0..n Seconds (10:, 5: Minutes) |
| threads-connected |  Number of open connections |  1..n (10, 20) |
| threadcache-hitrate |  Hitrate in the Thread-Cache |  0%..100% (90:, 80:) |
| q[uery]cache-hitrate |  Hitrate in the Query Cache |  0%..100% (90:, 80:) |
| q[uery]cache-lowmem-prunes |  Displacement out of the Query Cache due to memory shortness |  n/sec (1, 10) |
| [myisam-]keycache-hitrate |  Hitrate in the Myisam Key Cache |  0%..100% (99:, 95:) |
| [innodb-]bufferpool-hitrate |  Hitrate in the InnoDB Buffer Pool |  0%..100% (99:, 95:) |
| [innodb-]bufferpool-wait-free |  Rate of the InnoDB Buffer Pool Waits |  0..n/sec (1, 10) |
| [innodb-]log-waits |  Rate of the InnoDB Log Waits |  0..n/sec (1, 10) |
| tablecache-hitrate |  Hitrate in the Table-Cache |  0%..100% (99:, 95:) |
| table-lock-contention |  Rate of failed table locks |  0%..100% (1, 2) |
| index-usage |  Sum of the Index-Utilization (in contrast to Full Table Scans) |  0%..100% (90:, 80:) |
| tmp-disk-tables |  Percent of the temporary tables that were created on the disk instead in memory |  0%..100% (25, 50) |
| slow-queries |  Rate of queries that were detected as "slow" |  0..n/sec (0.1, 1) |
| long-running-procs |  Sum of processes that are runnning longer than 1 minute |  0..n (10, 20) |
| slave-lag |  Delay between Master and Slave |  0..n Seconds |
| slave-io-running |  Checks if the IO-Thread of the Slave-DB is running |    |
| slave-sql-running |  Checks if the SQL-Thread of the Slave-DB is running |    |
| sql |  Result of any SQL-Statement that returns a number. The statement itself is passed over with the parametername. A Label for the performance data output can be passed over with the parameter --name2. The parameter --units can add units to the output (%, c, s, MB, GB,..). If the SQL-Statement includeds special characters or spaces, it can first be encoded with the mode encode. |  0..n |
| open-files |  Number of open files (of upper limit) |  0%..100% (80, 95) |
| encode |  Reads standard input (STDIN) and outputs an encoded string. |    |
| cluster-ndb-running |  Checks if all cluster nodes are running. |    |


The Hitrate of the Query-Cache is calculated from Qcache_hits / ( Qcache_hits + Com_select ). This values are continuously increased. 
This value is calculated through the difference (delta) between Qcache_hits and Com_select (actual value of the variables minus the value since the last run from check_mysql_health).
Several other metrics are also calculated based on the delta of their underlieing counters. By default it's the delta between the value at current timestamp and the counter value when the plugin was last run.
Here the command line parameterlookback can be used. It takes seconds as an argument. The calculation then uses the delta between now and the counter value at this specific amount of seconds in the past.

It's recommended to use \--lookback but specify at least half an hour (\--lookback 1800) because the now-value underlies a heavy fluctuation which would lead to frequent alarms.

Pleae note, that the thresholds must be specified according to the Nagios plug-in development Guidelines.

*  "10" means "Alarm, if > 10" und
*  "90:" means "Alarm, if < 90"

### Creating a database user

In order to be able to collect the needed information from the database a database user with specific privileges is required:

    grant usage on *.* to 'nagios'@'nagiosserver' identified by 'nagiospassword'

### Connectionstring

To connect to the database you use the parametersusername and \--password. The database server which should be used can be specified more precise with \--hostname and \--socket or \--port.

#### Use of environment variables

It's possible to omithostname, \--username and \--password as well as \--socket and \--port completely, if you provide the corresponding values in environment variables. Since Version 3.x it is possible to extend service definitions in Nagios through own attributes (custom object variables). These will appear during the exectution of the check command in the environment.

The environment variables are:

* NAGIOS__SERVICEMYSQL_HOST (_mysql_host in the service definition)
* NAGIOS__SERVICEMYSQL_USER (_mysql_user in the service definition)
* NAGIOS__SERVICEMYSQL_PASS (_mysql_pass in the service definition)
* NAGIOS__SERVICEMYSQL_PORT (_mysql_port in the service definition)
* NAGIOS__SERVICEMYSQL_SOCK (_mysql_sock in the service definition)

## Examples
{% highlight bash %}
nagios$ check_mysql_healthhostname mydb3 --username nagios --password nagios -- mode connection-time
OK - 0.03 seconds to connect as nagios | connection_time=0.0337s;1;5

nagios$ check_oracle_healthmode=connection-time
OK - 0.17 seconds to connect  | connection_time=0.1740;1;5

nagios$ check_mysql_healthmode querycache-hitrate
CRITICAL - query cache hitrate 70.97% | qcache_hitrate=70.97%;90:;80: qcache_hitrate_now=72.25% selects_per_sec=270.00

nagios$ check_mysql_healthmode querycache-hitrate --warning 80: --critical 70:
WARNING - query cache hitrate 70.82% | qcache_hitrate=70.82%;80:;70: qcache_hitrate_now=62.82% selects_per_sec=420.17

nagios$ check_mysql_healthmode sql --name 'select 111 from dual'
CRITICAL - select 111 from dual: 111 | 'select 111 from dual'=111;1;5

nagios$ echo 'select 111 from dual' | check_mysql_healthmode encode
select%20111%20from%20dual

nagios$ check_mysql_healthmode sql --name select%20111%20from%20dual
CRITICAL - select 111 from dual: 111 | 'select 111 from dual'=111;1;5

nagios$ check_mysql_healthmode sql --name select%20111%20from%20dual --name2 myval
CRITICAL - myval: 111 | 'myval'=111;1;5

nagios$ check_mysql_healthmode sql --name select%20111%20from%20dual --name2 myval --units GB
CRITICAL - myval: 111GB | 'myval'=111GB;1;5

nagios$ check_mysql_healthmode sql --name select%20111%20from%20dual --name2 myval --units GB
   warning 100 --critical 110
CRITICAL - myval: 111GB | 'myval'=111GB;100;110
{% endhighlight %}

## Installation
The plugin requires the installation of a mysql-client packages. The installation of the perl-modules DBI and DBD::mysql is desirable, but not mandatory.

After unpacking the archive ./configure is called. With ./configurehelp some options can be printed which show some default values for compiling the plugin.

* \--prefix=BASEDIRECTORY

Specify a directory in which check_mysql_health should be stored. (default: /usr/local/nagios)

* \--with-nagios-user=SOMEUSER

This User will be the owner of the check_mysql_health file. (default: nagios)

* \--with-nagios-group=SOMEGROUP

The group of the check_mysql_health plugin. (default: nagios)

* \--with-perl=PATHTOPERL

Specify the path to the perl interpreter you wish to use. (default: perl in PATH)

## Download

{% asset_download check_mysql_health-2.2.2.tar.gz category:nagios %}

## Changelog

{% embedurl url:https://raw.githubusercontent.com/lausser/check_mysql_health/master/ChangeLog %}

## Copyright

Gerhard Laußer

Check_mysql_health is published under the GNU General Public License. GPL</p>

## Autor

Gerhard Laußer (gerhard.lausser@consol.de) gladly answers questions to this plugin. You got two minutes for free. If the answer takes longer than that you need a support contract.


