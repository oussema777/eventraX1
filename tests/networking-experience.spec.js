import { test, expect } from '@playwright/test';
import fr from '../src/i18n/locales/fr';
import ar from '../src/i18n/locales/ar';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: { account_type: 'user' }, user_metadata: {}, created_at: '2026-01-01' };
const partner = { id: '22222222-2222-4222-8222-222222222222', full_name: 'Amira Mansour', job_title: 'Founder', company: 'Solar Works', industry: 'Energy', sector: 'Energy', bio: 'Fondatrice de Solar Works.\nJe développe des projets solaires en Tunisie.' };
const event = { id: eventId, name: "L'INVESTISSEMENT", start_date: '2027-11-20', end_date: '2027-11-20', timezone: 'Africa/Tunis' };
async function setup(page, { ready = false, availabilityError = false, savedPair = false, multipleEvents = false, locale = 'en' } = {}) {
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  let profile = { ...user, full_name: 'Youssef Ben Ali', company: 'Atlas Ventures', industry: 'Energy', location: 'Tunis', country: 'Tunisia', gender: 'male', job_title: ready ? 'Director' : '' };
  const people = savedPair ? [partner, ...Array.from({ length: 5 }, (_, i) => ({ ...partner, id: `33333333-3333-4333-8333-33333333333${i}`, full_name: `Participant ${i + 1}`, industry: i < 1 ? 'Energy' : 'Agriculture', sector: i < 1 ? 'Energy' : 'Agriculture' }))] : [partner];
  let savedMatches = savedPair ? people.slice(0, 2).map((person, i) => ({ id: `saved-${i}`, profile_id: user.id, matched_profile_id: person.id, event_id: eventId, score: 90, status: i === 1 ? 'dismissed' : 'new' })) : [];
  const eventList = multipleEvents ? [event, { ...event, id: '44444444-4444-4444-8444-444444444444', name: 'Second Forum' }] : [event];
  let availability = null;
  const writes = [];
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    const method = route.request().method();
    const select = url.searchParams.get('select') || '';
    let data = [];
    if (method !== 'GET') writes.push({ table, method, data: route.request().postDataJSON() });
    if (table === 'profiles') {
      if (method === 'PATCH') profile = { ...profile, ...route.request().postDataJSON() };
      data = url.searchParams.get('id')?.startsWith('in.') ? [profile, ...people] : url.searchParams.get('id') === `eq.${partner.id}` ? partner : profile;
    }
    // Match the live schema: location is only available through location_address.
    if (table === 'events' && select.split(',').map(field => field.trim()).includes('location')) return route.fulfill({ status: 400, json: { code: '42703', message: 'column events.location does not exist' } });
    if (table === 'events') data = url.searchParams.get('id')?.startsWith('in.') ? eventList : eventList.find(item => `eq.${item.id}` === url.searchParams.get('id')) || event;
    if (table === 'event_attendees') {
      if (select === 'event_id') data = eventList.map(item => ({ event_id: item.id }));
      else if (select === 'id') data = url.searchParams.has('limit') ? { id: 'viewer-attendee' } : [{ id: 'viewer-attendee' }];
      else if (select.includes('interests:')) data = [profile, ...people].map(p => ({ profile_id: p.id, interests: p.sector === 'Agriculture' ? ['Farming'] : ['Investment'], sector: p.sector || 'Energy' }));
      else data = [];
    }
    if (table === 'b2b_matches') {
      if (method === 'POST') for (const row of route.request().postDataJSON()) {
        if (!savedMatches.some(saved => saved.matched_profile_id === row.matched_profile_id)) savedMatches.push({ ...row, id: `new-${row.matched_profile_id}` });
      }
      data = savedMatches;
    }
    if (table === 'event_b2b_settings') data = { venue_config: { tableCount: 4, slotDuration: 30, schedules: [{ date: '2027-11-20', start: '14:00', end: '15:00' }] } };
    if (table === 'event_b2b_availability') {
      if (availabilityError) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
      if (method === 'POST') availability = route.request().postDataJSON();
      if (method === 'DELETE') availability = null;
      data = url.searchParams.get('profile_id')?.startsWith('in.') ? availability ? [availability] : [] : availability;
    }
    return route.fulfill({ json: data });
  });
  await page.goto('/login');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const enc = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    await supabase.auth.setSession({ access_token: `${enc({ alg: 'HS256' })}.${enc({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${enc('test')}`, refresh_token: 'test' });
  });
  await page.goto(`/event/${eventId}/networking`);
  await expect(page.getByRole('heading', { name: 'Amira Mansour' })).toBeVisible();
  return { writes };
}

