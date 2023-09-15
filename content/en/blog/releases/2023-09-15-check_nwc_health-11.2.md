---
date: 2023-09-15T00:00:00.000Z
title: "check_nwc_health 11.2 was released"
linkTitle: "check_nwc_health 11.2"
tags:
  - network
---
A new version of check_nwc_health was released.
### Breaking Changes:
* -
### Features
* With --mode interface-status you will now output the configured VLANs on an interface.
### Changed
* The mode hardware-health for Huawei devices caches the contents of the hwEntityTable for an hour and only requests a few rows from the hwEntityStateTable, so that the runtime is significantly reduced. (Ths also avoids hitting a rate limit)
### Bugfixes
* -
### Download
<https://github.com/lausser/check_nwc_health>

