---
author: Christoph Deppisch
date: '2011-06-17T07:15:58+00:00'
slug: testng-data-provider-in-citrus-test
tags:
- Citrus
title: Use TestNG data provider with Citrus
---

TestNG provides brilliant support for test parameters and data providers. With some annotation magic you are able to pass parameter values to your test method and finally to your Citrus test logic.

<!--more-->
 Actually the TestNG parameters are injected to the Citrus test as normal test variables. Lets put this to the test with a simple example:

```java
public class DataProviderITest extends AbstractTestNGCitrusTest {

    @Parameters( { "message" } )
    @Test(dataProvider = "citrusDataProvider")
    public void dataProviderITest(ITestContext testContext) {
        executeTest(testContext);
    }

    @Override
    protected Object[][] getParameterValues() {
        return new Object[][] {
            { "Hello World!" },
            { "Hallo Welt!" },
            { "Hallo Citrus!" },
        };
    }
}
```

We have to use the Citrus data provider (<code>citrusDataProvider</code>) along with a named parameter annotation (<code>message</code>) on the test method. Just add the annotations to the Citrus test method as shown in the example above. Next thing we override the method <code>getParameterValues()</code> in order to provide the actual parameter values. As you can see we provide three static values for the "message" parameter.

Inside the Citrus test you can use the test variable ${message} as usual. TestNG and Citrus automatically take care on creating the variable with respective value from data provider. The test case is very simple and looks like follows:

```xml
<testcase name="DataProviderITest">
    <actions>
        <echo>
            <message>${message}</message>
        </echo>
    </actions>
</testcase>
```

As we have three static parameter values in our data provider the whole Citrus test is executed three times. Each time the data provider injects the respective test parameter and ${message} variable. The Citrus test report gives us the test results with all parameters.

```xml
echo Hello World!
 echo Hallo Welt!
 echo Hallo Citrus!

CITRUS TEST RESULTS

DataProviderITest('Hello World!') .................................. SUCCESS
DataProviderITest('Hallo Welt!') ................................... SUCCESS
DataProviderITest('Hallo Citrus!') ................................. SUCCESS

Total number of tests: 3
Skipped:   0 (0.0%)
Failed:    0 (0.0%)
Success:   3 (100.0%)
```

We can also use multiple test parameters at a time with all values coming from data provider. How about reading the parameter values from external property files or database?! I use this feature a lot for preparing my Citrus tests with dynamic parameter values from external resources and I bet you will enjoy this feature as much as I do. For more information on TestNG data providers please also have a look at the official documentation (<a href="http://testng.org/doc/documentation-main.html#parameters">http://testng.org/doc</a>).