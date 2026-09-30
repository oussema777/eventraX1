import { test, expect } from '@playwright/test';

test('returning to registration preserves edited answers after session recovery', async ({ page }) => {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'attendee@example.test',
    aud: 'authenticated', role: 'authenticated',
    app_metadata: {}, user_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
  };
  let eventReads = 0;
  let profileReads = 0;
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/rest/v1/**', route => {
    const table = new URL(route.request().url()).pathname.split('/').pop();
    let data = [];
    if (table === 'events') {
      eventReads++;
      data = { id: 'focus-test', name: 'Registration focus test', status: 'published' };
    } else if (table === 'profiles') {
      profileReads++;
      data = { ...user, full_name: 'Original Name', company: 'Original Company' };
    } else if (table === 'event_forms') {
      data = [{ form_type: 'registration', status: 'active', schema: {
        fields: [{ id: 'diet', label: 'Dietary preferences', type: 'text', required: false }],
      } }];
    }
    return route.fulfill({ json: data });
  });

  await page.goto('/event/focus-test/register');
  await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  // Establish a fake session against the mocked auth endpoint; no real account.
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test-signature')}`;
    const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: 'test-refresh-token' });
    if (error) throw error;
  });
  await expect(page.getByPlaceholder('John Doe')).toHaveValue('Original Name');
  await page.getByPlaceholder('John Doe').fill('Edited Name');
  await page.getByPlaceholder('Acme Corp').fill('Edited Company');
  // Custom text fields have no placeholder; built-in text fields do.
  const diet = page.locator('input[type="text"]:not([placeholder])');
  await diet.fill('Vegetarian');
  const readsBefore = eventReads;
  const profilesBefore = profileReads;

  // Trigger the same visibility recovery Supabase runs when returning to a tab.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    window.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    window.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => profileReads).toBeGreaterThan(profilesBefore);
  await expect(page.getByPlaceholder('John Doe')).toHaveValue('Edited Name');
  await expect(page.getByPlaceholder('Acme Corp')).toHaveValue('Edited Company');
  await expect(diet).toHaveValue('Vegetarian');
  expect(eventReads).toBe(readsBefore);
});
