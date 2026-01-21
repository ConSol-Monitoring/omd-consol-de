---
author: Gerhard Laußer
author_email: gerhard.lausser@consol.de
author_twitter: lausser
date: '2016-08-05'
featured_image: meetup.jpg
summary: null
tags:
- Meetup
title: Ansible im Monitoring-Umfeld
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;"><img src="Ansible_Logo.png" alt=""></div>

Am 27.7. fand bei ConSol das Sommer-Meetup der Gruppe "[Münchner Monitoring-Stammtisch](https://www.meetup.com/de-DE/Munchner-Monitoring-Stammtisch/)" statt. Das Thema war diesmal "[Ansible im Monitoring-Umfeld](https://www.meetup.com/de-DE/Munchner-Monitoring-Stammtisch/events/232701616/)".
Ansible ist ein Framework, mit dem üblicherweise Server nach der Grundinstallation nachkonfiguriert und mit ausgewählten Softwarepaketen versorgt werden. Oder mit dem im laufenden Betrieb immer wieder Patches und sonstige Updates ausgerollt werden. Dabei wird in einem sogenannten Ansible-Playbook lediglich der Soll-Zustand beschrieben und Ansible kümmert sich im Hintergrund um die dazu nötigen Aktionen. Das hat grundsätzlich noch nichts mit Monitoring zu tun, aber da wir über den Tellerrand hinausschauen und bei allen Kunden keine Insel installieren, sondern Teil einer Unternehmens-IT mit allen möglichen Verflechtungen sind, gehört Ansible seit längerem zum Werkzeugkasten des ConSol-Monitoring-Teams. Es gibt übrigens auch eine eigene [Ansible-Meetup-Gruppe](https://www.meetup.com/de-DE/Ansible-Munchen/), die unsere Veranstaltung freundlicherweise auch auf ihrer Seite ankündigte.
Die Fachsimpelei bei Augustiner und Pizza wurde immer wieder durch einen Vortrag unterbrochen, als da waren:

* Michael Kraus - Überblick über Ansible, erste Schritte, coole Features
* Simon Meggle - Rollout und Administration einer verteilten Monitoring-Umgebung mit Ansible
* Matthias Gallinger - Erstinstallation und kontinuierliche Betankung von Monitoring-Clients mit Plugins

<!--more-->

Den Anfang machte Michael Kraus.....
<br/>
<iframe type="opt-in" data-name="youtube" data-src="https://drive.google.com/file/d/0BzB2vg1DijBLZTVpM1o2QzJWR3c/preview" width="640" height="480" style="border: 2px solid #0096d6;"></iframe>
<br/>
<a href="https://drive.google.com/file/d/0BzB2vg1DijBLZTVpM1o2QzJWR3c/preview" target="_blank">https://drive.google.com/file/d/0BzB2vg1DijBLZTVpM1o2QzJWR3c/preview</a>
<br/>
<br/>
Danach folgte Simon Meggle....
<br/>
<iframe type="opt-in" data-name="youtube" data-src="https://drive.google.com/file/d/0BzB2vg1DijBLX0k5R1hfaG9udDA/preview" width="640" height="480" style="border: 2px solid #0096d6;"></iframe>
<br/>
<a href="https://drive.google.com/file/d/0BzB2vg1DijBLX0k5R1hfaG9udDA/preview" target="_blank">https://drive.google.com/file/d/0BzB2vg1DijBLX0k5R1hfaG9udDA/preview</a>
<br/>
<br/>
Und zum Schluß kam Matthias Gallinger dran. Der hat eine Methode entwickelt, mit der Ansible die Verteilung von Plugins auf Client-Systeme übernimmt und sich dabei wiederum wie ein Nagios-Plugin verhält. Das bedeutet, daß jeder Client einen Service *Plugin-Update* o.ä. erhält, welcher Ansible aufruft und über Nagios alarmiert, wenn bei der Verteilung bzw. beim Update etwas schiefgegangen ist.
Matthias hat aber vor ein paar Tagen sein Macbook mitsamt der Präsentation geschrottet, daher gibt es die jetzt in Textform:
<br/>
<br/>

# Pluginverteilung mit Ansible

Ein Ansible-Playbook soll als Nagios-Plugin ausgeführt werden, um regelmässig Plugins und Konfigurationen an Monitoring-Clients zu verteilen.

## Voraussetzungen

1. [ansible.cfg](#ansible.cfg)
2. [callback](#callback)
3. [inventory](#inventory)
4. [Playbook](#Playbook)
4. [PluginRepo](#PluginRepo)

### ansible.cfg
Die ansible.cfg wird über $ANSIBLE_CONFIG in $OMD_ROOT/etc/environment angesprochen

### callback
Ein STDOUT Callback sorgt für die Ausgabe im Nagios-Format. ACHTUNG! Ist der Callback in der ansible.cfg eingetragen, werden alle Ansible-Aufrufe mit diesem Callback durchgeführt. Ggf. bietet es sich hier an, den Pluginaufruf mit
```bash
ANSIBLE_CONFIG=$OMD_ROOT/my/special/ansible.cfg
```
zu beginnen.

### inventory
Sollten unterschiedliche SSH-Benutzer zum Einsatz kommen, so können diese im Inventory definiert werden. Die Variable "ansible_user" aus dem Inventory überschreibt hier die User-Variable aus dem Playbook.

Das Script zum automatischen Erstellen des Inventory aus Livestatus wird noch nachgereicht

### Playbook
Um verschiedenen OS-Versionen gerecht zu werden, wird für jedes OS vom Playbook ein eigenens VARS-File angezogen. Hier sind z.B. rsync-Pfad und div. für jedes OS individuelle Informationen hinterlegt.

### PluginRepo
Die Struktur des Plugin-Repository ergiebt sich aus OS-Facts sowie einem custom-Zweig.
Die Facts "ansible_os_family" und "ansible_os_version" stellen die Grundlage des OS-Zweig dar. Im custom-Zweig muss der Host analog zum Nagios-Macro $HOSTNAME$ eingetragen werden. Hier werden nur die Verzeichnise "etc" und "local" per rsync übertragen.

Eine Erweiterung um "ansible_userspace_bits" ist jederzeit noch möglich.

```bash
OMD[site]:~/clients$ tree -L 3
.
|-- Debian
|   `-- 16
|       |-- bin
|       |-- etc
|       |-- lib
|       |-- local
|       `-- perl5
|-- RedHat
|   `-- 7
|       |-- bin
|       |-- etc
|       |-- lib
|       |-- local
|       `-- perl5
|-- Solaris
|   `-- 10
|       |-- bin
|       |-- etc
|       |-- lib
|       |-- libexec
|       |-- local
|       `-- perl5
|
`-- custom
   |-- host001
   |   |-- etc
   |   `-- local
   `-- host002
       |-- etc
       `-- local
```

Die benötigten Dateien sind folgendermassen angeordnet:

```
.
|-- ansible.cfg
|-- callback_plugins
    `-- nagios.py
|-- playbooks
    `-- plugins_rollout
        `-- plugins_rollout.yaml
        `-- vars_debian.yaml
        `-- vars_redhat.yaml
        `-- vars_solaris.yaml
```

Und so sehen sie aus:
### ansible.cfg
```ini
{% raw %}
#
# Ansible config for plugin rollout
#

[defaults]
inventory = $OMD_ROOT/etc/ansible/inventory
# default playbook user
remote_user = nagios
# SSH timeout
timeout = 10
# SSh Controlpath
control_path = $OMD_ROOT/tmp/run/ssh/controlpath/ssh-%%r@%%h
# callbacks
callback_plugins = $OMD_ROOT/etc/ansible/callback_plugins
callback_whitelist = nagios
stdout_callback = nagios

#retry_files_enabled = True
#retry_files_save_path = "$OMD_ROOT/var/ansible/"
{% endraw %}
```

### nagios.py
```python
{% raw %}
from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

from ansible import constants as C
from ansible.plugins.callback import CallbackBase
from ansible.utils.color import colorize, hostcolor
import sys

class CallbackModule(CallbackBase):

    '''
    This is the nagios callback, which prints playbook results in nagios
    conform output
    '''

    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'stdout'
    CALLBACK_NAME = 'nagios'
    CALLBACK_WHITELIST = True

    def __init__(self):
        super(CallbackModule, self).__init__()
        self.detailed_results = []

    def v2_playbook_on_no_hosts_matched(self):
        self._display.display("UNKNOWN - no hosts matched ")
        sys.exit(3)

    def v2_runner_on_unreachable(self, result):
        pass

    def v2_runner_on_no_host(self, task):
        pass

    def v2_runner_on_failed(self, result, ignore_errors=False):
        delegated_vars = result._result.get('_ansible_delegated_vars', None)
        if 'exception' in result._result:
            if self._display.verbosity < 3:
                # extract just the actual error message from the exception text
                error = result._result['exception'].strip().split('\n')[-1]
                msg = "    An exception occurred during task execution. To see the full traceback, use -vvv. The error was: %s" % e
rror
            else:
                msg = "    An exception occurred during task execution. The full traceback is:\n" + result._result['exception']

            self.detailed_results.append(msg)

            # finally, remove the exception from the result so it's not shown every time
            del result._result['exception']

        if not result._task.ignore_errors:
            if result._task.loop and 'results' in result._result:
                self._process_items(result)


            else:
                if delegated_vars:
                    self.detailed_results.append("    FAILED: [%s -> %s]: %s" % (result._host.get_name(), delegated_vars['ansible_h
ost'], self._dump_results(result._result)))
                else:
                    self.detailed_results.append("    FAILED: [%s]: %s" % (result._host.get_name(), self._dump_results(result._resu
lt)))
        sys.exit(1)

    def v2_runner_on_unreachable(self, result):
        delegated_vars = result._result.get('_ansible_delegated_vars', None)
        if delegated_vars:
            self._display.display("CRITICAL - %s -> %s is unrechable => %s" % (result._host.get_name(), delegated_vars['ansible_hos
t'], self._dump_results(result._result)))
        else:
            self._display.display("CRITICAL - %s is unreachable => %s" % (result._host.get_name(), self._dump_results(result._resul
t)))
        sys.exit(2)

    def v2_playbook_on_stats(self, stats):
        try:
            host = stats.processed.keys()[0]
        except:
            return

        t = stats.summarize(host)

        if t['unreachable'] > 0 or t['failures'] > 0:
            self._display.display(u"CRITICAL - %s : ok=%s changed=%s unreachable=%s failed=%s" % (
                host,t['ok'],t['changed'],t['unreachable'],t['failures']),
                screen_only=True
            )
            for result in self.detailed_results:
                print(result)
            sys.exit(2)
        elif t['changed'] > 1:
            self._display.display(u"WARNING - %s : ok=%s changed=%s unreachable=%s failed=%s" % (
                host,t['ok'],t['changed'],t['unreachable'],t['failures']),
                screen_only=True
            )
            sys.exit(1)
        else:
            self._display.display(u"OK - %s tasks run successfully" % (t['ok']),screen_only=True)
{% endraw %}
```

### plugins_rollout.yaml
```yaml
{% raw %}
# Ansible Plugins Verteilung
# 20160804 mg@consol.de
---

  # User could be overload from ansible inventory
  user: nagios

  vars:
    OMD_ROOT: "{{ lookup('env','OMD_ROOT') }}"
    os_version: "{{ ansible_distribution_version | regex_replace('(\\d+)\\..*','\\1') }}"
    src_plugins_dir: "{{ OMD_ROOT }}/clients/{{ ansible_os_family }}/{{ os_version }}/"
    dest_plugins_dir: "{{ ansible_user_dir }}/"
    src_etc_dir: "{{ OMD_ROOT }}/clients/custom/{{ target }}/etc/"
    dest_etc_dir: "{{ ansible_user_dir }}/etc/"

  tasks:

  - include_vars: "{{ OMD_ROOT }}/etc/ansible/playbooks/plugins_rollout/vars_solaris.yaml"
    when: ansible_os_family == 'Solaris'

  - include_vars: "{{ OMD_ROOT }}/etc/ansible/playbooks/plugins_rollout/vars_redhat.yaml"
    when: ansible_os_family == 'RedHat'

  - include_vars: "{{ OMD_ROOT }}/etc/ansible/playbooks/plugins_rollout/vars_debian.yaml"
    when: ansible_os_family == 'Debian'

  - name: check for custom dir
    local_action: shell ls {{ OMD_ROOT }}/clients/custom
    register: custom_dir

  - name: copy bash profile
    copy: src={{ src_plugins_dir }}{{ profile }} dest={{ dest_plugins_dir}}

  - name: Synchronize Plugins
    synchronize:
      src: "{{ src_plugins_dir }}/{{ item }}/"
      dest: "{{ dest_plugins_dir }}/{{ item }}/"
      rsync_path: "{{ rsync_path }}"
      recursive: yes
      delete: yes
    with_items:
      - bin
      - lib
      - local
      - etc
      - perl5

  - name: Synchronize etc dir
    synchronize:
      src: "{{ src_etc_dir }}"
      dest: "{{ dest_etc_dir }}"
      rsync_path: "{{ rsync_path }}"
    when: custom_dir.stdout.find("\{{ ansible_hostname }}") != -1
{% endraw %}
```

### vars_debian.yaml
```yaml
{% raw %}
---
rsync_path: /usr/bin/rsync
profile: .bash_profile
{% endraw %}
```

### vars_redhat.yaml
```yaml
{% raw %}
---
rsync_path: /usr/bin/rsync
profile: .bash_profile
{% endraw %}
```

### vars_solaris.yaml
```yaml
{% raw %}
---
rsync_path: /usr/local/bin/rsync
profile: .profile
{% endraw %}
```

<a href="http://www.meetup.com/r/inbound/0/0/shareimg/https://www.meetup.com/de-DE/Munchner-Monitoring-Stammtisch/?a=shareimg"><img border="0" alt="Münchner Monitoring-Stammtisch" src="http://img.meetup.com/img/logo_45.png"></a>