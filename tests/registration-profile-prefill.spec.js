import { test, expect } from '@playwright/test';
import fr from '../src/i18n/locales/fr';
import ar from '../src/i18n/locales/ar';

const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', email_confirmed_at: '2026-10-18T00:00:00Z', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-10-18T00:00:00Z' };

async function setup(page, email = viewer.email, locale = 'en') {
  const calls = [];
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  await page.route('**/auth/v1/**', route => route.fulfill({ json: viewer }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/rpc/get_my_registration_profile_seed')) {
      calls.push('seed');
      return route.fulfill({ json: { fullName: 'Amira Ben Salah', phone: '+216 22334455', companyName: 'Atlas Ventures', sector: 'Finance' } });
    }
    return route.fulfill({ json: { id: viewer.id, email: viewer.email, full_name: 'viewer', company: '', phone: '', industry: '' } });
  });
  await page.goto(`/tests/fixtures/registration-profile-setup.html?email=${encodeURIComponent(email)}`);
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const { error } = await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
    if (error) throw error;
  });
  return calls;
}

test('FB-10: verified registration details prefill editable account setup fields', async ({ page }) => {
  const calls = await setup(page);
  await expect(page.locator('#firstName')).toHaveValue('Amira');
  await expect(page.locator('#lastName')).toHaveValue('Ben Salah');
  await expect(page.locator('input[type="tel"]')).toHaveValue('22334455');
  await page.locator('#firstName').fill('Amina');
  await expect(page.locator('#firstName')).toHaveValue('Amina');
  await page.getByRole('button', { name: 'Select your country' }).click();
  await page.getByPlaceholder('Search country or calling code...').fill('Tunisia');
  await page.getByRole('button', { name: /Tunisia/ }).last().click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#company')).toHaveValue('Atlas Ventures');
  await expect(page.getByRole('button', { name: 'Financial Services & Banking' })).toBeVisible();
  expect(calls).toContain('seed');
});

test('FB-10: mismatched registration email cannot prefill another account', async ({ page }) => {
  const calls = await setup(page, 'someone-else@example.test');
  await expect(page.locator('#firstName')).toHaveValue('');
  expect(calls).toEqual([]);
});

for (const [locale, strings, country] of [['fr', fr, 'Tunisie'], ['ar', ar, 'تونس']]) {
  test(`${locale}: account setup localizes prefilled industry and country search`, async ({ page }) => {
    await setup(page, viewer.email, locale);
    await expect(page.locator('#firstName')).toHaveValue('Amira');
    await expect(page.getByText(strings.profileSetup.emailLabel, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: strings.profileSetup.placeholders.country, exact: true }).click();
    await page.getByPlaceholder(strings.profileSetup.placeholders.searchCountry).fill(country);
    await page.getByRole('button', { name: new RegExp(country) }).last().click();
    await page.getByRole('button', { name: strings.profileSetup.buttons.continue, exact: true }).click();
    await expect(page.getByRole('heading', { name: strings.profileSetup.step2.title })).toBeVisible();
    await expect(page.getByRole('button', { name: strings.profileSetup.industries[1], exact: true })).toBeVisible();
    await expect(page.locator('#company')).toHaveValue('Atlas Ventures');
    await expect(page.locator('body')).not.toContainText('Financial Services & Banking');
    await page.getByRole('button', { name: strings.profileSetup.placeholders.companySize, exact: true }).click();
    await expect(page.getByRole('button', { name: strings.profileSetup.companySizes[6], exact: true })).toBeVisible();
  });
}
