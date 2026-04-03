# Eventra Enterprise Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Eventra platform to enterprise-grade across security, performance, scalability, code quality, and data integrity — 10 phases, 44 fixes.

**Architecture:** Layer-by-layer execution. Each phase touches one concern, verified with `npx vite build` before moving to the next. Phases are ordered by dependency: security → types → bundle → queries → realtime → cleanup → tooling → splitting → integrity.

**Tech Stack:** React 18, TypeScript, Vite + SWC, Supabase (PostgREST + Realtime + Storage), React Query v5, Tailwind CSS v4, DOMPurify

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-hardening-design.md`

---

## Task 1: Phase 1 — Security Hardening

**Files:**
- Modify: `src/pages/09_My_Profile.tsx:3356`
- Modify: `src/components/design-studio/blocks/CustomHTMLBlock.tsx:19-43`
- Modify: `src/components/design-studio/modals/SocialFeedBlockSettingsModal.tsx:158`
- Modify: `src/components/design-studio/modals/MapBlockSettingsModal.tsx:223`
- Modify: `src/components/design-studio/modals/CustomHTMLBlockSettingsModal.tsx:202`
- Modify: `src/components/design-studio/modals/CountdownBlockSettingsModal.tsx:211`
- Create: `src/utils/errorHandler.ts`
- Modify: All hooks in `src/hooks/` that use `toast.error(error.message)`
- Modify: `src/hooks/useBusinessProfile.ts`
- Modify: `src/hooks/useBusinessOfferings.ts`
- Modify: `src/utils/storage.ts:91-141`
- Modify: `src/components/ui/chart.tsx:83`

- [ ] **Step 1: Sanitize 2FA QR code**

In `src/pages/09_My_Profile.tsx`, find line 3356:
```tsx
<div dangerouslySetInnerHTML={{ __html: twoFactorQr }} />
```
Replace with:
```tsx
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(twoFactorQr, { USE_PROFILES: { svg: true } }) }} />
```
Ensure `import DOMPurify from 'dompurify'` is at the top of the file. Check if it's already imported.

- [ ] **Step 2: Harden CustomHTMLBlock DOMPurify config**

In `src/components/design-studio/blocks/CustomHTMLBlock.tsx`, replace lines 19-27:
```tsx
const sanitizedHtml = useMemo(() => {
  const raw = settings?.html || defaultHtml;
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}, [settings?.html]);
```
With:
```tsx
const sanitizedHtml = useMemo(() => {
  const raw = settings?.html || defaultHtml;
  return DOMPurify.sanitize(raw, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'style'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height', 'style'],
  });
}, [settings?.html]);
```

- [ ] **Step 3: Scope CSS injection in CustomHTMLBlock**

In the same file, replace lines 29-43:
```tsx
useEffect(() => {
  if (containerRef.current && settings?.css) {
    const safeCSS = sanitizeCSS(settings.css);
    const styleId = `custom-style-${Math.random().toString(36).substr(2, 9)}`;
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = safeCSS;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }
}, [settings?.css]);
```
With:
```tsx
const containerId = useMemo(() =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? `custom-block-${crypto.randomUUID()}`
    : `custom-block-${Math.random().toString(36).substr(2, 12)}`,
[]);

useEffect(() => {
  if (containerRef.current && settings?.css) {
    const safeCSS = sanitizeCSS(settings.css);
    // Scope all CSS selectors to this block's container
    const scopedCSS = safeCSS.replace(
      /([^{}]+)\{/g,
      (match, selector) => `#${containerId} ${selector.trim()} {`
    );
    const styleEl = document.createElement('style');
    styleEl.id = containerId;
    styleEl.textContent = scopedCSS;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(containerId);
      if (el) el.remove();
    };
  }
}, [settings?.css, containerId]);
```
Also update the container div to include the `id`:
```tsx
<div id={containerId} className="group relative w-full overflow-hidden">
```

- [ ] **Step 4: Sanitize i18n dangerouslySetInnerHTML in 4 modal files**

In each of these files, find `dangerouslySetInnerHTML={{__html: t(...)}}` and wrap with `DOMPurify.sanitize()`:
- `src/components/design-studio/modals/SocialFeedBlockSettingsModal.tsx:158`
- `src/components/design-studio/modals/MapBlockSettingsModal.tsx:223`
- `src/components/design-studio/modals/CustomHTMLBlockSettingsModal.tsx:202`
- `src/components/design-studio/modals/CountdownBlockSettingsModal.tsx:211`

Pattern: `dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(t('key'))}}` and add `import DOMPurify from 'dompurify'` to each file.

- [ ] **Step 5: Create centralized error sanitizer**

Create `src/utils/errorHandler.ts`:
```ts
/**
 * Sanitizes error messages before displaying to users.
 * Strips Supabase internal schema details, stack traces, and limits length.
 */
