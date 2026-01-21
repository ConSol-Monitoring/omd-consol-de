---
author: Gerhard Laußer
date: '2010-07-14T10:59:36+00:00'
slug: service-dependencies-with-nrpe
tags:
- Nagios
title: Service dependencies with NRPE
---

<p>If you have defined services using the nrpe mechanism, you might know the following scenario:    <br />The NRPE daemon fails and all services using it go critical. One first step to avoid these false alarms is to create an additional service which monitors the NRPE daemon itself (called <b>check_nrpe_daemon</b> in this example) and install a dependency between your services and <b>check_nrpe_daemon</b>.</p> <!--more-->  <p>From the dependency logic, this means that if one of these services fails, further checks and notifications for this service depend on the state of it's parent service <b>check_nrpe_daemon</b>. Normally one would formulate the dependency in a way, that no notifications will be sent for the dependent services, if the nrpe daemon quit working.</p>  <p>However, imagine the following scenario where services have <i>max_check_attempts=2</i></p>  <ul>   <li>check_nrpe_daemon is checked and returns OK </li>    <li>The NRPE daemon stops working </li>    <li>A Service using nrpe is checked (check_nrpe!check_swap) and returns CRITICAL (SOFT:1) </li>    <li>check_nrpe_daemon is checked and returns CRITICAL (SOFT:1) </li>    <li>A Service using nrpe is checked (check_nrpe!check_swap) and returns CRITICAL (SOFT:2) </li>    <li>check_nrpe_daemon is checked and returns CRITICAL (SOFT:2) </li>    <li>A Service using nrpe is checked (check_nrpe!check_swap) and returns CRITICAL (HARD:1) </li>    <li><font color="#ff0000">A notification is sent out saying there is a problem with swap.</font> </li>    <li>check_nrpe_daemon is checked and returns CRITICAL (HARD:1) </li>    <li>A notification is sent out saying there is a problem with nrpe. </li> </ul>  <p>This is what we wanted to avoid. You can set the flag <i>soft_state_dependencies</i> but it won't help in any case.</p>  <p>What we need is an immediate check of the parent service if a dependent service fails. A new command <b>force_nrpe_check</b> is defined and used as en event handler for the dependent services. <b>force_nrpe_check</b> forces scheduling of <b>check_nrpe_daemon</b>.</p>  <p>&#160;</p>  ```text
define command {
    command_name       force_nrpe_check
    command_line       $USER1$/force_nrpe_check
}
define service {
    service_description  check_swap
    command_line         check_nrpe!check_swap
    event_handler        force_nrpe_check
    ....
```

<p>And this is the source code of the <b>force_nrpe_check</b> eventhandler script:</p>

```bash
#!/bin/sh
#
#  The name of the service which checks check_nrpe_daemon
#

NRPE_SERVICE=serviceprofile_os_hpux_common_check_agent

case "$NAGIOS_SERVICESTATE" in
  OK)
    # no need to care for nrpe health
    ;;
  WARNING)
    # check_nrpe does not exit with warnings.
    # So this exit code really comes from a remote check command
    ;;
  UNKNOWN|CRITICAL)
    if [ $NAGIOS_SERVICEATTEMPT -eq 1 ]; then
      export NAGIOS_NOW=$(date +"%s")
      # the reason for this error state might be a failed nrpe.
      # schedule a forced check of the check_nrpe_daemon service immediately
      printf "[%lu] SCHEDULE_FORCED_SVC_CHECK;%s;%s;%lu" \
          $NAGIOS_NOW $NAGIOS_HOSTNAME $NRPE_SERVICE $NAGIOS_NOW > $NAGIOS_COMMANDFILE
      # If the reason of our problem was really a problem with the
      # nrpe daemon, then check_nrpe_daemon service will change it's
      # state to soft;1
      # But the originally failed service is still 1 step ahead and
      # might reach a hard state before the check_nrpe_daemon
      # Therefore we need to force another check of check_nrpe_daemon to
      # raise its service attempt counter above the counter of the dependent service.
      printf "[%lu] SCHEDULE_FORCED_SVC_CHECK;%s;%s;%lu" \
          $NAGIOS_NOW $NAGIOS_HOSTNAME $NRPE_SERVICE $NAGIOS_NOW > $NAGIOS_COMMANDFILE
    fi
    ;;
esac
exit 0
```