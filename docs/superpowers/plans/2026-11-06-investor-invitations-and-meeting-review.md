# Investor invitations and meeting review implementation plan

> Current status (2026-11-06, supersedes historical checkpoint text below): local implementation now includes secured shared mail, in-app notifications, staff scheduling, atomic replacement/rescheduling, request revision, notes/reporting, settings, pagination and lifecycle safeguards. The user confirmed organizer-created requests require review, self-approval is forbidden, and registration rules remain in force. See [current handoff](2026-11-06-investor-review-handoff.md) and [rollout gates](../../investor-review-rollout.md). No deployment or activation has occurred. Historical checkboxes below are planning history, not current completion evidence.


Status: implementation started with user authorization on 2026-11-06. Foundation, assignment/acceptance commands, protected booking/review commands and initial organizer/participant UI are implemented locally. The feature is not deployed or active. Unchecked items remain work to perform, not verified behavior.

**Implementation checkpoint**

Response increment, 2026-11-06: the fourth migration adds a protected response RPC and transactional confirmation/cancellation outbox trigger. The participant UI avoids duplicate browser sends on that path; ordinary attendee-only legacy meetings retain their existing handling. Quarantine does not send a cancellation. **156 SQL assertions, six concurrency scenarios and twelve worker/client tests pass; production build passes.** The [shared email inventory](../../shared-email-authorization-inventory.md) records existing callers and required authorization migration. Generic handlers are unchanged; WP5 remains incomplete. In-app notifications and remaining scheduling/check-in integrations still need work.

Delivery increment, 2026-11-06: `20261106200000_investor_delivery.sql` and the bounded Node worker in `scripts/review-delivery-worker.mjs` now implement service-only claim/prepare/acknowledgement, current-recipient authorization, token-bound leases, retry suppression, immutable payloads and provider idempotency. Local verification now totals **139 SQL assertions, five concurrent scenarios and seven worker unit tests**. No provider call, scheduler installation, live migration or activation occurred. See [delivery operations](../../investor-review-delivery.md). Generic mail bypasses, in-app delivery, response/cancellation integration and provider verification remain open; WP5 is not complete.

Last saved checkpoint: 2026-11-06. Resume using [the implementation handoff](2026-11-06-investor-review-handoff.md), which records working-tree state, verified checks, commands and the next work package. Final browser regression: **27 passed**. Implementation files remain saved locally and uncommitted; no push, production migration or activation has occurred.

Implemented in `supabase/migrations/20261106180000_investor_review_foundation.sql`:

- Event policy storage with a closed deployment-only release lock; no browser activation RPC.
- Explicit reviewer/designation permissions, checked against current event access on every use; no default reviewer assignments.
- Event-scoped designation and invitation storage, immutable-to-clients audit history, private booking requests/notes and a restricted notification outbox.
- Composite event/attendee references preventing later registration edits from moving protected records across events.
- Invitation issue, explicit replacement, revocation and read-only preview primitives; random secrets stored only as SHA-256 digests. Issuance is locked until release; preview requires both the token and matching authenticated identity.
- Assignment preview counts distinguish scheduled pending invitations, unscheduled matches and confirmed meetings.

Implemented next in `supabase/migrations/20261106190000_investor_assignment_and_booking.sql` and the investor UI components:

- Manual assignment/removal and invitation acceptance share one assignment helper. Acceptance reuses a matching eligible registration; missing registrations use the existing event registration flow, with no payment, capacity or consent bypass.
- Assignment inventories include a fingerprint, not just counts. Changed content invalidates the confirmation even when counts are unchanged. Incoming scheduled invitations can be preserved or moved into private review. Migrated acceptance links cannot confirm the cancelled original; restrictive read policies hide it from the investor. Confirmed and outgoing meetings remain in place.
- Link acceptance is explicit and idempotent; the recipient cannot decide how existing pending invitations bypass review. Removing the badge retires pending/accepted invitation links so they cannot restore it.
- Pending invitations protect matching registrations/profiles before acceptance. Protected registration identity edits are blocked, while a normal initial link to the matching auth account is allowed.
- Private submission, rejection, approval and withdrawal commands enforce eligibility, schedule validation, revisions and idempotency. Approved requests create one pending invitation; only its recipient can confirm. Existing authoritative scheduling allocates physical capacity on confirmation.
- Protected writes require a private server-created permit binding event, registrations, profiles, requester, times and metadata. Altered IDs/content, bulk inserts and old direct clients cannot bypass it. Protection remains in force during a release pause.
- An investor's outgoing request to an ordinary attendee remains direct through the same authorized command. Slot changes during review return the request to `needs_new_slot`, without creating a meeting or investor notification job.
- Attendee management has invitation-link creation/revocation and manual designation controls. The B2B dashboard has a review queue; My Networking shows request status and withdrawal. Inline profile booking uses accurate review language and does not send browser emails for protected requests.
- Event profile/directory Investor badges and filters use the canonical event designation. French, English and Arabic/RTL copy is included. Private query caches are keyed by account as well as event, and draft/link state is cleared on account changes.

