---
title: MariaDB
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
### Overview

|||
|---|---|
|Homepage:|https://mariadb.org/|
|Changelog:|https://mariadb.com/kb/en/mariadb/changelogs/|
|Documentation:|https://mariadb.com/kb/en/|
|Get version:|mariadb --version|
|OMD default:|disabled|
|OMD connectivity:|SOCKET &lt;site&gt;/tmp/run/mysqld/mysqld.sock|

MariaDB is a community-developed fork of the MySQL relational database management system intended to remain free under the GNU GPL. ... MariaDB intends to maintain high compatibility with MySQL, ensuring a "drop-in" replacement capability with library binary equivalency and exact matching with MySQL APIs and commands. It includes the XtraDB storage engine for replacing InnoDB, as well as a new storage engine, Aria, that intends to be both a transactional and non-transactional engine perhaps even included in future versions of MySQL. (Wikipedia)

&#x205F;
### Directory Layout

|||
|---|---|
|Config File:|&lt;site&gt;/.my.cnf|
|Logfiles:|&lt;site&gt;/var/log/mysql/|
|Data Directory:|&lt;site&gt;/var/mysql/|
|TMP Directory:|&lt;site&gt;/tmp|

&#x205F;

### OMD Options & vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| MYSQL | on <br> **off** | enable MariaDB (default off) |

