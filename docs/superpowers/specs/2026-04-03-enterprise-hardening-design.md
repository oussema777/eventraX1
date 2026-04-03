# Eventra Enterprise Hardening — Design Spec

**Date:** April 3, 2026
**Status:** APPROVED
**Approach:** Layer-by-layer — 10 phases, each verified before moving to the next

---

## Audit Baseline

| Metric | Current | Target |
|--------|---------|--------|
| dangerouslySetInnerHTML without sanitization | 6 locations | 0 |
| Error boundaries | 0 | 2+ (root + per-section) |
| TypeScript `any` usage | 434 instances | <50 |
| `tsconfig.json` strict mode | Missing | Enabled |
| ESLint config | Missing | Configured |
| Test coverage | 0% | E2E critical paths |
| Dashboard tab eager imports | 12 (664KB chunk) | 0 (all lazy) |
| Google Fonts loaded eagerly | 6 families (~400KB) | 1 (Inter only) |
| Unbounded queries (no `.limit()`) | 8+ views | 0 |
| Polling intervals | 3 (10s/10s/15s) | 0 (all Realtime) |
| Remaining `select('*')` | ~15 locations | 0 |
| Dead dependencies | 2 (`docker`, `resend`) | 0 |
| Wildcard `"*"` versions | 6 packages | 0 |
| Dead code files | 5 pages | 0 |
| Mega-components (3000+ lines) | 4 files | 0 |
| WCAG AA color contrast failures | Primary accent | 0 |
| Atomic DB operations | 0 | ticket increment + locking |

---

## Phase 1: Security Hardening

> **Goal:** Eliminate XSS vectors, information leakage, and unsafe storage patterns
> **Estimated files:** ~40

### 1.1 — Sanitize 2FA QR code
- **File:** `src/pages/09_My_Profile.tsx:3356`
- **Problem:** `dangerouslySetInnerHTML={{ __html: twoFactorQr }}` renders unsanitized SVG from Supabase MFA API
- **Fix:** Wrap with `DOMPurify.sanitize(twoFactorQr, { USE_PROFILES: { svg: true } })`

### 1.2 — Harden CustomHTMLBlock DOMPurify
- **File:** `src/components/design-studio/blocks/CustomHTMLBlock.tsx:19-27`
- **Problems:**
  - `ADD_TAGS: ['style']` allows inline `<style>` blocks that bypass CSS sanitization
  - `FORBID_ATTR` denylist misses 20+ event handlers (`onfocus`, `onblur`, `onkeydown`, etc.)
  - CSS injected into `document.head` affects entire page (not scoped)
- **Fix:**
  - Remove `'style'` from `ADD_TAGS`
  - Replace `FORBID_ATTR` with `ALLOW_ATTR` allowlist: `['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height']`
  - Scope injected CSS by prefixing all selectors with container ID
  - Replace `Math.random()` style ID with `crypto.randomUUID()`

### 1.3 — Sanitize i18n dangerouslySetInnerHTML
- **Files:**
  - `src/components/design-studio/modals/SocialFeedBlockSettingsModal.tsx:158`
  - `src/components/design-studio/modals/MapBlockSettingsModal.tsx:223`
  - `src/components/design-studio/modals/CustomHTMLBlockSettingsModal.tsx:202`
  - `src/components/design-studio/modals/CountdownBlockSettingsModal.tsx:211`
- **Fix:** Wrap all `t()` calls inside `dangerouslySetInnerHTML` with `DOMPurify.sanitize()`

### 1.4 — Create centralized error sanitizer
- **New file:** `src/utils/errorHandler.ts`
- **Pattern:**
  ```ts
  export function sanitizeError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      // Strip Supabase schema details (table names, constraint names)
      const msg = error.message;
      if (msg.includes('duplicate key') || msg.includes('violates') || msg.includes('PGRST')) {
        return fallback;
      }
      return msg;
    }
    return fallback;
  }
  ```
- **Apply to:** All 30+ `toast.error(error.message)` locations across hooks and components

### 1.5 — Move sensitive data from localStorage to sessionStorage
- **Files:** `src/hooks/useBusinessProfile.ts`, `src/hooks/useBusinessOfferings.ts`
- **Fix:** Replace `localStorage.getItem/setItem` with `sessionStorage.getItem/setItem` for business profile and offerings cache

