# ghcr.io/consol/omd-consol-de/ocd:0.140.2.1
# consol's image will get the tag from hugomods/hugo
# plus an extra minor release number in case there are
# any changes here in this Dockerfile.
FROM hugomods/hugo:0.140.2
RUN apk add git && \
  git config --global --add safe.directory /src
RUN npm install -g postcss-cli
RUN npm install autoprefixer
RUN npm audit fix
