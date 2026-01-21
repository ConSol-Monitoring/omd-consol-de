---
author: Gerhard Laußer
date: '2013-02-03T20:00:56+00:00'
slug: youtube-monitoring-mit-check_logfiles
tags:
- check_logfiles
title: YouTube-Monitoring mit check_logfiles
---

<div class="paragraph">   <p>Anlässlich der neuen Videoserie &quot;ConSol Monitoring Minutes&quot; habe ich mir überlegt, wie man die Zahl der Zugriffe auf ein YouTube-Video mit einem Nagios-Plugin auslesen und mit <a href="http://www.pnp4nagios.org/">PNP4Nagios</a> aufzeichnen kann. Ein eigenes Plugin müsste dazu die Informationen herunterladen, Kennzahlen aus dem Resultat herausparsen, ausgeben und nicht zuletzt irgendwie auf Download-Fehler reagieren. Mit check_logfiles, einer kleinen Konfigurationsdatei und der <a href="https://developers.google.com/youtube/2.0/developers_guide_protocol_video_entries">YouTube-API</a> ist das aber kein Problem.</p> </div><!--more--><div class="paragraph">   <p>So sieht die Konfigurationsdatei aus:</p> </div>  <div class="listingblock">   <div class="content"><!-- Generator: GNU source-highlight 3.1.7
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->     <pre><tt>$prescript = 'wget';
$prescriptparams = '--quiet'.
    ' --output-document=/tmp/$CL_VIDEO$.xml'.
    ' http://gdata.youtube.com/feeds/api/videos?q=$CL_VIDEO$&v=2';
$scriptpath = &quot;/usr/bin&quot;;
$options = &quot;prescript,supersmartpostscript&quot;;

@searches = ({
  tag =&gt; '$CL_VIDEO$',
  logfile =&gt; '/tmp/$CL_VIDEO$.xml',
  criticalpatterns =&gt; ['statistics', 'rating', 'media:title'],
  options =&gt; &quot;script,allyoucaneat&quot;,
  script =&gt; sub {
    my $line = $ENV{CHECK_LOGFILES_SERVICEOUTPUT};
    if ($line =~ /viewCount='(\d+)'/) {
      $CHECK_LOGFILES_PRIVATESTATE-&gt;{views} = $1;
    }
    if ($line =~ /numDislikes='(\d+)'/) {
      $CHECK_LOGFILES_PRIVATESTATE-&gt;{dislikes} = $1;
    }
    if ($line =~ /numLikes='(\d+)'/) {
      $CHECK_LOGFILES_PRIVATESTATE-&gt;{likes} = $1;
    }
    if ($line =~ /&lt;media:title.*?&gt;(.*?)&lt;\/media:title&gt;/) {
      $CHECK_LOGFILES_PRIVATESTATE-&gt;{title} = $1;
    }
  },
});

$postscript = sub {
  my $video = $ENV{CHECK_LOGFILES_VIDEO};
  my $state = $CHECK_LOGFILES_PRIVATESTATE-&gt;{$video};
  my $title = exists $state-&gt;{title} ? $state-&gt;{title} : &quot;(unknown)&quot;;
  my $views = exists $state-&gt;{views} ? $state-&gt;{views} : 0;
  my $likes = exists $state-&gt;{likes} ? $state-&gt;{likes} : 0;
  my $dislikes = exists $state-&gt;{dislikes} ? $state-&gt;{dislikes} : 0;
  my $popularity = ($likes + $dislikes) ?
      $likes * 100 / ($likes + $dislikes) : 100;
  printf &quot;%s was viewed %d times | %s=%d popularity=%.02f%%\n&quot;,
    $title, $views, $video, $views, $popularity;
  unlink '/tmp/'.$video.'.xml';
  return 0;
};</tt></pre>
  </div>
</div>

<div class="paragraph">
  <p>Und so ruft man’s dann auf:</p>
</div>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.7
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>$ check_logfiles --config youtube.cfg --macro CL_VIDEO=1fk0V7M
OMD im Überblick - ConSol Monitoring Minutes 1/13 was viewed 77 times | 1J0V7M=77 popularity=100.00%</tt></pre>
  </div>
</div>

<div class="paragraph">
  <p>
    <br />

    <br />Das ist noch ein bisschen mager, bei bekannteren Videos sehen die Zahlen schon imposanter aus. &quot;Gangnam Style&quot; hätte ich gern als Beispiel gezeigt, aber da hat die GEMA einen Riegel vorgeschoben. Das derzeit populärste Video bei YouTube ist aber auch nicht schlecht.

    <div class="content"><!-- Generator: GNU source-highlight 3.1.7
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
      <pre><tt>$ check_logfiles --config youtube.cfg --macro CL_VIDEO=Gng3sPiJdzA
The Ultimate Girls Fail Compilation 2012 was viewed 67845545 times | Gng3sPiJdzA=67845545 popularity=86.39%</tt></pre>
    </div>
  </p>
</div>

<div class="paragraph">
  <p>
    <br />Mir ging es einfach nur darum, den Anstieg der Views aufzuzeichnen. Zwecks Alarmierung Schwellwerte zu setzen wäre aber auch kein Problem. Man erweitert dann das Postscript im Konfigfile folgendermassen:

    <div class="content"><!-- Generator: GNU source-highlight 3.1.7
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
      <pre><tt>  printf &quot;%s was viewed %d times | %s=%d popularity=%.02f%%\n&quot;,
    $title, $views, $video, $views, $popularity;
  if ($ENV{CHECK_LOGFILES_CRITICAL} &amp;&amp;
      $views &gt; $ENV{CHECK_LOGFILES_CRITICAL}) {
    return 2;
  } elsif ($ENV{CHECK_LOGFILES_WARNING} &amp;&amp;
      $views &gt; $ENV{CHECK_LOGFILES_WARNING}) {
    return 1;
  } else {
    return 0;
  }
};</tt></pre>
    </div>
  </p>
</div>

<div class="listingblock">
  <div class="content"><!-- Generator: GNU source-highlight 3.1.7
by Lorenzo Bettini
http://www.lorenzobettini.it
http://www.gnu.org/software/src-highlite -->
    <pre><tt>$ check_logfiles --config youtube.cfg --macro CL_VIDEO=qHX34uMNXQ8 --warning 1000000 --critical 2000000
Andre Rieu &amp;amp; Heino - Rosamunde 2009 was viewed 1231937 times | qHX34uMNXQ8=1
231937 popularity=95.77%
$ echo $?
1</tt></pre>
  </div>
</div>