Validation checkpoint: the isolated PostgreSQL runner passes 111 SQL assertions plus four two-connection race scenarios (invitation issuance, competing reviewers, approval versus withdrawal, assignment versus legacy booking). It loads the actual scheduling migration on synthetic application tables and reproduces current event-role semantics. This is not a rehearsal of the complete historical production schema. Browser tests cover organizer decisions, invitation acceptance/registration recovery, account switching, inline review submissions, policy failures, localization/mobile layout and existing attendee/networking flows. Production bundle compilation passes to an isolated `.tmp` output. New modules pass targeted ESLint. A full repository TypeScript check still reports errors in existing application areas (including `BusinessManagementDashboard`, matchmaking, pricing, the existing booking-slot union and EventTeamInvitation); there were no diagnostics for the new investor modules. This does not constitute a clean repository-wide type check.

Still required before activation:

- Provider validation, deployment/scheduling and hardening of generic mail/notification bypass paths. The local email worker handles submission/decision and protected confirmation/cancellation jobs with retries and stale-job suppression; it has not sent real mail. The participant response UI skips browser sends for protected meetings. In-app notifications and remaining organizer/check-in/rescheduling integrations are still required.
- Final reviewer/account configuration and Rahaf's qualification/staff/self-review decisions. Self-review currently fails closed; this is a conservative interim implementation, not a claimed confirmed business rule.
- Staff/manual/AI/bulk UX must be integrated with the agreed policy. Their protected raw writes currently fail closed instead of silently bypassing review. Do not enable this as a complete organizer scheduling experience yet.
- Rescheduling/revision UX, expiry/resubmission policy, retention/deletion behavior and reporting/export integration. Protected meeting edits currently require a new request; a confirmed replacement/swap workflow has not been implemented.
- Private-note editing and the final qualification evidence UI, if required by Rahaf.
- Full migration rehearsal, current-data classification, real-provider fresh-account/guest-activation and cleanup checks, deployed worker/mail discovery, explicit event timezone and operational rollout/rollback.

No live database write, external invitation delivery, push or activation occurred. Do not open `event_review_release.ready` or deploy this as a complete feature. Rahaf's unresolved rules below remain unresolved.

**1. Confirmed requirements**

- Investors may register later; an advance investor roster is not required.
- Authorized organizers can designate an existing attendee as Investor from the event dashboard.
- Individual investor invitations provide a second route: register or sign in, accept the invitation, and receive the same event designation automatically. No duplicate registration should be created.
- The designation displays an Investor badge on event cards/profiles and supports an Investors filter.
- Incoming meeting requests to designated investors require organizer review before reaching the recipient. Following approval, the investor still accepts or declines.
- Booking remains inside the profile. Organizer preview remains read-only.
- Both designation routes use the same backend rules and audit history; the designation is event-scoped, not a global profile privilege.
- Designation must flag existing pending invitations and allow explicit handling. Existing confirmed meetings remain intact.
- Support other Eventra events without hard-coding this event's identity into the new workflow.

**2. Verified evidence and limits**

The earlier read-only linked-database snapshot found 178 pending meetings for L'Investissement: 171 unscheduled bulk matches and 7 scheduled requests; 1 confirmed meeting; 84 pending records lacked at least one profile reference. These counts must be refreshed before migration. No attendee categories were configured for this event. An event timezone value of `pt` and no venue timezone require resolution before activation.

