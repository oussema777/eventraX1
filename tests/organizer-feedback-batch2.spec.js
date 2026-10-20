import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const viewerId = '11111111-1111-4111-8111-111111111111';
const partnerId = '22222222-2222-4222-8222-222222222222';
const fixture = '/tests/fixtures/networking-schedule.html';

async function setup(page, { noSchedule = false, mode = 'booking', locale = 'en', foreignEvent = false, notificationsEnabled = false } = {}) {
  const state = { meetings: [], availability: [], writes: [], emails: [], failLoad: false, failSave: false, failSlots: false, blockSave: false, changed: false };
  const venue = { tableCount: 1, slotDuration: 30, schedules: noSchedule ? [] : [
    { date: '2026-11-20', start: '14:00', end: '15:00' }, { date: '2026-11-20', start: '15:00', end: '16:00' },
  ] };
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  await page.route('**/auth/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/api/send-email', route => { state.emails.push(route.request().postDataJSON()); return route.fulfill({ json: { id: 'accepted' } }); });
  await page.route('**/rest/v1/**', route => {
    const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').pop();
    const method = request.method();
    let data = [];
    if (state.failLoad && ['events', 'event_b2b_settings'].includes(table)) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    if (state.failSlots && table === 'event_b2b_availability' && method === 'GET') return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    if (table === 'events') data = { id: foreignEvent ? '00000000-0000-0000-0000-000000000002' : eventId, name: 'Business Forum', timezone: 'Africa/Tunis', status: 'published' };
    if (table === 'event_b2b_settings') data = { venue_config: venue };
    if (table === 'event_b2b_meetings') data = state.changed ? [{ id: 'new-confirmation', event_id: eventId, status: 'confirmed', profile_a_id: viewerId, start_at: '2026-11-20T13:00:00Z', end_at: '2026-11-20T13:30:00Z' }] : state.meetings.filter(m => !url.searchParams.has('status') || url.searchParams.get('status') !== 'eq.confirmed' || m.status === 'confirmed');
    if (table === 'event_b2b_availability') data = url.searchParams.get('profile_id')?.startsWith('eq.') ? state.availability.find(a => a.profile_id === viewerId) || null : state.availability;
    if (table === 'event_attendees') data = { id: url.searchParams.get('profile_id') === `eq.${viewerId}` ? 'viewer-attendee' : 'partner-attendee' };
    if (table === 'profiles') data = { id: partnerId, email: 'partner@example.test', full_name: 'Meeting Partner', job_title: 'Founder', company: 'Solar Works', industry: 'Energy' };
    if (table === 'event_notification_settings') data = { is_bell_enabled: notificationsEnabled, is_email_enabled: notificationsEnabled };
    if (!['GET', 'HEAD'].includes(method)) {
      const payload = request.postDataJSON(); state.writes.push({ table, method, payload });
      if (state.failSave) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
      if (table === 'event_b2b_availability') {
        state.availability = method === 'DELETE' ? [] : [payload];
        data = { profile_id: viewerId };
      }
      if (table === 'event_b2b_meetings') {
        if (state.blockSave) return route.fulfill({ status: 400, json: { code: '23514', message: 'B2B_PARTICIPANT_BUSY' } });
        data = { id: 'saved-meeting' };
      }
    }
    return route.fulfill({ json: data });
  });
  const visit = () => page.goto(`${fixture}?mode=${mode}${foreignEvent ? '&event=00000000-0000-0000-0000-000000000002' : ''}`);
  await visit();
  return { state, visit };
}

async function selectDate(page, locale = 'en') {
  if (locale === 'en') await expect(page.getByText('In-person', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /November.*20|20.*novembre/i }).click();
  await expect(page.getByRole('button', { name: /^14:00/ })).toBeVisible();
}

