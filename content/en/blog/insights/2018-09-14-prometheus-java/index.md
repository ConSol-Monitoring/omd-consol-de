---
author: Fabian Stäber
date: '2018-09-14'
featured_image: /assets/images/prometheus-logo.png
tags:
- PrometheusIO
title: JavaZone Video&#58; Prometheus Monitoring without Modifying Source Code Using
  Java Agents and Byte Buddy
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

The [Prometheus] monitoring tool follows a white-box monitoring approach: Applications actively provide metrics about their internal state, and the Prometheus server pulls these metrics from the applications using HTTP.

If you can modify the application's source code, it is straightforward to instrument an application with Prometheus metrics: Add the Prometheus client library as a dependency, call that library to maintain the metrics, and use the library to expose the metrics via HTTP.

However, **DevOps teams do not always have the option to modify the source code** of the applications they are running.

At this year's [JavaZone] conference, Fabian Stäber did a [talk] on how to instrument Java Web Applications with Prometheus metrics without modifying the application's source code.

<!--more-->

<iframe type="opt-in" data-name="youtube" data-src="https://player.vimeo.com/video/289521258" width="640" height="349" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/289521258">Prometheus Monitoring without Modifying Source Code Using Java Agents and Byte Buddy : Fabian St&auml;ber</a> from <a href="https://vimeo.com/javazone">JavaZone</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

