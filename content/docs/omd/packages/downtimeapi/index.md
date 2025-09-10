---
title: Downtime API
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
|OMD default:|disabled|

Hosts can be put in downtime by sending a simple HTTP-GET-request. It bypasses the Thruk login page and implements it's own security mechanism. It's mainly used by shutdown scripts which automatically set a downtime.

&#x205F;
### Directory Layout


&#x205F;

### Enabling the API

The downtime API is available since version 2.40. To enable this feature, execute the following step:

omd config set DOWNTIMEAPI on

### Sending requests

Let's say we have an OMD site *bigdata* running on server *eudc-mon-p001*. One of the monitored hosts has a configuration like this:

define host {
  host_name   ceph-008-mun
  address     10.129.3.44
  ...

Now we want to put it in downtime for an hour. This is as simple as:
curl -k -L "https://eudc-mon-p001/bigdata/api/downtime?host=ceph-008-mun&comment=maintenance&duration=60"

Of course this only works if this curl-command was executed on the host ceph-008-mun. The downtime API compares the originating IP address of the HTTP-request with the address-field of the host to be put in downtime. (Some people put a dns-resolvable hostname as address in the host definition. In this case the downtime-script tries to resolve the hostname and compares the originating IP address with the address(es) returned by the DNS server)

If you want to set downtimes without logging into the host in question, you can use a (secret) token.
define host {
  host_name   ceph-008-mun
  address     10.129.3.44
  _DTAUTHTOKEN   supersecret234abc
  ...

By adding the *dtauthtoken* parameter to the URL, you can now execute the curl command wherever you want, for example on your central admin machine.
curl -k -L "https://eudc-mon-p001/bigdata/api/downtime?host=ceph-008-mun&comment=maintenance&duration=60&dtauthtoken=supersecret234abc"

The known parameters are:

* host
  The name of the host to be put in a downtime. Be careful, this might not work with the local hostname. It must be equal to the host_name attribute of a nagios object definition.
  Internally, the downtime API communicates with Thruk. If there are multiple backends there may also be more than one Nagios host with this name. All of them will receive a downtime-command.
* hostgroup (alternative to host)
  Instead of just a single host you can put a whole hostgroup in a downtime. You must use authtokens in this case, as address comparison makes no sense here.
* comment
  Whatever you want to see as a comment when you later look at the list of active downtimes. Be careful with special characters, you have to urlencode them.
* duration
  The number of minutes the host should be in downtime.
* dtauthtoken
  A secret token which must exist as a custom host macro named *_DTAUTHTOKEN*. This parameter is optional, it allows you to make an API-call from any location. Without it you can send GET-requests only from the host itself.
* backend
  If Thruk has many backends and you know which one(s) monitor the host in question, you can improve execution times of the API. Without a backend parameter, Thruk first querys all of it's backends looking for occurrences of the host. It can take a few seconds if you have hundreds of backends but usually this is not a problem.

### Debugging

If you want to know what happens behind the scenes, you can make downtime script write some trace logs into the json output simply by creating a file with
touch $OMD_ROOT/tmp/run/downtimeapi.trace
As long as this file exists, you will get the additional information.
