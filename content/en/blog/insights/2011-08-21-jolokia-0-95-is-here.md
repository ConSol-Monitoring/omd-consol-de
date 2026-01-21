---
author: Roland Huß
date: '2011-08-21T05:34:44+00:00'
slug: jolokia-0-95-is-here
tags:
- jmx
title: Jolokia 0.95 is here
---

The summer break is over and [Jolokia](http://www.jolokia.org) is one step closer to
1.0. Germans might reasonably argue, 'ehm, what summer do you talk
about ?' but at least [0.95](http://www.jolokia.org/download.html) is now a fact and introduces two new
features. Very cool features, IMO.

<!--more-->
The Jolokia [JDK6 JVM Agent][1] is now able to use the [Java Attach
API][2] so that it is possible to dynamically attach and detach a
Jolokia agent to a running Java process, much like [jconsole][3]. It
is a really exciting and powerful feature, because it allows for
HTTP/JSON access without (permanently) instrumenting a Java process by
deploying an agent or modifying startup options, which is a major
obstacle for quite some users. The nice advantage over `jconsole` is
that it attaches *locally* but export the data *remotely*. Perfect for
headless server installations.

The second addition is the support for upstream serialization of all
[OpenType][4] types so that JMX operations and write requests can be
used with `OpenTypes`, too. For [MXBeans][5] special support has been
added, so that e.g. a JSON map gets properly translated to an MXBean's
Map attribute (which in between gets translated to a [TabularData][6]
with a fixed format). Since MXBeans are so easy to declare, implement
and to register, this missing piece really adds to our **JMX on
Capsaicin** mantra.

Both features arrived via GitHub [pull requests][7] and are proofs for
the relevance of the social coding model introduced by GitHub. Big
acknowlegdments go out to [Assaf Berg][8] and [Greg Bowyer][9] for
providing patches which lead to these features.

This is probably the last release before 1.0, which is to be expected
before the end of September.

  [1]: http://www.jolokia.org/reference/html/agents.html#agents-jvmjdk6
  [2]: http://download.oracle.com/javase/6/docs/jdk/api/attach/spec/com/sun/tools/attach/VirtualMachine.html
  [3]: http://download.oracle.com/javase/6/docs/technotes/guides/management/jconsole.html
  [4]: http://download.oracle.com/javase/6/docs/api/javax/management/openmbean/OpenType.html
  [5]: http://download.oracle.com/javase/6/docs/api/javax/management/MXBean.html
  [6]: http://download.oracle.com/javase/6/docs/api/javax/management/openmbean/TabularData.html
  [7]: https://github.com/rhuss/jolokia/pulls
  [8]: https://github.com/asssaf
  [9]: https://github.com/GregBowyer