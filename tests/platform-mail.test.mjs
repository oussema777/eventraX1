import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizePlatformMail,executePlatformMail,MailError} from '../server/platform-mail.mjs';
const actor='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002',stranger='10000000-0000-4000-8000-000000000003';
const entity='20000000-0000-4000-8000-000000000001',event='30000000-0000-4000-8000-000000000001';
function fixture(tables={},permissions=false,protectedRecipient=false){
 const db={auth:{admin:{getUserById:async id=>({data:{user:{id,email:`${id}@example.test`}},error:null})}},rpc:async()=>({data:protectedRecipient,error:null}),from:table=>{
   let records=tables[table]||[]; const q={select:()=>q,eq:(key,value)=>{records=records.filter(r=>r[key]===value);return q;},order:()=>q,limit:n=>{records=records.slice(0,n);return q;},maybeSingle:async()=>({data:records[0]||null,error:null}),then:resolve=>Promise.resolve({data:records,error:null}).then(resolve)};return q;
 }};
 return command=>authorizePlatformMail({command,actor:{id:actor},db,userDb:{rpc:async()=>({data:permissions,error:null})},origin:'https://app.eventra.cloud'});
}
test('arbitrary recipient and HTML contract is rejected',async()=>{
 await assert.rejects(fixture()({to:'victim@example.test',html:'forged',subject:'fake'}),e=>e.status===400);
 await assert.rejects(fixture()({kind:'welcome',entityId:actor,html:'forged'}),e=>e.status===400);
 await assert.rejects(executePlatformMail({authorization:'',command:{},env:{}}),e=>e.status===401);
});
test('welcome is restricted to own verified auth destination',async()=>{
 const run=fixture();await assert.rejects(run({kind:'welcome',entityId:other}),MailError);
 const {mail}=await run({kind:'welcome',entityId:actor});assert.deepEqual(mail.to,[`${actor}@example.test`]);
});
const meeting={id:entity,event_id:event,profile_a_id:actor,profile_b_id:other,attendee_a_id:actor,attendee_b_id:other,status:'pending',start_at:'2027-01-01T10:00:00Z'};
test('queued meeting commands never build a duplicate direct email',async()=>{
 const run=fixture({event_b2b_meetings:[{...meeting,notification_revision:1}]});
 assert.deepEqual(await run({kind:'meeting',entityId:entity,recipientId:other}),{queued:true});
 await assert.rejects(run({kind:'meeting',entityId:entity,recipientId:stranger}),MailError);
});
test('meeting notices require actual participant and authorized recipient',async()=>{
 const run=fixture({event_b2b_meetings:[meeting]});
 await assert.rejects(run({kind:'meeting',entityId:entity,recipientId:stranger}),MailError);
 assert.deepEqual((await run({kind:'meeting',entityId:entity,recipientId:other})).mail.to,[`${other}@example.test`]);
 await assert.rejects(fixture({event_b2b_meetings:[{...meeting,profile_a_id:stranger} ]})({kind:'meeting',entityId:entity,recipientId:other}),MailError);
});
test('protected meeting and pending investor designation cannot use generic transport',async()=>{
 for(const run of [fixture({event_b2b_meetings:[meeting],event_review_meeting_permits:[{meeting_id:entity}]}),fixture({event_b2b_meetings:[meeting]},false,true)])
   assert.deepEqual(await run({kind:'meeting',entityId:entity,recipientId:other}),{managed:true});
});

