---
author: Fabian Stäber
date: '2016-04-04T21:32:00+02:00'
tags:
- markdown, packer, documentation
title: Literate Shell Scripting with Markdown and Packer
---

[Markdown] is great for writing documentation or tutorials. However, executing the steps from a tutorial usually means to copy and paste the commands into a shell. There is no guarantee that the documentation is complete, and there is no protection against copy-and-paste errors.

This post shows how to **use [Packer] for automatically executing code snippets from Markdown files** on a variety of platforms. Machine images are created directly from the code snippets in the documentation. That way, documentation is guaranteed to be up-to-date and complete, and it can be integrated in an automated delivery pipeline.

<!--more-->

We call this approach _literate Shell scripting_, as a reference to Donald Knuth's way of [documenting computer programs].

Example Project
---------------

To exemplify this post, we created a tutorial on [how to set up a basic Ubuntu 15.10 server with SSH access]. This tutorial contains a few examples of Markdown documents:

* `update.md`: Initial package update.
* `timezone.md`: Setting the timezone.
* `firewall.md`: Simple firewall setup.
* `non-root-user-with-ssh-public-key.md`: Ssh access with public key.

The repository contains also a [basic-ubuntu-server-setup.json] configuration for running the code snippets from these documents, and [detailed instructions] on how to run it.

What is Packer?
---------------

[Packer] is tool for building machine images for [Amazon Web Services], [Virtual Box], [Digital Ocean], [VMWare], [Docker], and [many more] from a single configuration file.

A Packer build is configured via a JSON file called _template_. A simple Packer template looks like this:

```javascript
{
  "builders": [
    // Configuration of the various target platforms, like Amazon Web Service credentials, etc.
  ],
  "provisioners": [
      "type": "shell",
      "scripts": [
        // List of shell scripts to be executed.
      ]
  ],
  "variables": {
    // Environment variables that shouldn't be hard-coded in the shell scripts.
  }
}
```

Packer is a single executable, written in [Go]. The [example project] has instructions on how to install and run Packer.

Bringing Packer and Markdown Together
-------------------------------------

Packer's `shell` provisioner is very flexible: Instead of using the default `bash -e` to execute shell scripts, we can specify an `execute_command` that is used to run the scripts.

Within the Markdown file, all code fragments are between a line ```` ```bash ```` marking the beginning of the fragment, and a line ```` ``` ```` marking the end of the fragment like this:

<pre lang="no-highlight"><code>```bash
echo "this is a code snippet"
```
</code></pre>

We can use a one-liner as an `execute_command` that will execute only the code between these markers.

```json
  // ...
  "provisioners": [
    {
      "type": "shell",
      "execute_command": "awk '/```/{f=0} f; /```bash/{f=1}' {{ "{{ .Path " }}}} | {{ " {{ .Vars " }}}} /bin/bash -ex",
      "scripts": [
        "update.md",
        "timezone.md",
        "firewall.md"
      ]
    }
  ],
  // ...
```

The variables `{{ "{{ .Path " }}}}` for the Markdown file and `{{ "{{ .Vars " }}}}` for the environment variables are substituted by Packer. The `awk` command is a commonly used one-liner to strip text between a begin mark (```` ```bash ````) and an end mark (```` ``` ````).

Preventing Code Snippets from Being Executed
--------------------------------------------

Sometimes it is useful to mention code snippets in the documentation that are not meant to be executed in the automated build. As our Packer template only executes code beginning with ```` ```bash ````, we can ignore code by using one of `bash`'s [aliases], like ```` ```sh ````.

Executing Commands for a Specific Target Platform
-------------------------------------------------

Packer supports a large number of builders for various target platforms. The [example] is pre-configured with a builder for [Docker] to execute the code snippets locally, and a builder for [Digital Ocean] as an example of a cloud service. The file [basic-ubuntu-server-setup.md] shows how to run these pre-configured builders, and where to find information on other builders.

Sometimes commands differ from platform to platform. For example, `iptables` is not available on Docker, so we want to skip the firewall configuration in the Docker build. There are two ways to implement builder-specific commands. First, we can use the `override` property in the Packer template to change the build for specific target platforms:

```javascript
{
  "type": "shell",
  "scripts": [
    "update.md",
    "timezone.md",
    "firewall.md"
  ],
  "override": {
    "docker": {
      "scripts": [
        "update.md",
        "timezone.md"
      ]
    }
  }
}
```

The `override` property will merge with the rest of the builder configuration and change only the specified properties for a specific build. In the example above, the `firewall.md` is removed from the `scripts` for the Docker builder.

If the scripts differ only in a few commands, it might be more convenient to use the environment variable `PACKER_BUILDER_TYPE` in the shell scripts to learn which build is executed. This environment variable is set by Packer when executing shell commands.

Summary
--------

In this blog post, we introduced _literate shell scripting with Markdown and Packer_ as a way to write executable documentation. Building machines directly from the code snippets in Markdown files guarantees that the documentation is complete and up-to-date.


[Markdown]: https://guides.github.com/features/mastering-markdown/
[Packer]: https://www.packer.io/
[documenting computer programs]: https://en.wikipedia.org/wiki/Literate_programming
[how to set up a basic Ubuntu 15.10 server with SSH access]: https://github.com/consol/tutorials
[how to set up a basic Ubuntu 15.10 server with SSH access]: https://github.com/ConSol/basic-ubuntu-server-setup
[basic-ubuntu-server-setup.json]: https://github.com/ConSol/basic-ubuntu-server-setup/blob/master/basic-ubuntu-server-setup.json
[detailed instructions]: https://github.com/ConSol/basic-ubuntu-server-setup/blob/master/basic-ubuntu-server-setup.md
[Amazon Web Services]: http://aws.amazon.com
[Virtual Box]: https://www.virtualbox.org
[Digital Ocean]: https://www.digitalocean.com
[VMWare]: http://www.vmware.com
[Docker]: https://www.docker.com/
[many more]: https://www.packer.io/docs/
[Go]: https://golang.org/
[example project]: https://github.com/ConSol/basic-ubuntu-server-setup/blob/master/basic-ubuntu-server-setup.md
[aliases]: https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
[example]: https://github.com/ConSol/basic-ubuntu-server-setup/blob/master/basic-ubuntu-server-setup.md
[basic-ubuntu-server-setup.md]: https://github.com/ConSol/basic-ubuntu-server-setup/blob/master/basic-ubuntu-server-setup.md