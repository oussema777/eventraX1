#!/usr/bin/env bash
# Installs only Eventra's bounded mail worker; does not restart web/payment services.
set -euo pipefail
test "$(id -u)" = 0 || { echo 'Run as root on the Eventra VPS.' >&2; exit 1; }
repo_dir="$(cd "$(dirname "$0")/.." && pwd -P)"
node_bin="$(command -v node)"
[[ "$repo_dir" = /var/www/eventraX1 ]] || { echo 'Unexpected application directory; nothing installed.' >&2; exit 1; }
[[ "$node_bin" =~ ^/[a-zA-Z0-9_./-]+$ ]] || { echo 'Unsupported Node path; nothing installed.' >&2; exit 1; }
test -f "$repo_dir/.env"
test -f "$repo_dir/scripts/review-delivery-worker.mjs"
"$node_bin" --env-file="$repo_dir/.env" -e '
const keys=["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","RESEND_API_KEY","EVENTRA_APP_ORIGIN","EVENTRA_MAIL_FROM"];
if(keys.some(key=>!process.env[key]) || process.env.SUPABASE_URL!=="https://kvfoswfaifxqnjqhftwc.supabase.co" || process.env.EVENTRA_APP_ORIGIN!=="https://eventra.cloud") { console.error("Eventra worker configuration incomplete; nothing installed."); process.exit(1); }
'
for unit in eventra-review-delivery.service eventra-review-delivery.timer; do
  unit_path="/etc/systemd/system/$unit"
  if test -e "$unit_path" && ! grep -q '^# Managed by Eventra review delivery installer$' "$unit_path"; then
    echo "Existing $unit is not managed by this installer; stopped without replacing it." >&2
    exit 1
  fi
done
unit_dir="$(mktemp -d "$repo_dir/.tmp/review-timer.XXXXXX")"
cat > "$unit_dir/eventra-review-delivery.service" <<EOF
# Managed by Eventra review delivery installer
[Unit]
Description=Eventra reviewed meeting email delivery
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$repo_dir
Environment=EVENTRA_REVIEW_DELIVERY_ENABLED=true
ExecStart=$node_bin --env-file=$repo_dir/.env $repo_dir/scripts/review-delivery-worker.mjs
TimeoutStartSec=25min
UMask=0077
NoNewPrivileges=true
EOF
cat > "$unit_dir/eventra-review-delivery.timer" <<'EOF'
# Managed by Eventra review delivery installer
[Unit]
Description=Run Eventra meeting email delivery every minute

[Timer]
OnActiveSec=10s
OnUnitInactiveSec=60s
AccuracySec=5s
Unit=eventra-review-delivery.service

[Install]
WantedBy=timers.target
EOF
systemd-analyze verify "$unit_dir/eventra-review-delivery.service" "$unit_dir/eventra-review-delivery.timer"
install -m 0644 "$unit_dir/eventra-review-delivery.service" /etc/systemd/system/eventra-review-delivery.service
install -m 0644 "$unit_dir/eventra-review-delivery.timer" /etc/systemd/system/eventra-review-delivery.timer
systemctl daemon-reload
systemctl enable --now eventra-review-delivery.timer
systemctl is-enabled eventra-review-delivery.timer
systemctl is-active eventra-review-delivery.timer
echo 'Eventra automatic email delivery enabled. No other application services were restarted.'
echo 'Inspect: journalctl -u eventra-review-delivery.service -n 20 --no-pager'
echo 'Pause: systemctl stop eventra-review-delivery.timer'
