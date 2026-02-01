---
author: Roland Huß
date: '2010-08-23T05:35:07+00:00'
slug: check_jmx4perl-new-nagios-configuration-style
tags:
- check_jmx4perl
title: 'check_jmx4perl: New Nagios configuration style'
---

Since version 0.70, `check_jmx4perl` has support for configuration files. JMX Nagios checks are now considerably simpler to configure and multi checks add even more performance and flexibility.

<!--more-->
Gerhard presented in a [previous][1] article a well crafted setup of Nagios commands and service definitions for use with check_jmx4perl. Although these suggestions nicely decouple the checks into an service hierarchy and provide a service dependency to avoid superflous notifications, starting with 0.70 things can still be improved further.

First, the amount of command definitions can be reduced to a single one. Here is the command to rule them all:

```bash
define command {
   command_name j4p_cmd
   command_line $USER5$/check_jmx4perl \
                --config $USER5$/jmx4perl.cfg \
                --server $HOSTNAME$ \
                --check  $ARG1$ $ARG2$ $ARG3$ $ARG4$
}
```

`$USER5$` is the top-level directory for jmx4perl specific Nagios stuff. It is recommended to put it below the Nagios `etc/` directory (e.g. `/usr/local/nagios/etc/jmxperl`). `$USER5$` needs to be declared in Nagios' `resources.cfg` as usual. As it can be seen from the example above, `check_jmx4perl` is called with three arguments only:

* `--config` to point to `check_jmxperl`s configuration file. More on this later.
* `--server` for the server to monitor. The trick here is, that `$HOSTNAME$` is used for pointing to the server definition (which contains e.g. the URL for accessing the jmx4perl agent) within the configuration file. So, each Nagios host which is configured for monitoring with `check_jmx4perl` should have a `<Server>` section in the configuration *with the same name* (case sensitive).
* `--check` finally specifies the `<Check>` or `<MultiCheck>` defined in the configuration file. `$ARG1$` specifies the check name and must be provied in the service definition using this command. `$ARG2$` (and the others) is an optional argument used for providing check parameters.

Since `jmx4perl` comes with some standard checks, which can be customized to individual needs, it is a good idea, to not mix these with your customizations within the same file. Further jmx4perl updates will add to these standard checks, so the recommendation for the directory layout is as follows:

* Extract each jmx4perl distribution in a dedictated *jmx4perl source* directory (e.g. `/usr/local/src/jmx4perl`). Use a symlink to point to the latest jmx4perl distribution in use:

```bash
$ mkdir /usr/local/src/jmx4perl
 $ cd /usr/local/src/jmx4perl
 $ tar zxvf /tmp/jmx4perl-0.71.tar.gz
 $ ln -s -f jmx4perl-0.71 jmx4perl
```

* Install jmx4perl as usual (the `perl Build.PL; ./Build install` combo),
* Within Nagios' jmx4perl directory, create symlinks to `check_jmx4perl` and the default configuration:

```bash
$ cd /usr/local/nagios/etc
 $ mkdir jmx4perl
 $ cd jmx4perl
 $ ln -s /usr/bin/check_jmx4perl .
 $ ln -s /usr/local/src/jmx4perl/jmx4perl/config default
```

After these preparations, the individual site configuraton for `check_jmx4perl` can be added. In order to separate server and check declarations, two files are recommended: `servers.cfg` for holding `<Server>` definitions only and `jmx4perl.cfg` which holds the checks and which is referenced from within the Nagios command definition shown above.

The `servers.cfg` looks like:

```bash
# Server definitions.
  # Names must reflect nagos host names
  # (case sensitive)

  <Server webshop>
    Url http://webshop:8080/j4p
    User j4p
    Password consol
  </Server>

  <Server cms>
    Url http://cms:8081/j4p
  </Server>
```

In this example, two servers are defined. *webshop* (using a
user/password for authentication) and *cms*. Note, that there should
be Nagios host definitions with the same name.

Finally, the main configuration file `jmx4perl.cfg`:

