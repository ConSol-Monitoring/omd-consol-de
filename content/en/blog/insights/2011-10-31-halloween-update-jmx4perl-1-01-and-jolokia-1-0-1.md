---
author: Roland Huß
date: '2011-10-31T21:01:07+00:00'
slug: halloween-update-jmx4perl-1-01-and-jolokia-1-0-1
tags:
- jmx
title: 'Halloween Update: Jmx4Perl 1.01 and Jolokia 1.0.1'
---

Small updates have arrived for <a href="http://www.jmx4perl.org">Jmx4Perl</a> and <a href="http://www.jolokia.org">Jolokia</a>.

<!--more-->
Beside bug fixes, the two versions bring the following new features:
<ul>
  <li><a href="http://search.cpan.org/~roland/jmx4perl-1.01/">Jmx4Perl</a>:
    <ul>
      <li><code>jolokia</code> fixed download problems for the JVM agent</li>
      <li>Boolean values are printed now correctly in <code>j4psh</code></li>
      <li>Lowered version numbers of some dependencies</li>
    </ul>
  </li>
  <li><a href="http://www.jolokia.org">Jolokia</a>:
    <ul>
      <li>JVM agent can now also take a regular expression instead a process id for dynamically
          attaching the Jolokia agent to a running Java process. The pattern is matched against the process' descriptions.</li>
      <li>Collections others than lists and maps (like a <code>Set</code>) are returned as JSON arrays now.
    </ul>
  </li>
</ul>
<p>
That's it for now. Happy Halloween everybody ...
</p>