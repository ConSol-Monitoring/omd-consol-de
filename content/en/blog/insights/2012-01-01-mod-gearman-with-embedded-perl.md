---
author: Sven Nierlein
date: '2012-01-01T15:48:42+00:00'
slug: mod-gearman-with-embedded-perl
tags:
- Mod-Gearman
title: Mod-Gearman with Embedded Perl
---

The upcoming version 1.1.2 of Mod-Gearman will have embedded Perl support which greatly improves performance when you have lots of Perl checks.

<!--more-->

Mod-Gearman will get three new configuration options:

<ul>
	<li>enable_embedded_perl</li>
	<li>use_embedded_perl_implicitly</li>
	<li>use_perl_cache</li>
</ul>



The first two well known from the nagios.cfg and the last one was a compile time option in nagios
and moved to a configuration option in Mod-Gearman.

Please feel free to test
<a href="http://mod-gearman.org/archive/mod_gearman-1.1.2b2.tar.gz" title="mod_gearman-1.1.2b2.tar.gz">the preview version</a>.

You will have to compile Mod-Gearman with "./configure --enable-embedded-perl" to
build in embedded perl support.

Please let me know if you find anything unusual.

Thanks,
 Sven