---
author: Gerhard Laußer
date: '2013-02-17T01:23:58+00:00'
slug: einer-geht-noch-check_nwc_health-und-cisco-5500-series-wireless-controller
tags:
- check_nwc_health
title: Einer geht noch - check_nwc_health und Cisco 5500 Series Wireless Controller
---

<p>Cisco WLC dienen dazu, Access Points zu verwalten und an ein Backbone-Netz anzubinden. Es gibt zwar schon ein paar Plugins, um diese Geräte mit Nagios zu überwachen, aber ich mag es nicht, für jeden Service ein eigenes Plugin installieren zu müssen. Daher hat das Schweizer Taschenmesser check_nwc_health jetzt eine weitere Klinge bekommen.</p><!--more--><p>Zunächst überwacht man die CPU des Geräts:</p>  <pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode cpu-usage
OK - cpu usage is 7.00% | 'cpu_usage'=7%;80;90</tt></pre>

<p>Als zweiten Service empfehle ich, den Speicher zu beobachten:</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode memory-usage
OK - memory usage is 51.21% | 'memory_usage'=51.21%;80;90</tt></pre>

<p>Natürlich ist die Funktion der Hardware sehr wichtig. Man kann die Temperatur abfragen und den Zustand der zwei (wobei evt. nur eine verbaut wurde) Stromversorgungen.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode hardware-health
OK - temperature is 35.00C (commercial env 0-65) | 'temperature'=35;0:65;0:65</tt></pre>

<p>Mit &quot;-v&quot; geht es auch ausführlicher:</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode hardware-health -vv
I am a Cisco Controller
[TEMPERATURE]
temp_environment: commercial
temp_value: 35
temp_alarm_low: 0
temp_alarm_high: 65
[PS1]
ps1_present: true
ps1_operational: true
[PS2]
ps2_present: false
ps2_operational: false
info: temperature is 35.00C (commercial env 0-65), PS1 is present and operational, PS2 is not present and not operational

OK - temperature is 35.00C (commercial env 0-65)
temperature is 35.00C (commercial env 0-65), PS1 is present and operational, PS2
 is not present and not operational | 'temperature'=35;0:65;0:65</tt></pre>

<p>Da ein WLC5500 auch ein Switch ist, hat er natürlich Interfaces:</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode list-interfaces
000001 Unit: 0 Slot: 0 Port: 1 Gigabit - Level 0x6070001
000002 Unit: 0 Slot: 0 Port: 2 Gigabit - Level 0x6070001
000003 Unit: 0 Slot: 0 Port: 3 Gigabit - Level 0x6070001
000004 Unit: 0 Slot: 0 Port: 4 Gigabit - Level 0x6070001
000005 Unit: 0 Slot: 0 Port: 5 Gigabit - Level 0x6070001
000006 Unit: 0 Slot: 0 Port: 6 Gigabit - Level 0x6070001
000007 Unit: 0 Slot: 0 Port: 7 Gigabit - Level 0x6070001
000008 Unit: 0 Slot: 0 Port: 8 Gigabit - Level 0x6070001
000009 Virtual Interface
OK</tt></pre>

<p>“Kernkompetenz” von check_nwc_health ist die Überwachung der Bandbreite von Interfaces:</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode interface-usage
OK - interface Unit: 0 Slot: 0 Port: 1 Gigabit - Level 0x6070001 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 2 Gigabit - Level 0x6070001 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 3 Gigabit - Level 0x6070001 usage is in:0.00% (0.00Bi
ts/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 4 Gigabit - Level0x6070001 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 5 Gigabit - Level 0x6070001 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 6 Gigabit - Level 0x6070001
usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 7 Gigabit - Level 0x6070001 usage is in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s), interface Unit: 0 Slot: 0 Port: 8 Gigabit - Level 0x6070001 usage .....
s in:0.00% (0.00Bits/s) out:0.00% (0.00Bits/s) | 'Unit: 0 Slot: 0 Port: 1 Gigabit - Level 0x6070001_usage_in'=0%;80;90 'Unit: 0 Slot: 0 Port: 1 Gigabit - Level0x6070001_usage_out'=0%;80;90 'Unit: 0 Slot: 0 Port: 1 Gigabit - Level 0x6070001_traffic_in'=0 'Unit: 0 Slot: 0 Port: 1 Gigabit - Level 0x6070001_traffic_out'=0...
</tt></pre>

