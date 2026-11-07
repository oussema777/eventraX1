# Investor review: deployment and release gates

Current status (2026-11-07): application changes remain local, with explicit user approval required before deployment. The nine database migrations and global controls gate were already applied/enabled for authorized local testing; event settings may now reflect user testing. See the latest [validation checkpoint](superpowers/plans/2026-11-06-investor-review-handoff.md) for test evidence and remaining real-booking/delivery checks. The sequence below is the original rollout checklist, not instructions to reapply existing migrations or evidence of a completed production release.

## Confirmed rules

- Investors are event-scoped. Staff may assign an existing attendee or privately share an email-bound invitation link. Normal registration is still required.
- Incoming investor meeting requests reach an authorized reviewer before the investor. Approval creates a pending invitation; the investor still accepts it.
- Organizer-created investor requests also require review. A requester, recipient or request creator cannot approve that request.
- A reschedule preserves the current meeting until the replacement is accepted. Review does not reserve a slot.
- Direct messages and personal connections remain separate from meeting approval.

## Before deploying

1. Identify the actual frontend host, same-origin `/api/send-email` routing, Supabase project, Edge Function deployment and worker scheduler. These are **unverified**. No staging URL/database was supplied. Do not guess a VPS path or project reference.
2. Obtain a current schema backup and rehearse these migrations against a staging copy. Local SQL tests use synthetic application tables plus the real scheduling migration; they do not establish compatibility with all historical production objects/policies.
3. Refresh attendee/meeting inventory, event schedule/timezone and registration rules. Confirm reviewer accounts with the organizer. No reviewer identity or event is hardcoded or automatically privileged.
4. Confirm configured sender/domain, application origin and mailbox access for test identities. Provider acceptance is not proof of inbox delivery. No real provider message was sent during local validation.

## Coordinated deployment

Apply the nine new migrations in filename order, from `20261106180000_investor_review_foundation.sql` through `20261106235000_review_lifecycle.sql`. Keep `event_review_release.ready=false`.

Deploy the shared Node dispatcher (`server/platform-mail.mjs`, its delivery library and whichever handler the host actually uses), updated frontend, and both changed Edge Functions: `create-event-registration` and `cleanup-event-guests`. All three repository mail entry points now reject arbitrary recipient/HTML payloads. Updating only the frontend or retaining an old proxy is not a secure rollout. Old browser bundles using the removed raw-mail contract must refresh.

Server-only Node mail configuration:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
RESEND_API_KEY
EVENTRA_APP_ORIGIN
EVENTRA_MAIL_FROM
```

The registration Edge Function also needs the configured HTTPS origin and sender, and `EVENTRA_REGISTRATION_RESEND_API_KEY` or `RESEND_API_KEY`. Never put service/provider credentials in `VITE_*` values.

Deploy `scripts/review-delivery-worker.mjs` with the environment documented in [delivery operations](investor-review-delivery.md). Keep `EVENTRA_REVIEW_DELIVERY_ENABLED` off until controlled testing. Each invocation is bounded; scheduler installation and monitoring are still operator tasks. The worker expires elapsed held requests before processing delivery jobs.

## Staging acceptance

Use designated test accounts and mailboxes, with explicit authorization for test email:

- Create/revoke/accept an investor link, including wrong account, duplicate acceptance and registration recovery. Share links privately; automatic invitation-link emailing is intentionally not implemented.
- Manually assign an attendee and exercise both existing-invitation choices. Confirmed meetings must survive assignment.
- Request, approve/reject, withdraw, revise, expire, and recover an occupied slot. Confirm privacy before approval in inbox, bell feed, meeting lists and old acceptance URLs.
- Exercise staff/manual/AI/bulk paths, duplicate retries, self-review denial, reviewer revocation, two reviewers and participant response races.
- Reschedule a confirmed meeting, then accept or cancel the replacement. An unsuccessful replacement must preserve the original booking.
- Verify ordinary-event registration, B2B account access, duplicate recovery, cancellation, check-in, messaging, connections and broadcasts. Also verify real paid/private/full-event requirements; these were not simulated as a complete production journey.
- Check actual email route authorization, disabled channel settings, queue retries and uncertain provider acknowledgement. Verify old endpoints cannot send an unreviewed investor invitation.
- Verify guest cleanup retains linked review history. Choose an explicit retention cutoff before using `purge_review_delivery_payloads`; there is no invented automatic retention period.

Only after these pass: an authorized database operator opens the global release gate, the event manager enables its policy and grants named reviewers/designation managers access, and the operator enables the worker. Test another ordinary event before expanding usage.

## Pause and rollback

Stop worker execution and close the global release gate to pause review. Protected records remain guarded; do not remove database protections or restore the raw mail relay. Do not delete queued jobs or rotate idempotency keys to resolve uncertain sends. Reconcile provider receipts using [delivery operations](investor-review-delivery.md).

Frontend/server rollback must preserve the secured command contract. Registration receipts depend on the new server ledger, so dropping migrations is not a safe rollback. Restore from a tested backup only as an explicit coordinated recovery operation.

## Remaining limitations

- Full production-schema rehearsal, real auth/provider journeys and deployed routing remain unverified.
- Repository-wide TypeScript checking has existing application errors; the local production bundle builds. Do not report a clean repository typecheck.
- Notifications use generic server-generated templates. Existing unused legacy mail helpers reject sending without an authorized command; no raw-content compatibility fallback exists.
- Delivery `sent` records provider acceptance. Bounce webhooks, inbox delivery and operational alert routing require deployment verification.
- Qualification criteria, exact reviewers and retention policy remain organizer/operator inputs, not assumptions in code.
