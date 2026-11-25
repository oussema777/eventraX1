import { test, expect } from '@playwright/test';

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'member@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = () => `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
const destination = '/my-networking?meetingId=test-meeting#matches';

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => route.fulfill({ json: new URL(route.request().url()).pathname.endsWith('/profiles')
    ? { ...user, full_name: 'Test Member', location: 'Tunis', phone_number: '12345678' } : [] }));
});

test('email destination survives reload and password login, overriding stale registration', async ({ page }) => {
  await page.route('**/auth/v1/token**', route => route.fulfill({ json: { access_token: token(), refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer', user } }));
  await page.goto(destination);
  await expect(page).toHaveURL(`http://127.0.0.1:3000/login?next=${encodeURIComponent(destination)}`);
  await page.reload();
  await page.evaluate(() => localStorage.setItem('pendingB2BRegister', '/event/stale/register'));
  await page.getByLabel(/email address/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill('Test-password-123');
  await page.getByRole('dialog').getByRole('button', { name: /^login$/i }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000${destination}`);
  await expect(page.locator('h1')).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(`http://127.0.0.1:3000${destination}`);
  await expect(page.locator('h1')).toBeVisible();
});

test('Google login carries the email destination through its callback', async ({ page }) => {
  let authorizeUrl;
  await page.route('**/auth/v1/authorize**', route => {
    authorizeUrl = new URL(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: 'Mock Google sign-in' });
  });
  await page.goto(destination);
  await page.getByRole('button', { name: /google/i }).click();
  await expect.poll(() => authorizeUrl).toBeTruthy();
  const callback = authorizeUrl.searchParams.get('redirect_to');
  expect(new URL(callback).searchParams.get('next')).toBe(destination);
  await page.goto(`${callback}#access_token=${token()}&refresh_token=test-refresh&expires_in=3600&token_type=bearer`);
  await expect(page).toHaveURL(`http://127.0.0.1:3000${destination}`);
  await expect(page.locator('h1')).toBeVisible();
});

test('failed password login keeps the networking destination for retry', async ({ page }) => {
  await page.route('**/auth/v1/token**', route => route.fulfill({ status: 400, json: { message: 'Invalid login credentials' } }));
  await page.goto(destination);
  await page.getByLabel(/email address/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill('wrong-password');
  await page.getByRole('dialog').getByRole('button', { name: /^login$/i }).click();
  await expect(page.getByText('The email or password you entered is incorrect. Please try again.')).toBeVisible();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/login?next=${encodeURIComponent(destination)}`);
});

test('Google member can open and reload the schedule with a fast device clock', async ({ page }) => {
  const event = { id: '22222222-2222-4222-8222-222222222222', name: "L'INVESTISSEMENT", timezone: 'Africa/Tunis' };
  const meeting = { id: '33333333-3333-4333-8333-333333333333', event_id: event.id,
    profile_a_id: user.id, profile_b_id: '44444444-4444-4444-8444-444444444444',
    status: 'confirmed', start_at: '2026-11-24T12:00:00Z', end_at: '2026-11-24T12:30:00Z', location: 'Table-07' };
  await page.route('**/rest/v1/profiles?**', route =>
    new URL(route.request().url()).searchParams.get('id')?.startsWith('in.')
      ? route.fulfill({ json: [{ id: meeting.profile_b_id, full_name: 'Test Partner' }] })
      : route.fallback());
  await page.route('**/rest/v1/event_attendees?**', route => {
    const select = new URL(route.request().url()).searchParams.get('select');
    return route.fulfill({ json: select === 'event_id' ? [{ event_id: event.id }] : [] });
  });
  await page.route('**/rest/v1/events?**', route => route.fulfill({
    json: new URL(route.request().url()).searchParams.get('id')?.startsWith('eq.') ? event : [event]
  }));
  await page.route('**/rest/v1/event_b2b_meetings?**', route => route.fulfill({ json: [meeting] }));
  const deviceTime = Date.now() + 2 * 60 * 60 * 1000;
  await page.clock.setFixedTime(new Date(deviceTime));
  const serverExpiry = Math.floor(Date.now() / 1000) + 3600;
  let refreshes = 0;
  let revoked = false;
  await page.route('**/auth/v1/token?grant_type=refresh_token', route => {
    refreshes++;
    if (revoked) return route.fulfill({ status: 400, json: { error_code: 'refresh_token_not_found', message: 'Token revoked' } });
    if (new URL(page.url()).searchParams.get('tab') === 'schedule' && refreshes > 1) {
      return route.fulfill({ status: 429, json: { code: 'over_request_rate_limit' } });
    }
    return route.fulfill({ json: { access_token: token(), refresh_token: 'rotated', expires_in: 3600,
      expires_at: serverExpiry, token_type: 'bearer', user } });
  });
  await page.goto(`/auth/callback?next=/my-networking#access_token=${token()}&refresh_token=test-refresh&expires_in=3600&expires_at=${serverExpiry}&token_type=bearer`);
  await page.getByRole('button', { name: 'My Schedule', exact: true }).click({ timeout: 10000 });
  await expect(page.getByText('Table-07', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Table-07', { exact: true })).toBeVisible();
  expect(refreshes).toBe(1);

  revoked = true;
  await page.clock.setFixedTime(new Date(deviceTime + 3600 * 1000));
  await page.reload();
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(refreshes).toBe(2);
});
