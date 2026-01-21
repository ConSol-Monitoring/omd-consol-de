---
author: Sven Nierlein
date: '2016-03-28T16:00:00+02:00'
featured_image: /assets/images/https.jpg
tags:
- perl
title: SSL - No more excuses
---

There are many reasons to enable encryption on your webserver and since [__Let's Encrypt__](https://letsencrypt.org/) openend its public beta, there are no more excuses to not use ssl. Besides the official scripts, programs and webpage, there is also already a Perl module [__Crypt::LE__](http://search.cpan.org/perldoc?Crypt%3A%3ALE) available which uses the Lets Encrypt API and makes requesting and renewing certificates super easy and most important... scriptable.

<!--more-->

<div style="float: right; padding-right: 30px;"><img src="https.jpg" alt=""></div>

## Example Scenario

We are assuming the following scenario with an apache configured for the domain example.com serving content from the folder /var/www.

## Preparation

We first need to install the `Crypt::LE` perl module from cpan. Because we do not want to install modules from cpan into the system folders, we use `cpanm` together with `local::lib`.

Luckily there is a debian package for both of them. (This has to be done as the root user)

```
#> apt-get install cpanminus liblocal-lib-perl
```

Then we continue as normal user and install `Crypt::LE` into our home folder by:

```
%> cpanm -l ~/perl5 -n Crypt::LE
```

This will create a perl5 folder in our home directory with all required perl modules.

Last step for preparation is to clone the script itself.

```
%> git clone https://github.com/sni/lets_encrypt.pl.git ~/certs
```

## Creating the certificate

With all the preparations done, this is another oneliner. But do a testrun first with:

```
%> cd ~/certs
%> PERL5LIB=~/perl5/lib/perl5 ./lets_encrypt.pl example.com /var/www/ test
```

This will issue a certificate using the Lets Encrypt staging server which is not accepted by normal browsers but allows you to test the verfication steps.

The staging server does not have rate limits, so you can issue as many certificates as you like. The production api is limited to a certain requests per week.

If that worked, issue a valid certificate by:

```
%> cd ~/certs
%> PERL5LIB=~/perl5/lib/perl5 ./lets_encrypt.pl example.com /var/www/
```

You can specify multiple domain aliases as comma separated list like:

```
%> ./lets_encrypt.pl example.com,www.example.com /var/www/
```

You could add this as montly cronjob, because the certificates only lasts for 3 months.


## Apache Configuration

Now that we have a valid ssl certificate, we finally have to put that into the apache. This example also includes a [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) header. Depending on your system, you have to enable the ssl and headers module first. Create a new virtual host and add the just created certificates:

<p class="hint">
Update: Use the <a href="https://mozilla.github.io/server-side-tls/ssl-config-generator/" target="_blank">SSL Config Generator</a> from Mozilla for a always up to date best practice webserver configuration.
</p>

Example configuration:

```
<VirtualHost *:443>
  ServerName example.com
  DocumentRoot /var/www
  SSLEngine on
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  SSLHonorCipherOrder on
  SSLCipherSuite 'EECDH+ECDSA+AESGCM:EECDH+aRSA+AESGCM:EECDH+ECDSA:EECDH:EDH+AESGCM:EDH:+3DES:ECDH+AESGCM:ECDH+AES:ECDH:AES:HIGH:MEDIUM:!RC4:!CAMELLIA:!SEED:!aNULL:!MD5:!eNULL:!LOW:!EXP:!DSS:!PSK:!SRP'
  SSLCertificateFile    /home/user/certs/example.com.crt
  SSLCertificateKeyFile /home/user/certs/example.com.key
</VirtualHost>
```