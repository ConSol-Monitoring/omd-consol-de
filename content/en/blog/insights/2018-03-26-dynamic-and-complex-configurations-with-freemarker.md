---
author: Jan Lipphaus
date: '2018-03-26'
meta_description: How to use Apache FreeMarker to implement configuration logic for
  Java applications.
tags:
- java
title: Dynamic and complex configurations with FreeMarker
---

When you are developing software, you will most likely stumble upon situations where you must perform frequent, but minor, code changes. Changes that do not alter your software’s basic functionality, changes so simple that from a developer’s perspective are more like a different configuration for your code but are still a bit too complex to use a simple configuration file.

In this article I will show you how to use Apache FreeMarker to implement dynamic and complex configurations in Java projects that can be configured from outside the application.
<!--more-->

## Introduction
Some example use cases which I will also address in detail later in this article are:
* Complex and dynamic configurations  
You need to configure something simple, but it depends on runtime conditions and/or operations which might also need to change?
* Changing your business logic  
The business logic of your software changes frequently. The core implementation is not affected, and you want some of the logic out of your code and configurable?
* Transforming between formats  
You want to map some payload from one format to another and need full control over the transformation via configuration?

I have seen different approaches to address this in multiple software projects in the past.  
Often every minor detail and condition is put into a traditional key-value configuration. Then you most likely end up with a large and confusing property file where 90% of the values never change, but you still missed the one detail you need for the current change and now you must extend your configuration and your code using it.  
When the configuration gets more complicated the most common strategy is to just do it in the code directly.

I am not saying putting this into your Java code directly is wrong, it might even be more clean and straightforward.  
It becomes a problem when you have an urgent change and the entire process of releasing, delivering and deploying your software takes hours, days or even weeks until your change finally arrives where it is needed.  
If you do not have to change your code and just provide a configuration the process is most likely much shorter. Also, you do not necessarily need a developer familiar with the software to make the change and build the application, just someone who can understand the configuration part of your application.

## Using FreeMarker
When we encountered those problems described above we did not want to cobble together our own configuration framework but instead looked for an existing technology we could use that was so simple that you do not have to invest much time to fully understand it yet so powerful that we could use it for all our use cases.

FreeMarker is fitting in very nicely for those tasks. It is a templating engine for Java, normally used for creating text output from templates (e-mails, HTML pages and the like). It has a very low performance impact and offers a powerful template language which can easily perform most operations of standard Java code.

The FreeMarker template files are used as the configuration files of our application. Depending on the use case you can either use the generated text output as the result you need, or you can manipulate your Java objects of your application directly in the template or a combination of both.
 
## First Examples
In the following examples I will be using the following dependencies
* Java 8
* FreeMarker 2.3.23

When using FreeMarker you will need to implement some simple code for loading your templates, for most use cases something like this simple template manager would most likely be sufficient.

***TemplateManager.java***
```java
package freemarker;

public class TemplateManager {
    private Configuration freemarkerConfig;
    private static final String TEMPLATE_DIRECTORY = "src/main/resources/";

    public TemplateManager() {
        freemarkerConfig = new Configuration(Configuration.VERSION_2_3_23);
        freemarkerConfig.setTagSyntax(Configuration.ANGLE_BRACKET_TAG_SYNTAX);
        freemarkerConfig.setDefaultEncoding("UTF-8");
        freemarkerConfig.setNumberFormat("computer");
        freemarkerConfig.setObjectWrapper(new BeansWrapperBuilder(Configuration.VERSION_2_3_23).build());
        freemarkerConfig.setTemplateLoader(new StringTemplateLoader());
    }

    private Template loadTemplate(String templateName, String templatePath) {
        try {
            String templateContent = new String(Files.readAllBytes(Paths.get(templatePath)));
            ((StringTemplateLoader) freemarkerConfig.getTemplateLoader()).putTemplate(templateName, templateContent);
            return freemarkerConfig.getTemplate(templateName);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String processTemplate(String templateName, Map<String, Object> data) {
        Template template = loadTemplate(templateName, TEMPLATE_DIRECTORY + templateName + ".ftl");
        try (StringWriter writer = new StringWriter()) {
            template.process(data, writer);
            return writer.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

You can set **TEMPLATE_DIRECTORY** to any relative or absolute path that points to the directory where your FreeMarker templates are located. You can put them outside the working directories of the program if you like, as long the program has access to the path on the file system you can place the template there. This helps if you are working on environments where you are restricted to specific paths you can access.

Through the method **processTemplate** you can now call any template from your template directory by passing its name and the data the template should have access to. The method will return the generated string output of the template.

Let us start with a very simple example. Imagine somewhere your application you have two numbers and you need the result of a calculation performed on those two numbers. The exact calculation is unspecified and should be configurable.  
We can use a simple main class and a one-line FreeMarker template to test our setup.

***Main.java***
```java
package freemarker;

