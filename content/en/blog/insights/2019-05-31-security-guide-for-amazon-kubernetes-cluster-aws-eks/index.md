---
layout: post
date: '2019-05-31T00:00:00+00:00'
status: public
# Mandatory: Headline and title of the post
title: Security guide for Amazon Kubernetes Cluster (AWS EKS)
# Optional (recommended): Short description of the content, ~160 characters. Will often be displayed on search engine result pages and when shared on social media platforms.
meta_description: Best practice guide for a secure cluster using Amazon Elastic Container Service for Kubernetes (AWS EKS).
# Mandatory: author name
author: Johannes Lechner
# Optional, e.g. URL to your personal twitter account
author_url: https://twitter.com/consol_de
# Optional (recommended): Path to an image related to the blog post. Will often be displayed when shared on social media platforms.
featured_image: /assets/images/kubernetes-logo.png
# category of the post, e.g. "development", "monitoring", ...
categories:
- devops
# one or more tags, e.g. names of technologies, frameworks, libraries, languages, etc.
# avoid proliferation of tags by using already existent tags
# see https://labs.consol.de/tags/
tags:
- AWS
- EKS
- Cloudwatch
- Kubernetes
- security
- guide
- networkpolicy
- consulting
- prevent
- cyberdetection
- cyberprevention
- cyberattack
- München
- Consulting
---
<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="./featured-image.png"></div>

One of the most challenging questions in cloud environments is about how secure is my application when its deployed in the public cloud ?
Its no secret that security aspects are much more important in a public cloud than it was in classic environments.
But dont be surprised that many applications even in public cloud dont follow best practice security patterns.
This has several reasons for example time and costs are very high trying to achieve a high security level.
But in fact AWS and Kubernetes offer many options which let you improve your security level without too much effort.
I like to share some of the possibilities that you have when creating a secure AWS EKS cluster.

<!--more-->

### Encrypt communication
Basically its a good idea to encrypt all data traffic the hole way. Steps in the chain:

Step 1)
Encrypt the connection between web clients and your loadbalancer.
This part of the communication is usually encrypted by almost every application.
You should use the application loadbalancer (ALB), this can be achived with the ALB-Ingress-Controller.
The ALB-Ingress-Controller can be used to manage your loadbalancer certificates which you create by the <a href="https://aws.amazon.com/de/certificate-manager" target="blank">AWS Certificate Manager (ACM)</a> service.
More details about the ALB can be found here: <a href="https://kubernetes-sigs.github.io/aws-alb-ingress-controller/guide/walkthrough/echoserver" target="blank">Setup ALB</a>
If you choose other ingress controllers like nginx or use services directly as type loadbalancer you will get a classic loadbalancer from AWS.
However ALB provides you many advantages regarding routing and security options for the application layer.

Step 2)
Encrypt the connection between your loadbalancer and pod.
Most of the applications on cloud providers will not encrypt this connection because they are running in virtual private network.
Therefore users outside of your private network cannot read this traffic in theory.
But also consider that once an attacker manged to get into that network he is able to listen all the traffic.
To achieve this you have at least three options:
a) If you application or application server supports encryption you could use it directly.
b) Instead you could run a sidecar on your pod which performs encryption for example based on nginx. Have a look here: <a href="https://github.com/pbrumblay/tls-sidecar" target="blank">Setup Sidecar</a>
c) Or you could run a complete service mesh like Istio which also offers this option. Istio setup on EKS can be found here: <a href="https://eksworkshop.com/servicemesh_with_istio" target="blank">Setup Istio on EKS</a>

Step 3)
Encrypt the connection between your pod and your AWS RDS database.
Same problem here! Many applications will not use this option because they think they are running in a private network and nothing can happen.
AWS RDS offers encrypted access without big effort. Of course you need to adjust your application to use encrypted db access.

### Encrypt storage
a) Databases
AWS RDS has options to encrypt the database storage (EBS) without effort. Make sure you enable this option during db creation.
The performance on encrypted databases is quite nice, you dont really notice a diffrence in normal usecases.

b) Persistent Volume Claims (PVC)
By default if you EKS cluster creates a PVC storage it will store it as plain data on EBS storage.
You should overwrite the default storage class and activate the encryption flag.
For example:

Step 1)
Create a new default storage class with encrypt annotation enabled:

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: gp2encrypted
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  fsType: ext4
  encrypted: "true"
```

Step 2)
Delete the old storage class
kubectl delete storageclass gp2

### Restrict inbound and outbound traffic
Use network policies to restrict ingress and egress traffic from pods.
Steps:
1) Install Calico: <a href="https://docs.aws.amazon.com/eks/latest/userguide/calico.html" target="blank">Setup Calico</a>
2) Secure ports except db and dns
In this example we allow incoming 8080 traffic. And outgoing traffic only for DNS and RDS ports on the own private network.
One pod should not be able to access a database which belongs to another pod in the same cluster!

```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: aws-network-policy
  namespace: XXX
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - ipBlock:
            cidr: 192.168.10.0/28
      ports:
        - protocol: TCP
          port: 3306
    - to:
        - ipBlock:
            cidr: 192.168.11.0/28
      ports:
        - protocol: TCP
          port: 3306
    - to:
        - ipBlock:
            cidr: 192.168.0.0/16
      ports:
        - protocol: TCP
          port: 53
    - to:
        - ipBlock:
            cidr: 192.168.0.0/16
      ports:
        - protocol: UDP
          port: 53
