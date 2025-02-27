### Installation

#### New container image
If the Dockerfile or anything which will be copied into the image has changed, then a tag image-<version> has to be applied and pushed.
A github acion "Create and publish a docker image" will be triggered and the new image will be produced.
In the deployment folder there is a file ocd-05-deployment.yml, where the image tag of ghcr.io/consol-monitoring/ocd:<new-version> has to be updated.

#### New deployment
The deployment folder has to be copied to the omd.consol.de server and kubectl apply -f . has to be run.