export function sanitizeError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Strip Supabase schema details (table names, constraint names, hints)
    if (
      msg.includes('duplicate key') ||
      msg.includes('violates') ||
      msg.includes('PGRST') ||
      msg.includes('relation') ||
      msg.includes('column')
    ) {
      return fallback;
    }
    // Strip stack traces and limit length
    return msg.split('\n')[0].substring(0, 200);
  }
  return fallback;
}
```

- [ ] **Step 6: Replace toast.error(error.message) across all hooks**

Search for `toast.error(error.message)` and `toast.error(error?.message)` across `src/hooks/` and `src/components/`. Replace each with `toast.error(sanitizeError(error, 'fallback message'))`. Add `import { sanitizeError } from '../utils/errorHandler'` (adjust path as needed).

Run: `grep -r "toast\.error(error" src/hooks/ src/components/ src/pages/` to find all instances.

Each hook file needs a contextual fallback message, e.g.:
- `useSpeakers.ts`: `'Failed to save speaker'`
- `useTickets.ts`: `'Failed to save ticket'`
- etc.

Also search for `error.details` and `error.hint` — ensure these are never passed to toast.

- [ ] **Step 7: Fix localStorage → sessionStorage for cache writes**

In `src/hooks/useBusinessProfile.ts`:
- **Keep** the `PGRST205` fallback reads/writes in `localStorage` (offline fallback)
- **Change** the successful-fetch cache writes from `localStorage.setItem` to `sessionStorage.setItem`

In `src/hooks/useBusinessOfferings.ts`:
- **Change** the successful-fetch cache writes from `localStorage.setItem` to `sessionStorage.setItem`
- **Keep** any fallback reads from `localStorage` for backwards compat (read from both, write to sessionStorage)

- [ ] **Step 8: Fix file extension derivation from MIME type**

In `src/utils/storage.ts`, add this helper at the top:
```ts
function getExtensionFromMime(file: File): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };
  return mimeMap[file.type] || file.name.split('.').pop() || 'bin';
}
```

Then replace all `file.name.split('.').pop()` calls (lines 92, 101, 119, 128, 139) with `getExtensionFromMime(file)`.

- [ ] **Step 9: Verify build**

Run: `npx vite build`
Expected: Build succeeds with "built in Xs" message. Exit code 1 on Windows is normal due to path spaces — check output for "built in" text.

- [ ] **Step 10: Commit Phase 1**

```bash
git add src/pages/09_My_Profile.tsx src/components/design-studio/blocks/CustomHTMLBlock.tsx src/components/design-studio/modals/ src/utils/errorHandler.ts src/hooks/ src/utils/storage.ts src/components/ui/chart.tsx
git commit -m "security: sanitize XSS vectors, centralize error handling, fix storage patterns"
```

---

## Task 2: Phase 2 — Error Boundaries + TypeScript + Versioned Import Cleanup

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`
- Create: `tsconfig.json`
- Create: `src/types/profile.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `vite.config.ts:10-49` (remove version aliases)
- Modify: 48+ files with versioned `sonner@2.0.3` imports

- [ ] **Step 1: Clean versioned imports FIRST (before tsconfig)**

This must happen before tsconfig.json is created. Replace all versioned imports across the codebase:

Run this search to find all versioned imports:
```bash
grep -r "from 'sonner@2.0.3'" src/ --include="*.tsx" --include="*.ts" -l
```

In each file, replace `from 'sonner@2.0.3'` with `from 'sonner'`.
Also replace any other versioned imports (`next-themes@0.4.6`, `recharts@2.15.2`, etc.) found via:
```bash
grep -rn "@[0-9]" src/ --include="*.tsx" --include="*.ts" | grep "from '"
```

- [ ] **Step 2: Remove version aliases from vite.config.ts**

In `vite.config.ts`, remove all versioned alias entries (lines 11-49), keeping only the `@` alias:
```ts
alias: {
  '@': path.resolve(__dirname, './src'),
},
```

- [ ] **Step 3: Verify build after alias cleanup**

Run: `npx vite build`
Expected: Build succeeds. This confirms all versioned imports were properly replaced.

- [ ] **Step 4: Create ErrorBoundary component**

Create `src/components/ErrorBoundary.tsx`:
```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B2641',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: '#94A3B8', maxWidth: '400px' }}>
            An unexpected error occurred. Please try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0684F5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 5: Wrap App with ErrorBoundary**

