import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const otherId = '44444444-4444-4444-8444-444444444444';
const viewer = '11111111-1111-4111-8111-111111111111';
const partner = '22222222-2222-4222-8222-222222222222';
async function setup(page, { multiple = false, unavailable = false, eligible = true, fail = false, locale = 'en' } = {}) {
  const writes = [];
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    const method = route.request().method();
    let data = [];
    if (table === 'b2b_event_eligible') data = eligible;
    if (table === 'profiles') data = { id: viewer, full_name: 'Youssef Ben Ali', job_title: 'Director', company: 'Atlas Ventures', industry: 'Energy' };
    if (table === 'event_attendees') data = url.searchParams.get('select') === 'id' ? { id: 'attendee' } : [eventId, ...(multiple ? [otherId] : [])].flatMap(event_id => [viewer, partner].map(profile_id => ({ event_id, profile_id })));
    if (table === 'events') {
      const events = [{ id: eventId, name: "L’Investissement", timezone: 'Africa/Tunis' }, { id: otherId, name: 'Design Forum', timezone: 'Europe/Paris' }];
      data = url.searchParams.get('id')?.startsWith('in.') ? events.slice(0, multiple ? 2 : 1) : events.find(e => `eq.${e.id}` === url.searchParams.get('id'));
    }
    if (table === 'event_b2b_settings') {
      if (fail) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
      const other = url.searchParams.get('event_id') === `eq.${otherId}`;
      data = { venue_config: { tableCount: 2, slotDuration: other ? 45 : 30, allowedMeetingFormats: ['in-person'], schedules: [{ date: '2027-11-20', start: other ? '10:00' : '14:00', end: other ? '11:30' : '17:00' }, { date: '2027-11-21', start: '10:00', end: '11:30' }] } };
    }
    if (table === 'event_b2b_availability') data = unavailable ? [{ profile_id: partner, available_slots: [] }] : [];
    if (table === 'event_notification_settings') data = { is_bell_enabled: false, is_email_enabled: false };
    if (table === 'event_b2b_meetings' && method === 'POST') { writes.push(route.request().postDataJSON()[0]); data = { id: 'saved-meeting' }; }
    return route.fulfill({ json: data });
  });
  return writes;
}
const url = '/tests/fixtures/networking-schedule.html?mode=profile';
test('inline booking sends the chosen slot through the shared booking flow', async ({ page }, testInfo) => {
  const writes = await setup(page);
  await page.goto(url);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: '14:30', exact: true }).click();
  await expect(page.locator('.profile-booking__receipt')).toContainText('14:30');
  await page.getByRole('textbox').fill('Let’s discuss solar partnerships.');
  await page.locator('.profile-booking').screenshot({ path: testInfo.outputPath('profile-booking-desktop.png') });
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Send invitation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your invitation is on its way' })).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({ event_id: eventId, start_at: '2027-11-20T13:30:00.000Z', status: 'pending', meta: { message: 'Let’s discuss solar partnerships.' } });
});
test('event switching clears the previous slot and uses the other event duration', async ({ page }) => {
  await setup(page, { multiple: true });
  await page.goto(`${url}&global=1`);
  await page.getByRole('combobox').selectOption(eventId);
  await page.getByRole('button', { name: '14:00', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Send invitation', exact: true })).toBeEnabled();
  await page.getByRole('combobox').selectOption(otherId);
  await expect(page.getByText('45 minutes', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '10:45', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send invitation', exact: true })).toBeDisabled();
  await expect(page.locator('.profile-booking__receipt')).not.toContainText('14:00');
});
test('unavailability explains the empty state and cannot be booked', async ({ page }) => {
  await setup(page, { unavailable: true });
  await page.goto(url);
  await expect(page.getByText('No shared time on this day.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send invitation', exact: true })).toBeDisabled();
  await expect(page.locator('.meeting-booking__slots button:enabled')).toHaveCount(0);
});
test('eligibility and schedule failures never advertise bookable times', async ({ page }) => {
  await setup(page, { eligible: false });
  await page.goto(url);
  await expect(page.getByText('Your account is not currently eligible', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View event' })).toHaveCount(0);
  await expect(page.locator('.meeting-booking__slots')).toHaveCount(0);
  await page.route('**/rest/v1/rpc/b2b_event_eligible', r => r.fulfill({ json: true }));
  await page.route('**/rest/v1/event_b2b_settings?**', r => r.fulfill({ status: 503, json: { message: 'Failure' } }));
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send invitation', exact: true })).toBeDisabled();
});
for (const locale of ['fr', 'ar']) test(`${locale} mobile layout keeps the invitation readable and fits the viewport`, async ({ page }, testInfo) => {
  await setup(page, { locale });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.getByRole('button', { name: '14:00', exact: true }).click();
  await expect(page.locator('.profile-booking__receipt')).toContainText('14:00');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.profile-booking').screenshot({ path: testInfo.outputPath(`profile-booking-${locale}-mobile.png`) });
});

test('a single shared event opens directly, while visitors get a sign-in invitation', async ({ page }) => {
  await setup(page);
  await page.goto(`${url}&global=1`);
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await page.goto(`${url}&visitor=1`);
  await expect(page.getByRole('button', { name: 'Sign in to find a time' })).toBeVisible();
  await expect(page.locator('.meeting-booking__slots')).toHaveCount(0);
});

test('missing or elapsed schedules do not offer invented times', async ({ page }) => {
  await setup(page);
  await page.route('**/rest/v1/event_b2b_settings?**', r => r.fulfill({ json: { venue_config: { allowedMeetingFormats: ['in-person'], schedules: [] } } }));
  await page.goto(url);
  await expect(page.getByText('The organizer has not published networking times yet.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send invitation' })).toBeDisabled();
  await page.route('**/rest/v1/event_b2b_settings?**', r => r.fulfill({ json: { venue_config: { schedules: [{ date: '2020-01-01', start: '14:00', end: '15:00' }] } } }));
  await page.reload();
  await expect(page.getByText('Networking times for this event have ended.')).toBeVisible();
  await expect(page.locator('.meeting-booking__dates button:enabled')).toHaveCount(0);
});

test('online invitations use the event timezone rather than the browser timezone', async ({ page }) => {
  const writes = await setup(page);
  await page.route('**/rest/v1/event_b2b_settings?**', r => r.fulfill({ json: { venue_config: { allowedMeetingFormats: ['video'] } } }));
  await page.goto(`${url}&event=${otherId}`);
  await page.locator('input[type=date]').fill('2027-11-20');
  await page.locator('input[type=time]').fill('10:00');
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByRole('heading', { name: 'Your invitation is on its way' })).toBeVisible();
  expect(writes[0]).toMatchObject({ event_id: otherId, start_at: '2027-11-20T09:00:00.000Z', end_at: '2027-11-20T09:30:00.000Z', meta: { meeting_format: 'video' } });
});

test('a failed eligibility check can be retried without losing event context', async ({ page }) => {
  await setup(page);
  let fail = true;
  await page.route('**/rest/v1/rpc/b2b_event_eligible', route => fail ? route.fulfill({ status: 503, json: { message: 'Failure' } }) : route.fallback());
  await page.goto(url);
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeVisible();
});

test('organizers preview booking inline without eligibility or private availability access', async ({ page }) => {
  const writes = await setup(page, { eligible: false, locale: 'fr' });
  await page.route('**/rest/v1/rpc/event_access_role', route => route.fulfill({ json: 'owner' }));
  const availabilityReads = [];
  await page.route('**/rest/v1/event_b2b_availability?**', route => {
    availabilityReads.push(route.request().url());
    return route.fulfill({ status: 403, json: { message: 'Not a participant' } });
  });
  await page.goto(url);
  await expect(page.getByText('Aperçu organisateur', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '14:30', exact: true }).click();
  await expect(page.locator('.profile-booking__receipt')).toContainText('14:30');
  await page.getByRole('textbox').fill('Preview only');
  await expect(page.getByRole('button', { name: 'Envoyer l’invitation' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Voir l’événement' })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp('mode=profile$'));
  expect(availabilityReads).toEqual([]);
  expect(writes).toEqual([]);
});

test('organizers who are eligible participants retain real inline booking', async ({ page }) => {
  await setup(page);
  await page.route('**/rest/v1/rpc/event_access_role', route => route.fulfill({ json: 'owner' }));
  await page.goto(url);
  await page.getByRole('button', { name: '14:30', exact: true }).click();
  await expect(page.getByText('Organizer preview', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Send invitation' })).toBeEnabled();
});
