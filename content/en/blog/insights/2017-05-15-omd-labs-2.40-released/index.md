---
author: Sven Nierlein
date: '2017-05-17T10:00:00+02:00'
featured_image: ./omd_logo_small.jpg
tags:
- omd
title: OMD 2.40 Labs Edition Released
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em; width: 20%; height: 20%;"><img src="./omd_logo_small.jpg"></div>

[__OMD Labs Edition__](/docs/omd/) 2.40 has been released today. The OMD Labs Edition is based on the standard [__OMD__](http://omdistro.org/) but adds some more useful addons like [__Grafana__](http://grafana.org/) and [__Influxdb__](http://influxdb.org/) or additional cores like [__Icinga 2__](http://icinga.org/) and [__Naemon__](http://naemon.org/). This releases focus is on security and maintainance and removes some recently discovered CVEs in Nagios, Icinga and Naemon.
<!--more-->

## Whats new

## Updates
All components have been updated to their latest stable releases including

 - [__Thruk__](http://thruk.org/) 2.14-2
 - [__Naemon__](http://naemon.org/) 1.0.6
 - [__Icinga 2__](http://icinga.org/) 2.6.3
 - [__Mod-Gearman__](http://mod-gearman.org/) 3.0.2
 - [__Grafana__](http://grafana.org/) 4.2

### New platforms supported
This OMD release comes with prebuild packages for Fedora 25 and SLES 12SP2.

### New backup format
This release includes a new backup format which allows cross platform restores even if the old version is not installed at all. Read more about backups on the [__OMD Backup__](/docs/omd/backup_and_restore.html) Page.

## Changes

The only necessary change was to remove the shinken and mongodb which were unmaintained for a long time now. If you are using shinken, please install shinken the regular way now. You can still use all other components in OMD.

Full list of Changes can be found in the [__Changelog__](https://github.com/ConSol/omd/blob/labs/Changelog)


## Download

Please use the [__Consol Labs Repository__](/repo/stable/) for an easy and painless intallation.