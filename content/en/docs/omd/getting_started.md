---
title: Getting Started
weight: 10
---

## Welcome to OMD

OMD-Labs is a single RPM or DEB package to create a monitoring setup easily. It includes all required components.
This guide uses Rocky Linux 10 on x86_64. For other supported systems, follow the [stable repository installation instructions](/repo/stable/).

## Installation

Run the installation commands as `root`.

Install the [EPEL repository](https://docs.fedoraproject.org/en-US/epel/getting-started/) and enable Rocky Linux's CRB repository for additional dependencies:

```sh
dnf install epel-release
crb enable
```

Install the ConSol Labs stable repository for RHEL-compatible version 10 systems:

```sh
dnf install https://labs.consol.de/repo/stable/rhel10/x86_64/labs-consol-stable.rhel10.noarch.rpm
```

Then install OMD:

```sh
dnf install omd
```

{{% pageinfo %}}
You can install multiple OMD versions at the same time. Search for available versioned packages with `dnf search omd-`.
{{% /pageinfo %}}

## Create a new Site

OMD uses a site concept which allows you to create multiple sites even with different OMD versions on the same machine.

Create your first site with:

    #> omd create demosite

This creates a new site named `demosite` which includes a separate user and
group. Remember or write down the initial password. It will be required to access the
webpage.

{{% pageinfo %}}
Usually you work as the site user. Root permissions are only required for creating or removing sites.
{{% /pageinfo %}}

Switch to the site user:

    #> su - demosite


## First steps

All commands are executed as the site user.

Show the status of all components:

    OMD[demosite@host]:~$ omd status

Start all components:

    OMD[demosite@host]:~$ omd start

You should be able to access your new site with the URL `/demosite`, e.g. https://host/demosite.  See the output from `omd create` above for the initial password and how to change it.

## Continue Reading

OMD uses a standard Linux filesystem layout for etc, lib, var and other directories, with everything relative to the site's home folder.
Read more in the [filesystem layout documentation](../filesystem_layout).

OMD offers a few commands to create and operate your sites.
See an overview in the [omd command reference](../commands).
