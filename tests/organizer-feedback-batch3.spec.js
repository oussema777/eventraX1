import { test, expect } from '@playwright/test';

const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const partner = { id: '22222222-2222-4222-8222-222222222222', full_name: 'Meeting Partner', email: 'partner@example.test' };
const threadId = '44444444-4444-4444-8444-444444444444';

async function setup(page, { signedOut = false } = {}) {
  const state = { messages: [{ id: 'msg1', thread_id: threadId, sender_id: partner.id, body: 'Hello from your partner', created_at: '2026-10-18T12:00:00Z' }], notifications: [], emails: [], linkedBusinesses: [], businessOwner: partner, conversationPartner: partner, businessContacts: [], sharedMeetingEvents: [], team: [], activityStats: { eventsAttended: 3, b2bMeetings: 2, connections: 4, profileViews: 17 }, failBusinessRead: false, noThreads: false, failNotificationWrite: false, failSend: false, failNotifications: false, writes: [] };
  await page.addInitScript(() => { localStorage.setItem('eventra_locale', 'en'); localStorage.setItem('profileSetupDismissed', 'true'); });
  await page.route('**/auth/v1/**', route => route.fulfill({ json: signedOut ? {} : viewer }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/api/send-email', route => { state.emails.push(route.request().postDataJSON()); return route.fulfill({ json: { id: 'accepted' } }); });
  await page.route('**/rest/v1/**', route => {
    const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').pop(), method = request.method();
    if (url.pathname.includes('/rpc/')) {
      state.writes.push({ table, method, payload: request.postDataJSON() });
      return route.fulfill({ json: table === 'record_profile_view' ? true : state.activityStats });
    }
    if (method === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-0/0' }, body: '' });
    let data = [];
    if (method === 'GET') {
      if (table === 'business_profiles' && state.failBusinessRead) return route.fulfill({ status: 503, json: { message: 'Temporary failure' } });
      if (table === 'profiles') data = url.searchParams.get('id')?.startsWith('in.') ? [{ ...viewer, full_name: 'Test Viewer' }, state.conversationPartner] : url.searchParams.get('id') === `eq.${state.businessOwner.id}` ? state.businessOwner : url.searchParams.get('id') === `eq.${partner.id}` ? partner : { ...viewer, full_name: 'Test Viewer' };
      if (table === 'business_profiles') data = (url.searchParams.get('id')?.startsWith('eq.') || request.headers().accept?.includes('application/vnd.pgrst.object+json')) ? { id: '55555555-5555-4555-8555-555555555555', company_name: 'Partner Business', owner_profile_id: state.businessOwner.id, contacts: state.businessContacts, description: 'A test company', sectors: [], branding: {} } : state.linkedBusinesses;
      if (table === 'event_attendees') data = state.sharedMeetingEvents.flatMap(event => [viewer, partner].map(person => ({ event_id: event.id, profile_id: person.id })));
      if (table === 'events') data = url.searchParams.get('id')?.startsWith('in.') ? state.sharedMeetingEvents : state.sharedMeetingEvents[0] || null;
      if (table === 'event_b2b_settings') data = { venue_config: { tableCount: 4, slotDuration: 30, schedules: [{ date: '2027-11-20', start: '14:00', end: '15:00' }] } };
      if (table === 'business_members') data = url.searchParams.has('profile_id') ? state.team.map(member => ({ business_id: member.business_id })) : state.team;
      if (table === 'message_thread_participants') data = state.noThreads ? [] : url.searchParams.get('profile_id') === `eq.${state.conversationPartner.id}` ? [{ profile_id: state.conversationPartner.id, thread_id: threadId }] : url.searchParams.get('profile_id')?.startsWith('neq.') ? [{ profile_id: state.conversationPartner.id, thread_id: threadId, last_read_at: null }] : url.searchParams.has('thread_id') ? [{ profile_id: viewer.id, thread_id: threadId, last_read_at: null }, { profile_id: state.conversationPartner.id, thread_id: threadId, last_read_at: null }] : [{ thread_id: threadId, last_read_at: null }];
      if (table === 'message_messages') data = state.messages;
      if (table === 'notifications') {
        if (state.failNotifications) return route.fulfill({ status: 400, json: { code: '42703', message: 'column unavailable' } });
        data = state.notifications.filter(item => item.recipient_id === viewer.id);
      }
    } else {
      const payload = request.postDataJSON();
      state.writes.push({ table, method, payload });
      if (table === 'message_threads' && method === 'POST') data = { id: threadId };
      if (table === 'notifications' && method === 'PATCH' && state.failNotificationWrite) return route.fulfill({ status: 503, json: { message: 'Temporary failure' } });
      if (table === 'message_messages' && method === 'POST') {
        if (state.failSend) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
        data = { ...payload[0], id: `msg${state.messages.length + 1}`, created_at: new Date().toISOString() };
        state.messages.push({ ...data });
      }
      if (table === 'notifications' && method === 'POST') {
        state.notifications.push(...payload);
        data = { ...payload[0], id: `n${state.notifications.length}`, created_at: new Date().toISOString(), read_at: null };
      }
    }
    return route.fulfill({ json: data });
  });
  await page.goto('/login');
  if (!signedOut) await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const { error } = await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
    if (error) throw error;
  });
  return state;
}

test('FB-03: send persists across reload and notifies the actual recipient', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/messages');
  await expect(page.getByText('Hello from your partner').last()).toBeVisible();
  await page.getByPlaceholder('Type a message...').fill('A reply');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('A reply').last()).toBeVisible();
  await expect.poll(() => state.notifications.length).toBe(1);
  expect(state.notifications[0]).toMatchObject({ recipient_id: partner.id, actor_id: viewer.id, action_url: '/messages' });
  expect(state.notifications[0].title).toBe('New message');
  expect(state.notifications[0].body).toContain('A reply');
  expect(state.notifications[0].body).not.toContain('messages.notifications');
  await expect.poll(() => state.emails.length).toBe(1);
  expect(state.emails[0].to).toBe(partner.email);
  await page.reload();
  await expect(page.getByText('A reply').last()).toBeVisible();
});

