---
title: Mod Gearman
description: "Distribute active Naemon checks across workers to scale your monitoring."
tags:
  - mod gearman
  - gearmand
  - gearman worker
  - naemon
weight: 600
---
<div class="pb-4">
  <span class="project-logo project-logo--mod-gearman"><img class="project-logo-light" src="mod-gearman_light.svg" alt="Mod Gearman" width="104" height="80"><img class="project-logo-dark" src="mod-gearman_dark.svg" alt="Mod Gearman" width="104" height="80"></span>
</div>

**[Mod_Gearman](https://mod-gearman.org/)** is an easy way of distributing active Naemon checks across your network and increasing Naemon scalability.

It can even help to reduce the load on a single Naemon host, because it's much smaller and more efficient at executing checks.

- Mod-Gearman 5.x works with [Naemon Core](https://www.naemon.io)

It consists of three parts:

- There is a NEB module which resides in the Naemon core and adds service checks, host checks and event handlers to a Gearman queue.
- One or more worker clients execute the checks.
  Workers can be configured to run checks only for specific hostgroups or servicegroups.
  There is a (deprecated) worker included. The new worker can be found [here](https://github.com/ConSol-Monitoring/mod-gearman-worker-go).
- You also need at least one [Gearman Job Server](https://gearman.org) running.

## Features

- Reduce the load on your central Naemon machine
- Make Naemon scalable up to thousands of checks per second
- Easy distributed setups without configuration overhead
- Real load balancing across all workers
- Real failover for redundant workers
- Embedded Perl support for very fast execution of Perl scripts
- Fast transport of passive check results with included tools like send_gearman and send_multi

## Download

Mod Gearman and the new Go worker are included in [OMD](/docs/omd/).

The latest download packages can be found [here](https://mod-gearman.org/download.html).

## Changelog

The changelog is available on [GitHub](https://github.com/sni/mod_gearman/blob/master/Changes)

## Presentations

- [Monitoring Conference 2012 in Nürnberg](https://mod-gearman.org/slides/Mod-Gearman-2012-10-18.pdf)
- [Nagios Workshop 2011 in Hannover](https://mod-gearman.org/slides/Mod-Gearman-2011-05-24.pdf)

## Support

Professional support and consulting are available from [ConSol](https://www.consol.de/monitoring).
