---
author: Roland Huß
date: '2010-10-08T06:15:16+00:00'
excerpt: 'A small Nagios plugin for monitoring search hit counts. Don''t take it too
  seriously.

  '
slug: nagios-gimmick-boost-your-ego
tags:
- Nagios
title: 'Nagios Gimmick: Boost your ego.'
---

A small Nagios plugin for monitoring search hit counts. Don't take it too seriously.

<!--more-->
Seeing the 'Twittermeter' the first time while listening to [The social seismograph][1] during this year's [OSMC][2], I realized that there is a quite some potential in monitoring 'external' metrics or KPIs. Why not 'misuse' Nagios for tracking these sort of metrics ? (This kind of ideas probably pops up only after having a hard night before ;-)

When the days get shorter and the mood is going down, maybe this small Nagios plugin can help you out. Let it search for anything you are proud of (a nicely crafted plugin, tutorials you've written, yourself, ...) on Google and let you alarm when the search count hits some certain watermark. If you use [pnp4nagios][3], a nicely historical graph will prove your ever increasing popularity. It's called `check_ego.pl`, by the way.

```perl
#!/usr/bin/perl
use Nagios::Plugin;
use REST::Google::Search;
use strict;

# 1: Search pattern, 2: Warning threshold, 3: Critical threshold
my ($search,$warn,$crit) = @ARGV;

# Please be nice and add a real referer (and probably an API-Key, too):
REST::Google::Search->http_referer('http://www.example.com');

my $np = new Nagios::Plugin();

# Search on google (one hit is enough)
my $res = REST::Google::Search->new(q => $search, rsz => 1);
$np->nagios_die("Search for '$search' failed: " . $res->responseStatus)
  if $res->responseStatus != 200;
my $count = $res->responseData->cursor->estimatedResultCount;

# Check against given thresholds
my $code = $np->check_threshold(check => $count,
                                warning => $warn,
                                critical => $crit);
$np->add_perfdata(label => "Google $search",value => $count);
$np->nagios_exit($code,
                 ($code != OK ? "Ego boosted !" : "Still waiting ... ") .
                 " ($count hits for '$search')");
```

And here is the nagios configuration. I use a `check_interval` of one day since search hit counts are not supposed to change hourly. You probably want to adapt your PNP template to cope with this large interval. Also, you probably want to disable the host check here, too (unless you intend to make an availability report of www.google.com, too).

```bash
define command {
   command_name           check_ego
   command_line           $USER3$/check_ego.pl "$ARG1$" "$ARG2$" "$ARG3$"
}

define host {
  use                     generic-host
  host_name               google
  alias                   google
  address                 www.google.com
}

define service {
   use                    generic-service,srv-pnp
   name                   google_jmx4perl
   service_description    Google jmx4perl
   host_name              google
#  Search Google only once a day:
   check_interval         1440
   check_command          check_ego!jmx4perl!500!600
}
```


  [1]: http://www.netways.de/index.php?id=2793&L=1
  [2]: http://www.netways.de/osmc/y2010
  [3]: http://www.pnp4nagios.org/