### 1.6 — Fix file extension derivation from MIME type
- **File:** `src/utils/storage.ts:92-118`
- **Fix:** Map `file.type` to extension (`image/jpeg` → `.jpg`, `image/png` → `.png`, etc.) instead of `file.name.split('.').pop()`

### 1.7 — Add complete FORBID_ATTR to all dangerouslySetInnerHTML
- **File:** `src/components/ui/chart.tsx:83`
- **Fix:** Sanitize chart tooltip HTML if it contains any user-derived data

---

## Phase 2: Error Boundaries + TypeScript

> **Goal:** Prevent full-app crashes, establish type safety foundation

### 2.1 — Add React Error Boundary
- **File:** `src/App.tsx`
- **New component:** `src/components/ErrorBoundary.tsx`
  - Class component implementing `componentDidCatch`
  - Branded fallback UI: "Something went wrong" with reload button
  - Logs error to console (production builds strip console via esbuild.drop)
- **Wrap:** `<ErrorBoundary>` around `<Suspense>` in `App.tsx`

### 2.2 — Create tsconfig.json
- **New file:** `tsconfig.json`
- **Config:** `strict: true`, `noImplicitAny: true`, `skipLibCheck: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`
- **Note:** This will surface hundreds of type errors. We add the config but do NOT block the build on `tsc --noEmit` yet — that's a gradual migration.

### 2.3 — Define Profile interface
- **New file:** `src/types/profile.ts`
- **Interface:** ~25 fields matching the profiles table schema
- **Apply to:** `AuthContext.tsx` (replace `profile: any | null` with `profile: Profile | null`), `useProfile.ts`

### 2.4 — Fix AuthContext issues
- **File:** `src/contexts/AuthContext.tsx`
- **Fixes:**
  - Replace `.single()` with `.maybeSingle()` at line 37
  - Skip `fetchProfile` on `TOKEN_REFRESHED` events (check `_event` param)
  - Replace `select('*')` with specific columns matching Profile interface

---

## Phase 3: Dashboard Lazy-Loading + Fonts

> **Goal:** Reduce dashboard chunk from 664KB to ~80KB, eliminate ~400KB of font downloads

### 3.1 — Lazy-load 12 dashboard tab components
- **File:** `src/pages/06_Event_Management_Dashboard.tsx:28-40`
- **Change:** Convert all 12 static imports to `React.lazy()`:
  ```ts
  const EventOverviewTab = lazy(() => import('../components/dashboard/EventOverviewTab'));
  const EventAttendeesTab = lazy(() => import('../components/dashboard/EventAttendeesTab'));
  // ... etc for all 12
  ```
- **Add:** Per-tab `<Suspense fallback={<TabLoader />}>` wrapper in the tab rendering section

### 3.2 — Lazy-load recharts
- **Files:** `src/components/dashboard/DashboardChartWidget.tsx`, `SmartKpiGrid.tsx`, `DynamicKpiGrid.tsx`
- **Change:** Wrap chart components in lazy-loaded wrappers:
  ```ts
  const LazyAreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
  ```
- **Alternative:** Create a single `src/components/dashboard/LazyChart.tsx` that wraps all recharts components

