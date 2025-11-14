+++
title = "eventhandler"
tags = [
  "events",
  "auto-repair",
]
+++

The Event Handler Framework provides a streamlined approach for writing event handler scripts in Nagios monitoring environments. With this framework, users can easily define conditions for handling events and specify actions to be taken based on those conditions, leveraging two core components: the Decider and the Runner. These components work together seamlessly to evaluate conditions, prepare parameters, and execute appropriate actions in response to events.

```
define command{
    command_name    handle_omd_restart
    command_line    $USER1$/eventhandler \
                        --runner ssh \
                        --runnertag omd_restart \
                        --runneropt hostname='$HOSTADDRESS$' \
...
                        --decider omd_site_self_heal \
                        --eventopt site_name='$HOSTNAME$' \
                        --eventopt HOSTNAME='$HOSTNAME$' \
                        --eventopt HOSTSTATE='$HOSTSTATE$' \
                        --eventopt HOSTADDRESS='$HOSTADDRESS$' \
                        --eventopt SERVICEDESC='$SERVICEDESC$' \
                        --eventopt SERVICESTATE='$SERVICESTATE$' \
                        --eventopt SERVICEOUTPUT='$SERVICEOUTPUT$' \
                        --eventopt LONGSERVICEOUTPUT='$LONGSERVICEOUTPUT$' \
                    >> $USER4$/var/log/eventhandler_errors.log 2>&1

```
### Decider
The Decider component evaluates whether an event should be handled based on the specified conditions. It considers factors such as current state, state type, attempt count, downtime, etc., and returns a set of parameters indicating the action to be taken.
The binary **lib/monitoring-plugins/eventhandler** takes multiple *\-\-eventopt KEY=VALUE*, which are usually Naemon macros. These key-value pairs are found in the dict *event.eventopts*.

Here is an example for a decider which is used in a self-monitoring setup. Its job is to restart an OMD instance or at least stopped/failed processes.

```python
from eventhandler.baseclass import EventhandlerDecider

class OmdSiteSelfHealDecider(EventhandlerDecider):

    def decide_and_prepare(self, event):
        if event.eventopts["HOSTDOWNTIME"] or event.eventopts["SERVICEDOWNTIME"]:
            event.summary = "{} / {} is in downtime".format(event.eventopts["SERVICEDESC"], event.eventopts["HOSTNAME"])
            event.discard(silently=False)
        elif event.eventopts["SERVICESTATE"] == "OK":
            event.summary = "{} / {} has recovered".format(event.eventopts["SERVICEDESC"], event.eventopts["HOSTNAME"])
            event.discard(silently=False)
        elif event.eventopts["SERVICEATTEMPT"] == 1:
            event.summary = "Restarting {} / {}".format(event.eventopts["SERVICEDESC"], event.eventopts["HOSTNAME"])
            event.payload = {
                'user': event.eventopts["site_name"],
                'command': "lib/nagios/plugins/check_omd --heal",
            }
        elif event.eventopts["SERVICEATTEMPT"] == 2:
            event.summary = "Restart of {} / {} did not help".format(event.eventopts["SERVICEDESC"], event.eventopts["HOSTNAME"])
            event.discard(silently=False)
        else:
            event.summary = "Unhandled state {}".format(event.eventopts)
            event.discard(silently=False)
```

The string you assign to *event.summary* is used for logging. If you want to abort the event handler so that the runner will not do anything, call *event.discard()*. It's called with *silently=False* here just for demonstration purposes and can be left away. If you want to abort event handling without even leaving a trace in the log file, use *event.discard(silently=True)*.

### Runner
The Runner component executes the appropriate script when an event meets the defined conditions, using the parameters the Decider puts into the dict *event.payload*. Either the runner executes python code in order to fix the problem or it creates a command line which will be executed by the framework in a subprocess.
Here is an example for a runner.
```python
from eventhandler.baseclass import EventhandlerRunner

class SshRunner(EventhandlerRunner):

    def __init__(self, opts):
        super(self.__class__, self).__init__(opts)
        setattr(self, "username", getattr(self, "username", None))
        setattr(self, "hostname", getattr(self, "hostname", "localhost"))
        setattr(self, "port", getattr(self, "port", None))
        setattr(self, "identity_file", getattr(self, "identity_file", None))
        setattr(self, "command", getattr(self, "command", "exit 0"))

    def run(self, event):
        cmd = "ssh"
        if self.username:
            cmd += f" -l {self.username}"
        if self.port:
            cmd += f" -p {self.port}"
        if self.identity_file:
            cmd += f" -i {self.identity_file}"
        cmd += " {} '{}'".format(self.hostname, self.command)
        return cmd

```

