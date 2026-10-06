import test from 'node:test';
import assert from 'node:assert/strict';
import { rankEventParticipants, nextMatchBatch } from '../src/utils/eventRecommendations.ts';

const people = [
  { id: 'a', full_name: 'Viewer A', sector: 'Energy', interests: ['Investment'] },
  { id: 'b', full_name: 'Viewer B', sector: 'Technology', interests: ['Hiring'] },
  { id: 'c', full_name: 'Energy investor', sector: 'energy ', interests: [' investment ', 'Investment'] },
  { id: 'd', full_name: 'Tech recruiter', sector: 'Technology', interests: ['Hiring'] },
  { id: 'e', full_name: 'No shared details', sector: 'Agriculture', interests: [] },
];

test('new batches preserve ranking, avoid repeats until exhausted, and handle a small pool honestly', () => {
  const ranked = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id }));
  const next = nextMatchBatch(ranked, ['a', 'b', 'c']);
  assert.deepEqual(next.batch.map(p => p.id), ['d', 'e']);
  assert.equal(next.restarted, false);
  const restarted = nextMatchBatch(ranked, next.seenIds);
  assert.equal(restarted.restarted, true);
  assert.deepEqual(restarted.batch.map(p => p.id), ['a', 'b', 'c']);
  assert.equal(nextMatchBatch([{ id: 'a' }], ['a']).restarted, true);
  assert.deepEqual(nextMatchBatch([], ['a']).batch, []);
});

test('different participant preferences produce different rankings with actual reasons', () => {
  const a = rankEventParticipants(people, 'a'), b = rankEventParticipants(people, 'b');
  assert.deepEqual(a.map(p => p.id), ['c']);
  assert.deepEqual(b.map(p => p.id), ['d']);
  assert.equal(a[0].sameSector, true);
  assert.equal(a[0].sharedInterests.length, 1);
  assert.equal(a[0].score, 100);
});

test('scores use fixed weights and the share of the viewer interests covered', () => {
  const ranked = rankEventParticipants([
    { id: 'me', full_name: 'Me', sector: 'Energy', interests: ['Investment', 'Hiring'] },
    { id: 'both', full_name: 'Both', sector: 'Energy', interests: ['Investment', 'Hiring'] },
    { id: 'one', full_name: 'One', sector: 'Energy', interests: ['Investment'] },
    { id: 'sector', full_name: 'Sector', sector: 'Energy', interests: [] },
    { id: 'interest', full_name: 'Interest', sector: 'Other', interests: ['Hiring'] },
  ], 'me');
  assert.deepEqual(ranked.map(p => [p.id, p.score]), [['both', 100], ['one', 65], ['interest', 35], ['sector', 30]]);
  assert.equal(ranked[1].sectorPoints, 30);
  assert.equal(ranked[1].interestPoints, 35);
});

test('missing interests never turn a sector-only match into a full score', () => {
  const result = rankEventParticipants([{ id: 'me', full_name: 'Me', sector: 'Energy' }, { id: 'other', full_name: 'Other', sector: 'Energy' }], 'me');
  assert.equal(result[0].score, 30);
});

test('no viewer or insufficient preferences never falls back to arbitrary first names', () => {
  assert.deepEqual(rankEventParticipants(people, 'missing'), []);
  assert.deepEqual(rankEventParticipants([...people, { id: 'blank', full_name: 'Blank', interests: [] }], 'blank'), []);
});

test('deduplicates people, excludes self, and remains stable under input reordering', () => {
  assert.deepEqual(rankEventParticipants([...people, people[2]], 'a').map(p => p.id), ['c']);
  assert.deepEqual(rankEventParticipants([...people].reverse(), 'a'), rankEventParticipants(people, 'a'));
});
