---
title: Configuration
weight: 200
no_list: true
---

## [NEB Module/ Server Options](module/)
## [Worker Options](worker/)
## Common Options

### Shared options for the NEB module and the worker

**debug**

use debug to increase the verbosity of the module. Possible values are:
-   0 = only errors
-   1 = debug messages
-   2 = trace messages
-   3 = trace and all gearman related logs are going to stdout.

Default is 0.

    debug=0

**server**

sets the addess of your gearman job server. Can be specified more than once to add more server.

    server=localhost:4730

**eventhandler**

defines if the module should distribute execution of eventhandlers.

    eventhandler=yes

**notifications**

defines if the module should distribute execution of notifications.

    notifications=yes

**services**

defines if the module should distribute execution of service checks.

    services=yes

**hosts**

defines if the module should distribute execution of host checks.

    hosts=yes

**hostgroups**

sets a list of hostgroups which will go into seperate queues. Either specify a comma seperated list or use multiple lines.

Default is none.

    hostgroups=name1
    hostgroups=name2,name3

**servicegroups**

sets a list of servicegroups which will go into seperate queues.

Default is none.

    servicegroups=name1,name2,name3

**encryption**

enables or disables encryption. It is strongly advised to not disable encryption. Anybody will be able to inject packages to your worker. Encryption is enabled by default and you have to explicitly disable it. When using encryption, you will either have to specify a shared password with key=... or a keyfile with keyfile=...

Default is On.

    encryption=yes

**key**

A shared password which will be used for encryption of data packets. Should be at least 8 bytes long. Maximum length is 32 characters.

Default is none.

    key=should_be_changed

**keyfile**

The shared password will be read from this file. Use either key or keyfile (**keyfile is recommended**). Only the first 32 characters will be used.

    keyfile=/etc/mod-gearman/secret.key