public class Main {
    public static void main(String... args) {
        TemplateManager templateManager = new TemplateManager();

        Map<String, Object> data = new HashMap<>();
        data.put("a", 3);
        data.put("b", 5);

        String result = templateManager.processTemplate("calc", data);

        System.out.println("Result: " + result);
    }
}
```

***calc.ftl***   

    ${a + b}

Run the main method and the program will, as expected, output the result **8**.  
You can change the operation in the template file without the need of recompiling your Java code.

Now you may not like that we use string generation to get our result of a numeric operation. And I do not like it, too. But there is simple solution for that: Direct object manipulation in the FreeMarker template.  
If you have an object you can work on, you can update the result on that. Let’s have an example for clarification. A simple POJO will hold the input data and result of our calculation and adapt the main class to use this instead.

***Calc.java***
```java
package freemarker;

public class Calc {
    private int a;
    private int b;
    private int result;

    public Calc(int a, int b) {
        this.a = a;
        this.b = b;
    }
    public int getA() { a; }
    public void setA(int a) { this.a = a; }
    public int getB() { return b; } 
    public void setB(int b) { this.b = b; }
    public int getResult() { return result; }
    public void setResult(int result) { this.result = result; }
}
```

***Main.java***
```java
package freemarker;

public class Main {
    public static void main(String... args) {
        TemplateManager templateManager = new TemplateManager();

        Map<String, Object> data = new HashMap<>();
        Calc calc = new Calc(3, 5);
        data.put("calc", calc);
        templateManager.processTemplate("calc", data);

        System.out.println("Result: " + calc.getResult());
    }
}
```

The template gets only the one object as data and the program expects it to set the result on this object. The string output generation is not used in this example.  
The template now must be adapted to work on the object.

***calc.ftl***

    <#-- @ftlvariable name="calc" type="freemarker.Calc" -->
    <#assign void = calc.setResult(calc.a * calc.b)>

As you can see we can directly call the setter on our object and the program will output the expected **15**. Using **assign** is the simplest way if you just want to invoke a method in a FreeMarker template, but it requires an assignment to a variable even if the method does not return anything. I just use **void** as a variable name to indicate that the method does not return anything.

*Tip: Did you notice the FreeMarker comment line in this template? If you are using IntelliJ IDEA as IDE you can use this to enable code completion features on your Java objects inside FreeMarker templates. You specify the name of the variable and the full class name of the Java class.*

Those two methods, creating a result via output string generation and directly modifying Java objects are the gist of using FreeMarker for any configuration purpose. Depending on the use case you will basically always use characteristics of one of them or a combination of the two.

## Extended use cases

### Transforming between formats
Now that we have the basics covered we can try some use cases involving transforming between formats. Let us assume we have a XML payload that we want to map into JSON payload and vice versa.

This is the XML we have as input.

***example.xml***
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
    <user>
        <id>1</id>
        <name>User A</name>
    </user>
</data>
```

For this use case it makes sense to use the string output generation of the template to build our JSON. And with **NodeModel** which comes with FreeMarker we already have a very simple way to convert a string containing the XML into an object that can be easily used inside a FreeMarker template. The main class loads the XML into a **NodeModel** and passes it to the template. 

***Main.java***
```java
package freemarker;

public class Main {
    public static void main(String... args) throws Exception {
        TemplateManager templateManager = new TemplateManager();

        String xmlString = new String(Files.readAllBytes(Paths.get("src/main/resources/example.xml")));
        NodeModel xmlNodeModel = NodeModel.parse(new InputSource(new StringReader(xmlString)));

        Map<String, Object> data = new HashMap<>();
        data.put("xml", xmlNodeModel);

        String json = templateManager.processTemplate("xml2json", data);

        System.out.println(json);
    }
}
```

