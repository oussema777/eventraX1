import { test, expect } from '@playwright/test';
import en from '../src/i18n/locales/en.ts';
import { marketplaceCard, filterMarketplace } from '../src/utils/marketplace.ts';
const copy = en.marketplace;
const records = Array.from({ length: 105 }, (_, i) => ({
  id: `business-${i}`, company_name: `Business ${i}`, description: `Description ${i}`,
  created_at: '2026-10-01T00:00:00Z', verification_status: 'verified', is_public: true,
  sectors: i === 104 ? [] : [i % 2 ? 'agriculture/ food & bioeconomy' : 'technology & innovation'],
  company_size: i === 104 ? '500+' : i % 2 ? '11-50' : '1-10',
  address: i === 104 ? 'Béja, Tunisia' : i % 2 ? 'Sfax, Tunisia' : 'Paris, France',
  branding: i === 104 ? { rating: 4.5, review_count: 2, sustainable: true } : null,
  business_offerings: i === 104 ? [{ name: 'Olive oil (premium), 100%', description: 'Organic produce', sector: 'Specialty foods', tags: ['cold-pressed'], images: [] }] : [],
}));
async function setup(page, rows = records) {
  const state = { fail: false, requests: [] };
  await page.addInitScript(() => localStorage.setItem('eventra_locale', 'en'));
  await page.route('**/auth/v1/**', route => route.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    if (!url.pathname.endsWith('/business_profiles')) return route.fulfill({ json: [] });
    expect(url.searchParams.get('verification_status')).toBe('eq.verified');
    expect(url.searchParams.get('is_public')).toBe('eq.true');
    state.requests.push(url);
    if (state.fail) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || 100);
    return route.fulfill({ json: rows.slice(offset, offset + limit) });
  });
  await page.goto('/b2b-marketplace');
  return state;
}
const cards = page => page.getByTestId('marketplace-business');
const found = (page, count) => expect(page.getByRole('heading', { name: `${count} ${count === 1 ? 'Business' : 'Businesses'} Found`, exact: true })).toBeVisible();

test('database sector and size values match before pagination, with OR within sectors and AND across groups', async ({ page }) => {
  const state = await setup(page);
  await found(page, 105);
  expect(state.requests.length).toBeGreaterThanOrEqual(2);
  await expect(cards(page)).toHaveCount(12);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Specialty foods', exact: true }).check();
  await found(page, 1);
  await expect(cards(page)).toContainText(['Business 104']);
  await page.getByRole('checkbox', { name: 'agriculture/ food & bioeconomy', exact: true }).check();
  await found(page, 53);
  await page.getByRole('checkbox', { name: '11-50', exact: true }).check();
  await found(page, 52);
  await page.getByRole('checkbox', { name: '500+', exact: true }).check();
  await found(page, 53);
  await page.getByRole('button', { name: copy.filters.clearAll, exact: true }).click();
  await found(page, 105);
});

test('location, offering tags, punctuation, sustainability and rating search the complete dataset', async ({ page }) => {
  await setup(page);
  await found(page, 105);
  const search = page.getByRole('textbox', { name: copy.hero.searchPlaceholder });
  await search.fill('Olive oil (premium), 100%');
  await found(page, 1);
  await search.fill('cold-pressed');
  await found(page, 1);
  await search.fill('');
  await page.getByRole('textbox', { name: copy.filters.location, exact: true }).fill('beja');
  await found(page, 1);
  await page.getByRole('checkbox', { name: copy.filters.sustainable }).check();
  await page.getByRole('checkbox', { name: '4 & Up' }).check();
  await found(page, 1);
  await page.getByRole('textbox', { name: copy.filters.location, exact: true }).fill('Paris');
  await found(page, 0);
  await expect(page.getByRole('heading', { name: copy.empty.title })).toBeVisible();
  await page.getByRole('button', { name: copy.empty.action }).click();
  await found(page, 105);
});

test('category shortcuts toggle the same sector checkboxes and sector search finds stored values', async ({ page }) => {
  await setup(page);
  await found(page, 105);
  const shortcut = page.getByRole('button', { name: 'Specialty foods', exact: true });
  await shortcut.click();
  await expect(shortcut).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('checkbox', { name: 'Specialty foods' })).toBeChecked();
  await found(page, 1);
  await shortcut.click();
  await found(page, 105);
  await page.getByRole('textbox', { name: copy.filters.searchSectors }).fill('innovation');
  await expect(page.getByRole('checkbox', { name: 'technology & innovation' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Specialty foods' })).toHaveCount(0);
});

test('unavailable metadata does not expose misleading filters and load failure can be retried', async ({ page }) => {
  const state = await setup(page, records.slice(0, 3));
  await found(page, 3);
  await expect(page.getByRole('checkbox', { name: copy.filters.verified })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: copy.filters.sustainable })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: '4 & Up' })).toHaveCount(0);
  state.fail = true;
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: copy.empty.title })).toHaveCount(0);
  state.fail = false;
  await page.getByRole('button', { name: copy.results.retry, exact: true }).click();
  await found(page, 3);
});

test('normalization preserves unknown sizes and does not invent sustainable status', () => {
  const business = marketplaceCard({ id: 'custom', sectors: ['Énergie', 'énergie'], company_size: '1000+', branding: { sustainable: 'false' } });
  expect(business.tags).toHaveLength(1);
  expect(business.sustainable).toBe(false);
  expect(filterMarketplace([business], { search: 'energie', location: '', sectors: ['ENERGIE'], sizes: ['1000+'], sustainable: false, rating: 0 })).toHaveLength(1);
});
