#!/bin/sh
# Docsy's generated npm workspace pins the assets needed by Hugo.
set -eu
site_dir=${1:-/src}
# git-sync exposes its checkout through a symlink. npm's --prefix handling
# misidentifies that path as a workspace dependency; use the physical cwd.
cd -P "$site_dir"
site_dir=$(pwd -P)
if node - "$site_dir" <<'JS'
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
try {
  const { dependencies } = JSON.parse(fs.readFileSync(path.join(root, 'packages/hugoautogen/package.json')));
  for (const [name, version] of Object.entries(dependencies)) {
    const installed = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', name, 'package.json')));
    if (installed.version !== version) process.exit(1);
  }
} catch { process.exit(1); }
JS
then
  exit 0
fi
npm ci --workspace hugoautogen --include-workspace-root=false --ignore-scripts --no-audit --no-fund
