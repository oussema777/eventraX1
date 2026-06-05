-- 2026-06-05_06_cleanup_cron.sql
--
-- Schedules the `cleanup-event-guests` Edge Function to run daily at 03:00 UTC.
--
-- PREREQUISITES (one-time, via Dashboard → Database → Extensions):
--   1. Enable the `pg_cron`  extension (job scheduling).
--   2. Enable the `pg_net`   extension (HTTP from Postgres; provides net.http_post).
--   3. Set CRON_SECRET in the function's secrets (Dashboard → Edge Functions →
--      cleanup-event-guests → Secrets, or `supabase secrets set CRON_SECRET=...`).
--      The function rejects any request whose `x-cron-secret` header does not
--      match this value with HTTP 401.
--
-- IMPORTANT: replace REPLACE_WITH_CRON_SECRET below with the SAME value you set
-- for the function's CRON_SECRET before running this migration. (Cron job
-- definitions are stored in plaintext in cron.job — treat this value as a
-- shared secret and rotate it if exposed.)
--
-- To re-run / update this schedule, unschedule the existing job first:
--   select cron.unschedule('cleanup-event-guests');

select cron.schedule('cleanup-event-guests', '0 3 * * *', $$
  select net.http_post(
    url := 'https://kvfoswfaifxqnjqhftwc.supabase.co/functions/v1/cleanup-event-guests',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','REPLACE_WITH_CRON_SECRET'),
    body := jsonb_build_object('dry_run', false)
  );
$$);
