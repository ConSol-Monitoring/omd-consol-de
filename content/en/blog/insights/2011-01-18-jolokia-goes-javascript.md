---
author: Roland Huß
date: '2011-01-18T19:38:35+00:00'
slug: jolokia-goes-javascript
tags:
- javascript
title: 'Jolokia goes Javascript '
---

Starting with release 0.82, [Jolokia](http://www.jolokia.org) contains now a brand new Javascript client library. This blog post highlights the main features and gives some usage examples.

<!--more-->
It supports the full Jolokia [protocol stack][8], including bulk requests and HTTP POST and GET requests. Both, synchronous and asynchronous operation modes are available and support for [JSONP][2] in order to come around the *same-origin-policy* is build in, too.

`jolokia.js` uses [jQuery][3] as underlying framework and provides two API layers: A basic one with full control over the requests and a simplified API for ease of use, but slightly less powerful.

The following example shows a asynchronous Jolokia request for reading the head memory from an Jolokia agent deployed on the same server which serves this script:

```javascript
var j4p = new Jolokia("/jolokia");
j4p.request(
  { type: "READ", mbean: "java.lang:type=Memory", attribute: "HeapMemoryUsage"},
  {
    success: function(response) {
       var value = response.value;
       alert("Memory used: " + value.used / value.max * 100 + "%");
  }
});
```

The same can be done with the simplified API, which is shown in the next snippet, but this time performed synchronously.

```javascript
var j4p = new Jolokia("/jolokia");
var value = j4p.getAttribute("java.lang:type=Memory","HeapMemoryUsage");
alert("Memory used: " + value.used / value.max * 100 + "%");
```

A bulk Jolokia request in looks like

```javascript
var j4p = new Jolokia("/jolokia");
j4p.request(
  [
     {type: "version"},
     {type: "read",mbean: "java.lang:type=Threading",attribute: "ThreadCount"}
  ],
  {
     success:
        [
           function(resp) {
              console.log("Agent-Version: " + resp.value.agent);
           },
           function(resp) {
              console.log("Total number of threads: " + resp.value);
           },
        ]
  }
);
```

The full documentation of this library can be found in the Jolokia [Reference Manual][4].

Acknowledgments goes to [Stephan Beal][5], who initially kicked of the Javascript project with a layer on top of his Javascript messaging framework [JSONMessage][6] and which influenced heavily of the current design.

Finally, here is a full code example using `jolokia.js` for plotting the memory usage with the fine [`jquery.flot.js`][7] Plugin. You can save this code in a local file and open it in a browser. This example uses JSONP for accessing a Jolokia agent running at `http://localhost:8080/jolokia`.

```javascript
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Jolokia plot demo</title>
  <script src="http://code.jquery.com/jquery-1.4.4.min.js"></script>
  <script src="http://flot.googlecode.com/svn/trunk/jquery.flot.js"></script>
  <script src="http://www.jolokia.org/dist/0.82/js/jolokia-min.js"></script>
  <script src="http://www.jolokia.org/dist/0.82/js/jolokia-simple-min.js"></script>
  <script src="https://github.com/douglascrockford/JSON-js/raw/master/json2.js"></script>
</head>
<body>
<h1>Jolokia Memory Plot Demo</h1>

<div id="memory" style="width:600px; height:300px; margin-top: 20px;"></div>
<input type="submit" id="gc" value="Garbage Collection"/>

<script id="source" language="javascript" type="text/javascript">
  var j4p = new Jolokia({url: "http://localhost:8080/jolokia",jsonp: true});
  var data = [];

  function run() {
    j4p.request({
                  type: "read",
                  mbean: "java.lang:type=Memory",
                  attribute: "HeapMemoryUsage"
                },
                {
                  success: function(resp) {
                    var value = resp.value.used / (1024 * 1024);
                    var time = resp.timestamp * 1000;
                    data.push([time, value]);
                    $.plot($("#memory"),[data],{xaxis: { mode: "time" }});
                    setTimeout(run,1000);
                  }
                });
  }
  $("#gc").click(function() {
    j4p.execute("java.lang:type=Memory","gc", {
          success: function() {
              console.log("Garbage collection performed");
          }
     });
  });
  run();
</script>
</body>
</html>
```

<a href="/assets/2011-01-18-jolokia-goes-javascript/Screen-shot-2011-01-18-at-11.39.59.png"><img src="/assets/2011-01-18-jolokia-goes-javascript/Screen-shot-2011-01-18-at-11.39.59.png" alt="" title="Jolokia Memory Plot example" width="620" height="488" class="alignright size-full wp-image-2545" /></a>

   [1]: http://www.jolokia.org
   [2]: http://en.wikipedia.org/wiki/JSON
   [3]: http://www.jquery.com
   [4]: http://www.jolokia.org/reference/html/index.html
   [5]: http://www.wanderinghorse.net/
   [6]: http://code.google.com/p/jsonmessage/
   [7]: http://code.google.com/p/flot/
   [8]: http://www.jolokia.org/reference/html/protocol.html