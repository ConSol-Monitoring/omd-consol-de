---
author: Gerhard Laußer
date: '2013-02-03T22:54:33+00:00'
slug: wie-man-sich-vor-unvorsichtigen-kollegen-schtzt
title: Wie man sich vor unvorsichtigen Kollegen schützt
---

<p>Ein überaus praktisches Feature der Bash ist die Möglichkeit, Kommandos erneut ausführen zu lassen, indem man einfach ein Ausrufezeichen gefolgt von den ersten paar Buchstaben eines Befehls eintippt. Die History wird dabei durchsucht, bis der letzte Befehl gefunden wird, der mit genau diesen Buchstaben anfing. Anschliessend wird er ausgeführt, was allerdings nicht immer das gewünschte Ergebnis liefert.</p><!--more--><p>Beispiel: </p>  <p>Kollege H ist als User root auf einem Server angemeldet und spielt irgendwann ein Backup einer Datenbank ein mit    <br /><strong>mysql –u sox –p soxpw sox &lt; /var/backups/sox.bck.2013-01-14.sql</strong> </p>  <p>Kollege L meldet sich als root auf dem Server an und hat im Hinterkopf, dass er irgendwann mal    <br /><strong>mysql –u root</strong>     <br />eingegeben hat.</p>  <p>Kollege L denkt sich: “hach, wie praktisch, Bash History Expansion ist schon genial…” und tippt    <br /><strong>!my</strong>     <br />    <br />Eine Nanosekunde später haut Kollege L auf CTRL-C und verhält sich anschliessend betont unauffällig.</p>  <p>Eine halbe Stunde später schreibt Kollege H: “hat irgendwer was mit der sox-Datenbank gemacht?”</p>  <p>Langer Rede kurzer Sinn: folgende Zeilen, ans Ende von <em>/root/.profile</em> gehängt, sorgen dafür, dass History Expansion ausgeschaltet wird, sobald sich jemand von L’s Rechnern einloggt.</p>  <pre><tt>clntaddr=${SSH_CLIENT%% *}
if [[ $clntaddr =~ 10.37.112.* ]] || [ $clntaddr = &quot;10.37.2.146&quot; ]; then
  echo hello lausser
  set +H
fi
</tt></pre>