# Investor review manual testing — resume next session

Saved 2026-11-06 at the user's request. Manual acceptance testing has not started. The user is signed in locally as superadmin `marketing@redstart.tn`.

## Attendee discovery update - 2026-11-07

The attendee-facing investor directory is now at `/event/:eventId/investors` (UUID and public slug routes). The event menu has a visible Investors entry, including text on mobile. A prominent card after the first event landing block and on participant/networking pages links to the directory. Networking also has an Investors tab. Small investor-only filter checkboxes were removed; existing participant investor badges remain.

Cards show public networking profile fields, View profile and Request a meeting. Existing booking approval and eligibility rules are reused. Anonymous users see sign-in/registration links; unregistered users cannot load the showcase roster. Event auth destinations now recognize investors. Registration opt-in and profile networking visibility remain required for directory inclusion. No schema, live attendee changes, emails or deployment for this UI work.

The user refined the promo card: retain its location/size, use a handshake icon, and explicitly say Meet the investors / Rencontrez les investisseurs, with a View investors CTA and project-presentation copy.

Validation: six showcase browser tests pass, including actual booking modal submission to the review RPC with zero direct meeting/email writes. Four existing networking people tests pass. Desktop and French/Arabic mobile screenshots reviewed. Targeted lint passes; existing repository type errors remain, with no new showcase module diagnostics. Final build recorded in `.tmp/investor-showcase-build-final.txt`.

## Team permissions update - 2026-11-07

Investors > Settings now supports selecting several eligible team members and granting permissions together. Existing rights are retained when adding rights. The People with access list shows all stored grants, flags inactive event-team access, and allows individual permission changes or removal. Partial failures refresh the list and leave only failed members selected for retry. No production rights were changed during development; tests mock the API.

The event sidebar Forms translation now resolves in EN/FR/AR. Review toolbar and participant action buttons use consistent spacing. Build and targeted lint passed; all 20 investor browser cases passed across the main run and corrected asynchronous-checkbox retest. French mobile settings and toolbar screenshots were reviewed.

## UI update - 2026-11-07

Investor management now has a dedicated **Investors** item in event navigation. Attendees no longer contains investor forms. Open Investors for Directory, Invitations, Meeting requests and Settings. The B2B page links to the same Meeting requests view.

- Directory: search name/company/email, View details/full profile, or Meetings for one investor.
- Add investor: choose a private invitation link or an existing eligible registered attendee. Existing-invitation decisions retain the original validation.
- Invitations: status/expiry table and confirmed revoke action.
- Settings: enable event review and grant existing permissions.
- Profile details: removing investor access requires confirmation; it does not delete registration.
- Desktop navigation displays labels; mobile directory rows expose View and Meetings without horizontal scrolling. English, French and Arabic are supported.

Implementation is local only. No database changes or deployment were made for this UI update. Automated checks use mocked requests, not real attendee actions.

## Latest checkpoint ? 2026-11-07

The user authorized production database changes for local testing, with no Git push or frontend deployment. All nine investor migrations are applied and the global controls gate is open. Individual events remain disabled until configured. Refresh localhost, open Manage event ? Attendees ? Investor review settings, enable the selected event, select your team identity, grant Manage investor access / Review meeting requests as needed, and save. Superadmin does not automatically grant those two permissions. Use another reviewer for requests you create or participate in.

The verified account is `marketing@redstart.tn`. Registration was reported working by the user. Investor email delivery is not running; shared mail/Edge deployment and end-to-end mail acceptance remain outstanding. Review the current handoff before expanding tests or treating this as a production release.

## Earlier constraints (superseded where noted above)

- User explicitly instructed: **do not push or deploy**. This instruction remains in force.
- Local frontend was responding at `http://127.0.0.1:3000/`. Verify the server is still running next session.
- `.env` configures a remote Supabase endpoint. Whether it is production or staging is **unverified**. Localhost does not imply an isolated database.
- New investor migrations have not been deployed by this work. Release remains disabled. Missing investor controls on the existing connection are expected, not evidence of a UI failure.
- Do not change real attendees, enable the remote release gate, or send real invitations to execute this checklist. Prepare/identify an isolated test backend first, respecting the no-deployment instruction. Complete historical-schema compatibility is not yet established.
- Automated local tests already passed; see the implementation handoff for counts and limitations. They do not replace this manual acceptance run.

