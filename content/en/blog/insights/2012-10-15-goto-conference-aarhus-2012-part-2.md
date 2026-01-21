---
author: Joachim Wiedmann
date: '2012-10-15T14:22:05+00:00'
slug: goto-conference-aarhus-2012-part-2
tags:
- conference
title: GOTO Conference Aarhus 2012 (part 2)
---

I just returned from the GOTO Aarhus 2012 conference. Here's some of my highlights:

<!--more-->
<strong>Up up and Out: Scaling software with Akka / Jonas Bonér</strong>

Jonas Bonér was presenting a good introduction to Akka. Akka is inspired by the Actor model
of Erlang, brought it to the JVM and seems to have expanded on that a bit.
The idea of an actor "becoming" something completely different by stacking and popping
behaviors was new to me. But I am sure that a seasoned Erlang programmer knows how to do this in Erlang as well (although
maybe not in such a nice way as Akka allows to). Anyway you should have a look at the actor model because
"concurrency in Java is broken" as Jonas put it. I think this it the way to go for heavily
concurrent applications. Performance wise Akka is pretty impressive. According to their own
performance tests Akka was able to process about 20 millions of messages/second. This
seemed to have really pushed Java concurrency to its limits. After Doug Lea - who wrote much of
Javas new concurrency libraries - made some changes this more than doubled to about
50 million messages/second.

<strong>Management Myths: are we getting any better at this? / Dave Clack</strong>

Dave Clack talked about common myths and busted some of these backed by research studies
and his own experience. He also gave advice as to how to work around some of the deficiencies
he uncovered. One of the myths is that productivity can be measured. As you cannot
measure precisely the output of a developer (loc, story points, function points, ...?)
productivity (e.g. velocity) as defined by input/output does not makt too much sense -
especially if you want to compare it across teams or projects. Although in his own projects
he still measures these things. He asserted that it is important to know why something
works or does not work as opposed to apply something mechanically because someone
told you so. I definitely agree.

<strong>7 Things: How to make good teams great / Sven Peters</strong>

<strong></strong>
Sven of Atlassian showed us some practices they use in their working environment.
This was one of the talks I really like at conferences: it is when people share their
own experience and do not only glorify the results but also talk about the things
which did not work out quite as expected. For example "20% time" to pursue other
ideas which are not related to your project turned out to be become more like "5% or less time" in
Svens projects. This was because people sacrified this time rather than the Sprint goals
they had committed to. At least one of the ideas I will try in my office by being the
"change you seek" as Sven put it. Be surprised what that will be :-).

<strong>Building Distributed Systems with Riak Core / Steve Vinoski</strong>

<strong></strong>
Steve Vinoski really knows his stuff. He talked us through a number of NoSQL paradigms
and algorithms Riak uses in its core implementation. These include: CAP theorem, PACELC,
consistent hashing, sloppy quorums, gossip protocol, vector clocks, virtual nodes, etc..
After the talk I wanted to start hacking and write my own NoSQL database because it all
seemed to be so easy :-) - or was it just because Steve explained it so well?

<strong>Disband the Deployment Army / Michael T. Nygard</strong>

<strong></strong>
Michael Nygard started off with a picture I know too well from one of our customers:
30+ people in one room at about 1 am halfway through deploying a new release into production.
This is the result of a vicious circle: we fear the risk of deploying something into production
therefore we do it only a small number of times a year. Thus increasing the number of accumulated features which are released at one time.
Which actually increases the risk that something bad happens. To mitigate the risk
a high number of people are present at the launch because people are good at solving
problems and creative about getting a stuck system to run. Of course this costs a lot of money.
That's why we need to release even more infrequent.
Very soon we are trapped and cannot move out of this corner. The solution (of course :-)
is continuous deployment. Nothing really new here. Michael showed us how continuous deployment
actually reduces the risk. This is something you can show your manager too.

<strong>Hire "A" Teams / Alexander Grosse</strong>

<strong></strong>
And now for something completely different: Alexander of Soundcloud talked about hiring
and how they do it. Soundcloud is quite different from my employer as it is a fast growing startup.
They get dozens of applications a week. What I like about their approach is that they pay at
least as much attention to the technical skills of a candidate as well as to whether
he fits the culture of the company. To test this they pose a programming exercise and
have quite a lot of people talk to the candidate. On top of that they either have
lunch or a beer with her in order to get to know her in another situation. All of the
involved people then have a say in the decision whether the candidate is accepted.
What I still puzzle over is how to check whether a candidate is a good team player?
Some companies do actually place candidates in a project team and let them pair with
a developer. This seems quite a lot of effort to me. Although if you look at the investment
into a new employee one can justify it. In the end I think nothing can test a candidate
better than actually working with your team.

<strong>Globally Distributed Cloud Applications at Netflix / Adrian Cockcroft</strong>

<strong></strong>
Adrian Cockcroft gave a pretty good insight into how Netflix operates in the cloud.
As an enterprise developer I am truly impressed by the sheer numbers he presented. E.g. at
peak times Netflix is responsible for more than 30% of internet traffic in the U.S..
I especially liked the idea of the chaos monkey - a script which just randomly kills
production servers. How confident you must be in your system to unleash such a beast!

<strong>The Agile Mindset -- and beyond / Linda Rising</strong>

<strong></strong>
Linda Rising as always was great to listen to. She talked about people having "
two mindsets toward ability: (1) that we have a fixed amount of talent or intelligence, what
we are born with and there’s nothing we can do about it; (2) that we are born with a certain
amount of talent or intelligence, but we can all improve by working hard. These two mindsets:
“fixed” and “agile” not only determine how we feel about our own success or failure but
also how we feel about others." (quote from the conference program
http://gotocon.com/aarhus-2012/presentation/The%20Agile%20Mindset%20--%20and%20beyond).
This thinking determines our goals and eventually our achievements in life.
It is clear on which side you want to be on: the agile. This is all about failure
and learning from failure. Not only applies this to our working but also to our
personal lifes. So the talk went beyond the scope of a techie conference. In the
slides she even offered advice on how to talk to your colleagues and children
in order to promote the agile mindset. Have a look here:
http://gotocon.com/dl/goto-aar-2012/slides/LindaRising_TheAgileMindsetAndBeyond.pdf.
I will definitely learn some phrases especially for my little daughter :-).

&nbsp;

I attended some more good talks which I can recommend to watch like Liz Keoghs "To be honest..." or the really entertaining
"Hard things made easy - Part 1" but have to stop writing here. Watch the
videos once they have been released on the GOTO you tube channel (http://www.youtube.com/user/GotoConferences).
All in all GOTO 2012 was a good conference - well organised, the talks generally had a
high level of quality (except for two or three...), good food and a wide range of topics.
Actually there is not so much of a difference compared to the QCon conferences (there is
also overlap in the organizers). The atmosphere is more relaxed, there are fewer
attendants and it is much more comfortable to eat your lunch sitting on a chair than
standing with the plate in your hands. I kind of missed the "great inspirational" or
"really new" topic - but how often can you have that in a conference?
So: recommended.

&nbsp;