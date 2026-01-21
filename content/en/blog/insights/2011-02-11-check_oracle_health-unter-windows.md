---
author: Gerhard Laußer
date: '2011-02-11T00:17:39+00:00'
slug: check_oracle_health-unter-windows
tags:
- check_oracle_health
title: check_oracle_health unter Windows
---

Seit einigen Versionen ist check_oracle_health auch unter Windows lauffähig, was anscheinend nur wenig bekannt ist. In vielen Firmen ist auf den Arbeitsplatz-PCs ein Oracle-Client installiert, mit dem Applikationen auf die Unternehmensdatenbanken zugreifen. Es ist daher nur logisch, wenn beim Monitoring die Verfügbarkeit einer Datenbank aus der Sicht so eines PCs geprüft wird.

<!--more-->
Natürlich ist es auch möglich, check_oracle_health auf dem meist Linux-basierten Nagios-Server auszuführen, aber die Überwachung findet näher an der Realität statt, wenn man einen typischen Arbeitsplatzrechner nachbildet. Es sind ja durchaus Fehlersituationen denkbar, deren Ursache in der Windows-Client-Software zu suchen ist.
check_oracle_health kann auf zwei Arten ausgeführt werden:
<ul>
	<li>Analog zu Unix als Perl-Plugin. Dazu ist die Installation eines Perl-Interpreters erforderlich. Empfohlen wird Strawberry Perl.</li>

	<li>Als Windows-Executable. Da nicht jeder Administrator Perl auf einem produktiven Windows-Rechner installieren möchte, soll im Folgenden gezeigt werden, wie man aus dem Plugin check_oracle_health ein Executable check_oracle_health.exe macht.</li>

</ul>

Für die Compilierung braucht man das bereits erwähnte <a href="http://strawberryperl.com">Strawberry Perl</a>. Weiter braucht man das Perl-Modul <a href="http://search.cpan.org/~rschupp/PAR-Packer-1.008/lib/PAR/Packer.pm">PAR::Packer</a>, welches man mit der CPAN-Shell installiert.
Auf einem Unix-Rechner (oder in einer Cygwin-Umgebung auf dem Windows-Build-PC) baut man mit dem bekannten "./configure; make" das Plugin check_oracle_health. Dieses kopiert man auf den Build-PC und erzeugt mit folgendem Befehl das Executable:
```bash
pp -o check_oracle_health.exe check_oracle_health
```
Legt man dies nun auf dem Produktivsystem ab, so daß der nsclient++-Agent darauf zugreifen kann, so kann man z.B. folgendes Kommando in der Datei NSC.ini eintragen.
<pre>
[External Script]
allow_arguments=1
check_oracle_health=scripts\check_oracle_health.exe --mode $ARG1$ ...
</pre>