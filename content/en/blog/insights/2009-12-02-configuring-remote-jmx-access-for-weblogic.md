---
author: Roland Huß
date: '2009-12-02T17:40:43+00:00'
excerpt: "In our series about configuring remote JMX access for various application\
  \ servers, this article tackles Weblogic Server 9 and 10. There are several obstacles\
  \ to get over, as expected ;-). \n\nThis articles covers how to export the four\
  \ MBeanServers known to Weblogic via RMI/IIOP or RMI/JRMP and what traps are waiting\
  \ here. "
slug: configuring-remote-jmx-access-for-weblogic
tags:
- J2EE
title: Configuring remote JMX access for Weblogic Server
---

In our series of articles about configuring remote JMX access for the [jolokia proxy mode](/blog/2009/11/20/agentless-jmx4perl/), this article tackles how to enable  JMX remoting for Weblogic Server 9 and 10. It is not specific to jmx4perl and explains several different setups and possible problems.

<!-- --><!--more-->But before we start, kudos to this excellent [blog post][3] and Weblogic's own [documentation][2] which helped me quite a lot during my journey through the depth of Weblogic JMX export.

As worked out in a previous [post][1] JBoss is a bit of a mess when it to comes to export the JDK's `PlatfomMBeanServer`. As it turns out for Weblogic things are not much easier (but there are 'workarounds'). Weblogic even doubles the number of available MBeanServers to four.

# MBean Servers in Weblogic

Weblogic comes with three own MBeanServers, which are exported via RMI/IIOP as JSR-160 connectors. They can be looked up via a certain JNDI name as shown in the table below. Additionally, there is the ubiquitous PlatformMBeanServer which can be exported the usual way as described later in this post.

MBean Server                | JNDI Name
----------------------------|------------------------------------------------------
Domain Runtime MBean Server | `weblogic.management.mbeanservers.domainruntime`
Runtime MBean Server        | `weblogic.management.mbeanservers.runtime`
Edit MBean Server           | `weblogic.management.mbeanservers.edit`
PlatformMBeanServer         | ---

The *Runtime MBean Server* specifies an individual application server, whereas the *Domain Runtime MBean Server* exposes the MBeans for all servers in a cluster. The *Edit MBean Server* is used for accessing and modifying the domain configuration. The [Weblogic documentation][6] contains further details.

When using jmx4perl's proxy mode you have to choose the MBeanServer in advance (in contrast to the agent mode, where MBeanServers are merged to one *virtual MBeanServer*).

# Two access modes

There are two ways how the MBeanServers mentioned above can be exported for remote access:

* Via __RMI/IIOP exported by Weblogic__.
   This way, the three Weblogic MBeanServers (those with an JNDI name) can
   be exported (but not the PlatformMBeanServer directly). Advantage of
   this export is that it can be enabled with the admin console  and
   that it includes the complete Weblogic security stack.

* Via **RMI/JRMP exported by the JVM**.
   This allows for the PlatformMBeanServer to be exported (but not the
   other, Weblogic specific MBeanServers). It gets enabled as usual by
   setting certain java defines as startup options and is secured the JDK
   way. A forthcoming blog will clarify how to setup security for JDK
   exported JSR-160 connectors.

Both methods are explained in detail in the following sections.

# RMI/IIOP exported by Weblogic

First of all, some configuration items must be set to enable IIOP exported MBeans. In the admin console, check that following properties are set:

* First, IIOP must be enabled: *Domain ('wl_server') / Environment / Servers -> Server ('examplesServer') -> Protocols -> IIOP -> Enable IIOP*

* Allow for anonymous read access, if you want to monitor without sending credentials: *Domain ('wl_server') -> Security -> General -> Anonymous Admin Lookup Enabled*

* If you want to secure IIOP access (or want to have write access), set the name and password of the default user: *Domain ('wl_server') / Environment / Servers -> Server ('examplesServer') -> Protocols -> IIOP -> (Advanced) -> "Default IIOP Username" and "Default IIOP Password"*

You need to restart the server if you change one of the options above.
The JMX service URL for accessing Weblogic JMX connectors via IIOP looks like

```text
service:jmx:rmi:///jndi/iiop://<server address>:<port>/<jndi name>
```

where the JNDI name is one of the MBeanServer's JNDI name as described above. For example:

```text
service:jmx:iiop:///jndi/iiop://bhut:7001/weblogic.management.mbeanservers.runtime
```

