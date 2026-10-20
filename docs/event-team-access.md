# Event team access

The event dashboard's **Team & access / Équipe et accès** section lets the owner
invite colleagues without sharing credentials. Invitations are created for one
email and one event. The owner copies and shares the link; this feature does not
automatically send invitation emails.

| Role | Event operations | Team administration / delete event |
| --- | --- | --- |
| Owner | All | Yes |
| Administrator | Content, tickets, attendees, forms, B2B, check-in, notifications | No |
| Coordinator | Attendees, B2B, check-in | No |
| Check-in staff | Event/session/B2B scanners and attendance | No |

Existing platform administrators keep their support access. Event roles never
change `profiles.role` or grant platform administration.

## Invitation lifecycle

1. The owner selects an email and role and creates an invitation.
2. The recipient opens the shared link, signs in or creates an Eventra account,
   and explicitly accepts.
3. Acceptance checks the **current verified email in `auth.users`**, not editable
   profile fields or only the JWT. A forwarded link cannot grant another email access.
4. Accepted events appear in **My events**, with only permitted sections.
5. Pending invitations expire after seven days. Replacing an expired/revoked
   invitation rotates its ID. Acceptance is idempotent.
6. Revocation and role changes take effect on the next database request. Open
   screens refresh permissions on focus and every 30 seconds.

The access history records actor IDs, member email, time and role changes.
Membership mutations only use checked transactional RPCs; clients cannot write
the membership or audit tables directly.

## Deployment

`supabase/migrations/20261020120000_event_team_access.sql` was applied to the linked
Supabase project `kvfoswfaifxqnjqhftwc` on **2026-10-20**. The local frontend uses
this same database. The website frontend has not been published as part of this
database fix. No Edge Function or email-provider deployment is needed for the
share-link invitation flow.

The migration was exercised locally with synthetic users and a schema/policy
copy. Immediately before deployment, the live schema was checked against that
snapshot and was unchanged. Deployment used one Management API transaction with
a five-second lock timeout and a PostgREST schema reload. This project did not
have a `supabase_migrations.schema_migrations` history table; do not replay this
non-idempotent migration against the linked project.

Post-deployment checks confirmed that the real event owner can read memberships
and audit entries and execute the invitation function. An unrelated account has
no team access, anonymous users cannot invite, and authenticated clients cannot
directly write memberships. The REST role endpoint is available. Public event,
attendee and session read counts matched their pre-deployment values. These live
checks were read-only; no real invitation was created or sent.

This is more than an additive table migration: it replaces two permissive legacy
B2B/notification settings policies, restricts notification-log writes, prevents
self-assigned platform roles, protects ownership, limits scanner updates, and
enables RLS on currently unused legacy event tables. Review any external legacy
client that might still write those imported tables before deploying.

The current app's public event, attendee directory and registration policies are
preserved. Existing owners have a frontend fallback if the role RPC has not yet
been deployed; delegation remains unavailable until the migration exists.

Do not roll back just the role policies while staff invitations remain active.
If disabling the feature, revoke memberships first and retain the security fixes.

## Verification

- `npx playwright test tests/event-team.spec.js tests/event-auth.spec.js tests/attendee-experience.spec.js tests/meeting-scanner.spec.js`
- Run `tests/event-team-access.sql` with `psql -v ON_ERROR_STOP=1` against an
  isolated database containing the app schema and migration. It rolls back its
  synthetic fixtures. Never run this test script against production.
- `npm run build`

SQL tests cover roles, event isolation, pending/expired/revoked invitations,
wrong/unverified email, ownership and platform-role escalation, direct membership
writes, scanner column restrictions, two-person meeting attendance, revocation
without JWT renewal, audit entries, and public-read compatibility.

Browser tests cover invitation creation/cancellation/acceptance, signup redirect,
direct-route guards, shared event discovery, role-specific navigation, permission
refresh, and French/Arabic mobile layouts. OAuth is simulated, not a real Google
account login.

## Existing limitation outside the database boundary

The existing generic mail transports (`server.cjs`, `api/send-email.js`, and
`email-proxy.js`) accept caller-supplied email content without authenticating or
authorizing the sender. The team feature does not use these transports, but the
existing broadcast UI does. Database permissions protect notification settings
and logs; they **do not** secure that generic email endpoint. Hardening it requires
authenticated, server-validated templates/recipients and a review of existing
public registration and inquiry mail flows. Do not describe broadcasts as fully
role-enforced until that separate transport issue is fixed.

Design references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [PostgreSQL policy combination](https://www.postgresql.org/docs/17/sql-createpolicy.html).
Permissive policies combine with OR; explicit restrictive meeting boundaries
prevent older permissive rules from bypassing the new checks.
