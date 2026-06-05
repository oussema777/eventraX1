-- 2026-06-05_05_profiles_account_type.sql
-- A queryable `account_type` on profiles mirroring auth `app_metadata.account_type`.
-- The create-event-registration Edge Function sets it to 'event_guest' for new guest
-- accounts. Purpose:
--   1. Member-facing surfaces (public profile page, marketplace, community, search,
--      member suggestion pools) filter it out: ... where account_type <> 'event_guest'.
--   2. The cleanup job (block/destroy) finds guests cheaply:
--      ... where account_type = 'event_guest'.
-- Defaults to 'user', so every existing/real profile is unaffected.

alter table profiles
  add column if not exists account_type text not null default 'user';

create index if not exists idx_profiles_account_type
  on profiles (account_type);
