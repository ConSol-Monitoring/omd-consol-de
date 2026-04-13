---
draft: false
date: 2026-04-13T00:00:00.000Z
title: "Labs Repository GPG Key Rotation"
linkTitle: "labs-repository-gpg-key-rotation"
author: Sven Nierlein
tags:
  - repository
  - gpg
  - apt
---

Starting on April 13 2026 all .deb and .rpm files in the [labs repository](/repo) will use the
`monitoring-repo-consol-de-gpg-2026.asc` instead of the old `GPG-KEY-4096` or `RPM-GPG-KEY` keys.

For consistency all existing rpm and deb files have been resigned to use the new key as well.

|          | File                                                                                                                | Size | ID               |
|----------|-------------------------------------------------------------------------------------------------------------------- |------|------------------|
| **Old**  | [RPM-GPG-KEY](https://labs.consol.de/repo/stable/RPM-GPG-KEY)                                                       | 1024 | F8C1CA08A57B9ED7 |
| **Old**  | [GPG-KEY-4096](https://labs.consol.de/repo/stable/GPG-KEY-4096)                                                     | 4096 | F0CA212FF1FFE778 |
| **New**  | [monitoring-repo-consol-de-gpg-2026.asc](https://labs.consol.de/repo/stable/monitoring-repo-consol-de-gpg-2026.asc) | 4096 | CBB9B38BE1B9D330 |

## Debian / Ubuntu

In Debian and Ubuntu you will probably notice warnings like this when running `apt update`

```txt
#>apt update
Hit:1 http://labs.consol.de/repo/stable/debian trixie InRelease
Err:1 http://labs.consol.de/repo/stable/debian trixie InRelease
  Sub-process /usr/bin/sqv returned an error code (1), error message is: Missing key E1C8FD55CA5EEEFF05E93DD3CBB9B38BE1B9D330, which is needed to verify signature.
Fetched 32.5 kB in 0s (107 kB/s)
All packages are up to date.
Warning: An error occurred during the signature verification. The repository is not updated and the previous index files will be used. OpenPGP signature verification failed: http://labs.consol.de/repo/stable/debian trixie InRelease: Sub-process /usr/bin/sqv returned an error code (1), error message is: Missing key E1C8FD55CA5EEEFF05E93DD3CBB9B38BE1B9D330, which is needed to verify signature.
Warning: Failed to fetch http://labs.consol.de/repo/stable/debian/dists/trixie/InRelease  Sub-process /usr/bin/sqv returned an error code (1), error message is: Missing key E1C8FD55CA5EEEFF05E93DD3CBB9B38BE1B9D330, which is needed to verify signature.
Warning: Some index files failed to download. They have been ignored, or old ones used instead.
```

To make it work again, simple replace the key with the new one.

Either follow the instructions from the repository installation again:

- [stable repository](https://labs.consol.de/repo/stable/)
- [stream repository](https://labs.consol.de/repo/stream/)
- [testing repository](https://labs.consol.de/repo/testing/)

or use these commands:

```bash
curl -fsS "https://labs.consol.de/repo/testing/monitoring-repo-consol-de-gpg-2026.asc" -o /etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc
```

Then make sure the key is used in the sources file:

ex.: `/etc/apt/sources.list.d/labs-consol-stable.list`

```txt
deb [signed-by=/etc/apt/trusted.gpg.d/monitoring-repo-consol-de-gpg-2026.asc] http://labs.consol.de/repo/stable/debian trixie main
```

The important part here is, the `signed-by` option must point to the new key file.

## RHEL / Rocky Linux / Alma

On RHEL (and compatible) systems you will get an error like this:

```txt
GPG key at https://labs.consol.de/repo/stable/GPG-KEY-4096 (0xF1FFE778) is already installed
The GPG keys listed for the "labs_consol_stable" repository are already installed but they are not correct for this package.
Check that the correct key URLs are configured for this repository.. Failing package is: omd-5.60-labs-edition-el9-1.x86_64
 GPG Keys are configured as: https://labs.consol.de/repo/stable/GPG-KEY-4096
The downloaded packages were saved in cache until the next successful transaction.
You can remove cached packages by executing 'yum clean packages'.
Error: GPG check FAILED
```

You can simply update the repository package, for example for rhel9 with:

```bash
rpm -Uvh "https://labs.consol.de/repo/stable/rhel9/x86_64/labs-consol-stable.rhel9.noarch.rpm"
```

## OpenSuse

```txt
Looking for gpg keys in repository consol_labs_stable.
  gpgkey=https://labs.consol.de/repo/stable/GPG-KEY-4096

New repository or package signing key received:

  Repository:       consol_labs_stable
  Key Fingerprint:  E1C8 FD55 CA5E EEFF 05E9 3DD3 CBB9 B38B E1B9 D330
  Key Name:         ConSol Monitoring Team <monitoring-repo-l@consol.de>
  Key Algorithm:    RSA 4096
  Key Created:      Wed 18 Mar 2026 03:34:45 PM CET
  Key Expires:      (does not expire)
  Rpm Name:         gpg-pubkey-e1b9d330-69bab805
...
Do you want to reject the key, trust temporarily, or trust always? [r/t/a/?] (r):
```

You can either trust the new key by `a` or update the repository:

```bash
zypper removerepo consol_labs_stable
zypper addrepo -f https://labs.consol.de/repo/stable/sles15sp6/consol-labs.repo
```


## Alpine

The alpine repository is not affected by this change.

