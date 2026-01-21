---
author: Gerhard Laußer
date: '2014-10-11T13:54:47+00:00'
slug: epel-repository-in-centos-einbinden
title: EPEL-Repository in CentOS einbinden
---

<p>Immer wenn ich bei einem CentOS-System Pakete aus der EPEL-Kollektion installieren will, muss ich in meinem schlauen Büchlein blättern oder rumgoogeln, wie das Einbinden des EPEL-Repositories funktioniert. Deshalb halte ich es mal an dieser Stelle hier fest, dann finde ich das richtige Kommando beim nächsten Mal auf Anhieb.</p>

~~~
# CentOS 7 64bit
rpm -i http://download.fedoraproject.org/pub/epel/7/x86_64/epel-release-7-2.noarch.rpm
# CentOS 6 32bit
rpm -i http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# CentOS 6 64bit
rpm -i http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
# CentOS 5 32bit
rpm -i http://download.fedoraproject.org/pub/epel/5/i386/epel-release-5-4.noarch.rpm
# CentOS 5 64bit
rpm -i http://download.fedoraproject.org/pub/epel/5/x86_64/epel-release-5-4.noarch.rpm
~~~