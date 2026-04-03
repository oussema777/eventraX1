# Eventra Performance & Scalability Optimization — Design Spec

**Date:** April 2, 2026
**Status:** COMPLETED
**Approach:** Incremental phases — fix one layer at a time, verify after each

---

## Current State (Baseline)

| Metric | Current Value | Target |
|--------|--------------|--------|
| JS Bundle | 3.6MB (single chunk) | ~400KB initial |
| Code-split routes | 0 / 42 | 42 / 42 |
| DB queries per navigation | 5-13 (uncached) | 0-1 (cached) |
| select('*') usage | 85+ instances | 0 |
| N+1 query patterns | 3 critical | 0 |
| React.memo on list items | 0 | All list cards |
| AuthContext memoized | No | Yes |
| Translation file | 18,683 lines (all locales) | Per-locale lazy load |
| Image lazy loading | None | All below-fold images |
| DB composite indexes | Unknown | 8 added |
| Estimated concurrent user limit | ~5,000 | ~50,000+ |

---

## Phase 1: Critical Database Fixes
> **Goal:** Prevent crashes and eliminate worst query patterns
> **Status:** [x] COMPLETED (April 2, 2026)

### 1.1 — Fix unfiltered table scan
- **File:** `src/components/business/BusinessProfilePage.tsx:304`
- **Problem:** `supabase.from('business_profiles').select('*')` runs unfiltered if neither `urlBusinessId` nor `user` exists
- **Fix:** Replaced `select('*')` with 13 specific columns. Early return guard already existed.
- **Status:** [x] Done

### 1.2 — Fix sponsor reorder N+1
- **File:** `src/hooks/useSponsors.ts:221-235`
- **Problem:** Creates N individual `.update()` calls + refetches all sponsors after
- **Fix:** Added optimistic local state update (instant UI). Removed `loadSponsors()` refetch. Added rollback on failure. Also replaced `select('*')` with 12 specific columns in loadSponsors.
- **Status:** [x] Done

### 1.3 — Fix session conflict check
- **File:** `src/hooks/useSessions.ts:92-112, 147-173`
- **Problem:** Fetches ALL sessions for event, filters in JavaScript. Duplicated in create and update
- **Fix:** Extracted shared `checkVenueConflict()` helper with DB-level `.lt()` / `.gt()` date range filtering. Eliminated duplicate code. Also replaced `select('*')` with 16 specific columns in loadSessions.
- **Status:** [x] Done

### 1.4 — Fix My Events Dashboard no pagination
- **File:** `src/pages/02_My_Events_Dashboard.tsx:30-39`
- **Problem:** `.select('*')` fetches ALL user events without `.limit()`
- **Fix:** Replaced `select('*')` with 12 specific columns. Added `.limit(100)`.
- **Status:** [x] Done

**Phase 1 Verification:** Build passed (`built in 15.36s`, no errors)

---

## Phase 2: Code Splitting
> **Goal:** 3.6MB → ~400KB initial load
> **Status:** [x] COMPLETED (April 2, 2026)

### 2.1 — Convert 42 static imports to React.lazy()
- **File:** `src/App.tsx`
- **Change:** All 42 page imports converted to `lazy(() => import(...))`. Added `<Suspense fallback={<PageLoader />}>` with branded spinner. Organized imports into tiers: Public, Dashboard, Wizard, Business, Admin.
- **Status:** [x] Done

### 2.2 — Add manualChunks in vite.config.ts
- **File:** `vite.config.ts`
- **Chunks created:** vendor (180KB), ui (68KB), charts (415KB), supabase (172KB)
- **Status:** [x] Done

### 2.3 — Lazy-load design studio modals
- **File:** `src/pages/04_Wizard_Step2_DesignStudio.tsx`
- **Change:** 11 modal components converted to `React.lazy()` + wrapped in `<Suspense fallback={null}>`
- **Status:** [x] Done

**Phase 2 Results:**
- Main index.js: **3,698KB → 585KB** (84% reduction in initial bundle!)
- Landing page chunk: **16.5KB** (loads independently)
- Dashboard chunk: **18.2KB** (only loaded when authenticated)
- Vendor: 180KB, UI: 68KB, Charts: 415KB (lazy), Supabase: 172KB
- 40+ separate page chunks created
- Build time: 13.42s

---

## Phase 3: React Query Integration
> **Goal:** 80% fewer database queries through caching
> **Status:** [x] COMPLETED (April 2, 2026)

