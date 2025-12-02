---
draft: false
date: 2025-12-02T10:31:49.000Z
title: "Using check_sap_health with SNC"
linkTitle: "check-sap-health-snc"
author: Gerhard Lausser
tags:
  - SAP
  - SNC
---

To use check_sap_health with SNC (Secure Network Communication), you need to install the SAP NetWeaver RFC SDK and the SAP Cryptographic Library, along with the Perl module sapnwrfc. This guide walks you through the complete setup process within an OMD site.

## Prerequisites

You need to download the following archives from the SAP Software Download Center:

- **SAP NetWeaver RFC SDK**: `nwrfc750P_17-70002752.zip` (or newer version)
- **SAP Cryptographic Library**: `SAPCRYPTOLIBP_8561-20011697.SAR`
- **SAPCAR**: Tool to extract SAR archives

Place these files in a preparation directory within your OMD site:

```bash
OMD[sapmon@omdmuc08]:~$ cd prep_sap/
OMD[sapmon@omdmuc08]:~/prep_sap$ ls -l
total 27488
-rw-r--r--. 1 demo demo 20054340 Dec  2 10:14 nwrfc750P_17-70002752.zip
-rwxr-xr-x. 1 demo demo  5712584 Dec  2 10:14 SAPCAR*
-rw-r--r--. 1 demo demo  2373692 Dec  2 10:14 SAPCRYPTOLIBP_8561-20011697.SAR
```

## Step 1: Extract the SAP NetWeaver RFC SDK

Unzip the RFC SDK archive:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ unzip nwrfc750P_17-70002752.zip
```

This creates a `nwrfcsdk/` directory containing the libraries, headers, and tools needed for RFC communication.

## Step 2: Extract the SAP Cryptographic Library

Use SAPCAR to extract the cryptographic library:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ ./SAPCAR -xf SAPCRYPTOLIBP_8561-20011697.SAR
SAPCAR: processing archive SAPCRYPTOLIBP_8561-20011697.SAR (version 2.01)
SAPCAR: 6 file(s) extracted
```

This extracts the following files:
- `libsapcrypto.so` - Main cryptographic library
- `libslcryptokernel.so` - Cryptographic kernel
- `sapgenpse` - Tool for managing Personal Security Environments

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ ls -l lib*
-rwxr-xr-x. 1 demo demo 5843176 Aug 25 15:33 libsapcrypto.so*
-rwxr-xr-x. 1 demo demo  499679 Sep  8 08:02 libslcryptokernel.so*
-rw-r--r--. 1 demo demo     166 Sep  8 08:16 libslcryptokernel.so.sha256
```

## Step 3: Clone and Build perl-sapnwrfc

The perl-sapnwrfc module is a fork of the well-known Perl binding for SAP NetWeaver RFC SDK, originally maintained by Piers Harding. The original repository was the standard way to create Perl bindings to the SAP NWRFCSDK for many years, but it was last updated in 2013 and the maintainer seems to have abandoned the project.

With the advent of modern C compilers (C23 standard, GCC 14+) on recent Linux distributions, the old C-Perl bindings can no longer be successfully compiled. This is why my fork of the module is not available on CPAN and must be cloned from GitHub, which has been updated to work with contemporary compilers while maintaining backward compatibility with legacy systems.

Clone the perl-sapnwrfc repository from GitHub:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ git clone https://github.com/lausser/perl-sapnwrfc.git
Cloning into 'perl-sapnwrfc'...
remote: Enumerating objects: 292, done.
remote: Total 292 (delta 156), done.
```

Navigate to the cloned directory and build the Perl module:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ cd perl-sapnwrfc/
OMD[sapmon@omdmuc08]:~/prep_sap/perl-sapnwrfc$ perl Makefile.PL --source $(pwd)/../nwrfcsdk/
```

The configure script will detect the SAP libraries and generate the Makefile:

```
================================================
BUILD INFORMATION
================================================

OS:                  linux
source opt:          /omd/sites/sapmon/prep_sap/perl-sapnwrfc/../nwrfcsdk/
sapnwrfc dir:        /omd/sites/sapmon/prep_sap/perl-sapnwrfc/../nwrfcsdk/
libraries:           -lm -ldl -lrt -lpthread -lsapnwrfc -lsapucum
include dir:         /omd/sites/sapmon/prep_sap/perl-sapnwrfc/../nwrfcsdk//include
================================================
```

Now compile the module:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap/perl-sapnwrfc$ make
```

## Step 4: Install the Perl Module and Libraries

Install the compiled Perl module into your OMD site's local Perl library:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap/perl-sapnwrfc$ make install
Files found in blib/arch: installing files in blib/lib into architecture dependent library tree
Installing /omd/sites/sapmon/local/lib/perl5/lib/perl5/x86_64-linux-thread-multi/auto/SAPNW/Connection/Connection.so
Installing /omd/sites/sapmon/local/lib/perl5/lib/perl5/x86_64-linux-thread-multi/sapnwrfc.pm
...
```

Copy all required libraries to your OMD site's local lib directory:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ cp nwrfcsdk/lib/lib* lib* ~/local/lib
OMD[sapmon@omdmuc08]:~/prep_sap$ cp sapgenpse ~/local/bin
```

