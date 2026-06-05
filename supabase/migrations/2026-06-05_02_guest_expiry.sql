-- 2026-06-05_02_guest_expiry.sql
-- Per-attendee guest pass expiry threshold (= event end_date + 7 days), stamped by the
-- create-event-registration Edge Function for B2B-opt-in guests. NULL for non-guests.
-- The cleanup job reads this (and derives the +30d purge threshold from it) to know when
-- to block, then destroy + redact a guest. The composite index serves both the cleanup
-- scan and the GuestRouteGuard's "which events is this profile registered in" lookup.

alter table event_attendees
  add column if not exists guest_expires_at timestamptz;

create index if not exists idx_event_attendees_profile_event
  on event_attendees (profile_id, event_id);