### 3.1 — Add QueryClientProvider
- **File:** `src/App.tsx`
- **Config:** `staleTime: 5 * 60 * 1000` (5 min), `gcTime: 30 * 60 * 1000` (30 min), `retry: 1`, `refetchOnWindowFocus: false`
- **Status:** [x] Done

### 3.2 — Convert hooks to useQuery/useMutation
Each hook: replaced `useState` + `useEffect` + manual fetch → `useQuery()`. Mutations use `queryClient.invalidateQueries()` or `setQueryData()` for optimistic updates.

| # | Hook | Queries | Priority | Status |
|---|------|---------|----------|--------|
| 1 | `useEventStats.ts` | 13 queries | HIGH | [x] Done |
| 2 | `useSpeakers.ts` | 1 fetch + 3 mutations | HIGH | [x] Done |
| 3 | `useSessions.ts` | 1 fetch + 3 mutations | HIGH | [x] Done |
| 4 | `useTickets.ts` | 1 fetch + 3 mutations | HIGH | [x] Done |
| 5 | `useSponsors.ts` | 2 fetches + 4 mutations | HIGH | [x] Done |
| 6 | `useAttendees.ts` | 2 fetches + 3 mutations | MEDIUM | [x] Done |
| 7 | `useExhibitors.ts` | 1 fetch + 3 mutations | MEDIUM | [x] Done |
| 8 | `useEventForms.ts` | 1 fetch + 3 mutations | MEDIUM | [x] Done |
| 9 | `useBusinessProfile.ts` | 1 fetch + 1 mutation | MEDIUM | [x] Done |
| 10 | `useBusinessOfferings.ts` | 1 fetch + 3 mutations | MEDIUM | [x] Done |
| 11 | `useProfile.ts` | 1 fetch + 1 mutation | MEDIUM | [x] Done |
| 12 | `useNotifications.ts` | 1 fetch + 2 mutations | LOW | [x] Done |
| 13 | `useCommunitySectors.ts` | 1 fetch | LOW | [x] Done |
| 14 | `usePlan.ts` | No DB queries | LOW | [x] Skipped (reads AuthContext only) |
| 15 | `useMessageThread.ts` | Mutation only | LOW | [x] Skipped (no fetch query) |
| 16 | `useEventWizard.ts` | Form state manager | LOW | [x] Skipped (complex save logic, not a fit for useQuery) |
| 17 | `useAttendeeCategories.ts` | 1 fetch + 2 mutations | LOW | [x] Done |

### 3.3 — Replace select('*') with specific columns
- Done during each hook conversion: useExhibitors, useEventForms, useAttendeeCategories, useNotifications all had `select('*')` replaced with specific columns
- **Status:** [x] Done

**Phase 3 Results:**
- 14 hooks converted to React Query (3 skipped — no DB queries or not suitable)
- All data now cached with 5-min staleTime, eliminating redundant fetches on navigation
- Notifications polling replaced with `refetchInterval: 10000` (cleaner than manual setInterval)
- Optimistic updates for: sponsor reorder, attendee settings, notification read status, packages
- `select('*')` eliminated from useExhibitors, useEventForms, useAttendeeCategories, useNotifications
- Build: 26.20s, no errors

---

## Phase 4: React Rendering Optimization
> **Goal:** Eliminate unnecessary re-renders
> **Status:** [x] COMPLETED (April 2, 2026)

### 4.1 — Memoize AuthContext provider value
- **File:** `src/contexts/AuthContext.tsx`
- **Fix:** Wrapped provider value in `useMemo()`, signOut/refreshProfile in `useCallback()`
- **Status:** [x] Done

### 4.2 — Add React.memo() to list-item components
- EventCard wrapped in `memo()` — renders inside `.map()` in EventsGrid
- Other card components (speakers, sessions, etc.) are inline in their respective pages, not separate components rendered in loops
- **Status:** [x] Done

### 4.3 — Add useCallback to event handlers
- `src/components/dashboard/EventsGrid.tsx` — handleCreateEvent, handleDeleteEvent wrapped in `useCallback()`
- **Status:** [x] Done

### 4.4 — Memoize expensive computed values
- `DesignStudioLanding.tsx` — cached `Intl.NumberFormat` instances in module-level `Map` (avoids re-creating formatters on every render)
- `BrowseEventsDiscovery.tsx:278` — Already inside `useMemo()`, no change needed
- **Status:** [x] Done

**Phase 4 Results:**
- AuthContext no longer triggers re-renders when internal state hasn't changed
- EventCard skips re-render when props are unchanged (via React.memo)
- EventsGrid handlers are stable references (via useCallback)
- Price formatting reuses cached Intl.NumberFormat instances
- Build: 24.08s, no errors

