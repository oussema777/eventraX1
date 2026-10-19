import { test, expect } from '@playwright/test';

const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const partner = { id: '22222222-2222-4222-8222-222222222222', full_name: 'Meeting Partner', email: 'partner@example.test', account_type: 'user', bio: 'Partner biography' };
const meetingId = '33333333-3333-4333-8333-333333333333';
const threadId = '44444444-4444-4444-8444-444444444444';

async function setup(page, { status = 'confirmed', viewerIsB = false, missingPartner = false, sameNames = false } = {}) {
  const me = { ...viewer, full_name: sameNames ? partner.full_name : 'Test Viewer' };
  const state = { failCancel: false, stale: false, delay: 0, writes: [], emails: [], notifications: [], meeting: {
    id: meetingId, status, event_id: null, organizer_id: viewerIsB ? partner.id : viewer.id,
    profile_a_id: viewerIsB ? partner.id : viewer.id, profile_b_id: viewerIsB ? viewer.id : partner.id,
    start_at: '2026-11-20T14:00:00Z', location: 'Table-1', meta: { meeting_type: 'in-person' },
  } };
  await page.addInitScript(() => { localStorage.setItem('eventra_locale', 'en'); localStorage.setItem('profileSetupDismissed', 'true'); });
  await page.route('**/auth/v1/**', route => route.fulfill({ json: viewer }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/api/send-email', route => {
    state.emails.push(route.request().postDataJSON());
    return route.fulfill({ json: { id: 'test-email' } });
  });
  await page.route('**/rest/v1/**', async route => {
    const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').pop();
    const method = request.method();
    let data = [];
    if (method === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-0/0' }, body: '' });
    if (!['GET', 'HEAD'].includes(method)) {
      const payload = request.postDataJSON();
      state.writes.push({ table, method, payload, query: Object.fromEntries(url.searchParams) });
      if (table === 'event_b2b_meetings') {
        if (state.delay) await new Promise(resolve => setTimeout(resolve, state.delay));
        if (state.failCancel) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
        if (state.stale) return route.fulfill({ json: [] });
        state.meeting = { ...state.meeting, ...payload };
        data = { id: meetingId };
      }
      if (table === 'notifications') {
        state.notifications.push(...(Array.isArray(payload) ? payload : [payload]));
        data = { id: 'test-notification', ...state.notifications.at(-1) };
      }
    } else {
      if (table === 'profiles') {
        const id = url.searchParams.get('id');
        data = id?.startsWith('in.') ? [me, partner] : id === `eq.${viewer.id}` ? me : partner;
      }
      if (table === 'event_b2b_meetings') {
        data = url.searchParams.has('id') ? {
          ...state.meeting, event: { name: 'Test Event' },
          profile_a: viewerIsB ? partner : me, profile_b: viewerIsB ? me : partner,
        } : [state.meeting];
      }
      if (table === 'message_thread_participants') {
        data = url.searchParams.has('thread_id') ? [{ thread_id: threadId, profile_id: viewer.id }, ...(missingPartner ? [] : [{ thread_id: threadId, profile_id: partner.id }])] : [{ thread_id: threadId, last_read_at: null }];
        if (url.searchParams.has('thread_id') && url.searchParams.has('profile_id')) data = missingPartner ? [] : [{ thread_id: threadId, profile_id: partner.id }];
      }
      if (table === 'message_messages') data = [{ id: 'msg1', thread_id: threadId, sender_id: partner.id, body: 'Hello from your partner', created_at: '2026-10-18T12:00:00Z' }];
    }
    return route.fulfill({ json: data });
  });
  await page.goto('/login');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const { error } = await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
    if (error) throw error;
  });
  return state;
}

