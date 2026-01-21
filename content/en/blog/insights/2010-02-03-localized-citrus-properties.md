---
author: Christoph Deppisch
date: '2010-02-03T16:06:02+00:00'
excerpt: In larger projects usually a team of testers is working on Citrus integration
  tests. In this post I'd like to share an easy way to localize the Citrus settings
  with Maven.
slug: localized-citrus-properties
tags:
- Citrus
title: Localized citrus.properties
---

In larger projects usually a team of testers is working on Citrus integration tests. This means that we need to localize the citrus.properties for testing on different machines, as each tester executes test cases with individual environment settings. In this post I'd like to share an easy way to localize the Citrus settings with Maven.

<!--more-->
By default Citrus is able to work with property files as the Spring's PropertyPlaceholderConfigurer is able to post process the beans in the IoC container. In the Spring application context we define the placeholder configurer to load properties from external file resources.

```xml
<context:property-placeholder location="classpath:citrus.properties" />
```

The citrus.properties file contains our project settings. Usually this file is added to version control and goes into a resource folder in our Citrus project (e.g. src/citrus/resources). Now we expect some of the settings to be environment specific, like JDBC connections for instance.

<pre>
[citrus.properties]
jdbc.driver.name=oracle.jdbc.OracleDriver
jdbc.connection.string=jdbc:oracle:thin:@192.168.1.80:1521:test
db.user=testuser
db.password=test
</pre>

Each team member should connect to a dedicated user/schema on our database server. This means we need to localize the database connection settings for each tester, which leads me to a separate properties file called citrus_local.properties.

<pre>
[citrus_local.properties]
db.user=myuser
db.password=topsecret
</pre>

Let's add these local properties to the placeholder configurer:

```xml
<context:property-placeholder location="classpath:citrus.properties,classpath:citrus_local.properties" />
```

Now citrus_local.properties will overwrite the settings in citrus.properties. The local properties file usually <b>does not go into version control</b>, because each tester puts different settings there. But this has some major drawbacks. Team members might forget to create this file and every time settings are added all team members have to adjust the local properties file manually as the files are not under version control.

Fortunately we can improve things with a little Maven magic. First of all I add a new property to my Maven POM describing a user specific identifier.

```xml
<properties>
    <user_id>christoph</user_id>
</properties>
```

You could also do that on each Maven command with -Duser_id=christoph, but I prefer to add this property to the "profiles.xml" in my Maven project's root directory. Next step is to rename all Citrus local properties to citrus_local.properties.[user_id] (e.g. citrus_local.properties.christoph) and add all local properties to version control. The src/citrus/resources folder may look like this now:

<pre>
+ src
  |   + citrus
  |   |   + resources
  |   |   |   citrus-context.xml
  |   |   |   citrus_local.properties.christoph
  |   |   |   citrus_local.properties.thomas
  |   |   |   citrus_local.properties.lisa
  |   |   |   citrus_local.properties.template
</pre>

As you can see I also added a template file, so new team members can use it to add a new local properties file with their user identifier very easy. Now we have a separate file for each tester under version control, fantastic! But keep in mind that the property placeholder configurer is still operating without any user identifier suffix and that the citrus_local.properties file should still not go into version control. So let us add this little section to our Maven project POM to finish the localization:

```xml
<plugin>
    <artifactId>maven-antrun-plugin</artifactId>
    <version>${maven-antrun-version}</version>
    <inherited>false</inherited>
    <executions>
        <execution>
             <id>copy-local-properties</id>
             <phase>process-resources</phase>
             <configuration>
                 <tasks>
                     <property name="user.suffix" value="${user_id}"/>
                     <copy file="src/citrus/resources/citrus_local.properties.${user_suffix}"
                              tofile="src/citrus/resources/citrus_local.properties"
                              overwrite="true"/>
                 </tasks>
             </configuration>
             <goals>
                 <goal>run</goal>
             </goals>
        </execution>
    </executions>
</plugin>
```

The Maven antrun plugin will copy the appropriate user properties file as citrus_local.properties before the build. This ensures that several testers may work with their individual test settings and as all files are under version control all team members are always up to date with the latest changes.

We can also think of having a citrus_local.properties file for our continuous build (e.g citrus_local.properties.hudson, citrus_local.properties.bamboo) just add as many local properties as you want.