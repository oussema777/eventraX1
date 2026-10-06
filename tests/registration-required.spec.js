import { test, expect } from '@playwright/test';
import { fillRequiredRegistration } from './fixtures/registration-answers.js';
for (const eventId of ['769d7854-9bae-49e6-9db9-c88c0586a402', '11111111-2222-4333-8444-555555555555']) {
  test(`every registration field is visibly required and enforced for ${eventId}`, async ({ page }) => {
    const writes = [];
    await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
    await page.route('**/rest/v1/**', r => {
      if (!['GET','HEAD'].includes(r.request().method())) writes.push(r.request().method());
      const table = new URL(r.request().url()).pathname.split('/').pop();
      let data = [];
      if (table === 'events') data = { id: eventId, name: 'Required fields test', status: 'published' };
      if (table === 'event_forms') data = [{ form_type: 'registration', status: 'active', schema: {
        fields: [{ id: 'note', label: 'Your objective', type: 'text', required: false }],
        systemRequired: Object.fromEntries(['phone','companyName','companyDescription','interests','sector','socialUrl'].map(k => ['system-'+k,false]))
      } }];
      return r.fulfill({ json: data });
    });
    await page.goto(`/event/${eventId}/register`);
    await page.locator('.registration-language select').selectOption('en');
    const labels = page.locator('.registration-field > label');
    await expect(labels).toHaveCount(9);
    for (const label of await labels.all()) {
      await expect(label).toContainText('*');
      await expect(label.locator('span').filter({ hasText: '*' }).first()).toHaveCSS('color', 'rgb(248, 113, 113)');
    }
    await expect(page.locator('fieldset legend')).toContainText('*');
    const next = page.locator('.registration-action-buttons button').last();
    await expect(next).toBeDisabled();
    await fillRequiredRegistration(page);
    await expect(next).toBeDisabled();
    await page.getByRole('radio', { name: 'No', exact: true }).check();
    await expect(next).toBeDisabled();
    const custom = page.locator('.registration-field').filter({ has: page.locator('label', { hasText: 'Your objective' }) }).locator('input');
    await custom.fill('Find partners');
    await expect(next).toBeEnabled();
    await page.getByPlaceholder('Acme Corp').clear();
    await expect(next).toBeDisabled();
    await page.getByPlaceholder('Acme Corp').fill('Test Company');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByRole('button', { name: 'Complete Registration' })).toBeVisible();
    expect(writes).toEqual([]);
  });
}
