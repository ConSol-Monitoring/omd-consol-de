---
title: check_nwc_health
tags:
  - plugins
  - network
  - snmp
  - cisco
  - monitoring
  - check_nwc_health
---

## Description
check_nwc_health is a plugin for Nagios, Shinken and Icinga that monitors network components. It can query interface statistics, hardware (CPU, memory, fans, power supply modules, etc.), firewall policies, HSRP, load balancer pools, and processor and memory usage.

Communication with end devices is handled via SNMP, supporting versions 1, 2c, and 3.

Currently, the following network components, firewalls, SAN switches, and load balancers can be monitored:

* Cisco IOS
* Cisco Nexus
* Cisco ASA
* Cisco PIX
* F5 BIG-IP
* CheckPoint Firewall1
* Juniper NetScreen
* HP Procurve
* Nortel
* Brocade 4100/4900
* EMC DS 4700
* EMC DS 24
* Allied Telesyn
* Blue Coat SG600
* Cisco Wireless LAN Controller 5500
* Brocade ICX6610-24-HPOE
* Cisco UC Phone systems
* FOUNDRY-SN-AGENT-MIB
* FRITZ!BOX 7390
* FRITZ!DECT 200
* Juniper IVE
* Pulse-Gateway MAG4610
* Cisco IronPort AsyncOS
* Foundry
* Bluecat
* ... individual checks can run against any SNMP-capable device

## Documentation

### Command line parameters

* *\-\-hostname \<hostname or ip>* The hostname or IP address
* *\-\-community \<snmpv2-community>* SNMP community string
* *\-\-mode \<mode>* The monitoring mode
* *\-\-warning \<range>* Warning threshold
* *\-\-critical \<range>* Critical threshold
* *\-\-name \<objectname>* Used to specify a particular object
* *\-\-units \<unit>* Specify units for output

### Modes

| Keyword| Meaning|
|-------------|---------|
| uptime | Measures how long the device has been running |
| hardware-health | Checks the device hardware (power supplies, fans, temperatures, disks, etc.) |
| chassis-hardware-health | Checks the device hardware from the chassis perspective |
| cpu-load | Checks CPU load |
| memory-usage | Checks memory usage |
| interface-usage | Checks interface bandwidth utilization |
| interface-errors | Checks interface error rate |
| interface-discards | Checks interface discard rate |
| interface-status | Checks interface status (up/down) |
| interface-health | Checks bandwidth+errors+discards+status |
| list-interfaces | Lists all interfaces |
| list-interfaces-detail | Lists all interfaces with extra details |
| interface-availability | Checks how many ports are still available |
| link-aggregation-availability | Measures what percentage of interfaces in a link aggregation are up |
| list-routes | Lists all routes |
| route-exists | Checks if a specific route exists |
| count-routes | Counts routes |
| vpn-status | Checks VPN status (up/down) |
| hsrp-state | Checks the status of a node in an HSRP group |
| hsrp-failover | Checks for status changes in an HSRP group |
| list-hsrp-groups | Shows all HSRP groups |
| bgp-peer-status | Checks BGP peer status |
| count-bgp-peers | Counts the number of BGP peers |
| list-bgp-peers | Shows all BGP peers |
| ospf-neighbor-status | Checks OSPF neighbor status |
| list-ospf-neighbors | Shows all OSPF neighbors |
| ha-role | Checks the role within an HA group |
| fw-policy | Checks installed firewall policy |
| fw-connections | Counts firewall connections |
| session-usage | Counts sessions (of a load balancer) |
| pool-completeness | Checks completeness of a load balancer pool |
| pool-connections | Counts connections in a load balancer pool |
| list-pools | Lists all load balancer pools and their members |
| check-licenses | Checks license validity |
| count-users | Counts connected users |
| check-config | Checks for unsaved configuration changes |
| check-connections | Checks connection quality |
| count-connections | Counts connections |
| accesspoint-status | Checks access point status |
| count-accesspoints | Counts connected access points |
| list-accesspoints | Lists all managed access points |
| phone-cm-status | Checks if the call manager is up |
| phone-status | Counts registered/unregistered/rejected phones |
| list-smart-home-devices | Lists Fritz!DECT 200 plugs |
| smart-home-device-status | Checks if a Fritz!DECT 200 plug is powered |
| smart-home-device-energy | Checks power consumption of a Fritz!DECT 200 plug |
| walk | Shows snmpwalk commands needed for debugging |
| supportedmibs | Outputs a list of MIBs implemented by the device |

Note: Not every mode is available for every device type.

## Examples
``` bash
$ check_nwc_health \
    --hostname fw-int-1-3.fw.local --community public \
    --units Mbit \
    --mode interface-health \
    --name 'TenGigabitEthernet2/1/32' \
    --warningx 'broadcast_.*'=95 --criticalx 'broadcast_.*'=95 \
    --warningx 'broadcast_usage_.*'=10
OK - TenGigabitEthernet2/1/32 (alias !!! VSL UPLINK !!!) is up/up, interface TenGigabitEthernet2/1/32 (alias !!! VSL UPLINK !!!) usage is in:0.06% (6.08Mbit/s) out:0.00% (0.18Mbit/s), interface TenGigabitEthernet2/1/32 (alias !!! VSL UPLINK !!!) errors in:0.00% out:0.00%, interface TenGigabitEthernet2/1/32 (alias !!! VSL UPLINK !!!) discards in:0.00% out:0.00%, interface TenGigabitEthernet2/1/32 (alias !!! VSL UPLINK !!!) broadcast in:86.13% out:3.61% (% of traffic) in:0.05% out:0.00% (% of bandwidth) | 'TenGigabitEthernet2/1/32_usage_in'=0.06%;80;90;0;100 'TenGigabitEthernet2/1/32_usage_out'=0.00%;80;90;0;100 'TenGigabitEthernet2/1/32_traffic_in'=6.08;8000;9000;0;10000 'TenGigabitEthernet2/1/32_traffic_out'=0.18;8000;9000;0;10000 'TenGigabitEthernet2/1/32_errors_in'=0%;1;10;0;100 'TenGigabitEthernet2/1/32_errors_out'=0%;1;10;0;100 'TenGigabitEthernet2/1/32_discards_in'=0%;5;10;0;100 'TenGigabitEthernet2/1/32_discards_out'=0%;5;10;0;100 'TenGigabitEthernet2/1/32_broadcast_in'=86.13%;95;95;0;100 'TenGigabitEthernet2/1/32_broadcast_out'=3.61%;95;95;0;100 'TenGigabitEthernet2/1/32_broadcast_usage_in'=0.05%;10;95;0;100 'TenGigabitEthernet2/1/32_broadcast_usage_out'=0.00%;10;95;0;100

# *_usage_in = percentage of incoming traffic related to max. bandwidth
# *_broadcast_in = percentage of broadcast packets in incoming traffic
# *_broadcast_usage_in = percentage of broadcast traffic in max. bandwidth
# --warningx/criticalx can set individual thresholds on all metrics.
```

## Download

Go to [Github](https://github.com/lausser/check_nwc_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_nwc_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser

Check_nwc_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)