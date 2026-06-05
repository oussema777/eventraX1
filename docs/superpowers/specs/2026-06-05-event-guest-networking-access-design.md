# Event Guest Networking Access ("Invisible Event Pass")

**Date:** 2026-06-05
**Status:** Draft

## Summary

Replace the current "registration creates a full Eventra account" behavior with a
**scoped, invisible, auto-expiring guest pass**. When a registrant opts into B2B,
the magic link grants them access to **one event's networking only** — matches,
connections, meetings, and messaging — without becoming a full Eventra member.
They have no profile to manage, no account settings, no access to the rest of the
app, and the underlying **login identity is destroyed after the event**, leaving only
a PII-redacted attendance record for the organizer.

## Goals

- Event guests are **kept separate** from real Eventra members.
- Access is **scoped to only the event(s) they registered in**.
- **Minimal data**: nothing collected beyond what registration already captures; no
  user-facing profile. On expiry, retained organizer records are PII-redacted
  (see Data Retention & Redaction).
- **Not a permanent account**: the guest *login identity* (auth user + hidden profile)
  is destroyed after the event; only a PII-redacted attendance record remains.
- Guests can use **matches & connect, 1:1 messaging, and meetings**.

## Non-Goals

- Marketplace access for guests (explicitly out of scope).
- Rebuilding the B2B engine to key on `attendee_id` instead of `profile_id`.
- Changing how full Eventra members use the global networking center (`/my-networking`).
- Reminder emails / pre-event nudges (separate follow-up).
- A guest→member upgrade path (out of scope; guests are disposable).

## Key Decision: Identity Model

**Approach A — Invisible event pass (chosen).** The guest is backed by a real
Supabase auth user under the hood (so sessions, RLS, and Realtime messaging work),
but never experiences it as an account. The alternative (tokenless, zero auth
record) was rejected: it would require rebuilding the B2B engine and would make
real-time messaging hard, for the sole benefit of removing an invisible,
auto-destroyed row.

### Why a hidden profile row is required

The entire B2B engine identifies people by **`profile_id`** (`= auth.users.id`):
`b2b_matches` (`profile_id`/`matched_profile_id`), `b2b_requests`
(`sender_id`/`recipient_id`), `b2b_connections` (`profile_a_id`/`profile_b_id`),
`event_b2b_meetings` (`profile_a_id`/`profile_b_id`), and messaging (thread
participants). (`event_b2b_suggestions` is the organizer-side matchmaking table.)
For a guest to be matchable and messageable, they must have a profile to point at.

So each guest gets **one hidden, minimal `profiles` row**:
- Auto-filled from registration data only (`full_name`, `company`, `sector`,
  `company_description`, `social_url`, interests via `event_attendees.meta`).
- `app_metadata.account_type = 'event_guest'`.
- Never shown or editable by the guest. No "complete your profile" UI.
- **Excluded from every member-facing surface** (see Profiles Leak Surface).

### Profiles leak surface (hard requirement)

A `profiles` row feeds many member-facing surfaces; **every one must exclude
`account_type = 'event_guest'`** or a guest leaks into the public/member app. The plan
must enumerate and gate each, item by item — a single missed query is a privacy leak:
- Public profile page `/profile/:userId`
- People / member search & community discovery
- B2B marketplace discovery and listings
- Suggestion / match pools shown to **full members** (a guest may surface only to
  co-attendees of their shared event, never platform-wide)
- Any directory, leaderboard, or "people you may know" feature

## Architecture

### Registration flow changes (`create-event-registration` Edge Function)

