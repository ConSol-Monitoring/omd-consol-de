---
author: Gerhard Laußer
date: '2009-08-04T08:35:00+00:00'
slug: update-von-esxi3-5-auf-esxi4-0
tags:
- esx
title: Update von VMware ESXi3.5 auf ESXi4.0
---

Ein Update von ESXi 3.5 auf 4.0 geht ganz einfach, auch wenn man keinen vCenter Update Manager hat. Für die meisten Nutzer der kostenlosen Variante von ESX dürfte das der Fall sein. Trotzdem gibt es auch für sie die Möglichkeit eines bequemen, automatisierten Updates.
<!--more-->
Zuerst braucht man die Datei <a href="https://www.vmware.com/de/tryvmware/p/download.php?p=free-esxi&lp=1">VMware ESXi 4.0 (upgrade ZIP)</a>, die man mit 7-Zip (wichtig!) öffnet. Darin befinden sich weitere Archive, durch die man sich folgendermassen klickt:
<ul>
	<li>VMware-viclient.vib	</li>
<li>data.tar.gz</li>
	<li>data.tar</li>
<li>.</li>
	<li>4.0.0</li>

	<li>client</li></ul>
Schliesslich findet man die Datei VMware-vclient.exe, die man extrahieren muss. Sie enthält den vSphere Client 4.0. Bei dessen Installation muss man explizit ein Häkchen bei "Install vSphere Host Update Utility 4.0" setzen, dann erhält man danach unter Programme->VMware auch das neue Tool vSphere Host Update Utility. Dieses verlangt nach dem Start und der Auswahl des zum Update vorgesehenen Servers eine ESX-Upgrade-Paketdatei. Hier gibt man das eingangs heruntergeladene ZIP-Archiv an und dann geht alles automatisch. Der Server muss sich im Maintenance-Mode befinden und vorsichtshalber sollte man auch alle VMs stoppen.
Falls der Fortschrittsbalken bei 34% zu hängen scheint, darf man nicht in Panik verfallen. Es kann durchaus ein paar Minuten dauern, bis es weitergeht.
Anschliessend kann man bei angeschalteten VMs noch das BIOS aktualisieren. Dadurch kommt man in den Genuss neuer Features wie IDE-Platten, 10 NICs pro VM und VMDirectPath.

<img style="float: none;" src="/assets/2009-08-04-update-von-esxi3-5-auf-esxi4-0/esxi4-biosupdate.png" alt="Bios-Update" />