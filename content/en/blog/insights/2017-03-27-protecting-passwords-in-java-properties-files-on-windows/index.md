---
layout: post
date: '2017-03-27T00:00:00+00:00'
title: Protecting Passwords in Java Properties Files on Windows
status: public
author: Fabian Stäber
categories:
- Development
tags:
- java
- security
---

<div style="float: right; margin-left: 1em; margin-bottom: 1em;">![safe](./safe.png)</div>

Typical Java backend applications need to integrate with existing 3rd party services. In most cases, calls to these 3rd party services are authenticated. Frequently, Java applications are required to use login credentials for authenticated calls: A username and a password.

This scenario raises a problem: How can we **store the password** needed for calling the 3rd party service? We could store it in a _properties_ file, but then everyone with access to the _properties_ file learns the password. We could provide the password as a command line parameter or environment variable, but then everyone with access to the startup script learns the password. We could hard-code it in our application, but then everyone with access to the JAR file learns the password. We could encrypt the password using a master key, but then we have the same problem again: How to store the master key?

The common solution is to use a secure data store provided by the operating system. Our application runs on Windows Server, so we use the Windows Data Protection API (DPAPI) for protecting our secret passwords. This blog post shows how to use the DPAPI in Java applications.

<!--more-->

windpapi4j
----------

There are a few Java wrappers for the Windows Data Protection API (DPAPI) available. We went with [peter-gergely-horvath/windpapi4j][1], because it's simple, only a few lines of code, and it's available on GitHub under the LGPL license.

windpapi4j is available as a Maven dependency:

{% highlight xml %}
<dependency>
    <groupId>com.github.peter-gergely-horvath</groupId>
    <artifactId>windpapi4j</artifactId>
    <version>1.0</version>
</dependency>
{% endhighlight %}

The API is very easy to use:

{% highlight java %}
package test;

import com.github.windpapi4j.InitializationFailedException;
import com.github.windpapi4j.WinAPICallFailedException;
import com.github.windpapi4j.WinDPAPI;
import com.github.windpapi4j.WinDPAPI.CryptProtectFlag;

import java.util.Base64;

import static java.nio.charset.StandardCharsets.UTF_8;

public class Sample {

    private static WinDPAPI winDPAPI;

    public static String encrypt(String plaintext) throws WinAPICallFailedException {
        byte[] encryptedBytes = winDPAPI.protectData(plaintext.getBytes(UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public static String decrypt(String encryptedString) throws WinAPICallFailedException {
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedString);
        return new String(winDPAPI.unprotectData(encryptedBytes), UTF_8);
    }

    public static void main(String[] args) throws InitializationFailedException, WinAPICallFailedException {

        String plaintext = "Hello, World!";

        if (!WinDPAPI.isPlatformSupported()) {
            System.err.println("The Windows Data Protection API (DPAPI) is not available on " + System.getProperty("os.name") + ".");
            return;
        }

        winDPAPI = WinDPAPI.newInstance(CryptProtectFlag.CRYPTPROTECT_UI_FORBIDDEN);

        System.out.println("Plain text:       " + plaintext);

        String encrypted = encrypt(plaintext);
        System.out.println("Encrypted String: " + encrypted);

        String decrypted = decrypt(encrypted);
        System.out.println("Decrypted String: " + decrypted);
    }
}
{% endhighlight %}

The output of the example code on Windows would be:

{% highlight text %}
Plain text:       Hello, World!
Encrypted String: AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAykiFD+jTIUmCKihW3GtogQAAAAABAAAAAAAQZgAAAAEAACAAAABd2RYJvsmdgnj7fkR93N1qQNG74a5c6586Qi7+0zhSgAAAAAAOgAAAAAIAACAAAAD/NvmmYKExhV5a5479fd5xCKt1Lvs0HXZVfka4+lheKRAAAAB6W10qGO6uDG40miDUUJLLQAAAAJvcThKsDHQaxE9UGE6pK/IVKzfdlk3ktLPaxlf+YPSPdyGd+90YoXE69OK8ZJhpkA5MSS/jhnuYAmHZP6nxZcA=
Decrypted String: Hello, World!
{% endhighlight %}

We can now store the encrypted string in our _properties_ file, and call `decrypt()` in our application to get the secret data.

Which key does Windows use to encrypt our data?
-----------------------------------------------

As you might have noticed, we call `encrypt()` and `decrypt()` without providing the encryption key. The key is managed by the Windows operating system and not by our Java application.

Windows uses a randomly generated master key to protect the data. The master key is encrypted with the user's login password and stored in the user profile. When the user changes the login password, Windows automatically re-encrypts the master keys. Additionally, Windows keeps a "credential history" in the user profile so that it can restore data even if updating the master key failed.

The application must run under the same user who encrypted the data. Only then can our application `decrypt()` the data from the _properties_ file. If the application runs under another user, the data cannot be decrypted. If the application runs on another machine, the data cannot be decrypted unless the same user profile is available on the other machine.

How to maintain the properties file
-----------------------------------

Our application is implemented as follows: When the administrator installs the application and starts it for the first time, he must create a configuration with the plain text password. The application then generates a _properties_ file containing the encrypted version of these passwords. Once this is done, the administrator may delete the plain text configuration. Now the application runs using the generated _properties_ file, and the plain text passwords are no longer stored anywhere on the machine.

TL;DR
-----

The Windows Data Protection API (DPAPI) provides a convenient way of protecting secret data. The encrypted data can be stored in a Java _properties_ file. A Java application can read the _properties_ file and call the DPAPI to decrypt the data. The Java application does not need to maintain the encryption keys, as this is done by the Windows operating system.

---

_Safe icon above from [http://iconleak.com][4]._

[1]: https://github.com/peter-gergely-horvath/windpapi4j
[2]: https://msdn.microsoft.com/en-us/library/ms995355.aspx
[4]: http://iconleak.com/
