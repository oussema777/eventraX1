# Event Guest Networking Access ("Invisible Event Pass")

**Date:** 2026-06-05
**Status:** Draft

## Summary

Replace the current "registration creates a full Eventra account" behavior with a
**scoped, invisible, auto-expiring guest pass**. When a registrant opts into B2B,
the magic link grants them access to **one event's networking only** — matches,
connections, meetings, and messaging — without becoming a full Eventra member.
They have no profile to manage, no account settings, no access to the rest of the
app, and the underlying identity is deleted after the event.

## Goals

- Event guests are **kept separate** from real Eventra members.
- Access is **scoped to only the event(s) they registered in**.
- **Minimal data**: nothing collected beyond what registration already captures; no
  user-facing profile.
- **Not a permanent account**: the guest identity auto-expires and is deleted after
  the event.
- Guests can use **matches & connect, 1:1 messaging, and meetings**.

## Non-Goals

- Marketplace access for guests (explicitly out of scope).
- Rebuilding the B2B engine to key on `attendee_id` instead of `profile_id`.
- Changing how full Eventra members use the global networking center (`/my-networking`).
- Reminder emails / pre-event nudges (separate follow-up).

## Key Decision: Identity Model

**Approach A — Invisible event pass (chosen).** The guest is backed by a real
Supabase auth user under the hood (so sessions, RLS, and Realtime messaging work),
but never experiences it as an account. The alternative (tokenless, zero auth
record) was rejected: it would require rebuilding the B2B engine and would make
real-time messaging hard, for the sole benefit of removing an invisible,
auto-deleted row.

### Why a hidden profile row is required

The entire B2B engine identifies people by **`profile_id`** (`= auth.users.id`):
`event_b2b_suggestions` (`profile_id`/`matched_profile_id`), connection requests
(`sender_id`/`recipient_id`), `event_b2b_meetings` (`profile_a_id`/`profile_b_id`),
and messaging (thread participants). For a guest to be matchable and messageable,
they must have a profile to point at.

So each guest gets **one hidden, minimal `profiles` row**:
- Auto-filled from registration data only (`full_name`, `company`, `sector`,
  `company_description`, `social_url`, interests via `event_attendees.meta`).
- `app_metadata.account_type = 'event_guest'`.
- Never shown or editable by the guest. No "complete your profile" UI.
- Excluded from real member lists / community discovery.

## Architecture

### Registration flow changes (`create-event-registration` Edge Function)

1. **Account is created only when `b2b_opt_in === true`.** No opt-in → just an
   `event_attendees` row + plain confirmation email, **no auth user, no magic link**.
2. On opt-in:
   - Create/lookup the `event_guest` auth user (existing logic) and the hidden
     profile (existing enrichment logic, already fixed to use real columns).
   - Stamp `guest_expires_at` on the guest (event `end_date` + grace) for cleanup.
   - Generate the magic link with redirect → **`/event/<event_id>/networking`**
     (replaces the current dead `/b2b/<event_id>` target).
3. Existing-user handling unchanged: if the email already belongs to a full member,
   link the attendee to that member and send them the link — they are not converted
   to a guest.

### The guest networking surface

- **New route:** `/event/:eventId/networking` — the only destination for a guest.
- **Content (scoped to that `event_id`):** Matches (from `event_b2b_suggestions`),
  Connections (requests sent/received/accepted), Meetings (`event_b2b_meetings`),
  Messages (`message_threads`/`messages`, 1:1 with connections).
- **Reuse:** assembled from existing `UserB2BCenter` components, filtered to a single
  event rather than aggregating across events. No from-scratch page.
- **Chrome:** minimal — event name, the four sections, sign-out. No global Eventra nav.

### Lockout / route gating

- `AuthContext` exposes `account_type` from `app_metadata`.
- A `GuestRouteGuard` confines `event_guest` sessions: the only routes they may reach
  are `/event/:eventId/networking` (and the event's public pages) for events they are
  registered in. Any other route (`/dashboard`, `/my-profile`, `/my-networking`,
  `/messages`, settings, other events) redirects back to their networking surface.
- A guest registered in multiple events may reach each of those events' surfaces, and
  only those.

### Access control (RLS)

- Guests have a real session, so existing RLS that checks `profile_id = auth.uid()`
  works for their own suggestions/requests/meetings/threads.
- Guests must be able to **read minimal display info** (name, company, headline) of
  other participants in the **same event** for matching — verify/extend RLS so a
  guest can read co-attendees of their event(s) but **not** arbitrary members or data
  outside their event.
- Guests must **not** be able to write or read outside their event scope.

### Lifecycle / expiry

- `guest_expires_at = event.end_date + 7 days` → after this, login/magic links stop
  working (access blocked).
- A scheduled cleanup (pg_cron or scheduled Edge Function) runs daily:
  - **event end + 7d:** disable the guest auth user (ban / block sign-in).
  - **event end + 30d:** delete the guest auth user + hidden profile entirely.
- The `event_attendees` row is **retained** so the organizer keeps registration and
  networking history for reporting.
- A guest registered in multiple events expires only once all their events have passed
  their windows.

## Impact on Existing Systems

- **`create-event-registration`**: gated account creation, `guest_expires_at` stamp,
  redirect target change.
- **Magic-link email**: button already routes to the redirect; target updates to the
  networking surface.
- **`AuthContext`**: expose `account_type`; ensure guest sessions don't trigger
  full-member-only flows.
- **Routing (`App.tsx`)**: add `/event/:eventId/networking`; add `GuestRouteGuard`.
- **`UserB2BCenter`**: factor its sections so they can render for a single event.
- **RLS policies**: add/verify event-scoped read access for guests.
- **New**: scheduled cleanup job + `guest_expires_at` column on the guest record
  (profile or a dedicated `event_guest_passes` table — TBD in plan).

## Risks / Open Questions

- **RLS scoping** is the main risk: guests must see co-attendees for matching without
  leaking member data. Needs careful policy design and testing.
- **Deletion cascade**: deleting the guest auth user must cleanly remove the hidden
  profile and orphaned B2B rows without breaking the retained `event_attendees` record
  or the other party's view of a past connection. Define cascade/retention precisely
  in the plan.
- **Where `guest_expires_at` lives** (profiles column vs a `event_guest_passes` table)
  — decide in the implementation plan; a dedicated table is cleaner for multi-event.
- **Cleanup mechanism**: pg_cron vs scheduled Edge Function — pick based on what's
  already available on the project.

## Testing Strategy

- New-registrant + B2B opt-in → guest created, magic link lands on
  `/event/<id>/networking`, can see matches and message a connection.
- Guest cannot reach `/dashboard`, `/my-profile`, or another event's surface.
- No-opt-in registration creates no auth user and no magic link.
- Existing full member registering is linked, not converted to a guest.
- Expiry: simulate event end + 7d (blocked) and + 30d (deleted); attendee record
  retained.
- RLS: guest can read co-attendee display info but not out-of-event data.
