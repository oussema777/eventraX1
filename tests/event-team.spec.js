import { test, expect } from '@playwright/test';

const eventId = '20000000-0000-4000-8000-000000000001';
const invitationId = '50000000-0000-4000-8000-000000000001';
const viewer = { id: '10000000-0000-4000-8000-000000000001', email: 'staff@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const event = { id: eventId, name: 'Investment Forum', status: 'published', owner_id: viewer.id, organizer_id: viewer.id, start_date: '2026-11-26T08:00:00Z', attendee_settings: {} };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: viewer.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, user: viewer };

async function setup(page, role = 'owner', locale = 'en', signedIn = true) {
  const state = { role, members: [], actions: [], invitationError: false, teamLoadError: false };
  await page.addInitScript(locale => { localStorage.setItem('eventra_locale', locale); localStorage.setItem('profileSetupDismissed', 'true'); }, locale);
  await page.route('**/auth/v1/**', route => route.fulfill({ json: viewer }));
  await page.route('**/auth/v1/token**', route => route.fulfill({ json: session }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    const body = route.request().postDataJSON();
    if (url.pathname.includes('/rpc/')) {
      state.actions.push({ rpc: table, body });
      if (table === 'event_access_role') return route.fulfill({ json: state.role });
      if (table === 'invite_event_member') {
        const member = { id: invitationId, email: body.p_email, role: body.p_role, status: 'pending', expires_at: new Date(Date.now() + 7 * 86400000).toISOString() };
        state.members = [member]; return route.fulfill({ json: member });
      }
      if (table === 'update_event_member') {
        state.members = state.members.map(member => member.id === body.p_member_id ? { ...member, role: body.p_role || member.role, status: body.p_revoke ? 'revoked' : member.status } : member);
        return route.fulfill({ json: null });
      }
      if (table === 'get_event_invitation') return state.invitationError
        ? route.fulfill({ status: 403, json: { code: '42501', message: 'Unavailable' } })
        : route.fulfill({ json: { id: invitationId, event_id: eventId, event_name: event.name, email: viewer.email, role: 'coordinator', status: 'pending' } });
      if (table === 'accept_event_invitation') { state.role = 'coordinator'; return route.fulfill({ json: eventId }); }
      return route.fulfill({ json: [] });
    }
    let data = [];
    if (state.teamLoadError && ['event_team_members', 'event_team_audit'].includes(table)) {
      return route.fulfill({ status: 404, json: { code: 'PGRST205', message: 'Table unavailable' } });
    }
    if (table === 'profiles') data = { ...viewer, full_name: 'Team Member', company: 'Test', phone_number: '12345678', location: 'Tunis', role: 'user' };
    if (table === 'events') {
      data = url.searchParams.get('id')?.startsWith('eq.') ? event :
        url.searchParams.has('or') && state.role !== 'owner' ? [] : [event];
    }
    if (table === 'event_team_members') data = url.searchParams.has('user_id')
      ? state.role && state.role !== 'owner' ? [{ event_id: eventId, role: state.role }] : [] : state.members;
    if (table === 'event_b2b_settings') data = null;
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '*/0' }, body: '' });
    return route.fulfill({ json: data });
  });
  await page.goto(`/event-team/invite/${invitationId}`);
  if (signedIn) await page.evaluate(async session => {
    const { supabase } = await import('/src/lib/supabase.ts');
    await supabase.auth.setSession(session);
  }, session);
  return state;
}

test('owner can retry after the team database becomes available', async ({ page }) => {
  const state = await setup(page);
  state.teamLoadError = true;
  await page.goto(`/event/${eventId}?tab=team`);
  await expect(page.getByRole('alert')).toContainText('Event access could not be loaded');
  await expect(page.locator('.event-team__invite')).toHaveCount(0);
  state.teamLoadError = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.event-team__invite')).toBeVisible();
  await expect(page.locator('#team-email')).toBeEnabled();
});

