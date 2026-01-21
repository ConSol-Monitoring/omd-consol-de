---
author: Philip Griesbacher
date: '2017-09-01T14:00:00+02:00'
featured_image: /assets/2017-09-01-neb-modules-with-go/gopher.png
tags:
- nagios
title: NEB Modules with Go
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em; width: 20%; height: 20%;"><img src="{{page.featured_image}}"></div>

Have you ever written a NEB (Nagios Event Broker) module? This article will explain a tool which makes this a lot easier, especially if the reason was that you are not familiar with C or C++. In this case the “Go NEB Wrapper” could come very handy and if you are new to this topic it is a good point to start with.

<!--more-->

### Pre-note

Everything I explain on “Nagios” as monitoring core in the following also applies to Icinga and Naemon.

# Introduction

First, there will be an introduction of the importance of NEB modules and the context they are used, followed by a briefly overview of the [Go NEB Wrapper](https://github.com/ConSol/go-neb-wrapper). Continuing with an conclusion and further informations.

Maybe you are already using a NEB module if you have a Nagios Server, but you are just not aware of the fact. The most well-known modules are [MK Livestatus](https://mathias-kettner.de/checkmk_livestatus.html) and [Mod-Gearman](https://mod-gearman.org/), which will enhance your Nagios-Core with a database-like query interface or give you the ability to distribute your checks with a [gearman](http://gearman.org/) server.

NEB Modules give you the possibility to load your own program code into the Nagios-Core. This API is supported by Nagios 3/4, Icinga and Naemon, but with slightly different deviations. Due to the fact that these cores are written in C it is only possible to write NEB modules in C / C++. As a NEB module,  your program runs in the Nagios context which gives you access to all the internal data of Nagios, like the check results, notifications, Nagios-internal performance-data and so on. This is the reason why Livestatus and Mod-Gearman have the ability to interfere with the core so heavily.

“With great power comes great responsibility” (Benjamin Parker, ;-) ) - due to the fact that these modules are loaded into the Nagios-Core, any kind of critical failure will stop the whole Nagios-Core.

But why is it that NEB is so unknown in general, compared to for example the Nagios-Plugins where countless of programs exist. The following screenshot is taken from Google Trends, which compares the search interest of these topics.


[![Google Trends](/assets/2017-09-01-neb-modules-with-go/google_trends.png)](https://trends.google.com/trends/explore?date=all&q=nagios%20plugin,neb%20module,mk%20livestatus)

On average “nagios plugin” has 57%, “mk livestatus” has 1% and “neb module” 0% over the last 13 years. This is how Google explains these numbers: “Numbers represent search interest relative to the highest point on the chart for the given region and time. A value of 100 is the peak popularity for the term. A value of 50 means that the term is half as popular. Likewise a score of 0 means the term was less than 1% as popular as the peak.” (Google Trends, 2017)

The same goes for the [Nagios Exchange page](https://exchange.nagios.org): there are only 5 projects listed beneath the Addon category [“Event Broker”](https://exchange.nagios.org/directory/Addons/Event-Brokers) but over 4000 different [plugins](https://exchange.nagios.org/directory/Plugins). But to be fair the projects are not very well sorted, for example Mod-Gearman is not listed as “Event Broker” but it is listed under “Distributed Monitoring”, but even when added there, it will not make a big difference.

Why is it that there are so less NEB modules? Here are some reasons I found, they may be not 100% objective and probably do not apply for everybody:
-	Basic Documentation: There is (as far as I found) only one [PDF document](http://nagios.sourceforge.net/download/contrib/documentation/misc/NEB%202x%20Module%20API.pdf) which describes very basically how NEB modules have to work and their possibilities.
-	C / C ++: The number of plugins written in these languages is also very low, the lion part of the community plugins are written in a scripting language (Perl, Python, Bash, …).
-	There is not that big need of a core extension as for different plugins.

# Realization

These where enough reasons to try out something new, and the [Go NEB Wrapper](https://github.com/ConSol/go-neb-wrapper) project has been created. This is a Golang library which gives the possibility to create NEB modules. The development of this library went hand in hand with the fist module [Iapetos](https://github.com/Griesbacher/Iapetos), a Prometheus exporter for Nagios (another post will follow regarding this topic and linked here). The aim of this library is that you do not have to get in contact with any C Code at all, instead you should be able to use pure Go.

But first some basic introduction, this library uses CGo, which gives you the possibility to compile your program to a C binary. There is not so much information regarding this field of Go, but these pages are very useful: [C? Go? Cgo!](https://blog.golang.org/c-go-cgo) and [cgo](https://golang.org/cmd/cgo/). With CGo it is possible to compile the library and your code to a C shared library file, which can be loaded by the Nagios core.

Like already said the aim is to reduce the amount of C Code in your Go Program, because even if it is possible to add C Code it is by fare not handy nor nice. That is why this library exists, to hide all the nasty stuff. So, if you look into the [Iapetos](https://github.com/Griesbacher/Iapetos) project you will not find such C Code there, like I will show you in the following example, which is simplified from [cgo](https://golang.org/cmd/cgo/):

``` go
1  package main
2  
3  // int fortytwo()
4  // {
5  //     return 42;
6  // }
7  import "C"
8  import "fmt"
9
10 func main() {
11     fmt.Println(C.fortytwo())
12 }
```

The previous snippet prints 42, but the special thing about this is, that the number 42 has been created in the C context and not in the Go context. How is this program working? Line 1 declares the main package which is needed if the program has to be executed. // are line comments, therefore line 3-6 are comments – but only from Gos point of view. The comment is followed by a special import, the C package. This declares the previous Go-comment to C-Code and therefore we are able to define a function which returns the C type int and the value 42. The lines 7 to 12 contain again plain Go-Code and in line 11 the only line of executed code. “fmt.Println” is a Go function to print the arguments to the commandline but here the argument is the result of a C-Function call, which is possible because the C-Type int and the Go-Type int are equal, this is not always the case, even with building types.

With this trick, it is possible to call Nagios functions and access internal C-Variables and to abstract several common interactions with the core, like:
-	Mapping of constants – they are often not named equally in every core or even missing at all.
-	Calling C-Functions from Go and the other way around – common functions have a wrapper so that they work in pure Go.
-	Callback-Handling – the whole NEB system builds upon callbacks, which have been abstracted and secured. There is an additionally layer within the Go context, which handles the callbacks the user registers. The aim of this layer is among other things, to recover Go panics, because they would crash the core.
-	Conversion of C void pointer – the result of a callback is a void pointer, which you could only convert to a real struct if you know which to use. If so you could convert every variable of this struct to the corresponding Go type, which is a painful, therefore this task has been implemented in some way to the library.

For a full example and how to compile it, have a look at the Github page: [Go NEB Wrapper](https://github.com/ConSol/go-neb-wrapper).

# Conclusion

This library gives you the possibility to write NEB modules in Go, which is very handy. It also saves a lot of manual work and adds more safety at the same time. And like the Iapetos project has proven this is also working and not just some experiment. But there are still some flaws, the biggest is the limitation that this library works only with Nagios3 / Icinga if they are not using the daemon mode, Nagios4 and Naemon do not have this limitation. But this is a problem which does not seem to be solved that easy, because of the way these cores handle the NEB modules.

# Further information

-	There will be another post about [Iapetos](https://github.com/Griesbacher/Iapetos) which will be building up upon this one.
-	There will also be a talk at the [Monitoring Workshop 2017](https://labs.consol.de/wiki/doku.php?id=workshop:2017:start) in Düsseldorf about this topic.