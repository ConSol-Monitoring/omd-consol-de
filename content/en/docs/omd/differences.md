---
title: Differences to OMD
---

## Differences to OMD

OMD-Labs contains several new software components compared to the official OMD package.
Some default settings have also changed.

## Additional Software Components

Right now, OMD-Labs only adds new software components and does not remove any. This makes OMD-Labs fully backwards compatible, so you can switch between versions via `omd update`.

### New Monitoring Cores

Besides the stable Nagios 3, OMD-Labs contains two new extra cores:

- Naemon
- Icinga2

While Naemon is fully compatible with the Nagios 3 configuration format, Icinga 2 uses a completely new configuration file format.

### Grafana/Influxdb Graphing

In addition to PNP4Nagios, OMD comes with Grafana graphs based on InfluxDB. To create graphs from templates, [histou](../packages/histou/) is included. The interface between the monitoring core and InfluxDB is implemented in the [nagflux](../packages/nagflux/) component. Read more on the [graphing page](../howtos/grafana/).

### Prometheus Subsystem

In addition to traditional monitoring, OMD-Labs ships with Prometheus, including Alertmanager, Pushgateway and a blackbox exporter.

### LMD - Livestatus Multitool Daemon

LMD makes Thruk much faster when using many backends/sites or when remote sites have a poor connection. Read more on the [lmd page](../packages/lmd/).

### New Check Plugins

There are several additional plugins packaged with OMD-Labs, for example a whole new bunch of check_*_health plugins.

## Changed Default Settings

OMD-Labs changes some default settings to get the most out of OMD. If you upgrade from an existing OMD installation, your settings will not be touched and you have to manually change those settings if you want to.

### Naemon Core

Naemon replaces Nagios as the default core in OMD-Labs.

To revert to the original setting, run:

    #> omd config set CORE nagios

(Since version 3.x Nagios is no longer part of OMD Labs. See the [migration guide](../migration_3))

### Apache SSL/TLS Mode

OMD-Labs comes with SSL/TLS enabled for Apache by default.

To revert to the original setting, run:

    #> omd config set APACHE_MODE own

### Thruk as Default Web UI

Thruk is the default web UI in OMD-Labs.

To revert to the original setting, run:

    #> omd config set DEFAULT_GUI welcome
    #> omd config set THRUK_COOKIE_AUTH off
