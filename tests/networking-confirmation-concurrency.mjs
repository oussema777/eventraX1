// Run after tests/networking-schedule.sql, against the disposable local cluster only.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const psql = 'C:/Program Files/PostgreSQL/18/bin/psql.exe';
const database = process.env.NETWORKING_TEST_DB || 'eventra_feedback_20261018';
function sql(statement) {
  return new Promise(resolve => {
    const process = spawn(psql, ['-h', '127.0.0.1', '-p', '55438', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1', '-At', '-c', statement], { windowsHide: true });
    let output = '';
    process.stdout.on('data', d => { output += d; }); process.stderr.on('data', d => { output += d; });
    process.on('error', error => { throw error; });
    process.on('close', code => resolve({ code, output }));
  });
}
for (const [other, expected] of [[102, 'B2B_PARTICIPANT_BUSY'], [103, 'B2B_VENUE_FULL']]) {
  const reset = await sql("update event_b2b_meetings set status='pending';"); assert.equal(reset.code, 0, reset.output);
  const results = await Promise.all([101, other].map(id => sql(`begin; update event_b2b_meetings set status='confirmed' where id=lpad('${id}',32,'0')::uuid; select pg_sleep(0.5); commit;`)));
  assert.equal(results.filter(r => r.code === 0).length, 1, JSON.stringify(results));
  assert.ok(results.find(r => r.code !== 0).output.includes(expected), JSON.stringify(results));
  const count = await sql("select count(*) from event_b2b_meetings where status='confirmed'");
  assert.equal(count.output.trim(), '1');
  console.log(`Concurrent confirmations: exactly one succeeded; the competing request was rejected with ${expected}.`);
}
