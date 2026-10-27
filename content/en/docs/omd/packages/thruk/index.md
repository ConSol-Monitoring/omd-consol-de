---
title: Thruk
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
<span class="project-logo project-logo--thruk"><img class="project-logo-light" src="/docs/thruk/thruk_dark.svg" alt="Thruk" width="200" height="85"><img class="project-logo-dark" src="/docs/thruk/thruk_light.svg" alt="Thruk" width="200" height="85"></span>

### Overview

|||
|---|---|
|Homepage:|https://thruk.org|
|Changelog:|https://thruk.org/changelog.html|
|Documentation:|https://thruk.org/documentation/|
|Get version:|Version is displayed at WUI or type &quot;thruk --version&quot; on CLI|
|OMD URL:|/&lt;site&gt;/thruk|

Thruk is a monitoring web interface that supports multiple backends, including Naemon, Nagios, Icinga and Shinken, through the Livestatus API. It is designed to be a drop-in replacement and covers almost 100% of the original features, with additional enhancements for large installations and improved usability.

&#x205F;
### Directory Layout

|||
|---|---|
|Config Directory:|&lt;site&gt;/etc/thruk|
|Logfiles:|&lt;site&gt;/var/log/thruk|
|Business processes:|&lt;site&gt;/var/thruk/bp|
|Customizing files:|&lt;site&gt;/etc/thruk/usercontent|

&#x205F;
### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
|  DEFAULT_GUI | welcome <br> **thruk** <br> nagios <br> icinga <br> none | Default GUI on startup |
|  THRUK_COOKIE_AUTH  |  **on** <br> off  | Enables cookie auth feature for Thruk ("Logout" Button is displayed) |


### Kerberos SSO Integration
While Kerberos authentication has always been supported, starting with OMD 3 it can be combined
with cookie authentication features, such as API keys.

See [Kerberos Integration](../../howtos/kerberos/) for details.
