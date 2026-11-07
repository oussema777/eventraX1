// Read-only VPS inventory. Never prints environment values or sends mail.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const report = { node: process.version, directory: root, checks: {}, services: [] };
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'EVENTRA_APP_ORIGIN', 'EVENTRA_MAIL_FROM'];
report.checks.environmentFile = existsSync('.env');
report.checks.environmentLoader = typeof process.loadEnvFile === 'function';
if (report.checks.environmentFile && report.checks.environmentLoader) {
  try { process.loadEnvFile('.env'); } catch { report.checks.environmentFileReadable = false; }
}
report.checks.currentBuild = existsSync('build/index.html');
report.environment = Object.fromEntries(required.map(key => [key, process.env[key] ? 'present' : 'MISSING']));
report.checks.frontendDatabase = process.env.VITE_SUPABASE_URL === 'https://kvfoswfaifxqnjqhftwc.supabase.co';
report.checks.serverDatabase = process.env.SUPABASE_URL === 'https://kvfoswfaifxqnjqhftwc.supabase.co';
report.checks.applicationOrigin = process.env.EVENTRA_APP_ORIGIN === 'https://eventra.cloud';
report.checks.serverKeysNotExposed = !Object.keys(process.env).some(key => key.startsWith('VITE_') && /SERVICE_ROLE|RESEND|SECRET/.test(key));
report.deliveryEnabledInEnvironment = process.env.EVENTRA_REVIEW_DELIVERY_ENABLED === 'true';
const commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8', timeout: 5000 });
report.commit = commit.status === 0 ? commit.stdout.trim() : 'unavailable';
const pm2 = spawnSync('pm2', ['jlist'], { encoding: 'utf8', timeout: 10000, maxBuffer: 8 * 1024 * 1024 });
try {
  const processes = JSON.parse(pm2.stdout);
  report.services = processes.filter(p => p.pm2_env?.pm_cwd === root || /eventra|email|og-server|review/i.test(p.name || '')).map(p => ({
    name: p.name, status: p.pm2_env?.status, script: p.pm2_env?.pm_exec_path, directory: p.pm2_env?.pm_cwd,
    requiredEnvironmentPresent: required.filter(key => !!p.pm2_env?.[key]),
  }));
} catch { report.processManager = 'PM2 unavailable or inventory unreadable; identify the actual service manager.'; }
report.result = Object.values(report.checks).every(Boolean) && required.every(key => !!process.env[key]) ? 'Configuration present; live routing and delivery still require verification.' : 'STOP: complete the missing configuration before restarting services or replacing the site.';
console.log(JSON.stringify(report, null, 2));
if (report.result.startsWith('STOP')) process.exitCode = 2;
