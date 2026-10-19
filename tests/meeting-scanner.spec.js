import { test, expect } from '@playwright/test';
import { parseScanCode, meetingLink } from '../src/utils/meetingQr';
import { renderMeetingEmail } from '../src/lib/meetingEmail';
import QRCode from 'qrcode';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const meetingId = '44444444-4444-4444-8444-444444444444';
const a = { id: '33333333-3333-4333-8333-333333333331', profile_id: '11111111-1111-4111-8111-111111111111', event_id: eventId, name: 'Youssef Ben Ali', email: 'youssef@example.test', company: 'Atlas Ventures', checked_in: false, status: 'registered', meta: { confirmation_code: 'EVT-ABCD-1234' } };
const b = { ...a, id: '33333333-3333-4333-8333-333333333332', profile_id: '22222222-2222-4222-8222-222222222222', name: 'Amira Mansour', email: 'amira@example.test', meta: { confirmation_code: 'EVT-EFGH-5678' } };
const personalCode = meetingLink('http://127.0.0.1:3000', meetingId, eventId, a.profile_id);
const otherCode = meetingLink('http://127.0.0.1:3000', meetingId, eventId, b.profile_id);

async function scanner(page, options = {}) {
  const state = { attendees: [{ ...a }, { ...b }], meeting: { id: meetingId, event_id: eventId, profile_a_id: a.profile_id, profile_b_id: b.profile_id, attendee_a_id: null, attendee_b_id: null, start_at: '2027-11-20T13:00:00Z', end_at: '2027-11-20T13:30:00Z', location: 'Table 04', status: 'confirmed' }, checkins: [], attempts: [], failLookup: false, failSave: false, failAttendeeUpdate: false, delaySave: false, ...options };
  await page.addInitScript(() => localStorage.setItem('eventra_locale', 'en'));
  await page.route('**/api/send-email', route => route.fulfill({ json: { id: 'test-only' } }));
  await page.route('**/rest/v1/**', async route => {
    const req = route.request(), url = new URL(req.url()), table = url.pathname.split('/').pop(), method = req.method();
    const filter = list => list.filter(row => [...url.searchParams].every(([key, value]) => {
      if (['select', 'order', 'limit', 'offset'].includes(key)) return true;
      const cell = key === 'meta->>confirmation_code' ? row.meta?.confirmation_code : row[key];
      if (value.startsWith('eq.')) return String(cell) === value.slice(3);
      if (value.startsWith('ilike.')) return String(cell).toLowerCase() === value.slice(6).toLowerCase();
      if (value.startsWith('in.')) return value.slice(4, -1).split(',').includes(String(cell));
      return true;
    }));
    if (method === 'HEAD') return route.fulfill({ headers: { 'content-range': '0-0/0' }, body: '' });
    let data = [];
    if (table === 'events') data = { id: eventId, name: 'Investment Forum', attendee_settings: { day_of: { scanner_settings: { duplicatePolicy: 'block', soundOnSuccess: false } } } };
    if (table === 'profiles') data = [a, b].map(person => ({ id: person.profile_id, full_name: person.name }));
    if (table === 'event_sessions') data = filter([{ event_id: eventId, id: '55555555-5555-4555-8555-555555555555', title: 'Investment workshop', starts_at: '2027-11-20T13:00:00Z', ends_at: '2027-11-20T14:00:00Z' }]);
    if (table === 'event_attendees') {
      if (state.failLookup && method === 'GET') return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
      if (['ticket_code', 'confirmation_code', 'qr_token'].some(key => url.searchParams.has(key))) return route.fulfill({ status: 400, json: { code: '42703', message: 'missing optional column' } });
      if (method === 'PATCH') {
        if (state.failAttendeeUpdate) return route.fulfill({ status: 403, json: { message: 'Denied' } });
        for (const person of filter(state.attendees)) Object.assign(person, req.postDataJSON());
      }
      data = filter(state.attendees);
    }
    if (table === 'event_b2b_meetings') {
      data = filter([state.meeting]);
      if (method === 'PATCH' && data.length) Object.assign(state.meeting, req.postDataJSON());
    }
    if (table === 'event_checkins') {
      if (method === 'POST') {
        state.attempts.push(req.postDataJSON()[0]);
        if (state.delaySave) await new Promise(resolve => setTimeout(resolve, 250));
        if (state.failSave) return route.fulfill({ status: 403, json: { message: 'Denied' } });
        const row = req.postDataJSON()[0];
        if (state.checkins.some(item => item.id === row.id)) return route.fulfill({ status: 409, json: { code: '23505' } });
        state.checkins.push({ ...row, created_at: new Date().toISOString() });
        data = [{ id: row.id }];
      } else data = filter(state.checkins);
    }
    const total = Array.isArray(data) ? data.length : 1;
    if (Array.isArray(data) && url.searchParams.get('limit')) data = data.slice(0, Number(url.searchParams.get('limit')));
    if (req.headers().accept?.includes('application/vnd.pgrst.object+json') && Array.isArray(data)) data = data[0] || null;
    return route.fulfill({ json: data, headers: { 'content-range': `0-${Math.max(0, total - 1)}/${total}` } });
  });
  await page.goto('/tests/fixtures/meeting-review.html?mode=scanner');
  return state;
}
async function openScanner(page, kind = 'B2B') {
  const buttons = page.getByRole('button', { name: /Launch|Open|Start/i });
  // The three scanner cards have one launch action each, in event/session/B2B order.
  await buttons.nth(kind === 'B2B' ? 2 : kind === 'session' ? 1 : 0).click();
  const input = page.getByRole('textbox');
  if (!(await input.isVisible())) await page.getByRole('button', { name: /Manual Entry/i }).click();
  return input;
}
async function scan(page, input, code) { await input.fill(code); await input.press('Enter'); }

