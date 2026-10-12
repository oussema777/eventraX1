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
