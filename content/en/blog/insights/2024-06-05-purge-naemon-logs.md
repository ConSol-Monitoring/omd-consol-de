---
date: 2024-06-05T00:00:00.000Z
title: "Removing old Naemon logfiles"
linkTitle: "purge"
author: Gerhard Lausser
tags:
  - naemon
---
In an OMD environment Naemon writes its logfile to *var/naemon/naemon.log*. At midnight a logrotate job moves the logfile to the folder *var/naemon/archive*, renaming *naemon.log* to *naemon.log-YYYMMDD*.
By default none of the archived logs is ever deleted. If your disk space is limited, you may want to discard old logs after some months or years.

Create a file *~/local/bin/purge_naemon_archive* with the following content.
```bash
#!/bin/bash

archive_dir=$OMD_ROOT/var/naemon/archive

today=$(date +%Y%m%d)
days_to_keep=${CONFIG_NAEMON_ARCHIVES_RETENTION:-365}
# the oldest day in yyyymmdd format
cutoff_date=$(date -d "$today - $days_to_keep days" +%Y%m%d)

for file in "$archive_dir"/naemon.log-*
do
    # extract the date from the filename
    file_date=$(basename "$file" | cut -d '-' -f 2)

    # if the file's date is older than the cutoff date, delete it
    # (yyyymmdd format allows integer operations)
    if [[ "$file_date" -lt "$cutoff_date" ]]
    then
        rm "$file"
    fi
done
```

Make it executable with:
```bash
chmod 755 ~/local/bin/purge_naemon_archive
```

Then create a cronjob by writing this line into the file *~/etc/cron.d/purge_naemon_archive*:
```
10 0 * * * $OMD_ROOT/local/bin/purge_naemon_archive
```

Finally, restart the cron daemon:
```bash
omd restart crontab
```

Now archived logfiles will be deleted if they are older than a year. You can define your own retention period by setting the environment variable *CONFIG_NAEMON_ARCHIVES_RETENTION* to the number of days you want to keep the log files.
(You can add the variable to *~/etc/environment*)
