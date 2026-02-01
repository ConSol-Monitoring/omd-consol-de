---
author: Fabian Stäber
date: '2016-08-13T00:00:00+00:00'
featured_image: prometheus-logo.png
tags:
- PrometheusIO
title: Counting Errors with Prometheus
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

Counting the number of error messages in log files and providing the counters to [Prometheus] is one of the main uses of [grok_exporter], a tool that we introduced in the [previous post].

The counters are collected by the [Prometheus] server, and are evaluated using Prometheus' query language. The query results can be visualized in [Grafana] dashboards, and they are the basis for defining [alerts].

We found that evaluating error counters in Prometheus has some unexpected pitfalls, especially because Prometheus' [increase()] function is somewhat counterintuitive for that purpose. This post describes our lessons learned when using [increase()] for evaluating error counters in Prometheus.

<!--more-->

Example Scenario
----------------

In our tests, we use the following example scenario for evaluating error counters:

* An application **writes** an ERROR message to a log file **every minute**.
* [grok_exporter] is configured with a [counter] metric named `errors_total` that increases whenever the ERROR is logged.
* Prometheus **collects** the metrics **every 15 seconds**.

In Prometheus, we run the following query to get the list of sample values collected within the last minute:

```text
errors_total[1m]
```

The query returns the following results:

* Most of the times it returns four values. For example, if the counter increased from `3` to `4` during the last minute, the sample values might be `[3, 3, 3, 4]`, or `[3, 3, 4, 4]`, or `[3, 4, 4, 4]`.
* Sometimes, the query returns three values. This happens if we run the query while Prometheus is collecting a new value. The new value may not be available yet, and the old value from a minute ago may already be out of the time window. For example, if the counter increased from `3` to `4` during the last minute, the sample values might be `[3, 3, 4]`, or `[3, 4, 4]`.

Counting Errors with increase()
-------------------------------

We want to use Prometheus’ query language to learn how many errors were logged within the last minute. The [increase()] function is the appropriate function to do that:

```text
increase(errors_total[1m])
```

However, in the example above where `errors_total` goes from `3` to `4`, it turns out that [increase()] never returns `1`. Most of the times it returns `1.3333`, and sometimes it returns `2`.

How increase() Works
--------------------

The reason why increase returns `1.3333` or `2` instead of `1` is that it tries to extrapolate the sample data. Let's use two examples to explain this:

**Example 1:** The four sample values collected within the last minute are `[3, 3, 4, 4]`. Within the 60s time interval, the values may be taken with the following timestamps: First value at 5s, second value at 20s, third value at 35s, and fourth value at 50s.

```text
counter value
    |
  4 |                                         x                 x
  3 |     x                 x                 x                 x
  2 |     x                 x                 x                 x
  1 |     x                 x                 x                 x
----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----> time
    0s    5s               20s               35s               50s         60s
```

Prometheus interprets this data as follows: Within 45 seconds (between 5s and 50s), the value increased by one (from three to four). Prometheus extrapolates that within the 60s interval, the value increased by `1.3333` in average. Therefore, the result of the [increase()] function is `1.3333` most of the times.

**Example 2:** When we evaluate the [increase()] function at the same time as Prometheus collects data, we might only have three sample values available in the 60s interval:

```text
counter value
    |
  4 |                                                     x
  3 |                 x                 x                 x
  2 |                 x                 x                 x
  1 |                 x                 x                 x
----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----> time
    0s               15s               30s               45s               60s
```

Prometheus interprets this data as follows: Within 30 seconds (between 15s and 45s), the value increased by one (from three to four). Prometheus extrapolates that within the 60s interval, the value increased by `2` in average. Therefore, the result of the [increase()] function is `2` if timing happens to be that way.

Lessons Learned
---------------

The Prometheus [increase()] function cannot be used to learn the exact number of errors in a given time interval. However, it can be used to figure out if there was an error or not, because if there was no error [increase()] will return zero. The results returned by [increase()] become better if the time range used in the query is significantly larger than the scrape interval used for collecting metrics.

Generally, Prometheus alerts should not be so fine-grained that they fail when small deviations occur. The [grok_exporter] is not a high availability solution. For example, lines may be missed when the exporter is restarted after it has read a line and before Prometheus has collected the metrics. Prometheus alerts should be defined in a way that is robust against these kinds of errors.

---

For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO]

[previous post]: https://labs.consol.de/monitoring/2016/07/31/Prometheus-Logfile-Monitoring.html
[grok_exporter]: https://github.com/fstab/grok_exporter
[Prometheus]: https://prometheus.io
[Grafana]: http://grafana.org/
[alerts]: https://github.com/prometheus/alertmanager
[increase()]: https://prometheus.io/docs/querying/functions/#increase()
[counter]: https://prometheus.io/docs/concepts/metric_types/#counter
[https://labs.consol.de/tags/PrometheusIO]: https://labs.consol.de/tags/prometheusio/