test('owner creates email-bound invitations and can cancel them', async ({ page }) => {
  const state = await setup(page);
  await page.goto(`/event/${eventId}?tab=team`);
  await expect(page.getByRole('heading', { name: 'Team & access' })).toBeVisible();
  await page.getByLabel('Teammate’s email').fill('New.Person@Example.test');
  await page.getByLabel('Access level', { exact: true }).selectOption('checkin');
  await page.getByRole('button', { name: 'Create invitation', exact: true }).click();
  await expect(page.locator('.event-team__notice[role="status"]')).toContainText('Invitation ready');
  expect(state.actions.find(action => action.rpc === 'invite_event_member').body).toEqual({ p_event_id: eventId, p_email: 'new.person@example.test', p_role: 'checkin' });
  await expect(page.locator('.event-team__link input')).toHaveValue(`http://127.0.0.1:3000/event-team/invite/${invitationId}`);
  await expect(page.locator('.event-team__members')).toContainText('Pending');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Cancel invitation', exact: true }).click();
  await expect(page.locator('.event-team__members')).toContainText('Revoked');
  expect(state.actions.find(action => action.rpc === 'update_event_member').body.p_revoke).toBe(true);
});

for (const [role, tabs] of [
  ['administrator', ['Overview', 'Agenda', 'Speakers', 'Attendees', 'Forms', 'Exhibitors', 'Ticketing', 'B2B', 'Day-of', 'Notifications']],
  ['coordinator', ['Attendees', 'B2B', 'Day-of']],
  ['checkin', ['Day-of']],
]) {
  test(`${role} only sees permitted event sections even with a team deep link`, async ({ page }) => {
    await setup(page, role);
    await page.goto(`/event/${eventId}?tab=team`);
    const nav = page.locator('.event-dashboard__nav');
    await expect(nav.getByRole('button')).toHaveCount(tabs.length);
    await expect(nav.getByRole('button', { name: 'Team & access', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Team & access' })).toHaveCount(0);
    if (role !== 'administrator') {
      await expect(page.getByRole('button', { name: /Edit details/i })).toHaveCount(0);
      await expect(nav.getByRole('button', { name: /Ticketing/ })).toHaveCount(0);
    }
    if (role === 'checkin') {
      await expect(page.getByRole('button', { name: /Reports/, exact: true })).toHaveCount(0);
      await expect(page.locator('.event-dayof')).toBeVisible();
    }
  });
}

test('coordinator is blocked from a direct event editor URL', async ({ page }) => {
  await setup(page, 'coordinator');
  await page.goto(`/create/details/${eventId}`);
  await expect(page.getByRole('heading', { name: 'You do not have management access to this event.' })).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveCount(0);
});

test('revocation removes an already open dashboard on the next access refresh', async ({ page }) => {
  const state = await setup(page);
  await page.goto(`/event/${eventId}?tab=team`);
  await expect(page.getByRole('heading', { name: 'Team & access' })).toBeVisible();
  state.role = null;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'You do not have management access to this event.' })).toBeVisible();
  await expect(page.locator('.event-team__invite')).toHaveCount(0);
});

test('invitation retains its destination for sign-in and account creation', async ({ page }) => {
  await setup(page, 'owner', 'en', false);
  const next = encodeURIComponent(`/event-team/invite/${invitationId}`);
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute('href', `/login?next=${next}`);
  await expect(page.getByRole('link', { name: 'Create an Eventra account', exact: true })).toHaveAttribute('href', `/register?next=${next}`);
});

test('Google account creation returns to the team invitation', async ({ page }) => {
  await setup(page, 'owner', 'en', false);
  await page.route('**/auth/v1/authorize**', route => route.fulfill({ contentType: 'text/html', body: 'Mock provider' }));
  await page.getByRole('link', { name: 'Create an Eventra account', exact: true }).click();
  const request = page.waitForRequest('**/auth/v1/authorize**');
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  const authUrl = new URL((await request).url());
  const callback = new URL(authUrl.searchParams.get('redirect_to'));
  expect(callback.pathname).toBe('/auth/callback');
  expect(callback.searchParams.get('next')).toBe(`/event-team/invite/${invitationId}`);
});

