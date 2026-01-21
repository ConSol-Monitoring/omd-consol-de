---
author: Gerhard Laußer
date: '2013-05-24T16:41:39+00:00'
slug: wie-man-einem-plugin-das-maul-stopft
title: Wie man einem Plugin das Maul stopft
---

Ein Monitoring-Kunde wünschte sich, dass alle WARNINGs, welche aus der Vmware-Ungebung stammen, als CRITICALs dargestellt werden. Mit dem Tool <b>negate</b> ist das normalerweise kein Problem, man schreibt den Check einfach um in:
<div class="listingblock">   <div class="content">     <pre><tt>
$USER1$/negate --warning=CRITICAL $USER1$/check_vmware_api.pl ....
</tt></pre></div></div>
Leider machte mir etwas anderes einen Strich durch die Rechnung. check_vmware_api.pl schreibt nämlich eine Warnung auf STDERR raus:
<div class="listingblock">   <div class="content">     <pre><tt>
Subroutine IO::Socket::INET6::sockaddr_in6 redefined at /omd/sites/sagichnicht/lib/perl5/lib/perl5/Exporter.pm line 66. at /usr/lib/perl5/vendor_perl/5.10.0/Socket/INET6.pm line 21
</tt></pre></div></div>
<!--more-->
Bisher hat diese Meldung nicht weiter gestört, man bekommt sie nur zu Gesicht, wenn man in Service Detais reinklickt. (Update der entspr. Perl-Module würde das Problem lösen, ist aber momentan keine Option)
Das Verhalten von <b>negate</b> ist nun so, dass <i>grundsätzlich</i> eine WARNING geliefert wird, wenn das Plugin, dessen Exit-Code manipuliert werden soll, irgendwas auf STDERR schreibt. Die Abbildung auf CRITICAL ist daher unmöglich.
Was letztlich geholfen hat, war das Umleiten von STDERR nach /dev/null. Dazu fügt man einfach zwei Zeilen am Anfang des Plugins ein (noch vor den use-Anweisungen):
<div class="listingblock">   <div class="content">     <pre><tt>
open DEVNULL, ">>/dev/null";
*STDERR = *DEVNULL;
</tt></pre></div></div>