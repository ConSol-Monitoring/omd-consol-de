---
author: Christoph Deppisch
date: '2010-08-12T19:40:29+00:00'
slug: citrus-1-1-released
tags:
- Citrus
title: Citrus 1.1 released
---

Citrus 1.1 release is here (<a href="http://www.citrusframework.org/download.html">download</a>)! The release comes with a bunch of new features and bugfixes. Here is a short list of major features and changes in this release:

<!--more-->

<ul>
	<li><strong>Apache License 2.0:</strong> We decided to switch from GPLv3 to Apache License Version 2.0 within 1.1 release. This is mainly done to give you more flexibility in using Citrus.</li>
	<li><strong>JUnit support:</strong> You can now execute Citrus tests with JUnit. This is in addition to the existing TestNG support, so you can choose the framework you like best.</li>
	<li><strong>Extended SOAP attachments support:</strong> Send and receive SOAP messages with attachments - very nice feature. When receiving attachments you are able to validate the attachment in contentId, contentType and contentData.</li>
	<li><strong>SOAP fault validation possible:</strong> In case a web service responds to Citrus client with SOAP faults, we are now able to handle and validate those. The validation includes fault codes, fault reasons as well as fault details.</li>
	<li><strong>Spring Integration MessageChannel support:</strong> The Spring Integration MessageChannel support adds great possibilities regarding Citrus messaging. You can send and receive messages directly to/from message channels. This means that we can now use the excellent Spring Integration adapters, in order to extend Citrus with new message transports like file adapter and mail adapter.</li>
	<li><strong>Improved error handling:</strong> In case of test failure the exact failure cause and line position inside the test is presented to the tester which simplifies the error analysis.</li>
	<li><strong>JMS topic support:</strong> With this release Citrus is able to publish/subscribe to JMS topics.</li>
</ul>

This is only a short list of new features and changes. Please see the complete <a href="http://www.citrusframework.org/changes-report.html#a1.1">changes report</a> for details. We hope you enjoy the next step in Citrus growing as much as we do.