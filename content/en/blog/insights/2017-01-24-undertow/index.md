---
author: Philipp Renoth
date: '2017-01-24T00:00:00+00:00'
tags:
- undertow
title: Undertow - How to setup a HTTP server
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="undertow.png" alt=""></div>

[Undertow](http://undertow.io/) is an open-source lightweight, flexible and performant Java server, they say. I can confirm that it's
- flexible: always feel free to provide your own implementations or use Undertow helpers to delegate usual server glue code to a more specific implementation you provide

I didn't check or compare performance. It is the default server implementation of [Wildfly Application Server](http://wildfly.org/) and sponsored by JBoss.

<!--more-->

### Bootstrapping Undertow

Default undertow bootstrapping: dynamically initializes thread pools, buffers, etc. according to your hardware resources.

```java
Undertow undertow = Undertow.builder()

    // listen
    .addHttpListener(8080, "localhost")
    
    // let's add a http and a websocket endpoint
    .setHandler(
    
        // combines many `HttpHandler` by path
        Handlers.path()
        
            // any path: "/gate/http/**"
            .addPrefixPath("/gate/http", new MyHttpHandler())

            // exact path "/gate/ws"
            .addExactPath("/gate/ws", Handlers.websocket(new MyWebsocketCallback()))
    )
    .build();

undertow.start();
```

### Http

`HttpHandler::handleRequest` is to be invoked by one of the IO threads which should immediately return, thus either complete exchange or delay processing via dispatch.

**MyHttpHandler.java**

```java
class MyHttpHandler implements HttpHandler {
    @Override
    public void handleRequest(final HttpServerExchange exchange)
        throws Exception
    {
        // dispatch to non-io threads
        if (exchange.isInIoThread()) {
            exchange.dispatch(this);
            return;
        }

        // in worker thread
        // implement here ...
    }
}
```

### Websockets
Websocket endpoints can be set up via `Handlers.websocket(callback)` taking a `WebSocketConnectionCallback` we have to implement and returns the corresponding `HttpHandler`.

**MyWebsocketCallback.java**

```java
class MyWebsocketCallback implements WebSocketConnectionCallback {
    @Override
    public void onConnect(
            WebSocketHttpExchange exchange,
            WebSocketChannel webSocketChannel
    ) {
        // per default channel is not active
        // and will not receive anything

        webSocketChannel
            .getReceiveSetter()
            .set(new MyReceiveListener());

        webSocketChannel.resumeReceives();
    }
}
```

At least implement `MyReceiveListener` and override those methods you're interested in.

**MyReceiveListener.java**

```java
class MyReceiveListener extends AbstractReceiveListener {
    @Override
    protected void onFullTextMessage(
            WebSocketChannel channel,
            BufferedTextMessage message
    ) throws IOException {
        WebSockets.sendText(
            "you sent: " + message.getData(),
            channel,
            null
        );
    }

    // onError
    // onCloseMessage
    // ...
}
```