---
author: Gerhard Laußer
date: '2014-01-31T00:30:59+00:00'
slug: neues-feature-von-check_logfiles-teilausdrcke-gruppieren
title: 'Neues Feature von check_logfiles: Teilausdrücke gruppieren'
---

<p>Reguläre Ausdrücke in Perl erlauben die Bildung von Teilausdrücken. Mit runden Klammern kann man bestimmte Abschnitte eines Ausdrucks zusammenfassen, um sie an anderer Stelle oder nach dem Mustervergleich weiterzuverwenden.</p>  ```perl
$line =~ /Fatal: error (\d+) occured/;
$errorcode = $1;
```

<p>Bei check_logfiles kann dies benutzt werden, um aus Trefferzeilen die relevanten Teilstrings zu extrahieren und so die Ausgabe des Plugins zu verkürzen.</p><!--more--><p>Ein Kunde wollte bei Ergebniszeilen folgender Art keine entsprechend lange Meldung erhalten:</p>

<p><em>Jan&#160; 8 07:23:23 tp23w24m3 et_syslog[5476]: E|NOKEY|Jan&#160; 8 07:23:23 2014|etlog.log.app.EVSQueueSvr.12|12|af13w34k1|&#160;&#160;&#160; 5476|det&#160;&#160;&#160;&#160; |init_sql.cp|195|Embedded sql error from file DB_Dequeue line 2769,&#160; node PRTRPS2A101M3 db PRA_OrdQueueDB , sqlerrcode -1204, 1 of 1 - &quot;ASE has run out of LOCKS. Re-run your command when there are fewer active users, or contact a user with System Administrator (S”|5476.0012</em></p>

<p>Sein Vorschlag war, in den criticalpatterns durch Gruppierung mit runden Klammern die für ihn wichtigen Informationen herauszuziehen und die Trefferzeilen on-the-fly in Kurzform umzuschreiben.</p>

<p>Statt</p>

```perl
criticalpatterns => [
    ....
    '.*ASE has run out of LOCKS.*',
],
```

<p>heisst es nun </p>

```perl
criticalpatterns => [
    ....
    'node (.*) db (.*) .*(ASE has run out of LOCKS).*',
],
options => 'supersmartscript,capturegroups',
script => sub {
    printf '%s@%s: %s\n',
        $ENV{CHECK_LOGFILES_CAPTURE_GROUP2},
        $ENV{CHECK_LOGFILES_CAPTURE_GROUP1},
        $ENV{CHECK_LOGFILES_CAPTURE_GROUP3};
    return 2;
},
```

<p>Damit nimmt obige Trefferzeile den Wert &quot;<em>PRA_OrdQueueDB@PRTRPS2A101M3: ASE has run out of LOCKS</em>&quot; an, so als hätte sie von Anfang an (also im Logfile) als diese Kurzfassung existiert und wäre so von check_logfiles gefunden worden. Die Perl-Variablen $1, $2 etc. liegen im Handlerscript als Environmentvariablen <em>$ENV{CHECK_LOGFILES_CAPTURE_GROUPn}</em> vor. Da dieses Feature eine kleine Performanceeinbusse mit sich bringen kann (welche aber erst bei Suchläufen über tausende von Zeilen relevant ist), muss sie explizit mit der Option <em>capturegroups</em> eingeschaltet werden. </p>