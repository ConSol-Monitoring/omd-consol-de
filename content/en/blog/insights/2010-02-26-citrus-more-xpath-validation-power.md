---
author: Christoph Deppisch
date: '2010-02-26T09:50:02+00:00'
slug: citrus-more-xpath-validation-power
tags:
- Citrus
title: 'Citrus: More XPath validation power'
---

In my last post (citrus-xpath-validation-power) I solved a validation problem regarding generic XML data structures with some XPath expression power. Now in latest 1.1-SNAPSHOT version of Citrus things become even more straightforward.

<!--more-->
In the latest snapshot you are able to evaluate XPath expressions to different result types like boolean, string or number. Before that XPath expressions had to evaluate to DOM node result in validation. Therefore I used a quite tricky XPath expression to solve the problems in my last post:

```xml
<receive with="statusResponseReceiver">
    <validate path="/StatusResponseMessage/StatusList/Status[.='SAVED']"
                   value="SAVED"/>
    <validate path="/StatusResponseMessage/StatusList/Status[.='NEW']"
                   value="NEW"/>
    <validate path="/StatusResponseMessage/StatusList/Status[.='ORDERED']"
                   value="ORDERED"/>
</receive>
```

Now we can change these expressions to boolean XPath node existence checks for more straightforward understanding. In addition to that we can also validate that an element does NOT exist in the XML structure,
which gives us even more validation power. See the example:

```xml
<receive with="statusResponseReceiver">
    <validate path="contains(/StatusResponseMessage/StatusList/Status[.='SAVED'])"
                   value="true" result-type="boolean"/>
    <validate path="contains(/StatusResponseMessage/StatusList/Status[.='NEW'])"
                   value="true" result-type="boolean"/>
    <validate path="contains(/StatusResponseMessage/StatusList/Status[.='ORDERED'])"
                   value="true" result-type="boolean"/>
    <validate path="contains(/StatusResponseMessage/StatusList/Status[.='FAILED'])"
                   value="false" result-type="boolean"/>
</receive>
```

The XPath expression is declared as boolean evaluation result type. We validate the existence of status elements according to their node value and we can validate the non-existence of the failed status. You can also think of counting the number of status elements, which gives us another validation possibility:

```xml
<validate path="count(/StatusResponseMessage/StatusList/*)"
                   value="3" result-type="number"/>
```

Last not least we can use variables and functions in the XPath expressions which is also new in latest 1.1-SNAPSHOT version.

```xml
<validate path="contains(/StatusResponseMessage/StatusList/Status.='${failedStatus}')"
                   value="false" result-type="boolean"/>
```

XPath is very powerful in Citrus XML validation as it already was in my last post, but now it is even more handy to use XPath in complex validation situations with the possibility to use boolean, number or string result types.