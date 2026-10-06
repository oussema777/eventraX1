import { test, expect } from '@playwright/test';

test('organizer agenda uses real photos, honest capacity and aligned participant actions', async ({ page }) => {
  const writes = [];
  let failRoster = false;
  let checkins = [];
  let failCheckins = false;
  const sessions = [
    { id: 'one', title: "Atelier 3 : Pitcher pour convaincre : l'art de seduire un investisseur en 5 minutes", capacity: 0 },
    { id: 'two', title: "Atelier 4 : De l'idee au term sheet : simuler une vraie negociation d'investissement", capacity: 30, speaker_ids: ['speaker'] },
    { id: 'three', title: 'Atelier 2 : Investir a impact', capacity: null },
  ].map((s, index) => ({ ...s, sort_order: index, day: 1, starts_at: '2026-11-25T14:00:00Z', ends_at: '2026-11-25T17:00:00Z', status: 'confirmed', registration_open: true }));
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', r => {
    if (!['GET', 'HEAD'].includes(r.request().method())) writes.push(r.request().method());
    const url = new URL(r.request().url());
    const table = url.pathname.split('/').pop();
    if (failRoster && table === 'event_attendee_sessions' && url.searchParams.has('session_id') && url.searchParams.get('session_id').startsWith('eq.')) return r.fulfill({ status: 500, json: { message: 'Temporary failure' } });
    if (table === 'event_checkins') return failCheckins ? r.fulfill({ status: 500, json: { message: 'Unavailable' } }) : r.fulfill({ json: checkins });
    let data = [];
    if (table === 'events') data = { id: 'event-one', start_date: '2026-11-25T00:00:00Z', end_date: '2026-11-25T23:00:00Z' };
    if (table === 'event_sessions') data = sessions;
    if (table === 'event_speakers') data = [{ id: 'speaker', full_name: 'Amira Nasri', photo_url: '/agenda-photo.svg' }];
    if (table === 'event_attendee_sessions') data = [{ session_id: 'one', attendee_id: 'person', event_attendees: { id: 'person', name: 'Registered Person', email: 'person@example.test', status: 'approved', meta: { companyName: 'Solar Works', sector: 'Energy', phone: '+216 12345678' } } }];
    return r.fulfill({ json: data });
  });
  await page.route('**/agenda-photo.svg', r => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><rect width="200" height="80" fill="teal"/></svg>' }));
  await page.goto('/tests/fixtures/organizer-agenda.html');
  await expect(page.getByRole('button', { name: 'Reorder sessions', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reorder sessions', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('listitem')).toHaveCount(3);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const cards = page.locator('[data-agenda-card]');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText('Speaker to be confirmed');
  await expect(cards.nth(0).locator('img')).toHaveCount(0);
  await expect(cards.nth(0).locator('strong')).toHaveText('1');
  await expect(cards.nth(1).locator('strong')).toHaveText('0 / 30');
  await expect(cards.nth(1).locator('img')).toHaveAttribute('src', '/agenda-photo.svg');
  await expect(page.locator('img[src*="unsplash"]')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const actions = await cards.getByRole('button', { name: /View Attendees/i }).all();
  const boxes = await Promise.all(actions.map(a => a.boundingBox()));
  expect(new Set(boxes.map(b => Math.round(b.y))).size).toBe(1);
  await cards.first().locator('..').screenshot({ path: '.tmp/agenda-cards-desktop.png' });
  await actions[0].click();
  await expect(page.getByText('Registered Person', { exact: true })).toBeVisible();
  await expect(page.getByText('Solar Works', { exact: true })).toBeVisible();
  const roster = page.getByRole('dialog').filter({ has: page.getByRole('table') });
  await expect(roster.locator('[data-attendance=absent]')).toBeVisible();
  await expect(roster.locator('[data-attendance=absent]')).toHaveCSS('background-color', 'rgb(248, 113, 113)');
  checkins = [{ id: 'scan-one', attendee_id: 'person', type: 'event', session_id: null }];
  await roster.getByRole('button', { name: 'Refresh check-in status' }).click();
  await expect(roster.locator('[data-attendance=event]')).toBeVisible();
  checkins = [{ id: 'scan-two', attendee_id: 'person', type: 'session', session_id: 'other-session' }];
  await roster.getByRole('button', { name: 'Refresh check-in status' }).click();
  await expect(roster.locator('[data-attendance=event]')).toBeVisible();
  checkins = [{ id: 'scan-three', attendee_id: 'person', type: 'session', session_id: 'one' }];
  await roster.getByRole('button', { name: 'Refresh check-in status' }).click();
  await expect(roster.locator('[data-attendance=session]')).toBeVisible();
  await roster.getByRole('button', { name: 'Registered Person: Checked in to this session', exact: true }).click();
  await expect(page.getByText('Checked in to this session', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  failCheckins = true;
  await roster.getByRole('button', { name: 'Refresh check-in status' }).click();
  await expect(roster.locator('[data-attendance=unknown]')).toBeVisible();
  await expect(roster.getByText('Solar Works', { exact: true })).toBeVisible();
  failCheckins = false;
  await roster.getByRole('button', { name: 'Refresh check-in status' }).click();
  await expect(roster.locator('[data-attendance=session]')).toBeVisible();
  await roster.screenshot({ path: '.tmp/agenda-roster-desktop.png' });
  await roster.getByRole('button', { name: 'Columns', exact: true }).click();
  await page.screenshot({ path: '.tmp/agenda-column-chooser.png' });
  await page.getByRole('checkbox', { name: 'Phone', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Sector', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Company', exact: true }).uncheck();
  await page.keyboard.press('Escape');
  await expect(roster.getByRole('columnheader', { name: 'Company', exact: true })).toHaveCount(0);
  await expect(roster.getByText('+216 12345678', { exact: true })).toBeVisible();
  await roster.getByRole('searchbox').fill('Solar');
  await expect(roster.getByText('Registered Person', { exact: true })).toBeVisible();
  await roster.getByRole('searchbox').clear();
  await roster.getByRole('button', { name: 'Close', exact: true }).click();
  await actions[0].click();
  await expect(roster.getByRole('columnheader', { name: 'Phone', exact: true })).toBeVisible();
  await expect(roster.getByRole('columnheader', { name: 'Company', exact: true })).toHaveCount(0);
  await roster.getByRole('button', { name: 'Columns', exact: true }).click();
  await page.getByRole('button', { name: 'Restore default columns' }).click();
  await page.keyboard.press('Escape');
  await expect(roster.getByRole('columnheader', { name: 'Company', exact: true })).toBeVisible();
  await expect(page.locator('img[src*="unsplash"]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 });
  await expect(page.getByText('person@example.test', { exact: true })).toBeInViewport({ ratio: 1 });
  await page.getByRole('dialog').screenshot({ path: '.tmp/agenda-roster-mobile.png' });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await cards.first().locator('..').screenshot({ path: '.tmp/agenda-cards-mobile.png' });
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
  }
  failRoster = true;
  await actions[0].click();
  await expect(page.getByRole('alert')).toContainText('We could not load this roster.');
  await expect(page.getByText('No registered participants for this session.')).toHaveCount(0);
  failRoster = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Solar Works', { exact: true })).toBeVisible();
  expect(writes).toEqual([]);
});


test('roster loads every registration and fills blank fields from the linked profile', async ({ page }) => {
  const offsets = [];
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', r => {
    const url = new URL(r.request().url()), table = url.pathname.split('/').pop();
    if (table === 'event_attendee_sessions') {
      if (url.searchParams.get('session_id') !== 'eq.session-one') return r.fulfill({ json: [] });
      expect(url.searchParams.get('event_attendees.event_id')).toBe('eq.event-one');
      expect(url.searchParams.get('event_attendees.status')).toBe('in.(registered,approved)');
      const offset = Number(url.searchParams.get('offset') || 0); offsets.push(offset);
      return r.fulfill({ json: Array.from({ length: offset ? 1 : 500 }, (_, i) => ({ attendee_id: String(offset + i), event_attendees: {
        id: String(offset + i), name: 'Person ' + (offset + i), company: ' ', profile_id: offset + i === 500 ? 'profile-one' : null,
        meta: offset + i === 0 ? { companyName: 'Event Company' } : {}
      } })) });
    }
    return r.fulfill({ json: table === 'profiles' ? [{ id: 'profile-one', company: 'Account Company', job_title: 'Director', sector: 'Energy' }] : [] });
  });
  await page.goto('/tests/fixtures/organizer-agenda.html');
  offsets.length = 0;
  const result = await page.evaluate(async () => {
    const { loadDashboardSessionRoster, resolveRosterPerson } = await import('/src/lib/dashboardSessionRoster.ts');
    const rows = await loadDashboardSessionRoster('event-one', 'session-one');
    return { count: rows.length, fallback: rows.find(r => r.id === '500'), event: rows.find(r => r.id === '0'), alias: resolveRosterPerson({ id: 'alias', company: 'Old', meta: { Entreprise: 'Form Company' } }, { company: 'Account' }) };
  });
  expect(result.count).toBe(501);
  expect(offsets).toContain(500);
  expect(result.event.company).toBe('Event Company');
  expect(result.fallback.company).toBe('Account Company');
  expect(result.fallback.job).toBe('Director');
  expect(result.alias.company).toBe('Form Company');
});