async function submitEmailSignup(page) {
  await page.getByRole('link', { name: 'Create an Eventra account', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Email', exact: true }).click();
  await page.locator('#email').fill(viewer.email);
  await page.locator('#password').fill('ExampleTest123!');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
}

for (const detection of ['precheck', 'signup']) {
  test(`existing account detected by ${detection} keeps an explanation and signs back into the invitation`, async ({ page }) => {
    await setup(page, null, 'en', false);
    let signups = 0;
    await page.route('**/rest/v1/rpc/check_user_exists', route => route.fulfill({ json: detection === 'precheck' }));
    await page.route('**/auth/v1/signup**', route => {
      signups++;
      return route.fulfill({ json: { ...viewer, identities: [] } });
    });
    await submitEmailSignup(page);
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Account already exists');
    await expect(page.locator('#email')).toHaveValue(viewer.email);
    expect(signups).toBe(detection === 'precheck' ? 0 : 1);
    await alert.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();
    await expect(page.locator('#email')).toHaveValue(viewer.email);
    await page.locator('#password').fill('ExampleTest123!');
    await page.getByRole('dialog').getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000/event-team/invite/${invitationId}`);
    await expect(page.getByRole('button', { name: 'Accept invitation', exact: true })).toBeVisible();
  });
}

test('existing account can request a sign-in link from signup without losing the invitation', async ({ page }) => {
  await setup(page, null, 'en', false);
  await page.route('**/rest/v1/rpc/check_user_exists', route => route.fulfill({ json: true }));
  await page.route('**/auth/v1/otp**', route => route.fulfill({ json: {} }));
  await submitEmailSignup(page);
  await page.getByRole('alert').getByRole('button', { name: 'Login', exact: true }).click();
  const request = page.waitForRequest('**/auth/v1/otp**');
  await page.getByRole('button', { name: 'Email me a sign-in link', exact: true }).click();
  const otp = await request;
  expect(otp.postDataJSON()).toMatchObject({ email: viewer.email, create_user: false });
  const callback = new URL(new URL(otp.url()).searchParams.get('redirect_to'));
  expect(callback.searchParams.get('next')).toBe(`/event-team/invite/${invitationId}`);
  await expect(page.getByRole('status')).toContainText('Check your inbox');
});

test('new email signup shows confirmation and resends with the invitation destination', async ({ page }) => {
  await setup(page, null, 'en', false);
  await page.route('**/rest/v1/rpc/check_user_exists', route => route.fulfill({ json: false }));
  await page.route('**/auth/v1/signup**', route => route.fulfill({ json: { ...viewer, identities: [{ id: viewer.id }] } }));
  await page.route('**/auth/v1/resend**', route => route.fulfill({ json: {} }));
  const signupRequest = page.waitForRequest('**/auth/v1/signup**');
  await submitEmailSignup(page);
  await expect(page.getByRole('heading', { name: 'Check your email', exact: true })).toBeVisible();
  await expect(page.getByText(viewer.email, { exact: true })).toBeVisible();
  const signup = await signupRequest;
  const callback = new URL(new URL(signup.url()).searchParams.get('redirect_to'));
  expect(callback.searchParams.get('next')).toBe(`/event-team/invite/${invitationId}`);
  const resendRequest = page.waitForRequest('**/auth/v1/resend**');
  await page.getByRole('button', { name: 'Resend Email', exact: true }).click();
  const resend = await resendRequest;
  const resendCallback = new URL(new URL(resend.url()).searchParams.get('redirect_to'));
  expect(resendCallback.href).toBe(callback.href);
  await expect(page.getByRole('status')).toHaveText('Verification email resent');
});

test('signup email failure stays visible and allows retry', async ({ page }) => {
  await setup(page, null, 'en', false);
  await page.route('**/rest/v1/rpc/check_user_exists', route => route.fulfill({ json: false }));
  await page.route('**/auth/v1/signup**', route => route.fulfill({ status: 429, json: { code: 'over_email_send_rate_limit', msg: 'Email rate limit exceeded' } }));
  await submitEmailSignup(page);
  await expect(page.getByRole('alert')).toContainText('Email rate limit exceeded');
  await expect(page.getByRole('button', { name: 'Create Account', exact: true })).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Check your email', exact: true })).toHaveCount(0);
});

test('password reset from existing-account signup preserves the invitation through send and resend', async ({ page }) => {
  await setup(page, null, 'en', false);
  await page.route('**/rest/v1/rpc/check_user_exists', route => route.fulfill({ json: true }));
  await page.route('**/auth/v1/recover**', route => route.fulfill({ json: {} }));
  await submitEmailSignup(page);
  await page.getByRole('alert').getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
  await expect(page.locator('input[type="email"]')).toHaveValue(viewer.email);
  const request = page.waitForRequest('**/auth/v1/recover**');
  await page.getByRole('button', { name: 'Send Reset Link', exact: true }).click();
  const recovery = await request;
  const callback = new URL(new URL(recovery.url()).searchParams.get('redirect_to'));
  expect(callback.pathname).toBe('/reset-password');
  expect(callback.searchParams.get('next')).toBe(`/event-team/invite/${invitationId}`);
  const resendRequest = page.waitForRequest('**/auth/v1/recover**');
  await page.getByRole('button', { name: 'Resend Email', exact: true }).click();
  const resend = await resendRequest;
  expect(new URL(resend.url()).searchParams.get('redirect_to')).toBe(callback.href);
  await page.goto(`/reset-password?next=${encodeURIComponent(`/event-team/invite/${invitationId}`)}`);
  await expect(page.getByRole('link', { name: 'Back to Login', exact: true })).toHaveAttribute('href', `/login?next=${encodeURIComponent(`/event-team/invite/${invitationId}`)}`);
});

test('existing owners retain their dashboard before the team migration is deployed', async ({ page }) => {
  await setup(page);
  await page.route('**/rest/v1/rpc/event_access_role', route => route.fulfill({ status: 404, json: { code: 'PGRST202', message: 'Function not found' } }));
  await page.goto(`/event/${eventId}?tab=team`);
  await expect(page.getByRole('heading', { name: 'Team & access' })).toBeVisible();
});

test('verified invitee explicitly accepts and lands in their permitted event section', async ({ page }) => {
  const state = await setup(page, null);
  await expect(page.getByRole('button', { name: 'Accept invitation', exact: true })).toBeVisible();
  expect(state.actions.filter(action => action.rpc === 'accept_event_invitation')).toHaveLength(0);
  await page.getByRole('button', { name: 'Accept invitation', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/event/${eventId}`);
  await expect(page.locator('.event-dashboard__nav').getByRole('button')).toHaveCount(3);
});

test('wrong-account or expired invitation offers recovery and cannot be accepted', async ({ page }) => {
  const state = await setup(page, null);
  state.invitationError = true;
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('belongs to another email');
  await expect(page.getByRole('button', { name: 'Accept invitation', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sign in with another account' })).toBeVisible();
});

test('shared event appears in My events without edit or delete actions for a coordinator', async ({ page }) => {
  await setup(page, 'coordinator');
  await page.goto('/my-events');
  await expect(page.getByText('Investment Forum', { exact: true })).toBeVisible();
  await expect(page.getByText('Coordinator', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
});

for (const locale of ['fr','ar']) {
  test(`team management is translated and fits a narrow screen in ${locale}`, async ({ page }) => {
    await setup(page, 'owner', locale);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/event/${eventId}?tab=team`);
    await expect(page.locator('.event-team__invite')).toBeVisible();
    await expect(page.locator('.event-team')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    await expect(page.getByText('Create invitation', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.tmp/event-team-${locale}-mobile.png`, fullPage: true });
  });
}
