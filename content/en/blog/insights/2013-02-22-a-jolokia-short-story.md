---
author: Roland Huß
date: '2013-02-22T08:19:21+00:00'
slug: a-jolokia-short-story
tags:
- Jolokia
title: A Jolokia short story
---

Please follow me on my trip through debug hell, happy end included (or jump to the end of the post for a **tl;dr**, but you'll miss quite something).

<!--more-->
While I was preparing an excercise for a [Jolokia](http://www.jolokia.org) workshop, strange things happened. For the sake of simplicity (and because I like its small footprint), I've chosen [Jetty](http://www.eclipse.org/jetty/) as platform for some JMX programing exercise. A simple servlet should expose som JMX `MBean`s. I added some simple counters to the Servlet, but wanted to show also how easily Jolokia can serialize complex objects. Ok, why not exposing the `ServletContext` itself ? Seems to be a sufficient complex object.

Here is this innocent Servlet:

```java
public class Demo implements Servlet, DemoMBean {

    private ServletContext ctx;

    public void init(ServletConfig config) throws ServletException {
        ctx = config.getServletContext();
        try {
            ManagementFactory.getPlatformMBeanServer()
                             .registerMBean(this,
                                            new ObjectName("demo:name=demo"));
        } catch (Exception e) { e.printStackTrace(); }
    }

    // Implementation for DemoMBean Interface
    public ServletContext getServletContext() {
        return ctx;
    }
    ....
}
```

After deploying this servlet with the Maven Jetty Plugin and with Jolokia enabled, everything looked fine. Except until this URL where called: `http://localhost:8080/jolokia/read/demo:name=demo/ServletContext?ignoreErrors=true`. I expected quite some lengthy JSON response here, but got:

```bash
[INFO] Started Jetty Server
#
# A fatal error has been detected by the Java Runtime Environment:
#
#  SIGBUS (0xa) at pc=0x000000010b0a715e, pid=80469, tid=32771
#
# JRE version: 7.0_11-b21
# Java VM: Java HotSpot(TM) 64-Bit Server VM
#           (23.6-b04 mixed mode bsd-amd64 compressed oops)
# Problematic frame:
# C  [libzip.dylib+0x315e]  newEntry+0x154
....
```

Oops.

Never mind, blame it on Java.

Next try:

```bash
$ mvn jetty:start
[INFO] --- jetty-maven-plugin:8.1.9.v20130131:start (default-cli) @ jmx-2 ---
Feb 12, 2013 7:57:29 AM org.sonatype.guice.bean.reflect.Logs$JULSink warn
WARNING: Error injecting: org.mortbay.jetty.plugin.JettyStartMojo
java.lang.NoClassDefFoundError: org/eclipse/jetty/server/handler/ContextHandler
   at java.lang.ClassLoader.defineClass1(Native Method)
   at java.lang.ClassLoader.defineClass(ClassLoader.java:791)
....
```

Ehm. Whats going on here ?

What next ?

A `mvn clean install`, of course:

```bash
$ mvn clean install
....
[ERROR] COMPILATION ERROR :
[INFO] -------------------------------------------------------------
[ERROR] error: error reading /Users/roland/.m2/repository/org/
       springframework/spring-web/3.2.1.RELEASE/
       spring-web-3.2.1.RELEASE.jar; zip file is empty
[ERROR] error: error reading /Users/roland/.m2/repository/org/
       springframework/spring-aop/3.2.1.RELEASE/
       spring-aop-3.2.1.RELEASE.jar; zip file is empty

       (Note: the original version of this example used Spring MVC)
......

$ ls -l src/main/webapp/WEB-INF/web.xml
-rw-r--r-- 1 roland staff 0 Feb 12 07:57 src/main/webapp/WEB-INF/web.xml
```

### WTF ??????

Can it really be, that a Java crash *nukes out files* ? Maybe all open filedescriptors, all open JARs, all descriptors ? This **can not** be true. Or ?

Next step: Debugger. I really wanted to see this crash live. But this was really a marathon, since Jetty's `ServletContext` is not only a 'complex' object but a real monster. It has a reference to its `Server` object and from there to everything else. Beside being a questionable architectural decision (can I maybe even reach other web modules, which are supposed to be separated ?), stepping through the serialization steps is not something you wish on friday afternoon, also because I had to start over and over, restoring all the deleted files including the local maven repository again and again. But at the end I stopped the debugger before:

```java
res = Reflection.filterMethods(this, getDeclaredMethods0(publicOnly));
```

and ended in Nirvana afterwards.

Where to go next ?

Maybe it's the Jolokia JVM agent used and there are issues with the Java Attach API ? Nope, the very same problem happened with the WAR agent, too.

Maybe the serialization stuff itself ? Next try:

```java
public void init(ServletConfig config) throws ServletException {
    try {
        ServletContext sCtx = config.getServletContext();
        Converters converters = new Converters();
        JsonConvertOptions opts = new JsonConvertOptions.Builder()
                .faultHandler(ValueFaultHandler.IGNORING_VALUE_FAULT_HANDLER).build();
        converters.getToJsonConverter().convertToJson(sCtx,null,opts);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

Peng ! Same problem, killed JVM, nuked files ...

1 ... 2 ... 3 .... hours later: Tested and debugged with multiple plattforms (linux, os x), various JDK (1.6.0.32, 1.7.0.11, ...), almost everywhere the same behaviour.

But wait: On Linux with 1.6.0.29, the JVM *didn't* crash. But nevertheless the files were still zeroed ! And then, the hammer hit me: It's not the crash which cause the files to be nuked, but the other way round: The files (including jars on the classpath) were stripped down to zero and **that** caused the crash.

Now it's clear: There must be happening something very nasty during the serialization process. Since Jolokia serialization uses reflection to extract all get-methods recursively, there must be a dark spot somewhere in that.

And then, another hour later, tae-tae-tae, here it is:

```java
package org.eclipse.jetty.util.resource;

public class FileResource extends URLResource
{
   ....
   /* --------------------------------------------------------- */
   /**
    * Returns an output stream to the resource
    */
   @Override
   public OutputStream getOutputStream()
     throws java.io.IOException, SecurityException
   {
      return new FileOutputStream(_file);
   }
   ....
}
```

Wow. `FileResource` is a Jetty utility class which wraps a file and is used most of the time for read-only scenarios (`getInputStream()`, `exists()`, ....), but also has some destructive methods (`delete()`). But a **getter** which destroys existing files ? Remember, creating an FileOutputStream on an existing File will delete it first. So you better call this getter only if you really want to override this file in some way.

### Lessons learned

* Blind serialization is harmful. There shouldn't be side effects when getting properties, but these are out there.
* Jolokia will never examing getter returing `OutputStream` or `Writer`s anymore. (Fixed in 1.1.0, please be careful with earlier versions)
* The JVM is good (apologies ;-)
* Use a `maxDepth` parameter when diving in dark waters.
* Don't expose monster objects via JMX.
* Don't use *utility* getters for something trivial and potentially harmful stuff. What about a `new FileOutputStream()` in write scenarios as alternative (or at least not a *get*-method) ?
* Debugging recursive structures is f*cking painful (even with conditional breakpoints)

## tl;dr

Avoid destructive side effects in *get*-methods, **PLEASE** ! All your reflection based serializers out there will thank you.