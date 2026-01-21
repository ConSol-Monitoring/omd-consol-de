---
author: Gerhard Laußer
date: '2012-06-02T10:30:42+00:00'
slug: monitoring-cpu-usage-of-a-linux-system-with-check_logfiles
tags:
- check_logfiles
title: Monitoring CPU usage of a Linux system with check_logfiles
---

Keeping an eye on cpu usage of your servers is one of the basic things in system monitoring. For Nagios (and Shinken, of course) you'll find plenty of plugins for this task. However, i was never happy with the way they work. Most of the plugins you can download work like this: read a counter - sleep - re-read the counter. This technique not only adds an extra delay to the execution time of the plugin, but it only shows the state of things within a small time frame. If you run such a plugin every 5 minutes and it sleeps 5 seconds between the two measurements, you don't know what happens in the other 295 seconds. This is a very small sample rate.
<!--more-->
Another technique is to read the counter and compare it to the value which was saved when the plugin ran last time. The new data will then be saved again (so it can be used in the next run). This way the calculation is based on a delta covering the whole time range between two subsequent runs of a plugin.
One of the core functionalities of the check_logfiles plugin is to save persistent information after each run which can be used in the next run. It's other job is to read lines from files. So why not use check_logfiles to read /proc/stat and save counters between the plugin's runs?
The result is this proof-of-concept, which again shows that check_logfiles is a tool for all kinds of monitoring jobs.

Please note that you need the newest release of <a href="/nagios/check_logfiles/" title="check_logfiles">check_logfiles</a>.

```perl
=head1 NAME

check_cpu.cfg - A config file for check_logfiles used to monitor cpu usage

=head1 SYNOPSIS

    $ check_logfiles --config check_cpu.cfg

=head1 DESCRIPTION

From man (5) proc:
       /proc/stat
              kernel/system statistics.   Varies  with  architecture.   Common
              entries include:

              cpu  3357 0 4313 1362393
                     The   amount  of  time,  measured  in  units  of  USER_HZ
                     (1/100ths  of  a  second  on  most   architectures,   use
                     sysconf(_SC_CLK_TCK) to obtain the right value), that the
                     system spent in user mode, user mode  with  low  priority
                     (nice),  system  mode,  and  the idle task, respectively.
                     The last value should be USER_HZ times the  second  entry
                     in the uptime pseudo-file.

                     In Linux 2.6 this line includes three additional columns:
                     iowait - time waiting for I/O to complete (since 2.5.41);
                     irq  -  time  servicing  interrupts  (since 2.6.0-test4);
                     softirq - time servicing softirqs (since 2.6.0-test4).

                     Since Linux 2.6.11, there is an eighth  column,  steal  -
                     stolen  time,  which is the time spent in other operating
                     systems when running in a virtualized environment

                     Since Linux 2.6.24, there is a ninth column, guest, which
                     is  the  time  spent  running  a  virtual  CPU  for guest
                     operating systems under the control of the Linux  kernel.

The plugin check_logfiles is used to scan the /proc/stat file and read the cpu entry above. The numbers in this line are used to calculate the percentage of time the cpu has spent in each of the listed modes since check_logfiles was run for the last time.

=head2 An Example

$ check_logfiles --config check_cpu.cfg
user: 3.90%, nice: 0.10%, sys: 2.89%, idle: 92.31%, iowait: 0.19%, irq: 0.00%, sirq: 0.40%, steal: 0.23%, guest: 0.00% | user=3.90% nice=0.10% sys=2.89% idle=92.31% iowait=0.19% irq=0.00% sirq=0.40% steal=0.23% guest=0.00%

=head1 SEE ALSO

man (5) proc

=head1 COPYRIGHT

Copyright Gerhard Laußer

Permission is granted to copy, distribute and/or modify this
document under the terms of the GNU Free Documentation
License, Version 1.2 or any later version published by the
Free Software Foundation; with no Invariant Sections, with
no Front-Cover Texts, and with no Back-Cover Texts.

=cut

my @columns = ();
my $percent = {};

@searches = ({
  tag => 'cpu',
  logfile => '/proc/stat',
  type => 'virtual',
  criticalpatterns => ['^cpu\s+'],
  options => 'script,savestate',
  script => sub {
    my $numcols = scalar(split(/\s+/, $ENV{CHECK_LOGFILES_SERVICEOUTPUT}));
    if ($numcols == 4) {
      @columns = (qw(user nice sys idle));
    } elsif ($numcols == 7) {
      @columns = (qw(user nice sys idle iowait irq sirq));
    } elsif ($numcols == 8) {
      @columns = (qw(user nice sys idle iowait irq sirq steal))
    } else {
      @columns = (qw(user nice sys idle iowait irq sirq steal guest))
    }
    my $elapsed = time - $CHECK_LOGFILES_PRIVATESTATE->{lastruntime};
    my $idx = 1;
    my $nowvalues = {};
    my $lastvalues = {};
    my $ticks = 0;
    foreach my $col (@columns) {
      $nowvalues->{$col} = (split(/\s+/, $ENV{CHECK_LOGFILES_SERVICEOUTPUT}))[$idx];
      $idx++;
      $lastvalues->{$col} = exists $CHECK_LOGFILES_PRIVATESTATE->{$col} ?
          $CHECK_LOGFILES_PRIVATESTATE->{$col} : 0;
      if ($nowvalues->{$col} < $lastvalues->{$col}) {
        $lastvalues->{$col} = 0;
      }
      $CHECK_LOGFILES_PRIVATESTATE->{$col} = $nowvalues->{$col};
      $deltavalues->{$col} = $nowvalues->{$col} - $lastvalues->{$col};
      $ticks += $deltavalues->{$col};
    }
    foreach my $col (@columns) {
      $percent->{$col} = 100 * $deltavalues->{$col} / $ticks;
    }
  },
});

$options = 'supersmartpostscript';
$postscript = sub {
  my @output = ();
  my @perfdata = ();
  foreach my $col (@columns) {
    push(@output, sprintf '%s: %.2f%%', $col, $percent->{$col});
    push(@perfdata, sprintf '%s=%.2f%%', $col, $percent->{$col});
  }
  printf "%s | %s\n", join(', ', @output), join(' ', @perfdata);
  return 0;
};
```