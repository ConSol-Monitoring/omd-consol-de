---
author: Jens Klingen
author_url: https://twitter.com/jklingen
date: '2017-03-14'
featured_image: /assets/2017-03-14-getting-started-with-java9-httpclient/duke-blueprint.png
meta_description: Java 9 incubates a brand new HTTP client with HTTP/2 support, and
  finally offers a sleek API for communication via HTTP. Let's have a look at the
  new API and see some examples in action.
tags:
- java9
title: Getting Started With Java 9's New HTTP Client
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

If you ever needed to request HTTP resources with Java, you probably came across several solutions put together from a surprising number of lines. And you probably ended up with using a third party library to achieve your goal in a reasonable manner.

Good news: besides [Java 9 modules], the next JDK version comes with a brand new HTTP client, and it not only brings support for HTTP/2, but also a sleek and comprehensive API. Let's have a closer look at the new features.
<!--more-->

## Why HTTP/2?
HTTP/2 brings awesome new features to the protocol, including

* bidirectional communication using push requests
* multiplexing within a single TCP connection
* long running connections
* stateful connections

We'll focus on the HTTP client here, for in-depth information about HTTP/2 you should watch [Fabian's Devoxx talk about HTTP/2].

## Incubator Module
It is important to notice that the [HTTP client will be delivered as an incubator module] with JDK 9. This has a few implications:

* In JDK 9, the module is called `jdk.incubator.httpclient`.
* This incubator module will be replaced by `java.httpclient` in JDK 10.
* JDK 10 might bring breaking changes to the API.


## The New API of Java 9's HTTP Client
Basically, there are three classes involved when communicating via HTTP: a `HttpClient` will be used to send `HttpRequest`s and receive `HttpResponse`s. Good basis for a comprehensible API, right? Let's see:

#### Basic Example: GET Request to String

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("https://labs.consol.de/"))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandler.asString());

System.out.println(response.statusCode());
System.out.println(response.body());
```

Beautiful, isn't it? No `InputStream` and `Reader` involved - instead, the API offers a `BodyHandler` which allows us to read the `String` directly from the response. We'll see other `BodyHandler`s below.

While `HttpClient`, `HttpRequest` and `HttpResponse` are the main actors in our HTTP communication, we will mostly be working with builders to configure them. The builders provide a concise and chainable API.

### Inspecting HttpRequest.Builder

We can obtain an instance of `HttpRequest.Builder` by calling `HttpRequest.newBuilder()`, as we did above. We will use it to configure everything related to a specific request. Let's have a look at its most important methods:

```java
// HttpRequest.Builder
public abstract static class Builder {
    // note: some methods left out for the sake of brevity
    public abstract Builder uri(URI uri);
    public abstract Builder version(HttpClient.Version version);
    public abstract Builder header(String name, String value);
    public abstract Builder timeout(Duration duration);
    public abstract Builder GET();
    public abstract Builder POST(BodyProcessor body);
    public abstract Builder PUT(BodyProcessor body);
    public abstract Builder DELETE(BodyProcessor body);
    public abstract HttpRequest build();
}
```

Pretty self-explaining, right? Just chain method calls until your request is fully configured, then call `build()` to get your `HttpRequest` instance. You can read up about the details in the [API docs of HttpRequest.Builder].

### Inspecting HttpClient.Builder

As with `HttpRequest`, we can use `HttpClient.newBuilder()` to obtain an instance of `HttpClient.Builder`. It provides an API to configure some more generic stuff about our connection. Again, let's have a look at its methods:

```java
// HttpClient.Builder
public abstract static class Builder {
    public abstract Builder cookieManager(CookieManager cookieManager);
    public abstract Builder sslContext(SSLContext sslContext);
    public abstract Builder sslParameters(SSLParameters sslParameters);
    public abstract Builder executor(Executor executor);
    public abstract Builder followRedirects(Redirect policy);
    public abstract Builder version(HttpClient.Version version);
    public abstract Builder priority(int priority);
    public abstract Builder proxy(ProxySelector selector);
    public abstract Builder authenticator(Authenticator a);
    public abstract HttpClient build();
}
```

Awesome! Again, the API is self-explaining enough to just give it a go and let your IDE's auto completion guide you to your aims. If in doubt, consult the [API docs of HttpClient.Builder].

### More Java 9 HTTP Client Usage Examples

Above we got acquainted with the promising API of the HTTP client. Let's see some more examples of the HTTP client in action.

#### Save GET Request to File
To save a downloaded file to the local file system, simple use `HttpResponse.BodyHandler.asFile(Path)`:

{% highlight java hl_lines="9" %}
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("https://labs.consol.de/"))
    .GET()
    .build();

Path tempFile = Files.createTempFile("consol-labs-home", ".html");
HttpResponse<Path> response = client.send(request, HttpResponse.BodyHandler.asFile(tempFile));
System.out.println(response.statusCode());
System.out.println(response.body());
{% endhighlight%}

#### Upload a File Using POST
Uploading a file from the local file system via POST is easy as well, we can add a POST body by using a `HttpRequest.BodyProcessor`:

{% highlight java hl_lines="5"%}
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("http://localhost:8080/upload/"))
    .POST(HttpRequest.BodyProcessor.fromFile(Paths.get("/tmp/file-to-upload.txt")))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandler.discard(null));
System.out.println(response.statusCode());
{% endhighlight%}

#### Async HTTP Request
Asynchronous HTTP is as easy as using `HttpClient#sendAsync()` instead of `HttpClient#send`. If the server side supports HTTP/2, you can even cancel a running request:

