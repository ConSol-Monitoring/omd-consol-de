---
title: Module settings
---

## NEB Module/ Server Options

**logfile**

Path to the logfile.

    logfile=%LOGFILE_NEB%

**dupserver**

sets the address of your 2nd (duplicate) gearman job server. Can be specified more than once to add more servers.

Default is none.

    dupserver=<host>:<port>

**do_hostchecks**

set this to 'no' if you want Mod-Gearman to only take care of servicechecks. No hostchecks will be processed by Mod-Gearman. Use this option to disable hostchecks and still have the possibility to use hostgroups for easy configuration of your services. If set to yes, you still have to define which hostchecks should be processed by either using 'hosts' or the 'hostgroups' option.

Default is yes.

    do_hostchecks=yes

**route_eventhandler_like_checks**

This settings determines if all eventhandlers go into a single 'eventhandlers' queue or into the same queue like normal checks would do.

    route_eventhandler_like_checks=no

**use_uniq_jobs**

using uniq keys prevents the gearman queues from filling up when there is no worker. However, gearmand seems to have problems with the uniq key and sometimes jobs get stuck in the queue. Set this option to 'off' when you run into problems with stuck jobs but make sure your worker are running.

    use_uniq_jobs=on

**log_stats_interval**

Log gearman job submission details.

Default is 60.

    log_stats_interval=60

**localhostgroups**

sets a list of hostgroups which will not be executed by gearman. They are just passed through.

Default is none.

    localhostgroups=

**localservicegroups**

sets a list of servicegroups which will not be executed by gearman. They are just passed through.

Default is none.

    localservicegroups=

**queue_custom_variable**

The queue_custom_variable can be used to define the target queue by a custom variable in addition to host/servicegroups. When set for ex. to 'WORKER' you then could define a '_WORKER' custom variable for your hosts and services to directly set the worker queue. The host queue is inherited unless overwritten by a service custom variable. Set the value of your custom variable to 'local' to bypass Mod-Gearman (Same behaviour as in localhostgroups/localservicegroups).

    queue_custom_variable=WORKER

**result_workers**

Enable or disable result worker thread. The default is one, but you can set it to zero to disabled result workers, for example if you only want to export performance data.

Default is 1.

    result_workers=1

**perfdata**

defines if the module should distribute perfdata to gearman. Note: processing of perfdata is not part of mod_gearman. You will need additional worker for handling performance data, like ex. pnp4nagios. Performance data is just written to the gearman queue and not further processed. You can specify multiple queues by comma separated list.

Default is no.

    perfdata=no

**perfdata_send_all**

Set perfdata_send_all=yes to submit all performance data of all hosts and services regardless of if they have 'process_performance_data' enabled or not.

Default is no.

    perfdata_send_all=no

**perfdata_mode**

perfdata mode overwrite helps preventing the perdata queue getting too big
-   1 = overwrite
-   2 = append

Default is 1.

    perfdata_mode=1

**orphan_host_checks**

The Mod-Gearman NEB module will submit a fake result for orphaned host checks with a message saying there is no worker running for this queue. Use this option to get better reporting results, otherwise your hosts will keep their last state as long as there is no worker running.

Default is yes.

    orphan_host_checks=yes

**orphan_service_checks**

Same like 'orphan_host_checks' but for services.

Default is yes.

    orphan_service_checks=yes

**orphan_return**

Set return code of orphaned checks.
-   0 = OK
-   1 = WARNING
-   2 = CRITICAL
-   3 = UNKNOWN

Default is 2.

    orphan_return=2

**accept_clear_results**

When accept_clear_results is enabled, the NEB module will accept unencrypted results too. This is quite useful if you have lots of passive checks and make use of send_gearman/send_multi where you would have to spread the shared key to all clients using these tools.

Default is no.

    accept_clear_results=no

**latency_flatten_window**

When latency_flatten_window is enabled, the module reschedules host/service checks if their latency is more than one second. This value is the maximum delay in seconds applied to hosts/services. Set to 0 or less than 0 to disable rescheduling.

Default is 30.

    latency_flatten_window=30

**internal_check_dummy**

Use internal check_dummy which directly creates a check result instead of pushing the command to a worker. Only used if first file in command ends with /check_dummy and no shell special characters are used (except quotes)

    internal_check_dummy=yes

**gearman_connection_timeout**

Gearman connection timeout(in milliseconds) while submitting jobs to gearmand server.

Default is -1 (no timeout).

    gearman_connection_timeout=-1