The live scheduling trigger validates pending/confirmed scheduled meetings and locks event/participant resources; other statuses skip its scheduling checks. Confirmed meetings reserve time and physical capacity. The live meeting read policy includes event attendees. Keeping unapproved requests in that table with frontend filtering would not establish privacy.

Repository sources inspected:

- `src/components/networking/BookMeetingModal.tsx`: direct pending-meeting creation/update followed by browser notifications and email; `organizer_id` stores the requester.
- `src/components/networking/ProfileBookingPanel.tsx`: embedded booking and organizer preview.
- `src/components/networking/UserB2BCenter.tsx`: meeting reads, confirmation, cancellation, decline and legacy connection requests.
- `src/components/dashboard/EventB2BMatchmakingTab.tsx`: manual, suggestion and bulk writes plus notification paths.
- `src/utils/networkingSchedule.ts`: shared scheduling and existing event-specific fallback behavior.
- `src/lib/eventAccess.ts` and `docs/event-team-access.md`: current event roles and boundaries.
- `src/lib/notifications.ts`, `src/lib/email.ts`, `src/lib/meetingEmail.ts`, `src/hooks/useNotifications.ts`: delivery helpers/templates/subscriptions.
- `supabase/functions/create-event-registration/index.ts`: lookup/link by supplied email, guest creation with `email_confirm: true`, registration insert and duplicate handling. Public profile creation/linkage and the confirmed-email flag alone are NOT proof of mailbox control.
- `supabase/functions/activate-event-account/index.ts`: authenticated guest activation and expiry clearing; integration must preserve its lifecycle.
- `supabase/functions/cleanup-event-guests/index.ts`: guest cleanup exists in source. Its deployed schedule and invocation are unverified.

The linked database lacked `event_notifications`, although organizer code references it. Audited meeting/notification tables were absent from queried publication metadata. Generic email handlers inspected in source accept caller-supplied mail content without establishing meeting authorization. Their deployed exposure, VPS version, actual mail handler, external workers and external legacy-table consumers remain unverified.

Existing `event_meeting_requests`, whitelist and blacklist tables contain platform data but no records for this event in the earlier snapshot. No consumer was found in searched application/server paths or public function bodies. Do not delete or repurpose them without further dependency verification.

**3. Proposed architecture**

Use one event-scoped investor designation, one meeting-review policy evaluator and shared server commands. Public badge data must be readable independently of private invitation, review and audit data. Generic category editing must not grant the designation or disable review.

Suggested data entities (names provisional):

| Entity | Required content and protections |
| --- | --- |
| Event review policy | Enabled state, protected-recipient/all-recipient scope, version, authorized editor, timestamps. Existing events default off. Designating investors must clearly activate/require protection; do not display a protected flow while silently running direct bookings. |
| Event participant designation | Unique event/attendee Investor assignment, assigning actor, source, timestamps, removal history. Validate registration belongs to event. |
| Investor invitation | Event, normalized invited email, token digest, expiry, issuer, accepted registration/profile, lifecycle state, revocation and acceptance times. No raw tokens in public rows/logs. |
| Private booking request | Event, requester/recipient registrations, submitting actor, proposed interval/format/message, policy snapshot/version, request revision, state, linked meeting, expiry and idempotency key. |
| Review history and notes | Append-only transitions and actors; private reviewer notes separate from requester-visible explanations. |
| Notification outbox | Structured event type, entity/revision, intended audience, deduplication key, retry/delivery state; trusted worker access only. |

Use explicit requester, recipient and reviewer identities. Do not infer these from the ambiguous existing `organizer_id`. Define validated foreign keys, uniqueness, state constraints, queue indexes and deliberate deletion/retention rules before migration. Verify actual schema and duplicate-email cases before adding uniqueness constraints.

**4. Investor invitation lifecycle**

Proposed states: pending, accepted, revoked, expired. Auth provisioning may be a separate resumable step; it is not transactional with all application records.

