---
date: 2023-11-30T00:00:00.000Z
title: "check_nwc_health 11.2.2 was released"
linkTitle: "check_nwc_health 11.2.2"
tags:
  - network
---
A new version of check_nwc_health was released.
### Breaking Changes:
* -
### Features
* The \-\-mode interface-errdisabled will show you if an interface was forcibly disabled (Cisco and Arista only)  
  Errdisable is a feature of most switches running IOS. When a port is in err-disabled state, it is shut down and traffic can no longer pass thru. Reasons for this are numerous, it will be shown in the plugin output. The same feature was also implemented by Arista. You might find it under different names like "ErrDisabled", "Error Disabled", "Errdisable State" and so on...
```
 ... --mode interface-errdisabled
CRITICAL - GigabitEthernet5/0/28 (alias IP Phone)/vlan 0 is disabled, reason: stormControl, GigabitEthernet4/0/45 (alias User Port)/vlan 0 is disabled, reason: bpduGuard

 ... --mode interface-errdisabled --name GigabitEthernet5/0/28
CRITICAL - GigabitEthernet5/0/28 (alias IP Phone)/vlan 0 is disabled, reason: stormControl

```

### Changed
* -
### Bugfixes
* -
### Download
<https://github.com/lausser/check_nwc_health>

