# Registration authentication integrity repair

Initial repair deployed to production on 13 November 2026 as `create-event-registration` version 18. Version 20 subsequently adds saved registrations with deferred networking; see `2026-11-13-registration-with-deferred-networking.md`. The existing `verify_jwt=false` setting is preserved.

## Incident and repair

1,796 existing verified email accounts had a NULL `auth.users.instance_id`, no `auth.identities` record, and NULL token/change strings. This included 85 B2B participants in L'INVESTISSEMENT. The account lookup ignored the NULL instance; after fixing that, live auth logs exposed a second failure: `confirmation_token` could not be scanned from NULL into a string. The historical process that created these incomplete accounts has not been established.

Applied `20261113180000_registration_auth_integrity.sql` and `20261113181000_registration_auth_string_fields.sql` through the management database API. Existing IDs are retained. Missing email identities are reconstructed only for verified email accounts without identities or ownership conflicts. The instance is normalized and missing token/change strings become empty strings. Existing tokens, passwords, email verification, account roles, bans and provider identities are preserved.

The restricted `registration_auth_repairs` ledger records each repaired user, previous instance, created identity ID and the names of normalized NULL fields. It contains no tokens or passwords and is inaccessible to browser roles.

## Future registrations

Before linking an existing profile or saving a newly created B2B account, the registration function calls `ensure_registration_auth_account` with the user ID and registration email. The RPC checks the authoritative auth email, locks the account and repairs the known defects idempotently. It rejects missing/mismatched accounts, disabled accounts, SSO accounts and conflicting identities. It does not create email identities for unverified addresses.

Registration then calls the actual Auth Admin API to verify that the account loads, the email matches and an identity exists. Version 18 returned a setup error on failure. The follow-up release saves admission and queues networking setup when the updated browser opts into that response contract. The repair RPC is executable only by `service_role` (and database owners).

## Verification

- 22 registration-handler and registration-receipt tests passed.
- Disposable PostgreSQL tests passed for historical and future repair, idempotence, permissions, unchanged participant relationships, OAuth preservation, conflicting identities, wrong emails, bans, SSO, unverified accounts, and NULL-string normalization without replacing active tokens.
- Production transaction assertions checked that the initial repair preserved every other auth field, all profiles, all event registrations and all event B2B meetings. Follow-up assertions allowed only NULL-to-empty-string changes in the eight specified fields.
- All 1,796 repaired accounts subsequently loaded through the real Auth Admin listing API; all created identities were verified in the database. Chahira's individual Auth Admin lookup and the deployed integrity RPC both passed.
- No NULL instances remained and no B2B participant at the reported event retained the instance/identity defect.
- Downloaded deployed function source and dependencies exactly matched the tested local source. Live anonymous RPC access was denied and the registration handler's input validation passed.
- No participant emails were sent and no participant session was opened during verification. Actual inbox delivery and a participant following a fresh login link remain user-side checks.

## Operational record

Ignored local evidence is under `.tmp/auth-account-repair-20261113/`: original function v16 backup/source, affected account IDs and hashes, repair counts, live verification summaries, and final deployed source. SQL tests can be run with `psql -v ON_ERROR_STOP=1 -f tests/registration-auth-integrity.sql` against an empty disposable database only. Handler tests use `node --test tests/event-registration-handler.test.mjs tests/registration-receipt.test.mjs`.

If a function rollback becomes necessary, deploy the backed-up v16 source with its matching shared dependencies. Retain the repaired account data: reverting it would restore the login failure. Any individual data rollback must use the restricted ledger and review subsequent activity; never delete a repaired user or replace its ID.
