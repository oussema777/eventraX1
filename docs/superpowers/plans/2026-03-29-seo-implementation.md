# Eventra SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Eventra fully crawlable, indexable, and rank-competitive on Google by adding prerendering, dynamic meta tags, structured data, sitemap, and SEO infrastructure.

**Architecture:** Install `react-helmet-async` for per-page dynamic meta/OG/JSON-LD tags. Create a reusable `SEOHead` component used by all public pages. Add `robots.txt` and auto-generated `sitemap.xml`. VPS gets Prerender service (headless Chromium) proxied by Nginx for bot requests. Database gets SEO columns for events.

**Tech Stack:** react-helmet-async, Prerender (open-source Node.js), Nginx bot detection, Supabase (DB migration), JSON-LD structured data

**Spec:** `docs/superpowers/specs/2026-03-29-seo-strategy-design.md`

---

## File Structure

| File | Purpose |
|------|---------|
| `src/components/SEOHead.tsx` | **NEW** — Reusable React Helmet wrapper (title, description, OG, JSON-LD, hreflang, canonical) |
| `src/utils/seo.ts` | **NEW** — SEO helpers: generateEventJsonLd, generateBreadcrumbs, truncateDescription, slugify |
| `src/pages/NotFound.tsx` | **NEW** — 404 page with noindex meta |
| `public/robots.txt` | **NEW** — Crawler directives |
| `scripts/generate-sitemap.js` | **NEW** — Node.js script to generate sitemap.xml from Supabase |
| `scripts/warm-prerender-cache.sh` | **NEW** — Prerender cache warming script |
| `database/scripts/sql_add_seo_columns.sql` | **NEW** — SQL migration for SEO fields on events table |
| `index.html` | **MODIFY** — Add fallback meta tags, OG tags, description |
| `src/App.tsx` | **MODIFY** — Wrap with HelmetProvider, add 404 catch-all route |
| `src/components/events/DesignStudioLanding.tsx` | **MODIFY** — Add SEOHead with event data + JSON-LD Event schema |
| `src/pages/01_Landing_Page.tsx` | **MODIFY** — Add SEOHead with Organization JSON-LD |
| `src/pages/24_Browse_Events_Discovery.tsx` | **MODIFY** — Add SEOHead with dynamic title |
| `src/pages/34_Community_People_Discovery.tsx` | **MODIFY** — Add SEOHead |
| `src/pages/EventSectionPage.tsx` | **MODIFY** — Add SEOHead for agenda/speakers/sponsors pages |
| `src/pages/32_Event_Registration_Flow.tsx` | **MODIFY** — Add SEOHead |
| `src/pages/PublicProfilePage.tsx` | **MODIFY** — Add SEOHead |
| `src/pages/21_Business_Profile_Page.tsx` | **MODIFY** — Add SEOHead |
| `src/pages/33_Pricing.tsx` | **MODIFY** — Add SEOHead with noindex (page is behind ProtectedRoute) |
| `src/components/wizard/SEOSection.tsx` | **MODIFY** — Wire fields to database save |

---

## Task 1: Install react-helmet-async and wrap App with HelmetProvider

**Files:**
- Modify: `package.json`
- Modify: `src/App.tsx`
- Modify: `index.html`

- [ ] **Step 1: Install react-helmet-async**

```bash
npm install react-helmet-async
```

- [ ] **Step 2: Add HelmetProvider to App.tsx**

In `src/App.tsx`, add the import at the top:

```typescript
import { HelmetProvider } from 'react-helmet-async';
```

Wrap **inside** `<I18nProvider>` but **outside** `<AuthProvider>` (Helmet needs i18n context for lang, and must wrap Router):

```tsx
return (
  <I18nProvider>
    <HelmetProvider>
      <AuthProvider>
        {/* ... existing Router content ... */}
      </AuthProvider>
    </HelmetProvider>
  </I18nProvider>
);
```

- [ ] **Step 3: Add 404 catch-all route**

In `src/App.tsx`, add a direct import (consistent with all other page imports in App.tsx — none use lazy loading):

```typescript
import NotFound from './pages/NotFound';
```

Add as the last `<Route>` inside `<Routes>`:

```tsx
<Route path="*" element={<NotFound />} />
```

- [ ] **Step 4: Add fallback meta tags to index.html**

