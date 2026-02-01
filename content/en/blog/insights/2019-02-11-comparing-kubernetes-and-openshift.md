---
layout: post
date: '2019-02-11T00:00:00+00:00'
status: public
# Mandatory: Headline and title of the post
title: Comparing Kubernetes and OpenShift
# Optional (recommended): Short description of the content, ~160 characters. Will often be displayed on search engine result pages and when shared on social media platforms.
meta_description: An up-to-date comparison of Kubernetes and OpenShift
# Mandatory: author name
author: Markus Hansmair
# Optional (recommended): Path to an image related to the blog post. Will often be displayed when shared on social media platforms.
# featured_image: /assets/images/Kubernetes-OpenShift-Logo.png
# category of the post, e.g. "development", "monitoring", ... 
categories:
- devops
# one or more tags, e.g. names of technologies, frameworks, libraries, languages, etc.
# avoid proliferation of tags by using already existent tags
# see https://labs.consol.de/tags/
tags:
- openshift
- kubernetes
---



Kubernetes and OpenShift have a lot in common. Actually OpenShift is more or less Kubernetes with some additions. But what exactly is the difference?

It's not so easy to tell as both products are moving targets. The delta changes with every release - be it of Kubernetes or OpenShift. I tried to find out and stumbled across a few blog posts here and there. But they all where based on not so recent versions - thus not really up-to-date.

So I took the effort to compare the most recent versions of Kubernetes and OpenShift. At the time of writing v1.13 of Kubernetes and v3.11 of OpenShift. I plan to update this article as new versions become available.
<!--more-->

