import { test, expect } from '@playwright/test';

const id = '769d7854-9bae-49e6-9db9-c88c0586a402';
for (const mobile of [false, true]) {
  test(`country selection preserves answers and avoids navigation (${mobile ? 'mobile' : 'desktop'})`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      isMobile: mobile, hasTouch: mobile, locale: 'fr-FR',
    });
    const page = await context.newPage();
    let eventReads = 0;
    let documents = 0;
    page.on('request', request => { if (request.resourceType() === 'document') documents++; });
    await page.route('**/rest/v1/**', route => {
      const table = new URL(route.request().url()).pathname.split('/').pop();
      let data = [];
      if (table === 'events') {
        eventReads++;
        data = { id, name: 'Country selection test', status: 'published' };
      }
      if (table === 'event_forms') data = [{ form_type: 'registration', status: 'active', schema: {
        fields: [{ id: 'country', label: 'Pays', type: 'country' }, { id: 'note', label: 'Notes', type: 'text' }],
      } }];
      return route.fulfill({ json: data });
    });
    await page.goto(`http://127.0.0.1:3000/event/${id}/register`);
    const name = page.getByPlaceholder('John Doe');
    await name.fill('Example Attendee');
    const company = page.getByPlaceholder('Acme Corp');
    await company.fill('Example Company');
    const notes = page.locator('input[type="text"]:not([placeholder])');
    await notes.fill('Keep these answers');
    const readsBefore = eventReads;
    const documentsBefore = documents;
    const country = page.locator('[data-registration-dropdown="country:country"]');
    await country.locator('button').first().click();
    await country.locator('input').fill('Tunisia');
    await country.getByRole('button', { name: /Tunisia/ }).click();
    await expect(country.locator('button').first()).toContainText('Tunisia');
    await country.locator('button').first().click();
    await country.locator('input').fill('France');
    await country.locator('input').press('Enter');
    await country.getByRole('button', { name: /France/ }).click();
    await expect(name).toHaveValue('Example Attendee');
    await expect(company).toHaveValue('Example Company');
    await expect(notes).toHaveValue('Keep these answers');
    await expect(country.locator('button').first()).toContainText('France');
    expect(eventReads).toBe(readsBefore);
    expect(documents).toBe(documentsBefore);
    await context.close();
  });
}
