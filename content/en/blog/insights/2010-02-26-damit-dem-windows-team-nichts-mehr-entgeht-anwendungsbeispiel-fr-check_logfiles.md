---
author: Gerhard Laußer
date: '2010-02-26T13:11:06+00:00'
slug: damit-dem-windows-team-nichts-mehr-entgeht-anwendungsbeispiel-fr-check_logfiles
tags:
- check_logfiles
title: Damit dem Windows-Team nichts mehr entgeht - Allesfresser check_logfiles
---

<p>Folgende Anfrage wurde von einem Kunden an mich gerichtet:</p>  <p><i>Jetzt kam von den Admin die Anfrage ob es nicht möglich ist alle Meldungen (winwarncrit) erstmal als Warning an Nagios zu melden, um dann bestimmte Meldungen nach und nach als Critical einzustufen, oder komplett zu verwerfen (exclude).      <br />Geht das?</i></p>  <!--more-->   <p>Vor dieser Aufgabenstellung dürften auch andere Nagios-Administratoren stehen. Die Windows-Leute sind durchaus an Nagios-Alarmen interessiert und wollen gerne alle Fehlermeldungen (WARNING und ERROR) aus dem Eventlog gemeldet bekommen. Da allerdings von vornherein noch nicht bekannt ist, was da alles an Meldungen auftaucht und man nicht um drei Uhr morgens von einem Alarm geweckt werden will, der im Eventlog als ERROR drinsteht, aber im Grunde harmlos ist, sollen zunächst sämtliche Events als Warnung eingestuft werden. (Es wird davon ausgegangen, daß zu nachtschlafener Zeit keine Notifications vom Typ WARNING an das Bereitschaftshandy geschickt werden).</p>  <p>Also werden folgende Rahmenbedingungen in der Konfiguration von check_logfiles abgebildet:</p>  <ul>   <li>Man möchte grundsätzlich alles mitbekommen, was im Eventlog als WARNING oder ERROR auftaucht.      <br />Das geht, indem man einen entsprechenden <strong>includefilter</strong> setzt.       <br /></li>    <li>Man möchte nicht um drei Uhr morgens durch einen Alarm geweckt werden, der im Eventlog als ERROR steht, aber im Grunde harmlos ist.      <br />Das erreicht man, indem man eine "catch-all"-Regexp <strong>'<strong>.*</strong>'</strong> in <strong>warningpatterns</strong> definiert.       <br /></li>    <li>Man möchte manche Meldungen, die im Eventlog als WARNING oder ERROR stehen, komplett verwerfen.      <br />Dazu trägt man diese Meldungen in <strong>warningexceptions</strong> ein.&#160; <br /></li>    <li>Meldungen, die wirklich kritisch sind, sollen den Nagios-Status CRITICAL erhalten und somit auch in der Nacht einen Alarm auslösen.      <br />Dazu trägt man diese Meldungen in <strong>criticalpatterns</strong> ein. </li> </ul>  <p>Einen Schönheitsfehler hat die Sache aber noch. Findet check_logfiles einen Event, der in <strong>criticalpatterns</strong> aufgeführt wurde, so wird er als CRITICAL gezählt. Zugleich schlägt aber immer noch das '<strong>.*</strong>' in den <strong>warningpatterns</strong> zu. Das bedeutet, daß die Ausgabe von check_logfiles in dem Fall so aussehen wird:</p>  ```bash
CRITICAL - (1 errors, 1 warnings) - Suelzomat reports fatal error
```

<p>Das erfüllt zwar seinen Zweck, ist aber ein wenig irreführend. Richtigerweise dürfte keine WARNING gezählt werden. Aus diesem Grund gibt es die Option <strong>preferredlevel</strong>, die dafür sorgt, daß bei so einem Mehrfachtreffer dieser nur einmal, entweder als WARNING oder als CRITICAL, gezählt wird. In diesem Fall ist die WARNING überflüssig, deshalb setzt man <strong>preferredlevel</strong> auf <strong>critical</strong>. Damit erscheint dann bei der gleichen Fehlersituation die Ausgabe:</p>

```bash
CRITICAL - (1 errors) - Suelzomat reports fatal error
```

<p>Eine vollständige Konfiguration sieht dann so aus:</p>

```perl
@searches = ({
  tag => 'sysevt',
  type => 'eventlog',
  eventlog => {
    eventlog => 'system',
    include => {
      eventtype => 'error,warning',
    },
  },
  options => 'preferredlevel=critical,eventlogformat="id:%i so:%s ca:%c msg:%m"',
  criticalpatterns => [
      # hier stehen die Events (die im Eventlog vom Typ Warning oder Error sein können)
      # bei deren Auftauchen sofort gehandelt werden muss, die also Nagios-seitig
      # als CRITICAL eingestuft werden sollen.
      'id:7034 so:Service_Control_Manager .* msg:Dienst .* wurde unerwartet beendet',
      'id:7000 so:Service_Control_Manager .* msg:Der Dienst .* wurde .* nicht gestartet',
      'id:1069 so:ClusSvc .* msg:Cluster Resource .* in Ressourcengruppe .* ist fehlgeschlagen',
      ...
  ],
  warningexceptions => [
      # die hier aufgeführten Events, sollen nicht weiter beachtet werden.
      'id:1111 so:TermServDevices .* msg:Der für den Drucker .* erforderliche Treiber .* ist unbekannt',
      ...
  ],
  warningpatterns => [
      # sämtliche anderen Events (auch solche, die noch niemals vorgekommen sind)
      # erscheinen in Nagios als WARNING.
      '.*'
  ],
})
```