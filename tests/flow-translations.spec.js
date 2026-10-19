import { test, expect } from '@playwright/test';
import fr from '../src/i18n/locales/fr';
import ar from '../src/i18n/locales/ar';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
for (const [locale, strings, country] of [['fr', fr, 'Tunisie'], ['ar', ar, 'تونس']]) {
  test(`${locale}: registration localizes catalogs and preserves selected values`, async ({ page }) => {
    await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
    await page.route('**/rest/v1/**', route => {
      const table = new URL(route.request().url()).pathname.split('/').pop();
      return route.fulfill({ json: table === 'events' ? { id: eventId, name: 'Test Forum', status: 'published' } : [] });
    });
    await page.goto(`/event/${eventId}/register`);
    const sector = page.locator('[data-registration-dropdown="system-sector"]');
    await sector.getByRole('button', { name: strings.registration.systemFields.sectorPlaceholder }).click();
    await sector.getByRole('button', { name: strings.platformLabels.Technology, exact: true }).click();
    await expect(sector.getByRole('button').first()).toHaveText(strings.platformLabels.Technology);
    const interests = page.locator('[data-registration-dropdown="system-interests"]');
    await interests.getByRole('button').first().click();
    await interests.getByRole('button', { name: strings.platformLabels.Investment, exact: true }).click();
    await expect(interests.locator('button').filter({ hasText: strings.platformLabels.Investment }).locator('svg')).toBeVisible();
    await interests.getByRole('button').first().click();
    const phone = page.locator('[data-registration-dropdown="system-phone"]');
    await phone.getByRole('button').first().click();
    await phone.getByRole('searchbox').fill(country);
    await phone.getByRole('button', { name: new RegExp(country) }).click();
    await expect(phone.getByRole('button').first()).toContainText('+216');
    await expect(sector.getByRole('button').first()).toHaveText(strings.platformLabels.Technology);
    await expect(page.getByText(strings.platformLabels.Investment, { exact: true })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Select your sector');
  });
}
