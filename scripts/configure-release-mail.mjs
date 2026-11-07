// Configure the existing VPS .env; never send mail or restart a service.
import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function configureReleaseMail(root, suppliedKey) {
  const filename = resolve(root, '.env');
  const original = readFileSync(filename, 'utf8');
  const env = parseEnv(original);
  const project = 'kvfoswfaifxqnjqhftwc';
  const url = `https://${project}.supabase.co`;
  if (env.VITE_SUPABASE_URL !== url || (env.SUPABASE_URL && env.SUPABASE_URL !== url)) throw new Error('Database target mismatch; nothing changed.');
  const key = suppliedKey?.trim() || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('A server-only service-role key is required; nothing changed.');
  let claims;
  try { claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()); } catch { throw new Error('Use the project legacy service_role JWT key; nothing changed.'); }
  if (claims.role !== 'service_role' || claims.ref !== project) throw new Error('Key role or project mismatch; nothing changed.');
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== key) throw new Error('An existing service key differs; review before replacing it.');
  if (!env.RESEND_API_KEY || !env.VITE_SUPABASE_ANON_KEY) throw new Error('Existing provider or frontend anon key is missing; nothing changed.');
  const settings = {
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: key,
    EVENTRA_APP_ORIGIN: env.EVENTRA_APP_ORIGIN || 'https://eventra.cloud',
    EVENTRA_MAIL_FROM: env.EVENTRA_MAIL_FROM || 'Eventra <contact@eventra.cloud>',
    EVENTRA_REVIEW_DELIVERY_ENABLED: env.EVENTRA_REVIEW_DELIVERY_ENABLED || 'false',
  };
  if (settings.EVENTRA_APP_ORIGIN !== 'https://eventra.cloud' || settings.EVENTRA_REVIEW_DELIVERY_ENABLED !== 'false') throw new Error('Unexpected origin or already-enabled worker; review before changing configuration.');
  const additions = Object.entries(settings).filter(([name]) => !env[name]);
  if (!additions.length) return { changed: false };
  // Drop empty assignments being replaced, preserving every other setting/comment.
  const replacing = new Set(additions.map(([name]) => name));
  const retained = original.split(/\r?\n/).filter(line => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    return !match || !replacing.has(match[1]);
  }).join('\n');
  const directory = resolve(root, '.tmp');
  mkdirSync(directory, { recursive: true });
  const suffix = `${Date.now()}-${process.pid}`;
  const backup = resolve(directory, `env-before-mail-${suffix}`);
  writeFileSync(backup, original, { mode: 0o600, flag: 'wx' });
  const next = resolve(root, `.env.mail-${suffix}`);
  writeFileSync(next, `${retained.trimEnd()}\n\n# Server-only release mail configuration\n${additions.map(([name, value]) => `${name}=${JSON.stringify(value)}`).join('\n')}\n`, { mode: 0o600, flag: 'wx' });
  renameSync(next, filename);
  return { changed: true, backup };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const result = configureReleaseMail(root, process.env.EVENTRA_SETUP_SERVICE_KEY);
    console.log(result.changed ? `Server settings saved. Private backup: ${result.backup}` : 'Server settings already present.');
    console.log('No service restarted, no worker enabled, no emails sent. Run node scripts/release-preflight.mjs next.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
