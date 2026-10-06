import { test, expect } from '@playwright/test';
const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';

test('sector filters use event answers and search across all pages', async ({ page }) => {
  const attendees = Array.from({ length: 52 }, (_, i) => ({ id: `a${i}`, name: `Person ${String(i).padStart(2, '0')}`, profile_id: `p${i}`, meta: { sector: i === 51 ? 'Energy' : 'Technology' } }));
  attendees.push({ id: 'unknown', name: 'Unknown sector', meta: {} });
  const writes = [];
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    if (!['HEAD', 'GET'].includes(route.request().method())) writes.push(route.request().method());
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Forum', status: 'published' };
    if (table === 'event_attendees') data = attendees.slice(Number(url.searchParams.get('offset') || 0), Number(url.searchParams.get('offset') || 0) + Number(url.searchParams.get('limit') || 500));
    // A conflicting account sector must not override the event answer.
    if (table === 'profiles') data = attendees.filter(a => a.profile_id).map(a => ({ id: a.profile_id, sector: 'Account sector' }));
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-52/53' }, body: '' });
    return route.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/attendees`);
  const sector = page.getByRole('combobox', { name: 'Filter by sector' });
  await expect(sector).toBeVisible();
  await expect(sector.getByRole('option', { name: 'Energy', exact: true })).toHaveCount(1);
  await expect(sector.getByRole('option', { name: 'Account sector', exact: true })).toHaveCount(0);
  await sector.selectOption('Energy');
  await expect(page.getByRole('heading', { name: 'Person 51', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Person 00', exact: true })).toHaveCount(0);
  await expect(page.getByText('Showing 1 of 53 participants')).toBeVisible();
  await sector.selectOption('All');
  await page.getByPlaceholder('Search by name, company, or title...').fill('Person 51');
  await expect(page.getByRole('heading', { name: 'Person 51', exact: true })).toBeVisible();
  await page.getByPlaceholder('Search by name, company, or title...').clear();
  await sector.selectOption('__none');
  await expect(page.getByRole('heading', { name: 'Unknown sector', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(writes).toEqual([]);
});
