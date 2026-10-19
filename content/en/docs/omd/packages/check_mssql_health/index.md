---
title: check_mssql_health
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
|Homepage:|https://labs.consol.de/nagios/check_mssql_health|
|Changelog:|https://github.com/lausser/check_mssql_health/blob/master/ChangeLog|
|Documentation:|https://labs.consol.de/nagios/check_mssql_health|
|Get version:|check_mssql_health -V|

check_mssql_health is a plugin used to monitor various parameters of an MS SQL Server. The plugin is bundled with FreeTDS (an open source client library for SQL Server and Sybase) and the Perl module DBD::Sybase.

&#x205F;
### Directory Layout

|||
|---|---|
|Bin Directory:|&lt;site&gt;/lib/nagios/plugins (directory is provided by OMD Release please don&#x27;t touch)|
|Client config:|&lt;site&gt;/etc/freetds/freetds.conf|

&#x205F;
