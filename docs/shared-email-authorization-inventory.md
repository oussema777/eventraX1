# Shared email authorization migration inventory

Current release checkpoint (2026-11-07): the repository mail handlers now use the authorized dispatcher; earlier raw-relay descriptions below are historical. Production VPS service routing and worker activation remain pending. See [the coordinated release instructions](releases/2026-11-07-investor-registration.md) before deployment.

> Updated implementation status: the migration described below is now implemented locally. All three handlers import the same authenticated dispatcher in `server/platform-mail.mjs`; arbitrary recipient/HTML payloads are rejected. Active callers use persisted-entity commands, registration receipts/access/capacity use the Edge backend, and protected meeting notices use the private outbox. Node authorization/receipt tests pass. Production routing and real-provider behavior remain unverified; see [rollout guide](investor-review-rollout.md). The source-behavior tables below describe the pre-migration inventory, retained for review, not the current handler code.


Source inspection checkpoint: 2026-11-06. This inventory separates verified repository callers from proposed replacement authorization. Production routing, active deployed handlers and provider configuration remain unverified. The investor feature remains release-locked until these routes cannot forge protected meeting mail.

## Existing transports

| Handler | Verified source behavior | Required replacement |
| --- | --- | --- |
| `server.cjs` | Express `/api/send-email`; caller chooses recipient, subject and HTML; logs recipient/subject; uses Resend. | Shared authorized command dispatch, safe logs, bounded payloads and rate limits. |
| `api/send-email.js` | Serverless POST handler; same arbitrary content; CORS is not caller authorization. | Same command authorization as the VPS handler; no alternate permissive deployment. |
| `email-proxy.js` | HTTP `/send-email` forwarding to Resend with caller content. | Remove from public routing after replacement or apply the same command boundary. |

The browser entry point is `src/lib/email.ts::sendEmail`. Requiring a JWT alone would still let any signed-in attendee forge arbitrary platform email. Client-supplied `event_id`, `meeting_id`, `kind` or HTML must not be treated as authorization.

## Caller migration matrix

| Flow and verified caller | Authoritative source and authorization required before replacing it |
| --- | --- |
| Registration confirmation: `32_Event_Registration_Flow.tsx` | Registration transaction/record, actual event, selected sessions, registration notification settings and verified delivery address. Support anonymous registration without exposing a public arbitrary-content route. Move rendering to the registration backend; do not require an existing login for a normal public registration. |
| B2B access registration mail: `create-event-registration` Edge Function | Already has a server delivery path and `access_email_sent` response. Coordinate receipt ownership so normal registration does not send duplicate access mail or invent a successful delivery. |
| Capacity alerts: registration flow | Actual persisted registration count and event owner; deduplicate threshold crossings on the server. The registering attendee must not choose owner/recipient or count. |
| Registration cancellation: `EventAttendeesTab` | Event attendee-management permission and persisted status transition; recipient from registration. |
| Welcome: `ModalRegistrationEntry` | Authenticated current account, own destination, idempotent welcome delivery; no caller-chosen target or profile URL. |
| Event approved/rejected: `AdminDashboard` | Platform administrator permission, actual event moderation transition and owner. |
| Protected meeting submissions/decisions: `BookMeetingModal`, review queue | Implemented private commands and outbox. The protected path does not use generic browser mail. |
| Protected meeting confirmations/declines/cancellations: `UserB2BCenter` | Now handled by response RPC + transactional trigger/outbox; updated UI skips generic email and direct bell insertion. Historical clients can still call legacy email routes, so the shared-route blocker remains. |
| Ordinary meeting responses, scheduling/rescheduling: `UserB2BCenter`, `BookMeetingModal` | Persisted meeting and authorized participant/staff action; derive partners, time, format, locale and destination server-side. Preserve ordinary-event behavior while moving delivery. |
| B2B invitation/match/bulk mail: `EventB2BMatchmakingTab` | Event B2B permission, real event attendees and authorized meeting/match records. Protected recipients must use the agreed review workflow, including staff/bulk rules still awaiting confirmation. |
| Check-in alert: `EventDayOfTab` | Authorized check-in role, persisted check-in record and confirmed meeting. A client cannot choose arbitrary partner or check-in state. |
| Connection request/acceptance: `UserB2BCenter` | Authenticated actor, actual connection transition and authorized counterpart; derive generic content. Connections remain separate from investor meeting review. |
| Message notification: `UserMessagesCenter` | Persisted message and conversation membership; derive recipient and generic notification. Keep message content out of email. Direct messaging remains outside meeting review. |
| Broadcast: `EventNotificationCenterTab` | Explicit event permission, event-scoped recipient selection, approved sender/content policy and rate limits. Organizer-authored broadcast content is a separate authorized capability, not an exemption for arbitrary attendee mail. |
| Product inquiry: `BusinessProductPage` | Persisted inquiry and product ownership, validated contact identity, abuse controls for any anonymous flow; server-derived destination. |

Additional exported helpers in `email.ts` (waitlist, quote responses and post-event summaries) have no caller in the inspected TSX search. This is not proof they are unused by deployed bundles or external consumers. Verify before removing them.

## Safe migration order

1. Verify production route ownership and obtain a complete current caller list without exposing secrets or contact data.
2. Move public registration receipts into the existing backend with idempotent delivery and notification-setting checks. Test anonymous, signed-in, duplicate, paid/private/full and B2B-access scenarios.
3. Move remaining participant flows to authenticated commands based on persisted entities; move organizer/admin flows to explicit role-checked commands. Add shared authorization tests against all three transports or remove unused transports from deployment.
4. Switch browser callers to identifiers and allowed actions, with no caller-supplied email/HTML authority. Only after replacement tests pass, reject the generic arbitrary-content contract. Do not silently retain a permissive compatibility fallback.
5. Verify old browser bundles cannot send unapproved meeting mail; verify registration/team/access mail still works; review in-app notification insert policies independently. Only then satisfy this release gate.

The dispatcher is implemented in source; deployed routing has not been changed or verified. No live email sends were performed.
