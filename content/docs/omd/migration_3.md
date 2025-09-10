---
title: Migration to 3.x
---

## Migration to OMD-Labs 3.x

OMD-Labs 3.x comes with some changes which might break existing setups.

## Removed Components

A few components have been removed:

- Nagios 3
- Icinga 1
- Nagvis
- Check_MK

Nagios 3 and Icinga 1 will be automatically migrated to Naemon. Configuration should mostly be compatible.

If you made manual changes to your `etc/nagios/nagios.cfg` or below `etc/nagios/nagios.d` then you have
manually port those changes to Naemon.

## Monitoring-Plugins

The plugins will now be installed into `lib/monitoring-plugins` instead of `lib/nagios/plugins`. The `resource.cfg` will be changed automatically and there will be a symlink from the old location. So nothing should break.

Local plugins go into `local/lib/monitoring-plugins` and there is also a symlink from the old location.

## Nagios Logos

The logos location has been changed from `share/nagios/htdocs/images/logos/` to `share/logos/`. There will be a symbolic link from the old location.

Same applies to the local folder which has been moved from `local/share/nagios/htdocs/images/logos/` to `local/share/logos/`.

## Ansible

OMD-Labs 3.x comes with a new Ansible version 2.7 which might break existing playbooks. Previous version was 2.3.

There is a porting guide available on [ansible.com](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html).
