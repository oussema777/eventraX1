import { test, expect } from '@playwright/test';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';

test('failed B2B provisioning preserves answers and cannot send a false confirmation', async ({ page }) => {
  let attempts = 0;
  let fallbackWrites = 0;
  let emails = 0;
  await page.route('**/auth/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/functions/v1/create-event-registration', route => {
    attempts++;
    return route.fulfill({ status: 503, json: { error: 'Account setup unavailable' } });
  });
  await page.route('**/send-email', route => { emails++; return route.fulfill({ json: {} }); });
  await page.route('**/rest/v1/**', route => {
    const table = new URL(route.request().url()).pathname.split('/').pop();
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'B2B registration test', status: 'published', workshop_selection_limit: null };
    if (table === 'event_forms') data = [{ form_type: 'registration', status: 'active', schema: {
      fields: [], systemRequired: Object.fromEntries(['phone', 'companyName', 'companyDescription', 'interests', 'sector', 'socialUrl'].map(key => [`system-${key}`, false]))
    } }];
    if (table === 'create_event_attendee_with_sessions') { fallbackWrites++; data = { id: 'unlinked-attendee' }; }
    return route.fulfill({ json: data });
  });
  await page.goto(`/event/${eventId}/register`);
  await page.locator('.registration-language select').selectOption('en');
  await page.getByPlaceholder('John Doe').fill('Test Attendee');
  await page.getByPlaceholder('john@company.com').fill('guest@example.test');
  await page.getByRole('switch').click();
  await page.locator('.registration-action-buttons button').last().click();
  await page.getByRole('button', { name: 'Complete Registration' }).click();
  await expect(page.getByText(/could not finish setting up your B2B access/)).toBeVisible();
  expect(attempts).toBe(1);
  expect(fallbackWrites).toBe(0);
  expect(emails).toBe(0);
  await expect(page.getByRole('button', { name: 'Complete Registration' })).toBeEnabled();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByPlaceholder('John Doe')).toHaveValue('Test Attendee');
  await expect(page.getByPlaceholder('john@company.com')).toHaveValue('guest@example.test');
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
});
