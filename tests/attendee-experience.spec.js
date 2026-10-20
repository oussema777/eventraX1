import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const destination = `/event/${eventId}/networking`;
const bridge = `/event-auth?redirect=${encodeURIComponent(destination)}`;
const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };

async function setup(page, { count = 101, signedIn = false, locale = 'en', transparent = true } = {}) {
  const people = Array.from({ length: count }, (_, index) => ({ id: `p${index}`, full_name: `Person ${String(index).padStart(3, '0')}`, job_title: 'Founder', company: 'Test Company', avatar_url: index >= 80 ? '/test-logo.svg' : null, sector: index % 2 ? 'Energy' : 'Technology' }));
  const attendees = people.map((person, index) => ({ id: `a${index}`, profile_id: person.id, name: person.full_name, company: person.company, meta: { sector: person.sector, b2bOptIn: true }, status: 'registered' }));
  const requests = [];
  await page.addInitScript(locale => { localStorage.setItem('eventra_locale', locale); localStorage.setItem('profileSetupDismissed', 'true'); }, locale);
  await page.route('**/test-logo.svg', r => r.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80"><rect x="${transparent ? 15 : 0}" y="${transparent ? 10 : 0}" width="${transparent ? 210 : 240}" height="${transparent ? 60 : 80}" fill="#087d83"/><text x="120" y="52" text-anchor="middle" font-size="42" fill="white">LOGO</text></svg>` }));
  await page.route('**/auth/v1/**', r => r.fulfill({ json: viewer }));
  await page.route('**/auth/v1/otp**', r => { requests.push(r.request().postDataJSON()); return r.fulfill({ json: {} }); });
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', r => {
    const url = new URL(r.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Investment Forum', status: 'published' };
    if (table === 'event_attendees') data = url.searchParams.get('profile_id')?.startsWith('eq.') ? null : attendees.slice(Number(url.searchParams.get('offset') || 0), Number(url.searchParams.get('offset') || 0) + Number(url.searchParams.get('limit') || 500));
    if (table === 'profiles') data = url.searchParams.get('id')?.startsWith('in.') ? people : { ...viewer, full_name: 'Test Viewer', company: 'Test', phone_number: '12345678', job_title: 'Founder', industry: 'Technology' };
    if (r.request().method() === 'HEAD') return r.fulfill({ headers: { 'content-range': `0-${count - 1}/${count}` }, body: '' });
    return r.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/attendees`);
  if (signedIn) await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
  });
  return { people, requests };
}

test('directory uses complete 48-card pages, images first, and never drops the final participant', async ({ page }) => {
  await setup(page);
  const cards = page.locator('#attendee-directory .participant-card');
  const names = [];
  await expect(cards).toHaveCount(48);
  await expect(page.getByText('Profiles 1–48 of 101', { exact: true })).toBeVisible();
  await expect(cards.first().getByRole('heading')).toHaveText('Person 080');
  names.push(...await cards.getByRole('heading').allTextContents());
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(cards).toHaveCount(48);
  names.push(...await cards.getByRole('heading').allTextContents());
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(cards).toHaveCount(5);
  await expect(page.getByText('Profiles 97–101 of 101', { exact: true })).toBeVisible();
  names.push(...await cards.getByRole('heading').allTextContents());
  expect(new Set(names).size).toBe(101);
  expect(names).toContain('Person 100');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('sector chips sit below suggestions and filter in place without removing the access panel', async ({ page }) => {
  await setup(page);
  const panel = page.locator('.networking-access');
  const filters = page.locator('.directory-filters');
  const panelBox = await panel.boundingBox();
  const filtersBox = await filters.boundingBox();
  expect(filtersBox.y).toBeGreaterThan(panelBox.y + panelBox.height);
  await filters.getByRole('button', { name: 'Energy', exact: true }).click();
  await expect(filters.getByRole('button', { name: 'Energy', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(filters.getByRole('status')).toHaveText('Showing 50 of 101 participants');
  await expect(panel).toBeVisible();
  const search = filters.getByRole('searchbox');
  await search.fill('Person 081');
  await expect(page.locator('#attendee-directory .participant-card')).toHaveCount(1);
  await filters.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('#attendee-directory .participant-card')).toHaveCount(48);
});

test('transparent wide images fit completely inside a circular backed frame', async ({ page }) => {
  await setup(page);
  const avatar = page.locator('#attendee-directory .participant-card__avatar').first();
  const image = avatar.locator('img');
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('object-fit', 'contain');
  await expect(avatar).toHaveCSS('border-radius', '50%');
  await expect(avatar).toHaveCSS('background-color', 'rgb(244, 247, 251)');
  const bounds = await avatar.boundingBox(), imageBounds = await image.boundingBox();
  expect(imageBounds.width).toBeLessThan(bounds.width * .72);
  await page.route('**/test-logo.svg', r => r.abort());
  await page.reload();
  await expect(page.locator('#attendee-directory .participant-card__avatar').first()).toHaveText('P0');
});

test('opaque profile images keep their full-circle photo crop', async ({ page }) => {
  await setup(page, { transparent: false });
  const avatar = page.locator('#attendee-directory .participant-card__avatar').first();
  const image = avatar.locator('img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(image).toHaveCSS('object-fit', 'cover');
  await expect(avatar).toHaveAttribute('data-transparent', 'false');
  const bounds = await avatar.boundingBox(), imageBounds = await image.boundingBox();
  expect(imageBounds.width).toBeGreaterThan(bounds.width * .85);
});

test('unregistered user can register or recover another registration email without an account redirect loop', async ({ page }) => {
  const { requests } = await setup(page, { signedIn: true });
  await expect(page.locator('.networking-access')).toBeVisible();
  await page.locator('.networking-access').getByRole('button', { name: 'Register for the event', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/event/${eventId}/register$`));
  await page.goto(`/event/${eventId}/attendees`);
  await page.getByRole('button', { name: 'Access with my registration email' }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000${bridge}&switch_account=1`);
  await page.getByRole('textbox', { name: 'Registration email address' }).fill('registration@example.test');
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByText(/Check your inbox for a fresh sign-in link/)).toBeVisible();
  expect(requests).toMatchObject([{ email: 'registration@example.test', create_user: false }]);
});

test('signed-out returning attendee gets email access directly from the directory', async ({ page }) => {
  await setup(page);
  await page.getByRole('button', { name: 'Access with my registration email' }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000${bridge}`);
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toBeVisible();
});

