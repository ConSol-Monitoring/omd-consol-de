---
title: check_sap_health
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
|Homepage:|https://labs.consol.de/nagios/check_sap_health|
|Changelog:|https://github.com/lausser/check_sap_health/blob/master/ChangeLog|
|Documentation:|https://labs.consol.de/nagios/check_sap_health|
|Get version:|check_sap_health -V|

check_sap_health is a plugin, which is used to monitor SAP Netweaver instances. It communicates either with a Solution Manager or directly with application servers. Monitoring of SAP loadbalancing is also possible by connecting to the message server of a central instance. With check_sap_health it is possible to monitor CCMS metrics (using SAP's own thresholds or defining custom thresholds), background jobs (duration of the jobs as well as their exit status), short dumps and failed updates. Highlight of this plugin is it's simple API which allows any user to write small extensions. This way it is possible to monitor individual business logic by using the RFC/BAPI-interface. The plugin is bundles with the [sapnwrfc](http://search.cpan.org/~piers/sapnwrfc-0.37/sapnwrfc.pm) perl module. The SAP NW RFC SDK must be installed separately, it cannot be bundled with omd. (Support contract customers which give us access to their sdk license get a complete build of omd-labs)

&#x205F;
### Directory Layout

|||
|---|---|
|Bin Directory:|&lt;site&gt;/lib/nagios/plugins (directory is provided by OMD Release please don&#x27;t touch)|
|Lib Directory:|&lt;site&gt;/local/lib (this is where you place your sdk library files after you installed the perl module with *perl -MCPAN -e &quot;install sapnwrfc&quot;*)|

&#x205F;

[1]: http://search.cpan.org/~piers/sapnwrfc-0.37/sapnwrfc.pm