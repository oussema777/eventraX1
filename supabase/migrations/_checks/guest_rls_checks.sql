-- =============================================================================
-- guest_rls_checks.sql  —  COPY-PASTE LEAK TEST for 2026-06-05_03_guest_rls.sql
--
-- These are MANUAL checks. Run them in the Supabase SQL editor (or psql) AFTER
-- applying the migration. They are NOT run automatically by any migration.
--
-- The goal is to confirm event-scoping holds:
--   (A) A guest CAN read a co-attendee's display info (name / company).
--   (B) A guest CANNOT read another event's b2b_matches (expect 0 rows).
--   (C) Reminder: email/phone exclusion is enforced in APP code, not RLS.
--
-- HOW TO IMPERSONATE A GUEST
--   RLS predicates call auth.uid(). To exercise them you must run AS that user.
--   Easiest: log in to the app as the guest and watch the network tab, OR run
--   the queries below inside a transaction that sets the auth claims, e.g.:
--
--     begin;
--       set local role authenticated;
--       -- set the guest's auth user id (the profile_id that == auth.uid()):
--       set local request.jwt.claims = '{"sub":"<GUEST_PROFILE_UUID>","role":"authenticated"}';
--       -- ... run a check query here ...
--     rollback;
--
--   Replace <GUEST_PROFILE_UUID> with the guest's profiles.id (= auth user id).
--   Use rollback so nothing is mutated.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Pick your fixtures (look these up once, as a privileged/service role).
--    You need:
--      * GUEST_PROFILE_UUID  — a profile that is an attendee of EVENT_A only
--      * EVENT_A             — an event the guest IS registered in
--      * EVENT_B             — an event the guest is NOT registered in
--      * a co-attendee profile in EVENT_A (to read name/company)
-- -----------------------------------------------------------------------------
-- Helper lookups (run as service role, no RLS impersonation):
--   select id, full_name, company from public.profiles limit 20;
--   select profile_id, event_id from public.event_attendees order by event_id;
--   select id, event_id from public.b2b_matches order by event_id;


-- -----------------------------------------------------------------------------
-- (A) POSITIVE: guest CAN read a co-attendee's display columns.
--     EXPECT: >= 1 row, with name/company populated. (email/phone intentionally
--     NOT selected — see check C.)
-- -----------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<GUEST_PROFILE_UUID>","role":"authenticated"}';

  -- co-attendees of the guest's event(s), via the new helper:
  select p.id, p.full_name, p.company, p.job_title
  from public.profiles p
  where public.shares_event_with(p.id)
    and p.id <> '<GUEST_PROFILE_UUID>';   -- exclude self
rollback;


-- -----------------------------------------------------------------------------
-- (B) NEGATIVE: guest CANNOT read another event's b2b_matches.
--     EXPECT: 0 rows. The guest is not registered in EVENT_B, so the
--     event-scoping predicate filters every EVENT_B match out.
-- -----------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<GUEST_PROFILE_UUID>","role":"authenticated"}';

  -- Replace <EVENT_B_UUID> with an event the guest is NOT registered in:
  select count(*) as leaked_rows_should_be_zero
  from public.b2b_matches
  where event_id = '<EVENT_B_UUID>';
rollback;


-- -----------------------------------------------------------------------------
-- (B2) NEGATIVE (broad): everything the guest can see in b2b_matches must belong
--      to an event they are registered in. EXPECT: 0 rows.
-- -----------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<GUEST_PROFILE_UUID>","role":"authenticated"}';

  select count(*) as out_of_event_rows_should_be_zero
  from public.b2b_matches m
  where m.event_id not in (
    select event_id from public.event_attendees
    where profile_id = '<GUEST_PROFILE_UUID>'
  );
rollback;


-- -----------------------------------------------------------------------------
-- (B3) NEGATIVE: guest CANNOT read an arbitrary, non-co-attendee profile ROW.
--      EXPECT: 0 rows for a profile that shares no event with the guest.
-- -----------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<GUEST_PROFILE_UUID>","role":"authenticated"}';

  -- Replace <STRANGER_PROFILE_UUID> with a profile in NO shared event:
  select count(*) as stranger_rows_should_be_zero
  from public.profiles
  where id = '<STRANGER_PROFILE_UUID>';
rollback;


-- -----------------------------------------------------------------------------
-- (C) REMINDER: email / phone exclusion is enforced in APPLICATION CODE.
--     RLS here is ROW-level only — it cannot hide columns. A co-attendee row IS
--     visible to the guest, so if app code ever did `select *` or selected
--     email/phone, those would leak. The networking UI must only select display
--     columns (full_name, job_title, company, avatar_url).
--
--     Manual audit query (run as service role) to find any app query that could
--     over-select — grep the codebase, not the DB:
--         rg "from\('profiles'\)\.select\('\*'\)" src/
--     and confirm co-attendee reads use an explicit, display-only column list.
-- -----------------------------------------------------------------------------
