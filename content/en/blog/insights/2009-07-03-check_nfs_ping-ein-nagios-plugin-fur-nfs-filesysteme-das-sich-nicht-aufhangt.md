---
author: Admin
date: '2009-07-03T18:08:10+00:00'
slug: check_nfs_ping-ein-nagios-plugin-fur-nfs-filesysteme-das-sich-nicht-aufhangt
tags:
- Nagios
title: check_fs_ping - A Nagios plugin for NFS filesystems that does not hang
---

When an NFS file server crashes or a network problem interrupts the connection between the NFS server and client, processes that access files on the mounted filesystem can hang. This also affects Nagios plugins. After a timeout, Nagios tries to terminate the plugin process, but it can remain in the process list until the NFS server responds again.

<!--more-->

With a `check_interval` of five minutes, many hanging processes can accumulate. A Nagios plugin can detect an unresponsive NFS filesystem and still exit cleanly by running the potentially blocking file access in a separate thread. This thread does not block the calling process and is discarded when the plugin exits.

This approach can also monitor response times for other filesystems, such as hierarchical storage systems that need to load external storage media. The plugin is called `check_fs_ping` and is invoked as follows:

```bash
nagsrv$ /usr/local/nagios/libexec/check_fs_ping --path /storage
CRITICAL - /storage did not respond within 5.05s | /storage=5.045139s;3;4
```

Here is the source code:

```perl
#! /usr/bin/perl

use strict;
use Nagios::Plugin;
use threads;
#use threads::shared;

*Nagios::Plugin::Functions::get_shortname = sub {
    return undef; # suppress output of shortname
};
my $plugin = Nagios::Plugin->new(
    shortname => '',
    usage => 'Usage: %s [ -v|--verbose ] [ -t <timeout> ] '.
        '--warning <seconds> --critical <seconds> '.
        '--path <path to check> [--path <path to check> ...]'
);
$plugin->add_arg(
    spec => 'path|p=s@',
    help => '--path=STRING . The path leading to the filesystem in question.',
    required => 1,
);
$plugin->add_arg(
    spec => 'warning|w=s',
    help => ['-w, --warning=INTEGER.',
            'Minimum "hang" time until warning. (default is 1s)'],
    required => 0,
);
$plugin->add_arg(
    spec => 'critical|c=s',
    help => ['-c, --critical=INTEGER',
            'Minimum "hang" time until critical. (default is 5s)'],
    required => 0,
);

$plugin->getopts();
$plugin->set_thresholds(
    warning => ($plugin->opts->warning() || 1),
    critical => ($plugin->opts->critical() || 5),
);

my $threads = {};
foreach (map { split ',' } @{$plugin->opts->path()}) {
   $threads->{$_}->{thread} = threads->create(
       sub {
          if (-e $_) {
             return 1;
          } else {
             return 0;
          }
       }
   );
}

my $sleep = sub { sleep shift };
my $granularity = 1;
eval {
   require Time::HiRes;
   import Time::HiRes "sleep";
   $sleep = sub { Time::HiRes::sleep(shift) };
   $granularity = 0.1;
};
my $elapsed = 0;
my $timeout = $plugin->opts->timeout || 15;
while ($elapsed < $timeout) {
   last if ! scalar(keys %{$threads});
   foreach (keys %{$threads}) {
      if ($threads->{$_}->{thread}->is_joinable()) {
         if ($threads->{$_}->{thread}->join()) {
            my $level = $plugin->check_threshold($elapsed);
            $plugin->add_message($level,
                sprintf "%s responded within %.2fs", $_, $elapsed);
         } else {
            $plugin->add_message(CRITICAL,
                sprintf "%s does not exist", $_);
         }
         $plugin->add_perfdata(
             label => $_,
             value => $elapsed,
             uom => 's',
             threshold => $plugin->threshold(),
         );
         delete $threads->{$_};
      } elsif ($threads->{$_}->{thread}->is_running()) {
         if ($plugin->check_threshold($elapsed) == 2) {
            $threads->{$_}->{thread}->detach();
            $plugin->add_message(CRITICAL,
                sprintf "%s did not respond within %.2fs",
                    $_, $elapsed);
            $plugin->add_perfdata(
                label => $_,
                value => $elapsed,
                uom => 's',
                threshold => $plugin->threshold(),
            );
            delete $threads->{$_};
         }
      }
   }
   $elapsed += &$sleep($granularity);
}
my ($code, $message) = $plugin->check_messages(join_all => ', ');
$plugin->nagios_exit($code, $message);
```
