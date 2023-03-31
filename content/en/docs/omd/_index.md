---
layout: page
title: OMD Labs
linkTitle: OMD
---

The `OMD Labs-Edition` is a monitoring platform and a new concept of how to install, maintain and update a nagios compatible monitoring system. It contains most monitoring related components from [labs.consol.de](/) and others useful addons from companioned authors. It is _not_ another linux distribution, instead it integrates well in your current system in form of a single rpm or deb package.

Have a look at the [getting started](getting_started.html) page for first steps.

<div style="float: right;">
{% asset_image omd_logo_small.jpg %}
</div>

Labs OMD contains: (incomplete list)

{% include omd_packages.md %}

<br clear="both">

## The Idea
The main idea is to make the initial installation easy and less time consuming while providing a stable and standarized platform for further activities. A nagios system without addons and plugins is mostly useless, so OMD provides a way of making the initial setup fast and painless.

OMD-Labs goes a bit further and adds even more useful software. See the [differences page](differences.html) for a full list

## The Site Concept
OMD comes with a site concept solution with makes it possible to create and run multiple instances of OMD on one server. Sites can be renamed, copied and managed independantly.

## Roadmap
There is usually one stable release every 6 months. Every day there are nightly builds with the [latest changes](https://github.com/ConSol/omd/blob/labs/Changelog).

<div class="btn-group btn-group-lg releaseplan" role="group" aria-label="Release plan" style="width:100%;">
  <a class="btn btn-success" href="#download" role="button" style="width:50%;">Stable: 5.10</a>
  <a class="btn btn-info" href="builds.html" role="button" style="width:25%;">Nightly</a>
  <a class="btn btn-warning" href="https://github.com/ConSol/omd/blob/master/Changelog" role="button" target="_blank" style="width:25%;">Next: Aug 2023</a>
</div>
<br clear="both">

Since OMD itself is rather complete, upcoming releases mostly update the shipped
components. There are no planned changes for OMD itself.

## Download
Best practice is to use the prebuild packages from our repository as described in the [installation section](#installation).

The nightly builds are available via our [testing repository](/repo/testing/).

## Installation

The installation is quite easy when using our [Labs Repository](/repo/stable/). Just follow the steps for your operating system. After that use
your package manager like _apt_, _yum_ or _zypper_ to search/install omd.

There are pre-built packages available for the following systems:

<table>
<tr><th>System</th><th colspan="2">Version</th><th>64bit</th></tr>
<tr><th>RHEL/Centos</th><td>7</td><td></td><td><a href="/repo/stable/#_7"><img src="/omd/rhel.png" width="24" height="24"></a></td></tr>
<tr><th>RHEL/Centos/Rocky</th><td>8</td><td></td><td><a href="/repo/stable/#_8"><img src="/omd/rhel.png" width="24" height="24"></a></td></tr>
<tr><th>RHEL/Centos/Rocky</th><td>9</td><td></td><td><a href="/repo/stable/#_9"><img src="/omd/rhel.png" width="24" height="24"></a></td></tr>
<tr><th>Debian</th><td>10</td><td>Buster</td><td><a href="/repo/stable/#_debian_buster_10_0"><img src="/omd/debian.png" width="24" height="24"></a></td></tr>
<tr><th>Debian</th><td>11</td><td>Bullseye</td><td><a href="/repo/stable/#_debian_bullseye_11_0"><img src="" width="24" height="24"></a></td></tr>
<tr><th>SLES</th><td>15 SP4</td><td></td><td><a href="/repo/stable/#_sles_15_sp4"><img src="/omd/sles.png" width="24" height="24"></a></td></tr>
<tr><th>Ubuntu</th><td>20.04</td><td>Focal Fossal</td><td><a href="/repo/stable/#_ubuntu_focal_fossal_20_04"><img src="/omd/ubuntu.png" width="24" height="24"></a></td></tr>
<tr><th>Ubuntu</th><td>22.04</td><td>Jammy Jellyfish</td><td><a href="/repo/stable/#_ubuntu_jammy_jellyfish_22_04"><img src="/omd/ubuntu.png" width="24" height="24"></a></td></tr>
</table>
<br>

<p class="hint">
Rocky/Centos/Redhat will require the Epel repository. Redhat will additionally require these extra channels:<br><code>subscription-manager repos --enable=rhel-7-server-rpms \<br>--enable=rhel-7-server-extras-rpms \<br>--enable=rhel-7-server-optional-rpms</code>
</p>


## Filesystem Layout

OMD uses a normal linux filesystem layout for etc, lib, var... except everything is relative to the sites home folder.
Read more in the [filesystem layout documentation]({{< relref "filesystem_layout.md" >}}).

## OMD Commands

OMD offers a few commands to create and operate your sites.
See an overview in the [omd command reference](commands.html).

## Grafana Graphing
Besides PNP4Nagios the OMD Labs edition offers Grafana based Graphs. Read more on
that topic on the [graphing page](howtos/grafana/).

## E-Mail Notifications

We ship a template based easy customizable email notification script with OMD.
Read more about that in the [omd notification reference](howtos/html_notifications/).
