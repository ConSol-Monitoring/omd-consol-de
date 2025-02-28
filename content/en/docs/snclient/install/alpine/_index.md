---
linkTitle: Alpine
weight: 210
---

# Alpine Linux

## Installation

Installation packages can be found here:

- [ConSol Software Repository](https://labs.consol.de/repo/testing/) (recommended)

Add the repository.

    #> REPO=https://labs.consol.de/repo/testing/alpine/v3
    #> wget -O \
         /etc/apk/keys/monitoring-team@consol.de-0001.rsa.pub \
         $REPO/monitoring-team%40consol.de-0001.rsa.pub
    #> mkdir /etc/apk/repositories.d
    #> echo $REPO > /etc/apk/repositories.d/consol-labs.list

Update the package cache and install snclient.

    #> apk update
    #> apk add snclient

Start the service. (Eventually you want to change the config in /etc/snclient first)

    #> rc-update add snclient default
    #> rc-service snclient start

> **Note:** In a alpine container you have to add the line *rc_need="!dev !net"* to the end of the file */etc/rc.conf*, otherwise snclient will not start.



### Firewall

Alpine Linux by default does not have a firewall. If you want one, install it with

    #> apk add ufw

The firewall should be configured to allow these ports:

- `8443` : if you enabled the webserver (the default is enabled)
- `5666` : if you enabled the NRPE server (disabled by default)
- `9999` : if you enabled the Prometheus server (disabled by default)
   
```
#> ufw allow 8443/tcp
#> ufw allow 5666/tcp
#> ufw allow 9999/tcp
```

## Uninstall

    #> apk del snclient
