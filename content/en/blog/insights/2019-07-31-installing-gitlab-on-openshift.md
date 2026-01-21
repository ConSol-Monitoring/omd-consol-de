---
author: Markus Hansmair
date: '2019-07-31'
featured_image: /assets/images/OpenShift-Logo.png
meta_description: A step-by-step recipe on how to install GitLab on OpenShift
tags:
- openshift
title: Installing GitLab on OpenShift
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

We recently had to install a bunch of applications on a customer's shiny new OpenShift 3.11 cluster. Among others also GitLab.  Turned out getting GitLab up and running on OpenShift is not so easy. What I found on the Internet about installing GitLab on OpenShift was partly outdated and not 100% accurate. Most information was about getting GitLab into a Kubernetes cluster.  So I had to adapt these information to the situation in an OpenShift cluster.

This article is the conclusion of all these findings and efforts and gives a step-by-step recipe on how to install GitLab on OpenShift.
<!--more-->

GitLab will be installed by means of a group of Helm charts initially intended for Kubernetes. With some tweaks this can also be used for an OpenShift installation. Some links

* [Installing GitLab on OpenShift](https://docs.gitlab.com/charts/installation/cloud/openshift.html)

* [GitLab Helm Chart Deployment Guide](https://docs.gitlab.com/charts/installation/deployment.html)

* Many [configuration settings](https://docs.gitlab.com/charts/charts/globals.html) plus many pages linked from there

* [Tillerless Helm](https://rimusz.net/tillerless-helm)

Always be aware that the relevant documentation found in the WWW might not be 100% acurate or simply outdated.

The installation will be performed on OpenShift 3.11.  With the exception concerning Helm versions I will not cover any details about other OpenShift versions.  Your mileage will vary in case you try to install GitLab on older OpenShift clusters.

GitLab will be set up to rely on an Active Directory server for user authentication. The setup for LDAP is basically the same. I disabled GitLab's own image registry, Nginx ingress and certificate manager as recommended on [Installing GitLab on OKD (OpenShift)](https://docs.gitlab.com/charts/installation/cloud/openshift.html).

**UPDATE 2019-09-06** After one month we observed that the Prometheus server that is installed together with GitLab was continously crashing. I've added a [chapter](#configure-data-retention-for-prometheus) about how to prevent this behaviour.

## Install and configure Helm

Get the release archive of Helm from [https://github.com/helm/helm/releases/tag/v2.12.3](https://github.com/helm/helm/releases/tag/v2.12.3). It is mandatory not to use the latest version of Helm but v2.12.x as this fits best to OpenShift v3.11. Extract the self-contained helm binary to a directory in your path. Verify it can be executed and has the right version with

```
helm version
```

Now set up Helm, install the Tiller plugin and add the GitLab repository.

```
helm init --client-only
helm plugin install https://github.com/rimusz/helm-tiller
helm repo add gitlab https://charts.gitlab.io/
helm repo update
```

## Prepare the installation

Latest at this point you have to make sure you are already logged in to the desired target OpenShift cluster.

```
oc login https://<api-endpoint-url>
```

> In case you have already tried to install GitLab and want to start over for some reason here is how to get rid of all remains of the previous installation.
> 
> ```
> oc delete project gitlab
> 
> oc delete clusterrole gitlab-prometheus-kube-state-metrics
> oc delete clusterrole gitlab-prometheus-server
> oc delete clusterrolebinding gitlab-prometheus-alertmanager
> oc delete clusterrolebinding gitlab-prometheus-kube-state-metrics
> oc delete clusterrolebinding gitlab-prometheus-node-exporter
> oc delete clusterrolebinding gitlab-prometheus-server
> ```

GitLab will be installed in its own OpenShift project (aka namespace) named `gitlab`.

```
oc new-project gitlab
```

The Helm chart is intended for installing GitLab in a Kubernetes cluster, so will clash with some of the stricter restrictions in OpenShift. To get around this you need to assign some additional permissions.

```
oc adm policy add-scc-to-user anyuid -z gitlab-shared-secrets
oc adm policy add-scc-to-user anyuid -z gitlab-gitlab-runner
oc adm policy add-scc-to-user anyuid -z gitlab-prometheus-server
oc adm policy add-scc-to-user anyuid -z default
```

> This is one of the examples where information from the [Internet](https://docs.gitlab.com/charts/installation/cloud/openshift.html) is definitively not correct. I tried it!

Decide what URL will finally be used to access your GitLab instance (e.g. https://gitlab.&lt;my-domain&gt;).  Get the certificate and key used for the host name and store them in files named `tls.crt` and `tls.key`. Chances are you use a wildcard certificate, e.g. `*.<my-domain>` Mind that `tls.crt` must contain the complete certificate chain up to (but not including) the root CA certificate.

> In case you want to get along with the self-signed certificates provided by your OpenShift installation extract the certificate (chain) and the server key from the secret named `router-certs` in the `default` namespace
>
> ```
> oc get -n default secret router-certs -o jsonpath='{.data.tls\.crt}' | base64 -d > tls.crt
> oc get -n default secret router-certs -o jsonpath='{.data.tls\.key}' | base64 -d > tls.key
> ```
>
> You should end up with two text files named `tls.crt` and `tls.key` like
> 
> ```
> -----BEGIN CERTIFICATE-----
> MIIDNjCCA....
> ```
> 
> ```
> -----BEGIN RSA PRIVATE KEY-----
> MIIEowIBAA....
> ```
>
> Mind that for this scenario you have to adapt the value `global.hosts.domain` in `gitlab-values.yml` to the default wildcard domain for your cluster applications, e.g.
>
> ```
> global:
>   ....
>   hosts:
>     domain: apps.<my-domain>
> ```

Create two secrets required for the installation.

```
oc create secret tls gitlab-certs --cert=tls.crt --key=tls.key
oc create secret generic gitlab-ldap-secret --from-literal=password=<ldap-password>
```

Create a file named `gitlab-values.yml` with the input for the Helm charts. Use the following example as a starting point.

```
certmanager:
  install: false
global:
  appConfig:
    ldap:
      servers:
        main:
          base: <base-dn> # may not be necessary in your case
          bind_dn: <username>
          host: <ldap-hostname>
          label: <label> # will appear on the login page
          password:
            key: password
            secret: gitlab-ldap-secret
          port: 389
          encryption: plain
          uid: sAMAccountName # attribute name where the login name is stored
  edition: ce
  email:
    from: <from-address-for-notifications>
  hosts:
    domain: <my-domain> # your TLS certificates must match gitlab.<my-domain>
    externalIP: <external-ip>   # of gitlab.<my-domain>
  ingress:
    configureCertmanager: false
    tls:
      secretName: gitlab-certs
  smtp:
    address: <mail-server>
    authentication: ""
    domain: <my-domain>
    enabled: true
    port: 25
nginx-ingress:
  enabled: false
registry:
  enabled: false
gitlab:
  sidekiq:
    registry:
      enabled: false
  task-runner:
    registry:
      enabled: false
  unicorn:
    registry:
      enabled: false
```

There are many more [options](https://docs.gitlab.com/charts/charts/globals.html) to deviate from the standard installation. Adapt according to your needs. `uid: sAMAccountName` is specific for Active Directory and needs to be adapted in case you use another LDAP server (with another LDAP schema).

> Mind the last few lines explicitely disabling the installation and usage of an image registry provided by GitLab. `registry.enabled: false` alone is not enough. I tried it and ended up with obscure problems, e.g. when deleting projects.

With these settings your GitLab installation will use a dedicated (non-replicated) instance of PostgreSQL within the same OpenShift project `gitlab`.  This setup is not really intended for production use (e.g. no replication).  In case you want to use a separate PostgreSQL installed elsewhere add a `global.psql` section in `gitlab-values.yml`.


```
global:
  ....
  psql:
    host: <fqdn-of-postgresql-server>
    port: 5432
    username: <username>
    database: <database-name>
    password:
      secret: <secret-with-password-of-psql.username>
      key: <key-within-secret>
```

## Considerations about versions

For the installation you have to specify the version of the Helm chart to use.  (You may omit the version, then the lastest version will be used.) For the mapping between Helm chart versions and GitLab version refer to the [GitLab version mapping](https://docs.gitlab.com/charts/installation/version_mappings.html).

The correct version of the Helm chart (e.g. 2.1.1) is extremely important in case you want to restore a GitLab installation from a previously created backup. The chart version and thus the version of GitLab must match exactly the version of the installation where the backup archive was created.

## Installation with Helm chart

After these preparatory steps here the actual installation

```
helm tiller start gitlab
helm upgrade --install -f gitlab-values.yml gitlab gitlab/gitlab --version 2.1.1 --timeout 600
```

By the time of writing 2.1.1 was the most recent Helm chart version deploying GitLab version 12.1.1. You may choose another version or omit the `--version` altogether thus using the latest version.

It will take a couple of minutes until all pods are up and running (except the gitlab-runner pods).

## Fix the GitLab Runner deployment

You have to fix the deployment `gitlab-gitlab-runner`. The pod needs the server certificate provided by the secret `gitlab-certs` that you prepared in the initial section.

```
oc edit deployment gitlab-gitlab-runner
```

Add the following section to `spec.template.spec.containers[name=='gitlab-gitlab-runner'].volumeMounts`:

```
        - mountPath: /home/gitlab-runner/.gitlab-runner/certs
          name: volume-gitlab-certs
          readOnly: true
```
          
Add the following section to `spec.template.spec.volumes`:

```
      - name: volume-gitlab-certs
        secret:
          defaultMode: 420
          items:
          - key: tls.crt   
            path: gitlab.<my-domain>.crt
          secretName: gitlab-certs
```

Mind the placeholder `<my-domain>`!

Additionally there are two occurrences of environment variable definition `CI_SERVER_URL` where you have to change the given URL. So change

```
        - name: CI_SERVER_URL
          value: https://gitlab.<my-domain>
```

&hellip; to ...

```
        - name: CI_SERVER_URL
          value: http://gitlab-unicorn.gitlab.svc:8181
```

Take extra care for the correct indentation. The change will trigger the startup of a new `gitlab-gitlab-runner` pod.

## Configure data retention for Prometheus

Installing GitLab the way we did also provides you with a Prometheus server scraping metrics from all kind of sources. Unfortunately this Prometheus server is not configured to get rid of older data. So sooner or later the scraped data will exceed the capacity of the persistent volume used by Prometheus (8GiB). The Prometheus server will end up in a crash loop.

To prevent this scenario you have to limit the amount of data stored in Prometheus' time series database. This is achieved by an additional command line parameter of the command starting the Prometheus server. Edit the corresponding deployment:

```
oc edit deploy gitlab-prometheus-server
```

Add the option `--storage.tsdb.retention=7d` to the list of options for the command starting the prometheus server. You should end up with

```
      - args:
        - --config.file=/etc/config/prometheus.yml
        - --storage.tsdb.path=/data
        - --storage.tsdb.retention=7d
        - --web.console.libraries=/etc/prometheus/console_libraries
        - --web.console.templates=/etc/prometheus/consoles
        - --web.enable-lifecycle
```

The retention time `7d` is a guess. In our case it was sufficient to stay well below the 8GiB time series DB limit. You will have to find out yourself what is a good value for your installation.

Save the deployment. This will trigger the creation of a new `gitlab-prometheus-server` pod.

## Final checks

Check that everything is up and running with

```
$ oc get deployment
NAME                       DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
gitlab-gitlab-runner       1         1         1            1           8m
gitlab-gitlab-shell        2         2         2            2           20m
gitlab-minio               1         1         1            1           20m
gitlab-postgresql          1         1         1            1           20m
gitlab-prometheus-server   1         1         1            1           20m
gitlab-redis               1         1         1            1           20m
gitlab-sidekiq-all-in-1    1         1         1            1           20m
gitlab-task-runner         1         1         1            1           20m
gitlab-unicorn             2         2         2            2           20m

$ oc get statefulset
NAME            DESIRED   CURRENT   AGE
gitlab-gitaly   1         1         20m

$ oc get pod
NAME                                        READY     STATUS      RESTARTS   AGE
gitlab-gitaly-0                             1/1       Running     0          18m
gitlab-gitlab-runner-9786ffc56-jfw4c        1/1       Running     2          7m
gitlab-gitlab-shell-7d7cc8f6fb-5hz79        1/1       Running     0          18m
gitlab-gitlab-shell-7d7cc8f6fb-q2nc2        1/1       Running     2          18m
gitlab-migrations.1-zftxd                   0/1       Completed   0          20m
gitlab-minio-8564669cf5-qlbdf               1/1       Running     0          19m
gitlab-minio-create-buckets.1-dkqck         0/1       Completed   0          20m
gitlab-postgresql-65bd954977-vnct2          2/2       Running     0          20m
gitlab-prometheus-server-69d46f5d6c-drkwj   2/2       Running     0          18m
gitlab-redis-6464c458c6-rmshh               2/2       Running     4          18m
gitlab-sidekiq-all-in-1-7c88989d7-8ttq7     1/1       Running     0          18m
gitlab-task-runner-78566f5d44-8d8fc         1/1       Running     0          17m
gitlab-unicorn-869cfd75cc-6vwbr             2/2       Running     0          17m
gitlab-unicorn-869cfd75cc-92ndk             2/2       Running     0          17m
```

## Enable external SSH access (optional)

If you are not happy with accessing your git repositories via HTTPS URLs but want to use SSH instead you have to define an additional service of type NodePort since regular routes only allow access to HTTP and HTTPS i.e. ports 80 and 443.

Create the file `gitlab-ssh-nodeport-svc.yaml` with the following contents.

```
apiVersion: v1
kind: Service
metadata:
  name: gitlab-shell-nodeport
  labels:
    app: gitlab-shell
    name: gitlab-shell-nodeport
spec:
  type: NodePort
  ports:
    - port: 2222
      nodePort: 32222
      name: ssh
  selector:
    app: gitlab-shell
```

Create the service with

```
oc create -f gitlab-ssh-nodeport-svc.yaml
```

With this setup you can now access GitLab's SSH server via any of your cluster nodes and port 32222. This is not ideal and far from convenient. It might not work at all if your cluster nodes are not accessible from the outside. In our case we had another load balancer (based on HAproxy) in front of our cluster that I could configure to offer port 22 to the rest of the world and forward traffic to this port to our cluster nodes.

All I had to do was to add the following lines to our HAproxy configuration.

```
frontend gitlab-ssh
    bind <external-ip>:22
    default_backend gitlab-ssh
    mode tcp
    option tcplog

backend gitlab-ssh
    balance source
    mode tcp
    server      <cluster-node-1-name> <cluster-node-1-ip>:32222 check
    ....
    server      <cluster-node-n-name> <cluster-node-n-ip>:32222 check
```

Another option is to expose the SSH service via an [external IP](https://docs.openshift.com/container-platform/3.11/dev_guide/expose_service/expose_internal_ip_service.html).

## Fix s3cmd configuration on Task Runner pod (optional)

Backup and restore is done on the Task Runner pod by means of a bunch of scripts that deep down use the `s3cmd` utility to store and retrieve backup archives from the object store Minio. (Minio is automatically deployed together with GitLab.) You might run into issues with TLS when accessing Minio via its public route. To avoid these problems you have to change the configuration of the `s3cmd` utility to access Minio via the corresponding service, thus bypassing the route.

Edit the config map `gitlab-task-runner`

```
oc edit cm gitlab-task-runner
```

There are two occurrences of `EOF`. Change the lines between these two lines from ...

```
host_base = minio.<my-domain>
host_bucket = minio.<my-domain>/%(bucket)
....
website_endpoint = https://minio.<my-domain>
```
&hellip; to ...

```
host_base = gitlab-minio-svc:9000
host_bucket = gitlab-minio-svc:9000/%(bucket)
....
website_endpoint = http://gitlab-minio-svc:9000
use_https = False
```

Force the creation of a new Task Runner pod by deleting the existing one.

```
oc delete pod <task-runner-pod>
```

## Initial login

Access your GitLab installation via `https://gitlab.<my-domain>` (or some other URL that was given in `gitlab-values.yml`). You can log in with `root` and an initial password that can be retrieved by

```
oc get secret gitlab-gitlab-initial-root-password -o jsonpath='{.data.password}' | base64 -d
```

## Upgrading

Upgrading from one GitLab version to another one is also done with Helm by

```
helm tiller start gitlab
helm upgrade -f gitlab-values.yml gitlab gitlab/gitlab --version <chart-version> --timeout 600
```

Refer to the [GitLab version mapping](https://docs.gitlab.com/charts/installation/version_mappings.html) to find out what chart version corresponds to which version of GitLab.

Mind that upgrades must be done from one minor version to the next one. You must not skip intermediate minor versions. For instance if you want to go from 11.10.4 to 12.1.1 you must include all intermediate minor version, e.g.

```
11.10.4. => 11.11.x => 12.0.x => 12.1.1
```

Always make sure that one upgrade step has been fully completed (e.g. all migration jobs finished, all pods up and running as expected (see 'Final checks')) and the upgraded GitLab instance is functional before you start the next upgrade step.

In most cases you will have to fix the GitLab Runner deployment again (see above). Same applies for the `s3cmd` configuration of the Task Runner pod (see above). Apart from these details upgrading worked flawlessly.