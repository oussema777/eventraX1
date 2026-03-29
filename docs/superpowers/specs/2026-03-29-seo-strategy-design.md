# Eventra SEO Strategy — Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Platform:** eventra.cloud (VPS + Nginx, React SPA)
**VPS Requirements:** Minimum 2GB RAM (4GB recommended) for headless Chromium prerender

## Problem

Eventra is a pure client-side SPA. Google sees an empty `<div id="root"></div>` when crawling. There are no meta tags, no sitemap, no robots.txt, no structured data, and no prerendering. The platform is invisible to search engines.

## Goals

- Make all public pages crawlable and indexable by Google
- Rank for regional keywords: "event management Tunisia", "conference platform Africa"
- Rank for product keywords: "event registration platform", "B2B event networking"
- Rank individual event pages for "{event name} {city} {year}" searches
- Enable rich snippets (event dates, locations) in Google Search results
- Professional social sharing with Open Graph previews

## Non-Goals

- Blog / content marketing (explicitly excluded)
- Migration to Next.js or SSR framework
- Paid ads strategy

---

## Layer 1: Technical SEO Foundation

### 1.1 Prerender Service on VPS

**What:** Install Prerender (open-source) on the VPS. Nginx detects crawler user-agents (Googlebot, Bingbot, etc.) and proxies those requests to the prerender service, which returns fully rendered HTML. Real users still get the SPA.

**How:**
- Install `prerender` Node.js service on VPS (port 3000 or similar)
- Run as a PM2-managed process
- Add Nginx config block to detect bot user-agents and proxy to prerender
- Cache rendered pages to disk (24h TTL) for fast bot responses

**Nginx config pattern:**
```nginx
location / {
    # Detect bots
    set $prerender 0;
    if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|linkedinbot|slackbot|whatsapp") {
        set $prerender 1;
    }
    # Don't prerender static assets
    if ($uri ~* "\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$") {
        set $prerender 0;
    }
    # Route bots to self-hosted prerender (open-source format)
    if ($prerender = 1) {
        proxy_pass http://localhost:3000/$scheme://$host$request_uri;
    }
    # Normal SPA serving
    try_files $uri $uri/ /index.html;
}
```

**Cache invalidation:** When event data changes (name, date, status), bust the cached prerender for that URL. Implement via a simple `curl -X DELETE http://localhost:3000/cache/$URL` call after event updates.

**Cache warming:** After deployment, run a script that pre-renders the top 50 pages so bots never hit cold cache:
```bash
# scripts/warm-prerender-cache.sh
while read url; do
  curl -s "http://localhost:3000/https://eventra.cloud$url" > /dev/null
done < scripts/top-urls.txt
```
```

### 1.2 Hreflang Tags for Multilingual SEO

Eventra supports EN/FR/AR. Each public page must include hreflang tags so Google serves the correct language version:

```html
<link rel="alternate" hreflang="en" href="https://eventra.cloud/events?lang=en" />
<link rel="alternate" hreflang="fr" href="https://eventra.cloud/events?lang=fr" />
<link rel="alternate" hreflang="ar" href="https://eventra.cloud/events?lang=ar" />
<link rel="alternate" hreflang="x-default" href="https://eventra.cloud/events" />
```

The `<html lang>` attribute must also be dynamic — `lang="en"`, `lang="fr"`, or `lang="ar" dir="rtl"` based on the active language. React Helmet can manage this.

### 1.3 React Helmet for Dynamic Meta Tags

**What:** Install `react-helmet-async` to set per-page `<title>`, `<meta description>`, Open Graph tags, and Twitter Card tags.

**Pages to implement:**
| Page | Title Pattern | Description |
|------|--------------|-------------|
| Homepage | "Eventra - Professional Event Management & B2B Networking" | Platform description with CTA |
| Browse Events | "Explore Events - {filter} \| Eventra" | Dynamic based on active filters |
| Event Landing | "{Event Name} \| {City} \| Eventra" | Event description (first 160 chars) |
| Event Registration | "Register for {Event Name} \| Eventra" | Registration CTA |
| Community Discovery | "Find Professionals - {Industry} \| Eventra" | Community description |
| Profile Page | "{User Name} - {Title} \| Eventra" | Professional profile |
| Auth/Login | "Sign In \| Eventra" | Standard auth page |

**Open Graph tags per page:**
- `og:title` — Same as page title
- `og:description` — Same as meta description
- `og:image` — Event cover photo (events), Eventra logo (other pages)
- `og:url` — Canonical URL
- `og:type` — "website" (all pages — there is no standard OG type for events)

**Twitter Card tags:**
- `twitter:card` — "summary_large_image"
- `twitter:title`, `twitter:description`, `twitter:image`

### 1.4 Structured Data (JSON-LD)

**Homepage — Organization schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Eventra",
  "url": "https://eventra.cloud",
  "description": "Professional Event Management & B2B Networking Platform",
  "logo": "https://eventra.cloud/favicon.png",
  "sameAs": ["https://linkedin.com/company/eventra", "https://twitter.com/eventra"]
}
```

