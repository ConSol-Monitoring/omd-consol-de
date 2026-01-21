---
author: Gerhard Laußer
date: '2012-06-07T20:34:58+00:00'
slug: how-to-use-the-new-omd-init-hooks
tags:
- livestatus
title: How to use the new OMD init-hooks
---

One of my bigger OMD installations consists of 13 sites. The visualization layer uses the <a href="http://www.thruk.org" title="Thruk, a modern gui for Nagios">Thruk</a> interface. This alternative web ui can read data from multiple livestatus backends and display the host and service objects in one unified view. For this purpose i have one extra site called <em>gui</em> which only starts an apache process. I then point my browser to http://..../gui/thruk

The addresses of the livestatus backends have to be written into a config file, <em>thruk_local.cfg</em>. Now what if my list of 13 sites would be constantly changing? What if new OMD sites would be created, others deleted on a daily basis? I would have to edit the config file every time. With the new init-hook-feature, OMD will do this automatically for me.

<!--more-->
Whenever omd starts or reloads, the site-local apache's init-script is executed. With a current version of OMD you can add your own functionality to this init-script. Put your code in <em>etc/init-hooks</em> and it will be run automatically. You only have to follow a naming convention:
The file name has three parts, separated by dashes. The first part is the calling init-script's name, in this case <strong>apache</strong>. The second part is the argument, which was given to the init-script. We want to execute some code in the startup-phase of apache, so it is <strong>start</strong>. The third part indicates when to execute the extra code, before the start command is given (pre) or after the start command was given (post). We want the Thruk config file to be created before Apache starts, so this is <strong>pre</strong>.

Now i create a file (which must be executable btw) called <strong>etc/init-hooks.d/apache-start-pre</strong> which has the following content:
```bash
#!/bin/bash

# if this script is used as a startup-script in etc/init.d, comment out the next line
shift

. $OMD_ROOT/etc/omd/site.conf

case "$1" in
    start)
        echo "<Component Thruk::Backend>" > /tmp/thruk_local.conf.$$
        for OMD_SITE in $(omd sites | awk '/^(os|mod|sp|reg)/ { print $1 }')
        do
            LIVESTATUS_TCP_PORT=$(grep CONFIG_LIVESTATUS_TCP_PORT /opt/omd/sites/${OMD_SITE}/etc/omd/site.conf|sed -e "s/.*='//g" -e "s/'.*//g")
            cat <<EOEO >> /tmp/thruk_local.conf.$$
    <peer>
        name  = $OMD_SITE
        type  = livestatus
        <options>
            peer = localhost:$LIVESTATUS_TCP_PORT
       </options>
    </peer>
EOEO
        done
        echo "</Component>" >> /tmp/thruk_local.conf.$$
        cp /tmp/thruk_local.conf.$$ $HOME/etc/thruk/thruk_local.conf
        rm -f /tmp/thruk_local.conf.$$
    ;;
    stop)
        exit 0
    ;;
    stop)
        exit 0
    ;;
    restart)
        exit 0
    ;;
    reload)
        exit 0
    ;;
    status)
        exit 0
    ;;
    *)
        echo "Usage: nagios {start|stop|restart|reload|status}"
        exit 2
    ;;
esac
```

You may ask yourself, if all these start/stop/reload/... sections are necessary. They're not. It would be ok to put only the lines after the start) section into <strong>etc/init-hooks.d/apache-start-pre</strong>. I used it in older OMD releases as etc/init.d/thruk, that's why it looks like a full-blown init-script. (You can do this, too. Simply put a comment sign before the shift-statement in the 4th line. And watch out when updating. New OMD releases come with their own etc/init.d/thruk)

I create also a symbolic link <strong>apache-reload-pre</strong> pointing to <strong>apache-start-pre</strong>. Now every time the list of OMD sites on this server changes, all i (or a cronjob) have to do is: <strong>omd reload apache</strong>

The result is a dynamically created etc/thruk/thruk_local.cfg
```text
<Component Thruk::Backend>
    <peer>
        name  = mod_backup
        type  = livestatus
        <options>
            peer = localhost:7568
       </options>
    </peer>
    <peer>
        name  = mod_dns
        type  = livestatus
        <options>
            peer = localhost:7569
       </options>
    </peer>
    <peer>
        name  = mod_vmware
        type  = livestatus
        <options>
            peer = localhost:7560
       </options>
    </peer>
    <peer>
        name  = os_aix
        type  = livestatus
        <options>
            peer = localhost:7561
       </options>
    </peer>
    <peer>
        name  = os_hpux
        type  = livestatus
        <options>
            peer = localhost:7562
       </options>
    </peer>
....
```

Important update:
In the line ...for OMD_SITE in $(omd sites | awk '/^(os|mod|sp|reg)/ { print $1 }')... you have to specify which sites you want to appear in Thruk. If you have only the gui and your productive sites, you can write ...for OMD_SITE in $(omd sites | grep -v gui)...