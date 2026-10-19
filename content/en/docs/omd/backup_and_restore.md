---
title: Backup / Restore
---

## Backup

Backups are useful in various situations, such as recovering from a crash
or migrating from an old platform
to a new one.

### With OMD

Creating a backup is as simple as running:

```
    %> OMD[example]:~$ omd backup /tmp/site_test_backup.tgz
```

This command creates a tarball containing the site itself along with some
metadata required to restore this backup, even to a different
OMD version.

Metadata was added in OMD-Labs version 2.40. If you want
to create a complete backup with an older release, read the next section on
how to create a backup manually.

### Manually

You can also create a backup manually. The backup format changed in
OMD-Labs 2.40, so if you want to create a backup for an older release, you can
use the following command as the site user:

```
    OMD[example]:~$ cd /omd/sites/ && \
                    tar cfz /tmp/$OMD_SITE.backup.tgz \
                        $OMD_SITE/version \
                        $OMD_SITE/version/skel \
                        $OMD_SITE/share/omd/skel.permissions \
                        $OMD_SITE
```

You can restore such a backup with any OMD-Labs release starting with version 2.40.

### Git

Just a side note, but it is a good idea to put all configuration information
and user-developed plugins into version control. OMD-Labs is prepared for Git.
So you can just run

```
    OMD[example]:~$ git init
    OMD[example]:~$ git add .
    OMD[example]:~$ git commit -v -m 'initial commit'
```

to put all files under Git version control. There is a `.gitignore` file in the
site which excludes all databases, log files and RRD files.


## Restore

A backup is useless if it cannot be restored, so always test
restoring it (e.g. on a fresh test virtual machine).

There are basically two variants:

    - restoring backup onto a new machine
    - restoring backup into existing site


### Restore onto a new machine

Restoring a backup onto a new machine requires you to install OMD-Labs on the
new machine. It's a good choice to install the same OMD version which the backed up
site had, but that's not a strict requirement for backups created with
OMD 2.40 and later.

The restore can be started as the root user with this command.

```
    #> omd restore /tmp/site_test_backup.tgz
```

If the old OMD version is not installed on the new machine, the restore will
automatically update the site to the currently installed OMD version.

### Restoring backup into existing site

Restoring into an existing site deletes all files in this site and replaces
them with files from the backup. The command is the same as for new machines, but
you start the restore from within the site itself.

```
    OMD[example]:~$ omd restore /tmp/site_test_backup.tgz
```

## Platform Migration and OS-Upgrades

OS upgrades and platform migrations are special cases, for example from CentOS 6
to CentOS 7, or even from CentOS 6 to Debian. If you just sync the site over
to the new machine, config files will still point to CentOS 6 locations. So it
is better to run `omd backup` on the old machine and `omd restore` on the
new machine. This will not only restore the old site, but will also `update`
all config files to match the new platform. If it is an older OMD release, create
the backup manually as described earlier.
