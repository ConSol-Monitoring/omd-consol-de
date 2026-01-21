---
author: Gerhard Laußer
date: '2010-04-12T12:55:41+00:00'
slug: berwachen-von-eventlogs-mit-check_logfiles-und-einem-domain-benutzer
title: Überwachen von Eventlogs mit check_logfiles und einem Domain-Benutzer
---

<p>Seit der Version 3.2 von check_logfiles ist es einfach geworden, Eventlogs von Windows-Servern auszulesen, ohne auf diesen das Plugin installieren zu müssen. Es wird jetzt nur noch ein &quot;Gatewayserver&quot; sowie ein Domainbenutzer <i>nagios</i> benötigt. </p> <!--more-->  <p>Auf dem Gatewayserver richtet man eine NSClient++-Umgebung ein und installiert das Plugin check_logfiles.exe. Der Zugriff auf die Eventlogs aller anderen Server geschieht dann mit Windows-Bordmitteln. Angenommen, zu diesem Zweck wurde der Benutzer <i>nagios</i> in der Domain <i>NAPRAX</i> eingerichtet, so formuliert man den Abschnitt &quot;eventlog&quot; in der check_logfiles-Konfigurationsdatei folgendermaßen:</p>  ```perl
@searches = ({
  tag => 'evt_sec',
  type => 'eventlog',
  eventlog => {
    eventlog => 'security',
    computer => '10.0.12.127',
    username => 'NAPRAX\nagios',
    password => '_geheim_',
  },
  criticalpatterns => '.*',
});
```
Damit man nun nicht für jeden Client so einen Abschnitt mit eigenem Tag erstelle muss, kann man Ziel-Eventlog und Zugangsdaten auch als Macros angeben:

```perl
@searches = ({
  tag => 'evt_sec',
  type => 'eventlog',
  eventlog => {
    eventlog => '$CL_EVT_EVTLOG$',
    computer => '$CL_EVT_COMPUTER$',
    username => '$CL_EVT_USERNAME$',
    password => '$CL_EVT_PASSWORD$',
  },
  criticalpatterns => '.*',
});
```

Der Plugin-Aufruf, bei dem die Zugangsdaten in dynamischer Form bereitgestellt werden, lautet dann:

```text
check_logfiles.exe --config config.cfg
  --macro CL_EVT_EVTLOG=security --macro CL_EVT_COMPUTER=10.0.12.127
  --macro CL_EVT_USERNAME=NAPRAX\nagios --macro CL_EVT_PASSWORD=_geheim_
```

Wie sorgt man aber dafür, daß der Domainbenutzer NAPRAX\nagios überall die Berechtigung zum Lesen der Eventlogs besitzt? In einer homogenen Umgebung, in der nur Windows Server 2008 zum Einsatz kommen, ist das ein Kinderspiel. Bei dieser Betriebssystemversion gibt es die Gruppe &quot;Ereignisprotokolleser&quot;, die genau diese gewünschte Berechtigung bereitstellt. Man muss nur noch dafür sorgen, daß der Domain-User NAPRAX\nagios auf allen Clients Mitglied in dieser Gruppe ist. Das erreicht man ganz einfach mittels einer Group Policy, deren Einrichtung im folgenden Video gezeigt wird.

<object width="640" height="505"><param name="movie" value="http://www.youtube.com/v/oNs2zcWmIBY&amp;hl=de_DE&amp;fs=1&amp;"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/oNs2zcWmIBY&amp;hl=de_DE&amp;fs=1&amp;" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="505"></embed></object>

Bei einem AD-Controller und Clients unter Windows Server 2003 geht es leider nicht so einfach. Machbar ist die domainweite Rechtevergabe aber trotzdem. Wie das geht, ist unter <a href="http://support.microsoft.com/kb/323076/EN-US/">http://support.microsoft.com/kb/323076/EN-US/</a> beschrieben.