- An authorized organizer enters one email at a time; no complete list or bulk import is required.
- Issue a high-entropy, expiring, email-bound invitation. Store its digest. Keep raw token exposure limited to delivery and acceptance; scrub URLs from analytics/logs and avoid third-party requests/referrer leakage on acceptance pages.
- Opening a link is read-only. Email security scanners and link previews must never accept or consume it. Acceptance requires an authenticated POST and explicit action.
- Verify the authenticated account matches the invited email and require appropriate mailbox-control proof. Do not trust client-submitted email, profile existence, registration linkage or `email_confirmed_at` alone given current guest provisioning. Select and verify the challenge/session mechanism before implementation.
- A different signed-in account sees a safe switch-account flow; never silently relink profiles or registrations. Preserve invitation context through authentication using validated redirects.
- New users complete required registration fields and eligibility steps. Existing users reuse their event registration. Missing/unlinked/duplicate registrations get deterministic recovery; do not merge people solely by similar names or companies.
- Finalize eligible event registration, designation and invitation consumption atomically inside the database. Provisioning/auth failures before finalization must be retryable and must not expose an intermediate ordinary bookable investor registration. Server booking eligibility must enforce this boundary, not the UI.
- Do not silently bypass payment, capacity, event access codes, registration approval, B2B consent or required profile basics. Determine how each applies to investor invitations; until resolved, an invitation does not imply a waiver.
- Repeated acceptance is idempotent. Concurrent manual designation and invitation acceptance yield one designation/registration.
- Resend/reissue invalidates previous unaccepted tokens. Revocation blocks unaccepted invitations. Revoking an already accepted invitation does not silently remove an active designation; use the explicit removal action.
- Removing a designation must also handle outstanding invitations so an old link cannot unexpectedly restore it. Reinstatement requires a deliberate new action.
- An email change cannot transfer an invitation to a different person. Use revoke/reissue and verify account-email changes against the identity policy.
- Guest activation/cleanup and auth-account deletion must not accidentally erase review history or leave usable invitations. Verify deployed cleanup behavior and select retention rules.

**5. Manual assignment and existing invitations**

The same server command validates staff permissions, attendee ownership and policy, then assigns Investor. It atomically classifies existing invitations, records the handling choice and protects new incoming requests.

Assignment UI: attendee/event identity, explanation of review, current pending invitation count, preserve-versus-review choice for eligible scheduled invitations, and separate confirmed/unscheduled counts. Refresh counts and compare revision at confirmation. Serialize assignment against creation/acceptance so no invitation falls between classification and protection.

Already delivered emails cannot be recalled. Bringing an invitation into review must revoke its actionable state, stop queued deliveries, invalidate acceptance through old links and remove inappropriate investor-facing state. Historical visibility must not be described as undone. Review any other-attendee read access for archived payloads. Audit the original invitation and its successor instead of silently deleting evidence.

Treat 171 unscheduled bulk matches separately from seven scheduled requests. Never automatically forward bulk suggestions. Preserve confirmed meetings. Missing profile references require repair or explicit quarantine before conversion.

Removal UI must explain that future incoming requests become direct if no other event policy applies. Existing review requests remain held until explicitly resolved. Cosmetic badge changes do not alter policy. A global event policy can still require review after Investor is removed.

**6. Meeting workflow and authorization**

Private request states: awaiting_review, needs_new_slot, rejected, withdrawn, expired, forwarded. A linked meeting owns the recipient response and confirmed/cancelled lifecycle after forwarding. Do not maintain independently editable duplicate confirmation states.

Server commands cover submit/revise/withdraw, review/forward, accept/decline/cancel/reschedule, designation changes and invitation issue/redeem/revoke. Derive actor from authentication; validate event, participant ownership, eligibility, policy and current revision. Deny arbitrary protected direct writes even from old clients. Audit all known REST/RPC/service-job paths; UI restrictions alone are insufficient.

Approval transaction locks the request, rejects stale/self-disallowed decisions, rechecks eligibility and scheduling, creates exactly one pending invitation and queues notifications. Two reviewers cannot create two invitations. Distinguish business decision success from email delivery success.

Apply policy to the recipient: investor-to-attendee requests need not be reviewed unless that recipient/event is protected; investor-to-investor requests do. Third-party staff scheduling and self-review require explicit agreed semantics. Default proposal is no implicit bypass and no self-approval. Review permissions and badge-management permissions are separate from scanner or general attendee access; final role mapping is unresolved.

Validate canonical participant identities and event relationships. Client changes to participant order, `organizer_id`, event, status, metadata or an old unscheduled match must not bypass review. Changing reviewed recipient, purpose or time invalidates approval according to the agreed material-change policy.

**7. Scheduling and lifecycle proposals**

