---
author: Admin
date: '2009-07-08T17:47:18+00:00'
slug: project-root-path-in-a-maven-multi-module-project
tags:
- gmaven
title: Project root path in a Maven multi module project
---

In a multi module Maven project, it seems non trival to reference the project root location from the sub modules deeper down in the module hierarchy. The following approach describes how to configure a plugin referencing a root POM relative file.

<!--more-->

Here's the usual multi module file layout:
```text
Main POM (contains project global conf file)
       |
       +- Sub module 1 POM
       |
       +- Sub module 2 POM (needs project global configuration file)
       |
       +..
```
Typically, you need to reference a file resource for some plugin configuration issue and want it applied for all project modules. The<em> pluginManagement</em> section in your main POM allows you to configure plugin defaults for the project scope, which applies to all modules - a best practise for Maven projects.
<h3>Example: Shared findbugs plugin configuration</h3>
My example is a  <a href="http://mojo.codehaus.org/findbugs-maven-plugin/2.0.1">findbugs</a> plugin configuration having a filter file, configured in the main POM and applied for all sub modules when generating the project site. An alternative example could be a shared log4j configuration file used by surefire tests.

Main <em>pom.xml</em>:

```xml
<pluginManagement>
  <plugins>
    <plugin>
       <groupId>org.codehaus.mojo</groupId>
       <artifactId>findbugs-maven-plugin</artifactId>
       <version>2.0</version>
       <configuration>
           <threshold>Normal</threshold>
           <effort>Max</effort>
           <excludeFilterFile>${basedir}/tools/findbugs-excludes.xml</excludeFilterFile>
       </configuration>
    </plugin>
  </plugins>
</pluginManagement>
```

This works nicely for a single module maven project. For a multi module setup, this fails since <strong>${basedir}</strong> always evaluates to the current modules directory root. So in a sub module, this is the directory containing the sub modules <em>pom.xml</em>.
<h3>Potential solutions?</h3>
Potential solutions could be to configure the plugin using an absolute  path or redundantly configure the path for each sub module. An absolute path violates portability, and redundant configurations in a 20+ module project increases complexity  (sure way to configuration hell and are plain ugly).

A better approach involves using a <a href="http://maven.apache.org/guides/introduction/introduction-to-profiles.html"><em>profiles.xml</em></a> which configures the project root path as a variable:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<profilesXml>
  <profiles xmlns="http://maven.apache.org/PROFILES/1.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/xsd/profiles-1.0.0.xsd">
    <profile>
      <id>env</id>
      <properties>
      <!-- Replace with current directory when initially creating profiles.xml
               In Windows, don't forget the leading '/' before the device name
               (e.g. /D:/projects/foo) -->
        <PROJECT_HOME>/Users/mm/devel/example-project</PROJECT_HOME>
      </properties>
      <activation>
        <file><missing>always_missing_file</missing></file>
      </activation>
    </profile>
  </profiles>
</profilesXml>
```

This is a personal profile, so it should not get checked into source code management (Subversion etc.). The profile is always active, triggered by the workaround activation of a non existing file <em>always_missing_file</em>.  Your findbugs configuration now references the <strong>${PROJECT_HOME}</strong> property, which will point to your project root for the main and all sub module POMs:

```xml
<excludeFilterFile>${PROJECT_HOME}/tools/findbugs-excludes.xml </excludeFilterFile>
```
<h3>Further simplifications</h3>
For a project setup for multiple people, it makes sense to have the profile file provided as a template, eg as <em>profiles.xml.template</em>. Upon initial project checkout, you copy this template to <em>profiles.xml</em> and edit the value of PROJECT_HOME.

Another trick can do this for the developer automatically on the first time Maven invocation, using the <a href="http://maven.apache.org/plugins/maven-antrun-plugin/">antrun</a> or <a href="http://groovy.codehaus.org/GMaven">GMaven</a> plugin.

In your projects main <em>pom.xml</em>:
```xml
<profiles>
  <profile>
    <id>setup</id>
    <build>
      <plugins>
        <plugin>
          <groupId>org.codehaus.groovy.maven</groupId>
          <artifactId>gmaven-plugin</artifactId>
          <version>1.0</version>
          <inherited>false</inherited> <!-- Works only if inheritance is deactivated -->
          <executions>
            <execution>
              <phase>initialize</phase>
              <goals>
                <goal>execute</goal>
              </goals>
              <configuration>
                <source>
                  ant.copy(file: 'profiles.xml.template',
                                tofile: 'profiles.xml',
                                filtering: true) {
                    filterset() {
                      filter(token: 'PROJECT_HOME',
                              value: new File('.').getCanonicalPath())
                      }
                    }
                  log.info('')
                  log.info('This is the first time you invoked Maven for this project.')
                  log.info('Initialized profiles.xml. Finished setup, exiting.')
                  log.info('You can now use maven as usual.')
                  log.info('')
                  System.exit(0)
                  </source>
                </configuration>
             </execution>
           </executions>
         </plugin>
      </plugins>
    </build>
    <activation> <!-- Only create profiles.xml if there's no profiles.xml yet -->
      <file><missing>profiles.xml</missing></file>
    </activation>
  </profile>
</profiles>
```

The <em>profiles.xml.template</em> which gets filtered once upon first Maven invocation:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<profilesXml>
  <profiles xmlns="http://maven.apache.org/PROFILES/1.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/xsd/profiles-1.0.0.xsd">
    <profile>
      <id>env</id>
      <properties>
         <! -- Replaced by Groovy scriptlet when copying over to profiles.xml -- >
         <PROJECT_HOME><strong>@PROJECT_HOME@</strong></PROJECT_HOME>
      </properties>
      <activation>
        <file><missing>always</missing></file>
      </activation>
    </profile>
  </profiles>
</profilesXml>
```

If anyone knows a more elegant solution, I'd really be interested ... it's still a bit complex.

Enjoy, Marcel