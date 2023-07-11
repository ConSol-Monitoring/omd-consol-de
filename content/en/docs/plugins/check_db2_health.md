---
title: check_db2_health
tags:
  - db2
  - database
---
## Description
check_db2_health is a plugin, which is used to monitor various parameters of a DB2 database.

## Documentation

### Commandline parameters

* *\-\-database \<DB-Name\>* The name of the database. (If it was catalogued locally, this parameter is the only you need. Otherwise you must specify database, hostname and port)
* *\-\-hostname \<hostname\>* The database server
* *\-\-port \<port\>* The port, where DB2 listens
* *\-\-username \<username\>* The database user
* *\-\-password \<password\>* The database password
* *\-\-mode \<modus\>* With the mode parameter you tell the plugin what you want it to do. (See the list of possible values in the table below)
* *\-\-name \<objektname\>* You can limit the checks to a specific database object by using the name parameter (e.g. tablespace, buffercache). It is also used for a custom sql statement with --mode sql
* *\-\-name2 \<string\>* If you use --mode sql, the statement appears in the output and the performance data. Use --name2 to specify a custom string.
* *\-\-warning \<range\>* The warning threshold.
* *\-\-critical \<range\>* The critical threshold.
* *\-\-environment \<variable\>=\<wert\>* You can pass environment variables to the plugin by using this parameters. It can be used multiple times.
* *\-\-method \<connectmethode\>* This tells the plugin how to connect to the database. The only method implemented yet is "dbi" which is the default. (It means, the plugin uses the perl module DBD::DB2).
* *\-\-units \<%|KB|MB|GB\>* When using --mode sql you can specify a unit which will appear in the output and the performance data.

Using the \-\-mode parameter with the following arguments tells the plugin what it should monitor.

### Modi

| Keyword| Meaning| Thresholds|
|-------------|---------|------------|
| connection-time| Measures, how long it takes to connect and login.| 0..n seconds (1, 5)
| connected-users| Number of connected users| 0..n (50, 100)
| synchronous-read-percentage| Percentage of synchronous reads (SRP)| 0%..100% (90:, 80:)
| asynchronous-write-percentage| Percentage of asynchronous writes (AWP)| 0%..100% (90:, 80:)
| bufferpool-hitratio| Hitratio in Buffer Pools (can be limited to a specific pool by using --name)| 0%..100% (98:, 90:)
| bufferpool-data-hitratio| The same, but only Data Pages| 0%..100% (98:, 90:)
| bufferpool-index-hitratio| The same, but only Index Pages| 0%..100% (98:, 90:)
| index-usage| Percentage of SELECTs, which use an index| 0%..100% (98:, 90:)
| sort-overflows| Number of sort-overflows per second| 0..n (0.01, 0.1)
| sort-overflow-percentage| Percentage of sorts, which result in an overflow| 0%..100% (5%, 10%)
| deadlocks| Number of deadlocks per second| 0..n (0, 1)
| lock-waits| Number of lock requests per second which could not be satisfied.| 0..n (10, 100)
| lock-waiting| Fraction of time which was spent waiting for locks| 0%..100% (2%, 5%)
| database-usage| Used space in a database| 0%..100% (80%, 90%)
| tablespace-usage| Used space in a tablespace| 0%..100% (90%, 98%)
| tablespace-free| Free space in a tablespace. In contrast to the previous mode you can use units (MB, GB) for the thresholds.| 0%..100% (5:, 2:)
| log-utilization| Used space in a database log| 0%..100% (80, 90)
| last-backup| Days since the last database backup| 0..n (1,2)
| stale-table-runstats| Tables with statistics have not been updated in a while| 0..n (7, -)
| invalid-objects| Number of invalid objects in database (Trigger, Package, View, Routine, Table)| 0..n (7, 99999)
| duplicate-packages| Find packages names which exist more than one time| &#160;
| capture-latency| Latency of the data processed by the capture program| 0..n (10, 60)
| subscription-set-latency| Latency of the subscription set(s)| 0..n (600, 1200)
| sql| Execute a custom sql statement which returns a numerical value. The statement itself is passed as an argument to the --name parameter. A label for the performance data can be set with the --name2 parameter. With the parameter --units you can add units (%, c, s, MB, GB,..) to the putput. If the sql statement contains special characters you can encode it first by using --mode encode.| 0..n
| sql-runtime| Runtime of a custom sql statement in seconds| 0..n (1, 5)
| list-databases| Outputs a list of all databases| &#160;
| list-tablespaces| Outputs a list of all tablespaces| &#160;
| list-bufferpools| Outputs a list of all bufferpools| &#160;
| list-subscription-sets| Outputs a list of all subscription sets| &#160;

