---
author: Gerhard Laußer
date: '2009-10-27T13:19:42+00:00'
slug: check_hpasm-sneak-preview
tags:
- check_hpasm
title: check_hpasm Sneak Preview
---

<p>Das Redesign von check_hpasm (Hauptgrund war die Unterst&uuml;tzung der neuen Proliant *G6) ist nun doch umfangreicher geworden, als ich dachte. Daf&uuml;r ist der Code jetzt um einiges wartbarer und erm&ouml;glicht es, neue Features schneller und ohne Gefrickel einzubauen. Geplant ist ausserdem die Unterst&uuml;tzung von HP BladeCenter und Storagesystemen (Proliant 4LEE). Ein erstes Testrelease ist nun fertig.</p>
<p><!--more--></p>
<p>Was geht:</p>
<ul>
	<li>G6-Modelle per SNMP</li>
	<li>Ein rudiment&auml;rer Check f&uuml;r BladeCenter</li>
	<li>Dump der gefundenen Komponenten mit -vvv</li>
</ul>
<p>Was geht (noch) nicht:</p>
<ul>
	<li>Platten pr&uuml;fen mit hpasmcli bzw. hpacucli</li>
	<li>Blacklisting</li>
</ul>
<p>Viel Spass damit...</p>
<p><a href="/assets/downloads/nagios/check_hpasm-4pre.tar.gz">check_hpasm-4pre.tar.gz</a></p>