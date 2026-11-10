// Disposable local fixture only. Never loads .env or production credentials.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const database=process.env.MEETING_FIXTURE_DB || 'meeting_reliability_test';
if (!/^meeting_reliability_(test|[0-9]+)$/.test(database)) throw Error('Disposable fixture database required');
const args=['-h','127.0.0.1','-p','55440','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-At'];
const sql=statement=>new Promise((resolve,reject)=>{
 const p=spawn(process.platform==='win32'?'C:/Program Files/PostgreSQL/18/bin/psql.exe':'psql',args,{windowsHide:true});let output='';
 p.stdout.on('data',d=>output+=d);p.stderr.on('data',d=>output+=d);p.on('error',reject);p.on('close',code=>resolve({code,output}));p.stdin.end(statement);
});
const ok=async statement=>{const r=await sql(statement);assert.equal(r.code,0,r.output);return r.output;};
const event='20000000-0000-4000-8000-000000000001';
const user=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const attendee=n=>`30000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const meeting=n=>`60000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
async function seed(pairs){
 await ok(`delete from meeting_delivery_jobs; delete from notifications where source_key like 'meeting:%'; delete from event_b2b_meetings;
 insert into event_attendees(id,event_id,profile_id,status,email,meta) values('${attendee(8)}','${event}','${user(7)}','approved','person7@example.test','{"b2bOptIn":true}') on conflict do nothing;
 update event_b2b_settings set venue_config=jsonb_set(venue_config,'{tableCount}','1') where event_id='${event}';
 ${pairs.map(([a,b],i)=>`insert into event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,status,start_at,end_at,meta) values('${meeting(i+1)}','${event}','${attendee(a)}','${attendee(b===7?8:b)}','${user(a)}','${user(b)}','${user(a)}','pending',current_date+1+time '11:00',current_date+1+time '11:30','{}');`).join('\n')}`);
}
for(const [pairs,error] of [[[[3,4],[5,7]],'B2B_VENUE_FULL'],[[[3,4],[3,5]],'B2B_PARTICIPANT_BUSY']]){
 await seed(pairs);
 const result=await Promise.all(pairs.map(([,b],i)=>sql(`begin; set role authenticated; select set_config('request.jwt.claim.sub','${user(b)}',true); update event_b2b_meetings set status='confirmed' where id='${meeting(i+1)}' and status='pending'; select pg_sleep(0.15); commit;`)));
 assert.equal(result.filter(r=>r.code===0).length,1,JSON.stringify(result));assert.ok(result.some(r=>r.output.includes(error)));
 assert.equal((await ok("select count(*) from meeting_delivery_jobs where kind='confirmed'")).trim(),'2');
 console.log(`PASS: simultaneous confirmation protects ${error}; only winning booking queues confirmations`);
}
await seed([[3,4]]);
const leaseResults=await Promise.all([1,2].map(()=>ok('select claim_meeting_delivery()')));
const leases=leaseResults.map(r=>JSON.parse(r.trim()));assert.notEqual(leases[0].id,leases[1].id);
assert.equal((await ok('select claim_meeting_delivery() is null')).trim(),'t');
console.log('PASS: concurrent workers claim distinct jobs; active leases cannot be reclaimed');
await ok("update meeting_delivery_jobs set lease_until=now()-interval '1 second'");
const reclaimed=JSON.parse((await ok('select claim_meeting_delivery()')).trim());
const original=leases.find(l=>l.id===reclaimed.id);assert.ok(original);assert.notEqual(original.token,reclaimed.token);
console.log('PASS: interrupted worker lease recovers with same job and a new token');
await ok("delete from meeting_delivery_jobs; delete from notifications where source_key like 'meeting:%'; delete from event_b2b_meetings;");
