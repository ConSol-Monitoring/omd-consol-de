---
author: Gerhard Laußer
date: '2011-10-14T17:12:57+00:00'
slug: speicher-lst-sich-nicht-mehr-in-luft-auf-dank-check_hpasm
title: Speicher löst sich nicht mehr in Luft auf dank check_hpasm
---

<p>Während des Bootens von Proliant-Servern wird eine umfangreiche Prüfung der verbauten Speichermodule durchgeführt. Entdeckt das Bios dabei Ungereimtheiten oder schadhafte DIMMs, so werden diese auskonfiguriert und der Bootvorgang fortgesetzt. Ob dies bei einem Server vorgekommen ist, zeigt ein Blick ins Integrated Management Log. Dort erscheint dann folgende Meldung:</p>  ```text
Event: 26 Added: 03/08/2011 21:01
  CAUTION: POST Messages - POST Error: 207-Memory initialization error on Processor 1 DIMM 6. The operating system may not have access to all of the memory installed in the system..
```<!--more--><p>Dies bedeutet nichts anderes, als dass teurer Hauptspeicher verbaut wurde, der dem Betriebssystem nicht zur Verfügung steht. Und das Schlimme daran ist, dass man es noch nicht mal merkt, wenn man nicht mit top o.ä. nachschaut und einem die Diskrepanz auffällt. In diesem System hier stecken eigentlich 48GB: </p>

```text
top - 18:33:14 up 21 days,  8:21,  2 users,  load average: 0.00, 0.00, 0.00
Tasks: 162 total,   1 running, 161 sleeping,   0 stopped,   0 zombie
Cpu(s):  0.0%us,  0.0%sy,  0.0%ni,100.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:     32101M total,     1293M used,    30807M free,      177M buffers
Swap:    31249M total,        0M used,    31249M free,      442M cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
   68 root      20   0     0    0    0 S    0  0.0   1:51.07 kondemand/6
 4807 root      39  19     0    0    0 S    0  0.0  29:32.02 kipmi0
    1 root      20   0 10376  812  672 S    0  0.0   0:08.45 init
    2 root      20   0     0    0    0 S    0  0.0   0:00.00 kthreadd
```

<p>Tatsächlich werden nur 32GB angezeigt. Die verschwundenen 16GB kosten an die 500€ und bei einem Rechnerpark von mehreren tausend Proliants kann sich das ziemlich aufsummieren. Wie eingangs erwähnt, wird im IML das Problem protokolliert:</p>

```text
nagios@lpsystra0118$ sudo /sbin/hpasmcli -s "show iml"

Event: 26 Added: 03/08/2011 21:01
  CAUTION: POST Messages - POST Error: 207-Memory initialization error on Processor 1 DIMM 6. The operating system may not have access to all of the memory installed in th
e system..

Event: 27 Added: 03/08/2011 21:08
  CAUTION: POST Messages - POST Error: 207-Memory initialization error on Processor 1 DIMM 9. The operating system may not have access to all of the memory installed in the system..
```

<p>Das aktuelle Release 4.3 von check_hpasm schaut im IML nach, ob es beim letzten Booten zu solchen Vorkommnissen gekommen ist und meldet es als kritischen Fehler.</p>

```text
CRITICAL - Event: 26 Added: 1299614460 Class: (POST Messages) caution POST Error: 207-Memory initialization error on Processor 1 DIMM 6. The operating system may not have access to all of the memory installed in the system.., Event: 27 Added: 1299614880 Class: (POST Messages) caution POST Error: 207-Memory initialization error on Processor 1 DIMM 9. The operating system may not have access to all of the memory installed in the system.., Event: 28 Added: 1299614880 Class: (POST Messages) caution POST Error: 207-Memory initialization error on Processor 1 DIMM 8. The operating system may not have access to all of the memory installed in the system.., System: 'proliant dl580 g7', S/N: 'CY21200XSA', ROM: 'P67 05/05/2011' | fan_1=33% fan_2=39% fan_3=39% fan_4=29% temp_1_ambient=18;41;41 temp_2_cpu#1=40;82;82 temp_4_memory_bd=27;87;87 temp_5_memory_bd=26;87;87 temp_8_power_supply_bay=35;90;90 temp_9_power_supply_bay=28;65;65 temp_10_system_bd=36;90;90 temp_11_system_bd=28;70;70 temp_12_system_bd=35;90;90 temp_13_i/o_zone=23;70;70 temp_14_i/o_zone=27;70;70 temp_15_i/o_zone=27;70;70 temp_16_i/o_zone=23;70;70 temp_17_i/o_zone=24;70;70 temp_19_system_bd=21;70;70 temp_20_system_bd=27;70;70 temp_21_system_bd=25;80;80 temp_22_system_bd=25;80;80 temp_23_system_bd=31;77;77 temp_24_system_bd=27;70;70 temp_25_system_bd=25;70;70 temp_26_system_bd=25;70;70 temp_28_i/o_zone=24;70;70 temp_29_scsi_backplane_zone=35;60;60 temp_30_system_bd=58;110;110
```