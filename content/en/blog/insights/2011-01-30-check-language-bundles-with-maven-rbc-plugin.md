---
author: Admin
date: '2011-01-30T19:37:21+00:00'
slug: check-language-bundles-with-maven-rbc-plugin
tags:
- gmaven
title: Check language bundles with maven-rbc-plugin
---

Got an an internationalized Java app?
Then the <a href="http://labs.consol.de/projects/maven/maven-rbc-plugin">maven-rbc-plugin</a> plugin can help you finding

<!--more-->
<h3>Check the language bundles of your app with maven-rbc-plugin</h3>


<ul>
  <li>entries not fully internationalized</li>
   <li>missing resource files</li>
   <li>invalid unicode</li>
    <li>... and <a href="http://labs.consol.de/projects/maven/maven-rbc-plugin/report-mojo.html#enabledChecks">more</a></li>
</ul>

The recent <a href="http://labs.consol.de/projects/maven/maven-rbc-plugin/changes-report.html#a0.4">0.4 release</a> brings a new <a href="http://labs.consol.de/projects/maven/maven-rbc-plugin/report-mojo.html">report goal</a> nicely presenting any resource issues detected.

<p>
Have a look at the <a href="http://labs.consol.de/projects/maven/maven-rbc-plugin/usage.html">usage</a> guide as a quick start for integrating the plugin.
</p>

<a href="http://labs.consol.de/projects/maven/maven-rbc-plugin/rbc-example_report.html"><img src="/assets/2011-09-30-maven-resource-bundle-check-plugin-0-5/example-report.png" alt="Example maven-rbc-plugin report (click for details)"></a>