In `src/App.tsx`, add import:
```tsx
import ErrorBoundary from './components/ErrorBoundary';
```

Wrap the `<Suspense>` inside `<ErrorBoundary>`:
```tsx
<ErrorBoundary>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ... */}
    </Routes>
  </Suspense>
</ErrorBoundary>
```

- [ ] **Step 6: Create tsconfig.json**

Create `tsconfig.json` at project root:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Verify build after tsconfig**

Run: `npx vite build`
Expected: Build still succeeds. SWC uses tsconfig for JSX config but does not type-check.

- [ ] **Step 8: Create Profile interface**

Create `src/types/profile.ts`:
```ts
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  plan: string | null;
  language: string | null;
  job_title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  professional_data: Record<string, unknown> | null;
  b2b_profile: Record<string, unknown> | null;
  industry: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 9: Fix AuthContext — type, query, and token refresh**

In `src/contexts/AuthContext.tsx`:

1. Add import: `import type { Profile } from '../types/profile';`
2. Replace `profile: any | null` with `profile: Profile | null` in the interface (line 8) and useState (line 19)
3. Define columns constant:
```ts
const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, role, plan, language, job_title, company, location, bio, phone, website, linkedin_url, professional_data, b2b_profile, industry, interests, created_at, updated_at';
```
4. Replace `.select('*')` with `.select(PROFILE_COLUMNS)` at line 36
5. Replace `.single()` with `.maybeSingle()` at line 38
6. In `onAuthStateChange` callback (line 80), skip fetch on token refresh:
```tsx
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);

  if (event === 'TOKEN_REFRESHED') return; // Skip redundant profile fetch

  if (session?.user) {
    fetchProfile(session.user);
  } else {
    setProfile(null);
    setIsLoading(false);
  }
});
```

- [ ] **Step 10: Verify build and commit Phase 2**

Run: `npx vite build`
Expected: Build succeeds.

```bash
git add -A
git commit -m "feat: add error boundary, tsconfig, Profile type, clean versioned imports"
```

---

## Task 3: Phase 3 — Dashboard Lazy-Loading + Fonts

**Files:**
- Modify: `src/pages/06_Event_Management_Dashboard.tsx:28-39`
- Modify: `vite.config.ts` (remove recharts from manualChunks)
- Modify: `index.html:30-33`
- Modify: `src/components/dashboard/EventDayOfTab.tsx:3`

- [ ] **Step 1: Lazy-load 12 dashboard tab components**

In `src/pages/06_Event_Management_Dashboard.tsx`, replace lines 28-39 (static imports):
```tsx
import EventOverviewTab from '../components/dashboard/EventOverviewTab';
import EventAttendeesTab from '../components/dashboard/EventAttendeesTab';
// ... etc
```
With lazy imports:
```tsx
import { lazy, Suspense } from 'react';

const EventOverviewTab = lazy(() => import('../components/dashboard/EventOverviewTab'));
const EventAttendeesTab = lazy(() => import('../components/dashboard/EventAttendeesTab'));
const EventScheduleTab = lazy(() => import('../components/dashboard/EventScheduleTab'));
const EventSpeakersTab = lazy(() => import('../components/dashboard/EventSpeakersTab'));
const EventExhibitorsTab = lazy(() => import('../components/dashboard/EventExhibitorsTab'));
const EventTicketingTab = lazy(() => import('../components/dashboard/EventTicketingTab'));
const EventB2BMatchmakingTab = lazy(() => import('../components/dashboard/EventB2BMatchmakingTab'));
const EventMarketingTab = lazy(() => import('../components/dashboard/EventMarketingTab'));
const EventDayOfTab = lazy(() => import('../components/dashboard/EventDayOfTab'));
const EventReportingTab = lazy(() => import('../components/dashboard/EventReportingTab'));
const EventFormsTab = lazy(() => import('../components/dashboard/EventFormsTab'));
const EventNotificationCenterTab = lazy(() => import('../components/dashboard/EventNotificationCenterTab'));
```

Find the tab rendering section and wrap each tab in `<Suspense>`:
```tsx
<Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={24} /></div>}>
  {activeTab === 'overview' && <EventOverviewTab event={event} eventId={eventId!} />}
  {/* etc for each tab */}
