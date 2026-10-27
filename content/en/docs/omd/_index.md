---
title: OMD
description: "A complete monitoring platform combining tools from the Nagios and Prometheus ecosystems."
linkTitle: OMD
weight: 100
---

<div class="mb-4">
  <img class="project-logo-light project-logo--omd" src="/docs/omd/omd_light.svg" alt="OMD Labs Edition" width="180" height="180">
  <img class="project-logo-dark project-logo--omd" src="/docs/omd/omd_dark.svg" alt="OMD Labs Edition" width="180" height="180">
</div>

**OMD Labs-Edition** brings monitoring cores, web interfaces, graphing tools, and plugins together in one RPM or DEB package. It integrates into your existing Linux system and provides a consistent way to install, run, and update your monitoring environment.

## Why OMD?

- **An integrated toolkit.** Combine Nagios-compatible monitoring with tools from the Prometheus ecosystem. [Naemon](../naemon/) is the default monitoring core; the [package catalogue](packages/) describes the included components.
- **Independent monitoring sites.** Run multiple instances on one server, including sites using different OMD versions. Each site has its own user, configuration, and data, and can be managed independently.
- **A consistent lifecycle.** Use the same site management workflow to create, start, stop, back up, and update your monitoring instances.

For a comparison with the original OMD distribution, see [Differences to OMD](differences/).

## Get started {#installation}

<span id="download"></span>

1. **Install OMD.** Open the [stable repository](/repo/stable/), choose your operating system, and follow its package installation instructions.
2. **Create your first site.** Follow [Getting Started](getting_started/) to create a site, start its components, and open the web interface.
3. **Configure your monitoring.** Explore the [included packages](packages/) and [how-to guides](howtos/) to connect the components you need.

## Release roadmap

Stable releases usually arrive every six months. Between releases, nightly builds make recent changes available for testing. Upcoming releases mainly update the bundled components; no major changes to OMD itself are currently planned.

<div class="omd-roadmap" role="group" aria-label="OMD release roadmap">
  <article class="omd-roadmap__card omd-roadmap__card--stable">
    <p class="omd-roadmap__label"><span class="omd-roadmap__dot" aria-hidden="true"></span>Stable release</p>
    <h3>5.80</h3>
    <p>The stable release channel for your monitoring installation.</p>
    <a href="/repo/stable/">Install stable <span aria-hidden="true">&rarr;</span></a>
  </article>
  <article class="omd-roadmap__card">
    <p class="omd-roadmap__label"><span class="omd-roadmap__dot" aria-hidden="true"></span>Nightly builds</p>
    <h3>Latest changes</h3>
    <p>Built overnight when new commits are available. Try component updates before the next stable release.</p>
    <a href="/repo/testing/">Explore testing packages <span aria-hidden="true">&rarr;</span></a>
  </article>
  <article class="omd-roadmap__card">
    <p class="omd-roadmap__label"><span class="omd-roadmap__dot" aria-hidden="true"></span>Next release &middot; planned</p>
    <h3>April 2027</h3>
    <p>The next planned stable release, focused on updates to the included monitoring components.</p>
    <a href="https://github.com/ConSol-Monitoring/omd/blob/labs/Changelog">Follow development <span aria-hidden="true">&rarr;</span></a>
  </article>
</div>

## Explore the documentation

Find site administration references, upgrade guides, and component documentation below.
