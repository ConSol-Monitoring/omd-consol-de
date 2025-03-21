---
date: 2025-11-27T10:00:00.000Z
title: A Brief Overview Of The check_vsphere Plugin
tags:
- omd
- vsphere
---

## What is it?

[check\_vsphere](https://github.com/consol-monitoring/check_vsphere)
is a plugin for Naemon, Icinga, and Nagios-compatible systems.
It checks various aspects of ~VMware~Broadcom vCenter or ESX hosts.

For a long time, this was done using `check_vmware_esx.pl`
or `check_esx.pl`. However, Broadcom (formerly VMware)
has decided to deprecate the Perl SDK for vCenter.
Therefore, we decided to rewrite the parts our
customers use in Python using the [pyVmomi](https://github.com/vmware/pyvmomi/)
library.

In this article, I will provide an overview of what the plugin
can do and delve into some of its features.

Development happens at
[Github](https://github.com/consol-monitoring/check_vsphere).
Feel free to open issues or pull requests.

## Authentication

Currently, only user/password-based authentication is supported. The
common options needed to establish a connection are:

* `-u USERNAME`
* `-p PASSWORD` can be omitted in favor of the `VSPHERE_PASS`
  environment variable
* `-s ADDR` hostname of the vCenter or ESX host
* `-nossl` whether TLS verification should be skipped

So a command line has at least this basic structure:

```
check_vsphere subcommand -u user -p pass -s addr [subcommand options]
```

In this document `[AUTH]` just means: `-u user -p pass -s addr`.

## Checks

Here is a brief overview of some features, to see the full list please see
[the documentation](https://omd.consol.de/docs/plugins/check_vsphere/cmd/).

### VSAN

The [vsan](/docs/plugins/check_vsphere/cmd/vsan/) command
offers two modes:

* `healthtest` – shows exactly what you see under
  **Cluster → Monitor → vSAN → Skyline Health** in vCenter.
* `objecthealth` – performs a detailed check of vSAN object health.

Please try them, they are not used very much and may need some fine tuning.

### Host checks

There are several host checks in `check_vsphere`:

* **[host-runtime](/docs/plugins/check_vsphere/cmd/host-runtime/)**
  offers a few modes:
  * **status** – vCenter calculates an overall host status. This mode
    just maps the colors to exit codes (green → OK, yellow → warning,
    red → critical).
  * **con** – checks whether the host can still talk to the vCenter.
  * **health** – runs various health checks exposed by the API for the
    host (memory, voltage, fans, …) and reports any problems.
  * **temp** – walks through the temperature sensors and reports issues.
    The state is determined by the vCenter/ESX host itself.
* **[host-nic](/docs/plugins/check_vsphere/cmd/host-nic/)** -
  This check verifies if all network interfaces are connected
* **[host-service](/docs/plugins/check_vsphere/cmd/host-service/)** -
  This check can verify if various services are running on a host, like ntp, DCUI, vpxa etc.

### VM checks

* **[media](/docs/plugins/check_vsphere/cmd/media/)** –
  spots VMs that still have a CD‑ROM attached.
* **[vm-tools](/docs/plugins/check_vsphere/cmd/vmtools/)** –
  flags VMs without guest tools installed.
* **[vm‑net‑dev](/docs/plugins/check_vsphere/cmd/vmnetdev/)** –
  finds VMs that contain unused network devices.
* **[snapshots](/docs/plugins/check‑vsphere/cmd/snapshots/)** –
  reports VMs with an unexpected number of snapshots or snapshots
  that are too old.
* **[vm‑guestfs](/docs/plugins/check‑vsphere/cmd/vmguestfs/)** –
  monitors filesystem usage of VM volumes via vCenter.

### PerfCounters

#### Overview

The vCenter has a variety of [performance
counters](https://dp-downloads.broadcom.com/api-content/apis/API_VWSA_001/8.0U3/html/ReferenceGuides/vim.PerformanceManager.html).
These counters may be related to VirtualMachines, HostSystems, Datacenters,
ClusterComputeResources, and possibly more.

`check_vmware_esx` had many hard-coded options for specific
performance counters. We decided to generalize this so any
performance counter can be checked with `check_vsphere`.

To get a list of performance counters available on a vCenter, the
`list-metrics` command can be used.

```
check_vsphere list-metrics [AUTH]
```

If you're coming from `check_vmware_esx`,
[the documentation](/docs/plugins/check_vsphere/cmd/perf/#rosetta) has a list of
all the performance counters that were supported by `check_vmware_esx` and their
counterparts in `check_vsphere`. However, as mentioned earlier, you can check
any performance counter. For example, to monitor the power consumption of an ESX
host:

```
check_vsphere perf [AUTH] --perfcounter power:power:average \
  --vimtype HostSystem --vimname esx-hostname \
  --critical 400
```

#### Instances

`check_vmware_esx` and its related tools have a significant bug.
Performance counters can have instances. For example, disk I/O counters
are available for each disk, where each disk represents an instance of
the counter. When you monitor this with `check_vmware_esx`, you only
monitor a random disk and ignore all the others. Yes, we have been
monitoring random disks for years.

With `check_vsphere`, you can now check specific disks using the
`--perfinstance` flag. The default instance is an empty string, which
is a special value. It monitors the aggregate (average) across all
instances where this is applicable. This is only available when it
makes sense; for example, CPU usage can have an aggregate over all
cores. However, calculating the average across several different disks
is generally not meaningful, so vSphere does not provide this aggregate.

You can also check each instance with `--perfinstance '*'`. In this
case, the threshold is applied to each instance, and the highest
criticality is returned.

```
# check disk latency
# the default perfinstance is '' which is the aggregate and not available
# for this counter
$ check_vsphere perf -s vcenter.example.com -u naemon@vsphere.local -nossl \
	--vimname esx1.int.example.com --vimtype HostSystem \
	--perfcounter disk:totalLatency:average
UNKNOWN: Cannot find disk:totalLatency:average for the queried resources

# On that error you may want to try --perfinstance '*'
# now you see all instances for this counter

$ check_vsphere perf -s vcenter.example.com -u naemon@vsphere.local -nossl \
	--vimname esx1.int.example.com --vimtype HostSystem \
	--perfcounter disk:totalLatency:average --perfinstance '*'
OK: disk:totalLatency:average_naa.6000eb3810d426400000000000000277 has value 0 Millisecond
disk:totalLatency:average_naa.600605b00ba8cb0022564867b8c8cc32 has value 2 Millisecond
disk:totalLatency:average_naa.6000eb3810d4264000000000000000b2 has value 0 Millisecond
disk:totalLatency:average_naa.600605b00ba8cb001fd947850523e56d has value 0 Millisecond
disk:totalLatency:average_naa.600605b00ba8cb0029700b163217244e has value 6 Millisecond
disk:totalLatency:average_naa.6000eb3810d4264000000000000002b3 has value 1 Millisecond
| 'disk:totalLatency:average_naa.6000eb3810d426400000000000000277'=0.0ms;;;;
'disk:totalLatency:average_naa.600605b00ba8cb0022564867b8c8cc32'=2.0ms;;;;
...

# you can also check a single instance specifically
$ check_vsphere perf -s vcenter.example.com -u naemon@vsphere.local -nossl \
	--vimname esx1.int.example.com --vimtype HostSystem \
	--perfcounter disk:totalLatency:average --perfinstance naa.600605b00ba8cb0022564867b8c8cc32
OK: disk:totalLatency:average_naa.600605b00ba8cb0022564867b8c8cc32 has value 2 Millisecond
| 'disk:totalLatency:average_naa.600605b00ba8cb0022564867b8c8cc32'=2.0ms;;;;
```
