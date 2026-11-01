FROM docker.io/floryn90/hugo:0.169.0-ext-alpine
USER root

# Hugo invokes the native Dart Sass CLI supplied by sass-embedded.
RUN npm install --global --ignore-scripts sass-embedded@1.102.0

# Bind-mounted checkouts need the theme workspace installed at startup.
COPY scripts/install-theme-deps.sh scripts/hugo-container.sh /usr/local/bin/
ENTRYPOINT ["/bin/sh", "/usr/local/bin/hugo-container.sh"]
