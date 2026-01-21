---
author: Gerhard Laußer
date: '2016-06-02'
summary: null
tags:
- Nagios
title: Reguläre Schwellwerte
---

In der neuesten Version von [GLPlugin](https://github.com/lausser/glplugin) habe ich die Möglichkeit vorgesehen, Thresholds auch als reguläre Ausdrücke anzugeben. Wie schaut das nun genau aus?
```bash
$ check_wut_health --hostname dcenv2.de.xxxx --community public --mode sensor-status
OK - return air temperature Unit 1.1 is 21.40C, humidity Unit 1.1 is 49.40%, return air temperature Unit 2.1 is 22.40C, humidity Unit 2.1 is 46.80% | 'temp_Unit 1.1'=21.40;25;28;; 'hum_Unit 1.1'=49.40%;40:60;35:65;0;100 'temp_Unit 2.1'=22.40;25;28;; 'hum_Unit 2.1'=46.80%;40:60;35:65;0;100
```

Wir sehen hier die hartcodierten Default-Schwellwerte 25 und 28 für die Temperatur bzw. 40:60 und 35:65 für die Luftfeuchtigkeit.
Bisher gab es zwei Möglichkeiten, diese zu ändern, z.b. in 20 und 30 für die Temperaturen zu ändern.
<!--more-->
<script type="text/javascript">
$('#stickstick').bind('touchmove',function(e){
      e.fadeOut('slow');
      //CODE GOES HERE
});
</script>
<div id="stickstick" onmouseover="$('#stickstick').fadeOut('slow');">
{% labs_sticker top:50 left:200 text:'<a href="https://wiki.kaninken.de/doku.php">Monitoring-Workshop 2016</a><br />7/8.9.2016 in Kiel</a><br />Wir sind dabei</a><br /><span style="font-size: 50%;">(Klick/Wisch mich, dann verschwinde ich)</span>' %}
</div>

* Mit *\-\-warning 20 \-\-critical 30*. Damit gelten die Schwellwerte dann global für sämtliche Meßgrößen, also auch für die *hum_...*. Im vorliegenden Fall ist das Blödsinn, da Temperatur und Luftfeuchtigkeit nichts miteinander zu tun haben, in unterschiedlichen Wertebereichen liegen und einmal als Schwellwert eine Zahl und einmal ein Intervall angegeben wird. Wären z.b. noch Lüfterdrehzahlen im Tausenderbereich im Spiel, wären *\-\-warning/\-\-critical* hier völlig sinnlos.

* Mit *\-\-warningx 'temp_Unit 1.1'=20 \-\-criticalx 'temp_Unit 1.1'=30 \-\-warningx 'temp_Unit 2.1'=20 \-\-criticalx 'temp_Unit 2.1'=30*. Damit bekommt man die gewünschten Schwellwerte, allerdings nur für **diesen** Fall, bei dem die Units *Unit 1* und *Unit 2* heißen.


Ein großer Kunde hatte nun folgende Anforderung:
Europaweit müssen die Schwellwerte für Temperatur und Luftfeuchtigkeit in den Lagerhäusern einheitlich sein. Die genauen Werte stehen in einem Betriebshandbuch. Eingesetzt werden Präzisionsklimasysteme der Firma Stulz, welche über ein [WIB 8000](http://repository.stulz.com/F5ABD290/C8000_WIB_STULZ_67C_0909_en.pdf)-Interface per SNMP angesprochen werden. Gemonitort werden sie mit [check_wut_health](https://github.com/lausser/check_wut_health).
Nun sind dummerweise die Bezeichnungen für die Stulz-Units nicht einheitlich. Manchmal findet man *Unit 1.1* und *Unit 2.1*, manchmal *unit 1* oder *Landeskürzel-RZ-Kürzel*.

```bash
$ check_wut_health --hostname dcenv1.at.xxxx --community public --mode sensor-status
OK - return air temperature ATVIE01.1.1 is 24.30C, return air temperature ATVIE01.2.1 is 24.60C | 'temp_ATVIE01.1.1'=24.30;25;28;; 'temp_ATVIE01.2.1'=24.60;25;28;;
$ check_wut_health --hostname dcenv8.at.xxxx --community public --mode sensor-status
OK - return air temperature ATLIN01.1.1 is 21.40C, humidity ATLIN01.1.1 is 49.40%, return air temperature ATLIN01.2.1 is 22.40C, humidity ATLIN01.2.1 is 46.80% | 'temp_ATLIN01.1.1'=21.40;25;28;; 'hum_ATLIN01.1.1'=49.40%;40:60;35:65;0;100 'temp_ATLIN01.2.1'=22.40;25;28;; 'hum_ATLIN01.2.1'=46.80%;40:60;35:65;0;100
$ check_wut_health --hostname dcenv1.es.xxxx --community public --mode sensor-status
OK - return air temperature Unit 1.1 is 20.30C, return air temperature Unit 2.1 is 22.10C | 'temp_Unit 1.1'=20.30;25;28;; 'temp_Unit 2.1'=22.10;25;28;;
$ check_wut_health --hostname dcenv1.cz.xxxx --community public --mode sensor-status
OK - return air temperature unit 1-1.1 is 21.50C, return air temperature unit 1-2.1 is 22.10C, return air temperature Unit 1-3.1 is 22.60C | 'temp_unit 1-1.1'=21.50;25;28;; 'temp_unit 1-2.1'=22.10;25;28;; 'temp_Unit 1-3.1'=22.60;25;28;;
```

Dies bedeutet, daß alle Labels der Performancedaten unterschiedlich sind, der bisherige Weg mit *\-\-warningx/\-\-criticalx* also nichts bringt. Klar könnte man nun etliche *\-\-warningx/\-\-criticalx*-Pärchen anhängen, eins für jede Ausprägung der Performancedaten-Labels. Oder, da die Admins ihre Klimageräte in eine CMDB eintragen, aus der dann die Nagios-Konfig generiert wird, die Unit-Benamsung in dieser CMDB hinterlegen. Alles zu umständlich. Wie man in den obigen Beispielen sieht, beginnen die Labels alle mit *temp_* bzw. *hum_*. Es lag also nahe, an der entsprechenden Stelle des GLPlugin-Moduls die Möglichkeit zu schaffen, Argumente von *\-\-warningx* und *\-\-criticalx* als reguläre Ausdrücke interpretieren zu lassen.


Mit *\-\-warningx 'temp_.\*'=20 \-\-criticalx 'temp_.\*'=30* erschlägt man nun sämtliche Ausprägungen der Temperatur-Labels und kann somit auf einfache Weise einheitliche Schwellwerte setzen. Genauso macht man es mit den Humidity-Schwellwerten.

```bash
$ check_wut_health --hostname dcenv1.at.xxxx --community public --mode sensor-status --warningx 'temp_.\*'=20 --criticalx 'temp_.\*'=30 --warningx 'hum_.\*'=40:60 --criticalx 'hum_.\*'=35:65
WARNING - return air temperature ATVIE01.1.1 is 24.30C, return air temperature ATVIE01.2.1 is 24.60C | 'temp_ATVIE01.1.1'=24.30;20;26;; 'temp_ATVIE01.2.1'=24.60;20;26;;
$ check_wut_health --hostname dcenv8.at.xxxx --community public --mode sensor-status  --warningx 'temp_.\*'=20 --criticalx 'temp_.\*'=30 --warningx 'hum_.\*'=40:60 --criticalx 'hum_.\*'=35:65
WARNING - return air temperature ATLIN01.1.1 is 21.40C, return air temperature ATLIN01.2.1 is 22.40C, humidity ATLIN01.1.1 is 49.40%, humidity ATLIN01.2.1 is 46.80% | 'temp_ATLIN01.1.1'=21.40;20;26;; 'hum_ATLIN01.1.1'=49.40%;40:60;35:65;0;100 'temp_ATLIN01.2.1'=22.40;20;26;; 'hum_ATLIN01.2.1'=46.80%;40:60;35:65;0;100
$ check_wut_health --hostname dcenv1.es.xxxx --community public --mode sensor-status --warningx 'temp_.\*'=20 --criticalx 'temp_.\*'=30 --warningx 'hum_.\*'=40:60 --criticalx 'hum_.\*'=35:65
WARNING - return air temperature Unit 1.1 is 20.30C, return air temperature Unit 2.1 is 22.10C | 'temp_Unit 1.1'=20.30;20;26;; 'temp_Unit 2.1'=22.10;20;26;;
$ check_wut_health --hostname dcenv1.cz.xxxx --community public --mode sensor-status --warningx 'temp_.\*'=20 --criticalx 'temp_.\*'=30 --warningx 'hum_.\*'=40:60 --criticalx 'hum_.\*'=35:65
WARNING - return air temperature unit 1-1.1 is 21.50C, return air temperature unit 1-2.1 is 22.10C, return air temperature Unit 1-3.1 is 22.60C | 'temp_unit 1-1.1'=21.50;20;26;; 'temp_unit 1-2.1'=22.10;20;26;; 'temp_Unit 1-3.1'=22.60;20;26;;
```

Folgt auf diese Parameter ein *\-\-warningx*, dessen Argument exakt einem bestimmten Label entspricht (also nix mit Regex, sondern Stringvergleich), so hat dieser Vorrang.

Welche Anwendunsszenarien wären für dieses Feature noch denkbar? Mir fallen die Interfacebezeichnungen ein, auf Basis derer man bei check_nwc_health unterschiedliche Schwellwerte (z.b. bei \-\-mode interface-errors) für TenGigabit.* und Gigabit.* vorgeben könnte.