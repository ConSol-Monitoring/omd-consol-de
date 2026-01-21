---
author: Gerhard Laußer
date: '2014-08-20T22:09:47+00:00'
slug: welche-mibs-untertutzt-dieses-ding
tags:
- check_nwc_health
title: Welche MIBs unterstützt dieses Ding?
---

<p>Ich habe in letzter Zeit viel Aufwand in die Entwicklung bzw. Erweiterung von SNMP-Plugins gesteckt. Die, die ich veröffentliche habe sind: check_nwc_health für Netzwerkkomponenten, check_ups_health für unterbrechungsfreie Stromversorgungen und check_tl_health für Tape Libraries. Allen drei haben gemeinsam, daß sie bei einheitlichem Kommandozeilenformat möglichst viele unterschiedliche Hersteller und Modelle abdecken. Wenn ich nun eine neue Anforderung bekomme und ein Plugin für ein bisher unbekanntes Gerät erweitern muss, dann brauche ich erstmal eine Übersicht über die MIBs und OIDs, welche bei diesem Gerät implementiert wurden. Ich kann natürlich die Dokumentation durchschauen, aber die steht nicht immer zur Verfügung bzw. ist nicht sehr aufschlussreich. Ein Snmpwalk ist auch einer der ersten Schritte, aber der liefert mir einfach nur endlose Zahlenkolonnen, die ich mühsam interpretieren muss. Daher habe ich einen <i>--mode supportedmibs</i> eingeführt, mit dessen Hilfe ich die Namen der unterstützten MIBs angezeigt bekomme.    <br /></p><!--more--><p>Am Beispiel einer Firewall-Appliance SSG5 von Juniper zeige ich, wie man dabei vorgeht:</p>  <p>Zunächst braucht man einen Snmpwalk des Geräts. Genauer gesagt sind zwei davon nötig, denn der Aufruf ohne extra Basis-OID zeigt nur den Baum unterhalb von 1.3.6.1.2.1, interessante OIDs findet man aber auch unter 1.3.6.1.4.1.    <br />Am einfachsten ist es, check_nwc_health zu Hilfe zu nehmen. Mit <i>--mode walk</i> bekommt man die Befehle angezeigt, mit denen man die gewünschten Informationen in eine Datei umleitet.</p>  <div class="listingblock">   <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->     <pre><tt>$ check_nwc_health --hostname 192.168.1.3 --community knrzwfzn --mode walk
rm -f /tmp/snmpwalk_check_nwc_health_192.168.1.3
snmpwalk -ObentU -v2c -c naprax 192.168.1.3 1.3.6.1.2.1 &gt;&gt; /tmp/snmpwalk_check_nwc_health_192.168.1.3
snmpwalk -ObentU -v2c -c naprax 192.168.1.3 1.3.6.1.4.1 &gt;&gt; /tmp/snmpwalk_check_nwc_health_192.168.1.3
</tt></pre>
  </div>
</div>

<p>Diese Datei braucht man anschliessend für den Aufruf mit <i>--mode supportedmibs</i></p>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>$ check_nwc_health --snmpwalk /tmp/snmpwalk_check_nwc_health_192.168.1.3 --mode supportedmibs
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.10
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.11
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.12
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.13
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.15
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.16
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.17
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.18
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.21
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.3
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.4
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.5
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.6
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.7
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.8
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.9
implements FR-MFR-MIB 1.3.6.1.2.1.10.47
implements IF-MIB 1.3.6.1.2.1.31
implements IP-FORWARD-MIB 1.3.6.1.2.1.4.24
implements IPV6-ICMP-MIB 1.3.6.1.2.1.56
implements IPV6-MIB 1.3.6.1.2.1.55
implements NETSCREEN-PRODUCTS-MIB 1.3.6.1.4.1.3224.1
implements RFC1066-MIB 1.3.6.1.2.1.1
implements RFC1156-MIB 1.3.6.1.2.1.1
implements RFC1158-MIB 1.3.6.1.2.1.1
implements RFC1213-MIB 1.3.6.1.2.1.1
implements RFC1354-MIB 1.3.6.1.2.1.4.24
implements SNMP-MIB2 1.3.6.1.2.1
OK - have fun
</tt></pre>
  </div>
</div>