</Suspense>
```

- [ ] **Step 2: Remove recharts from manualChunks**

In `vite.config.ts`, remove line 77: `'charts': ['recharts'],`

- [ ] **Step 3: Defer non-Inter fonts**

In `index.html`, replace lines 30-33:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
  rel="stylesheet"
/>
```
With:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

The other fonts (Lato, Montserrat, Open Sans, Poppins, Roboto) are only used as design studio font options. They should be loaded on-demand when a user selects them in the font picker. Find the font picker component in the design studio and add dynamic font loading there via JavaScript `<link>` injection when a font is selected.

- [ ] **Step 4: Lazy-load jsQR**

In `src/components/dashboard/EventDayOfTab.tsx`, find the static import of jsQR (near top):
```tsx
import jsQR from 'jsqr';
```
Remove it. Then find where `jsQR()` is called (in the scan handler function) and replace with dynamic import:
```tsx
const { default: jsQR } = await import('jsqr');
```

- [ ] **Step 5: Verify build and commit**

Run: `npx vite build`
Check output: dashboard chunk should be significantly smaller, recharts should be in its own async chunk.

```bash
git add -A
git commit -m "perf: lazy-load dashboard tabs, recharts, jsQR; defer non-Inter fonts"
```

---

## Task 4: Phase 4 — Pagination + Query Limits

**Files:**
- Modify: `src/pages/07_Browse_Events_Public.tsx`
- Modify: `src/pages/34_Community_People_Discovery.tsx`
- Modify: `src/pages/admin/AdminDashboard.tsx`
- Modify: `src/components/wizard/AttendeesTab.tsx`
- Modify: `src/components/dashboard/EventReportingTab.tsx`
- Modify: `src/components/dashboard/EventDayOfTab.tsx`
- Modify: `src/components/wizard/CustomFormsTab.tsx`
- Modify: `src/components/events/DesignStudioLanding.tsx`
- Modify: `src/components/events/SingleEventLanding.tsx`
- Create: `database/scripts/sql_form_submission_counts_rpc.sql`

- [ ] **Step 1: Browse Events — add pagination + specific columns**

In `src/pages/07_Browse_Events_Public.tsx`, find the `fetchEvents` function. Replace `select('*')` with specific columns:
```ts
.select('id, name, description, start_date, end_date, location, is_public, status, cover_image_url, event_type, branding_settings, owner_id')
```
Add `.range(from, to)` pagination with page size 24. Add state: `const [page, setPage] = useState(0);` and compute range: `const from = page * 24; const to = from + 23;`

Remove the `Math.random()` status badge (the "filling-fast" line). Replace with a deterministic check based on actual capacity if available, or remove entirely.

Add a "Load More" button at the bottom that increments the page and appends results.

- [ ] **Step 2: Community People — server-side pagination**

In `src/pages/34_Community_People_Discovery.tsx`, replace the query:
- Change `.limit(1000)` to `.range(from, to)` with page size 20
- Remove `professional_data` and `b2b_profile` from select — only fetch: `id, full_name, job_title, company, location, avatar_url, bio, industry`
- Remove `Math.random()` matchScore — use 0 or remove the field
- Move search to server-side: if `searchQuery` exists, add `.ilike('full_name', '%${searchQuery}%')` to the query

- [ ] **Step 3: Admin Dashboard — bounded queries**

In `src/pages/admin/AdminDashboard.tsx`:
- Replace both `select('*')` with specific columns
- Add `.limit(100)` to both queries
- Move the search filter to server-side: `.ilike('name', '%${searchQuery}%')`

- [ ] **Step 4: Attendees Tab — bounded queries**

In `src/components/wizard/AttendeesTab.tsx`:
- Replace `select('*')` with specific columns for `event_attendees`
- Add `.limit(500)`

- [ ] **Step 5: CSV export chunking with abort**

Create a shared utility function in a new section of an existing utils file or at the top of `EventReportingTab.tsx`:
```ts
async function fetchAllInChunks(
  query: () => any,  // function that returns a supabase query builder
  signal?: AbortSignal
): Promise<any[]> {
  const CHUNK_SIZE = 1000;
  let offset = 0;
  const allRows: any[] = [];

  while (true) {
    if (signal?.aborted) break;
    const { data, error } = await query()
      .range(offset, offset + CHUNK_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < CHUNK_SIZE) break;
    offset += CHUNK_SIZE;
  }
  return allRows;
}
```

