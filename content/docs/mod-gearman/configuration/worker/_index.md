---
title: Worker settings
---

## Worker Options

**logfile**

Path to the logfile.

    logfile=/var/log/gearman/worker.log

**pidfile**

Path to the pidfile. Usually set by the init script

    pidfile=/var/run/mod-gearman.pid

**job_timeout**

Default job timeout in seconds. Currently this value is only used for eventhandler. The worker will use the values from the core for host and service checks.

    job_timeout=60

**min-worker**

Minimum number of worker processes which should run at any time.

    min-worker=5

**max-worker**

Maximum number of worker processes which should run at any time. You may set this equal to min-worker setting to disable dynamic starting of workers. When setting this to 1, all services from this worker will be executed one after another.

    max-worker=50

**idle-timeout**

Time after which an idling worker exists This parameter controls how fast your waiting workers will exit if there are no jobs waiting.

    idle-timeout=30

**max-age**

defines the threshold for discarding too old jobs. When a new job is older than this amount of seconds it will not be executed and just discarded. Set to zero to disable this check.

    max-age=0

**spawn-rate**

defines the rate of spawned worker per second as long as there are jobs waiting

    spawn-rate=3

**sink-rate**

defines the rate at which idle worker will be reduced

    sink-rate=1

**backgrounding-threshold**

Continue long running checks in background after this amount of seconds and work on next check. Set to 0 to disable. This setting controls how long a plugin may block a worker while waiting ex. on network timeouts.

    backgrounding-threshold=30

**load_cpu_multi**

Set load limit based on number of CPUs. Will set load_limit1/5/15 unless those options are already set. No limit will be used when set to 0.

    load_cpu_multi=2.5

**load_limit1**

Set a limit based on the 1min load average. When exceding the load limit, no new worker will be started until the current load is below the limit. No limit will be used when set to 0.

Default is none (setting **load_cpu_multi** will disable this option)

    load_limit1=0

**load_limit15**

Same as load_limit1 but for the 5min load average.

Default is none (setting **load_cpu_multi** will disable this option)

    load_limit5=0

**load_limit15**

Same as load_limit1 but for the 15min load average.

Default is none (setting **load_cpu_multi** will disable this option)

    load_limit15=0

**mem_limit**

Total used memory must not exceed limit before starting new worker (in percent).

    mem_limit=70

**show_error_output**

Use this option to show stderr output of plugins too.

Default is yes.

    show_error_output=yes

**timeout_return**

Defines the return code for timed out checks. Accepted return codes are:
-   0 (Ok)
-   1 (Warning)
-   2 (Critical)
-   3 (Unknown)

Default is 3.

    timeout_return=3

**dup_results_are_passive**

Use dup_results_are_passive to set if the duplicate result send to the dupserver will be passive or active.

Default is yes (passive).

    dup_results_are_passive=yes

**enable_embedded_perl**

When embedded perl has been compiled in, you can use this switch to enable or disable the embedded perl interpreter.

    enable_embedded_perl=on

**use_embedded_perl_implicitly**

Default value used when the perl script does not have a "nagios: +epn" or "nagios: -epn" set. Perl scripts not written for epn support usually fail with epn.

Default is off.

    use_embedded_perl_implicitly=off

**use_perl_cache**

Cache compiled perl scripts. This makes the worker process a little bit bigger but makes execution of perl scripts even faster. When turned off, Mod-Gearman will still use the embedded perl interpreter, but will not cache the compiled script.

    use_perl_cache=on

**p1_file**

path to mod_gearman_worker_epn.pl file which is used to execute and cache the perl scripts run by the embedded perl interpreter

    p1_file=./mod_gearman_worker_epn.pl

**gearman_connection_timeout**

Gearman connection timeout(in milliseconds) while submitting jobs to gearmand server.

Default is 5000.

    gearman_connection_timeout=5000


### Security

**restrict_path**

restrict_path allows you to restrict this worker to only execute plugins from these particular folders. Can be used multiple times to specify more than one folder.

Default is none.

    restrict_path=/usr/local/plugins/

**restrict_command_characters**

list of forbidden characters in command lines. Only active if 'restrict_path' is in use.

    restrict_command_characters=$&();<>`"'|


### Internal checks
improve check performance since they do not require any fork

**internal_negate**

use internal negate

    internal_negate = 1

**internal_check_nsc_web**

use internal check_nsc_web plugin

    internal_check_nsc_web = 1

**internal_check_dummy**

use internal check_dummy plugin

    internal_check_dummy = 1

**worker_name_in_result**

Show worker identifier in result output. Possible values:
-   off:          Do not show worker identifier
-   on:           The worker identifier is displayed at the beginning of the plugin output. E.g. "(worker: w1) Service is Running"
-   pre_perfdata: The worker identifier is displayed at the end of the plugin output text, but before the perfdata. E.g. "Service is Running (worker: w1) | duration=10ms, version=1"

Default is off.

    worker_name_in_result=off


### Prometheus

**prometheus_server**

export prometheus metrics

Default is none.

    prometheus_server=127.0.0.1:9050

### Conf.d subfolder

**config**

Import conf.d folders to override default settings

Default is none.

    config=/etc/mod-gearman/worker.d/
