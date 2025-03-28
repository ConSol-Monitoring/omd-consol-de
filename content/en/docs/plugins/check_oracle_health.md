---
title: check_oracle_health
tags:
  - plugins
  - check_oracle_health
  - oracle
  - database
---
## Description
check_oracle_health is a plugin to check various parameters of an Oracle database.

## Documentation

### Warning
*There seems to be a bug in DBD::Oracle 1.76 which hits at least with mode tablespace-usage/free. Stay away from this version and use 1.74*

### Command line parameters

* --connect
  The database name
* --user
  The database user
* --password
  Password of the database user.
* --connect
  Alternativ to the parameters above.
* --connect=sysdba@ Login with / as sysdba (if the user that executes the plugin is privileged to do this)
* --connect=/@token Login with help of the Password Store (assumes --method=sqlplus)
* --mode
  With the mode-parameter you tell the plugin what it should do. See the list of possible values further down.
* --tablespace
  With this you can limit the check of a single tablespace. If this parameter is omitted all tablespaces are checked.
* --datafile
  With this you can limit the check of a single datafile. If this parameter is omitted all datafiles are checked.
* --name
  Here the check can be limited to a single object (Latch, Enqueue, Tablespace, Datafile). If this parameter is omitted all objects are checked. (Instead of --tablespace or --datafile this parameter can and should be used. It servers the purpose to standardize the CLI interface.)
* --name2
  If you use --mode=sql, then the SQL-Statement appears in the output and performance values. With the parameter name2 you're able to specify a custom string for this.
* --regexp Through this switch the value of the --name Parameters will be interpreted as regular expression.
* --warning
  Determined values outside of this range trigger a WARNING.
* --critical
  Determined values outside of this range trigger a CRITICAL.
