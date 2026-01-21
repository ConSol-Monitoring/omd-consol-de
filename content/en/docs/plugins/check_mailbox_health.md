---
title: check_mailbox_health
tags:
  - plugins
  - mailbox
  - imap
  - email
  - check_mailbox_health
---

## Description
check_mailbox_health enables the monitoring of mail servers (IMAP), reading and counting emails, filtering by specific criteria, and analyzing email contents and attachments.

## Motivation
Communication between companies, suppliers and purchasing departments, and between suppliers and factories often takes place via automated email traffic. Monitoring the arrival of emails at expected times and the type of email was the requirement that led to the development of this plugin.

## Documentation

### Command line parameters
* *\-\-hostname \<hostname>* The hostname or IP address of the mail server.
* *\-\-port \<port>* The port number if it differs from the standard.
* *\-\-username \<username>* The mailbox user.
* *\-\-password \<password>* The user's password.
* *\-\-folder \<name>* A specific mailbox (default: INBOX)
* *\-\-ssl* Communication with the mail server is encrypted.
* *\-\-protocol \<mail-protocol>* The protocol used. (Currently only IMAP)
* *\-\-mode \<mode>* The mode parameter tells the plugin what to do. See list of possible values below.
* *\-\-select \<rule>* Here you can restrict which type of emails are considered.
* *\-\-name \<objectname>* Used for more precise specification.
* *\-\-name2 \<objectname>* Also for more precise specification.
* *\-\-name3 \<objectname>* Also for more precise specification.
* *\-\-regexp* A flag indicating whether \-\-name[2,3] should be interpreted as a regular expression.

### Modes

| Keyword| Meaning| Thresholds|
| -------------| ---------| ------------|
| connection-time | Measures how long connection establishment and login take | 0..n seconds (Default: 1, 5) |
| mail-age | Alerts when emails are older than n minutes | |
| count-mails | Counts the emails (which may meet certain criteria) | |
| list-mails | Lists the emails (which may meet certain criteria) | |

### Selectors
With the parameter *\-\-select \<selector>=\<condition>* you can limit the selection of emails.

| Selector| Meaning|
| -------------| ---------|
| subject | The subject matches the condition string |
| content | The condition string appears in the email text |
| newer_than | The email is newer than the *Date::Manip* expression |
| older_than | The email is older than the *Date::Manip* expression |
| has_attachments | The email has attachments |
| attachments | The email has attachments whose MIME type matches the condition string |

When selecting by attachments (i.e., \-\-select attachment=...), the following applies:
You can specify a comma-separated list, which is split and then treated as if there were a separate select for each element.
If an element contains a slash, it is assumed that the MIME type of an attachment is meant. If not, it is compared with the file extension of the attachments. For example, if you write *\-\-select attachment='xls,xlsx,xlsm,application/pdf'*, PDF documents and everything with an Excel-like file extension will be selected (MIME types for Excel documents come in various forms and are difficult to handle).
If you append a *\-\-regexp*, then again a slash indicates a MIME type (more precisely, a pattern for MIME types), e.g., *\-\-select attachment='image\/.\*'*. If the slash is missing, the pattern is compared with the entire filename, e.g., *\-\-select attachment='.\*slides.\*'*.

## Installation
``` bash
tar zxf check_mailbox_health...tar.gz; cd check_mailbox_health...; ./configure; make
cp plugins-scripts/check_mailbox_health /destination/path
```

## Examples
``` bash
$ check_mailbox_health --mode connection-time \
    --username lausser --password secretpass \
    --warning 10 --critical 20
OK - 0.00 seconds to connect as lausser | 'connection_time'=0;10;20;;

$ check_mailbox_health --mode count-mails \
    --username lausser --password secretpass \
    --warning 1000 --critical 2000 
CRITICAL - 12463432 mails in mailbox | 'mails'=12463432;1000;2000;;

# Search all emails that have attachments with filename extension 
# pptx or jpg:
$ check_mailbox_health --mode list-mails \
    --username lausser --password secretpass \
    --select newer_than="today 13:00" --select attachments='pptx,jpg'
Thu Apr 20 14:01:32 2017 Gerhard Lausser <lausser@yahoo.com> 
  multipart/alternative --noname--
  application/vnd.openxmlformats-officedocument.presentationml.presentation User-Experience_Slide-Timeline.pptx
  image/jpeg coshsh_logo_small.jpg
  application/pdf Explanation_Target_Protocol.pdf
Thu Apr 20 17:33:51 2017 Michael Kraus <michael.kraus@consol.de> [monitoring-team-l] Greetings from South Tyrol
  text/html --noname--
  image/jpeg IMG_20170420_164159.jpg
OK - have fun

# Search all emails that have attachments with a filename containing
# a specific pattern:
$ check_mailbox_health --mode list-mails \
    --username lausser --password secretpass \
    --select attachments='IMG' --regexp
Thu Apr 20 17:33:51 2017 Michael Kraus <michael.kraus@consol.de> [monitoring-team-l] Greetings from South Tyrol
  text/html --noname--
  image/jpeg IMG_20170420_164159.jpg
OK - have fun
```

## Download

Go to [Github](https://github.com/lausser/check_mailbox_health), clone and build.

## Changelog

You can find the changelog [here](https://github.com/lausser/check_mailbox_health/blob/master/ChangeLog).

## Copyright

Gerhard Lausser
Check_mailbox_health is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Gerhard Lausser [gerhard.lausser@consol.de](mailto:gerhard.lausser@consol.de)