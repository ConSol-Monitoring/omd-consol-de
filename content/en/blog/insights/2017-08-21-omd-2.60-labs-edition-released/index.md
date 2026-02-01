---
layout: post
title: OMD 2.60 Labs Edition Released
author: Sven Nierlein
date: 2017-08-21 10:00:00+02:00
categories:
- omd
- nagios
tags:
- omd
- nagios
- naemon
- grafana
- thruk
featured_image: ./omd_logo.jpg
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em; width: 20%; height: 20%;"><img src="./omd_logo.jpg"></div>

[__OMD Labs Edition__](/docs/omd/) 2.60 has been released today. The OMD Labs Edition is based on the standard [__OMD__](http://omdistro.org/) but adds some more useful addons like [__Grafana__](http://grafana.org/) and [__Prometheus__](http://prometheus.io/) or additional cores like [__Icinga 2__](http://icinga.org/) and [__Naemon__](http://naemon.org/). This release updates many of the shiped components and adds some interesting options when resolving update conflicts.
<!--more-->

## Whats new

## Updates
All components have been updated to their latest stable releases including

 - [__Thruk__](http://thruk.org/) 2.16-2
 - [__Icinga 2__](http://icinga.org/) 2.7.0
 - [__Mod-Gearman__](http://mod-gearman.org/) 3.0.5
 - [__Grafana__](http://grafana.org/) 4.4.1
 - [__Prometheus__](http://prometheus.io/) 1.7.1
 - [__InfluxDb__](https://www.influxdata.com/) 1.3.3

### New platforms supported
This OMD release comes with new prebuild packages for Debian 10, Fedora 26 and Ubuntu 17.04.

### New merge options
This release adds the 'vimdiff' to the possible options when resolving merge conflicts during OMD updates. 'vimdiff' is also available as OMD command when having a look at changed files via 'omd diff'. We also added a 'reset' command to simply reset a changed file to the default version.

For example:

```
    %> echo "test" >> .profile
    %> omd diff
    %> omd vimdiff .profile
    %> omd reset .profile
```

### Hot Backups
OMD will no longer complain when doing a backup when OMD is still running. Instead there is a warning displayed which reminds you, that certain components might have issues with restores from hot backups, such like databases. Also there is a chance to loose some data which hasn't been stored to disk yet.

```
    %> omd backup /tmp/site.tar.gz
```

### Improved Bash-Completion
OMD now completes almost all OMD commands. You may need install bash-completion os packages which isn't a hard dependency and not installed automatically.

```
    %> omd reload [tab][tab]
```

## Changes
The full list of Changes can be found in the [__Changelog__](https://github.com/ConSol/omd/blob/labs/Changelog)


## Download
Always use the [__Consol Labs Repository__](/repo/stable/) for an easy and painless intallation / update.
