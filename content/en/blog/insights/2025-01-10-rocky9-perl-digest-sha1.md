---
date: 2025-01-10T10:00:00.000Z
title: "missing perl module Digest::SHA1 under Rocky 9"
linkTitle: "rocky9-perl-digest-sha1"
author: Gerhard Lausser
tags:
  - omd
  - perl
---
Some of you might have followed the instructions at [https://labs.consol.de/repo/testing/#_9](https://labs.consol.de/repo/testing/#_9) to install the labs.consol.de repository. If you're using a minimal setup of Rocky Linux 9, you might encounter this error message:

```bash
# yum install omd-5.51.20250109-labs-edition.x86_64
Last metadata expiration check: 0:08:01 ago on Fri 10 Jan 2025 10:32:09 AM CET.
Error: 
 Problem: package omd-5.51.20250109-labs-edition-el9-1.x86_64 from labs_consol_testing requires perl-Net-SNMP, but none of the providers can be installed
  - conflicting requests
  - nothing provides perl(Digest::SHA1) >= 1.02 needed by perl-Net-SNMP-6.0.1-25.el8.1.noarch from epel
(try to add '--skip-broken' to skip uninstallable packages or '--nobest' to use not only best candidate packages)
```

The missing Perl module *Digest::SHA1* is included in the installation package *perl-Digest-SHA1*, which is not part of a minimal setup. Moreover, running ***yum search perl-digest-SHA1*** yields no results.

To resolve this, you need to enable the *PowerTools* repository, which contains this RPM. You can do this either manually by editing the file */etc/yum.repos.d/Rocky-PowerTools.repo* and changing *enabled=0* to *enabled=1*, or by running the following command:
```bash
# yum config-manager --enable powertools
```

