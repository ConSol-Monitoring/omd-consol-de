---
author: Markus Hansmair
date: '2020-01-14'
featured_image: /assets/images/MongoDB-OpenShift-Logo.png
meta_description: A step-by-step recipe on how to install .GitLab on OpenShift
tags:
- openshift
title: Installing MongoDB on OpenShift
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

So here is another one of our series *Installing Blahblahblah on OpenShift*. This time it is about getting MongoDB to run on OpenShift - the way recommended and promoted by the MongoDB guys. The whole setup is still in beta stage as indicated on [these](https://access.redhat.com/containers/?tab=overview#/registry.connect.redhat.com/mongodb/mongodb-enterprise-ops-manager) [two](https://access.redhat.com/containers/?tab=overview#/registry.connect.redhat.com/mongodb/mongodb-enterprise-appdb) entries in Red Hat's container image catalog. You *can* get your MongoDB instance up and running on OpenShift. But most of the required steps have to be performed on the command line, contrary to the impression given by MongoDB, Inc that once you get the MongoDB Operations Manager up and running everything can be achieved via this tool's GUI. Some operations in the Operations Manager simply do not work (yet) on OpenShift.
<!--more-->

When I last had to work with MongoDB back in 2015 and 2016 (version 3.0 and 3.2) installing this NoSQL database was a matter of running a single installer. You got a standalone instance nearly instantly that was ready for use. The downside was that tens of thousands of MongoDB installations where [accessible via the Internet with default passwords](https://uds.cispa.saarland/wp-content/uploads/2015/02/MongoDB_documentation.pdf). Since then a lot has changed. MongoDB has become far more enterprise-ish. Your MongoDB deployments are now administered with the *MongoDB Operations Manager* that takes advantage of hosts running the *MongoDB Agent*. In the Kubernetes / OpenShift world for getting a running Operations Manager and a bunch of pods equipped with the MongoDB Agent requires dealing with the *MongoDB Enterprise Operator for Kubernetes*.

I got most of my input from the following documentations:

* [MongoDB Enterprise Operator for Kubernetes Documentation](https://docs.mongodb.com/kubernetes-operator/)

* [OpenShift Installation of the MongoDB Enterprise Operator for Kubernetes](https://github.com/mongodb/mongodb-enterprise-kubernetes/blob/master/openshift-install.md)

* [MongoDB Operations Manager Documentation](https://docs.opsmanager.mongodb.com/)

Initially I had also included the blog article [Introducing the MongoDB Enterprise Operator for Kubernetes](https://www.mongodb.com/blog/post/introducing-the-mongodb-enterprise-operator-for-kubernetes) to this list. But be warned. It's pretty messed up. You won't get far with it on its own.

Be careful not to get confused as some notions exist in the OpenShift world and the MongoDB world with distinct meanings: cluster, replica set, project, deployment.

The documentation found in the GitHub project of the MongoDB Enterprise Operator about installing the operator on OpenShift turned out to be not very accurate. I've created a [fork](https://github.com/makuhama/mongodb-enterprise-kubernetes) and updated the documentation. Hopefully this update will sometime find its way back into the parent project. The Operations Manager Documentation does not reference the shortcomings of running this tool on Kubernetes / OpenShift. You have to find out yourself and how to work around these drawbacks.

I performed the installation on an OpenShift v3.11 cluster as this will be the customer's target platform. As the procedure is operator based I expect this also works on OpenShift v4.x. OpenShift versions earlier than 3.11 are definitely out of the game.

## Project and custom resources

Start with a blank project. Either create it yourself (sufficient permissions provided) or ask your friendly cluster administrator to create it for you. We will call it `mongodb`.

```
oc login https://<api-endpoint-url>
oc new-project mongodb
```

Create a bunch of custom resource definitions (CRDs) used by the MongoDB Operator.

```
oc create -f https://github.com/mongodb/mongodb-enterprise-kubernetes/raw/master/crds.yaml
```

## Pull secret to access Red Hat registries

Next is an OpenShift special. Prepare a secret with your credentials you need to pull images from the registries `registry.redhat.io` and `registry.connect.redhat.com`. To achieve this visit [https://access.redhat.com/terms-based-registry/](https://access.redhat.com/terms-based-registry/), choose the appropriate account and download the OpenShift pull secret (to be found under the *OpenShift Secret* tab). This secret has one entry with key `.dockerconfigjson`. The value is base64 encoded. Use your favorite text editor to extract this value into a separate file. Let's call it `dockerconfig.b64`. Decode the value with

```
base64 -d < dockerconfig.b64 | jq . > dockerconfig.json
```

The resulting file `dockerconfig.json` should look similar to

```json
{
  "auths": {
    "registry.redhat.io": {
      "auth": "RNVpqSTBPVEV3WldZMFl6ZGh..."
    }
  }
}
```

This is the access token needed to access `registry.redhat.io`. In order to be able to also access `registry.connect.redhat.com` duplicate the entry with name `registry.redhat.io` and change the key to `registry.connect.redhat.com`. You should end up with something like

```json
{
  "auths": {
    "registry.redhat.io": {
      "auth": "RNVpqSTBPVEV3WldZMFl6ZGh..."
    },
    "registry.connect.redhat.com": {
      "auth": "RNVpqSTBPVEV3WldZMFl6ZGh..."
    }
  }
}
```

Don't forget the comma between the two entries under `auths`!

We now create the definition of an OpenShift secret with this JSON file as value.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: openshift-pull-secret
stringData:
  .dockerconfigjson: |
    {
      "auths": {
        "registry.redhat.io": {
          "auth": "RNVpqSTBPVEV3WldZMFl6ZGh..."
        },
        "registry.connect.redhat.com": {
          "auth": "RNVpqSTBPVEV3WldZMFl6ZGh..."
        }
      }
    }
type: kubernetes.io/dockerconfigjson
```

We assume that you store this YAML file as `openshift-pull-secret.yaml`. Finally create this secret with

```
oc create -f openshift-pull-secret.yaml
```

## Create the MongoDB Enterprise Operator

Create the MongoDB Enterprise Operator and a few associated resources (service accounts, roles, role bindings) with

```
oc create -f https://github.com/mongodb/mongodb-enterprise-kubernetes/raw/master/mongodb-enterprise-openshift.yaml
```

The pod with name `enterprise-operator-xxxx-yyy` will fail to start due to missing permissions when pulling the image. Link the pull secret to some service accounts and restart the pod

```
oc secret link default openshift-pull-secret --for=pull
oc secret link enterprise-operator openshift-pull-secret --for=pull
oc secret link mongodb-enterprise-appdb openshift-pull-secret --for=pull
oc delete $(oc get pod -l=app=enterprise-operator -o name)
```

Make sure the pod starts properly. The MongoDB Enterprise Operator is now in place. So far we have reached step 1 of the bootstrap procedure to get MongoDB up and running on OpenShift. Next is to get a usable Operations Manager.

## Install the MongoDB Operations Manager

First we have to prepare two secrets with parameters for the Operations Manager. One is for the credentials of the super-user of the Operations Manager.

```yaml
apiVersion: v1
kind: Secret
stringData:
  FirstName: Operations
  LastName: Manager
  Password: <opsman-password>
  Username: opsman
type: Opaque
metadata:
  name: opsman-admin-credentials
```

Store this in a file called `opsman-admin-credentials.yaml`. The given values are just an example. Choose whatever you prefer. Mind that the password must match the Operations Manager's password policy, i.e. 8 characters minimum, one letter minimum, one digit minimum, one special character minimum. This is documented nowhere except in the Operations Manager GUI that you only get to see in case you managed to configure a password that complies to the above rules. In case you intend to use LDAP or SAML for user authentication in Operations Manager (instead of a user database provided by Operations Manager itself) keep in mind that the username given above must already exist in LDAP or SAML. (Again this is documented nowhere and you have to learn the hard way when its too late.)

You need another secret with the password Operations Manager uses to access its own database called *appdb*.

```yaml
apiVersion: v1
kind: Secret
stringData:
  password: <db-password>
type: Opaque
metadata:
  name: opsman-db-password
```

Store this in a file called `opsman-db-password.yaml`.

Now we create a custom resource of type `MongoDBOpsManager` that will trigger the MongoDB Enterprise Operator and make it install the Operations Manager.

```yaml
apiVersion: mongodb.com/v1
kind: MongoDBOpsManager
metadata:
  name: ops-manager
spec:
  replicas: 1
  version: 4.2.4
  adminCredentials: opsman-admin-credentials

  backup:
    enabled: false

  applicationDatabase:
    members: 3
    version: 4.2.0
    passwordSecretKeyRef:
      name: opsman-db-password
```

Store this in a file called `opsman-instance.yaml`. For the time being we will keep things simple and omit the backup feature as it introduces a bunch of additional resources that we have to provide.

The versions of the Operations Manager and its application database seem to be more or less in sync. Have a look at Red Hat's image catalog [here](https://access.redhat.com/containers/?tab=tags#/registry.connect.redhat.com/mongodb/mongodb-enterprise-ops-manager) and [here](https://access.redhat.com/containers/?tab=tags#/registry.connect.redhat.com/mongodb/mongodb-enterprise-appdb) on what's available. I had to try a little bit to find the above combination that actually worked. For instance using the combination 4.2.4 / 4.2.3 produced the following error message in the log output of the appdb pods

```
Cluster config did not pass validation for pre-expansion semantics : MongoDB version 4.2.3 for process = ops-manager-db-0 was not found in the list of available versions
```

followed by a very long list of available tarballs for various versions of MongoDB for various platforms. Apparently MongoDB's own download server is not in sync with Red Hat's container image catalog (or the other way round).

Now it's time to create all that in OpenShift and trigger the Operator.

```
oc create -f opsman-admin-credentials.yaml
oc create -f opsman-db-password.yaml
oc apply -f opsman-instance.yaml
```

We intentionally use `oc apply` here to be able to modify the MongoDBOpsManager resource later, e.g. to add backup functionality.

Watch the installation unfold, e.g. with `oc get pods -w` or `oc logs ops-manager-0 -f`. Be patient as it might take a couple of minutes until the Operations Manager is operational.

Create a route to make the Operations Manager's GUI accessible from the outside.

```
oc expose svc ops-manager-svc
```

## First time setup of Operations Manager

Access the GUI and log in with the credentials given with the above secret `opsman-admin-credentials.yaml`. You will be confronted with a first time setup of this tool. We won't go into details.

Finally your MongoDB Operations Manager is running and usable. We have completed step 2 of the setup procedure.

Additional users might now register themselves via the *Register* link on the login page.

## Install a MongoDB instance

The obvious way to get an instance of MongoDB up and running would be

1. Create an Operations Manager organization.

2. Create an Operations Manager project within the organization.

3. Create a MongoDB deployment (an actual database) within the project.

all via the Operations Manager GUI. The required elements exist and are functional. Unfortunately the resulting project will be no good in the OpenShift world. The deployment will be rejected with more or less helpful error messages. As [stated](https://docs.mongodb.com/kubernetes-operator/stable/tutorial/create-operator-credentials/) in the Operator's documentation

> Unlike earlier Kubernetes Operator versions, use the Operator to create your Ops Manager project. The Operator adds additional metadata to Projects that it creates to help manage the deployments.

you have to create the organization via the GUI. The rest has to be accomplished on the command line.

So make sure you are logged into the Operations Manager GUI. Click on the very top right *Operations* and *Organizations*. Click the green Button *NEW ORGANIZATION*. Give a name (we choose *test-orga* here). On the next page you have the option to add additional users to your organization with certain roles. Click *Create Organization* and the organization has come into being.

You now need the organization ID. Go to the page of your newly created organization (e.g. via *Operations* in the top right corner, *Organizations* and then the corresponding entry in the list of organizations). Click *Settings* in the left menu column and note down the organization ID given on that page.

Next you must create an API key that allows the Operator to access the Operations Manager. Click *Access* on the left and then select the tab *API keys*. Here click the big green button *Create API Key*. Note down the 8 character code below *Public Key*. Give a name to the API key and choose a permission - either *Organization Owner* or *Organization Project Creator*. Click *Next*. Here is the only time when you see the private key completely in clear text. Write it down - you will need it shortly. Add a whitelist entry to allow the operator to access the Operations Manager API. Use the Operations Manager pod ID address. You can get it with

```
oc get pod -l app=enterprise-operator -o jsonpath='{.items[0].status.podIP}'
```

(You may have realized that this white list doesn't work anymore as soon as the Operator gets restarted, i.e. it's run in a pod with a different IP address. You may specify the IP address range used for pods (e.g. 10.0.0.0/8). The problem is that it's impossible for mere mortals to determine this IP address range.)

Now it's time to create a secret and a config map in preparation of the deployment of a real MongoDB instance. The secret holds the credentials to access the Operations Manager API.

```yaml
apiVersion: v1
kind: Secret
stringData:
  user: <public-key>
  publicApiKey: <private-key>
type: Opaque
metadata:
  name: test-orga-api-key
```

Store this in a file named `test-orga-api-key.yaml`.

The config map has information about the project to create (provided it doesn't already exist), the organization where the project resides in and the URL to access the Operations Manager.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-project-config
data:
  projectName: "Test Project"
  orgId: <organization-id>
  baseUrl: http://<opsman-service>.<project>.svc.cluster.local:8080
```

Store this in a file named `test-project-config.yaml`.

The last resource we have to prepare is of type `MongoDB`.

```yaml
apiVersion: mongodb.com/v1
kind: MongoDB
metadata:
  name: test-replica-set
spec:
  members: 3
  version: 4.2.0
  opsManager:
    configMapRef:
      name: test-project-config
  credentials: test-orga-api-key
  type: ReplicaSet
  persistent: true
```

Store this in a file named `mongodb-instance.yaml`.

Finally we create the secret, the config map and the MongoDB resource in OpenShift. The latter will trigger the Operator and make it create the MongoDB replica set.

```
oc create -f test-orga-api-key.yaml
oc create -f test-project-config.yaml
oc create -f mongodb-instance.yaml
```

As with the Operations Manager it takes a couple of minutes until the MongoDB instance is fully deployed. You can watch it unfold with `oc get pods -w`. Or you can use the Operations Manager GUI to monitor your project and MongoDB replica set.

Pew! A hell lot of fiddling! As stated above running the Operations Manager on OpenShift is still beta and requires quite a few manual steps to get things up and running.

## Accessing the database

To connect to this replica set (from within the OpenShift cluster) you have to provide an URL with credentials and a list of all members, e.g.

```
mongodb://<username>:<password>@test-replica-set-0.test-replica-set-svc.mongodb.svc.cluster.local,test-replica-set-1.test-replica-set-svc.mongodb.svc.cluster.local,test-replica-set-2.test-replica-set-svc.mongodb.svc.cluster.local
```

## Cleanup

Remove all files with sensitive data

* `openshift_pull_secret.yaml`

* `opsman_admin_credentials.yaml`

* `opsman_db_passwd.yaml`

* `test-orga-api-key.yaml`

## Final considerations

The Operations Manager is still beta for OpenShift. As already mentioned this has an impact on how you create Operations Manager projects and MongoDB deployments. Additionally I had mixed experiences when trying to delete MongoDB deployments. This is supposed to be accomplished by deleting the corresponding `mongodb` resource. I tried it twice. One time with a lot of clicking around in the Operations Manager GUI to see the impact of this operation. The result was a totally confused Operations Manager. Not even restarting the Operations Manager healed the problem. Apparently the application DB was corrupted.

The second time I left the Operations Manager GUI untouched for quite a while. In the end the deployment appeared to be (mostly) removed. A lingering server was still reported on the deployment overview page. And I was irritated by the message *One or more agents are out of date* on top of the page.

Nevertheless I was able to deploy another replication set and then everything was fine again.

On a more general level it has to be asked whether running MongoDB within OpenShift is actually advisable. After deploying the Operations Manager I persistently got emails with

```
** WARNING: /sys/kernel/mm/transparent_hugepage/enabled is 'always'.
** We suggest setting it to 'never'

** WARNING: /sys/kernel/mm/transparent_hugepage/defrag is 'always'.
** We suggest setting it to 'never'
```

I don't think it is a good idea to tweak the kernel's memory page settings of your cluster nodes just because you have MongoDB running somewhere. It might impact the performance of ordinary (i.e. non-DB) applications. Additionally if performance of your MongoDB deployments is of concern (and it probably is) then running MongoDB within your OpenShift cluster using volumes provided by some cloud storage solution is not the ideal setup. You better stick to bare metal, i.e. physical disks accessed via some hardware interface.

That said it still might be a viable option to run your Operations Manager in OpenShift dutifully managing your MongoDB installation on some physical machines.

Mind that the statement to prefer bare metal installations does not only apply to MongoDB but basically to all database-like applications.