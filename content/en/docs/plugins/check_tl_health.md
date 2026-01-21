---
title: check_tl_health
tags:
  - plugins
  - tape library
  - hardware
  - snmp
  - check_tl_health
---

## Description
check_tl_health was developed with the goal of providing a single tool for all aspects of tape library monitoring.

## Motivation
Instead of installing a variety of plugins for monitoring interfaces, hardware, slots, etc., and doing so for each manufacturer, check_tl_health should be the only plugin needed.

## Documentation

### Supported Devices

|         |                  | hardware-health | cpu-load | memory-usage | uptime |
|---------|------------------|-----------------|----------|--------------|--------|
| HP      | StorEver 1×8     | X               |          |              | X      |
| HP      | StorEver MSL4048 | X               |          |              | X      |
| Quantum | i40              | X               |          |              | X      |
| Quantum | i80              | X               |          |              | X      |
| Quantum | T950             | X               |          |              | X      |
| Quantum | i6000            | X               |          |              | X      |
| BDT     | FlexStorII       | X               |          |              | X      |

The list is not exhaustive. Some devices not listed here may be recognized based on the implemented MIBs. Just try it out...

## Examples

``` bash
# HP Library
$ check_tl_health --hostname 10.18.12.130 \
    --community secret \
    --mode hardware-health
CRITICAL - device 1 (HP MSL 4048, sn:DEC12701BS) status is critical

$ check_tl_health --hostname 10.18.12.130 \
    --community secret \
    --mode hardware-health --verbose
I am a HP MSL G3 Series
CRITICAL - device 1 (HP MSL 4048, sn:DEC12701BS) status is critical
checking overall system
device 1 (HP MSL 4048, sn:DEC12701BS) status is critical

# Quantum T950
$ check_tl_health --hostname 10.18.11.10 \
    --community secret \
    --mode hardware-health
OK - hardware working fine

$ check_tl_health --hostname 10.18.11.10 \
    --community secret \
    --mode hardware-health --verbose
I am a Linux MUC-TLIB-A 3.10.26 #1 SMP Wed May 21 15:50:38 MDT 2014 ppc
OK - hardware working fine
checking rassystems
connectivity has status good
control has status good
media has status good
drives has status good
powerAndCooling has status good
robotics has status good

# Quantum i80
$ check_tl_health --hostname 10.18.1.28 \
    --community secret \
    --mode hardware-health
CRITICAL - operator action requested, overall states: media=degraded aggregatedIEDoor=closedAndUnLocked power=good cooling=good control=good connectivity=good robotics=good drive=good

$ check_tl_health --hostname 10.18.1.28 \
    --community secret \
    --mode hardware-health --verbose
I am a Linux hr-lib01 2.6.27.46 #1 PREEMPT Fri Apr 22 14:37:45 MDT 2011 ppc
CRITICAL - operator action requested, overall states: media=degraded aggregatedIEDoor=closedAndUnLocked power=good cooling=good control=good connectivity=good robotics=good drive=good
checking overall system
overall states: media=degraded aggregatedIEDoor=closedAndUnLocked power=good cooling=good control=good connectivity=good robotics=good drive=good
checking physical drives
overall drive status online=online readyness=ready
drive 1 states: online=online readyness=ready ras=good cleaning=notNeeded
drive 2 states: online=online readyness=ready ras=good cleaning=notNeeded
checking logical libraries
logical lib 1 states: online=online readyness=ready
```

## Download

Go to [Github](https://github.com/lausser/check_tl_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_tl_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_tl_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)