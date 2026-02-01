---
layout: post_with_author_link
title: Introduction to Spring Boot and GraphQL for API Design
meta_description: writing API's with Spring Boot and GraphQL  
author: Andy Degenkolbe
author_url: https://twitter.com/andy_degenkolbe
featured_image: graphql_spring_boot_part1.png
categories:
- development
tags:
- SpringBoot
- GraphQL
- API
- API Transformation
date: '2019-05-02T00:00:00+00:00'
---
<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="graphql_spring_boot_part1.png"></div>

GraphQL is a nice way to publish a highly customizable API. In combination with Spring Boot, which makes development really easy and offers features like database integration and security, you can quickly build your API service from scratch.
This is the start of a series from articles showing you the way to a Spring Boot powered REST-Service with an API running Spring Boot and Graphql.   
<!--more-->

## Introduction

As it seems that I always tend to jump on the last wagon of a hype train, I finally discovered GraphQL for a customer project. The task was to implement a lightweight solution to query data from an existing database via web techniques.We wanted to use the data in some simple sort of smoke test implemented as a bash script using curl. So what we actually wanted were some fields (sometimes only one) from a single database table. We could totally do this with an REST Endpoint by getting the whole entity and only use the fields we were interested in, but this would have lead to some tricky stuff e.g using sed or other tools to extract the data from the curl response.
That in mind I looked for some other solution and after a tip from a colleague I landed on the website of GraphQL.

In this upcoming series of articles I will introduce you to GraphQL in combination with Spring Boot. First we have look at the basic concepts, comparing REST to GraphQL and looking at the Spring Boot Project and its mechanisms.
Later on we will create a REST Webservice based on Spring Boot, which we will transform from a REST API to an GraphQL one, looking at the benefits we get.

## What is GraphQL and why should I use it ?

GraphQL is a technique developed by Facebook in 2012 as an alternative to REST and other web service techniques used by major projects like Facebook, Github or Pinterest. Other than REST, the client can chose which data fields should be returned. This can be done within the request. Therefore no unnecessary data is sent, which can reduce the dataflow significantly. This makes GraphQL a good choice when mobile devices are expected service consumers.

GraphQL is a strongly typed runtime that defines common datatypes, e.g. `String` and `Integer` and other primitives. Additionally, you can define your own datatypes containing types already defined by GraphQL or one of your own. So you can create complex nested objects and you are not limited to one *resource* like in REST.

Where REST typically defines multiple endpoints (each for one resource and operation), GraphQL defines a single endpoint. Furthermore you don’t have HTTP verbs like *GET*, *POST*, *DELETE* etc., but a separation in Queries and Mutations.
Queries are all operations that do not change any server state. All other operations are implemented as mutations.
As stated before, within all these operations the client can decide which data should be obtained or edited (as we see in upcoming articles). Just to get an understanding how a query looks like,  take a look at this snippet:
```
{
  exampleQuery {
    firstField,
    secondeField,
    ....
  }
}
```
Even when Queries looks a bit like SQL, GraphQL should not be used to serve as a web frontend for your Database. Like for all other techniques, API Designers should decouple internal data structure from structures accessible by clients. Otherwise, a change in internal structures is merely possible.

Mutations looks very similar to queries:
```
mutation{
  mutationForCreatingNewEntry(attributeName:"value",....) {
    id
  }
}
```

Looking at the code above you see that you have to tell the endpoint that you want to execute a mutation. This statement is followed by the name of the mutation, including the argument list. Thereby you have to define the name of the parameter you want to set, followed by the desired value.
Within the curly brackets you can define what should be returned after the mutation is executed. In this case we only return the id of the new added entity, but we could also return the other fields.

The examples above are only simple ones. For more sophisticated queries and mutations have a look at GraphQL Website or wait for the next articles in this series to be published.

## What is Spring Boot?

Even if you never heard of Spring Boot, you might have heard of the Spring Framework.
Spring is a Java framework for creating enterprise applications with all the features you need to get the job done. Developed by Pivotal, the framework consists of several subprojects, each of them targeting a single aspect of enterprise applications:

* Spring Security, providing features for Authentication and Authorization
* Spring MVC, for creating applications implementing the MVC pattern (often used for web applications)
* Spring Webservices, for implementing REST or SOAP Webservices
* Spring Data, offering features of object relational mapping and support for JPA
* Spring LDAP for connecting the application to an LDAP for User handling
* etc.

There are more projects, like Spring Integration for integration projects. You can find an overview of all projects [here](https://spring.io/projects).

To use Spring, you normally have to create a new Spring Application from scratch, meaning that you have to define your build file and managing all your dependencies.
After creating the project, you have to get your configuration done, eg. create your security configuration, register your components etc.
This is where Spring Boot jumps in. It is some kind of a boost for Spring based projects by making it easy to create standalone and self-contained services based on Spring Technology. 

On one hand this is done by using the concept of **Starters**. 

>Spring Boot Starters are a set of convenient dependency descriptors that you can include in your application. 
You get a one-stop-shop for all the Spring and related technology that you need without having to hunt through sample code and copy paste loads of dependency descriptors. 
For example, if you want to get started using Spring and JPA for database access just include the spring-boot-starter-data-jpa dependency in your project, and you are good to go.
>
>> <cite>[https://github.com/spring-projects/spring-boot/tree/master/spring-boot-project/spring-boot-starters](https://github.com/spring-projects/spring-boot/tree/master/spring-boot-project/spring-boot-starters)</cite> 

Starters are a concept for dependency management. Every starter defines dependencies for the functionality they contribute to the application.
You can say, starters are the building blocks of your Spring Boot application, removing the ease for configuring the dependencies etc. which are usually needed when you are doing a spring application from scratch by your own.

The second aspect making Spring Boot a booster is the feature of *AutoConfiguration*. Spring Boot configures the necessary properties to default values applicable for most spring applications, which makes it much easier for novice users starting to work with the spring framework.
It follows the paradigm of *Convention over configuration*. This means that you have to stick to some conventions (eg. nameming) and Spring Boot will handle the necessary configurations for you.

We will see starters and the setup of the project in the 2nd part of this series when we start with our Spring Boot powered REST-Service.

To start a Spring Boot Project you can also create a new one from scratch or use a service powered by Pivotal to generate your build file for maven and gradle including all dependencies needed by your application.
The service can be found under [initializr service](https://start.spring.io/).
All you have to do is to select your desired version of Spring Boot and adding the necessary starters for the features your application needs. 
  
## Summary
In this first article we had a first look at GraphQL and its features. We also discussed in what scenarios GraphQL can help you to solve your problems or get a better API design.
Furthermore, we looked at the Spring Framework and Spring Boot to see where it can help us getting started with a new project.

Wait for the upcoming articles to get a closer look at how the implementation is done and how both Graphql and Spring Boot interact.
## Sources

* [https://www.howtographql.com](https://www.howtographql.com)
* [https://en.wikipedia.org/wiki/GraphQL](https://en.wikipedia.org/wiki/GraphQL)
* [https://graphql.org/](https://graphql.org/)
* [https://github.com/facebook/graphql](https://github.com/facebook/graphql)
* [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
* [https://www.graphql.com/articles/4-years-of-graphql-lee-byron](https://www.graphql.com/articles/4-years-of-graphql-lee-byron)
* [https://github.com/spring-projects/spring-boot/tree/master/spring-boot-project/spring-boot-starters](https://github.com/spring-projects/spring-boot/tree/master/spring-boot-project/spring-boot-starters)
