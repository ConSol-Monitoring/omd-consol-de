---
draft: false
date: 2025-07-17T00:00:00.000Z
title: "Coshsh can keep a secret"
linkTitle: "coshsh-secrets"
author: Gerhard Lausser
tags:
  - coshsh
  - vault
---

Coshsh, as a generator for monitoring config files, needs to know which hosts and applications make up an enterprise's IT landscape. Usually, it fetches this information by querying a CMDB's API. Access is typically granted by presenting a token, or a username and password. Since this is confidential data, it should not be visible in clear text—especially if you back up your Coshsh config in a public Git repository.

In an OMD setup, you can store secrets in a vault, which is used by the Naemon core. Since the release of Coshsh 11.0, Coshsh can use the vault too.

Imagine the following scenario: you have two OMD sites, *prod* and *nonprod*—for production and testing, respectively.

Coshsh collects inventory data by querying the ServiceNow CMDB. It then generates the corresponding configuration files, which are used by the two OMD sites. Importantly, the OMD sites themselves do not query ServiceNow for inventory; all ServiceNow communication is handled by Coshsh during config generation.

However, both OMD sites can create incidents in ServiceNow as part of their monitoring workflows. The production site interacts with the main ServiceNow instance, while the testing site uses a separate development ServiceNow instance.  
| cmdb ServiceNow   |        | omd site |        | Incident ServiceNow   |
|-------------------|--------|----------|--------|-----------------------|
| itsm.example.com  |   →    | prod     |   →    | itsm.example.com      |
| itsm.example.com  |   →    | nonprod  |   →    | itsm-dev.example.com  |

Let’s further assume that the two ServiceNow instances have different API credentials:

| ServiceNow instance | Username    | Password      |
|---------------------|-------------|--------------|
| main                | monitoring  | v3rys3cr3t   |
| dev                 | monitordev  | n0ts0s3cr3t  |

If you don't have a Naemon Vault yet, you can create one in your OMD site with:
```
vim -x -c "set cm=blowfish2" etc/naemon/vault.cfg
```
(You can find more information on how to use the vault with the Naemon core [here](https://github.com/naemon/naemon-vimcrypt-vault-broker).)

Next, edit the vault and add the ServiceNow passwords:
```
$VAULT:svcnow_pw_prod$ = v3rys3cr3t
$VAULT:svcnow_pw_nonprod$ = n0ts0s3cr3t
```

In the Coshsh cookbook, we have two recipes, which generate the configs for the *prod* and *nonprod* sites. Because the variable *%RECIPE_NAME%* is replaced by the recipe's name when running the generation ("cooking"), we can reference the secrets using *svcnow_pw_%RECIPE_NAME%*. This helps to keep the cookbook shorter, because there is no need to define separate datasources with the different secret references.

The credentials are used in a data source of type *svcnow_cmdb_ci*.  
(FYI, the datasource of type *svcnow_cmdb_ci*, which connects coshsh to the ServiceNow CMDB, also creates the definition for a contact named *servicenow*. This contact is using a notification script which creates incidents via the */api/now/table/incident* endpoint of ServiceNow. In order to separate the CMDB interface from the Incident interface, the datasource can take two different urls, *cmdb_url* and *incident_url*)

```
###############################
# etc/coshsh/conf.d/example.cfg
###############################

#
# A vault is a file or database where secrets are stored (in encrypted or
# at least not publicly accessible form)
# This section defines a vault of type Naemon Vault, which can be opened and
# read using the environment variable $NAEMON_VIM_MASTER_PASSWORD as the key.
# Thanks to a vault, secrets have not to be written in cleartext in this
# config file. Instead, we reference them using the notation @VAULT[key]
# Vault contents are kept inside coshsh in form of a key-value-dictionary.
# In this example, an occurrence of @VAULT[svcnow_pw_prod] will be replaced
# by "v3rys3cr3t".
#
[vault_naemon]
type = naemon_vault
file = ./etc/naemon/vault.cfg
key = %NAEMON_VIM_MASTER_PASSWORD%

#
# A mapping is like a key-value store. It has a name ("svcnow" in this case)
# and can be used in recipes', datasources' and datarecipients' attributes.
# @MAPPING_SVCNOW[svcnow_url_prod] for example will resolve to
# https://svcnow.example.com
# @MAPPING_NAMEINCAPITALLETTERS[key] -> value
#
[mapping_svcnow]
svcnow_user_prod = monitoring
svcnow_user_nonprod = monitordev
svcnow_url_prod = https://svcnow.example.com
svcnow_url_nonprod = https://svcnow-dev.example.com

#
# This is the datasource the inventory data are read from.
# The type svcnow_cmdb_ci references the Python code which actually
# communicates with the ServiceNow API.
#
[datasource_servicenow]
type = svcnow_cmdb_ci
username = @MAPPING_SVCNOW[svcnow_user_%RECIPE_NAME%]
password = @VAULT[svcnow_pw_%RECIPE_NAME%]
# Inventory always comes from the main ServiceNow
cmdb_url = @MAPPING_SVCNOW[svcnow_url_prod]
# Incidents are created either in the main or the dev ServiceNow
incident_url = @MAPPING_SVCNOW[svcnow_url_%RECIPE_NAME%]

#
# This is a recipe which can't be cooked (watch the double \_).
# It's sole purpose is to be inherited by the prod and nonprod recipes in
# order to avoid repetitive attributes.
#
[recipe__vault]
objects_dir = %OMD_ROOT%/var/coshsh/configs/%RECIPE_NAME%
classes_dir = %OMD_ROOT%/etc/coshsh/recipes/example/classes
templates_dir = %OMD_ROOT%/etc/coshsh/recipes/example/templates
datasources = servicenow
vaults = naemon

#
# These are the actual recipes. You can run
# coshsh-cook --cookbook ~/etc/coshsh/conf.d/example.cfg --recipe prod
# coshsh-cook --cookbook ~/etc/coshsh/conf.d/example.cfg --recipe nonprod
# which will read inventory data from the main dev servicenow and include
# a contact which will create incidents in the main resp. the dev servicenow.
# The config files will be written to
# ~/var/coshsh/configs/prod/dynamic or ~/var/coshsh/configs/nonprod/dynamic
#
[recipe_prod]
isa = recipe__vault

[recipe_nonprod]
isa = recipe__vault
```

When we cook a recipe, the data source's attributes are first updated with the actual recipe name, so we get the correct references to the mapping and vault variables. Then, these references are looked up in *mapping_svcnow* and *vault_naemon*, and are resolved to their final values.

Using this new feature allows you to safely commit this *example.cfg* to a public Git repository.

