---
author: Fabian Stäber
date: '2016-11-10'
featured_image: /assets/images/prometheus-logo.png
tags:
- PrometheusIO
title: Devoxx Video&#58; Prometheus Monitoring for Java Developers
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

[Prometheus] is an open source monitoring tool, which is conceptually based on Google's internal Borgmon monitoring system. Unlike traditional tools like Nagios, Prometheus implements a white-box monitoring approach: Applications actively provide metrics, these metrics are stored in a time-series database, the time-series data is used as a source for generating alerts. Prometheus comes with a powerful query language allowing for statistical evaluation of metrics.  

<!--more-->

Many modern infrastructure components have Prometheus metrics built-in, like Docker's cAdvisor, Kubernetes, or Konsul. Moreover, there are libraries for instrumenting proprietary applications in a lot of programming languages.

At this year's [Devoxx] conference, Fabian Stäber presented a 30 minutes introduction to [Prometheus Monitoring  for Java Developers]:

{% youtube jb9j_IYv4cU %}

<p/>
For more posts on Prometheus, view [https://labs.consol.de/tags/PrometheusIO]

[Prometheus]: https://prometheus.io
[Devoxx]: https://devoxx.be
[Prometheus Monitoring for Java Developers]: http://cfp.devoxx.be/2016/talk/EAP-4528/Prometheus_Monitoring_for_Java_Developers
[https://labs.consol.de/tags/PrometheusIO]: https://labs.consol.de/tags/prometheusio