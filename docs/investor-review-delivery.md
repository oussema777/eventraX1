# Investor review delivery operations

Current release checkpoint (2026-11-07): the repository mail handlers now use the authorized dispatcher; earlier raw-relay descriptions below are historical. Production VPS service routing and worker activation remain pending. See [the coordinated release instructions](releases/2026-11-07-investor-registration.md) before deployment.

Implementation checkpoint: local only, disabled and not deployed. The local implementation now also includes an authorized in-app feed, response/rescheduling notifications and shared-mail authorization. Deployment verification is still required. Read the [implementation handoff](superpowers/plans/2026-11-06-investor-review-handoff.md) before enabling anything.

## Runtime and authorization

`scripts/review-delivery-worker.mjs` is a bounded Node worker processing up to 20 jobs per invocation. It uses the existing Supabase client dependency and Resend HTTPS API. It does not load a local environment file, install a scheduler, expose a public HTTP handler, or change the database release flag. Deployment topology and scheduler remain unverified.

The worker requires all of these server-only environment variables:

- `EVENTRA_REVIEW_DELIVERY_ENABLED=true` (otherwise exits without connecting).
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `RESEND_API_KEY`.
- `EVENTRA_APP_ORIGIN`: verified HTTPS application origin, no path, query, credentials or fragment.
- `EVENTRA_MAIL_FROM`: verified sender identity.

Never place the service key or provider key in a Vite environment variable or browser bundle. Database RPCs are executable only by `service_role`; their helper is private. Client roles cannot claim, prepare, or acknowledge delivery.

`20261106200000_investor_delivery.sql` depends on both earlier investor migrations. `20261106210000_investor_meeting_responses.sql` adds confirmation/cancellation delivery. Neither enables policy or release. Both database policy/release and the worker switch must allow sending. Applying these migrations alone sends no email.

## Delivery semantics

Each worker claims one job with a two-minute, token-bound lease using `FOR UPDATE SKIP LOCKED`. A second worker cannot claim that live lease. Expired leases can recover; an old token cannot acknowledge a newer attempt. Provider and database HTTP calls have 15-second timeouts.

Preparation immediately before sending checks the current request revision/state, intended audience, authoritative auth email, event policy/release and current reviewer permissions/team role. Investor recipients cannot receive submission notices. Forwarded notices require a future pending meeting. Revoked access, outdated requests, withdrawals and changed recipient emails suppress delivery. A pause releases the job back to the queue.

The payload is frozen for retry. Version 1 emails contain a generic status and authenticated application link, with French, English and Arabic text. A verified recipient language preference has not yet been established; do not infer it from the operator's browser. No meeting topic, private reason/note, identity details, QR code, invitation token or meeting join URL is included. Keep version 1 rendering and sender/origin stable while jobs are in flight; provider conflicts require reconciliation, not key rotation.

`sent` means the provider accepted an email, not that the mailbox received it. Bounce/delivery webhook integration is not implemented. The provider id is retained for investigation.

Resend documents a [24-hour idempotency-key window](https://resend.com/changelog/idempotency-keys). Keys are stable per job. Retries use exponential backoff up to one hour, at most eight attempts, and stop after 23 hours from the first claim. Exhausted/uncertain jobs remain failed with `available_at=infinity` and `RECONCILE_REQUIRED`. Permanent provider errors also stop automatic retries. Do not reset these rows or generate a fresh key until provider acceptance has been reconciled; doing so may duplicate an email.

Database state changes and external email delivery cannot form one atomic transaction. Revocation/withdrawal after final preparation but while the provider request is in flight cannot recall an email. Generic content minimizes disclosure, and destination pages recheck authorization. Do not promise zero in-flight stale emails or exactly-once delivery.

## Monitoring and recovery

Use a trusted database operations connection, not a participant-facing query. This inspection excludes payloads and email addresses:

```sql
select state, last_error_code, count(*) as jobs, min(created_at) as oldest
from public.event_review_outbox
group by state, last_error_code
order by state, last_error_code;

select id, event_id, kind, state, attempts, first_attempt_at,
       available_at, lease_until, provider_id, last_error_code
from public.event_review_outbox
where state='failed' or (state='sending' and lease_until<now())
order by created_at;
```

Investigate growing queue age, expired leases, repeated provider errors and permanent failures. Worker logs contain only job IDs/states or a generic batch interruption message. No admin retry UI or automated provider reconciliation is provided yet. Resolve provider/configuration issues and prove delivery status before writing a reviewed recovery operation.

## Verified locally

- 156 SQL assertions (70 foundation, 41 workflow, 28 delivery, 17 meeting responses).
- Six two-connection scenarios, including competing delivery workers and simultaneous confirmation/cancellation.
- Twelve Node tests for rendering, authorization suppression, acknowledgement uncertainty, network failures, provider classification and client response handling, with injected HTTP/RPC responses and no real email calls.
- The response increment passes a production Vite build. Browser regression results are recorded in the handoff.

Run `node scripts/test-investor-review.mjs` for disposable Docker SQL tests and `node --test tests/review-delivery.test.mjs tests/review-response-client.test.mjs` for worker/client tests.

## Protected meeting responses

Protected status changes queue confirmation/cancellation notices to both participants transactionally, including updates from legacy clients. Duplicate or stale responses cannot queue a second transition. Cancellation suppresses an unsent confirmation. Assigning Investor and quarantining an old invitation does not emit cancellation mail. Preserved meetings use their permit participants even when no private request exists.

`UserB2BCenter` uses the new response RPC, then skips browser email and bell insertion for managed meetings. Ordinary meetings return to the existing path without mutation, including attendee-only legacy records. Client RPC failures fail closed instead of falling back. Other clients and generic endpoints remain a release concern. Decline and cancellation share the persisted `cancelled` state and use neutral wording; this increment does not claim a separately stored decline reason.

## Required before activation

The three generic email endpoints (`server.cjs`, `api/send-email.js`, `email-proxy.js`) still accept caller-controlled content/recipients. The existing registration, inquiry, messaging, broadcast and legacy meeting callers need authorized server-derived commands/templates. Merely requiring login, trusting a client meeting ID/type or scanning HTML would not close that bypass. Identify the deployed handler and migrate callers with regression tests before disabling the legacy route. Source inspection is not proof of the deployed routing.

In-app notifications are not implemented in this outbox; the protected participant UI no longer writes duplicate browser bell notifications. Badge invitation links are still copied manually. Protected rescheduling/check-in and other organizer scheduling integrations are not complete. Explicit reviewer configuration, qualification/staff rules, reporting and the remaining gates in the comprehensive plan still apply. See the [shared email caller inventory](shared-email-authorization-inventory.md) for the required registration-first transport migration. Generic endpoints themselves remain unchanged and insecure; the inventory is not a security fix.
