---
author: Markus Hansmair
date: '2019-11-29'
featured_image: /assets/images/Ubuntu-OpenShift-Logo.png
meta_description: Some hints on how to get Red Hat CodeReady Containers up and running
  on Ubuntu
tags:
- openshift
title: CodeReady Containers on Ubuntu
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

With the release of OpenShift 4.x Red Hat left no stone unturned (compared to previous 3.x versions). Among many things [Minishift](https://www.okd.io/minishift/) became [Red Hat CodeReady Containers](https://developers.redhat.com/products/codeready-containers). Having been a big fan of *Minishift* I recently wanted to give *CodeReady Containers* (aka CRC) a try.

Turned out this is not that easy - at least if you want to run CRC on a Linux that does not come from Red Hat (or its community). This article gives instructions for all those people out there who want to run *CodeReady Containers* on Ubuntu.

**Update 2020-12-17:** According to [this comment](https://github.com/code-ready/crc/issues/549#issuecomment-747434667) on GitHub by one of the maintainers / developers of [Red Hat CodeReady Containers](https://developers.redhat.com/products/codeready-containers) the issues with Ubuntu have been resolved in the latest version of CRC.
<!--more-->

First lesson I had to learn was that *CodeReady Containers* does not run with VirtualBox - at least not on Linux. The only supported virtualization technology (on Linux) is *KVM* in combination with *libvirt*. I've been happily using VirtualBox for years. But the prospect of getting a virtualization with near-native performance made me switch to *KVM / libvirt*.

Next obstacle: 

> On Linux, CodeReady Containers is only supported on Red Hat Enterprise Linux/CentOS 7.5 or newer (including 8.x versions) and on the latest two stable Fedora releases.

That's what you can read in the [Getting Started Guide](https://access.redhat.com/documentation/en-us/red_hat_codeready_containers/1.0/html/getting_started_guide/getting-started-with-codeready-containers_gsg) of *CodeReady Containers*.

And further on:

> Ubuntu 18.04 LTS or newer and Debian 10 or newer are not officially supported and may require manual set up of the host machine.

That's sad. I have been using Ubuntu (Kubuntu to be precise) for at least ten years and contrary to the virtualization technology I was not willing to easily give up my beloved working horse. Dastardly the Red Hat guys give no further hint on what *manual set up of the host machine* actually means. Surprisingly I also couldn't find any instructions on the Internet about this issue.

I had to find out myself. This is the conclusion of my findings:

According to the *Getting Started Guide* you have to install a bunch packages in preparation of setting up CRC. I found out that it is sufficient to only install one package. The list given by Red Hat is automatically pulled in via dependencies. This has the advantage that you can get rid of the whole virtualization by removing just this single one package (probably doing a `apt autoremove` afterwards). As `root` do

```
# apt install virt-manager
```

I found out that you have to restart your machine after that to be on the safe side. (Probably it would be much faster just to start or restart two or three services with `systemctl`. But I was not motivated to dig into that detail. So I just recommend a restart.)

Next download the CRC executable. Similar to *Minishift* there is no true installer. Just a big self-contained executable that does all the heavy lifting. Extract the downloaded TAR archive and move the `crc` executable to an appropriate place. Make sure that this place (i.e. folder) is covered by your `$PATH` variable. (I use `$HOME/bin` for those instances. On Ubuntu it is automatically added to your `$PATH` if it exists.)

```
wget https://mirror.openshift.com/pub/openshift-v4/clients/crc/latest/crc-linux-amd64.tar.xz
tar -xvJf crc-linux-amd64.tar.xz
mv crc-linux-1.2.0-amd64/crc $HOME/bin
rm -rf crc-linux-amd64.tar.xz crc-linux-1.2.0-amd64
```

The exact name of the folder `crc-linux-1.2.0-amd64` will probably change in the future.

You also need the so-called *pull secret*. It's a collection of personal access tokens for 4 different image registries. You can get it via

```
https://cloud.redhat.com/openshift/install/crc/installer-provisioned
```

Log in with your Red Hat account and download your pull secret. It's a JSON file. You will need its contents shortly.

Now it's time for the actual setup of CRC. (Do not run this command as root!)

```
crc setup
```

You will be asked for your linux password in the course of the procedure. This allows `crc setup` to manipulate your system's DNS setup. Mind the two output lines

```
INFO Will use root access: write NetworkManager config in /etc/NetworkManager/conf.d/crc-nm-dnsmasq.conf
INFO Will use root access: write dnsmasq configuration in /etc/NetworkManager/dnsmasq.d/crc.conf
```

(Nearly) everything is in place now. We can try to start the local OpenShift cluster.

```
crc start --nameserver <your-name-server-ip>
```

I highly recommend to specify your local nameserver with the option `--nameserver`. Otherwise CRC will use Google's DNS server 8.8.8.8.


You will be asked to provide the contents of your pull secret during the first run of `crc start`. Just copy and paste the whole JSON.

So far everything was in line with the instructions given in the *Getting Started Guide*. Unfortunately `crc start` ends with the following error message:

```
....
INFO Starting OpenShift cluster ... [waiting 3m]
ERRO Error approving the node csr Not able to get csr names (exit status 1 : Unable to connect to the server: dial tcp: lookup api.crc.testing: no such host
```

This is where the subtle differences between Red Hat Linux and Ubuntu come into play. Both distributions use systemd and NetworkManager. But Ubuntu uses systemd-resolved for name resolution while Red Hat Linux uses dnsmasq. `crc setup` blindly assumes a Red Hat Linux and happily patches NetworkManager's setup to give NetworkManager control over dnsmasq. (Remember the two above mentioned output lines?) This fails miserably on Ubuntu.

The first config file (`crc-nm-dnsmasq.conf`) makes sure that dnsmasq is started under the control of NetworkManager while the second file (`crc.conf`) delegates name resolution for names ending in `apps-crc.testing` or `crc.testing` to a DNS server running in the local OpenShift cluster. The very same setup could be achieved by extending the configuration of systemd-resolved. It would have been no big deal for `crc start` to check what kind of name resolution is already in place and either patch the configuration of NetworkManager or systemd-resolved. Unfortunately this is not the case. Even worse `crc start` checks every time whether `crc-nm-dnsmasq.conf` and `crc.conf` are still in place and were not modified.

So the only solution is to disable systemd-resolved and give name resolution in the hands of dnsmasq. This is fairly easy to achieve. (This has to be done as root.)

```
# systemctl disable systemd-resolved.service
# rm /etc/resolv.conf
# systemctl restart NetworkManager
```

To be honest I feel a bit uncomfortable with this solution. I would have guessed dnsmasq being available a bit later than systemd-resolved and thus expected problems during system start. But so far I could not observe any problems.

So now it's time to restart your CRC.

```
crc stop
# ... wait some time and make sure you VM has actually terminated
crc start --nameserver <your-name-server-ip>
```

The output should end with

```
INFO To access the cluster, first set up your environment by following 'crc oc-env' instructions
INFO Then you can access it by running 'oc login -u developer -p developer https://api.crc.testing:6443'
INFO To login as an admin, username is 'kubeadmin' and password is XXXXX-XXXXX-XXXXX-XXXXX
INFO
INFO You can now run 'crc console' and use these credentials to access the OpenShift web console
Started the OpenShift cluster
WARN The cluster might report a degraded or error state. This is expected since several operators have been disabled to lower the resource usage. For more information, please consult the documentation
```

I haven't used `crc oc-env` as recommended but added the `oc` command to `$HOME/bin`.

```
cd $HOME/bin
ln -s ../.crc/bin/oc oc
```

Have fun with your CRC cluster!

I did all my investigations on Kubuntu 18.04.3. I guess that my findings also apply for later versions of Ubuntu as the general setup of name resolution has not changed significantly.

**Update 2020-01-28** After several weeks I found one drawback of this setup. Ordinary docker containers refuse to find any hosts by name. Some investigation revealed that this is due to `/etc/resolv.conf` looking like

```
# Generated by NetworkManager
search <internal-search-domain-redacted>

nameserver 8.8.8.8
nameserver 8.8.4.4
```

See docker's [documentation](https://docs.docker.com/v17.09/engine/userguide/networking/default_network/configure-dns/) about the nifty details. The nameservers `8.8.8.8` and `8.8.4.4` are inserted as a last resort in case docker's logic when composing the container's `/etc/resolv.conf` left no name servers.

I my corporate environment DNS traffic to external nameservers is blocked. So `8.8.8.8` and `8.8.4.4` are of no use. The workaround is to use docker's command line option `--dns=...`, i.e.

```
docker run -it --dns=<internal-nameserver-ip> busybox /bin/sh
```