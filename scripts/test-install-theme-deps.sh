#!/bin/sh
# Run in the Hugo container; cover both local and git-sync checkout paths.
set -eu
repo_dir=$(CDPATH= cd -P "$(dirname "$0")/.." && pwd -P)
fixture_root=$(mktemp -d)
trap 'rm -rf "$fixture_root"' EXIT

for checkout in direct .worktrees/revision; do
  mkdir -p "$fixture_root/$checkout/packages/hugoautogen"
  cp "$repo_dir/package.json" "$repo_dir/package-lock.json" "$fixture_root/$checkout/"
  cp "$repo_dir/packages/hugoautogen/package.json" "$fixture_root/$checkout/packages/hugoautogen/"
done
ln -s .worktrees/revision "$fixture_root/ocd"

for checkout in direct ocd; do
  site_dir="$fixture_root/$checkout"
  lock_before=$(sha256sum "$site_dir/package-lock.json")
  sh "$repo_dir/scripts/install-theme-deps.sh" "$site_dir"
  test -f "$site_dir/node_modules/bootstrap/scss/_functions.scss"
  test -f "$site_dir/node_modules/@fortawesome/fontawesome-free/css/all.css"
  test "$lock_before" = "$(sha256sum "$site_dir/package-lock.json")"
done

printf '%s\n' 'PASS: direct and symlinked checkouts install locked theme assets without changing the lockfile.'
