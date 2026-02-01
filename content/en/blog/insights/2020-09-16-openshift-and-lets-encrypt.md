---
layout: post
date: '2020-09-16T00:00:00+00:00'
status: public
# Mandatory: Headline and title of the post
title: OpenShift and Let's Encrypt
# Optional (recommended): Short description of the content, ~160 characters. Will often be displayed on search engine result pages and when shared on social media platforms.
meta_description: What options you have to get (and renew) TLS certificates from letsencrypt.org in an OpenShift cluster
# Mandatory: author name
author: Markus Hansmair
# Optional (recommended): Path to an image related to the blog post. Will often be displayed when shared on social media platforms.
# featured_image: /assets/images/letsencrypt.png
# category of the post, e.g. "development", "monitoring", ... 
categories:
- devops
# one or more tags, e.g. names of technologies, frameworks, libraries, languages, etc.
# avoid proliferation of tags by using already existent tags
# see https://labs.consol.de/tags/
tags:
- openshift
---


So you have this nifty web application deployed on your OpenShift cluster and you want to make it accessible by the whole world with HTTPS under the name `coolapp.<mydomain>`. Unfortunately you face several issues:

* Exposing the service to your web application leaves you with a route using the self-signed certificate that was generated during setup of the cluster. None of the browsers in the wild will trust this certificate.

* The self-signed certificate dictates URLS of the form `https://<appname>.apps.<clustername>.<mydomain>` (or whatever domain suffix you configured). Not very nice.

* You might mitigate the previous issues by getting an official certificate signed by a generally trusted institution. But you will have to pay for it.

* And you will have to pay for it not only once but every year (latest every 389 days) thanks to recently tightened certificate policies installed by all major browser vendors.

* Worst of it all: You must not (by any means) forget to apply for a new certificate in a timely manner and replace the certificate in your route before the old expires. Otherwise some people might get pretty angry about you.

*Let's Encrypt* to the rescue!

<!--more-->

## *Let's Encrypt* briefly

