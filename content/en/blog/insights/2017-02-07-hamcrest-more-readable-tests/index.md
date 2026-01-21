---
author: Philipp Renoth
date: '2017-02-07'
tags:
- hamcrest
title: Hamcrest - More readable Tests
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="hamcrest.jpg" alt=""></div>

The probably best written tests are those which can be understood by anyone understanding some English, right?

[Hamcrest](http://hamcrest.org) is an anagram of the word "Matchers" and a paradigm of encapsulating matching logic and corresponding error messages in objects we could use and reuse in the tests. They hide "matching"-implementation details and get self explanatory names we can seamless integrate in our tests. And of course we are also able to write tests for our matchers!
 
Hamcrest itself isn't only intended to be used in the context of tests. It's available for: Java, Python, Ruby, Objective-C, PHP, Erlang, Swift.

<!--more-->

### Without Hamcrest

A rather fishy check in the middle of a test might look like this:

```java
void testSendingEmailWithMissingMailConfigurationWillLeaveServerIdle() {

    // 1. start mail server with no configuration
    // 2. send a email
    
    // [...]

    assertTrue(
        "server is idle",
        myServer.getMessageQueue().isEmpty()
        && myServer.getPendingRequests().isEmpty()
    );
    // AssertionError: server is idle
}
```

We don't know which expression fails, so why not write two assertions.

```java
// [...]
assertTrue("message queue empty", myServer.getMessageQueue().isEmpty());
assertTrue("no pending requests", myServer.getPendingRequests().isEmpty());
// AssertionError: message queue empty
```

Now we know that the message queue is not empty, but how should the next developer or reader recognize, that we actually check if the server is idle? And what if other tests also need that check, so that developers start to copy and paste the two statements? At least, the worst case: the logic of a server being idle changes to append a third statement and bunch of tests have to be updated, eek.

### Using Hamcrest matchers

What we want is compact code, the hamcrest way.

```java
// [...]
assertThat(myServer, isIdleServer());

// Expected: Server to be idle.
//      but: Message queue not empty. Has pending requests.
```

This can be achieved by implementing a hamcrest Matcher. Usually, creating matchers is delegated to static methods to be able to import them statically per wildcard and the matchers are anonymous classes, thus it's easy to extend with some parameters and have them available inside, instead of concrete class boilerplate code.

```java
class Matchers {
    public static Matcher<MyServer> isIdleServer() {
        return new BaseMatcher<MyServer>() {
            private boolean hasEmptyMessageQueue(MyServer server) {
                return server.getMessageQueue().isEmpty();
            }
            
            private boolean hasNoPendingRequests(MyServer server) {
                return server.getPendingRequests().isEmpty();
            }
            
            @Override
            public boolean matches(Object item) {
                return hasEmptyMessageQueue((MyServer)item)
                    && hasNoPendingRequests((MyServer)item)
                ;
            }
            
            @Override
            public void describeTo(Description description) {
                description.appendText("Server to be idle."); // Expected: ...
            }
            
            @Override
            public void describeMismatch(Object item, Description description) {
                if (!hasEmptyMessageQueue((MyServer)item)) {
                    description.appendText("Message queue not empty. ");
                }
            
                if (!hasNoPendingRequests((MyServer)item)) {
                    description.appendText("Has pending requests. ");
                }
            }
        };
    }
}
```

There might be some better implementations with nice formatted messages as list and so on. For now, this should suffice.