Thresholds are set according to the plugin developer guidelines +
"10" means "Alert, if > 10" and +
"90:" means "Alert, if \< 90" +

### Preparation of the database
In order for the plugin to retrieve the necessary information from the database, a (OS-)user "nagios" (with group nagios) is needed. Maybe it already exists because the database server is monitored with check_nrpe or check_by_ssh.

The Monitoring Switches need to be set:

``` sql
update dbm cfg using dft_mon_bufpool on
update dbm cfg using dft_mon_lock on
update dbm cfg using dft_mon_timestamp on
```

The nagios-user (to be exact: the nagios-group. Be careful, the usr nagios has to belong to a group nagios. The *nagios* in the following sql-statement is the group, not the user) gets the necessary privileges:

``` sql
db2inst1$ db2 update dbm cfg using sysmon_group nagios
db2inst1$ db2 grant select,update on table SYSTOOLS.STMG_DBSIZE_INFO to nagios
db2inst1$ db2stop; db2start
```

For version 10.5 (Caution, 10.x is not officially supported. You have to pay for the implementation) you also need the following command:

``` sql
db2inst1$ db2 grant execute on function sysproc.MON_GET_DATABASE to nagios
```

## Examples

``` bash
nagsrv$ check_db2_health --mode connection-time
WARNING - 1.61 seconds to connect as DB2INST1 |  connection_time=1.6084;1;5

nagsrv$ check_db2_health --mode connected-users
OK - 3 connected users |  connected_users=3;50;100

nagsrv$ check_db2_health --mode list-databases
TOOLSDB
OK - have fun

nagsrv$ check_db2_health --mode database-usage
OK - database usage is 31.29% |  'db_toolsdb_usage'=31.29%;80;90

nagsrv$ check_db2_health --mode tablespace-usage
CRITICAL - tbs TEMPSPACE1 usage is 100.00%, tbs TBSP32KTMP0000 usage is 100.00%, tbs TBSP32K0000 usage is 100.00%, tbs USERSPACE1 usage is 5.08%, tbs SYSTOOLSPACE usage is 1.86%, tbs SYSCATSPACE usage is 80.37% |  'tbs_userspace1_usage_pct'=5.08%;90;98 'tbs_userspace1_usage'=16MB;288;313;0;320 'tbs_tempspace1_usage_pct'=100.00%;90;98 'tbs_tempspace1_usage'=0MB;0;0;0;0 'tbs_tbsp32ktmp0000_usage_pct'=100.00%;90;98 'tbs_tbsp32ktmp0000_usage'=0MB;0;0;0;0 'tbs_tbsp32k0000_usage_pct'=100.00%;90;98 'tbs_tbsp32k0000_usage'=61MB;55;60;0;61 'tbs_systoolspace_usage_pct'=1.86%;90;98 'tbs_systoolspace_usage'=0MB;28;31;0;32 'tbs_syscatspace_usage_pct'=80.37%;90;98 'tbs_syscatspace_usage'=51MB;57;62;0;64

nagsrv$ check_db2_health --mode list-tablespaces
SYSCATSPACE
SYSTOOLSPACE
TBSP32K0000
TBSP32KTMP0000
TEMPSPACE1
USERSPACE1
OK - have fun

nagsrv$ check_db2_health --mode tablespace-usage --name SYSCATSPACE
OK - tbs SYSCATSPACE usage is 80.37% |  'tbs_syscatspace_usage_pct'=80.37%;90;98 'tbs_syscatspace_usage'=51MB;57;62;0;64

nagsrv$ check_db2_health --mode tablespace-free --name SYSCATSPACE
OK - tbs SYSCATSPACE has 19.63% free space left |  'tbs_syscatspace_free_pct'=19.63%;5:;2: 'tbs_syscatspace_free'=12MB;3.20:;1.28:;0;64.00

nagsrv$ check_db2_health --mode tablespace-free --name SYSCATSPACE --units MB
OK - tbs SYSCATSPACE has 12.55MB free space left |  'tbs_syscatspace_free_pct'=19.63%;7.81:;3.12: 'tbs_syscatspace_free'=12.55MB;5.00:;2.00:;0;64.00

nagsrv$ check_db2_health --mode tablespace-free --name SYSCATSPACE --units MB --warning 15: --critical 10:
WARNING - tbs SYSCATSPACE has 12.55MB free space left |  'tbs_syscatspace_free_pct'=19.63%;23.44:;15.62: 'tbs_syscatspace_free'=12.55MB;15.00:;10.00:;0;64.00

nagsrv$ check_db2_health --mode bufferpool-hitratio
CRITICAL - bufferpool IBMDEFAULTBP hitratio is 53.60%, bufferpool BP32K0000 hitratio is 100.00% |  'bp_ibmdefaultbp_hitratio'=53.60%;98:;90: 'bp_ibmdefaultbp_hitratio_now'=100.00% 'bp_bp32k0000_hitratio'=100.00%;98:;90: 'bp_bp32k0000_hitratio_now'=100.00%

nagsrv$ check_db2_health --mode list-bufferpools
BP32K0000
IBMDEFAULTBP
OK - have fun

nagsrv$ check_db2_health --mode bufferpool-hitratio --name IBMDEFAULTBP
CRITICAL - bufferpool IBMDEFAULTBP hitratio is 53.60% |  'bp_ibmdefaultbp_hitratio'=53.60%;98:;90: 'bp_ibmdefaultbp_hitratio_now'=100.00%

nagsrv$ check_db2_health --mode bufferpool-data-hitratio --name IBMDEFAULTBP
CRITICAL - bufferpool IBMDEFAULTBP data page hitratio is 64.35% |  'bp_ibmdefaultbp_hitratio'=64.35%;98:;90: 'bp_ibmdefaultbp_hitratio_now'=100.00%

nagsrv$ check_db2_health --mode bufferpool-index-hitratio --name IBMDEFAULTBP
CRITICAL - bufferpool IBMDEFAULTBP index hitratio is 38.89% |  'bp_ibmdefaultbp_hitratio'=38.89%;98:;90: 'bp_ibmdefaultbp_hitratio_now'=100.00%

nagsrv$ check_db2_health --mode index-usage
CRITICAL - index usage is 0.71% |  index_usage=0.71%;98:;90:

nagsrv$ check_db2_health --mode synchronous-read-percentage
OK - synchronous read percentage is 100.00% |  srp=100.00%;90:;80:

nagsrv$ check_db2_health --mode asynchronous-write-percentage
CRITICAL - asynchronous write percentage is 0.00% |  awp=0.00%;90:;80:
nagsrv$ check_db2_health --mode deadlocks
OK - 0.000000 deadlocs / sec |  deadlocks_per_sec=0.000000;0;1

nagsrv$ check_db2_health --mode lock-waits
OK - 0.000000 lock waits / sec |  lock_waits_per_sec=0.000000;10;100

nagsrv$ check_db2_health --mode lock-waiting
OK - 0.000000% of the time was spent waiting for locks |  lock_percent_waiting=0.000000%;2;5
```

