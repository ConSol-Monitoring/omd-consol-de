---
author: Jens Klingen
author_url: https://twitter.com/jklingen
date: '2017-02-13'
featured_image: duke-thinking.jpg
meta_description: In July 2017, Java 9 will be released including the brand-new module
  system. This short introduction gets you started with modular development in Java
  9.
tags:
- java9
title: Getting Started with Java 9 Modules
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="duke-thinking.jpg" alt=""></div>

So, 2017 has arrived - this is the year when Java 9 will finally be released. And with it, the brand new module system called Jigsaw. In January, Marc Reinhold has announced that [JDK 9 is feature complete], so we have every reason to be optimistic that the final release will actually ready in July. So it is about time to get acquainted with project Jigsaw, also known as Java 9 modules.
<!--more-->

Shortcut: you already know the concept behind Java 9 modules and are impatient to get your hands dirty? Proceed to [How to Declare a Java 9 Module](#how-to-declare-a-java-9-module) or see a [Java 9 Modules Example with Maven and JUnit] in action.

## Goals of Project Jigsaw
Besides improving the platform itself, JDK 9 will completely change the way we will be structuring our Java applications. One of the goals is to bring **strong encapsulation**: with Java 9 modules, we will be able to precisely define which parts of our code will be available for other modules. And for the first time, our Java code will have the possibility to know about it's own dependencies and thus have **reliable configuration**. Together, these features might finally be our long desired escape pod from Classpath Hell.

## So What's Wrong with JDK before 9?
With regards to encapsulation... there is none. Access modifiers are quite limited in their possibilities, and even private fields can easily accessed by everyone.
And you probably enough know about unreliable configuration if you have ever experienced `NoClassDefFoundError`s at runtime because of missing dependencies. Or spent hours and days trying to track down irreproducible bugs in your production environment, just to find out that somehow two versions of a 3rd party dependency have managed to sneak into your classpath. 
Most of those issues originate from the fact that applications written in Java 8 or below do not know about their own dependecies. Sure - `javac` won't compile our code if any compile-time dependencies are missing, and of course we have build tools and IDEs to support us with those. However at runtime, the JVM needs to lookup required classes in the classpath again, in some cases resulting in different classes being loaded by the classloader. When these things happen, they usually do during runtime. Ouch. And more often than not, tracking them down is a painful experience.

Time to get rid of those nasty surprises and replace the classpath with the module path.

## What is a Java 9 Module?
Basically, a module is nothing more than a good old JAR file, compiled from good old Java files. But there is one crucial difference: one of the files is called `module-info.java`. As the name suggests, it declares our module. It defines

* the unique name of our module
* which other modules our module depends on
* which packages are to be exported to be used by other modules

## Module Types

Let's start with a short introduction on different module types.

### Application Modules
Also referred to as "Named Application Modules". This is what we are going to create. A lot of our third party dependencies will also be application modules. As soon as their creators finished migration and published their library as a module, we can start referencing them in our module declaration and put them onto our module path. 

But wait - do we actually need to wait for all those third party libraries to be modularized before we can get started with Java 9 modules? And what about legacy dependencies?

### Automatic Modules
Of course, we need a way to migrate our applications even if they depend on libraries that have not been published as a module yet. Automatic modules to the rescue! Any JAR on the module path without module descriptor ends up as an automatic module, allowing your Java 9 project to use pre-Java-9 libraries. Automatic modules implicitly export all their packages and read all other modules. Since an automatic module does not declare a name, JDK generates one depending on the JAR filename. Basically, it will remove the file extension and the trailing version number (if any), and replace all non-alphanumeric characters by dots, e.g. the file `mongo-java-driver-3.3.0.jar` will end up as module named `mongo.java.driver` (the exact algorithm is described in the [documentation of ModuleFinder]. Every module that `requires mongo.java.driver` has access to all of its packages. Automatic modules in turn can access all other modules, including the unnamed module.

### The Unnamed Module
Wait! The classpath is not completely gone yet. All JARs (modular or not) and classes on the *classpath* will be contained in the Unnamed Module. Similar to automatic modules, it exports all packages and reads all other modules. But it does not have a name, obviously. For that reason, it cannot be required and read by named application modules. The unnamed module in turn can access all other modules.

### Platform modules
Last but not least, the JDK itself has been migrated into a modular structure, too. All the basic Java feature we use will be provided by different modules, e.g. `java.xml`, `java.logging`, or [`java.httpclient`]. The most basic API is provided by `java.base`, any module depends on it implicitly.

### Overview: which JAR goes where?
Just a short recap on how your JAR ends up in the module system:

|                     | **`--module-path`**    | **`--classpath`**  |
| **Modular JAR**     | application module   | unnamed module   |
| **Non-Modular JAR** | automatic module     | unnamed module   |

### Overview: module readability

| **Module type**                 | **Origin** | **Exports packages** | **Can read modules** | 
|---------------------------------|------------|----------------------|-----|----------------|
| **(Named) Platform Modules**    | provided by JDK|explicitly||
| **(Named) Application Modules** | any JAR *containing*<br>`module-info.class`<br>on the *module path*|explicitly|Platform<br>Application<br>Automatic |
| **Automatic Modules**           | any JAR *without*<br>`module-info.class`<br>on the *module path*|all|Platform<br>Application<br>Automatic<br>Unnamed|
| **Unnamed Module**              |all JARs and classes<br>on the *classpath*|all|Platform<br>Automatic<br>Application|


## How to declare a Java 9 module
While it is basically as easy as adding a module declarator (`module-info.java`), there are some best practices we should consider. The following snippets are taken from our simple [Java 9 Modules Example with Maven and JUnit]. It might be helpful to have a deeper look at the snippets in context and see the modules in action.

### Module name
It is recommended to use the reverse-domain-pattern for module names, just like we name packages, e.g. `de.consol.devday`

### Directory structure
The name of the directory containing a module's sources should be equal to the name of the module, e.g. for `de.consol.devday.service` we might end up with a structure like this:

<pre>
src
+- main
   +- <strong>de.consol.devday.service</strong>
      +- module-info.java
      +- de
         +- consol
            +- devday
               +- service
                  +- EventService.java
</pre>

So our sources root would be the directory named `de.consol.devday.service`, which contains the package hierarchy `de.consol.devday.service`. While having module names and package references looking exactly the same may seem confusing at first, I hope we will get used to it. Let's just keep in mind that the module name can technically be totally different from our package hierarchy. In most cases, it will match a part of the package path it contains.

### Module declaration file
You probably noticed the `module-info.java` file in the directory structure above. This is the module declarator, the most basic module declaration looks like this:

<pre>
<strong>module de.consol.devday.service</strong> {
}
</pre>

So far, our module simply declares the module name to be `de.consol.devday.service`. As we want our module to publish our service to other modules, let's export some functionality.

#### Exporting packages

<pre>
module de.consol.devday.service {
    <strong>exports de.consol.devday.service;</strong>
}
</pre>

While this allows other modules to read everything in package `de.consol.devday.service`, all sub-packages remain concealed, e.g. `de.consol.devday.service.impl`, we would need to export those separately.
Note aside: if we wanted to share a package with another specific module, but not with the rest of the outside world, we could simply do that by using a qualified export: `exports de.consol.devday.service.impl to de.consol.devday.admin;` 

#### Reading other modules

More often than not, our modules will also have dependencies on platform modules and other application modules. A dependency is declared with the keyword `requires`. Imagine a second module `de.consol.devday` which needs to consume the service we exported above:

<pre>
module de.consol.devday {
    <strong>requires de.consol.devday.service;</strong>
}
</pre>

Note that `requires` always references a module name, not a package. The statement above allows our module to use whatever the `de.consol.devday.service` module exports, but the service will not be available for other modules requiring our module. If we wanted to make it available to other modules as a transitive dependency, we could use `requires transitive`. But beware: this should only be done if a module's public API actually depends on it, e.g. if it uses a class from `de.consol.devday.service` in an exported method signature.

So far, we have learned how Java 9 modules enable us to have **strong encapsulation** by letting us distinctly declare which packages to export and which ones to keep internal. We also saw how specifying explicit dependencies to other modules provides a **reliable configuration** for our modules. Looks nice on the first glimpse, right? But are we doomed to compose a modular dependency hell, with all modules being tightly coupled to each other? Definitely not, the module system offers a way to couple services loosely.


#### Using Services with the `ServiceLoader`

Imagine we don't want the `de.consol.devday` module to know about the actual implementation of the service it consumes. We can refactor `de.consol.devday.service` to only provide a service interface, and move the implementation to a separate module `de.consol.devday.talk.service`.

Let's say our interface is called `de.consol.devday.service.EventService`. Other modules can provide an implementation by enhancing their module declaration.

<pre>
module de.consol.devday.talk.service {
    requires de.consol.devday.service;
    exports de.consol.devday.talk.service;
    <strong>provides de.consol.devday.service.EventService
        with de.consol.devday.talk.service.TalkService;</strong>
}
</pre>

The consuming module (in our case `de.consol.devday`) can register as a consumer of a service by applying the `uses` keyword together with the full-qualified name of the interface.

<pre>
module de.consol.devday {
    requires de.consol.devday.service;
    <strong>uses de.consol.devday.service.EventService;</strong>
}
</pre>

Voilà. The module does not know anything about the implementation of `EventService`, nor does it need know about the module that provides it. Using the service is quite straightforward:

<pre>
<strong>ServiceLoader.load(EventService.class)</strong>
</pre>

The call to `ServiceLoader.load(Class<T>)` returns an `Iterable<T>`, containing all service implementations of a given interface that are being offered by modules on the modulepath using the `provides ... with ...` statement.

## Conclusion

We saw how Java 9 is an enabler to structure our code in a more modular way by providing **strong encapsulation** and **reliable configuration**, but still allows **loose coupling** of modules. These are very promising aspects. If you have ever been in Classloader Hell, it seems reasonable to hope for better times. On the other hand, some folks might tend to over-engineer modularity. Anyway, there will definitely be people complaining about Module Hell, if only for the joke. We will be wiser when more and more applications migrate to Java 9. Stay tuned, and share you experiences.

[JDK 9 is feature complete]: https://twitter.com/mreinhold/status/822209640037425154
[documentation of ModuleFinder]: http://download.java.net/java/jigsaw/docs/api/java/lang/module/ModuleFinder.html#of-java.nio.file.Path...-
[Java 9 Modules Example with Maven and JUnit]: https://github.com/ConSol/java9-modules-maven-junit-example
[`java.httpclient`]: /development/2017/03/14/getting-started-with-java9-httpclient.html