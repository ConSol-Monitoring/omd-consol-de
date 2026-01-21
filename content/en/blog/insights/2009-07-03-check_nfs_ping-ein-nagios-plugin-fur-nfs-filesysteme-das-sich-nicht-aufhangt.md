---
author: Admin
date: '2009-07-03T18:08:10+00:00'
slug: check_nfs_ping-ein-nagios-plugin-fur-nfs-filesysteme-das-sich-nicht-aufhangt
tags:
- Nagios
title: check_fs_ping - Ein Nagios-Plugin für NFS-Filesysteme, das sich nicht aufhängt
---

Ein unangenehmes Phänomen bei NFS-gemounteten Filesysteme tritt auf, wenn der Fileserver abstürzt oder ein Netzwerkproblem zwischen NFS-Server und -Client besteht. Sämtliche Prozesse, die auf Dateien auf so einem Filesystem zugreifen wollen, bleiben einfach hängen. Das gilt auch für Nagios-Plugins. Nach Ablauf des Timeouts wird der Nagios-Kernel den Plugin-Prozess zwar abschiessen, jedoch bleibt dieser in der Prozessliste und zwar so lange, bis der NFS-Server wieder antwortet.<!--more-->{% if site.lang == "de" %} Bei einem check_interval von 5 Minuten können sich so eine Menge hängender Prozesse ansammeln. Es gibt jedoch einen Trick, mit dem ein Nagios-Plugin ein hängendes NFS-Filesystem ermitteln und sich trotzdem sauber beenden kann. Man lässt den kritischen Dateizugriff einfach in einem eigenen Thread laufen, der den aufrufenden Prozess nicht blockiert und der am Ende des Plugins einfach zerstört wird. Nicht nur NFS-Filesysteme können auf diese Weise überwacht werden. Auch beispielsweise bei hierarchischen Filesystemen, bei denen externe Datenträger geladen werden müssen, kann man die Reaktionszeiten messe. Das Plugin trägt den Namen check_fs_ping und wird folgendermassen aufgerufen:

```bash
nagsrv$ /usr/local/nagios/libexec/check_fs_ping --path /storage
CRITICAL - /storage did not respond within 5.05s | /storage=5.045139s;3;4
```

Und hier ist der Source-Code dazu:

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

{% else if site.lang == "en" %}
this page is not available in english
{% endif %}