---
author: Christoph Deppisch
date: '2011-01-26T10:32:12+00:00'
slug: citrus-1-2-m1-released
tags:
- Citrus
title: Citrus 1.2.M1 released
---

We are very happy to announce the first milestone release of Citrus 1.2 in early 2011. The framework comes with great new features and many improvements to you. This post gives a short overview of the major changes, hope you enjoy the new features:

<!--more-->

<strong>New Groovy features</strong>

Citrus extended the possibilities to work with script languages like Groovy. You can use Groovy's MarkupBuilder to create XML message payloads. Your Groovy code goes right into the test case or comes from external file resource. With MarkupBuilder you are no longer bound to the XML message syntax with the typical overhead in writing code. The markup builder generates fully qualified XML message payloads and you can just focus on the pure message content and strike off the XML pain. Here is a small example for you:

```xml
<send with="helloRequestSender">
    <message>
        <builder type="groovy">
            markupBuilder.HelloRequest(xmlns: 'http://www.consol.de/hello.xsd'){
                MessageId('${messageId}')
                CorrelationId('${correlationId}')
                User('${user}')
                Text('Hello TestFramework')
            }
        </builder>
    </message>
</send>
```

A further Groovy feature goes to the validation capabilities. Instead of working with XML DOM tree comparison and XPath expression validation you can use Groovy XMLSlurper. Very useful for those of you who need to do complex message validation and do not like the XML/XPath syntax very much. With XMLSlurper you can access the XML DOM tree via named operations and assertions. As usual a small example should give you the idea:

```xml
<receive with="helloResponseReceiver">
    <message>
        <validate>
            <script type="groovy">
              assert root.children().size() == 4
              assert root.MessageId.text() == '${messageId}'
              assert root.CorrelationId.text() == '${correlationId}'
              assert root.User.text() == 'HelloService'
              assert root.Text.text() == 'Hello ' + context.getVariable("user")
            </script>
        </validate>
    </message>
</receive>
```

Last but definitely not least we added Groovy support in SQL result set validation. The script code is able to access the rows and columns with Groovy's out-of-the-box list and map handling. So multi-row data set validation becomes very ease.

```xml
<sql datasource="testDataSource">
    <statement>select WEEKDAY from WEEK</statement>
    <validate-script type="groovy">
        assert rows.size == 7
        assert rows[0].WEEKDAY == 'Monday'
        assert rows[2].WEEKDAY == 'Wednesday'
    </validate-script>
</sql>
```

<strong>SQL multi-line result set validation</strong>

For those of you who rather stick with conventional SQL validation than use the fancy Groovy stuff we added multi-row result set validation, too. Here is a sample test code for multi-row validation.

```xml
<sql datasource="testDataSource">
    <statement>select WEEKDAY from WEEK</statement>
    <validate column="WEEKDAY">
	<values>
		<value>Monday</value>
		<value>Tuesday</value>
                <value>@ignore@</value>
                <value>Thursday</value>
                <value>Friday</value>
                <value>@ignore@</value>
                <value>@ignore@</value>
	</values>            	
    </validate>
</sql>
```

<strong>Extended message format support</strong>

In previous versions Citrus was primary designed to handle XML message payloads. With this new release Citrus is also able to work with other message formats such as JSON, CSV, PLAINTEXT. This applies to sending messages as well as receiving and particularly validating message payloads. The tester can have different message validators for each message format. According to the message format the proper validator is chosen to perform the message validation.

We have implemented a JSON message validator capable of ignoring specific JSON entries and handling JSONArrays as well as nested JSONObjects. We also provide a plain text message validator which is very basic to be honest. The framework is ready to receive new validator implementations and you can add custom validators very easy.

<strong>New XML features</strong>

XML namespace handling is tedious especially if you have to deal with a lot of XPath expressions in your tests. In the past you had to specify a namespace context for each XPath expression you use in your test - now you can have a central namespace context. This central context declares namespaces you use in your project. These namespaces identified by some prefix are available throughout all test cases which is much more maintainable and simplifies your XPath testing a lot.

<strong>SOAP support improvements</strong>

WsAddressing standard is now supported in Citrus. This means you can declare the specific ws-addressing message headers on message sender level. The header is constructed automatically for all SOAP messages sent with this message sender.

```xml
<citrus-ws:message-sender id="helloRequestSender"
                          request-url="http://localhost:8080/hello"
                          reply-handler="helloReplyHandler"
                          addressing-headers="wsAddressing200408"/>

<bean id="wsAddressing200408" class="com.consol.citrus.ws.addressing.WsAddressingHeaders">
    <property name="version" value="VERSION200408"/>
    <property name="action" value="sayHello"/>
    <property name="to" value="urn:CitrusHelloServer"/>
    <property name="from">
        <bean class="org.springframework.ws.soap.addressing.core.EndpointReference">
            <constructor-arg value="urn:CitrusClient"/>
        </bean>
    </property>
    <property name="replyTo">
        <bean class="org.springframework.ws.soap.addressing.core.EndpointReference">
            <constructor-arg value="urn:CitrusClient"/>
        </bean>
    </property>
    <property name="faultTo">
        <bean class="org.springframework.ws.soap.addressing.core.EndpointReference">
            <constructor-arg value="urn:ClientFaultResolver"/>
        </bean>
    </property>
</bean>
```

Another helpful SOAP extension comes with the dynamic endpoint uri resolver. It enables you to dynamically address SOAP endpoints during a test. Sometimes a message sender may dynamically have to change the SOAP url for each call (e.g. address different request uri parts). With the endpoint uri resolver added to the message sender you can handle this requirement very easy.

<strong>Bugfixes</strong>

As usual we have some bugs fixed during the daily work. So we are proud that we have found some issues and resolved them to make the framework a little bit better. For detailed bugfix listings refer to the complete changes log.

<strong>Upgrading from version 1.1</strong>

If you are coming from Citrus 1.1 final you may have to look at the following points.

<ul>
	<li>Renamed packages and classes: We try to keep rename operations to a minimum, as we know that this may cause some adjustments in your code that directly uses the Citrus classes. But sometimes names do change in order to reach consistency and avoid cyclic dependencies. So with this release some classes have moved some were renamed. This mostly applies to the validation classes as we have changed the model here in order to enable validation of message formats other than pure XML.</li>

	<li>Message validator: You need to specify at least one message validator in the citrus-context.xml. Before this was internally a static XML message validator, but now we offer different validators for several message formats like XML and JSON. Please see the Java API doc on MessageValidator interface for available implementations. If you just like to keep it as it was before add this bean to the citrus-context.xml:
      ```xml
<bean id="xmlMessageValidator" class="com.consol.citrus.validation.xml.DomXmlMessageValidator"/>
```</li>

	<li>JUnit vs. TestNG: We support both famous unit testing frameworks JUnit and TestNG. With this release you are free to choose your prefered one. In this manner you need to add either a JUnit dependency or a TestNG dependency to your project on your own. We do not have static dependencies in our Maven POM to neither of those two. On our side these dependencies are declared optional so you feel free to add the one you like best to your Maven POM. Just add a JUnit or TestNG dependency to your Maven project or add the respective jar file to your project if you use ANT instead.</li>
</ul>

I hope you enjoy the new features added in this milestone release. And there are more changes and improvements on our way to version 1.2, so be prepared.