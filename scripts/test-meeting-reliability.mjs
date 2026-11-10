// Requires a disposable local PostgreSQL server on 127.0.0.1:55440.
// Creates a fresh database; never reads .env or connects to a remote database.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const database = `meeting_reliability_${Date.now()}`;
const bin = process.platform === 'win32' ? 'C:/Program Files/PostgreSQL/18/bin/' : '';
const executable = name => bin + name + (process.platform === 'win32' ? '.exe' : '');
const connection = ['-h','127.0.0.1','-p','55440','-U','postgres'];
function run(command,args,input) {
 const r=spawnSync(command,args,{input,encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
 if(r.status!==0)throw Error(r.error?.message || r.stderr || r.stdout);
 return r.stdout+r.stderr;
}
run(executable('createdb'),[...connection,database]);
const files=['tests/investor-review-foundation.fixture.sql','supabase/migrations/20261106180000_investor_review_foundation.sql',
 'tests/investor-review-workflow.fixture.sql','supabase/migrations/20261018120000_networking_schedule_rules.sql',
 'supabase/migrations/20261106190000_investor_assignment_and_booking.sql','supabase/migrations/20261106200000_investor_delivery.sql',
 'supabase/migrations/20261106210000_investor_meeting_responses.sql','supabase/migrations/20261106220000_platform_mail_boundary.sql',
 'supabase/migrations/20261106230000_review_scheduling.sql','supabase/migrations/20261106233000_review_operations.sql',
 'tests/review-operations.fixture.sql','supabase/migrations/20261106234000_notification_boundary.sql',
 'supabase/migrations/20261106235000_review_lifecycle.sql','supabase/migrations/20261107150000_branded_review_mail.sql'];
const sql = input => run(executable('psql'),[...connection,'-d',database,'-v','ON_ERROR_STOP=1'],input);
for (const file of files) sql(readFileSync(file,'utf8'));
sql('create table public.event_notification_settings(event_id uuid,trigger_type text,is_email_enabled boolean,is_bell_enabled boolean);');
sql(readFileSync('supabase/migrations/20261110180000_meeting_delivery_reliability.sql','utf8'));
const output=sql(readFileSync('tests/meeting-delivery.sql','utf8'));
console.log(output.split('\n').filter(line=>line.includes('PASS:')).join('\n'));
const race=spawnSync(process.execPath,['tests/meeting-delivery-concurrency.mjs'],{encoding:'utf8',env:{...process.env,MEETING_FIXTURE_DB:database},windowsHide:true});
if(race.status!==0)throw Error(race.stderr || race.stdout);console.log(race.stdout);
console.log(`Disposable database retained for inspection: ${database}`);
