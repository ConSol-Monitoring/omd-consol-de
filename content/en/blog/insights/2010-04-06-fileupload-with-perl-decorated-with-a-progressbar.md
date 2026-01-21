---
author: Roland Huß
date: '2010-04-06T18:05:30+00:00'
excerpt: 'With [LWP](http://search.cpan.org/~gaas/libwww-perl) you can easily upload
  a file from within a Perl script. This post gives a small demo how to enhance your
  upload scripts with a progressbar for giving feedback while uploading. '
slug: fileupload-with-perl-decorated-with-a-progressbar
tags:
- LWP
title: Fileupload with perl, decorated with a progressbar
---

With [LWP](http://search.cpan.org/~gaas/libwww-perl) you can easily upload a file from within a perl script. To add some sugar this small example shows how to show a progressbar during the upload. This is especially useful for giving feedback while uploading large files. This technique is based on LWP's *DYNAMIC_FILE_UPLOAD* hook for sending files chunk by chunk. BTW, this feature is a good thing anyway in order to avoid sucking  large files completely into memory before doing an upload.

<!--more-->
From the HTTP::Request::Common man-page:

> If you set the $DYNAMIC_FILE_UPLOAD variable (exportable) to some TRUE value, then you get back a request object with a subroutine
> closure as the content attribute.  This subroutine will read the content of any files on demand and return it in suitable chunks.
> This allow you to upload arbitrary big files without using lots of memory.

If embedded in a larger program you should limit the scope of  `$DYNAMIC_FILE_UPLOAD_VARIABLE` to a local scope for minimal intrusiveness.

Here's the sample for an upload with progressbar (but only when the sweet little module [Term::ProgressBar][2] is installed):

```perl
use LWP::UserAgent;
use HTTP::Request::Common;
use strict;
use vars qw($HAS_PROGRESS_BAR);

BEGIN {
    eval {
        require "Term/ProgressBar.pm";
        $HAS_PROGRESS_BAR = 1;
    };
}

my $url = shift || die "No url given";
my $file = shift || die "No file given";
my $ua = new LWP::UserAgent();

local $HTTP::Request::Common::DYNAMIC_FILE_UPLOAD = 1;

my $req =
  POST
  $url,
  'Content_Type' => 'form-data',
  'Content' => { "upload" => [ $file ] };
my $reader = &create_content_reader($req->content(),
                                    $req->header('Content_Length'));
$req->content($reader);
my $resp = $ua->request($req);
die "Error while uploading $file: ",$resp->message if $resp->is_error;

sub create_content_reader {
    my $gen = shift;
    my $len = shift;
    if ($HAS_PROGRESS_BAR) {
        my $progress =
          new Term::ProgressBar({name => "Upload",count => $len,
                                 remove => 1,term_width => 65});
        $progress->minor(0);
        my $size = 0;
        my $next_update = 0;
        return sub {
            my $chunk = &$gen();
            $size += length($chunk) if $chunk;
            $next_update = $progress->update($size)
              if $size >= $next_update;
            return $chunk;
        }
    } else {
        return sub {
            return &$gen();
        }
    }
}
```

<script type="text/javascript">var dzone_url = 'http://labs.consol.de/misc/2010/04/06/fileupload-with-perl-decorated-with-a-progressbar.html';</script>
<script type="text/javascript">var dzone_style = '2';</script>
<script language="javascript" src="http://widgets.dzone.com/links/widgets/zoneit.js"></script>

 [1]: http://search.cpan.org/~gaas/libwww-perl
 [2]: http://search.cpan.org/~fluffy/Term-ProgressBar