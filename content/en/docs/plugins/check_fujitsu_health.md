---
title: check_fujitsu_health
tags:
  - plugins
  - fujitsu
  - hardware
  - snmp
  - check_fujitsu_health
---

## Description
check_fujitsu_health monitors the hardware health of Fujitsu servers via SNMP.

## Documentation

### Command line parameters

* *\-\-hostname \<hostname or ip>* The hostname or IP address
* *\-\-community \<snmpv2-community>* SNMP community string  
* *\-\-mode \<mode>* The monitoring mode
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold

### Modes

| Keyword| Meaning|
|-------------|---------|
| uptime | Measures how long the device has been running |
| hardware-health | Checks the device hardware (power supply, fans, temperatures, disks, etc.) |

## Installation
Standard procedure: tar zxvf ...; cd ....; ./configure; make; cp plugins-scripts/check_fujitsu_health /destination/path

## Examples

Basic hardware health check:
``` bash
nagios$ check_fujitsu_health --hostname 192.168.1.100 --community public --mode hardware-health
OK - hardware working fine
```

Check uptime:
``` bash  
nagios$ check_fujitsu_health --hostname 192.168.1.100 --community public --mode uptime
OK - uptime is 42 days
```

## Download

Go to [Github](https://github.com/lausser/check_fujitsu_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_fujitsu_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_fujitsu_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)