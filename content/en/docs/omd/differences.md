---
title: Differences to OMD
---

## Differences to OMD

OMD-Labs contains several new software components compared to the official OMD package.
Also some default settings have changed.

## Additional Software Components

Right now, OMD-Labs only adds new software components and does not remove any which makes OMD-Labs perfectly backwards compatible and you can just switch between versions via `omd update`.

### New Monitoring Cores

Besides the stable Nagios 3, OMD-Labs contains two new extra cores:

 - Naemon
 - Icinga2

While Naemon is fully compatible to Nagios 3 config format, Icinga 2 uses a complete new config file format.


### Grafana/Influxdb Graphing

Next to PNP4Nagios OMD comes with Grafana graphs based on a Influxdb. In order to create template based graphs, there is [histou](../packages/histou/) included. The interface between the monitoring core and the influxdb is implemented in the [nagflux](packages/nagflux/) component. Read more on the [graphing page](../howtos/grafana/).


### Prometheus Subsystem

Next to the traditional monitoring, OMD-Labs ships with prometheus including alert manager, pushgateway and a blackbox exporter.


### LMD - Livestatus Multitool Daemon

LMD makes thruk way faster when using a lot of backends/sites or if the remote sites have a bad connection. Read more on the [lmd page](../packages/lmd/).


### New Check Plugins

There are several additional plugins packaged with OMD-Labs, for example a whole new bunch of check_*_health plugins.


## Changed Default Settings

OMD-Labs changes some default settings to get the most out of OMD. If you upgrade from an existing OMD installation, your settings will not be touched and you have to manually change those settings if you want to.

### Naemon Core

Naemon replaces Nagios as default core in OMD-Labs.

To revert to the original setting, run:

    #> omd config set CORE nagios

(Since version 3.x Nagios is no longer part of OMD Labs. See the [migration guide](../migration_3))


### Apache SSL/TLS Mode

OMD-Labs comes with enabled SSL/TLS Apache by default.

To revert to the original setting, run:

    #> omd config set APACHE_MODE own

### Thruk as Default Web UI

Thruk is the default web ui in OMD-Labs.

To revert to the original setting, run:

    #> omd config set DEFAULT_GUI welcome
    #> omd config set THRUK_COOKIE_AUTH off
