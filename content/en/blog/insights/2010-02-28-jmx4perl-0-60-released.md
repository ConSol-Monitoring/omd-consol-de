---
author: Roland Huß
date: '2010-02-28T16:29:43+00:00'
slug: jmx4perl-0-60-released
tags:
- jmx
title: Jmx4Perl 0.60 released
---

[Jmx4Perl](http://www.jmx4perl.org)’s next release [0.60](http://search.cpan.org/~roland/jmx4perl-0.60) is out in the wild.

<!--more-->
This release contains

- Refined error handling.
- Added support for overloaded JMX operations for 'list' and 'exec'
  commands.
- 'read' operation can now be used without an attribute name in which
  case the value of all attributes is returned. This can be used
  directly with JMX::Jmx4Perl and the frontend jmx4perl.
- Support for Resin 3.1 added.
- 'exec' operation can now deal with simple array arguments. Within
  the perl modules, put in an array ref for array arguments. This
  gets translated intoto a comma separated list of values in the
  request string. For string arrays this works only with simple content
  (i.e. no element containing a ','), though.
- Removed legacy JDK 1.4 support. 0.36 is the one and only version
  for which the JDK 1.4 backport has been tested to some amount.

The [agent war][1], the [Mule Agent][2] and the [OSGi Bundle][3] can be found on our Maven repository.

 [1]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-war/0.60.0/
 [2]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-mule/0.60.0/
 [3]: http://labs.consol.de/maven/repository/org/jmx4perl/j4p-osgi/0.60.0/