test('FB-04: only in-person is offered for this event, with one date button per date and event-zone slots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page);
  await expect(page.getByRole('button', { name: 'Online', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Hybrid', exact: true })).toHaveCount(0);
  await expect(page.getByText('Times shown in Africa/Tunis')).toBeVisible();
  await expect(page.getByRole('button', { name: /November.*20|20.*novembre/i })).toHaveCount(1);
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeEnabled();
});

test('FB-04: unrelated events retain online and hybrid meeting formats', async ({ page }) => {
  await setup(page, { foreignEvent: true });
  await expect(page.getByRole('button', { name: 'Online', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hybrid', exact: true })).toBeVisible();
});

test('FB-04: missing organizer times explain the situation and cannot submit an invalid request', async ({ page }) => {
  const { state } = await setup(page, { noSchedule: true });
  await expect(page.getByText(/organizer has not published networking times/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeDisabled();
  expect(state.writes).toEqual([]);
});

test('FB-07: a pending request does not block a different pair; the submitted time is in the event zone', async ({ page }) => {
  const { state } = await setup(page);
  state.meetings = [{ id: 'pending', event_id: eventId, status: 'pending', profile_a_id: viewerId, profile_b_id: 'someone-else', start_at: '2026-11-20T13:00:00Z', end_at: '2026-11-20T13:30:00Z', location: 'Table-01' }];
  await selectDate(page);
  await page.getByRole('button', { name: '14:00', exact: true }).click();
  await page.getByRole('button', { name: 'Schedule Meeting', exact: true }).click();
  await expect(page.getByText('Meeting requested', { exact: true })).toBeVisible();
  const write = state.writes.find(w => w.table === 'event_b2b_meetings');
  expect(write.payload[0]).toMatchObject({ start_at: '2026-11-20T13:00:00.000Z', end_at: '2026-11-20T13:30:00.000Z', status: 'pending', meta: { meeting_format: 'in-person' } });
});

test('FB-05: rescheduling sends the corrected recipient email and in-app notification', async ({ page }) => {
  const { state } = await setup(page, { mode: 'reschedule', notificationsEnabled: true });
  await selectDate(page);
  await page.getByRole('button', { name: '14:30', exact: true }).click();
  await page.getByRole('button', { name: 'Reschedule Meeting', exact: true }).click();
  await expect(page.getByText('Meeting rescheduled', { exact: true })).toBeVisible();
  await expect.poll(() => state.emails.length).toBe(1);
  expect(state.emails[0].to).toBe('partner@example.test');
  expect(state.emails[0].subject).toContain('Meeting Rescheduled');
  expect(state.writes.filter(write => write.table === 'notifications')).toHaveLength(1);
});

test('FB-07: overlapping confirmed meetings block participants; adjacent slots stay available', async ({ page }) => {
  const { state } = await setup(page);
  state.meetings = [{ id: 'confirmed', event_id: eventId, status: 'confirmed', profile_a_id: partnerId, start_at: '2026-11-20T12:45Z', end_at: '2026-11-20T13:15Z' }];
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00 Participant booked', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '14:30', exact: true })).toBeEnabled();
});

test('confirmed own bookings explain why a slot is blocked with any recipient; generated suggestions remain available', async ({ page }) => {
  const { state } = await setup(page);
  state.meetings = Array.from({ length: 173 }, (_, i) => ({ id: `suggestion-${i}`, event_id: eventId, status: 'pending',
    profile_a_id: viewerId, profile_b_id: `generated-${i}`, start_at: '2026-11-20T13:00Z', end_at: '2026-11-20T13:30Z',
    location: 'Table-01', meta: { is_bulk_match_all: true } }));
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeEnabled();
  state.meetings.push({ id: 'real-booking', event_id: eventId, status: 'confirmed', profile_a_id: viewerId,
    profile_b_id: 'someone-else', start_at: '2026-11-20T13:00Z', end_at: '2026-11-20T13:30Z' });
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00 You are booked', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '14:30', exact: true })).toBeEnabled();
  await expect(page.getByText('Only confirmed meetings reserve a time slot.', { exact: false })).toBeVisible();
});

test('full tables are distinct from a participant conflict', async ({ page }) => {
  const { state } = await setup(page);
  state.meetings = [{ id: 'other-booking', event_id: eventId, status: 'confirmed', profile_a_id: 'someone-else',
    profile_b_id: 'another-person', start_at: '2026-11-20T13:00Z', end_at: '2026-11-20T13:30Z' }];
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00 Tables full', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '14:30', exact: true })).toBeEnabled();
});

test('FB-07/09: slot lookup errors fail closed and offer retry', async ({ page }) => {
  const { state } = await setup(page); state.failSlots = true;
  await page.getByRole('button', { name: /November.*20|20.*novembre/i }).click();
  await expect(page.getByRole('alert')).toContainText('We could not verify');
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeDisabled();
  state.failSlots = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeEnabled();
});

test('FB-07: a slot confirmed after selection is rechecked before saving', async ({ page }) => {
  const { state } = await setup(page);
  await selectDate(page); await page.getByRole('button', { name: '14:00', exact: true }).click();
  state.changed = true;
  await page.getByRole('button', { name: 'Schedule Meeting', exact: true }).click();
  await expect(page.getByText('This slot is no longer available. Please choose another time.')).toBeVisible();
  expect(state.writes.filter(w => w.table === 'event_b2b_meetings')).toEqual([]);
});

test('FB-07: a database conflict is explained without a false success', async ({ page }) => {
  const { state } = await setup(page); state.blockSave = true;
  await selectDate(page); await page.getByRole('button', { name: '14:00', exact: true }).click();
  await page.getByRole('button', { name: 'Schedule Meeting', exact: true }).click();
  await expect(page.getByText('A participant already has a confirmed meeting at this time.')).toBeVisible();
  await expect(page.getByText('Meeting requested', { exact: true })).toHaveCount(0);
});

test('FB-09: chosen availability persists after refresh, empty means unavailable, and all slots restores default', async ({ page }) => {
  const { state, visit } = await setup(page, { mode: 'availability' });
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await page.getByRole('radio', { name: 'Only the slots I choose' }).check();
  // Chosen times are seeded with every organizer slot, matching the default.
  for (const box of await page.locator('.availability-slots input[type=checkbox]').all()) await box.uncheck();
  await page.getByRole('checkbox', { name: '2026-11-20 14:30', exact: true }).check();
  await page.getByRole('button', { name: 'Save availability', exact: true }).click();
  await expect(page.getByText('Availability saved.', { exact: true })).toBeVisible();
  expect(state.availability[0].available_slots).toEqual(['2026-11-20T13:30:00.000Z']);
  await visit(); await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: '2026-11-20 14:30', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: '2026-11-20 14:30', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save availability', exact: true }).click();
  await expect(page.getByText('Availability saved.', { exact: true })).toBeVisible();
  expect(state.availability[0].available_slots).toEqual([]);
  await page.getByRole('radio', { name: 'All organizer slots', exact: true }).check();
  await page.getByRole('button', { name: 'Save availability', exact: true }).click();
  await expect(page.getByText('Availability saved.', { exact: true })).toBeVisible();
  expect(state.availability).toEqual([]);
});

test('FB-09: a save failure preserves chosen slots and retry saves them', async ({ page }) => {
  const { state } = await setup(page, { mode: 'availability' });
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await page.getByRole('radio', { name: 'Only the slots I choose' }).check();
  await page.getByRole('checkbox', { name: '2026-11-20 14:00', exact: true }).check();
  state.failSave = true;
  await page.getByRole('button', { name: 'Save availability', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('We could not save your availability');
  await expect(page.getByRole('checkbox', { name: '2026-11-20 14:00', exact: true })).toBeChecked();
  state.failSave = false;
  await page.getByRole('button', { name: 'Save availability', exact: true }).click();
  await expect(page.getByText('Availability saved.', { exact: true })).toBeVisible();
});

test('FB-09: another participant\'s declared availability controls offered times', async ({ page }) => {
  const { state } = await setup(page);
  state.availability = [{ profile_id: partnerId, available_slots: ['2026-11-20T13:30:00Z'] }];
  await selectDate(page);
  await expect(page.getByRole('button', { name: '14:00 Unavailable', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '14:30', exact: true })).toBeEnabled();
});

test('FB-09: French availability fits a mobile viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { mode: 'availability', locale: 'fr' });
  await page.getByRole('button', { name: 'Mes disponibilités', exact: true }).click();
  await page.getByRole('radio', { name: 'Uniquement les créneaux choisis' }).check();
  await expect(page.getByRole('checkbox', { name: '2026-11-20 14:00', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('availability-fr-mobile.png'), fullPage: true });
});

test('FB-01: public networking excludes opted-out, unlinked, inactive, and disabled profiles while retaining eligible event guests', async ({ page }) => {
  const attendees = [
    { id: 'a1', profile_id: 'p1', name: 'Eligible Member', status: 'approved', meta: { b2bOptIn: true } },
    { id: 'a2', profile_id: 'p2', name: 'Eligible Guest', status: 'registered', meta: { b2bOptIn: true } },
    { id: 'a3', profile_id: 'p3', name: 'Opted Out', status: 'approved', meta: { b2bOptIn: false } },
    { id: 'a4', profile_id: null, name: 'Unlinked Guest', status: 'approved', meta: { b2bOptIn: true } },
    { id: 'a5', profile_id: 'p5', name: 'Disabled Profile', status: 'approved', meta: { b2bOptIn: true } },
    { id: 'a6', profile_id: 'p6', name: 'Inactive Registration', status: 'cancelled', meta: { b2bOptIn: true } },
  ];
  const queries = [];
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-5/6' }, body: '' });
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Forum', status: 'published' };
    if (table === 'event_attendees') {
      queries.push(Object.fromEntries(url.searchParams));
      data = attendees.filter(a => a.profile_id && a.meta.b2bOptIn && ['registered', 'approved'].includes(a.status));
    }
    if (table === 'profiles') data = attendees.filter(a => a.profile_id).map(a => ({ id: a.profile_id, b2b_enabled: a.profile_id !== 'p5' }));
    return route.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/attendees`);
  await expect(page.getByRole('heading', { name: 'Eligible Member', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Eligible Guest', exact: true })).toBeVisible();
  for (const name of ['Opted Out', 'Unlinked Guest', 'Disabled Profile', 'Inactive Registration']) await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  await expect(page.getByText('Showing 2 of 2 participants')).toBeVisible();
  expect(queries[0]).toMatchObject({ status: 'in.(registered,approved)', 'meta->>b2bOptIn': 'eq.true', profile_id: 'not.is.null' });
});