```bash
# Hosts
include servers.cfg

# Default definitions
include default/memory.cfg
include default/tomcat.cfg
include default/threads.cfg

# ====================================
# Check definitions

<Check j4p_memory_heap>
  Use memory_heap
  Critical 90
  Warning 80
</Check>

<Check j4p_thread_count>
  Use thread_count
  Critical 1000
  Warning 800
</Check>

# Check for uptime, used as kind of 'ping' for
# service dependencies
<Check j4p_uptime>
  MBean java.lang:type=Runtime
  Attribute Uptime
  Warning 120:
  Critical 60:
</Check>

# A multi check combining two checks
<MultiCheck j4p_jvm>
  Check j4p_memory_heap
  Check j4p_thread_count
</Check>

# ===========================================
# Tomcat Apps
# -----------

<Check app_sessions>
  Use tc_session_active($0)
  Critical 1000
  Warning 800
</Check>

<Check app_servlet_requests>
  Use tc_servlet_requests($0)
  Critical 6000
  Warning 5000
</Check>

# Multicheck for a webapp
# $0: Web-Application name (e.g. "j4p")
# $1: Servlet-Name (e.g. "j4p-agent")
<MultiCheck app_all>
  Check app_sessions($0)
  Check app_servlet_requests($1)
</MultiCheck>

# Connector related multicheck
<MultiCheck connector_all>
  Check tc_connector_threads($0)
  Check tc_connector_received_rate($0)
  Check tc_connector_sent_rate($0)
  Check tc_connector_processing_time($0)
  Check tc_connector_requests($0)
  Check tc_connector_error_count($0)
</MultiCheck>
```

`servers.cfg` is included for refering to the server definitions and a set of default definitions is included with predefined checks which are references later on in this file via the `Use` directive.

After this prelude, the *real* checks are defined. These are a mixture of plain checks (`<Check>`) and multi checks (`<MultiCheck>`). Each of these checks can be referenced from a Nagios service definition via its name.

For the Nagios service definitions, there are essentially two styles (which can be matched and mixed):

* Use multiple, single checks, with a proper service dependency (as described [here][1] in detail).
* Use a multi check in order to combine several checks.

Both approaches have advantages and disadvantages:

* Multichecks are faster since they combine multiple checks in a single request, resulting in a single server turnaround
* Multichecks don't need a service dependency, except you want to use multiple multi-checks on a single host in which case a service dependency of the multi checks on an 'uptime' check make sense.
* You can only attach a single notification group to a multi check, single checks are more flexible here.
* Pnp4Nagios graphing can handle both modes.

Finally here are the service definitions:

```bash
define service {
    use                   generic-service,srv-pnp
    service_description   jvm_memory_heap
    display_name          Heap Memory
    hostgroup_name        tomcat,jetty
    check_command         j4p_cmd!j4p_memory_heap
}

# Multicheck combining multiple JVM checks
define service {
    use                   generic-service,srv-pnp
    service_description   jvm_all
    display_name          All JVM Params
    hostgroup_name        tomcat,jetty
    check_command         j4p_cmd!j4p_jvm
}

# Tomcat connector checks
# -----------------------
define service {
    use                   generic-service,srv-pnp
    service_description   tc_connector_8080
    display_name          Connector 8080 - Checks
    hostgroup_name        tomcat
    check_command         j4p_cmd!connector_all!http-8080
}

# Tomcat web-app checks
# ---------------------
define service {
    use                   generic-service,srv-pnp
    service_description   tc_webshop_sessions
    display_name          Webshop Number sessions
    host_name             webshop
    check_command         j4p_cmd!app_sessions!shopApp
}
```

Multiple single checks and multi-checks are combined in this example. Also note, that for generic JVM checks and connector checks, `hostgroup_name` is used in order to define the services for similar hosts only once. Two hostgroups are used here: `tomcat` for Tomcat servers and `jetty` for Jetty servers. Both are associated with the same generic JVM checks, in addition the host group `tomcat` is associated with tomcat specific connector checks. The most specific check, which checks a servlet is directly associated with a host (since a webapplication only runs on a single host only in non-clustered environments).

So, what is the take away of this post ? (and BTW, congratulations that you made it until the end ;-)

* You only need a single Nagios command definition.
* Switching over check definitions into `check_jmx4perl` configuration has serveral advantages:
   * Advanced features like inheritance, multi-checks and parameterization.
   * Changes are applied *hot* during the next check without restarting Nagios.
   * Using `check_jmx4perl` configuration files keeps Nagios configuration tidy.
* You have the choice: Multiple single checks or multi-check (or a wild mixture :).
* Syncing Nagios host names and server names in the `check_jmxperl` configuration files simplifies quite some things.
* Don't edit the default checks, use includes instead and use an intelligent directory layout.

For more information, please consult the [man page][2] of `check_jmx4perl`.  Looking back, writing these 30+ pages seemed to be the hardest part for version 0.70. Writing documentation (man pages or books) is tough business. Am I right, Gerhard ? ;-)

 [1]: /blog/2009/10/08/check_jmx4perl-einfache-servicedefinitionen/
 [2]: http://search.cpan.org/~roland/jmx4perl/scripts/check_jmx4perl