### 3.3 — Defer non-Inter fonts
- **File:** `index.html:28-33`
- **Change:** Keep only Inter in the eagerly-loaded `<link>`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  ```
- **Lazy load others:** In the design studio font picker component, dynamically inject `<link>` tags when a user selects Lato/Montserrat/Open Sans/Poppins/Roboto

### 3.4 — Lazy-load jsQR
- **File:** `src/components/dashboard/EventDayOfTab.tsx:3`
- **Change:** Replace static `import jsQR from 'jsqr'` with dynamic `const { default: jsQR } = await import('jsqr')` inside the scan activation handler

---

## Phase 4: Pagination + Query Limits

> **Goal:** Eliminate unbounded queries that will crash at scale

### 4.1 — Browse Events server-side pagination
- **File:** `src/pages/07_Browse_Events_Public.tsx:38-51`
- **Fix:**
  - Replace `select('*')` with 12 specific columns
  - Add `.range(start, end)` with page size of 24
  - Remove `Math.random()` status badge (line 62)
  - Add "Load more" or pagination UI

### 4.2 — Community People server-side pagination
- **File:** `src/pages/34_Community_People_Discovery.tsx:81-93`
- **Fix:**
  - Replace `.limit(1000)` with `.range(start, end)` page size 20
  - Drop `professional_data` and `b2b_profile` JSONB blobs from select — only fetch display fields
  - Remove `Math.random()` matchScore — use a deterministic placeholder or remove entirely
  - Move search to server-side `.ilike('full_name', '%query%')`

### 4.3 — Admin Dashboard bounded queries
- **File:** `src/pages/admin/AdminDashboard.tsx:64-86`
- **Fix:**
  - Replace `select('*')` with specific columns (12 for events, 8 for businesses)
  - Add `.limit(100)`
  - Move search to server-side `.ilike('name', '%query%')`

### 4.4 — Attendees Tab bounded queries
- **File:** `src/components/wizard/AttendeesTab.tsx:135`
- **Fix:** Replace `select('*')` with specific columns, add `.limit(500)`

### 4.5 — CSV export chunking
- **Files:** `src/components/dashboard/EventReportingTab.tsx:541-608`, `EventDayOfTab.tsx:2631`
- **Fix:** Fetch in chunks of 1000 rows using `.range(offset, offset+999)` in a loop until no more rows, then build CSV from accumulated chunks

### 4.6 — Fix N+1 in CustomFormsTab
- **File:** `src/components/wizard/CustomFormsTab.tsx:289-308`
- **Fix:** Replace sequential per-form count queries with a single RPC or `.in('form_id', formIds)` grouped count:
  ```ts
  const { data, error } = await supabase
    .from('event_form_submissions')
    .select('form_id', { count: 'exact', head: true })
    .in('form_id', formIds);
  ```
  Or create an RPC: `SELECT form_id, COUNT(*) FROM event_form_submissions WHERE form_id = ANY($1) GROUP BY form_id`

### 4.7 — Landing page select('*') cleanup
- **Files:** `src/components/events/DesignStudioLanding.tsx:241-245`, `SingleEventLanding.tsx:68-109`
- **Fix:** Replace `select('*')` with specific columns for speakers, sessions, tickets, sponsors, exhibitors

---

## Phase 5: Polling → Supabase Realtime

> **Goal:** Replace 3 polling intervals with efficient Realtime subscriptions

### 5.1 — Notifications Realtime
- **File:** `src/hooks/useNotifications.ts:33`
- **Change:**
  - Remove `refetchInterval: 10000`
  - Add Supabase Realtime channel:
    ```ts
    supabase.channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, () => queryClient.invalidateQueries({ queryKey }))
      .subscribe()
    ```
  - Clean up channel in useEffect return

### 5.2 — Fix Messages global channel
- **File:** `src/components/messaging/UserMessagesCenter.tsx:391-429`
- **Fixes:**
  - Add filter to global channel: `filter: recipient_id=eq.${userId}` (or use an RPC-based approach)
  - Remove `conversations.length` from dependency array to prevent channel churn
  - Use a ref for conversations list inside the callback
  - Remove the redundant `setInterval` polling at line 376

### 5.3 — B2B Networking Realtime
- **File:** `src/components/networking/UserB2BCenter.tsx:977-985`
- **Change:**
  - Remove `setInterval(loadNetworkingData, 15000)`
  - Add user filter to meetings queries at lines 205-206: `.or('requester_id.eq.${userId},recipient_id.eq.${userId}')`
  - Add Realtime subscription on relevant tables (matches, requests, connections) filtered by user ID
  - Remove `console.log('[Networking] START LOAD')` at line 178

---

## Phase 6: Remaining `select('*')` + Missing Indexes

> **Goal:** Eliminate all remaining full-row fetches, add missing DB indexes

### 6.1 — Replace remaining select('*')
| File | Line(s) | Table | Columns Needed |
|------|---------|-------|----------------|
| `useProfile.ts` | 75, 99 | `profiles` | ~25 fields per Profile interface |
| `useProfile.ts` | 113 | `profile_education` | id, profile_id, institution, degree, field, start_date, end_date |
| `useProfile.ts` | 114 | `profile_certifications` | id, profile_id, name, issuer, issue_date, expiry_date |
| `AuthContext.tsx` | 36 | `profiles` | id, full_name, email, avatar_url, role, plan, language |
| `06_Event_Management_Dashboard.tsx` | 85 | `events` | ~15 dashboard-relevant fields |
| `UserB2BCenter.tsx` | 201-206 | 7 tables | Specific columns per table |
| `EventScheduleTab.tsx` | 206 | `event_sessions` | id, title, start_time, end_time, location, status, speaker_ids |

### 6.2 — Additional database indexes
- **New file:** `database/scripts/sql_add_enterprise_indexes.sql`
```sql
-- Form submissions by form
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON event_form_submissions(form_id);

