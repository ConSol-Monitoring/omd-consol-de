---
title: coshsh
tags:
  - cmdb
  - generator
weight: 400
---
## coshsh - Config-Generator für Naemon/Shinken/Nagios/Icinga/Prometheus
![Coshsh](coshsh_logo.png)
### Wie spricht man's aus?
<span style="font-size: 2em;">
&#678;&#596;&#643;:
</span>

### Was ist coshsh?
coshsh ist ein Framework, das bei der automatischen Erstellung von Konfigurationsdateien hilft.

### Features
* coshsh ist extrem schnell. (~60000 services in 10s)
* coshsh kann sehr einfach erweitert werden. coshsh liest nur Hosts und Applikationen. Services kommen später dazu.

### Wer verwendet es?
Die [Landeshauptstadt München][1], [Lidl, Kaufland][2], [Bühler][3] und einige mehr generieren ihre Monitoring-Konfigurationsdateien mit Coshsh.

### Download
{% asset_download coshsh-9.1.2.tar.gz category:nagios %}

### Support
Support und Beratung ist erhältlich bei [ConSol](https://www.consol.de/monitoring)

### Changelog
Das Changelog findet man auf [Github](https://github.com/lausser/coshsh/blob/master/Changelog)

### Wie funktioniert's?
Coshsh liest mit Hilfe von Adaptern beliebige Datenquellen, in denen Informationen über Hosts und die auf ihnen installierten Applikationen stehen. Die Host- und Servicedefinitionen werden erzeugt, indem Platzhalter in Template-Dateien ausgefüllt werden. Ebenso lassen sich aber auch Scrape-Definitions erzeugen.

### Grundbegriffe von coshsh
Coshsh unterscheidet sich von anderen Nagios-Config-Tools dadurch, dass Benutzer nicht interaktiv einzelne Objekte in einer Gui zusammenklicken. Bei Coshsh werden vorab Regeln erstellt und auf die zu überwachenden Objekte angewandt, welche aus sogenannten Datasources stammen.

#### Datasource
Die Rohdaten, die coshsh verarbeitet, stammen aus sogenannten Datasources. I.d.R. wird es pro Installation nur eine einzige Datenquelle geben. Diese kann ein Satz CSV-Dateien oder eine beliebige Datensammlung sein. Üblicherweise ist es die firmeneigene CMDB oder eine andere Datenbank, welche Hosts und Applikationen zum Zwecke des Monitorings enthält. Jeder Typ von Datasource muss auf individuelle Art ausgelesen werden. Entscheidend ist, dass der Rohdatenbestand in Listen von Host- und Applikationsobjekten umgewandelt und an coshsh geliefert wird. Dazu ist jeweils eine Datei namens *datasource_\<name\>.py* zu erstellen, die den nötigen Code enthält. Sie ist sozusagen der "Adapter", mit dessen Hilfe eine Datenquelle an coshsh angeschlossen werden kann. In der coshsh-Konfigurationsdatei werden Datasources folgendermassen beschrieben:

``` ini
[datasource_cmdb]
type = mycmdb
hostname = dbsrv1
username = cfggen
password = secret

[datasource_extraapps]
type = csv
files = /omd/sites/gen/data
```

Die unterschiedlichen Parameter kommen natürlich daher, dass jede Datasource anders ist und auf andere Art geöffnet und ausgelesen wird.

#### Class
Im Datasource-Adapter werden Zeilen aus Datenbanktabellen oder Dateien gelesen. Diese repräsentieren Hosts und ihnen zugeordnete Applikationen. Zur weiteren Verarbeitung müssen diese in Python-Objekte umgewandelt werden. Dies geschieht, indem man die Konstruktoren Host() bzw. Application() aufruft. Für jeden Typ von Anwendung, der überwacht werden soll, muss eine Klasse definiert werden, die von der Elternklasse Application erbt.

``` python
import coshsh
from coshsh.application import Application
from coshsh.templaterule import TemplateRule
from coshsh.util import compare_attr


def __mi_ident__(params={}):
    if compare_attr("type", params, ".*applxy.*"):
        return XyApp


class XyApp(coshsh.application.Application):
    template_rules = [
        TemplateRule(needsattr=None,
            template="app_xy_default"),
    ]
```


#### Template
Bei der ganzen Generierung mit coshsh geht es darum, Konfigurationsdateien für Nagios (bzw. Shinken oder Icinga) zu erzeugen. Jede Applikation wird mit einem bestimmten Satz von Services überwacht. Diese werden thematisch zusammengefasst in sogenannten tpl-Dateien. Das sind Vorlagen für die endgültigen Konfigurationsdateien, welche Platzhalter enthalten. Über die template\_rules in den Klassendefinitionen wird festgelegt, welche tpl-Datei(en) die künftigen Services für einen Typ von Applikation enthalten. In den paarweise geschweiften Klammern werden die Attribute des jeweiligen Applikationsobjektes referenziert. An dieser Stelle wird dann der reale Wert (der aus der Datasource stammt) stehen.

``` text
{{ application|service("app_xy_default_check_alive") }}
  host_name                       {{ application.host_name }}
  use                             app_xy_default
  check_command                   check_xy!60
}


define service {
  service_description             app_xy_default_check_users
  host_name                       {{ application.host_name }}
  use                             app_xy_default
  max_check_attempts              5
  check_command                   check_xy_users!10!20
}
```

#### Recipe
Herzstück von coshsh ist ein Recipe. Analog zu einem Kochrezept besteht es aus Zutaten. Es beschreibt, welche Zutaten nötig sind, um eine Nagios-Konfiguration zu erstellen:
* Datasource(s) - aus diesen werden Hosts und die auf ihnen installierten Applikationen ausgelesen. Auch Contact- und Detail-Informationen stammen von hier. Es ist möglich, Datasources zu mischen, z.b. können die Hosts und Applikationen aus einer CMDB stammen und die Details (Filesysteme, Tablespaces, Interfaces,...) aus einem Excel-Sheet.
* Classes-Verzeichnis - hier befinden sich die Python-Dateien, welche die Applikationsklassen beinhalten und die Brücke zu den Templates schlagen.
* Templates-Verzeichnis - hier befinden sich die Vorlagen für die künftigen Konfigurationsdateien.
* Objects-Verzeichnis - in dieses Verzeichnis werden die fertigen Konfigurationsdateien geschrieben.

#### Cookbook
Ein Kochbuch ist eine Konfigurationsdatei, welche die Rezepte beinhaltet.


### Beispiele

#### Datasource
``` python
from coshsh.host import Host
from coshsh.datasource import Datasource
from coshsh.application import Application
from coshsh.util import compare_attr

logger = logging.getLogger('coshsh')

def __ds_ident__(params={}):
    if coshsh.util.compare_attr("type", params, "mycmdb"):
        return MyCMDB

class MyCMDB(coshsh.datasource.Datasource):
    def __init__(self, **kwargs):
        # kwargs wird mit den Werten aus dem DATASOURCE-Abschnitt
        # des Cookbooks belegt
        self.name = kwargs["name"]
        self.password = kwargs["password"]
        ...

    def open(self, filter=None, objects={}, **kwargs):
        # optional
        # kann verwendet werden, um eine DB aufzumachen

    def close(self, filter=None, objects={}, **kwargs):
        # und am Schluss wieder zuzumachen
        # auch optional

    def read(self, filter=None, objects={}, **kwargs):
        logger.info('read items from datasource')
        self.objects = objects
        hostdata = {
            'host_name': 'test_host_0',
            'address': '127.0.0.9',
            'type': 'test',
            'os': 'Red Hat 6.3',
            'hardware': 'Vmware',
            'virtual': 'vs',
            'notification_period': '7x24',
            'location': 'esxsrv10',
            'department': 'test',
        }
        self.add('hosts', MyHost(hostdata))
        appdata = {
            'name': 'os',
            'type': 'Red Hat',
            'component': '',
            'version': '6.3',
            'patchlevel': '',
            'host_name': 'test_host_0',
            'check_period': '7x24',
        }
        self.add('applications', coshsh.application.Application(appdata))
        ....
```

[1]: https://www.consol.de/fileadmin/pdf/news/success_stories/Landeshauptstadt_Muenchen_de.pdf
[2]: https://www.cio.de/a/lidl-standardisiert-weltweites-monitoring,3260842
[3]: https://www.computerworld.ch/software/business-it/industriekonzern-buehler-erneuert-it-monitoring-1593882.html

