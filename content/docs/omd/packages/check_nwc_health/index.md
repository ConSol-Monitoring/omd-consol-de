---
title: check_nwc_health
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
|Homepage:|https://labs.consol.de/nagios/check_nwc_health|
|Changelog:|https://github.com/lausser/check_nwc_health/blob/master/ChangeLog|
|Documentation:|https://labs.consol.de/nagios/check_nwc_health|
|Get version:|check_nwc_health -V|

check_nwc_health is a plugin, which is used to monitor every kind of network component. It allows network admins to implement a complete network operations center based on OMD.

&#x205F;
### Directory Layout

|||
|---|---|
|Bin Directory:|&lt;site&gt;/lib/nagios/plugins (directory is provided by OMD Release please don&#x27;t touch)|

&#x205F;
Supported vendors are: Alcatel, Allied Telesyn, Bluecoat, Brocade, Checkpint, Cisco (IOS, Nexus, Unified Communication, Wlan Controller), Clavister, Cumulus, F5, Fortigate, Foundry, HP, Juniper, Lantronix, Netgear, Nortel, Paloalto.
For these vendors it is possible to monitor cpu, memory, hardware health, wlan, firewall,...(At least for the most common models)
Standard-SNMP-metrics like uptime, interface status and bandwith usage are possible, no matter which vendor/model you have.
The plugin tries to produce as less as possible network traffic. By using local caches (for example a mapping of interface names to indexes) it minimizes the SNMP requests.
Other ways the plugin differs from other network plugins:

* **One** plugin for the whole range of models and queries
* it's a ConSol-plugin :-)
* lots of additional command line parameters like --criticalx, --warningx, --units, --negate, --selectedperfdata, --blacklist, --morphmessage, --morphperfdata, --mitigation, --isvalidtime