test('QR formats round-trip and arbitrary URLs never become attendee IDs', () => {
  expect(parseScanCode(personalCode)).toEqual({ eventId, meetingId, profileId: a.profile_id });
  expect(parseScanCode(`https://eventra.cloud/my-networking?meetingId=${meetingId}`)).toEqual({ meetingId });
  expect(parseScanCode(JSON.stringify({ meetingId, event: 'Forum', organizer: 'Person', time: '14:00' }))).toEqual({ meetingId });
  expect(parseScanCode(`https://eventra.cloud/checkin/${a.id}`)).toEqual({ attendeeId: a.id });
  expect(parseScanCode(`https://eventra.cloud/profile/${a.profile_id}`)).toEqual({ profileId: a.profile_id });
  expect(() => parseScanCode(`https://example.test/random/${a.id}`)).toThrow('invalidCode');
  expect(() => parseScanCode('{broken')).toThrow('invalidCode');
});

test('personal B2B passes resolve profile-only meetings; only both participants complete the meeting', async ({ page }, info) => {
  const state = await scanner(page);
  let input = await openScanner(page);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: info.outputPath('scanner-ready-desktop.png') });
  await scan(page, input, personalCode);
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  await page.screenshot({ path: info.outputPath('scanner-success-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(state.checkins).toHaveLength(1); expect(state.checkins[0].attendee_id).toBe(a.id); expect(state.meeting.status).toBe('confirmed');
  await page.getByRole('button', { name: /Next Scan/i }).click();
  await page.getByRole('button', { name: /Manual Entry/i }).click(); input = page.getByRole('textbox');
  await scan(page, input, otherCode);
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.checkins).toHaveLength(2); expect(state.meeting.status).toBe('completed');
  await page.screenshot({ path: info.outputPath('scanner-mobile.png') });
});

test('legacy JSON and email codes ask which participant arrived instead of guessing', async ({ page }) => {
  const state = await scanner(page); const input = await openScanner(page);
  await scan(page, input, JSON.stringify({ meetingId, event: 'Investment Forum', organizer: 'Youssef' }));
  await expect(page.getByRole('heading', { name: 'Who has arrived?' })).toBeVisible(); expect(state.checkins).toHaveLength(0);
  await page.getByRole('button', { name: /Amira Mansour/ }).click();
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.checkins[0].attendee_id).toBe(b.id); expect(state.meeting.status).toBe('confirmed');
  await page.getByRole('button', { name: /Next Scan/i }).click();
  await page.getByRole('button', { name: /Manual Entry/i }).click();
  await scan(page, input, `https://eventra.cloud/my-networking?meetingId=${meetingId}`);
  await expect(page.getByRole('heading', { name: 'Who has arrived?' })).toBeVisible();
  expect(state.checkins).toHaveLength(1);
});

