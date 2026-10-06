import { test, expect } from '@playwright/test';

async function mount(page, { missingSchema = false } = {}) {
  const state = { failed: false, pending: null, writes: [], sessions: [
    { id: 'one', title: 'Workshop One', starts_at: '2026-11-25T10:00:00Z', ...(missingSchema ? {} : { sort_order: null }) },
    { id: 'two', title: 'Workshop Two', starts_at: '2026-11-25T10:00:00Z', ...(missingSchema ? {} : { sort_order: null }) },
    { id: 'later', title: 'Later session', starts_at: '2026-11-25T12:00:00Z', ...(missingSchema ? {} : { sort_order: null }) },
  ].map(s => ({ ...s, event_id: 'event-one', ends_at: '2026-11-25T13:00:00Z' })) };
  await page.route('**/auth/v1/**', r => r.fulfill({ json: {} }));
  await page.route('**/rest/v1/**', async route => {
    const table = new URL(route.request().url()).pathname.split('/').pop();
    if (table === 'reorder_event_sessions') {
      const body = route.request().postDataJSON(); state.writes.push(body);
      if (state.pending) await state.pending;
      if (state.failed) return route.fulfill({ status: 409, json: { message: 'Session order changed', code: '40001' } });
      state.sessions = body.p_session_ids.map((id, i) => ({ ...state.sessions.find(s => s.id === id), sort_order: i }));
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: table === 'event_sessions' ? [...state.sessions].reverse() : [] });
  });
  await page.goto('/tests/fixtures/session-order.html');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 });
  return state;
}

test('drag order persists through the hook and refetch without changing times', async ({ page }) => {
  const state = await mount(page);
  await expect(page.getByRole('button', { name: 'Move up: Later session' })).toBeDisabled();
  await page.getByRole('dialog').screenshot({ path: '.tmp/rahaf-session-order.png' });
  await page.locator('[data-session-id="two"] [draggable]').dragTo(page.locator('[data-session-id="one"]'));
  await expect(page.getByRole('listitem').locator('strong')).toHaveText(['Workshop Two', 'Workshop One', 'Later session']);
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(state.writes).toEqual([{ p_event_id: 'event-one', p_session_ids: ['two', 'one', 'later'], p_expected_order: { one: null, two: null, later: null } }]);
  await page.getByRole('button', { name: 'Open order' }).click();
  await expect(page.getByRole('listitem').locator('strong')).toHaveText(['Workshop Two', 'Workshop One', 'Later session']);
  expect(state.sessions[0].starts_at).toBe('2026-11-25T10:00:00Z');
});

test('mobile arrow ordering handles failed saves and blocks duplicate submission', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await mount(page);
  await page.getByRole('dialog').screenshot({ path: '.tmp/rahaf-session-order-mobile.png' });
  await page.getByRole('button', { name: 'Move down: Workshop One' }).click();
  state.failed = true;
  let release; state.pending = new Promise(resolve => { release = resolve; });
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saving order…' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Move up: Workshop One' })).toBeDisabled();
  release();
  await expect(page.getByRole('alert')).toContainText('Another organizer changed the order.');
  expect(state.sessions.map(s => s.id)).toEqual(['one', 'two', 'later']);
  state.failed = false; state.pending = null;
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(state.writes).toHaveLength(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('missing database support is explained before saving and preview can be reset', async ({ page }) => {
  const state = await mount(page, { missingSchema: true });
  await expect(page.getByRole('alert')).toContainText('Saving the order is not available');
  await page.getByRole('button', { name: 'Move down: Workshop One' }).click();
  await expect(page.getByRole('button', { name: 'Save order', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Undo changes' }).click();
  await expect(page.getByRole('listitem').locator('strong')).toHaveText(['Workshop One', 'Workshop Two', 'Later session']);
  expect(state.writes).toEqual([]);
});

test('conflict reload discards stale draft and can save against fresh order', async ({ page }) => {
  const state = await mount(page);
  await page.getByRole('button', { name: 'Move down: Workshop One' }).click();
  state.failed = true;
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Another organizer changed the order.');
  state.sessions = state.sessions.map((s, i) => ({ ...s, sort_order: i }));
  state.failed = false;
  await page.getByRole('button', { name: 'Reload current order' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('listitem').locator('strong')).toHaveText(['Workshop One', 'Workshop Two', 'Later session']);
  await page.getByRole('button', { name: 'Move down: Workshop One' }).click();
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(state.writes.at(-1).p_expected_order).toEqual({ one: 0, two: 1, later: 2 });
});
