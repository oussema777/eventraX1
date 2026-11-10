import { test, expect } from '@playwright/test';

test('meeting pages load only visible details and retain global search and counts', async ({ page }) => {
  const records = Array.from({ length: 23 }, (_, i) => ({
    id: `30000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    attendee_a_id: `a-${i}`, attendee_b_id: `b-${i}`, status: i % 2 ? 'confirmed' : 'pending',
    created_at: new Date(Date.UTC(2026, 10, 10, 12, 23 - i)).toISOString(), start_at: '2026-11-26T16:30:00Z',
    is_ai: false, match_score: 0, meta: { message: `Meeting ${i}` }
  }));
  const people = records.flatMap((r, i) => [
    { id: r.attendee_a_id, name: `Person ${i}`, company: i === 22 ? 'Unique company' : 'Example', meta: {}, profile_id: null },
    { id: r.attendee_b_id, name: `Partner ${i}`, company: 'Example', meta: {}, profile_id: null }
  ]);
  const detailRequests = [];
  let retried = false;
  await page.addInitScript(() => localStorage.setItem('eventra_locale', 'en'));
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    const select = url.searchParams.get('select');
    let data = [];
    if (table === 'get_meeting_delivery_status') data = { worker_checked_at: null, counts: { failed: retried ? 0 : 1, queued: retried ? 1 : 0 }, recent: retried ? [] : [{ id: 'retry-job', meeting_id: records[0].id, state: 'failed', error_code: 'PROVIDER_429', can_retry: true }] };
    if (table === 'retry_meeting_delivery') { retried = true; data = true; }
    if (table === 'events') data = { start_date: '2026-11-26', end_date: '2026-11-26' };
    if (table === 'event_b2b_settings') data = { venue_config: {} };
    if (table === 'event_b2b_meetings') {
      if (select === 'id,meta') {
        const ids = url.searchParams.get('id');
        data = records.filter(r => ids.includes(r.id));
        detailRequests.push(data.length);
      } else data = records.map(({ meta, ...r }) => r);
    }
    if (table === 'event_attendees') {
      const ids = url.searchParams.get('id');
      data = ids ? people.filter(p => ids.includes(p.id)) : people;
    }
    await route.fulfill({ json: data, headers: { 'content-range': '0-0/0' } });
  });
  await page.goto('/tests/fixtures/b2b-pagination.html');
  await page.getByRole('button', { name: 'All Meetings', exact: true }).click();
  const pager = page.getByRole('navigation', { name: 'Meeting pagination' });
  await expect(pager).toContainText('1–10 / 23');
  await expect(page.getByTitle('View Details')).toHaveCount(10);
  await expect(page.getByTitle('View Details').first()).toBeEnabled();
  expect(detailRequests.at(-1)).toBe(10);
  await page.getByRole('checkbox', { name: 'Select meetings on this page' }).check();
  await expect(page.locator('input[type=checkbox]:checked')).toHaveCount(11);
  await pager.getByRole('button', { name: 'Next' }).click();
  await expect(pager).toContainText('11–20 / 23');
  await expect(page.locator('input[type=checkbox]:checked')).toHaveCount(0);
  await pager.getByRole('button', { name: 'Next' }).click();
  await expect(pager).toContainText('21–23 / 23');
  await expect(page.getByTitle('View Details')).toHaveCount(3);
  await expect(page.getByTitle('View Details').first()).toBeEnabled();
  expect(detailRequests.at(-1)).toBe(3);
  await expect(pager.getByRole('button', { name: 'Next' })).toBeDisabled();
  await page.getByPlaceholder('Search by name, company...').fill('Unique company');
  await expect(pager).toContainText('1–1 / 1');
  await expect(page.getByText('Person 22', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Search by name, company...').fill('no results');
  await expect(pager).toContainText('0–0 / 0');
  await page.getByPlaceholder('Search by name, company...').fill('');
  await pager.getByLabel('Rows per page').selectOption('25');
  await expect(page.getByTitle('View Details')).toHaveCount(23);
  await page.getByText('Meeting email delivery', { exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('Delivery worker has not checked in');
  await page.getByRole('button', { name: 'Retry safely' }).click();
  await expect(page.getByRole('button', { name: 'Retry safely' })).toHaveCount(0);
  expect(retried).toBe(true);
  await expect(pager).toContainText('Page 1 of 1');
  // A failed server mutation must not announce success or remove the meeting.
  await page.route('**/rest/v1/event_b2b_meetings?**', route => route.request().method() === 'PATCH'
    ? route.fulfill({ status: 403, json: { message: 'Not authorized' } }) : route.fallback());
  page.on('dialog', dialog => dialog.accept());
  await page.getByTitle('Cancel Meeting').first().click();
  await expect(page.getByText('Failed to cancel', { exact: true })).toBeVisible();
  await expect(page.getByTitle('View Details')).toHaveCount(23);
});
