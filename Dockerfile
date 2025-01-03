# ghcr.io/consol-monitoring/ocd:0.140.2-1
# consol's image will get the tag from hugomods/hugo
# plus an extra prerelease number in case there are
# any changes here in this Dockerfile. (it is not actually a pre-release,
# but the tag has to conform to the semver scheme, whre only 3 numbers
# are allowed)
#FROM hugomods/hugo:0.140.2
FROM floryn90/hugo:0.140.2-ext-alpine
USER root
RUN apk add git && \
  git config --global --add safe.directory /src
#RUN npm install -g postcss-cli
#RUN npm install autoprefixer
#RUN npm audit fix
#USER hugo
#WORKDIR /home/hugo
#RUN npm config set prefix "/home/hugo/vendor/node_modules"
#RUN npm install -g postcss-cli
#RUN npm config set prefix "/home/hugo/vendor/node_modules"
#RUN npm install autoprefixer
#RUN npm config set prefix "/home/hugo/vendor/node_modules"
#RUN npm audit fix
