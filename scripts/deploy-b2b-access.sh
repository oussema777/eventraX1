#!/usr/bin/env bash
# Run after git pull on the Eventra VPS. The Supabase function is deployed separately.
set -euo pipefail
cd "$(dirname "$0")/.."

test -f .env || { echo 'Missing production .env' >&2; exit 1; }
test -f build/index.html || { echo 'Expected the existing site at build/index.html' >&2; exit 1; }

release_dir=".tmp/b2b-access-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$release_dir"
cp build/index.html "$release_dir/previous-index.html"
npm run build -- --outDir "$release_dir/site"

# Keep older hashed assets for participants with an already-open browser tab.
mkdir -p build/assets
cp -a "$release_dir/site/assets/." build/assets/
cp "$release_dir/site/index.html" build/index.html.next
mv -f build/index.html.next build/index.html

printf 'Website updated. Previous entrypoint: %s/previous-index.html\n' "$release_dir"