-- Event registrations by event
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);

-- Full-name search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_trgm ON profiles USING gin(full_name gin_trgm_ops);

-- Check-ins by event + type
CREATE INDEX IF NOT EXISTS idx_checkins_event_type ON event_checkins(event_id, type, created_at);

-- B2B matches by profile
CREATE INDEX IF NOT EXISTS idx_b2b_matches_profile ON b2b_matches(profile_id);

-- B2B requests by recipient
CREATE INDEX IF NOT EXISTS idx_b2b_requests_recipient ON b2b_requests(recipient_id, status);
```

### 6.3 — Invalidate useEventStats cache after mutations
- **Files:** `useSpeakers.ts`, `useSessions.ts`, `useTickets.ts`, `useAttendees.ts`, `useExhibitors.ts`
- **Fix:** After each create/update/delete mutation succeeds, add:
  ```ts
  queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
  ```

---

## Phase 7: Code Cleanup

> **Goal:** Remove dead weight from the bundle and dependency tree

### 7.1 — Remove dead dependencies
- **File:** `package.json`
- **Remove from dependencies:** `docker`, `resend`
- **Move to devDependencies:** `@types/dompurify`

### 7.2 — Pin wildcard versions
- **File:** `package.json`
- **Pin:**
  - `react-router-dom`: `"*"` → `"^6.28.0"` (or current resolved version)
  - `clsx`: `"*"` → `"^2.1.0"`
  - `tailwind-merge`: `"*"` → `"^2.6.0"`
  - `dnd-core`: `"*"` → `"^16.0.1"`
  - `react-dnd`: `"*"` → `"^16.0.1"`
  - `react-dnd-html5-backend`: `"*"` → `"^16.0.1"`

### 7.3 — Delete dead code files
- `src/pages/SchemaInspector.tsx`
- `src/pages/EventCreationWizard.tsx`
- `src/pages/04_Wizard_Step2_Design.tsx`
- `src/components/wizard/CustomFormsTabsOld.tsx`
- Remove any routes referencing these in `App.tsx`

### 7.4 — Clean versioned imports
- **Files:** All 48+ files importing from `'sonner@2.0.3'`
- **Fix:** Replace with `'sonner'` globally
- **File:** `vite.config.ts:11-49` — Remove version alias entries

### 7.5 — Replace next-themes
- **File:** `src/components/ui/sonner.tsx:3`
- **Fix:** Replace `import { useTheme } from 'next-themes@0.4.6'` with a hardcoded `theme = "dark"`
- **Then:** Remove `next-themes` from `package.json`

---

## Phase 8: ESLint/Prettier + Accessibility

> **Goal:** Establish code quality tooling and fix critical a11y gaps

### 8.1 — Add ESLint configuration
- **New file:** `eslint.config.js`
- **Plugins:** `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`
- **Add to package.json scripts:** `"lint": "eslint src/ --ext .ts,.tsx"`
- **Note:** Initial run will surface many warnings. Fix critical ones (unused vars, missing deps) but don't block on all.

### 8.2 — Add Prettier configuration
- **New file:** `.prettierrc`
- **Config:** `{ "singleQuote": true, "trailingComma": "es5", "tabWidth": 2, "semi": true }`

### 8.3 — Fix color contrast
- **Current:** `#0684F5` on `#0B2641` = 3.8:1 (fails WCAG AA)
- **Fix:** Adjust accent blue to `#3B9EFF` or similar — achieves 4.5:1+ contrast ratio
- **Apply in:** `src/index.css` or `src/styles/globals.css` CSS custom property

### 8.4 — Add semantic HTML + ARIA
- **Layout components:** Add `<main>`, `<nav>`, `<header>` where appropriate
- **Icon-only buttons:** Add `aria-label` to all icon-only interactive elements
- **Messaging:** Add `aria-live="polite"` to message list for screen reader announcements
- **Forms:** Verify `htmlFor` associations on all form labels

---

## Phase 9: Component Splitting

> **Goal:** Break mega-components into maintainable sub-components

