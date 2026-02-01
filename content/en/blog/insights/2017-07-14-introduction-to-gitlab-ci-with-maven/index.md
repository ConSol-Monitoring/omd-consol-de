---
layout: post
status: public
title: Introduction to GitLab CI with Maven
meta_description: An introduction to GitLab CI for Maven builds
author: Christian Guggenmos
author_url: https://twitter.com/gucce_it
featured_image: maven_gitlab.png

categories:
- development
tags:
- gitlab
- continuous integration
date: '2017-07-14T00:00:00+00:00'
---
<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="maven_gitlab.png"></div>

At ConSol we use [GitLab](https://about.gitlab.com) as our central Git server and I am quite happy with its functionality. Lately, I have been playing around with [GitLab CI](https://about.gitlab.com/features/gitlab-ci-cd/) with the objective of finding out if we can use it instead of [Jenkins](https://jenkins.io), our current CI server of choice.

Since most of our projects use [Maven](https://maven.apache.org), I was particularly interested in setting up a simple Maven build job.

To cut a long story short, yes, I would use GitLab CI in my next project. We'll later see why, but first I want to give a quick walkthrough of GitLab CI.

<!--more-->

## Requirements

To be able to try it out for yourself you need:

- A GitLab server with Pipelines activated
- A GitLab user with `Master` role in a project
- A spare server where GitLab CI agents can run (can be your own computer)

## How GitLab CI works

GitLab follows an agent based approach, i.e. everywhere you want to run a build you need to install a so-called [GitLab Runner](https://docs.gitlab.com/runner/). You can install as many GitLab Runners as you like and each Runner can run 1-n concurrent builds, which is configurable.

<img src="gitlab_runners.jpg" width="500">

In short, you need two things to get started with GitLab CI (apart from GitLab itself):

1. A file called `.gitlab-ci.yml` in you project root, which contains the command line instructions for your build
1. Install and register at least one GitLab Runner

## `.gitlab-ci.yml` Configuration

I have created a public GitLab project where you can find the code: [gitlabci-maven].

**Note** If you fork the project you will not fork the Runners and must provide you own Runners.

### Dead Simple Version

For a simple build this is as easy as it can be, little more than the Maven command itself. The following contents are everything you need to run a Maven build:

`.gitlab-ci.yml`

{% highlight yaml %}
maven_build:
  script: mvn verify
{% endhighlight %}

If the CI definition is so short you need to rely on a whole lot of implicit definitions you say? Of course, there's a lot of magic involved!

First of all, GitLab hosts your code, so it obviously knows how to clone it. Hence, we don't need to add any git repo related configuration.

Secondly, we assume that `mvn` (and thus also a JVM) is installed (and on the `PATH`) on our target system.

### Enhanced Version

A more sophisticated and explicit `.gitlab-ci.yml` could look as follows (with comments explaining the meaning):

{% highlight yaml %}
# These are the default stages.
# You don't need to explicitly define them.
# But you could define any stages you want.
stages:
  - build
  - test
  - deploy

# This is the name of the job.
# You can choose it freely.
maven_build:
  # A job is always executed within a stage.
  # If no stage is set, it defaults to 'test'.
  stage: test
  # Since we require Maven for this job,
  # we can restrict the job to runners with a certain tag.
  # Of course, it is our duty to actually configure a runner
  # with the tag 'maven' and a working maven installation
  tags:
    - maven
  # Here you can execute arbitrate terminal commands.
  # If any of the commands returns a non zero exit code the job fails.
  script:
    - echo "Building project with maven"
    - mvn verify
{% endhighlight %}

For a full specification of all possible commands, see the [GitLab CI YAML documentation](https://docs.gitlab.com/ee/ci/yaml/)

## Installing a GitLab Runner

Now that we have our `.gitlab-ci.yml` set up we need a GitLab Runner.

Runners are written in [Go](https://golang.org) and are available for several platforms including Linux, Windows, MacOS, FreeBSD, and Docker.

See GitLab documentation on how to [install a GitLab Runner](https://docs.gitlab.com/runner/install/).

Verify your installation:

{% highlight bash %}
$ gitlab-runner list
Listing configured runners                          ConfigFile=/etc/gitlab-runner/config.toml
{% endhighlight %}

As you can see there are zero GitLab Runners configured, so lets create one (as `root`, otherwise the runner can not be installed as service)

**NOTE** You can get the necessary parameters for the registration in your GitLab project under `Settings` > `Pipelines` > `Specific Runners`

{% highlight bash %}
# gitlab-runner register
Running in system-mode.

Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/):
https://gitlab.com/
Please enter the gitlab-ci token for this runner:
abcdefghijklm
Please enter the gitlab-ci description for this runner:
[build-n]: build-n-shell
Please enter the gitlab-ci tags for this runner (comma separated):
maven, java, ubuntu
Whether to run untagged builds [true/false]:
[false]:
Whether to lock Runner to current project [true/false]:
[false]: true
Registering runner... succeeded                     runner=HzUGN97U
Please enter the executor: parallels, virtualbox, docker+machine, docker, docker-ssh, shell, ssh, docker-ssh+machine, kubernetes:
shell
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
{% endhighlight %}

Shortly after you have registered your runner it shows up in the `Settings` > `Pipelines` > `Specific Runners` view.

<img src="runner.png" width="300">

## Running the Build

Now the Runner is ready to use. Every time you push a commit to your GitLab server it will trigger the pipeline. If you have only configured one Runner with the tag `maven` it will always run on this one. Otherwise, GitLab will randomly select an available Runner.

Each commit will have an icon attached to it representing the state of the pipeline (see also in [gitlabci-maven](https://gitlab.com/gucce/gitlabci-maven/commits/master)).

| `running` | `failed` | `passed` |
|-----------|----------|----------|
| <img src="./running.png" width="160"> | <img src="./failed.png" width="160"> | <img src="./passed.png" width="160"> |

An overview of all the pipelines which have been run is shown under `Pipelines` (see in [gitlabci-maven](https://gitlab.com/gucce/gitlabci-maven/pipelines)).

![pipelines](./pipelines.png)

On this overview page you can also see which jobs have been run within a pipeline.

<img src="./job.png" width="300">

And, of course, you can inspect the logs (see [gitlabci-maven](https://gitlab.com/gucce/gitlabci-maven/-/jobs/22214945)).

![log_output](./log_output.png)

In my opinion this is neatly integrated into the GitLab UI.

## Wrapup

That's it, you now have a working Maven build using GitLab CI. Of course, this is only the beginning and you should checkout GitLab's well-written documentation on their CI workflows. You might want to start with the [GitLab CI README page](https://docs.gitlab.com/ce/ci/README.html). Also checkout GitLab's [`.gitlab-ci.yml` for GitLab](https://gitlab.com/gitlab-org/gitlab-ce/blob/master/.gitlab-ci.yml) (sorry for the tongue twister, I couldn't resist).

### Jenkins vs. GitLab CI Regarding Maven

Let's now get back to my initial statement to prefer GitLab over Jenkins in my next project.

#### GitLab CI Disadvantages

Let's start first with its disadvantages.

- Only command line based, which is not for everyone (I actually prefer it)
- Does not support Solaris, HP-UX, etc. where Jenkins runs on due to Java (we actually have projects running on Solaris)
- Vendor lock-in
- No plug-in system (but you can use any terminal command available on your target system)
- Not customizable

#### GitLab CI Advantages

- One file per project contains the whole build (a lack thereof is my main pain point with Jenkins)
  - Automatically version controlled
  - Different branches can have different builds
  - Old revisions automatically have the corresponding build file
- Out-of-the-box Docker support (even though I didn't mention it in the article)
- Active and thoughtful development (Jenkins plugins are more often than not a mess)
- Declarative build definition (which I prefer over Jenkins' Pipeline plugin or Job DSL)

And now try it out for yourself. You can fork my project [gitlabci-maven] if you like.

[gitlabci-maven]: https://gitlab.com/gucce/gitlabci-maven