test('FB-03: failed send keeps the draft and allows retry', async ({ page }) => {
  const state = await setup(page);
  state.failSend = true;
  await page.goto('/messages');
  const input = page.getByPlaceholder('Type a message...');
  await input.fill('Please keep this draft');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(input).toHaveValue('Please keep this draft');
  expect(state.messages).toHaveLength(1);
  state.failSend = false;
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(input).toHaveValue('');
  expect(state.messages).toHaveLength(2);
});

test('FB-03: contacting a company opens its existing owner conversation', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/business/55555555-5555-4555-8555-555555555555');
  await expect(page.getByText('Partner Business').first()).toBeVisible();
  await page.getByRole('button', { name: /Contact|Contacter/i }).first().click();
  await expect(page).toHaveURL(/\/messages$/);
  await expect(page.getByText('Hello from your partner').last()).toBeVisible();
  expect(state.writes.filter(write => write.table === 'message_threads' && write.method === 'POST')).toHaveLength(0);
});

test('FB-05: notification reader uses stored fields and links to its action', async ({ page }) => {
  const state = await setup(page);
  state.notifications.push({ id: 'n1', recipient_id: viewer.id, actor_id: partner.id, type: 'action', title: 'New message', body: 'Open your conversation', action_url: '/messages', read_at: null, created_at: new Date().toISOString() });
  await page.goto('/notifications');
  await expect(page.getByText('Open your conversation')).toBeVisible();
  await page.getByRole('button', { name: /New message/ }).click();
  await expect(page).toHaveURL(/\/messages$/);
  await expect.poll(() => state.writes.some(write => write.table === 'notifications' && write.method === 'PATCH')).toBeTruthy();
});

test('FB-05: notification query errors are shown instead of an empty inbox', async ({ page }) => {
  const state = await setup(page);
  state.failNotifications = true;
  await page.goto('/notifications');
  await expect(page.getByRole('alert').getByText('Notifications could not be loaded. Try again later.')).toBeVisible();
  await expect(page.getByText('No notifications yet.')).toHaveCount(0);
});

test('FB-05: local email helper uses the development API and reports provider rejection', async ({ page }) => {
  await setup(page);
  const deliveries = [];
  let status = 200;
  await page.route('**/api/send-email', route => {
    deliveries.push(route.request().postDataJSON());
    return route.fulfill({ status, json: status === 200 ? { id: 'accepted' } : { error: 'provider rejected' } });
  });
  const send = async () => page.evaluate(async () => {
    const { sendEmail } = await import('/src/lib/email.ts');
    return sendEmail({ to: 'partner@example.test', subject: 'Meeting update', html: '<p>Update</p>' });
  });
  expect(await send()).toBe(true);
  status = 503;
  expect(await send()).toBe(false);
  expect(deliveries).toHaveLength(2);
  expect(deliveries[0].to).toBe('partner@example.test');
});

