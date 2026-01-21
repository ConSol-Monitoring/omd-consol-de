---
author: Christoph Deppisch
date: '2010-02-18T16:02:00+00:00'
excerpt: This post shows the power of XPath validation in Citrus
slug: citrus-xpath-validation-power
tags:
- Citrus
title: 'Citrus: XPath validation power'
---

I recently struggled with the validation of a very generic XML data structure in some message payload. It turned out to be a good example where XPath validation can overcome the normal XML tree comparison. I'd like to share my thoughts about this issue, because others might run into similar problems too and the solution with XPath really impressed me with its powerful validation possibilities.

<!--more-->
Let me introduce the generic XML structure to you first, so you get an idea about my problem. In my test case I need to validate the following XML structure in some message payload:

```xml
<StatusResponseMessage>
    <StatusList>
        <Status>SAVED</Status>
        <Status>ORDERED</Status>
        <Status>FINISHED</Status>
        <Status>NEW</Status>
    </StatusList>
</StatusResponseMessage>
```

Unfortunately the status elements are not specified in their order just as well it is not clear which elements actually arrive. So there is neither a rule that the 'SAVED' status is always leading the list nor it is clear in which order the other status elements are listed. According to the XML Schema definition you can think of various combinations of status elements in different orders that we have to deal with. So XML template validation with extended XML tree comparison in Citrus is not possible as the element order is essential when comparing XML trees.

So how can we validate the existence of status elements in our test case? I found a possible solution in validating XML elements with XPath expressions. Instead of XML tree comparison we pick the status elements via XPath independent from their order in the XML structure and validate their existence. Now let us have at some example XPath expressions that do the magic:

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

With these expressions we pick the status elements that we are interested in. If a status is missing the XPath expression and the test case will fail. The good thing here is that the order of elements in the status list is not important anymore. The test case just validates the existence of status elements and therefore fits the generic XML structure very well.