---

## Phase 5: Database Indexes
> **Goal:** 5-10x faster filtered queries
> **Status:** [x] COMPLETED (April 2, 2026) — Script created, needs to be run in Supabase SQL Editor

### 5.1 — Create composite indexes via Supabase SQL editor
```sql
CREATE INDEX IF NOT EXISTS idx_events_owner_status ON events(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_attendees_event_profile ON event_attendees(event_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_event_location ON event_sessions(event_id, location, status);
CREATE INDEX IF NOT EXISTS idx_sponsors_event_sort ON event_sponsors(event_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_event_date ON event_checkins(event_id, created_at);
CREATE INDEX IF NOT EXISTS idx_business_owner ON business_profiles(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_events_public ON events(is_public, status, moderation_status);
```
- **Status:** [x] Script saved to `database/scripts/sql_add_composite_indexes.sql`

### 5.2 — Save SQL scripts to database/scripts/
- **Status:** [x] Done

**Phase 5 Note:** Script is ready. Run it in Supabase SQL Editor to apply. Use `EXPLAIN ANALYZE` to verify index usage.

---

## Phase 6: Translation Splitting
> **Goal:** Load only the active language (~66% bundle reduction for i18n)
> **Status:** [x] COMPLETED (April 2, 2026)

### 6.1 — Split translations.ts into per-locale files
- `src/i18n/locales/en.ts` (6,730 lines — eagerly loaded as default/fallback)
- `src/i18n/locales/fr.ts` (6,476 lines — lazy loaded via dynamic import)
- `src/i18n/locales/ar.ts` (5,474 lines — lazy loaded via dynamic import)
- `src/i18n/translations.ts` — reduced to thin shim re-exporting EN only
- **Status:** [x] Done

### 6.2 — Update I18nContext.tsx for dynamic imports
- On locale change: `loadLocaleData()` uses `await import('./locales/fr')` or `./locales/ar`
- Locale data cached in module-level `Map` so switching back is instant
- Uses `useRef` for localeData to avoid stale closures in `t()` callback
- EN always available synchronously (no loading flash)
- **Status:** [x] Done

**Phase 6 Results:**
- FR chunk: `fr-*.js` (167KB) — only loaded when user switches to French
- AR chunk: `ar-*.js` (185KB) — only loaded when user switches to Arabic
- EN embedded in main bundle (always available as fallback)
- ~350KB removed from initial bundle for EN-only users
- Build: 23.25s, no errors

---

## Phase 7: Image & Asset Optimization
> **Goal:** Faster page paints, less bandwidth
> **Status:** [x] COMPLETED (April 2, 2026)

### 7.1 — Add lazy loading to all images
- `<img loading="lazy">` added to 9 images across 8 block components
- **Status:** [x] COMPLETED

### 7.2 — Client-side image compression before upload
- **File:** `src/utils/storage.ts`
- Canvas-based resize to max 1200px width, quality 0.8 JPEG
- SVGs and files under 100KB skipped
- **Status:** [x] COMPLETED

### 7.3 — Increase cache-control for uploads
- Changed `cacheControl: '3600'` → `cacheControl: '2592000'` (30 days)
- Cache-buster query param appended to public URLs
- **Status:** [x] COMPLETED

**Phase 7 Verification:** Upload test images, confirm compression. Check network tab for cache headers.

---

## Progress Log

| Date | Phase | What Was Done | Build OK? |
|------|-------|---------------|-----------|
| 2026-04-02 | — | Spec created | — |
| 2026-04-02 | Phase 1 | Fixed: BusinessProfile select('*'), sponsor N+1 reorder, session conflict check, dashboard pagination. Replaced select('*') in 4 hooks with specific columns. | Yes (15.36s) |
| 2026-04-02 | Phase 2 | Code splitting: 42 lazy routes, 11 lazy modals, 4 vendor chunks. Initial bundle 3,698KB → 585KB (84% reduction). | Yes (13.42s) |
| 2026-04-02 | Phase 3 | React Query: 14 hooks converted, 3 skipped. QueryClientProvider added. select('*') eliminated from 4 more hooks. Notifications polling → refetchInterval. Optimistic updates for sponsors, settings, notifications. | Yes (26.20s) |
| 2026-04-02 | Phase 4 | React memoization: AuthContext useMemo, EventCard React.memo, EventsGrid useCallback, Intl.NumberFormat cache. | Yes (24.08s) |
| 2026-04-02 | Phase 5 | Database indexes: SQL script with 8 composite indexes saved to database/scripts/. Needs manual run in Supabase SQL Editor. | N/A (SQL only) |
| 2026-04-02 | Phase 6 | Translation splitting: 18,683-line file → 3 separate locale files. FR/AR lazy-loaded via dynamic import(). ~350KB saved for EN users. | Yes (23.25s) |
| 2026-04-02 | Phase 7 | Image optimization: compressImage() before upload (canvas 1200px/0.8 JPEG), cacheControl 30 days, loading="lazy" on 9 images across 8 components. | Yes (17.18s) |

