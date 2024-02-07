---
title: Thruk
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](thruk.png)
### Overview

|||
|---|---|
|Homepage:|http://thruk.org|
|Changelog:|http://thruk.org/changelog.html|
|Documentation:|http://thruk.org/documentation/|
|Get version:|Version is displayed at WUI or type &quot;thruk --version&quot; on CLI|
|OMD URL:|/&lt;site&gt;/thruk|

Thruk is a multibackend monitoring webinterface which currently supports Naemon, Nagios, Icinga and Shinken as backend using the Livestatus API. It is designed to be a 'dropin' replacement and covers almost 100% of the original features plus adds additional enhancements for large installations and increased usability.

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
While it was always possible to use Kerberos Authentication, starting with OMD 3 kerberos can be mixed
with cookie authentication features, ex. api keys.

See [Kerberos Integration](../../howtos/kerberos/) for details.