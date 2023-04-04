---
title: vsan
---

## Description

The vsan command provides checks against the vSAN system of a vcenter. Host
endpoints are currently not supported.

## Requirements

Unfortunately the [vSAN API](https://developer.vmware.com/web/sdk/8.0/vsan-python)
is not available as open source. So there is manual intervention needed to get
it working.

1. Download the [vSAN API SDK](https://developer.vmware.com/web/sdk/8.0/vsan-python)
   for python. You need a VMware account to do this.
1. install defusedxml, i.e.:
   `pip install defusedxml`
1. Copy the files `bindings/vsanmgmtObjects.py` and `samples/vsanapiutils.py`
   somehwere where your python can find it.
   For example: `python3 -m site --user-site`

## Options

Besides the [general options](../../general-options/) this command supports the following
options:

| option | description |
|---|---|
| `--vihost HOSTNAME` | (optional) the name of the HostSystem to check, if omitted the first HostSystem found is checked, which is handy if you run this check directly against the host |
| `--maintenance-state STATE` | one of OK, WARNING, CRITICAL, UNKNOWN. The status to use when the host is in maintenance mode, this defaults to UNKNOWN |
| `--mode MODE` | one of adapter, lun |
| `--allowed REGEX` | (optional) REGEX is checked against a name depending on the `--mode` |
| `--banned REGEX` | (optional) REGEX is checked against a name depending on the `--mode` |

On `--mode adapter` REGEX is matched against device name, the model or the device-key of the adapter.
On `--mode lun` REGEX is matched against displayName of the scsi device

## Examples
