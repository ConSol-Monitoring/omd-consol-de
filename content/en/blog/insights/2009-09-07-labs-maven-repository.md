---
author: Admin
date: '2009-09-07T17:55:48+00:00'
slug: labs-maven-repository
tags:
- Maven
title: Labs Maven Repository
---

Labs got its own maven repository now:
<ul>
    <li><a href="http://labs.consol.de/maven/repository/">http://labs.consol.de/maven/repository/</a> , for releasing artifacts</li>
    <li><a href="http://labs.consol.de/maven/snapshots-repository/">http://labs.consol.de/maven/snapshots-repository/</a> , for snapshot artifacts</li>
</ul>
<!--more Read more about how to access and how to deploy into the repository -->
<h3>How do I access the repo for my Maven project?</h3>
Add the repos to your project POM. Here's an example for the release repository:
```xml
<repository>
  <id>consol-labs-release</id>
  <url>http://labs.consol.de/maven/repository/</url>
  <snapshots>
    <enabled>false</enabled>
  </snapshots>
 <releases>
    <enabled>true</enabled>
  </releases>
</repository>
<repository>
  <id>consol-labs-snapshots</id>
  <url>http://labs.consol.de/maven/snapshots-repository/</url>
  <snapshots>
    <enabled>true</enabled>    <!-- Policy: always, daily, interval:xxx (xxx=#minutes, 60*24*7=10080), never -->
    <updatePolicy>interval:10080</updatePolicy>
  </snapshots>
  <releases>
    <enabled>false</enabled>
  </releases>
</repository>
```
<h3>How do I release to the repos?</h3>
Simply add this profile to your project, and activate it when deploying:
```xml
<profile>
  <id>dist-labs</id>
  <distributionManagement>
    <repository>
      <id>consol-labs-release</id>
      <url>scpexe://labs.consol.de/home/maven-repository/www/htdocs/repository</url>
    </repository>
    <snapshotRepository>
      <id>consol-labs-snapshots</id>
      <url>scpexe://labs.consol.de/home/maven-repository/www/htdocs/snapshots-repository</url>
    </snapshotRepository>
  </distributionManagement>
</profile>
```
Additionally, you'll have to modify your <em>$HOME/.m2/settings.xml</em> and configure the user for SSH deployment:
```xml
<server>
  <id>consol-labs-release</id>
  <username>maven-repository</username>
</server>
<server>
  <id>consol-labs-snapshots</id>
  <username>maven-repository</username>
</server>
```
Now you can simply deploy using Maven:
```bash
mvn clean install deploy -Pdist-labs
```
Note: We only support SSH transport for now, using SSH authorized keys.