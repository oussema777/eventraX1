import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const attendees = [
  { id: 'a1', profile_id: 'guest1', status: 'approved', name: 'Amira Nasri', company: 'Solar Works', meta: { 'Job Title': 'Founder', email: 'private@example.test' } },
  { id: 'a2', profile_id: null, name: 'Aziz Jemai', company: 'Atlas', meta: { company_description: 'Building sustainable businesses.' } },
];
async function setup(page) {
  const writes = [];
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    if (!['GET', 'HEAD'].includes(route.request().method())) writes.push(route.request().method());
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Business Forum', status: 'published' };
    if (table === 'event_attendees') {
      if (url.searchParams.has('profile_id') || url.searchParams.has('id')) {
        expect(url.searchParams.get('event_id')).toBe(`eq.${eventId}`);
        data = attendees.find(a =>
          (!url.searchParams.has('status') || url.searchParams.get('status') === `eq.${a.status}`) &&
          (url.searchParams.get('profile_id') === `eq.${a.profile_id}` || url.searchParams.get('id') === `eq.${a.id}`)) || null;
      } else data = attendees;
    }
    if (table === 'profiles') {
      const guest = { id: 'guest1', full_name: 'Amira Nasri', job_title: 'Founder', company: 'Solar Works', account_type: 'event_guest', bio: 'Developing solar energy projects.', b2b_profile: { enabled: true, skills: ['Solar design'] }, professional_data: {} };
      data = url.searchParams.get('id')?.startsWith('in.') ? [guest] : guest;
    }
    if (table === 'profile_education') data = [{ id: 'edu', degree: 'Engineering', institution: 'University of Tunis', years: '2018' }];
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-1/2' }, body: '' });
    return route.fulfill({ json: data });
  });
  return writes;
}
test('View Profile opens the full guest page, survives refresh, and returns to the directory', async ({ page }) => {
  const writes = await setup(page);
  await page.goto(`/event/${eventId}/attendees`);
  await page.getByRole('button', { name: 'View Profile', exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/event/${eventId}/profile/guest1$`));
  await expect(page.getByRole('heading', { name: 'Amira Nasri', exact: true })).toBeVisible();
  await expect(page.getByText('Developing solar energy projects.', { exact: true })).toBeVisible();
  await expect(page.getByText('University of Tunis')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('private@example.test')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Amira Nasri', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /back/i }).click();
  await expect(page).toHaveURL(new RegExp(`/event/${eventId}/attendees$`));
  expect(writes).toEqual([]);
});
test('unlinked participants use the full page with registration details on mobile', async ({ page }) => {
  await setup(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/event/${eventId}/attendees`);
  await page.getByRole('button', { name: 'View Profile', exact: true }).last().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/event/${eventId}/participant/a2$`));
  await expect(page.getByRole('heading', { name: 'Aziz Jemai', exact: true })).toBeVisible();
  await expect(page.getByText('Building sustainable businesses.', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /request meeting|send message/i })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.tmp/full-event-profile-mobile.png', fullPage: true });
});
test('event context does not expose an unrelated profile and global guest profiles remain hidden', async ({ page }) => {
  await setup(page);
  await page.goto(`/event/${eventId}/profile/not-in-event`);
  await expect(page.getByRole('heading', { name: /profile not found/i })).toBeVisible();
  await page.goto('/profile/guest1');
  await expect(page.getByRole('heading', { name: /profile not found/i })).toBeVisible();
});

test('RLS-hidden profile uses available event details without getting stuck', async ({ page }) => {
  await setup(page);
  await page.route('**/rest/v1/profiles?**', r => r.fulfill({ json: null }));
  await page.goto(`/event/${eventId}/profile/guest1`);
  await expect(page.getByRole('heading', { name: 'Amira Nasri', level: 1 })).toBeVisible();
  await expect(page.getByText('Founder @ Solar Works')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('missing optional profile columns do not break the full profile page', async ({ page }) => {
  await setup(page);
  await page.route('**/rest/v1/profiles?**', route => {
    const fields = new URL(route.request().url()).searchParams.get('select');
    expect(fields).not.toMatch(/email|phone|\*/);
    if (fields.split(',').includes('department')) return route.fulfill({ status: 400, json: { code: '42703', message: 'column profiles.department does not exist' } });
    return route.fulfill({ json: { id: 'guest1', full_name: 'Amira Nasri', bio: 'Full professional biography.' } });
  });
  await page.goto(`/event/${eventId}/profile/guest1`);
  await expect(page.getByText('Full professional biography.', { exact: true })).toBeVisible();
});

test('a failed profile request offers retry instead of claiming the profile is missing', async ({ page }) => {
  await setup(page);
  let fail = true;
  await page.route('**/rest/v1/event_attendees?**', route => {
    if (fail) return route.fulfill({ status: 503, json: { message: 'Temporary connection failure' } });
    return route.fulfill({ json: attendees[0] });
  });
  await page.goto(`/event/${eventId}/profile/guest1`);
  await expect(page.getByRole('alert')).toContainText('We could not load this profile.');
  await expect(page.getByText(/profile not found/i)).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Amira Nasri', level: 1 })).toBeVisible();
});
