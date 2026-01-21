---
author: Marco Bungart
author_url: https://twitter.com/turing85
date: '2019-02-05'
featured_image: /assets/2017-03-14-getting-started-with-java9-httpclient/duke-blueprint.png
meta_description: Since February 1st, Oracle SE can no longer be used in production
  without a license. What are the changes, which alternatives do we have?
tags:
- java
title: Java Licensing&#58; Is the Free Lunch over?
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

The <a href="https://java.com/en/download/release_notice.jsp" target="blank">license change to Java SE 8</a>, as well as the <a href="https://www.oracle.com/technetwork/java/javase/terms/license/javase-license.html" target="blank">new license for Java SE 9 and onwards</a> lead to confusion within the Java community. Looking for information on the web, one finds results in the spectrum from <a href="https://dzone.com/articles/java-in-jeopardy" target="blank">"Is Java in Jepoardy?"</a> to <a href="https://medium.com/@javachampions/java-is-still-free-c02aef8c9e04" target="blank">"Java is still free!"</a>. The good news is: yes, Java is still free. The bad news: not necessarily Oracle's Java distribution.

In this article, we discuss the situation revolving around Oracle's license change and its consequences. For this, we need to understand how the Oracle JDK is connected to OpenJDK. Furthermore, we take a look at some alternatives to Oracle's Java distribution and how divergence between the different distribution is avoided.

What you will need:

* about 15-20 minutes of time 

<!--more-->

## Oracle's Java Distribution and OpenJDK

<a href="https://openjdk.java.net/faq/" target="blank">Oracle started the OpenJDK project</a> and will continue to support it, more on that later. OpenJDK was and will stay the reference implementation for Java.

But how does committing to the OpenJDK work? Oracle lead the development of OpenJDK from Java 6 onwards. When Oracle stopped supporting Java SE 6 (and thus OpenJDK 6), <a href="https://www.redhat.com/en/about/press-releases/red-hat-reinforces-java-commitment-and-assumes-leadership-openjdk-6-community" target="blank">Red Hat's Andrew Haley assumed global leadership for OpenJDK 6</a>. The same procedure happened with Java SE 7, again with <a href="https://www.redhat.com/en/about/press-releases/stewardship-openjdk-7-project-shifts-red-hat" target="blank">Haley assuming leadership for OpenJDK 7</a>. This did and does not mean that only Red Hat can contribute to those OpenJDK versions. It just means that Red Hat manages the project. When Red Hat dropped the leadership for OpenJDK 6, Azul Systems took over and continues supporting OpenJDK 6 to this very day.

