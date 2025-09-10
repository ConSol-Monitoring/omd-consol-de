---
title: Backup / Restore
---

## Backup

Backups are quite handy in various situations. The more obvious one is a crash
for example. But it might also be useful for migrations from an old platform
to a new one.

### With OMD

Creating a backup is as simple as running:

```
    %> OMD[example]:~$ omd backup /tmp/site_test_backup.tgz
```

This command creates a tarball containing the site itself along with some
meta information which is required to restore this backup even into a different
OMD version.

Meta information have been added in OMD-Labs versions 2.40 or later. If you want
to create a complete backup with an older release, read the next section on
how to create a backup manually.

### Manually

You can also create a backup manually. The backup format has been changed with
OMD-Labs 2.40, so if you want to create a backup for an older release, you can
use the following command as site user:

```
    OMD[example]:~$ cd /omd/sites/ && \
                    tar cfz /tmp/$OMD_SITE.backup.tgz \
                        $OMD_SITE/version \
                        $OMD_SITE/version/skel \
                        $OMD_SITE/share/omd/skel.permissions \
                        $OMD_SITE
```

You can restore such backup with any OMD-Labs starting with version 2.40.

### Git

Just a side note, but it is a good idea to put all configuration informations
and user-developed plugins into version control. OMD-Labs is prepared for Git.
So you can just run

```
    OMD[example]:~$ git init
    OMD[example]:~$ git add .
    OMD[example]:~$ git commit -v -m 'initial commit'
```

to put all files into git version control. There is a `.gitignore` file in the
site which excludes all databases, logfile or rrd files.


## Restore

A backup without being able to restore it is useless, so always test and try to
recover from a backup (ex. on a fresh test virtual machine).

There are basically two variants:

    - restoring backup onto a new machine
    - restoring backup into existing site


### Restore onto a new machine

Restoring a backup onto a new machine requires you to install OMD-Labs on the
new machine. It's a good choice to install the same OMD version which the backed up
site had, but thats not a strict requirement. At least not for backups created with
OMD 2.40 and later.

The restore can be started as root user with this command.

```
    #> omd restore /tmp/site_test_backup.tgz
```

If the old omd version is not installed on the new machine, the restore will
automatically do an update of the site to the currently installed omd.

### Restoring backup into existing site

A restore into a existing site deletes all files in this site and replaces
them from the backup. The command is the same as for new machines, except
start the restore from within the site itself.

```
    OMD[example]:~$ omd restore /tmp/site_test_backup.tgz
```

## Platform Migration and OS-Upgrades

A special case are os upgrades and platform migrations, for example from centos 6
to centos 7. Or even from ex. centos 6 to debian. If you just sync the site over
to the new machine, config files will still point to centos 6 locations. So it
is better to do a `omd backup` on the old machine and a `omd restore` on the
new machine. This will not only restore the old site, but will also `update`
all config files to match the new platform. If its an older OMD release, create
the backup manually like described earlier.
