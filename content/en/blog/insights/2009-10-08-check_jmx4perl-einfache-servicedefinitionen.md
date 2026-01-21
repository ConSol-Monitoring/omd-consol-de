---
author: Gerhard Laußer
date: '2009-10-08T09:22:00+00:00'
slug: check_jmx4perl-einfache-servicedefinitionen
tags:
- check_jmx4perl
title: check_jmx4perl -- Einfache Servicedefinitionen
---

Im Rahmen des Münchner Nagios-Stammtisches hielt Roland Huß gestern einen Vortrag über sein Framework Jmx4Perl. Mittlerweile haben sich mehrere Leute erkundigt, wie die Service- und Commanddefinitionen für das dazugehörige Plugin check_jmx4perl aussehen könnten. Deshalb soll hier erläutert werden, wie man ein paar grundlegende Messwerte aus einem Applicationserver ausliest und mit Nagios überwacht.

<!-- --><!--more-->Zunächst muss natürlich erstmal <em>jmx4perl</em> installiert werden. Nachdem die aktuelle <a href="http://www.jmx4perl.org" target="_blank">Version</a> heruntergeladen und entpackt wurde, werden die Perl Module und das Nagios Plugin <em><strong>check_jmx4perl</strong></em> mit
```bash
perl Build.PL
./Build install
```
systemweit installiert. Alternativ kann man natürlich auch <strong>CPAN</strong> in gewohnter Weise zur Installation verwenden. Zusätzlich muss noch der Java Agent <strong><em>j4p.war</em></strong> auf dem Applicationserver deployed werden, der sich im Unterverzeichnis <em>agent/</em> befindet. Weitere Informationen zur Installation finden sich auch im <em>README</em>.

Danach legt man sich ein paar Command-Definitionen an, die die drei Betriebsarten des Plugins abbilden.
<ul>
	<li>absoluten Wert ermitteln (z.B. Anzahl der geladenen Klassen)</li>
	<li>das Verhältnis zweier Werte ermitteln (z.B. HeapSize.used / HeapSize.max)</li>
	<li>den Anstieg eines Werts pro Zeit ermitteln (z.B. Anzahl der erzeugten Threads / Sekunde bzw. wie im folgenden Beispiel, pro Minute)</li>
</ul>
Dabei wird jeweils unterschieden, ob man die MBeans mit ihrem vollständigen Objektnamen adressiert oder Aliase verwendet.
```bash
define command {
   command_name         check_jmx4perl
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --mbean $ARG2$ \
                            --attribute $ARG3$ \
                            $ARG4$
}

define command {
   command_name         check_jmx4perl_rate
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --mbean $ARG2$ \
                            --attribute $ARG3$ \
                            --delta $ARG4$ \
                            $ARG5$
}

define command {
   command_name         check_jmx4perl_base
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --mbean $ARG2$ \
                            --attribute $ARG3$ \
                            --base $ARG4$ \
                            $ARG5$
}

define command {
   command_name         check_jmx4perl_alias
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --alias $ARG2$ \
                            $ARG3$
}

define command {
   command_name         check_jmx4perl_alias_base
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --alias $ARG2$ \
                            --base-alias $ARG3$ \
                            $ARG4$
}

define command {
   command_name         check_jmx4perl_alias_rate
   command_line         $USER3$/check_jmx4perl \
                            --url $ARG1$ \
                            --alias $ARG2$ \
                            --delta $ARG3$ \
                            $ARG4$
}
```

Darauf aufbauend legt man die Servicedefinitionen an. Als Beispiel soll die WebLogic-Applikation SHOP dienen, die auf dem Host bea läuft und unter der Url http://www.naprax.de:8001/j4p abgefragt wird.

Zunächst packt man die URL und den Host in ein Servicetemplate:
```bash
define service {
   register               0
   name                   app_weblogic_SHOP
   host_name              bea
   servicegroups          app_weblogic_SHOP
   _agenturl              http://www.naprax.de:8001/j4p
}
```
Im Folgenden werden Servicedescriptions verwendet, die einem hierarchischem Namensschema folgen. Darin steckt die Information, dass eine Applikation überwacht wird (app_), dass es sich um den Applikationstyp WebLogic (_weblogic_) handelt sowie ein Name für den Applicationserver (_SHOP_).

Zunächst wird eine Zwischenschicht eingezogen, in der die soeben erstellten SHOP-spezifischen Attribute mit einem weiteren Template app_weblogic_default gemischt werden. Der Sinn dahinter ist, dass es z.B. ein Betriebsteam für Java-Applicationserver gibt und man die entsprechenden Contact- und Notification-Optionen in diesem Template (app_weblogic_default) unterbringen kann.
```bash
define service {
   register               0
   name                   app_weblogic_default_SHOP
   use                    app_weblogic_default,app_weblogic_SHOP
}
```
Die eigentlichen Services (eine kleine Auswahl für den Anfang) sehen dann so aus:
```css
define service {
   service_description    app_weblogic_default_SHOP_check_uptime
   use                    app_weblogic_default_SHOP
   check_command          check_jmx4perl_alias \
                          !$_SERVICEAGENTURL$ \
                          !RUNTIME_UPTIME \
                          !--warning 120: --critical 60:
}

define service {
   service_description    app_weblogic_default_SHOP_check_heapused
   use                    app_weblogic_default_SHOP
   check_command          check_jmx4perl_alias_base \
                          !$_SERVICEAGENTURL$ \
                          !MEMORY_HEAP_USED \
                          !MEMORY_HEAP_MAX \
                          !--warning 80 --critical 90
}

define service {
   service_description    app_weblogic_default_SHOP_check_threadscreated
   use                    app_weblogic_default_SHOP
   check_command          check_jmx4perl_alias_rate \
                          !$_SERVICEAGENTURL$ \
                          !THREAD_COUNT_STARTED \
                          !60 \
                          !--warning 100 --critical 200
}

define service {
   service_description    app_weblogic_default_SHOP_check_threads
   use                    app_weblogic_default_SHOP
   check_command          check_jmx4perl_alias \
                          !$_SERVICEAGENTURL$ \
                          !THREAD_COUNT \
                          !--warning 200 --critical 300
}

define service {
   service_description    app_weblogic_default_SHOP_check_filedesc
   use                    app_weblogic_default_SHOP
   check_command          check_jmx4perl_alias_base \
                          !$_SERVICEAGENTURL$ \
                          !OS_FILE_DESC_OPEN \
                          !OS_FILE_DESC_MAX \
                          !--warning 80 --critical 90
}
...
```
Die Uptime wird mit überwacht, damit der entsprechende Service als Parent in einer Servicedependency zur Verfügung steht. Er sorgt dafür, dass die anderen Checks ausgesetzt werden, solange der Applicationserver nicht verfügbar ist.
```bash
define servicedependency {
   name                             dependency_bea_SHOP_uptime_uc
   host_name                        bea
   service_description              app_weblogic_default_SHOP_check_uptime
   dependent_service_description    app_weblogic_.*_SHOP_.*, \
                                    !app_weblogic_default_SHOP_check_uptime
   execution_failure_criteria       u,c
   notification_failure_criteria    u,c
}
```
Und so in etwa könnte es in Nagios aussehen:

<a ref="lightbox" href="/assets/2009-10-08-check_jmx4perl-einfache-servicedefinitionen/jmx4perl_services.png"><img class="alignnone size-full wp-image-752" title="jmx4perl_services_s" src="/assets/2009-10-08-check_jmx4perl-einfache-servicedefinitionen/jmx4perl_services_s.png" alt="jmx4perl_services_s" width="518" height="116" /></a>