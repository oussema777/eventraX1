import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEventSector, sectorOptions } from '../src/utils/eventNetworkingFields.ts';

test('event sector wins over a different account sector without changing either record', () => {
  const registration = { sector: ' Energy ' }, profile = { sector: 'Technology' };
  assert.equal(resolveEventSector(registration, profile), 'Energy');
  assert.equal(profile.sector, 'Technology');
  assert.equal(registration.sector, ' Energy ');
});
test('falls back through legacy event fields and account fields, ignoring whitespace', () => {
  assert.equal(resolveEventSector({ sector: ' ', Industry: 'Finance' }, { sector: 'Tech' }), 'Finance');
  assert.equal(resolveEventSector({}, { sector: ' Tech ' }), 'Tech');
  assert.equal(resolveEventSector({}, { industry: 'Health' }), 'Health');
  assert.equal(resolveEventSector(), null);
});
test('sector options combine event and account values with case-insensitive deduplication', () => {
  assert.deepEqual(sectorOptions([{ sector: 'Energy' }, { sector: ' energy ' }, { sector: null }, { sector: 'Technology' }]).map(s => s.toLowerCase()), ['energy', 'technology']);
});