{% highlight java hl_lines="8 11 15" %}
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("https://labs.consol.de/"))
    .GET()
    .build();

CompletableFuture<HttpResponse<String>> response = client.sendAsync(request, HttpResponse.BodyHandler.asString());

Thread.sleep(5000);
if(response.isDone()) {
    System.out.println(response.get().statusCode());
    System.out.println(response.get().body());
} else {
    response.cancel(true);
    System.out.println("Request took more than 5 seconds... cancelling.");
}
{% endhighlight%}

#### Using the System Proxy Settings
{% highlight java linenos hl_lines="2" %}
HttpClient client = HttpClient.newBuilder()
    .proxy(ProxySelector.getDefault())
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("https://labs.consol.de"))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandler.asString());
System.out.println(response.statusCode());
System.out.println(response.body());
{% endhighlight%}

#### Basic Authentication
{% highlight java hl_lines="2 3 4 5 6 7" %}
HttpClient client = HttpClient.newBuilder()
    .authenticator(new Authenticator() {
        @Override
        protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication("username", "password".toCharArray());
        }
    })
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(new URI("https://labs.consol.de"))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandler.asString());
System.out.println(response.statusCode());
System.out.println(response.body());
{% endhighlight%}

## Conclusion
The examples above show that we will be able to send HTTP requests easily with Java 9's standard API. Furthermore, we will be able to process the responses in an elegant manner. 
Of course there are third-party libraries who offer similar comfort, but it's always good to have a decent out-of-the-box solution.


[Java 9 modules]: https://labs.consol.de/development/2017/02/13/getting-started-with-java9-modules.html
[Fabian's Devoxx talk about HTTP/2]: https://labs.consol.de/development/2015/11/13/devoxx-talks-http2-citrus.html#dr-fabian-staber-unrestful-web-services-with-http2
[HTTP client will be delivered as an incubator module]: http://openjdk.java.net/jeps/110
[API docs of HttpRequest.Builder]: http://download.java.net/java/jdk9/docs/api/java/net/http/HttpRequest.Builder.html
[API docs of HttpClient.Builder]: http://download.java.net/java/jdk9/docs/api/java/net/http/HttpClient.Builder.html