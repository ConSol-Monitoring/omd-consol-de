---
author: Roland Huß
date: '2009-11-28T10:42:23+00:00'
excerpt: '[jmx4perl](http://www.jmx4perl.org) knows since some time how to restrict
  access to the agent (and soon proxy) servlet based on various criteria. However,
  this feature is unfortunately not yet well documented and a little bit hidden. This
  blog describes the nifty details and future roadmap.

  '
slug: access-restrictions-for-jmx4perl
tags:
- jmx
title: Access restrictions for jmx4perl
---

[jmx4perl](http://www.jmx4perl.org) knows since some time how to restrict access to the agent (and soon proxy) servlet based on various criteria. However, this feature is unfortunately not yet well documented and a little bit hidden. This blog describes the nifty details and future roadmap.

<!-- --><!--more-->Access restrictions are described within an XML-document which is included in the agent servlet `j4p.war`. The *out-of-the-stock* `j4p.war` doesn't include any restrictions. There are two ways for adding `j4p-access.xml` to the servlet.

The agent servlet can be easily rebuild out of the source distribution. The only prerequisites building the agent servlet are a JDK (>= 1.5) and a [ant][2] (the `make` in the Java world) installation:

* Download the source distribution from [CPAN][3] and extract it.
* Go into the `agent` sub-directory
* Copy `j4p-access.xml.template` to `j4p-access.xml`
* Edit `j4p-access.xml` according to you needs. More on this below.
* Call `ant`. This will build a `j4p.war` in the current directory with `j4p-access.xml` included at the right place.

Alternatively you could extract a distributed `j4p.war`, add a `j4p-access.xml` and repackage `j4p.war`:

```bash
mkdir j4p
cd j4p
jar xvf ../j4p.war
cp ~/jmx4perl-src/agent/j4p-access-template.xml j4p-access.xml
vi j4p-access.xml
jar cvf ../j4p.war *
```

## j4p-access.xml Format

The best starting point is to have a look at `j4p-access-temlate.xml` in the source distribution which contains some usage examples and should more or less self explanatory. Access can be restricted based on various parameters:

```xml
<j4p-restrict>
  <remote>
    <host>localhost</host>
    <host>10.0.0.0/16</host>
  </remote>

  <commands>
    <command>read</command>
    <command>exec</command>
  </commands>

  <mbeans>
    <mbean>
      <name>java.lang:type=Memory</name>
      <attribute>HeapMemoryUsage</attribute>
      <attribute mode="read">Verbose</attribute>
      <operation>gc</operation>
    </mbean>
  </mbeans>
</j4p-restrict>
```

First you can restrict access based on the client IP address. If a section `<remote>` is given, then access is only granted to all hosts given within the `<host>` tags. Whole subnets can be provided with a subnet postfix like `/24`. The address can be given in numeric form (in which case a DNS lookup is saved) or as a name. If this section is missing, all clients are allowed to access the agent.

Restrictions can be set globally for certain commands. Use `<commands>` to start this sections and add commands with the `<command>` tag. Only the mentioned commands are allowed to execute. Known commands are:

* read
* write
* exec
* list
* version
* search

If the `<commands>` section is missing, no command based restrictions apply.

Finally, restrictions can be set to certain MBeans and their attributes and operations. Within the `<mbeans>` section multiple `<mbean>` tags can be given. A `<mbean>` section includes a `<name>` specificiation which contains the fully qualified object name of the MBean for which access is granted. Additional `<attribute>` and `<operation>` tags can further restrict access to certain attributes and operations, respectively. If no `<attribute>` or `<operation>` is given within a `<mbean>` declaration, then access is granted to the whole MBean. If `<attribute>` contains an attribute `mode="read"`, then only read access is granted for this attribute. If `<mbeans>` are given, then access is granted to the specified MBeans only. Otherwise, access to all MBeans are allowed.

## Roadmap

Along with the forthcoming proxy mode, access could be restricted on the target server as well as allowing the agent servlet to proxy only to certain targets. Another idea is to extend this security mechanism with a backing store, so that access restriction could be added dynamically during runtime.

Do you have additional feature requests concerning access restrictions for the jmx4perl agent servlet ?

  [1]: http://www.jmx4perl.org
  [2]: http://ant.apache.org
  [3]: http://search.cpan.org/~roland/jmx4perl