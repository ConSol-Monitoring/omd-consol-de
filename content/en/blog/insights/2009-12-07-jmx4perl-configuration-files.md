---
author: Roland Huß
date: '2009-12-07T06:10:15+00:00'
excerpt: When you have already used `jmx4perl` you probably have remarked that the
  argument list can be quite lengthy, often due to the verbose JMX URLs. This gets
  even worse with jmx4perl's forthcoming proxy mode. Luckily, since version 0.36 it
  knows about configuration files which are the topic of this post.
slug: jmx4perl-configuration-files
tags:
- Config::General
title: 'Jmx4perl Configuration Files '
---

When you have already used `jmx4perl` you probably have remarked that the
argument list can be quite lengthy, often due to the verbose JMX
URLs. This gets even worse with jmx4perl's forthcoming proxy
mode. Luckily, since version 0.36 it knows about configuration files which are the topic of this post.

<!--more-->
Configuration files can be used for the command line tool `jmx4perl`
and from within the module `JMX::Jmx4Perl` (it is *not* yet supported
for the Nagios Plugin `check_jmx4perl`. Please leave me a comment if
you think this would be a sensible addition). Within a configuration file various parameters can be specified,
mostly URLs (target, proxy) and credentials for connecting to those
URLs. The syntax is in Apache HTTP-server style (as described in
[Config::General][1]) and can contain multiple `<Server>`
sections. Each of such section has a unique symbolic name with which
it can be referenced. This name serves as a shortcut when used in
combination with `jmx4perl` or `JMX::Jmx4Perl`. The sample below
demonstrates such a server section:

```xml
<Server>
  Name  bhut_jboss_proxy
  Url   http://jmxproxy:8888/j4p
  <Target>
     Url       service:jmx:rmi:///jndi://bhut:9999/jmxrmi
     User      admin
     Password  jboss
  </Target>
  <Proxy>
     Url      http://httpproxy:8001
     User     roland
     Password bla
  </Proxy>
</Server>
```

Here, an application server running on host *bhut* is configured. It's
given the name *bhut_jboss_proxy* and run jmx4perl in the proxy mode,
where the JMX-Proxy is running on the host *jmxproxy*. Additionally, a
HTTP proxy is used on host *httpproxy* along with the given
credentials. Note that this is already the new, consistent syntax for
specifying the proxy since 0.50_2. For older versions use the
following syntax for specifying the HTTP-Proxy

```xml
<Server>
  ....
  Proxy          http://httpproxy:8001
  Proxy_User     roland
  Proxy_Password bla
  ...
</Server>
```

## Configuration for jmx4perl

For `jmx4perl` you can provide this config file via the *`--config`*
command line option. Alternatively, the configuration file `~/.j4p`
will be used if existing. For each server configured, the symbolic
name can be used as replacement for the full URL.

So, instead of

```bash
jmx4perl \
   --target service:jmx:rmi:///jndi://bhut:9999/jmxrmi \
   --target-user admin \
   --target-password jboss \
   --proxy http://httpproxy:8801 \
   --proxy-user roland \
   --proxy-password bla \
   http://jmxproxy:8888/j4p \
   read MEMORY_HEAP_USED
```

the following shortcut can be used (assuming the configuration
as in the sample)

```bash
jmx4perl bhut_jboss_proxy read MEMORY_HEAP_USED
```

## Programmatic configuration

Configuration files can be used on a perl module level as
well. Configuration is encapsulated in the module
[JMX::Jmx4Perl::Config][2]. Either an instance of this class or a
plain path to a configuration file can be given to the constructor of
JMX::Jmx4Perl

```perl
my $config =
 new JMX::Jmx4Perl::Config();   # uses ~/.j4p by default
my $jmx4perl_jboss =
 new JMX::Jmx4Perl(server => "bhut_jboss_proxy",
                   config => $config);

my $jmx4perl_wls =
 new JMX::Jmx4Perl(server => "habanero_wls",
                   config_file => $ENV{HOME} . "/.j4p");
```


 [1]: http://search.cpan.org/~tlinden/Config-General/General.pm
 [2]: http://search.cpan.org/~roland/jmx4perl/lib/JMX/Jmx4Perl/Config.pm