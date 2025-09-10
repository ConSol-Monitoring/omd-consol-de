---
title: Commands
---
## General omd commands

A few omd commands work without context and can be run by any user:

| Command                   | Example               | Description |
| --------------------------|-----------------------| ----------- |
| omd help                  | %> omd help           | Show general help. |
| omd version               | %> omd version        | Display the currently used version of this site. |
| omd versions              | %> omd versions       | List all available versions on this host. |
| omd sites                 | %> omd sites          | Show list of sites. |

{{% alert title="Note" color="info" %}}
All commands have a "\-\-help" flag, which lists all possible options. For example:

    $ omd update --help
    Usage: omd update [SITE] [options...]
    Description: Update site to other version of OMD
    Options for the 'update' command:
    --conflict                 ARG  non-interactive conflict resolution. ARG is install, keepold, abort or ask
    -n,--dry-run                    do not update, but list upcoming changes and potential conflicts.
{{% /alert %}}

## Root user commands

These commands are reserved for the root user:

| Command                   | Example                        | Description |
| --------------------------|--------------------------------| ----------- |
| omd setversion <version>  | %> omd setversion 2.80         | Sets the default version which will be used by new sites. |
| omd create <sitename>     | %> omd create example          | Create a new site (-u UID, -g GID) |
| omd rm <sitename>         | %> omd rm example              | Remove a site (and all its data) |
| omd disable <sitename>    | %> omd disable example         | Disable a site (stop it, unmount tmpfs, remove Apache hook) |
| omd enable <sitename>     | %> omd enable example          | Enable a site (reenable a formerly disabled site) |
| omd mv <site> <site>      | %> omd mv sitea siteb          | Rename a site. |
| omd cp <site> <site>      | %> omd cp sitea siteb          | Make a copy of a site. |
| omd su <site>             | %> omd su example              | Run a shell as a site-user. |
| omd restore <tarball>     | %> omd restore /tmp/backup.tgz | Restore site from backup. |


## Site user commands

Daily tasks should be done by the site user with these commands:

| Command                   | Example                     | Description |
| --------------------------|-----------------------------| ----------- |
| omd update                | %> omd update               | Update site to newest installed version of OMD. |
| omd -V <version> update   | %> omd -V 1.30 update       | Update site to this version. |
| omd start                 | %> omd start                | Start all services of this site. |
| omd start <service>       | %> omd start apache         | Start one specific service of this site. |
| omd stop                  | %> omd stop                 | Stop all services of this site. |
| omd stop <service>        | %> omd stop apache          | Stop one specific service of this site. |
| omd reload                | %> omd reload               | Reload all services of this site. |
| omd reload <service>      | %> omd reload apache        | Reload one specific service of this site. |
| omd status                | %> omd status               | Display status all services of this site. |
| omd status <service>      | %> omd status apache        | Display status one specific service of this site. |
| omd config                | %> omd config               | Show and set site configuration parameters. |
| omd backup <tarball>      | %> omd backup /tmp/site.tgz | Create a backup of this site. |

{{% pageinfo %}}
Bash Completion: Latest OMD-Labs comes with bash-completion, so you can tab-complete most commands and arguments.
{{% /pageinfo %}}


