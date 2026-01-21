---
author: Roland Huß
date: '2011-02-21T19:16:49+00:00'
slug: jolokia-0-83-with-roo-addon
title: Jolokia 0.83 with Roo addon
---

[Jolokia](http://www.jolokia.org) 0.83 has been released which now contains a [Roo](http://www.springsource.org/roo) addon.

<!--more-->
Version 0.83 contains the following features:

* The OSGi Jolokia agents have been revisited. The all-in-one bundle has now been switched to use the [Felix HttpService][1] implementation and requires only an import of OSGi `LogService` interface definition. Read more about the OSGi agents in the [reference manual][2]
* [Virgo][3] 2.1 has been added to the list of supported platforms and a dedicated Virgo detector has been added.
* A brand new Spring [Roo][5] addon for integrating Jolokia into a Roo managed web project. It will register a Jolokia agent servlet into the project's web.xml. Details about this add-on can be found in the [reference manual][4], too. In case you don't know roo, in short, it is a rapid application development shell for Java applications.

With the Jolokia Roo addon it is now easier than ever to include the Jolokia servlet into your Roo managed web projects so that your application (and the servlet container your webapp is running in) can be easily monitored e.g. via Nagios and [check_jmx4perl][6].

The Jolokia Roo addon is not yet available via the central addon registry *roobot*, so currently you have to add the addon manually. The following examples demonstrates a sample roo session from scratch, which will setup a Jolokia servlet:

<pre>
// Create a small, hot webapplication
project --topLevelPackage demo
persistence setup --database H2_IN_MEMORY --provider HIBERNATE
entity --class ~.domain.Chili
field string --fieldName name
field string --fieldName family
field number --fieldName scoville --type java.lang.Integer
controller all --package ~.web<br/>
// Add Jolokia Roo-Addon directly until roboot.xml is updated. Please note,
// that this will prevent any PGP checks!
osgi start --url http://labs.consol.de/maven/repository/org/jolokia/jolokia-roo/0.83/jolokia-roo-0.83.jar<br/>
// Setup Jolokia
jolokia setup
</pre>

The final `jolokia setup` will perform the following steps:

* Adds a dependency to `jolokia-core` (0.83) in the project's `pom.xml`
* Adds a servlet definition and a servlet mapping `/jolokia` to the projec's `web.xml`. In the example above, if you start the webapp with a `mvn jetty:run`, the agent's url is `http://localhost:8080/demo/jolokia`

There are some options to tune the behaviour of the addon. Please refer to the [manual][4] for details.

 [1]: http://felix.apache.org/site/apache-felix-http-service.html
 [2]: http://www.jolokia.org/reference/html/agents.html#agents-osgi
 [3]: http://www.eclipse.org/virgo/
 [4]: http://www.jolokia.org/reference/html/tools.html#tools-roo
 [5]: http://www.springsource.org/roo
 [6]: http://search.cpan.org/~roland/jmx4perl/scripts/check_jmx4perl