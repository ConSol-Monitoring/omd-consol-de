---
author: Gerhard Laußer
date: '2012-08-29T22:03:49+00:00'
slug: raspberry-pi-mit-spiegel-sticks
tags:
- dwc_otg
title: Raspberry Pi mit Spiegel-Sticks
---

In diesem Post wird gezeigt, wie man einen Raspberry Pi Miniatur-Computer mit einem Root-Filesystem ausstattet, das auf zwei gespiegelten USB-Sticks liegt.<br/>
<!--more-->
Der Raspberry Pi (Modell B) wird mit einem SD-Karten-Leser und zwei USB-Ports geliefert. Das Betriebssystem Raspbian, eine Variante von Debian, wird als Image heruntergeladen und auf eine SD-Karte kopiert. Diese enthält danach zwei Partitionen, eine für das /boot- und eine für das /-Filesystem. Nach dem Booten zeigt sich folgendes Bild:
```text
root@raspberrypi:~# df
Filesystem     1K-blocks    Used Available Use% Mounted on
rootfs          15118600 4141560  10209048  29% /
/dev/root       15118600 4141560  10209048  29% /
tmpfs              23656     312     23344   2% /run
tmpfs               5120       0      5120   0% /run/lock
tmpfs              47312       0     47312   0% /tmp
tmpfs              10240       0     10240   0% /dev
tmpfs              47312       0     47312   0% /run/shm
/dev/mmcblk0p1     57288   41192     16096  72% /boot
root@raspberrypi:~# ls -l /dev/root
lrwxrwxrwx 1 root root 3 Aug 30 21:17 /dev/root -> mmcblk0p2
```

Das /boot-Filesystem mit dem Kernel <i>kernel.img</i> kann nirgendwo anders liegen als in der ersten Partition der SD-Karte. Das /-Filesystem hingegen kann sich auf einem beliebigen Datenträger befinden. In einem ersten Schritt zeige ich, wie man es auf einen USB-Stick legt.

<h3>Stick einstecken und Device-Namen ermitteln</h3>
Beim Einstecken der Sticks wird man in /var/log/messages sehen, dass es ein neues Device /dev/sda gibt.
```text
Aug 29 17:17:14 raspberrypi kernel: [    7.784278] usb 1-1.3.7: New USB device found, idVendor=1f75, idProduct=0916
Aug 29 17:17:14 raspberrypi kernel: [    7.802488] usb 1-1.3.7: New USB device strings: Mfr=1, Product=2, SerialNumber=3
Aug 29 17:17:14 raspberrypi kernel: [    7.817159] usb 1-1.3.7: Product: USB Device
Aug 29 17:17:14 raspberrypi kernel: [    7.825269] usb 1-1.3.7: Manufacturer: innostor
Aug 29 17:17:14 raspberrypi kernel: [    7.832820] usb 1-1.3.7: SerialNumber: 201205300000131
Aug 29 17:17:14 raspberrypi kernel: [    7.852816] scsi0 : usb-storage 1-1.3.7:1.0
Aug 29 17:17:14 raspberrypi kernel: [    8.863677] scsi 0:0:0:0: Direct-Access   innostor USB 3.0          1.00 PQ: 0 ANSI: 6
Aug 29 17:17:14 raspberrypi kernel: [    8.894315] sd 0:0:0:0: [sda] 30720000 512-byte logical blocks: (15.7 GB/14.6 GiB)
Aug 29 17:17:14 raspberrypi kernel: [    8.921697] sd 0:0:0:0: [sda] Write Protect is off
Aug 29 17:17:14 raspberrypi kernel: [    9.011710]  sda:
Aug 29 17:17:14 raspberrypi kernel: [    9.077682] sd 0:0:0:0: [sda] Attached SCSI removable disk
```

Der Stick kann also unter dem Namen /dev/sda angesprochen werden.


<h3>Partition anlegen</h3>
Mit gdisk (nicht mit fdisk!) wird eine Partition auf dem Stick angelegt. Beim ersten Aufruf erscheint möglicherweise folgende Meldung:

