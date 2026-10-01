#!/usr/bin/env bash
# Run from the updated repository on the VPS after applying the SQL migration.
# Keeps earlier hashed assets so active registration tabs can still load them.
set -euo pipefail

cd "$(dirname "$0")/.."
test -f build/index.html || { echo 'Expected the existing site at build/index.html; verify the Nginx document root before deploying.' >&2; exit 1; }
test -f .env || { echo 'Missing production .env' >&2; exit 1; }
pm2 describe og-server >/dev/null

release_dir=".tmp/branded-links-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$release_dir"
cp build/index.html "$release_dir/previous-index.html"
npm run build -- --outDir "$release_dir/site"

# Refresh preview code first; all legacy URLs remain supported.
node --check og-server.js
node --check scripts/event-preview.js
pm2 restart og-server

# Copy assets before atomically replacing the entrypoint. Never empty build/.
mkdir -p build/assets
cp -a "$release_dir/site/assets/." build/assets/
cp "$release_dir/site/index.html" build/index.html.next
mv -f build/index.html.next build/index.html

printf 'Deployment complete. Previous entrypoint: %s/previous-index.html\n' "$release_dir"
printf 'Now run database/scripts/sql_activate_investissement_link.sql in Supabase, then npm run generate-sitemap.\n'
