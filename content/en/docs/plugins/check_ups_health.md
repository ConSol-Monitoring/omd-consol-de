---
title: check_ups_health
tags:
  - plugins
  - ups
  - power
  - battery
  - check_ups_health
---

## Description
check_ups_health was developed with the goal of providing a single tool for all aspects of uninterruptible power supply (UPS) monitoring.

## Motivation
Instead of installing a variety of plugins for monitoring uptime, hardware, sensors, batteries, etc., and doing so for each manufacturer, check_ups_health should be the only plugin needed.

## Documentation

### Supported Devices

|         |                  | hardware-health | battery-health | uptime |
|---------|------------------|-----------------|----------------|--------|
| APC     | Galaxy           | X               | X              | X      |
| Socomec | Netys            | X               | X              | X      |
| Socomec | Netvision        | X               | X              | X      |
| Eaton   |                  | X               | X              | X      |
| Syrius  | CS121            | X               | X              | X      |
| Syrius  | CS131            | X               | X              | X      |
| Merlin Gerin |              | X               | X              | X      |
| XUPS MIB|                  | X               | X              | X      |
| UPS MIB |                  | X               | X              | X      |
| UPS V4 MIB |               | X               | X              | X      |
| XPCC MIB|                  | X               | X              | X      |

The list is not exhaustive. Some UPS devices not listed here may be recognized based on the implemented MIBs. Just try it out...

### Command line parameters

* *\-\-hostname \<hostname or ip>* The hostname or IP address
* *\-\-community \<snmpv2-community>* SNMP community string
* *\-\-mode \<mode>* The monitoring mode
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold

### Modes

| Keyword| Meaning|
|-------------|---------|
| hardware-health | Checks the UPS hardware status |
| battery-health | Checks battery status and capacity |
| uptime | Measures how long the UPS has been running |

## Examples

Basic hardware check:
``` bash
nagios$ check_ups_health --hostname 192.168.1.100 --community public --mode hardware-health
OK - UPS hardware working fine
```

Check battery health:
``` bash
nagios$ check_ups_health --hostname 192.168.1.100 --community public --mode battery-health
OK - battery capacity is 95%
```

Check uptime:
``` bash
nagios$ check_ups_health --hostname 192.168.1.100 --community public --mode uptime
OK - uptime is 42 days
```

## Download

Go to [Github](https://github.com/lausser/check_ups_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_ups_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_ups_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)