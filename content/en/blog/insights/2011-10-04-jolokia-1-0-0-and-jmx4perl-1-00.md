---
author: Roland Huß
date: '2011-10-04T11:01:04+00:00'
slug: jolokia-1-0-0-and-jmx4perl-1-00
title: Jolokia 1.0.0 and Jmx4Perl 1.00
---

Time to celebrate: After two and half years working on [Jmx4Perl](http://www.jmx4perl.org) and [Jolokia](http://www.jolokia.org) it is time now to nail down the 1.0 release. The last month the focus was on hardening this first official release.

<!--more-->
This is backed up by

* 216 integration tests which has been successfully run on 38
  different platforms

* a unit test coverarge of 82.7% with 404 Java and 194 Javascript unit tests.

* a [technical debt][3] as measured by [Sonar][1] of 2% (or 8 man day)

* other Sonar metrics like:
  * 100% rule compliance
  * 0% package tangle index
  * 34.1% comments and 100% documented API
  * 94.6% total quality

The detailed code metrics can be examined on [Jolokia's Sonar Dashboard][2] and it's evolution over time is shown in the [time machine][4].

There has been a minor protocol change for the way how Jolokia does URL escaping for slashes within GET requests. This scheme is not backwards compatible to the pre-1.0 protocol (which used a different, more complicated algorithm). Clients need to be updated, which has been already done for Jmx4Perl 1.00 and of course Jolokia 1.0.0's Javascript und Java client libraries. I apologize for any inconvenience, but I took this last chance before the first GA release in order to start without unneeded baggage. Since Jolokia is out of beta now such kind of change won't happen in this ad-hoc manner in the future any more, promised.

The reference manual is now considered to be in GA state as well with all sections fleshed out. Bick acknowledgments go to [Stephan Beal][5] for proof reading it and making valuable suggestions. There are for sure still bugs in the documentation, I happily accept any GitHub pull requests.

So what's next ?

First, there's a release party this evening ;-). If you are in Munich and want to try some franconian beer or bratwurst, leave me a short [note][7].

For the next release there are quite some ideas, support for JMX notifications and a single page, Javascript client application are on top of the list. Details will be posted later.

Stay tuned and enjoy this release ....

**tl;dr** -- The first GA releases [Jolokia][8] 1.0.0 and [Jmx4Perl][9] 1.00 are out in the wild.

   [1]: http://www.sonarsource.org
   [2]: /sonar/dashboard/index/org.jolokia:jolokia
   [3]: http://docs.codehaus.org/display/SONAR/Technical+Debt+Calculation
   [4]: /sonar/timemachine/index/946
   [5]: http://www.wanderinghorse.net
   [7]: mailto:bratwurst@jolokia.org
   [8]: http://www.jolokia.org
   [9]: http://www.jmx4perl.org