---
title: Grafana Graphing
hidden: true
---

## Grafana Graphing

To enable Nagflux/Histou/Grafana performance graphs instead of PNP4nagios, execute the following steps:

``` bash
omd config set PNP4NAGIOS off
omd config set GRAFANA on
omd config set INFLUXDB on
omd config set NAGFLUX on
```

When using icinga 2 as core, you have to enable the performance write by

``` bash
icinga2 feature enable perfdata
```

Afterwards change the template imports from `host-pnp` or `srv-pnp` to `host-perf` or `srv-perf` for your configuration to use the correct `action_url`.
Or change the urls in the `host-pnp` and `srv-pnp` template, Whatever is easier in your case. For example:
``` text
define service {
# OLD
use srv-pnp,...
...
# NEW
use srv-perf,...
...
}
```


### PNP4Nagios RRD Export

It is possible to import the existing RRD data into the influxdb by running the following script:

``` bash
~/bin/migrate_pnp_to_nagflux
```

This might take a while, depending on the number of RRD files.


### Dual graphing with PNP4Nagios and Grafana

It is possible to run both PNP and Grafana in parallel, for example during migrations or
for evaluation purposes. This is best achieved by using the Mod-Gearman module to duplicate
performance data.

If you use Mod-Gearman already, just add another `perdata=grafana_data` entry in the
neb module configuration `etc/mod-gearman/server.cfg`.

If you don't use Mod-Gearman yet, switch it on using `omd config` and set `services=no`
and `hosts=no` in the neb module configuration `etc/mod-gearman/server.cfg`.

Then set pnp into gearman mode with:

``` bash
omd config set PNP4NAGIOS gearman
```

and set `Enabled = true` in the `ModGearman` section of `etc/nagflux/config.gcfg`.
Also change the Queue to `grafana_data`.

Note you have to choose a primary graphing solution in thruk by using the right action_url in
your hosts / services. You can only use one here, either PNP or Grafana. However, you can
choose that freely for each host and service separatly.
