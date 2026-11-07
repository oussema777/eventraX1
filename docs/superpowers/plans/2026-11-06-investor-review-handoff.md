# Investor review implementation handoff

## Release handoff - 2026-11-07

User has now authorized Git/database release work and will run VPS deployment personally. This supersedes earlier no-push instructions. All 75 combined browser scenarios passed in .tmp/deployment-final-browser.txt. Database object checks passed and all nine migration hashes match the already-applied versions. Configured the two previously absent Supabase mail settings EVENTRA_APP_ORIGIN and EVENTRA_MAIL_FROM using the established HTTPS origin and sender; no provider key change or email send. Do not redeploy registration in isolation before coordinating the VPS mail/UI change. Run the read-only scripts/release-preflight.mjs on the VPS after pulling this release, then use docs/releases/2026-11-07-investor-registration.md to finish the coordinated switch and actual delivery validation. No VPS or Edge Function deployment completed at this checkpoint.


## Pre-deployment booking validation - 2026-11-07

User reports manual UI/invitation/registration tests look good; booking has not been manually tested. User explicitly requires approval before deployment. No Git push, deployment, production writes, real test email or delivery worker activation was performed during this validation.

Current automated evidence:
- 70 distinct mocked browser scenarios passed: 44 booking/investor/permissions/discovery tests, plus 26 networking/profile/registration regressions. The latter initially had three outdated assertions; all three passed after the test-only updates below. Logs: `.tmp/release-booking-browser.txt`, `.tmp/release-booking-regression.txt`, `.tmp/release-booking-regression-final.txt`.
- 36 Node tests passed for protected meeting responses, delivery, mail authorization and registration receipts/handler: `.tmp/release-booking-unit.txt`.
- 195 SQL assertions and six concurrent-connection scenarios passed against a disposable Docker database: `.tmp/release-booking-database.txt`. Docker Desktop was started locally; the test runner removed only its own temporary container.
- Current production bundle built successfully into `.tmp/release-booking-build`; log `.tmp/release-booking-build.txt`. No claim of a clean repository-wide TypeScript check.
- Updated localization tests to open the new match-score disclosure, assert translated content and unchanged card height with subpixel tolerance. Updated guest-profile navigation test to allow only specifically named read-only POST RPCs, continuing to reject other writes and profile-view recording. No application change was needed from this validation.

Release remains pending: perform a controlled real-account booking (request -> independent reviewer approval -> investor acceptance -> both calendars, and cancellation), and verify real delivery to designated test mailboxes. Current mocks and disposable SQL do not establish deployed routing or inbox delivery. Confirm the actual production Node mail handler/route and worker scheduler before rollout; deployment includes frontend, secured mail dispatcher, two changed Edge Functions and delivery worker configuration, not just static UI files. The nine DB migrations were already applied for authorized local testing; do not blindly reapply them. Production database use does not mean these local application changes are deployed. Ask the user for explicit approval before any deployment or activation.


## Investor UI checkpoint - 2026-11-07

The user confirmed invitation-link/acceptance flows mostly work and requested a clearer UI. Implemented locally: dedicated Investors navigation; searchable investor directory; profile and per-investor meeting dialogs; focused invite/assign dialog; invitations table with confirmed revoke; review queue and settings in separate views. Removed investor controls from Attendees and replaced the embedded B2B queue with a link to Investors > Meeting requests. Desktop sidebar has visible text labels, mobile rows retain visible actions, and all new copy is EN/FR/AR.

No database mutations, deployments or Git pushes for this UI change. Existing assignment/invitation/review RPCs are reused. Build passed in `.tmp/investor-directory-build.txt`; 17 mocked browser tests passed in `.tmp/investor-directory-browser.txt`; final two mobile tests passed in `.tmp/investor-directory-mobile-final.txt`; targeted ESLint passed. The repository typecheck still has existing errors; no diagnostics for the new investor workspace/manager/copy modules. Screenshots reviewed on desktop and French/Arabic mobile. Tests do not send mail or write production data. Continue testing through localhost > event > Investors.

## Production database testing checkpoint ? 2026-11-07

This checkpoint supersedes the earlier no-database-change restriction below. The user explicitly authorized the production database changes for local manual testing and instructed **do not push; keep the frontend local**.

