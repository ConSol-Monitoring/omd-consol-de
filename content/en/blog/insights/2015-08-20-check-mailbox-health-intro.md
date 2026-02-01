---
author: Gerhard Laußer
date: '2015-08-20T20:10:25+02:00'
tags:
- plugin
title: Nachmittags kommt die Post
---

Es gibt wieder mal ein neues Plugin, diesmal geht es um die Überwachung von Postfächern/Mailservern/Mailempfang etc. Mit [check_mailbox_health][1] prüft man, 

* ob ein Mailserver antwortet bzw. ein Login zulässt
* Mails im Postfach liegen
* wie alt diese sind
* ob sie ein bestimmtes Subject haben (oder ein Suchmuster im Text vorkommt)
* ob sie Attachments (ggf. eines bestimmten Typs) haben

Mit check_mailbox_health lassen sich so auch nicht ganz triviale, auf Mail basierende Geschäftsvorgänge monitoren.
<!--more-->
Beispiel für eine Anforderung: 

* Bestellungen, die per Mail reinkommen, müssen innerhalb einer halben Stunde angenommen und in einen In-Bearbeitung-Folder verschoben werden.
* D.h. es darf in der INBOX keine Mails geben, die älter als eine halbe Stunde sind.

```bash
$ check_mailbox_health --hostname imap.musterkg.de --mode mail-age \
    --username 'MUKG\bestellung' --password geheim \
    --warning 30 --critical 30 \
CRITICAL - 2 mails in mailbox, age of the oldest mail is 32 minutes
```
Die Ausgabe des Plugins kann mit dem Parameter --morphmessage noch an den individuellen Einsatzzweck angepasst werden.

```bash
$ check_mailbox_health --hostname imap.musterkg.de --mode mail-age \
    --username 'MUKG\bestellung' --password geheim \
    --warning 30 --critical 30 \
    --morphmessage '^OK.*'='OK - gibt nix zu tun' \
    --morphmessage '^CRITICAL.*'='CRITICAL - Bestellung liegt seit 30min rum!!'
CRITICAL - Bestellung liegt seit 30min rum!!
```

Ein weiteres Beispiel, zugegeben, etwas verwirrend:

* Täglich im Laufe des Nachmittags werden Daten angeliefert und importiert. Der genaue Zeitpunkt ist nicht bekannt.
* Ab 17:00 will man wissen, ob etwas gekommen ist, damit man ggf. nervös werden kann.
* Allerspätestens um 18:00 muß etwas gekommen sein. Wenn nicht, wird sofort hinterhertelefoniert und so lange am Telefon geblieben, bis die Mail empfangen wurde. Oder es stellt sich heraus, daß heute gar nichts mehr passiert. Auch gut, man muß es nur wissen.
* Um 19:00 ist Geschäftsschluß, bis dahin sollte der entsprechende Service bei der letzten Kontrolle grün sein. (Im Dashboard, das die kritischen Prozesse zeigt)
* Wenn der Import funktioniert hat, schickt das zuständige Script eine Mail mit dem Subject "Einspielung der Stammdaten aus Excel erfolgreich".

Wir brauchen also einen Check, der

* ab 17:00 läuft
* nachsieht, ob eine Mail mit dem gesuchten Subject in der Mailbox liegt und nicht von gestern oder irgendwann ist, sondern von heute nachmittag
* bis 18:00 rot werden kann
* ab 18:00 dann wieder grün werden soll, weils eh Wurscht ist

```text
define command {
  command_name check_mailbox_health
  command_line $USER1$/check_mailbox_health \
               --hostname '$ARG1$' \
               --username '$ARG2$' \
               --password '$ARG3$' \
               --timeout 120 \
               --mode $ARG4$ $ARG5$ 
}

define service {
  service_description last_xls_import
  ...
  check_command check_mailbox_health!imap.musterkg.de!MUKG\imports!geheim!\
                count-mails!\
                --regexp \
                --select subject='Einspielung .* Excel .* erfolgreich' \
                --select newer_than='today 12:00' \
                --warning 1: --critical 1: \
                --isvalidtime $ISVALIDTIME:xls_upload$ \
                --morphmessage '^CRITICAL.*'='CRITICAL - Keine aktuellen XLS gefunden' \
                --morphmessage '^OK.*mail.*'='OK - XLS-Einspielung ist aktuell'
  check_period  xls_upload_monitoring
}

define timeperiod {
  timeperiod_name xls_upload
  alias upload of data
  monday    17:00-18:00
  tuesday   17:00-18:00
  wednesday 17:00-18:00
  thursday  17:00-18:00
  friday    17:00-18:00
}

define timeperiod {
  timeperiod_name xls_upload_monitoring
  alias upload of data + 1h
  monday    17:00-19:00
  tuesday   17:00-19:00
  wednesday 17:00-19:00
  thursday  17:00-19:00
  friday    17:00-19:00
}
```

In der Servicedefinition sieht man, daß check_mailbox_health u.a. mit *--select newer_than='today 12:00'* aufgerufen wird. Damit wird sichergestellt, daß nur Mails von heute Nachmittag betrachtet werden sollen, alle anderen werden ignoriert.
Das Argument von --isvalidtime, *$ISVALIDTIME:xls_upload$*, wird so nicht auf der Kommandozeile angegeben, sondern existiert nur in der Servicedefinition. Abhängig davon, ob der Check innerhalb der Timeperiod xls_upload ausgeführt wird oder nicht, nimmt es den Wert 1 oder 0 an.

```bash
$ check_mailbox_health --hostname imap.musterkg.de --mode mail-age \
    --username 'MUKG\imports' --password geheim \
    --mode count-mails \
    --regexp \
    --select subject='Einspielung .* Excel .* erfolgreich' \
    --select newer_than='today 12:00' \
    --warning 1: --critical 1: \
    --isvalidtime <0 oder 1> \
    --morphmessage '^CRITICAL.*'='CRITICAL - Keine aktuellen XLS gefunden' \
    --morphmessage '^OK.*mail.*'='OK - XLS-Einspielung ist aktuell'
CRITICAL - Keine aktuellen XLS gefunden
```
und nach 18:00 dann...
```bash
OK - outside valid timerange. check results are not relevant now. original message was: Keine aktuellen XLS gefunden
```

[1]: /docs/plugins/check_mailbox_health/index.html