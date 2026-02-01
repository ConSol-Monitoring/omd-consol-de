---
author: Tobias Schneck
author_url: https://twitter.com/toschneck
date: '2018-04-03T17:00:00+02:00'
featured_image: ./vnc_container_view.png
meta_description: New Release of Docker images with headless VNC environments for
  Ubuntu, Centos. Provides Docker, Openshift, Kubernetes, Continuous Integration.
  Testautomation.
tags:
- docker
title: Docker Headless VNC Container 1.3.0 Released
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em; width: 30%;"><img src="./vnc_container_view.png"></div>

[__Docker Headless VNC Container__](https://github.com/ConSol/docker-headless-vnc-container) 1.3.0 has been released today. The different Docker images contains a complete VNC based, headless UI environment for testautomation like [Sakuli](https://github.com/ConSol/sakuli) does or simply for web browsing and temporary work in a throw-away UI container. The functionality is pretty near to a VM based image, but can be started in seconds instead of minutes. Each Docker image has therefore installed the following components:

<!--more-->

* Desktop environment [**Xfce4**](http://www.xfce.org) or [**IceWM**](http://www.icewm.org/)
* VNC-Server (default VNC port `5901`)
* [**noVNC**](https://github.com/kanaka/noVNC) - HTML5 VNC client (default http port `6901`)
* Browsers:
  * Mozilla Firefox
  * Chromium

For more information about the usage take a look at [github.com/ConSol/docker-headless-vnc-container](https://github.com/ConSol/docker-headless-vnc-container).

### [Updates for Version 1.3.0](https://github.com/ConSol/docker-headless-vnc-container/releases/tag/1.3.0)

* change default USER to `1000` ([#61](https://github.com/ConSol/docker-headless-vnc-container/issues/61))
* refactor vnc startup script ([#73](https://github.com/ConSol/docker-headless-vnc-container/issues/73))
  * add help option `--help`
  * ensure correct forwarding of shutdown signals
  * add "DEBUG" mode and move all log output to this mode
  * update README.md
* merge pull request from:
  * [hsiaoyi0504](https://github.com/hsiaoyi0504) update noVNC to [v1.0.0](https://github.com/novnc/noVNC/releases/tag/v1.0.0) ([#66](https://github.com/ConSol/docker-headless-vnc-container/pull/66))
* add example for [Kubernetes usage](https://github.com/ConSol/docker-headless-vnc-container/blob/master/kubernetes/README.md) ([#71](https://github.com/ConSol/docker-headless-vnc-container/issues/71)) 
* remove verbose output by default from `set_user_permissions.sh` script