[Let's Encrypt](https://letsencrypt.org/) has done a tremendous job during the last couple of years (exactly since effectively September 7 2015) to promote general transport encryption in the World Wide Web by

* issuing free (as in free beer) TLS certificates generally accepted by all recent web browsers,

* providing a protocol to automate the certificate issuance and renewal,

* providing a reference implementation of the client side of this protocol ([certbot](https://certbot.eff.org/)) trying to make it as easy as possible for administrators to automate renewal and installation of TLS certificates and

* last but not least (due to the automation presented) issueing certificates valid only for a relatively short period of time (90 days) giving a pragmatic solution to the (never properly solved) problem of certificate revocation.

As a moral side-note *Let's Encrypt* also has drained the money-for-nothing-business practised by so many other certification bodies for so long basically offering the very same level of domain verification for horrendous costs.

In essence to prove that the domain in question is under your control *Let's Encrypt* sends you as the supplicant a challenge (aka token) that you have to present under a well-known URL on your web server (HTTP-01) or as a TXT record with a well-known domain name in the DNS (DNS-01). Read the excellent documentation on their website about [how it works](https://letsencrypt.org/how-it-works/) and [all other details](https://letsencrypt.org/docs/).

## The OpenShift challenge

We want to take advantage of *Let's Encrypt* to get a generally accepted certificate for our web application fully automated and for free. As soon as everything is set up our web application will be provided with up-to-date certificates automagically as long as it stays online.

There have been early attempts to use certbot in an OpenShift cluster. But the circumstances in a cluster are so different compared to a bare metal machine runnning e.g. an nginx web server that these attempts did not gain much traction. Instead special solutions have been implemented.

## The options

Three tools were taken into closer consideration:

* [OpenShift-ACME](https://github.com/tnozicka/openshift-acme/) is a controller monitoring routes. Special annotations cause OpenShift-ACME to request TLS certificates for each route and taking care of its lifecycle (i.e. timely renewal). OpenShift-ACME so far only supports domain verification via HTTP.

* [Certman-Operator](https://github.com/openshift/certman-operator) is an operator highly specialized for Red Hat's [dedicated cluster](https://cloud.redhat.com/) service. It only supports domain verification via DNS and only with AWS Route53, i.e. any OpenShift cluster running on something different than AWS is out of the game.

* [Cert-Manager](https://cert-manager.io/) is the most advanced and flexible solution as it supports domain verification via HTTP and DNS - the latter on a long list of platforms as it comes with many plugins for various DNS servers. It's more targeted towards Kubernetes but can also be used on OpenShift. Routes are [not natively supported](https://github.com/jetstack/cert-manager/issues/1064), but this may [change](https://github.com/jetstack/cert-manager/pull/2840) in the near future. However, with the help of ingresses (yes, they exist in OpenShift too) routes can be automatically fitted with TLS certificates provided by *Let's Encrypt*.

Unsurprisingly the following instructions will explain how to use Cert-Manager. We will focus on domain verification via DNS. Although more complicated to set up this approach is more flexible as it is also applicable for web applications not reachable from the Internet. From our experience this use case is quite common in enterprise environments. We will show how to employ [ACME-DNS](https://github.com/joohoi/acme-dns), a stripped down DNS server with just enough functionality to serve the TXT records needed for domain verification via DNS. With ACME-DNS we avoid any vendor (i.e. cluster provider) lock-in. We will mention alternatives and options along the way wherever we deem it worth pointing out, but will not go into details.

## Installation

We assume that your OpenShift cluster is version 4. You can use Cert-Manager on OpenShift 3, but please consult the [installation instructions](https://cert-manager.io/docs/installation/openshift/) for limitations and special procedures.

You have two options to install Cert-Manager. You can either install it as an operator directly from your cluster's web console (*Administrator view: Operators &rarr; OperatorHub &rarr; Search for 'cert-manager'*). By the time of writing this article (2020-09-16) the operator from the catalog was quite outdated (version 0.15.2 listed while v1.0.1 was the latest available). The installation instructions mention a [link to Red Hat's operator catalog](https://cert-manager.io/docs/installation/openshift/#installing-with-cert-manager-operator) that is defunct.

The second option is to install all necessary resources old-style with a long template file. As we want to go for the latest and greatest this is our way.

Log in to your cluster as cluster administrator, create a namespace for your Cert-Manager resources and apply the template to create all the resources.

```
oc login ...
oc new-project cert-manager
oc apply --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.0.1/cert-manager.yaml
```

> Note: The --validate=false flag is added to the oc apply command above or else you will receive a validation error relating to the caBundle field of the ValidatingWebhookConfiguration resource.

## ACME-DNS

Before we go into configuring Cert-Manager we have to prepare ACME-DNS. As we want to use domain verification via DNS we need to be able to programmatically set certain TXT records. More specific: We request a (new) TLS certificate from *Let's Encrypt* for the domain `coolapp.mydomain.com` and get a challenge in response. We have to present this challenge<sup>[-1-](#note1)</sup> in a TXT record with domain name `_acme-challenge.coolapp.mydomain.com`. Unfortunately most DNS servers do not provide any API to manipulate zone information programmatically. Instead we delegate the TXT record to some other domain served by ACME-DNS. The above mentioned TXT record becomes a CNAME record pointing to this new domain.

```
_acme-challenge.coolapp.mydomain.com (CNAME)  ==>
    caeb38f2-6592-4128-d8be-da5e6039d1bc.auth.acme-dns.io.auth.acme-dns.io (TXT)
```

We have to register with `acme-dns.io` by sending a POST request to its REST API.

```
curl --data '{"allowfrom":["194.246.122.0/24"]}' https://auth.acme-dns.io/register |
  jq . > acme-dns.json
```

With this command you register a subdomain under `auth.acme-dns.io` where you can put your TXT record programmatically (as will be explained shortly). The JSON data in the request restricts access to the API for this subdomain to a certain IP range. Send an empty request (`-X POST` instead of `--data '{...}'`) if you don't need this additional security. See ACME-DNS's [usage instructions](https://github.com/joohoi/acme-dns#usage) for details.

The response (stored in `acme-dns.json`) looks like

```
{
  "username": "9a88737a-7014-420a-90bd-de11cc3a9a6e",
  "password": "E5uaq4v5ftSZPwFPzQsXvT0uzDBu5rkEGfdOP6mo",
  "fulldomain": "caeb38f2-6592-4128-d8be-da5e6039d1bc.auth.acme-dns.io",
  "subdomain": "caeb38f2-6592-4128-d8be-da5e6039d1bc",
  "allowfrom": [
    "194.246.122.0/24"
  ]
}
```

After sending a POST request to the endpoint `https://auth.acme-dns.io/update` with username and password in request headers and subdomain and the challenge in the request body ACME-DNS will serve a TXT record with name `caeb38f2-6592-4128-d8be-da5e6039d1bc.auth.acme-dns.io` and the challenge as content. Cert-Manager will do exactly that later.

Don't forget to (manually) set the CNAME record (e.g. `_acme-challenge.coolapp.mydomain.com`) pointing to `caeb38f2-6592-4128-d8be-da5e6039d1bc.auth.acme-dns.io`.

ACME-DNS is open source. You can [run the server by yourself](https://github.com/joohoi/acme-dns#self-hosted) in case you do not want to be dependent on `acme-dns.io`.

## Configuration

Next step is to set up where certificates will be requested and how the domain verification will be performed. This is achieved by creating an instance of `Issuer` or `ClusterIssuer`. The first is a namespaced resource while the latter is valid for the whole cluster.

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-staging
  namespace: coolapp
spec:
  acme:
    email: "cert-master@mydomain.com"
    privateKeySecretRef:
      name: letsencrypt-account-key
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    solvers:
    - dns01:
        acmeDNS:
          accountSecretRef:
            key: acme-dns-account
            name: acme-dns-secret
          host: https://auth.acme-dns.io
        cnameStrategy: Follow
```

This issuer will use the ACME protocol (`spec.acme`) and the endpoint will be *Let's Encrypt*'s staging endpoint (`spec.acme.server`). Your *Let's Encrypt* account credentials will be stored in the secret `letsencrypt-account-key`. You don't have to prepare anything there as Cert-Manager will take care of registration automatically the first time it contacts *Let's Encrypt*. Below `spec.acme.solvers` we define what domain verification will be used.<sup>[-2-](#note2)</sup> The key-value-pair `cnameStrategy: Follow` is important as it allows to delegate the TXT record to some other domain by means of a CNAME record.

Instead of `acmeDNS` you can specify one of the other [supported DNS providers](https://cert-manager.io/docs/configuration/acme/dns01/#supported-dns01-providers). In case your OpenShift cluster is run by one of the listed cloud providers you can use their proprietary interface.

If you opt for running an ACME-DNS server by yourself `host: https://auth.acme-dns.io` is the place where you have to put the URL of your self-hosted instance.

The credentials we got when we registered with `acme-dns.io` have to be stored in the secret `acme-dns-secret`. Create it with this YAML file

```
kind: Secret
apiVersion: v1
metadata:
  name: acme-dns-secret
  namespace: coolapp
stringData:
  acme-dns-account: |-
    {
      "coolapp.mydomain.com": {
        "username": "9a88737a-7014-420a-90bd-de11cc3a9a6e",
        "password": "E5uaq4v5ftSZPwFPzQsXvT0uzDBu5rkEGfdOP6mo",
        "fulldomain": "caeb38f2-6592-4128-d8be-da5e6039d1bc.auth.acme-dns.io",
        "subdomain": "caeb38f2-6592-4128-d8be-da5e6039d1bc"
      }
    }
type: Opaque

```

Of course you have to adapt the data to match your domain, your ACME-DNS credentials, your ACME-DNS subdomain and the domain(s) you want certificates for.

With Issuer configured, account created on acme-dns.io and credentials stored in a secret everything is now in place to request a certificate.

## The DNS resolver pitfall

During our experiments with cert-manager we encoutered error messages in the log output of the `cert-manager` pod.

```
$ oc logs -f -n cert-manager cert-manager-75ff5bf6d6-n7sv5
....
E0910 11:30:35.262146       1 sync.go:183] cert-manager/controller/challenges
    "msg"="propagation check failed"
    "error"="dial tcp 46.4.128.227:53: i/o timeout" ....
```

(Formatting not in the original output.) Domain verification finally failed.

This is what happened in detail: We had requested a new certificate. Cert-Manager sent a request to *Let's Encrypt* and got back the challenge to be used in the following domain verification. Cert-Manager prepared the TXT record in our subdomain of `auth.acme-dns.io`. Cert-Manager was about to get back to *Let's Encrypt* to tell them *Everything is in place now. Go ahead and verify that we are in control of the domain.* Before actually doing that Cert-Manager tried to verify itself that the TXT record looked as expected. Instead of simply using the DNS resolver configured in the pod it somehow determined the authoritative nameserver for the TXT record and tried to contact it directly (supposedly to bypass any caches on the way from the local resolver to the authorative nameserver that might hold outdated records). In our case this was the observed TCP connection to `46.4.128.227` (`auth.acme-dns.io`) port 53. This connection timed out because it was blocked by our firewall. Actually this is a common firewall rule in enterprise environments to avoid confusion in 'split horizon DNS' setups, e.g. `www.mydomain.com` must deliver an internal IP address if resolved by an internal host contrary to an external IP address when resolved by some host in the Internet.

The solution for this issue was to modify the deployment of the `cert-manager` pod. First find out the IP address of the resolver configured in the pod. As the images for the Cert-Manager pods are super-lean (i.e. no shell, no basic unix tools) you will have to use some other existing pod you have access to.

```
oc rsh -n <some-namespace> <some-pod-there> cat /etc/resolv.conf
```

Then ...

```
oc edit deployment cert-manager -n cert-manager
```

Find the section with the arguments for the command run within the pod.

```
    spec:
      containers:
      - args:
        - --v=2
        - --cluster-resource-namespace=$(POD_NAMESPACE)
        - --leader-election-namespace=kube-system
```

Add two more lines ...

```
    spec:
      containers:
      - args:
        - --v=2
        - --cluster-resource-namespace=$(POD_NAMESPACE)
        - --leader-election-namespace=kube-system
        - --dns01-recursive-nameservers="<resolver-ip>:53"
        - --dns01-recursive-nameservers-only
```

This forces Cert-Manager to use the local resolver only (no direct communication with remote nameservers). The downside being that verifying the TXT record will take longer<sup>[-3-](#note3)</sup>.

## Requesting a certificate

Requesting a certificate is accomplished by creating an instance of `Certificate`. Here is the corresponding YAML file

```
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: coolapp-mydomain-com
  namespace: coolapp
spec:
  dnsNames:
  - coolapp.mydomain.com
  duration: 2160h
  renewBefore: 360h
  issuerRef:
    kind: Issuer
    name: letsencrypt-staging
  secretName: coolapp-mydomain-com-tls
  subject:
    organizations:
    - "My company"
  usages:
  - server auth
```

Adapt to your data (domain name(s), organization name(s), secret name, etc.) and create the `Certificate` instance with `oc apply -f ...`. `duration` is probably obsolete as *Let's Encrypt* delivers certificates valid for 90 days in any case.

As soon as the `Certificate` instance has been created some controller jumps in and starts a certification process. Behind the scenes an instance of `CertificateRequest` is created which in turn creates an instance of `Order`. You can watch these instances as the certification proceeds. Finally the certificate gets stored in the secret given in the `Certificate` instance with `spec.secretName`.

## Securing your route

So far we have got a TLS certificate stored in a secret. On the other hand routes in Openshift do not read TLS data from a secret but store it in the route directly.<sup>[-4-](#note4)</sup> Kubernetes ingresses do it that way, but we are on OpenShift.  By the time of writing (2020-09-16) routes were [not natively supported](https://github.com/jetstack/cert-manager/issues/1064) by Cert-Manager. A [pull request](https://github.com/jetstack/cert-manager/pull/2840) was already in a very advances stage. So probably routes will be supported in the near future.

In the meantime you have to apply a little trick. The official OpenShift documentation doesn't mention it (for unknown reasons) but it is possible to create `Ingress` instances in OpenShift too. They are not processed by the ingress controller directly in a way that HAproxy is configured accordingly but instead the ingress controller automatically creates one or more `Route` instances that mimick the desired behavior of the `Ingress`. It even monitors the `Ingress` instance and adapts the routes in case anything changes with the ingress. That's the way we need to go. Delete any existing route for your application and create an instance of `Ingress`

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: coolapp-ingress
  namespace: coolapp
spec:
  rules:
  - host: coolapp.mydomain.com
    http:
      paths:
      - backend:
          serviceName: coolapp
          servicePort: 8080
        path: /
        pathType: Prefix
  tls:
  - hosts:
    - coolapp.mydomain.com
    secretName: coolapp-mydomain.com-tls
```

Again adapt the data to your needs and then create the ingress with `oc apply -f ...`. Automagically a route comes into existance and the fields `spec.tls.certificate` and `spec.tls.key` contain the certificate data from the secret where Cert-Manager stored the certificate.

## Switching from Let's Encrypt staging to production

Probably you will realize pretty fast that the route is of very limited use. Very intentionally the instructions so far consistently used the staging end point of *Let's Encrypt*. The resulting TLS certificates are signed by a fake CA not recognized by any TLS client.

The reason is that the production endpoint of *Let's Encrypt* has pretty rigid rate limits. We want to avoid that the production endpoint becomes defunct for you due to e.g. too many failed verifications within one hour. We adhere to *Let's Encrypt*'s [recommendation](https://letsencrypt.org/docs/staging-environment/) to use their staging endpoint for experimentation. As soon as you are confident that everything works as expected you can switch to production as follows.

Create a second instance of `Issuer` very similar to the one created above. The differences are `metadata.name: letsencrypt-prod` and `spec.acme.server: https://acme-v02.api.letsencrypt.org/directory`. Adapt the existing `Certificate` by changing `spec.issuerRef.name` to `letsencrypt-prod`.

This will trigger Cert-Manager, the `CertificateRequest` will be adapted, a new `Order` instance will be created and a new verification process will start. In the end a new TLS certificate will be stored in the secret. This time signed by *Let's Encrypt*'s official certification authority. The route mimicking the ingress will be recreated by the ingress controller with the certificate data from the secret.

## Maintenance

Hopefully none! Your certificate will be renewed by Cert-Manager automatically as soon as the certificate's expiration date minus the `renewBefore` value from the `Certificate` instance has been reached. Nevertheless we highly recommend that you monitor the first renewal - just to be on the safe side.

<hr id="note1" />

**Note 1** Actually not the challenge itself is stored in the TXT record but the challenge is mangled with your *Let's Encrypt* account id and the resulting SHA256 hash is stored as the contents of the TXT record.

<hr id="note2" />

**Note 2** Cert-Manager allows to configure multiple solvers here. Selection which solver is used for a specific certificate is done based on labels (of the corresponding `Certificate` resource instance) and matches against the domain name(s) or domain(s). Read the Cert-Manager [documentation](https://cert-manager.io/docs/configuration/acme/#adding-multiple-solver-types) for details.

<hr id="note3" />

**Note 3** TXT records served by ACME-DNS come with a time-to-live (TTL) of one second. So the difference should be neglectable. Nevertheless experiments showed that it sometimes takes significantly longer (up to 1 minute) till you see the updated TXT record - for whatever reasons.

<hr id="note4" />

**Note 4** There is an [issue](https://github.com/openshift/origin/issues/2162) about moving TLS certificate data from routes to secrets referenced by the routes that has been lingering in OpenShift's GitHub project since more than 5(!) years.
