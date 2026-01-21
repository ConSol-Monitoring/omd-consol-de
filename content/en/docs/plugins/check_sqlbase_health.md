---
title: check_sqlbase_health
tags:
  - plugins
  - sqlbase
  - gupta
  - database
  - check_sqlbase_health
---

## Description
check_sqlbase_health is a plugin that can check various parameters of a SQLBase database server (also known as Gupta).

## Documentation

### Command line parameters
* *\-\-hostname \<hostname>* The database server
* *\-\-username \<username>* The database user
* *\-\-password \<password>* The user's password
* *\-\-port \<port>* The port the server listens on (Default: 2155)
* *\-\-server \<server>* The server name, as it would appear in a sql.ini file
* *\-\-database \<database>* The name of a database to connect to
* *\-\-mode \<mode>* The mode parameter tells the plugin what to do. See list of possible values below
* *\-\-warning \<range>* Values outside this range trigger a WARNING
* *\-\-critical \<range>* Values outside this range trigger a CRITICAL
* *\-\-environment \<variable>=\<value>* Pass environment variables to the script. Multiple entries possible
* *\-\-method \<connectmethod>* How the plugin should connect to the database (dbi for connection via DBD::Sybase (default), currently no alternatives)

### Modes

| Keyword | Meaning | Value Range |
|---------|---------|-------------|
| connection-time | Measures how long connection establishment and login take | 0..n seconds (1, 5) |
| sql | Result of any SQL command that returns a number. The command itself is passed with the \-\-name parameter. A label for performance data can be passed with the \-\-name2 parameter. With the \-\-units parameter, the output can be supplemented with units (%, c, s, MB, GB, etc.). If the SQL command contains special characters and spaces, it can first be encoded with mode encode. | 0..n |
| sql-runtime | Runtime of any SQL command in seconds. The command itself is passed with the \-\-name parameter. | 0..n (1, 5) |

Note that thresholds should be specified according to the Nagios Developer Guidelines:
* "10" means "Alert if > 10" and
* "90:" means "Alert if < 90"

## Database Preparation
For the plugin to retrieve the necessary information from the database, a user must be created with at least Connect privileges.

``` sql
GRANT CONNECT TO NAGIOS IDENTIFIED BY SECRET;
```

For the plugin to function correctly, the monitoring user needs read rights for the table *SYSSQL.SYSTABLES*. These should be available by default. If not:
``` sql
GRANT SELECT ON SYSSQL.SYSTABLES TO PUBLIC
```

## Runtime Environment
The client software must be installed on the monitoring server, for example in the form of the following packages:
``` bash
yum install SQLBase-common-12.0.1-10862.el7.x86_64.rpm \
    SQLBase-client-12.0.1-10862.el7.x86_64.rpm \
    SQLBase-docs-12.0.1-10862.el7.x86_64.rpm
```

Afterwards, the directory */opt/Gupta/SQLBase* contains the command line tool *sqllxtlk* and the shared library *libsqlbapl.so* required by it.

For both to be found by the plugin, the environment variable *SQLBASE* must be set. (Customers of OMD addon packages don't need to worry about this. Here the client software is located in the *bin* or *lib* directory of a site and the environment is set automatically.)

The program **sqllxtlk** is important; it is used by check_sqlbase_health to communicate with the database server.

## Examples
``` bash
$ SQLBASE=/opt/Gupta/SQLBase check_sqlbase_health --server Server1 --hostname 10.0.2.15 --username NAGIOS --password SECRET --mode connection-time --database ISLAND
OK - 0.05 seconds to connect as NAGIOS | 'connection_time'=0.05;1;5;;

$ check_sqlbase_health --server Server1 --hostname 10.0.2.15 --username NAGIOS --password SECRET --mode connection-time --database ISLAND --environment SQLBASE=/opt/Gupta/SQLBase
OK - 0.05 seconds to connect as NAGIOS | 'connection_time'=0.05;1;5;;

$ SQLBASE=/opt/Gupta/SQLBase check_sqlbase_health --server Server1 --hostname 10.0.2.15 --username NAGIOS --password SECRET --mode sql --name "select 'testresult' from SYSSQL.SYSTABLES" --name2 'test' --regexp  --database ISLAND
OK - output test matches pattern testresult
```

## Installation
This plugin requires a functioning sqllxtlk command.
After unpacking the archive, run **./configure; make**. The finished plugin is then in the *plugins-scripts* directory.

## Download

Go to [Github](https://github.com/lausser/check_sqlbase_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_sqlbase_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser
check_sqlbase_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)