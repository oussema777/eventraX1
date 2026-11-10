# Meeting reliability release — prepared locally

New ordinary meeting invitations, confirmations and cancellations now create durable notification jobs and in-app notices in the same transaction as the booking. Only the recipient can accept. The existing investor-review flow remains separate. Pending emails do not promise a table; confirmation assigns it, and the meeting pass reloads that assignment.

No production changes or real email sends were performed while preparing this release. The migration does not backfill jobs, modify old meetings, or resend historical mail. Future changes to existing meetings create the appropriate new notifications.

## Release order

The user normally deploys the VPS at `/var/www/eventraX1`. Do not deploy other applications on that VPS.

1. Review and commit the source changes, excluding unrelated `build/index.html`, private `.tmp` data and existing reports/guides. Review the pending pagination/counter changes together with this release; they are in the same working tree.
2. Deploy the updated server and `scripts/review-delivery-worker.mjs` plus both delivery libraries before applying the new migration. Restart the Eventra API only. The worker treats an absent ordinary-meeting queue RPC as idle until migration is applied. Keep the existing review timer running.
3. Compare live prerequisites with the migration: existing review scheduling/notification migrations, `event_notification_settings`, `notifications.source_key`, and Supabase role permissions. Apply `supabase/migrations/20261110180000_meeting_delivery_reliability.sql` once. It is transactional and not an idempotent replay script. The project's migration-history table was historically absent; verify object definitions directly.
4. Build and publish the frontend. The new mutation reads use `select('*')` and tolerate absent revision data during rollout; the monitor hides when its RPC is absent.
5. Verify the timer and service logs on the VPS. The database heartbeat and admin monitor must update within five minutes. An empty queue alone is not proof of worker health. No new timer needs installation if the existing review timer is operational; it runs the updated worker file.
6. With explicitly authorized test recipients, exercise a new request, acceptance and cancellation. Check the actual inbox, assigned table, queue states, and both participants' schedules. Do not replay real historical notifications as a smoke test.

## Queue behavior and limits

- Both participants receive notices for new scheduled requests, confirmations and cancellations. Unscheduled matches do not generate invitation mail.
- Email settings are respected when queueing and checked again before delivery. Queued states are acknowledged by the API without a duplicate direct send.
- Worker claims use expiring leases with `SKIP LOCKED`. Provider requests are frozen and use one idempotency key per job, including retries after an interruption.
- Temporary provider failures (including 429) back off automatically. After eight attempts or 23 hours from first attempt, uncertain jobs require reconciliation. Permanent failures require review. The safe retry action applies only to transient failures inside that window; it cannot replay sent or reconciled jobs.
- New ordinary notifications use the transactional queue instead of the old 20-recipient-mails/hour transport limit. New-invitation abuse protection is applied separately: 240 queued recipient jobs/hour for an ordinary requester, 2,000 for an authorized organizer (normally two jobs per invitation). Confirmations, cancellations and retries do not consume this invitation gate. Existing duplicate-request and eligibility checks still apply.
- Sends are paced at 600 ms between non-idle jobs. A worker invocation processes at most 40 rounds, alternating investor and ordinary queues, with a 45-second soft work budget. The existing timer waits 60 seconds after a batch ends. This is bounded processing, not instant delivery; monitor backlog age during event peaks. Provider account throughput and sustained production capacity have not been load-tested here.
- The monitor is event-admin-only, returns no email addresses or message content, and reports counts, oldest waiting job, recent failures, safe retry actions and worker heartbeat.
- `sent` means provider accepted, not inbox delivered. Bounce/delivery webhooks are not wired by this patch. Verify delivery in the provider dashboard when investigating inbox complaints.
- Legacy mail rendering and existing frozen retry identities were preserved. Historical generic pending emails can retain their original wording; new queued invitations use the corrected wording.

## Local validation

Use a disposable PostgreSQL instance listening only on `127.0.0.1:55440`; then run `node scripts/test-meeting-reliability.mjs`. The runner creates a fresh synthetic database, applies prerequisite migrations and this migration, runs database assertions and independent-connection concurrency cases. It never reads application credentials or contacts production. Synthetic fixtures do not replace a final live schema preflight.

Targeted checks include `node --test tests/meeting-delivery.test.mjs tests/platform-mail.test.mjs tests/review-delivery.test.mjs`, the networking/profile-booking/pagination browser tests, ESLint and a Vite production build into `.tmp`.

## Recovery

Do not roll the API back to a version that sends browser-triggered ordinary emails while the queue is active: that can duplicate delivery. Preserve the queue-aware API and repair forward. If delivery must be paused, stop the existing timer deliberately; this pauses investor delivery too. Bookings still commit with queued jobs. Investigate the heartbeat, job age and error codes before resuming. Never reset provider-accepted jobs or change frozen retry mail. Reconciliation after the provider idempotency window requires a human provider-log check.
