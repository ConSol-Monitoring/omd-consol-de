---
author: Fabian Stäber
date: '2017-02-07'
featured_image: /assets/images/gopher.png
tags:
- golang
title: FOSDEM Video&#58; Implementing 'tail -f'
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="gopher.png" alt=""></div>

At this year's [FOSDEM] conference I did a 20 minutes presentation on how to implement `tail -f` in [Go]. The video is available below.

_Abstract:_ As part of a log file monitoring tool, I implemented a file tailer that keeps reading new lines from log files. This turned out to be much more challenging than I thought, especially because it should run on multiple operating systems and it should be robust against logrotate. In this 20 Minutes talk I will present the lessons learned, the pitfalls and dead-ends I ran into.

<!--more-->

<div class="video">
  <video width="100%" controls="controls">
    <source src="http://video.fosdem.org/2017/H.1302/go_tail.vp8.webm" type="video/webm; codecs=&quot;vp8, vorbis&quot;">
    <source src="http://ftp.osuosl.org/pub/fosdem/2017/H.1302/go_tail.mp4" type="video/mp4">
    <object type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.15.swf">
      <param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.15.swf">
      <param name="allowfullscreen" value="true">
      <param name="flashvars" value="config={'clip': {'url': 'http://video.fosdem.org/2017/H.1302/go_tail.vp8.webm', 'autoPlay':false, 'autoBuffering':false}}">
      <p>Video tag not supported. Download the video <a href="http://video.fosdem.org/2017/H.1302/go_tail.vp8.webm">here</a>.</p>
    </object> 
  </video>
</div>

* The FOSDEM talk: [https://fosdem.org/2017/schedule/event/go_tail/]
* The monitoring tool: [https://github.com/fstab/grok_exporter]
* Slides: [https://goo.gl/9ABX2R] (docs.google.com)

[FOSDEM]: https://fosdem.org
[Go]: https://golang.org/
[https://fosdem.org/2017/schedule/event/go_tail/]: https://fosdem.org/2017/schedule/event/go_tail/
[https://github.com/fstab/grok_exporter]: https://github.com/fstab/grok_exporter
[https://goo.gl/9ABX2R]: https://goo.gl/9ABX2R