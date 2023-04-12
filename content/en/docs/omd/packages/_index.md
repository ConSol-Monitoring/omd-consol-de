---
title: Packages
---
## Monitoring Cores

### Naemon
##### Overview

|`                     `|`                                    `|
|:----------|:--------------------------|
|**Homepage**`         `| [https://www.naemon.io/](https://www.naemon.io/) |
|**Changelog**`        `| [https://www.naemon.io/](https://www.naemon.io/) |
|**Documentation**`    `| [https://www.naemon.io/](https://www.naemon.io/documentation/) |
|**Get version**`      `| naemon --version |
|**OMD default**`      `| enabled |
|**OMD URL**`          `| \<site>/thruk |

The Naemon core is a network monitoring tool based on the Nagios 4 core, but with many bug fixes, new features, and performance enhancements.

##### Directory Layout
|||
|----------|--------------------------|
|**Global Config Directory**| \<site>/etc/naemon & \<site>/etc/naemon/naemon.d |
|**Object Config Directory**| \<site>/etc/naemon/conf.d |
|**Logfiles**| \<site>/var/naemon |

##### OMD Options & vars

OMD options could be set via *omd config* there are also detailed and additional Informations displayed.

For short use CLI directly *omd config set \<OPTION> \<VALUE>*.



  * Monitoring Cores
    * [Naemon](packages/naemon/ "Naemon package")
    * [Nagios (until OMD 2)](packages/nagios/ "Nagios package")
    * Icinga 2

## Webserver
  * Webserver
    * [Apache](packages/apache/ "Apache Webserver")
  * GUI
    * [Thruk](packages/thruk/ "Thruk package")
  * Graphing
    * [PNP4Nagios](packages/pnp4nagios/ "PNP4Nagios package")
    * [Grafana](packages/grafana/ "Grafana package")
    * [Nagflux](packages/nagflux/ "Nagflux package")
    * [Histou](packages/histou/ "Histou package")
  * Databases
    * [MySQL/MariaDB](packages/mariadb/ "MySQL/MariaDB package")
    * [InfluxDB](packages/influxdb/ "InfluxDB package")
  * Add-ons
    * [Mod-Gearman](packages/gearman/ "Mod-Gearman package")
    * [Dokuwiki](packages/dokuwiki/ "Dokuwiki package")
    * [NSCA](packages/nsca/ "NSCA package")
    * [Coshsh](packages/coshsh/ "Coshsh package")
    * [LMD](packages/lmd/ "LMD - Livestatus Multitool Daemon")
    * [Downtime-API](packages/downtimeapi/ "Downtime API")
  * Prometheus
    * [Prometheus](packages/prometheus_core/ "Prometheus package")
    * [SNMP Exporter](packages/prometheus_snmp_exporter/ "SNMP Exporter package")
    * Alertmanager
    * Pushgateway
    * Blackbox exporter
  * Monitoring-Plugins
    * [Standard Plugins](packages/plugins/ "Monitoring Plugins")
    * JMX4Perl
    * [check_logfiles](packages/check_logfiles/)
    * [check_mysql_health](packages/check_mysql_health/)
    * [check_oracle_health](packages/check_oracle_health/)
    * [check_mssql_health](packages/check_mssql_health/)
    * [check_sap_health](packages/check_sap_health/)
    * [check_nwc_health](packages/check_nwc_health/)
    * check_pdu_health
    * check_ups_health
    * check_tl_health
    * check_mailbox_health
    * check_rittal_health
    * check_wut_health
    * check_webinject
    * check_multi
    * [check_vmware_esx](packages/check_vmware_esx/)
