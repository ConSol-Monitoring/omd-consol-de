---
author: Gerhard Laußer
date: '2013-01-02T23:27:20+00:00'
slug: neue-features-fur-check_mssql_health
tags:
- dbcc
title: Neue Features für check_mssql_health
---

Einer unserer Kunden, der check_mssql_health bereits intensiv nutzt, hat mich beauftragt, neue Anforderungen seiner DBAs umzusetzen.
Hier ist das Ergebnis:

<!--more-->
Zunächst war eine Überwachung von Datenbank-Jobs gefordert.

<pre><tt>check_mssql_health --mode failed-jobs</tt></pre>

Mit dem Parameter --lookback gibt man die Anzahl der Minuten an, die man in die Vergangenheit blicken will. (Ohne --lookback \<min\> wird der Defautlwert 30min hergenommen). Es werden also nur die Ergebnisse betrachtet, bei denen run_date/run_time nicht weiter als die gewählte Anzahl Minuten zurückliegt.
Zusätzlich lasse ich noch berechnen
<ul>
	<li>Wieviele Sekunden hat der Job gedauert</li>

	<li>Vor wievielen Minuten (rückgerechnet ab current_timestamp) ist er gestartet</li>
</ul>



Dann wird auf LastRunStatus geschaut. "Failed" ergibt ein Nagios-CRITICAL, "Retry" und "Canceled" ein Nagios-Warning.
Bei den anderen, "Succeeded" und "Running" wird danach die LastRunDuration (in Sekunden) mit --warning und --critical verglichen. Defaultwerte sind hier 60s und 300s.

<pre><tt>check_mssql_health --mode failed-jobs
WARNING - job Shrink Databases.Subplan_1 ran for 79 seconds (started Oct 25
2012 12:04:00:000AM), job atcmonitoring_expired-application ran for 0 seconds (started Oct 25 2012 06:00:00:000PM), job atcmonitoring_atc-output ran for 0 seconds (started Oct 25 2012 06:59:00:000PM)
</tt></pre>

Wenn man nur die problematischen Jobs sehen will, geht das mit --report short

<pre><tt>check_mssql_health --mode failed-jobs --report short WARNING - job Shrink Databases.Subplan_1 ran for 79 seconds (started Oct 25
2012 12:04:00:000AM)
</tt></pre>

Wenn Jobs ruhig länger als eine Minute laufen dürfen, erhöht man die Schwellwerte

<pre><tt>check_mssql_health  --mode failed-jobs --report short --warning 300 --critical 3600
OK - no problems</tt></pre>

Eine weitere Anforderung war das Beobachten von Grow- und Shrink-Events. Auch hier benutzt man den Parameter --lookback, um den Zeitraum der Messung einzugrenzen. Insgesamt 7 neue Modi habe ich implementiert, für Shrink und Grow Events und jeweils für Data Files, Log Files oder beliebige Files. Ausserdem wird auch auf manuell ausgelöste Shrinks geprüft.

Wenn also die Anzahl der Auto Grow Events während der vergangenen dreissig Minuten gezählt werden sollen und es bei mehr als fünf davon einen Alarm geben soll, dann schreibt man:

<pre><tt>check_mssql_health --mode database-file-auto-growths --lookback 30  --warning 4 --critical 4
</tt></pre>

(zwischen Warning und Critical wird hier nicht unterschieden, aber man kann natürlich auch mit z.B. "--warning 0" frühzeitig auf Gelb schalten)

Leider sind Schwellwerte größer-Angaben und nicht größer-gleich-Angaben (ist Vorschrift, stammt nicht von mir), so daß man 4 schreiben muss, wenn man "ab 5" meint.

Ohne Eingrenzung der Datenbank wird für alle ausgegeben, wieviele Grow Events aufgetreten sind:

<pre><tt>check_mssql_health --mode database-file-auto-growths --lookback 500  --warning 1 --critical 4
OK - tempdb had 1 file auto grow events in the last 500 minutes, msdb had 0
 file auto grow events in the last 500 minutes, model had 0 file auto grow events in the last 500 minutes, master had 0 file auto grow events in the last 500 minutes
</tt></pre>

Man kann auch jede Datenbank einzeln abfragen
<pre><tt>check_mssql_health --mode database-file-auto-growths --lookback 500  --warning 1 --critical 4 --database model
OK - model had 0 file auto grow events in the last 500 minutes
</tt></pre>

Oder man frägt alle Datenbanken ab und verkürzt die Ausgabe mit "--report short" auf die nicht-OK Bestandteile.

<pre><tt>check_mssql_health --mode database-file-auto-growths --lookback 500  --warning 0 --critical 4
WARNING - tempdb had 1 file auto grow events in the last 500 minutes, msdb had 0 file auto grow events in the last 500 minutes, model had 0 file auto grow events in the last 500 minutes, master had 0 file auto grow events in the last 500 minutes
check_mssql_health --mode database-file-auto-growths --lookback 500  --warning 0 --critical 4 --report short
WARNING - tempdb had 1 file auto grow events in the last 500 minutes</tt></pre>

oder wenn es gar keine Events gab

<pre><tt>check_mssql_health --mode database-file-auto-growths --lookback 500  --warning 1 --critical 4 --report short
OK - no problems</tt></pre>

Wir haben uns dann für folgende Auswahl entschieden:

<pre><tt>check_mssql_health --mode database-file-auto-growths --warning 0 --critical 5 --lookback 30 --report short
check_mssql_health --mode database-file-auto-shrinks --warning 0 --critical 5 --lookback 30 --report short
check_mssql_health --mode database-file-dbcc-shrinks --warning 0 --critical 5 --lookback 30 --report short</tt></pre>

Neu ist auch der Parameter <b>--mitigation</b>, der als Argument <i>ok</i>, <i>warning</i> oder <i>critical</i> nimmt. Man braucht ihn, um bei besonderen Situationen kontrolliert einen Exitcode vorzugeben. Wenn bei den Modi "database-free" oder "database-last-backup" beispielsweise eine Datenbank offline ist, gibt das normalerweise ein CRITICAL. Will man in diesem Fall lediglich WARNING, so ruft man check_mssql_health mit "--mitigation warning" auf. Sollen offline Datenbanken gar kein Thema sein, so benutzt man "--mitigation ok".

Die Modi "database-free" etc. werten sämtliche Datenbanken aus, sofern man hier nicht mit --name einschränkt. Leider sind dann auch <i>tempdb</i> und andere temporäre Datenbanken mit inbegriffen und können das Ergebnis verderben. (Eine volle tempdb führt zu CRITICAL, ist aber nicht in jedem Fall ein Fehlerzustand)
Mit <b>--notemp</b> werden alle temporären Datenbanken grundsätzlich von jeder SQL-Abfrage ausgenommen.
Diesen neuen Parameter gibt es übrigens jetzt auch für check_db2_health und check_oracle_health.