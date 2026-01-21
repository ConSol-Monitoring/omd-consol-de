---
author: Fabian Stäber
date: '2013-12-20T15:21:20+00:00'
slug: first-consol-fedex-day
title: First ConSol FedEx Day
---

For most employees at ConSol, today is the last day before their Christmas vacation. Eight of us took that opportunity and organized our first <a href="https://www.scrum.org/Portals/0/Documents/Community%20Work/Scrum.org-Whitepaper_FedEx%20Day%20-%20Lighting%20Corporate%20Passion.pdf">FedEx day</a>:
During the full day event, we formed small teams and worked on innovative projects we are enthusiastic about.
At the end of the day, we had small presentations showing the results to the company.

In this blog post we'd like to share the projects we came up with:

<h2>Infinispan Cluster on Raspberry Pis</h2>
There seem to be a lot of interest in building <a href="http://www.raspberrypi.org">Raspberry Pi</a> clusters for
<a href="https://confluence.consol.de/download/thumbnails/9602665/@bitboss.jpg?version=1&modificationDate=1386445041000&api=v2">demo</a>
<a href="http://venturebeat.files.wordpress.com/2013/09/2013-09-19-07-36-39.jpg?w=536">projects</a>.
One of the teams took the chance and built our own, with five Pis running an <a href="http://infinispan.org">Infinispan</a> distributed cache.
It turns out that having a real hardware cluster yields different results than testing Infinispan locally.
While clean shutdowns and startups are no problem, unplugging and plugging network cables is a much greater challange to the Infinispan infrastructure.
The Raspberry Pi hardware is sufficient to run embedded Infinispan instances, the JBoss based distributions don't seem to fit well with the hardware.

<h2>Kiosk systems based on Raspberry Pis</h2>

The <a href="http://raspberrypi.org">Raspberry Pi</a> and a large screen is all that is needed for building an information kiosk.
One of the teams built a kiosk for our entrance hall, showing the current event schedule for our meeting rooms.
Access to the event database was implemented as a <a href="http://spring.io">Spring</a> application, on the front-end side
HTML5 and JavaScript magic was used to visualize the data.

<h2>Evaluating the Ceylon Programming Language</h2>

<a href="http://www.ceylon-lang.org">Ceylon</a> 1.0.0 was released recently, and one of the teams took the chance to make some first experiences with the new programming language.
Ceylon runs on the JVM, and can also be compiled to JavaScript. It comes with an <a href="http://www.eclipse.org">Eclipse</a>-based IDE, which is, however, not very easy to run.
The strong type system enables a lot of tool support, but sometimes also results in errors  that are hard to understand for the novice.

<h2>Video Recordings for the ConSol Academy</h2>

The ConSol academy is a company event where employees share their knowledge with their peers. One team used the FedEx day to build
a prototypical hardware for recording academy talks on video, to archive the talks for colleagues who cannot participate.
As most other project, the video recording hardware was also based on the <a href="http://www.raspberrypi.org">Raspberry Pi</a>.
The Pi was equipped with a small camera and a microphone, and streams the data over the network for recording.

<h2>Summary</h2>

The <a href="http://www.raspberrypi.org">Raspberry Pi</a> is currently the most popular <a href="http://en.wikipedia.org/wiki/Internet_of_Things">thing</a>
among our developers. It is easy to set up, and provides an open platform for a wide range of projects.
The FedEx day was a great opportunity to experiment with that, and it is also a good way to get together with colleagues who work in other projects.