---
author: Christoph Deppisch
date: '2009-12-18T09:10:11+00:00'
slug: performance-testing-with-citrus
tags:
- Citrus
title: Performance testing with Citrus
---

Once you have written Citrus integration tests it would be nice to also use these test scenarios for performance testing. In a recent project we accomplished basic performance tests just using some out-of-the-box features in <a href="http://www.testng.org/" target="_blank" title="TestNG">TestNG</a>. In this post I would like to share a simple example with you regarding performance testing in Citrus.

<!--more-->
First of all some words about our test scenario. We are testing a request/response SOAP WebService with Citrus. We have already written a test case that calls the WebService as a client and receives the response for validation, very simple. Now we intend to execute this test case several times and multi threaded to simulate a high load scenario. Every test case in Citrus generates a TestNG Java test class for its execution. With TestNG we are able to execute the test multiple times with a certain amount of threads. All we need to do is adjust the TestNG annotations in Java. Have a look at the modified code:

```java
public class IT_SimpleSOAP_OK_1_Test extends AbstractTestNGCitrusTest {
    @Test(invocationCount = 1000, threadPoolSize = 25)
    public void simpleSOAP_OK_1_Test(ITestContext testContext) {
        executeTest(testContext);
    }
}
```

Our Citrus test case now runs 1000 times using 25 threads (invocationCount = 1000, threadPoolSize = 25). TestNG takes care about creating the Java threads and iterating the test execution. But, unfortunately we are not done yet.

We have to think about the fact that the test cases now run simultaneously. This means that we should use randomized identifiers inside the test. Citrus functions in combination with variables can help you to randomize your test case:

```xml
<variables>
    <variable name="orderId" value="citrus:randomNumber(10)"/>
    <variable name="trackingId" value="citrus:concat('Tx', citrus:randomString(10, UPPERCASE))"/>
    <variable name="customerId" value="citrus:randomNumber(10)"/>
</variables>
```

Now the tests work on different identifiers, which helps to take our next step: the message correlation. As the test cases run simultaneously the test instances might 'steal' reply messages from each other. This leads to failing validation steps inside the test case, because identifiers do not match. But Citrus can use reply message correlation here to avoid this message shuffling.

The WebService message sender in the Citrus ApplicationContext receives a ReplyMessageCorrelator bean:

```xml
<bean id="replyMessageCorrelator" class="com.consol.citrus.message.DefaultReplyMessageCorrelator"/>

<citrus-ws:message-sender id="simpleWebServiceRequestSender"
                              request-url="http://localhost:8081"
                              reply-handler="webServiceReplyHandler"
                              reply-message-correlator="replyMessageCorrelator"
                              message-factory="saajMessageFactory"/>

<citrus-ws:reply-message-handler id="simpleWebServiceReplyHandler"/>
```

Inside the test case we save the message id when sending the SOAP WebService request:

```xml
<send with="simpleWebServiceRequestSender">
    <message>
        <data><![CDATA[	... ]]></data>
    </message>
    <extract>
        <header name="springintegration_id" variable="messageCorrelationId"></header>
    </extract>
</send>

<receive with="simpleWebServiceReplyHandler">
    <selector>
        <element name="springintegration_id" value="${messageCorrelationId}"/>
    </selector>
    <message>
        <data><![CDATA[ ... ]]></data>
    </message>
</receive>
```

The message receiver selects messages according to the message correlation id. This ensures that every test case receives the proper WebService reply message.

If you keep these correlation and randomization issues in mind you will be able to use Citrus tests in multi threaded scenarios. With TestNG annotations it is very easy to execute a Citrus test case several times. TestNG offers more features according multi threading and test iteration (<a href="http://testng.org/doc/documentation-main.html#parallel-running">http://testng.org</a>). You can instruct TestNG to run test cases on method, class and test level with separate threads. In general parallel test execution leads to faster test runs and creates more effective test scenarios as the system under test may handle different use cases at the same time.

The performance testing we just described is of basic nature. We have to consider that the load is created by a single Citrus instance. Furthermore Citrus will validate all incoming messages by default, which affects the general throughputs to certain extend. So keep this in mind when drawing conclusions for your projects throughput. However Citrus gives you the opportunity to create performance test scenarios very fast, as we can use existing Citrus test cases.