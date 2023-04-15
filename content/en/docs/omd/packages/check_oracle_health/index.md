---
title: check_oracle_health
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
|Homepage:|https://labs.consol.de/nagios/check_oracle_health|
|Changelog:|https://github.com/lausser/check_oracle_health/blob/master/ChangeLog|
|Documentation:|https://labs.consol.de/nagios/check_oracle_health|
|Get version:|check_oracle_health -V|

check_oracle_health is a plugin, which is used to monitor different parameters of a Oracle Database Server. The plugin is bundled with the perl-module DBD::Oracle.  The Oracle Instant Client must be installed separately, it cannot be bundled with omd. (Support contract customers having a valid oracle license get a complete build of omd-labs)

&#x205F;
### Directory Layout

|||
|---|---|
|Bin Directory:|&lt;site&gt;/lib/nagios/plugins (directory is provided by OMD Release please don&#x27;t touch)|

&#x205F;
