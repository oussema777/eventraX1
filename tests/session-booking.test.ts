import assert from 'node:assert/strict';
import test from 'node:test';
import { getBulkSessionIds, getWorkshopLimit, validateSessionSelection } from '../src/utils/sessionBooking.ts';

const sessions = [
  { id: 'talk', type: 'keynote' },
  { id: 'training', type: 'training', registration_open: false },
  { id: 'workshop-a', type: 'workshop' },
  { id: 'workshop-b', type: 'workshop' },
  { id: 'cancelled', type: 'panel', status: 'cancelled' },
];

test('closed, cancelled, and foreign sessions cannot be selected', () => {
  for (const id of ['training', 'cancelled', 'foreign']) {
    assert.equal(validateSessionSelection(sessions, new Set([id]), null), 'sessionUnavailable');
  }
});

test('workshop limit applies across the event while allowing other session types', () => {
  assert.equal(validateSessionSelection(sessions, new Set(['talk', 'workshop-a']), 1), null);
  assert.equal(validateSessionSelection(sessions, new Set(['workshop-a', 'workshop-b']), 1), 'workshopLimitReached');
  assert.equal(validateSessionSelection(sessions, new Set(['workshop-a', 'workshop-b']), 2), null);
  assert.equal(validateSessionSelection(sessions, new Set(['workshop-a', 'workshop-b']), null), null);
  assert.equal(validateSessionSelection(sessions, new Set(), 1), null);
});

test('bulk selection excludes closed sessions and leaves limited workshops to the attendee', () => {
  assert.deepEqual(getBulkSessionIds(sessions, 1), ['talk']);
  assert.deepEqual(getBulkSessionIds(sessions, null), ['talk', 'workshop-a', 'workshop-b']);
  assert.deepEqual(getBulkSessionIds(sessions.slice(2, 4), 1), []);
});

test('existing events default to unlimited workshops', () => {
  assert.equal(getWorkshopLimit(undefined), null);
  assert.equal(getWorkshopLimit(null), null);
  assert.equal(getWorkshopLimit(1), 1);
  assert.equal(getWorkshopLimit(2), 2);
});