<p>Jetzt zum WLan-Teil. Wenn man eine feste Anzahl von Access Points an einem WLC betreibt, kann man diese Zahl überwachen. Mit --<em>warning</em> und –<em>critical</em> legt man Intervalle fest, innerhalb derer sie sich bewegen muss. </p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode count-accesspoints
OK - found 22 access points | 'num_aps'=22;10:;5:</tt></pre>

<p>Auch hier kann man mit &quot;-v&quot; viele Einzelheiten ausgeben lassen</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode count-accesspoints -vv
I am a Cisco Controller
[ACCESSPOINT_WL-AP-10]
bsnAPName: WL-AP-10
bsnAPLocation: Halle 2
bsnAPModel: AIR-LAP1242AG-E-K8
bsnApIpAddress: 172.24.23.18
bsnAPSerialNumber: FCZ139287VX
bsnAPDot3MacAddress: 0.3.10.18.60.ff
bsnAPIOSVersion: 12.4(25e)JA2$
bsnAPGroupVlanName: Wlww
bsnAPPrimaryMwarName: WL-K-Ha233
bsnAPSecondaryMwarName: WL-K-Ha238
bsnAPType: ap1241
bsnAPPortNumber: 13
bsnAPOperationStatus: associated
info: access point WL-AP-10 is associated (2 interfaces with 1 clients)</tt></pre>
...

<p>Zusätzlich zur reinen Zahl der angeschlossenen Access Points ist natürlich auch deren Status wichtig. Im Normalzustand haben sie den Status “associated”.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode accesspoint-status
OK - access point WL-AP-10 is associated (2 interfaces with 1 clients), access point WL-AP-13 is associated (2 interfaces with 0 clients), access point WL-AP-18 is associated (2 interfaces with 1 clients), access point WL-AP-20 is associated (2 interfaces with 2 clients), access point WL-AP-12 is associated (2 interfac
es with 0 clients), ....</tt></pre>

<p>Im Falle von “disassociating” wird Alarm geschlagen.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode accesspoint-status
CRITICAL - access point WL-AP-13 is disassociating (2 interfaces with 0 clients), access point WL-AP-10 is associated (2 interfaces with 1 clients), access point WL-AP-18 is associated (2 interfaces with 1 clients), access point WL-AP-20 is associated (2 interfaces with 2 clients), access point WL-AP-12 is associated (
2 interfaces with 0 clients), access point WL-AP-15 is associated (2 interfaceswith 1 clients), access point WL-AP-03 is associated (2 interfaces with 0 client...</tt></pre>

<p>Mit dem Parameter --name grenzt man die Überwachung ein. So kann man gezielt nur einen einzelnen Access Point abfragen.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode accesspoint-status --name WL-AP-13
OK - access point WL-AP-13 is associated (2 interfaces with 0 clients)</tt></pre>

<p>Im Fehlerfall…</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode accesspoint-status --name WL-AP-13
CRITICAL - access point WL-AP-13 is disassociating (2 interfaces with 0 clients)</tt></pre>

<p>Eine weitere Alternative ist der Modus “watch-accesspoints”. Hier wird bei jedem Aufruf des Plugins nachgesehen, ob Access Points verschwunden oder neu hinzugekommen sind. Man verwendet hier den Parameter –lookback, der die Sekunden angibt, während derer so eine Änderung zu einem Critical führt.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode watch-accesspoints --lookback 600
OK - found 22 access points | 'num_aps'=22</tt></pre>

<p>Verschwindet jetzt ein Access Point, so gibt’s Alarm</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode watch-accesspoints --lookback 600
CRITICAL - 1 access points missing (WL-AP-10), found 21 access points | 'num_aps'=21</tt></pre>

<p>Wenn ein neuer Acces Point hinzukommt, hat das nicht unbedingt Gutes zu bedeuten. In diesem Fall gibt es eine Warnung.</p>

<pre><tt>$ check_nwc_health  --hostname 172.24.18.114 --community public --mode watch-accesspoints --lookback 600
WARNING - 1 new access points (WLAN-XX), found 23 access points | 'num_aps'=23</tt></pre>