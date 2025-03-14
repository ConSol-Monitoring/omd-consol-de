---
title: Naemon
tags:
  - naemon
  - nagios
weight: 550
---
<div class="pb-4">
  <img class="p-2" src="logo_naemon.png" alt="Naemon" style="background-color: white"/>
</div>

**[Naemon](https://www.naemon.io)** is an Open Source system and network monitoring application. It watches hosts and services that you specify, alerts you when things go bad and notifies you when they get better.

Naemon is based on Nagios 4.0.2 and aims to be a drop in replacement for Nagios.

## Features

- Monitoring of network services (SMTP, POP3, HTTP, NNTP, PING, etc.)
- Monitoring of host resources (processor load, disk usage, etc.)
- Simple plugin design that allows users to easily develop their own service checks
- Parallelized service checks
- Thruk Monitoring Webinterface to edit settings and view current network status, problem
  history, log files, sla reports, dashboards, business processes, etc.
- Ability to define network host hierarchy using "parent" hosts, allowing detection of
  and distinction between hosts that are down and those that are unreachable
- Contact notifications when service or host problems occur and get resolved (via email, pager, or user-defined method)
- Ability to define event handlers to be run during service or host events for proactive problem resolution
- Automatic log file rotation
- Support for implementing redundant monitoring hosts

You can find more details [here](https://www.naemon.io/documentation/usersguide/about).

## Documentation

A full knowledgebase for users and developers can be found [here](https://www.naemon.io/documentation/).

## Download

Naemon is included in [OMD](docs/omd/) but you can find all packages [here](https://www.naemon.io/download).

## Changelog

The changelog is available on [Github](https://github.com/naemon/naemon-core/blob/master/NEWS)

## Support

Professional support and consulting is available from [ConSol](https://www.consol.de/product-solutions/open-source-monitoring).
