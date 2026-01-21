---
author: Roland Huß
date: '2012-10-08T19:17:00+00:00'
slug: goto-conference-aarhus-2012
tags:
- conference
title: GOTO Conference Aarhus 2012
---

This year was the first time I went to a GOTO conference,
i.e. [GOTO Aarhus 2012][1]. Traveling to Denmark took me remarkably
long (12 hours), but this is probably due to my inability in
effectively route planning (though it would be cool, if somebody could
point me how to go faster from Nuremberg, Germany to Aarhus,
Denmark. Just in case ;-). This blog sums up my impressions of this
developer event.

<!--more-->
There has been several big themes on the conference. I summarize my
opinion on some of them.

## NoSQL

NoSQL, although confessely a terrible naming, has arrived. At least
five major vendors with their products (Cassandra, Riak, neo4j,
MongoDB, CouchBase) where highly present at the conference booth. I
didn't attended much of the talks, but a very good overview of what
is "NoSQL" is all about (including the CAP-Theorem) was given by
Martin Fowler. Really well done, drawing clear lines between the
camps: NoSQL vs. Relational, Graph vs. Document vs. Column Family
based approaches. I really liked the talk and probably will buy his
[book][2], too (and also because it's only 152 pages ;-). The takeaway here
for me was, that in the future there won't be a single DB methodology
to choose from (like in the last decades with RDBMS), but we
are entering the epoch of "Polyglot Persistence" where one has to/can
choose different approaches for different use cases.

The NoSQL podium discussion however was bit disappointing. Five
vendors sitting together (with Martin Fowler) mostly praising their
own products. Well, to be fair they also worked out somewhat the boundaries
and limitations of their products, but the disappointing part was, that the audience
didn't really had a chance to take part on the discussion. Despite the
announcement, that audience questions would be a substantial part of the
session, the moderator (this guy in the pink suite) didn't even tried
to bring on the audience into the discussion. At the end, there were
only time for a single question.

## Agile

_Agile_ had also its place in the conference. Although I attended only
a few tracks, it seems that the agile movement itself is quite
agile. At least they critically point out on the mistakes done in the
past, which per se is already a typical agile characteristics. IMO,
especially this sort of self inspection make this movement so
sympatically. Always on the run, don't be satisfied with the status
quo, so moving on the the process itself. [Jutta Eckstein][3] didn't
had any calendar motto and prefactored answers, but pointed out the
issues when putting agile into a company on various levels (marketing,
management, operations, human resources, ....). Interesting talk with
some insights into the various forces fighting in this process.

The takeawyas of the agile talks for me was:

* _Business Value_ is king
* _Trust_ is the foundation of everything
* It's all about the _People_. True in every respect.

# Continous Delivery/Deployment

The momentum in CD seems to have slowed down a bit. Even
[Jez Humble][4] states that the adoption of CD in an existing
environment can take years and is not easy business. A lot of people
need to be convinced and the advantages for everybody need to show
up. The starting point is nearly always
[Continous Integration][5]. But frankly, who doing serious software
development does *not* Continous Integration these days ? It would
have been nice to see, how the _next steps_ could look like.

Continous Deployment at [Etsy][6] is an impressive example of real world
setup with 30+ deployments per day. Nothing really new, Flickr did it
already some years ago. But nice to see, how an PHP app can fit the
bill nicely. Feature toggles are the key feature, they
seemingly became the 'golden hammer' of CD.

One tidbit of this presentation was, how they deal with DB schema
changes:

* Don't use *ALTER TABLE*, only add tables & columns.
* 3 Toggles:
  * `write_new_schema` (true/false),
  * `write_old_schema` (true/false),
  * `read_new_schema` (0%/1%/10%/50%/.../100%)
* `write_new_schema` and `write_old_schema` switched on, all data
  written goes in to the old and new schema, but reads are from the
  old schema only.
* Catch up by migrating old (historical) values to the new
  schema. This can be done offline.
* Turn on slowly reading from the new schema, e.g. with 1% for all
  user. Check for errors, and switch it off again eventually to fix
  the problems.
* If everything is fine set `write_old_schema` to `false` and `read_new_schema` to 100%.
* Finally, remove the parts of the old schema not needed anymore (and
  the toggles).

# The Keynotes

My feelings about the keynote are quite mixed. The first one of
[Rick Falkvinge][7] had some valid points, which however has been
outshined by his infinite ego. Also, it was really a white-black talk
with no shades of gray. 'guess this is what politics is all
about. 'didn't like the talk very much, expect maybe for this red-flag
story as historical anecdote.

The second keynote from [Scott Hanselmann](http://www.hanselman.com) expressed exact my
opinion tha JavaScript is becoming the assembler for the Web. The talk
was very well done and entertaining. (Highlight: Compiling a C-Program
on Linux emulated with JavaScript in Chrome on Windows (which in turn
could run on a VM on Windows ;-)

# Damian Conway

Perl was my first love, starting with the pink Camel book. I learned
OO by learning how Perl 5 introduced it with a single keyword
("bless") on top of the existing Perl goodies. I have some CPAN
modules, butn then I moved on, got exited a bit of Perl 6, but finally
lost interest beause for me from the outside, progress seems to have
slowed down to 0 asymptotically. So, I was really curious what Damian
Conway (second perl god) had in his pocket. First of all, his keynote
was really brilliant, centered around the (quite old) Perl (Fun-?)
modules like
[`Quantum::Superpositions`](http://search.cpan.org/~lembark/Quantum-Superpositions-2.02). Really
entertaining as well as his summary on Perl 6, which is IMO really 5
to 7 years late. The language is already quite nice (but nothing
'modern' functional-objectoriented crossover could not do also), but I
would give it a serious try. Although I think that the runtime
environment is still far from being usable performance wise. The
demos in Damians first talk indicated a factor of 10 or so with which
Perl 6 programs are slower compared to Perl 5 these days. Will it take
another 10 years to catch up in performance ? Please not.

# TypeScript

And then, when I really thought there is not something really exciting
a this conference, then, TypeScript from Microsoft went along in the
last talk ever on this
conference. [Anders Hejlsberg](http://gotocon.com/aarhus-2012/presentation/Closing%20Keynote:%20A%20language%20for%20application-scale%20JavaScript%20development),
father of Turbo Pascal, Delphi and C# presented a new Javascript-Addon
called "TypeScript". Also I really can't be called a Microsoft fan
boy, TypeScripts excites me quite a lot. It is a superset of JavaScript
(so every JavaScript program is a valid TypeScript program, too) which
compiles down to pure JavaScript without extra dependencies. It adds
type and interface declarations to JavaScript functions which can help
compilers to detect type-based errors early and tool for things like
code completions or refactorings. For me it is different e.g. to Dart
as it does not target a new kind of VM but the current state of
JavaScript VMs. I suspect Microsoft's return-on-invest goes over
tooling, for which currently only a tight Visual Studio integration
exists. But if others (Eclipse, IntelliJ) catch up, which shouldn't be
that hard if using the existing Java Type machinery, then it is really
an exiting extension to JavaScript, allowing for all sort of comfort
known to Java programmers like complex refactorings or early error
detections. If non-Microsoft Tool support catches up quickly, I
probably even give up my fresh love CoffeeScript.

# GOTO vs. Devoxx

Since [Devoxx](http://www.devoxx.com) is my _home_ conference, I tend to compare them all
against it:

* Catering was far better in Aarhus than in Antwerp. In fact, for a
  conference of this size it was excellent.
* The concert hall in Aarhus hosted the GOTO conference at it was a
  quite nice ambience. However nothing can beat the cinema chairs in
  Antwerp's Metropolis, especially when it comes to legroom.
* Speaker quality was a bit mixed in Aarhus. There were really
  top-notch speakers at the GOTO where even the best speakers of Devoxx
  probably loose the comparison. But there were also really worse
  ones, so the spectrum was quite large.
* The quality of talks or the 'technical depth' was a bit
  disappointing. It could be, that I missed the most interesting ones,
  but those, which I attended were mostly high-level, which no much
  new insights (for me). Only a handful talks had some new stuff to present,
  which then I really enjoyed. And yes, luckily there was [TypeScript][8] at the end ;-)

To sum it up, I liked the conference (also I got sick at
half-time ;-(, but probably won't come back next year.

[1]: http://gotocon.com//aarhus-2012/
[2]: http://martinfowler.com/books/nosql.html
[3]: http://gotocon.com/aarhus-2012/presentation/Agile%20Development%20within%20the%20corporation
[4]: http://gotocon.com/aarhus-2012/presentation/Implementing%20Continuous%20Delivery
[5]: http://martinfowler.com/articles/continuousIntegration.html
[6]: http://gotocon.com/aarhus-2012/presentation/Continuous%20Delivery:%20The%20Dirty%20Details
[7]: http://gotocon.com/aarhus-2012/presentation/Morning%20Keynote:%20Beware%20Red%20Flags%20On%20The%20Internet
[8]: http://www.typescriptlang.org/