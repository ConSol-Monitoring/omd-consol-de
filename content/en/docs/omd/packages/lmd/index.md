---
title: LMD - Livestatus Multitool Daemon
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
### Overview

|||
|---|---|
|Homepage:|https://github.com/sni/lmd/|
|Changelog:|https://github.com/sni/lmd/blob/master/Changes|
|Documentation:|https://github.com/sni/lmd/|
|Get version:|lmd -version|

LMD fetches Livestatus data from one or multiple Livestatus sources and provides itself an aggregated Livestatus API. This makes the Thruk Gui faster, especcially when having many (remote) backends, because LMD caches the data locally and can directly respond to all Livestatus queries.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/thruk/lmd.ini|
|Logfiles:|&lt;site&gt;/tmp/thruk/lmd/lmd.log|

&#x205F;
### Enable LMD

1. Uncomment `use_lmd_core=1` in `etc/thruk/thruk_local.d/lmd.conf`.

2. Restart Thruk via `omd restart apache`

3. check with `ps` or `omd status lmd` if there is a lmd process running (You may have to open Thruk in your browser first).

<p class="hint">
Backends are configured automatically by Thruk. You don't have to put them in the lmd.ini. It simply works out of the box.
</p>