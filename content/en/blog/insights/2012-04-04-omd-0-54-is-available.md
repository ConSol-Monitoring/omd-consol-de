---
author: Gerhard Laußer
date: '2012-04-04T23:04:49+00:00'
slug: omd-0-54-is-available
tags:
- Mod-Gearman
title: OMD 0.54 is available
---

<p><a href="/assets/2012-04-04-omd-0-54-is-available/OMDLOGO_FINAL2.jpg"><img style="border-right-width: 0px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="OMD-LOGO_FINAL2" border="0" alt="OMD-LOGO_FINAL2" src="/assets/2013-06-17-omd-1-00-just-arrived/OMDLOGO_FINAL2_thumb.jpg" width="107" height="107" /></a> The developer team of <a href="http://omdistro.org">OMD</a> (Open Monitoring Distribution) released the version 0.54 today. This version contains bugfixes and lots of updated packages including Shinken 1.0.1, Thruk 1.26, PNP4Nagios 0.6.17, NagVis 1.6.5 and many more. </p><!--more--><p>Using the <a href="/repo/">OMD Repository</a> an update is as simple as a &quot;apt-get install omd&quot;. Or similar on rpm based distributions. After installation of OMD, you have to update your sites. Better try this with a copy of your production site first.</p>  <p></p>  <h1>Update</h1>  <pre> #&gt; apt-get update
 #&gt; apt-get install omd
 #&gt; omd cp prod update_test
 #&gt; omd update update_test</pre>

<p>&#160;</p>

<h1>MongoDB</h1>

<p>OMD 0.54 also includes a MongoDB, which is primarily used as log backend for Shinken's livestatus module. (If you activate MongoDB either by using the graphical GUI <strong>omd config</strong> or via command line <strong>omd config set MONGODB on</strong>, the shinken-specific.cfg will automatically contain logstore_mongodb instead of the default logstore_sqlite)</p>

<p><font color="#ff0000">The bad news….we have a bug in the mongodb-init-script</font>.

  <br />You can repair it with the following command:</p>

<pre>mkdir tmp/mongodb
cp etc/mongodb/mongod.cfg tmp/mongodb</pre>

<p>before you start the site.</p>