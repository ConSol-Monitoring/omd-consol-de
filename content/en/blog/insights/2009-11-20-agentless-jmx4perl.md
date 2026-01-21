---
author: Roland Huß
date: '2009-11-20T08:43:56+00:00'
excerpt: 'Big news around: [jmx4perl](http://www.jmx4perl.org) starts to support an
  agentless mode in which the target platform can be monitored without installing
  the j4p agent servlet. This works by using `j4p.war` as a *JMX Proxy*, which translates
  our JSON/HTTP protocol on the frontside to JSR-160 JMX remote requests on the backend
  and vice versa.<br>'
slug: agentless-jmx4perl
tags:
- jmx
title: Jmx4Perl without agent servlet
---

Big news around: [jmx4perl](http://www.jmx4perl.org) supports now an agentless mode in which the target platform can be monitored without installing the j4p agent servlet. This works by using `j4p.war` as a *JMX Proxy*, which translates our JSON/HTTP protocol on the frontside to JSR-160 JMX remote requests on the backend and vice versa.

<!-- -->
<!--more-->Version [0.50][1] has been submitted to CPAN.  If you want to try out the proxy mode, here is a recipe to set it up. In this example I use JBoss 4.2.3, but you are encouraged to try it out for a different application server of your choice (in which case I'm really keen to know your feedback ;-)

 * Download [jmx4perl-0.50.tar.gz][1] and install it as usual

 * Install [Jetty][2] or [Tomcat][3] by simply extracting it

 * Copy `j4p.war` from the `agent/` directory into Jetty/Tomcat's `webapp` directory

 * Startup Jetty/Tomcat (listening now on localhost, port 8080)

 * Install [JBoss 4.2.3][4] and extract it. Proxy support for 5.0 and 5.1 works too,
   but you will have a hard time to get to the JBoss specific MBeans (more on this in a next blog).

 * Within the JBoss installation directory, edit `bin/run.conf` and add
   the following lines near the end of the file to enable JMX remoting on port 9999:

```bash
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.port=9999"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.ssl=false"
JAVA_OPTS="$JAVA_OPTS -Djboss.platform.mbeanserver"
JAVA_OPTS="$JAVA_OPTS -Djavax.management.builder.initial=\
                      org.jboss.system.server.jmx.MBeanServerBuilderImpl"
```
 * Change the default port 8080 for JBoss to something different by
   editing the Connector declaration in
   `server\default\deploy\jbossweb-web.deployer\server.xml`.  Look for the connector with port 8080 and change this to e.g. 9090.

```xml
<Connector port="8080" address="${jboss.bind.address}" ....>
```

 * Startup JBoss

Now for the fun part: You can use `jmx4perl` and `check_jmx4perl` as usual against the Jetty/Tomcat
proxy, but adding the option `--target` for specifying the target server. The JMX service URL for
JBoss to use here is

    service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi

First, due to a bug in JBoss, you need to fetch the list of MBeans first in order to access the PlatformMBeanServer (this workaround is transparently included in j4p.war when used in agent mode. The workaround is not needed at all for `check_jmx4perl`, btw):
```bash
jmx4perl http://localhost:8080/j4p  \
      --target service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi list
```

Next, you can get information about the target server via JMX with
```bash
jmx4perl http://localhost:8080/j4p \
      --target service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi
```
And so on. All operations should work as usual.

Limitations
----------------------

Said all this, the proxy mode has some limitations:

* There is no automatic merging of JMX MBeanServers as in the case of the direct mode.  Most application servers uses an own MBeanServer in addition to the PlatformMBeanServer (which is always present). Each MBean is registered only in one MBeanServer. The choice, which MBeanServer to use has to be given upfront, usually as a part of the JMX Service URL. But even then (as it is the case for JBoss 5.1) you might run into problem when selecting the proper MBeanServer.

* Proxying adds an additional remote layer which causes additional problems. I.e. the complex operations like 'list' might fail in the proxy mode because of serialization issues. E.g. for JBoss it happens that certain MBeanInfo objects requested for the list operation are not serializable. This is a bug of JBoss, but I expect similar limitations for other application servers as well.

* Certain workarounds (like the JBoss 'can not find MXBeans before MBeanInfo has been fetched' bug) works only in agent mode.

* It is astonishingly hard to set up an application server for JSR-160 export. And there are even cases (combinations of JDK and AppServer Version) which don't work at all properly (e.g. JDK 1.5 and JBoss 5). For JBoss, a followup [blog entry][5] will clarify things.

Summary
-------

I recommend the agent servlet mode over the proxy mode. The proxy mode should be used when required. The agent servlet on its own is more powerful than the proxy mode since it eliminates an additional layer, which adds to the overall complexity and performance. Also, minor additional features like merging of MBeanServers are not available in the proxy mode.

 [1]: http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.50.tar.gz
 [2]: http://dist.codehaus.org/jetty/jetty-6.1.22/jetty-6.1.22.zip
 [3]: http://apache.easy-webs.de/tomcat/tomcat-6/v6.0.20/bin/apache-tomcat-6.0.20.tar.gz
 [4]: http://sourceforge.net/projects/jboss/files/JBoss/JBoss-4.2.3.GA/jboss-4.2.3.GA.zip/download
 [5]: /jmx4perl/2009/11/23/jboss-remote-jmx.html