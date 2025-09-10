---
title: Mod Gearman
tags:
  - mod gearman
  - gearmand
  - gearman worker
  - naemon
weight: 600
---
<div class="pb-4">
  <img class="p-2" src="logo_mod-gearman.png" alt="Mod Gearman" style="background-color: white"/>
</div>

**[Mod_Gearman](https://mod-gearman.org/)** is an easy way of distributing active Naemon checks across your network and increasing Naemon scalability.

It can even help to reduce the load on a single Naemon host, because its much smaller and more efficient in executing checks.

- Mod-Gearman 5.x works with [Naemon Core](https://www.naemon.io)

It consists of three parts:

- There is a NEB module which resides in the Naemon core and adds servicechecks, hostchecks and eventhandler to a Gearman queue.
- The counterpart is one or more worker clients executing the checks.
  The Worker can be configured to only run checks for specific host- or servicegroups.
  There is a (deprecated) worker included. The new worker can be found [here](https://github.com/ConSol-Monitoring/mod-gearman-worker-go).
- And you need at least one [Gearman Job Server](https://gearman.org) running.

## Features

- Reduce load of your central Naemon machine
- Make Naemon scalable up to thousands of checks per second
- Easy distributed setups without configuration overhead
- Real loadbalancing across all workers
- Real failover for redundant workers
- Embedded Perl support for very fast execution of perl scripts
- Fast transport of passive check results with included tools like send_gearman and send_multi

## Download

Mod Gearman and the new Go worker are included in [OMD](/docs/omd/).

The latest download packages can be found [here](https://mod-gearman.org/download.html).

## Changelog

The changelog is available on [Github](https://github.com/sni/mod_gearman/blob/master/Changes)

## Presentations

- [Monitoring Conference 2012 in Nürnberg](https://mod-gearman.org/slides/Mod-Gearman-2012-10-18.pdf)
- [Nagios Workshop 2011 in Hannover](https://mod-gearman.org/slides/Mod-Gearman-2011-05-24.pdf)

## Support

Professional support and consulting is available from [ConSol](https://www.consol.com/monitoring).
