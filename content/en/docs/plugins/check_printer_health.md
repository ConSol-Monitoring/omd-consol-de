---
title: check_printer_health
tags:
  - plugins
  - printer
  - snmp
  - supplies
  - check_printer_health
---

## Description
check_printer_health was developed with the goal of providing a single tool for all aspects of network printer monitoring.

## Motivation
Instead of installing a variety of plugins for monitoring consumables, hardware, etc., and doing so for each manufacturer, check_printer_health should be the only plugin needed.

## Documentation

### Command line parameters

* *\-\-hostname \<hostname or ip>* The hostname or IP address
* *\-\-community \<snmpv2-community>* SNMP community string
* *\-\-help* Display help information
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold

### Modes

| Keyword| Meaning|
|-------------|---------|
| uptime | Measures how long the device has been running |
| hardware-health | Checks the device hardware |
| supplies-status | Checks consumables, toner, ink cartridges, etc. |

## Download

Go to [Github](https://github.com/lausser/check_printer_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_printer_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_printer_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)