---
author: Gerhard Laußer
date: '2013-01-08T20:56:58+00:00'
slug: neue-features-fr-check_nwc_health
title: Neue Features für check_nwc_health
---

<p>Seit gestern gibt es die Version 1.7 von check_nwc_health, in die ich die Überwachung von Pools von F5 BIGIP Loadbalancern aufgenommen habe.</p><!--more--><p>Auslöser war, dass bei einem Kunden das bisher verwendete Plugin check_snmp_f5_pool nach einem Firmwareupdate nicht mehr funktionierte. Das äusserte sich so, dass bei einem Pool mit Problemen die ausgefallenen Member nicht mehr angezeigt wurden. </p>  <p>Da bei dieser Installation sowieso die meisten Netzwerkgeräte mit check_nwc_health überwacht werden, bot es sich an, gleich dieses Plugin zu erweitern. Das hat ausserdem den Vorteil, bei der gezielten Abfrage von pools deren Namen als reguläre Ausdrücke angeben zu können. </p>  <pre><tt>$ check_nwc_health --mode pool-completeness --name ftp --regexp --multiline
CRITICAL - pool Pool-Proxy-FTP has 0 active members (of 2)
pool Proxy-FTP has not enough active members (0, min is 1)
member LF12 is down/red (Pool member has been marked down by a monitor)
member LF13 is down/red (Pool member has been marked down by a monitor), pool Pool-Proxy-FTPS has 2 active members (of 2)
pool Pool-Intra-FTP has 2 active members (of 2) | 'pool_Pool-Proxy-FTPS_completeness'=100%;51:;26: 'pool_Pool-Intra-FTP_completeness'=100%;51:;26: 'pool_Pool-Proxy-FTP_completeness'=0%;51:;26: </tt></pre>

<p>Ohne Angabe von --name (und optional --regexp) werden sämtliche vorhandenen Pools ausgegeben. Und detailliert gehts natürlich auch:</p>

<pre><tt>$ check_nwc_health --mode pool-completeness --name tibco -vv
[POOL_tibco_test09]
ltmPoolName: tibco_test09
ltmPoolLbMode: 0
ltmPoolMinActiveMembers: 0
ltmPoolActiveMemberCnt: 1
ltmPoolMemberCnt: 2
ltmPoolStatusAvailState: green
ltmPoolStatusEnabledState: enabled
ltmPoolStatusDetailReason: The pool is available
[POOL_tibco_test09_MEMBER]
ltmPoolMemberPoolName: tibco_test09
ltmPoolMemberNodeName: ttt12
ltmPoolMemberAddr: 10.13.28.3
ltmPoolMemberPort: 51028
ltmPoolMemberMonitorRule: http_51028
ltmPoolMemberMonitorState: up
ltmPoolMemberMonitorStatus: up
ltmPoolMbrStatusAvailState: green
ltmPoolMbrStatusEnabledState: enabled
ltmPoolMbrStatusDetailReason: Pool member is available
[POOL_tibco_test09_MEMBER]
ltmPoolMemberPoolName: tibco_test09
ltmPoolMemberNodeName: ttt14
ltmPoolMemberAddr: 10.13.28.5
ltmPoolMemberPort: 51028
ltmPoolMemberMonitorRule: http_51028
ltmPoolMemberMonitorState: down
ltmPoolMemberMonitorStatus: down
ltmPoolMbrStatusAvailState: red
ltmPoolMbrStatusEnabledState: enabled
ltmPoolMbrStatusDetailReason: Pool member has been marked down by a monitor
info: pool tibco_test09 is enabled, avail state is green, active members: 1 of 2 </tt></pre>

<p>Für Checkpoint Firewalls gibt's neuerdings auch was:</p>

<pre><tt>$ check_nwc_health&#160; --mode svn-status
OK - status of svn is OK
$ check_nwc_health --mode fw-policy --name COC-Policy
OK - fw policy is COC-Policy
$ check_nwc_health --mode fw-policy --name XXXX
CRITICAL - fw policy is COC-Policy, expected XXXX
</tt></pre>