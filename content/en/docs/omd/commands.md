---
title: Commands
description: "Manage OMD versions, monitoring sites, and services with commands for administrators and site users."
weight: 20
---

Use `omd` to manage installed versions, monitoring sites, and their services. The commands below are grouped by the user who runs them.

## General OMD commands

These commands work without a site context and can be run by any user.

<div class="omd-command-table">

| Command | Description |
| --- | --- |
| `omd help` | Show general help. |
| `omd version` | Display the currently used OMD version. |
| `omd versions` | List all installed OMD versions on this host. |
| `omd sites` | List the monitoring sites. |

</div>

<aside class="omd-command-help" aria-label="Command help">

**Find command options**

Every command accepts `--help` to list its available options. For example:

```sh
omd update --help
```

```text
Usage: omd update [SITE] [options...]
Description: Update site to other version of OMD
Options for the 'update' command:
--conflict                 ARG  non-interactive conflict resolution. ARG is install, keepold, abort or ask
-n,--dry-run                    do not update, but list upcoming changes and potential conflicts.
```

</aside>

## Root user commands

Run these commands as `root` to create and administer monitoring sites. Replace values in angle brackets with your version, site name, or backup path.

<div class="omd-command-table">

| Command | Example | Description |
| --- | --- | --- |
| `omd setversion <version>` | `omd setversion 5.80` | Set the default OMD version for new sites. |
| `omd create <sitename>` | `omd create example` | Create a site. Use `-u UID` and `-g GID` to set its user and group IDs. |
| `omd rm <sitename>` | `omd rm example` | Remove a site and all its data. |
| `omd disable <sitename>` | `omd disable example` | Stop a site, unmount its tmpfs, and remove its Apache hook. |
| `omd enable <sitename>` | `omd enable example` | Reenable a disabled site. |
| `omd mv <source> <target>` | `omd mv sitea siteb` | Rename a site. |
| `omd cp <source> <target>` | `omd cp sitea siteb` | Copy a site. |
| `omd su <site>` | `omd su example` | Open a shell as the site user. |
| `omd restore <tarball>` | `omd restore /tmp/backup.tgz` | Restore a site from a backup. |

</div>

## Site user commands

Run daily monitoring tasks as the site user. Commands without a service name apply to all services in that site.

<div class="omd-command-table">

| Command | Example | Description |
| --- | --- | --- |
| `omd update` | `omd update` | Update the site to the newest installed OMD version. |
| `omd -V <version> update` | `omd -V 5.80 update` | Update the site to a specific installed version. |
| `omd start` | `omd start` | Start all site services. |
| `omd start <service>` | `omd start apache` | Start a specific service. |
| `omd stop` | `omd stop` | Stop all site services. |
| `omd stop <service>` | `omd stop apache` | Stop a specific service. |
| `omd reload` | `omd reload` | Reload all site services. |
| `omd reload <service>` | `omd reload apache` | Reload a specific service. |
| `omd status` | `omd status` | Display the status of all site services. |
| `omd status <service>` | `omd status apache` | Display the status of a specific service. |
| `omd config` | `omd config` | View and change the site configuration. |
| `omd backup <tarball>` | `omd backup /tmp/site.tgz` | Create a backup of the site. |

</div>

## Bash completion

OMD Labs-Edition includes Bash completion. Press **Tab** to complete most commands and arguments.