```

Note:
Like in this example, you should also restrict pod access to RDS instances. AWS usually uses security groups to achieve such possibilities.
However for pods this is currently not possible but AWS is working on it: <a href="https://github.com/aws/containers-roadmap/issues/177" target="blank">AWS EKS Roadmap</a>
Right now you could use my workaround: Create a /28 subnet for your database instance on at least two AZ.

### Kubernetes pod security
Kubernetes offers some settings to avoid pods exploits to take over host (node) ressource.
Have a look on official k8s website and on this blog:
<a href="https://dev.to/petermbenjamin/kubernetes-security-best-practices-hlk#pod-security-policies" target="blank">Mastering pod security</a>


### Use a firewall to block known web attacks
In order to use the <a href="https://aws.amazon.com/de/waf" target="blank">Webapplication Firewall (WAF)</a> you need to use the Application-LB (ALB) which is generated by ALB-Ingress-Controller project.
Its hard to configure all rules to block web attacks. Therefore you should buy a predefined RuleSet from the marketplace.
On the WAF panel, on the top you see the marketplace options.
You can buy one RuleSet from F5 for example. Pricing is quite fair.
With an active subscription you can create an ACL with the RuleSet.

If you  know all the IPs of your clients its best practice to restrict access to these ips.
In cases where you cannot limit the IP ranges which can access you should create rules to block IPs which try exploits and blacklist them.
Good example can be found here: <a href="https://docs.aws.amazon.com/waf/latest/developerguide/tutorials-4xx-blocking.html" target="blank">Guide to blacklist IPs</a>

In addition its good idea to analzye WAF logs to detect and prevent attacks:
<a href="https://aws.amazon.com/de/blogs/security/how-to-analyze-aws-waf-logs-using-amazon-elasticsearch-service" target="blank">Analyze WAF Logs</a>

### Protect yourself from DDos attacks
By default AWS Shield standart is active and protects you from DDos attacks.
When you use AWS Shield Standard with Amazon CloudFront and Amazon Route 53, you receive comprehensive availability protection against all known infrastructure (layer 3 and 4) attacks.
However there is also an advanced version available which i highly recommend to use: <a href="https://aws.amazon.com/de/shield" target="blank">AWS Shield Advanced</a>

### Secure your AWS account
Its a good idea to use 2-factor authentication on all your AWS user logins.
Probably many companies have too many admin users on their cloud providers, instead you should restrict permissions on each user based on required needs.

### Use namespaces and secrets
Kubernetes offers namespaces to saperate teams and projects from each other.
Each project and each stage should have its own namespace: e.g. TEST, INT, E2E, PROD.

The advantage is that Kubernetes allows you to assign permissions to users based on namespaces.
Therefore for example one team cannot see the secrets from a diffrent namespace.
For example if the "dev" team user gets hacked you will not corrupt secrets  on other namespaces like "prod".

### Scan your container images
It a good idea to regulary scan your images for vulnerabilities. Current AWS is working on a buildin solution for its container registry (ECR).
You can see the ticket here: <a href="https://github.com/aws/containers-roadmap/issues/17" target="blank">AWS ECR Roadmap</a>
Meanwhile you can use some open source projects which scan the images for you. For example: <a href="https://github.com/aquasecurity/microscanner" target="blank">Microscanner</a>

### Review your security setup
Its a good idea to review the own security concept. Aws has some checklists for that purpose. It can be found under der AWS service "Security Advisor" : <a href="https://aws.amazon.com/de/premiumsupport/technology/trusted-advisor/" target="blank">AWS Advisor</a>
AWS also offers a service called "AWS Security Hub" it provides a comprehensive view of your AWS security and compliance posture.

### Cyber attack detection
a) For example if a hacker searches for weaknesses it will create some 4XX or 5XX http error codes.
You could detect this and block IPs or application users.
This can be detected by using cloudwatch metrics to create some alarms or trigger lambda function based on your ALB error codes.
The same is possible for cloudwatch metrics based on WAF ACLs.

b) Another way is to scan the application logfiles if you can see more errors which may indicate an attacker.
First of all you need to send your logfiles to S3 then you can define a Lambda function which performs checks and actions.

c) And last but not least machine learning can help you detect exploits on your cloud infrastructure.
There is quite new and nice service called "AWS Duty Guard".
Based on patterns and attacks in the AWS network it learns what indicates an attack.
For example it detects if someone in the night connects via TOR client with your cluster or some bitcoin miner gets installed on your EC2 instance.
Once the AI found a security issue, it creates an alert for you.
Its quite simple to use, you just have to activate it on your AWS account. But of course you pay per use based on processed traffic.
Have a look here: <a href="https://aws.amazon.com/de/guardduty/" target="blank">AWS Duty Guard</a>

## Links:
https://aws.amazon.com/de/eks/

[newest posts on ConSol Labs]: https://labs.consol.de
