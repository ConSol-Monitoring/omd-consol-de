---
author: Matthias Gallinger
date: '2017-03-13T00:00:00+00:00'
featured_image: prometheus-logo.png
tags:
- Ansible
title: Ansible meets DokuWiki
---

# Ansible meets DokuWiki

Dokumentation belegt in der Rangliste der beliebtesten Arbeiten eines Administrators sicher einen der hinteren Plätze. Neben der Beliebtheit der Aufgabe ist es auch mit zunehmender Anzahl der vorhandenen Systeme immer aufwändiger, die Dokumentation auf einem aktuellen Stand zu halten. Ein klassischer Fall also für Automatisierung.

Das Ziel in diesem Blog soll es sein, für jedes System eine DokuWiki Seite automatisch zu erzeugen. Weiter soll auf jeder Seite noch die Möglichkeit bestehen, individuelle Dokumentation mit einzufügen.

<!--more-->

Bereits seit langem sind Lösungen mit [Dokuwiki] in Verbindung mit diversen Scripten erfolgreich im Einsatz. Dokuwiki arbeitet mit textbasierten Dateien. Diese lassen sich leicht von "aussen" erzeugen. Ausserdem ist Dokuwiki von Anfang an Bestandteil von OMD. Ein weiterer Bestandteil von OMD ist mittlerweile auch [Ansible].

## Ansible Facts

[Ansible] liefert mit der Funktion "gather facts" einen ganzen Schwung an Informationen über das Zielsystem. Angefangen von OS Informationen (Distribution, Version, Kernel) über Hardware (Disks, Netzwerkkarten, ...) bis hin zu selber geschriebene _facts_ ,die Informationen zur installierten Software liefern können. Die im JSON Format vorliegen _facts_ können im selben Playbook wiederum in einem [Jinja2] Template weiter verarbeitet werden.

Hier ein simples Beispiel zur Darstellung der Distributionsinformationen.

Ein "_ansible -m setup hostname_ " liefert u.a. folgende Ausgabe zurück :

###### Ansible JSON output
```
localhost | SUCCESS => {
      "ansible_facts": {
          "ansible_distribution": "RedHat",
          "ansible_distribution_major_version": "7",
          "ansible_distribution_release": "Maipo",
          "ansible_distribution_version": "7.2",
        }
    }
```

Da Ansible die Templatesprache [Jinja2] unterstützt, könne wir hier relativ einfach ein Stück DokuWiki code erzeugen.

###### Jinja2 template
``` jinja2
====== {{ inventory_hostname }} ======
Host Sheet for {{ ansible_fqdn }}
^ FQDN | {{ ansible_fqdn }} |
^ OS | {{ ansible_distribution }} {{ ansible_distribution_version }}|
^ TYPE | {{ ansible_product_name }} |
```
Zum Abschluss das Ganze in ein Playbook zusammengefasst, und der erste Schritt wäre geschafft.

###### Ansible playbook
```
---
  tasks:

  - name: write doku
    local_action: template src=wiki.j2 dest=/tmp/wiki.txt
```


## Anlegen Dokuwiki

Nachdem wir jetzt erfolgreich ein kleines Stück Dokuwiki angelegt haben, können wir den nächsten Schritt gehen und uns um die Struktur im Wiki kümmern.

Die Dokumentation soll einen eigenen so genannten _Namespace_ bekommen. In Dokuwiki sind das simple Unterordner im _pages_ Unterverzeichnis. Der hier genutze _Namepace_ soll "inventory" heissen. Pro System wird dann jeweils eine Seite unterhalb von "inventory" erscheinen.

Ein DokuWiki Plugin, welches ebenfalls bereits in OMD integriert ist, ist [index menu]. Damit lässt sich eine recht ansehnliche Baumansicht mit JavaScript auf der linken Seite erzeugen. Wenn ein Unterordner ein _txt_ file mit dem selben Namen wie der Ordner selbst enthält, wird dessen Inhalt bereits im Ordner angezeigt. Daraus ergibt sich folgende Struktur.

###### Ordnerstruktur

```
$OMD_ROOT
└── var
    └── dokuwiki
        └── data
            └── pages
                └── inventory
                    ├── host-1
                    │   ├── custom.txt
                    │   └── host-1.txt
                    ├── host-2
                    │   ├── custom.txt
                    │   └── host-2.txt
                    └── host-3
                        ├── custom.txt
                        └── host-3.txt
```
In der Sidebar ist später dann nur noch folgende Ansicht zu sehen :

###### Wiki sidebar

```
OMD DokuWiki
└── inventory
    ├── host-1
    ├── host-2
    └── host-3
```

## Manuelle Inhalte integrieren

Um den automatisch generierten Inhalt gegebenenfalls noch mit individuellen Inhalten anzureichern, nutzen wir das DokuWiki Plugin [include], welches ebenfalls bereits in OMD mitgeliefert wird. Hier lassen sich einzelne Abschnitte, aber auch ganze Wiki Seiten in eine andere Seite einfügen. Folgende Zeilen am Ende des _JINJA2_ template fügen den Inhalt der Seite "_custom_" am Ende unserer autogenerierten Seite ein. Existiert im _Namespace_ (.../inventory/host-x) noch keine Seite mit dem namen _custom_ so wird diese beim ersten Editieren angelegt.

