---
title: "Testing Builds"
linkTitle: "Testing"
description: "ConSol Labs testing repository - daily development snapshots"
---

# Testing Builds

Installing ConSol Labs software has never been easier. Just follow the steps for your linux distribution.

Currently the following software is part of this repository.

- **OMD-Labs Edition**
- **SNClient+**

Some repositories also contain the following packages:

- Thruk
- Gearman
- Mod-Gearman
- Naemon

Those packages will be migrated to [OBS](https://build.opensuse.org/repositories/home:naemon) and should be installed from there in the future.

**Warning:** These are nightly development builds. Use for testing only, not production.

---

## Contents

- [Debian / Ubuntu](#debian--ubuntu)
  - [GPG Key (one-time setup)](#gpg-key-one-time-setup)
  - [Debian Bookworm (12.0)](#debian-bookworm-120)
  - [Debian Trixie (13.0)](#debian-trixie-130)
  - [Ubuntu Focal Fossa (20.04)](#ubuntu-focal-fossa-2004)
  - [Ubuntu Jammy Jellyfish (22.04)](#ubuntu-jammy-jellyfish-2204)
  - [Ubuntu Noble Numbat (24.04)](#ubuntu-noble-numbat-2404)
- [CentOS / RHEL](#centos--rhel)
  - [RHEL / CentOS 7](#rhel--centos-7)
  - [RHEL / Rocky / Alma 8](#rhel--rocky--alma-8)
  - [RHEL / Rocky / Alma 9](#rhel--rocky--alma-9)
- [SUSE Linux Enterprise (SLES)](#suse-linux-enterprise-sles)
  - [SLES 15 SP4](#sles-15-sp4)
  - [SLES 15 SP5](#sles-15-sp5)
  - [SLES 15 SP6](#sles-15-sp6)
- [Alpine Linux](#alpine-linux)
  - [Public Key (one-time setup)](#public-key-one-time-setup)
  - [Add Repository](#add-repository)

---

## Debian / Ubuntu

### GPG Key (one-time setup)

```bash
curl -s "https://labs.consol.de/repo/stable/GPG-KEY-4096" -o /etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc
```

### Debian Bookworm (12.0)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Debian Trixie (13.0)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Focal Fossa (20.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Jammy Jellyfish (22.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Noble Numbat (24.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

---

## CentOS / RHEL

> You may need to add the [EPEL repository](https://docs.fedoraproject.org/en-US/epel/) to resolve all dependencies.

### RHEL / CentOS 7

```bash
rpm -Uvh "https://labs.consol.de/repo/testing/rhel7/x86_64/labs-consol-testing.rhel7.noarch.rpm"
```

### RHEL / Rocky / Alma 8

```bash
rpm -Uvh "https://labs.consol.de/repo/testing/rhel8/x86_64/labs-consol-testing.rhel8.noarch.rpm"
```

### RHEL / Rocky / Alma 9

```bash
rpm -Uvh "https://labs.consol.de/repo/testing/rhel9/x86_64/labs-consol-testing.rhel9.noarch.rpm"
```

---

## SUSE Linux Enterprise (SLES)

### SLES 15 SP4

```bash
zypper addrepo -f https://labs.consol.de/repo/testing/sles15sp4/consol-labs.repo
```

### SLES 15 SP5

```bash
zypper addrepo -f https://labs.consol.de/repo/testing/sles15sp5/consol-labs.repo
zypper addrepo -f http://download.opensuse.org/distribution/leap/15.5/repo/oss/ openSUSE-Leap-15.5
```

### SLES 15 SP6

```bash
zypper addrepo -f https://labs.consol.de/repo/testing/sles15sp6/consol-labs.repo
```

---

## Alpine Linux

### Public Key (one-time setup)

```bash
curl -s "https://labs.consol.de/repo/testing/alpine/v3/monitoring-team%40consol.de-0001.rsa.pub" -o "/etc/apk/keys/monitoring-team@consol.de-0001.rsa.pub"
```

### Add Repository

```bash
echo "https://labs.consol.de/repo/testing/alpine/v3/" >> /etc/apk/repositories
apk update
```
