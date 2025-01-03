# ghcr.io/consol-monitoring/ocd:0.140.2-1
# consol's image will get the tag from hugomods/hugo
# plus an extra prerelease number in case there are
# any changes here in this Dockerfile. (it is not actually a pre-release,
# but the tag has to conform to the semver scheme, whre only 3 numbers
# are allowed)
FROM hugomods/hugo:0.140.2
RUN apk add git && \
  git config --global --add safe.directory /src
RUN npm install -g postcss-cli
RUN npm install autoprefixer
RUN npm audit fix
