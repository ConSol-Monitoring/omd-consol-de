---
author: Gerhard Laußer
date: '2009-12-01T19:03:15+00:00'
slug: endlich-check_hpasm-release-4-0-ist-fertig
tags:
- check_hpasm
title: Endlich...check_hpasm Release 4.0 ist fertig
---

<p>Statt zwei Wochen hat das Redesign von check_hpasm nun doch zwei Monate gedauert, aber dafür ist das Plugin für künftige Erweiterungen bestens gerüstet. Hinzugekommen ist die Unterstützung der neuen G6-Proliants und die Fähigkeit, auch HP BladeCenter (wenn auch nicht so detailliert) und HP Storage-Systeme überwachen zu können. Es wurden auch ein paar Verbesserungen an der (nicht ganz einfachen) Erkennung der Speichermodule vorgenommen. Bei einigen Anwendern dürften jetzt defekte Riegel ans Tageslicht kommen, deren Zustand sich mit der 3.x-Version nicht feststellen liess.</p> <!--more-->  <p>Zu beachten ist, dass sich die Blacklisting-Kürzel teilweise geändert haben. Das neue Format findet man unter der Überschrift &quot;Blacklisting&quot;.</p>  <p>Im Gegensatz zu den Pre-Releases braucht man das Perl-Modul Nagios::Plugin nicht mehr. Ich habe die relevanten Code-Teile daraus gekürzt oder nachprogrammiert und direkt ins Plugin eingebunden.</p>  <p>Falls es Probleme gibt, bitte den Absatz &quot;Aufruf zum Mitmachen&quot; beachten und mir einen snmpwalk schicken.</p>  <p>Viel Spass damit.</p>