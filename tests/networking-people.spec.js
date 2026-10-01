import { test, expect } from '@playwright/test';

async function openHub(page, { empty = false, fail = false } = {}) {
  const user = { id: '11111111-1111-4111-8111-111111111111', email: 'guest@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: { account_type: 'event_guest' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
  const participants = [
    { id: '22222222-2222-4222-8222-222222222222', full_name: 'Amira Mansour', company: 'Solar Works', job_title: 'Founder', sector: 'Energy', interests: ['Investment'] },
    { id: '33333333-3333-4333-8333-333333333333', full_name: 'Sami Ben Ali', company: 'Atlas Tech', job_title: 'Engineer', sector: 'Technology', interests: ['Partnerships'] },
  ];
  const directoryRequests = [];
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: '22222222-2222-4333-8444-555555555555', name: 'Business Forum', start_date: '2026-12-01' };
    if (table === 'profiles') {
      if (url.searchParams.get('id')?.startsWith('in.')) {
        expect(url.searchParams.get('select')).not.toMatch(/email|phone|\*/);
        data = participants;
      } else data = { ...user, full_name: 'Current Guest' };
    }
    if (table === 'event_attendees') {
      if (url.searchParams.has('meta->>b2bOptIn')) {
        directoryRequests.push(Object.fromEntries(url.searchParams));
        if (fail) return route.fulfill({ status: 500, json: { message: 'Temporary error' } });
        data = empty ? [] : participants.map(person => ({ profile_id: person.id }));
      } else if (url.searchParams.get('select') === 'event_id') data = { event_id: '22222222-2222-4333-8444-555555555555' };
      else data = [{ id: 'self-attendee' }];
    }
    if (table === 'event_b2b_settings') data = null;
    return route.fulfill({ json: data });
  });
  await page.goto('/event/22222222-2222-4333-8444-555555555555/register');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const { error } = await supabase.auth.setSession({
      access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`,
      refresh_token: 'test-refresh-token',
    });
    if (error) throw error;
  });
  await page.goto('/event/22222222-2222-4333-8444-555555555555/networking');
  return directoryRequests;
}

test('event guests discover opted-in participants, search, and request a meeting', async ({ page }, testInfo) => {
  const requests = await openHub(page);
  await expect(page.getByRole('button', { name: 'People', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Amira Mansour' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sami Ben Ali' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('people-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('people-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(requests[0]).toMatchObject({ event_id: 'eq.22222222-2222-4333-8444-555555555555', status: 'eq.registered', 'meta->>b2bOptIn': 'eq.true', profile_id: 'neq.11111111-1111-4111-8111-111111111111' });
  await page.getByRole('searchbox').fill('Solar');
  await expect(page.getByRole('heading', { name: 'Sami Ben Ali' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Request meeting', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Schedule Meeting' })).toBeVisible();
  await expect(page.getByText('With Amira Mansour', { exact: true })).toBeVisible();
});

test('empty directory explains that more participants can join', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHub(page, { empty: true });
  await expect(page.getByText('No other B2B participants yet. Check back as more people join.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request meeting' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('directory failures show retry instead of pretending there are no participants', async ({ page }) => {
  await openHub(page, { fail: true });
  await expect(page.getByRole('alert')).toContainText('We could not load participants.');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