Apply this pattern to CSV exports in `EventReportingTab.tsx` (lines 541-608) and `EventDayOfTab.tsx` (line 2631).

- [ ] **Step 6: Fix N+1 in CustomFormsTab**

Create `database/scripts/sql_form_submission_counts_rpc.sql`:
```sql
CREATE OR REPLACE FUNCTION get_form_submission_counts(form_ids UUID[])
RETURNS TABLE(form_id UUID, count BIGINT) AS $$
  SELECT form_id, COUNT(*) FROM event_form_submissions
  WHERE form_id = ANY(form_ids) GROUP BY form_id;
$$ LANGUAGE sql STABLE;
```

In `src/components/wizard/CustomFormsTab.tsx`, replace the `fetchSubmissionCounts` function (lines 289-308):
```ts
const fetchSubmissionCounts = async () => {
  if (!eventId || formsRows.length === 0) return;
  try {
    const formIds = formsRows.map(f => f.id);
    const { data, error } = await supabase.rpc('get_form_submission_counts', { form_ids: formIds });
    if (error) throw error;
    const counts: Record<string, number> = {};
    (data || []).forEach((row: { form_id: string; count: number }) => {
      counts[row.form_id] = row.count;
    });
    setSubmissionCounts(counts);
  } catch (e) {
    console.error('Error fetching submission counts:', e);
  }
};
```

- [ ] **Step 7: Landing page select('*') cleanup**

In `src/components/events/DesignStudioLanding.tsx` and `SingleEventLanding.tsx`, replace each `select('*')` with specific columns:
- Speakers: `id, full_name, title, type, bio, photo_url, social_links`
- Sessions: `id, title, description, start_time, end_time, location, status, speaker_ids`
- Tickets: `id, name, price, currency, quantity_available, quantity_sold, status, description`
- Sponsors: `id, name, tier, logo_url, website_url, description, sort_order`
- Exhibitors: `id, company_name, description, logo_url, booth_number, website_url`

- [ ] **Step 8: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "perf: add pagination, query limits, chunked CSV export, fix N+1 query"
```

---

## Task 5: Phase 5 — Polling → Supabase Realtime

**Files:**
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/components/messaging/UserMessagesCenter.tsx`
- Modify: `src/components/networking/UserB2BCenter.tsx`

- [ ] **Step 1: Notifications — replace polling with Realtime**

In `src/hooks/useNotifications.ts`:

1. Add imports: `import { useEffect } from 'react';` and ensure `supabase` is imported
2. Remove `refetchInterval: 10000` from the useQuery config (line 33)
3. Add Realtime subscription after the useQuery call:

```ts
useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel(`notifications:${user.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${user.id}`
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id, queryClient]);
```

- [ ] **Step 2: Messages — fix global channel**

In `src/components/messaging/UserMessagesCenter.tsx`:

1. Find the `setInterval(fetchConversations, 10000)` (around line 376) and remove it entirely
2. Find the global channel subscription (lines 391-429). Fix:
   - Remove `conversations.length` from the dependency array
   - Use a ref for the conversations list to avoid stale closures:
   ```tsx
   const conversationsRef = useRef(conversations);
   useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
   ```
   - In the global channel callback, use `conversationsRef.current` instead of `conversations`

- [ ] **Step 3: B2B Networking — replace polling**

In `src/components/networking/UserB2BCenter.tsx`:

1. Remove `window.setInterval(loadNetworkingData, 15000)` (around line 983)
2. Add user filter to meetings queries at lines 205-206:
   ```ts
   supabase.from(MEETINGS_TABLE).select('*').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
   ```
3. Remove `console.log('[Networking] START LOAD')` at line 178
4. Add a Realtime subscription:
```ts
useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel(`b2b:${user.id}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: MATCHES_TABLE,
      filter: `profile_id=eq.${user.id}`
    }, () => loadNetworkingData())
    .on('postgres_changes', {
      event: '*', schema: 'public', table: REQUESTS_TABLE,
      filter: `recipient_id=eq.${user.id}`
    }, () => loadNetworkingData())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

