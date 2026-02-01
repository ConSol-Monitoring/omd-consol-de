---
author: Roland Huß
date: '2009-12-23T16:28:32+00:00'
excerpt: Jmx4perl 0.51 has been released.
slug: jmx4perl-0-50-released
tags:
- jmx
title: jmx4perl 0.51 released
---

Jmx4perl 0.51 has been released.

<!--more-->Welcome to the next round in the jmx4perl journey. The new [release 0.51][1] contains beside bug fixes the following changes:

* A new proxy mode allows for usage of jmx4perl without the need to deploy an agent servlet on the target platform. All you need is to deploy the *j4p.war* on a dedicated servlet container (preferably Tomcat or Jetty) which accesses the target platform via JSR-160 based JMX remoting. The target server needs to be prepared for JMX remoting, though. More information can be found in a previous [post][2]. Some hints for enabling JMX remoting with [JBoss][6] and [Weblogic][7] has been posted here.

* `--target` option has been added to *check_jmx4perl* and *jmx4perl* for enabling the usage of the jmx4perl proxy

* A [Mule][3] agent has been added for direct usage of jmx4perl when using Mule's standalone mode. The agent is not distributed within the standard release, but can easily be fetched from our [maven repository][4]. For the mule setup please refer to the included Manual or to this [post][5].

That's the christmas present for this year ;-) Be prepared for some exciting additions to jmx4perl next year ....

[Well, the original release 0.50, had some packaging issues which resulted in a bogus agent war within
the distribution. That's the sole reason for 0.51, which fixes this issue. This is the real present ;-)  The agent [j4p-war-0.50.war][8] in our repository had no problem,
though]

  [1]: http://search.cpan.org/CPAN/authors/id/R/RO/ROLAND/jmx4perl-0.51.tar.gz
  [2]: /blog/2009/11/20/agentless-jmx4perl/
  [3]: http://www.mulesoft.org
  [4]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-mule/0.51/j4p-mule-0.51-agent.jar
  [5]: /blog/2009/12/10/jmx4perl-mule-agent/
  [6]: /blog/2009/11/23/jboss-remote-jmx/
  [7]: /blog/2009/12/02/configuring-remote-jmx-access-for-weblogic/
  [8]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-war/0.50/