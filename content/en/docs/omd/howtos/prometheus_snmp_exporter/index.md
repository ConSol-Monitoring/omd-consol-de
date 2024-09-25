---
title: SNMP Exporter
hidden: true
---

## Prometheus SNMP Exporter

### Goal
* Gather metrics from SNMP enabled devices
* Store metrics in the Prometheus timeseries database
* Present metrics in Grafana Dashboards

### Notes
The process of collecting metrics via Prometheus is completely detached from any Monitoring Core. If you are new to Prometheus, read first [the documentation](https://prometheus.io/docs/introduction/overview/).

### Steps

#### Enable Prometheus & Grafana
``` bash
su - SITE_USER
omd config set GRAFANA on
omd config set PROMETHEUS on
omd config set PROMETHEUS_SNMP_EXPORTER on
```

#### Get SNMP MIB files

SNMP MIB files are needed by Prometheus to translate the OIDs into human readable metric names. Most manufacturers provide there MIBs as download directly from the systems (or appliances).

#### Generate SNMP Exporter config

Put all needed MIB files in a location NetSNMP can read them from. Default pathes ars `$HOME/.snmp/mibs` and `/usr/local/share/snmp/mibs`. For OMD `$OMD_ROOT/.snmp/mibs` is recommended.

Add a new section to "modules" in `$OMD_ROOT/etc/prometheus_snmp_exporter/generator.yml`.

The example below describes a configuration for Cisco ASA Firewalls.

``` yaml
modules:
  CiscoASA:    # The module name. You can have as many modules as you want.
    walk:      # List of OIDs to walk. Can also be SNMP object names or specific instances.
      - sysUpTime
      - interfaces
      - ifXTable
      - 1.3.6.1.4.1.9.9.392.1
      - 1.3.6.1.4.1.9.9.147.1
    lookups:
      - old_index: ifIndex
        new_index: ifDescr
    version: 2  # SNMP version to use. Defaults to 2.
                # 1 will use GETNEXT, 2 and 3 use GETBULK.
    max_repetitions: 25  # How many objects to request with GET/GETBULK, defaults to 25.
                         # May need to be reduced for buggy devices.
    retries: 3   # How many times to retry a failed request, defaults to 3.
    timeout: 10s # Timeout for each walk, defaults to 10s.
```
The Prometheus SNMP exporter ships with a generator for the exporter configuration:
``` bash
OMD[host]:~$ generator generate --output.path="$OMD_ROOT/etc/prometheus_snmp_exporter/snmp.yml"
```
#### Prometheus scrape config
Create a new scrape config file at  `$OMD_ROOT/etc/prometheus/prometheus.d/scrape_configs/static/`

02-snmp-exporter.yml for example :
``` yaml
  - job_name: 'snmp'
    # Override the global default
    scrape_interval: 120s
    scrape_timeout: 90s
    file_sd_configs:
      - files:
        - '/omd/sites/prod/etc/prometheus/conf.d/custom/*.json'

    metrics_path: /snmp
    params:                           # default values
      module: [if_mib]
      community: [public]
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [hostname]
        target_label: instance
      - target_label: __address__
        replacement: 127.0.0.1:9216    # IP:Port to reach snmp exporter
      - source_labels: [snmpCommunity] # Take community from targets
        target_label: __param_community
      - source_labels: [mib]           # Take module also from targets
        target_label: __param_module
```
##### Note
The default Prometheus SNMP Exporter requires each "module" in snmp.yml to have its own SNMP community and SNMP v3 authentication block. We have extended the exporter so that dynamic community strings are possible. We take community information from target configuration (see next section).

#### Prometheus Target config
A target defines a endpoint Prometheus has to scrape for metrics.

Put a target config json file to `$OMD_ROOT/etc/prometheus/conf.d/custom/`.
``` json
[
  {
    "targets": [ "192.168.1.1" ],
    "labels": {
      "hostname": "firewall.local",
      "snmpCommunity": "MySecretROCommunity",
      "mib": "CiscoASA"
    }
  }
]
```
You can add as many individual labels as you like. Just extend the "labels" section.

### Finally
Restart both Prometheus and the Prometheus SNMP Exporter:
``` bash
omd reload prometheus
omd reload snmp_exporter
```

Open prometheus WebUI in your browser
``` bash
https://<monitoring-host>/<omd-site>/prometheus/targets
```

You can see successfully scraped SNMP devices at target listed at your WebUI.

As Prometheus Datasource is pre defined in Grafana, you can start immediately creating dashboards with your new SNMP metrics in Grafana.

Have Fun :-)
