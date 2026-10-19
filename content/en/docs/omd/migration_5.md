---
title: Migration to 5.x
---

## Migration to OMD-Labs 5.x

There are no known issues when migrating to OMD-Labs 5.x.

This guide covers the changes from OMD-Labs 4.x to 5.70, using 4.60 as the
last 4.x release for comparison. It summarizes component upgrades and changes
that may affect existing sites.

## Major Version Changes

| Component | OMD 4.60 | OMD 5.70 |
| --- | --- | --- |
| Thruk | 2.48.3 | 3.28 |
| Grafana | 7.5.13 | 12.4.3 |
| Loki | 1.6.1 | 3.6.7 |
| Prometheus | 2.32.1 | 3.5.2 |
| Mod-Gearman module | 4.0.2 | 5.2.3 |

Loki 1.6.1 was introduced in OMD 4.00; no later Loki update is listed in the
4.x changelog.

### Thruk 2 to 3

OMD 5.00 introduced Thruk 3.00. OMD 5.70 includes Thruk 3.28.

See [What's new in Thruk 3](https://thruk.org/whatsnew/v3.00.html) for more information.

### Grafana 7 to 12

OMD 5.00 introduced Grafana 9.2.4. Later 5.x releases moved to Grafana 10 and 11,
and OMD 5.70 includes Grafana 12.4.3. An upgrade from OMD 4.x therefore spans
several Grafana major versions.

See [What's new in Grafana 9](https://grafana.com/docs/grafana/v9.0/whatsnew/) for more information.

### Loki 1 to 3

OMD 5.00 introduced Loki 2.7.0, and OMD 5.50 introduced Loki 3.3.1.
OMD 5.70 includes Loki 3.6.7.

### Prometheus 2 to 3

OMD 5.70 includes Prometheus 3.5.2, following Prometheus 2.x in earlier releases.
The Prometheus console assets (CSS, JavaScript and templates) were removed
upstream. As a result, the SNMP console was also removed from OMD 5.70.

### Mod-Gearman 4 to 5

OMD 5.10 introduced Mod-Gearman 5.0.2 and stopped installing the C worker.
OMD 5.70 includes the Mod-Gearman module 5.2.3 and the Go worker 1.7.0.

### Coshsh 11

The 5.x series also includes major Coshsh upgrades: OMD 5.40 shipped 10.2.1.3,
while OMD 5.70 ships 11.1.0.1.

## Migration Changes

- **Python 2:** OMD 5.00 removed the bundled Python 2 modules. Review custom
  scripts that depend on them.
- **Naemon:** Writing `status.dat` is disabled starting with OMD 5.00. Since
  OMD 5.60, relative paths are based on the site folder.
- **VictoriaMetrics:** OMD 5.20 migrated the configuration to a `conf.d` folder.
- **Site permissions:** Starting with OMD 5.30, new sites are created with
  permissions `0750` and group `omd`.
- **Service management:** OMD 5.40 removed `/etc/init.d/omd`; all supported systems
  use systemd.
- **Ansible:** OMD 5.60 replaced the bundled Ansible installation with a package
  dependency on Ansible.
- **Icinga 2:** OMD 5.70 disabled the deprecated check result writer.
- **Sakuli:** OMD 5.70 removed the Sakuli helper files.

## Platform Support

During the 5.x series, build support was added for RHEL 9, Debian 12 and 13,
Ubuntu 22.04, 24.04 and 26.04, and openSUSE Leap 15.4 and 16.0.
Build support was removed for SLES 15 SP4 and SP5 in OMD 5.60, and for Debian 11
and Ubuntu 20.04 in OMD 5.70.
