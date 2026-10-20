import { test, expect } from '@playwright/test';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const destination = `/event/${eventId}/networking`;
const bridge = `/event-auth?redirect=${encodeURIComponent(destination)}`;
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'guest@example.test', aud: 'authenticated', role: 'authenticated',
  app_metadata: { account_type: 'event_guest' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

async function mock(page, registered = true, member = false, eventDate = null) {
  const mockUser = member ? { ...user, app_metadata: { account_type: 'user' }, user_metadata: { created_via: 'event_b2b' } } : user;
  await page.route('**/auth/v1/**', route => route.fulfill({ json: mockUser }));
  await page.route('**/auth/v1/token**', route => {
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
    return route.fulfill({ json: {
      access_token: token, refresh_token: 'test-refresh-token', token_type: 'bearer', expires_in: 3600,
      user: { ...mockUser, app_metadata: { account_type: 'user' }, user_metadata: { created_via: 'event_b2b' } }
    } });
  });
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/functions/v1/activate-event-account', route => route.fulfill(
    registered ? { json: { activated: true, event_id: eventId } } : { status: 403, json: { error: 'B2B registration required' } }
  ));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'profiles') data = { ...mockUser, full_name: 'Registered Guest' };
    if (table === 'events') data = { id: eventId, name: 'Test Networking Event', status: 'published', start_date: eventDate, end_date: eventDate, timezone: 'UTC' };
    if (table === 'event_attendees' && url.searchParams.get('select') === 'event_id') data = registered ? { event_id: eventId } : null;
    if (table === 'event_attendees' && url.searchParams.get('select') === 'id') data = registered ? { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' } : null;
    if (table === 'event_b2b_settings') data = null;
    return route.fulfill({ json: data });
  });
}

for (const errorLocation of ['query', 'hash', 'missing']) {
  test(`auth callback handles ${errorLocation} failure without claiming the link expired`, async ({ page }) => {
    await mock(page);
    const error = 'error=access_denied&error_code=unexpected_failure&error_description=Untrusted-provider-message';
    const suffix = errorLocation === 'query' ? `&${error}` : errorLocation === 'hash' ? `#${error}` : '';
    await page.goto(`/auth/callback?next=${encodeURIComponent(destination)}${suffix}`);
    await expect(page.getByRole('status')).toHaveText('Sign-in could not be completed. Please try signing in again.');
    await expect(page.getByText(/expired|Untrusted-provider-message/)).toHaveCount(0);
    await page.getByRole('link', { name: 'Return to sign-in' }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000${bridge}`);
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeVisible();
  });
}

test('auth callback recognizes an explicitly expired email link', async ({ page }) => {
  await mock(page);
  await page.goto(`/auth/callback?next=${encodeURIComponent(destination)}#error=access_denied&error_code=otp_expired`);
  await expect(page.getByRole('status')).toContainText('Sign-in link expired or was already used');
  await expect(page.getByRole('link', { name: 'Request a fresh event sign-in link' })).toHaveAttribute('href', bridge);
});

test('auth callback rejects an external return destination', async ({ page }) => {
  await mock(page);
  await page.goto('/auth/callback?next=https%3A%2F%2Fexample.com');
  await expect(page.getByRole('link', { name: 'Return to sign-in' })).toHaveAttribute('href', '/login?next=%2F');
});

for (const [locale, message, label] of [
  ['fr', 'La connexion n’a pas pu être finalisée.', 'Revenir à la connexion'],
  ['ar', 'تعذّر إكمال تسجيل الدخول.', 'العودة إلى تسجيل الدخول'],
]) {
  test(`auth callback recovery is translated into ${locale}`, async ({ page }) => {
    await mock(page);
    await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
    await page.goto('/auth/callback#error=access_denied');
    await expect(page.getByRole('status')).toContainText(message);
    await expect(page.getByRole('link', { name: label })).toBeVisible();
  });
}

test('new B2B member reaches optional profile and business actions', async ({ page }) => {
  await mock(page, true, true);
  await page.goto(destination, { waitUntil: 'domcontentloaded' });
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Your event and account are ready' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit my profile' })).toHaveAttribute('href', '/my-profile');
  await expect(page.getByRole('link', { name: 'Create a business profile' })).toHaveAttribute('href', '/business-profile-wizard');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('heading', { name: 'Your event and account are ready' })).toHaveCount(0);
});

test('event day opens check-in and meeting shortcuts for a member', async ({ page }) => {
  await mock(page, true, true, new Date().toISOString().slice(0, 10));
  await page.goto(destination, { waitUntil: 'domcontentloaded' });
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Today at Test Networking Event' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Your event check-in QR code' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'My meetings' })).toHaveAttribute('href', `${destination}?tab=schedule`);
});

test('a registration-created member can request a passwordless link from normal login', async ({ page }) => {
  await mock(page, true, true);
  let request;
  await page.route('**/auth/v1/otp**', route => {
    request = { url: new URL(route.request().url()), body: route.request().postDataJSON() };
    return route.fulfill({ json: {} });
  });
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email address').fill('guest@example.test');
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByRole('status')).toContainText('Check your inbox');
  expect(request.body.create_user).toBe(false);
  expect(request.url.searchParams.get('redirect_to')).toBe('http://127.0.0.1:3000/auth/callback?next=%2F');
});

