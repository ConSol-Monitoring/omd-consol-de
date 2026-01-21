---
author: Christoph Deppisch
date: '2012-07-10T06:20:10+00:00'
slug: citrus-1-2-final
tags:
- Citrus
title: Citrus 1.2 Final
---

It has been a while since our last final release for Citrus. Now I am proud to announce the final 1.2 release. The package ships with a huge list of new features and improvements that I would like to highlight in a few lines for you.

<!--more-->

<ul>
<li><strong>Spring version upgrade:</strong> We did some major version upgrades in our Spring dependencies. We are now using Spring 3.1.1, Spring Integration 2.1.2 and SpringWS 2.1.0.</li>
<li><strong>Groovy support:</strong> We have extended our support for JVM languages like Groovy. You can use Groovy's <a href="http://www.citrusframework.org/reference/html/index.html#groovy-markupbuilder" title="MarkupBuilder" target="_blank">MarkupBuilder</a> to create XML message payloads for instance. Another nice feature set comes with Groovy's validation capabilities (e.g. <a href="http://www.citrusframework.org/reference/html/index.html#groovy-xmlslurper" title="XMLSlurper" target="_blank">XMLSlurper</a> or <a href="http://www.citrusframework.org/reference/html/index.html#actions-database-groovy" title="SQL result set validation" target="_blank">SQL result set validation</a>).</li>
<li><strong>JSON support:</strong> With 1.2 you are able to validate message payloads other than XML. We have implemented a JSON message validator capable of ignoring entries and handling JSONArrays and JSONObjects. But the new message format support for JSON is only one example. It is also possible to validate CSV, PLAINTEXT, MS Excel and more.</li>
<li><strong>Http and REST:</strong> We improved our <a href="http://www.citrusframework.org/reference/html/index.html#http" title="http message handling" target="_blank">Http message handling</a> a lot, so you can send and receive RESTful messages with Http. Citrus is able to connect with Http as a client or server simulating RESTful services with different request methods (GET, PUT, DELETE, POST).</li>
<li><strong>Validation matchers:</strong> The new <a href="http://www.citrusframework.org/reference/html/index.html#validation-matchers" title="validation matchers" target="_blank">validation matchers</a> will put message validation mechanisms to a new level. With validation matchers you are able to execute powerful assertions on the message content. For instance the isNumber validation matcher checks that a message value is of numeric nature. Several matcher implementations are ready for use and you can write custom validation matchers, too.</li>
<li><strong>Conditional container:</strong> The new <a href="http://www.citrusframework.org/reference/html/index.html#containers-conditional" title="conditional container" target="_blank">conditional container</a> executes nested test actions only in case a boolean expression evaluates to true. This helps for environment specific test actions or optional tasks.</li>
<li><strong>Message selectors on message channels:</strong> We enhanced our <a href="http://www.citrusframework.org/reference/html/index.html#message-channel-selector-supporthttp://" title="message selectors" target="_blank">message selector support</a> on Spring integration message channels. With this you can selectively receive messages from message channels which is a great thing for you to do in order to avoid instable tests.</li>
</ul>

In addition to that you get several other improvements and bugfixes with Citrus 1.2. See the full <a href="http://www.citrusframework.org/changes-report.html" title="change list" target="_blank">change list</a> or have a look at the <a href="http://www.citrusframework.org/reference/html/index.html#whatsnew" title="What's new" target="_blank">what's new</a> section in our documentation for details. If you have questions and comments on the new release do not hesitate to contact us. We are always happy to receive feedback from you.