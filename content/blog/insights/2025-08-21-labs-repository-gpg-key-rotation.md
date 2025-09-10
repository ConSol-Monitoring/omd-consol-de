---
draft: false
date: 2025-08-21T00:00:00.000Z
title: "Labs Repository GPG Key Rotation"
linkTitle: "labs-repository-gpg-key-rotation"
author: Sven Nierlein
tags:
  - repository
  - gpg
  - apt
---

Starting on August 18 2025 all .deb and .rpm files in the [labs repository](/repo) will use the `GPG-KEY-4096` instead of the old `RPM-GPG-KEY`.
For consistency all existing rpm and deb files have been resigned to use the new key as well.

|          | File                                                            | Size | ID                |
|----------|-----------------------------------------------------------------|------|-------------------|
| **Old**  | [RPM-GPG-KEY](https://labs.consol.de/repo/stable/RPM-GPG-KEY)   | 1024 | F8C1CA08A57B9ED7  |
| **New**  | [GPG-KEY-4096](https://labs.consol.de/repo/stable/GPG-KEY-4096) | 4096 | F0CA212FF1FFE778  |

## Debian / Ubuntu

In Debian and Ubuntu you will probably notice warnings like this when running `apt update`

```txt
Err:1 http://labs.consol.de/repo/stable/debian bookworm InRelease
  The following signatures couldn't be verified because the public key is
  not available: NO_PUBKEY F0CA212FF1FFE778
Fetched 48.0 kB in 0s (158 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.
W: An error occurred during the signature verification. The repository is not updated and
   the previous index files will be used.
   GPG error: http://labs.consol.de/repo/stable/debian bookworm InRelease: The following
   signatures couldn't be verified because the public key is
   not available: NO_PUBKEY F0CA212FF1FFE778
```

To make it work again, simple replace the key with the new one.

Either follow the instructions from the repository installation again:

- [stable repository](https://labs.consol.de/repo/stable/)
- [stream repository](https://labs.consol.de/repo/stream/)
- [testing repository](https://labs.consol.de/repo/testing/)

or use these commands:

```bash
curl -s "https://labs.consol.de/repo/stable/GPG-KEY-4096" -o /etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc
```

Then make sure the key is used in the sources file:

ex.: `/etc/apt/sources.list.d/labs-consol-stable.list`

```txt
  deb [signed-by=/etc/apt/trusted.gpg.d/labs.consol.de-GPG-KEY-4096.asc] http://labs.consol.de/repo/stable/debian bookworm main
```

The important part here is, the `signed-by` option must point to the new key file.

## RHEL / Rocky Linux / Alma

RHEL 9 and later already used the new key, so there is nothing to do here.