```text
root@raspberrypi:~# gdisk /dev/sda
GPT fdisk (gdisk) version 0.5.1

Partition table scan:
  MBR: MBR only
  BSD: not present
  APM: not present
  GPT: not present

***************************************************************
Found invalid GPT and valid MBR; converting MBR to GPT format.
THIS OPERATON IS POTENTIALLY DESTRUCTIVE! Exit by typing 'q' if
you don't want to convert your MBR partitions to GPT format!
***************************************************************
```
Das geht in Ordnung, da der Stick mit dem GPT-Schema partitioniert werden soll. (GUID Partition Table hat gegenüber dem MBR-Partitionsschema den Vorteil, dass Partitionen eine eindeutige GUID bekommen)
Mit dem d-Kommando werden evt. vorhandene Partitionen dann gelöscht und mit dem n-Kommando eine neue angelegt.
Beim Speichern mit w erscheint wieder eine Warnung, die ebenfalls mit Y beantwortet werden kann.
```text
Command (? for help): w

Final checks complete. About to write GPT data. THIS WILL OVERWRITE EXISTING
MBR PARTITIONS!! THIS PROGRAM IS BETA QUALITY AT BEST. IF YOU LOSE ALL YOUR
DATA, YOU HAVE ONLY YOURSELF TO BLAME IF YOU ANSWER 'Y' BELOW!

Do you want to proceed, possibly destroying your data? (Y/N)
```
Das Wichtige ist jetzt, dass die Partition /dev/sda1 eine eindeutige UID bekommen hat. Mit dem Kommando i von gdisk lässt man sie sich anzeigen:
<pre>Command (? for help): i
Using 1
Partition GUID code: EBD0A0A2-B9E5-4433-87C0-68B6B72699C7 (Linux/Windows data)
Partition unique GUID: 81E5BB0B-424E-4C19-8E7C-E678CBB3A588
First sector: 2048 (at 1024.0 KiB)
Last sector: 7821278 (at 3.7 GiB)
Partition size: 7819231 sectors (3.7 GiB)
Attribute flags: 0000000000000000
Partition name: 'Linux/Windows data'
</pre>

<h3>/-Filesystem kopieren</h3>
Auf der neuen Partition wird nun ein Filesystem erstellt, in das die Inhalte des derzeitigen Root-Filesystems hineinkopiert werden.
```text
root@raspberrypi:~# mke2fs -t ext4 -L rootfs /dev/sda1
root@raspberrypi:~# mount /dev/sda1 /mnt
root@raspberrypi:~# rsync -axv / /mnt
```
Das neue Filesystem hat ebenfalls eine eindeutige ID erhalten. Man lässt sie sich mit dem tune2fs-Befehl anzeigen.
<pre>root@raspberrypi:~# tune2fs -l /dev/sda1
tune2fs 1.42.5 (29-Jul-2012)
Filesystem volume name:   rootfs
Last mounted on:          /mnt
Filesystem UUID:          3ef6e847-75d2-4a31-a895-239ffe23a03c
...
</pre>

Diese UUID ist auf keinen Fall zu verwechseln mit der GUID der Partition!
In /dev/disk/by-uuid erscheint z.B. die Filesystem-UUID. IMHO wäre es logischer, wenn hier die Partitions-GUID aufgeführt wären.

<h3>Anpassen der Boot-Parameter</h3>
In /root/cmdline.txt befinden sich die Parameter, die dem Kernel beim Booten eines Raspberry Pi mitgegeben werden. Defaultmässig steht folgende Zeile drin:
<pre>dwc_otg.lpm_enable=0 rpitestmode=1 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait
</pre>

/dev/mmcblk0p2 ist die zweite Partition der SD-Karte. Man ändert jetzt den Parameter root=, damit das neue Root-Filesystem auf dem Stick gemountet wird.
<pre>dwc_otg.lpm_enable=0 rpitestmode=1 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 console=tty1 root=/dev/sda1 rootfstype=ext4 rootwait</pre>

