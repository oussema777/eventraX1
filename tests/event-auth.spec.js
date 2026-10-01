import { test, expect } from '@playwright/test';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const destination = `/event/${eventId}/networking`;
const bridge = `/event-auth?redirect=${encodeURIComponent(destination)}`;
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'guest@example.test', aud: 'authenticated', role: 'authenticated',
  app_metadata: { account_type: 'event_guest' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

async function mock(page, registered = true) {
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'profiles') data = { ...user, full_name: 'Registered Guest' };
    if (table === 'events') data = { id: eventId, name: 'Test Networking Event', status: 'published' };
    if (table === 'event_attendees' && url.searchParams.get('select') === 'event_id') data = registered ? { event_id: eventId } : null;
    if (table === 'event_b2b_settings') data = null;
    return route.fulfill({ json: data });
  });
}

async function signIn(page) {
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
    const { error } = await supabase.auth.setSession({ access_token: token, refresh_token: 'test-refresh-token' });
    if (error) throw error;
  });
}

test('expired email link sends a fresh magic link with an absolute event return URL', async ({ page }) => {
  await mock(page);
  let otpRequest;
  await page.route('**/auth/v1/otp**', route => {
    otpRequest = { url: route.request().url(), body: route.request().postDataJSON() };
    return route.fulfill({ json: {} });
  });
  await page.goto(`${bridge}#error=access_denied&error_code=otp_expired`);
  await expect(page.getByText(/expired or was already used/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Registration email address' }).fill(user.email);
  await page.getByRole('button', { name: 'Send magic link' }).click();
  await expect(page.getByText(/Check your inbox for a fresh sign-in link/)).toBeVisible();
  expect(new URL(otpRequest.url).searchParams.get('redirect_to')).toBe(`http://127.0.0.1:3000${bridge}`);
  expect(otpRequest.body.create_user).toBe(false);
  // Completion can happen after the bridge has mounted (session recovery).
  await signIn(page);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
  await expect(page.getByRole('heading', { name: 'Test Networking Event' })).toBeVisible();
});

test('Google sign-in uses the same absolute event bridge and returns to the hub', async ({ page }) => {
  await mock(page);
  let authorizeUrl;
  await page.route('**/auth/v1/authorize**', route => {
    authorizeUrl = new URL(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<p>Mock Google sign-in</p>' });
  });
  await page.goto(bridge);
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect.poll(() => authorizeUrl?.searchParams.get('redirect_to')).toBe(`http://127.0.0.1:3000${bridge}`);
  // Simulate the OAuth redirect carrying Supabase's session hash.
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
  await page.goto(`${authorizeUrl.searchParams.get('redirect_to')}#access_token=${token}&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=signup`);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
  await expect(page.getByRole('heading', { name: 'Test Networking Event' })).toBeVisible();
});

test('a signed-out hub visit retains its event through sign-in', async ({ page }) => {
  await mock(page);
  await page.goto(destination);
  await expect(page).toHaveURL(new RegExp(`/event-auth\\?redirect=${encodeURIComponent(destination)}$`));
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Test Networking Event' })).toBeVisible();
});

test('explicit callback destination wins over stale registration state', async ({ page }) => {
  await mock(page);
  await page.goto(bridge);
  await signIn(page);
  await page.evaluate(() => localStorage.setItem('pendingB2BRegister', '/event/other-event/register'));
  await page.goto(`/auth/callback?next=${encodeURIComponent(destination)}`);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
});

test('wrong guest account gets a useful recovery screen instead of the homepage', async ({ page }) => {
  await mock(page, false);
  await page.goto(bridge);
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Use your registration account' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with another account' })).toBeVisible();
});

test('invalid redirects are rejected and confirmation emails contain reusable hub links', async ({ page }) => {
  await mock(page);
  await page.goto('/event-auth?redirect=https://example.com');
  await expect(page.getByText(/sign-in link is incomplete/)).toBeVisible();
  expect(await page.getByRole('button', { name: 'Continue with Google' }).count()).toBe(0);
  const email = await page.evaluate(async ({ bridge }) => {
    const { generateRegistrationEmailHtml } = await import('/src/lib/email.ts');
    return generateRegistrationEmailHtml('Event', 'Guest', 'https://example.test/qr.png', [], true,
      'https://example.test/one-time-token', 'UTC', `${location.origin}${bridge}`);
  }, { bridge });
  expect(email).toContain(`href="http://127.0.0.1:3000${bridge}"`);
  expect(email).not.toContain('href="https://example.test/one-time-token"');
  expect(email).not.toContain('Create Your Free Account');
});