test('FB-06: messaging profile action opens the partner, including on mobile', async ({ page }) => {
  await setup(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/messages');
  // Narrow layouts initially show the conversation list.
  await page.getByRole('heading', { name: partner.full_name, exact: true }).click();
  await page.getByRole('button', { name: 'View Profile', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/profile/${partner.id}`);
  await expect(page.getByRole('heading', { name: partner.full_name, level: 1 })).toBeVisible();
  await expect(page.getByText(partner.bio, { exact: true })).toBeVisible();
});

test('FB-06: a conversation without a partner cannot open the viewer\'s own profile', async ({ page }) => {
  await setup(page, { missingPartner: true });
  await page.goto('/messages');
  await expect(page.getByRole('button', { name: 'View Profile', exact: true })).toBeDisabled();
  await expect(page).toHaveURL(/\/messages$/);
});

for (const viewerIsB of [false, true]) {
  test(`FB-08: participant ${viewerIsB ? 'B' : 'A'} cancels a confirmed meeting directly and the result persists`, async ({ page }) => {
    const state = await setup(page, { viewerIsB, sameNames: true });
    await page.goto('/my-networking');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('Meeting cancelled', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toHaveCount(0);
    expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(1);
    expect(state.meeting.start_at).toBe('2026-11-20T14:00:00Z');
    expect(state.meeting.status).toBe('cancelled');
    expect(state.notifications).toMatchObject([{ recipient_id: partner.id }]);
    await expect.poll(() => state.emails.length).toBe(1);
    expect(state.emails[0].to).toBe(partner.email);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toHaveCount(0);
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
  });
}

test('FB-08: outgoing pending requests can be withdrawn directly', async ({ page }) => {
  const state = await setup(page, { status: 'pending' });
  await page.goto('/my-networking');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByText('Meeting cancelled', { exact: true })).toBeVisible();
  expect(state.meeting.status).toBe('cancelled');
});

test('FB-08: incoming pending requests retain the decline action', async ({ page }) => {
  await setup(page, { status: 'pending', viewerIsB: true });
  await page.goto('/my-networking');
  await expect(page.getByRole('button', { name: 'Decline', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toHaveCount(0);
});

for (const zone of ['Africa/Tunis', 'pt']) test(`confirming a meeting opens personal passes with the event timezone (${zone})`, async ({ page }) => {
  const state = await setup(page, { status: 'pending', viewerIsB: true });
  state.meeting.event_id = '769d7854-9bae-49e6-9db9-c88c0586a402';
  // Organizer is side B: profile ordering must not choose the same recipient twice.
  state.meeting.profile_a_id = viewer.id;
  state.meeting.profile_b_id = partner.id;
  await page.route('**/rest/v1/event_b2b_meetings?*', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET' || !url.searchParams.has('id')) return route.fallback();
    return route.fulfill({ json: { ...state.meeting, event: { name: 'Test Event', timezone: zone }, organizer: partner, profile_a: { ...viewer, full_name: 'Test Viewer' }, profile_b: partner } });
  });
  await page.goto('/my-networking');
  await page.getByRole('button', { name: 'Confirm', exact: true }).evaluate(button => { button.click(); button.click(); });
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('img')).toHaveAttribute('src', /^data:image\/png/);
  await expect.poll(() => state.emails.length).toBe(2);
  expect(new Set(state.emails.map(email => email.to))).toEqual(new Set([viewer.email, partner.email]));
  for (const email of state.emails) {
    const encoded = email.html.match(/<img src="([^"]+)"/)[1].replaceAll('&amp;', '&');
    const passUrl = new URL(new URL(encoded).searchParams.get('data'));
    expect(passUrl.searchParams.get('participant')).toBe(email.to === viewer.email ? viewer.id : partner.id);
    expect(email.html).toContain('3:00 PM');
    expect(email.html).toContain('Africa/Tunis');
  }
  expect(state.meeting.status).toBe('confirmed');
  expect(state.writes.filter(write => write.table === 'event_b2b_meetings')).toHaveLength(1);
});

test('FB-05/08: a failed decline sends no misleading notification', async ({ page }) => {
  const state = await setup(page, { status: 'pending', viewerIsB: true });
  state.failCancel = true;
  await page.goto('/my-networking');
  await page.getByRole('button', { name: 'Decline', exact: true }).click();
  await expect(page.getByText('The meeting could not be cancelled. Refresh and try again.', { exact: true })).toBeVisible();
  expect(state.notifications).toEqual([]);
  expect(state.emails).toEqual([]);
});

for (const failure of ['failCancel', 'stale']) {
  test(`FB-08: ${failure} produces no false success or notifications and can be retried`, async ({ page }) => {
    const state = await setup(page);
    state[failure] = true;
    await page.goto('/my-networking');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('The meeting could not be cancelled. Refresh and try again.', { exact: true })).toBeVisible();
    await expect(page.getByText('Meeting cancelled', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeEnabled();
    expect(state.notifications).toEqual([]);
    expect(state.emails).toEqual([]);
    expect(state.meeting.status).toBe('confirmed');
    state[failure] = false;
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('Meeting cancelled', { exact: true })).toBeVisible();
  });
}

test('FB-08: repeated clicks during a save cannot send duplicate cancellations', async ({ page }) => {
  const state = await setup(page);
  state.delay = 500;
  await page.goto('/my-networking');
  const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
  await cancel.evaluate(button => { button.click(); button.click(); });
  await expect(cancel).toBeDisabled();
  await expect(page.getByText('Meeting cancelled', { exact: true })).toBeVisible();
  expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(1);
  expect(state.notifications).toHaveLength(1);
});
