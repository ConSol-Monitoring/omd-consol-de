---
author: Simon Hofmann
author_url: https://twitter.com/s1hofmann
date: '2018-07-04T17:00:00+02:00'
featured_image: sakuli_logo_small.png
tags:
- sakuli
title: Sakuli v1.2.0 released!
---

<span style="float: right; padding: 1em;" width="40%"><img src="sakuli_logo_small.png" alt=""></span> It's about time for a new [Sakuli](http://www.sakuli.org) release! Our latest release [v1.2.0](http://consol.github.io/sakuli/v1.2.0/index.html) is the first version to include a beta of Sakuli-UI, a web UI to help you develop and manage your tests. 

The new release also brings a bunch of enhancements and bug-fixes, a detailed changelog is included in this post.

Once again, we want to say **THANK YOU** for the great support of our [contributors](http://consol.github.io/sakuli/latest/index.html#contributors), our [valued supporting companies](http://consol.github.io/sakuli/latest/index.html#supporters) and of course [ConSol](https://www.consol.de/it-services/testautomatisierung)!

<!--more-->

## Introducing Sakuli UI

<iframe type="opt-in" data-name="youtube" width="560" height="315" data-src="https://www.youtube.com/embed/5RJY_FD6YvQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<p><a href="https://www.youtube.com/watch?v=5RJY_FD6YvQ" target="_blank">https://www.youtube.com/watch?v=5RJY_FD6YvQ</a></p>

**If you want to learn more about Sakuli, see our quick links:**

* [Download Sakuli](http://consol.github.io/sakuli/latest/#download)
* [Sakuli Examples](http://consol.github.io/sakuli/latest/#examples)
* [Publications](http://consol.github.io/sakuli/latest/#publications)
* [Events](http://consol.github.io/sakuli/latest/#events)
* [Media](http://consol.github.io/sakuli/latest/#media)
* [Change Log](http://consol.github.io/sakuli/latest/#changelog)
* [Support](http://consol.github.io/sakuli/latest/#support)

## [Changes in Version 1.2.0](http://consol.github.io/sakuli/v1.2.0/index.html)


    -   CLI option to start [Sakuli UI](http://consol.github.io/sakuli/v1.2.0/index.html#sakuli-ui) ([\#308](https://github.com/ConSol/sakuli/issues/308))

-   Add support to [forward step and case results](http://consol.github.io/sakuli/v1.2.0/index.html#forwarder-step-case) ([\#304](https://github.com/ConSol/sakuli/issues/304))

-   Change Gearman forwarder to use [twig-based templates](http://consol.github.io/sakuli/v1.2.0/index.html#forwarder-templates) ([\#310](https://github.com/ConSol/sakuli/issues/310))

-   Fix OMD event handler only firing on status changes ([\#322](https://github.com/ConSol/sakuli/issues/322))

-   Fix hanging execution on older Internet Explorer versions ([\#315](https://github.com/ConSol/sakuli/issues/315))

-   Harmonize CLI starter and Java starter options ([\#309](https://github.com/ConSol/sakuli/issues/309))

-   Fix Sahi proxy: Prevent [removal of authorization headers](http://consol.github.io/sakuli/v1.2.0/index.html#sahi-authorization-headers) (e.g. Bearer Token) ([\#306](https://github.com/ConSol/sakuli/issues/306))

-   [JSON file output forwarder](http://consol.github.io/sakuli/v1.2.0/index.html#json-forwarder) ([\#274](https://github.com/ConSol/sakuli/issues/274))

-   Fix `takeScreenshot` not overwriting existing error screenshot on Windows ([\#303](https://github.com/ConSol/sakuli/issues/303))

    -   [Environment.takeScreenshot](http://consol.github.io/sakuli/v1.2.0/index.html#Environment.takeScreenshot)

    -   [Region.takeScreenshot](http://consol.github.io/sakuli/v1.2.0/index.html#Region.takeScreenshot)

-   [Docker images](http://consol.github.io/sakuli/v1.2.0/index.html#docker-images):

    -   Added Sakuli UI to Docker images ([\#308](https://github.com/ConSol/sakuli/issues/308))

    -   Changed default user to 1000 ([\#307](https://github.com/ConSol/sakuli/issues/307))

## Release history
See [GitHub: ConSol/sakuli/releases](https://github.com/ConSol/sakuli/releases/)

## Download

[Download latest Version](http://consol.github.io/sakuli/latest/index.html#download)