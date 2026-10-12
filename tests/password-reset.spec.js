import { test, expect } from '@playwright/test';
import en from '../src/i18n/locales/en.ts';
import fr from '../src/i18n/locales/fr.ts';
import ar from '../src/i18n/locales/ar.ts';

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'reset@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = () => `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.${encode('test')}`;
async function setup(page, locale = 'en') {
  await page.addInitScript(locale => localStorage.setItem('eventra_locale', locale), locale);
  await page.route('**/auth/v1/**', route => route.fulfill({ json: user }));
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.route('**/functions/v1/**', route => route.fulfill({ json: {} }));
}
async function readable(locator) {
  const contrast = await locator.evaluate(element => {
    const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = color => rgb(color).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    let ancestor = element;
    while (ancestor.parentElement && getComputedStyle(ancestor).backgroundColor === 'rgba(0, 0, 0, 0)') ancestor = ancestor.parentElement;
    const foreground = luminance(getComputedStyle(element).color);
    const background = luminance(getComputedStyle(ancestor).backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
}

for (const [locale, messages] of Object.entries({ en, fr, ar })) {
  test(`${locale}: reset form, validation, failure, and success remain readable`, async ({ page }) => {
    await setup(page, locale);
    await page.setViewportSize({ width: 390, height: 844 });
    let reject = true;
    let updates = 0;
    await page.route('**/auth/v1/user', route => {
      if (route.request().method() !== 'PUT') return route.fulfill({ json: user });
      updates++;
      return route.fulfill(reject ? { status: 422, json: { message: 'Please choose a different password.' } } : { json: user });
    });
    await page.goto(`/reset-password#access_token=${token()}&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=recovery`);
    const copy = messages.auth.resetPassword || en.auth.resetPassword;
    const password = page.getByLabel(copy.newPassword, { exact: true });
    const confirmation = page.getByLabel(copy.confirmPassword, { exact: true });
    await expect(password).toBeVisible();
    for (const selector of ['h1', 'label', 'input', 'button', 'a']) await readable(page.locator('.password-reset-card').locator(selector).first());
    await password.fill('New-test-password-123');
    await confirmation.fill('Not-matching-password');
    await page.getByRole('button', { name: copy.submit }).click();
    await expect(page.getByRole('alert')).toHaveText(copy.noMatch);
    await readable(page.getByRole('alert'));
    expect(updates).toBe(0);
    await confirmation.fill('New-test-password-123');
    await page.getByRole('button', { name: copy.submit }).click();
    await expect(page.getByRole('alert')).toContainText('Please choose');
    reject = false;
    await page.getByRole('button', { name: copy.submit }).click();
    await expect(page.getByRole('status')).toHaveText(copy.complete);
    await readable(page.getByRole('status'));
    expect(updates).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.tmp/password-reset-${locale}-success.png` });
  });
}

for (const suffix of ['', '#error=access_denied&error_code=otp_expired&error_description=This+link+expired', '?error=access_denied&error_description=This+link+expired']) {
  test(`missing or expired reset link stays readable: ${suffix || 'missing'}`, async ({ page }) => {
    await setup(page);
    await page.goto(`/reset-password${suffix}`);
    await expect(page.getByRole('status')).toHaveText(en.auth.resetPassword.invalidLink);
    await readable(page.locator('h1'));
    await readable(page.getByRole('status'));
    await expect(page.locator('input')).toHaveCount(0);
    if (suffix) await readable(page.getByRole('alert'));
    await page.getByRole('link', { name: en.auth.forgotPassword.backToLogin }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
}

test('forgot password sends and resends the correct reset destination with readable cards', async ({ page }) => {
  await setup(page);
  let requests = 0;
  await page.route('**/auth/v1/recover**', route => {
    expect(new URL(route.request().url()).searchParams.get('redirect_to')).toBe('http://127.0.0.1:3000/reset-password');
    requests++;
    return route.fulfill({ json: {} });
  });
  await page.goto('/login');
  await page.getByRole('button', { name: en.auth.login.forgotPassword }).click();
  await readable(page.getByRole('heading', { name: en.auth.forgotPassword.title }));
  await page.getByLabel(en.auth.forgotPassword.emailLabel).fill(user.email);
  await page.getByRole('button', { name: en.auth.forgotPassword.submit, exact: true }).click();
  await expect(page.getByRole('heading', { name: en.auth.passwordResetSent.title })).toBeVisible();
  await readable(page.getByRole('heading', { name: en.auth.passwordResetSent.title }));
  await page.getByRole('button', { name: en.auth.passwordResetSent.resend, exact: true }).click();
  await expect.poll(() => requests).toBe(2);
});
