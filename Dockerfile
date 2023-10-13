FROM klakegg/hugo:ext-ubuntu

RUN apt-get install git && \
  git config --global --add safe.directory /src
