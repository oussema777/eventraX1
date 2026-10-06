import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const ids = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444'];
const profiles = [
  { id: ids[0], full_name: 'Viewer A', sector: 'Energy', interests: ['Investment'] },
  { id: ids[1], full_name: 'Viewer B', sector: 'Technology', interests: ['Hiring'] },
  { id: ids[2], full_name: 'Energy investor', sector: 'Energy', interests: ['Investment'] },
  { id: ids[3], full_name: 'Tech recruiter', sector: 'Technology', interests: ['Hiring'] },
];

async function setup(page, { viewer = 0, signedIn = true, failed = false, disabled = false, registered = true, optIn = true, preferences = true, extraMatches = false, avatar = false } = {}) {
  const user = { id: ids[viewer], email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
  const participants = [...profiles, ...(extraMatches ? Array.from({ length: 4 }, (_, i) => ({ id: `extra-${i}`, full_name: `New match ${i + 1}`, sector: 'Energy', interests: ['Investment'] })) : [])];
  if (avatar) participants.forEach(p => { p.avatar_url = '/test-avatar.svg'; });
  await page.route('**/test-avatar.svg', r => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><rect width="400" height="100" fill="#2563eb"/></svg>' }));
  const state = { failed, writes: [], directoryRequests: 0, pending: null };
  await page.route('**/auth/v1/**', r => r.fulfill({ json: user }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    if (!['GET', 'HEAD'].includes(route.request().method())) state.writes.push(table);
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Business Forum', status: 'published' };
    if (table === 'profiles') data = url.searchParams.get('id')?.startsWith('in.') ? participants.map(p => ({ ...p, sector: !preferences && p.id === user.id ? null : p.sector, b2b_enabled: !(disabled && p.id === ids[2]) })) : { ...user, ...(participants.find(p => `eq.${p.id}` === url.searchParams.get('id')) || participants[viewer]) };
    if (table === 'event_attendees') {
      if (url.searchParams.get('select') === 'id,status,b2b_opt_in:meta->b2bOptIn') data = registered ? { id: 'registration', status: 'approved', b2b_opt_in: optIn } : null;
      else if (url.searchParams.has('meta->>b2bOptIn')) {
        expect(url.searchParams.get('event_id')).toBe(`eq.${eventId}`);
        expect(url.searchParams.get('status')).toBe('in.(registered,approved)');
        state.directoryRequests++;
        if (state.pending) await state.pending;
        if (state.failed) return route.fulfill({ status: 500, json: { message: 'Temporary failure' } });
        data = participants.map(p => ({ profile_id: p.id, sector: !preferences && p.id === user.id ? null : p.sector, interests: !preferences && p.id === user.id ? [] : p.interests }));
      } else if (url.searchParams.get('select') === 'id') data = { id: 'registration' };
      else if (url.searchParams.has('profile_id')) { const p = participants.find(p => `eq.${p.id}` === url.searchParams.get('profile_id')); data = p ? { id: p.id, profile_id: p.id, name: p.full_name, meta: {} } : null; }
      else data = participants.map(p => ({ id: p.id, profile_id: p.id, name: p.full_name, meta: {} }));
    }
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-3/4' }, body: '' });
    return route.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/attendees`);
  if (signedIn) await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test' });
  });
  return state;
}

for (const viewer of [0, 1]) test(`viewer ${viewer} gets a relevant recommendation and a working event profile`, async ({ page }) => {
  const state = await setup(page, { viewer });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  const expected = viewer === 0 ? 'Energy investor' : 'Tech recruiter';
  await expect(section.getByRole('heading', { name: expected, exact: true })).toBeVisible();
  await expect(section.locator('article')).toHaveCount(1);
  await expect(section.getByLabel('Match score: 100/100')).toHaveText('100/100');
  await expect(section).toContainText(viewer === 0 ? 'Shared interests: Investment' : 'Shared interests: Hiring');
  await expect(page.getByText('High Compatibility')).toHaveCount(0);
  if (viewer === 0) {
    await section.screenshot({ path: '.tmp/rahaf-matches-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag: el.tagName, text: el.textContent?.slice(0, 50), width: el.getBoundingClientRect().width })).slice(0, 8));
    expect(overflow).toEqual([]);
    await section.screenshot({ path: '.tmp/rahaf-matches-mobile.png' });
  }
  await section.getByRole('button', { name: 'View Profile' }).click();
  await expect(page).toHaveURL(new RegExp(`/event/${eventId}/profile/`));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: expected, exact: true, level: 1 })).toBeVisible();
  expect(state.writes).toEqual([]);
});

test('anonymous visitors do not receive fabricated recommendations', async ({ page }) => {
  const state = await setup(page, { signedIn: false });
  await expect(page.getByText('Sign in to see your personalized suggestions')).toBeVisible();
  expect(state.directoryRequests).toBe(0);
});

test('networking-disabled profiles are not recommended', async ({ page }) => {
  await setup(page, { disabled: true });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  await expect(section).toContainText('No shared-interest matches yet.');
  await expect(section.locator('article')).toHaveCount(0);
});

test('failed recommendations show retry and recover', async ({ page }) => {
  const state = await setup(page, { failed: true });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  await expect(section.getByRole('alert')).toContainText('We could not load your suggestions.');
  state.failed = false;
  await section.getByRole('button', { name: 'Try again' }).click();
  await expect(section.getByRole('heading', { name: 'Energy investor' })).toBeVisible();
});

test('unregistered viewer gets an explicit registration message', async ({ page }) => {
  const state = await setup(page, { registered: false });
  await expect(page.getByRole('region', { name: 'Matchmaking suggestions' })).toContainText('This account is not registered for this event.');
  expect(state.directoryRequests).toBe(0);
});

test('registered viewer without B2B opt-in gets an explicit opt-in message', async ({ page }) => {
  const state = await setup(page, { optIn: false });
  await expect(page.getByRole('region', { name: 'Matchmaking suggestions' })).toContainText('B2B is not enabled on your event registration.');
  expect(state.directoryRequests).toBe(0);
});

test('viewer without sector or interests gets a preferences message', async ({ page }) => {
  await setup(page, { preferences: false });
  await expect(page.getByRole('region', { name: 'Matchmaking suggestions' })).toContainText('Add your sector or interests');
});

test('generation reloads data and shows unseen matches before cycling to the best matches', async ({ page }) => {
  const state = await setup(page, { extraMatches: true });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  await expect(section.locator('article h4')).toHaveText(['Energy investor', 'New match 1', 'New match 2']);
  const before = state.directoryRequests;
  let release;
  state.pending = new Promise(resolve => { release = resolve; });
  await section.getByRole('button', { name: 'Generate new matches' }).click();
  await expect(section.getByRole('button', { name: 'Generating matches…' })).toBeDisabled();
  release(); state.pending = null;
  await expect(section.locator('article h4')).toHaveText(['New match 3', 'New match 4']);
  expect(state.directoryRequests).toBe(before + 1);
  await section.getByRole('button', { name: 'Generate new matches' }).click();
  await expect(section.locator('article h4')).toHaveText(['Energy investor', 'New match 1', 'New match 2']);
  await expect(section.getByRole('status')).toContainText('You have seen all available matches.');
  expect(state.writes).toEqual([]);
});

test('failed generation preserves previous matches and can be retried', async ({ page }) => {
  const state = await setup(page, { extraMatches: true });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  await expect(section.locator('article')).toHaveCount(3);
  state.failed = true;
  await section.getByRole('button', { name: 'Generate new matches' }).click();
  await expect(section.getByRole('alert')).toContainText('Your previous suggestions are still available.');
  await expect(section.locator('article h4')).toHaveText(['Energy investor', 'New match 1', 'New match 2']);
  state.failed = false;
  await section.getByRole('button', { name: 'Generate new matches' }).click();
  await expect(section.locator('article h4')).toHaveText(['New match 3', 'New match 4']);
});


test('wide suggestion photos stay square and broken photos fall back to initials', async ({ page }) => {
  await setup(page, { avatar: true });
  const section = page.getByRole('region', { name: 'Matchmaking suggestions' });
  const photo = section.locator('article img');
  await expect(photo).toBeVisible();
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(photo).toHaveCSS('object-fit', 'cover');
    const box = await photo.boundingBox();
    expect(box.width).toBe(72);
    expect(box.height).toBe(72);
  }
  await photo.evaluate(el => el.dispatchEvent(new Event('error')));
  await expect(section.locator('article img')).toHaveCount(0);
  await expect(section.getByText('EI', { exact: true })).toBeVisible();
});