test('FB-11/12: linked business opens from a person and its owner links back', async ({ page }) => {
  const state = await setup(page);
  state.linkedBusinesses = [{ id: '55555555-5555-4555-8555-555555555555', company_name: 'Partner Business' }];
  await page.goto(`/profile/${partner.id}`);
  await page.getByRole('button', { name: 'View Business Profile: Partner Business' }).click();
  await expect(page).toHaveURL(/\/business\/55555555-5555-4555-8555-555555555555$/);
  await page.getByRole('button', { name: 'View Profile: Meeting Partner' }).click();
  await expect(page).toHaveURL(new RegExp(`/profile/${partner.id}$`));
});

test('FB-11: a company name without a linked business shows no business link', async ({ page }) => {
  await setup(page);
  await page.goto(`/profile/${partner.id}`);
  await expect(page.getByRole('button', { name: /View Business Profile/ })).toHaveCount(0);
});

test('profile save requires confirmation before clearing existing contact details', async ({ page }) => {
  const state = await setup(page);
  await page.route('**/rest/v1/profiles?**', route => {
    if (route.request().method() !== 'GET' || new URL(route.request().url()).searchParams.get('id') !== `eq.${viewer.id}`) return route.fallback();
    return route.fulfill({ json: { ...viewer, full_name: 'Test Viewer', phone_number: '+21612345678' } });
  });
  await page.goto('/my-profile');
  await page.locator('input[value="+21612345678"]').fill('');
  await page.getByRole('button', { name: 'Save Changes', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: /confirm.*delet|delete.*confirm|remove.*data/i })).toBeVisible();
  expect(state.writes.filter(write => write.table === 'profiles')).toHaveLength(0);
});

test('FB-02: profiles retain activity stats without displaying or recording views', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/my-profile');
  await expect(page.getByText('Profile Views', { exact: true })).toHaveCount(0);
  await expect(page.getByText('17', { exact: true })).toHaveCount(0);
  await expect(page.getByText('3', { exact: true })).toBeVisible();
  expect(state.writes.filter(write => write.table === 'record_profile_view')).toHaveLength(0);
  await page.goto(`/profile/${partner.id}`);
  await expect(page.getByText('17', { exact: true })).toHaveCount(0);
  await expect(page.getByText('4', { exact: true })).toBeVisible();
  expect(state.writes.filter(write => write.table === 'record_profile_view')).toHaveLength(0);
});

const systemOwner = { id: '5e1d401a-16a1-5b5f-b839-6692ffc3d62f', account_type: 'system', email: 'system@eventra.local', full_name: null };