**Event pages — Event schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "{eventName}",
  "startDate": "{startDate}",
  "endDate": "{endDate}",
  "location": {
    "@type": "Place",
    "name": "{venueName}",
    "address": "{address}"
  },
  "organizer": {
    "@type": "Organization",
    "name": "{organizerName}"
  },
  "description": "{eventDescription}",
  "image": "{coverImageUrl}",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "{dynamic: Offline|Online|Mixed based on event_format}",
  "offers": {
    "@type": "Offer",
    "url": "https://eventra.cloud/event/{id}/register",
    "price": "{ticketPrice}",
    "priceCurrency": "{currency}",
    "availability": "https://schema.org/InStock",
    "validFrom": "{ticketSaleStartDate}"
  }
}
```

**All pages — BreadcrumbList schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://eventra.cloud" },
    { "@type": "ListItem", "position": 2, "name": "Events", "item": "https://eventra.cloud/events" },
    { "@type": "ListItem", "position": 3, "name": "{Event Name}" }
  ]
}
```

### 1.5 Sitemap.xml

**Auto-generated sitemap** served at `eventra.cloud/sitemap.xml`:

Static routes:
- `/` (homepage) — priority 1.0, changefreq weekly
- `/events` (browse) — priority 0.8, changefreq daily
- `/community` (discovery) — priority 0.7, changefreq weekly

Dynamic routes (from Supabase):
- `/event/{id}/landing` for each published event — priority 0.9, changefreq weekly
- `/profile/{id}` for public profiles — priority 0.5, changefreq monthly

**Implementation:** A PM2-managed cron script (`scripts/generate-sitemap.js`) that queries Supabase for published events, generates XML, and writes it to `/var/www/eventraX1/build/sitemap.xml`. Runs every 24 hours via PM2 cron or system crontab.

### 1.6 Robots.txt

```
User-agent: *
Allow: /
Allow: /events
Allow: /event/
Allow: /community
Allow: /profile/

Disallow: /dashboard
Disallow: /wizard
Disallow: /my-networking
Disallow: /settings
Disallow: /api/

Sitemap: https://eventra.cloud/sitemap.xml
```

### 1.7 Canonical URLs

Every page gets a `<link rel="canonical" href="...">` tag via React Helmet to prevent duplicate content issues.

### 1.8 Noindex for Protected Pages

Protected routes (`/dashboard`, `/wizard`, `/create/*`, `/my-profile`, `/my-networking`, `/settings`) must have `<meta name="robots" content="noindex, nofollow">` via React Helmet. This is defense-in-depth alongside `robots.txt` Disallow — Google may still index disallowed pages if linked externally.

### 1.9 404 Handling

Currently all routes return 200 with the SPA shell. The prerender service must return proper 404 status codes for invalid routes. Add a catch-all 404 page component in React Router that sets `<meta name="robots" content="noindex">` to prevent Google from indexing garbage URLs.

### 1.10 SEOHead Component Interface

Reusable component wrapping React Helmet:
```typescript
interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
  lang?: 'en' | 'fr' | 'ar';
}
```

---

## Layer 2: On-Page SEO

### 2.1 Homepage Optimization

**Target keywords:** "event management platform", "B2B networking events", "professional event registration", "event management Tunisia"

- H1 tag with primary keyword (currently missing)
- Keyword-rich section headings (H2/H3)
- Internal links to browse events, community pages
- Alt text on all images
- Compelling meta description with CTA

### 2.2 Event Landing Pages

- Wire existing SEO section (wizard) to actual meta tags via React Helmet
  - Wizard `metaTitle` field → `<title>` and `og:title`
  - Wizard `metaDescription` field → `<meta name="description">` and `og:description`
  - Wizard `keywords` field → `<meta name="keywords">`
  - Wizard `urlSlug` field → canonical URL
- Use event description as meta description fallback (truncated to 160 chars)
- Event cover photo as Open Graph image
- JSON-LD Event schema (enables rich snippets in Google)
- **URL slug strategy:** Add `url_slug` column to events table. Generate slugs from event name (lowercase, hyphenated, ASCII-transliterated for Arabic). Keep existing `/event/:eventId/landing` route working and add `/events/:slug` as the canonical route. Nginx 301 redirect from old URL format to new slug URL to preserve any existing link equity.
- Alt text on event images — use event name as fallback when no alt text provided

### 2.3 Community/Discovery Pages

- Dynamic titles based on active filters
- Category pages as keyword landing pages
- "Find {industry} events in {location}" targeting

### 2.4 Performance (Core Web Vitals)