So you might ask *"What is the difference between OpenJDK and Oracle JDK? Was there ever a reason for using the Oracle JDK?"* Yes, there were and are reasons to use the Oracle JDK. The Oracle JDK ships with tools like Mission Control, Java Flight Recorder and VisualVM, which are closed source. This, in part, is the reason why Oracle published its Java distribution under its <a href="https://www.oracle.com/technetwork/java/javase/terms/license/index.html" target="blank">Binary Code License Agreement for Java SE</a> and not under some open source license like <a href="https://www.gnu.org/licenses/#GPL" target="blank">GPL</a>. In contrast, OpenJDK was and will continue to be released under <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2 with Classpath Extension</a> (short: *GPLv2CE*). With respect to behaviour, the Oracle JDK and OpenJDK are designed as drop-in replacement for each other. More on this in the section [Bringing Order to the Chaos](#order)    

Your next question might be *"What did actually change?"*. The release cycles and the support through Oracle for the Java versions, both for the Oracle JDK and for OpenJDK. For Oracle's Java SE distribution the <a href="https://www.oracle.com/technetwork/java/java-se-support-roadmap.html" target="blank">support plan</a> is as follows:

* If you want to use Java in production, you need to have an active <a href="https://www.oracle.com/java/java-se-subscription.html" target="blank">Oracle Java SE Subscription</a>.

* Oracle will produce a new release every six month.

* Patches for a release will be done in a quarterly manner.

* Every successive release is a superset of all preceding releases. Thus, older releases are superfluous and not longer supported. This means that a release reaches its end of life typically six months after it was released.

* The only exception to this rule are the Long Term Support (short: *LTS*) releases: Updates are available for six months publicly. If you have an <a href="https://www.oracle.com/java/java-se-subscription.html" target="blank">Oracle Java SE Subscripton</a>, <a href="https://www.oracle.com/support/lifetime-support/" target="blank">support is available for five years</a>. 

* Every sixth release is a LTS release.

Since Java 9, OpenJDK is maintained and built by Oracle, still under <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>, as long as the corresponding Java SE version has not yet reached its end of life. After a release has reached its end of life, Oracle stops producing updates for this OpenJDK release (this includes security patches). <a href="http://mail.openjdk.java.net/pipermail/jdk-dev/2018-August/001833.html" target="blank">Oracle will hand over the OpenJDK code line of LTS releases to a qualified project lead</a>, so it can be developed further under <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>. This is what we meant by saying "*Oracle [...] will continue to support OpenJDK*". <a href="https://developers.redhat.com/blog/2018/09/24/the-future-of-java-and-openjdk-updates-without-oracle-support/" target="blank">Andrew Haley from Red Hat is a possible candidate for the OpenJDK 8 lead</a>.

The culprit, however, is that Oracle only hands over the code line of the LTS releases. Thus, the OpenJDK project has to wait 30 months before receiving a new code line from Oracle. In the mean time, the OpenJDK community is responsible for "keeping up" with the development of the Java specification.  

## The Zoo of OpenJDK Distributions

This is where different communities and vendors step in to close the gap, providing extended and timely updates, premium support subscriptions, the integration of features from newer releases and/or the promise to downstream their updates back to the OpenJDK project. We will take a closer look at some of them, in alphabetical order.

### <a href="https://adoptopenjdk.net/" target="blank">AdoptOpenJDK</a>

* **Provided by:** AdoptOpenJDK

* **Published under:** <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>

* **Premium Support available:** No

As the homepage says: 

> AdoptOpenJDK provides prebuilt OpenJDK binaries from a fully open source set of build scripts and infrastructure.

Thus, the project itself does not patch or update OpenJDK, but only generates binary builds. <a href="https://adoptopenjdk.net/releases.html" target="blank">Builds for JDK 8 to 11 are available</a> either with the HotSpotVM or Eclipse's <a href="https://www.eclipse.org/openj9/" target="blank">OpenJ9</a> (released under <a href="https://www.eclipse.org/legal/epl-2.0/" target="blank">Eclipse Public License, Version 2</a> and/or <a href="https://www.apache.org/licenses/LICENSE-2.0" target="blank">Apache License 2.0</a>). Supported operating systems include Linux, Windows, macOS and Solaris. <a href="https://hub.docker.com/u/adoptopenjdk" target="blank">Docker images</a> based on Ubuntu 18.04 are available.

### <a href="https://aws.amazon.com/corretto/" target="blank">Corretto</a>

* **Provided by:** Amazon

* **Published under:** <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>

* **Premium Support available:** No

Amazon has a long history supporting Java. With the advent of AWS Lambda and its support for Java, it is natural that Amazon develops an JDK of their own. Corretto was announced <a href="https://aws.amazon.com/blogs/opensource/amazon-corretto-no-cost-distribution-openjdk-long-term-support/" target="blank">in a post by Aron Gupta on November 14th, 2018</a>. Gupta gives the promise to 

> [...] downstream fixes made in OpenJDK, add enhancements based on our own experience and needs, and then produce Corretto builds. In case any upstreaming efforts for such patches is not successful, delayed, or not appropriate for OpenJDK project, we will provide them to our customers for as long as they add value. If an issue is solved a different way in OpenJDK, we will move to that solution as soon as it is safe to do so.

The source code is publicly available on <a href="https://github.com/corretto" target="blank">GitHub</a>. <a href="https://aws.amazon.com/about-aws/whats-new/2019/01/amazon-corretto-is-now-generally-available/" target="blank">As of January 31st, 2019</a>, Corretto 8 is <a href="https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html" target="blank">publicly available for AWS Linux 2, Windows and macOS</a>, as well as <a href="https://hub.docker.com/_/amazoncorretto" target="blank">Docker images</a> based on Amazon Linux 2. General availability for Corretto 11 should follow in the near future.

### <a href="https://www.oracle.com/technetwork/java/javase/downloads/index.html" target="blank">Oracle Java SE</a>

* **Provided by:** Oracle

* **Published under:** <a href="https://www.oracle.com/technetwork/java/javase/terms/license/index.html" target="blank">Oracle Binary License</a>

* **Premium Support available:**  <a href="https://www.oracle.com/java/java-se-subscription.html" target="blank">Yes</a>

This entry needs little explanation. Oracle builds and maintains their own distribution of Java. Java SE is <a href="https://www.oracle.com/technetwork/java/javase/downloads/index.html" target="blank">publicly available in versions 8 and 11 for Linux, Windows, macOS and Solaris</a>, although use in production requires an active <a href="https://www.oracle.com/java/java-se-subscription.html" target="blank">Oracle Java SE Subscription</a>. With this subscription, you furthermore get access to updates for Java SE 6 and 7. The subscription costs USD 2.50 (license for one desktop) or USD 25.00 (license for one processor in a server / the cloud). Length of terms is usually one year. For Java 8, a <a href="https://hub.docker.com/_/oracle-serverjre-8">Docker image</a> based on Oracle Linux Server 7.6 is available.

As stated above, non-LTS releases are always superseded by newer releases, thus Oracle provides support for non-LTS releases only until the next release comes out. For LTS, releases, if you have an active <a href="https://www.oracle.com/java/java-se-subscription.html" target="blank">Oracle Java SE subscription</a> (<a href="https://www.oracle.com/technetwork/java/javaseproducts/overview/javasesubscriptionfaq-4891443.html" target="blank">which gives you Premier Support</a>), you will receive updates for five years after release.    

### <a href="https://developers.redhat.com/products/openjdk/overview/" target="blank">Red Hat OpenJDK</a>

* **Provided by:** Red Hat

* **Published under:** <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>

* **Premium Support available:** <a href="https://www.redhat.com/en/store" target="blank">Yes</a>

As stated previously, Red Hat is invested in supporting the OpenJDK projects, e.g. by taking the global leadership for OpenJDK7 and OpenJDK8. Applying for global leadership in OpenJDK11, it is clear that Red Hat plans to further support OpenJDK in the future. In addition, Red Hat developed a low pause time garbage collector, <a href="https://wiki.openjdk.java.net/display/shenandoah/Main" target="blank">Shenandoah GC</a>, which is included in all Red Hat OpenJDK distributions and in the official OpenJDK12 releases. For LTS releases, <a href="https://access.redhat.com/articles/1299013#OpenJDK_Life_Cycle" target="blank">Red Hat promises a support of at least six years, with OpenJDK8 and OpenJDK11 having support until June 2023 and October 2024, respectively</a>.

While a support subscription does not give you privileged access to Red Hat's OpenJDK distributions, you get on-call support as well as access to the Ret Hat Customer Portal. <a href="https://access.redhat.com/support/offerings/developer/sla/" target="blank">Support is available as Professional and Enterprise Support</a> with the main difference being the response time. For RHEL, support can be bought with one of the <a href="https://www.redhat.com/en/store/linux-platforms" target="blank">Linux subscriptions (subscription type must at least be "Standard")</a>. Support for OpenJDK on Windows is accessible through a <a href="https://www.redhat.com/en/store/jboss-middleware" target="blank">JBoss Middleware Subscription</a>.    

Red Hat OpenJDK in versions 7, 8 and 11 is <a href="https://openjdk.java.net/install/" target="blank">available through `yum`</a>. Versions 8 and 11 for Windows are <a href="https://developers.redhat.com/products/openjdk/download/" target="blank">available as Download</a>.

### <a href="https://sap.github.io/SapMachine/" target="blank">SapMachine</a>

* **Provided by:** SAP

* **Published under:** <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>

* **Premium Support available:**  No

SapMachine is a *"friendly fork"* of OpenJDK, maintained by SAP. <a href="https://github.com/SAP/SapMachine/wiki/Differences-between-SapMachine-and-OpenJDK" target="blank">SAP is committed to keep the differences between SapMachine and OpenJDK as minimal as possible</a>:

> Therefore features identified as required by SAP applications should be developed in and contributed to OpenJDK. Only if this is, for what ever reason, not possible, differences between SapMachine and OpenJDK are considered acceptable. However, they have to be kept as small as possible.

SapMachine versions <a href="https://sap.github.io/SapMachine/latest/10">10</a> and <a href="https://sap.github.io/SapMachine/latest/11">11</a> are available for Linux, Windows and macOS. <a href="https://github.com/SAP/SapMachine/releases" target="blank">Pre-releases for SapMachine 12 and 13</a> are also available, as well as <a href="https://hub.docker.com/u/sapmachine">Docker images</a> based on Ubuntu 16.04. The source code is available on <a href="https://github.com/SAP/SapMachine" target="blank">GitHub</a>.

### <a href="https://www.azul.com/products/zulu-enterprise/" target="blank">Zulu Enterprise</a>

* **Provided by:** Azul Systems

* **Published under:** <a href="https://openjdk.java.net/legal/gplv2+ce.html" target="blank">GPLv2CE</a>

* **Premium Support available:** <a href="https://www.azul.com/products/zulu-enterprise/" target="blank">Yes</a>

Like Red Hat, Zulu has a long history supporting OpenJDK. They took over leadership of OpenJDK 6. Zulu is built from OpenJDK, with bug fixes added through Azul Systems. Azul Systems makes selected builds of Zulu public availability. With a standard support subscriptions, updates are provided in a quarterly manner. Premium support gives you access to hotfixes in a timely manner. Support can be bought on a by-year basis, ranging from from USD 13,500 (for 25 Systems, Standard Support) to USD 290,300 (fur an unlimited number of systems, Premium Support). For details, please visit the <a href="https://www.azul.com/products/zulu-enterprise/" target="blank">Zulu Enterprise Homepage</a>.

Versions 7 to 11 of Zulu are available for <a href="https://www.azul.com/downloads/zulu/zulu-linux/" target="blank">Linux</a> (also as `tar` archive or through <a href="http://repos.azulsystems.com/" target="blank">`apt` and `yum`</a>), <a href="https://www.azul.com/downloads/zulu/zulu-windows/" target="blank">Windows</a> and <a href="https://www.azul.com/downloads/zulu/zulu-mac/" target="blank">macOS</a>. Zulu 6 is available for Linux and Windows. <a href="https://hub.docker.com/r/azul/zulu-openjdk/" target="blank">Docker images</a> are available for all versions from 6 to 11 and are based on Ubuntu 18.04. The source code is publicly available on <a href="https://github.com/zulu-openjdk/zulu-openjdk/blob/master/8-latest/" target="blank">GitHub</a>.

Zulu offers support of non-LTS releases for at least 2.5 years (although some are supported for 3.5 years). LTS releases, however, are always supported for 9 years. In order to receive regular updates, you need to have an active subscription. 

## <a name="order"></a>Bringing Order to the Chaos

With so many different distributions in the wild, it is likely that they will diverge. This, however, would lock the user into a specific distribution. To prevent this from happening, OpenJDK releases the <a href="https://openjdk.java.net/groups/conformance/JckAccess/" target="blank">Java Compatibility Kit</a> (short: *JCK* or *TCK*). If an JDK implementation passes the JCK tests, it can be replaced by every other implementation that passes the JCK tests and vice-versa. All presented distributions have passed the JCK tests.

## Conclusion


Oracle's changes to its licensing models brought confusion, but at the same time opportunities. There are more OpenJDK distributions than ever. Each has its own focus, most of them are committed to downstreaming patches and features back to OpenJDK.

To prevent derivation between the different distributions, OpenJDK releases the JCK, and all presented distributions passed TCK tests, guaranteeing compatibility between the different distributions.

## Further Reading

This article provided information on a need-to-know basis. Some parts were intentionally explained in a shallow manner, some parts were not discussed at all. For a complete picuture, I encourage everyone to read <a href="https://medium.com/@javachampions/java-is-still-free-c02aef8c9e04" target="blank">"Java is still free!"</a> (the longer version). Please encourage your colleagues to read this article.

If you have any questions or remarks, feel free to contact me via [marco(dot)bungart(at)consol(dot)de][Email] or <a href="https://twitter.com/turing85" target="blank">Twitter</a>.

[newest posts on ConSol Labs]: https://labs.consol.de

[Email]: mailto:marco.bungart@consol.de