test('meeting delivery derives channel preferences from the saved event settings',async()=>{
 const run=fixture({event_b2b_meetings:[meeting],event_notification_settings:[{event_id:event,trigger_type:'meeting_booked',is_email_enabled:false,is_bell_enabled:true}]});
 const result=await run({kind:'meeting',entityId:entity,recipientId:other,channel:'both'});
 assert.equal(result.emailEnabled,false);assert.equal(result.bellEnabled,true);
 assert.equal(result.notification.recipient_id,other);
});
test('message email requires persisted sender and both thread memberships',async()=>{
 const records={message_messages:[{id:entity,thread_id:event,sender_id:actor}],message_thread_participants:[{thread_id:event,profile_id:actor},{thread_id:event,profile_id:other}]};
 const run=fixture(records);
 assert.match((await run({kind:'message',entityId:entity,recipientId:other})).mail.text,/messages/);
 await assert.rejects(run({kind:'message',entityId:entity,recipientId:stranger}),MailError);
 await assert.rejects(fixture({...records,message_messages:[{id:entity,thread_id:event,sender_id:other}]})({kind:'message',entityId:entity,recipientId:actor}),MailError);
});
test('broadcast derives registration recipient, requires event permission and escapes text',async()=>{
 const rows={event_attendees:[{id:entity,event_id:event,email:'registered@example.test'}]};
 const cmd={kind:'broadcast',entityId:entity,subject:'<script>bad</script>',message:'<img src=x onerror=alert(1)>'};
 await assert.rejects(fixture(rows)(cmd),MailError);
 const {mail}=await fixture(rows,true)(cmd);assert.deepEqual(mail.to,['registered@example.test']);assert.ok(!mail.html.includes('<script>'));assert.ok(!mail.html.includes('<img'));
});
test('moderation checks persisted state and platform admin',async()=>{
 const rows={profiles:[{id:actor,role:'admin'}],events:[{id:entity,owner_id:other,moderation_status:'approved'}]};
 assert.equal((await fixture(rows)({kind:'event_approved',entityId:entity})).mail.to[0],`${other}@example.test`);
 await assert.rejects(fixture(rows)({kind:'event_rejected',entityId:entity}),MailError);
 await assert.rejects(fixture({...rows,profiles:[{id:actor,role:'user'}]})({kind:'event_approved',entityId:entity}),MailError);
});
test('check-in alert requires saved partner arrival and event permission',async()=>{
 const rows={event_b2b_meetings:[{...meeting,status:'confirmed'}]};
 await assert.rejects(fixture(rows,true)({kind:'meeting_checkin',entityId:entity,recipientId:other}),MailError);
 const result=await fixture({...rows,event_checkins:[{id:stranger,event_id:event,meeting_id:entity,type:'b2b',attendee_id:actor}]},true)({kind:'meeting_checkin',entityId:entity,recipientId:other});
 assert.ok(result.mail);
});


test('branded shared mail preserves the deployed dedup identity',async()=>{
 const {mail,key}=await fixture()({kind:'welcome',entityId:actor});
 const title='Welcome to Eventra',body='Your account is ready. Open your profile to complete your details.',url=`https://app.eventra.cloud/profile/${actor}`;
 const legacy={to:[`${actor}@example.test`],subject:title,text:`${body}\n\n${url}`,html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#153047"><h1>Eventra</h1><h2>${title}</h2><p style="white-space:pre-line">${body}</p><p><a href="${url}">Open Eventra</a></p></div>`};
 assert.equal(key,createHash('sha256').update(JSON.stringify(['welcome',actor,actor,'',legacy])).digest('hex'));
 assert.match(mail.html,/bgcolor="#0b2641"/);assert.match(mail.html,/Complete my profile/);
});

test('ordinary meeting email restores authorized event, partner, time and venue details',async()=>{
 const run=fixture({event_b2b_meetings:[{...meeting,end_at:'2027-01-01T10:30:00Z',location:'Room <A>'}],events:[{id:event,name:'Example event',timezone:'Africa/Tunis'}],profiles:[{id:actor,full_name:'Example host'}]});
 const {mail}=await run({kind:'meeting',entityId:entity,recipientId:other});
 assert.match(mail.html,/Example event/);assert.match(mail.html,/Example host/);assert.match(mail.html,/11:00/);assert.match(mail.html,/11:30/);assert.match(mail.html,/Room &lt;A&gt;/);assert.match(mail.html,/View my meeting/);
});