test('business identity: unresolved imported owner never opens the system inbox', async ({ page }) => {
  const state = await setup(page);
  state.businessOwner = systemOwner;
  state.businessContacts = [{ value: 'contact@company.test' }];
  state.team = [{ profile_id: systemOwner.id, role: 'owner', profiles: systemOwner }];
  await page.goto('/business/55555555-5555-4555-8555-555555555555');
  await expect(page.getByRole('link', { name: 'Contact by email' })).toHaveAttribute('href', 'mailto:contact%40company.test');
  await expect(page.getByText('No team members are linked yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: /View Profile:/ })).toHaveCount(0);
  await expect(page.getByText('system@eventra.local')).toHaveCount(0);
  expect(state.writes.filter(w => ['message_threads', 'message_thread_participants'].includes(w.table))).toHaveLength(0);
});

test('business identity: unresolved owner with no published email has no false contact action', async ({ page }) => {
  const state = await setup(page);
  state.businessOwner = systemOwner;
  await page.goto('/business/55555555-5555-4555-8555-555555555555');
  await expect(page.getByText('Direct messaging is not available for this business yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Contact Company/ })).toHaveCount(0);
});

test('business identity: technical profile never exposes unrelated companies or meeting actions', async ({ page }) => {
  const state = await setup(page);
  state.businessOwner = systemOwner;
  state.linkedBusinesses = [{ id: 'unrelated', company_name: 'Unrelated Company' }];
  await page.goto(`/profile/${systemOwner.id}`);
  await expect(page.getByRole('heading', { name: /Profile Not Found/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /View Business Profile|Request Meeting|Send Message/i })).toHaveCount(0);
  expect(state.writes.filter(w => w.table === 'record_profile_view')).toHaveLength(0);
});

test('business identity: old system conversation preserves history with no send action', async ({ page }) => {
  const state = await setup(page);
  state.conversationPartner = systemOwner;
  await page.goto('/messages');
  await expect(page.getByText('Hello from your partner').last()).toBeVisible();
  await expect(page.getByRole('status').getByText(/This conversation was linked to an unavailable contact/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send message' })).toHaveCount(0);
  await expect(page.getByText('system@eventra.local')).toHaveCount(0);
  expect(state.writes.filter(w => w.table === 'message_messages')).toHaveLength(0);
});

test('flow recovery: failed business read offers retry, not a missing company', async ({ page }) => {
  const state = await setup(page);
  state.failBusinessRead = true;
  await page.goto('/business/55555555-5555-4555-8555-555555555555');
  await expect(page.getByRole('alert')).toContainText('We could not load this business.');
  state.failBusinessRead = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByText('Partner Business').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Profile: Meeting Partner' })).toBeVisible();
});

test('flow recovery: signed-out business contact opens login with a return destination', async ({ page }) => {
  const state = await setup(page, { signedOut: true });
  const path = '/business/55555555-5555-4555-8555-555555555555';
  await page.goto(path);
  await expect(page.getByRole('button', { name: 'Login', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /Contact Business/i }).click();
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path)}`);
  expect(state.writes.filter(w => w.table === 'message_threads')).toHaveLength(0);
});

test('flow recovery: rapid contact clicks create only one conversation', async ({ page }) => {
  const state = await setup(page);
  state.noThreads = true;
  await page.goto('/business/55555555-5555-4555-8555-555555555555');
  await page.getByRole('button', { name: /Contact Business/i }).evaluate(button => { button.click(); button.click(); });
  await expect(page).toHaveURL(/\/messages$/);
  expect(state.writes.filter(w => w.table === 'message_threads' && w.method === 'POST')).toHaveLength(1);
  const participants = state.writes.filter(w => w.table === 'message_thread_participants' && w.method === 'POST');
  expect(participants).toHaveLength(1);
  expect(participants[0].payload.map(p => p.profile_id)).toEqual([viewer.id, partner.id]);
});

test('flow recovery: failed notification update keeps the unread state and explains retry', async ({ page }) => {
  const state = await setup(page);
  state.failNotificationWrite = true;
  state.notifications = [{ id: 'n1', recipient_id: viewer.id, title: 'New message', body: 'Unread notification', read_at: null }];
  await page.goto('/notifications');
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark all as read (1)' }).click();
  await expect(page.getByText('We could not mark this notification as read. Please try again.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark all as read (1)' })).toBeVisible();
});

test('flow recovery: standalone profile with no common event explains booking eligibility', async ({ page }) => {
  const state = await setup(page);
  await page.goto(`/profile/${partner.id}`);
  await page.getByRole('button', { name: 'Request Meeting', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('you both need to join B2B networking at the same event');
  await expect(page.getByRole('link', { name: 'Browse events' })).toHaveAttribute('href', '/browse-events');
  await expect(page.getByRole('button', { name: 'Send Request' })).toHaveCount(0);
  expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(0);
});

test('flow recovery: standalone profile opens real booking for the shared event', async ({ page }) => {
  const state = await setup(page);
  state.sharedMeetingEvents = [{ id: '769d7854-9bae-49e6-9db9-c88c0586a402', name: 'Shared Forum', start_date: '2027-11-20', timezone: 'Africa/Tunis' }];
  await page.goto(`/profile/${partner.id}`);
  await page.getByRole('button', { name: 'Request Meeting', exact: true }).first().click();
  await expect(page.getByText('With Meeting Partner', { exact: true })).toBeVisible();
  await expect(page.locator('.booking-readiness')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeVisible();
  expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(0);
});

test('flow recovery: multiple shared events require an explicit booking event', async ({ page }) => {
  const state = await setup(page);
  state.sharedMeetingEvents = [{ id: '769d7854-9bae-49e6-9db9-c88c0586a402', name: 'Shared Forum', timezone: 'Africa/Tunis' }, { id: '66666666-6666-4666-8666-666666666666', name: 'Second Forum' }];
  await page.goto(`/profile/${partner.id}`);
  await page.getByRole('button', { name: 'Request Meeting', exact: true }).first().click();
  await page.getByRole('combobox', { name: 'Choose an event' }).selectOption(state.sharedMeetingEvents[0].id);
  await expect(page.getByText('With Meeting Partner', { exact: true })).toBeVisible();
  expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(0);
});
