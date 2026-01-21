---
author: Roland Huß
date: '2012-04-22T18:33:30+00:00'
slug: jmx4perl-1-05-and-jolokia-1-0-3
title: Jmx4Perl 1.05 and Jolokia 1.0.3
---

[Jmx4Perl](http://search.cpan.org/~roland/jmx4perl/) and her sister project [Jolokia](http://www.jolokia.org) received some spring updates.

<!--more-->
Jolokia has now support for cross-origin resource sharing
([CORS][2]), which allows Javascript clients to access Jolokia agents
from everywhere, avoiding the 'same origin policy' in a controlled
manner. The server side allows now by default all cross-domain
requests, but this can be restricted with Jolokia's
[security setup][3].  The [Javascript library][4] already support CORS
for most browsers out of the box, for IE8 and larger some special
setup is still required. Transparent CORS client support for all
browsers will be added to the Jolokia Javascript client in one of the
next releases.

Additionally, Jolokia adds the following new features:

* [AMD][5] support for `jolokia.js` and `jolokia-simple.js`
* Time based eviction of historical values remembered on the client
  side, in addition to count based eviction.
* New configuration option `httpServiceFilter` for the OSGi agent for
  selection of a specific HttpService to bind to.
* None-caching headers added to the response

Jmx4Perl also received a minor update to 1.0.5 with the following
fixes:

* Fix for some build issues and enhanced installation experience by
  embedding `Module::Build` into the distro.
* Fixes for some `check_jmx4perl` default configurations files
* Updated documentation for `jmx4perl` explaining the `--method` and
  `--legacy-escape` parameters.
* Added new command `pwd` for printing the current MBean to j4psh as well as options `-a` and `-o` for selecting attributes or operations while doing an `ls` on an MBean. Wildcards are supported for `ls` as well.

Starting with this release, bug tracking and release planning for
Jolokia and Jmx4Perl switches over to Jolokia's [JIRA][6] instance,
kindly donated by the fine folks from [Atlassian](http://www.atlassian.com).

   [1]: http://www.jolokia.org
   [2]: http://www.w3.org/TR/cors/
   [3]: http://www.jolokia.org/features/security.html
   [4]: http://www.jolokia.org/client/javascript.html
   [5]: https://github.com/amdjs/amdjs-api/wiki/AMD
   [6]: http://jolokia.jira.com