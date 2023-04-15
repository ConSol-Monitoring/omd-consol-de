---
title: Kerberos
hidden: true
---

## Kerberos Integration

### Summary

This document is a working example describing the SSO configuration for the following setup:

 - Active Directory with 2 domains
 - the DNS names are different from AD domain name
 - Thruk
 - apache module mod_auth_kerb and Kerberos itself are from the OS distribution

The idea presented here is to have a single SSO master site where the Kerberos configuration and keytab are maintained. These are owned by the OMD group, which is common for all sites and thus all the other sites are then able to switch to kerberos or back independently if needed. The keytab must be updated in case AD password changes. As the keytab represents the Kerberos identity of the server, it is strongly recommended to have a dedicated AD account, which have the most minimal permissions only.

### Environment

The following values are used in the examples in this document:

| Value               | Description                             |                                         |
|---------------------|-----------------------------------------|-----------------------------------------|
| THRUKHOST           | linuxsrv1                               | linux server where Thruk is installed   |
| THRUKHOST.FQDN      | linuxsrv1.intra.company                 | FQDN of the server above                |
| THRUKALIAS          | thruk                                   | DNS CNAME alias name for the Thruk host |
| THRUKALIAS.FQDN     | thruk.intra.company                     |                                         |
| ADDOMAIN1           | EMEA.COMPANY.COM                        | 1st Active Directory domain             |
|                     | ADEMEA                                  | NETBIOS name of the 1st domain          |
| ADDOMAIN2           | APAC.COMPANY.COM                        | 2nd Active Directory domain             |
|                     | ADAPAC                                  | NETBIOS name of the 2nd domain          |
| AD_SPN_HOLDER       | ADEMEA\service_omd                      | AD account used to hold SPNs            |
| OMD_SSO_SITE        | site00                                  | SSO master site in OMD                  |
| OMD_OTHER_SITE      | site01                                  | some other OMD site                     |

These values must be changed in your environment accordingly.


### Active Directory

Create a new account ADEMEA\service_omd in the first AD domain. The account does not need any special permissions within AD.

Add the SPNs with the name of the Thruk host to the account created, for instance using setspn on the domain controller of the first domain:

```
setspn -s HTTP/linuxsrv1 ADEMEA\service_omd
setspn -s HTTP/linuxsrv1.intra.company ADEMEA\service_omd
```

### OMD host

Install the apache module apache2-mod_auth_kerb on the Thruk host. There might be further packages needed as dependencies.

### OMD SSO Site (site00)

Create a new OMD site where the keytab will be stored for all the sites on the host where SSO is required:
```
omd create site00
```

Save your ssh public key into ~/.ssh/authorized_keys on the site. The SSH login with keys is needed as the OMD site users have no password.

Create the directory ~/etc/krb/ in the site where keytab and krb5.conf will be stored
```
mkdir ~/etc/krb
```

Create the krb5.conf file under ~/etc/krb/. The example content is given below.

Set the environment variable KRB5_CONFIG at the bottom in the .profile pointing to the krb5.conf:
```
export KRB5_CONFIG=/opt/omd/sites/site00/etc/krb/krb5.conf
```

Logout, login again as the site user per SSH and check that KRB5_CONFIG is set
```
env | grep KRB5_CONFIG
```

Create the keytab file:

- initialize Kerberos
```
kinit –f ADEMEA\service_omd
```
- find out the KVNO number as it is needed in the next step for the “-k” option
```
kvno HTTP/linuxsrv1
```
- launch `ktutil` and create the keytab within ktutil, using KVNO from the previous step. You will be prompted for the password of the AD account holding SPNs:
```
addent -password –e rc4-hmac -k 4 –p HTTP/linuxsrv1
addent -password –e rc4-hmac -k 4 –p HTTP/linuxsrv1.intra.company
list
wkt /opt/omd/sites/site00/etc/krb/linuxsrv1.keytab
quit
```

Change permissions of the folder `~/etc/krb/` and files `krb5.conf` and keytab therein to be readable by the omd group
```
chgrp –R omd /opt/omd/sites/site00/etc/krb
chmod –R 640 /opt/omd/sites/site00/etc/krb
```

Set Thruks cookie authentication in sso-mode. This will verify existing cookies or api keys, but pass through kerberos
authenticated users.
```
omd config set THRUK_COOKIE_AUTH sso-support
```

Note: with OMD 2.x or Apache 2.2 you have to disable Thruks cookie authentication completely.