<p>Man sieht hier die üblichen Standard-MIBs (SNMP-MIB2, IF-MIB,...) und auch die herstellerspezifische NETSCREEN-PRODUCTS-MIB. Die bzw. ihre Base-OIDs anhand derer sie erkannt werden sind im Plugin hart codiert. Eine Reihe unknown-Zeilen taucht aber auch auf. Man muss also irgendwie mithelfen, OIDs den entsprechenden MIBs zuzuordnen.</p>

<p>Dazu erzeugt man eine weitere Datei, die ich immer mibdepot.pm nenne. Sie heißt so, weil ich immer auf der Seite mibdepot.com nachschaue. Auf der Suche nach MIBs, die zu 1.3.6.1.4.1.3224 gehören, wird man unter <a title="http://mibdepot.com/cgi-bin/vendor_index.cgi?r=netscreen" href="http://mibdepot.com/cgi-bin/vendor_index.cgi?r=netscreen">http://mibdepot.com/cgi-bin/vendor_index.cgi?r=netscreen</a> fündig.</p>

<p><code><a href="/assets/2014-08-20-welche-mibs-untertutzt-dieses-ding/mibdepot-netscreen.png"><img title="mibdepot-netscreen" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; margin: 3px 20px 7px; display: inline; padding-right: 0px; border-top-width: 0px" border="0" alt="mibdepot-netscreen" src="/assets/2014-08-20-welche-mibs-untertutzt-dieses-ding/mibdepot-netscreen_thumb.png" width="560" height="168" /></a>&#160;</code></p>


<p>Mit Copy&amp;Paste markiert man die Zeilen, in denen OID und MIB zu finden sind und schickt den Inhalt durch das folgende Script</p>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>awk '/3224/ { printf &quot; [#%s#, #%s#, #%s#, #%s#],\n&quot;, $3, &quot;netscreen&quot;, $2, $4 }' |\
   sed -e &quot;s/#/'/g&quot; &gt; /tmp/mibdepot.pm</tt></pre>
  </div>
</div>

<p>Die Datei mibdepot.pm sieht dann folgendermassen aus:</p>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>
 ['1.3.6.1.4.1.3224.12', 'netscreen', 'v1', 'NETSCREEN-ADDR-MIB'],
 ['1.3.6.1.4.1.3224.4.7', 'netscreen', 'v1', 'NETSCREEN-CERTIFICATE-MIB'],
 ['1.3.6.1.4.1.3224.3.1', 'netscreen', 'v1', 'NETSCREEN-IDS-MIB'],
 ...
</tt></pre>
  </div>
</div>

<p>Man ergänzt sie um eine Anfangs- und Endezeile, damit der Inhalt gültiger Perl-Code ist (und die Variable $mibdepot enthält). Die endgültige Datei mibdepot.pm sieht dann so aus:</p>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>
$mibdepot = [
 ['1.3.6.1.4.1.3224.12', 'netscreen', 'v1', 'NETSCREEN-ADDR-MIB'],
 ['1.3.6.1.4.1.3224.4.7', 'netscreen', 'v1', 'NETSCREEN-CERTIFICATE-MIB'],
 ['1.3.6.1.4.1.3224.3.1', 'netscreen', 'v1', 'NETSCREEN-IDS-MIB'],
 ...
];
</tt></pre>
  </div>
</div>