test('first passwordless sign-in from general login opens the registered event', async ({ page }) => {
  await mock(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await signIn(page);
  await page.goto('/auth/callback?next=%2F', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
});

test('activation failure retries the existing session without another sign-in email', async ({ page }) => {
  await mock(page);
  let activationCalls = 0;
  await page.route('**/functions/v1/activate-event-account', route => {
    activationCalls++;
    return route.fulfill(activationCalls === 1
      ? { status: 503, json: { error: 'Activation temporarily unavailable' } }
      : { json: { activated: true, member: true, event_id: eventId } });
  });
  await page.goto(bridge, { waitUntil: 'domcontentloaded' });
  await signIn(page);
  await expect(page.getByRole('status')).toContainText('You are signed in');
  await expect(page.getByRole('link', { name: 'Request a fresh event sign-in link' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
  expect(activationCalls).toBe(2);
});

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
  await page.goto(`${bridge}#error=access_denied&error_code=otp_expired`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/expired or was already used/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Registration email address' }).fill(user.email);
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByText(/Check your inbox for a fresh sign-in link/)).toBeVisible();
  expect(new URL(otpRequest.url).searchParams.get('redirect_to')).toBe(`http://127.0.0.1:3000/auth/callback?next=${encodeURIComponent(destination)}`);
  expect(otpRequest.body.create_user).toBe(false);
  await expect(page.getByRole('button', { name: /Send again in/ })).toBeDisabled();
  await expect(page.getByText(/expired or was already used/)).toHaveCount(0);
  // Completion can happen after the bridge has mounted (session recovery).
  await signIn(page);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
  await expect(page.getByRole('heading', { name: 'Test Networking Event' })).toBeVisible();
});

test('event access offers email-link and existing Eventra account methods', async ({ page }) => {
  await mock(page);
  await page.goto(bridge);
  await expect(page.getByRole('heading', { name: 'Access your event networking hub' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Email link/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Eventra account/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('link', { name: 'Return to event registration' })).toHaveAttribute('href', `/event/${eventId}/register`);
});

test('password sign-in can finish an explicit account switch without redirecting back to access', async ({ page }) => {
  await mock(page, true, true);
  await page.goto(`${bridge}&switch_account=1`);
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Access your event networking hub' })).toBeVisible();
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  await page.getByRole('textbox', { name: 'Registration email address' }).fill('guest@example.test');
  await page.getByLabel('Eventra password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Sign in and continue', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
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

test('registration email returns non-B2B guests to their event to enable networking', async ({ page }) => {
  await mock(page);
  await page.goto(bridge);
  const email = await page.evaluate(async ({ eventId }) => {
    const { generateRegistrationEmailHtml } = await import('/src/lib/email.ts');
    return generateRegistrationEmailHtml('Event', 'Guest', 'https://example.test/qr.png', [], true,
      null, 'UTC', null, `${location.origin}/event/${eventId}/register`);
  }, { eventId });
  expect(email).toContain(`href="http://127.0.0.1:3000/event/${eventId}/register"`);
  expect(email).toContain('Enable Event B2B Networking');
  expect(email).not.toContain('app.eventra.cloud');
});

for (const failure of [
  { code: 'over_email_send_rate_limit', status: 429, message: /Too many sign-in requests/ },
  { code: 'otp_disabled', status: 422, message: /return to event registration and submit again/ },
  { code: 'unexpected_failure', status: 500, message: /contact the event organizer/ },
]) {
  test(`sign-in recovery explains ${failure.code}`, async ({ page }) => {
    await mock(page);
    let calls = 0;
    await page.route('**/auth/v1/otp**', route => {
      calls++;
      return route.fulfill({ status: failure.status, headers: {
        'x-supabase-api-version': '2024-01-01',
        'access-control-expose-headers': 'X-Supabase-Api-Version'
      }, json: { code: failure.code, msg: 'Auth request failed' } });
    });
    await page.goto(bridge);
    await expect(page.getByText('Test Networking Event', { exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Registration email address' }).fill('GUEST@example.test');
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
    await expect(page.getByRole('alert')).toContainText(failure.message);
    await expect(page.getByRole('link', { name: 'Return to event registration' })).toHaveAttribute('href', `/event/${eventId}/register`);
    if (failure.status === 429) {
      await expect(page.getByRole('button', { name: /Send again in/ })).toBeDisabled();
      expect(calls).toBe(1);
    }
  });
}

test('other callback errors are not mislabeled as expired links', async ({ page }) => {
  await mock(page);
  await page.goto(`${bridge}#error=server_error&error_code=unexpected_failure`);
  await expect(page.getByText(/could not complete sign-in from this link/)).toBeVisible();
  await expect(page.getByText(/expired or was already used/)).toHaveCount(0);
});
