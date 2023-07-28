---
date: 2023-07-28T00:00:00.000Z
title: "Replacing check_http by check_curl - Lessons Learned"
linkTitle: "check_http_curl"
author: Gerhard Lausser
tags:
  - naemon
  - plugins
---
In a customer's installation we had the problem, that an http-check (using the plugin check_http) could not successfully connect to a website. 

```
$ check_http -H cts-freq.cloud -t 120 --ssl -u "/"  --ssl --onredirect follow -vvv 
CRITICAL - Cannot make SSL connection.
140484279109552:error:14077410:SSL routines:SSL23_GET_SERVER_HELLO:sslv3 alert handshake failure:s23_clnt.c:769:
SSL initialized
```

A test with check_curl showed that this newer plugin was functioning as expected.
```
$ check_curl -H cts-freq.cloud -t 120 --ssl -u "/"  --ssl --onredirect follow -vvv 
HTTP OK: HTTP/1.1 200 OK - 449 bytes in 0.605 second response time |time=0.604714s;;;0.000000;120.000000 size=449B;;;0
```

As check_curl was designated as the successor for check_http, we decided to decommission check_http and use check_curl everywhere in the configs.
Unfortunately, it turned out that it didn't go as smoothly as expected.
This was the configuration we were starting with:
```
define command {
  command_name  check_curl_ssl
  command_line  $USER1$/check_curl -H $ARG1$ -t 120 --ssl -u "$ARG2$" $ARG3$
}

define command {
  command_name  check_http_ssl
  command_line  $USER1$/check_http -H $ARG1$ -t 120 --ssl -u "$ARG2$" $ARG3$
}
```

The first problem that caught our attention was with a url containing a hostname that resolved to both an IPv4 and an IPv6 address through DNS. Since we were operating in a pure IPv4 environment and check_curl tool attempted to contact the IPv6 address, the result was an error. Adding the parameter _\-\-use-ipv4_ resolved this issue.

The next problem was puzzling. The web server responded to a request through check_curl with the message *HTTP WARNING: HTTP/1.1 403 Forbidden*. However, a request through check_http returned the expected *HTTP OK: HTTP/1.1 200 OK*.
It turned out that the web server was configured by its operators to only grant access to selected user agents. So we added _\-\-useragent "check_http"_ and the problem was solved.

And here is the final configuration:

```
define command {
  command_name  check_curl_ssl
  command_line  $USER1$/check_curl \
      -H $ARG1$ -t 120 \
      --useragent "check_http" --use-ipv4 \
      --ssl -u "$ARG2$" $ARG3$
}

define command {
  command_name  check_http_ssl
  command_line  $USER1$/check_http \
      -H $ARG1$ -t 120 \
      --ssl -u "$ARG2$" $ARG3$
}
```

