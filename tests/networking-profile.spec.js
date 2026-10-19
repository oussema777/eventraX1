import { test, expect } from '@playwright/test';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const participantId = '22222222-2222-4222-8222-222222222222';

async function openSchedule(page, { accountType = 'event_guest', unlinked = false, viewerIsB = false, event = eventId, hidden = false, missing = false } = {}) {
  const attendee = { id: 'participant-attendee', profile_id: unlinked ? null : participantId, name: 'Test Participant', company: 'Example Company', meta: { 'Job Title': 'Founder' }, status: 'approved' };
  const participant = { id: participantId, full_name: 'Test Participant', account_type: accountType, company: 'Example Company', bio: 'Participant biography' };
  const requests = [];
  await page.route('**/auth/v1/**', route => route.fulfill({ json: viewer }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    requests.push({ table, query: Object.fromEntries(url.searchParams), method: route.request().method() });
    let data = [];
    if (table === 'profiles') {
      const id = url.searchParams.get('id');
      if (id === `eq.${viewer.id}`) data = { ...viewer, full_name: 'Test Viewer' };
      else data = id?.startsWith('in.') ? (hidden || unlinked ? [] : [participant]) : hidden ? null : participant;
    }
    if (table === 'events') data = [{ id: eventId, name: 'Test Event' }];
    if (table === 'event_attendees') {
      if (url.searchParams.get('profile_id') === `eq.${viewer.id}`) data = [{ id: 'viewer-attendee' }];
      else if (url.searchParams.has('event_id')) {
        expect(url.searchParams.get('event_id')).toBe(`eq.${eventId}`);
        data = missing ? null : attendee;
      } else data = [attendee, { id: 'viewer-attendee', profile_id: viewer.id, name: 'Test Viewer' }];
    }
    if (table === 'event_b2b_meetings') data = [{
      id: '33333333-3333-4333-8333-333333333333', event_id: event, status: 'pending',
      profile_a_id: viewerIsB ? attendee.profile_id : viewer.id,
      profile_b_id: viewerIsB ? viewer.id : attendee.profile_id,
      attendee_a_id: viewerIsB ? attendee.id : 'viewer-attendee',
      attendee_b_id: viewerIsB ? 'viewer-attendee' : attendee.id,
      start_at: null, meta: {},
    }];
    return route.fulfill({ json: data });
  });
  await page.goto('/login');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
    const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: 'test-refresh' });
    if (error) throw error;
  });
  await page.goto('/my-networking');
  await expect(page.getByRole('button', { name: 'View Profile', exact: true })).toBeVisible();
  return requests;
}

test('guest meeting profiles open within their event and return to My Networking after refresh', async ({ page }) => {
  const requests = await openSchedule(page);
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}/profile/${participantId}?from=my-networking`);
  await expect(page.getByRole('heading', { name: 'Test Participant', level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Participant biography', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/my-networking');
  expect(requests.filter(r => !['GET', 'HEAD'].includes(r.method) && r.table !== 'get_profile_activity_stats')).toEqual([]);
  expect(requests.some(r => r.table === 'record_profile_view')).toBe(false);
  await page.goto(`/profile/${participantId}`);
  await expect(page.getByRole('heading', { name: 'Profile Not Found' })).toBeVisible();
});

test('member meeting profiles still open with their event context', async ({ page }) => {
  await openSchedule(page, { accountType: 'user', viewerIsB: true });
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Test Participant', level: 1 })).toBeVisible();
});

for (const viewerIsB of [false, true]) {
  test(`unlinked attendee uses registration details when viewer is participant ${viewerIsB ? 'B' : 'A'}`, async ({ page }) => {
    await openSchedule(page, { unlinked: true, viewerIsB });
    await page.getByRole('button', { name: 'View Profile', exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}/participant/participant-attendee?from=my-networking`);
    await expect(page.getByRole('heading', { name: 'Test Participant', level: 1 })).toBeVisible();
    await expect(page.getByText('Founder @ Example Company')).toBeVisible();
  });
}

test('RLS-hidden profiles fall back to available participant details', async ({ page }) => {
  await openSchedule(page, { hidden: true });
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Test Participant', level: 1 })).toBeVisible();
});

test('meetings without an event retain the regular member profile route', async ({ page }) => {
  await openSchedule(page, { accountType: 'user', event: null });
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/profile/${participantId}`);
  await expect(page.getByRole('heading', { name: 'Test Participant', level: 1 })).toBeVisible();
});

test('unavailable participants offer a return to networking', async ({ page }) => {
  await openSchedule(page, { missing: true });
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile Not Found' })).toBeVisible();
  await page.getByRole('button', { name: 'My Networking', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/my-networking');
});
