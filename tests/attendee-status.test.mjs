import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const code = stripTypeScriptTypes(readFileSync(new URL('../src/lib/attendeeStatus.ts', import.meta.url), 'utf8'));
const { attendeeStatus, attendeeStatusCounts, attendeeStatusLabel } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

test('public registrations remain distinct from manual approval and reconcile with total', () => {
  const rows = [...Array.from({ length: 164 }, () => ({ status: 'approved' })), ...Array.from({ length: 14 }, () => ({ status: 'registered' }))];
  const counts = attendeeStatusCounts(rows);
  assert.equal(counts.approved, 164);
  assert.equal(counts.registered, 14);
  assert.equal(counts.pending || 0, 0);
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 178);
});

test('every status has a matching count and filter, including legacy and unknown states', () => {
  const rows = ['registered', ' APPROVED ', 'cancelled', 'rejected', 'waitlisted', 'declined', 'custom_state', null, ''].map(status => ({ status }));
  const counts = attendeeStatusCounts(rows);
  for (const [status, count] of Object.entries(counts)) {
    assert.equal(rows.filter(row => attendeeStatus(row.status) === status).length, count);
  }
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), rows.length);
  assert.equal(counts.pending, 2);
  assert.equal(attendeeStatusLabel('cancelled'), 'Cancelled');
  assert.equal(attendeeStatusLabel('custom_state'), 'Custom State');
  assert.equal(Object.keys(attendeeStatusCounts([])).length, 0);
});
