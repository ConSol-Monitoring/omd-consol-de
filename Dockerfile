# ghcr.io/consol-monitoring/ocd:0.140.2-1
# consol's image tag will be the version from floryn90/hugo:{version}-ext-alpine
# plus an extra prerelease number in case there are
# any changes here in this Dockerfile. (it is not actually a pre-release,
# but the tag has to conform to the semver scheme, where only 3 numbers
# are allowed)
FROM floryn90/hugo:0.140.2-ext-alpine
USER root
RUN apk add git && \
  git config --global --add safe.directory /src
