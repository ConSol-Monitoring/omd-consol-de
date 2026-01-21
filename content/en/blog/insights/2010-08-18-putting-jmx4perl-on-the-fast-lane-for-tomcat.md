---
author: Roland Huß
date: '2010-08-18T17:58:51+00:00'
excerpt: "This post explains why a dedicated [Tomcat Connector](http://tomcat.apache.org/tomcat-6.0-doc/config/http.html)\
  \ reserved for the jmx4perl agent is a useful thing. \n"
slug: putting-jmx4perl-on-the-fast-lane-for-tomcat
tags:
- jmx4perl
title: Putting jmx4perl on the fast lane for Tomcat
---

This post explains why a dedicated [Tomcat Connector](http://tomcat.apache.org/tomcat-6.0-doc/config/http.html) reserved for the jmx4perl agent is a useful thing.

<!--more-->
If you are using [jmx4perl][1] for monitoring [Tomcat][2], installing the agent is usually only a copy into `$CATALINA_HOME/webapps`. This will deploy the agent the same way as the web applications you want to monitor.

The setup can be improved by defining a Tomcat [Connector][3] exclusively for the j4p agent. This has several advantages:

 * The metrics for the *real* connector are not influenced by the traffic that the agent generates for monitoring.
 * If the server to monitor is in a DMZ and you have two interfaces, one for accessing the web applications (which is exposed over a firewall to the rest of the world) and one for accessing the server from the internal LAN, you can bind the dedicated jmx4perl connector to the internal interface only so that it is not accessible from the outside.
 * In critical situation, when the webapp connector is under full load, eventually exhausting all its connections from the pool, you are still able to detect this with `check_jmx4perl` since it uses then a different connector with reserved connections. Since these are the situations which are the most critical, it is good to have a fast lane for `check_jmx4perl`.

Using a dedicated jmx4perl connector for Tomcat is easy. Simply add the following snippet to your `server.xml` configuration (probably at the end before the final `</Server>` end tag):

```xml
<Service name="jmx4perl">
  <Connector address="10.0.1.123" port="9090" maxHttpHeaderSize="8192"
             maxThreads="5" minSpareThreads="1" maxSpareThreads="3"
             enableLookups="true" acceptCount="20"
             connectionTimeout="3000" disableUploadTimeout="true" />
  <Engine name="Jmx4Perl" defaultHost="localhost">
    <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
           resourceName="UserDatabase"/>
    <Host name="localhost" appBase="jmx4perl"
          unpackWARs="false" autoDeploy="true"
          xmlValidation="false" xmlNamespaceAware="false"/>
  </Engine>
</Service>
```

Note the following customization hooks:

* The `address` attribute of the `<Connector>` tag specifies a dedicated local address on which this connector is listening. If you omit this attribute, the connector will listen on all configured interfaces.
* `port` in the connectors definition is, well, the port on which the connector is listening.
* `maxThreads`, `minSpareThreads` and `maxSpareThreads` are the connector's pool parameters. They can be kept fairly small assuming the the j4p agent is only requested low frequently.
* `appBase` from the `<Host>` section specifies a directory in which the agent gets deployed. So, instead of copying the agent into `webapps/`, copy it into a (freshly created) directory `jmx4perl/` (which, in this case, is on the same level as `webapps`, i.e. directly below `$CATALINA_HOME`).
* This example assumes, that security has been setup via `tomcat-users.xml` (and you added the relevant sections to j4p's web.xml descriptor). If you don't use user/password for accesing the agent, you can omit the `<Realm>` section.

More information about Tomcat connectors can be found [here][1].

BTW, putting the j4p-Agent on a fast lane is not only useful for Tomcat, but for any deployment scenario. This should be possible for the other application servers, too. Configuration will differ, though.

 [1] : http://search.cpan.org/~roland/jmx4perl/
 [2] : http://tomcat.apache.org/
 [3] : http://tomcat.apache.org/tomcat-6.0-doc/config/http.html