- [ ] **Step 4: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "perf: replace polling with Supabase Realtime for notifications, messages, B2B"
```

---

## Task 6: Phase 6 — Remaining select('*') + Indexes

**Files:**
- Modify: `src/hooks/useProfile.ts`
- Modify: `src/pages/06_Event_Management_Dashboard.tsx`
- Modify: `src/components/networking/UserB2BCenter.tsx`
- Modify: `src/components/dashboard/EventScheduleTab.tsx`
- Create: `database/scripts/sql_add_enterprise_indexes.sql`
- Modify: `src/hooks/useSpeakers.ts`, `useSessions.ts`, `useTickets.ts`, `useAttendees.ts`, `useExhibitors.ts`, `useSponsors.ts`, `useEventForms.ts`

- [ ] **Step 1: Replace select('*') in useProfile.ts**

In `src/hooks/useProfile.ts`, define columns and replace all 4 `select('*')` calls:
```ts
const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, role, plan, language, job_title, company, location, bio, phone, website, linkedin_url, professional_data, b2b_profile, industry, interests, created_at, updated_at';
const EDUCATION_COLUMNS = 'id, profile_id, institution, degree, field_of_study, start_date, end_date, description';
const CERTIFICATION_COLUMNS = 'id, profile_id, name, issuer, issue_date, expiry_date, credential_url';
```

- [ ] **Step 2: Replace select('*') in Event Management Dashboard**

In `src/pages/06_Event_Management_Dashboard.tsx`, find the event fetch query and replace `select('*')` with:
```ts
.select('id, name, description, start_date, end_date, location, status, event_type, cover_image_url, branding_settings, owner_id, is_public, created_at, updated_at, moderation_status')
```

- [ ] **Step 3: Replace select('*') in UserB2BCenter**

In `src/components/networking/UserB2BCenter.tsx`, replace all 7 `select('*')` calls with specific columns for each table. Read each query to determine which columns are used downstream.

- [ ] **Step 4: Replace select('*') in EventScheduleTab**

Replace with: `.select('id, title, description, start_time, end_time, location, status, speaker_ids, type')`

- [ ] **Step 5: Add updated_at to sponsors columns**

In `src/hooks/useSponsors.ts`, find the `SPONSORS_COLUMNS` constant and add `updated_at`:
```ts
const SPONSORS_COLUMNS = 'id, name, tier, website_url, logo_url, description, event_id, status, contribution_amount, benefits, notes, sort_order, updated_at';
```

- [ ] **Step 6: Create enterprise indexes SQL**

Create `database/scripts/sql_add_enterprise_indexes.sql`:
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

- [ ] **Step 7: Add event-stats cache invalidation to all mutation hooks**

In each of these hooks, after every create/update/delete mutation succeeds, add:
```ts
queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
```

Hooks: `useSpeakers.ts`, `useSessions.ts`, `useTickets.ts`, `useAttendees.ts`, `useExhibitors.ts`, `useSponsors.ts`, `useEventForms.ts`

- [ ] **Step 8: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "perf: eliminate remaining select(*), add enterprise indexes, fix stats cache"
```

---

## Task 7: Phase 7 — Code Cleanup

**Files:**
- Modify: `package.json`
- Delete: `src/pages/SchemaInspector.tsx`
- Delete: `src/pages/EventCreationWizard.tsx`
- Delete: `src/pages/04_Wizard_Step2_Design.tsx`
- Delete: `src/components/wizard/CustomFormsTabsOld.tsx`
- Modify: `src/utils/navigation.ts` (if it references deleted files)
- Modify: `src/components/ui/sonner.tsx`

- [ ] **Step 1: Remove dead dependencies + pin wildcards**

In `package.json`:
- Remove `"docker": "^1.0.0"` and `"resend": "^4.1.1"` from dependencies
- Move `"@types/dompurify": "^3.0.5"` to devDependencies
- Pin wildcard versions — first check resolved versions:
```bash
npm ls react-router-dom clsx tailwind-merge dnd-core react-dnd react-dnd-html5-backend
```
Then replace `"*"` with the resolved `"^X.Y.Z"` versions.

- [ ] **Step 2: Delete dead code files**

First check for references to each file:
```bash
grep -r "SchemaInspector" src/ --include="*.tsx" --include="*.ts"
grep -r "EventCreationWizard" src/ --include="*.tsx" --include="*.ts"
grep -r "04_Wizard_Step2_Design" src/ --include="*.tsx" --include="*.ts"
grep -r "CustomFormsTabsOld" src/ --include="*.tsx" --include="*.ts"
```

