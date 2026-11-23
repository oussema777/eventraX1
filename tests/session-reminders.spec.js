import { test, expect } from '@playwright/test';

test('French workshop reminder previews eligible mailboxes and retries only unresolved recipients on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('eventra_locale', 'fr'));
  const viewer = { id: '11111111-1111-4111-8111-111111111111', email: 'organizer@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} };
  const session = { id: 'one', title: 'Atelier énergie', day: 1, starts_at: '2026-11-25T14:00:00Z', ends_at: '2026-11-25T15:00:00Z', location: 'Salle A', status: 'confirmed', type: 'workshop' };
  const people = ['one@example.test', 'ONE@example.test', 'two@example.test', ''].map((email, i) => ({
    session_id: session.id, attendee_id: String(i), event_attendees: { id: String(i), name: 'Person ' + i, email, status: 'registered' }
  }));
  const commands = [];
  await page.route('**/auth/v1/**', route => route.fulfill({ json: viewer }));
  await page.route('**/rest/v1/**', route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    let data = [];
    if (table === 'event_sessions') data = [session, { ...session, id: 'two', title: 'Atelier B' }];
    if (table === 'events') data = { id: 'event-one', start_date: session.starts_at, timezone: 'Africa/Tunis' };
    if (table === 'event_attendee_sessions') data = url.searchParams.get('session_id') === 'eq.two' ? [] : people;
    return route.fulfill({ json: data });
  });
  await page.route('**/api/send-email', route => {
    const cmd = route.request().postDataJSON();
    commands.push(cmd);
    if (cmd.recipientId === '2' && commands.length === 2) return route.fulfill({ status: 503, json: { error: 'Temporary failure' } });
    return route.fulfill({ json: { success: true } });
  });
  await page.goto('/tests/fixtures/organizer-agenda.html');
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '');
    const { error } = await supabase.auth.setSession({
      access_token: [encode({ alg: 'HS256', typ: 'JWT' }), encode({ exp: Math.floor(Date.now() / 1000) + 3600 }), encode('test')].join('.'),
      refresh_token: 'test-refresh'
    });
    if (error) throw error;
  });
  const open = title => page.locator('[data-agenda-card]').filter({ hasText: title }).getByRole('button', { name: 'Rappel par e-mail' }).click();
  const dialog = page.getByRole('dialog');
  const notice = page.getByRole('alertdialog');
  const confirm = async count => {
    await expect(notice).toContainText('Nombre de destinataires : ' + count + '.');
    await notice.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  };
  await page.getByRole('button', { name: 'Rappeler les inscrits aux ateliers' }).click();
  await expect(dialog.getByText('Tous les ateliers de cet événement')).toBeVisible();
  await expect(dialog.getByLabel('Objet')).toHaveValue('Rappel · Vos ateliers');
  await expect(dialog.getByText('Destinataires (2)')).toBeVisible();
  await dialog.getByRole('button', { name: 'Envoyer le rappel' }).click();
  await expect(notice).toContainText('Tous les ateliers de cet \u00e9v\u00e9nement');
  expect(commands).toHaveLength(0);
  await notice.getByRole('button', { name: 'Revenir au rappel' }).click();
  await expect(notice).toHaveCount(0);
  expect(commands).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Envoyer le rappel' }).click();
  await confirm(2);
  await expect(dialog.getByRole('status')).toContainText('1 sur 2');
  expect(commands.every(c => c.kind === 'workshops_reminder' && c.entityId === 'event-one')).toBe(true);
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  commands.length = 0;
  await open('Atelier B');
  await expect(dialog.getByText('Aucun inscrit avec une adresse e-mail valide.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Envoyer le rappel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await open('Atelier énergie');
  await expect(dialog).toBeInViewport({ ratio: 1 });
  await dialog.getByText('Destinataires (2)').click();
  await expect(dialog.getByText('two@example.test')).toBeVisible();
  await expect(dialog.getByText('Inscriptions sans adresse e-mail valide : 1')).toBeVisible();
  await expect(dialog.getByLabel('Objet')).toHaveValue('Rappel · Atelier énergie');
  await expect(dialog.getByLabel('Message')).toHaveValue(/15:00.*Africa\/Tunis[\s\S]*Salle A/);
  await dialog.getByLabel('Message').fill('Rendez-vous en salle A.');
  expect(commands).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Envoyer le rappel' }).click();
  await confirm(2);
  await expect(dialog.getByRole('status')).toContainText('Envois non confirmés : 1');
  await dialog.getByRole('button', { name: 'Réessayer les envois restants' }).click();
  expect(commands).toHaveLength(2);
  await confirm(1);
  await expect(dialog.getByRole('status')).toContainText('2 sur 2');
  expect(commands.map(c => c.recipientId)).toEqual(['0', '2', '2']);
  expect(commands.every(c => c.entityId === 'one' && c.message === 'Rendez-vous en salle A.')).toBe(true);
});
