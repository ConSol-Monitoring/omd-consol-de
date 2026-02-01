---
author: Fabian St&auml;ber
date: '2017-07-10T00:00:00+00:00'
featured_image: prometheus-logo.png
tags:
- PrometheusIO
title: Prometheus Monitoring for Java Web Applications without Modifying Their Source
  Code
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

The [Prometheus](https://prometheus.io/) monitoring tool follows a _white-box_ monitoring approach: Applications actively provide metrics about their internal state to the Prometheus server. In order to instrument an application with Prometheus metrics, you have to add a metrics library and use that library in the application's source code. However, DevOps teams do not always have the option to modify the source code of the applications they are running.

[Promagent](https://github.com/fstab/promagent/) is a Java agent using Bytecode manipulation for instrumenting Java Web applications without modifying their source code. Promagent allows you to get white-box metrics for Java Web applications even if these applications do not implement any metrics library out-of-the-box.

<!--more-->

Promagent currently implements two metrics:

* HTTP: Number and duration of web requests.
* SQL: Number and duration of database queries.

The agent was tested with [Spring Boot](https://projects.spring.io/spring-boot/) and with the [Wildfly](http://wildfly.org/) application server.

When database calls are triggered from an HTTP context (like a REST call), the SQL metrics are labeled with the URL of the corresponding HTTP context. That way, you can use the Prometheus Query Language to relate SQL queries to the corresponding HTTP requests. For example, you can learn the percentage of time spent in the database when processing a REST call.

Promagent implements three ways to expose metrics: A built-in server (which will open a new port that can be scraped by the Prometheus server), a WAR deployment (can be deployed to expose all Prometheus metrics collected on the same application server), and JMX (can be accessed through standard JMX tooling).

As of now, Promagent is proof-of-concept demo code. In order to use it, you will probably need to extend the existing code with your own metrics (hooks). An introduction to the internal architecture of the Promagent implementation can be found on [Java Code Geeks](https://www.javacodegeeks.com/2017/07/instrumenting-java-web-applications-without-modifying-source-code.html)

---

For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO](https://labs.consol.de/tags/prometheusio/)