###### Dokiwiki Include
```
===== Custom Infos =====
{{page>custom&titel}}
```

Damit die manuell erstellten Seiten später nicht in der Sidebar auftauchen, werden sämtliche Seiten mit dem namen _custom.txt_ einfach in der Konfiguration excluded.

###### Exlude der custom Seiten in der sidebar (sidebar.txt)
```
====== Table of contents ======
{{indexmenu>..:#1|js#indextheme navbar notoc nocookie skipfile+/(^sidebar$|custom*)/}}
```

## Finale

Zum Schluss noch ein komplettes Beispiel mit _Ansible-Playbook_ und _Jinja2_ Template, welches eine gute Grundlage zum Start der eigenen Doku sein könnte. damit lassen sich jetzt beliebig oft top aktuelle Dokumentationen der einzelnen Systeme erstellen. Die induviduellen Inhalte aus der custom Seite werden dabei ausgenommen.

Viel Spaß beim dokumentieren.

###### Ansible Playbook

```
---
  gather_facts: True
  hosts: all
  vars:
    doku_path: /omd/sites/test/var/dokuwiki/data/pages/inventory
  tasks:
    - name: create inventory folder
      local_action: file path={{ doku_path }} state=directory mode=0755

    - name: create host folder
      local_action: file path={{ doku_path }}/{{ inventory_hostname }} state=directory mode=0755

    - name: write wiki page
      local_action: template src=wiki.j2 dest={{ doku_path }}/{{ inventory_hostname }}/{{ inventory_hostname }}.txt
```

###### Jinja2 template

```HTML+Django
{#
# Template for server sheet
#}
{{ ansible_managed }}
====== {{ inventory_hostname }} ======
Host Sheet for {{ ansible_fqdn }}
^ FQDN | {{ ansible_fqdn }} |
^ OS | {{ ansible_distribution }} {{ ansible_distribution_version }}|
^ TYPE | {{ ansible_product_name }} |

===== Sizing =====

^ CPU / Cores | {{ ansible_processor_count }} / {{ ansible_processor_cores }} |
^ RAM | {{ "%0.2f" % (ansible_memtotal_mb / 1024) }} GB|
^ SWAP | {{ "%0.2f" % (ansible_swaptotal_mb / 1024) }} GB |
^ Kernel | {{ ansible_kernel }} |

{#
# Drive Infos
#}
===== Drives =====
==== DISKs ====
^ DISK ^ MODEL ^ VENDOR ^ SIZE ^ PARTITION ^ P-SIZE ^ MOUNT ^
{% for d in ansible_devices %}
{% set dev = hostvars[inventory_hostname]['ansible_devices'][d] %}
{% if dev.partitions %}
{% for p in dev.partitions %}
{% set part = dev.partitions[p] %}
{% if loop.first %}
| {{ d }} | {{ dev.model }} | {{ dev.vendor }} | {{ dev.size }} | {{ p }} | {{ part.size }} | {{ part.holders | join(', ') }} |
{% else %}
|:::|:::|:::|:::| {{ p }} | {{ part.size }} | {{ part.holders | join(', ')}} |
{% endif %}
{% endfor %}
{% else %}
| {{ d }} | {{ dev.model }} | {{ dev.vendor }} | {{ dev.size }} | |||
{% endif %}
{% endfor %}

==== Mount Points ====
^ MountPoint ^ Device ^ fstype ^ Size ^
{% for mp in ansible_mounts %}
{# set mp = hostvars[inventory_hostname]['ansible_mounts'] #}
| {{ mp.mount }} | {{ mp.device }} | {{ mp.fstype }} | {{ "%0.2f" % (mp.size_total / 1024 / 1024 / 1024) }} GB |
{% endfor %}

===== Network Configuration =====
{#
# Network Interfaces
# address, netmask, network, broadcast
#}
==== DNS Setup ====
{% set ns = hostvars[inventory_hostname]['ansible_dns'] %}
^ nameservers | {{ ns.nameservers | join(', ') }} |
^ search | {{ ns.search | join(', ') }} |

==== IP Addresses ====
=== Default IP ===
^ interface | {{ ansible_default_ipv4.interface }} |
^ type | {{ ansible_default_ipv4.type }} |
^ mac | {{ ansible_default_ipv4.macaddress }} |
^ address | {{ ansible_default_ipv4.address }} |
^ gateway | {{ ansible_default_ipv4.gateway }} |
^ network | {{ ansible_default_ipv4.network }} |
^ netmask | {{ ansible_default_ipv4.netmask }} |

== all ipv4 addresses ==
{% for ip in ansible_all_ipv4_addresses %}
^ {{ ip }} |
{% endfor %}
{#
# Custom Info page
#}
===== Custom Infos =====
{{'{{page>custom&titel}}'}}
```

---

[Dokuwiki]: https://www.dokuwiki.org/
[Ansible]: http://docs.ansible.com/ansible/index.html
[Jinja2]: http://jinja.pocoo.org/docs/2.9/
[index menu]: https://www.dokuwiki.org/plugin:indexmenu
[include]: https://www.dokuwiki.org/plugin:include