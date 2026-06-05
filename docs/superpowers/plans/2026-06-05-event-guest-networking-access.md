# Event Guest Networking Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn event registrants who opt into B2B into scoped, invisible, auto-expiring "guest passes" that can use one event's matchmaking/meetings/messaging — never a full Eventra account — and are destroyed (login identity) + PII-redacted (organizer record) after the event.

**Architecture:** Keep a real Supabase auth user + hidden `profiles` row per guest (the B2B engine keys on `profile_id`), but gate them to a single new event-scoped surface, hide them from every member-facing surface, scope their data access via RLS, and run a daily cleanup that bans then deletes the guest and redacts the retained `event_attendees` record.

**Tech Stack:** React + TypeScript (Vite), Supabase (Postgres + RLS + Auth admin API + Edge Functions/Deno), Playwright for e2e. Migrations are run manually in the Supabase SQL editor (no local `supabase` CLI); Edge Functions are deployed via the dashboard.

**Spec:** `docs/superpowers/specs/2026-06-05-event-guest-networking-access-design.md`

**Branch:** create `feat/event-guest-networking` off `main` before starting.

---

## File Structure

**DB (run in Supabase SQL editor; also saved to repo for record):**
- Create `supabase/migrations/2026-06-05_01_guest_fk_set_null.sql` — flip `profile_*` FKs to `ON DELETE SET NULL`.
- Create `supabase/migrations/2026-06-05_02_guest_expiry.sql` — `event_attendees.guest_expires_at` + index `event_attendees(profile_id, event_id)`.
- Create `supabase/migrations/2026-06-05_03_guest_rls.sql` — `shares_event_with()` + guest read policies.

**Edge Functions:**
- Modify `supabase/functions/create-event-registration/index.ts` — gate account creation on opt-in; stamp `guest_expires_at`.
- Create `supabase/functions/cleanup-event-guests/index.ts` — block → destroy → redact.

**Frontend:**
- Modify `src/contexts/AuthContext.tsx` — expose `accountType`.
- Create `src/components/auth/GuestRouteGuard.tsx` — confine guests.
- Modify `src/App.tsx` — add `/event/:eventId/networking` route + wrap protected routes with the guard.
- Create `src/pages/99_Event_Guest_Networking.tsx` — the single-event guest surface.
- Modify `src/components/networking/UserB2BCenter.tsx` — accept an optional `eventId` scope prop (extract a reusable single-event view).
- Modify member-facing queries for the **leak-surface checklist** (Task 9).

**Tests:**
- Create `tests/guest-networking.spec.js` — Playwright e2e for the guest flow + lockout.
- Create `supabase/migrations/_checks/guest_rls_checks.sql` — copy-paste RLS leak checks.

---

## Phase 1 — Database foundation

### Task 1: FK audit + flip `profile_*` foreign keys to `ON DELETE SET NULL`

**Files:**
- Create: `supabase/migrations/2026-06-05_01_guest_fk_set_null.sql`