Eine Sache gibt es hierbei aber zu beachten. Wenn man einen zweiten USB-Stick anschliesst, lässt sich nicht vorhersagen, welcher der beiden nach einem Reboot /dev/sda und welcher /dev/sdb wird. In so einem Fall ist es besser, die GUID der Partition zu verwenden:
<pre>dwc_otg.lpm_enable=0 rpitestmode=1 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 console=tty1 root=PARTUUID=81E5BB0B-424E-4C19-8E7C-E678CBB3A588 rootfstype=ext4 rootwait</pre>

Damit wird die Root-Partition immer erkannt, egal wieviele Sticks angeschlossen wurden und wie die Reihenfolge der /dev/sd*-Einträge lautet.

Unter Umständen wird nach dem Einschalten der Kernel gestartet, noch bevor sich die USB-Devices gemeldet haben. Hängt man ein "rootdelay=5" an die Parameterliste, dann wird eine Pause von 5 Sekunden eingelegt, bevor versucht wird, das Rootfilesystem zu mounten. Bis dahin sollte sich der USB-Stick initialisiert haben.

Der Ordnung halber wird noch die /etc/fstab angepasst. Das Rootfilesystem bzw. die Device-Spalte kann auf eine der drei folgenden Arten angegeben werden:
```text
/dev/sda1                                  /   ext4    defaults,noatime,async  0       0
LABEL=rootfs                               /   ext4    defaults,noatime,async  0       0
UUID=3ef6e847-75d2-4a31-a895-239ffe23a03c  /   ext4    defaults,noatime,async  0       0
```

Wie schon angemerkt, ist die Methode 1 nur dann angebracht, wenn nicht mehr als ein USB-Stick oder -Platte angeschlossen sind. Bei Methode 2 ist darauf zu achten, dass nur eins der existierenden Filesysteme das Label rootfs tragen darf. Methode 3 ist zwar am wenigsten leserlich, aber dafür am zuverlässigsten.

Wer sich eine Enttäuschung ersparen will, soll hier aufhören zu lesen und mit seinem Rootfilesystem auf USB glücklich sein. Wer wissen will, warum, der soll ans Ende dieses Postings springen.  Wer schmerzbefreit ist, soll weitermachen, sich aber hinterher nicht beklagen.

<h2>Raid</h2>
Im nächsten Abschnitt wird das Rootfilesystem auf einen Spiegel, bestehend aus zwei USB-Sticks, installiert. Dazu muss zunächst ein neuer Kernel gebaut werden, der Raid bzw. MD-Devices ohne Zuhilfenahme einer Init-Ramdisk beherrscht. Also erstmal ein Abstecher in Richtung Kernel/Firmware-Updates und -Selbercompilieren.

<h3>Firmware updaten</h3>

Auch ohne diese Raid- und USB-Spielereien kann es nicht schaden, immer wieder mal den von Raspberry gebauten Kernel zu aktualisieren.
```text
root@raspberrypi:~# mkdir raspberry
root@raspberrypi:~# cd raspberry
root@raspberrypi:~# git clone --depth 1 git://github.com/raspberrypi/firmware.git
root@raspberrypi:~# cd firmware/boot
root@raspberrypi:~# cp arm128_start.elf arm192_start.elf arm224_start.elf arm240_start.elf bootcode.bin loader.bin start.elf /boot
```

In den .elf-Dateien steckt die Firmware für die GPU. Sie entscheiden darüber, wieviel Speicher für die CPU und somit für Linux reserviert wird. Je nachdem, welche dieser Dateien nach start.elf kopiert wird, sind das 128, 192, 224 oder 240 Megabytes. Für das Kompilieren des Kernels sollte man sich so viel Speicher wie möglich sichern. Das geschieht mit
```text
cp /boot/arm240_start.elf /boot/start.elf
```

Nach einem Reboot hat der Linux-Kernel den grösstmöglichen Anteil am eh schon knapp bemessenen Hauptspeicher.
Nun werden die Kernelsourcen heruntergeladen und so konfiguriert, dass der MD-Driver und Raid0 fest eincompiliert werden.

<h3>Eigenen Kernel kompilieren</h3>
```text
root@raspberrypi:~# cd raspberry
root@raspberrypi:~# git clone --depth 1 git://github.com/raspberrypi/linux.git
root@raspberrypi:~# cd linux
root@raspberrypi:~# zcat /proc/config.gz > .config
root@raspberrypi:~# make menuconfig
```

