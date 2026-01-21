---
author: Gerhard Laußer
date: '2012-05-20T19:28:00+00:00'
slug: how-to-install-bleeding-edge-shinken-in-a-minute-with-omd
tags:
- monitoring
title: How to install bleeding-edge Shinken in a minute with OMD
---

You probably have noticed that development of the new Nagios-compatible monitoring system <a href="http://www.shinken-monitoring.org" title="Shinken" target="_blank">Shinken</a> progresses very fast. Every few hours there is another commit at GitHub, where Shinken's code <a href="https://github.com/naparuba/shinken" title="Shinken repository at GitHub" target="_blank">repository</a> is hosted. Now if you want to try all these new features immediately, there's a very easy method which requires a simple update-command instead of a fresh install.

<!--more-->

First of all you need an installation of the Open Monitoring Distribution <a href="http://omdistro.org" title="omd" target="_blank">OMD</a>, the single-package monitoring ecosystem. Get the apropriate package for your Linux distro from our <a href="/repo/" title="ConSol OMD repository" target="_blank">repository</a>. You have to install OMD only once (...to start with this howto. Of course there are 3 or 4 updates per year for OMD too)</br>
When you are done, create a site.
```bash
# omd create shishi
# omd config shishi set CORE shinken
```
Now you have a working monitoring system with a Shinken core. However, it is not the current development version from GitHub. It's the Shinken version from the time when OMD was packaged.
So you have to make a local copy of the code repository on your test machine.
```bash
# cd /tmp
# git clone git@github.com:naparuba/shinken.git
```

After you downloaded the up-to-date Shinken files you need to overwrite the old files (owned by OMD) with the ones in the git repository. This is simply done with a bind-mount.
```bash
# mount --bind \
    /tmp/shinken/shinken \
    /opt/omd/versions/default/lib/shinken/shinken
```

Now you can start the site and play around with the most current Shinken code. (And get a visual impression by pointing your browser to http://&lt;your test server&gt;/shishi/thruk or http://&lt;your test server&gt;/shishi/shinken)
```bash
# omd start shishi
```

As i wrote in the beginning, there are constantly updates to the repository at GitHub. Keeping an eye on the development and always running the newest code requires not more than updating your local repository and restart the site.
```bash
# omd stop shishi
# cd /tmp/shinken
# git pull
# omd start shishi
```

Have fun with Shinken.