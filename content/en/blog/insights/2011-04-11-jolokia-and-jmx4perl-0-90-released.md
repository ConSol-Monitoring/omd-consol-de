---
author: Roland Huß
date: '2011-04-11T19:53:14+00:00'
slug: jolokia-and-jmx4perl-0-90-released
tags:
- jmx
title: Jolokia and Jmx4Perl 0.90 released
---

Hand in hand, [Jolokia](http://www.jolokia.org) and [Jmx4Perl](http://www.jmx4perl.org) started their countdown for their first major version, scheduled late this summer.

While Jolokia got some minor enhancements, Jmx4Perl now finally got rid of any Java code, relying now completely on a Jolokia agent.

<!--more-->
The changes in detail:

Jolokia
=======

* Reworked policy lookup to allow lookup from any (loadable) URL for the servlet and for the possibility to consume am OSGi restrictor service in an OSGi environment.

* Error codes for search requests has been streamlined.

* Maps and Lists are supported to some degree for input parameters in write and exec requests.

* Reference manual updates.

* Update to jQuery 1.5.1 for the Javascript client library.

* JSON values have now the proper type (string, number, boolean) instead of being returned always as strings.

Jmx4Perl
========

* Added a new script `cacti_jmx4perl`, a [Cacti][1] command similar in spirit to `check_jmx4perl` but without thresholds.

* Removed the sources for the Java agent and cleaned up the build process.

* Added a new tool `jolokia` for downloading and managing the Jolokia Java agents.

Easy download of Jolokia agents
===============================

Especially the new [`jolokia`][2] command line tool which comes with Jmx4Perl is interesting not only for Perl developers.

Here's an exampel for downloading an agent and setting up a security policy file:

```bash
# Go into a Tomcat deploy directory:
$ cd $TC/webapps

# Download the war agent
$ jolokia
* Loading Jolokia meta data from http://www.jolokia.org/jolokia.meta
* Good PGP signature, signed by Roland Huss <roland@jmx4perl.org> (EF101165)
* Using Jolokia 0.90 for Jmx4Perl 0.90_5
* Downloading war agent version 0.90 from repository http://labs.consol.de/maven/repository
* Saved ./jolokia.war
* Good PGP signature, signed by Roland Huss <roland@jmx4perl.org> (EF101165)

# Download a sample policy file
$ jolokia --policy

* Downloading jolokia-access.xml version 0.90
* Saved ./jolokia-access.xml
* Good PGP signature, signed by Roland Huss <roland@jmx4perl.org> (EF101165)

# Edit the policy file
$ vi jolokia-access.xml

# Re-pack the agent
$ jolokia repack --policy jolokia.war

* Adding policy WEB-INF/classes/jolokia-access.xml to jolokia.war

# Verify, that the policy file was properly included
$ jolokia jolokia.war

* Type: war
* Version: 0.90
* Policy: jolokia-access.xml embedded
* Security: No authentication enabled
* Proxy: JSR-160 proxy is enabled

# Remove left over policy file
$ rm jolokia-access.xml
```

Work will continue for this tool to allow deployment of agents to remote servers. Please stay tuned ....

[1]: http://www.cacti.net/
[2]: http://search.cpan.org/~roland/jmx4perl/scripts/jolokia