// Synthetic database only; requires local PostgreSQL on 127.0.0.1:55440.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const bin = process.platform === 'win32' ? 'C:/Program Files/PostgreSQL/18/bin/' : '';
const exe = name => bin + name + (process.platform === 'win32' ? '.exe' : '');
const connection = ['-h', '127.0.0.1', '-p', '55440', '-U', 'postgres'];
const database = `investor_role_access_${Date.now()}`;
function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout + result.stderr;
}
run(exe('createdb'), [...connection, database]);
for (const file of [
  'tests/investor-review-foundation.fixture.sql',
  'supabase/migrations/20261106180000_investor_review_foundation.sql',
  'tests/investor-review-foundation.sql',
  'supabase/migrations/20261119180000_investor_management_by_role.sql',
  'tests/investor-role-access.sql',
]) {
  const output = run(exe('psql'), [...connection, '-X', '-d', database, '-v', 'ON_ERROR_STOP=1'], readFileSync(file, 'utf8'));
  const assertions = output.split('\n').filter(line => line.includes('PASS:'));
  console.log(`${file}: OK (${assertions.length} assertions)`);
  for (const assertion of assertions) console.log(assertion);
}
console.log(`Disposable database retained for inspection: ${database}`);
