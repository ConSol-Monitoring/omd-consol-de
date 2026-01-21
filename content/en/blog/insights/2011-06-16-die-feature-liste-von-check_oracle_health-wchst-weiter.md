---
author: Gerhard Laußer
date: '2011-06-16T14:14:38+00:00'
slug: die-feature-liste-von-check_oracle_health-wchst-weiter
tags:
- check_oracle_health
title: Die Feature-Liste von check_oracle_health wächst weiter...
---

<p>Seit heute gibt es die Version 1.6.9 von check_oracle_health. Hauptzweck ist die Beseitigung eines Problems, das auftaucht, wenn man das Plugin unter OMD einsetzt. Daneben ist aber auch die Liste der Modi erweitert worden, um noch mehr Fehlersituationen in großen Oracle-Installationen rechtzeitig erkennen zu können. </p><!--more--><p>Zunächst wurde ein Problem behoben, welches im <a href="http://kenntwas.de/2011/linux/monitoring/omd_state_retention_var_tmp/" target="_blank">kenntwas-Blog</a> zu Recht angemeckert wurde. Bisher schrieb check_oracle_health temporäre Dateien (mit Informationen, die von Plugin-Aufruf zu Plugin-Aufruf weitergereicht werden müssen) ins Verzeichnis /var/tmp/check_oracle_health. In einer OMD-Umgebung mit ihren unterschiedlichen Sites und somit unterschiedlichen Benutzern kommt es hier natürlich zu Kollisionen bzw. Problemen mit Schreibrechten.     <br />In der neuen Version erkennt check_oracle_health, wenn es unter OMD ausgeführt wird und legt seine temporären Dateien im Homeverzeichnis des Site-Users ab. ($HOME/var/tmp/check_oracle_health). Damit gibt es keine Kollisionen mehr mit den Daten anderer Sites. Auch bei einem Umzug einer Site ändert sich der Besitzer der temporären Dateien.</p>  <p>Die neuen Modi sind:</p>  <ul>   <li>session-usage und process-usage      <br />Hier werden aus der View v$resource_limit jeweils der aktuelle und der maximalen Wert gelesen und als Prozentangabe ausgegeben.       <br /></li>    <li>rman-backup-problems      <br />Hier werden aus der View v$rman_status die Backup-Jobs der letzten drei Tage, welche mit Status &lt;&gt; COMPLETED beendet wurden, gezählt.       <br />      ```bash
check_oracle_health --mode rman-backup-problems
OK - rman had 0 problems during the last 3 days | rman_backup_problems=0;1;2
```
  </li>

  <li>datafiles-existing
    <br />Sehr, sehr nützlich! Die Anzahl der maximal möglichen Datafiles ist fest eingestellt und kann nur durch Ändern des Parameters db_files und anschliessenden Neustart der Datenbank erhöht werden. Daß es diese Obergrenze gibt, merkt man, wenn man einen Tablespace vergrößern will und einem dies mit

    <br />

    <pre>ORA-59 signalled during: ALTER TABLESPACE SAT2ASIA ADD DATAFILE ....</pre>

    <br />um die Ohren fliegt. Jetzt heisst es erstmal warten, bis eine Downtime genehmigt wurde, also irgendwann zwischen Weihnachten und Neujahr. Drum sollte man frühzeitig wissen, daß die noch möglichen Datafiles zur Neige gehen. Mir wurde gesagt, daß noch nicht einmal Oracle Grid Control hier eine Warnung verschickt.&#160; <br />

    ```bash
check_oracle_health --mode datafiles-existing
WARNING - you have 81.00% of max possible datafiles (162 of 200 max) | datafiles_pct=81%;80;90 datafiles_num=162;160;180;0;200
```
  </li>
</ul>