for (const [locale, strings] of [['fr', fr], ['ar', ar]]) {
  test(`${locale}: networking cards, match reasons and booking use the chosen language`, async ({ page }) => {
    await setup(page, { ready: true, locale });
    await expect(page.locator('.participant-card__tags')).toContainText(strings.platformLabels.Investment);
    await page.getByRole('button', { name: strings.networking.people.requestMeeting, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(strings.meetingBooking.withPerson.replace('{name}', partner.full_name));
    await expect(dialog).toContainText(strings.meetingBooking.message);
    await dialog.getByRole('button', { name: strings.meetingBooking.close, exact: true }).click();
    await page.getByRole('button', { name: new RegExp(strings.networking.tabs.matches) }).click();
    await expect(page.locator('.participant-card__reason')).not.toContainText('Shared interests in');
    await expect(page.locator('.participant-card__reason')).toContainText(strings.networking.matches.categories.industries);
    await page.getByRole('link', { name: strings.eventAccount.myProfile, exact: true }).click();
    await page.getByRole('button', { name: strings.profile.tabs.professional, exact: true }).click();
    await expect(page.getByPlaceholder(strings.profile.placeholders.department)).toBeVisible();
  });
}

test('one hub remembers the event after visiting the profile, with a responsive introduction', async ({ page }, testInfo) => {
  await setup(page);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('hub-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('hub-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'My profile', exact: true }).click();
  await expect(page.getByLabel('Country', { exact: true })).toHaveValue('Tunisia');
  await page.getByRole('link', { name: 'Back to networking' }).click();
  await expect(page.getByRole('heading', { name: "L'INVESTISSEMENT" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Amira Mansour' })).toBeVisible();
});

test('booking shows the recipient bio on desktop and mobile and leaves room above slots', async ({ page }, testInfo) => {
  await setup(page, { ready: true, locale: 'fr' });
  await page.getByRole('button', { name: fr.networking.people.requestMeeting, exact: true }).click();
  const bio = page.locator('.meeting-booking__intro');
  await expect(bio).toHaveText(partner.bio);
  await expect(bio).toBeVisible();
  const hint = await page.locator('.meeting-booking__slot-hint').boundingBox();
  const slots = await page.locator('.meeting-booking__slots').boundingBox();
  expect(slots.y - (hint.y + hint.height)).toBeGreaterThanOrEqual(23);
  await page.screenshot({ path: testInfo.outputPath('booking-bio-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(bio).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('booking-bio-mobile.png') });
});

test('missing basics block booking and can be completed without leaving the selected person', async ({ page }) => {
  const { writes } = await setup(page);
  await page.getByRole('button', { name: 'Request meeting', exact: true }).click();
  await expect(page.getByText('With Amira Mansour', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeDisabled();
  const card = page.locator('.booking-readiness');
  await expect(card.getByLabel('Full name')).toHaveValue('Youssef Ben Ali');
  await card.getByLabel('Job title').fill('Director');
  await card.getByRole('button', { name: 'Save and unlock meetings' }).click();
  await expect(card.locator('section')).toHaveCount(0);
  await expect(page.getByText('With Amira Mansour', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '14:00', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeEnabled();
  expect(writes.filter(w => w.table === 'event_b2b_meetings')).toHaveLength(0);
  expect(writes.find(w => w.table === 'profiles' && w.method === 'PATCH').data).toMatchObject({ job_title: 'Director', industry: 'Energy' });
});

test('availability starts open for every slot, saves exceptions and restores the default', async ({ page }, testInfo) => {
  const { writes } = await setup(page, { ready: true });
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await expect(page.getByText('Available for all networking times', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Choose an event' })).toHaveValue(eventId);
  await expect(page.getByRole('option', { name: "L'INVESTISSEMENT" })).toHaveCount(1);
  const radios = page.locator('.meeting-availability input[type=radio]');
  await expect(radios.first()).toBeChecked();
  await radios.nth(1).check();
  const boxes = page.locator('.availability-slots input');
  await expect(boxes.first()).toBeChecked();
  await boxes.first().uncheck();
  await page.getByRole('button', { name: 'Save availability' }).click();
  await expect(page.getByRole('status')).toContainText('Availability saved');
  await page.reload();
  await expect(page.getByText('Using your chosen times')).toBeVisible();
  await expect(page.locator('.availability-slots input').first()).not.toBeChecked();
  await page.screenshot({ path: testInfo.outputPath('availability-desktop.png'), fullPage: true });
  await page.locator('.meeting-availability input[type=radio]').first().check();
  await page.getByRole('button', { name: 'Save availability' }).click();
  await expect.poll(() => writes.filter(w => w.table === 'event_b2b_availability' && w.method === 'DELETE').length).toBe(1);
});

test('an availability read failure never claims the user is available', async ({ page }) => {
  await setup(page, { ready: true, availabilityError: true });
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await expect(page.locator('.meeting-availability').getByRole('alert')).toBeVisible();
  await expect(page.getByText('Available for all networking times')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save availability' })).toHaveCount(0);
});


test('saved shortlists refresh with ranked cards, preserve dismissals and request a meeting directly', async ({ page }, testInfo) => {
  const { writes } = await setup(page, { ready: true, savedPair: true });
  await page.getByRole('button', { name: 'Smart Matches', exact: true }).click();
  const cards = page.locator('.networking-match-card');
  await expect(cards).toHaveCount(5);
  await expect(page.getByRole('heading', { name: 'Participant 1', exact: true })).toHaveCount(0);
  await expect(cards.first().locator('.networking-match-score')).toContainText('%');
  await expect(page.getByRole('button', { name: 'My Connections', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('ranked-matches.png'), fullPage: true });
  await cards.first().getByRole('button', { name: 'Request meeting', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Schedule Meeting' })).toBeVisible();
  expect(writes.filter(write => write.table === 'b2b_requests')).toHaveLength(0);
});

test('availability keeps its tab when changing events and shows the registration event after returning', async ({ page }) => {
  await setup(page, { ready: true, multipleEvents: true });
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  const picker = page.locator('.meeting-availability').getByRole('combobox', { name: 'Choose an event' });
  await expect(picker).toHaveValue(eventId);
  await picker.selectOption({ label: 'Second Forum' });
  await expect(page).toHaveURL(/tab=availability.*event=44444444/);
  await expect(page.getByRole('button', { name: 'My availability', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.meeting-availability').getByRole('combobox').selectOption(eventId);
  await page.getByRole('link', { name: 'My profile', exact: true }).click();
  await page.getByRole('link', { name: 'Back to networking' }).click();
  await page.getByRole('button', { name: 'My availability', exact: true }).click();
  await expect(page.locator('.meeting-availability').getByRole('combobox')).toHaveValue(eventId);
  await expect(page.getByText('Available for all networking times', { exact: true })).toBeVisible();
});

test('booking recovers from a failed schedule request and restores selectable times', async ({ page }) => {
  await setup(page, { ready: true });
  let unavailable = true;
  await page.route('**/rest/v1/event_b2b_settings?**', route => unavailable
    ? route.fulfill({ status: 503, json: { message: 'Temporary schedule failure' } })
    : route.fallback());
  await page.getByRole('button', { name: 'Request meeting', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('We could not verify');
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeDisabled();
  unavailable = false;
  await page.getByRole('alert').getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('button', { name: '14:00', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '14:00', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Schedule Meeting', exact: true })).toBeEnabled();
});

test('mobile booking keeps the selection visible and keyboard focus inside the dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { writes } = await setup(page, { ready: true });
  const trigger = page.getByRole('button', { name: 'Request meeting', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Schedule Meeting' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '14:00', exact: true }).click();
  await expect(dialog.locator('.meeting-booking__selection')).toContainText('14:00');
  const submit = dialog.getByRole('button', { name: 'Schedule Meeting', exact: true });
  await expect(submit).toBeInViewport();
  await expect(submit).toBeEnabled();
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await submit.focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(submit).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(writes.filter(write => write.table === 'event_b2b_meetings')).toHaveLength(0);
});
