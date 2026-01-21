---
author: Markus Hansmair
date: '2012-03-26T11:34:06+00:00'
slug: pentaho-kettle-within-a-web-application
title: Pentaho Kettle within a web application
---

This post demonstrates how to include and deploy <a href="http://kettle.pentaho.com/" title="Pentaho Kettle">Pentaho Kettle</a> as a regular Web application. There are some pitfalls you should be aware of.

<!--more-->
<h2>Introduction</h2>
I recently had to integrate Pentaho Kettle into a Java web application. To be more specific a Kettle job using several transformations was supposed to run once a night triggered by <a title="Quartz Scheduler" href="http://quartz-scheduler.org/" target="_blank">Quartz</a>.
<p>
To my surprise I could find only rudimentary (or blatantly outdated) information concerning this task. So I had to find a solution by trying to put those bits and pieces of information together (and by studying Kettle's source code).
</p>
<p>
Mind that this how-to is based on Pentaho Kettle 3.2.0. This is because
the above mentioned web application has been created in the context of
ConSol’s CRM / ticketing application <a href="http://www.consol.de/crm-software/">CM6</a>. This piece of software comes with
a selection of custom ETL plugins for Kettle which are bound to version
3.2.0. I don’t know how much of this post applies for more recent
versions of Pentaho’s software. At least you should get an idea of how
to start and where to get the information from.
</p>
<p>
Another precondition is that I haven't used a transformation repository but had to read job and transformations from physical files (<code>kjb</code> and <code>ktr</code> files). This caused some headache in the context of a JEE application server (here Weblogic 10.3.5) but I've found a workaround. Maybe a repository would have been the more adequate solution here. But I haven't evaluated that.
</p>
<p>
I've used maven as my build tool. So handling dependencies was a matter of naming these dependencies in the pom.xml and additionally specifying the repositories where to get these dependencies from. In case you use another build tool (e.g. ant or the integral build of your IDE) you probably have to get hold of the actual JAR files and add them to some lib folder in your project.
</p>
<p>
So here we go...
</p>
<h2>Dependencies</h2>

<p>
First you need a bunch of dependencies. Of course some Kettle specific
JARs</p>
<pre>  kettle-core-3.2.0.jar
  kettle-db-3.2.0.jar
  kettle-engine-3.2.0.jar</pre>
<p>
In maven parlance
</p>
```xml
<dependencies>
    <dependency>
      <groupId>pentaho.kettle</groupId>
      <artifactId>kettle-core</artifactId>
      <version>3.2.0</version>
    </dependency>
    <dependency>
      <groupId>pentaho.kettle</groupId>
      <artifactId>kettle-db</artifactId>
      <version>3.2.0</version>
    </dependency>
    <dependency>
      <groupId>pentaho.kettle</groupId>
      <artifactId>kettle-engine</artifactId>
      <version>3.2.0</version>
    </dependency>
    ....
  </dependencies>
```
<p>
These JARs are not available from the standard maven
repositories. Pentaho offers its own. So you have to add
</p>
```xml
<repositories>
    <repository>
      <id>PentahoRepo</id>
      <name>Pentaho repository</name>
      <url>http://repository.pentaho.org/artifactory/repo</url>
      <layout>default</layout>
      <releases>
        <enabled>true</enabled>
        <updatePolicy>never</updatePolicy>
        <checksumPolicy>warn</checksumPolicy>
      </releases>
    </repository>
  </repositories>
```
<p>
to your <code>pom.xml</code>. Alternatively you can install the
required JARs in you local maven repository via
</p>
```bash
mvn install:install-file -DgroupId=pentaho.kettle -DartifactId=kettle-core -Dversion=3.2.0 -Dpackaging=jar -Dfile=/path/to/kettle-core-3.2.0.jar -DgeneratePom=true

  etc. etc.
```
<p>
But that's not all. By trial and error I've determined what additional
JARs are required by Kettle.
</p>
```xml
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.7.0</version>
  </dependency>
  <dependency>
    <groupId>commons-digester</groupId>
    <artifactId>commons-digester</artifactId>
    <version>1.8</version>
  </dependency>
  <dependency>
    <groupId>commons-logging</groupId>
    <artifactId>commons-logging</artifactId>
    <version>1.1</version>
  </dependency>
  <dependency>
    <groupId>commons-vfs</groupId>
    <artifactId>commons-vfs</artifactId>
    <version>2.0-20090205</version>
  </dependency>
  <dependency>
    <groupId>rhino</groupId>
    <artifactId>js</artifactId>
    <version>1.7R1</version>
  </dependency>
  <dependency>
    <groupId>ognl</groupId>
    <artifactId>ognl</artifactId>
    <version>2.6.9</version>
  </dependency>
  <dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.8</version>
  </dependency>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>3.8.1</version>
    <scope>test</scope>
  </dependency>
```
<p>
These JARs are all present in standard maven repositories except
<code>commons-vfs-2.0-20090205.jar</code>. This appears to be an early
development version of VFS2. You cannot resort to a generally
available VFS2 version as apparenty in a later step of the development
the package structure of VFS2 has been changed. This special VFS-JAR
is available via the above mentioned Pentaho repository. (In later
versions of Kettle this special VFS JAR was replaced by a
<code>kettle-vfs-20100924.jar</code>.)
</p>
<h2>Kettle files</h2>
<p>
Kettle's API requires a physical job file (constructor of <code>JobMeta</code>).  This doesn't work well with a single WAR that I wanted to deploy into the container.  Additionally physical files are problematic in the context of a JEE application server. (Deep inside Kettle works with VFS which would offer the option to specify files within a JAR (or WAR), e.g. something like <code>jar:webapp.war!/path/to/my/kettle.kjb</code>. But how to get hold of the name and path to my web application WAR?)
</p>
<p>
So I've decided to include the Kettle files (<code>kjb</code> and
<code>ktr</code> files) into my WAR. I copy these files to a temporary
file and remove these as soon as the ETL job is done.
</p>
```java
private File copyKettleFiles(List kettleFileNames) throws IOException {
        InputStream inStream = null;
        OutputStream outStream = null;
        try {
            File tempDir = File.createTempFile("someprefix", null);
            tempDir.delete();
            tempDir.mkdir();
            for (String kettleFileName : kettleFileNames) {
                inStream = this.getClass().getResourceAsStream(kettleFileName);
                outStream = new FileOutputStream(new File(tempDir,kettleFileName));
                byte[] buffer = new byte[4096];
                int byteCount;
                while ((byteCount = inStream.read(buffer)) > 0) {
                    outStream.write(buffer, 0,  byteCount);
                }
                outStream.close();
                outStream = null;
                inStream.close();
                inStream = null;
            }

            return tempDir;
        } catch (IOException e) {
            log.error("Failed to copy kettle files to temporary directory ("
                      + e.getMessage() + ")");
            throw e;
        } finally {
            if (inStream != null) try { inStream.close(); } catch (Throwable t) { }
            if (outStream != null) try { outStream.close(); } catch (Throwable t) { }
        }
    }
```
<p>
Put the Kettle files in <code>src/main/resources/[package]</code>
        where <code>[package]</code> has to be replaced by the slash
        delimited package of the class the above method is located
        in. After you are done the temporary directory is deleted with