test('signed-out booking uses registration email and restores the selected person after sign-in', async ({ page }) => {
  await setup(page);
  const returnPath = `/event/${eventId}/attendees?bookMeeting=p80`;
  let otpRequest;
  await page.route('**/auth/v1/otp**', route => {
    otpRequest = { url: new URL(route.request().url()), body: route.request().postDataJSON() };
    return route.fulfill({ json: {} });
  });
  await page.locator('#attendee-directory .participant-card__book').first().click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event-auth?redirect=${encodeURIComponent(returnPath)}`);
  await expect(page.getByRole('heading', { name: 'Sign in to plan your meeting' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Google/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Not registered yet? Register for this event' })).toHaveAttribute('href', `/event/${eventId}/register`);
  await page.getByRole('textbox', { name: 'Registration email address' }).fill('viewer@example.test');
  await page.getByRole('button', { name: 'Email me a sign-in link', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your selected participant is saved in the link');
  expect(otpRequest.body).toMatchObject({ email: 'viewer@example.test', create_user: false });
  const callback = new URL(otpRequest.url.searchParams.get('redirect_to'));
  expect(callback.pathname).toBe('/auth/callback');
  expect(callback.searchParams.get('next')).toBe(returnPath);
  // Simulate a verified email session; no email is sent by this test.
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
  });
  await expect(page.getByRole('dialog')).toContainText('With Person 080');
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}/attendees`);
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await expect(page.locator('#attendee-directory .participant-card')).toHaveCount(48);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('expired booking links preserve the selected participant in email recovery', async ({ page }) => {
  await setup(page);
  const returnPath = `/event/${eventId}/attendees?bookMeeting=p80`;
  await page.goto(`/auth/callback?next=${encodeURIComponent(returnPath)}#error=access_denied&error_code=otp_expired`);
  await page.getByRole('link', { name: 'Request a fresh event sign-in link' }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event-auth?redirect=${encodeURIComponent(returnPath)}`);
  await expect(page.getByRole('heading', { name: 'Sign in to plan your meeting' })).toBeVisible();
});

test('existing Eventra members can use their password and resume booking with the selected person', async ({ page }) => {
  const { requests } = await setup(page);
  let attempts = 0;
  await page.route('**/auth/v1/token**', route => {
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 400, json: { code: 'invalid_credentials', message: 'Invalid login credentials' } });
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    return route.fulfill({ json: {
      access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`,
      refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, user: viewer,
    } });
  });
  await page.locator('#attendee-directory .participant-card__book').first().click();
  await page.getByRole('textbox', { name: 'Registration email address' }).fill('viewer@example.test');
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toHaveValue('viewer@example.test');
  await page.getByLabel('Eventra password', { exact: true }).fill('incorrect-test-password');
  await page.getByRole('button', { name: 'Sign in and continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('email or password is incorrect');
  await page.getByRole('button', { name: 'Forgot your password? Use an email link' }).click();
  await expect(page.getByLabel('Eventra password', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toHaveValue('viewer@example.test');
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  await page.getByLabel('Eventra password', { exact: true }).fill('correct-test-password');
  await page.getByRole('button', { name: 'Sign in and continue', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('With Person 080');
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}/attendees`);
  expect(requests).toHaveLength(0);
});

test('Google sign-in preserves the selected participant through the OAuth callback', async ({ page }) => {
  const { requests } = await setup(page);
  const returnPath = `/event/${eventId}/attendees?bookMeeting=p80`;
  // Stop at the provider handoff; never contact Google or use a real account.
  await page.route('**/auth/v1/authorize**', route => route.fulfill({ contentType: 'text/html', body: '<p>Mock Google authorization</p>' }));
  await page.locator('#attendee-directory .participant-card__book').first().click();
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  const google = page.getByRole('button', { name: 'Continue with Google', exact: true });
  await expect(google).toBeEnabled(); // Google must not require email/password fields.
  const authorizeRequest = page.waitForRequest('**/auth/v1/authorize**');
  await google.click();
  const authorize = new URL((await authorizeRequest).url());
  expect(authorize.searchParams.get('provider')).toBe('google');
  expect(authorize.searchParams.get('prompt')).toBe('select_account');
  const callback = new URL(authorize.searchParams.get('redirect_to'));
  expect(callback.origin).toBe('http://127.0.0.1:3000');
  expect(callback.pathname).toBe('/auth/callback');
  expect(callback.searchParams.get('next')).toBe(returnPath);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: viewer.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
  callback.hash = new URLSearchParams({ access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: '3600' }).toString();
  await page.goto(callback.href);
  await expect(page.getByRole('dialog')).toContainText('With Person 080');
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}/attendees`);
  expect(requests).toHaveLength(0);
});

test('Google errors allow another login method and cancellation preserves booking', async ({ page }) => {
  await setup(page);
  const returnPath = `/event/${eventId}/attendees?bookMeeting=p80`;
  await page.locator('#attendee-directory .participant-card__book').first().click();
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    supabase.auth.signInWithOAuth = async () => { throw new Error('Provider unavailable'); };
  });
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByRole('alert')).toContainText('We could not sign you in right now');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
  await page.getByRole('button', { name: /^Email link/ }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toBeEnabled();
  await page.goto(`/auth/callback?next=${encodeURIComponent(returnPath)}#error=access_denied&error_description=Cancelled`);
  await expect(page.getByRole('status')).toContainText('Sign-in could not be completed');
  await expect(page.getByText(/link expired/i)).toHaveCount(0);
  await page.getByRole('link', { name: 'Return to sign-in' }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event-auth?redirect=${encodeURIComponent(returnPath)}`);
  await page.getByRole('button', { name: /^Eventra account/ }).click();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
});

test('attendee messaging also uses registration-email access instead of the old login popup', async ({ page }) => {
  await setup(page);
  await page.locator('#attendee-directory .participant-card__message').first().click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event-auth?redirect=${encodeURIComponent(`/event/${eventId}/attendees`)}`);
  await expect(page.getByRole('textbox', { name: 'Registration email address' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Google/ })).toHaveCount(0);
});