- Preserve confirmed-only reservation unless the user explicitly chooses temporary holds. Revalidate on submission, forwarding and final acceptance.
- Reuse/refactor authoritative scheduling checks without introducing a new status that skips them. Verify profile basics, B2B eligibility, availability, cross-event conflicts and physical capacity.
- Use explicit validated event timezones, formats, schedules and durations. Normalize this event's configuration only after confirming intended timezone; do not add new event-ID exceptions.
- Expired/past requests cannot be forwarded. Registration cancellation, opt-out, disabled account, changed availability or cancelled event blocks affected transitions with recovery guidance.
- Approval versus withdrawal/edit, designation versus booking, and simultaneous confirmations need compatible lock ordering and transaction tests. Do not assume an existing lock in one path covers all new paths.
- Proposed confirmed-reschedule behavior: retain original reservation until replacement acceptance, then atomically swap. Recheck capacity excluding the replaced meeting where appropriate. This policy is not yet confirmed.
- Event closure cancels future actionable work according to an explicit policy; the worker suppresses stale jobs.
- Define duplicate-pair limits, rate limits, resubmission/cooldown, review expiry and notification reminder frequency before activation. Do not invent qualification rules or use match score as approval.

**8. UX and application change map**

| Surface | Work |
| --- | --- |
| Event attendee management | Assign/remove Investor; show pending requests affected; permission-aware audit and invitation actions. |
| Investor invitations | Issue/resend/revoke, delivery and acceptance states; wrong-account, expired-link and already-registered recovery. |
| Event directory and profile | Badge and filter from canonical designation; event-specific explanation of review. |
| Global profile | Resolve selected event before displaying event role/booking policy. |
| ProfileBookingPanel and BookMeetingModal | Preserve inline UX/preview; shared submission command; accurate review versus invitation success states. |
| UserB2BCenter | Outgoing review requests distinct from received invitations; correct counts, withdrawal and revision. |
| Event B2B management | Private review queue/detail panel, requester/business information when available, purpose/time, approve/reject and separate private notes. |
| Manual scheduling, AI and bulk tools | Shared commands; suggestions are not delivered requests; explicit handling for staff-created invitations. |
| Notifications and templates | Receipt/review/forwarding/rejection/response events; localization per recipient; backend delivery. |
| Reporting/exports | Separate review, forwarded and confirmed counts; exclude private notes from public/participant exports. |
| Check-in, QR, calendar and online joining | Confirmed-state authorization; no actionable pass/calendar/join access before appropriate state. |
| Event templates/copying | Copy policy only deliberately; never copy attendee assignments, tokens or history. |

Support French, English, Arabic/RTL, keyboard use, focus management, accessible status announcements, mobile layouts and recoverable errors. Review queue is paginated with server filters, current counts and stale-decision protection. Choose verified subscription support or polling/refetch fallback; do not assume realtime currently works.

**9. Notifications and privacy**

Submission notifies requester/reviewers only. Forwarding creates investor invitation and requester update. Investor response/cancellation notifies relevant parties. Rejection explains the outcome to requester without disclosing private notes. Reviewer reminders are configurable after rules are agreed.

Outbox insertion shares the state-change transaction. Delivery worker derives audience/content from trusted data, checks entity revision and cancellation, retries with bounded backoff and exposes failed jobs. Use provider idempotency where supported; do not promise exactly-once external email delivery. Prevent browser-triggered generic notification/email paths from forging protected meeting invitations. Shared transport hardening requires registration/team-email regression checks.

Public designation is not a claim of financial accreditation. Use neutral Investor labeling. Protect invitation emails, internal notes and request payloads through database policies, exports, subscriptions, logs and caches. Direct messages and public business contact information remain outside meeting-review scope.

**10. Decisions and verification register**