### 9.1 — Split EventExhibitorsTab (4,288 lines)
- Extract: `ExhibitorsList`, `ExhibitorForm`, `ExhibitorDetails`, `ExhibitorFilters`
- Extract data fetching into `useExhibitorTab` hook
- Target: main file < 300 lines orchestrating sub-components

### 9.2 — Split EventSpeakersTab (4,249 lines)
- Extract: `SpeakersList`, `SpeakerForm`, `SpeakerDetails`, `SpeakerFilters`
- Extract data fetching into `useSpeakerTab` hook
- Target: main file < 300 lines

### 9.3 — Split EventB2BMatchmakingTab (3,654 lines)
- Extract: `MatchmakingDashboard`, `MatchmakingSettings`, `MeetingScheduler`, `MatchList`
- Migrate from `useState` + `useEffect` to React Query hooks
- Eliminate 50+ `any` types

### 9.4 — Split 09_My_Profile (3,807 lines)
- Extract: `ProfileHeader`, `ProfileDetails`, `ProfileEducation`, `ProfileCertifications`, `ProfileSettings`, `TwoFactorSetup`
- Each section as a self-contained component with its own data fetching

---

## Phase 10: Data Integrity + Resilience

> **Goal:** Prevent data corruption under concurrent access

### 10.1 — Atomic ticket increment
- **New SQL RPC:**
  ```sql
  CREATE OR REPLACE FUNCTION increment_ticket_sold(ticket_id UUID)
  RETURNS void AS $$
  BEGIN
    UPDATE event_tickets
    SET quantity_sold = quantity_sold + 1
    WHERE id = ticket_id
    AND (quantity_available IS NULL OR quantity_sold < quantity_available);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ticket sold out or not found';
    END IF;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```
- **Apply in:** Registration flow — replace direct `.update({ quantity_sold: current + 1 })` with `.rpc('increment_ticket_sold', { ticket_id })`

### 10.2 — Optimistic locking on shared resources
- **Sponsor reorder** (`useSponsors.ts`): Before updating sort_order, fetch current `updated_at`, include `AND updated_at = $expected` in update query. If 0 rows affected → conflict → refetch and retry.
- **Attendee settings** (`useAttendees.ts`): Same pattern for settings update.

### 10.3 — Fix storage cache-buster
- **File:** `src/utils/storage.ts:81`
- **Fix:** Only append `?t=${Date.now()}` when `upsert: true` is used (replacement). For fresh uploads, the path is unique so no cache-busting needed.

### 10.4 — Scope global messages channel
- **File:** `src/components/messaging/UserMessagesCenter.tsx:391-429`
- **Fix:** Instead of listening to ALL inserts and filtering client-side, use a server-side filter or maintain a list of user's thread IDs and filter the subscription accordingly.

---

## Progress Log

| Date | Phase | What Was Done | Build OK? |
|------|-------|---------------|-----------|
| 2026-04-03 | — | Spec created and approved | — |

---

## Files Modified Tracker

_(To be filled during implementation)_

### Phase 1 Files
- [ ] `src/pages/09_My_Profile.tsx` — DOMPurify on 2FA QR
- [ ] `src/components/design-studio/blocks/CustomHTMLBlock.tsx` — ALLOW_ATTR, scoped CSS
- [ ] `src/components/design-studio/modals/SocialFeedBlockSettingsModal.tsx` — sanitize t()
- [ ] `src/components/design-studio/modals/MapBlockSettingsModal.tsx` — sanitize t()
- [ ] `src/components/design-studio/modals/CustomHTMLBlockSettingsModal.tsx` — sanitize t()
- [ ] `src/components/design-studio/modals/CountdownBlockSettingsModal.tsx` — sanitize t()
- [ ] `src/utils/errorHandler.ts` (new) — centralized error sanitizer
- [ ] 30+ hook/component files — replace toast.error(error.message)
- [ ] `src/hooks/useBusinessProfile.ts` — localStorage → sessionStorage
- [ ] `src/hooks/useBusinessOfferings.ts` — localStorage → sessionStorage
- [ ] `src/utils/storage.ts` — MIME-based extension
- [ ] `src/components/ui/chart.tsx` — sanitize tooltip HTML

### Phase 2 Files
- [ ] `src/components/ErrorBoundary.tsx` (new)
- [ ] `src/App.tsx` — wrap with ErrorBoundary
- [ ] `tsconfig.json` (new)
- [ ] `src/types/profile.ts` (new)
- [ ] `src/contexts/AuthContext.tsx` — Profile type, maybeSingle, skip TOKEN_REFRESHED

