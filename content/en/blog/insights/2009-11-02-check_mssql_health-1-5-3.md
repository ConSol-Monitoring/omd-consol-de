---
author: Gerhard Laußer
date: '2009-11-02T13:59:20+00:00'
slug: check_mssql_health-1-5-3
tags:
- check_mssql_health
title: check_mssql_health 1.5.3
---

<p>Eine neue Version von check_mssql_health ist soeben erschienen. In erster Linie wurde ein Bug im Mode database-free beseitigt, der zu ungenauen bzw. falschen Ergebnissen f&uuml;hrte, wenn der freie Plattenplatz knapp wurde.<br />
	Daneben wurde der neue Mode database-backup-age eingef&uuml;hrt, mit dem sich &uuml;berwachen l&auml;sst, wie lange der Zeitpunkt des letzten Backups zur&uuml;ckliegt.</p>
<p><!--more-->Dabei handelt es sich um die Funktionalit&auml;t, die in einem der letzten Blogs unter der &Uuml;berschrift &quot;<a href="/blog/2009/10/16/ms-sql-server-backups-uberwachen-mit-check_mssql_health/" rel="bookmark" title="Permanent Link to MS SQL Server Backups überwachen mit check_mssql_health"><font color="#2a5a8a">MS SQL Server Backups &uuml;berwachen mit check_mssql_health</font></a>&quot; als Erweiterung vorgestellt wurde. Dieses Zusatzmodul wurde jetzt in den Plugin-Kern integriert.</p>