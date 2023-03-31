---
title: Filesystem Layout
linkTitle: Filesystem Layout
---

## Filesystem layout

OMD uses a normal linux filesystem layout for etc, lib, var... except everything is relative to the sites home folder.

## Philosophy

 - follow linux filesystem layout relative to site home
 - do only change files/folders which are owned by the site user

## Global directory layout

```
    /omd
    ├── apache
    ├── sites
    │   ├── site_a
    │   ├── site_b
    │   └── site_...
    └── versions
        ├── 2.80-labs-edition
        ├── 2.90-labs-edition
        ├── 3.00-labs-edition
        └── default -> /etc/alternatives/omd
```

Global directories are created automatically and must to be changed. New sites
folders are created on `omd create` command. New versions are installed by the
package manager of your system.
The apache folder contains the reverse proxy configuration for the system apache.

It is possible to install and use multiple OMD version side by side. It is
also possible to upgrade legacy OMD installation to OMD-Labs with the `omd update`
command.


## Site directory layout

Keep a few things in mind:

 - Usually you should work with the site user only.
 - Everything not writable by the site user should not be changed manually.
 - The folders which are just symbolic links to the version directory (bin,lib,share,include) should not be changed.
 - The version symlink should not be changed manually, change the version with `omd update`.
 - Apply changes in the ./etc folder or by `omd config`.

```
    /omd/sites/example
    ├── bin -> version/bin
    ├── etc
    │   ├── apache
    │   ├── ...
    │   ├── cron.d
    │   ├── init.d
    │   ├── init-hooks.d
    │   ├── logrotate.d
    │   ├── mail-templates
    │   ├── rc.d
    │   └── xinetd.d
    ├── include -> version/include
    ├── lib -> version/lib
    ├── local
    │   ├── bin                                 *put scripts here*
    │   └── lib
    │       └── monitoring-plugins              *put your own plugins here*
    ├── share -> version/share
    ├── tmp
    ├── var
    │   ├── log                                 *logfiles can be found here*
    │   └── www
    └── version -> ../../versions/2.10-labs-edition
```

## Check plugins

OMD makes it very easy to separate your own written or downloaded plugins from
the standard plugins kit. The standard plugins are located in `./lib/monitoring-plugins`
which can be accessed by the $USER1$ macro in nagios. Your own plugins should stay
in `./local/lib/monitoring-plugins` with the macro $USER2$.
