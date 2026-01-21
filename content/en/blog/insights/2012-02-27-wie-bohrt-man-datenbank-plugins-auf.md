---
author: Gerhard Laußer
date: '2012-02-27T16:33:55+00:00'
slug: wie-bohrt-man-datenbank-plugins-auf
tags:
- check_db2_health
title: Wie bohrt man Datenbank-Plugins auf?
---

<p>check_oracle_health, check_mysql_health, check_mssql_health und check_db2_health bringen von Haus aus schon eine Menge Funktionalität mit. Allerdings wurden sie speziell für die Belange von Datenbankadministratoren entwickelt. Um auch den Betreibern von datenbankgestützten Applikationen die Möglichkeit zu geben, bestimmte Werte per SQL abzufragen, gibt es den Parameter "--mode sql". Damit lässt sich das numerische Ergebnis eines SQL-Aufrufs mit Schwellwerten vergleichen und in einen Nagios-Exitcode verwandeln. Üblicherweise sind die Anforderungen der Applikation an das Monitoring jedoch etwas komplexer. Am Beispiel von check_mysql_health und Wordpress wird gezeigt, wie man so etwas einfach umsetzen kann. </p><!--more--><p>Jedem der genannten Plugins liegt im Unterverzeichnis <i>contrib</i> eine Datei namens <i>Check*HealthExt1.pm</i> bei. Ebenfalls findet man hier die Datei <i>README.my-extensions</i>, in der die API beschrieben wird, mit deren Hilfe man eigene, firmen- bzw. applikationsspezifische Erweiterungen für die Datenbankplugins implementiert. Für einen Wordpress-basierten Webauftritt sollen nun zwei Werte abgefragt werden: </p>  <ul>   <li>Die Anzahl der abgegebenen Kommentare pro Sekunde. Damit lassen sich z.B. Spamattacken erkennen. Oder man kann nachvollziehen, ob ein bestimmter Blogpost bei seinem Erscheinen grosse Resonanz verursacht hat. </li>    <li>Die Tage, die vergangen sind, seit der letzte Blogeintrag veröffentlicht wurde. Da ein Blog nur dann erfolgreich ist, wenn er lebt, kann man sich so einen Wecker stellen, der einen daran erinnert, wieder mal zu bloggen. </li> </ul>  <p>Dazu erstellt man eine Datei /tmp/CheckMySQLHealthExt1.pm folgenden Inhalts: </p>  ```perl
package MyWordpress;

our @ISA = qw(DBD::MySQL::Server);

sub init {
  my $self = shift;
  my %params = @_;
  $self->{comments} = 0;
  if ($params{mode} =~ /my::wordpress::commentrate/) {
    $self->{comments} = $self->{handle}->fetchrow_array(q{
        SELECT
            COUNT(*)
        FROM
            wp_comments
    });
    $self->valdiff(%params, qw(comments));
    $self->{comment_rate} = $self->{delta_comments} / $self->{delta_timestamp};
  } elsif ($params{mode} =~ /my::wordpress::lastpost/) {
    $self->{last_post} = $self->{handle}->fetchrow_array(q{
        SELECT
            TIME_TO_SEC(TIMEDIFF(NOW(), post_date)) / 86400
        FROM
            wp_posts
        WHERE post_date = (
            SELECT
                MAX(post_date)
            FROM
                wp_posts
            WHERE
                post_status = 'publish'
            AND
                post_type = 'post'
        )
    });
  } else {
  }
}

sub nagios {
  my $self = shift;
  my %params = @_;
  if ($params{mode} =~ /my::wordpress::commentrate/) {
    $self->add_nagios(
        $self->check_thresholds($self->{comment_rate}, 1, 10),
        sprintf "we receive %.2f comments per second", $self->{comment_rate});
    $self->add_perfdata(sprintf "comment_rate=%.2f;%s;%s",
        $self->{comment_rate}, $self->{warningrange}, $self->{criticalrange});
  } elsif ($params{mode} =~ /my::wordpress::lastpost/) {
    $self->add_nagios(
        $self->check_thresholds($self->{last_post}, 2, 5),
        sprintf "you did not post since %.2f days", $self->{last_post});
  } else {
    $self->add_nagios_unknown("unknown mode");
  }
}
```

<p>Ruft man nun check_mysql_health mit einem zusätzlichen Parameter --with-mymodules-dyn-dir /tmp auf, so wird zur Laufzeit obiges Perl-Script ins Plugin eingebunden und es stehen die beiden neuen Modi my-wordpress-commentrate und my-wordpress-lastpost zur Verfügung. (siehe $params{mode} im Code. Die Doppeldoppelpunkte werden durch ein Minus ersetzt) </p>

```bash
shinken$ check_mysql_health --hostname localhost --username wpadmin --password geheim
    --database wordpress
    --with-mymodules-dyn-dir /tmp --mode my-wordpress-lastpost
CRITICAL - you did not post since 12.69 days
```

```bash
shinken$ check_mysql_health --hostname localhost --username wpadmin --password geheim
    --database wordpress
    --with-mymodules-dyn-dir /tmp --mode my-wordpress-commentrate
OK - we receive 0.02 comments per second | comment_rate=0.02;1;10
```