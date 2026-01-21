---
author: Gerhard Laußer
date: '2011-02-18T16:49:13+00:00'
slug: wenn-der-esx-server-keine-icinga-vm-annimmt
tags:
- Icinga
title: Wenn der ESX-Server keine Icinga-VM annimmt...
---

Wer sich die neueste Version von <a href="http://www.icinga.org">Icinga</a> zum Ausprobieren herunterladen will, greift aus Bequemlichkeit sicher auf die virtuelle Maschine zurück, die bereits eine vorgefertigte, vollständige Installation enthält. Das dabei verwendete ova-Format kann allerdings nicht ohne weiteres in einer VMware-Umgebung verwendet werden. Zwar taucht auch ova in den von VMware unterstützten Virtualisierungsformaten auf, in diesem speziellen Fall trifft das jedoch nicht zu. Der VMware vCenter Converter zumindest weigert sich, die Icinga-Datei anzunehmen. Was man tun muss, um Icinga.ova in einen ESX-Server hochzuladen, wird hier beschrieben.

<!--more-->
<p>Zuerst zerlegt man Icinga.ova in seine beiden Bestandteile, die virtuelle Disk Icinga-disk1.vmdk und die Beschreibungsdatei Icinga.ovf. Das funktioniert ganz einfach mit dem tar-Kommando.</p>
<div class="listingblock">
<div class="content">
<pre><tt>tar xf Icinga.ova</tt></pre>
</div></div>
<p>Danach muss man die ovf-Datei in eine vmx-Datei umwandeln. Hierfür findet man auf der Webseite von VMware das <a href="http://www.vmware.com/support/developer/ovf">OVF Tool</a>.</p>
<p>Grundsätzlich lautet das Kommando zur Konvertierung</p>
<div class="listingblock">
<div class="content">
<pre><tt>ovftool Icinga.ovf Icinga.vmx</tt></pre>
</div></div>
<p>An dieser Stelle kracht es aber erstmal und man bekommt die Fehlermeldung:</p>
<div class="listingblock">
<div class="content">
<pre><tt>Opening OVF source: Icinga.ovf
Warning: No manifest file
Opening VMX target: Icinga.vmx
Warning:
 - The specified operating system identifier 'Linux26_64' (id: 100) is not supported on the selected host. It will be mapped to the following OS identifier: ''.
Error: OVF Package is not supported by target:
 - Line 25: Unsupported hardware family 'virtualbox-2.2'.</tt></pre>
</div></div>
<p>Man muss daher das ovf-File von Hand so abändern, daß es vom ovftool akzeptiert wird. Als Beispiel sei der Typ des Festplattencontrollers genannt, der von SATA nach SCSI geändert werden muss. Auch die Soundkarte fliegt raus.
Kurz, man muss folgenden <a href="/assets/2011-02-18-wenn-der-esx-server-keine-icinga-vm-annimmt/patch.icinga-1.3.0.ovftool">Patch</a> gegen die Datei Icinga.ovf anwenden.</p>
<div class="listingblock">
<div class="content">
<pre><tt>--- Icinga.ovf  2011-02-15 17:24:55.000000000 +0100
+++ VMIcinga.ovf        2011-02-18 15:36:03.734559400 +0100
@@ -15,10 +15,8 @@
   &lt;/NetworkSection&gt;
   &lt;VirtualSystem ovf:id="Icinga"&gt;
     &lt;Info&gt;A virtual machine&lt;/Info&gt;
+    &lt;OperatingSystemSection ovf:id="80" ovf:version="5" vmw:osType="rhel5_64Guest"&gt;
       &lt;Info&gt;The kind of installed guest operating system&lt;/Info&gt;
-      &lt;Description&gt;Linux26_64&lt;/Description&gt;
-      &lt;vbox:OSType ovf:required="false"&gt;Fedora_64&lt;/vbox:OSType&gt;
     &lt;/OperatingSystemSection&gt;
     &lt;VirtualHardwareSection&gt;
       &lt;Info&gt;Virtual hardware requirements for a virtual machine&lt;/Info&gt;
