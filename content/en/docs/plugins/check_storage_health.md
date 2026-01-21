---
title: check_storage_health
tags:
  - plugins
  - storage
  - filesystem
  - snapshot
  - check_storage_health
---

## Description
check_storage_health monitors various storage systems. Which ones specifically are supported can be determined by testing - if it doesn't work, then it's not supported.

## Documentation

### Command line parameters

* *\-\-hostname \<hostname or ip>* The hostname or IP address
* *\-\-community \<snmpv2-community>* SNMP community string
* *\-\-mode \<mode>* The monitoring mode
* *\-\-help* Display help information
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold

### Modes

| Keyword| Meaning|
|-------------|---------|
| uptime | Measures how long the device has been running |
| filesystem-free | Checks free space in the filesystem |
| snapshot-age | Checks the age of snapshots |

## Installation
Standard procedure: tar zxvf ...; cd ....; ./configure; make; cp plugins-scripts/check_storage_health /destination/path

## Examples

Basic hardware check:
``` bash
nagios$ check_storage_health --hostname 192.168.1.100 --community public --mode uptime
OK - uptime is 42 days
```

Check filesystem space:
``` bash
nagios$ check_storage_health --hostname 192.168.1.100 --community public --mode filesystem-free
OK - filesystem has sufficient free space
```

## Download

Go to [Github](https://github.com/lausser/check_storage_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_storage_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_storage_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)