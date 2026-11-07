// Uses only a fresh disposable Docker container. Never reads project credentials.
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const name = `eventra-review-test-${process.pid}-${Date.now()}`;
const image = process.env.EVENTRA_TEST_POSTGRES_IMAGE || 'public.ecr.aws/supabase/postgres:17.6.1.165';
const run = (args, input) => {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${args.slice(0, 2).join(' ')}: ${result.error?.message || result.stderr || result.stdout}`);
  return result.stdout + result.stderr;
};
let started = false;
try {
  run(['run', '--detach', '--rm', '--name', name, '--env', 'POSTGRES_PASSWORD=local-fixture-only',
    '--env', 'PGDATA=/var/lib/postgresql/review-data', image, 'postgres', '-D', '/var/lib/postgresql/review-data']);
  started = true;
  // Wait for the final server, not the entrypoint's temporary initialization server.
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const logs = run(['logs', name]);
    if (logs.includes('PostgreSQL init process complete; ready for start up.')) {
      const probe = spawnSync('docker', ['exec', name, 'pg_isready', '-U', 'postgres'], { encoding: 'utf8' });
      if (probe.status === 0) { ready = true; break; }
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 500));
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not become ready');
  run(['exec', name, 'createdb', '-U', 'postgres', 'investor_review_test']);
  for (const path of ['tests/investor-review-foundation.fixture.sql',
    'supabase/migrations/20261106180000_investor_review_foundation.sql', 'tests/investor-review-foundation.sql',
    'tests/investor-review-workflow.fixture.sql', 'supabase/migrations/20261018120000_networking_schedule_rules.sql',
    'supabase/migrations/20261106190000_investor_assignment_and_booking.sql',
    'supabase/migrations/20261106200000_investor_delivery.sql',
    'supabase/migrations/20261106210000_investor_meeting_responses.sql',
    'supabase/migrations/20261106220000_platform_mail_boundary.sql',
    'supabase/migrations/20261106230000_review_scheduling.sql',
    'supabase/migrations/20261106233000_review_operations.sql',
    'tests/review-operations.fixture.sql', 'supabase/migrations/20261106234000_notification_boundary.sql',
    'supabase/migrations/20261106235000_review_lifecycle.sql', 'tests/investor-review-workflow.sql',
    'tests/investor-review-delivery.sql', 'tests/investor-review-responses.sql',
    'tests/platform-mail.sql','tests/review-operations.sql']) {
    const sql = readFileSync(resolve(root, path), 'utf8');
    const output = run(['exec', '-i', name, 'psql', '-X', '-U', 'postgres', '-d', 'investor_review_test', '-v', 'ON_ERROR_STOP=1'], sql);
    const assertions = output.split('\n').filter(line => line.includes('PASS:'));
    console.log(`${path}: OK${assertions.length ? ` (${assertions.length} assertions)` : ''}`);
    for (const assertion of assertions) console.log(assertion);
  }

  // Two independent connections, not two sequential calls inside one test transaction.
  const concurrentIssue = () => new Promise((resolveResult, reject) => {
    const process = spawn('docker', ['exec', '-i', name, 'psql', '-X', '-U', 'postgres', '-d', 'investor_review_test', '-v', 'ON_ERROR_STOP=1'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let errors = '';
    process.stdout.resume(); // Includes bearer tokens: deliberately discard, never log.
    process.stderr.on('data', chunk => { errors += chunk; });
    process.on('error', reject);
    const timeout = setTimeout(() => { process.kill(); reject(new Error('Concurrent issuance timed out')); }, 15000);
    process.on('close', code => { clearTimeout(timeout); resolveResult({ code, errors }); });
    process.stdin.end(`begin;
      set role authenticated;
      select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
      select issue_event_investor_invitation('20000000-0000-4000-8000-000000000001','race@example.test',now()+interval '7 days');
      select pg_sleep(0.2);
      commit;`);
  });
  const races = await Promise.all([concurrentIssue(), concurrentIssue()]);
  if (races.filter(result => result.code === 0).length !== 1 ||
      races.filter(result => result.errors.includes('INVESTOR_INVITATION_EXISTS')).length !== 1) {
    throw new Error('Concurrent issuance did not produce one success and one duplicate rejection');
  }
  run(['exec', '-i', name, 'psql', '-X', '-U', 'postgres', '-d', 'investor_review_test', '-v', 'ON_ERROR_STOP=1'],
    "select test_assert((select count(*) from event_investor_invitations where email='race@example.test' and status='pending')=1,'one pending invitation after concurrent issue');");
  console.log('Concurrency: PASS (one invitation; competing issuer receives duplicate rejection)');

  const connection = (actor, statement) => new Promise((resolveResult, reject) => {
    const child = spawn('docker', ['exec', '-i', name, 'psql', '-X', '-U', 'postgres', '-d', 'investor_review_test', '-v', 'ON_ERROR_STOP=1'], { stdio:['pipe','pipe','pipe'] });
    let errors=''; child.stdout.resume(); child.stderr.on('data',chunk=>{errors+=chunk;}); child.on('error',reject);
    const timer=setTimeout(()=>{child.kill();reject(new Error('Workflow race timed out'));},15000);
    child.on('close',code=>{clearTimeout(timer);resolveResult({code,errors});});
    child.stdin.end(`begin; set role authenticated; select set_config('request.jwt.claim.sub','${actor}',true); ${statement} select pg_sleep(0.15); commit;`);
  });
  const psql = sql => run(['exec','-i',name,'psql','-X','-U','postgres','-d','investor_review_test','-v','ON_ERROR_STOP=1'],sql);
  psql(`update event_investor_invitations set status='revoked',revoked_at=now() where email='person3@example.test' and status='pending';
    set role authenticated; select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
    select submit_investor_booking('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004',
      current_date+1+time '11:00',current_date+1+time '11:30','in-person','Concurrent approvals','80000000-0000-4000-8000-000000000001');`);
  const approval = "select decide_investor_booking((select id from event_booking_requests where submission_key='80000000-0000-4000-8000-000000000001'),1,'approve');";
  const reviews = await Promise.all([connection('10000000-0000-4000-8000-000000000002',approval),connection('10000000-0000-4000-8000-000000000002',approval)]);
  if (reviews.filter(r=>r.code===0).length!==1 || reviews.filter(r=>r.errors.includes('REVIEW_STALE_DECISION')).length!==1) throw new Error('Concurrent approval did not serialize correctly');
  psql("select test_assert((select count(*) from event_b2b_meetings where meta->>'message'='Concurrent approvals')=1,'one invitation after concurrent reviews');");
  console.log('Concurrency: PASS (two reviewers create exactly one invitation)');

  psql(`set role authenticated; select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
    select submit_investor_booking('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004',
      current_date+1+time '12:00',current_date+1+time '12:30','in-person','Approval withdrawal race','80000000-0000-4000-8000-000000000002');`);
  const request = "(select id from event_booking_requests where submission_key='80000000-0000-4000-8000-000000000002')";
  const withdrawal = await Promise.all([
    connection('10000000-0000-4000-8000-000000000002',`select decide_investor_booking(${request},1,'approve');`),
    connection('10000000-0000-4000-8000-000000000003',`select withdraw_investor_booking(${request},1);`),
  ]);
  if (withdrawal.filter(r=>r.code===0).length!==1 || withdrawal.filter(r=>r.errors.includes('REVIEW_STALE_DECISION')).length!==1) throw new Error('Approval versus withdrawal did not serialize correctly');
  psql(`select test_assert((select case when state='forwarded' then meeting_id is not null when state='withdrawn' then meeting_id is null else false end
    from event_booking_requests where submission_key='80000000-0000-4000-8000-000000000002'),'withdrawal and approval remain consistent');`);
  console.log('Concurrency: PASS (approval versus withdrawal has one consistent outcome)');

  psql(`select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
    create table public.fixture_assignment_snapshot as select preview_event_investor_assignment(
      '20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000005') as snapshot;
    grant select on public.fixture_assignment_snapshot to authenticated;`);
  const assignmentRace = await Promise.all([
    connection('10000000-0000-4000-8000-000000000001',`select set_event_investor('20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000005',true,'preserve',(select snapshot from fixture_assignment_snapshot));`),
    connection('10000000-0000-4000-8000-000000000003',`insert into event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,
      profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta) values('20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000003',
      current_date+1+time '14:00',current_date+1+time '14:30','pending','{"meeting_format":"in-person","message":"Assignment race"}');`),
  ]);
  if (assignmentRace.filter(r=>r.code===0).length!==1 ||
    assignmentRace.filter(r=>/REVIEW_REQUIRED|INVESTOR_PREVIEW_CHANGED/.test(r.errors)).length!==1) {
    throw new Error('Assignment versus legacy submission did not close the protection gap');
  }
  console.log('Concurrency: PASS (badge assignment versus legacy booking leaves no protection gap)');
  // Keep exactly one queued job to prove that two service workers cannot both
  // claim it. The synthetic database is discarded immediately after this test.
  psql(`delete from event_review_outbox;
    insert into event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    select event_id,id,revision,'forwarded',requester_id,'worker-race' from event_booking_requests
      where submission_key='80000000-0000-4000-8000-000000000001';`);
  const workers = await Promise.all([1,2].map(()=>connection('10000000-0000-4000-8000-000000000001',
    'reset role; set role service_role; select claim_review_delivery();')));
  if (workers.some(result=>result.code!==0)) throw new Error('Concurrent delivery claim failed');
  psql("select test_assert((select count(*)=1 and max(attempts)=1 and bool_and(state='sending') from event_review_outbox),'one lease across concurrent workers');");
  console.log('Concurrency: PASS (two delivery workers claim a single job once)');
  psql(`set role authenticated; select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
    select submit_investor_booking('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004',
      current_date+1+time '17:30',current_date+1+time '18:00','in-person','Response race','80000000-0000-4000-8000-000000000003');
    select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
    select decide_investor_booking((select id from event_booking_requests where submission_key='80000000-0000-4000-8000-000000000003'),1,'approve');`);
  // Investor cannot read private requests, so the ID is resolved by the test
  // administrator and then passed like the visible meeting ID in the UI.
  const responseMeeting=psql("select meeting_id from event_booking_requests where submission_key='80000000-0000-4000-8000-000000000003';").match(/[0-9a-f]{8}-[0-9a-f-]{27}/i)?.[0];
  if (!responseMeeting) throw new Error('Response race fixture missing');
  const responses=await Promise.all([
    connection('10000000-0000-4000-8000-000000000004',`select respond_protected_meeting('${responseMeeting}','pending','confirmed');`),
    connection('10000000-0000-4000-8000-000000000003',`select respond_protected_meeting('${responseMeeting}','pending','cancelled');`),
  ]);
  if(responses.filter(r=>r.code===0).length!==1 || responses.filter(r=>r.errors.includes('REVIEW_STALE_DECISION')).length!==1) throw new Error('Response race did not serialize');
  psql(`select test_assert((select count(*)=2 and count(distinct kind)=1 from event_review_outbox where meeting_id='${responseMeeting}'),'one response and two notices in race');`);
  console.log('Concurrency: PASS (confirmation versus cancellation produces one response)');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (started) {
    // Only the exact unique container created by this process; no volume/repo deletion.
    const cleanup = spawnSync('docker', ['stop', '--timeout', '2', name], { encoding: 'utf8', timeout: 15000 });
    if (cleanup.status !== 0) console.error(`Could not stop disposable test container ${name}: ${cleanup.stderr}`);
  }
}
