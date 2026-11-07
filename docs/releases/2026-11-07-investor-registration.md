# Investor and registration release — 7 November 2026

## Responsibility and current status

The user authorized release preparation and Git/database management; the user runs deployment on the VPS. A Git push is not a completed production deployment. Do not run a frontend-only deployment for this release.

## Included requirements

- Organizer investor workspace, invitations, attendee assignment, multiple team members with individual permissions, and meeting review.
- Visible attendee investor directory, profile booking and organizer approval followed by investor acceptance.
- Consistent compact participant cards with linked business identities and investor styling; pending-meeting count on My planning.
- Registration country selector survives browser-translation DOM changes while preserving required-field validation and entered answers.
- Authorized mail dispatcher, registration receipts and protected-meeting notification worker. Delivery needs VPS configuration and activation.

## Evidence

Final combined run: **75 browser tests passed**. Existing final backend checks: **36 Node tests, 195 SQL assertions and six concurrency scenarios passed**. Production bundle builds. The user manually confirmed registration, invitations and organizer/investor booking acceptance. The two confirmation notifications were verified queued with zero attempts; actual inbox delivery is still unverified. Repository-wide TypeScript checking has known errors; do not report a clean typecheck.

All nine investor migration files match the hashes applied to production. Read-only checks confirmed the booking/response functions and mail queues exist. The missing Supabase EVENTRA_APP_ORIGIN and EVENTRA_MAIL_FROM settings have now been configured for https://eventra.cloud and the existing contact@eventra.cloud sender; provider keys were preserved. Edge Functions are held for the coordinated VPS switch. Do not run `supabase db push` or reapply them. No unrelated report files, environment files, generated build output or credentials belong in this release commit.

## First VPS step: inventory only

From the existing Eventra Git checkout on the VPS:

```bash
git status --short
git pull --ff-only origin main
node scripts/release-preflight.mjs
```

If Git reports local changes/conflicts, stop and preserve them. The preflight is read-only and prints presence/absence of configuration, not credentials. Send its output back before the service switch. It does not send emails, enable the worker, change the database, restart PM2 or replace the live site.

The Node mail service and worker need these server-only variables in the VPS `.env`:

```text
SUPABASE_URL=https://kvfoswfaifxqnjqhftwc.supabase.co
SUPABASE_ANON_KEY=<existing project anon key>
SUPABASE_SERVICE_ROLE_KEY=<server-only project service-role key>
RESEND_API_KEY=<existing verified provider key>
EVENTRA_APP_ORIGIN=https://eventra.cloud
EVENTRA_MAIL_FROM=Eventra <contact@eventra.cloud>
EVENTRA_REVIEW_DELIVERY_ENABLED=false
```

Keep existing frontend `VITE_SUPABASE_*` values. Do not prefix server/provider secrets with `VITE_` or paste their values into chat. Use Node with `process.loadEnvFile` support (Node 20.12+ or an appropriate newer supported release).

## Coordinated switch after inventory

1. Verify the actual Nginx document root, `/api/send-email` upstream, active mail process name and scheduler. Confirm any alternate mail proxy is replaced or no longer publicly reachable.
2. Build into a new release directory before changing the served entrypoint. Retain old hashed assets for open browser tabs. Back up the entrypoint and identify a rollback that retains the authorized mail contract.
3. Configure the Node dispatcher and restart the verified mail process. A request without authentication must be rejected. Never restore arbitrary recipient/HTML sending as a rollback shortcut.
4. Coordinate with the database/Git operator to deploy `create-event-registration` and `cleanup-event-guests` to the existing Supabase project, preserving their invocation/auth settings. Registration receipts need `EVENTRA_APP_ORIGIN` and the existing provider secret; verify these before deploying. Avoid an extended period mixing old raw-mail browsers with the new receipt owner.
5. Switch the frontend entrypoint, then verify a normal registration and investor/profile booking entrypoints. Request refresh for existing tabs using the previous mail contract.
6. Configure a bounded recurring invocation of `scripts/review-delivery-worker.mjs` with the server-only environment. Start with one controlled batch after approval of real delivery, inspect queue states/provider acceptance, and verify both test mailboxes before making it recurring. Existing valid queued notifications will be eligible for sending; stale notifications are checked and suppressed by the worker.
7. Check ordinary bookings, investor confirmations, both calendars, cancellation, registration receipts, and mobile country selection. Record the deployed commit, services, schedule, queue outcome and mailbox checks.

Exact restart/scheduler commands depend on the VPS inventory. Do not guess process names or install a second competing mail service. The existing frontend-only deploy scripts are insufficient for this coordinated release.