- [ ] **Step 1: Inspect current FK constraints (so we don't guess)**

Run in the Supabase SQL editor and record the output:

```sql
select tc.table_name, kcu.column_name, rc.delete_rule, tc.constraint_name
from information_schema.referential_constraints rc
join information_schema.table_constraints tc on tc.constraint_name = rc.constraint_name
join information_schema.key_column_usage kcu on kcu.constraint_name = rc.constraint_name
where kcu.column_name in
  ('profile_id','matched_profile_id','sender_id','recipient_id','profile_a_id','profile_b_id')
  and tc.table_name in
  ('event_attendees','b2b_matches','b2b_requests','b2b_connections','event_b2b_meetings','message_thread_participants');
```

Expected: rows showing each FK and its current `delete_rule` (likely `NO ACTION`/`CASCADE`).

> **Real B2B table names** (confirmed in `src/components/networking/UserB2BCenter.tsx`):
> the member networking surface uses **`b2b_matches`** (`profile_id`/`matched_profile_id`),
> **`b2b_requests`** (`sender_id`/`recipient_id`), **`b2b_connections`**
> (`profile_a_id`/`profile_b_id`), **`event_b2b_meetings`**, and
> **`message_thread_participants`**. `event_b2b_suggestions` is the *organizer-side*
> table — do NOT use it for the guest surface's FKs/RLS.

- [ ] **Step 2: Write the migration to set each to `SET NULL`**

For **every** FK found in Step 1, drop and recreate it with `ON DELETE SET NULL`. Template (fill in real constraint names + referenced table/column from Step 1):

```sql
-- supabase/migrations/2026-06-05_01_guest_fk_set_null.sql
-- event_attendees.profile_id -> profiles(id)
alter table event_attendees drop constraint if exists event_attendees_profile_id_fkey;
alter table event_attendees
  add constraint event_attendees_profile_id_fkey
  foreign key (profile_id) references profiles(id) on delete set null;

-- Repeat for the REAL B2B tables (confirm exact constraint names from Step 1):
--   b2b_matches.profile_id, b2b_matches.matched_profile_id
--   b2b_requests.sender_id, b2b_requests.recipient_id
--   b2b_connections.profile_a_id, b2b_connections.profile_b_id
--   event_b2b_meetings.profile_a_id, event_b2b_meetings.profile_b_id
--   message_thread_participants.profile_id (if a FK exists)
-- Each column MUST be nullable first:
-- alter table <t> alter column <col> drop not null;
-- IMPORTANT: only the profile_* FKs get SET NULL. Do NOT touch the attendee_*
-- FKs (event_b2b_meetings.attendee_a_id/attendee_b_id) — they reference the
-- retained event_attendees rows and must keep their existing behavior.
```

- [ ] **Step 3: Run the migration in the SQL editor**

Expected: `ALTER TABLE` success for each. Re-run the Step 1 query; every `delete_rule` is now `SET NULL`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/2026-06-05_01_guest_fk_set_null.sql
git commit -m "feat(db): set profile FKs to ON DELETE SET NULL for guest cleanup"
```

---

### Task 2: Guest expiry column + index

**Files:**
- Create: `supabase/migrations/2026-06-05_02_guest_expiry.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/2026-06-05_02_guest_expiry.sql
-- Block threshold (= event end + 7d) per attendee; null for non-guests.
alter table event_attendees add column if not exists guest_expires_at timestamptz;
-- Cleanup + guard lookups by (profile, event)
create index if not exists idx_event_attendees_profile_event
  on event_attendees (profile_id, event_id);
```

- [ ] **Step 2: Run it; verify the column + index exist**

```sql
select column_name from information_schema.columns
where table_name='event_attendees' and column_name='guest_expires_at';
```
Expected: one row.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/2026-06-05_02_guest_expiry.sql
git commit -m "feat(db): add event_attendees.guest_expires_at + lookup index"
```

---

### Task 3: RLS — `shares_event_with()` + guest read policies

**Files:**
- Create: `supabase/migrations/2026-06-05_03_guest_rls.sql`
- Create: `supabase/migrations/_checks/guest_rls_checks.sql`

- [ ] **Step 1: Write the predicate + policies**

```sql
-- supabase/migrations/2026-06-05_03_guest_rls.sql
create or replace function public.shares_event_with(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from event_attendees a
    join event_attendees b on a.event_id = b.event_id
    where a.profile_id = auth.uid() and b.profile_id = target
  );
$$;

-- Guests may read DISPLAY columns of co-attendees. Enforce column scope in the
-- app query (select only name/company/headline/avatar); this policy gates ROWS.
drop policy if exists guest_read_co_attendee_profiles on profiles;
create policy guest_read_co_attendee_profiles on profiles
  for select using ( shares_event_with(id) );

-- B2B tables the guest surface (UserB2BCenter) actually reads/writes:
--   b2b_matches, b2b_requests, b2b_connections, event_b2b_meetings,
--   message_thread_participants / message_threads.
-- Add an event-scoped policy to each (in ADDITION to existing self-ownership policies).
-- Pattern for tables that carry event_id (b2b_matches, b2b_requests, b2b_connections,
-- event_b2b_meetings) — apply for SELECT and, where the surface writes, INSERT/UPDATE:
drop policy if exists guest_event_scoped_matches on b2b_matches;
create policy guest_event_scoped_matches on b2b_matches
  for select using (
    event_id in (select event_id from event_attendees where profile_id = auth.uid())
  );
-- Repeat the identical event_id-in-my-events pattern for b2b_requests, b2b_connections,
-- and event_b2b_meetings (add `with check (...)` for INSERT/UPDATE policies).
-- Messaging: message_threads / message_thread_participants are MEMBERSHIP-scoped, not
-- event_id-scoped — a guest may read/write a thread only if they are a participant
-- (participant.profile_id = auth.uid()). Reuse/verify the existing thread RLS rather
-- than adding event scoping there.
```

- [ ] **Step 2: Run it in the SQL editor**

Expected: `CREATE FUNCTION` + `CREATE POLICY` success.

- [ ] **Step 3: Write copy-paste leak checks**

```sql
-- supabase/migrations/_checks/guest_rls_checks.sql
-- Run each as the guest (set request.jwt.claim.sub via the API, or test from the app):
-- 1. Guest CAN read a co-attendee's name/company.
-- 2. Guest CANNOT read profiles.email / phone_number of anyone (verify the app query
--    never selects them; this is enforced in code, see Task 8).
-- 3. Guest CANNOT select event_b2b_suggestions for an event they are not registered in
--    (expect 0 rows).
```

- [ ] **Step 4: Verify the predicate works (two real co-attendees)**

In the SQL editor, pick two `profile_id`s that share an event and confirm:
```sql
select public.shares_event_with('<co-attendee-profile-id>');  -- run impersonating the other; expect true
```
(If impersonation is awkward in SQL, defer the true end-to-end RLS check to Task 11's e2e leak test and note that here.)

- [ ] **Step 5: Verify guests can insert cross-type notifications**

A guest connecting with / messaging a full member must be able to insert a row in
`notifications` for that member (a prior attempt hit RLS `42501`). From a guest session,
run the insert the connect/message flow performs; if denied, add/adjust the
`notifications` INSERT policy to allow an authenticated user to notify someone they
share an event with: `with check ( shares_event_with(recipient_id) )`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/2026-06-05_03_guest_rls.sql supabase/migrations/_checks/guest_rls_checks.sql
git commit -m "feat(db): event-scoped RLS for guests (shares_event_with + policies)"
```

---

## Phase 2 — Registration Edge Function

### Task 4: Gate account creation on B2B opt-in + stamp `guest_expires_at`

**Files:**
- Modify: `supabase/functions/create-event-registration/index.ts`

- [ ] **Step 1: Wrap user/profile creation in `if (b2b_opt_in)`**

In `index.ts`, the block that looks up/creates the auth user, enriches the profile, and generates the magic link currently runs for everyone. Restructure so that when `b2b_opt_in` is false: skip user lookup/creation, skip profile enrichment, set `userId = null`, skip magic link. The `event_attendees` insert still runs (with `profile_id: userId` which may be null).

- [ ] **Step 2: Compute + stamp `guest_expires_at` on the attendee insert (opt-in only)**

After fetching the event (already selects `start_date`; also select `end_date`), compute:
```ts
const endDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
const guestExpiresAt = b2b_opt_in
  ? new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  : null;
```
Add `guest_expires_at: guestExpiresAt` to the `event_attendees` insert payload.

- [ ] **Step 3: Add `end_date` to the event select**

Change the event `.select(...)` to include `end_date`.

- [ ] **Step 4: Deploy + verify both paths (non-destructive where possible)**

Deploy via dashboard. Then:
```bash
# opt-in: expect magic_link + is_new_user, and the attendee has guest_expires_at
curl -s -X POST "$FN" -H "Authorization: Bearer $ANON" -H "apikey: $ANON" \
  -H "Content-Type: application/json" -d '{...,"b2b_opt_in":true,"redirect_base":"https://eventra.cloud"}'
# no-opt-in: expect NO magic_link, and (verify via REST) no new auth user was created
curl -s -X POST "$FN" ... -d '{...,"b2b_opt_in":false}'
```
Expected: opt-in returns `magic_link`; no-opt-in returns success **without** `magic_link`. Verify the no-opt-in attendee's `guest_expires_at` is null and no profile row was created for that email. **Delete any test rows/users afterward.**

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/create-event-registration/index.ts
git commit -m "feat(registration): create guest account only on B2B opt-in; stamp guest_expires_at"
```

---

## Phase 3 — Frontend: identity, gating, surface

### Task 5: Expose `accountType` in AuthContext

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Read `account_type` from the session user's `app_metadata`**

In the auth context, derive `const accountType = session?.user?.app_metadata?.account_type ?? 'user'` and expose it on the context value + its TypeScript type. Default non-guests to `'user'`.

- [ ] **Step 2: Verify in the running app**

Run `npm run dev`, log in as a normal user, and confirm (React devtools or a temporary `console.log`) that `accountType === 'user'`. (Guest value is verified end-to-end in Task 11.)

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat(auth): expose accountType (event_guest vs user) from app_metadata"
```

---

### Task 6: `GuestRouteGuard` + the networking route

**Files:**
- Create: `src/components/auth/GuestRouteGuard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the guard**

```tsx
// src/components/auth/GuestRouteGuard.tsx
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Wraps the guest networking page. If a NON-guest hits it, let them through
// (members can view it too). If a GUEST hits any OTHER route, redirect them to
// their event networking surface. Allowed events = their event_attendees rows.
export function GuestOnlyAllowedEvents({ children }: { children: React.ReactNode }) {
  const { user, accountType } = useAuth();
  const { eventId } = useParams();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (accountType !== 'event_guest' || !user) { setAllowed(true); return; }
    supabase.from('event_attendees').select('event_id')
      .eq('profile_id', user.id).eq('event_id', eventId)
      .maybeSingle().then(({ data }) => setAllowed(!!data));
  }, [accountType, user, eventId]);

  if (allowed === null) return null; // loading
  return allowed ? <>{children}</> : <Navigate to="/" replace />;
}

// Use in the protected layout: if accountType === 'event_guest' and the route is
// NOT a /event/:id/networking they belong to, redirect to their first event surface.
```

- [ ] **Step 2: Add the route + gate the rest of the app for guests**

In `src/App.tsx`: add `<Route path="/event/:eventId/networking" element={<GuestOnlyAllowedEvents><EventGuestNetworkingPage/></GuestOnlyAllowedEvents>} />` (lazy import the page). In the **protected** routes block, add a check at the top of the authenticated layout: if `accountType === 'event_guest'`, redirect any path not matching their networking surface to it (look up their first `event_attendees.event_id`).

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expected: `✓ built in …` (Windows exit code may be 1; confirm the "built in" line).

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/GuestRouteGuard.tsx src/App.tsx
git commit -m "feat(routing): event guest route guard + /event/:id/networking route"
```

---

### Task 7: Single-event guest networking surface

**Files:**
- Modify: `src/components/networking/UserB2BCenter.tsx`
- Create: `src/pages/99_Event_Guest_Networking.tsx`

- [ ] **Step 1: Read UserB2BCenter to map its coupling**

Identify where it (a) queries by `user.id` across all events, (b) renders matches/connections/meetings/messages, (c) assumes full-app chrome/nav. Note which sections can take an `eventId` filter vs. need the global nav stripped.

- [ ] **Step 2: Add an optional `eventId` scope prop**

Thread an optional `eventId?: string` into UserB2BCenter (or extract its four section components). When `eventId` is set: filter every query with `.eq('event_id', eventId)`, and render **only** the matches/connections/meetings/messages sections — no global nav/sidebar. Select **display columns only** for other participants (`name, company, headline, avatar`) — never `email`/`phone_number`.

- [ ] **Step 3: Build the guest page shell**

```tsx
// src/pages/99_Event_Guest_Networking.tsx
import { useParams } from 'react-router-dom';
import UserB2BCenter from '../components/networking/UserB2BCenter';
// Minimal chrome: event name header + sign out + <UserB2BCenter eventId={eventId} guest />
```
The page shows only the event's networking, a header with the event name, and a sign-out button. No links to the rest of Eventra.

- [ ] **Step 4: Verify build + render**

`npx vite build` (expect "built in"). Then `npm run dev` and load `/event/<a-real-event-id>/networking` while logged in as a normal member — confirm it renders the four sections scoped to that event with minimal chrome.

- [ ] **Step 5: Commit**

```bash
git add src/components/networking/UserB2BCenter.tsx src/pages/99_Event_Guest_Networking.tsx
git commit -m "feat(networking): single-event guest networking surface"
```

---

### Task 8: Point the magic link at the new surface

**Files:**
- Modify: `supabase/functions/create-event-registration/index.ts` (already redirects to `/event/<id>/networking` from the earlier email fix — verify only)

- [ ] **Step 1: Confirm the redirect target**

Verify the function's `redirectUrl` is `${base}/event-auth?redirect=/event/${event_id}/networking`. (The earlier fix set `/event/<id>/networking` directly; if it still says `/b2b/`, update it.) The `/event-auth` bridge already forwards to the `redirect` param.

- [ ] **Step 2: Confirm `/event-auth` allows the redirect**

`isValidRedirectUrl` in `src/utils/security.ts` already returns true for any relative path starting with `/`, so `/event/<id>/networking` is accepted — confirm this still holds (no allowlist change expected).

- [ ] **Step 3: Deploy + commit (if changed)**

```bash
git add supabase/functions/create-event-registration/index.ts
git commit -m "fix(registration): magic link targets /event/:id/networking"
```

---

## Phase 4 — Leak surface + lifecycle

### Task 9: Exclude `event_guest` from member-facing surfaces

**Files (modify each query that lists/searches profiles):**
- `src/pages/27_B2B_Marketplace_Discovery.tsx` / `src/components/marketplace/B2BMarketplaceDiscovery.tsx`
- community/people discovery (`CommunityPeopleDiscovery`)
- public profile page (`src/pages/...PublicProfilePage`)
- any member search / "people you may know" / suggestion pools for full members

- [ ] **Step 1: Find every member-facing profiles read**

Run: `git grep -n "from('profiles')" src/ | grep -v node_modules` and triage which are member-facing (lists/search/public) vs. self/own.

- [ ] **Step 2: Add `.neq('account_type','event_guest')` (or `.eq('account_type','user')`) to each member-facing query**

For the public profile page, also block direct access: if the requested profile is `event_guest`, render Not Found.

- [ ] **Step 3: Verify**

`npx vite build` + manual: confirm a known `event_guest` profile does NOT appear in marketplace/community/search and 404s on `/profile/<guest-id>`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(privacy): hide event_guest profiles from all member-facing surfaces"
```

---

### Task 10: Cleanup job — block, destroy, redact

**Files:**
- Create: `supabase/functions/cleanup-event-guests/index.ts`
- Create: `supabase/migrations/2026-06-05_04_cleanup_cron.sql`

- [ ] **Step 1: Write the cleanup Edge Function (service role)**

```ts
// supabase/functions/cleanup-event-guests/index.ts  (Deno; service role)
// Daily run:
//  BLOCK   guests whose every event_attendees.guest_expires_at <= now()  -> auth.admin.updateUserById(id,{ban_duration:'876000h'})
//  DESTROY guests whose every guest_expires_at <= now() - 23 days (= event end +30d):
//          - redact event_attendees PII (name, email; meta.email/phone/fullName/companyName/socialUrl -> '[redacted]')
//          - auth.admin.deleteUser(id)   (cascades hidden profile; FKs are SET NULL)
// "Guest" = profiles.app_metadata.account_type = 'event_guest'. Only act when ALL of a
// user's attendee rows have passed the relevant threshold.
```
Provide the full implementation: query guest profile ids, group their `event_attendees` rows, compute max(guest_expires_at), branch into block vs destroy, redact via SQL update, call the admin API. Guard with a shared secret header so only cron can invoke it.

- [ ] **Step 2: Deploy the function (dashboard)**

- [ ] **Step 3: Schedule it daily via pg_cron + pg_net**

```sql
-- supabase/migrations/2026-06-05_04_cleanup_cron.sql
-- Requires pg_cron + pg_net (enable in Database > Extensions).
select cron.schedule('cleanup-event-guests','0 3 * * *', $$
  select net.http_post(
    url := 'https://kvfoswfaifxqnjqhftwc.supabase.co/functions/v1/cleanup-event-guests',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<SECRET>')
  );
$$);
```
If pg_cron/pg_net are unavailable on the plan, fall back to an external daily trigger; note which was used.

- [ ] **Step 4: Verify with a simulated past event (non-destructive dry run first)**

Create a throwaway guest + attendee with `guest_expires_at` in the past. Invoke the function with a `dry_run` flag that logs intended actions without executing. Confirm it targets the right rows, then run for real and verify: auth user gone, `event_attendees` retained with PII redacted and `sector`/`interests` intact. Clean up.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/cleanup-event-guests/index.ts supabase/migrations/2026-06-05_04_cleanup_cron.sql
git commit -m "feat(lifecycle): daily guest cleanup (block -> destroy + redact)"
```

---

## Phase 5 — End-to-end verification

### Task 11: Playwright e2e + RLS leak tests

**Files:**
- Create: `tests/guest-networking.spec.js`

- [ ] **Step 1: Write the e2e spec (run against the deployed app or local dev)**

Cover, each as its own assertion:
1. Register + B2B opt-in → guest created; magic-link action_link redirect param is `/event/<id>/networking`.
2. Authenticated as the guest: `/event/<id>/networking` renders matches/connections/meetings/messages.
3. Guest navigating to `/dashboard`, `/my-profile`, `/my-networking`, or another event's `/event/<other>/networking` → redirected away.
4. Guest's profile does NOT appear on `/profile/<id>`, marketplace, or community.
5. No-opt-in registration → no `magic_link`, no auth user.

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/guest-networking.spec.js`
Expected: all pass. (Use a `+regtestN` alias; delete created guests after.)

- [ ] **Step 3: RLS leak check**

From a guest session token, attempt to read `profiles.email` of a co-attendee and `event_b2b_suggestions` for a non-registered event via REST; expect redacted/empty. Document results.

- [ ] **Step 4: Commit**

```bash
git add tests/guest-networking.spec.js
git commit -m "test(e2e): event guest networking flow + lockout + leak checks"
```

---

## Done criteria
- B2B opt-in registrant lands on `/event/:id/networking`, can match/meet/message within that event only.
- No-opt-in registrant creates zero auth users.
- Guests are absent from every member-facing surface; RLS denies out-of-event and email/phone reads.
- At event end +7d access is blocked; at +30d the guest login identity is deleted and the `event_attendees` PII is redacted while non-identifying stats remain.
