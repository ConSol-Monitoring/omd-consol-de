---
author: Tobias Schneck
author_url: https://twitter.com/toschneck
date: '2017-12-22T17:00:00+02:00'
featured_image: sakuli_logo_small.png
tags:
- sakuli
title: Sakuli v1.1.0 released!
---

<span style="float: right; padding: 1em;" width="40%"><img src="sakuli_logo_small.png" alt=""></span> Just in time before X-Mas holidays starts, we crate a huge release of our [open source end-to-end testing framework Sakuli](http://www.sakuli.org). The [v1.1.0 release](http://consol.github.io/sakuli/v1.1.0/index.html) brings a bunch of new features and a brand new [documentation](http://consol.github.io/sakuli) with. The list of the current changes you will find bellow. Also we created a [Short Overview Presentation](http://consol.github.io/sakuli/latest/files/Sakuli_Short_Overview.pdf) so that you be able to get quick intro about what purpose of Sakuli is.

Also we wan't to say a big **THANK YOU** for the great support of our [contributors](http://consol.github.io/sakuli/latest/index.html#contributors), our [valued supporting companies](http://consol.github.io/sakuli/latest/index.html#supporters) and at least  [ConSol](https://www.consol.de/it-services/testautomatisierung) for making this possible as open source software. Double Thumbs up!!!

<!--more-->

For everybody how doesn't know what's Sakuli is all about, just take a quick look into our overview presentation:

## Sakuli Short Overview Presentation

<div style="margin-right: 1em; margin-bottom: 2em; "><a href="http://consol.github.io/sakuli/latest/files/Sakuli_Short_Overview.pdf" target="_blank" ><img src="Sakuli_Short_Overview.png" alt=""></a></div>

**If you wan't to read more about Sakuli, see our quick links:**

* [Download Sakuli](http://consol.github.io/sakuli/latest/#download)
* [Sakuli Examples](http://consol.github.io/sakuli/latest/#examples)
* [Publications](http://consol.github.io/sakuli/latest/#publications)
* [Events](http://consol.github.io/sakuli/latest/#events)
* [Media](http://consol.github.io/sakuli/latest/#media)
* [Change Log](http://consol.github.io/sakuli/latest/#changelog)
* [Support](http://consol.github.io/sakuli/latest/#support)

## [Changes in Version 1.1.0](http://consol.github.io/sakuli/v1.1.0/index.html)



-   Add methods to read environment variables and property values ([#251](https://github.com/ConSol/sakuli/issues/251)):

    -   [Environment.getEnv(key)](http://consol.github.io/sakuli/v1.1.0/#Environment.getEnv)

    -   [Environment.getProperty(key)](http://consol.github.io/sakuli/v1.1.0/#Environment.getProperty)

-   Improve error message if AES algorithm is not possible due to missing Java Cryptography Extension ([#277](https://github.com/ConSol/sakuli/issues/277), [Invalid Key Exception in AES](http://consol.github.io/sakuli/v1.1.0/#invalid-key-exception-aes-cryptography))

-   Fix [Application.open()](http://consol.github.io/sakuli/v1.1.0/#Application.open): won’t fail if application could not started and improve error message ([#264](https://github.com/ConSol/sakuli/issues/264))

-   [Docker Images](http://consol.github.io/sakuli/v1.1.0/#docker-images):

    -   Fix calculation of `JVM_HEAP_XMX` with to high count of cgroup memory limit in bytes ([#280](https://github.com/ConSol/sakuli/issues/280))

    -   Add default JVM options `-XX:+UseCGroupMemoryLimitForHeap` for optimized jvm runtime in Docker ([#291](https://github.com/ConSol/sakuli/issues/291))

    -   Use version [`1.2.2`](https://github.com/ConSol/docker-headless-vnc-container/releases/tag/1.2.2) of Docker headless VNC image due to hanging vnc handshake if container is offline ([ConSol/docker-headless-vnc-container #50](https://github.com/ConSol/docker-headless-vnc-container/issues/50))

    -   Optimize memory usage of Firefox and Chrome ([#276](https://github.com/ConSol/sakuli/issues/276))

    -   Use [Scrot](https://en.wikipedia.org/wiki/Scrot) as screenshot tool footprint ([#250](https://github.com/ConSol/sakuli/issues/250))

    -   Add missing lsb-release package to Ubuntu image

-   [Kubernetes](http://consol.github.io/sakuli/v1.1.0/#kubernetes) and [OpenShift](http://consol.github.io/sakuli/v1.1.0/#openshift) Support ([#258](https://github.com/ConSol/sakuli/issues/258)):

    -   Update [Templates](https://github.com/ConSol/sakuli/blob/dev/docker) with latest optimizations

    -   Add `KUBERNETES_RUN_MODE` environment variable to have better [Job Config](http://consol.github.io/sakuli/v1.1.0/#kubernetes-job-config) support

-   Fix drag and drop won’t work on every native desktop ([#292](https://github.com/ConSol/sakuli/issues/292))

-   Revert ([#276](https://github.com/ConSol/sakuli/issues/276) "use private mode of firefox for tests" due to the fact that the SSL certificate handling is worse in this mode ([#285](https://github.com/ConSol/sakuli/issues/285))

-   Use PNG as default error screenshot format to improve default compression and make it usable for images in test cases
    ([#174](https://github.com/ConSol/sakuli/issues/174))

-   Increase details of error output at availability check in Linux Util, to show if used tools like `wmctrl` is missing ([#266](https://github.com/ConSol/sakuli/issues/266), [RaiMan/SikuliX-2014 #279](https://github.com/RaiMan/SikuliX-2014/pull/279))

-   Fix method `Region.takeScreenshot(filename)`, `Environment.takeScreenshot(filename)` to save the screenshot on a fixed path without timestamp and add method `Region.takeScreenshotWithTimestamp(filenamePostfix, optFolderPath, optFormat)`, `Environment.takeScreenshotWithTimestamp(filenamePostfix, optFolderPath, optFormat)` ([#263](https://github.com/ConSol/sakuli/issues/263))

-   Add [Encryption Mode `environment`](http://consol.github.io/sakuli/v1.1.0/#encryption-environment) Cipher with masterkey setup as default ([#197](https://github.com/ConSol/sakuli/issues/197))

-   Add environment variable `SAKULI_ROOT` to Windows / Linux installer ([#191](https://github.com/ConSol/sakuli/issues/191))

-   Add automatic parsing from dashed environment vars, see [Property loading mechanism](http://consol.github.io/sakuli/v1.1.0/#property-loading-mechanism) ([#238](https://github.com/ConSol/sakuli/issues/238))

-   Add Mac compatible `sakuli` binary to installer ([#298](https://github.com/ConSol/sakuli/issues/298), [ConSol/sakuli-go-wrapper #4](https://github.com/ConSol/sakuli-go-wrapper/issues/4))

-   Update Sakuli Examples:

    -   Add [Sakuli Tutorial - Docker based E2E application monitoring](https://github.com/ConSol/sakuli-examples/blob/master/docker-xfce-omd/README.adoc)

    -   Update [first steps tutorial](https://github.com/ConSol/sakuli-examples/blob/master/first-steps/first-steps.md)

    -   Add `example_icewm` for icewm docker containers ([#241](https://github.com/ConSol/sakuli/issues/241))

    -   Add validation of Sahi logo to `example_icewm`, `example_xfce` docker containers

    -   Update `example_windows8`

-   Update Documentation:

    -   Update [README](https://github.com/ConSol/sakuli/blob/dev/README.adoc) page and change documentation to github-pages/ascii-doc setup, new official Documentation: [http://consol.github.io/sakuli](http://consol.github.io/sakuli) ([#243](https://github.com/ConSol/sakuli/issues/243))

    -   Provide the latest documentation link ([#283](https://github.com/ConSol/sakuli/issues/283)): [http://consol.github.io/sakuli/latest](http://consol.github.io/sakuli/latest)

    -   How to use [Sahi and webpack-dev-server](http://consol.github.io/sakuli/v1.1.0/#sahi-webpack-dev-server) ([#295](https://github.com/ConSol/sakuli/issues/295))
    
    -   How to fix [chromium crashes with high VNC resolution](http://consol.github.io/sakuli/v1.1.0/#docker-images-known-issues-chromium-crash) ([ConSol/docker-headless-vnc-container #53](https://github.com/ConSol/docker-headless-vnc-container/issues/53))

    -   Add [usage of OpenJDK in case of `InvalidKeyException`](http://consol.github.io/sakuli/v1.1.0/#invalid-key-exception-aes-cryptography) to gearman encryption documentation ([#91](https://github.com/ConSol/sakuli/issues/91))

    -   Add documentation for [automatically importing firefox ssl certificates in docker](http://consol.github.io/sakuli/v1.1.0/#docker-https-sahi) ([#285](https://github.com/ConSol/sakuli/issues/285))

    -   Improve documentation of [Property loading mechanism](http://consol.github.io/sakuli/v1.1.0/#property-loading-mechanism): add "Property References" to documentation ([#261](https://github.com/ConSol/sakuli/issues/261))

    -   Update [Events](http://consol.github.io/sakuli/v1.1.0/#events) and [Publications](http://consol.github.io/sakuli/v1.1.0/#publications)

    -   Add [Sakuli Short Overview Presentation](http://consol.github.io/sakuli/v1.1.0/files/Sakuli_Short_Overview.pdf)

-   [OMD Monitoring Integration](http://consol.github.io/sakuli/v1.1.0/#omd-gearman):

    -   Fixed [screenshot event handler](http://consol.github.io/sakuli/v1.1.0/#screenshot_history) parameter ([#294](https://github.com/ConSol/sakuli/issues/294))

    -   Add Sakuli setup for different [OMD setups](http://consol.github.io/sakuli/v1.1.0/#monitoring-integration) with make/Ansible ([#257](https://github.com/ConSol/sakuli/issues/257))

    -   Replaced all "demo" occurrences with placeholder and modify Ansible template ([#293](https://github.com/ConSol/sakuli/issues/293))

    -   Removed Grafana template; distributed by Histou project [Griesbacher/histou](https://github.com/Griesbacher/histou)

    -   Thruk SSI: Add png/jpg support ([#208](https://github.com/ConSol/sakuli/issues/208))

    -   Fix linefeed problem under windows for [Check_MK](http://consol.github.io/sakuli/v1.1.0/#check_mk) template engine ([#176](https://github.com/ConSol/sakuli/issues/176))

    -   Moved OMD setup Ansible playbooks into separate folder [omd](https://github.com/ConSol/sakuli/blob/dev/src/common/src/main/resources/org/sakuli/common/setup/omd)

    -   Documentation: [Gearman forwarder](http://consol.github.io/sakuli/v1.1.0/#omd-gearman), [OMD Docker image](http://consol.github.io/sakuli/v1.1.0/#omd-docker), [Gearman proxy (optional)](http://consol.github.io/sakuli/v1.1.0/#gearman_proxy), [Screenshot history](http://consol.github.io/sakuli/v1.1.0/#screenshot_history), [Grafana graphs](http://consol.github.io/sakuli/v1.1.0/#grafana_graphs), [Check_MK](http://consol.github.io/sakuli/v1.1.0/#check_mk).


## Release history
See [GitHub: ConSol/sakuli/releases](https://github.com/ConSol/sakuli/releases/)

## Download

[Download latest Version](http://consol.github.io/sakuli/latest/index.html#download)