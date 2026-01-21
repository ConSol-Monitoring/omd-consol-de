---
author: Gerhard Laußer
date: '2013-03-28T17:48:26+00:00'
slug: check_nwc_health-neuer-modus-fr-link-aggregation
title: check_nwc_health - neuer Modus für Link Aggregation
---

<p>Von einem Kunden wurde der Wunsch geäussert, Cisco Port Channels zu überwachen. Diese Technologie ist eine Art, wie man mehrere Interfaces zu einem Strang bündeln kann, sei es aus Gründen der Ausfallsicherheit oder (was mittlerweile eher seltener der Fall ist) der Lastverteilung. Üblicherweise werden Uplinks zwischen Switches auf diese Art redundant ausgelegt. Herausgekommen ist ein neues Feature, nämlich <b>--mode link-aggregation-availability</b></p><!--more--><p>Mit --mode link-aggregation-availability wird ermittelt, wieviel Prozent der zusammengefassten Interfaces verfügbar (= OperStatus up) sind. Ohne Angabe von Schwellwerten mittels --warning/--critical werden diese selbständig errechnet und zwar so, dass der Status WARNING ist, sobald ein Interface weggebrochen ist und CRITICAL, sobald nur noch ein einziges Interface übrig ist.</p>  <p>Welche Interfaces unter welchem Namen zusammengefasst werden, gibt man dem Parameter --name mit und zwar in Form einer kommaseparierten Liste. Das erste Element ist der Name der Link Aggregation, gefolgt von den Member-Interfaces (ifDescr).</p>  <p>Im folgenden Beispiel werden die Interfaces AT-GS950/24 1000 Mbps Ethernet Network Interface 1, AT-GS950/24 1000 Mbps Ethernet Network Interface 2 und AT-GS950/24 1000 Mbps Ethernet Network Interface 3 zu einem Uplink gebündelt. Und so sieht es aus, wenn man nacheinander zwei Kabel abzieht:</p>  <div class="listingblock">   <div class="content">     <pre><tt>nagsrv$ check_nwc_health  --hostname 10.17.52.18 --community 'public' --mode link-aggregation-availability --name 'Uplink RZ 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 2,AT-GS950/24 1000 Mbps Ethernet Network Interface 3'
OK - aggregation Uplink RZ 1 availability is 100.00% (3 of 3) | 'aggr_Uplink RZ 1_availability'=100%;100:;34:

nagsrv$ check_nwc_health  --hostname 10.17.52.18 --community 'public' --mode link-aggregation-availability --name 'Uplink RZ 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 2,AT-GS950/24 1000 Mbps Ethernet Network Interface 3'
WARNING - aggregation Uplink RZ 1 availability is 66.67% (2 of 3) (down: AT-GS950/24 1000 Mbps Ethernet Network Interface 3) | 'aggr_Uplink RZ 1_availability'=66.67%;100:;34:

nagsrv$ check_nwc_health  --hostname 10.17.52.18 --community 'public' --mode link-aggregation-availability --name 'Uplink RZ 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 1,AT-GS950/24 1000 Mbps Ethernet Network Interface 2,AT-GS950/24 1000 Mbps Ethernet Network Interface 3'
CRITICAL - aggregation Uplink RZ 1 availability is 33.33% (1 of 3) (down: AT-GS950/24 1000 Mbps Ethernet Network Interface 2, AT-GS950/24 1000 Mbps Ethernet Network Interface 3) | 'aggr_Uplink RZ 1_availability'=33.33%;100:;34:
</tt></pre>
  </div>
</div>

<p>
  <br />

  <br />Für coshsh gibt es auch eine passende Detail-Klasse <i>detail_linkaggregation.py</i></p>

<div class="listingblock">
  <div class="content">
    <pre><tt>
from monitoring_detail import MonitoringDetail

def __detail_ident__(params={}):
    if params[&quot;monitoring_type&quot;] == &quot;LINKAGGREGATION&quot;:
        return MonitoringDetailLinkAggregation


class MonitoringDetailLinkAggregation(MonitoringDetail):
    &quot;&quot;&quot;
    &quot;&quot;&quot;
    property = &quot;linkaggregations&quot;
    property_type = list

    def __init__(self, params):
        self.monitoring_type = params[&quot;monitoring_type&quot;]
        self.name = params[&quot;monitoring_0&quot;].strip()
        self.members = [params[&quot;monitoring_&quot; + str(x)].strip() for x in range(1, 6) if &quot;monitoring_&quot; + str(x) in params and params[&quot;monitoring_&quot; + str(x)]]

    def __str__(self):
        return &quot;%s:%s&quot; % (self.name, &quot;,&quot;.join(self.members))
</tt></pre>
  </div>
</div>

<p>
  <br />

  <br />und ein Template <i>os_ios_channel.tpl</i>, so wie ich es für Cisco Port Channels verwende:</p>

<div class="listingblock">
  <div class="content">
    <pre><tt>{% for la in application.linkaggregations %}
{{ application|service(&quot;os_ios_if_&quot; + la.name + &quot;_check_portchanavail&quot;) }}
    host_name                       {{ application.host_name }}
    use                             os_ios_if,srv-pnp
    check_command                   check_nwc_health_v2!\
        $HOSTADDRESS$!60!{{ application.loginsnmpv2.community }}!\
        link-aggregation-availability --name '{{ la.name }},{{ &quot;,&quot;.join(la.members) }}'
}
{% endfor %}
</tt></pre>
  </div>
</div>

<p>
  <br />

  <br />Damit das angezogen wird, muss man noch in der IOS-Klasse die entspr. Template-Regel einfügen:</p>

<div class="listingblock">
  <div class="content">
    <pre><tt>class CiscoIOS(Application):
     template_rules = [
         TemplateRule(needsattr=None,
             template=&quot;os_ios_default&quot;,
         ),
         TemplateRule(needsattr='interfaces',
             template=&quot;os_ios_if&quot;,
         ),
         TemplateRule(needsattr='linkaggregations',
             template=&quot;os_ios_channel&quot;,
         ),
</tt></pre>
  </div>
</div>