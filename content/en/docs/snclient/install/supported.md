---
linkTitle: Supported OS
---

# Supported Systems

We are trying to build the SNClient to be as compatible as possible. Due to
limited hardware, we are not able to test the agent on all operating systems.

If you are using SNClient anywhere not listed here, feel free to open an issue
on github to update this page.

If there are no installer package for your system available for download, you might still succeed
by [building snclient from source](../build).

## CPU Architectures

|               | i386 | x86_64 | aarch64 (arm) |
|---------------|:----:|:------:|:-------------:|
| **Linux**     |   X  |    X   |   X           |
| **Windows**   |   X  |    X   |   X           |
| **FreeBSD**   |   X  |    X   |   X           |
| **MacOS**     |      |    X   |   X           |

## Windows

Successfully tested on:

- Windows 10
- Windows 11
- Windows Server 2019
- Windows ARM 11 Preview
- It should work on any windows newer than Windows 10 / Windows Server 2016.

SNClients required Go (>= 1.23) does not support anything older than Windows 10 or Windows Server 2016.

## Linux

Debian:

- Debian >= 8
- Ubuntu >= 16.04

RedHat:

- RHEL >= 7

Others will quite likely work as well, but haven't been tested yet.

## Mac OSX / Darwin

- OSX >= 13

Others will quite likely work as well, but haven't been tested yet.

## FreeBSD

- FreeBSD >= 14

Others will quite likely work as well, but haven't been tested yet.

## Other

Feel free to open an issue on github if you are running the agent somewhere not
listed here.