Now you are ready to access you Weblogic MBeans via jmx4perl:

```bash
jmx4perl http://proxy:8888/j4p  \
      --target \
service:jmx:iiop:///jndi/iiop://target:7001/weblogic.management.mbeanservers.runtime \
      --target-user weblogic \
      --target-password weblogic \
      list
```

Here *proxy:8888* specifies the server, where `j4p.war` is running as a proxy servlet and *target* is the remote JMX enabled Weblogic server. Please note, that the usual `info` command of jmx4perl won't work here, since we don't have access to any Java 5 MXBeans (like the MemoryMBean). But see below for how to make this work, too.

There are some issues, though.

### Same Java version for j4p proxy and Weblogic

There is one important point you should take care of if you connect to the target platform via IIOP. As described in this [bug report][5], there are  issues when Java 5 and Java 6 virtual machines are communicating via IIOP. A typical error happening in such a scenario looks like:

```text
026030 ERROR               STDERR| Nov 28, 2009 1:21:51 PM
    com.sun.corba.se.impl.io.InputStreamHook
    throwOptionalDataIncompatibleException
    WARNING: "IOP00800008: (MARSHAL) Not enough space left
                                     in current chunk"
    org.omg.CORBA.MARSHAL:   vmcid: OMG  minor code: 8  completed: No
  at com.sun.corba.se.impl.logging.
       OMGSystemException.rmiiiopOptionalDataIncompatible2
          (OMGSystemException.java:2709)
.....
  at org.omg.stub.javax.management.
       remote.rmi._RMIConnection_Stub.getMBeanInfo(Unknown Source)
  at javax.management.remote.rmi.RMIConnector
     $RemoteMBeanServerConnection.getMBeanInfo(RMIConnector.java:1052)
```

The only known workaround for this problem is to run the proxy and the target server with the **same JDK version** (either both Java 5 or both Java 6). Since you have normally the freedom to choose the JDK for at least the proxy, this shouldn't be a big problem.

### ClassNotFoundException

As with every RMI based connection, you need to be sure that type definitions are available on both sides of the connection. As Weblogic export Weblogic specific data types via JMX you will encounter `ClassCastExceptions`  when you access these remotely from a generic client (without Weblogic specific classes in the classpath):

```text
Caused by: java.lang.ClassNotFoundException:
     weblogic.wsee.ws.dispatch.server.OneWayHandler
        (no security manager: RMI class loader disabled)
     [exec]     at sun.rmi.server.LoaderHandler.loadClass
  ...
```

I.e. you won't be able to access the MBeanServer via RMI/IIOP with `jconsole` due to missing local classes.

# RMI/JRMP exported by JVM

As an alternative the usual way for exporting MBeans via RMI/JRMP can be used. This includes to set some java defines as startup options (probably within `setDomainEnv.sh`) like:

```bash
JAVA_OPTIONS="$JAVA_OPTIONS \
    -Dcom.sun.management.jmxremote \
    -Dcom.sun.management.jmxremote.port=9999 \
    -Dcom.sun.management.jmxremote.ssl=false \
    -Dcom.sun.management.jmxremote.authenticate=false"
```

In this example we switched of security complete for sake of demonstration.  You can now connect with jmx4perl or with your favorite JMX console as usual:

```bash
jmx4perl http://proxy:8888/j4p  \
   --target service:jmx:rmi:///jndi/rmi://target:9999/jmxrmi \
   read java.lang:type=Memory HeapMemoryUsage

jconsole service:jmx:rmi:///jndi/rmi://target:9999/jmxrmi
```

Unfortunately, by default, only the `PlatformMBeanServer` gets exported without any Weblogic specific MBean. However, there is a way to get to the Weblogic MBeans as described in the next section.

# Using PlatformMBeanServer for Weblogic MBeans

For monitoring purposes having Weblogic runtime MBeans and JVM MXBeans in different MBeanServers which are exportable in different ways is quite annoying. However, for Weblogic there is a solution by configuring WLS to use the `PlatformMBeanServer` as it's MBeanServer. With this configuration, your are able to access Weblogic MBeans from RMI/JRMP Service URLs (as it is used with 'normal' JMX clients like jconsole) and Java MXBeans from the RMI/IIOP connector used by Weblogic.

