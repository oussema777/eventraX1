import { test, expect } from '@playwright/test';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'guest@example.test', aud: 'authenticated', role: 'authenticated',
  app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const sessions = [
  { id: 'w1', title: 'Workshop One', type: 'workshop' },
  { id: 'w2', title: 'Workshop Two', type: 'workshop' },
  { id: 'talk', title: 'Keynote', type: 'keynote' },
  { id: 'closed', title: 'Closed Training', type: 'training', registration_open: false },
  { id: 'cancelled', title: 'Cancelled Session', type: 'keynote', status: 'cancelled' },
].map(s => ({ registration_open: true, starts_at: '2026-11-25T10:00:00Z', ends_at: '2026-11-25T11:00:00Z', ...s }));

async function setup(page, { limit = 1, selected = ['w1'] } = {}) {
  const state = { selected: new Set(selected), writes: [], reject: false, pending: null };
  await page.route('**/auth/v1/**', r => r.fulfill({ json: user }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Test Event', status: 'published', timezone: 'Africa/Tunis', workshop_selection_limit: limit,
      branding_settings: { design_studio: { activeBlocks: [{ id: 'agenda', type: 'agenda', isVisible: true }] } } };
    if (table === 'profiles') data = { ...user, full_name: 'Guest', phone_number: '12345678', location: 'Tunis' };
    if (table === 'event_sessions') data = sessions;
    if (table === 'event_attendees') data = url.searchParams.get('select') === 'id' ? { id: 'attendee' } : [];
    if (table === 'event_attendee_sessions') {
      const method = route.request().method();
      if (method === 'POST' || method === 'DELETE' || method === 'PATCH') {
        state.writes.push(method);
        if (state.pending) await state.pending;
        if (state.reject) return route.fulfill({ status: 400, json: { message: 'WORKSHOP_SELECTION_LIMIT' } });
        if (method === 'PATCH') {
          const previous = url.searchParams.get('session_id').replace('eq.', '');
          const next = route.request().postDataJSON().session_id;
          if (!state.selected.has(previous)) return route.fulfill({ status: 406, json: { message: 'Booking no longer exists' } });
          state.selected.delete(previous);
          state.selected.add(next);
          return route.fulfill({ json: { session_id: next } });
        }
        if (method === 'POST') state.selected.add(route.request().postDataJSON().session_id);
        else state.selected.delete(url.searchParams.get('session_id').replace('eq.', ''));
      }
      data = [...state.selected].map(session_id => ({ session_id }));
    }
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-4/5', 'access-control-expose-headers': 'content-range' }, body: '' });
    return route.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/agenda`);
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const enc = v => btoa(JSON.stringify(v)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await supabase.auth.setSession({ access_token: `${enc({ alg: 'HS256' })}.${enc({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${enc('test')}`, refresh_token: 'test' });
  });
  await expect(page.getByRole('button', { name: /(?:Add to|Remove from) my agenda: Workshop One/ })).toBeVisible();
  return state;
}

test('public agenda enforces workshop limit and closed sessions while allowing removal', async ({ page }) => {
  const state = await setup(page);
  await expect(page.getByText('Choose one workshop for this event.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop Two' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Closed Training' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Cancelled Session' })).toBeDisabled();
  await page.getByRole('button', { name: 'Add to my agenda: Keynote' }).click();
  await expect(page.getByRole('button', { name: 'Remove from my agenda: Keynote' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Remove from my agenda: Workshop One' }).click();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop Two' })).toBeEnabled();
  await page.getByRole('button', { name: 'Add to my agenda: Workshop Two' }).click();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop One' })).toBeEnabled();
  expect([...state.selected].sort()).toEqual(['talk', 'w2']);
});

test('failed saves never show a successful selection and block overlapping clicks', async ({ page }) => {
  const state = await setup(page, { selected: [] });
  state.reject = true;
  let release;
  state.pending = new Promise(resolve => { release = resolve; });
  await page.getByRole('button', { name: 'Add to my agenda: Workshop One' }).click();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop Two' })).toBeDisabled();
  release();
  await expect(page.getByText(/Could not book these sessions/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop One' })).toBeEnabled();
  expect(state.writes).toEqual(['POST']);
  expect(state.selected.size).toBe(0);
});

test('unlimited events can select multiple workshops', async ({ page }) => {
  await setup(page, { limit: null });
  await page.getByRole('button', { name: 'Add to my agenda: Workshop Two' }).click();
  await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop One' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop Two' })).toBeEnabled();
});

test('failed removal keeps the booking and closed sessions can still be removed', async ({ page }) => {
  const state = await setup(page, { selected: ['w1', 'closed'] });
  state.reject = true;
  await page.getByRole('button', { name: 'Remove from my agenda: Workshop One' }).click();
  await expect(page.getByText(/Could not book these sessions/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop One' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Workshop Two' })).toBeEnabled();
  state.reject = false;
  await page.getByRole('button', { name: 'Remove from my agenda: Closed Training' }).click();
  await expect(page.getByRole('button', { name: 'Add to my agenda: Closed Training' })).toBeDisabled();
  expect([...state.selected]).toEqual(['w1']);
});

test('language switch persists across event pages and does not reset booked sessions', async ({ page }) => {
  await setup(page);
  for (const locale of ['fr', 'ar', 'en']) {
    await page.locator('.event-language-switcher select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('.agenda-card button[aria-pressed="true"]')).toHaveCount(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.event-language-switcher select').selectOption('fr');
  await expect(page.getByText('Choisissez un seul atelier pour cet événement.')).toBeVisible();
  await page.goto(`/event/${eventId}/landing`);
  await expect(page.locator('.event-language-switcher select')).toHaveValue('fr');
  await expect(page.getByText('Choisissez un seul atelier pour cet événement.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter à mon agenda : Workshop Two' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Retirer de mon agenda : Workshop One' })).toBeEnabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: '.tmp/event-language-agenda-mobile.png' });
});

for (const section of ['agenda', 'landing']) {
  test(`${section}: confirms replacement, keeps other sessions, and supports cancellation`, async ({ page }) => {
    const state = await setup(page, { selected: ['w1', 'talk'] });
    if (section === 'landing') await page.goto(`/event/${eventId}/landing`);
    const choose = page.getByRole('button', { name: 'Add to my agenda: Workshop Two' });
    await choose.click();
    const prompt = page.locator('.workshop-replacement-prompt');
    await expect(prompt).toContainText('Workshop One');
    await expect(prompt).toContainText('Workshop Two');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(prompt).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await prompt.screenshot({ path: `.tmp/workshop-switch-${section}.png` });
    expect(state.writes).toEqual([]);
    await prompt.getByRole('button', { name: 'Keep my current workshop' }).click();
    await expect(prompt).toHaveCount(0);
    expect([...state.selected].sort()).toEqual(['talk', 'w1']);
    await choose.click();
    await prompt.getByRole('button', { name: 'Choose this workshop instead' }).click();
    await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop Two' })).toHaveAttribute('aria-pressed', 'true');
    await expect(prompt).toHaveCount(0);
    expect(state.writes).toEqual(['PATCH']);
    expect([...state.selected].sort()).toEqual(['talk', 'w2']);
  });

  test(`${section}: failed swap preserves the original booking and can be retried`, async ({ page }) => {
    const state = await setup(page, { selected: ['w1', 'talk'] });
    if (section === 'landing') await page.goto(`/event/${eventId}/landing`);
    state.reject = true;
    await page.getByRole('button', { name: 'Add to my agenda: Workshop Two' }).click();
    const prompt = page.locator('.workshop-replacement-prompt');
    await prompt.getByRole('button', { name: 'Choose this workshop instead' }).click();
    await expect(page.getByText(/We could not change your workshop/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop One' })).toBeEnabled();
    expect([...state.selected].sort()).toEqual(['talk', 'w1']);
    state.reject = false;
    await prompt.getByRole('button', { name: 'Choose this workshop instead' }).click();
    await expect(page.getByRole('button', { name: 'Remove from my agenda: Workshop Two' })).toBeEnabled();
    expect(state.writes).toEqual(['PATCH', 'PATCH']);
  });
}
