---
author: Fabian Stäber
date: '2016-07-31'
featured_image: /assets/images/prometheus-logo.png
summary: null
tags:
- PrometheusIO
title: Extracting Prometheus Metrics from Application Logs
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

[Prometheus] is an open-source systems monitoring and alerting toolkit. At its core, Prometheus uses time-series data, and provides a powerful query language to analyze that data. Most Prometheus deployments integrate [Grafana] dashboards and an [alert manager].

Prometheus is mainly intended for white box monitoring: Applications either provide Prometheus metrics natively, or they are instrumented with an [exporter] to make application-specific metrics available.

For some applications, parsing log files is the only way to acquire metrics. The [grok_exporter] is a generic Prometheus exporter extracting metrics from arbitrary unstructured log data.

This post shows how to use [grok_exporter] to extract metrics from log files and make them available to the Prometheus monitoring toolkit.

<!--more-->

Example Log Data
----------------

To exemplify the [grok_exporter] configuration, we use the following example log lines:

```text
30.07.2016 14:37:03 alice 1.5
30.07.2016 14:37:33 alice 2.5
30.07.2016 14:43:02 bob 2.5
30.07.2016 14:45:59 alice 2.5
```

Each line consists of a date, time, user, and a number.

The [grok_exporter] builds on [Grok] patterns for parsing log lines. Grok was originally developed as part of [Logstash] to provide log data as input for [ElasticSearch].

A simple Grok expression matching the lines above looks like this:

```text
%{DATE} %{TIME} %{USER} %{NUMBER}
```

The patterns `DATE`, `TIME`, `USER`, and `NUMBER` are pre-defined regular expressions that are included in Grok's [default pattern file]. Grok ships with about 120 [predefined patterns] for syslog logs, apache and other webserver logs, mysql logs, etc. It is easy to extend Grok with custom patterns.

Example 1: Counting Log Lines
-----------------------------

In most cases we want to count the number of log lines matching a given pattern. This can be done with the `counter` metric. The data provided by the `counter` metric can be analyzed with the Prometheus [query language]. For example, we can define a query to learn how often the line was logged in the last 5 minutes.

[grok_exporter] is written in [Go] and is available as an executable for Linux, OS X, and Windows on its [GitHub releases] page. In order to process the example log lines above, we need to create a configuration file. A simple configuration for counting the example log lines looks like this:

```yaml
input:
    type: file
    path: ./example.log
    readall: true
grok:
    patterns_dir: ./patterns
metrics:
    - type: counter
      name: grok_example_lines_total
      help: Example counter metric with labels.
      match: '%{DATE} %{TIME} %{USER} %{NUMBER}'
server:
    port: 9144
```

The configuration has four [main sections]:

* **input** configures the location of the log file.
* **grok** configures the location of the grok pattern definitions. The default patterns directory is included in the grok_exporter [release].
* **metrics** tells which metrics we want to extract from the logs. In the example, we want a `counter` metric for the number of lines matching the Grok expression.
* **server** configures the HTTP port.

In order to try it, run `grok_exporter -config ./config.yml`, and point your browser to [http://localhost:9144/metrics].

Example 2: Partitioning with Labels
-----------------------------------

One of the main features of Prometheus is its multi-dimensional data model: A metric (like the number of matching log lines above) can be further partitioned using different labels. For example, it might be useful to know how many log lines contain user _alice_ and how many log lines contain user _bob_.

Each Grok pattern, like `%{USER}`, can be given a name, like `%{USER:user}`. This name can then be mapped to a Prometheus label. A configuration for counting the example log lines partitioned by user looks like this:

```yaml
metrics:
    - type: counter
      name: grok_example_lines_total
      help: Example counter metric with labels.
      match: '%{DATE} %{TIME} %{USER:user} %{NUMBER}'
      labels:
          - grok_field_name: user
            prometheus_label: user
```

In the `match` pattern, we gave the Grok field `USER` the name `user`. In `labels`, we defined that the Grok field name `user` should be mapped to the Prometheus label `user`. In this example, the Grok field name and the Prometheus label are called the same, but in many cases we would use different names, because Grok and Prometheus have different naming conventions.

As a result, we get a `counter` metric partitioned by the user name from the log lines. We can still use this metric to aggregate the overall number of log lines (like in the example above), but in addition to that, the partitioning enables us to analyze the number of log lines per user.

Labels are a powerful tool when exporting metrics. For example, one could partition error logs by Java Exception name, HTTP response code, etc.

More Examples
-------------

Apart from the `counter` metric for counting matching log lines, [grok_exporter] supports a variety of metrics for extracting numeric data from the log lines. Using these metrics, one could expose the `%{NUMBER}` in the example above as a Prometheus time series.

The [grok_exporter configuration specification] provides a full list on the available configuration options.

Project Status and Next Steps
-----------------------------

[grok_exporter] started as a hobby project for monitoring a mail server. It proofed quite useful for us, so we thought it might be useful for others as well. The first beta version was released on 30 July 2016, and we will present it as a 5 minute lightning talk at this year's [PromCon] conference.

---

For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO]

[Prometheus]: https://prometheus.io
[Grafana]: http://grafana.org/
[alert manager]: https://github.com/prometheus/alertmanager
[exporter]: https://prometheus.io/docs/instrumenting/exporters/
[grok_exporter]: https://github.com/fstab/grok_exporter
[Grok]: https://www.elastic.co/guide/en/logstash/current/plugins-filters-grok.html
[Logstash]: https://www.elastic.co/products/logstash
[ElasticSearch]: https://www.elastic.co/
[predefined patterns]: https://github.com/logstash-plugins/logstash-patterns-core/tree/6d25c13c15f98843513f7cdc07f0fb41fbd404ef/patterns
[default pattern file]: https://github.com/logstash-plugins/logstash-patterns-core/blob/6d25c13c15f98843513f7cdc07f0fb41fbd404ef/patterns/grok-patterns
[query language]: https://prometheus.io/docs/querying/basics/
[GitHub releases]: https://github.com/fstab/grok_exporter/releases
[Go]: https://golang.org/
[main sections]: https://github.com/fstab/grok_exporter/blob/master/CONFIG.md
[release]: https://github.com/fstab/grok_exporter/releases
[PromCon]: https://promcon.io/
[http://localhost:9144/metrics]: http://localhost:9144/metrics
[grok_exporter configuration specification]: https://github.com/fstab/grok_exporter/blob/master/CONFIG.md
[https://labs.consol.de/tags/PrometheusIO]: https://labs.consol.de/tags/prometheusio/