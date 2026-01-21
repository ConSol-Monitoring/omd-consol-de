---
author: Oliver Weise
author_url: https://twitter.com/kisaro247
date: '2018-06-25'
featured_image: /assets/2018-01-19-openshift_application_monitoring/OpenShift-Logo.png
meta_description: Sometimes CI/CD on OpenShift is not designed exactly around what
  the developers need. Here are some tipps for things to keep in mind.
tags:
- openshift
title: 'Developers vs. OpenShift CI/CD #1: Running applications locally'
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

In some OpenShift environments for building and delivering software we notice that the needs of developers, arguably a group of people who will have a great deal of contact with the platform, are not met as thoroughly as would have been possible.

Especially when it comes to software testing there is often much room for improvement. The usage of container platforms can improve testing techniques a lot but might also be a major blocker when it comes to the provided infrastructure. Good testing is already hard. Everything that makes it even harder, by forcing your developers into workarounds or compromises on testing quality will result in larger round trips, more testing effort, less valid testing, in short: wasted time.

So in this mini series of blog posts we will have a look into some possible fields of improvement and give recommendations on how to fix the respective situation.

Today we evaluate the fact, that some CI/CD setups for OpenShift may spoil the most simple type of testing a developer uses: Just running the software locally - in OpenShift.

<!--more-->

Most benefits that derive from using containers have to do with using container images as the distribution form of your software. They remove all the potential local dependencies, subtle differences in operating system and local services behavior that made the term "but it works on my machine" infamous. They enable you to use the exact same software in the exact same OS environment on all your deployments: your E2E test setup, your QA deployment and of course for production.

So why is it, that when your developers run the local development state of the software on their local machines for any manual testing purposes, they run it without any containerization?

![Reliable?](/assets/2018-06-25-openshift-pipelines-for-devs/meme-reliable.jpg)

Why is that? When one looks at the options of running local OpenShift clusters for testing everything seems great. There is [minishift](https://github.com/minishift/minishift) and the (minishift-based) [Container Development Kit](https://developers.redhat.com/products/cdk/overview/) or even just "oc cluster up" (oc is the command line tool to control OpenShift). Three ways to run your own local single node cluster, so every developer should be able to run any OpenShift project imaginable for themselves.

However, running your application locally will only be really effective if you are able to reproduce the exact same way that your CI/CD process runs it. You would need the same image building process and the same infrastructure that is used there. Otherwise you are again testing something different than what goes into production.

Here are some reasons that we saw, which prevented developers from doing effective local testing:

#### 1. Quite simply: The workstations of your developers might just don't have the "juice"

Their workstations may be too old or too weakly equipped to run substantial parts of your software inside minishift/oc. Granted, the hardware requirements for running a whole dockerized software infrastructure might be higher than just for your regular Tomcat/Payara/Wildfly. And if you need some more deployments than just your software to test effectively (databases, message brokers etc.) you will end up running even more software and using even more resources.

But let's keep it simple and give some numbers from our experience: We think you should have a "spare" 6GB of memory plus about 30 GB free disk drive for every cluster profile that you use. Oh yes, and your machines processor should be "contemporary", although not too fancy. If you think like we do, then providing developers with appropriate machines should be no issue at all. In almost any situation, giving your developers the right tools for their jobs will end up being way cheaper than any other path.

#### 2. More tricky: There may be no way for your developers to build container images the same way that CI/CD does it

Of course your developers will need to build images from their local project states to be able to test the containerized software locally. And this building process needs to work exactly like it is in the CI/CD pipeline. That however might not be possible. One reason we sometimes see is that the image building process used by the CI server is generally not portable. Maybe it uses some Jenkins-native image building functionality. Maybe some custom resources used by the build are only available right inside that process and not in local development.

The main solution here is mainly to think about this use case while you plan your environment. Here are some key concepts that you may use to reach this goal:

- **Use regular OpenShift build configs to build the images**. We know some customers avoid them because of their inflexibility. But they really shine by portability, as they can be easily used for local development, even if the build strategy is s2i or custom. To overcome flexibility issues use [binary builds](https://docs.openshift.com/container-platform/3.6/dev_guide/dev_tutorials/binary_builds.html) instead of direct Git checkout. This allows the build-starting process - be it CI/CD or local development  - to either upload project sources or prebuilt artifacts from the local file system. We see a trend to the latter as maven artifact building inside OpenShift build containers has its downsides.
- For many tasks around developing, building and testing around OpenShift **the [fabric8 maven plugin](https://maven.fabric8.io) is a viable helper**. Using it will allow you to perform many tasks via maven, so they are also developer-friendly. Have a look at its capabilities and how they match your use cases.

Another cause we see sometimes is that the developer does not have (easy) access to the base images used by the application image. This is mostly only a problem if you use custom base images, which however is a perfectly valid approach. To fix it you could provide your developers with [access to the docker registry](https://docs.openshift.com/container-platform/3.6/install_config/registry/securing_and_exposing_registry.html) of your public OpenShift via route. Using [regular docker pull commands](https://docs.openshift.com/container-platform/3.6/install_config/registry/accessing_registry.html) your developers can then retrieve the base images available there. Sometimes this is something that raises security concerns, but as the OpenShift registry quite effectively enforces the same authentication and project-based access restrictions that are also effective on direct OpenShift access we think that this is not really an issue.

Alternatively you could give your developers access to the source projects of those custom images so that they are able to build the base images themselves. Of course you then would need to ensure, that the respective base images of these are accessible for your developers.

#### 3. Setting up build, deployment and everything else in your local minishift for testing is a task too exhaustive

Yes it is, if you are doing it manually. So you shouldn't. :-) Instead leverage the "Infrastructure as code" capabilities of OpenShift. Create [OpenShift templates](https://docs.openshift.org/latest/dev_guide/templates.html) that contain a complete setup of your projects infrastructure. Parameterize them where appropriate, so that you can build any deployment stage of your CI/CD environment with it. Then check them in with your source code. Your CI/CD server can then use these templates to create and update the project infrastructure according to what is defined there.

And while you're at it, ensure that your developers can use the same template for their local minishift which they now also receive via Git. So they end up not only using the exact same images locally as later in production but also the exact same OpenShift infrastructure.