Remove any import references found (especially in `src/utils/navigation.ts` and `src/App.tsx`), then delete:
- `src/pages/SchemaInspector.tsx`
- `src/pages/EventCreationWizard.tsx`
- `src/pages/04_Wizard_Step2_Design.tsx`
- `src/components/wizard/CustomFormsTabsOld.tsx`

- [ ] **Step 3: Replace next-themes with hardcoded dark theme**

In `src/components/ui/sonner.tsx`, find:
```tsx
import { useTheme } from 'next-themes@0.4.6';
```
Replace the import and usage:
```tsx
// Removed next-themes — app uses fixed dark theme
const theme = 'dark';
```
Remove any `const { theme } = useTheme();` call.

Then remove `"next-themes": "^0.4.6"` from `package.json`.

- [ ] **Step 4: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "chore: remove dead deps, pin versions, delete dead code, replace next-themes"
```

---

## Task 8: Phase 8 — ESLint/Prettier + Accessibility

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Modify: `package.json` (add lint script + dev deps)
- Modify: CSS files for color contrast
- Modify: Layout components for semantic HTML

- [ ] **Step 1: Install ESLint + Prettier dev dependencies**

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier typescript
```

- [ ] **Step 2: Create ESLint config**

Create `eslint.config.js`:
```js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },
];
```

- [ ] **Step 3: Create Prettier config**

Create `.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true
}
```

Add to `package.json` scripts: `"lint": "eslint src/"`

- [ ] **Step 4: Fix color contrast**

Search for `#0684F5` across the codebase:
```bash
grep -rn "#0684F5" src/ index.html
```

Replace all instances with `#3B9EFF` (which passes WCAG AA 4.5:1 on `#0B2641`). Use CSS variable `var(--accent-blue)` where possible — define it in `src/index.css`:
```css
:root {
  --accent-blue: #3B9EFF;
}
```

- [ ] **Step 5: Add semantic HTML basics**

This is a targeted improvement, not a full rewrite:
- In main layout wrappers, replace outer `<div>` with `<main>`
- Add `aria-label` to icon-only buttons (search for `<button` with only an icon child and no text)
- In `UserMessagesCenter.tsx`, add `aria-live="polite"` to the message list container

- [ ] **Step 6: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "feat: add ESLint/Prettier, fix WCAG contrast, add semantic HTML"
```

---

## Task 9: Phase 9 — Component Splitting

> **Note:** This is the largest task. Each sub-component extraction should be done carefully — read the full file first, identify logical sections, extract one at a time.

**Files:**
- Split: `src/components/dashboard/EventExhibitorsTab.tsx` (4,288 lines)
- Split: `src/components/dashboard/EventSpeakersTab.tsx` (4,249 lines)
- Split: `src/components/dashboard/EventB2BMatchmakingTab.tsx` (3,654 lines)
- Split: `src/pages/09_My_Profile.tsx` (3,807 lines)

- [ ] **Step 1: Split EventExhibitorsTab**

Read the full file. Identify logical sections (list view, form/modal, detail view, filters). Extract each into:
- `src/components/dashboard/exhibitors/ExhibitorsList.tsx`
- `src/components/dashboard/exhibitors/ExhibitorForm.tsx`
- `src/components/dashboard/exhibitors/ExhibitorDetails.tsx`
- `src/components/dashboard/exhibitors/ExhibitorFilters.tsx`

The main `EventExhibitorsTab.tsx` should become an orchestrator file < 300 lines that imports and renders these sub-components.

- [ ] **Step 2: Split EventSpeakersTab**

Same pattern:
- `src/components/dashboard/speakers/SpeakersList.tsx`
- `src/components/dashboard/speakers/SpeakerForm.tsx`
- `src/components/dashboard/speakers/SpeakerDetails.tsx`
- `src/components/dashboard/speakers/SpeakerFilters.tsx`

- [ ] **Step 3: Split EventB2BMatchmakingTab**

Extract into:
- `src/components/dashboard/b2b/MatchmakingDashboard.tsx`
- `src/components/dashboard/b2b/MatchmakingSettings.tsx`
- `src/components/dashboard/b2b/MeetingScheduler.tsx`
- `src/components/dashboard/b2b/MatchList.tsx`

Also eliminate the `setInterval` polling (line ~1112) — it should use Realtime or React Query.
Replace `useState` + `useEffect` data fetching with React Query hooks where possible.

- [ ] **Step 4: Split 09_My_Profile**

Extract into:
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/ProfileDetails.tsx`
- `src/components/profile/ProfileEducation.tsx`
- `src/components/profile/ProfileCertifications.tsx`
- `src/components/profile/ProfileSettings.tsx`
- `src/components/profile/TwoFactorSetup.tsx`

