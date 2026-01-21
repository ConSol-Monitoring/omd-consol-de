---
title: check_webinject
tags:
  - plugins
  - web testing
  - http
  - webinject
  - check_webinject
---

## Description

check_webinject is a Nagios check plugin based on the [Webinject Perl Module](http://search.cpan.org/dist/Webinject/) available on CPAN which is now part of the [Webinject](http://www.webinject.org) project.

It was completely reworked at ConSol including some bugfixes and enhancements for Nagios 3.

## How does it work?

The plugin is written in Perl and uses LWP together with Crypt::SSLeay or IO::Socket::SSL. check_webinject sends requests to any configured webservice. You may then specify verification settings in your test cases.

## Test Case Example

A sample testcase file structure:

``` xml
<testcases>
<case
    id             = "1"
    description1   = "Sample Test Case"
    method         = "get"
    url            = "{BASEURL}/test.jsp"
    verifypositive = "All tests succeded"
    warning        = "5"
    critical       = "15"
    label          = "testpage"
/>
</testcases>
```

## Usage Example

``` bash
%>./check_webinject -s baseurl=http://yourwebserver.com:8080 testcase.xml
WebInject OK - All tests passed successfully in 0.027 seconds|time=0.027;0;0;0;0 testpage=0.024;5;15;0;0
```

Add check_webinject like a normal Nagios plugin.

## Installation

Just unpack the tarball and make sure the required Perl modules exist:
* LWP
* XML::Simple
* HTTP::Request::Common
* HTTP::Cookies
* Crypt::SSLeay
* XML::Parser
* Error

## Download

Go to [Github](https://github.com/sni/Webinject), clone and build.

You can also download the [prebuild version of the check_webinject nagios plugin](https://github.com/sni/Webinject/releases).

## Copyright

Sven Nierlein

Check_webinject is released under the GNU General Public License. [GNU GPL](https://www.gnu.org/licenses/licenses.html#GPL)

## Author

Sven Nierlein