In `index.html`, add inside `<head>` after the existing `<title>` tag:

```html
<meta name="description" content="Eventra is the professional event management and B2B networking platform. Create events, manage registrations, and connect with industry peers." />
<meta name="keywords" content="event management, B2B networking, conference platform, event registration, professional events" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://eventra.cloud" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Eventra" />
<meta property="og:title" content="Eventra | Professional Event Management & B2B Networking" />
<meta property="og:description" content="Create events, manage registrations, and connect with industry peers on Eventra." />
<meta property="og:url" content="https://eventra.cloud" />
<meta property="og:image" content="https://eventra.cloud/favicon.png" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Eventra | Professional Event Management & B2B Networking" />
<meta name="twitter:description" content="Create events, manage registrations, and connect with industry peers on Eventra." />
<meta name="twitter:image" content="https://eventra.cloud/favicon.png" />
```

- [ ] **Step 5: Build and verify**

```bash
npx vite build
```

Check for "built in" success message. Verify `index.html` in build output has the meta tags.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/App.tsx index.html
git commit -m "feat(seo): install react-helmet-async, add HelmetProvider and fallback meta tags"
```

---

## Task 2: Create SEOHead component and SEO utilities

**Files:**
- Create: `src/components/SEOHead.tsx`
- Create: `src/utils/seo.ts`

- [ ] **Step 1: Create src/utils/seo.ts**

```typescript
/**
 * SEO utility functions for Eventra
 */

export const BASE_URL = 'https://eventra.cloud';

/**
 * Truncate a string to maxLen characters, ending at word boundary with ellipsis.
 */
export function truncateDescription(text: string, maxLen = 160): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .trim()
    .replace(/^-+|-+$/g, ''); // trim hyphens from edges
}

/**
 * Generate canonical URL for a path.
 */
export function canonicalUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Generate JSON-LD Organization schema for the homepage.
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eventra',
    url: BASE_URL,
    description: 'Professional Event Management & B2B Networking Platform',
    logo: `${BASE_URL}/favicon.png`,
    sameAs: [
      'https://linkedin.com/company/eventra',
      'https://twitter.com/eventra',
    ],
  };
}

/**
 * Generate JSON-LD Event schema for an event page.
 */
export function generateEventJsonLd(event: {
  id: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location_address?: string;
  event_format?: string;
  cover_image_url?: string;
  organizer_name?: string;
  ticket_price?: number;
  ticket_currency?: string;
}) {
  const attendanceMode = (() => {
    switch (event.event_format?.toLowerCase()) {
      case 'online': return 'https://schema.org/OnlineEventAttendanceMode';
      case 'hybrid': return 'https://schema.org/MixedEventAttendanceMode';
      default: return 'https://schema.org/OfflineEventAttendanceMode';
    }
  })();

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name || 'Untitled Event',
    description: truncateDescription(event.description || '', 300),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: attendanceMode,
  };

  if (event.start_date) jsonLd.startDate = event.start_date;
  if (event.end_date) jsonLd.endDate = event.end_date;
  if (event.cover_image_url) jsonLd.image = event.cover_image_url;

  if (event.location_address) {
    jsonLd.location = {
      '@type': 'Place',
      name: event.location_address,
      address: event.location_address,
    };
  }

  if (event.organizer_name) {
    jsonLd.organizer = {
      '@type': 'Organization',
      name: event.organizer_name,
    };
  }

  if (event.ticket_price !== undefined && event.ticket_currency) {
    jsonLd.offers = {
      '@type': 'Offer',
      url: `${BASE_URL}/event/${event.id}/register`,
      price: String(event.ticket_price),
      priceCurrency: event.ticket_currency,
      availability: 'https://schema.org/InStock',
    };
  }

  return jsonLd;
}