test('rapid submissions save once and repeat scans obey the duplicate policy', async ({ page }) => {
  const state = await scanner(page, { delaySave: true }); const input = await openScanner(page);
  await input.fill(personalCode);
  await input.evaluate(el => { for (let i = 0; i < 3; i++) el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.attempts).toHaveLength(1);
  await page.getByRole('button', { name: /Next Scan/i }).click();
  await page.getByRole('button', { name: /Manual Entry/i }).click();
  await scan(page, input, personalCode);
  await expect(page.getByRole('heading', { name: /Already|Duplicate/i })).toBeVisible();
  expect(state.checkins).toHaveLength(1);
});

for (const kind of ['event', 'session']) test(`${kind} scanner accepts registration codes and rejects meeting passes`, async ({ page }) => {
  const state = await scanner(page); const input = await openScanner(page, kind);
  await scan(page, input, personalCode);
  await expect(page.getByText(/B2B scanner/i).filter({ hasNot: page.locator('button') }).first()).toBeVisible();
  expect(state.checkins).toHaveLength(0);
  await scan(page, input, 'EVT-ABCD-1234');
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.checkins[0]).toMatchObject({ type: kind, attendee_id: a.id, event_id: eventId });
  if (kind === 'session') expect(state.checkins[0].session_id).toBe('55555555-5555-4555-8555-555555555555');
});

test('a person not assigned to a B2B meeting cannot check in', async ({ page }) => {
  const state = await scanner(page); const input = await openScanner(page);
  state.meeting.profile_a_id = '99999999-9999-4999-8999-999999999999';
  await scan(page, input, personalCode);
  await expect(page.getByText(/not a participant/i).first()).toBeVisible();
  expect(state.checkins).toHaveLength(0);
});

test('camera detection records one arrival and pauses on the result', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
      canvas.getContext('2d').fillRect(0, 0, 320, 240);
      return canvas.captureStream(5);
    }});
    window.BarcodeDetector = class { async detect() { return window.testScanCode ? [{ rawValue: window.testScanCode }] : []; } };
  });
  const state = await scanner(page);
  await page.getByRole('button', { name: /Launch|Open|Start/i }).nth(2).click();
  await expect.poll(() => page.locator('video').evaluate(el => el.readyState)).toBeGreaterThanOrEqual(2);
  await page.evaluate(code => window.testScanCode = code, personalCode);
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  await page.evaluate(code => window.testScanCode = code, otherCode);
  // More than two detection intervals: the result must hold until staff continue.
  await page.waitForTimeout(1100);
  expect(state.checkins).toHaveLength(1);
  await page.getByRole('button', { name: /Next Scan/i }).click();
  await expect.poll(() => state.checkins.length).toBe(2);
});

test('cancelled meetings, wrong events and unavailable reads never record attendance', async ({ page }) => {
  const state = await scanner(page); const input = await openScanner(page);
  await scan(page, input, meetingLink('https://eventra.cloud', meetingId, '99999999-9999-4999-8999-999999999999', a.profile_id));
  await expect(page.getByText('This pass belongs to a different event. Open that event’s scanner.').first()).toBeVisible();
  state.meeting.status = 'cancelled'; await scan(page, input, personalCode);
  await expect(page.getByText('This meeting is not confirmed. Pending or cancelled meetings cannot be checked in.').first()).toBeVisible();
  state.meeting.status = 'confirmed'; state.failLookup = true; await scan(page, input, personalCode);
  await expect(page.getByText(/We could not verify this code/).first()).toBeVisible();
  expect(state.checkins).toHaveLength(0); expect(state.attendees[0].checked_in).toBe(false);
});

test('failed writes never show success; an interrupted save retries with the same ID', async ({ page }) => {
  const state = await scanner(page, { failSave: true }); const input = await openScanner(page);
  await scan(page, input, personalCode); await expect(page.getByText(/could not be fully saved/).first()).toBeVisible();
  expect(state.checkins).toHaveLength(0); expect(state.attendees[0].checked_in).toBe(false);
  state.failSave = false; state.failAttendeeUpdate = true;
  await scan(page, input, personalCode); await expect.poll(() => state.checkins.length).toBe(1);
  await expect(page.getByText(/could not be fully saved/).first()).toBeVisible();
  state.failAttendeeUpdate = false; await scan(page, input, personalCode);
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.checkins).toHaveLength(1); expect(new Set(state.attempts.map(row => row.id)).size).toBe(1);
});

test('a refresh recovers a partially saved arrival without duplicating its log', async ({ page }) => {
  const state = await scanner(page, { failAttendeeUpdate: true });
  await scan(page, await openScanner(page), personalCode);
  await expect(page.getByText(/could not be fully saved/).first()).toBeVisible();
  expect(state.checkins).toHaveLength(1);
  expect(state.attendees[0].checked_in).toBe(false);
  const savedId = state.checkins[0].id;
  await page.reload();
  state.failAttendeeUpdate = false;
  await scan(page, await openScanner(page), personalCode);
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.attendees[0].checked_in).toBe(true);
  expect(state.checkins).toHaveLength(1);
  expect(state.attempts.map(row => row.id)).toEqual([savedId, savedId]);
});