## Test identities and setup

Use separate browser profiles, not multiple tabs sharing one login:

| Identity | Purpose |
| --- | --- |
| `marketing@redstart.tn` | Superadmin: configure the test event and explicit permissions |
| Separate reviewer | Review requests, including ones created by the superadmin |
| Ordinary attendee | Request meetings |
| Investor | Receive approved invitations and accept/decline |

The three additional account identities/mailboxes have not been supplied or created. Use designated test identities. Superadmin status alone does not automatically grant investor-review permission.

Prepare a test event with a future networking schedule, eligible registrations, complete booking profiles and at least two slots. Prepare a second ordinary event to check event isolation. Verify test email routing before any real-provider sends; use a local capture or controlled mailboxes as appropriate. Do not claim email delivery was tested when only the in-app flow was exercised.

## Ordered checklist

All rows are **not yet manually tested**. For each, record pass/fail, the test event/account, actual result and any issue. Keep invitation secrets and private contact data out of the report.

| # | Action | Expected result |
| --- | --- | --- |
| 1 | Manage event → Investors → Settings | Enable review in the isolated environment; assign separate reviewer and investor-management permissions explicitly |
| 2 | Assign an existing attendee as Investor | Canonical Investor badge appears within that event |
| 3 | Create a private investor invitation and open it as the intended account | Normal registration remains required; explicit acceptance grants investor status |
| 4 | Open the same invitation as another account | Wrong account cannot claim investor access |
| 5 | As attendee, request a meeting from the investor's profile | Inline booking; receipt says Awaiting organizer review |
| 6 | Check investor account before approval | No meeting invitation or submission notification is visible |
| 7 | Reviewer: Manage event → Investors → Meeting requests; approve | One pending invitation is forwarded to the investor; it is not yet confirmed |
| 8 | Investor accepts | Meeting becomes confirmed for both participants |
| 9 | Submit another request; reviewer rejects | Requester sees rejection; investor receives no invitation |
| 10 | Withdraw or revise an unapproved request | Withdrawn request cannot be approved; revised request requires a fresh decision |
| 11 | Propose a replacement time for a confirmed meeting | Original remains until replacement acceptance; failed/declined replacement does not cancel original |
| 12 | Organizer creates an investor meeting | Review is still required; creator cannot approve their own request |
| 13 | Occupy the proposed slot before approval/acceptance | No double booking; stale slot requires recovery/new time |
| 14 | Revoke reviewer permission | Revoked account loses review access, including on refresh and new actions |
| 15 | Test ordinary attendees and the second event | Normal booking works; investor status and permissions do not carry across events |

## Additional checks before release

- Invite revocation, expiry, repeated acceptance and normal registration recovery.
- Assignment with existing pending invitations: explicitly test preserve versus move into review. Confirmed meetings survive either choice.
- Investor decline, participant cancellation, replacement cancellation and duplicate-click/retry behavior.
- Staff/manual/AI/bulk paths: unscheduled investor suggestions do not generate investor-facing invitations.
- Private reviewer notes stay team-only; report exports contain aggregate data rather than notes or participant details.
- In-app read state and notifications: no premature investor notice and no duplicate delivery. Test email separately when configured and authorized.
- Direct messages and personal connections remain usable outside meeting review.
- Registration, B2B account access, duplicate recovery, check-in and broadcasts remain functional. Real paid/private/full-event requirements still need verification.
- French, English and Arabic/mobile layouts; refresh and account switching must not expose the previous account's private data.

## Resume instruction

Read this checklist and `docs/superpowers/plans/2026-11-06-investor-review-handoff.md`. Recheck the local server and database target without exposing credentials. Start with isolated test-environment preparation; do not push, deploy or modify the unverified remote database. Then guide the user through the checklist one role and one flow at a time. Do not mark any manual test passed based only on automated results.

Related release prerequisites: [rollout guide](investor-review-rollout.md).