Comment out the basic authentication und insert Kerberos configuration in `~/etc/apache/conf.d/auth.conf`. The example content is given below.

Start or restart OMD site and open it in the browser via alias name

- https://thruk/site00/
- https://thruk.intra.company/site00/

### OMD other sites

After the SSO master site is ready,  each site on the host which needs SSO can be configured in three simple steps:
- KRB5_CONFIG entry in .profile pointing to the krb5.conf in the SSO site
```
export KRB5_CONFIG=/opt/omd/sites/site00/etc/krb/krb5.conf
```
- Deactivate cookie authentication
```
omd config set THRUK_COOKIE_AUTH off
```
- Modify auth.conf under `~/etc/apache/conf.d/`


### Example krb5.conf

```
[logging]
default = FILE:/omd/sites/site00/var/log/kerberos.log

[libdefaults]
ticket_lifetime = 24000
default_realm = EMEA.COMPANY.COM
dns_lookup_realm = false
dns_lookup_kdc = true

[realms]
EMEA.COMPANY.COM = {
  kdc = emea.company.com:88
  auth_to_local = RULE:[1:$1@$0](.*@EMEA\.COMPANY\.COM)s/A/a/g s/B/b/g s/B/b/g s/C/c/g s/D/d/g s/E/e/g s/F/f/g s/G/g/g s/H/h/g s/I/i/g s/J/j/g s/K/k/g s/L/l/g s/M/m/g s/N/n/g s/O/o/g s/P/p/g s/Q/q/g s/R/r/g s/S/s/g s/T/t/g s/U/u/g s/V/v/g s/W/w/g s/X/x/g s/Y/y/g s/Z/z/g s/@.*/@EMEA/
  auth_to_local = RULE:[1:$1@$0](.*@APAC\.COMPANY\.COM) s/A/a/g s/B/b/g s/B/b/g s/C/c/g s/D/d/g s/E/e/g s/F/f/g s/G/g/g s/H/h/g s/I/i/g s/J/j/g s/K/k/g s/L/l/g s/M/m/g s/N/n/g s/O/o/g s/P/p/g s/Q/q/g s/R/r/g s/S/s/g s/T/t/g s/U/u/g s/V/v/g s/W/w/g s/X/x/g s/Y/y/g s/Z/z/g s/@.*/@APAC/
  auth_to_local = DEFAULT
}
APAC.COMPANY.COM = {
  kdc = apac.company.com:88
}

[domain_realm]
.intra.company = EMEA.COMPANY.COM
intra.company = EMEA.COMPANY.COM
```

Notes:
- all the regex transformations, even those for further domains must all be en-tered inside the entry for the first realm
- the entry “auth_to_local = DEFAULT” is sufficient and the usernames will ap-pear as “USER@EMEA.COMPANY.COM” or “US-ER2@APAC.COMPANY.COM”
- with the regex chains s/A..Z/a…z/g the user names will be transformed to low-er case, i.e. USER=>user
  The same can be achieved in the Thruk via setting one of the options `make_auth_user_uppercase/ make_auth_user_lowercase` to 1 in `~/etc/thruk/thruk.conf`
- the last regex (s/@.*/@APAC/) augments the user name with the string and thus allows to distinguish users based on realm

### Example auth.conf

```
# General auth configuration for this site
#

<IfModule !mod_auth_kerb.so>
  LoadModule auth_kerb_module /usr/lib64/apache2/mod_auth_kerb.so
</IfModule>

# required if user is in many ad groups
LimitRequestFieldSize 16384

<Location "/${OMD_SITE}">
  AuthName "OMD Monitoring Site ${OMD_SITE}"
  AuthType Kerberos
  KrbAuthRealm EMEA.COMPANY.COM
  KrbMethodNegotiate on
  KrbSaveCredentials off
  KrbMethodK5Passwd off
  KrbLocalUserMapping on
  KrbVerifyKDC on
  Krb5Keytab /opt/omd/sites/site00/etc/krb/linuxsrv1.keytab
  KrbServiceName HTTP/linuxsrv1.intra.company@EMEA.COMPANY.COM
  Require valid-user

  # with apache 2.4 and thruk cookie auth set to sso-support, api keys can
  # be enabled with these additional settings:
  #Require expr %{HTTP_COOKIE} =~ /thruk_auth=/
  #Require expr %{HTTP:X-Thruk-Auth-Key} != ""

  # apache 2.2 requires additional settings
  #Order allow,deny
  #Satisfy Any
</Location>
```

Notes:
 - the path to mod_auth_kerb.so may vary depending on the linux distribution used
