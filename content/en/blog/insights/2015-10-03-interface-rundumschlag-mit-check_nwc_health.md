---
layout: post
status: published
title: Interface-Rundumschlag mit check_nwc_health
author: Gerhard Laußer
date: 2015-10-03 16:10:25+02:00
categories:
- Nagios
- OMD
tags:
- plugin
- Nagios
- Icinga
- check_nwc_health
- cisco
- juniper
---
Beim Monitoring von Netzwerkinterfaces ist es üblich, daß man vier Services konfiguriert. Jeweils einen für Status (up/down), Bandbreite, Errors und Discards. Gelegentlich gab es auch die Anforderung, das alles in einen einzigen Service zu packen, in dem Fall half dann [check_multi](http://my-plugin.de/wiki/de/projects/check_multi/start). Zwar wurde jeweils auch die Konfigurationsdatei für check_multi mit [coshsh](/docs/coshsh/index.html) generiert, aber je simpler, desto besser, daher habe ich einen neuen Modus *interface-health* eingeführt, so daß [check_nwc_health](/docs/plugins/check_nwc_health/index.html) diese vier Checks selber bündelt.

{% highlight bash %}
$ check_nwc_health --hostname 10.37.6.2 --community kaas \
    --mode interface-health --name FastEthernet0/0
OK - FastEthernet0/0 is up/up, interface FastEthernet0/0 usage is in:0.01% (12041.88Bits/s) out:0.00% (1435.76Bits/s), interface FastEthernet0/0 errors in:0.00/s out:0.00/s , interface FastEthernet0/0 discards in:0.00/s out:0.00/s  | 'FastEthernet0/0_usage_in'=0.01%;80;90;0;100 'FastEthernet0/0_usage_out'=0.00%;80;90;0;100 'FastEthernet0/0_traffic_in'=12041.88;80000000;90000000;0;100000000 'FastEthernet0/0_traffic_out'=1435.76;80000000;90000000;0;100000000 'FastEthernet0/0_errors_in'=0;1;10;; 'FastEthernet0/0_errors_out'=0;1;10;; 'FastEthernet0/0_discards_in'=0;1;10;; 'FastEthernet0/0_discards_out'=0;1;10;;
{% endhighlight %}