### Using environment variables
The parameters \-\-hostname, \-\-username, \-\-password and \-\-port can be omitted, if the corresponding data are available via environment variables. Since version 3.x of nagios, service definitions can have custom attributes, which can be used to specify login data. During the plugin execution they are available as environment variables .

Die Environmentvariablen heissen:

* NAGIOS__SERVICEDB2_HOST (_db2_host in the service definition)
* NAGIOS__SERVICEDB2_USER (_db2_user in the service definition)
* NAGIOS__SERVICEDB2_PASS (_db2_pass in the service definition)
* NAGIOS__SERVICEDB2_PORT (_db2_port in the service definition)
* NAGIOS__SERVICEDB2_DATABASE (_db2_database in the service definition)

## Installation
This plugin requires the installation of the *Perl-Module DBD::DB2* .

After unpacking the tar archive you have to run ./configure. With ./configure \-\-help you get the list of possible options.

* \-\-prefix=BASEDIRECTORY The base directory of the Nagios installation (default: /usr/local/nagios). The final destination for check_db2_health will be the libexec subdirectory.
* \-\-with-nagios-user=SOMEUSER The owner of check_db2_health. (default: nagios)
* \-\-with-nagios-group=SOMEGROUP The group of check_db2_health. (default: nagios)
* \-\-with-perl=PATHTOPERL A non-standard perl interpreter. (default: perl found in PATH)

## Download
Go to [github](https://github.com/lausser/check_db2_health), clone and build.

## Changelog
Go to [github](https://github.com/lausser/check_db2_health/ChangeLog) and have a look.

### Copyright
Gerhard Lausser
Check_db2_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/gpl.html)

### Autor
Gerhard Laußer (mailto:gerhard.lausser@consol.de[gerhard.lausser@consol.de])

