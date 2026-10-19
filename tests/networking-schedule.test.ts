import test from 'node:test';
import assert from 'node:assert/strict';
import { INVESTISSEMENT_EVENT_ID, allowedMeetingFormats, networkingTimeZone, networkingSlots, slotAvailability, zonedTimeToIso } from '../src/utils/networkingSchedule.ts';

const venue = { tableCount: 1, slotDuration: 30, schedules: [{ date: '2026-11-20', start: '14:00', end: '15:00' }] };
const slots = networkingSlots(venue, 'Africa/Tunis');
test('event timezone is stable across viewers and the in-person restriction applies only to this event', () => {
  assert.equal(slots[0].iso, '2026-11-20T13:00:00.000Z');
  assert.equal(slots[0].time, '14:00');
  assert.equal(networkingTimeZone(INVESTISSEMENT_EVENT_ID), 'Africa/Tunis');
  assert.deepEqual(allowedMeetingFormats(INVESTISSEMENT_EVENT_ID, { allowedMeetingFormats: ['video'] }), ['in-person']);
  assert.deepEqual(allowedMeetingFormats('other'), ['video', 'in-person', 'hybrid']);
  assert.deepEqual(allowedMeetingFormats('other', { allowedMeetingFormats: ['hybrid'] }), ['hybrid']);
});
test('duplicate schedule blocks are deduplicated and partial slots cannot run past closing time', () => {
  assert.equal(networkingSlots({ ...venue, schedules: [...venue.schedules, ...venue.schedules] }, 'Africa/Tunis').length, 2);
  assert.equal(networkingSlots({ ...venue, schedules: [{ date: '2026-11-20', start: '14:00', end: '14:45' }] }, 'Africa/Tunis').length, 1);
  assert.deepEqual(networkingSlots({ ...venue, slotDuration: 0 }, 'UTC'), []);
  assert.equal(zonedTimeToIso('2026-03-29', '02:30', 'Europe/Paris'), null);
});
test('pending meetings do not hold participant time or physical capacity', () => {
  const pending = { id: 'm', status: 'pending', start_at: slots[0].iso, end_at: slots[0].end, profile_a_id: 'a', profile_b_id: 'b', location: 'Table-01' };
  assert.equal(slotAvailability(slots[0], venue, [pending], ['a', 'c'], new Map()).available, 1);
  assert.equal(slotAvailability(slots[0], venue, [{ ...pending, status: 'confirmed' }], ['a', 'c'], new Map()).available, 0);
  assert.equal(slotAvailability(slots[0], venue, [{ ...pending, status: 'confirmed' }], ['a', 'c'], new Map(), 'm').available, 1);
});
test('overlapping confirmed meetings block participants across events but do not consume another event\'s tables', () => {
  const meeting = { id: 'm', event_id: 'other-event', status: 'confirmed', start_at: '2026-11-20T12:45Z', end_at: '2026-11-20T13:15Z', profile_a_id: 'a', profile_b_id: 'b', location: 'Table-01' };
  assert.equal(slotAvailability(slots[0], venue, [meeting], ['a', 'c'], new Map(), null, 'this-event').isConflicted, true);
  assert.equal(slotAvailability(slots[0], venue, [meeting], ['d', 'c'], new Map(), null, 'this-event').available, 1);
  assert.equal(slotAvailability(slots[1], venue, [meeting], ['a', 'c'], new Map(), null, 'this-event').available, 1);
});
test('missing availability means all slots while an empty selection means none', () => {
  assert.equal(slotAvailability(slots[0], venue, [], ['a', 'b'], new Map()).available, 1);
  assert.equal(slotAvailability(slots[0], venue, [], ['a', 'b'], new Map([['b', []]])).unavailable, true);
  assert.equal(slotAvailability(slots[0], venue, [], ['a', 'b'], new Map([['b', ['2026-11-20T14:00:00+01:00']]])).available, 1);
});