Im Schritt "make menuconfig" hangelt man sich durch folgende Menüpunkte:<br/>
Device Drivers —> Multiple devices driver support (RAID and LVM) —> RAID support

```text
.config - Linux/arm 3.2.27 Kernel Configuration
 ──────────────────────────────────────────────────────────────────────────────
  ┌──────────── Multiple devices driver support (RAID and LVM) ─────────────┐
  │  Arrow keys navigate the menu.  <Enter> selects submenus --->.          │
  │  Highlighted letters are hotkeys.  Pressing <Y> includes, <N> excludes, │
  │  <M> modularizes features.  Press <Esc><Esc> to exit, <?> for Help, </> │
  │  for Search.  Legend: [*] built-in  [ ] excluded  <M> module  < >       │
  │ ┌─────────────────────────────────────────────────────────────────────┐ │
  │ │    --- Multiple devices driver support (RAID and LVM)               │ │
  │ │    {*}   RAID support                                               │ │
  │ │    [*]     Autodetect RAID arrays during kernel boot                │ │
  │ │    < >     Linear (append) mode                                     │ │
  │ │    <M>     RAID-0 (striping) mode                                   │ │
  │ │    {*}     RAID-1 (mirroring) mode                                  │ │
  │ │    < >     RAID-10 (mirrored striping) mode                         │ │
  │ │    {M}     RAID-4/RAID-5/RAID-6 mode                                │ │
```

Wichtig ist hier, dass bei "Raid Support" und "Raid-1" jeweils der Stern angewählt wird. Nach dem Abspeichern der Konfiguration werden dann der neue Kernel und die Module gebaut. Das kann etliche Stunden dauern.

```text
root@raspberrypi:~# make
root@raspberrypi:~# make modules
root@raspberrypi:~# cp arch/arm/boot/Image /boot/kernel.img
root@raspberrypi:~# make ARCH=arm modules_install INSTALL_MOD_PATH=/
```

Nach einem Reboot kann man prüfen, ob der neue Kernel mit Raid-1 umgehen kann:
```text
root@raspberrypi:~# dmesg|grep raid
[    2.148591] md: raid1 personality registered for level 1
...
```

<h3>Aufbauen des Spiegels</h3>
Als nächstes wird der zweite USB-Stick eingesteckt. Wenn man mit <b>tail -f /var/log/messages</b> die Systemmeldungen mitliest, sieht man, dass er unter /dev/sdb angesprochen werden kann. Da er ein Zwillingsbruder des ersten Sticks sein soll, muss dessen Partitionstabelle auf ihn übertragen werden.
```text
root@raspberrypi:~# sgdisk --replicate /dev/sdb /dev/sda
The operation has completed successfully.
root@raspberrypi:~# sgdisk --randomize-guids /dev/sdb
The operation has completed successfully.
root@raspberrypi:~# sgdisk --typecode=1:fd00 /dev/sdb
```

Mit dem zweiten Kommando wurde für die Partition sdb1 eine neue GUID generiert, da sie beim Replizieren unverändert vom sda1 übernommen wurde. Abschliessend wird der Partitionstyp noch auf "fd00 = Linux RAID" gesetzt.

Mit dem mdadm-Befehl wird nun ein neues Device angelegt, das zunächst nur aus einer Spiegelhälfte besteht:
```text
root@raspberrypi:~# mdadm --create /dev/md0 --level 1 --raid-devices=2 --metadata=0.90 missing /dev/sdb1
```

Auf dem Raid1-Device wird dann ein Filesystem angelegt, gemountet und mit dem Inhalt des bisherigen Rootfilesystems befüllt:
```text
root@raspberrypi:~# mke2fs -t ext4 /dev/md0
root@raspberrypi:~# mount /dev/md0 /mnt
root@raspberrypi:~# rsync -axv / /mnt
```

