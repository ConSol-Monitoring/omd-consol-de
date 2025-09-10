---
date: 2025-02-10T17:06:39+01:00
title: "Duplicate users in the Grafana database"
linkTitle: "duplicate-grafana-users"
author: Gerhard Lausser
tags:
  - grafana
---
This issue occurred on an OMD 5.40 system running Grafana 10.4.2. A customer reported that embedded Grafana panels in the Service Detail View of Thruk were not working. Instead of a graph, they were presented with the Grafana login page.

In the *~/var/log/grafana/grafana.log*, the following messages appeared:

```
logger=user.sync t=2025-02-06T15:38:43.735173011+01:00 level=error msg="Failed to fetch user" error="Found a conflict in user login information. 3 users already exist with either the same login or email: [Sepp (email:Sepp, id:124), SEPP (email:SEPP, id:152), sepp (email:sepp, id:182)]." auth_module=authproxy auth_id=SEPP
logger=authn.service t=2025-02-06T15:38:43.735241811+01:00 level=error msg="Failed to run post auth hook" client=auth.client.proxy id= error="[user.sync.internal] unable to retrieve user"
```

From the Thruk logs, we determined that users were logging in using different variations of their usernames - sometimes in lowercase, sometimes in uppercase, and occasionally mixed case. This was possible because Apache authenticated users via an LDAP backend that was case-insensitive.

However, starting with Grafana 9.3, the software no longer treated differently cased usernames as the same user. (This issue had gone unnoticed for some time and was likely introduced with an OMD update.)

### Enforcing Lowercase Usernames in Thruk

To address this, we enforced lowercase usernames in Thruk by setting:

```
make_auth_user_lowercase = 1
```
_File: `~/etc/thruk/thruk_local.d/users_lowercase.conf`_

After restarting Thruk (`omd restart thruk`), all usernames were internally converted to lowercase, regardless of how users entered them.
> **Note:** Login to an OMD monitoring system is done through a Thruk login page. If authentication is successful, the username (now converted to lowercase) is passed to Grafana via the HTTP header `X-WEBAUTH-USER`, and the user is even created in Grafana on the fly.


### Cleaning Up Conflicting Users in Grafana

Next, we needed to sanitize the Grafana database by removing redundant user entries that contained uppercase letters. We followed the workflow documented [here](https://grafana.com/blog/2022/12/12/guide-to-using-the-new-grafana-cli-user-identity-conflict-tool-in-grafana-9.3/).

First, we listed all conflicting user accounts:

```bash
OMD[site1@tmonmuc]:~$ grafana cli \
  --config=/omd/sites/site1/etc/grafana/grafana.ini \
  --homepath=$HOME/share/grafana  \
  admin user-manager conflicts list
```

This displayed all users with login conflicts. *SEPP/Sepp/sepp* was one of them. The next step was to generate a conflict resolution file:

```bash
OMD[site1@tmonmuc]:~$ grafana cli \
  --config=/omd/sites/site1/etc/grafana/grafana.ini \
  --homepath=$HOME/share/grafana  \
  admin user-manager conflicts generate-file
```

The generated file appeared as:

```
/tmp/conflicting_user_1310352894.diff
```

This file contained user conflicts in the following format:

```
conflict: sepp
- id: 124, email: Sepp, login: Sepp, last_seen_at: 2024-11-15T11:15:42Z, auth_module: authproxy, conflict_email: true, conflict_login: true
+ id: 152, email: SEPP, login: SEPP, last_seen_at: 2024-10-22T05:43:19Z, auth_module: authproxy, conflict_email: true, conflict_login: true
- id: 182, email: sepp, login: sepp, last_seen_at: 2024-10-22T05:43:19Z, auth_module: authproxy, conflict_email: true, conflict_login: true
```

We needed to edit this file so that each *conflict:* block contained exactly one line with a plus sign (`+`) for the user we wanted to keep (in our case, the lowercase entry with ID 182). The other entries were marked with a minus sign (`-`) to be deleted.

Before applying changes, we validated the file:

```bash
OMD[site1@tmonmuc]:~$ grafana cli \
  --config=/omd/sites/site1/etc/grafana/grafana.ini \
  --homepath=$HOME/share/grafana  \
  admin user-manager conflicts validate-file \
  /tmp/conflicting_user_1310352894.diff
```

No errors were found, so we proceeded with the `ingest-file` command:

```bash
OMD[site1@tmonmuc]:~$ grafana cli \
  --config=/omd/sites/site1/etc/grafana/grafana.ini \
  --homepath=$HOME/share/grafana  \
  admin user-manager conflicts ingest-file \
  /tmp/conflicting_user_1310352894.diff
```

### Unexpected Error and Solution

However, after confirming *Proceed with operation?* with *Y*, we encountered an error:

```
Error: ✗ not able to merge with &{%!e(string=could not find intoUser: Found conflict in user login information. 3 users already exist with either the same login or email: [Sepp (email:Sepp, id:124), SEPP (email:SEPP, id:152), sepp (email:sepp, id:182)]})
```

This indicated that Grafana still treated `sepp`, `Sepp`, and `SEPP` as the same user, likely due to internal case-insensitive handling.

To resolve this, we explicitly configured Grafana to respect case differences by adding the following line to *grafana.ini*:

```ini
[users]
case_insensitive_login = false  # Temporarily enforce case sensitivity
allow_sign_up = false
default_theme = light
```
_File: `~/etc/grafana/grafana.ini`_

With this setting in place, we successfully ingested the conflict resolution file:

```bash
OMD[site1@tmonmuc]:~$ grafana cli \
  --config=/omd/sites/site1/etc/grafana/grafana.ini \
  --homepath=$HOME/share/grafana  \
  admin user-manager conflicts ingest-file \
  /tmp/conflicting_user_1310352894.diff
...
conflicts resolved.
```
After the `ingest-file` command ran successfully, we removed the `case_insensitive_login = false` line from `grafana.ini` to restore the original setting.


### Conclusion

By enforcing lowercase usernames in Thruk and making Grafana temporarily case-sensitive, we successfully eliminated duplicate user entries and restored embedded panel functionality. This issue highlights the importance of consistent username handling across authentication layers to avoid unexpected conflicts.


