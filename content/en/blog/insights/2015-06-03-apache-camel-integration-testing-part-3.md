---
layout: post
status: publish
title: Apache Camel integration testing - Part 3
date: '2015-06-03'
author: Christoph
categories:
- Citrus
- development
tags:
- Citrus
comments: []
---
In this post I will continue with the Apache Camel integration testing scenario that we have worked on in [part one](/blog/2014/11/21/testing-apache-camel-part-1) and [part two](/blog/2015/05/28/apache-camel-integration-testing-part-2/) of this series.
This time we focus on exception handling in Camel routes. First of all let's add exception handling to our Camel route.
<!--more-->

{% highlight xml %}
<camelContext id="camelContext" xmlns="http://camel.apache.org/schema/spring">
  <route id="helloRoute">
    <from uri="direct:hello"/>
    <to uri="seda:sayHello" pattern="InOut"/>
    <onException>
      <exception>com.consol.citrus.exceptions.CitrusRuntimeException</exception>
      <to uri="seda:errors"/>
    </onException>
  </route>
</camelContext>
{% endhighlight %}

Camel supports exception handling on specific exception types. The *onException* route logic is executed when the defined exception type was raised during message processing. In the sample route we call a separate Seda endpoint *seda:errors* for further exception handling. The challenge for our test scenario is obvious. We need to force this error handling and we need to make sure that the Seda endpoint *seda:errors* has been called accordingly.

Let's add the error handling endpoint to the Citrus Spring bean configuration.
{% highlight xml %}
<citrus-camel:sync-endpoint id="sedaErrorHandlingEndpoint"
                       camel-context="camelContext"
                       endpoint-uri="seda:errors"/>
{% endhighlight %}

The static endpoint definition is not mandatory as Citrus is also able to work with dynamic endpoints. In our case the dynamic endpoint for consuming messages on the *seda:errors* endpoint would simply be *camel:sync:seda:errors*. The decision which kind of endpoint someone should use depends on how much the endpoint could be reused throughout multiple test scenarios. Of course static endpoints are highly reusable in different test cases. On the downside we have to manage the additional configuration burden. In this post I will use the static endpoint that is injected to the test case via Spring's autowiring mechanism.
Let's write the integration test.

{% highlight java %}
package com.consol.citrus.hello;

import com.consol.citrus.dsl.TestNGCitrusTestBuilder;
import com.consol.citrus.dsl.annotations.CitrusTest;
import com.consol.citrus.endpoint.Endpoint;
import org.testng.annotations.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

@Test
public class SayHelloTest extends TestNGCitrusTestBuilder {

<pre><code>@Autowired
@Qualifier("directHelloEndpoint")
private Endpoint directHelloEndpoint;

@Autowired
@Qualifier("sedaHelloEndpoint")
private Endpoint sedaHelloEndpoint;

@Autowired
@Qualifier("sedaErrorHandlingEndpoint")
private Endpoint sedaErrorHandlingEndpoint;

@CitrusTest(name = "SayHello_Error_Test")
public void sayHello_Error_Test() {
    send(directHelloEndpoint)
        .fork(true)
        .messageType(MessageType.PLAINTEXT)
        .payload("Hello Citrus!");

    receive(sedaHelloEndpoint)
        .messageType(MessageType.PLAINTEXT)
        .payload("Hello Citrus!");

    sleep(500L);

    send(sedaHelloEndpoint)
        .messageType(MessageType.PLAINTEXT)
        .payload("Something went wrong!")
        .header("citrus_camel_exchange_exception",
                "com.consol.citrus.exceptions.CitrusRuntimeException")
        .header("citrus_camel_exchange_exception_message",
                "Something went wrong!");

    receive(sedaErrorHandlingEndpoint)
        .messageType(MessageType.PLAINTEXT)
        .payload("Something went wrong!")
        .header("CamelExceptionCaught",
            "com.consol.citrus.exceptions.CitrusRuntimeException: Something went wrong!");

    send(sedaErrorHandlingEndpoint)
        .messageType(MessageType.PLAINTEXT)
        .payload("Hello after error!");

    receive(directHelloEndpoint)
        .messageType(MessageType.PLAINTEXT)
        .payload("Hello after error!");
}
{% endhighlight %}

The magic happens when Citrus sends back a synchronous response on the *seda:sayHello* endpoint which is done right after the sleep action in our sample test.
Instead of responding with a usual plain text message we add special header values **citrus_camel_exchange_exception** and **citrus_camel_exchange_exception_message**.

{% highlight java %}
send(sedaHelloEndpoint)
    .messageType(MessageType.PLAINTEXT)
    .payload("Something went wrong!")
    .header("citrus_camel_exchange_exception",
            "com.consol.citrus.exceptions.CitrusRuntimeException")
    .header("citrus_camel_exchange_exception_message",
            "Something went wrong!");
{% endhighlight %}

These special Citrus headers instruct the Citrus Camel endpoint to raise an exception. We are able to specify the exception type as well as the exception message. As a result the Citrus endpoint raises the exception on the Camel exchange which should force the exception handling in our Camel route.
The route *onException* block in our example should send the error to the *seda:errors* endpoint. So let's consume this message in a next test step.

{% highlight java %}
receive(sedaErrorHandlingEndpoint)
    .messageType(MessageType.PLAINTEXT)
    .payload("Something went wrong!")
    .header("CamelExceptionCaught",
        "com.consol.citrus.exceptions.CitrusRuntimeException: Something went wrong!");
{% endhighlight %}

With this receive action on the error endpoint we intend to validate that the exception handling was done as expected. We are able to check the error message payload and in addition to that we have access to the Camel internal message headers that indicate the exception handling. Both message payload and message headers are compared to expected values in Citrus.
As a next test step we should provide a proper response message that is used as fallback response. The response is sent back as synchronous response on the *seda:errors* endpoint saying *Hello after error!*.
The Camel *onException* block and in detail the default Camel error handler will use this message as final result of the route logic. So finally in our test we can receive the fallback response message as result of our initial direct *direct:hello* request.
This completes this simple test scenario. We raised an exception and forced the Camel route to perform proper exception handling. With the Citrus endpoints in duty we received the error message and provided a fallback response message which is used as final result of the Camel route.
Error handling in message based enterprise integration scenarios is complex. We need to deal with delivery timeouts, retry strategies and proper transaction handling. This post only showed the top of the iceberg but I hope you got the idea of how to set up automated integration tests with Apache Camel routes. The [Citrus framework](http://www.citrusframework.org) is focused on providing real message endpoints no matter of what kind or nature (Http, JMS, REST, SOAP, Ftp, XML, JSON, Seda and so on). What we get is automated integration testing with real messages being exchanged on different transports and endpoints.