Anschliessend wird das System so vorbereitet, dass es beim Booten den Spiegel als Rootfilesystem mountet. Dazu ändert man /boot/cmdline.txt folgendermassen:
```text
dwc_otg.lpm_enable=0 rpitestmode=1 console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 console=tty1 root=/dev/md0 rootfstype=ext4 rootwait rootdelay=5
```
Auch in der /etc/fstab wird /dev/md0 als Device für das Rootfilesystem eingetragen.
Mit dem Kommando "poweroff" schaltet man den Raspberry Pi nun ab und zieht den ersten Stick (mit dem bisherigen Rootfilesystem auf sda1) ab.
Nach einem Reboot sollte nun der Spiegel unter / gemountet sein.
```text
root@raspberrypi:~# df
Filesystem     1K-blocks    Used Available Use% Mounted on
rootfs          15118600 4141560  10209048  29% /
/dev/root       15118600 4141560  10209048  29% /
tmpfs              23656     312     23344   2% /run
tmpfs               5120       0      5120   0% /run/lock
tmpfs              47312       0     47312   0% /tmp
tmpfs              10240       0     10240   0% /dev
tmpfs              47312       0     47312   0% /run/shm
/dev/mmcblk0p1     57288   41192     16096  72% /boot
root@raspberrypi:~# ls -l /dev/root
lrwxrwxrwx 1 root root 3 Aug 30 22:11 /dev/root -> md0
```

<h3>Zweite Hälfte des Spiegels hinzufügen</h3>
Nun wird der Stick Nr.1 wieder eingesteckt. Diesmal wird er unter dem Namen /dev/sdb in /var/log/messages auftauchen. Nachdem auch hier der Partitionstyp auf "Linux RAID" geändert wurde, kann der Spiegel vervollständigt werden:
```text
root@raspberrypi:~# sgdisk --typecode=1:fd00 /dev/sdb
root@raspberrypi:~# mdadm --manage /dev/md0 --add /dev/sdb1
```

In der Datei /proc/mdstat kann nun beobachtet werden, wie sich die beiden Spiegelhälften synchronisieren:
```text
root@raspberrypi:~# cat /proc/mdstat
Personalities : [raid1]
md0 : active raid1 sdb1[2] sda1[1]
      15359872 blocks [2/1] [_U]
      [>....................]  recovery =  0.3% (60032/15359872) finish=72.1min speed=3531K/sec
```

<h3>Die Blamage</h3>
Und nun die schlechte Nachricht. Das ganze Zeugs läuft nicht stabil.
```text
Aug 31 17:11:44 raspberrypi kernel: [  149.862492] usb 1-1.3.4: reset high-speed USB device number 7 using dwc_otg
Aug 31 17:11:58 raspberrypi kernel: [  163.743122] usb 1-1.3.7: reset high-speed USB device number 15 using dwc_otg
Aug 31 17:12:28 raspberrypi kernel: [  194.584437] usb 1-1.3.7: reset high-speed USB device number 15 using dwc_otg
Aug 31 17:12:59 raspberrypi kernel: [  225.045706] usb 1-1.3.7: reset high-speed USB device number 15 using dwc_otg
...
```

Ständig gibt es USB-Ausfälle und eine Hälfte des Spiegels verschwindet. Ich habe es sowohl mit USB3.0 als auch mit USB2.0-Sticks probiert. Gleiches Ergebnis. Nach ein paar Sekunden hängt "cat /proc/mdstat" und irgendwann bleibt es bei
```text
Personalities : [raid1]
md0 : active raid1 sdb1[2](F) sda1[1]
      3909504 blocks [2/1] [_U]
```

Etliche Versuche mit erweiterten Parametern für den dwc_otg-Treiber haben nichts gebracht. Die Hardware des Raspberry Pi ist wohl zu schwachbrüstig für so eine Installation. Auch das Abgleichen der beiden Spiegelhälften an einem anderen Rechner und Einbauen in den Raspberry Pi in synchronisiertem Zustand hat nichts geholfen.
Tut mir leid, bessere Nachrichten habe ich nicht. Ich bin jetzt selber sauer, dass es nicht funktioniert hat, aber das Geschriebene lasse ich trotzdem mal stehen. Vielleicht kann ja der eine oder andere ein paar Informationen davon brauchen.

Fazit: hochscrollen und mit einem einzelnen USB-Stick glücklich sein.