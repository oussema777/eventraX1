import { test, expect } from '@playwright/test';

test('participant tabs reconcile public registrations, approvals and cancelled entries', async ({ page }) => {
  const rows = [
    ...Array.from({ length: 164 }, (_, i) => ({ id: `approved-${i}`, name: `Approved Guest ${i}`, status: 'approved' })),
    ...Array.from({ length: 14 }, (_, i) => ({ id: `registered-${i}`, name: `Registered Guest ${i}`, status: 'registered' })),
    { id: 'cancelled', name: 'Cancelled Guest', status: 'cancelled' },
  ];
  await page.route('**/rest/v1/**', route => {
    const table = new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({ json: table === 'event_attendees' ? rows : table === 'events' ? { name: 'Status Test' } : [] });
  });
  await page.goto('/tests/fixtures/attendee-status.html');
  await expect(page.getByRole('button', { name: /^All\s*179$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Approved\s*164$/ })).toBeVisible();
  await page.getByRole('button', { name: /^Registered\s*14$/ }).click();
  await expect(page.getByText('Registered Guest 0', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('Approved Guest 0', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /^Cancelled\s*1$/ }).click();
  await expect(page.getByText('Cancelled Guest', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('Registered Guest 0', { exact: true })).toHaveCount(0);
});