The previous example with runner *ssh* and decider *omd_site_self_heal* can be used out of the box in an OMD environment. (There are *~/lib/python/eventhandler/ssh/runner.py* and *~/lib/python/eventhandler/omd_site_self_heal/decider.py*)
For your own deciders and runners, create a folder in *~/local/lib/python/eventhandler* and put a decider.py or runner.py in it.


Builtin runners you can just use without writing code yourself are:
* ssh
  The ssh runner takes these parameters (either through *--runneropt* or *event.payload*)
  hostname - mandatory, the name of the ssh server.
  username - the username on the ssh server side. (default: the client username)
  port - the port where sshd is listening. (default: 22)
  identity_file - the private ke file.
  command - the command with arguments which will be executed on the ssh server side.

* nsc_web
  hostname - mandatory, the host where NSClient++/SNClient is running.
  port - the port, where SNClient is listening.
  password - the SCNlient+ password.
  command - the command to call on the SNClient.
  arguments - the arguments for the command.

* bash
  command - the command to run locally in a bash.

All the attributs you initialize in the *\_\_init__* method will be overwritten if they exist in the *event.payload* created by the decider. (Precedence: default set by *\_\_init__*, argument from *runneropt*, key/value from *event.payload*)

There is a decider *default*, which triggers the runner on SOFT;1. This and the runner *nsc_web* or *ssh* can be used without any need to write you own code if you call **eventhandler** with a suitable list or *\-\-runneropt* parameters..

### Loggers

The framework uses a modular logging architecture similar to runners, deciders, and formatters. By default, eventhandler uses **text format logging** - you don't need to do anything, logging works exactly as it did before. The traditional text format is backward compatible with all existing installations.

#### Why JSON Logging?

In enterprise environments, the gateway from monitoring systems to incident management platforms like Remedy, ServiceNow, or other ITSM tools is crucial for operational reliability. For comprehensive monitoring and troubleshooting of this critical path, logs need to be ingested into log aggregation systems like Splunk for analysis, alerting, and correlation.

The JSON logger provides structured logging optimized for ingestion into Splunk and other log management systems. It outputs single-line JSON with:
- Splunk-friendly underscore field naming (e.g., `event_host_name`, `event_service_name`)
- Complete event details including state, output, and summary
- Operational metrics and execution details
- Structured exception traces
- Timezone-aware timestamps

#### Usage

**Default (text logging):**
```bash
$USER1$/eventhandler \
    --runner ssh \
    --decider default \
    --eventopt HOSTNAME='$HOSTNAME$' \
    --eventopt SERVICESTATE='$SERVICESTATE$'
```

**JSON logging for Splunk ingestion:**
```bash
$USER1$/eventhandler \
    --runner ssh \
    --decider default \
    --logger json \
    --eventopt HOSTNAME='$HOSTNAME$' \
    --eventopt SERVICESTATE='$SERVICESTATE$'
```

**Custom logger:**
```bash
$USER1$/eventhandler \
    --runner ssh \
    --logger mycustomlogger \
    --eventopt HOSTNAME='$HOSTNAME$'
```

#### Example Log Output

**Text format (default):**
```
2025-11-13 17:00:57,987 3468977 - INFO - executed action for dbserver02.example.com/MySQL: WARNING - Slow queries
```

**JSON format:**
```json
{
  "timestamp": "2025-11-13T17:00:57.987487+01:00",
  "host_name": "oasch.example.com",
  "version": "2.9",
  "level": "INFO",
  "logger": "eventhandler_ssh",
  "omd_site": "demo_site",
  "event_host_name": "dbserver02.example.com",
  "event_service_name": "MySQL",
  "event_state": "WARNING",
  "event_notification_type": "PROBLEM",
  "event_service_output": "MySQL WARNING - Slow queries detected",
  "event_summary": "dbserver02.example.com/MySQL: WARNING - Slow queries",
  "msg": {
    "message": "executed action",
    "status": "success"
  }
}
```

#### Custom Loggers

You can create custom loggers by:
1. Creating `~/local/lib/python/eventhandler/mylogger/logger.py`
2. Inheriting from `EventhandlerLogger` base class
3. Implementing the `log(level, message, context)` method

```python
from eventhandler.baseclass import EventhandlerLogger

class MyloggerLogger(EventhandlerLogger):
    def log(self, level, message, context=None):
        # Custom logging implementation
        pass
```
