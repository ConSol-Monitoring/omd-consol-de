---
author: Christoph Deppisch
date: '2010-01-18T21:43:46+00:00'
slug: customizing-meta-information
tags:
- Citrus
title: Customizing meta information
---

Test cases in Citrus are usually provided with some meta information like the author's name or the date of creation. This post shows how to extend on this to include your very specific meta data on your own.

<!--more-->
Meta-data that comes shipped with Citrus looks like

```xml
<testcase name="PwdChange_OK_1_Test">
    <meta-info>
        <author>Christoph</author>
        <creationdate>2010-01-18</creationdate>
        <status>FINAL</status>
        <last-updated-by>Christoph</last-updated-by>
        <last-updated-on>2010-01-18T15:00:00</last-updated-on>
    </meta-info>

    [...]
</testcase>
```

However there may be some additional data needed to meet your individual testing strategy. Therefore you can extend the meta-info section at the very beginning of a test case very easily. Let me use a simple example to show how it is done.

First of all we define our custom meta information elements in a XML schema:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema"
        xmlns:tns="http://www.citrusframework.org/samples/my-testcase-info"
        targetNamespace="http://www.citrusframework.org/samples/my-testcase-info"
        elementFormDefault="qualified">

    <element name="requirement" type="string"/>
    <element name="pre-condition" type="string"/>
    <element name="result" type="string"/>
    <element name="classification" type="string"/>
</schema>
```

The schema declares four simple elements (requirement, pre-condition, result and classification) all typed as string. Later we want to add those elements as children to the meta-info element in the test case. But before we can do that let us add the new xsd schema to our project. As I use a Maven project layout the schema file goes to "src/main/resources/com/consol/citrus/schemas/my-testcase-info.xsd".

Next thing we need to do is to announce the new schema to Spring. A Citrus test case is nothing else but a simple Spring configuration file with customized XML schema support. Therefore Spring needs to know our XML schema while parsing the test case configuration file. So we add the spring.schemas file to following location in our project: src/main/resources/META-INF/spring.schemas

The file maps virtual schema locations to the actual xsd locations in our project. The file content for our example will look like follows:

<pre>
http\://www.citrusframework.org/samples/my-testcase-info/my-testcase-info.xsd=com/consol/citrus/schemas/my-testcase-info.xsd
</pre>

So now we are finally ready to use the new meta-info elements inside the test case. Note: We use a separate namespace declaration with a custom namespace prefix "custom".

```xml
<?xml version="1.0" encoding="UTF-8"?>
<spring:beans xmlns="http://www.citrusframework.org/schema/testcase"
    xmlns:spring="http://www.springframework.org/schema/beans"
    xmlns:custom="http://www.citrusframework.org/samples/my-testcase-info"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
http://www.citrusframework.org/schema/testcase
http://www.citrusframework.org/schema/testcase/citrus-testcase-1.1.xsd
http://www.citrusframework.org/samples/my-testcase-info
http://www.citrusframework.org/samples/my-testcase-info/my-testcase-info.xsd">

    <testcase name="PwdChange_OK_1_Test">
        <meta-info>
            <author>Christoph</author>
            <creationdate>2010-01-18</creationdate>
            <status>FINAL</status>
            <last-updated-by>Christoph</last-updated-by>
            <last-updated-on>2010-01-18T15:00:00</last-updated-on>
            <custom:requirement>REQ10001</custom:requirement>
            <custom:pre-condition>Existing user, sufficient rights</custom:pre-condition>
            <custom:result>Password reset in database</custom:result>
            <custom:classification>PasswordChange</custom:classification>
        </meta-info>

        [...]
    </testcase>
</spring:beans>
```

As you see it is quite easy to add custom meta information to your Citrus test case. The customized elements may be precious for automatic reporting. XSL transformations for instance are able to read those meta information elements in order to generate automatic test reports and documentation.

You can also declare our new XML schema in the Eclipse preferences section as user specific XML catalog entry. Then even the schema code completion in your Eclipse XML editor will be available for our customized meta-info elements.