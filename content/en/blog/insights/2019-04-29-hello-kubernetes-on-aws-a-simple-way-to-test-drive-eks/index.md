---
layout: post
date: '2019-04-29T00:00:00+00:00'
status: public
# Mandatory: Headline and title of the post
title: Hello Kubernetes on AWS! A simple way to test-drive EKS
# Optional (recommended): Short description of the content, ~160 characters. Will often be displayed on search engine result pages and when shared on social media platforms.
meta_description: A demo project to easily get started trying Kubernetes on AWS
# Mandatory: author name
author: Oliver Weise
# Optional, e.g. URL to your personal twitter account
author_url: https://twitter.com/kisaro247
# Optional (recommended): Path to an image related to the blog post. Will often be displayed when shared on social media platforms.
featured_image: ./amazon-aws-eks.png
# category of the post, e.g. "development", "monitoring", ...
categories:
- development
# one or more tags, e.g. names of technologies, frameworks, libraries, languages, etc.
# avoid proliferation of tags by using already existent tags
# see https://labs.consol.de/tags/
tags:
- Kubernetes
- aws
- eks
- eksctl
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="./amazon-aws-eks.png"></div>

Under the name of "Managed Kubernetes for AWS", or short EKS, Amazon offers its own dedicated solution for running Kubernetes upons its cloud platform. The way this is provided is quite interesting: While the Kubernetes Master Infrastructure is offered "as a service" (and also billed separately) the Kubernetes Worker Nodes are simply EC2 instances for which Amazon provides a special setup procedure. These now also offer the potential to use well known AWS features like Autoscaling for Kubernetes workloads.

However, manually setting up this infrastructure is still quite a complex process with multiple steps. To be able to quickly have an EKS Kubernetes Cluster up and running, and also to deploy a software project on it, we created a small helper project that offers the creation of a "turnkey ready" EKS cluster that can be quickly pulled up and also teared down after usage.

<!--more-->

If you still wait for a good reason to finally bet on Kubernetes as your future cloud computing platform: Even Amazon AWS jumps onto the bandwagon of Googles container orchestration framework and offer its own Managed Kubernetes service, although it already provides its own competing service in ECS.

But what do we understand by "Managed Kubernetes"? The main point of it is that you do not want to be the Administrator of the Kubernetes platform itself: its basic service, the hardware it runs on and all the offerings you expect from it like e.g. persistent storage and traffic routing. You only really want to use it as a platform to build things on top of it without ever caring about the platform internals. That is what "Managed Kubernetes" should offer you. It costs a bit extra, but then again the Administration most likely would cost you much more.

As we at Consol started to experiment with AWS Kubernetes in Software Engineering we quickly found that we we would want a way to automate the setup and pulldown process for EKS clusters as well as for the CI/CD of our test projects. Setting everything up manually just would need too much time that we could not spend upon the things we really wanted to play with.

Enter [**k8s-hello**](https://github.com/ConSol/k8s-hello), our base project for managing EKS "toy clusters", which we now make publicly available!

As such it does the following:

- It uses the excellent [eksctl tool](https://github.com/weaveworks/eksctl) by Weaveworks to create and destroy an EKS cluster based on an embedded cluster definition file.
- It contains a trivial Spring Boot application to be deployed on that Cluster, which can be used for the actual development.
- It defines an AWS CodeBuild pipeline for building that app and deploying it to the Kubernetes Cluster.
- It performs the creation and destruction of all these resources by the execution of a single script each.

Feel free to try it and tell us what you think! Just follow the usage instructions on the README.md file of the repo. And remember to pull down the cluster after trying it to reduce costs.