Google uses Core Web Vitals as a ranking signal:
- **LCP < 2.5s** — Lazy load images, optimize hero section
- **FID < 100ms** — Already good with React SPA
- **CLS < 0.1** — Set explicit image dimensions, avoid layout shifts
- Image optimization: WebP format, responsive sizes, lazy loading
- Code splitting: Dynamic imports for route-based splitting (already partially done)

### 2.5 Internal Linking

- Breadcrumb navigation on all public pages
- Related events links on event pages
- "Popular events" section on homepage
- Footer with links to key sections

---

## Layer 3: Off-Page & Authority

### 3.1 Google Search Console + Bing Webmaster Tools

- Verify domain ownership on both Google and Bing
- Submit sitemap.xml to both
- Monitor indexing status and crawl errors
- Track keyword rankings
- Bing is significant in some MENA markets and also powers DuckDuckGo

### 3.2 Social Sharing Optimization

- Open Graph tags ensure professional previews on LinkedIn, Facebook, Twitter
- Each shared event becomes a mini-advertisement with image, title, date
- WhatsApp/Telegram link previews via og:image and og:description

### 3.3 Rich Snippets

- Event schema enables Google to show event cards with dates, locations, prices
- Organization schema for brand knowledge panel
- BreadcrumbList for enhanced search result navigation

### 3.4 Local/Regional SEO

- Target "event management Tunisia", "conference platform Africa", "B2B networking MENA"
- Arabic language support helps rank in Arabic searches
- French language support helps rank in Francophone Africa searches

### 3.5 Natural Backlinks

- Every event organizer shares their event page = backlink
- Embed codes for event widgets on external sites
- Social media sharing drives link authority

---

## Keyword Strategy

| Priority | Keywords | Target Page | Difficulty |
|----------|----------|-------------|------------|
| 1 | "eventra" (brand) | Homepage | Easy |
| 2 | "event management Tunisia" | Homepage | Medium |
| 3 | "conference platform Africa" | Homepage | Medium |
| 4 | "event registration platform" | Homepage | Hard |
| 5 | "B2B event networking" | Homepage + features | Hard |
| 6 | "{event name} {city} {year}" | Event pages | Easy |
| 7 | "find events in Tunisia" | Browse events | Medium |
| 8 | "B2B matchmaking events" | Discovery | Medium |
| 9 | "event management software" | Homepage | Very Hard |
| 10 | "Eventbrite alternative" | Homepage | Hard |

---

## Implementation Order

### Week 1: Technical Foundation
- Install prerender service on VPS
- Configure Nginx bot detection + prerender proxy
- Add robots.txt and sitemap.xml
- Install react-helmet-async
- Add basic meta tags to all pages

### Week 2: On-Page SEO
- Implement JSON-LD structured data (Event, Organization, Breadcrumb)
- Add Open Graph and Twitter Card tags to all pages
- Wire event wizard SEO fields to actual meta tags
- Add canonical URLs

### Week 3: Performance
- Audit Core Web Vitals with Lighthouse
- Optimize images (lazy loading, WebP, sizing)
- Code splitting for key routes
- Font optimization

### Week 4: Authority & Monitoring
- Set up Google Search Console
- Submit sitemap
- Test rich snippets with Google Rich Results Test
- Monitor initial indexing
- Optimize based on Search Console data

---

## Success Metrics

| Metric | Current | Target (3 months) | Target (6 months) |
|--------|---------|-------------------|-------------------|
| Indexed pages | 0 | 50+ | 200+ |
| Organic traffic | 0 | 500/month | 2000/month |
| Average position (brand) | N/A | Top 3 | #1 |
| Average position (regional) | N/A | Top 20 | Top 5 |
| Core Web Vitals | Unknown | All green | All green |
| Rich snippets | 0 | Events showing | Events + org |

---

## Files to Create/Modify

**New files:**
- `public/robots.txt`
- `src/components/SEOHead.tsx` — Reusable React Helmet wrapper with hreflang, canonical, JSON-LD
- `src/utils/seo.ts` — SEO helper functions (generate meta, JSON-LD, slug generation)
- `scripts/generate-sitemap.js` — Cron script to generate sitemap.xml from Supabase
- `scripts/warm-prerender-cache.sh` — Cache warming script for prerender
- `src/pages/NotFound.tsx` — 404 page with noindex meta

**Modified files:**
- `package.json` — Add react-helmet-async
- `index.html` — Add fallback meta tags, structured data, dynamic lang attribute
- `src/App.tsx` — Wrap with HelmetProvider, add 404 catch-all route
- `src/pages/*.tsx` — Add SEOHead component to all public pages
- `src/components/events/DesignStudioLanding.tsx` — Event page SEO + JSON-LD
- Nginx config on VPS — Bot detection + prerender proxy
- Database: Add `url_slug` column to events table
