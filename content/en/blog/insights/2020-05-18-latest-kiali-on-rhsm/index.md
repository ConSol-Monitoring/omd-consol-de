---
author: Olaf Meyer
author_url: https://twitter.com/ola_mey
date: '2020-05-18T00:00:00+00:00'
featured_image: OpenShift-Logo.jpg
meta_description: Unofficial guideline to get the latest and greatest version of Kiali
  running in Red Hat OpenShift Service Mesh
tags:
- openshift
title: Unofficial guideline to get the latest and greatest version of Kiali in OpenShift
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="OpenShift-Logo.jpg"></div>

During this year's Red Hat Summit I had the chance to get a glimpse of the latest version of Kiali. This version had some nice features, like the traffic flow of the application graph during a time period (Graph replay). It also contains wizards to create destination rules and virtual services. This demo has struck my curiosity to get the hands on this Kiali version. One obstacle for me was that my Kiali is running in Red Hat OpenShift Service Mesh and is controlled by the Kiali operator. Currently, it is using version 1.12. The version that I wanted to try was the latest release version (1.17). The Red Hat OpenShift Service Mesh does not support this version. This article describes what we need to do in order to replace the Kiali version of an Red Hat OpenShift Service Mesh with the latest version of Kiali.
<!--more-->
<br/>

---

*Disclaimer: The following changes of the Red Hat OpenShift Service Mesh are not supported by Red Hat. I cannot guarantee that the changes won't break the Red Hat OpenShift Service Mesh or your application. You do this at your own risk!*

---

Let's start with a short detour: How does the Kiali operator determines which versions of Kiali are supported in Red Hat OpenShift Service Mesh? If we look into the definition of the `ServiceMeshControlPlane`, it is possible to provide an image name and container registry. With this, we are able to change the source location of the Kiali image. This value is not helpful to get the latest version of Kiali in our service mesh since we cannot define the tag  of the Kiali image that we would like to use. If we now look at the Kiali resource definition, we will notice that this contains a version key. This version key is coupled with `KIALI_IMAGE_*` environment variables of the Kiali operator which determines the supported versions. To get these supported versions, we can use this command:

```bash
$ oc set env po kiali-operator-5fd5c849b9-zkl49 -n openshift-operators --list|grep -i kiali_
KIALI_IMAGE_default=registry.redhat.io/openshift-service-mesh/kiali-rhel7@sha256:76667b3532df11a511b03c4efa165723cff48aa5fb2e56a2ceb693c02a6bce7a
KIALI_IMAGE_v1_0=registry.redhat.io/openshift-service-mesh/kiali-rhel7@sha256:76667b3532df11a511b03c4efa165723cff48aa5fb2e56a2ceb693c02a6bce7a
KIALI_IMAGE_v1_12=registry.redhat.io/openshift-service-mesh/kiali-rhel7@sha256:e1fb3df10a7f7862e8549ad29e4dad97b22719896c10fe5109cbfb3b98f56900
```

Therefore, we can use Kiali version v1.0 and v1.12. In order to use the latest version of Kiali, we need to add an environment variable with the desired version in the Operator and change the Kiali resource to use it. However, as soon as the Operator is updated, it is very likely that our environment variable will be removed. Let us use a different approach: Update the version in the Kiali deployment which is controlled by the Kiali Operator. The advantage is that we only need to modify one resource and not two or more. Furthermore, the change is very easy and will only effect one namespace. The drawback is that the Kiali operator will overwrite the change in the deployment, in case a new version of the Kiali operator has been installed or the Kiali operator resource has been modified.

So let's change the Kiali version used by patching the desired Kiali deployment. For this we execute the following command:

```bash
$ oc patch deployment kiali --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"quay.io/kiali/kiali:v1.17"}]' -n <service mesh control plane namespace>
```

---

*Hint:* You can replace the version with a later version, if you like.

---

After this, the Kiali pod should be restarted. If this is successful and we open the Kiali application in a browser, we should see in the `About` the following dialog:

![](screenshot_kiali_about.jpg)

![](screenshot_kiali_about_dialog.jpg)

---

*Hint:* You might need to delete the browser cache in order to get the desired version running in your browser, because the css and JavaScript files may be cached.

---

So with this we have the latest and greatest version of Kiali running in our Red Hat OpenShift Service Mesh. So far, I have not encountered any problem when using the latest version of Kiali in my test environment.

One last remark: The feature that I liked most in Kiali 1.17 is the Graph replay feature. More information about this can be found here:

- [Video of Kiali and Jaeger Sprint #34 Demo - Service Mesh observability](https://youtu.be/04fGMBjHZ68?t=365)