import { test, expect } from '@playwright/test';
import en from '../src/i18n/locales/en.ts';
import fr from '../src/i18n/locales/fr.ts';
import ar from '../src/i18n/locales/ar.ts';

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'owner@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const businessId = '22222222-2222-4222-8222-222222222222';
const base = { id: businessId, owner_profile_id: user.id, company_name: 'Test Business', company_size: '11-50', description: 'Company description', sectors: ['Technology'], email: user.email, is_public: false, verification_status: 'pending' };

async function setup(page, { locale = 'en', existing = false } = {}) {
  const state = { profile: existing ? { ...base } : null, offerings: [], docs: [], writes: [], failPublish: false, failLoad: false, failUpload: false, uploadCount: 0 };
  await page.addInitScript(locale => { localStorage.setItem('eventra_locale', locale); localStorage.setItem('profileSetupDismissed', 'true'); }, locale);
  await page.route('**/auth/v1/**', r => r.fulfill({ json: user }));
  await page.route('**/functions/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/storage/v1/**', route => {
    state.uploadCount++;
    return state.failUpload ? route.fulfill({ status: 500, json: { message: 'Upload failed' } }) : route.fulfill({ json: { Key: 'business-docs/test.pdf' } });
  });
  await page.route('**/rest/v1/**', async route => {
    const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').pop();
    const method = request.method();
    let data = [];
    if (table === 'profiles') data = { ...user, full_name: 'Test Owner', location: 'Tunis' };
    if (!['GET', 'HEAD'].includes(method)) {
      const raw = request.postDataJSON();
      const payload = Array.isArray(raw) ? raw[0] : raw;
      state.writes.push({ table, method, payload });
      if (table === 'business_profiles') {
        if (state.failPublish && payload.is_public) return route.fulfill({ status: 500, json: { message: 'Cannot save' } });
        state.profile = { ...state.profile, id: businessId, ...payload };
        data = state.profile;
      }
      if (table === 'business_offerings') {
        if (method === 'POST') { data = { id: 'offering1', ...payload }; state.offerings.push(data); }
        if (method === 'PATCH') { state.offerings[0] = { ...state.offerings[0], ...payload }; data = state.offerings[0]; }
        if (method === 'DELETE') state.offerings = [];
      }
      if (table === 'business_documents') { data = { id: 'doc1', ...payload }; state.docs.push(data); }
    } else {
      if (table === 'business_profiles') {
        if (state.failLoad) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
        data = state.profile && { ...state.profile, business_documents: state.docs, business_offerings: state.offerings };
      }
      if (table === 'business_offerings') data = state.offerings;
      if (table === 'business_documents') data = state.docs;
    }
    if (method === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-0/0' }, body: '' });
    return route.fulfill({ json: data });
  });
  await page.goto('/login');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const { error } = await supabase.auth.setSession({ access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now()/1000)+3600 })}.${encode('test')}`, refresh_token: 'test-refresh' });
    if (error) throw error;
  });
  await page.goto('/business-profile-wizard');
  return state;
}

async function essentials(page, locale = en) {
  const w = locale.businessProfileWizard;
  await page.getByLabel(w.essentials.companyName, { exact: true }).fill('Test Business');
  await page.getByLabel(w.essentials.companySize, { exact: true }).selectOption('11-50');
  await page.getByLabel(w.essentials.companyDescription, { exact: true }).fill('Company description');
}
async function next(page, locale = en) { await page.getByRole('button', { name: locale.businessProfileWizard.actions.next, exact: true }).click(); }
async function toOfferings(page, locale = en) {
  await essentials(page, locale); await next(page, locale);
  await page.getByPlaceholder(locale.businessProfileWizard.sectors.placeholder).fill('Technology');
  await page.getByPlaceholder(locale.businessProfileWizard.sectors.placeholder).press('Enter');
  await next(page, locale);
  await expect(page.getByRole('heading', { name: locale.businessProfileWizard.offerings.title })).toBeVisible();
}

for (const [language, locale] of Object.entries({ en, fr, ar })) {
  test(`${language}: create a business through all four steps, publish, and reopen`, async ({ page }) => {
    const state = await setup(page, { locale: language });
    const options = page.getByLabel(locale.businessProfileWizard.essentials.companySize, { exact: true }).locator('option');
    await expect(options).toHaveCount(6);
    expect(await options.allTextContents()).toContain(locale.businessFlows.sizes.s2);
    await toOfferings(page, locale); await next(page, locale);
    await page.getByLabel(locale.businessProfileWizard.identity.email, { exact: true }).fill(user.email);
    await page.getByRole('button', { name: locale.businessProfileWizard.actions.createProfile, exact: true }).click();
    await expect(page).toHaveURL(/\/business-management$/);
    expect(state.profile).toMatchObject({ company_name: 'Test Business', company_size: '11-50', is_public: true, email: user.email, sectors: ['Technology'] });
    expect(state.writes.filter(w => w.table === 'business_profiles' && w.method === 'POST')).toHaveLength(1);
    await page.goto('/business-profile-wizard');
    await expect(page.getByLabel(locale.businessProfileWizard.essentials.companyName, { exact: true })).toHaveValue('Test Business');
    expect(await page.locator('body').innerText()).not.toMatch(/business(?:ProfileWizard|Dashboard|Flows)\./);
  });
}

test('failed publication stays in the form; retry publishes once', async ({ page }) => {
  const state = await setup(page); await toOfferings(page); await next(page);
  await page.getByRole('button', { name: 'Create Profile', exact: true }).click();
  await expect(page.getByText(en.businessFlows.invalidEmail)).toBeVisible();
  await page.getByLabel(en.businessProfileWizard.identity.email, { exact: true }).fill(user.email);
  state.failPublish = true;
  await page.getByRole('button', { name: 'Create Profile', exact: true }).click();
  await expect(page.getByText(en.businessFlows.saveFailed)).toBeVisible();
  await expect(page).toHaveURL(/\/business-profile-wizard$/);
  expect(state.profile.is_public).not.toBe(true);
  state.failPublish = false;
  await page.getByRole('button', { name: 'Create Profile', exact: true }).click();
  await expect(page).toHaveURL(/\/business-management$/);
});

test('PDF upload succeeds and does not overwrite unsaved essentials', async ({ page }) => {
  const state = await setup(page, { existing: true });
  await page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true }).fill('Unsaved company rename');
  await page.locator('input[type=file]').first().setInputFiles({ name: 'legal.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  await expect(page.getByText('legal.pdf', { exact: true })).toBeVisible();
  expect(state.uploadCount).toBe(1);
  await expect(page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true })).toHaveValue('Unsaved company rename');
  await page.getByRole('button', { name: 'Save & Exit', exact: true }).click();
  await expect(page).toHaveURL(/\/business-management$/);
  expect(state.profile.company_name).toBe('Unsaved company rename');
});

test('failed document upload never claims success', async ({ page }) => {
  const state = await setup(page, { existing: true }); state.failUpload = true;
  await page.locator('input[type=file]').first().setInputFiles({ name: 'legal.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  await expect(page.getByText(/Upload failed/).first()).toBeVisible();
  await expect(page.getByText('File uploaded', { exact: true })).toHaveCount(0);
  expect(state.docs).toHaveLength(0);
});

test('offerings can be created, edited, validated, and deleted in the wizard', async ({ page }) => {
  const state = await setup(page); await toOfferings(page);
  await page.getByRole('button', { name: 'Add Offering', exact: true }).click();
  let modal = page.getByRole('dialog');
  await modal.getByRole('button', { name: 'Service', exact: true }).click();
  await modal.getByLabel('Name *', { exact: true }).fill('Consulting');
  await modal.getByLabel('Price', { exact: true }).fill('-1');
  await modal.getByRole('button', { name: 'Add Offering', exact: true }).click();
  await expect(page.getByText(en.businessFlows.invalidPrice)).toBeVisible();
  expect(state.offerings).toHaveLength(0);
  await modal.getByLabel('Price', { exact: true }).fill('125');
  await modal.getByRole('button', { name: 'Add Offering', exact: true }).click();
  await expect(modal).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit offering', exact: true }).click();
  modal = page.getByRole('dialog');
  await expect(modal.getByLabel('Name *', { exact: true })).toHaveValue('Consulting');
  await modal.getByLabel('Name *', { exact: true }).fill('Strategy consulting');
  await modal.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect(state.offerings).toHaveLength(1);
  expect(state.offerings[0]).toMatchObject({ name: 'Strategy consulting', type: 'service', price: 125 });
  await page.getByRole('button', { name: 'Delete offering', exact: true }).click();
  await expect(page.getByText(en.businessProfileWizard.offerings.emptyTitle)).toBeVisible();
  expect(state.offerings).toHaveLength(0);
});

test('load failures offer retry instead of an empty creation form', async ({ page }) => {
  const state = await setup(page, { existing: true }); state.failLoad = true;
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(en.businessFlows.loadFailed);
  state.failLoad = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true })).toHaveValue('Test Business');
});

test('French wizard fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { locale: 'fr' });
  await expect(page.getByLabel(fr.businessProfileWizard.essentials.companyName, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await toOfferings(page, fr);
  await page.getByRole('button', { name: fr.businessProfileWizard.actions.addOffering, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.tmp/business-mobile-offering.png', fullPage: true });
  await page.getByRole('dialog').getByRole('button', { name: fr.businessProfileWizard.actions.cancel, exact: true }).click();
  await next(page, fr);
  await expect(page.getByLabel(fr.businessProfileWizard.identity.email, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('dashboard edits preserve service type, sector, and inventory; public link opens the business', async ({ page }) => {
  const state = await setup(page, { existing: true });
  state.offerings = [{ id: 'offering1', business_id: businessId, type: 'service', name: 'Consulting', sector: 'Finance', tags: ['Investment', 'Advisory'], price: 125, currency: 'USD', quantity_total: 8, is_unlimited: false, images: [] }];
  await page.goto('/business-management');
  await page.getByRole('button', { name: 'Products & Services', exact: true }).click();
  await page.getByRole('button', { name: 'Edit offering', exact: true }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('combobox', { name: 'Type', exact: true })).toHaveValue('service');
  await modal.getByPlaceholder(en.productsManagement.form.namePlaceholder).fill('Investment consulting');
  await modal.getByRole('button', { name: 'Update Product', exact: true }).click();
  await expect(modal).toHaveCount(0);
  expect(state.offerings[0]).toMatchObject({ type: 'service', sector: 'Finance', name: 'Investment consulting', quantity_total: 8, tags: ['Investment', 'Advisory'] });
  await page.getByRole('button', { name: 'View Public Profile', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:3000/business/${businessId}`);
  await expect(page.getByRole('heading', { name: 'Test Business', exact: true })).toBeVisible();
});