1. **Account is created only when `b2b_opt_in === true`.** No opt-in → just an
   `event_attendees` row + plain confirmation email, **no auth user, no magic link**.
   (This reverses today's behavior, which creates an auth user unconditionally.)
2. On opt-in:
   - Create/lookup the `event_guest` auth user (existing logic) and the hidden
     profile (existing enrichment logic, already fixed to use real columns).
   - Stamp `guest_expires_at` on the guest (event `end_date` + grace) for cleanup.
   - Generate the magic link with redirect → **`/event/<event_id>/networking`**
     (replaces the current dead `/b2b/<event_id>` target).
3. Existing-user handling unchanged: if the email already belongs to a full member,
   link the attendee to that member and send them the link — they are **not** converted
   to a guest, and their account is never subject to guest expiry.

### The guest networking surface

- **New route:** `/event/:eventId/networking` — the only destination for a guest.
- **Content (scoped to that `event_id`):** Matches (from `event_b2b_suggestions`),
  Connections (requests sent/received/accepted), Meetings (`event_b2b_meetings`),
  Messages (`message_threads`/`messages`, 1:1 with connections).
- **Reuse where coupling permits:** `UserB2BCenter` is built for full members (global
  cross-event aggregation, profile assumptions, full-app chrome). Extract its
  match/connection/meeting/message sections into a single-event, guest-safe view.
  Treat this as a focused refactor of the shell, **not** a free filter — verify the
  component's profile/nav assumptions before committing to reuse.
- **Chrome:** minimal — event name, the four sections, sign-out. No global Eventra nav.

### Lockout / route gating

- `AuthContext` exposes `account_type` from `app_metadata`.
- A `GuestRouteGuard` confines `event_guest` sessions: the only routes they may reach
  are `/event/:eventId/networking` (and the event's public pages) for events they are
  registered in. Any other route (`/dashboard`, `/my-profile`, `/my-networking`,
  `/messages`, settings, other events) redirects back to their networking surface.
- A guest registered in multiple events may reach each of those events' surfaces, and
  only those. The guard determines the allowed event set by querying `event_attendees`
  for rows matching the session's `profile_id`.

### Access control (RLS)

Guests have a real session, so existing policies keyed on `profile_id = auth.uid()`
already cover their own suggestions/requests/meetings/threads. The new requirement is
**event-scoped cross-reads** for matching. Sketch:

- Add a SECURITY DEFINER helper `shares_event_with(target uuid) returns boolean` that
  is true when `auth.uid()` and `target` both have an `event_attendees` row for the
  same `event_id`. Back it with an index on `event_attendees(profile_id, event_id)`.
- On `profiles`, add a policy letting a guest `SELECT` **display columns only**
  (name, company, headline, avatar) of rows where `shares_event_with(profiles.id)`.
  Never expose `email`/`phone_number` through this policy.
- On the B2B tables, allow read/write only for rows whose `event_id` is one the guest
  is registered in (same predicate), in addition to the existing self-ownership policy.
- Guests get **no** read/write outside their event scope and **no** access to
  member-only tables.
- Cross-type notifications (guest → member connect/message) must be insertable; verify
  the `notifications` policy permits it (a prior insert hit RLS `42501`).

### Lifecycle / expiry

`guest_expires_at = event.end_date + 7 days`, stamped at account creation. A daily
scheduled cleanup processes guests by stage:

- **event end + 7d — block:** ban the guest auth user (Supabase `ban_duration` /
  disable sign-in). Existing magic links and sessions stop working.
- **event end + 30d — destroy + redact:** delete the guest **auth user** (removes the
  login identity, credentials, and MAU footprint); the hidden `profiles` row is removed
  with it. Counterpart B2B rows survive and degrade gracefully — the UI already renders
  a missing profile as "Unknown/Former participant." At the same step, redact PII in the
  retained `event_attendees` record (see Data Retention & Redaction).

This runs only once **all** of a multi-event guest's events have passed their windows.

**Required FK behavior (verify/set in the plan)** — so destroying a guest does not also
destroy the records we keep:
- `event_attendees.profile_id` → `ON DELETE SET NULL` (retain the attendance record,
  null the link).
- B2B `profile_*` columns — `b2b_matches.profile_id/matched_profile_id`,
  `b2b_requests.sender_id/recipient_id`, `b2b_connections.profile_a_id/profile_b_id`,
  `event_b2b_meetings.profile_a_id/profile_b_id`, `message_thread_participants` —
  → `ON DELETE SET NULL`, **never `CASCADE`**, so a counterpart's history survives
  (resolved to the `attendee_*` identity for display).

### Data retention & redaction

The organizer keeps a permanent **attendance record** per registrant (`event_attendees`)
for reporting. To honor "minimize data / not permanent," that record must not retain
personal data once the guest is destroyed:

- At **event end + 30d**, overwrite identifying fields in `event_attendees` and its
  `meta` — `email`, `phone`, `name`/`fullName`, `companyName`, `socialUrl` — with a
  redaction marker (e.g. `"[redacted]"`).
- Keep only **non-identifying** fields the organizer needs for stats: `sector`,
  `interests`, ticket/registration status, timestamps, and a stable anonymized id.
- Applies to every registrant whose guest identity is destroyed, not only B2B users.

Net effect after +30d: no login identity exists and no personal data remains — only
anonymized attendance analytics.

## Impact on Existing Systems

- **`create-event-registration`**: gated account creation, `guest_expires_at` stamp,
  redirect target change.
- **Magic-link email**: button already routes to the redirect; target updates to the
  networking surface.
- **`AuthContext`**: expose `account_type`; ensure guest sessions don't trigger
  full-member-only flows.
- **Routing (`App.tsx`)**: add `/event/:eventId/networking`; add `GuestRouteGuard`.
- **`UserB2BCenter`**: factor its sections into a single-event, guest-safe view.
- **Member-facing surfaces**: exclude `event_guest` everywhere in the Profiles Leak
  Surface checklist.
- **RLS policies**: implement the `shares_event_with` sketch + leak tests.
- **DB**: `guest_expires_at` storage, the `ON DELETE SET NULL` FK changes, the
  `event_attendees(profile_id, event_id)` index, and the scheduled cleanup job.

## Risks / Open Questions

- **RLS validation**: implement the policy sketch and leak-test it (guest sees
  co-attendee display fields only — never `email`/`phone`, never out-of-event data).
  Main correctness/perf risk.
- **FK audit (blocking plan task)**: confirm or alter the `ON DELETE SET NULL` behavior
  above before enabling destruction — otherwise deletion either fails or cascades away
  the records we mean to keep.
- **Meetings dual-key**: `event_b2b_meetings` has both `attendee_a_id/attendee_b_id`
  and `profile_a_id/profile_b_id`. Since this design keys on `profile_id`, ensure guest
  meetings populate the `profile_*` columns so guests appear in meeting views.
- **`guest_expires_at` storage**: profiles column vs a dedicated `event_guest_passes`
  table — a dedicated table is cleaner for multi-event; decide in the plan.
- **Cleanup mechanism**: pg_cron vs scheduled Edge Function — pick based on what's
  available on the project; the destroy step needs service-role privileges, so secure it.

## Testing Strategy

- New-registrant + B2B opt-in → guest created, magic link lands on
  `/event/<id>/networking`, can see matches and message a connection.
- Guest cannot reach `/dashboard`, `/my-profile`, or another event's surface.
- No-opt-in registration creates no auth user and no magic link.
- Existing full member registering is linked, not converted to a guest, and is exempt
  from expiry.
- **Leak surface**: a guest does not appear on `/profile/:userId`, search, community,
  the marketplace, or member suggestion pools.
- **RLS leak**: guest cannot read another participant's `email`/`phone`, nor any data
  for an event they are not registered in.
- **Expiry — block**: at event end + 7d, login/magic link is rejected.
- **Expiry — destroy + redact**: at +30d, the auth user/profile are gone; the
  `event_attendees`/`meta` PII fields are redaction markers while `sector`/`interests`
  remain.
- **Counterpart view**: after a guest is destroyed, a full member's past
  connection/meeting/thread with them still renders ("Former participant"), not an error.
