---
author: Christoph Deppisch
date: '2013-04-02T07:31:56+00:00'
slug: citrus-1-3-released
tags:
- Citrus
title: Citrus 1.3 released
---

I am excited to announce that Citrus 1.3 has been released! We hope you enjoy the new feature set coming with this version like the new Java test builder for writing tests with Java code only and the new citrus-ssh module that adds connectivity to the ssh protocol as a client or server. Now let's have a quick look at the major changes with this release.
<!--more-->

<ul>
<li><strong>Java DSL support:</strong> We have introduced a Java test builder for writing Citrus tests in Java only. Before that you were forced to write your tests with a XML syntax. Of course this was not very popular within the Citrus users having development background. So now you can choose on how to write your Citrus test with Java and/or XML. Have a look at the <a href="http://www.citrusframework.org/reference/html/index.html#testcase" title="User guide" target="_blank">user guide</a> to to see how it works.</li>
<li><strong>Citrus SSH module:</strong> The Citrus family has raised a new member in adding SSH connectivity. With the new SSH module you are able to provide a full stack SSH server. The SSH server accepts client connections and you as a tester can simulate any SSH server functionality with proper validation as it is known to Citrus SOAP and HTTP modules. In addition to that you can also use the Citrus SSH client in order to connect to an external SSH server. You can execute SSH commands on the SSH server and validate the respective response data. The full description is provided in the new <a href="http://www.citrusframework.org/reference/html/index.html#ssh" title="Citrus SSH" target="_blank">ssh user guide section</a></li>
<li><strong>ANT run test action:</strong> With this new test action you can call ANT builds from your test case. The action executes one or more ANT build targets on a build.xml file. You can specify build properties that get passed to the ANT build and you can add a custom build listener. In case the ANT build run fails the test fails accordingly with the build exception.</li>
<li><strong>XHTML message validation:</strong> Message validation for Html code was not really comfortable as Html does often not confirm to be wellformed and valid XML syntax. Citrus tries to close this gap with XHTML. With Citrus 1.3 we introduced a XHTML message validator which does the magic of converting Html code to proper wellformed and valid XML. In a test case you can then use the full XML validation power in Citrus in order to validate incoming Html messages.</li>
<li><strong>Spring version upgrade:</strong> As usual we are updating our Spring dependencies with each release. With Citrus 1.3 we updated to Spring 3.1.3, Spring Integration 2.2.1 and SpringWS 2.1.2.</li>
<li><strong>Jetty version upgrade:</strong> The Jetty web server plays a significant role in Citrus when starting server mocks. With Citrus 1.3 we updated to Jetty 8.1.8.</li>
</ul>

For a full report of all features, bugfixes and changes for this release we advice you to review the <a href="https://citrusframework.atlassian.net/secure/ReleaseNote.jspa?projectId=10000&version=10003" target="_blank">1.3 release notes</a> and the <a href="http://www.citrusframework.org/reference/html/index.html#whatsnew" target="_blank">what's new</a> section in our user guide.