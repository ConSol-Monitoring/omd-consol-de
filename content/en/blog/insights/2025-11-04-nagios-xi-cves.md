---
draft: false
date: 2025-11-04T00:00:00.000Z
title: "OMD Labs Edition Not Affected by Recent Nagios XI Vulnerabilities"
linkTitle: "omd-not-affected-nagios-xi-cves"
author: Gerhard Lausser
tags:
  - nagios
  - naemon
  - omd
  - vulnerabilities
---

## OMD Labs Edition Not Affected by Recent Nagios XI Vulnerabilities

Several vulnerabilities were recently disclosed in **Nagios XI**:

- **CVE-2025-34286** – Remote Code Execution in the *Core Config Manager (CCM)*
- **CVE-2025-34284** – Command Injection in the *WinRM Plugin*
- **CVE-2025-34134** – Remote Code Execution in the *Business Process Intelligence (BPI) Component*

These issues could allow authenticated administrators to execute arbitrary commands on affected systems, potentially leading to full host compromise.

---

### OMD Labs Edition Is **Not Affected**

The **OMD Labs Edition** (Open Monitoring Distribution) is an open-source monitoring platform maintained by [ConSol Labs](https://omd.consol.de).  
While it is compatible with Nagios and related cores such as **Naemon** and **Icinga**, it does **not** include or depend on the proprietary components of **Nagios XI** that are impacted by these vulnerabilities.

Specifically:

- **CVE-2025-34286:** Targets the *Core Config Manager (CCM)* of Nagios XI.  
  → *OMD Labs Edition does not use the CCM.*

- **CVE-2025-34284:** Targets the *WinRM Plugin* of Nagios XI.  
  → *OMD Labs Edition does not ship or depend on the WinRM plugin.*

- **CVE-2025-34134:** Targets the *Business Process Intelligence (BPI)* component of Nagios XI.  
  → *OMD Labs Edition does not contain any BPI component.*

Therefore, **OMD Labs Edition is not affected** by these vulnerabilities.
