---
author: Christoph Deppisch
date: '2010-05-19T15:47:29+00:00'
excerpt: This post illustrates the support for SOAP-ENV:mustUnderstand headers in
  Citrus WebService simulation
slug: soap-mustunderstand
tags:
- Citrus
title: Citrus with SOAP-ENV:mustUnderstand headers
---

By setting the SOAP mustUnderstand header attribute to "1", you indicate that the service provider must process the SOAP header entry. In case the service provider is not able to handle this special header a SOAP fault server error is sent back to the calling client. In this post I would like to point out an easy way to support these mustUnderstand headers when simulating SOAP WebServices with Citrus.

<!--more-->
This sample SOAP request header contains some mustUnderstand header entries:

```xml
<SOAP-ENV:Header xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" >
  <com:UserID
      xmlns:com="http://www.consol.com/soap-mustunderstand"
      SOAP-ENV:mustUnderstand="1">123456789</com:UserID>
</SOAP-ENV-Header>
```

The service provider respectively the Citrus SOAP server simulation has to handle this UserID. Otherwise the client request can not succeed and is responded with SOAPFault.

Citrus uses the <a href="http://static.springsource.org/spring-ws/sites/1.5/index.html">SpringWS</a> project to provide SOAP WebServices endpoints for clients. In SpringWS you are able to add interceptors to the request processing chain in order to support SOAP-ENV:mustUnderstand headers. In this example we add the interceptors directly to the endpoint mapping in the Spring application context.

```xml
<!-- Logging interceptor -->
<bean id="loggingInterceptor" class="org.springframework.ws.server.endpoint.interceptor.PayloadLoggingInterceptor"/>

<!-- Special soap endpoint interceptor that accepts our must-understand headers -->
<bean id="soapMustUnderstandEndpointInterceptor" class="com.consol.ws.sample.SimpleMustUnderstandEndpointInterceptor"/>

<!-- Payload endpoint mapping -->
<bean id="payloadMapping" class="org.springframework.ws.server.endpoint.mapping.PayloadRootQNameEndpointMapping">
    <property name="defaultEndpoint" ref="defaultServiceEndpoint"/>
    <property name="interceptors">
        <list>
            <ref bean="loggingInterceptor"/>
            <ref bean="soapMustUnderstandEndpointInterceptor"/>
        </list>
    </property>
</bean>
```

We have added Spring's payload logging interceptor and a custom SimpleMustUnderstandEndpointInterceptor. Let us have a closer look at the custom endpoint interceptor implementation:

```java
public class SimpleMustUnderstandEndpointInterceptor implements SoapEndpointInterceptor {
    private final String SAMPLE_NS = "http://www.consol.com/soap-mustunderstand";

    @Override
    public boolean understands(SoapHeaderElement header) {
        if(header.getName().getNamespaceURI().equals(SAMPLE_NS) &&
            header.getName().getLocalPart().equals("UserID")) {
                return true;
        }

        return false;
    }

    [...]
}
```

SpringWS automatically raises SOAP server faults in case we do not handle a SOAP-ENV:mustUnderstand header in the interceptor chain. Fortunately we explicitly accept the UserID SOAP header in the interceptor implementation with the understands() method returning "true" in that case. With this SOAP endpoint interceptor we are able to support mustUnderstand headers in Citrus WebService endpoints.

Citrus also offers a default interceptor implementation which handles mustUnderstand headers with a simple configuration. Just add the interceptor to the request processing and you will not have to implement the interceptor on your own.

```xml
<!-- Special soap endpoint interceptor that accepts our must-understand headers -->
<bean id="soapMustUnderstandEndpointInterceptor" class="com.consol.citrus.ws.interceptor.SoapMustUnderstandEndpointInterceptor">
  <property name="acceptedHeaders">
     <list>
         <value>{http://www.consol.com/soap-mustunderstand}UserID</value>
     </list>
  </property>
</bean>
```