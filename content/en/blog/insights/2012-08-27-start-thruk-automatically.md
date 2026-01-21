---
author: Sven Nierlein
date: '2012-08-27T21:53:25+00:00'
slug: start-thruk-automatically
title: Start Thruk Automatically
---

Thruk uses the mod_fcgid apache module which makes Thruk start on the first request. The user then gets a "waiting" page till the fastcgi server has started. When using Thruk all the time, there is no reason to wait till someone makes the first request and you can just fire up the init script after apache starts.

In normal installations there is an rc script in /etc/init.d/thruk which fakes a request and makes the fastcgi server start.
<pre>
 root@mo:~ #> /etc/init.d/thruk start
 Starting thruk.........(10492) OK
</pre>

In OMD its even easier, latest snapshots have so called 'init-hooks' which are executed after the rc script. You
need to create two files in your site:

- etc/init-hooks.d/apache-reload-post

One of them can be a symlink, because both files will have the same content:

<pre>
 #!/bin/sh
 # check return code of apache start
 if [ $4 = 0 ]; then
   ./etc/init.d/thruk start
 fi
</pre>

So when ever your apache starts / reloads, for example after logfile rotation, thruk will immediatly start too.