---
author: Philip Griesbacher
date: '2016-10-10'
featured_image: /assets/2017-10-10-android-sakuli/icon.png
tags:
- Android
title: Sakuli EndToEnd Tests mit Android
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="icon.png" alt=""></div>
Sakuli wird für EndToEnd mit Linux und Windows Applikationen bereits vielfach eingesetzt. Wie sieht es aber mit Android, dem [verbreitetsten]( https://www.gartner.com/newsroom/id/3415117) mobilen Betriebssystem, aus? Hierzu ein Beispiel.
<!--more-->
Um die Katze gleich aus dem Sack zu lassen, Sakuli wird nicht nativ auf dem Androidgerät ausgeführt, sondern steuert ein Android Virtual Device (AVD).

### Android Virtual Device
Das [Android Virtual Device](https://developer.android.com/studio/run/managing-avds.html) ist ein Bestandteil der Android Development Tools, welche [hier](https://developer.android.com/studio/index.html#downloads) frei zum Download zur Verfügung stehen. AVD ist ein Emulator, mit dem eine Vielzahl von Geräten simuliert werden kann. Dabei können verschiedene Hardwarearchitekturen, Displaymaße sowie alle üblichen Androidversionen emuliert werden. Grob kann man es mit einer Virtualisierungstechnik wie Virtualbox vergleichen.
Damit die Tests reproduzierbar sind beziehungsweise die virtuellen Geräte sich stabil verhalten, hier ein paar Hinweise:
* AVDs sollten nicht in einer virtuellen Maschine ausgeführt werden
* Es sollte immer [HAXM]( https://software.intel.com/en-us/android/articles/intel-hardware-accelerated-execution-manager) installiert werden, dies ermöglicht eine sehr viel effizientere Emulierung. Dementsprechend sollte als Zielarchitektur x86 verwendet werden.
* RAM und Heap benötigen sehr viel Arbeitsspeicher, dieser sollte deshalb nicht zu klein dimensioniert werden.
* [Hier]( https://github.com/Griesbacher/sakuli_android_example/blob/master/config.ini) eine AVD Konfiguration, die im folgendem Beispiel verwendet wird.

### Beispiel
In Folgenden wird die verwendete Androidversion getestet und ob sich das Layout dieses Blogs sich an die Größenveränderung bei dem Schwenk von Picturemode(vertikal) zu Landscapemode(horizontal) anpasst.
Der gesamte Aufbau ist [hier](https://github.com/Griesbacher/sakuli_android_example) zu finden.

#### Sakuli Konfiguration
Da in diesem Beispiel keine Sahi Komponenten verwendet werden, sondern nur Sikuli, wird in der [testsuit.properties]( https://github.com/Griesbacher/sakuli_android_example/blob/master/android_example/testsuite.properties#L57) der Browser „deaktiviert“. Dazu wird der Browser PhantomJS verwendet, welcher fensterlos arbeitet, mehr dazu [hier]( https://github.com/ConSol/sakuli/blob/d9728d409bb61f7d93e8f92c0a47a45ad95be038/docs/installation-client.md#phantomjs).

#### AVD Konfiguration
Wie zuvor beschrieben, wird ein konfiguriertes AVD benötigt. In diesem Fall wird ein Nexus7 verwendet, das Android 7.0 installiert hat. Für die Konfiguration siehe [hier]( https://github.com/Griesbacher/sakuli_android_example/blob/master/config.ini). Wichtig ist auch, dass der Name des Geräts Nexus7 ist, da es über diesen gestartet wird.

#### Sakuli Script
Das verwendete Script ist [hier]( https://github.com/Griesbacher/sakuli_android_example/blob/master/android_example/android_demo/android_demo.js) zu finden.
Um den Test selbst auszuführen, muss in [Zeile 19]( https://github.com/Griesbacher/sakuli_android_example/blob/master/android_example/android_demo/android_demo.js#L19) der Pfad des Android SDK angepasst werden. Der Test wurde für einen Windowshost geschrieben, soll dieser auf Linux portiert werden, müssen die [Zeilen 27 und 28]( https://github.com/Griesbacher/sakuli_android_example/blob/master/android_example/android_demo/android_demo.js#L27-L28) angepasst werden. Der restliche Code sollte plattformunabhängig sein.

#### Resultat
{% youtube vbdJRI_MYcs %}

### Sahi
Für die Webtesting-Komponente Sahi, gibt es unter folgendem [Link]( https://sahipro.com/docs/using-sahi/run-sahi-on-android.html) eine Erklärung wie man diese mit Androidsystemen verwenden. Hierbei wird ein weiterer Browsertyp in Sahi hinterlegt und in dem zu testendem Gerät wird der Sahiproxy eingetragen, anschließend verlaufen die Tests wie mit einem „normalen“ Browser.