test('full-width hero shows five real profile photos, count below, and a working more button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setup(page);
  const hero = page.locator('.event-network-banner');
  const photos = hero.locator('.event-network-banner__avatar');
  await expect(photos).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    await expect(photos.nth(index)).toHaveAttribute('href', `/profile/p${80 + index}`);
    await expect(photos.nth(index).locator('img')).toHaveAttribute('alt', `Person 0${80 + index}`);
  }
  await expect(hero.locator('.event-network-banner__participant-count')).toHaveText('101 B2B attendees');
  const bounds = await hero.boundingBox();
  expect(bounds.x).toBe(0);
  expect(bounds.width).toBe(1440);
  const photoBounds = await photos.first().boundingBox();
  const countBounds = await hero.locator('.event-network-banner__participant-count').boundingBox();
  expect(countBounds.y).toBeGreaterThan(photoBounds.y + photoBounds.height);
  await hero.locator('.event-network-banner__more').click();
  await expect.poll(async () => (await page.locator('#attendee-directory').boundingBox()).y).toBeLessThan(160);
});

test('hero omits unavailable or blank photos without inventing replacement people', async ({ page }) => {
  await setup(page);
  const photos = page.locator('.event-network-banner__avatar');
  await expect(photos).toHaveCount(5);
  await page.route('**/test-logo.svg', route => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/></svg>',
  }));
  await page.reload();
  await expect(photos).toHaveCount(0);
  await expect(page.locator('.event-network-banner__participant-count')).toHaveText('101 B2B attendees');
  await page.route('**/test-logo.svg', route => route.abort());
  await page.reload();
  await expect(photos).toHaveCount(0);
  await expect(page.locator('.event-network-banner__more')).toHaveCount(0);
});