- Verified local and live `eventra.cloud` use project `kvfoswfaifxqnjqhftwc`.
- Saved the current public schema catalog (126 tables, 74 functions, constraints, indexes, triggers, policies and grants) in `.tmp/investor-production-schema-before.json`, plus the original scheduling function. This is a schema snapshot, not a full data backup.
- Rehearsed all nine investor migrations on the actual schema in one transaction ending in ROLLBACK, then applied the same nine in one transaction with a 3-second lock timeout and 25-second statement timeout. Applied file hashes are in `.tmp/investor-production-migration-manifest.json`. This project has no `supabase_migrations.schema_migrations` table; no migration-history table was invented.
- Set `event_review_release.ready=true` for the explicitly authorized manual testing. This is NOT evidence of production release readiness. At verification there were zero enabled event policies, zero investor designations and zero outbox jobs. The user must enable their chosen event and grant explicit permissions in the UI.
- Verified `marketing@redstart.tn` is the admin account (not the misspelling `makreting`). Capability checks with that identity report released=true, can_configure=true, can_review=false, can_designate=false. Client RPC execute grants are present for authenticated.
- Counts immediately before/after: 1,367 attendees and 314 meetings, unchanged. This is not an end-to-end registration regression test. The user previously reported registration works.
- Local server at http://127.0.0.1:3000/ returns HTTP 200. No Git push, frontend deployment, Edge Function deployment, worker execution or test-email send was performed.
- Investor email delivery is NOT running. Existing production mail routing and legacy clients are NOT secured/verified by these database changes; the coordinated mail/server/Edge rollout remains outstanding. The Vite local email middleware also still implements the legacy raw-mail contract, so new command-based general-mail flows are not an accepted test result. Do not describe this as a complete or secure production launch.
- Use the existing internal test event if desired, and set a future networking schedule before booking. Preserve real attendees and historical meetings. Manual acceptance results other than the user's registration report are pending.

## Earlier user checkpoint — manual testing deferred

The user asked to save manual testing for a later session. Resume from [the saved manual test checklist](../../investor-review-manual-tests.md). They are using `marketing@redstart.tn` as superadmin. **Do not push or deploy.** The local frontend was available on port 3000, but `.env` points to an unverified remote database, not an isolated local backend. No manual acceptance flows have been completed. Identify/prepare an isolated test environment before guiding role-based tests or changing attendee data.

Updated 2026-11-06. Resume here. Implementation is saved locally, uncommitted, not pushed, not deployed and globally disabled. Preserve the unrelated existing `build/index.html` change and `docs/reports/investissement-meetings-2026-10-24/` files.

## Confirmed rules

The user confirmed keeping these rules: organizer-created investor requests require review; nobody approves their own request; ordinary registration requirements still apply. Manual event-scoped assignment and email-bound private invitation links both work. Investor approval is separate from organizer approval. No special event IDs or reviewer identities are hardcoded.

## Implemented

- Nine migrations, `20261106180000` through `20261106235000`: release lock, event policies/permissions, investor designation/invitations, private review requests/notes/audit, protected meeting permits, transactional notification outbox, response handling, shared mail ledger, revision/rescheduling, staff batch scheduling, in-app feed, reporting, notification protections, expiry and retention helpers.
- Reviewer queue and requester tracking; private notes; aggregate JSON export; invitation pagination; explicit event settings and separate reviewer/designation permissions. EN/FR/AR and RTL interfaces.
- Inline booking and recipient response use authorized RPCs. Rescheduling preserves the original until successful replacement acceptance. Stale decisions/slot conflicts cannot silently overwrite a meeting. Staff-created protected requests cannot self-approve, including when the staff actor participates.
- Staff/manual/AI/bulk flows use the batch command. Unscheduled investor pairings remain suggestions without investor invitations. Ordinary batch retries use a private durable receipt; altered payloads under the same key fail.
- Shared mail dispatcher for all three repository handlers validates authentication, persisted entities, actual recipients and role permissions. Raw recipient/HTML sending is rejected. Protected meetings use the outbox, never this generic transport. Ordinary booking uses server-derived channel settings.
- Registration receipts, B2B access links and capacity alerts moved to the registration backend with stable delivery keys. Concurrent preparation cannot generate multiple login tokens. Browser responses never contain those tokens. Existing email/auth identity is rechecked on retries.
- Messaging/product quote alerts use persisted messages. Broadcast summaries count successful delivery, not attempted recipients. Personal connection alerts remain outside meeting approval; authorized removal and its bell are atomic.
- In-app review notifications are computed under current permissions and refresh every 30 seconds. Raw client bell writes cannot impersonate protected investor meeting notifications. Read updates cannot change notification content.
- Worker expiry, guest-history retention check and explicit payload scrubbing are implemented. No arbitrary retention schedule has been enabled.

