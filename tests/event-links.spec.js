import { test, expect } from '@playwright/test';

const id = '769d7854-9bae-49e6-9db9-c88c0586a402';
async function mockEvent(page) {
  const requests = [];
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    requests.push({ table, params: Object.fromEntries(url.searchParams) });
    let data = [];
    if (table === 'event_url_aliases') data = ['eq.forum-2026', 'eq.previous-name'].includes(url.searchParams.get('slug')) ? { event_id: id } : null;
    if (table === 'events') data = { id, seo_slug: 'forum-2026', name: 'Forum 2026', status: 'published', branding_settings: { design_studio: { activeBlocks: [{ id: 'about', type: 'about', settings: { title: 'Forum 2026', description: 'Event details' } }] } } };
    return route.fulfill({ json: data });
  });
  return requests;
}

for (const identifier of [id, 'forum-2026', 'previous-name']) {
  test(`public landing resolves ${identifier} and uses UUID for related data`, async ({ page }) => {
    const requests = await mockEvent(page);
    const path = identifier === id ? `/event/${id}/landing` : `/event/${identifier}`;
    await page.goto(`${path}?utm_source=invite#agenda`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://eventra.cloud/event/forum-2026');
    expect(page.url()).toContain(`${path}?utm_source=invite#agenda`);
    expect(requests.find(r => r.table === 'events').params.id).toBe(`eq.${id}`);
    const related = requests.filter(r => r.params.event_id);
    expect(related.length).toBeGreaterThan(0);
    for (const request of related) expect(request.params.event_id).toBe(`eq.${id}`);
    expect(requests.filter(r => r.table === 'event_url_aliases').length).toBe(identifier === id ? 0 : 1);
  });
}

test('branded registration and agenda read the same UUID event', async ({ page }) => {
  const requests = await mockEvent(page);
  await page.goto('/event/forum-2026/register?ticket=test');
  await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  await page.goto('/event/forum-2026/agenda');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://eventra.cloud/event/forum-2026/agenda');
  for (const request of requests.filter(r => r.params.event_id)) expect(request.params.event_id).toBe(`eq.${id}`);
});

test('unknown names stop before event queries; UUID dashboards still require authentication', async ({ page }) => {
  const requests = await mockEvent(page);
  await page.goto('/event/unknown-event');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  expect(requests.some(r => r.table === 'events')).toBe(false);
  await page.goto(`/event/${id}`);
  await expect(page).toHaveURL(/\/$/);
});

test('organizer explicitly saves a branded link without republishing the event', async ({ page }) => {
  const writes = [];
  let available = false;
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/event_slug_available')) return route.fulfill({ json: available });
    if (route.request().method() === 'PATCH') {
      const payload = route.request().postDataJSON();
      writes.push(payload);
      return route.fulfill({ json: { id, name: 'Forum 2026', status: 'published', ...payload } });
    }
    return route.fulfill({ json: [] });
  });
  await page.goto('/');
  await page.evaluate(async eventId => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js');
    const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js');
    const { default: EventUrlSettings } = await import('/src/components/wizard/EventUrlSettings.tsx');
    const { supabase } = await import('/src/lib/supabase.ts');
    const container = document.createElement('div');
    document.body.appendChild(container);
    function Harness() {
      const [draft, setDraft] = React.useState({ id: eventId, name: 'Forum 2026', status: 'published' });
      return React.createElement(EventUrlSettings, { draft, onSave: async updates => {
        const { data } = await supabase.from('events').update(updates).eq('id', eventId).select().single();
        if (data) setDraft(data);
        return data;
      } });
    }
    ReactDOM.createRoot(container).render(React.createElement(Harness));
  }, id);
  const field = page.getByLabel('Branded event link');
  await field.fill('forum-2026');
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Save link', exact: true }).click();
  await expect(page.getByText('That link is already reserved. Choose another name.')).toBeVisible();
  expect(writes).toHaveLength(0);
  available = true;
  await page.getByRole('button', { name: 'Save link', exact: true }).click();
  await expect(page.getByText('Event link saved. Your previous links still work.')).toBeVisible();
  expect(writes).toEqual([{ seo_slug: 'forum-2026' }]);
  await expect(page.getByRole('link', { name: /127\.0\.0\.1:3000\/event\/forum-2026/ })).toHaveAttribute('href', '/event/forum-2026');
});