test('hero animation pauses completely during pointer movement and resumes on request', async ({ page }) => {
  await setup(page);
  const hero = page.locator('.event-network-banner');
  const canvas = hero.locator('canvas');
  await hero.getByRole('button', { name: 'Pause animation' }).click();
  await expect(hero).toHaveAttribute('data-paused', 'true');
  // Allow the static canvas redraw after pausing to finish.
  await page.waitForTimeout(100);
  const frozen = await canvas.evaluate(element => element.toDataURL());
  const box = await hero.boundingBox();
  await page.mouse.move(box.x + 80, box.y + 180);
  await page.waitForTimeout(250);
  expect(await canvas.evaluate(element => element.toDataURL())).toBe(frozen);
  await hero.getByRole('button', { name: 'Play animation' }).click();
  await expect.poll(() => canvas.evaluate(element => element.toDataURL())).not.toBe(frozen);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-paused', 'true');
  await expect(hero.locator('.event-network-banner__motion')).toHaveCount(0);
});

test('connected dots respond to a nearby pointer', async ({ page }) => {
  // Observe drawn coordinates, so this verifies displacement rather than idle animation.
  await page.addInitScript(() => {
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const arc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.classList.contains('event-network-banner__particles')) this.canvas.drawnDots = [];
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.arc = function (...args) {
      if (this.canvas.drawnDots) this.canvas.drawnDots.push({ x: args[0], y: args[1] });
      return arc.apply(this, args);
    };
  });
  await setup(page);
  const canvas = page.locator('.event-network-banner__particles');
  await expect.poll(() => canvas.evaluate(element => element.drawnDots?.length || 0)).toBeGreaterThan(0);
  const before = await canvas.evaluate(element => element.drawnDots[0]);
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + before.x - 25, box.y + before.y);
  await expect.poll(async () => {
    const after = await canvas.evaluate(element => element.drawnDots[0]);
    return Math.hypot(after.x - before.x, after.y - before.y);
  }, { timeout: 2000 }).toBeGreaterThan(10);
});

for (const locale of ['en', 'fr', 'ar']) {
  test(`${locale} mobile directory has no overflow and honors reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setup(page, { count: 85, locale });
    await expect(page.locator('#attendee-directory .participant-card')).toHaveCount(48);
    await expect(page.locator('.event-network-banner')).toHaveAttribute('data-paused', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.directory-filters__sectors')).toBeVisible();
  });
}