</p>
```java
private void removeTempDir(File tempDir) {
        if (tempDir != null) {
            try {
                for (File file : tempDir.listFiles()) {
                    file.delete();
                }
                tempDir.delete();
            } catch (Throwable t) { }
        }
    }
```
<p>
For the further steps you need to know the Kettle job
        (<code>kjb</code>) file.
</p>
```java
private String getKjbFileName(File tempDir) throws IOException {
        for (File file : tempDir.listFiles()) {
            if (file.getName().endsWith(".kjb")) return file.toString();
        }
        throw new IOException("KJB file not found in " + tempDir.toString());
    }
```
<h2>Setting up Kettle</h2>
<p>
  Now it's time to set up Kettle. I had a look at the main method of
  <code>Kitchen.java</code>, stripped everything that I deemed
  unnecessary for my usecase and got
</p>
```java
LogWriter log = LogWriter.getInstance(LogWriter.LOG_LEVEL_BASIC);
    StepLoader stepLoader = StepLoader.getInstance();
    if (stepLoader.getPluginList().size() == 0) {
        StepLoader.init();
    }
    JobEntryLoader jobEntryLoader = JobEntryLoader.getInstance();
    if (!jobEntryLoader.isInitialized()) {
        JobEntryLoader.init();
    }
    JobMeta jobMeta = new JobMeta(log, kjbFileName, null);
    Job job = new Job(log, stepLoader, null, jobMeta);
    job.getJobMeta().setArguments(null);
    job.initializeVariablesFrom(null);
    job.getJobMeta().setInternalKettleVariables(job);
    job.copyParametersFrom(job.getJobMeta());
```
<h2>Parameterizing</h2>
<p>
Your Kettle jobs and transformations may need some parameters set (e.g. names of files to read from). This is accomplished by
</p>
```java
Map<String,String> config = ....
    ....
    boolean paramNotFound = false;
    for (String param : job.listParameters())  {
        if (!config.containsKey(param)) {
            log.error("Job parameter " + param + " not found");
            paramNotFound = true;
        }
        String value = config.get(param);
        if (value != null)  {
            job.setParameterValue(param, value);
        }
    }
    if (paramNotFound) {
        throw new RuntimeException("Missing parameters");
    }
    job.activateParameters();
```
<p>
<code>config</code> holds your configuration. It's your task you decide where to get those data from. Maybe you want to read from some properties file or use a configuration service of your application
</p>
<h2>Logging</h2>
<p>
Kettle uses its own logging class (<code>LogWriter</code>) that internally relies on log4j. No JCL, no slf4j. You're bound to log4j. The name of the log4j logger used is <code>org.pentaho.di</code>. If there is not at least one console appender it will create it's own. You have to live with it.
</p>
<p>
You see, Kettle was not supposed to be used as a library within another application.
</p>
<h2>Do it!</h2>
```java
Result result = job.execute();
    job.endProcessing(Database.LOG_STATUS_END, result);
```
<p>
Again this was taken from <code>Kitchen.java</code>.
</p>