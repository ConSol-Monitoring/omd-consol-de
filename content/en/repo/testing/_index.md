---
title: "Testing Builds"
linkTitle: "Testing"
description: "Daily development snapshots for testing the latest changes on your Linux distribution."
repository_channel: testing
---

{{< repo/channel >}}

## Debian / Ubuntu

### GPG Key (one-time setup)

```bash
curl -fsS "https://labs.consol.de/repo/stable/monitoring-repo-consol-de-gpg-2026.asc" -o /etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc
```

### Debian Bookworm (12.0)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Debian Trixie (13.0)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/debian $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Focal Fossa (20.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Jammy Jellyfish (22.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Noble Numbat (24.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

### Ubuntu Resolute Racoon (26.04)

```bash
echo "deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/testing/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/labs-consol-testing.list
apt-get update
```

---

## RHEL / Rocky / Alma

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

### RHEL / Rocky / Alma 10

```bash
rpm -Uvh "https://labs.consol.de/repo/testing/rhel10/x86_64/labs-consol-testing.rhel10.noarch.rpm"
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

### SLES 16 SP0

```bash
zypper addrepo -f https://labs.consol.de/repo/testing/sles16sp0/consol-labs.repo
```

---

## Alpine Linux

### Public Key (one-time setup)

```bash
curl -fsS "https://labs.consol.de/repo/testing/alpine/v3/monitoring-team%40consol.de-0001.rsa.pub" -o "/etc/apk/keys/monitoring-team@consol.de-0001.rsa.pub"
```

### Add Repository

```bash
echo "https://labs.consol.de/repo/testing/alpine/v3/" >> /etc/apk/repositories
apk update
```

{{< /repo/channel >}}
