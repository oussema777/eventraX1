import assert from 'node:assert/strict';
import test from 'node:test';
import { groupAgendaSessions, resolveAgendaTimeZone } from '../src/utils/agendaDates.ts';

const session = (id: string, title: string, starts_at: string) => ({ id, title, starts_at, ends_at: starts_at, day: 1 });

test('groups by actual dates despite stale day numbers and sorts simultaneous titles naturally', () => {
  const input = [session('b', 'Atelier 10', '2026-11-25T13:00:00Z'), session('c', 'Opening', '2026-11-26T08:00:00Z'), session('a', ' Atelier 2', '2026-11-25T13:00:00Z')];
  const groups = groupAgendaSessions(input, 'Africa/Tunis', 'fr');
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(g => g.sessions.map(s => s.id)), [['a', 'b'], ['c']]);
  assert.deepEqual(input.map(s => s.id), ['b', 'c', 'a']);
});

test('uses the display timezone for dates and places undated sessions last', () => {
  const input = [session('unknown', 'Pending', ''), session('late', 'Late', '2026-11-25T23:30:00Z'), session('early', 'Early', '2026-11-25T08:00:00Z')];
  const groups = groupAgendaSessions(input, 'Africa/Tunis', 'en');
  assert.deepEqual(groups.map(g => g.sessions[0].id), ['early', 'late', 'unknown']);
  assert.equal(groups[2].date, null);
  assert.equal(groupAgendaSessions(input, 'UTC', 'en').length, 2);
});

test('accepts IANA zones and safely falls back for legacy shorthand', () => {
  assert.equal(resolveAgendaTimeZone('Africa/Tunis', 'UTC'), 'Africa/Tunis');
  assert.equal(resolveAgendaTimeZone('pt', 'UTC'), 'UTC');
  assert.equal(resolveAgendaTimeZone(undefined, 'UTC'), 'UTC');
});

test('saved order overrides titles only within the same time slot and survives reordered responses and renaming', () => {
  const input = [
    { ...session('b', 'Atelier 2', '2026-11-25T13:00:00Z'), sort_order: 1 },
    { ...session('a', 'Atelier 10', '2026-11-25T13:00:00Z'), sort_order: 0 },
    { ...session('early', 'Opening', '2026-11-25T09:00:00Z'), sort_order: 99 },
    session('new', 'Added workshop', '2026-11-25T13:00:00Z'),
  ];
  for (const locale of ['en', 'fr', 'ar']) {
    assert.deepEqual(groupAgendaSessions([...input].reverse(), 'Africa/Tunis', locale)[0].sessions.map(s => s.id), ['early', 'a', 'b', 'new']);
  }
  input[1].title = 'Z renamed workshop';
  assert.deepEqual(groupAgendaSessions(input, 'Africa/Tunis', 'fr')[0].sessions.map(s => s.id), ['early', 'a', 'b', 'new']);
});
