---
title: Packages
description: "Explore the monitoring cores, dashboards, metrics tools, and plugins included in OMD Labs-Edition."
no_list: true
---

OMD Labs-Edition brings your monitoring tools together in one installation. Browse the components below for package configuration, site paths, and integration details. This catalogue highlights the included tools; it is not an exhaustive package manifest.

## Packages

<div class="omd-packages-grid">

{{< omd-package-group title="Monitoring & web interfaces" icon="fa-desktop" description="Run your monitoring core and access its results." >}}
- [Naemon](naemon/) — Default Nagios-compatible monitoring core.
- [Thruk](thruk/) — Web interface for your monitoring sites.
- [Apache](apache/) — Web server for the included interfaces.
- Icinga 2 — Alternative monitoring core.
{{< /omd-package-group >}}

{{< omd-package-group title="Dashboards & graphing" icon="fa-chart-line" description="Turn monitoring data into graphs and dashboards." >}}
- [Grafana](grafana/) — Dashboards and visualizations.
- [PNP4Nagios](pnp4nagios/) — Graphs from plugin performance data.
- [Nagflux](nagflux/) — Forward performance data to a metrics database.
- [Histou](histou/) — Generate Grafana dashboards from templates.
{{< /omd-package-group >}}

{{< omd-package-group title="Metrics & databases" icon="fa-database" description="Store and query monitoring data." >}}
- [VictoriaMetrics](victoriametrics_core/) — Time series storage.
- [VMauth](vmauth/) — Authentication proxy for VictoriaMetrics.
- [InfluxDB](influxdb/) — Time series database for performance data.
- [MariaDB](mariadb/) — MySQL-compatible database.
{{< /omd-package-group >}}

{{< omd-package-group title="Prometheus ecosystem" icon="fa-bullseye" description="Collect metrics and handle alerts." >}}
- [Prometheus](prometheus_core/) — Metrics collection and querying.
- [SNMP Exporter](prometheus_snmp_exporter/) — Collect metrics from SNMP devices.
- Alertmanager — Alert routing and notifications.
- Pushgateway — Receive metrics pushed by jobs.
- Blackbox exporter — Probe network endpoints.
{{< /omd-package-group >}}

{{< omd-package-group title="Logs & knowledge" icon="fa-file-alt" description="Bring logs and operational documentation into your setup." >}}
- [Loki](loki_core/) — Log aggregation and querying.
- [Promtail](loki_promtail/) — Ship local logs to Loki.
- [DokuWiki](dokuwiki/) — Documentation for your monitoring environment.
{{< /omd-package-group >}}

{{< omd-package-group title="Automation & integration" icon="fa-project-diagram" description="Generate configuration and connect monitoring components." >}}
- [Coshsh](coshsh/) — Generate monitoring configuration from a CMDB.
- [Mod-Gearman](gearman/) — Distribute monitoring checks.
- [LMD](lmd/) — Aggregate and cache Livestatus backends.
- [NSCA](nsca/) — Submit passive check results.
- [Downtime API](downtimeapi/) — Manage scheduled downtime through an API.
{{< /omd-package-group >}}

</div>

## Monitoring plugins

OMD includes the [standard Monitoring Plugins](plugins/) and additional checks for databases, networks, and applications. Usage, options, and examples for plugins created by ConSol are maintained in [Plugins Documentation](/docs/plugins/).

<div class="omd-packages-grid omd-packages-grid--plugins">

{{< omd-package-group title="Database checks" icon="fa-database" description="Monitor database availability and health." >}}
- [check_mysql_health](/docs/plugins/check_mysql_health/) — MySQL.
- [check_mssql_health](/docs/plugins/check_mssql_health/) — Microsoft SQL Server.
- [check_oracle_health](/docs/plugins/check_oracle_health/) — Oracle Database.
{{< /omd-package-group >}}

{{< omd-package-group title="Network & infrastructure checks" icon="fa-network-wired" description="Check network devices, power systems, and infrastructure." >}}
- [check_nwc_health](/docs/plugins/check_nwc_health/) — Network components.
- [check_ups_health](/docs/plugins/check_ups_health/) — UPS systems.
- [check_tl_health](/docs/plugins/check_tl_health/) — Tape libraries.
- [check_vsphere](/docs/plugins/check_vsphere/) — VMware vSphere monitoring.
{{< /omd-package-group >}}

{{< omd-package-group title="Application & log checks" icon="fa-search" description="Inspect applications, mail services, and log files." >}}
- [check_logfiles](/docs/plugins/check_logfiles/) — Log file pattern matching.
- [check_sap_health](/docs/plugins/check_sap_health/) — SAP NetWeaver.
- [check_mailbox_health](/docs/plugins/check_mailbox_health/) — Mailbox checks.
- [check_webinject](/docs/plugins/check_webinject/) — Web application checks.
{{< /omd-package-group >}}

{{< omd-package-group title="Additional bundled checks" icon="fa-puzzle-piece" description="Further tools included in the monitoring toolkit." >}}
- JMX4Perl — Java JMX monitoring.
- check_pdu_health, check_rittal_health, and check_wut_health — Power and environmental monitoring.
- check_multi — Combine multiple checks.
{{< /omd-package-group >}}

</div>