### Phase 3 Files
- [ ] `src/pages/06_Event_Management_Dashboard.tsx` — 12 lazy tab imports
- [ ] `src/components/dashboard/DashboardChartWidget.tsx` — lazy recharts
- [ ] `src/components/dashboard/SmartKpiGrid.tsx` — lazy recharts
- [ ] `src/components/dashboard/DynamicKpiGrid.tsx` — lazy recharts
- [ ] `index.html` — Inter only, defer others
- [ ] `src/components/dashboard/EventDayOfTab.tsx` — lazy jsQR

### Phase 4 Files
- [ ] `src/pages/07_Browse_Events_Public.tsx` — pagination + columns
- [ ] `src/pages/34_Community_People_Discovery.tsx` — server pagination
- [ ] `src/pages/admin/AdminDashboard.tsx` — limit + columns
- [ ] `src/components/wizard/AttendeesTab.tsx` — limit + columns
- [ ] `src/components/dashboard/EventReportingTab.tsx` — chunked export
- [ ] `src/components/dashboard/EventDayOfTab.tsx` — chunked export
- [ ] `src/components/wizard/CustomFormsTab.tsx` — fix N+1
- [ ] `src/components/events/DesignStudioLanding.tsx` — specific columns
- [ ] `src/components/events/SingleEventLanding.tsx` — specific columns

### Phase 5 Files
- [ ] `src/hooks/useNotifications.ts` — Realtime subscription
- [ ] `src/components/messaging/UserMessagesCenter.tsx` — fix global channel
- [ ] `src/components/networking/UserB2BCenter.tsx` — Realtime + user filter

### Phase 6 Files
- [ ] `src/hooks/useProfile.ts` — specific columns × 4
- [ ] `src/contexts/AuthContext.tsx` — specific columns
- [ ] `src/pages/06_Event_Management_Dashboard.tsx` — specific columns
- [ ] `src/components/networking/UserB2BCenter.tsx` — specific columns × 7
- [ ] `src/components/dashboard/EventScheduleTab.tsx` — specific columns
- [ ] `database/scripts/sql_add_enterprise_indexes.sql` (new)
- [ ] `src/hooks/useSpeakers.ts` — invalidate event-stats
- [ ] `src/hooks/useSessions.ts` — invalidate event-stats
- [ ] `src/hooks/useTickets.ts` — invalidate event-stats
- [ ] `src/hooks/useAttendees.ts` — invalidate event-stats
- [ ] `src/hooks/useExhibitors.ts` — invalidate event-stats

### Phase 7 Files
- [ ] `package.json` — remove docker/resend, move @types/dompurify, pin versions
- [ ] `src/pages/SchemaInspector.tsx` — delete
- [ ] `src/pages/EventCreationWizard.tsx` — delete
- [ ] `src/pages/04_Wizard_Step2_Design.tsx` — delete
- [ ] `src/components/wizard/CustomFormsTabsOld.tsx` — delete
- [ ] 48+ files — replace `sonner@2.0.3` → `sonner`
- [ ] `vite.config.ts` — remove version aliases
- [ ] `src/components/ui/sonner.tsx` — remove next-themes

### Phase 8 Files
- [ ] `eslint.config.js` (new)
- [ ] `.prettierrc` (new)
- [ ] `src/index.css` or `src/styles/globals.css` — fix accent color contrast
- [ ] Layout components — semantic HTML + ARIA

### Phase 9 Files
- [ ] `src/components/dashboard/EventExhibitorsTab.tsx` — split into 4+ sub-components
- [ ] `src/components/dashboard/EventSpeakersTab.tsx` — split into 4+ sub-components
- [ ] `src/components/dashboard/EventB2BMatchmakingTab.tsx` — split + React Query
- [ ] `src/pages/09_My_Profile.tsx` — split into 6+ sub-components

### Phase 10 Files
- [ ] `database/scripts/sql_atomic_ticket_increment.sql` (new)
- [ ] `src/hooks/useSponsors.ts` — optimistic locking
- [ ] `src/hooks/useAttendees.ts` — optimistic locking
- [ ] `src/utils/storage.ts` — conditional cache-buster
- [ ] `src/components/messaging/UserMessagesCenter.tsx` — scoped global channel