<p>Ruft man jetzt erneut check_nwc_health <i>--mode supportedmibs</i> auf und ergänzt den Aufruf um <i>--name /tmp/mibdepot.pm</i>, so wird das Ergebnis deutlicher:</p>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.6
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>$ plugins-scripts/check_nwc_health --snmpwalk /tmp/snmpwalk_check_nwc_health_192.168.1.3 --mode supportedmibs --name /tmp/mibdepot.pm
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.16
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.18
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.21
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.3
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.4
implements &lt;unknown&gt; 1.3.6.1.4.1.3224.6
implements FR-MFR-MIB 1.3.6.1.2.1.10.47
implements IF-MIB 1.3.6.1.2.1.31
implements IP-FORWARD-MIB 1.3.6.1.2.1.4.24
implements IPV6-ICMP-MIB 1.3.6.1.2.1.56
implements IPV6-MIB 1.3.6.1.2.1.55
implements NETSCREEN-ADDR-MIB 1.3.6.1.4.1.3224.12
implements NETSCREEN-CERTIFICATE-MIB 1.3.6.1.4.1.3224.4.7
implements NETSCREEN-IDS-MIB 1.3.6.1.4.1.3224.3.1
implements NETSCREEN-INTERFACE-MIB 1.3.6.1.4.1.3224.9
implements NETSCREEN-IP-ARP-MIB 1.3.6.1.4.1.3224.17.1
implements NETSCREEN-NAT-MIB 1.3.6.1.4.1.3224.11
implements NETSCREEN-POLICY-MIB 1.3.6.1.4.1.3224.10
implements NETSCREEN-PRODUCTS-MIB 1.3.6.1.4.1.3224.2
implements NETSCREEN-QOS-MIB 1.3.6.1.4.1.3224.5
implements NETSCREEN-RESOURCE-MIB 1.3.6.1.4.1.3224.16.1
implements NETSCREEN-SERVICE-MIB 1.3.6.1.4.1.3224.13
implements NETSCREEN-SET-ADMIN-USR-MIB 1.3.6.1.4.1.3224.7.11
implements NETSCREEN-SET-AUTH-MIB 1.3.6.1.4.1.3224.7.2
implements NETSCREEN-SET-DHCP-MIB 1.3.6.1.4.1.3224.7.5
implements NETSCREEN-SET-DNS-MIB 1.3.6.1.4.1.3224.7.3
implements NETSCREEN-SET-EMAIL-MIB 1.3.6.1.4.1.3224.7.7
implements NETSCREEN-SET-GEN-MIB 1.3.6.1.4.1.3224.7.1
implements NETSCREEN-SET-GLB-MIB 1.3.6.1.4.1.3224.7.10
implements NETSCREEN-SET-LOG-MIB 1.3.6.1.4.1.3224.7.8
implements NETSCREEN-SET-SNMP-MIB 1.3.6.1.4.1.3224.7.9
implements NETSCREEN-SET-SYSTIME-MIB 1.3.6.1.4.1.3224.7.6
implements NETSCREEN-SET-URL-FILTER-MIB 1.3.6.1.4.1.3224.7.4
implements NETSCREEN-SET-WEB-MIB 1.3.6.1.4.1.3224.7.12
implements NETSCREEN-TRAP-MIB 1.3.6.1.4.1.3224.2
implements NETSCREEN-VPN-GATEWAY-MIB 1.3.6.1.4.1.3224.4.4
implements NETSCREEN-VPN-IKE-MIB 1.3.6.1.4.1.3224.4.3
implements NETSCREEN-VPN-L2TP-MIB 1.3.6.1.4.1.3224.4.8
implements NETSCREEN-VPN-MON-MIB 1.3.6.1.4.1.3224.4.1
implements NETSCREEN-VPN-PHASEONE-MIB 1.3.6.1.4.1.3224.4.5
implements NETSCREEN-VPN-PHASETWO-MIB 1.3.6.1.4.1.3224.4.6
implements NETSCREEN-VSYS-MIB 1.3.6.1.4.1.3224.15.1
implements NETSCREEN-ZONE-MIB 1.3.6.1.4.1.3224.8.1
implements RFC1066-MIB 1.3.6.1.2.1.1
implements RFC1156-MIB 1.3.6.1.2.1.1
implements RFC1158-MIB 1.3.6.1.2.1.1
implements RFC1213-MIB 1.3.6.1.2.1.1
implements RFC1354-MIB 1.3.6.1.2.1.4.24
implements SNMP-MIB2 1.3.6.1.2.1
OK - have fun
</tt></pre>
  </div>
</div>

<p>Die noch fehlenden MIBs 1.3.6.1.4.1.3224.16 etc. muss man mit ein wenig Kleinarbeit in mibdepot.pm nachpflegen. In diesem Fall liegt es an OIDs unter 1.3.6.1.4.1.3224.16.2, welche zur NETSCREEN-RESOURCE-MIB gehören. Man muss also eine weitere Zeile anlegen.
  <br />(Bei den unknown-Angaben wird nur die Hersteller-Nummer und eine weitere Nummer ausgegeben, sonst wird die Ausgabe unnötig lang)</p>