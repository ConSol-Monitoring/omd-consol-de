---
author: Roland Huß
date: '2014-02-24T21:08:50+00:00'
slug: find-your-agents-with-jolokia-1-2-0
title: Find your agents with Jolokia 1.2.0
---

New year, new release. Jolokia 1.2.0 is in the house.

<!--more-->
Ok, it's not the BIG 2.0 which was already somewhat promised. Anyways, another big feature jumped on the 1.x train in the last minute. It is now possible to find agents in your network by sending an UDP packet via multicast. Agents having this discovery mechanism enabled will respond with their meta data including the access URL. This is especially useful for clients who want to provide access to agents without much configuration. I.e. the excellent HTML5 console hawt.io will probably use it one way or the other. In fact, it was <a title="hawt.io" href="http://hawt.io">hawt.io</a> which put me on track for this nice little feature ;-)

Discovery is enabled by default for the JVM agent, but not for the WAR agent. It can be easily enabled for the WAR agent by using servlet init parameters, system properties or environment variables. All the nifty details can be found in the <a href="http://www.jolokia.org/reference/html/index.html">reference manual</a>.

The protocol for the <a href="http://www.jolokia.org/reference/html/protocol.html#discovery">discovery mechanism</a> is also defined in the reference manual. One of the first clients supporting this discovery mode is Jmx4Perl in its newest version. The Jolokia Java client will follow in one of the next minor releases.

For sending a multicast request discovery message, an UDP message should be send to the address <code>239.192.48.84</code>, port <code>24884</code> which contains a JSON message encoded in UTF-8 with the following format

<pre>
  {
    "type": "query"
  }
</pre>

Any agent enabled for discovery will respond to the requestor on the same socket with an answer which looks like

<pre>
  {
    "type": "response",
    "agent_description" : "Atlantis Tomcat",
    "agent_id" : "10.9.11.18-58613-81b087d-servlet",
    "url": "http://10.9.11.25:8778/jolokia",
    "server_vendor" : "Apache",
    "server_product" : "Tomcat",
    "server_version" : "7.0.35"
  }
</pre>

The response itself is a JSON object, too.  Responses are sent back to the address and port of the sender of the query request.

But you don't need client support for multicast requests if you know already the URL for one agent. Each agent registers a MBean <code>jolokia:type=Discovery</code> which perform the multicast discovery request for you if you trigger the operation <code>lookupAgents</code>. The returned value is similar as shown in the example above.

Happy multicasting, and don't forget to open an <a href="https://github.com/rhuss/jolokia/issues">issue</a> in case of troubles.