Then we can just load the data node from the XML in our FreeMarker template and use it like a normal template to render an output.

***xml2json.ftl***

    <#assign data = xml['child::node()']>
    {
        "user": {
            "userId": ${data.user.id},
            "userName": "${data.user.name}"
        }
    }

The program will now map the XML to JSON and via the template and you have full control over the JSON structure that is generated.

***Output***
```json
{
    "user": {
        "userId": 1,
        "userName": "User A"
    }
}
```

### Moving full transformation logic into template
Next, we want to transform the other way around, from JSON to XML. But for additional difficulty we should be ready that maybe next week we won’t get a JSON as input but just a string or a different format that we must handle differently. So, we cannot parse the JSON in the Java class like we did with the XML, but we need to handle this in the template itself, the template will just receive the input as a string. Also, FreeMarker does not have an inbuild wrapper for JSON, so we must do something about that as well.

For accessing the JSON inside the template the simplest solution is to parse it into a map, as FreeMarker has an easy approach on accessing maps. We need to create a utility class that converts a JSON-string into a map which we will then call from inside the template.

***JsonUtil.java***
```java
package freemarker.util;

public class JsonUtil {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static Map<String, Object> jsonToMap(String json) throws IOException {
        return OBJECT_MAPPER.readValue(json, new TypeReference<HashMap<String, Object>>(){});
    }
}
```

This is using a Jackson object mapper to parse the string into a map, but you could just as well use a different framework.

The main method does not any longer have to do the parsing of the input, but instead must somehow make the JsonUtil class available to the template.

We need to access those static methods and we cannot simply put the class directly into the data map. But luckily FreeMarker provides us with the functionality to the class into the data map using a static models wrapper.

***Main.java***
```java
package freemarker;

public class Main {
    public static void main(String... args) throws Exception {
        TemplateManager templateManager = new TemplateManager();

        String input = new String(Files.readAllBytes(Paths.get("src/main/resources/example.json")));

        Map<String, Object> data = new HashMap<>();
        data.put("input", input);

        TemplateHashModel staticModels = new BeansWrapperBuilder(Configuration.VERSION_2_3_23).build().getStaticModels();
        data.put("JsonUtil", staticModels.get(JsonUtil.class.getName()));

        String output = templateManager.processTemplate("json2xml", data);

        System.out.println(output);
    }
}
```

For the real use case you could add several different utility classes to support parsing different input formats. You can then choose in the template what you want to do with the input.

***json2xml.ftl***

    <#-- @ftlvariable name="JsonUtil" type="de.consol.jbl.util.JsonUtil" -->
    <#assign body = JsonUtil.jsonToMap(input)>
    <?xml version="1.0" encoding="UTF-8"?>
    <data>
        <user>
            <id>${body.data.user.id}</id>
            <name>${body.data.user.name}</name>
        </user>
    </data>

You have now the complete control over the mapping from input to output inside the template.  
When we input this JSON we get the following output.

***example.json***
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "User A"
    }
  }
}
```

***Output***
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
    <user>
        <id>1</id>
        <name>User A</name>
    </user>
</data>
```

### Combining transformation and business logic
It is also easy to combine transformation. For example, you can transform an input like in the last example and combine that with passing an object that controls the workflow of your application to your template. Then you can have a condition based on the input and alter the workflow accordingly by modifying this object, all from the same template.

## Conclusion
You now know how to use FreeMarker templates in your application to outsource configurations and configurable logic from your Java code. Depending on your use cases you will be able save a significant amount of time from your release or deployment process. Instead of building, releasing and deploying your Java application for every minor change you can now distribute the FreeMarker templates as configuration files and have them applied with a simple restart or reload of your application, or even during runtime if you disable template caching or use a reload mechanism.

If you need more information on FreeMarker and the usage of the FreeMarker template language you should check their website for more information and documentation: [https://freemarker.apache.org/]

[https://freemarker.apache.org/]: https://freemarker.apache.org/