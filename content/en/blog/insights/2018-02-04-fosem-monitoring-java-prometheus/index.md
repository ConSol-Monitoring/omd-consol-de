---
author: Fabian Stäber
date: '2018-02-04T00:00:00+00:00'
featured_image: prometheus-logo.png
tags:
- PrometheusIO
title: FOSDEM Video&#58; Monitoring Legacy Java Applications with Prometheus
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="prometheus-logo.png" alt=""></div>

At this year's [FOSDEM] conference I did a 30 minutes presentation on _[Monitoring Legacy Java Applications with Prometheus]_. The talk gives an overview of some of the options you have for monitoring Java applications with [Prometheus] when you cannot modify the application's source code:

* Logfile monitoring ([grok_exporter]), and how it differs from [Elastic stack]
* Blackbox monitoring ([blackbox_exporter])
* JMX ([jmx_exporter])
* Write your own Java agent ([promagent.io])

The video is available below.

<!--more-->

<div class="video">
  <video width="100%" controls="controls">
    <source src="http://video.fosdem.org/2018/UD2.120/monitoring_legacy_java_applications_with_prometheus.webm" type="video/webm; codecs=&quot;vp8, vorbis&quot;">
    <source src="http://video.fosdem.org/2018/UD2.120/monitoring_legacy_java_applications_with_prometheus.mp4" type="video/mp4">
    <object type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.15.swf">
      <param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.15.swf">
      <param name="allowfullscreen" value="true">
      <param name="flashvars" value="config={'clip': {'url': 'http://video.fosdem.org/2018/UD2.120/monitoring_legacy_java_applications_with_prometheus.webm', 'autoPlay':false, 'autoBuffering':false}}">
      <p>Video tag not supported. Download the video <a href="http://video.fosdem.org/2018/UD2.120/monitoring_legacy_java_applications_with_prometheus.mp4">here</a>.</p>
    </object>
  </video>
</div>

Link to the talk: [https://fosdem.org/2018/schedule/event/monitoring_legacy_java_applications_with_prometheus/].

[FOSDEM]: https://fosdem.org
[Monitoring Legacy Java Applications with Prometheus]: https://fosdem.org/2018/schedule/event/monitoring_legacy_java_applications_with_prometheus/
[Prometheus]: https://prometheus.io
[grok_exporter]: https://github.com/fstab/grok_exporter
[Elastic stack]: https://www.elastic.co/guide/en/elastic-stack/current/elastic-stack.html
[blackbox_exporter]: https://github.com/prometheus/blackbox_exporter
[jmx_exporter]: https://github.com/prometheus/jmx_exporter
[promagent.io]: http://promagent.io
[https://fosdem.org/2018/schedule/event/monitoring_legacy_java_applications_with_prometheus/]: https://fosdem.org/2018/schedule/event/monitoring_legacy_java_applications_with_prometheus/