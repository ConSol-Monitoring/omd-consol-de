---
title: check_ntp_health
tags:
  - plugins
  - ntp
  - time synchronization
  - chronyd
  - check_ntp_health
---

## Description
check_ntp_health was developed with the goal of providing a single tool for all aspects of time synchronization monitoring.

## Motivation
Instead of installing a variety of plugins for monitoring NTP, Chronyd, etc., check_ntp_health should be the only plugin needed.

## Documentation

### Command line parameters

* *\-\-mode* The monitoring mode
* *\-\-help* Display help information
* *\-\-hostname \<hostname>* The hostname or IP address
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold

### Modes

| Keyword| Meaning|
|-------------|---------|
| clock-health | Checks if a daemon is running, if there is a connection to the time server, and alerts if the time difference becomes too large |

## Examples

``` bash
WARNING - no sync peer, no candidates. 
CRITICAL - ntpq connection refused 
CRITICAL - ntpq: No association ID's returned 
CRITICAL - ntp daemon is not running, cannot open /usr/sbin/ntpq 

# centrify
$ uname -a
AIX eu-oem-aix02 1 7 00F189244D00
$ check_ntp_health --mode clock-health
OK - clock is in sync with domain ad.consolcustomer.com
```

## Download

Go to [Github](https://github.com/lausser/check_ntp_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_ntp_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_ntp_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)