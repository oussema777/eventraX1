# Save registration while networking access is prepared

Participants can reuse their email across different events and years. A networking account setup failure must not stop event admission. The updated registration page requests `allow_pending_networking=true`; the server saves the attendee and selected sessions with networking state `pending` or `review` when account setup cannot finish immediately. Paid-event ticket purchase requirements remain separate.

The confirmation page explains that registration is saved, networking is being prepared and no repeat registration or alternate email is needed. It distinguishes an account requiring organizer help. Text is provided in English, French and Arabic. Actual database-save failures preserve form answers and show a persistent, focused error with retry and edit-details actions.

If the registration Edge Function is unavailable, the existing transactional database registration RPC can save the attendee and sessions. An unlinked B2B attendee is automatically marked pending and queued by database triggers. When that fallback finds an already registered participant, it uses the stored networking state; it does not promise a new automatic retry if none was queued.

## Background work

- `registration_access_jobs` is private to the backend. Queue insertion occurs in the same transaction as registration. No existing registrations were bulk-enqueued.
- `retry-registration-access` uses a dedicated server-side secret. A Vault-backed `pg_cron` job checks due work every minute and invokes the worker through `pg_net`. It does not issue requests while idle.
- Claims are leased for five minutes; concurrent workers cannot claim the same live lease. Retries use exponential backoff. After six failed attempts, or a known identity conflict, the job goes to organizer review and generates a deduplicated organizer notification. Admission remains saved.
- The worker uses the same tested account repair/verification function as immediate registration. Linking rechecks the saved email, current opt-in/status, existing profile and lease. It never replaces another participant's profile.
- After successful linkage, the existing idempotent registration receipt sender delivers the access link. Receipt-only and access emails have separate stable deduplication keys. Existing pending or review accounts do not receive a false access email.
- No cleanup, automatic banning or account deletion service was enabled. The old `cleanup-event-guests` implementation remains undeployed.

## Deployment and verification

Database migrations `20261113190000_registration_access_queue.sql` and `20261113191000_registration_access_scheduler.sql` are applied. Worker v2 and registration handler v20 are ACTIVE. Vault holds `registration_retry_url` and `registration_retry_secret`; the matching Edge secret is `EVENTRA_REGISTRATION_RETRY_SECRET`. These values are not committed.

The backend preserves the old response contract for browser bundles that do not send `allow_pending_networking=true`, avoiding a saved-but-pending result that old screens cannot understand. The new behavior becomes available to visitors after the frontend deployment below.

Validation: 32 handler/receipt/worker tests, database integrity and queue tests in disposable PostgreSQL, four browser scenarios against the production build (pending, review, function outage fallback, database-save failure), mobile French confirmation review, and production build passed. Live worker invocation returned HTTP 200 with zero jobs; the one-minute cron job completed successfully. No participant messages were sent during verification.

The original VPS SSH key was rejected. The user agreed to run this deployment in PuTTY from the existing site checkout:

```bash
cd /var/www/eventraX1 && git pull --ff-only origin main && bash scripts/deploy-b2b-access.sh
```

The script builds before replacing the served entrypoint and preserves old hashed assets for open browser tabs. Backend deployment is already complete. Frontend deployment remains pending until this command is run and the live bundle is verified.

Local ignored evidence: `.tmp/registration-access-release/site`, `.tmp/registration-access-*.png`, `.tmp/registration-retry-health.sql`, plus the earlier `.tmp/auth-account-repair-20261113` repair evidence. Do not run the SQL fixtures against production.