The talk is an extended version (15 minutes longer) of [last year's Devoxx] talk, and also highlights some of the common pitfalls with that approach.

## Example Code

src/main/java/io/promagent/agent/DemoAgent.java

```java
package io.promagent.agent;

import static net.bytebuddy.matcher.ElementMatchers.hasSuperType;
import static net.bytebuddy.matcher.ElementMatchers.named;

import java.io.StringWriter;
import java.lang.instrument.Instrumentation;
import java.net.InetSocketAddress;
import java.util.Collections;

import com.sun.net.httpserver.HttpServer;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.exporter.common.TextFormat;
import net.bytebuddy.agent.builder.AgentBuilder;

public class DemoAgent {

    public static void premain(String agentArgs, Instrumentation inst) throws Exception {
        new AgentBuilder.Default()
                .type(hasSuperType(named("javax.servlet.Servlet")))
                .transform(new AgentBuilder.Transformer.ForAdvice()
                        .include(DemoAgent.class.getClassLoader())
                        .advice(named("service"), DemoAdvice.class.getName()))
                .installOn(inst);
        runHttpServer();
    }

    static void runHttpServer() throws Exception {
        InetSocketAddress address = new InetSocketAddress(9300);
        HttpServer httpServer = HttpServer.create(address, 10);
        httpServer.createContext("/metrics", httpExchange -> {
            StringWriter respBodyWriter = new StringWriter();
            TextFormat.write004(respBodyWriter, CollectorRegistry.defaultRegistry.metricFamilySamples());
            byte[] respBody = respBodyWriter.toString().getBytes("UTF-8");
            httpExchange.getResponseHeaders().put("Context-Type", Collections.singletonList("text/plain; charset=UTF-8"));
            httpExchange.sendResponseHeaders(200, respBody.length);
            httpExchange.getResponseBody().write(respBody);
            httpExchange.getResponseBody().close();
        });
        httpServer.start();
    }
}
```

src/main/java/io/promagent/agent/DemoAdvice.java

```java
package io.promagent.agent;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import net.bytebuddy.asm.Advice;

public class DemoAdvice {

    @Advice.OnMethodEnter
    public static void before(ServletRequest request, ServletResponse response) {
        try {
            ClassLoader parent = Thread.currentThread().getContextClassLoader();
            ClassLoader myClassLoader = MyClassLoader.get(parent);
            Class<?> clazz = myClassLoader.loadClass("io.promagent.agent.ServletInstrumentation");
            clazz.getDeclaredMethod("before", ServletRequest.class).invoke(null, request);
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    @Advice.OnMethodExit
    public static void after(ServletRequest request, ServletResponse response) {
        ServletInstrumentation.after();
    }
}
```

src/main/java/io/promagent/ServletInstrumentation.java

```java
package io.promagent.agent;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

import io.prometheus.client.Counter;

public class ServletInstrumentation {

    private static final ThreadLocal<Integer> stackDepth = ThreadLocal.withInitial(() -> 0);

    public static void before(ServletRequest request) {
        if (stackDepth.get() == 0) {
            String path = ((HttpServletRequest) request).getContextPath() + ((HttpServletRequest) request).getServletPath();
            MetricProvider.getHttpRequestsTotal().labels(path).inc();
        }
        stackDepth.set(stackDepth.get() + 1);
    }

    public static void after() {
        stackDepth.set(stackDepth.get() - 1);
    }
}
```

src/main/java/io/promagent/MetricProvider.java

```java
package io.promagent.agent;

import io.prometheus.client.Counter;

public class MetricProvider {

    private static final Counter httpRequestsTotal = Counter
            .build("http_requests_total", "Total number of HTTP requests")
            .labelNames("path")
            .register();

    public static Counter getHttpRequestsTotal() {
        return httpRequestsTotal;
    }
}
```

src/main/java/io/promagent/MyClassLoader.java

```java
package io.promagent.agent;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.HashMap;
import java.util.Map;

public class MyClassLoader extends URLClassLoader {

    private static final Map<ClassLoader, MyClassLoader> instances = new HashMap<>();

    // memory leak: if an application is undeployed, we will keep the reference
    // to the parent and MyClassLoader, so the class loader will not be destroyed
    // after undeployment
    public static ClassLoader get(ClassLoader parent) {
        return instances.computeIfAbsent(parent, MyClassLoader::new);
    }

    private final ClassLoader parent;

    private static URL findMyJarFile() {
        return MyClassLoader.class.getProtectionDomain().getCodeSource().getLocation();
    }

    private MyClassLoader(ClassLoader parent) {
        super(new URL[]{findMyJarFile()}, null);
        this.parent = parent;
    }

    @Override
    public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        if (name.equals("io.promagent.agent.ServletInstrumentation")) {
            return super.loadClass(name, resolve);
        }
        return parent.loadClass(name);
    }
}
```

pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>javazone-2018</groupId>
    <artifactId>agent-example</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.build.outputEncoding>UTF-8</project.build.outputEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient</artifactId>
            <version>0.0.26</version>
        </dependency>

        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient_common</artifactId>
            <version>0.0.26</version>
        </dependency>

        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy</artifactId>
            <version>1.7.5</version>
        </dependency>

        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>javazone-demo-agent</finalName>
        <plugins>
            <plugin>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.0.0</version>
                <executions>
                    <execution>
                        <id>dist</id>
                        <goals>
                            <goal>single</goal>
                        </goals>
                        <phase>package</phase>
                        <configuration>
                            <appendAssemblyId>false</appendAssemblyId>
                            <attach>false</attach>
                            <descriptorRefs>
                                <descriptorRef>jar-with-dependencies</descriptorRef>
                            </descriptorRefs>
                            <archive>
                                <manifestEntries>
                                    <Premain-Class>io.promagent.agent.DemoAgent</Premain-Class>
                                    <Can-Redefine-Classes>true</Can-Redefine-Classes>
                                    <Can-Retransform-Classes>true</Can-Retransform-Classes>
                                    <Can-Set-Native-Method-Prefix>true</Can-Set-Native-Method-Prefix>
                                </manifestEntries>
                            </archive>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

<p/>
For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO].

[Prometheus]: https://prometheus.io
[last year's Devoxx]: https://labs.consol.de/monitoring/2017/11/07/prometheus-java.html
[JavaZone]: https://2018.javazone.no
[talk]: https://2018.javazone.no/program/1471aa3b-ebd1-4643-a420-31a435399c1b
[Byte Buddy]: http://bytebuddy.net
[promagent.io]: http://promagent.io
[https://labs.consol.de/tags/PrometheusIO]: https://labs.consol.de/tags/prometheusio