/**
 * Generate JSON-LD BreadcrumbList schema.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}
```

- [ ] **Step 2: Create src/components/SEOHead.tsx**

```tsx
import { Helmet } from 'react-helmet-async';
import { BASE_URL } from '../utils/seo';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  lang?: 'en' | 'fr' | 'ar';
  keywords?: string;
}

export default function SEOHead({
  title,
  description,
  ogImage = `${BASE_URL}/favicon.png`,
  canonicalUrl,
  jsonLd,
  noindex = false,
  lang,
  keywords,
}: SEOHeadProps) {
  const fullTitle = title.includes('Eventra') ? title : `${title} | Eventra`;
  const isRTL = lang === 'ar';

  // Support both single JSON-LD object and array of objects
  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  return (
    <Helmet>
      {/* Language */}
      {lang && <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} />}

      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang — no fragments, react-helmet-async requires direct children */}
      {canonicalUrl && <link rel="alternate" hrefLang="en" href={`${canonicalUrl}?lang=en`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="fr" href={`${canonicalUrl}?lang=fr`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="ar" href={`${canonicalUrl}?lang=ar`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Eventra" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLdArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SEOHead.tsx src/utils/seo.ts
git commit -m "feat(seo): add SEOHead component and SEO utility functions"
```

---

## Task 3: Create 404 page and robots.txt

**Files:**
- Create: `src/pages/NotFound.tsx`
- Create: `public/robots.txt`

- [ ] **Step 1: Create src/pages/NotFound.tsx**

```tsx
import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noindex
      />
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0B2641',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        color: '#FFFFFF',
        textAlign: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '72px', fontWeight: 800, marginBottom: '8px', color: '#0684F5' }}>404</h1>
          <p style={{ fontSize: '20px', color: '#94A3B8', marginBottom: '32px' }}>
            This page doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create public/robots.txt**

```
User-agent: *
Allow: /
Allow: /events
Allow: /event/
Allow: /community
Allow: /profile/
Allow: /browse-events
Allow: /b2b-marketplace
Allow: /communities
Allow: /pricing

Disallow: /dashboard
Disallow: /my-events
Disallow: /wizard
Disallow: /create/
Disallow: /my-networking
Disallow: /my-profile
Disallow: /settings
Disallow: /messages
Disallow: /notifications
Disallow: /admin
Disallow: /business-profile-wizard
Disallow: /business-management
Disallow: /api/

Sitemap: https://eventra.cloud/sitemap.xml
```

- [ ] **Step 3: Build and verify robots.txt is in build output**

```bash
npx vite build
ls build/robots.txt
```

Vite copies `public/` contents to `build/` automatically.

- [ ] **Step 4: Commit**

```bash
git add src/pages/NotFound.tsx public/robots.txt
git commit -m "feat(seo): add 404 page with noindex and robots.txt"
```

---

## Task 4: Add SEOHead to Homepage (Landing Page)

**Files:**
- Modify: `src/pages/01_Landing_Page.tsx`

- [ ] **Step 1: Read the file to understand current structure**

Read `src/pages/01_Landing_Page.tsx` — identify the component name and where to add the SEOHead.

- [ ] **Step 2: Add SEOHead import and component**

At the top of the file, add:

```typescript
import SEOHead from '../components/SEOHead';
import { generateOrganizationJsonLd, generateBreadcrumbJsonLd, canonicalUrl } from '../utils/seo';
```

Inside the component's return, add as the first element:

```tsx
<SEOHead
  title="Eventra — Professional Event Management & B2B Networking Platform"
  description="Create and manage professional events, B2B networking meetings, and conference registrations. The all-in-one platform for event organizers in Tunisia, Africa, and beyond."
  canonicalUrl={canonicalUrl('/')}
  keywords="event management platform, B2B networking events, conference registration, event management Tunisia, professional events"
  jsonLd={[
    generateOrganizationJsonLd(),
    generateBreadcrumbJsonLd([{ name: 'Home', url: canonicalUrl('/') }]),
  ]}
/>
```

- [ ] **Step 3: Build and verify**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/01_Landing_Page.tsx
git commit -m "feat(seo): add SEOHead to homepage with Organization schema"
```

---

## Task 5: Add SEOHead to Event Landing Page (DesignStudioLanding)

**Files:**
- Modify: `src/components/events/DesignStudioLanding.tsx`

This is the most important page for SEO — each event gets unique meta tags and JSON-LD Event schema.

**Note:** The route `/event/:eventId/landing` renders `src/pages/25_Single_Event_Landing_Page.tsx`, which in turn renders `DesignStudioLanding.tsx` as a child. The event data is fetched inside `DesignStudioLanding.tsx`, so the SEOHead belongs there.

- [ ] **Step 1: Read both files to understand data flow**

Read `src/pages/25_Single_Event_Landing_Page.tsx` first to understand the parent, then read `src/components/events/DesignStudioLanding.tsx` — the event data is stored in a state variable (likely `event`). Identify the variable names for: name, description, start_date, end_date, location_address, event_format, cover image URL.

- [ ] **Step 2: Add SEOHead with event data**

At the top:

```typescript
import SEOHead from '../SEOHead';
import { generateEventJsonLd, generateBreadcrumbJsonLd, truncateDescription, canonicalUrl } from '../../utils/seo';
```

Inside the component, after event data is loaded, add the SEOHead:

```tsx
{event && (
  <SEOHead
    title={`${event.name || 'Event'} | ${event.location_address || 'Eventra'}`}
    description={truncateDescription(event.description || event.tagline || `Join ${event.name} on Eventra`, 160)}
    ogImage={event.branding_settings?.design_studio?.coverUrl || `https://eventra.cloud/favicon.png`}
    canonicalUrl={canonicalUrl(`/event/${event.id}/landing`)}
    keywords={`${event.name}, ${event.event_type || 'event'}, ${event.location_address || ''}`}
    jsonLd={[
      generateEventJsonLd({
        id: event.id,
        name: event.name,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        location_address: event.location_address,
        event_format: event.event_format,
        cover_image_url: event.branding_settings?.design_studio?.coverUrl,
      }),
      generateBreadcrumbJsonLd([
        { name: 'Home', url: canonicalUrl('/') },
        { name: 'Events', url: canonicalUrl('/browse-events') },
        { name: event.name || 'Event' },
      ]),
    ]}
  />
)}
```

Place this right at the beginning of the returned JSX, before any other content.

- [ ] **Step 3: Build and verify**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/events/DesignStudioLanding.tsx
git commit -m "feat(seo): add Event schema and meta tags to event landing pages"
```

---

## Task 6: Add SEOHead to Browse Events, Community, Registration, Pricing pages

**Files:**
- Modify: `src/pages/24_Browse_Events_Discovery.tsx`
- Modify: `src/pages/34_Community_People_Discovery.tsx`
- Modify: `src/pages/32_Event_Registration_Flow.tsx`
- Modify: `src/pages/33_Pricing.tsx`
- Modify: `src/pages/EventSectionPage.tsx`

- [ ] **Step 1: Read each file to understand its structure**

Read all 5 files. Identify the component return statement in each.

- [ ] **Step 2: Add SEOHead to Browse Events page**

```typescript
import SEOHead from '../components/SEOHead';
import { canonicalUrl } from '../utils/seo';
```

```tsx
<SEOHead
  title="Explore Events — Conferences, Workshops & B2B Networking"
  description="Discover and register for professional events, trade missions, conferences, and B2B networking events on Eventra."
  canonicalUrl={canonicalUrl('/browse-events')}
  keywords="browse events, find events, conferences, workshops, B2B events, trade missions"
/>
```

- [ ] **Step 3: Add SEOHead to Community Discovery page**

```typescript
import SEOHead from '../components/SEOHead';
import { canonicalUrl } from '../utils/seo';
```

```tsx
<SEOHead
  title="Find Professionals — B2B Networking & Community"
  description="Connect with industry professionals, schedule B2B meetings, and grow your network on Eventra's community platform."
  canonicalUrl={canonicalUrl('/communities')}
  keywords="B2B networking, professional community, industry professionals, business networking"
/>
```

- [ ] **Step 4: Add SEOHead to Event Registration page**

This page has event data available. Use the event name in the title:

```typescript
import SEOHead from '../components/SEOHead';
import { truncateDescription, canonicalUrl } from '../utils/seo';
```

```tsx
<SEOHead
  title={`Register for ${eventName || 'Event'}`}
  description={truncateDescription(`Register for ${eventName}. Secure your spot and select your sessions.`, 160)}
  canonicalUrl={canonicalUrl(`/event/${eventId}/register`)}
/>
```

Use whatever variable holds the event name in that component.

- [ ] **Step 5: Add SEOHead to Pricing page (noindex — it's behind ProtectedRoute)**

```typescript
import SEOHead from '../components/SEOHead';
```

```tsx
<SEOHead
  title="Pricing — Eventra"
  description=""
  noindex
/>
```

- [ ] **Step 6: Add SEOHead to EventSectionPage (agenda, speakers, sponsors)**

This page renders different sections based on the URL. Use the section name dynamically:

```typescript
import SEOHead from '../components/SEOHead';
import { canonicalUrl } from '../utils/seo';
```

```tsx
<SEOHead
  title={`${sectionTitle} — ${eventName || 'Event'} | Eventra`}
  description={`View the ${sectionTitle?.toLowerCase()} for ${eventName} on Eventra.`}
  canonicalUrl={canonicalUrl(`/event/${eventId}/${section}`)}
/>
```

Use the existing section/event variables in the component.

- [ ] **Step 7: Add noindex to protected pages**

For key protected pages (dashboard, wizard steps, my-profile), add SEOHead with `noindex`:

No need to add to every protected page — React Helmet's fallback in index.html already says `index, follow`, and the routes are blocked by `robots.txt`. Add noindex only to the most critical ones:

In `src/pages/02_My_Events_Dashboard.tsx`:
```tsx
<SEOHead title="My Events" description="" noindex />
```

- [ ] **Step 8: Build and verify**

```bash
npx vite build
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/24_Browse_Events_Discovery.tsx src/pages/34_Community_People_Discovery.tsx src/pages/32_Event_Registration_Flow.tsx src/pages/33_Pricing.tsx src/pages/EventSectionPage.tsx src/pages/02_My_Events_Dashboard.tsx
git commit -m "feat(seo): add SEOHead to all public pages with meta tags and keywords"
```

---

## Task 7: Add SEOHead to Profile and Business pages

**Files:**
- Modify: `src/pages/PublicProfilePage.tsx` (or the actual file name for profile routes)
- Modify: `src/pages/21_Business_Profile_Page.tsx`

- [ ] **Step 1: Read the files**

Read both files. Identify user/business data variables (name, title, company, description).

- [ ] **Step 2: Add SEOHead to Public Profile page**

```typescript
import SEOHead from '../components/SEOHead';
import { canonicalUrl } from '../utils/seo';
```

```tsx
<SEOHead
  title={`${userName || 'Professional'} — ${userTitle || 'Profile'}`}
  description={`View ${userName}'s professional profile on Eventra. Connect and schedule B2B meetings.`}
  canonicalUrl={canonicalUrl(`/profile/${userId}`)}
  ogImage={avatarUrl || undefined}
/>
```

- [ ] **Step 3: Add SEOHead to Business Profile page**

```tsx
<SEOHead
  title={`${businessName || 'Business'} — Company Profile`}
  description={truncateDescription(businessDescription || `${businessName} on Eventra's B2B marketplace.`, 160)}
  canonicalUrl={canonicalUrl(`/business/${businessId}`)}
  ogImage={businessLogoUrl || undefined}
/>
```

- [ ] **Step 4: Build and verify**

```bash
npx vite build
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/PublicProfilePage.tsx src/pages/21_Business_Profile_Page.tsx
git commit -m "feat(seo): add SEOHead to profile and business pages"
```

---

## Task 8: Create sitemap generator script

**Files:**
- Create: `scripts/generate-sitemap.js`
- Create: `database/scripts/sql_add_seo_columns.sql`

- [ ] **Step 1: Create the SQL migration for SEO columns**

Create `database/scripts/sql_add_seo_columns.sql`:

```sql
-- Add SEO fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_slug TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Create unique index on seo_slug for URL routing
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_seo_slug ON events(seo_slug) WHERE seo_slug IS NOT NULL;
```

Run this SQL in Supabase SQL Editor.

- [ ] **Step 2: Create scripts/generate-sitemap.js**

```javascript
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BASE_URL = 'https://eventra.cloud';

async function generateSitemap() {
  // Fetch all published events
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, start_date, seo_slug')
    .eq('status', 'published')
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/browse-events', priority: '0.8', changefreq: 'daily' },
    { url: '/communities', priority: '0.7', changefreq: 'weekly' },
    { url: '/b2b-marketplace', priority: '0.7', changefreq: 'weekly' },
  ];

  // Event pages
  const eventPages = (events || []).map(event => ({
    url: `/event/${event.id}/landing`,
    priority: '0.9',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...eventPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outPath = resolve(process.cwd(), 'build', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap generated: ${outPath} (${allPages.length} URLs)`);
}

generateSitemap();
```

- [ ] **Step 3: Add npm script to package.json**

Add to `scripts` in `package.json`:

```json
"generate-sitemap": "node --env-file=.env scripts/generate-sitemap.js"
```

**Note:** `--env-file` requires Node.js 20.6+. Verify VPS Node version with `node -v`. If older, use `dotenv` package or source the env file manually:
```json
"generate-sitemap": "node -e 'require(\"dotenv\").config()' && node scripts/generate-sitemap.js"
```

- [ ] **Step 4: Test locally**

```bash
npx vite build && npm run generate-sitemap
cat build/sitemap.xml
```

Verify the XML is valid and contains your static pages + published events.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sitemap.js database/scripts/sql_add_seo_columns.sql package.json
git commit -m "feat(seo): add sitemap generator and database SEO columns migration"
```

---

## Task 9: VPS Prerender Setup (Manual — Instructions for User)

This task is done **on the VPS**, not in the codebase. Create an instruction file.

**Files:**
- Create: `docs/superpowers/vps-prerender-setup.md`

- [ ] **Step 1: Create the setup guide**

Create `docs/superpowers/vps-prerender-setup.md`:

```markdown
# VPS Prerender Setup Guide

## Prerequisites
- Node.js 18+ on VPS
- PM2 installed (`npm install -g pm2`)
- At least 2GB RAM (4GB recommended)

## Step 1: Install Prerender

```bash
cd /var/www
git clone https://github.com/prerender/prerender.git
cd prerender
npm install
```

## Step 2: Start with PM2

```bash
PORT=3000 pm2 start server.js --name prerender
pm2 save
```

## Step 3: Update Nginx Config

Edit `/etc/nginx/sites-available/eventra.cloud.conf`.

Replace the `location /` block with:

```nginx
# Bot detection for prerender
set $prerender 0;
if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|linkedinbot|slackbot|whatsapp") {
    set $prerender 1;
}
if ($uri ~* "\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map)$") {
    set $prerender 0;
}
if ($uri ~* "^/api/") {
    set $prerender 0;
}

location / {
    if ($prerender = 1) {
        proxy_pass http://localhost:3000/$scheme://$host$request_uri;
    }
    try_files $uri $uri/ /index.html;
}
```

Then restart Nginx:

```bash
sudo nginx -t && sudo systemctl restart nginx
```

## Step 4: Test

```bash
# Test as Googlebot
curl -A "Googlebot" https://eventra.cloud | head -50
# Should see fully rendered HTML with content, not just <div id="root"></div>

# Test as normal user
curl https://eventra.cloud | head -20
# Should see the normal SPA shell
```

## Step 5: Sitemap Cron

Add to crontab to regenerate sitemap daily:

```bash
crontab -e
# Add:
0 3 * * * cd /var/www/eventraX1 && node --env-file=.env scripts/generate-sitemap.js
```

## Step 6: Cache Warming (Optional)

Create `/var/www/eventraX1/scripts/warm-prerender-cache.sh`:

```bash
#!/bin/bash
URLS=(
  "https://eventra.cloud/"
  "https://eventra.cloud/browse-events"
  "https://eventra.cloud/communities"
  "https://eventra.cloud/pricing"
)
for url in "${URLS[@]}"; do
  curl -s -A "Googlebot" "$url" > /dev/null
  echo "Warmed: $url"
done
```

Run after each deployment:
```bash
bash scripts/warm-prerender-cache.sh
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/vps-prerender-setup.md
git commit -m "docs: add VPS prerender setup guide"
```

---

## Task 10: Wire SEO wizard fields to database

**Files:**
- Modify: `src/components/wizard/SEOSection.tsx`
- Modify: `src/hooks/useEventWizard.ts` (the EventDraft interface and save function)

- [ ] **Step 1: Read the wizard hook to understand save flow**

Read `src/hooks/useEventWizard.ts` — find the `EventDraft` interface and the `saveDraft()` function.

- [ ] **Step 2: Add SEO fields to EventDraft interface**

In `src/hooks/useEventWizard.ts`, add to the EventDraft interface:

```typescript
seo_title?: string;
seo_description?: string;
seo_slug?: string;
seo_keywords?: string[];
```

- [ ] **Step 3: Ensure SEO fields are included in save**

In the `saveDraft()` function, make sure these fields are included in the object sent to Supabase upsert. They should be automatically if the draft object includes them.

- [ ] **Step 4: Rewrite SEOSection to accept props (currently has NO props)**

**Important:** `SEOSection.tsx` currently uses standalone `useState` hooks with no props — it's entirely local state that is never saved. This step requires:

1. Change the component signature to accept `draft` and `updateDraft` props:

```tsx
interface SEOSectionProps {
  draft: EventDraft;
  updateDraft: (updates: Partial<EventDraft>) => void;
}

export default function SEOSection({ draft, updateDraft }: SEOSectionProps) {
```

2. Replace all `useState` calls with controlled values from `draft`:
   - `metaTitle` → `draft.seo_title || ''`
   - `metaDescription` → `draft.seo_description || ''`
   - `urlSlug` → `draft.seo_slug || ''`
   - `keywords` → `draft.seo_keywords || []`

3. Replace all `setMetaTitle(val)` etc. with `updateDraft({ seo_title: val })`.

4. Update the parent page (`06_Wizard_Step4_Launch.tsx` or wherever SEOSection is rendered) to pass `draft` and `updateDraft` props down.

- [ ] **Step 5: Build and verify**

```bash
npx vite build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/SEOSection.tsx src/hooks/useEventWizard.ts
git commit -m "feat(seo): wire SEO wizard fields to database save"
```

---

## Task 11: Final build, push, and deploy

- [ ] **Step 1: Full build verification**

```bash
npx vite build
```

Check for "built in" success message.

- [ ] **Step 2: Push all commits**

```bash
git push origin main
```

- [ ] **Step 3: Deploy on VPS**

On VPS:

```bash
cd /var/www/eventraX1
git stash
git pull
npm install
npx vite build
npm run generate-sitemap
```

- [ ] **Step 4: Set up prerender on VPS**

Follow the guide in `docs/superpowers/vps-prerender-setup.md`.

- [ ] **Step 5: Submit to Google Search Console**

1. Go to https://search.google.com/search-console
2. Add property: `eventra.cloud`
3. Verify via DNS TXT record or HTML file
4. Submit sitemap: `https://eventra.cloud/sitemap.xml`

- [ ] **Step 6: Verify everything works**

```bash
# On VPS — test prerender
curl -A "Googlebot" https://eventra.cloud | grep "<title>"
# Should show: Eventra — Professional Event Management...

# Test robots.txt
curl https://eventra.cloud/robots.txt
# Should show the robots directives

# Test sitemap
curl https://eventra.cloud/sitemap.xml
# Should show valid XML with URLs

# Test OG tags (use Facebook's debugger)
# https://developers.facebook.com/tools/debug/?q=https://eventra.cloud
```

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix(seo): post-deployment adjustments"
git push origin main
```

---

## Summary of Deliverables

| What | Status |
|------|--------|
| react-helmet-async installed | Task 1 |
| SEOHead reusable component | Task 2 |
| SEO utility functions (JSON-LD, slugify, etc.) | Task 2 |
| 404 page with noindex | Task 3 |
| robots.txt | Task 3 |
| Homepage — Organization schema + meta tags | Task 4 |
| Event landing — Event schema + dynamic meta tags | Task 5 |
| All public pages — meta tags | Tasks 6-7 |
| Sitemap generator script | Task 8 |
| Database SEO columns migration | Task 8 |
| VPS prerender setup guide | Task 9 |
| Wizard SEO fields wired to database | Task 10 |
| Deployment + Google Search Console | Task 11 |

---

## Deferred to Future Phase

These items from the spec are intentionally deferred:

- **Slug-based routes** (`/events/:slug`) — requires new route + Nginx 301 redirects. Implement after SEO columns are populated.
- **Core Web Vitals optimization** — Lighthouse audit, image optimization, code splitting. Separate performance sprint.
- **Visible breadcrumb UI component** — JSON-LD breadcrumbs are included, but no visible breadcrumb navigation bar on pages.
- **Prerender cache invalidation** — Automatic cache busting when event data changes. 24h TTL is sufficient for now.
- **Arabic slug transliteration** — The `slugify()` function strips non-ASCII. For Arabic event names, falls back to event ID. A transliteration library can be added later.
