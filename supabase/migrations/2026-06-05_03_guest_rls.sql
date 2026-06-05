-- =============================================================================
-- Migration: 2026-06-05_03_guest_rls.sql
-- Purpose  : Give event "guests" (and any authenticated user) scoped,
--            event-limited access for B2B networking via Row-Level Security.
--
--            Event registrants who opt into B2B get a real-but-hidden Supabase
--            auth user + `profiles` row (app_metadata.account_type='event_guest'),
--            scoped to a single event's networking. The B2B engine keys on
--            profile_id = auth.uid(). These policies let a caller:
--              * read minimal display info of CO-ATTENDEES of the same event
--                (for matching), and
--              * read/write B2B rows ONLY for events they are registered in.
--            Never arbitrary members, never out-of-event data, and never other
--            users' email/phone (that exclusion lives in application queries —
--            RLS is row-level, not column-level here).
--
-- DESIGN: every policy below is ADDITIVE (a new, named, PERMISSIVE policy).
--   We do NOT drop/replace pre-existing policies and we do NOT touch the
--   ENABLE/FORCE ROW LEVEL SECURITY state of any table. Postgres OR-combines
--   permissive policies for a command, so these only ever GRANT additional
--   visibility on top of whatever already exists.
--
-- IDEMPOTENT: each object is dropped-if-exists then created, so the file is
--   safe to re-run.
--
-- ASSUMPTIONS (adjust here if your schema differs):
--   * event_attendees has columns (profile_id uuid, event_id uuid) — confirmed
--     in 2026-06-05_02_guest_expiry.sql (idx_event_attendees_profile_event).
--   * b2b_matches / b2b_requests / b2b_connections / event_b2b_meetings each
--     have an `event_id uuid` column — confirmed via
--     src/components/networking/UserB2BCenter.tsx (every row carries event_id).
--   * profiles primary key column is `id`.
--   * notifications has a `recipient_id uuid` column — confirmed via
--     src/lib/notifications.ts (insert payload uses recipient_id).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Helper: shares_event_with(target)
--    TRUE when the current caller (auth.uid()) and `target` are both attendees
--    of at least one common event. SECURITY DEFINER so the membership lookup
--    inside event_attendees is not itself blocked by RLS, and STABLE so the
--    planner may cache it within a statement. search_path is pinned to public
--    to prevent search_path hijacking on a SECURITY DEFINER function.
-- -----------------------------------------------------------------------------
create or replace function public.shares_event_with(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from event_attendees a
    join event_attendees b on a.event_id = b.event_id
    where a.profile_id = auth.uid()
      and b.profile_id = target
  );
$$;


-- -----------------------------------------------------------------------------
-- 2. profiles: let a caller SELECT co-attendee profile ROWS.
--    This is ROW-level visibility only. The application MUST continue to select
--    just display columns (full_name, job_title, company, avatar_url, ...).
--    IMPORTANT: email and phone must NEVER be exposed through app queries for
--    co-attendees — this policy does not, and cannot, restrict columns, so that
--    guarantee is enforced in application code (and verified in _checks).
-- -----------------------------------------------------------------------------
drop policy if exists guest_read_co_attendee_profiles on public.profiles;
create policy guest_read_co_attendee_profiles
  on public.profiles
  for select
  to authenticated
  using ( public.shares_event_with(id) );


-- -----------------------------------------------------------------------------
-- 3. Real member B2B tables: scope rows to events the caller is registered in.
--    Predicate (shared across all four tables):
--      event_id in (select event_id from event_attendees where profile_id = auth.uid())
--    SELECT is added for all four. INSERT/UPDATE are added only for the tables
--    the networking UI writes (b2b_requests, b2b_connections, event_b2b_meetings);
--    b2b_matches is engine/server-generated and gets SELECT only.
-- -----------------------------------------------------------------------------

-- ---- b2b_matches (read-only for the caller) ----
drop policy if exists guest_b2b_matches_select on public.b2b_matches;
create policy guest_b2b_matches_select
  on public.b2b_matches
  for select
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

-- ---- b2b_requests (read + write) ----
drop policy if exists guest_b2b_requests_select on public.b2b_requests;
create policy guest_b2b_requests_select
  on public.b2b_requests
  for select
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_b2b_requests_insert on public.b2b_requests;
create policy guest_b2b_requests_insert
  on public.b2b_requests
  for insert
  to authenticated
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_b2b_requests_update on public.b2b_requests;
create policy guest_b2b_requests_update
  on public.b2b_requests
  for update
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  )
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

-- ---- b2b_connections (read + write) ----
drop policy if exists guest_b2b_connections_select on public.b2b_connections;
create policy guest_b2b_connections_select
  on public.b2b_connections
  for select
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_b2b_connections_insert on public.b2b_connections;
create policy guest_b2b_connections_insert
  on public.b2b_connections
  for insert
  to authenticated
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_b2b_connections_update on public.b2b_connections;
create policy guest_b2b_connections_update
  on public.b2b_connections
  for update
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  )
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

-- ---- event_b2b_meetings (read + write) ----
drop policy if exists guest_event_b2b_meetings_select on public.event_b2b_meetings;
create policy guest_event_b2b_meetings_select
  on public.event_b2b_meetings
  for select
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_event_b2b_meetings_insert on public.event_b2b_meetings;
create policy guest_event_b2b_meetings_insert
  on public.event_b2b_meetings
  for insert
  to authenticated
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );

drop policy if exists guest_event_b2b_meetings_update on public.event_b2b_meetings;
create policy guest_event_b2b_meetings_update
  on public.event_b2b_meetings
  for update
  to authenticated
  using (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  )
  with check (
    event_id in (
      select event_id from event_attendees where profile_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 4. Messaging: message_threads / message_thread_participants
--    These are MEMBERSHIP-scoped, NOT event-scoped. A guest may access a thread
--    only if they are a participant of it (profile_id = auth.uid()). Do NOT add
--    event scoping here — it would either over-grant (any co-attendee thread)
--    or conflict with the membership model.
--
--    ACTION REQUIRED (no change made by this migration): reuse / verify the
--    EXISTING participant-based policies on these two tables. They should:
--      * message_thread_participants: allow a row only when profile_id = auth.uid()
--      * message_threads: allow a thread only when EXISTS a participant row for
--        that thread with profile_id = auth.uid().
--    If those policies already exist (they should, since DM works today), no
--    further action is needed and guests inherit them automatically.
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- 5. notifications: let an authenticated caller INSERT a notification for a
--    person they share an event with (e.g. connection request / meeting alerts).
--    This is additive and INSERT-only; it does not widen who can READ
--    notifications.
--
--    ASSUMPTION: the recipient column is `recipient_id` (confirmed in
--    src/lib/notifications.ts). If your column is named differently, rename it
--    in the with check () clause below.
-- -----------------------------------------------------------------------------
drop policy if exists guest_notify_co_attendee on public.notifications;
create policy guest_notify_co_attendee
  on public.notifications
  for insert
  to authenticated
  with check ( public.shares_event_with(recipient_id) );
