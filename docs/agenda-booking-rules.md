# Agenda booking rules

Organizers can configure these controls in both the event creation wizard's Sessions tab and a published event's Agenda tab:

- **Open for registration**, in each session editor. Turning it off blocks new bookings while keeping the session in the programme.
- **Maximum workshops per attendee**, above the agenda. A positive integer limits sessions whose type is `workshop` across the entire event; an empty value means unlimited.

Defaults preserve existing events: all sessions are open and workshops are unlimited. Changing a rule does not remove existing bookings. Existing workshop bookings still count toward the limit, including workshops subsequently closed to new bookings. Cancelled sessions cannot receive new bookings.

Attendees choose limited workshops individually. Bulk selection selects other open sessions and retains any workshops already selected. An attendee can deselect a workshop before choosing another.

The database trigger enforces the rules for all session writes, including public-agenda changes and manual attendee additions. The registration RPC saves the attendee and session selections in one transaction, rolling back on invalid selections. Concurrent choices for one attendee are serialized by a row lock.

## Rollout

1. Apply `supabase/migrations/20260929190000_agenda_booking_rules.sql` to the target database.
2. Deploy `supabase/functions/create-event-registration`.
3. Deploy the frontend. Do not deploy the new frontend before the migration: it uses the new columns and transactional RPC.
4. For Rahaf's event, set the workshop maximum to **1**, verify the relevant workshops use the **Workshop** type, and close the training sessions she identifies. The voice note did not unambiguously identify which training sessions to close, so no event-specific data is changed by the migration.

Existing bookings are grandfathered. If the event already has attendees booked into multiple workshops, changing the limit does not cancel those bookings automatically.

## Verification

- `node --experimental-strip-types --test tests/session-booking.test.ts`
- `psql -v ON_ERROR_STOP=1 -f tests/agenda-booking.sql` **only in an empty, disposable database**. This creates fixture tables and roles, applies the migration, and checks closed sessions, cross-event choices, limits through inserts and updates, rollback, unlimited mode, and preservation of existing bookings.
- Browser verification used mocked event data to check attendee selections, keyboard interaction, mobile layout, and settings persistence without modifying a real event.

An additional two-connection PostgreSQL check confirmed that concurrent workshop bookings cannot exceed the limit.
