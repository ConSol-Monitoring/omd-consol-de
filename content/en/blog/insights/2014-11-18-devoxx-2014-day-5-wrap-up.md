---
author: Christoph Deppisch
date: '2014-11-18T15:28:44+00:00'
slug: devoxx-2014-day-5-wrap-up
tags:
- devoxx
title: Devoxx 2014, Day 5 & Wrap-Up
---

Devoxx is over, sadly, and under normal circumstances this would be the time when we Devoxxians return to our everyday's lives for another year.

However, this time it is different: At Google's booth at the exhibition area we got their latest Cardboard gadget. Cardboard is a virtual reality viewer for Android phones and it is absolutely the greatest thing I have ever seen on a phone. The Cardboard app comes with a lot of fancy demos like a virtual reality tour through Versailles, flying around in Google earth and even a short animated 360° movie.

For me Devoxx did not stop when I left the venue this afternoon. Devoxx continued at home when I opened that Cardboard give-away. Infinite possibilities, the motto of this year's Devoxx, couldn't fit better. I definitely need to check it out and learn more about it.

Thank you very much for that, Google! (fabian)

See you next year, at the Devoxx. But before that lets have a look at the last day and a very inspiring talk on Android Wear:

<!--more-->

## "Introduction to Android Wear - A Glimpse into the Future" by Cyril Mottier (christian)

As the title suggests the talk gave a glimpse into the future of gadgets. Personally, I doubt that so called **wearables** will affect our daily lives as much as smartphones did in recent years. However, I am fairly sure these small pieces of technology will be adopted by more and more people and will become a usual sight.

The talk gave a great overview of what to expect from wearables, especially smartwatches. Cyril made it clear that there is one thing we should _not_ expect: smartphones at a smaller scale. As he pointed out the interaction concepts for such small screens are fundamentally different and hence an adaption of smartphone applications requires a whole redesign.

The interaction-**gap** which smartwatches are intended to fill are _very quick_ checks on _specific_ pieces of information, e.g. new mails, the weather, time until the next calendar event. For these _short-timed_ interactions, pulling out and unlocking your phone already takes half of the time you need to check on the information you were looking for.

There are three things to bear in mind when designing a smartwatch application:

### Context
* Smartwatches are extremely contextual, i.e. they provide the right information at the right time.
* Apps can provide information based on time, location, calendar, activity, sensors, etc. (like Google Now already does on Android phones)
* Since smartwatches are more contextual than smartphones, their state only last s until the watch is sent into standby, i.e. after waking the device it will be in the _initial_ state (not the state you left off)
* **Example:** Weather based on location, flight information based on calendar

### Glanceable
* Information is provided in such a compressed way that you can grasp it with a _single glance_
* Information-"noise" should be reduced and the level of detail kept to a minimum
* **Example:** The weather app only shows a picture, the temperature and the location. No details about wind direction, forecast, etc.
Low Interaction
* As with the displayed information, the possible interactions should be kept at a reasonable, low level
* **Example:** Incoming calls only have two actions: take or decline call, no messaging, no muting or the like

A common use case, if not _the_ use case, are notifications. In fact Cyril mentioned that when developing smartwatches one should think in terms of notification cards with very little but _specific_, _contextual_ information.

I think smartwatches will complement smartphones in the future and aid in displaying relevant, short-lived information. From a developer's point of view developing wearable applications seems to be a very interesting but at the same time highly demanding task.

With an amazing set of slides the presenter gave an excellent overview of the basic principles and goals behind wearables and the challenges to achieve them. The talk did a great job in introducing and awakening my interest in using and developing this kind of application.