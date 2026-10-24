---
author: Sven Nierlein
date: '2009-11-30T15:38:41+00:00'
slug: check_nagios_external_commands
tags:
- check_nagios_external_commands
title: check_nagios_external_commands
---

Nagios installations which rely on working external commands should have a check which verifys that external commands are really working. This plugins sends a test command and checks the logfile if that command occurs. <!-- more -->
```bash
$ check_nagios_external_commands -t 120 -p /usr/local/nagios/var/rw/nagios.cmd \
    -l /usr/local/nagios/var/nagios.log
WARNING - command took 23s|command_write=0.85s command_read=22s
```
<a href="check_nagios_external_commands_0.1.tar">check_nagios_external_commands_0.1.tar</a>