* --absolute Without --absolute values that increase in the course of time will show the increase per second or with --absolute show the difference between the current and last run.
* --runas
  With this parameter it is possible to run the script under a different user. (Calls sudo internally: sudo -u .
* --environment
  With this you can pass environment variables to the script. For example: --environment ORACLE_HOME=/u01/oracle. Multiple declarations are possible.
* --method
  With this parameter you tell the plugin how it should connect to the database. (**dbi** for using DBD::Oracle (default), **sqlplus** for using the sqlplus-Tool).
* --units=\<%\|KB\|MB\|GB> The declaration from units servers the "beautification" of the output from mode=sql and simplification from threshold values when using mode=tablespace-free
* --dbthresholds With this parameter thresholds are read from the database table check_oracle_health_thresholds
* --statefilesdir This parameter tells the plugin not do use the default directory for temporary files, but a user-specified one. It can be important in a clustered environment with shared filesystems.
* --morphmessage This parameter allows subsequently changing the plugin output.

Use the option --mode with various keywords to tell the Plugin which values it should determine and check.

| Keyword | Description | Range
|---------|-------------|--------------|
| tnsping | Listener
| connection-time | Determines how long connection establishment and login take | 0..n Seconds (1, 5)
| connected-users | The sum of logged in users at the database | 0..n (50, 100)
| session-usage | Percentage of max possible sessions | 0%..100% (80, 100)
| process-usage | Percentage of max possible processes | 0%..100% (80, 100)
| rman-backup-problems | Number of RMAN-errors during the last three days | 0..n (1, 2)
| sga-data-buffer-hit-ratio | Hitrate in the Data Buffer Cache | 0%..100% (98:, 95:)
| sga-library-cache-gethit-ratio | Hitrate in the Library Cache (Gets) | 0%..100% (98:, 95:)
| sga-library-cache-pinhit-ratio | Hitrate in the Library Cache (Pins) | 0%..100% (98:, 95:)
| sga-library-cache-reloads | Reload-Rate in the Library Cache | n/sec (10,10)
| sga-dictionary-cache-hit-ratio | Hitrate in the Dictionary Cache | 0%..100% (95:, 90:)
| sga-latches-hit-ratio | Hitrate of the Latches | 0%..100% (98:, 95:)
| sga-shared-pool-reloads | Reload-Rate in the Shared Pool | 0%..100% (1, 10)
| sga-shared-pool-free | Free Memory in the Shared Pool | 0%..100% (10:, 5:)
| pga-in-memory-sort-ratio | Percentage of sorts in the memory.  | 0%..100% (99:, 90:)
| invalid-objects | Sum of faulty Objects, Indices, Partitions |  
| stale-statistics | Sum of objects with obsolete optimizer statistics | n (10, 100)
| tablespace-usage | Used diskspace in the tablespace | 0%..100% (90, 98)
| tablespace-free | Free diskspace in the tablespace | 0%..100% (5:, 2:)
| tablespace-fragmentation | Free Space Fragmentation Index | 100..1 (30:, 20:)
| tablespace-io-balanc | IO-Distribution under the datafiles of a tablespace | n (1.0, 2.0)
| tablespace-remaining-time | Sum of remaining days until a tablespace is used by 100%. The rate of increase will be calculated with the values from the last 30 days. (With the parameter --lookback different periods can be specified) | Days (90:, 30:)
| tablespace-can-allocate-next | Checks if there is enough free tablespace for the next Extent.  |  
| flash-recovery-area-usage | Used diskspace in the flash recovery area | 0%..100% (90, 98)
| flash-recovery-area-free | Free diskspace in the flash recovery area | 0%..100% (5:, 2:)
| datafile-io-traffic | Sum of IO-Operationes from Datafiles per second | n/sec (1000, 5000)
| datafiles-existing | Percentage of max possible datafiles | 0%..100% (80, 90)
| soft-parse-ratio | Percentage of soft-parse-ratio | 0%..100%
| switch-interval | Interval between RedoLog File Switches | 0..n Seconds (600:, 60:)
| retry-ratio | Retry-Rate in the RedoLog Buffer | 0%..100% (1, 10)
| redo-io-traffic | Redolog IO in MB/sec | n/sec (199,200)
| roll-header-contention | Rollback Segment Header Contention | 0%..100% (1, 2)
| roll-block-contention | Rollback Segment Block Contention | 0%..100% (1, 2)
| roll-hit-ratio | Rollback Segment gets/waits Ratio | 0%..100% (99:, 98:)
| roll-extends | Rollback Segment Extends | n, n/sec (1, 100)
| roll-wraps | Rollback Segment Wraps | n, n/sec (1, 100)
| seg-top10-logical-reads | Sum of the userprocesses under the top 10 logical reads | n (1, 9)
| seg-top10-physical-reads | Sum of the userprocesses under the top 10 physical reads | n (1, 9)
| seg-top10-buffer-busy-waits | Sum of the userprocesses under the top 10 buffer busy waits | n (1, 9)
| seg-top10-row-lock-waits | Sum of the userprocesses under the top 10 row lock waits | n (1, 9)
| event-waits | Waits/sec from system events | n/sec (10,100)
| event-waiting | How many percent of the elapsed time has an event spend with waiting | 0%..100% (0.1,0.5)
| enqueue-contention | Enqueue wait/request-Ratio | 0%..100% (1, 10)
| enqueue-waiting | How many percent of the elapsed time since the last run has an Enqueue spend with waiting | 0%..100% (0.00033,0.0033)
| latch-contention | Latch misses/gets-ratio. With --name a Latchname or Latchnumber can be passed over. (See list-latches) | 0%..100% (1,2)
| latch-waiting | How many percent of the elapsed time since the last run has a Latch spend with waiting | 0%..100% (0.1,1)
| sysstat | Changes/sec for any value from v$sysstat | n/sec (10,10)
| sql | Result of any SQL-Statement that returns a number. The statement itself is passed over with the parameter --name. A Label for the performance data output can be passed over with the parameter --name2.  | n (1,5)
| sql-runtime | The time an sql command needs to run | Seconds (1, 5)
| list-tablespaces | Prints a list of tablespaces
| list-datafiles | Prints a list of datafiles
| list-latches | Prints a list with latchnames and latchnumbers
| list-enqueues | Prints a list with the Enqueue-Names
| list-events | Prints a list with the events from (v$system_event). Besides event_number/event_id a shortened form of the eventname is printed out. This could be use as Nagios service descriptions. Example: lo_fi_sw_co = log file switch completion
| list-background-events | Prints a list with the Background-Events
| list-sysstats | Prints a list with system-wide statistics

Measurements that are dependent on a time interval can be execute differently. To calculate the end result the following is needed: start value, end value and the passed time between this two values. Without further options the inital value will be the value from the last plugin run. The passed time is normally the time of normal_check_interval of the according service.

If the increase per second shouldn't be decisive for the check result, but the difference between two measured values, than use the option --absolute. This is useful for Rollback Segment Wraps which happen very rare so that their rate is nearly 0/sec. Nevertheless you want to be alarmed if the number od this events grows.


The threshold values should be choosen in a way that they can be reached during a retry_check_interval. If not the service will change into the OK-State after each SOFT;1.


Please note, that the thresholds must be specified according to the Nagios plug-in development Guidelines.

* "10" means "Alarm, if > 10" and
* "90:" means "Alarm, if < 90"

### Preparation of the database
In order to be able to collect the needed information from the database a database user with specific privileges is required:
``` sql
create user nagios identified by oradbmon;
grant create session to nagios;
grant select any dictionary to nagios;
grant select on V_$SYSSTAT to nagios;
grant select on V_$INSTANCE to nagios;
grant select on V_$LOG to nagios;
grant select on SYS.DBA_DATA_FILES to nagios;
grant select on SYS.DBA_FREE_SPACE to nagios;
--
-- if somebody still uses Oracle 8.1.7...
grant select on sys.dba_tablespaces to nagios;
grant select on dba_temp_files to nagios;
grant select on sys.v_$Temp_extent_pool to nagios;
grant select on sys.v_$TEMP_SPACE_HEADER  to nagios;
grant select on sys.v_$session to nagios;
```

## Examples
``` bash
nagios$ check_oracle_health --connect bba --mode tnsping
OK - connection established to bba.

nagios$ check_oracle_health --mode connection-time
OK - 0.17 seconds to connect  |
  connection_time=0.1740;1;5

nagios$ check_oracle_health --mode sga-data-buffer-hit-ratio
CRITICAL - SGA data buffer hit ratio 0.99%  |
  sga_data_buffer_hit_ratio=0.99%;98:;95:

nagios$ check_oracle_health --mode sga-library-cache-hit-ratio
OK - SGA library cache hit ratio 98.75%  |
  sga_library_cache_hit_ratio=98.75%;98:;95:

nagios$ check_oracle_health --mode sga-latches-hit-ratio
OK - SGA latches hit ratio 100.00%  |
  sga_latches_hit_ratio=100.00%;98:;95:

nagios$ check_oracle_health --mode sga-shared-pool-reloads
OK - SGA shared pool reloads 0.28%  |
  sga_shared_pool_reloads=0.28%;1;10

nagios$ check_oracle_health --mode sga-shared-pool-free
WARNING - SGA shared pool free 8.91%  |
  sga_shared_pool_free=8.91%;10:;5:

nagios$ check_oracle_health --mode pga-in-memory-sort-ratio
OK - PGA in-memory sort ratio 100.00%  |
  pga_in_memory_sort_ratio=100.00;99:;90:

nagios$ check_oracle_health --mode invalid-objects
OK - no invalid objects found  |
  invalid_ind_partitions=0 invalid_indexes=0
  invalid_objects=0 unrecoverable_datafiles=0

nagios$ check_oracle_health --mode switch-interval
OK - Last redo log file switch interval was 18 minutes |
    redo_log_file_switch_interval=1090s;600:;60:

nagios$ check_oracle_health --mode switch-interval --connect rac1
OK - Last redo log file switch interval was 32 minutes (thread 1)|
    redo_log_file_switch_interval=1938s;600:;60:

nagios$ check_oracle_health --mode tablespace-usage
CRITICAL - tbs SYSTEM usage is 99.33%
tbs SYSAUX usage is 93.73%
tbs USERS usage is 8.75%
tbs UNDOTBS1 usage is 6.65% | 'tbs_users_usage_pct'=8%;90;98
'tbs_users_usage'=0MB;4;4;0;5
'tbs_undotbs1_usage_pct'=6%;90;98
'tbs_undotbs1_usage'=11MB;153;166;0;170
'tbs_system_usage_pct'=99%;90;98
'tbs_system_usage'=695MB;630;686;0;700
'tbs_sysaux_usage_pct'=93%;90;98
'tbs_sysaux_usage'=802MB;770;839;0;856

nagios$ check_oracle_health --mode tablespace-usage
    --tablespace USERS
OK - tbs USERS usage is 8.75% |
  'tbs_users_usage_pct'=8%;90;98
  'tbs_users_usage'=0MB;4;4;0;5

nagios$ check_oracle_health --mode tablespace-usage
    --name USERS
OK - tbs USERS usage is 8.75% |
  'tbs_users_usage_pct'=8%;90;98
  'tbs_users_usage'=0MB;4;4;0;5

nagios$ check_oracle_health --mode tablespace-free
    --name TEST
OK - tbs TEST has 97.91% free space left |
    'tbs_test_free_pct'=97.91%;5:;2:
    'tbs_test_free'=32083MB;1638.40:;655.36:;0.00;32767.98

nagios$ check_oracle_health --mode tablespace-free
    --name TEST --units MB --warning 100: --critical 50:
OK - tbs TEST has 32083.61MB free space left |
    'tbs_test_free_pct'=97.91%;0.31:;0.15:
    'tbs_test_free'=32083.61MB;100.00:;50.00:;0;32767.98

nagios$ check_oracle_health --mode tablespace-free
    --name TEST --warning 10: --critical 5:
OK - tbs TEST has 97.91% free space left |
    'tbs_test_free_pct'=97.91%;10:;5:
    'tbs_test_free'=32083MB;3276.80:;1638.40:;0.00;32767.98

nagios$ check_oracle_health --mode tablespace-remaining-time
    --tablespace ARUSERS --lookback 7
WARNING - tablespace ARUSERS will be full in 78 days |
  'tbs_arusers_days_until_full'=78;90:;30:

nagios$ check_oracle_health --mode flash-recovery-area-free
OK - flra /u00/app/oracle/flash_recovery_area has 100.00% free space left |
    'flra_free_pct'=100.00%;5:;2:
    'flra_free'=2048MB;102.40:;40.96:;0;2048.00

nagios$ check_oracle_health --mode flash-recovery-area-free
    --units KB --warning 1000: --critical 500:
OK - flra /u00/app/oracle/flash_recovery_area has 2097152.00KB free space left |     'flra_free_pct'=100.00%;0.05:;0.02:
    'flra_free'=2097152.00KB;1000.00:;500.00:;0;2097152.00

nagios$ check_oracle_health --mode datafile-io-traffic
  --datafile users01.dbf
WARNING - users01.dbf: 1049.83 IO Operations per Second |
  'dbf_users01.dbf_io_total_per_sec'=1049.83;1000;5000

nagios$ check_oracle_health --mode latch-contention
  --name 214
OK - SGA latch library cache (214) contention 0.08% |
 'latch_214_contention'=0.08%;1;2
 'latch_214_sleep_share'=0.00% 'latch_214_gets'=49995

nagios$ check_oracle_health --mode latch-contention
  --name 'library cache'
OK - SGA latch library cache (214) contention 0.08% |
 'latch_214_contention'=0.08%;1;2
 'latch_214_sleep_share'=0.00% 'latch_214_gets'=49937

nagios$ check_oracle_health --mode enqueue-contention --name TC
CRITICAL - enqueue TC: 19.90% of the requests must wait |
 'TC_contention'=19.90%;1;10
 'TC_requests'=2015 'TC_waits'=401

nagios$ check_oracle_health --mode latch-contention
  --name 'messages'
OK - SGA latch messages (17) contention 0.02% |
 'latch_17_contention'=0.02%;1;2 'latch_17_gets'=4867

nagios$ check_oracle_health --mode latch-waiting
  --name 'user lock'
OK - SGA latch user lock (205) sleeping 0.000841% of the time |
 'latch_205_sleep_share'=0.000841%

nagios$ check_oracle_health --mode event-waits
  --name 'log file sync'
OK - log file sync : 1.839511 waits/sec |
 'log file sync_waits_per_sec'=1.839511;10;100

nagios$ check_oracle_health --mode event-waiting
  --name 'Log file parallel write'
OK - log file parallel write waits 0.045843% of the time |
rarr 'log file parallel write_percent_waited'=0.045843%;0.1;0.5

nagios$ check_oracle_health --mode sysstat
  --name 'transaction rollbacks'
OK - 0.000003 transaction rollbacks/sec |
 'transaction rollbacks_per_sec'=0.000003;10;100
 'transaction rollbacks'=4

nagios$ check_oracle_health --mode sql
  --name 'select count(*) from v$session' --name2 sessions
CRITICAL - sessions: 21 | 'sessions'=21;1;5

nagios$ check_oracle_health --mode sql
  --name 'select 12 from dual' --name2 twelve --units MB
CRITICAL - twelfe: 12MB | 'twelfe'=12MB;1;5

nagios$ check_oracle_health --mode sql
  --name 'select 200,300,1000 from dual'
  --name2 'kaspar melchior balthasar'
  --warning 180 --critical 500
WARNING - kaspar melchior balthasar: 200 300 1000 |
'kaspar'=200;180;500 'melchior'=300;; 'balthasar'=1000;;

nagios$ check_oracle_health --mode sql
  --name "select 'abc123' from dual" --name2 \\d
  --regexp
OK - output abc123 matches pattern \d
```

## Authentication

### Example with --runas and an "external user"
There are to users in the database:

*  OPS$DBNAGIO IDENTIFIED EXTERNALLY
*  NAGIOS IDENTIFIED BY 'DBMONI'

There are two unix users:

*  qqnagio with normal access.
*  dbnagio with /bin/false as login shell.

``` bash
qqnagio$ check_oracle_health --mode=connection-time
    --connect=nagios/dbmoni@BBA
OK - 0.21 seconds to connect as NAGIOS

dbnagio$ check_oracle_health --mode=connection-time
    --connect=BBA --runas=dbnagio
    --environment ORACLE_HOME=$ORACLE_HOME
OK - 0.17 seconds to connect as OPS$DBNAGIO
```

The background for this example is the following scenario with a SAP-Server:

* Only local connections to the database are allowed. The database isn't reachable over the network. Logging in with username and password is not possible.

* Only database-users that are authenticated through the operating system (OPS$-User) are allowed to connect.

* These users are not allowed to connect via SSH. (Therefore /bin/false).

Because the Nagios user qqnagio is allowed to connect via SSH, he can't be used as database user. But the NRPE which executes the plugin will run under the qqnagio-account.

### Use of environment variables
It is possible to omit --connect (and if not needed --user and --password) completely, if you provide the corresponding values in environment variables. Since Version 3.x it is possible to extend service definitions in Nagios through own attributes (custom object variables). These will appear during the exectution of the check command in the environment.

The environment variables are:

*  NAGIOS__SERVICEORACLE_SID (_oracle_sid in the service definition)
*  NAGIOS__SERVICEORACLE_USER (_oracle_user in the service definition)
*  NAGIOS__SERVICEORACLE_PASS (_oracle_pass in the service definition)

## Installation
The installation of the perl-modules DBI and DBD::Oracle is required.

After unpacking the archive ./configure is called. With ./configure --help some options can be printed which show some default values for compiling the plugin.

*  --prefix=BASEDIRECTORY Specify a directory in which check_oracle_health should be stored. (default: /usr/local/nagios)
*  --with-nagios-user=SOMEUSER This User will be the owner of the check_oracle_health file. (default: nagios)
*  --with-nagios-group=SOMEGROUP The group of the check_oracle_health plugin. (default: nagios)
*  --with-perl=PATHTOPERL Specify the path to the perl interpreter you wish to use. (default: perl in PATH)

## Download
[Github](https://github.com/lausser/Check_oracle_health/tags)

## Changelog
You can find the changelog [here](https://github.com/lausser/Check_oracle_health/blob/master/ChangeLog).

## Copyright
2008-3000 Gerhard Laußer

Check_oracle_health is published under the GNU General Public License. [GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author
Gerhard Laußer ([gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)) gladly answers questions to this plugin.

## Translation
Thanks to Christian Lauf there is finally an english translation of this page :-)
