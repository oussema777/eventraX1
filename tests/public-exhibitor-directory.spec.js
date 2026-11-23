import { test, expect } from '@playwright/test';

const eventId = '20000000-0000-4000-8000-000000000001';
const slug = 'forum-expo';
const path = `/event/${slug}/exhibitors`;
const rows = [
  { id: 'one', company_name: 'Café Atlas', logo_url: 'https://logo.example.test/missing.png', sector: 'Énergie', booth_number: 'B12', website_url: 'atlas.example.test' },
  { id: 'two', company_name: 'Demo Studio', website_url: 'javascript:void(0)' },
];

async function setup(page, getRows, locale = 'fr') {
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://logo.example.test/**', route => route.fulfill({ status: 404, body: '' }));
  await page.route('**/rest/v1/**', route => {
    const table = new URL(route.request().url()).pathname.split('/').pop();
    if (route.request().method() === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-1/2' }, body: '' });
    if (table === 'list_public_event_exhibitors') return route.fulfill(getRows(route));
    if (table === 'event_url_aliases') return route.fulfill({ json: { event_id: eventId } });
    if (table === 'events') return route.fulfill({ json: { id: eventId, name: 'Forum', seo_slug: slug } });
    return route.fulfill({ json: [] });
  });
}

test('signed-out visitors can find a booth and save a company across reloads', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await setup(page, () => ({ json: rows }));
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  const cards = page.locator('.expo-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.first().getByText('CA', { exact: true })).toBeVisible();
  await expect(cards.last().getByRole('link')).toHaveCount(0);
  await expect(cards.first().getByRole('link')).toHaveAttribute('href', 'https://atlas.example.test/');
  const search = page.getByRole('textbox', { name: /Rechercher/ });
  for (const term of ['cafe', 'energie', 'b12']) {
    await search.fill(term);
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Café Atlas');
  }
  await cards.first().getByRole('button', { name: /Ajouter/ }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Ma sélection/ }).click();
  await expect(cards).toHaveCount(1);
  await cards.first().getByRole('button', { name: /Retirer/ }).click();
  await expect(page.getByText(/avec le marque-page/)).toBeVisible();
  expect(await page.locator('.expo-directory').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test('a public directory read failure can be retried and is distinct from an empty directory', async ({ page }) => {
  let failed = true;
  await setup(page, () => failed ? { status: 403, json: { message: 'unavailable' } } : { json: [] }, 'en');
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('alert').filter({ hasText: 'could not be loaded' })).toBeVisible({ timeout: 20000 });
  failed = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('The exhibitor directory will appear here.')).toBeVisible();
});

test('search covers entries past the first page and Arabic controls work', async ({ page }) => {
  const many = Array.from({ length: 205 }, (_, index) => ({ id: String(index), company_name: 'Studio ' + index }));
  await setup(page, route => {
    const params = new URL(route.request().url()).searchParams;
    const offset = Number(params.get('offset') || 0);
    return { json: many.slice(offset, offset + 200) };
  }, 'ar');
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.expo-directory')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.expo-card')).toHaveCount(24);
  await page.getByRole('button', { name: 'عرض المزيد' }).click();
  await expect(page.locator('.expo-card')).toHaveCount(48);
  await page.locator('.expo-search input').fill('Studio 204');
  await expect(page.getByRole('heading', { name: 'Studio 204' })).toBeVisible();
});