This copies:
- The RFC SDK libraries (`libsapnwrfc.so`, `libsapucum.so`)
- The ICU libraries (`libicudata.so.50`, `libicui18n.so.50`, `libicuuc.so.50`)
- The cryptographic libraries (`libsapcrypto.so`, `libslcryptokernel.so`)
- The `sapgenpse` tool for managing Personal Security Environments

## Step 5: Verify the Installation

Clean up the preparation directory:

```bash
OMD[sapmon@omdmuc08]:~/prep_sap$ cd ..
OMD[sapmon@omdmuc08]:~$ rm -rf prep_sap
```

Verify that the Perl module is properly linked to all required libraries:

```bash
OMD[sapmon@omdmuc08]:~$ ldd /omd/sites/sapmon/local/lib/perl5/lib/perl5/x86_64-linux-thread-multi/auto/SAPNW/Connection/Connection.so
        linux-vdso.so.1 (0x00007feef9b0e000)
        libsapnwrfc.so => /omd/sites/sapmon/local/lib/libsapnwrfc.so (0x00007feef8df0000)
        libsapucum.so => /omd/sites/sapmon/local/lib/libsapucum.so (0x00007feef8a93000)
        libc.so.6 => /lib64/libc.so.6 (0x00007feef888b000)
        ...
```

All libraries should resolve to your local installation paths, confirming that the dependencies are properly installed.

## Using check_sap_health with SNC

Now that the dependencies are installed, you can use check_sap_health with SNC (Secure Network Communication) for encrypted and authenticated connections to your SAP systems.

### SNC-Related Parameters

check_sap_health provides several command-line parameters to enable and control SNC:

**`--snc`**
Enables the SNC protocol for communication. If this flag is not set, all other SNC parameters are ignored. When `--snc` is set, the environment variable `SNC_MODE` is set to `1`.

**`--secudir`**
Sets the environment variable `SECUDIR`, which specifies the folder where the `SAPSNCS.pse` file (Personal Security Environment) is expected. This file contains the certificates and keys for SNC authentication.

**`--snc-lib`**
Sets the environment variable `SNC_LIB`. By default, if this parameter is not set, check_sap_health searches the `LD_LIBRARY_PATH` until a file `libsapcrypto.so` is found and sets `SNC_LIB` accordingly. Use `--snc-lib` if `libsapcrypto.so` is installed in an unusual location.

**`--snc-myname`**
Sets the environment variable `SNC_MYNAME`, which identifies your own SNC name (the monitoring system's identity).

**`--snc-partnername`**
Sets the environment variable `SNC_PARTNERNAME`, which identifies the SAP system you want to connect to. This is the Distinguished Name (DN) of the SAP system's certificate.

**`--snc-qop`**
Sets the environment variable `SNC_QOP` (Quality of Protection). The default value is `3`. This parameter controls the level of security with values ranging from `1` to `9`:
- `1` = Authentication only
- `2` = Integrity protection
- `3` = Privacy protection (encryption)
- `8` = Use default protection
- `9` = Maximum protection

**`--saprouter`**
Specifies the SAP Router to use for the connection (e.g., `/H/e4u.sap.consol.de`). This parameter was implemented alongside SNC support and enables a powerful combination: when used together with SNC, the plugin can perform encrypted communication through a single communication partner—the SAP Router. This simplifies network architecture and security policies, as all SAP communication can be routed through one central gateway.

### Example Usage

Here's a complete example of using check_sap_health with SNC to monitor CCMS MTE values:

```bash
check_sap_health \
    --username rfc-nagios --password qfiqh43fiqf4i \
    --mshost k-e4u-ci.sap.consol.de --r3name E4U --client 000 --msserv 3628 \
    --mode ccms-mte-check --mtelong \
    --name "Consol IT SAP-System (local)" \
    --name2 "Produktivsystem" --regexp --name3 "UsersLoggedIn" \
    --snc \
    --secudir /omd/sites/sapmon/etc/check_sap_health/sec \
    --snc-partnername "p/secude:EMAIL=CON-SAP-COMPETENCE-CENTER@MAIL.CONSOL,CN=SAPNCKE4U,O=CONSOL IT,C=DE"
```

In this example:
- The `--snc` flag enables SNC communication
- The `--secudir` parameter points to the directory containing the `SAPSNCS.pse` file
- The `--snc-partnername` specifies the Distinguished Name of the SAP system's certificate
- The SNC library (`libsapcrypto.so`) is automatically detected from the `LD_LIBRARY_PATH`

With these parameters, check_sap_health establishes a secure, encrypted connection to the SAP system using the certificates and keys configured in your Personal Security Environment.