@@ -26,7 +24,7 @@
         &lt;vssd:ElementName&gt;Virtual Hardware Family&lt;/vssd:ElementName&gt;
         &lt;vssd:InstanceID&gt;0&lt;/vssd:InstanceID&gt;
         &lt;vssd:VirtualSystemIdentifier&gt;Icinga&lt;/vssd:VirtualSystemIdentifier&gt;
-        &lt;vssd:VirtualSystemType&gt;virtualbox-2.2&lt;/vssd:VirtualSystemType&gt;
+        &lt;vssd:VirtualSystemType&gt;vmx-07, vmx-04&lt;/vssd:VirtualSystemType&gt;
       &lt;/System&gt;
       &lt;Item&gt;
         &lt;rasd:Caption&gt;1 virtual CPU&lt;/rasd:Caption&gt;
@@ -65,12 +63,11 @@
       &lt;/Item&gt;
       &lt;Item&gt;
         &lt;rasd:Address&gt;0&lt;/rasd:Address&gt;
-        &lt;rasd:Caption&gt;sataController0&lt;/rasd:Caption&gt;
-        &lt;rasd:Description&gt;SATA Controller&lt;/rasd:Description&gt;
-        &lt;rasd:ElementName&gt;sataController0&lt;/rasd:ElementName&gt;
+        &lt;rasd:Description&gt;SCSI Controller&lt;/rasd:Description&gt;
+        &lt;rasd:ElementName&gt;SCSI Controller 0&lt;/rasd:ElementName&gt;
         &lt;rasd:InstanceID&gt;5&lt;/rasd:InstanceID&gt;
-        &lt;rasd:ResourceSubType&gt;AHCI&lt;/rasd:ResourceSubType&gt;
-        &lt;rasd:ResourceType&gt;20&lt;/rasd:ResourceType&gt;
+        &lt;rasd:ResourceSubType&gt;lsilogic&lt;/rasd:ResourceSubType&gt;
+        &lt;rasd:ResourceType&gt;6&lt;/rasd:ResourceType&gt;
       &lt;/Item&gt;
       &lt;Item&gt;
         &lt;rasd:AutomaticAllocation&gt;true&lt;/rasd:AutomaticAllocation&gt;
@@ -90,16 +87,6 @@
         &lt;rasd:ResourceType&gt;23&lt;/rasd:ResourceType&gt;
       &lt;/Item&gt;
       &lt;Item&gt;
-        &lt;rasd:AddressOnParent&gt;3&lt;/rasd:AddressOnParent&gt;
-        &lt;rasd:AutomaticAllocation&gt;false&lt;/rasd:AutomaticAllocation&gt;
-        &lt;rasd:Caption&gt;sound&lt;/rasd:Caption&gt;
-        &lt;rasd:Description&gt;Sound Card&lt;/rasd:Description&gt;
-        &lt;rasd:ElementName&gt;sound&lt;/rasd:ElementName&gt;
-        &lt;rasd:InstanceID&gt;8&lt;/rasd:InstanceID&gt;
-        &lt;rasd:ResourceSubType&gt;ensoniq1371&lt;/rasd:ResourceSubType&gt;
-        &lt;rasd:ResourceType&gt;35&lt;/rasd:ResourceType&gt;
-      &lt;/Item&gt;
-      &lt;Item&gt;
         &lt;rasd:AddressOnParent&gt;0&lt;/rasd:AddressOnParent&gt;
         &lt;rasd:AutomaticAllocation&gt;true&lt;/rasd:AutomaticAllocation&gt;
         &lt;rasd:Caption&gt;cdrom1&lt;/rasd:Caption&gt;</tt></pre>
</div></div>
<p>Damit funktioniert dann auch die Konvertierung mit dem OVF Tool. Es ist nur noch darauf zu achten, daß man der Ziel-VM einen anderen Namen als "Icinga" gibt, denn dies führt zu einem Namenskonflikt. In diesem Beispiel heisst das Ziel "vmicinga".</p>
<div class="listingblock">
<div class="content">
<pre><tt>ovftool Icinga.ovf vmicinga.vmx</tt></pre>
</div></div>
<p>Das läuft nun eine Weile, aber hinterher bekommt man die zwei Dateien vmicinga.vmx und vmicinga-disk1.vmdk, die man mit dem VMware vCenter Converter in einen ESX-Server hochladen kann.</p>