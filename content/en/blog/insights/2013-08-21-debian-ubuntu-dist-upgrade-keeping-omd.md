---
author: Sven Nierlein
date: '2013-08-21T07:32:06+00:00'
slug: debian-ubuntu-dist-upgrade-keeping-omd
title: Debian/Ubuntu dist-upgrade keeping OMD
---

Changing major releases on linux is always a risk, but Debian / Ubuntu dist-upgrades really worked fine the last years. If you are using OMD (Open Monitoring Distribution) for Nagios/Icinga/Shinken, then the release-update would disabled 3rd party repositorys and therefore remove your OMD installations during the update. This is usually not what you want, but with a small trick, updates work smoothly.

<!--more-->
First step:
<ul>
 	<li>make sure you made backups</li>
	<li>make sure all your sites use latest stable OMD release</li>
</ul>

OMD daily Snapshot releases will be removed during the update because the snapshot version is probably not longer available.

After a quick check via "omd sites" i had to update my development site:
<blockquote><pre>
#> omd sites
SITE             VERSION          COMMENTS
devel            0.57.20130607
thruktest        1.00
modgearmantest   1.00
</pre></blockquote>

But thanks to OMD, this isn't a big deal:
<blockquote><pre>
#> omd update devel
</pre></blockquote>

Second step, start the upgrade:
<blockquote><pre>
#> do-release-upgrade
</pre></blockquote>

After some moments, you will get this screen which tells you the update process disabled some repositorys:

<blockquote><pre>
Updating repository information
WARNING: Failed to read mirror file

Third party sources disabled

Some third party entries in your sources.list were disabled. You can
re-enable them after the upgrade with the 'software-properties' tool
or your package manager.

To continue please press [ENTER]
</pre></blockquote>

<b>DON'T</b> press enter now, instead open a second shell and change your /etc/apt/sources.list:

Before:
<blockquote><pre>
# Consol Labs Repository
# deb http://labs.consol.de/repo/stable/ubuntu precise main # disabled on upgrade
# deb http://labs.consol.de/repo/testing/ubuntu precise main # disabled on upgrade
</pre></blockquote>

After:
<blockquote><pre>
# Consol Labs Repository
deb http://labs.consol.de/repo/stable/ubuntu precise main
deb http://labs.consol.de/repo/testing/ubuntu precise main
</pre></blockquote>

Be careful, mistakes can lead to serious fuckups. Double check the release name!

After editing the sources.list, continue with your update...

Finally, check the details of the update by pressing "d" at the next step and make sure your OMD packages are listed in "Upgrade:"
<blockquote><pre>
 Continue [yN]  Details [d]
</pre></blockquote>

It should look like this:
<blockquote><pre>
...
Upgrade: kruler kscreensaver knode plasma-scriptengines liblcms1
...
knetwalk xorg-docs-core kscreensaver-xsavers kpat omd-1.00
...
</pre></blockquote>

Now enjoy your updated system.