For this to work, you need to set *Domain ('wl_server') -> Configuration -> General -> (Advanced) -> Platform MBeanServer enabled* in the admin console for both WLS 9 and 10. Afterwards a server restart is required.

For WLS 10 an additional configuration parameter has to be set in order to let WLS use the `PlatformMBeanServer` for its runtime MBeans. The attribute `PlatformMBeanServerUsed` needs to be set to true on the `JMXMBean` (it is `false` by default). Unfortunately I didn't find a way to set this attribute via the admin console, but only via the Weblogic scripting environment [WLST][2]. Assuming that your current working directory is you WLS 10 root directory, you should use `wlst.sh` to fire up the WLST in interactive mode and when the server is **not** running:

```bash
$ common/bin/wlst.sh
.....
wls:/offline> readDomain('samples/domains/wl_server')
wls:/offline/wl_server>cd('JMX')
wls:/offline/wl_server/JMX>ls()
drw-   NO_NAME_0
wls:/offline/wl_server/JMX>cd('NO_NAME_0')
wls:/offline/wl_server/JMX/NO_NAME_0>ls()
-rw-   CompatibilityMBeanServerEnabled               true
-rw-   DomainMBeanServerEnabled                      true
-rw-   EditMBeanServerEnabled                        true
-rw-   InvocationTimeoutSeconds                      0
-rw-   ManagementEJBEnabled                          true
-rw-   Name                                          null
-rw-   Notes                                         null
-rw-   PlatformMBeanServerEnabled                    false
-rw-   PlatformMBeanServerUsed                       false
-rw-   RuntimeMBeanServerEnabled                     true
wls:/offline/wl_server/JMX/NO_NAME_0>set('PlatformMBeanServerUsed','true')
wls:/offline/wl_server/JMX/NO_NAME_0>set('PlatformMBeanServerEnabled','true')
wls:/offline/wl_server/JMX/NO_NAME_0>updateDomain()
wls:/offline/wl_server/JMX/NO_NAME_0>closeDomain()
wls:/offline>exit()
```

The path to the domain (`samples/domains/wl_server`), an the name of the JMX-Bean (`NO_NAME_0`) might differ at your side, but I think, the idea is clear. As shown above you also can set `PlatformMBeanServerEnabled` via WLST as well.

Fire up the server and you should be ready for accessing WLS MBeans and JDK MXMBeans from within the same `MBeanServer` on Weblogic 10.

BTW, setting `PlatformMBeanServerUsed` via jmx4perl itself doesn't work, because Weblogic needs some extra boilerplate (which I didn't dive into) before configuration can be changed via JMX:

```bash
jmx4perl http://proxy:8888/j4p \
  --target \
     service:jmx:iiop:///jndi/iiop://target:7001/weblogic.management.mbeanservers.edit \
  --target-user weblogic \
  --target-password weblogic \
  write com.bea:Name=wl_server,Type=JMX PlatformMBeanServerUsed true

ERROR: org.omg.CORBA.UNKNOWN:   vmcid: 0x0  minor code: 0 completed: Maybe
```

and on the WLS console:
```text
<Warning> <RMI> <BEA-080003> RuntimeException thrown by rmi server:
  javax.management.remote.rmi.RMIConnectionImpl.setAttribute
  weblogic.management.NoAccessRuntimeException:
    Operation can not be performed as caller has not started an edit session.
    at weblogic.management.mbeanservers.edit.internal.EditLockInterceptor.checkEditLock
    ...
```

# Summary

For setting up Weblogic for remote JMX access quite some configuration is needed. There are traps, but at least for normal monitoring needs everything should work fine at the end. Nevertheless, if you have the chance to operate jmx4perl in agent mode (without the need for remote JSR-160 connectors), I still recommend to connect directly to the server via the `j4p.war` running as an agent and not as a proxy ;-).

  [1]: /blog/2009/11/23/jboss-remote-jmx/
  [2]: http://download.oracle.com/docs/cd/E15051_01/wls/docs103/jmx/accessWLS.html
  [3]: http://www.performanceengineer.com/blog/monitoring-weblogic-using-jmx/
  [4]: http://download.oracle.com/docs/cd/E13222_01/wls/docs100/config_scripting/using_WLST.html
  [5]: http://forums.sun.com/thread.jspa?threadID=5259072
  [6]: http://download.oracle.com/docs/cd/E15051_01/wls/docs103/jmx/understandWLS.html#wp1127769