Before we dive into the comparision let me clarify what we are actually talking about. I will focus on bare [Kubernetes](https://kubernetes.io/), i.e. I will ignore all additions and modifications that come with the many distributions and cloud based solutions. On the other hand I will talk about [Red Hat OpenShift Container Platform (OCP)](https://www.openshift.com/products/container-platform/), being the enterprise product derived from [OKD](https://www.okd.io/) aka *The Origin Community Distribution of Kubernetes that powers Red Hat OpenShift*, previously know as *OpenShift Origin*. 

## Base

Both products differ in the environment they can run in. OpenShift is limited to Red Hat Enterprise Linux (RHEL) and Red Hat Enterprise Linux Atomic Host. I suppose this limitation is less due to technical reasons, but because Red Hat wants to make supporting OpenShift more viable. This assumption is supported by the fact that OKD also can be installed on [Fedora and CentOS](https://docs.okd.io/latest/install/prerequisites.html#hardware).

On the other hand Kubernetes doesn't impose many requirements concerning the underlying OS. Its package manager should be RPM or deb based - which means practically every popular Linux distribution. But probably you better stick to the most often used distributions Fedora, CentOS, RHEL, Ubuntu or Debian.

This applies for so-called bare metal installations (including virtual machines). It should be mentioned that creating a Kubernetes cluster on that level requires quite some [effort and skills](https://github.com/kelseyhightower/kubernetes-the-hard-way) (see below).

But this is the age of cloud computing, so deploying Kubernetes on an IaaS platform or even using [managed Kubernetes clusters](https://kubernetes.io/docs/setup/pick-right-solution/#hosted-solutions) are also practicable approaches. Kubernetes can be deployed on any major IaaS platform: [AWS, Azure, GCE, ...](https://kubernetes.io/docs/setup/pick-right-solution/#turnkey-cloud-solutions).

Compared to that there is only a limited selection of OpenShift service providers. [OpenShift Online](https://www.openshift.com/products/online/) where you get your own projects on a shared OpenShift cluster and [OpenShift Dedicated](https://www.openshift.com/products/dedicated/) to get your own dedicated OpenShift cluster in the cloud - the latter based on Amazon Web Services (AWS). If you try really hard you also find a few more providers, like T-System's [AppAgile PaaS](https://www.t-systems.com/de/de/loesungen/cloud/paas-loesungen/appagile-paas-und-appagile-big-data/platform-as-a-service-und-data-analytics-62872), DXC's [Managed Container PaaS](http://www.dxc.technology/cloud/offerings/140039/144459), Atos' [AMOS](https://www.redhat.com/en/about/press-releases/atos-launches-managed-openshift-red-hat-accelerate-businesses-digital-transformation) and Microsoft's [OpenShift](https://www.redhat.com/en/about/press-releases/red-hat-and-microsoft-co-develop-first-red-hat-openshift-jointly-managed-service-public-cloud) - the latter two only announced yet. Like Kubernetes OpenShift can also be run on the [all major IaaS platforms](https://www.openshift.com/learn/resources/reference-architectures).

## Rollout

Rolling out Kubernetes is [not an easy task](https://kubernetes.io/docs/setup/scratch/). As a consequence of the multitude of platforms it runs on, together with the diversity of options for additional required services there is an impressive list of 'turnkey solutions' promising to facilitate creating Kubernetes [clusters on premises](https://kubernetes.io/docs/setup/pick-right-solution/#on-premises-turnkey-cloud-solutions) 'with only a few commands'. Most (if not all) are based on one of the following installers.

* **RKE** (Rancher Kubernetes Everywhere): Installer of Rancher Kubernetes distribution
* **kops**: Installer maintained by the Kubernetes project itself to roll out OpenShift on AWS and (with limitations) also on GCP.
* **kubespray**: Community project of a Kubernetes installer for bar metal and most clouds based on Ansible and kubeadm.
* **kubeadm**: Is also an installer provided by the Kubernetes project. It's more focused on bare metal and VMs. It imposes some prerequisites concerning the machines and is less of a 'do it all in one huge leap' tool. It can also be used to add and remove a single node to / from an existing cluster.
* **kube-up.sh**: deprecated predecessor of kops

OpenShift on the other hand aims to be a full-fletched cluster solution without the need to install additional components after the initial rollout. Apparently it is mainly targeted towards manual installation on physical (or virtual) machines. Consequently it comes with its own installer based on Ansible. It does a decent job installing OpenShift based on only a minimal set of configuration parameters. However, rolling out OpenShift is still a complex task. There is a plethora of options and variables to specify the properties of the intended cluster.

## Web-UI

When it comes to administrating the cluster and checking the status of the various resources via a web based user interface you hit one big difference between Kubernetes and OpenShift.

Kubernetes offers the so called dashboard. In my opinion it's just an afterthought. It's not an integral part of the cluster but has to be [installed separately](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#deploying-the-dashboard-ui). Additionally it's not easily accessible. It's not just firing up a certain URL, but you have to use `kube proxy` to forward a port of your local machine to the cluster's admin server. The URL is impossible to memorize: http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/ But even then another obstacle: There is no login page, but authentication and authorization are achieved with a bearer token that needs to be created manually beforehand with a sequence of `openssl` commands and copied to your `~/.kube/config`. Come on!

The result is a web UI that indeed informs you about the status of many components but turns out to be of limited values for real day-to-day administrative work since it lacks virtually any means to create or update resources. You can upload YAML files to achieve that. So what's the gain compared to using `kubectl`?

Compared to that OpenShift's web console truly shines. It has a login page. It can be accessed without jumping several loops. It offers the possibility to create and change most resources in a form based fashion.

With the appropriate rights the web UI also offers you the cluster console for a cluster wide view of many resources (e.g. nodes, projects, cluster role bindings, ...). However, you cannot administrate the cluster itself via the web UI (e.g. add, remove or modify nodes).

## Integrated image registry

There is no such thing as an integrated image registry in Kubernetes. You may setup and run your own private docker registry. But as with many additions to Kubernetes the procedure is not well documented, cumbersome and error-prone.

OpenShift comes with its integrated image registry that can be used side by side with e.g. Docker Hub and Red Hat's image registry. It is typically used to store build artifacts and thus cooperates nicely with OpenShift's ability to build custom images (see below).

Not to forget the registry console that presents you valuable information about all images and image streams, their relation to the cluster's projects and permissions on the streams. The latter being a prerequisite for OpenShift's ability to host multiple tenants hiding the artifacts of one projects from members of other projects. 

## Image streams

Image streams is a concept unique to OpenShift. It allows you to reference images in image registries - either internal in your OpenShift cluster or some public registry by means of tags (not to be confused with tags of docker images). You can even reference a tag within the same image stream. The power of image streams comes from the ability to trigger actions in your cluster in case the reference behind a tag changes. Such a change can be caused either by uploading a new image to the internal image registry or by periodically checking the image tag of an external image registry. In both cases the corresponding image stream tag(s) is / are updated and the action(s) are triggered.

Kubernetes has nothing like that - not even as a third party solution that can be added separately.

## Builds

Builds is another core concept of OpenShift not available in Kubernetes. It is realized by means of jobs of the underlying Kubernetes. We have Docker builds, source-to-image builds (S2I), pipeline builds (Jenkins) and custom builds. Builds can be triggered automatically when the build configuration changes or when a base image used in the build or the code base of a source-to-image build is updated. Typically the resulting artifact is another image that is uploaded to the internal image registry triggering further actions (like deployment of the new image).

Nothing comparable exists in Kubernetes. You may craft you own image and run it as a job to mimic any of the above mentioned build types. But it will still lack the property of being triggered when some of the input gets updated or of triggering further actions. 

## Jenkins inside

Pipeline build is a special form of source-to-image builds. It's actually an image containing a Jenkins that monitors configured ImageStreamsTags, ConfigMaps and the build configuration and starts a jenkins build in case of any updates. Resulting artifacts are uploaded to image streams, which may automatically trigger subsequent deployments of the artifacts.

As already mentioned in the previous section there is nothing like that in Kubernetes. However, you may build and deploy your own custom Jenkins image that will drive your CI / CD process. The resulting artifacts will be docker images uploaded to some image repository. By means of the Jenkins Kubernetes CLI plugin these artifacts can then be deployed in the cluster. But it's all hand crafted.

## Deployment of applications

The native means of deploying an application that consists of several components (pods, services, infress, volumes, ...) in Kubernetes is Helm. It is superior to OpenShift Templates. Thus OpenShift Templates can be converted into Helm Charts, but not the other way round. Apparently Helm was not designed with a security or enterprise focus in mind. So by default running Helm requires privileged pods (for Tiller) making it possible for anybody to install an application everywhere in the cluster. Helm can be tweaked to be more secure and aware of Role Based Access Control (RBAC). Helm cannot be deployed in an OpenShift cluster due to the mentioned security concerns.

(Actually you can deploy [Helm on OpenShift](https://blog.openshift.com/getting-started-helm-openshift/) but you have to jump several loops, consider (i.e. ignore) security implications and still end up with a Helm installation that is somewhat limited compared to one on Kubernetes.)

OpenShift comes with two mechanismes to deploy applications: Templates and Ansible Playbook Bundles.

Templates predate Helm Charts in Kubernetes. The concept is pretty simple. One YAML file with descriptions of all required cluster resources. The descriptions can be parameterized by means of placeholders that are substituted by concrete values during deployment.

Ansible Playbook Bundles (ABP) are way more flexible. They are basically docker images with the Ansible runtime and a set of Ansible Playbooks to provision, deprovision, bind and unbind an application.

Both Templates and APBs can be made available in the respective Service Broker (Template Service Broker and OpenShift Ansible Broker).

## Service Catalog, Service Broker

Service catalog is an optional component of Kubernetes that needs to be installed separately. After installation it needs to be wired together with existing service brokers by means of creating ClusterServiceBroker instances. Operator can then query the service catalog and provision / unprovision offered services. The service catalog of Kubernetes is more targeted at managed services offered by cloud providers, less at means to provision services within the cluster. 

OpenShift comes with a service catalog backed by two service brokers (by default): Template Service Broker and OpenShift Ansible Broker. The Template Service Broker serves all templates available in the cluster. New templates are created with `oc create -f <template>.json`. OpenShift Ansible Broker serves all Ansible Playbook Bundles installed in this cluster. New Ansible Playbook Bundles are created and installed with the command line tool `abp`. As with Kubernetes you may also integrate a service broker for managed services. e.g. the [AWS service broker](https://github.com/awslabs/aws-servicebroker/).

OpenShift's web console offers a graphical view on the entities provided by the service catalog allowing to comfortably deploy the selected application (or service).

## Exposing services

Everything that makes a group of pods with equal functionality accessible through a well-defined *gateway* is called a service. In Kubernetes there is a confusing diversity of options concerning services: *ClusterIp*, *NodePort*, *LoadBalancer*, *ExternalName*, *Ingress*. Everything except *ClusterIP* are means to make a service accessible by the outside (i.e. cluster external) world. *NodePort* is not recommended for anything but ad-hoc access during development and troubleshooting. *Ingress* is a reverse proxy for HTTP(S) forwarding traffic to a certain service based on host name (virtual hosts) and / or path patterns. It also handles TLS termination and load balancing.

*LoadBalancer*, *ExternalName* and *Ingress* are not available in Kubernetes out-of-the-box but have to be provided by third-party solutions. Typically the cloud provider that runs the underlying infrastructure of the Kubernetes cluster also offers the components required for these options. So when you run your own cluster on bare metal or with virtual machines you again have to tackle the task to install the required components by hand.

With OpenShift you basically have the same options when it comes to services (since OpenShift is based on Kubernetes). But they are more or less kept under the hood. You just have services being accessible only internally (which boils down to services of type *ClusterIP*) and you have *routers* being the analogon of *Ingress*. *Router* is (by default) based on HAProxy and can handle HTTP, HTTPS (with SNI) and TLS (with SNI). In case the setup of HAProxy as it comes with OpenShift is not sufficient for your use case you have the option to [deploy a customized HAProxy](https://docs.openshift.com/container-platform/3.11/install_config/router/customized_haproxy_router.html) or replace it altogether with [F5 BIG-IP](https://clouddocs.f5.com/containers/v2/openshift/). Contrary to exposed services in Kubernetes a *router* has no impact on the underlying service. The service type remains the same (typically *ClusterIP*).

## Authentication

User is not a first class citizen in Kubernetes (i.e. User is not a Kubernetes object). There is no login command in Kubernetes. Instead credentials are configured in so-called contexts stored in `~/.kube/config` (or some other config file). The current context can be switched with `kubectl config set-context ...`. There is only one authentication method that is available out-of-the-box:

**X509 client certificates**: Every Kubernetes cluster comes with a CA certificate and CA key. You can use these files to generate a X509 client certificate with a sequence of `openssl` commands. The certificate contains the user name and group names. The certificate is then put in the current context in `~/.kube/config`. Each request to an API server is verified against the configured CA certificate.

Apart from that there are other means of authentication. But all of them require more or less effort to set up and configure. I list them here in the order of estimated effort.

**Static tokens**: Tokens are generated in some way and added to the current context in `~/.kube.config`. Each request to the API server contains this token and is verified against a configured list of tokens on the API server. The list also provides user and group names.

**Basic authentication**: Authentication headers in requests are verified against a clear-text(!) password file. This file also delivers group names.

**OpenID tokens** : This option requires a stand-alone identity provider that delivers ID tokens. Additionally it requires an OIDC plugin for kubectl. There is no 'behind the scene' communication between the Kubernetes API server and the identity provider. Instead the ID token is simply verified against the certificate of the identity provider.

**Webhook tokens**: Tokens are provided and verified by an authentication service that implements a simple REST-like API.

**Authentication proxy**: Sits between client and Kubernetes API server. Adds information about authenticated user, groups and extra data as configurable request headers (e.g. X-Remote-User, X-Remote-Group) Transmission of credentials from client to proxy and actual authentication is totally up to the proxy.

So getting users identified and authenticated plus the list of groups the user belongs to always requires some effort. If you want to apply a solution for a few more users on a cluster being used seriously you will have to set up (again) some additional service(s).

Apart from real users each Kubernetes cluster also requires service accounts. Contrary to real users service accounts are managed by the Kubernetes API. They are authenticated by means of tokens provided by a component named Token Controller. Tokens are mounted into pods at well-known locations. Service accounts are bound to specific namespaces.

<a id="oauth"></a>OpenShift has an integrated OAuth server. The actual authentication is delegated to some identity provider. OpenShift's OAuth server comes with 11 different adapters to access all kind of identity providers:

`AllowAllPasswordIdentityProvider`, `DenyAllPasswordIdentityProvider`, `HTPasswdPasswordIdentityProvider`, `KeystonePasswordIdentityProvider`, `LDAPPasswordIdentityProvider`, `BasicAuthPasswordIdentityProvider`, `RequestHeaderIdentityProvider`, `GitHubIdentityProvider`, `GitLabIdentityProvider`, `GoogleIdentityProvider`, `OpenIDIdentityProvider`.

A fresh installation uses the `DenyAllPasswordIdentityProvider`, i.e. any way you have to adapt your installation to use your preferred identity provider. Alternatively authentication with X509 client certificates is also possible as in Kubernetes (see above).

## Authorization

This topic used to expose a big difference between Kubernetes and OpenShift. But with Role Based Access Control (RBAC) in Kubernetes regarded production ready since v1.8 (Oct 2017) Kubernetes has catched up quite a bit.

Role Based Access Control assigns permissions to users by means of roles. Roles are collections of permissions (aka rules). Rules are tuples of resources, verbs and API group, e.g. (Pod, create, api/v1/pods). Roles usually get assigned indirectly via groups. Thus: user → group → role → rule. Roles can be project (namespace) specific or cluster wide.

RBAC is basically the same in Kubernetes and OpenShift.

But there is another aspect of authorization: Security Contexts. These are collections of privileges, access control settings and capabilities assigned to pods and containers. In Kubernetes they are part of the specification of pods or containers. Whereas in OpenShift we have a separate resource Security Context Constraint (SCC). SCCs are associated with users and groups (like roles). The actual user that deploys a pod and container (typically a service account) determines the SCCs applied for this specific pod and container.

Additionally SCCs are subject to RBAC, i.e. only with the proper permission a user (typically a service account) is allowed to attach (use) a certain SCC to a pod that is about to be created. There is a beta feature in Kubernetes called Pod Security Policies (PSP) bringing Kubernetes even closer to OpenShift with respect to authorization.

## Logging

Kubernetes provides no native storage solution for log data, but you can integrate many existing logging solutions into your Kubernetes cluster. The recommended approach is to run a logging agent on each node (by means of a DaemonSet) collecting log output of the application pods on STDOUT and STDERR and forwarding log messages to some central log storage. The recommended logging agent is fluentd. It's used by Stackdriver (the log storage of GCP) and by ElasticSearch.

OpenShift comes with the EFK (ElasticSearch, fluentd, Kibana) stack as a logging solution. It is not installed out of the box but can be easily added to the installation by changing one variable in the Ansible inventory file.

## Monitoring

Monitoring is not part of the core installation of Kubernetes - as with many features of Kubernetes. However, the architecture is open to third party monitoring solutions.

As with version 3.11 OpenShift comes with two monitoring (metrics) solutions: one based on Prometheus and a Grafana web frontend that is installed by default and one legacy stack based on Hawkular, Heapster, Cassandra that is not installed by default but can easily be included by setting one variable in the Ansible inventory file. With OpenShift version 4.0 the Prometheus based solution is intended to finally [replace the older Hawkular](https://docs.openshift.com/container-platform/3.11/release_notes/ocp_3_11_release_notes.html#ocp-311-major-changes-in-40) based stack.

## Storage service (backing persistent volumes)

OpenShift has not altered or extended the concept of persistent volumes and persistent volumes claims inherited from Kubernetes. Thus it's basically the same on both platforms. The list of supported backing storage services differs slightly.

| Storage service | [Kubernetes](https://kubernetes.io/docs/concepts/storage/volumes/#types-of-volumes) | [OpenShift](https://docs.openshift.com/container-platform/3.11/install_config/persistent_storage/index.html) |
| --- | --- | --- |
| AWS Elastic Block Store (EBS)              | ✓ | ✓ |
| Azure Disk                                 | ✓ | ✓ |
| Azure File                                 | ✓ | ✓ |
| Ceph FS                                    | ✓ |   |
| Ceph RBD                                   | ✓ | ✓ |
| Cinder (OpenStack block storage)           | ✓ | ✓ |
| Fibre Channel                              | ✓ | ✓ |
| FlexVolume                                 | ✓ | ✓ |
| Flocker                                    | ✓ |   |
| GCE Persistent Disk                        | ✓ | ✓ |
| GlusterFS                                  | ✓ | ✓ (see below) |
| HostPath (to be superseded by LocalVolume) | ✓ | ✓ |
| iSCSI                                      | ✓ | ✓ |
| NFS                                        | ✓ | ✓ |
| Portworx Volumes                           | ✓ |   |
| Quobyte Volumes                            | ✓ |   |
| ScaleIO Volumes                            | ✓ |   |
| StorageOS                                  | ✓ |   |
| VMWare vSphere                             | ✓ | ✓ |

<a id="ocs"></a>OpenShift comes with *Red Hat OpenShift Container Storage* which is basically *Red Hat Gluster Storage* and can be enabled by [tweaking the Ansible inventory file](https://redhatstorage.redhat.com/2018/09/18/running-openshift-container-storage-3-10-with-red-hat-openshift-container-platform-3-10/) prior to installing the cluster. Other storage solutions need to be enabled and configured after installation and may require additional setup procedures.

## Networking

Kubernetes deals with cluster wide network traffic in a very abstract way. As with some other components Kubernetes does not come with its native networking solution but only offers interfaces that third party network plugins can use to perform their task. There is [a long list](https://kubernetes.io/docs/concepts/cluster-administration/networking/#how-to-implement-the-kubernetes-networking-model) of network plugins available. On top of that (if the deployed network solution allows) you can define resources of type [`NetworkPolicy`](https://kubernetes.io/docs/concepts/services-networking/network-policies/). A controller provided by your networking solution will pick up those resources and apply the coded rules in an appropriate way.

<a id="ovs"></a>OpenShift uses the same concepts but comes with its native networking solution out-of-the-box: [Open vSwitch](https://docs.openshift.com/container-platform/3.11/architecture/networking/sdn.html) (OVS). (Of course you may replace this networking solution by some other that better fits your needs.) OVS has its own plugin architecture offering three different plugins:

* **ovs-subnet** where all pods of your cluster are members of one flat software defined network (SDN).

* **ovs-multitenant** provides project-level isolation for pods and services by means of virtual network IDs (VNIDs). Each project is assigned a unique VNID; each pod and service inherits its project's VNID and each network packet gets attached the VNID of the originating pod or service. OVS ensures that packets can only be routed to destinations of the same VNID (or VNID == 0 to be able to reach infrastructure pods).

* **ovs-networkpolicy** honors `NetworkPolicy` resource objects (as described above).

## Conclusion

Since OpenShift is based on Kubernetes the two products have a lot in common. But there are also significant differences. Even more interesting: With every release the delta between Kubernetes and OpenShift is shrinking as Kubernetes is slowly catching up - most prominently with the introduction of RBAC.

Obviously OpenShift was designed with an enterprise usage scenario in mind so comes with many components required (or at least desirable) for a serious production cluster. These additions (compared to Kubernetes) are installed out-of-the-box or can be included into the installation without much effort.

Kubernetes on the other hand started as a mere container orchestration platform. A Kubernetes installation is open to many additions to make it more useful or integrate it with existing infrastructure (e.g. an existing identity provider). Unfortunately this mostly requires quite some effort and skill. As a consequence setting up a Kubernetes cluster from scratch that comes close to OpenShift is an arduous task. No wonder there are so many solutions that promise to make installing Kubernetes on premises somewhat easier. The most viable options to get Kubernetes up and running are the many cloud based 'turnkey solutions' or managed Kubernetes clusters.

So in my opinion there are currently 4 real USPs with OpenShift:

* [Builds and triggers](#builds)
* [Integrated image registry](#integrated-image-registry) and [image streams](#image-streams)
* [Jenkins support](#jenkins-inside)
* [Web console](#web-ui)

The following topics still put OpenShift ahead of Kubernetes since a similar solution with Kubernetes requires the effort of installing and integrating of a separate product while OpenShift comes with something out-of-the-box:

* [OAuth server](#oauth) with integration with many identity providers
* [Logging](#logging) and [monitoring](#monitoring) out of the box
* Comes with a [networking solution](#ovs)
* Comes with a [storage provider](#ocs)
* Managable [rollout](#rollout)
