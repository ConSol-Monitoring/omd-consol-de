---
author: Sven Hettwer
author_url: https://twitter.com/SvenHettwer
date: '2018-06-18'
featured_image: /assets/2018-06-18-arch-linux-for-devs/arch_logo.png
meta_description: A experience report of a software developer working with Arch linux
  for 1 year.
tags:
- linux
title: Arch Linux for Devs
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

This report is about the experience, I've made with Arch Linux as the operating system for a developers workstation. You'll be introduced into the concepts of Arch Linux, followed by a introduction into the main tasks such as package installation and OS maintenance. At the end, I'll discuss why I think that Arch Linux is a great OS for developers, and finish with a conclusion.

<!--more-->

## Introduction

First of all, I'd like to avoid the typical OS comparison statements like "Linux is better than Windows", "Mac is better than Linux" or "Windows is better than Mac". If the operating system suites your personal requirements, it is the right choice for you. There is, as in so many aspects in life, no absolute "better" choice.
Please note that this article is nevertheless based on my personal opinion and may vary from your or others opinions.

## What is Arch Linux?
Arch Linux is a extremely lightweight, fully customizable, [rolling release](https://en.wikipedia.org/wiki/Rolling_release) Linux distribution which is driven by its community and has been written from scratch. It follows the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) which results in the fact that there is no *overhead* in the operating system such as a graphical or a commandline installation dialog nor is a configuration tool provided by the distribution itself available. Therefore Arch Linux is targeted on the more experienced Linux user. The simplicity of Arch Linux allows you to build your system exactly as you need it without a reinstall to obtain a new major OS version ever, due to the rolling release attempt. That gives you the opportunity to run your first Arch Linux installation theoretically forever, if you maintain it well.
Different to other distributions, Arch Linux does not ship with a default desktop installation, a default file system or a default tool set. It is *just* an operating system. Nothing more and nothing less. That's simplicity, isn't it?

There are various guides in the [official wiki](https://wiki.archlinux.org) that help you to setup your system as desired. There are also projects providing distributions based on Arch. One of them is [Anarchy Linux](https://anarchy-linux.org/), which I'm personally using. It's basically a Arch Linux with an installation dialog. It's still possible to customize your installation by aborting the installer and do things manually or to uncheck some packages you don't want to be installed.

## Package management
The package manager of Arch Linux is called *[pacman](https://wiki.archlinux.org/index.php/Pacman)*. It's a CLI tool allowing you to install, remove and update the packages on your system. May the packages be self build, downloaded from the official repositories or from the [AUR (Arch User Repository)](https://aur.archlinux.org/), where users are able to provide self maintained packages, pacman is your tool to manage them. Let's have a look at the most important commands:
 * `pacman -Syu`: Update all packages after synchronizing the package repository database
 * `pacman -S <package-name>` Install a package
 * `pacman -R <package-name>` Remove a package
 * `pacman -Qdt` Query the package database and find all packages that are not longer required.

The only slightly uncomfortable task is to install a package from the AUR. These packages have to be build, before you're able to install them. This requires the following steps:
 * Download the sources
 * `cd /path/to/the/sources`
 * Check all files carefully, because AUR repos could potentially contain anything.
 * `makepkg -si` 

Another uncomfortable task is to keep your AUR packages up to date, because pacman is not able to do that. So you would have to check the versions of your AUR packages on a regular basis and reinstall them if required.
But don't be scared! [AUR helper tools](https://wiki.archlinux.org/index.php/AUR_helpers) to the rescue! These tools are capable of managing the official repositories as well as the AUR. I've recently chosen *aurman* as my AUR helper, because it is well maintained, well documented, contains a lot of functionality and simply works well. It is also relatively new as its AUR entry has been created at 2018-03-20 22:31. Have a look at the [aurman AUR page](https://aur.archlinux.org/packages/aurman/) for more details.
*To install aurman on a fresh Arch Linux, just install it manually from the AUR as mentioned earlier. If you're interested in some more details, just visit the [Arch User Respository wiki entry](https://wiki.archlinux.org/index.php/Arch_User_Repository#Installing_packages).*

Because aurman has a native pacman integration, you can just use it as you would use pacman but with AUR support.  

### Available packages
One of my biggest concerns has been, that I could be unable to find all the software packages that I need for my daily work or that the packages may be outdated, because Arch Linux is using its own packaging system. As of today, all packages I require where available via the official repositories or the AUR. This also includes software as the IntelliJ Ultimate IDEA. Contradicting to what I once thought, the Arch Linux packages are absolutely up to date, if not bleeding edge. 

## Maintaining your system

### Software updates
As for many other operating systems the most usual maintenance process is installing updates. As mentioned earlier, this can be done easily with one command `pacman -Syu` or `aurman -Syu` in case that you've chosen aurman. If you install your updates once a week, it wont take long. Currently my updates take ~10 minutes. This excludes the updates where I have to update IntelliJ IDEA. This takes 5-10 min. extra. 
Before you start an update, I highly recommend to check [archlinux.org](https://www.archlinux.org/) for any known issues. As mentioned, Arch Linux is a bleeding edge rolling release distribution. So it might be that some updates require your attention more than others. As of today,  I've had only one update that required manual interaction. The instructions to solve this issue (js52 update) have been well documented on archlinux.org.

### Backups and Restore
Having backups of your files is one of the most important rules when you work with computers. I think nearly everybody has had a situation where data was lost because of insufficient backup. So, I assume that this lesson has been learned and therefore I'll skip that chapter. The more interesting part, that I want to talk about is creating a backup of your operating system so that you're able to restore your system in case of a dramatic system failure. As always, you've many possibilities to achieve that. Let's discuss some scenarios and possible solutions.

#### Unstable system
Let's pretend, you've updated your system. Now your system is throwing error messages around and is slower as it should be. Identifying the root cause can easily become a tedious task if the update was not only performed for one package but for 10 or 20. So, it would be great to roll back your system, right? No Problem! If you've chosen [BTRFS](https://wiki.archlinux.org/index.php/Btrfs) as your file system, you're able to create snapshots of your entire filesystem. These snapshots can be restored If you've booted into a restore medium or a rescue partition. *Please note that a btrfs snapshot is technically **not** a backup. It is just a [copy on write](https://en.wikipedia.org/wiki/Copy-on-write) shadow of your original device.*
Well, to be fair, BTRFS is not Arch Linux exclusive. But it leverages the rolling release concept as any other software package does. Therefore you'll most likely receive bug fixes and improvements earlier than with other distributions.  
    
#### Fatal system crash
Worst case scenario! HDD/SSD damage. Because you've created backups of your files, it's not that bad, right? You just have to setup your system again, restore your files from backup and everything is fine. Nevertheless, installing all of your required packages and setting up your individual configurations may consume some time. Therefore I recommend to backup these information as well, because what is an operating system more than a bunch of packages and configuration, right? Here are the tools I use:
 * [etckeeper](https://wiki.archlinux.org/index.php/Etckeeper): Creates a git repository for your `/etc` folder including fully automated commits after every pacman operation due to lifecycle hooks.
 * [packup](https://aur.archlinux.org/packages/packup/): A simple tool to export the list of installed packages. It also provides a installation functionality, but I would go with aurman here as well.
 * [dotfiles](https://aur.archlinux.org/packages/dotfiles/): A tool to keep track of your dotfiles across multiple systems.

So a recovery of a system using these tools is really simple: Install Arch Linux, install all packages from your exported package list, restore your config, restore your dotfiles, done!

### More information
As mentioned earlier, there are tons of information in the [official wiki](https://wiki.archlinux.org). This also includes a article about [system maintainance](https://wiki.archlinux.org/index.php/System_maintenance). Here you'll find a lot of tools and tasks to keep your system healthy and stable. Please note that not all of the mentioned tasks are required to keep your system stable. Just pick what you think is important to you. 

## Why I think Arch Linux is great for developers
Many of the mentioned aspects in this article are achievable with other distributions as well, but there are some points that make Arch Linux the ideal choice for developers from my point of view.
As developers, we know about software and technology. We know how software works, we know how these technical things come together, we know how to treat software systems. And if we don't know, we're able to learn quickly, because software is our daily business and passion. These aspects in combination with the simplicity and flexibility of Arch Linux is a great combination with a lot of potential to make your day to day work as efficient as possible.   
As a rolling release distribution, you've always an up to date system without fearing the end of a LTS period. The software packages are also up to date if not bleeding edge. That means, you don't have to wait until a maintainer decides that a new package version is stable and good to go. You're in charge to maintain your system and customize it as you desire while the maintainance effort is similar to other distributions. You decide, if you want a fully fledged modern desktop environment with all the nice looking effects, or if you want a minimal or CLI driven system unleashing the full computation power of your machine. And if things break? Well, then you know where to search for the issue, because you've setup your system and therefore you know whats running on it.
All this in combination with the active Arch Linux community and the detailed documentation in the [official wiki](https://wiki.archlinux.org) makes it a great choice for developers in my opinion.

## Conclusion   
As mentioned in the beginning:
*If the operating system suites your personal requirements, it is the right choice for you.*
In my case, this is Arch Linux. Not because it brings a new stunning feature or a life changing enhancement to the world of Linux but it brings some different concepts that make sense and improve the way the system works and feels from a users perspective. 

I want my system to be as efficient as possible without missing the comfort of a desktop environment. I also want to be able to work with up to date software. I want my system to be stable and reliable and I want to understand what's going on on it. All of this and nothing can be found with Arch Linux.
With Arch Linux you have a simple, fully customizable, community driven rolling release operating system with a massive ecosystem of software packages and documentation. You’ve everything available that is available in other distributions, but with Arch Linux, you’ve the choice to use it or not. Nevertheless Arch Linux is not for beginners. You should have a solid understanding of Linux systems, before you start. But if you gained that knowledge, you'll be able to use its full potential.

If you have any questions, feel free to email me at [sven(dot)hettwer(at)consol(dot)de](mailto:sven.hettwer@consol.de) or contact me on [twitter](https://twitter.com/SvenHettwer)