- [ ] **Step 5: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "refactor: split mega-components into focused sub-components"
```

---

## Task 10: Phase 10 — Data Integrity + Resilience

**Files:**
- Create: `database/scripts/sql_atomic_ticket_increment.sql`
- Modify: `src/hooks/useSponsors.ts`
- Modify: `src/hooks/useAttendees.ts`
- Modify: `src/utils/storage.ts`
- Modify: `src/components/messaging/UserMessagesCenter.tsx`

- [ ] **Step 1: Create atomic ticket increment RPC**

Create `database/scripts/sql_atomic_ticket_increment.sql`:
```sql
CREATE OR REPLACE FUNCTION increment_ticket_sold(p_ticket_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE event_tickets
  SET quantity_sold = COALESCE(quantity_sold, 0) + 1
  WHERE id = p_ticket_id
  AND (quantity_available IS NULL OR COALESCE(quantity_sold, 0) < quantity_available);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket sold out or not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Find any code that manually increments `quantity_sold` and replace with:
```ts
const { error } = await supabase.rpc('increment_ticket_sold', { p_ticket_id: ticketId });
```

- [ ] **Step 2: Add optimistic locking to sponsor reorder**

In `src/hooks/useSponsors.ts`, in the reorder function:
1. Before issuing updates, fetch current `updated_at` for each sponsor
2. Include `.eq('updated_at', expectedTimestamp)` in each update
3. If any update returns 0 rows, it means a conflict — refetch sponsors and notify user

- [ ] **Step 3: Fix storage cache-buster**

In `src/utils/storage.ts`, the `uploadFile` function at line 81:
```ts
return `${publicUrl}?t=${Date.now()}`;
```
The cache-buster is fine for upserts (replacements). Since `upsert: true` is always used in this function, keep it. However, document the rationale with a comment:
```ts
// Cache-buster needed because upsert replaces files at the same path.
// The timestamp is stored in DB, not regenerated on each page load.
return `${publicUrl}?t=${Date.now()}`;
```

- [ ] **Step 4: Verify build and commit**

Run: `npx vite build`

```bash
git add -A
git commit -m "feat: atomic ticket increment, optimistic locking, data integrity improvements"
```

---

## Final Step: Push Everything

- [ ] **Push all commits**

```bash
git push origin main
```

- [ ] **Remind user about SQL scripts to run in Supabase**

The following SQL scripts need to be run manually in the Supabase SQL Editor:
1. `database/scripts/sql_add_enterprise_indexes.sql` — 6 new indexes
2. `database/scripts/sql_form_submission_counts_rpc.sql` — RPC for form counts
3. `database/scripts/sql_atomic_ticket_increment.sql` — atomic ticket increment

---

## Summary

| Task | Phase | Commit Message | Key Changes |
|------|-------|---------------|-------------|
| 1 | Security | `security: sanitize XSS vectors...` | DOMPurify hardening, error sanitizer, storage fixes |
| 2 | Types + EB | `feat: add error boundary, tsconfig...` | ErrorBoundary, tsconfig, Profile type, clean imports |
| 3 | Bundle | `perf: lazy-load dashboard tabs...` | 12 lazy tabs, deferred fonts, lazy recharts/jsQR |
| 4 | Queries | `perf: add pagination, query limits...` | Server-side pagination, chunked exports, N+1 fix |
| 5 | Realtime | `perf: replace polling with Realtime...` | 3 polling intervals → Realtime subscriptions |
| 6 | select(*) | `perf: eliminate remaining select(*)...` | Column-specific queries, indexes, stats invalidation |
| 7 | Cleanup | `chore: remove dead deps...` | Dead code deleted, versions pinned, next-themes removed |
| 8 | Tooling | `feat: add ESLint/Prettier...` | Linting, color contrast, semantic HTML |
| 9 | Splitting | `refactor: split mega-components...` | 4 mega-files split into ~20 focused components |
| 10 | Integrity | `feat: atomic ticket increment...` | Atomic DB ops, optimistic locking |
