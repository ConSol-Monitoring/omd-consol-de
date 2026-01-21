---
author: Markus Hansmair
date: '2022-03-14'
featured_image: /assets/images/tekton.png
meta_description: How to get image change triggers for Tekton pipelines
tags:
- CI/CD
title: Image Change Triggers for Tekton
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

One of our customers is in the process of decommisioning their OpenShift v3.11 cluster. This cluster is currently still used for building customer specific base images. Over time quite a few elaborated pipeline builds (based on Jenkins) have been developed for that purpose.

The customer wanted me to migrate the existing pipeline builds on their v3.11 cluster to Tekton (aka OpenShift Pipeline) builds running on their new v4.9 cluster. This task turned out to be quite pesky. Tekton is a beast in many aspects.

<!--more-->

For instance the base images that we want to build are in some cases dependent on each other.  In other words we want one newly built base image to trigger the build(s) of other base image(s). Turned out there is nothing in Tekton that compares to image change triggers in BuildConfigs.

We did some brainstorming internally and in parallel got in contact with Red Hat.  We ended up with two options:

* Conventional BuildConfigs starting pipeline builds by means of a custom build.

* Taking advantage of the custom resource ApiServerSource that comes with Knative Eventing. This resource is able to transform change events from arbitrary resources into HTTP requests that in turn can be sent to some EventListener as provided by Tekton. A Red Hat engineer named Andrew Block has published this solution on [GitHub](https://github.com/sabre1041/image-trigger-tekton).

Both options have their drawbacks. Custom builds as needed for the first option are [poorly](https://docs.openshift.com/container-platform/4.9/cicd/builds/understanding-image-builds.html#builds-strategy-custom-build_understanding-image-builds) [documented](https://docs.openshift.com/container-platform/4.9/cicd/builds/build-strategies.html#builds-strategy-custom-build_build-strategies).  The second option requires installation of two bulky products (Knative and Knative Eventing) just to get the desired resource ApiServerSource.  Our customer currently has no demand for Knative and regarded the second option as *breaking a nut with a sledgehammer*. So I focused on option one.

## Basic idea

The basic idea is to use conventional BuildConfigs and take advantage of their image change trigger feature. An image change triggers a custom build (i.e. a builder pod with a custom image is started) that in turn creates an instance of PipelineRun, i.e. a pipeline build is started.

## Evolution

To my surprise I didn't encounter any major obstacles. The approach worked to my satisfaction right from the beginning. It worked so well that I decided to tear down all the resources that were already in place just to get HTTP endpoints for source change triggers: EventListeners, TriggerTemplates, TriggerBindings, Triggers. I was able to get rid of all this bloat just by adding a few lines to my BuildConfig.

A second improvement was to create an owned-by relation between the PipelineRun resource that was created by the custom build and the Build resource itself.  It was thus possible to later just delete the Build resource only and have OpenShift take care of deletion of all depending resources, i.e. PipelineRun and all Pods running tasks of the pipeline.

Another evolutionary step was to aggregate the output of all the various containers started in the course of one single pipeline run in the custom build.  This way is became possible to display the output of the build with `oc logs build/...` or even do `oc start-build --follow`.  No need to install the `tkn` CLI tool for Tekton.

A final extra is due to the special workflow applied by the customer. New base images aren't promoted right away but require a review and approval step. Not yet approved base images are stored in a separate ImageStream with the tag *to-be-approved*. Nevertheless, these *to-be-approved* images may trigger the builds for other base images by means of image change triggers. However, when the same base image builds get triggered by a source code change the underlying base image needs to be an already approved one as the *to-be-approved* version may not be available at all, or it may be still in the approval process, or it may not have been approved for good reasons.

So the following extra logic was coded into the custom build: In case the custom build has been triggered by an image change trigger this image is determined and used as the base image for the pipeline build to be started. In all other cases the base image specified in the Dockerfile by the `FROM` clause is used.

(For further evolutionary steps see the update sections at the end of the article.)

## Details

**Disclaimer**: The following explanations sometimes assume some basic knowledge of Tekton pipelines and tasks. Apologies for any confusion this may cause for the uninitiated.

I will demonstrate the approach with a relatively simple use case. A build for a customized base image `java11-custom` that is derived from a customized UBI8 base image `ubi8-custom`. The Tekton pipeline only consists of two tasks - *git-clone* and *buildah* that are readily provided by OpenShift Pipelines.  The pipeline is named *simple*. (It's basically the Tekton analogon of a BuildConfig with Docker strategy.)

### BuildConfig

Let's start with the BuildConfig that is at the beginning of each build:

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: start-java11-pipeline
spec:
  runPolicy: Serial
  serviceAccount: pipeline
  source:
    binary: {}
    type: Binary
  strategy:
    customStrategy:
      env:
      - name: IMAGESTREAM
        value: java11-custom
      - name: GIT_URL
        value: git@<git-server-name>:<some-path>/java-custom.git
      - name: GIT_REVISION
        value: jdk11
      - name: NAME_PREFIX
        value: java11
      from:
        kind: ImageStreamTag
        name: simple-pipeline-starter:latest
    type: Custom
  triggers:
  - imageChange:
      from:
        kind: ImageStreamTag
        name: ubi8-custom:to-be-approved
    type: ImageChange
  - generic:
      secretReference:
        name: webhook-token
    type: Generic
```

There are several details to point out. First of all this BuildConfig specifies a custom build (i.e. `spec.strategy.type: Custom`). The build pod is started with a custom image (`spec.strategy.customStrategy.from.name: simple-pipeline-starter:latest`).  I'll get back to this builder image soon.

The Tekton pipeline that ultimately will be started is rather generic. The concrete details about what to build and how and where to store it are determined by a bunch of environment variables specified in `spec.strategy.customStrategy.env`. (Not all possible variables are shown here.  Some have reasonable defaults so that they can be ommitted.)

It is necessary to start the builder image with credentials of the service account *pipeline* (`spec.serviceAccount: pipeline`). Only this way it is possible to create an instance of PipelineRun, i.e. start a Tekton pipeline.

The `spec.triggers` section is the reason why this all came into being. There is a source change trigger and an image change trigger. The image change trigger monitors the ImageStreamTag `ubi8-custom:to-be-approved` which is another customized base image. As soon as this customized UBI8 image has been newly built the above BuildConfig triggers a new build for image `java11-custom`.  (Mind the tag name `to-be-approved` indicating the customized UBI8 image has not been approved yet.  Nevertheless, the `java11-custom` base image is built based on this customized UBI8 image.)

### Builder image

The builder image for the custom build itself is built with a conventional BuildConfig with Docker build strategy. The Dockerfile looks like:

```
FROM registry.redhat.io/openshift4/ose-cli:v4.9
ARG tkn_dl_link=https://mirror.openshift.com/pub/openshift-v4/clients/pipeline/0.19.1/tkn-linux-amd64-0.19.1.tar.gz
COPY build.sh /usr/bin/build.sh
RUN yum -y update && yum -y install jq && yum clean all && \
    ( curl $tkn_dl_link | tar -C /usr/bin -xzf - tkn ) && \
    chmod 755 /usr/bin/build.sh
ENTRYPOINT [ "/usr/bin/build.sh" ]
```

The builder image is based on the Red Hat provided image `ose-cli:v4.9` enabling to run the `oc` CLI tool within a container. The Dockerfile additionally installs the `tkn` CLI tool of Tekton and `jq`, a command line tool to deal with JSON formatted data. These three tools `oc`, `tkn` and `jq` are important building blocks for the actual build script `build.sh` that is also added to the builder image and specified as entrypoint.  Let's have a look at it:

```bash
#!/usr/bin/bash

# extract image that caused image change trigger
TRIGGERED_BY_IMAGE=$(echo "$BUILD" | jq -j '.spec.triggeredBy[0].imageChangeBuild.imageID')
[ "$TRIGGERED_BY_IMAGE" != "null" ] && FROM_IMAGE="$TRIGGERED_BY_IMAGE"
if [ -n "$FROM_IMAGE" ]; then
    # ... and use it as FROM in buildah build
    BUILD_EXTRA_ARGS="${BUILD_EXTRA_ARGS:+${BUILD_EXTRA_ARGS} }--from $FROM_IMAGE"
fi

BUILD_DATE=$(date --utc '+%Y-%m-%dT%H:%M:%SZ')
BUILD_EXTRA_ARGS="${BUILD_EXTRA_ARGS:+${BUILD_EXTRA_ARGS} }--label build-date=${BUILD_DATE}"

BUILD_KIND=$(echo "$BUILD" | jq -j '.kind')
BUILD_API_VERSION=$(echo "$BUILD" | jq -j '.apiVersion')
BUILD_NAME=$(echo "$BUILD" | jq -j '.metadata.name')
BUILD_UID=$(echo "$BUILD" | jq -j '.metadata.uid')

PR_NAME=$(oc create -f - << __EOF__ | sed 's/pipelinerun\.tekton\.dev\/\(.*\) created/\1/'
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: ${NAME_PREFIX:-${IMAGESTREAM}}-
  labels:
    tekton.dev/pipeline: simple
  ownerReferences:
  - apiVersion: "${BUILD_API_VERSION}"
    kind: "${BUILD_KIND}"
    name: "${BUILD_NAME}"
    uid: "${BUILD_UID}"
spec:
  params:
  - name: dockerfile
    value: ${DOCKERFILE:-Dockerfile}
  - name: git-revision
    value: ${GIT_REVISION:-master}
  - name: git-url
    value: ${GIT_URL}
  - name: imagestream
    value: ${IMAGESTREAM}
  - name: build-extra-args
    value: "${BUILD_EXTRA_ARGS}"
  - name: build-name
    value: ${BUILD_NAME}
  pipelineRef:
    name: simple
  serviceAccountName: pipeline
  timeout: 1h0m0s
  workspaces:
  - name: ssh-dir
    secret:
      secretName: ssh-files
  - name: shared-workspace
    volumeClaimTemplate:
      apiVersion: v1
      kind: PersistentVolumeClaim
      metadata:
        name: source-pvc
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 500Mi
__EOF__
)
tkn pipelinerun logs --follow "$PR_NAME"
COMPLETION_REASON="$(oc get pipelinerun/${PR_NAME} -o jsonpath='{.status.conditions[0].reason}')"
test "$COMPLETION_REASON" == "Succeeded" && exit 0
test "$COMPLETION_REASON" == "Completed" && exit 0
exit 1
```

The principal functionality is to create an instance of PipelineRun (`oc create -f -`).  The output of this command is processed with `sed` to extract the name of the PipelineRun.  (It is stored in `$PR_NAME`.) Tekton's CLI tool `tkn` is then used to display the output generated by the various containers started by this PipelineRun. It is thus possible to display the output with `oc logs build/<build-name>` or watch the build output when started with `oc start-build start-java11-pipeline --follow`.

The input to `oc create -f -` is provided by means of a so-called [here document](https://www.gnu.org/software/bash/manual/bash.html#Here-Documents) - anything between `oc create -f - << __EOF__` and `__EOF__`. It defines the YAML code of the PipelineRun resource to be created.

A custom build (as any other build derived from a BuildConfig) is represented by a Build resource. For custom builds the corresponding Build resource is provided to the build process by the environment variable `$BUILD` as JSON data. `build.sh` takes advantage of this information in two ways.

First, the build script extracts the URL of the image that was changed and triggered this build (`$TRIGGERED_BY_IMAGE`). In case this build was actually triggered by an image change (`"$TRIGGERED_BY_IMAGE" != "null"`) this image is used as the base image for the following PipelineRun (overriding any base image specified by the `FROM` clause in the Dockerfile). This is achieved by appending the option `--from <image>` to the variable `$BUILD_EXTRA_ARGS` that is handed down to `buildah` by means of a corresponding pipeline and later task parameter.

Second, the build script extracts data from the JSON data about the Build instance itself (`BUILD_KIND`, `BUILD_API_VERSION`, `BUILD_NAME`, `BUILD_UID`) and adds it into the PipelineRun YAML (`metadata.ownerReferences`).  This way an owned-by relation between the PipelineRun instance and the Build instance is introduced. As a consequence when the Build instance is deleted OpenShift automatically takes care of also deleting the PipelineRun instance *owned by* this Build instance (and also all other resources created by the PipelineRun).

### Relations and namings

For this setup each Tekton pipeline requires a corresponding builder image, not only because of the reference to the pipeline in the build script (`spec.pipelineRef.name`) but also due to the pipeline specific set of parameters (`spec.params`) and the workspaces required by the pipeline (`spec.workspaces`). I've introduced the naming convention *&lt;pipeline-name&gt;-pipeline-starter* (e.g.  *simple-pipeline-starter*) for the custom build images.

The concrete usage of a Tekton pipeline is modelled by BuildConfigs specifying values of pipeline parameters. These are named by the pattern *start-&lt;prefix&gt;-pipeline* where *&lt;prefix&gt;* is prepended to the name of the to-be-created PipelineRun instance. It is automatically also used as a prefix for the names of all the pods that are started by the PipelineRun.

```
start-java11-pipeline                                   BuildConfig
└ start-java11-pipeline-7                               Build
  └ start-java11-pipeline-7-build                       Build pod
    └ java11-fsr4k                                      PipelineRun
      ├ java11-fsr4k-fetch-repository-cghx4-pod-b8r72   Tekton task pod
      └ java11-fsr4k-build-image-lvgnn-pod-56wdb        Tekton task pod
```

## Benefits

I see five benefits of the outlined solution:

1.  **Image change triggers**: Tekton simply lacks any support for image change triggers.  With this approach you get them without much overhead.

2.  **Source code change triggers**: The set of resources offered by Tekton for triggering PipelineRuns by arbitrary HTTP requests is very powerful.  Nevertheless, it has to be stated that configuring such a trigger is tedious - if not painful. It involves an EventListener, a TriggerTemplate, a TriggerBinding and a Trigger. With the above approach setting up a source change trigger becomes a matter of 4 lines of YAML code in one BuildConfig.

3.  **Easy starting of builds**: With one BuildConfig for each concrete usage of a Tekton pipeline spinning up a PipelineRun becomes a matter of `oc start-build <buildconfig-name>` (or a click on *Start build* in the web UI). In contrast, starting a Pipeline with `tkn pipeline start` tends to become cumbersome.

4.  **Easy access to build log output**: The build log output in Tekton is scattered on (potentially) many containers in quite a few pods that are started by one PipelineRun. The custom build takes advantage of `tkn pipeline logs` thus replicating the aggregated build log in the context of the build. As a consequence the complete build log can be displayed with `oc logs`. You can even watch the build output in real time with `oc start-build <buildconfig-name> --follow`.  (Sidenote: You don't need `tkn` all if you just want to start and observe builds.)

5.  **Customized build logic**: To a certain degree it is possible to adapt the custom build to specific needs, workflows, conventions as demonstrated above with the *to-be-approved* tag logic. (See also *Update (2022-05-30)* below.)

## Update (2022-04-21)

Originally the above described BuildConfig used a webhook of Type *GitLab*. This caused a subtle bug with regard to source code change triggers. As [OpenShift's documentation](https://docs.openshift.com/container-platform/4.9/cicd/builds/triggering-builds-build-hooks.html#builds-webhook-triggers_triggering-builds-build-hooks) states:

> When the push events are processed, the OpenShift Container Platform control plane host confirms if the branch reference inside the event matches the branch reference in the corresponding BuildConfig. If so, it then checks out the exact commit reference noted in the webhook event on the OpenShift Container Platform build. If they do not match, no build is triggered.

Unfortunately the BuildConfig references no git repository and no branch to get its input from. It simply starts a custom build with no input except some environment variables. Thus OpenShift assumes that git branch *master* is relevant. Consequently only POST requests caused by push events on branch *master* ultimately trigger a build. All other branches cannot be used for source code change triggers.

The workaround is to use a webhook of type *Generic*. With this type of webhooks the request body of the POST request is not taken account. As long as the webhook token in the URL matches the token in the secret referenced in the BuildConfig a build is triggered.

## Update (2022-05-12)

The final status of the Builds created by the BuildConfig originally did not reflect the outcome of the underlying PipelineRun. In other words: Even when the PipelineRun ran into some problem and resulted in Status *Failed* the corresponding Build always showed *Complete*, not *Error*.

The fix was to make sure that the build script `build.sh` terminates with a return code 0 in case everything was fine or a return code of 1 (or any other value not equal 0) in case some problem occurred. To achieve this I evaluate the status of the PipelineRun. When the `reason` field was set to *Succeeded* the script returns with 0, in all other cases with 1. See the last to lines of the above script `build.sh`.

## Update (2022-05-30)

I've introduced a conditional step to the Pipeline *simple*: It sends email notifications in case any problem occurred during the PipelineRun. This had the effect that the completion reason for the good case (no problems during PipelineRun, no failure notification) changed from *Succeeded* to *Completed*. The build script `build.sh` has been adapted accordingly.

Additionally our customer requested each image to be labelled with the build date. This has also been added to the build script.

## Final words

My thanks go to Gerd Beyer for his initial idea.

Any comments, additions, corrections are welcome: &lt;firstname&gt;.&lt;lastname&gt; at consol.de