test('manual email check-in recognizes uppercase addresses from older imports', async ({ page }) => {
  const state = await scanner(page);
  state.attendees[0].email = 'YOUSSEF@Example.Test';
  await scan(page, await openScanner(page, 'event'), 'youssef@example.test');
  await expect(page.getByRole('heading', { name: /Check.*Successful/i })).toBeVisible();
  expect(state.checkins[0].attendee_id).toBe(a.id);
});

test.describe('event time stays consistent for overseas visitors', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });
  test('scanner and personal pass use the Tunis schedule with legacy timezone settings', async ({ page }) => {
    await scanner(page);
    await openScanner(page);
    await page.locator('.dayof-scanner__meeting select').selectOption(meetingId);
    await expect(page.locator('.dayof-scanner__meeting-meta')).toContainText('02:00 PM');
    await page.goto('/tests/fixtures/meeting-review.html?mode=pass&timeZone=pt');
    await expect(page.getByRole('dialog')).toContainText('Africa/Tunis');
    await expect(page.getByRole('dialog')).toContainText('02:00 PM');
  });
});

test('meeting email designs distinguish invitation, confirmation and cancellation and escape content', () => {
  const params = { recipientName: '<img onerror=alert(1)>', partnerName: 'Amira & Co', eventName: 'Forum', meetingDate: '20 November', meetingTime: '14:00', networkingUrl: personalCode, qrCodeUrl: 'https://example.test/qr.png' };
  const pending = renderMeetingEmail({ ...params, status: 'pending' });
  expect(pending).toContain('Awaiting confirmation'); expect(pending).not.toContain('src="https://example.test/qr.png"');
  const confirmed = renderMeetingEmail({ ...params, status: 'confirmed', locale: 'fr' });
  expect(confirmed).toContain('Votre rendez-vous est confirmé.'); expect(confirmed).toContain('src="https://example.test/qr.png"'); expect(confirmed).not.toContain('<img onerror');
  const cancelled = renderMeetingEmail({ ...params, status: 'cancelled', videoUrl: 'javascript:alert(1)' });
  expect(cancelled).toContain('Your meeting was cancelled.'); expect(cancelled).not.toContain('src="https://example.test/qr.png"'); expect(cancelled).not.toContain('javascript:');
});

test('meeting pass is locally generated, decodable, responsive, and keyboard accessible', async ({ page }, info) => {
  await page.route('**/api.qrserver.com/**', route => route.abort());
  await page.goto('/tests/fixtures/meeting-review.html?mode=pass');
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  const qr = dialog.locator('img'); await expect(qr).toHaveAttribute('src', /^data:image\/png/);
  const decoded = await qr.evaluate(async img => {
    const { default: jsQR } = await import('/node_modules/.vite/deps/jsqr.js');
    const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(data.data, data.width, data.height)?.data;
  });
  expect(parseScanCode(decoded)).toEqual({ eventId, meetingId, profileId: a.profile_id });
  await page.screenshot({ path: info.outputPath('meeting-pass-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: info.outputPath('meeting-pass-mobile.png') });
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
});

test('meeting email previews fit desktop and mobile in all supported languages', async ({ page }, info) => {
  const qr = await QRCode.toDataURL(personalCode, { margin: 4 });
  for (const locale of ['en', 'fr', 'ar']) for (const status of ['pending', 'confirmed', 'cancelled']) {
    // Supply the local image to inspect email layout without contacting a QR service.
    const html = renderMeetingEmail({ status, locale, recipientName: a.name, partnerName: b.name, eventName: 'L’INVESTISSEMENT · Tunis 2027', meetingDate: '20 November 2027', meetingTime: '14:00 – 14:30', timeZone: 'Africa/Tunis', location: 'Networking Lounge · Table 04', meetingId, networkingUrl: personalCode, qrCodeUrl: 'https://example.test/qr.png' }).replace('https://example.test/qr.png', qr);
    await page.setViewportSize({ width: 1000, height: 900 }); await page.setContent(html);
    if (locale === 'en') await page.screenshot({ path: info.outputPath(`email-${status}-desktop.png`), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`email-${locale}-${status}-mobile.png`), fullPage: true });
  }
});
