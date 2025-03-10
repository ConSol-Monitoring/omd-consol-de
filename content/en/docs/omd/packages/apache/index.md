---
title: Apache HTTP Server
---
<style>
  thead th:empty {
    border: thin solid red !important;
    display: none;
  }
</style>
![](apache.jpg)
### Overview

|||
|---|---|
|Homepage:|https://httpd.apache.org/|
|Changelog:|https://www.apache.org/dist/httpd/CHANGES_2.2|
|Documentation:|https://httpd.apache.org/docs/|
|Get version:|apachectl -v|
|OMD default:|shared mode|
|OMD connectivity:|Start at TCP:5000 (increasing with creating new sites)|

The Apache HTTP Server, colloquially called Apache (/əˈpætʃiː/ ə-PA-chee), is the world's most widely used web server software. Originally based on the NCSA HTTPd server, development of Apache began in early 1995 after work on the NCSA code stalled. Apache played a key role in the initial growth of the World Wide Web quickly overtaking NCSA HTTPd as the dominant HTTP server, and has remained the most popular HTTP server since April 1996. In 2009, it became the first web server software to serve more than 100 million websites. (Wikipedia)

&#x205F;
### Directory Layout

|||
|---|---|
|Global include:|/etc/&lt;APACHE&gt;/conf.d/zzz_omd.conf|
|Site include:|/omd/apache/&lt;site&gt;.conf|
|Site Config Directory:|&lt;site&gt;/etc/apache/conf.d/|
|Reverseproxy Config:|&lt;site&gt;/etc/apache/mode.conf|
|Logfiles:|&lt;site&gt;/var/log/apache|

&#x205F;

### OMD Options & Vars
| Option | Value | Description |
| ------ |:-----:| ----------- |
| APACHE_MODE | **ssl** <br> own <br> none | |
| APACHE_TCP_ADDR | **127.0.0.1** | |
| APACHE_TCP_PORT | **5000** | Port increase with creating a new site |

### HTTPS / SSL / TLS

Since OMD-Labs version 2.12 build-in SSL support is possible and enabled by
default for new sites. Existing sites can be upgraded with

    omd config set APACHE_MODE ssl

The system- and site- apache will then use a self-signed certificate. While this
isn't an issue for the site apache, you probably want to replace the systems
apache certificate with a trusted certificate which matches the hostname of the
OMD host.

Depending on your system you have to replace the the path to your certificates
in following files:

#### Centos / Red Hat

Adjust the path in `/etc/httpd/conf.d/ssl.conf`.

#### Debian / Ubuntu

Adjust the path in `/etc/apache2/sites-available/default-ssl.conf`.

#### Fedora

Adjust the path in `/etc/httpd/conf.d/ssl.conf`.

#### SLES 12

Adjust the path in `/etc/apache2/vhosts.d/vhost-ssl.conf`.