import assert from 'node:assert/strict';
import test from 'node:test';
import { eventPublicPath, isEventSlug, suggestEventSlug } from '../src/utils/eventLinks.ts';
import { publicEventPath, resolveEventPreview } from '../scripts/event-preview.js';

const id = '769d7854-9bae-49e6-9db9-c88c0586a402';
test('brand names are safe path segments, never UUIDs or query syntax', () => {
  for (const value of ['', 'aa', 'Event Name', '-event', 'event--name', 'event/', 'event?x=1', id, 'a'.repeat(81)]) {
    assert.equal(isEventSlug(value), false, value);
  }
  assert.equal(isEventSlug('forum-2026'), true);
  assert.equal(suggestEventSlug('  Événement & Forum 2026! '), 'evenement-forum-2026');
});
test('browser, social previews and sitemap agree on short canonical paths and ID fallback', () => {
  for (const seo_slug of [null, '', 'forum-2026', 'invalid/slug', id]) {
    for (const section of ['landing', 'agenda', 'register']) {
      const event = { id, seo_slug };
      assert.equal(eventPublicPath(event, section), publicEventPath(event, section));
    }
  }
  assert.equal(eventPublicPath({ id, seo_slug: 'forum-2026' }), '/event/forum-2026');
  assert.equal(eventPublicPath({ id }), `/event/${id}/landing`);
});
test('old and new aliases resolve the same event, with current canonical metadata', async () => {
  const calls: string[] = [];
  const get = async (table: string, query: string) => {
    calls.push(table);
    const params = new URLSearchParams(query);
    if (table === 'event_url_aliases') return [{ event_id: id }];
    assert.equal(params.get('id'), `eq.${id}`);
    return [{ id, seo_slug: 'new-name', name: 'Forum' }];
  };
  for (const link of [id, 'old-name', 'new-name']) {
    assert.equal((await resolveEventPreview(get, link))?.path, '/event/new-name');
  }
  assert.equal(calls.filter(t => t === 'event_url_aliases').length, 2);
  assert.equal(await resolveEventPreview(async () => [], 'missing-name'), null);
});