## Latest validation evidence

- 195 SQL assertions and six two-connection races passed in `.tmp/investor-current-db.txt`.
- 36 isolated Node tests passed, including registration handler/receipts, mail authorization, delivery retries and protected response fallback rules: `.tmp/investor-current-node.txt`.
- Final combined run: 36 browser cases passed in `.tmp/investor-final-browser.txt`, including explicit permissions, creator self-review denial and seven registration cases.
- Final production build passed to isolated `.tmp/investor-review-build` in `.tmp/investor-final-build.txt`; the pre-existing tracked build output was not replaced.
- Final targeted new-module ESLint passed (`.tmp/investor-final-lint.txt`). Whitespace check passed with an existing line-ending warning.
- Full repository TypeScript check completed with application errors (`.tmp/investor-current-tsc.txt`). No diagnostics for the new investor modules or changed booking, matchmaking, messaging and notification-center modules. Do not claim a clean repository typecheck or a proven baseline for every remaining error.
- Settings screenshot inspection caught checkbox layout/copy problems; corrected, rerun and visually verified. Prior manager/mobile/RTL screenshots were also reviewed.
- Database tests use synthetic application schema plus the actual scheduling migration, not a full production migration replay. No real provider email, auth-account lifecycle or production data write was tested.

## Finish/resume work

1. Local implementation checks are complete at this checkpoint. Recheck only when new edits or deployment evidence justify it.
2. Follow [the rollout guide](../../investor-review-rollout.md). Production routing, Supabase deployment target, scheduler, staging schema and mailboxes remain unverified. Do not activate or invent Putty commands against an unknown directory/project.
3. Choose actual reviewer accounts and retention policy with the operator. Qualification/evidence requirements remain unconfirmed; no invented mandatory fields were added.

Invitation links are created for private sharing; automatic sending of investor invitation links is not implemented. Existing unused legacy email helpers fail closed without a command. Shared generic emails now use server-generated content rather than arbitrary client templates; production template/settings behavior needs staging acceptance.

## Validation commands

```powershell
node scripts/test-investor-review.mjs
node --test tests/registration-receipt.test.mjs tests/event-registration-handler.test.mjs tests/platform-mail.test.mjs tests/review-delivery.test.mjs tests/review-response-client.test.mjs
$env:RAYON_NUM_THREADS='2'
$env:GOMAXPROCS='2'
node node_modules/@playwright/test/cli.js test tests/investor-review.spec.js tests/profile-booking-panel.spec.js tests/attendee-status.spec.js tests/networking-people.spec.js tests/registration-required.spec.js tests/b2b-registration-recovery.spec.js tests/registration-profile-prefill.spec.js --config .tmp/profile-booking-playwright.config.js --workers=2 --reporter=line
node node_modules/vite/bin/vite.js build --outDir .tmp/investor-review-build
node node_modules/typescript/bin/tsc --noEmit
```

Do not run live guest networking tests or enable real email without designated accounts and authorization. The SQL runner creates/removes only its own disposable Docker database and reads no project credentials. The temporary Playwright config avoids generated-build scanning and reuses the local port 3000 server; recreate it from the repository config if missing rather than stopping an unrelated server.

## Registration browser-translation fix - 2026-11-07

Attendee recording showed the error boundary immediately after selecting Tunisia, with browser translation enabled. Local reproduction replacing text nodes with translator-style nested font elements produced removeChild NotFoundError; the same interaction without that mutation worked. This matches the recording but is not a captured stack trace from the attendee device.

Fixed only the custom-country trigger markup in 32_Event_Registration_Flow.tsx: keep a stable wrapper and a text-only label element across placeholder/selection changes; isolate the decorative flag. Translation remains supported. Country codes, validation, registration writes, auth and dropdown state logic are unchanged. The regression test failed before this fix and passed afterward. Four original/translated desktop/mobile cases also check repeat country changes, French/English/Arabic switching, preserved answers, no extra document/event fetches, no writes and no browser errors. All 11 targeted registration browser tests passed in .tmp/registration-translation-after.txt. No push, deployment, production mutation or mail send. Explicit user approval is still required before deployment.
