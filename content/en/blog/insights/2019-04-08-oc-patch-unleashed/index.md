---
author: Olaf Meyer
author_url: https://twitter.com/ola_mey
date: '2019-04-08'
featured_image: ./OpenShift-Logo.png
meta_description: How to add, change, move and delete attributes with oc patch or
  kubectl patch
tags:
- openshift
title: oc patch unleashed
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="./OpenShift-Logo.png"></div>

Recently, I stumbled on a situation where I wanted to add a couple of values to an OpenShift deployment configuration. Previously I had modified or added a single attribute in a yaml file with `oc patch`. So I started to wonder whether it is possible to update multiple attributes with `oc patch` as well. To get right to the result: Yes, it is possible. This article will show you which features `oc patch` and likewise `kubectl patch` really have, beside a simple modification of one attribute.
<!--more-->

The following deployment configuration will be used throughout the article as an example. The other example deployment configurations shown below are only abstracts and contain only the important bits to show the effect of the `oc patch` command.

``` yaml
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: deployment-example
spec:
  replicas: 1
  selector:
    app: deployment-example
  strategy:
    type: Rolling
  template:
    metadata:
      labels:
        app: deployment-example
    spec:
      containers:
      - image: openshift/deployment-example
        name: deployment-example
        ports:
        - containerPort: 8080
          protocol: TCP

```

Let's start with a simple example to add a label `version` to the template section:

``` bash
oc patch dc deployment-example -p '{"spec":{"template":{"metadata":{"labels":{"version":"v1"}}}}}'
```

The result will look like this:

``` yaml
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: deployment-example
spec:
  replicas: 1
  selector:
    app: deployment-example
  strategy:
    type: Rolling
  template:
    metadata:
      labels:
        app: deployment-example
        version: v1
    spec:
      containers:
      - image: openshift/deployment-example
        name: deployment-example
        ports:
        - containerPort: 8080
          protocol: TCP
```

To change the value from `v1` to `version1`, execute the following command:

``` bash
{% raw%}
oc patch dc deployment-example -p '{"spec":{"template":{"metadata":{"labels":{"version":"version1"}}}}}'
{% endraw %}
```

And voilà the result looks like this:

{% highlight yaml hl_lines="15" %}
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: deployment-example
spec:
  replicas: 1
  selector:
    app: deployment-example
  strategy:
    type: Rolling
  template:
    metadata:
      labels:
        app: deployment-example
        version: version1
    spec:
      containers:
      - image: openshift/deployment-example
        name: deployment-example
        ports:
        - containerPort: 8080
          protocol: TCP
{% endhighlight %}

Easy, isn't it? But let's get rid of the label. You can do this with the following command:

``` bash
{% raw%}
oc patch dc deployment-example --type json -p '[{ "op": "remove", "path": "/spec/template/metadata/labels/version" }]'
{% endraw %}
```

In the next step, add multiple values to different places of yaml file. So let's add a label to the deployment configuration itself and one label to the template.

``` bash
{% raw%}
oc patch dc deployment-example -p '{"metadata":{"labels":{"version":"version1"}},"spec":{"template":{"metadata":{"labels":{"version":"version1"}}}}}'
{% endraw %}
```

The result is like expected:

{% highlight yaml hl_lines="6 17" %}
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: deployment-example
  labels:
    version: version1
spec:
  replicas: 1
  selector:
    app: deployment-example
  strategy:
    type: Rolling
  template:
    metadata:
      labels:
        app: deployment-example
        version: version1
    spec:
      containers:
      - image: openshift/deployment-example
        name: deployment-example
        ports:
        - containerPort: 8080
          protocol: TCP
{% endhighlight %}

So far we were using the default merge type `strategic`. Lets repeat the example above with the merge type JSON Patch:

``` bash
{% raw%}
oc patch dc deployment-example --type='json' -p='[{"op": "add", "path": "/metadata/labels/version", "value": "version1" },{"op": "add", "path": "/spec/template/metadata/labels/version", "value": "version1" }]'
{% endraw %}
```

Let's have a closer look what can be achieved by using JSON Patch. Another option would be to use `copy` to copy the first attribute instead of just adding it again with `add`. The command looks like this now:

``` bash
{% raw%}
oc patch dc deployment-example --type='json' -p='[{"op": "add", "path": "/metadata/labels/version", "value": "version1" },{"op": "copy", "from":"/metadata/labels/version" , "path": "/spec/template/metadata/labels/version" }]'
{% endraw %}
```

To change  the values we can use `replace`. So let's change the value of the labels `version1` to `version2`.  This can be done with this command:

``` bash
{% raw%}
oc patch dc deployment-example --type='json' -p='[{"op": "replace", "path": "/metadata/labels/version", "value": "version2" },{"op": "replace", "path": "/spec/template/metadata/labels/version", "value": "version2" }]'
{% endraw %}
```

Let's remove the new labels with this command:

``` bash
{% raw%}
oc patch dc deployment-example --type json -p '[{ "op": "remove", "path": "/spec/template/metadata/labels/version" },{ "op": "remove", "path": "/metadata/labels/version" }]'
{% endraw %}
```

You might have noticed that we used for the last command the parameter `type` to the value `json` to use JSON Patch. By default, the value of the parameter `type` is `strategic`. How resources are patched respectively merged for the type `strategic` is defined in the source code. This can be different between a resource and its subresources. How the resources are patched respective merged can be found in the OpenShift and Kubernetes Swagger documentation in the attribute "x-kubernetes-patch-strategy" of the resource. The value `merge` of the parameter `type` indicated that JSON Merge patch is used. With this type, you need to provide a complete new resource that you want to modify, because the new resource will replace the existing resource.

A comprehensive description about the effect of the parameter patch can be found here: [https://kubernetes.io/docs/tasks/run-application/update-api-object-kubectl-patch/#alternate-forms-of-the-kubectl-patch-command](https://kubernetes.io/docs/tasks/run-application/update-api-object-kubectl-patch/#alternate-forms-of-the-kubectl-patch-command)

# Summary

At this point, I hope you gained a good understanding about the capabilities of `oc patch`. As you have seen in the last examples, it is very easy to add, change, copy and remove attributes. I haven't described how to move attributes and verify that attributes exist with JSON Patch, however, it is still possible. I only can recommend to you at this point: Try it out for yourself and check where you can use it.

# Further reading

* Latest OpenShift OpenAPI documentation: [https://raw.githubusercontent.com/openshift/origin/master/api/swagger-spec/openshift-openapi-spec.json](https://raw.githubusercontent.com/openshift/origin/master/api/swagger-spec/openshift-openapi-spec.json)
* Latest Kubernetes OpenAPI documentation: [https://raw.githubusercontent.com/kubernetes/kubernetes/master/api/openapi-spec/swagger.json](https://raw.githubusercontent.com/kubernetes/kubernetes/master/api/openapi-spec/swagger.json)
* JSON Merge Patch RFC 7386: [https://tools.ietf.org/html/rfc7386](https://tools.ietf.org/html/rfc7386)
* JSON Patch RFC 6902: [https://tools.ietf.org/html/rfc6902](https://tools.ietf.org/html/rfc6902)
* The JSONPath websites offers a good description which operation can be used an how: [http://jsonpatch.com/](http://jsonpatch.com/)