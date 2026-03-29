# VPS Social Sharing & SEO Setup Guide

## What This Does
When someone shares an event link on Facebook/Twitter/LinkedIn/WhatsApp, the crawler sees a proper preview with the event image, title, and description — instead of the generic platform meta tags.

## How It Works
1. `og-server.js` runs on port 5002 — a lightweight Node.js server that fetches event/profile data from Supabase and returns HTML with correct OG meta tags
2. Nginx detects social media crawlers (Facebook, Twitter, LinkedIn, WhatsApp, etc.) and proxies their requests to the OG server
3. Normal users still get the regular SPA

---

## Step 1: Start the OG Server with PM2

```bash
cd /var/www/eventraX1
pm2 start og-server.js --name og-server
pm2 save
```

Make sure the environment variables are available. Either:
- Set them in the shell before starting PM2, or
- Use an ecosystem file:

```bash
# Create ecosystem.config.cjs
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'og-server',
      script: 'og-server.js',
      env: {
        VITE_SUPABASE_URL: 'YOUR_SUPABASE_URL',
        VITE_SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
      },
    },
    {
      name: 'email-proxy',
      script: 'email-proxy.js',
      env: {
        RESEND_API_KEY: 'YOUR_RESEND_API_KEY',
      },
    },
  ],
};
EOF

pm2 start ecosystem.config.cjs
pm2 save
```

## Step 2: Update Nginx Config

Edit your Nginx site config (e.g., `/etc/nginx/sites-available/eventra.cloud.conf`).

Add bot detection **before** the `location /` block, and add the OG proxy location:

```nginx
# Social media bot detection
set $is_bot 0;
if ($http_user_agent ~* "facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|bingbot|googlebot|yandex|baiduspider") {
    set $is_bot 1;
}
# Don't proxy static assets
if ($uri ~* "\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map|webp|avif)$") {
    set $is_bot 0;
}

location / {
    if ($is_bot = 1) {
        proxy_pass http://127.0.0.1:5002;
    }
    try_files $uri $uri/ /index.html;
}
```

Then test and restart:

```bash
sudo nginx -t && sudo systemctl restart nginx
```

## Step 3: Test

```bash
# Test as Facebook crawler — should show event OG tags
curl -s -A "facebookexternalhit/1.1" https://eventra.cloud/event/YOUR_EVENT_ID/landing | head -30

# Test as normal browser — should show SPA shell
curl -s https://eventra.cloud | head -10

# Test platform homepage as bot
curl -s -A "Twitterbot/1.0" https://eventra.cloud | head -20
```

You should see proper `<meta property="og:title"`, `og:image`, etc. in the bot response.

## Step 4: Validate on Facebook

1. Go to: https://developers.facebook.com/tools/debug/
2. Paste your event link: `https://eventra.cloud/event/EVENT_ID/landing`
3. Click "Debug" — it should show the event image, title, and description
4. If it shows old data, click "Scrape Again"

## Step 5: Sitemap Cron (Optional)

Regenerate sitemap daily:

```bash
crontab -e
# Add:
0 3 * * * cd /var/www/eventraX1 && node --env-file=.env scripts/generate-sitemap.js
```
