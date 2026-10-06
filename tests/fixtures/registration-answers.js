export async function fillRequiredRegistration(page) {
  await page.getByPlaceholder('John Doe').fill('Test Attendee');
  await page.getByPlaceholder('john@company.com').fill('guest@example.test');
  await page.locator('input[type=tel]').first().fill('22123456');
  await page.getByPlaceholder('Acme Corp').fill('Test Company');
  await page.locator('textarea').first().fill('We build clean energy products.');
  await page.locator('input[type=url]').fill('https://example.test');
  const interests = page.locator('[data-registration-dropdown="system-interests"]');
  await interests.getByRole('button').first().click();
  await interests.getByRole('button', { name: 'Investment', exact: true }).click();
  await interests.getByRole('button').first().click();
  const sector = page.locator('[data-registration-dropdown="system-sector"]');
  await sector.getByRole('button').first().click();
  await sector.getByRole('button', { name: 'Technology', exact: true }).click();
}
