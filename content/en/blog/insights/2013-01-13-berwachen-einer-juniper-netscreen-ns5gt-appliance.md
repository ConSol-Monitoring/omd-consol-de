---
author: Gerhard Laußer
date: '2013-01-13T01:34:35+00:00'
slug: berwachen-einer-juniper-netscreen-ns5gt-appliance
title: Überwachen einer Juniper NetScreen NS5GT Appliance
---

<p>Zu Hause habe ich eine Firewall/VPN-Appliance NS5GT stehen, die bisher noch nicht überwacht wurde. <i>Schlag den Raab</i>, <i>Deutschland sucht den Superstar</i>, <i>Navy CIS</i> und <i>Andrea Berg – Die 20 Jahre Show</i> waren der Grund dafür, dass sich das jetzt ändert. Aus Langeweile habe ich CPU- und Memory-Monitoring für die NS5GT implementiert. Das Plugin check_nwc_health ist also wieder um ein Feature reicher.</p><!--more--><p>so ruft man es auf, um CPU und Memory zu prüfen:</p>  <pre><tt>$ check_nwc_health --hostname 192.168.1.8 --community 1%c/go3k --mode cpu-usage
OK - cpu usage is 1.00% | 'cpu_usage'=1%;50;90</tt></pre>

<pre><tt>$ check_nwc_health --hostname 192.168.1.8 --community 1%c/go3k --mode memory-usage
OK - memory usage is 24.97% | 'memory_usage'=24.97%;80;90</tt></pre>

<p>Interfaces kann man auch überwachen. Das ging schon lange, da hier die IF-MIB abgefragt wurde, die i.d.R. jedes netzwerkfähige Gerät implementiert hat.</p>

<pre><tt>$ check_nwc_health --hostname 192.168.1.8 --community 1%c/go3k --mode interface-usage
OK - interface trust usage is in:0.12% (123773.14Bits/s) out:0.12% (119180.00Bits/s), interface untrust usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface serial usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface vlan1 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s) | 'trust_usage_in'=0.12%;80;90 'trust_usage_out'=0.12%;80;90 'trust_traffic_in'=123773.14 'trust_traffic_out'=119180 'untrust_usage_in'=0%;80;90 'untrust_usage_out'=0%;80;90 'untrust_traffic_in'=0 'untrust_traffic_out'=0 'serial_usage_in'=0%;80;90 'serial_usage_out'=0%;80;90 'serial_traffic_in'=0 'serial_traffic_out'=0 'vlan1_usage_in'=0%;80;90 'vlan1_usage_out'=0%;80;90 'vlan1_traffic_in'=0 'vlan1_traffic_out'=0</tt></pre>

<p>Wenn das zu viel ist, kann man die Ausgabe auch eingrenzen. Es ist ja auch nicht jedes Interface interessant bzw. in Betrieb.
  <br />Erst schaut man, welche Interfaces es überhaupt gibt:</p>

<pre><tt>$ check_nwc_health --hostname 192.168.1.8 --community 1%c/go3k --mode list-interfaces
000001 trust
000002 untrust
000003 serial
000004 vlan1
OK</tt></pre>

<p>…und dann pickt man eines heraus. So kann man für jedes wichtige Interface einen eigenen Service einrichten.</p>

<pre><tt>$ check_nwc_health --hostname 192.168.1.8 --community 1%c/go3k --mode interface-usage --name trust
OK - interface trust usage is in:0.18% (176885.33Bits/s) out:0.19% (186919.11Bits/s) | 'trust_usage_in'=0.18%;80;90 'trust_usage_out'=0.19%;80;90 'trust_traffic_in'=176885.33 'trust_traffic_out'=186919.11</tt></pre>

<p>check_nwc_health schreibt übrigens die Interface-Namen und die entsprechenden Indices in der IFMIB::ifTable in ein Cache-File. So kann es bei einem Aufruf mit --name ganz gezielt nur die relevanten Zeilen der ifTable abfragen, was Netzwerktraffic spart und den Prozessor des Netzwerkgerätes schont.</p>