| Item | Status and next action |
| --- | --- |
| Two designation routes, event scope, investor final acceptance | Confirmed. Implement shared semantics. |
| Existing pending-invitation handling at designation | Confirmed choice concept; detailed migration/revocation UI must be verified. |
| Investor list | Not a dependency. Progressive invitations need individual emails; manual designation needs an existing attendee. |
| Exact reviewer and designation-manager accounts | Unverified. Obtain account mapping; do not infer Rahaf's identity from coordinator count. |
| Qualification criteria and required fields/documents | Await Rahaf. No invented or AI-based qualification. |
| Staff-created invitations and self-review | Unresolved. Proposed no implicit bypass/no self-approval; define single-reviewer fallback. |
| Invitation registration/payment/capacity/access exceptions | Unresolved. No automatic exemptions. |
| Reservation, rescheduling, deadlines and resubmission | Proposed rules above; confirm consequential behavior before enabling. |
| Authentication proof mechanism | Verify guest/member login and token lifecycle; confirmed-email flag insufficient by itself. |
| Actual deployed code/mail/worker/cleanup infrastructure | Unverified. Inspect before choosing delivery runtime and deployment commands. |
| Event timezone and legacy data | Refresh snapshot, confirm timezone, classify records and rehearse migration. |
| Audit retention/account deletion | Define retention and FK behavior; do not cascade away required history accidentally. |

**11. Work packages and acceptance gates**

- [ ] WP1: Refresh schema/code inventory, entry-point matrix, auth/registration edge cases and deployment dependencies. Resolve security-affecting decisions; document remaining product decisions.
- [ ] WP2: Add policy/designation/invitation/private-request/audit/outbox schema, constraints and permissions with feature disabled. Validate role isolation and migration rollback in staging.
- [ ] WP3: Implement shared commands, authoritative scheduling and raw-write guards. Verify every direct/bulk/edit path; preserve off-policy behavior.
- [ ] WP4: Implement invitation issuance, mailbox verification and resumable registration/acceptance. Integrate guest activation and existing registration recovery.
- [ ] WP5: Implement server notification delivery and close bypass paths. Verify provider behavior and monitoring; remove duplicate browser sends.
- [ ] WP6: Implement attendee designation, investor badge/filter, review queue and participant tracking while preserving inline booking and preview.
- [ ] WP7: Update reports/exports/notification settings/check-in integrations and localization. Rehearse existing-data handling.
- [ ] WP8: Execute full regression/security/concurrency tests and real-account staging journeys. Enable L'Investissement only after activation prerequisites pass.

Order dependencies: schema precedes commands; commands/auth design precede invitation and booking UI; outbox deployment precedes enabling notifications; all entry-point guards precede activation. Independent UI scaffolding can proceed with fixtures, but unresolved product decisions must not become silent production defaults.

Required test matrix:

- Roles: anonymous, requester, investor, reviewer, coordinator without review permission, scanner, other-event owner and platform administrator under explicit policy.
- Invitations: forwarded link/wrong account, expired/revoked/reissued link, email scanner GET, repeat redemption, email change, already registered, unlinked account, duplicate emails, concurrent manual assignment, provisioning failure and retry.
- Registration: paid/private/full/closed events, incomplete profile, opt-out, guest activation and guest cleanup. Verify no intermediate unprotected booking window.
- Security: direct REST writes, old browser bundles, forged metadata/IDs, cross-event access, arbitrary confirmation, self-approval, role revocation and non-public notes in exports/subscriptions.
- Concurrency: badge assignment versus submit/accept; approve versus edit/withdraw; two reviewers; withdrawal versus worker send; simultaneous slot/table confirmation; confirmed reschedule swap.
- Reliability: repeat submission, transaction failure, worker crash, stale job, failed email, refresh after uncertain response and duplicate callback.
- Regression: review off, different events/roles/timezones/formats, business CTA availability, embedded booking, organizer preview, AI/bulk matching, reports, calendar, QR/check-in and shared emails.

**12. Deployment and operation**

Release is database + backend/worker + frontend, not a static-site-only deploy. Take a recoverable database backup according to verified hosting capabilities. Add infrastructure disabled, deploy command/worker/client support, rehearse migration, validate real accounts, then activate policy. Avoid automatically issuing invitations or changing existing badges during deployment.

Monitor queue age, decision failures, token redemption failures, notification backlog and delivery errors without raw tokens/private content. Provide documented retry/support workflows and an operational pause switch. Disabling policy or rolling back frontend must never automatically forward pending review requests; preserve backend guards and history until the queue is explicitly resolved.

Completion means both designation routes work, no pre-approval investor delivery/read path remains in the reviewed scope, existing meetings are handled explicitly, other events retain correct behavior, tests pass and operations/deployment checks are recorded. The local foundation and workflow/UI checkpoints above have been implemented and tested; notification delivery, release integration and rollout are not complete.
