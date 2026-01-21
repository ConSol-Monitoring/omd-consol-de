---
author: Roland Huß
date: '2010-01-10T21:08:28+00:00'
excerpt: The first developer version jmx4perl 0.55_1 with OSGi support has been pushed
  to CPAN. This post desribes the new features and the plans for 0.55 and beyond.
slug: jmx4perl-osgi-bundle
tags:
- jmx
title: Jmx4Perl OSGi Bundle
---

The first developer version jmx4perl 0.55_1 with OSGi support has been pushed to CPAN.

<!--more-->
New year, new features: [jmx4perl][1] is going to provide support for [OSGi][2]. If you ask yourself what the heck is OSGi, in brief, OSGi is a Java platform for modules, so called *bundles*. It provides support for runtime dependency management, module lifecycle support and intra-VM services. Most of the newest Java application servers are based on an OSGi kernel. A good introduction to OSGi can be found [here][3].

The just released development version [0.55_1][4] contains the OSGi-Bundle [j4p-osgi-0.55.0.M1.jar][5], which can be deployed on an arbitrary OSGi platform ([Felix][10] and [Equinox][11] has been tested). The only dependency is on an OSGi HttpService for which various implementations exist. The bundle will be reachable under the context *j4p/*.

For a quick start, here is a sample session using [Pax Runner][12] as launcher (it is assumed, that you have it installed and *pax-run* is in your path). *pax-run* should be called with the [j4p-osgi-0.55.0.M1.jar][5] bundle as argument:

```text
$ pax-run --profiles=core,compendium,web j4p-osgi-0.55.0.M1.jar
 __________                 __________
 \______   \_____  ___  ___ \______   \__ __  ____   ____   ___________
 |     ___/\__  \ \  \/  /  |       _/  |  \/    \ /    \_/ __ \_  __ \
 |    |     / __ \_>    <   |    |   \  |  /   |  \   |  \  ___/|  | \/
 |____|    (____  /__/\_ \  |____|_  /____/|___|  /___|  /\___  >__|
               \/      \/         \/           \/     \/     \/

 Pax Runner (1.3.0) from OPS4J - http://www.ops4j.org
 ----------------------------------------------------

 -> Using config [classpath:META-INF/runner.properties]
 -> Using only arguments from command line
 -> Scan bundles from [bundles/j4p-osgi-0.55.0.M1.jar]
 -> Scan bundles from [scan-bundle:file:/Users/roland/Downloads/t/bundles/j4p-osgi-0.55.0.M1.jar]
 -> Scan bundles from [scan-composite:mvn:org.ops4j.pax.runner.profiles/core//composite]
 -> Scan bundles from [scan-bundle:mvn:org.osgi/org.osgi.core/4.2.0]
 -> Scan bundles from [scan-composite:mvn:org.ops4j.pax.runner.profiles/compendium//composite]
 -> Scan bundles from [scan-bundle:mvn:org.osgi/org.osgi.compendium/4.2.0]
 -> Scan bundles from [scan-composite:mvn:org.ops4j.pax.runner.profiles/web//composite]
 -> Scan bundles from [scan-composite:mvn:org.ops4j.pax.runner.profiles/log//composite]
 -> Scan bundles from [scan-bundle:mvn:org.ops4j.pax.logging/pax-logging-api/1.4]
 -> Scan bundles from [scan-bundle:mvn:org.ops4j.pax.logging/pax-logging-service/1.4]
 -> Scan bundles from [scan-bundle:mvn:org.ops4j.pax.web/pax-web-jetty-bundle/0.7.2]
 ....

 ->
```

In a second terminal session, fireup *jmx4perl* to connect to the exported bundle e.g. with

```bash
jmx4perl http://localhost:8080/j4p list
```

Authentication is implemented as well (and will be documented in the final release). Although the **regular** agent war could be deployed with the help of a WebApp-Extender, this bundle provides a more lightweight approach.

In addition to the new OSGi stuff, the Perl API will be extended for 0.55 to allow  for listing and querying the attributes of an individual bean.

In parallel, I started a new project called [osgish][13], which aims to provide a readline based shell for OSGi with help of jmx4perl and [Aries][14], an implementation of the forthcoming OSGi Enterprise Expert Group (EEG) specification ([Early Draft 4][15]). The [JMX bundle][16] of Aries exports most management commands via JMX.

 [1]: http://www.jmx4perl.org
 [2]: http://www.osgi.org
 [3]: http://www.manning.com/hall/Hall_MEAP_01.pdf
 [4]: http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.55_1.tar.gz
 [5]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-osgi/0.55.0.M1/j4p-osgi-0.55.0.M1.jar
 [10]: http://felix.apache.org/
 [11]: http://www.eclipse.org/equinox/
 [12]: http://paxrunner.ops4j.org/space/Pax+Runner
 [13]: http://github.com/rhuss/osgish
 [14]: http://incubator.apache.org/aries/
 [15]: http://incubator.apache.org/aries/
 [16]: http://repository.apache.org/snapshots/org/apache/aries/jmx/org.apache.aries.jmx/1.0.0-incubating-SNAPSHOT/