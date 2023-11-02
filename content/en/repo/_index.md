---
title: "Repository"
linkTitle: "Repo"
menu:
  main:
    weight: 40
---
<div style="height:5rem;"></div>

Installing ConSol Labs software has never been easier. Just follow the steps for your linux distribution.

Currently the following software is part of this repository. Note that we do not package everything for every system, if something is missing, don’t hesitate to contact us.

*   OMD-Labs Edition
*   Thruk
*   Gearman
*   Mod-Gearman
*   Naemon

### Distributions
- [Debian / Ubuntu](#_debian_ubuntu)
  - [Install GPG Key](#_install_gpg_key)
  - [Debian Buster (10.0)](#_debian_buster_10_0)
  - [Debian Bullseye (11.0)](#_debian_bullseye_11_0)
  - [Debian Bookworm (12.0)](#_debian_bookworm_12_0)
  - [Ubuntu Bionic Beaver (18.04)](#_ubuntu_bionic_beaver_18_04)
  - [Ubuntu Focal Fossa (20.04)](#_ubuntu_focal_fossa_20_04)
   - [Ubuntu Jammy Jellyfish (22.04)](#_ubuntu_jammy_jellyfish_22_04)
- [Centos / Redhat](#_centos_redhat)
  - [7](#_7)
  - [8](#_8)
  - [9](#_9)
- [Suse Linux Enterprise](#_suse_linux_enterprise)
  - [SLES 11 SP4](#_sles_11_sp4)
  - [SLES 12 SP2](#_sles_12_sp2)
  - [SLES 12 SP3](#_sles_12_sp3)
  - [SLES 12 SP4](#_sles_12_sp4)
  - [SLES 15 SP4](#_sles_15_sp4)

## Debian / Ubuntu {#_debian_ubuntu}

### Install GPG Key {#_install_gpg_key}

First step is to import the gpg key. This step has to be done only once.

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
```

Alternatively the key is also available from public key servers:

```console
      gpg --keyserver keys.gnupg.net --recv-keys F8C1CA08A57B9ED7
      gpg --armor --export F8C1CA08A57B9ED7 | sudo apt-key add -
```

### Debian Buster (10.0) {#_debian_buster_10_0}

Add the repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

### Debian Bullseye (11.0) {#_debian_bullseye_11_0}

Add the repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

### Debian Bookworm (12.0) {#_debian_bookworm_12_0}

Add the repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

### Ubuntu Bionic Beaver (18.04) {#_ubuntu_bionic_beaver_18_04}

Add this repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

### Ubuntu Focal Fossa (20.04) {#_ubuntu_focal_fossa_20_04}

Add this repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

### Ubuntu Jammy Jellyfish (22.04) {#_ubuntu_jammy_jellyfish_22_04}

Add this repository to your sources list:

```console
      curl -s "https://labs.consol.de/repo/stable/RPM-GPG-KEY" | sudo apt-key add -
      echo "deb http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
      apt-get update
```

## Centos / Redhat

When using Centos or Redhat you may have to add the [EPEL](http://fedoraproject.org/wiki/EPEL/FAQ#Using_EPEL) repository to resolve all dependencies.

### 7 {#_7}

Downloading the repository file is all you have to do. This has to be done only once.

```console
      rpm -Uvh "https://labs.consol.de/repo/testing/rhel7/i386/labs-consol-testing.rhel7.noarch.rpm"
```

### 8 {#_8}

Downloading the repository file is all you have to do. This has to be done only once.

```console
      rpm -Uvh "https://labs.consol.de/repo/testing/rhel8/i386/labs-consol-testing.rhel8.noarch.rpm"
```

### 9 {#_9}

Downloading the repository file is all you have to do. This has to be done only once.

```console
      rpm -Uvh "https://labs.consol.de/repo/testing/rhel9/i386/labs-consol-testing.rhel9.noarch.rpm"
```

## Suse Linux Enterprise

### SLES 11 SP4 {#_sles_11_sp4}

You can use zypper to add the repository:

```console
      zypper addrepo -f https://labs.consol.de/repo/testing/sles11sp4/consol-labs.repo
```

### SLES 12 SP2 {#_sles_12_sp2}

You can use zypper to add the repository:

```console
      zypper addrepo -f https://labs.consol.de/repo/testing/sles12sp2/consol-labs.repo
```

### SLES 12 SP3 {#_sles_12_sp3}

You can use zypper to add the repository:

```console
      zypper addrepo -f https://labs.consol.de/repo/testing/sles12sp3/consol-labs.repo
```

### SLES 12 SP4 {#_sles_12_sp4}

You can use zypper to add the repository:

```console
      zypper addrepo -f https://labs.consol.de/repo/testing/sles12sp4/consol-labs.repo
```

### SLES 15 SP4 {#_sles_15_sp4}

You can use zypper to add the repository:

```console
      zypper addrepo -f https://labs.consol.de/repo/testing/sles15sp4/consol-labs.repo
```

