---
author: Roland Huß
date: '2009-12-10T06:59:07+00:00'
excerpt: 'In its standalone mode, [Mule](http://www.mulesoft.org) provides a simple
  to use interface for custom agents to plug in. This blog post is about the new *j4p-mule-agent*
  which can be used together with *jmx4perl* and the Nagios check *check_jmx4perl*.

  '
slug: jmx4perl-mule-agent
tags:
- check_jmx4perl
title: ' Jmx4perl Mule Agent'
---

In its standalone mode, [Mule](http://www.mulesoft.org) provides a simple to use interface for custom agents to plug in. This blog post is about the new jmx4perl mule agent which can be used with `jmx4perl` and the Nagios check `check_jmx4perl`.

<!--more-->
[Mule][1] is one of the leading ESBs which can be used either as a web application or in standalone mode. For monitoring purposes it exposes its management interfaces via JMX, so jmx4perl can be used for a lightweight JMX remote access here as well. When used as a JEE web application the usual jmx4perl agent can be deployed in parallel as a servlet, so no special setup is required here.

When Mule is operating in standalone mode things are a bit different. Mule is **not** a servlet container so deploying a vanilla j4p.war is not possible. Mule itself is able to export JMX interfaces via regular JSR-160 remoting by the use of so called *agents*. Since version 0.50 jmx4perl has a proxy mode for accessing Mule JMX MBeans remotely. However a more direct connection would be preferable to avoid the somewhat evolved proxy setup.

Luckily Mule 2.1 provides a nice interface for custom agent where jmx4perl can plug into. The current [jmx4perl 0.50][2] contains such an agent which can be integrated into a Mule installation. Actually, the agent needs to be build separately by calling `mvn install` in the `agent/` subdirectory. You will find the final agent in `agent/modules/j4p-mule/target`. You can also [download][3] the agent directly from our maven repository.

The following steps are required for installing the agent:

* Save the [agent jar][3] within your Mule installation in `lib/opt/`
* Adapt your Mule configuration to contain the following section:

```xml
<management:custom-agent name="j4p-agent" class="org.jmx4perl.mule.J4pAgent">
  <spring:property name="port" value="8899"/>
</management:custom-agent>
<management:jmx-server/>
```

* Startup Mule

The startup message should contain something like

```text
*********************************************************
* Mule ESB and Integration Platform                     *
* Version: 2.2.1 Build: 14422                           *
* MuleSource, Inc.                                      *
* For more information go to http://mule.mulesource.org *
*                                                       *
* Server started: 12/9/09 3:36 PM                       *
* Server ID: myMule                                     *
* JDK: 1.6.0_15 (mixed mode)                            *
* OS encoding: MacRoman, Mule encoding: UTF-8           *
* OS: Mac OS X (10.6.2, x86_64)                         *
* Host: localhost (127.0.0.1)                           *
*                                                       *
* Agents Running:                                       *
*   Wrapper Manager: Mule PID #0, Wrapper PID #861      *
*   j4p Agent: http://localhost:8899/j4p                *
*   JMX Agent                                           *
*********************************************************
```

Note the URL for the j4p agent which can be used with `jmx4perl` or `check_jmx4perl` like

```bash
jmx4perl http://localhost:8899/j4p list
```

which will result in an output similar to
```text
Mule.myMule:
    Mule.myMule:name=AllStatistics,type=org.mule.Statistics
        Attributes:
            Enabled                             boolean
        Operations:
            void logSummary()
            java.lang.String printXmlSummary()
            java.lang.String printHtmlSummary()
            void clear()
            java.lang.String printCSVSummary()

....
java.lang:
    java.lang:type=Memory
        Attributes:
            NonHeapMemoryUsage                  CompositeData [ro]
            ObjectPendingFinalizationCount      int [ro]
            Verbose                             boolean
            HeapMemoryUsage                     CompositeData [ro]
        Operations:
            void gc()
```

Note that Mule was started here with a server id *myMule* (startup option: `-M-Dmule.serverId=myMule`). As you can see you have access to the Mule specific MBeans **and** the Java platform MXBeans (which BTW is not easy achievable using Mules JSR-160 agents directly).

For enabling basic security the properties *user* and *password* can be set:

```xml
<management:custom-agent name="j4p-agent" class="org.jmx4perl.mule.J4pAgent">
  <spring:property name="user" value="roland"/>
  <spring:property name="password" value="wtf"/>
</management:custom-agent>
<management:jmx-server/>
```

On the client side the options *--user* and *--password* can be used with `jmx4perl` and `check_jmx4perl` for specifying the credentials.

Finally, all other options as specified as init parameters in `j4p.war`'s `web.xml` can be used as properties here as well.

  [1]: http://www.mulesoft.org
  [2]: http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.50.tar.gz
  [3]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-mule/0.50/j4p-mule-0.50-agent.jar