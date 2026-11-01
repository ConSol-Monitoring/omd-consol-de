#!/bin/sh
set -eu
sh /usr/local/bin/install-theme-deps.sh /src
exec /bin/hugo "$@"
