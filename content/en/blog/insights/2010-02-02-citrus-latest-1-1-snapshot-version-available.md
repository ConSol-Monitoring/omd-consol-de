---
author: Christoph Deppisch
date: '2010-02-02T07:58:50+00:00'
excerpt: Latest 1.1-SNAPSHOT version available
slug: citrus-latest-1-1-snapshot-version-available
tags:
- Citrus
title: 'Citrus: Latest 1.1-SNAPSHOT version available'
---

We put a further Citrtus 1.1-SNAPSHOT version online (see <a href="http://www.citrusframework.org">http://www.citrusframework.org</a>).

<!--more-->
This snapshot release contains the following changes:

* Bugfixing: Fixed message encoding issue regarding automatic UTF-16 XML payload conversion. For detailed bugfix changes see the <a href="http://www.citrusframework.org/changes-report.html">changes report</a>

* Read database values to variables: You can now extract column values in database result sets as test variables. In older versions this was only possible when validating the column values in advance.
```xml
<sql datasource="myDataSource">
    <description>Read some column value from database</description>
    <statement>SELECT MY_COLUMN  FROM MY_TABLE
                     WHERE ID='${rowId}'</statement>
    <extract column="MY_COLUMN" variable="${var}" />
</sql>
```

* Message channel support: We added <a href="http://www.springsource.org/spring-integration">Spring Integration</a> message channel support for asynchronous communication. You can publish/consume messages directly to/from message channels inside your test case (config: &lt;citrus:message-channel-sender&gt; or &lt;citrus:message-channel-receiver&gt;). Detailed documentation is coming soon.

Stay tuned for more message channel support coming up in 1.1 version. So you can start using the great Spring Integration adapter extensions in Citrus, too.