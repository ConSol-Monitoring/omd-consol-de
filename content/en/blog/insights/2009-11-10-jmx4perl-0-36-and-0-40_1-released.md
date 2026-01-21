---
author: Roland Huß
date: '2009-11-10T12:28:27+00:00'
slug: jmx4perl-0-36-and-0-40_1-released
tags:
- Jmx4Perl
title: jmx4perl 0.36 and 0.40_1 released
---

Last week a minor update for jmx4perl was released. Beside bugfixes and code cleanup, [version 0.36](http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.36.tar.gz) includes:

* A way to restrict agent acces to certain IPs or networks
* Experimental support for a JDK 1.4 agent
* Support for configuration files in order to alias server&nbsp;configuration parameters

But wait, there is more ... ;-)

<!-- --><!--more-->[Version 0.40][2] has been released as a developer release which contains rather big changes concerning the agent servlet. In addition to the usual GET HTTP request, which encodes a JMX request completely within the URL it now allows for POST HTTP requests containing a JSON representation of the JMX request. This way, jmx4perl is now also able to process bulk requests, i.e. multiple requests as one. For pure Perl users, this extension works transparently and is reflected only in a single addition of `JMX::Jmx4Perl`'s API:

```perl
my @responses = $jmx4perl->request(@requests);
```

I.e. you can now use a list of `JMX::Jmx4Perl::Request` objects for the request method in which case you get back a list of `JMX::Jmx4Perl::Response` objects. Jmx4perl automatically decides, whether a simple GET request is sufficient (for a single request) or whether a bulk POST request is needed (for multiple requests). Note, that the order of the returned responses reflects the order of the given requests (but you can look into the response objects themselves to get back the original request, see the documentation).

A minor change for the perl hacker, a big one for the agent ;-). The addition should be perfectly backwards compatible. Please give 0.40_1 a try and let me know, whether it works for you. I expect (though I don't ask for :) some trouble, so please don't use it yet in production environments.

This addition of bulk operations is just an intermediate step for an additional proxy servlet in version 0.50 which will enable the usage of jmx4perl without deploying an agent servlet on the target platform. Stay tuned ...

 [1]: http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.36.tar.gz
 [2]: /jmx4perl/2009/10/08/check_jmx4perl-einfache-servicedefinitionen.html