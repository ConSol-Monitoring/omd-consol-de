---
author: Gerhard Laußer
date: '2015-06-26T20:10:25+02:00'
tags:
- Nagios
title: check_*_health-Plugins und die Passwörter mit Sonderzeichen
---

Jeder Icinga-Admin kennt das: Ein Gerät, eine Applikation oder eine Datenbank soll überwacht werden, es gibt auch eine extra Monitoring-Kennung dafür, aber das zugehörige Passwort ist einfach nur grauenhaft. Sei es aufgrund einer Vorschrift oder weil der DBA ein Sadist ist, häufig enthält das Passwort Zeichen, welche bei der Ausführung des Plugins durch eine Shell Probleme bereiten können. Dazu zählen alle Arten von Anführungszeichen, Strichpunkt, Kaufmanns-Und oder gar nicht druckbare Zeichen. 
So eine Command-Definition
```bash
define command {
  command_name check_mssql_health
  command_line $USER1$/check_mssql_health \--hostname $ARG1$ \--username '$ARG2$' \--password '$ARG3$' ...
}
```
schließt zwar den ganzen Dreck in einfache Hochkommas ein, aber was, wenn das Passwort selber ein Hochkomma enthält?

<table style="border-collapse: collapse; background-color: #F0F1EE;">
 <tr>
  <td style="border: none;">Current Status:</td><td style="border: none;"><span style="background-color: #FFDE00;">WARNING</span>   (for 0d 0h 6m 3s)</td>
 </tr><tr>
  <td style="border: none;">Status Information:</td><td style="border: none;">[sh: -c: line 0: unexpected EOF while looking for matching `'' </td>
 </tr><tr>
  <td style="border: none;"></td><td style="border: none;">sh: -c: line 1: syntax error: unexpected end of file]</td>
 </tr>
</table><br/>

Damit das nicht passiert und auch die Icinga-Konfigurationsdateien von Sonder- und Schmierzeichen aller Art verschont bleiben, können die Plugins aus der check_\*_health-Familie sowie check_hpasm seit den letzten Releases mit encodierten Passwörtern versorgt werden. Man hantiert also nur noch mit *[A-Za-z0-9]*.
<!--more-->
<script type="text/javascript">
String.prototype.urlEncode = function(){
  return(
    this.replace(    
      /([^A-Za-z0-9])/g,
      function(target){  
        value = target.charCodeAt(0).toString(16);
        return "%" + (value.length == 1 ? "0" : "") + value;
      }
    )
  );
};
function encode(str) {
  return str.urlEncode();
}
</script>
Im RFC 3986 wird ein Verfahren namens *Percent-Encoding* vorgestellt, bei dem bestimmte Zeichen durch ihren Hex-Code mit vorangestelltem Prozentzeichen ersetzt werden.
Was das konkret bedeutet, kann man hier live ausprobieren. Einfach im oberen Eingabefeld anfangen zu tippen und im unteren Feld erscheint dann das encodierte Pendant des Strings.<br/>
<table style="border-collapse: collapse; background-color: #F0F1EE;">
 <tr>
  <td style="border: none;">Klartext:</td><td style="border: none;"><input placeholder="tipp mal was..." type="text" id="clearpass" size="64" onkeyup="document.getElementById('encpass').value = encode(this.value);"></td>
 </tr><tr>
  <td style="border: none;">Encodiert:</td><td style="border: none;"><input type="text" id="encpass" size="64" readonly/></td>
 </tr>
</table><br/>

Besagte Plugins können solche encodierten Passwörter intern wieder decodieren. Allerdings geschieht das nicht in jedem Fall. Man muss explizit angeben, daß es sich bei den Argumenten der Parameter \--password oder \--community um encodierte Strings handelt. Dies geschieht, indem man *rfc3986://* voranstellt.

Lautet beispielsweise ein Datenbank-Passwort **Die Gold Hühner's** (Gefunden auf [Deppenapostroph](http://www.deppenapostroph.info)), so musste man bisher das einfache Hochkomma mit einem Backslash entwerten, oder das Passwort in doppelte Hochkommas packen, was aber wiederum die Verwendung  eines doppelten Hochkommas als Bestandteil des Passworts auschließt, oder sonstige Verrenkungen machen.
Einfacher ist es, gleich **\--password rfc3986://Die%20Gold%27%20H%fchners** zu schreiben, das Plugin kümmert sich dann um den Rest.

Und im Grunde genommen muss man auch gar nichts selber schreiben, denn verwendet man [coshsh](/nagios/coshsh), so können DBAs und Applikationsbenutzer etc. in der CMDB oder irgendwelchen Inventar-Sheets die wüstesten Passwörter eintragen, der Generator encodiert sie automatisch. So sieht es beispielsweise in einer Class *app_db_mssql.py* aus:
```python
...
        # url encode sql statement, remove trailing semicolon
        self.sql_statement = urllib.pathname2url(self.sql_statement.rstrip('; \t'))
        # escape user name if it is a domain user
        self.user_name = re.sub(r'\\', r'\\\\', self.user_name)
        # escape the password
        self.user_password = 'rfc3986://' + urllib.pathname2url(self.user_password)
...
```

und das dazugehörige tpl-File:
<div class="highlight">
 <pre>
  <code class="langiuage-text" data-lang="text">
object Service "app_db_mssql_maintenance_job" {
  import "app_db_mssql"

  check_command = "check_mssql_health_sql"
  host_name = "&#123;&#123; application.host_name }}"
  vars.mssql_username = "&#123;&#123; application.user_name }}"
  vars.mssql_password = "&#123;&#123; application.user_password }}"
  vars.mssql_name = "&#123;&#123; application.sql_statement }}"
  vars.mssql_warn = "&#123;&#123; application.warn_arg }}"
  vars.mssql_crit = "&#123;&#123; application.crit_arg }}"
}
  </code>
 </pre>
</div>
basierend auf...
```text
object CheckCommand "check_mssql_health_sql" {
    import "plugin-check-command"
    command =[ PluginMorgNagPlugDir + "/check_mssql_health"]
 
        arguments = {
                "--server" = "$address$"
                "--password" = "$mssql_password$"
                "--username" = "$mssql_username$"
                "--mode" = "sql"
                "--name" = "$mssql_name$"
                "--warning" = "$mssql_warn$"
                "--critical" = "$mssql_crit$"
        }
}
```