---

## Files Modified Tracker

Track every file touched per phase to help with debugging if something breaks.

### Phase 1 Files
- [x] `src/components/business/BusinessProfilePage.tsx` — select('*') → 13 specific columns
- [x] `src/hooks/useSponsors.ts` — optimistic reorder + select('*') → 12 columns
- [x] `src/hooks/useSessions.ts` — shared conflict helper + DB filtering + select('*') → 16 columns
- [x] `src/pages/02_My_Events_Dashboard.tsx` — select('*') → 12 columns + .limit(100)

### Phase 2 Files
- [x] `src/App.tsx` — 42 lazy imports + Suspense + PageLoader component
- [x] `vite.config.ts` — manualChunks for vendor/ui/charts/supabase
- [x] `src/pages/04_Wizard_Step2_DesignStudio.tsx` — 11 lazy modal imports + Suspense

### Phase 3 Files
- [x] `src/App.tsx` — added QueryClientProvider with configured QueryClient
- [x] `src/hooks/useSpeakers.ts` — useQuery + invalidateQueries
- [x] `src/hooks/useTickets.ts` — useQuery + invalidateQueries
- [x] `src/hooks/useSessions.ts` — useQuery + invalidateQueries (kept checkVenueConflict helper)
- [x] `src/hooks/useSponsors.ts` — useQuery x2 (sponsors + packages) + optimistic reorder via setQueryData
- [x] `src/hooks/useEventStats.ts` — useQuery (13 queries batched in single queryFn)
- [x] `src/hooks/useAttendees.ts` — useQuery x2 (categories + settings) + optimistic settings update
- [x] `src/hooks/useExhibitors.ts` — useQuery + select('*') → specific columns
- [x] `src/hooks/useEventForms.ts` — useQuery + select('*') → specific columns
- [x] `src/hooks/useBusinessProfile.ts` — useQuery (kept localStorage fallback)
- [x] `src/hooks/useBusinessOfferings.ts` — useQuery (kept localStorage fallback)
- [x] `src/hooks/useProfile.ts` — useQuery (kept retry logic for missing columns)
- [x] `src/hooks/useNotifications.ts` — useQuery with refetchInterval:10s + select('*') → specific columns
- [x] `src/hooks/useCommunitySectors.ts` — useQuery with 30min staleTime
- [x] `src/hooks/useAttendeeCategories.ts` — useQuery + select('*') → specific columns

### Phase 4 Files
- [x] `src/contexts/AuthContext.tsx` — useMemo on provider value, useCallback on signOut/refreshProfile
- [x] `src/components/dashboard/EventCard.tsx` — wrapped in React.memo()
- [x] `src/components/dashboard/EventsGrid.tsx` — useCallback on handleCreateEvent, handleDeleteEvent
- [x] `src/components/events/DesignStudioLanding.tsx` — cached Intl.NumberFormat in module-level Map

### Phase 5 Files
- [x] `database/scripts/sql_add_composite_indexes.sql` (new — 8 indexes)

### Phase 6 Files
- [x] `src/i18n/translations.ts` — reduced to thin shim (re-exports EN only)
- [x] `src/i18n/I18nContext.tsx` — rewritten for dynamic locale imports with caching
- [x] `src/i18n/locales/en.ts` (new — 6,730 lines, eagerly loaded)
- [x] `src/i18n/locales/fr.ts` (new — 6,476 lines, lazy loaded)
- [x] `src/i18n/locales/ar.ts` (new — 5,474 lines, lazy loaded)

### Phase 7 Files
- [x] `src/utils/storage.ts` — compressImage() + cacheControl 30 days + cache-buster
- [x] `src/components/design-studio/blocks/SpeakersBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/AgendaBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/TestimonialsBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/SponsorsBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/ExhibitorsBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/SocialFeedBlock.tsx` — loading="lazy" (2 images)
- [x] `src/components/design-studio/blocks/AttendeesBlock.tsx` — loading="lazy"
- [x] `src/components/design-studio/blocks/AboutBlock.tsx` — loading="lazy"
