---
author: Roland Huß
date: '2009-11-23T08:06:29+00:00'
excerpt: 'As described in the last [post](/jmx4perl/2009/11/20/agentless-jmx4perl.html)
  jmx4perl can be operated in a so called *agentless* mode. For this to work, the
  target java server must be prepared for accepting remote JMX connections as described
  in JSR-160.  This article describes the specific setup for **JBoss** along with
  the problems encountered and current limitations.

  '
slug: jboss-remote-jmx
tags:
- jboss
title: Setting up JBoss for remote JMX
---

As described in the last [post](/jmx4perl/2009/11/20/agentless-jmx4perl.html) jmx4perl can be operated in a so called *agentless* mode. For this to work, the target java server must be prepared for accepting remote JMX connections as described in [JSR-160](http://jcp.org/en/jsr/detail?id=160).

Unfortunately, this setup is not really standardized and specific to the Java JDK in use and the application server itself. In this post we concentrate on how to setup JMX remoting for [JBoss](http://www.jboss.org/jbossas/).
<!-- -->

<!--more-->

## Setting up remote JMX

Setting up JMX remoting depends on the Java virtual machine you are using. Since the Sun JDK is by far the most common Java VM in use, I'm assuming you are running with a Sun JDK 1.5 or 1.6. Please refer to this [article][4] for detailed instructions for how to enable JMX remoting for Sun JDK 1.5.

JMX remoting is enabled by setting certain Java environment variables. For JBoss, you can set Java environment variables in `$JBOSS/bin/run.conf` with the shell environment variable `$JAVA_OPTS`. The following lines will enable JMX remoting via RMI, where the server is listening at port 9999 for JMX requests. SSL and Authentication is disabled for simplicity here. (Setting up SSL and authentication for JMX will be explained in yet another blog entry).

```bash
# Enable JMX Remote
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.port=9999"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"
JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote.ssl=false"
```

This is the minimal setup to get JMX remoting to work (not specific to JBoss, BTW). However, there is a small problem: JBoss uses an own `MBeanServer` in addition to the so called `PlatformMBeanServer` which is included in the Java VM since JDK 1.5. The simple setup described above will export only the `PlatformMBeanServer` for remote access. Since every JBoss `MBean` is registered at the JBoss specific MBeanServer these MBeans are invisible for remote access.

As this is a known limitation, JBoss explains how to resolve this in its [wiki][5]. This article explains how to setup JBoss for accessing the JBoss MBeans remotely (which is required for `jconsole` to work properly). To summarize, they recommend to use a

```bash
JAVA_OPTS="$JAVA_OPTS -Djboss.platform.mbeanserver"
```

which instructs JBoss to use the the `PlatformMBeanServer` as its own MBeanServer so that there is only a single MBeanServer present overall.

However, this is how it works at least in principle. But look at the comments, you will see that there are multiple problems of various kinds. The main reason is mainly that JBoss extends on the generic JMX functionality and needs specific features. David Ward [comment][6] summarizes the issues nicely. He states, that

> * Using either jdk6 or jdk5, you can see all JBoss 4.2.3 MBeans in jconsole.
> * Using jdk6, you can see all JBoss 5.0.1 MBeans in jconsole.
> * Using jdk5, you can *NOT* see all JBoss 5.0.1 MBeans in jconsole.

(*visible in jconsole* here implies *exportable via JSR-160* in our context)

According to David's post, for JDK 1.5 you need these defines as well
if `run.conf`:

```bash
JAVA_OPTS="$JAVA_OPTS -Djavax.management.builder.initial=\
           org.jboss.system.server.jmx.MBeanServerBuilderImpl"
JBOSS_CLASSPATH="../lib/jboss-system-jmx.jar"
```

For JBoss 5.1 however I wasn't able to get JBoss to use the `PlatformMBeanServer` at all (neither with JDK 1.5 nor JDK 1.6). You get various kinds of exceptions, even when using the recommendations above.

```text
09:15:25,759 ERROR [AbstractKernelController] Error installing to Configured:
    name=Deployers state=Configured
    java.lang.Exception:
    Error calling callback JMXRegistrationAdvice for target context Deployers
       at org.jboss.dependency.plugins.AbstractLifecycleCallbackItem.install
              (AbstractLifecycleCallbackItem.java:91)
       ...
    Caused by: javax.management.InstanceNotFoundException:
    JMImplementation:type=MBeanRegistry
        at com.sun.jmx.interceptor.DefaultMBeanServerInterceptor.getMBean
              (DefaultMBeanServerInterceptor.java:1010)
       ...
```

This exception occurs in JBoss 5 when `jboss.platform.mbeanserver` is switched on. It seems that JBoss 5 needs some special feature from the MBeanServer which is not available in the JDK stock `PlatformMBeanServer`

Adding an own `MBeanServerBuilder` via `javax.management.builder.initial` leads to a `ClassNotFoundException` during the bootstrap process:

```text
javax.management.JMRuntimeException:
  Failed to load MBeanServerBuilder class
       org.jboss.system.server.jmx.MBeanServerBuilderImpl:
  java.lang.ClassNotFoundException: org.jboss.system.server.jmx.MBeanServerBuilderImpl
     at javax.management.MBeanServerFactory.checkMBeanServerBuilder
        (MBeanServerFactory.java:499)
  ...
 Caused by: java.lang.ClassNotFoundException:
       org.jboss.system.server.jmx.MBeanServerBuilderImpl
       at java.net.URLClassLoader$1.run(URLClassLoader.java:200)
    ...
```

Adding the `jboss-system-jmx.jar` to the `JBOSS_CLASSPATH` doesn't help either (other exceptions will occur).

As explained in ticket [JBAS-6185][7] one needs a repackaging of `run.jar` to include the classes `MBeanServerBuilderImpl` and `LazyMBeanServer` so that they are visible during JBoss bootstrapping. According to the ticket, this repacking will be done for the forthcoming JBoss AS 6.

To summarize, this is the current situation for export of JBoss MBeans via JSR-160:

JBoss Version | JDK | Works
--------------|-----|---
4.2.3         | 1.5 | X
4.2.3         | 1.6 | X
5.0.1         | 1.5 | -
5.0.1         | 1.6 | X
5.1           | 1.5 | -
5.1           | 1.6 | -

## NotSerializableException for MBeanInfo

When this first hurdle has been taken, the next problem arise for certain MBeans when fetching their `MBeanInfo` meta information. Some of the java objects included in the JBoss MBean data are not serializable as it is required for JMX RMI access. E.g. for the MBean `jboss:service=invoker,type=unified` calling `getMBeanInfo` on the remote `MBeanServerConnection` results in a

```text
java.io.WriteAbortedException: writing aborted;
    java.io.NotSerializableException:
    org.jboss.remoting.transport.socket.SocketServerInvoker
      at sun.rmi.server.UnicastRef.invoke(UnicastRef.java:173)
      at com.sun.jmx.remote.internal.PRef.invoke(Unknown Source)
      ....
      at javax.management.remote.rmi.RMIConnectionImpl_Stub.getMBeanInfo
```

jmx4perl can handle these exceptions which occur during *list* operations. It will simply print out an error for those MBeans.

## Problems accessing MXBeans on JBoss

Another strange bug, which is not related to JSR-160 but present in JBoss 4.2.3 and 5.1, is, that MXBeans (those in the JMX domain `java.lang`) are invisible until their meta data is fetched via `mBeanServer.getMBeanInfo()`. Accessing such a MBean without at least one prior fetch of the `MBeanInfo` metadata results in an `ObjectInstanceNotFoundException`. The workaround for jmx4perl is to transparently fetch the MBeanInfo when a MXBean on JBoss is requested. For now, this works in the agent-mode but not yet in the proxy mode.

## Summary

Setting up remoting via JSR-160 connectors for JBoss turns out to be a hard job. There are combinations of JDKs and JBoss versions for which it is not possible to get remote access to JBoss intrinsic MBeans. Running [jmx4perl](http://www.jmx4perl.org) in **agent mode** works around this limitations transparently since it merges all available MBeanServers (the JBoss' one and the PlatformMBeanServer) and tries all requested JMX operation on all servers until the first succeed. For the proxy mode, this workaround is not possible since a JMX service URl points only to a single MBeanServer.

  [1]: /jmx4perl/2009/11/20/agentless-jmx4perl.html
  [2]: http://jcp.org/en/jsr/detail?id=160
  [3]: http://www.jboss.org/jbossas/
  [4]: http://java.sun.com/j2se/1.5.0/docs/guide/management/agent.html#remote
  [5]: http://www.jboss.org/community/wiki/JBossMBeansInJConsole
  [6]: http://www.jboss.org/community/wiki/JBossMBeansInJConsole#comment-1390
  [7]: https://jira.jboss.org/jira/browse/JBAS-6185