test('Save & Exit preserves a partial draft for resuming', async ({ page }) => {
  const state = await setup(page);
  await page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true }).fill('Draft company');
  await page.getByRole('button', { name: 'Save & Exit', exact: true }).click();
  await expect(page).toHaveURL(/\/business-management$/);
  expect(state.profile.is_public).not.toBe(true);
  await page.goto('/business-profile-wizard');
  await expect(page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true })).toHaveValue('Draft company');
});

test('dashboard profile changes appear when reopening the wizard', async ({ page }) => {
  const state = await setup(page, { existing: true });
  await page.goto('/business-management');
  await page.getByRole('button', { name: 'Profile Details', exact: true }).click();
  await page.getByPlaceholder(en.businessProfileWizard.essentials.companyNamePlaceholder).fill('Updated from dashboard');
  await page.getByRole('button', { name: 'Save Profile Details', exact: true }).click();
  await expect.poll(() => state.profile.company_name).toBe('Updated from dashboard');
  await page.getByRole('button', { name: 'Edit in Wizard', exact: true }).click();
  await expect(page.getByLabel(en.businessProfileWizard.essentials.companyName, { exact: true })).toHaveValue('Updated from dashboard');
});

test('dashboard request failures do not pretend the saved business is missing', async ({ page }) => {
  const state = await setup(page, { existing: true }); state.failLoad = true;
  await page.goto('/business-management');
  await expect(page.getByRole('alert')).toContainText(en.businessFlows.loadFailed);
  await expect(page.getByText(en.businessDashboard.notFound)).toHaveCount(0);
  state.failLoad = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Test Business', exact: true })).toBeVisible();
});
