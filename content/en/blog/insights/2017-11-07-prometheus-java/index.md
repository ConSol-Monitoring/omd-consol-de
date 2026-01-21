---
author: Fabian Stäber
date: '2017-11-07'
featured_image: /assets/images/prometheus-logo.png
tags:
- PrometheusIO
title: Devoxx Video&#58; Prometheus Monitoring for Java Web Applications w/o Modifying
  Source Code
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

The [Prometheus] monitoring tool follows a white-box monitoring approach: Applications actively provide metrics about their internal state to the Prometheus server. In order to instrument an application with Prometheus metrics, you have to add a metrics library and call that library in the application's source code. However, **DevOps teams do not always have the option to modify the source code** of the applications they are running.

At this year's [Devoxx] conference, Fabian Stäber did a [talk] on how to instrument Java Web Applications with Prometheus metrics without modifying the application's source code.

<!--more-->

{% youtube BjyI93c8ltA %}

<p/>
This talk focuses on how to use the [Byte Buddy] library to write a Java agent instrumenting Java applications with Prometheus metrics. **If you are looking for a general introduction to Prometheus monitoring for Java developers**, you might want to watch my talk on [Prometheus Monitoring for Java Developers] from last year's Devoxx.

## Example Code

src/main/java/io/promagent/agent/DemoAgent.java

```java
package io.promagent.agent;

import com.sun.net.httpserver.HttpServer;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.exporter.common.TextFormat;
import net.bytebuddy.agent.builder.AgentBuilder;

import java.io.StringWriter;
import java.lang.instrument.Instrumentation;
import java.net.InetSocketAddress;
import java.util.Collections;

import static net.bytebuddy.matcher.ElementMatchers.hasSuperType;
import static net.bytebuddy.matcher.ElementMatchers.named;

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

import io.prometheus.client.Counter;
import net.bytebuddy.asm.Advice;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class DemoAdvice {

    public static final Counter httpRequestsTotal = Counter
            .build("http_requests_total", "Total number of HTTP requests")
            .labelNames("path")
            .register();

    @Advice.OnMethodEnter
    public static void before(ServletRequest request, ServletResponse response) {
        // TODO: Check if request instanceof HttpServletRequest and if getPathInfo() returns null
        httpRequestsTotal.labels(((HttpServletRequest) request).getPathInfo()).inc();
        System.err.println("before serving the request...");
    }

    @Advice.OnMethodExit
    public static void after(ServletRequest request, ServletResponse response) {
        System.err.println("after serving the request...");
    }
}
```

pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>devoxx-2017</groupId>
    <artifactId>03-agent-example</artifactId>
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
        <finalName>devoxx-demo-agent</finalName>
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

How to run (assuming you have downloaded and unpacked [wildfly-10.1.0.Final], are in the `wildfly-10.1.0.Final/` directory, have copied [kitchensink.war] to `./standalone/deployments/` and have the agent copied to `./devoxx-demo-agent.jar`):

```bash
AGENT=./devoxx-demo-agent.jar
LOGMANAGER_JAR=$(find $(pwd) -name 'jboss-logmanager-*.jar')
export JAVA_OPTS="
    -Xbootclasspath/a:${LOGMANAGER_JAR}
    -Dsun.util.logging.disableCallerCheck=true
    -Djboss.modules.system.pkgs=org.jboss.logmanager,io.promagent,io.prometheus
    -Djava.util.logging.manager=org.jboss.logmanager.LogManager
    -Djava.net.preferIPv4Stack=true
    -javaagent:${AGENT}
    ${JAVA_OPTS}
"
./bin/standalone.sh
```

This example works with the simple REST request on [http://localhost:8080/kitchensink/rest/members]. It might fail with other scenarios. If you are interested in a more complete example, you might want to have a look at [promagent.io]. Please open Github issues there for any questions, ideas, and feedback.

<p/>
For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO].

[Prometheus]: https://prometheus.io
[Devoxx]: https://devoxx.be
[talk]: https://cfp.devoxx.be/2017/talk/CRJ-2930/Prometheus_Monitoring_for_Java_Web_Applications_w%2Fo_Modifying_Source_Code
[Byte Buddy]: http://bytebuddy.net
[Prometheus Monitoring for Java Developers]: https://labs.consol.de/monitoring/2016/11/10/devoxx.html
[wildfly-10.1.0.Final]: http://wildfly.org/downloads/
[kitchensink.war]: https://github.com/wildfly/quickstart/tree/master/kitchensink
[http://localhost:8080/kitchensink/rest/members]: http://localhost:8080/kitchensink/rest/members
[promagent.io]: http://promagent.io
[https://labs.consol.de/tags/PrometheusIO]: https://labs.consol.de/tags/prometheusio