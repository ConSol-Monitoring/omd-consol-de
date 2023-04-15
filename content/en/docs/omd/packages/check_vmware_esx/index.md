---
title: check_vmware_esx
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
### Overview

|||
|---|---|
|Homepage:|https://github.com/BaldMansMojo/check_vmware_esx/|
|Changelog:|https://github.com/BaldMansMojo/check_vmware_esx/blob/master/HISTORY|
|Documentation:|https://github.com/BaldMansMojo/check_vmware_esx/|

check_vmware_esx is a plugin to monitor vcenter and esx hosts and machines.

&#x205F;
### Directory Layout

|||
|---|---|
|Bin Directory:|&lt;site&gt;/lib/nagios/plugins (directory is provided by OMD Release please don&#x27;t touch)|

&#x205F;

## Requirements
check_vmware_esx requires the vsphere perl sdk to be installed. Due to license
issues you have to manually download the api from vmware.

 - [Perl SDK for vSphere 5.5](https://my.vmware.com/web/vmware/details?downloadGroup=SDKPERL550&productId=353)
 - [Perl SDK for vSphere 6.5](https://my.vmware.com/group/vmware/get-download?downloadGroup=VS-PERL-SDK65)

At least there is a helper script to make installation easy once you downloaded the tarball:

```bash
  %> ./share/doc/check_vmware_esx/install_vmware_sdk.sh /tmp/VMware-vSphere-Perl-SDK-5.5.0-1384587.x86_64.tar.gz
```