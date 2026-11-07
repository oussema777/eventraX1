import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

const source=['onlineExperience.ts','registrationReceipt.ts'].map(file=>stripTypeScriptTypes(readFileSync(new URL(`../supabase/functions/_shared/${file}`,import.meta.url),'utf8').replace(/^import .*?;\r?\n/gm,''))).join('\n').replace(/^export /gm,'');
const {sendRegistrationReceipt,notifyRegistrationOwner,registrationReceiptHtml}=vm.runInNewContext(source+'\n({sendRegistrationReceipt,notifyRegistrationOwner,registrationReceiptHtml})',{URL,URLSearchParams,TextEncoder,crypto,AbortSignal});
function setup({access=false,disabled=false,existing=null,identity='saved@example.test',prepare=true,ack=true}={}) {
 const calls=[];let sent;
 const attendee={id:'saved-attendee',name:'Saved <name>',email:'saved@example.test',status:'registered',profile_id:access?'profile':null,meta:{b2bOptIn:access}};
 const db={auth:{admin:{getUserById:async()=>({data:{user:{email:identity}}}),generateLink:async()=>{calls.push('link');return {data:{properties:{action_link:'https://example.test/private-login'}}};}}},from:table=>{
  const data=table==='event_attendees'?attendee:table==='event_notification_settings'?{is_email_enabled:!disabled}:table==='platform_mail_deliveries'?existing:table==='event_attendee_sessions'?[{session_id:'saved-session'}]:table==='event_sessions'?[{id:'saved-session',title:'Saved <session>'}]:null;
  const q={select:()=>q,eq:()=>q,in:()=>q,single:async()=>({data}),maybeSingle:async()=>({data}),then:resolve=>Promise.resolve({data}).then(resolve)};return q;
 },rpc:async(name,args)=>{calls.push(name);return {data:name==='claim_registration_preparation'?prepare:name==='finish_platform_mail'?ack:{id:'job',token:'lease',mail:args.p_mail}};}};
 return {calls,get sent(){return sent;},run:()=>sendRegistrationReceipt(db,'saved-attendee',{id:'event',name:'Saved event'},key=>key==='EVENTRA_APP_ORIGIN'?'https://example.test':'test-key',async(url,options)=>{sent=JSON.parse(options.body);return new Response('{"id":"provider"}',{status:200});})};
}
test('ordinary receipt uses saved registration and saved session titles, with escaped content',async()=>{
 const app=setup();assert.equal(await app.run(),'sent');assert.deepEqual(app.sent.to,['saved@example.test']);
 assert.match(app.sent.html,/Saved &lt;session&gt;/);assert.match(app.sent.html,/Saved &lt;name&gt;/);assert.equal(app.calls.includes('link'),false);
});
test('optional receipt settings are respected while B2B access remains operational',async()=>{
 const ordinary=setup({disabled:true});assert.equal(await ordinary.run(),'skipped');assert.equal(ordinary.sent,undefined);
 const b2b=setup({disabled:true,access:true});assert.equal(await b2b.run(),'sent');assert.match(b2b.sent.html,/private-login/);
});
test('wrong linked account never receives access and frozen retries cannot target an old address',async()=>{
 for(const options of [{access:true,identity:'wrong@example.test'},{existing:{state:'failed',mail:{to:['old@example.test']}}}]){
  const app=setup(options);assert.equal(await app.run(),'failed');assert.equal(app.sent,undefined);assert.equal(app.calls.includes('link'),false);
 }
});
test('preparation lease prevents competing token generation and failed acknowledgement is not reported sent',async()=>{
 const competing=setup({access:true,prepare:false});assert.equal(await competing.run(),'failed');assert.equal(competing.calls.includes('link'),false);
 const failed=setup({ack:false});assert.equal(await failed.run(),'failed');assert.ok(failed.sent);
});
test('successful receipt retry does not generate a token or call provider again',async()=>{
 const app=setup({access:true,existing:{state:'sent'}});assert.equal(await app.run(),'sent');assert.equal(app.calls.length,0);assert.equal(app.sent,undefined);
});
test('optional owner notification transport failure cannot fail a saved registration',async()=>{
 await assert.doesNotReject(notifyRegistrationOwner({from:()=>{throw new Error('offline');}},{id:'event',owner_id:'owner'},'attendee'));
});


test('branded registration receipt restores ordered dates, times, venues and the check-in pass',()=>{
 const html=registrationReceiptHtml({event:{id:'event',name:'Conference',timezone:'Africa/Tunis'},attendee:{id:'saved-attendee',name:'Example',meta:{confirmation_code:'ABC123'}},origin:'https://eventra.cloud',sessions:[
  {id:'later',title:'Later session',starts_at:'2026-11-27T09:00:00Z',ends_at:'2026-11-27T10:00:00Z',location:'Room B'},
  {id:'early',title:'Earlier <session>',starts_at:'2026-11-26T23:30:00Z',ends_at:'2026-11-27T00:15:00Z',location:'Room <A>'},
 ]});
 assert.match(html,/Your selected agenda/);assert.match(html,/Africa\/Tunis/);
 assert.match(html,/November 27, 2026/);assert.match(html,/00:30/);assert.match(html,/01:15/);assert.match(html,/10:00/);
 assert.ok(html.indexOf('Earlier &lt;session&gt;')<html.indexOf('Later session'));
 assert.match(html,/Room &lt;A&gt;/);assert.match(html,/ABC123/);assert.match(html,/Event check-in QR code/);
 assert.match(html,/bgcolor="#0b2641"/);assert.match(html,/role="presentation"/);
});

test('online registration keeps joining instructions and places selected agenda inside the email',()=>{
 const event={id:'event',name:'Online event',event_format:'virtual',timezone:'Africa/Tunis',attendee_settings:{onlineExperience:{version:1,enabled:true,linkVisibility:'public',provider:'Meet',meetingUrl:'https://example.test/room',instructions:'Bring your questions',supportEmail:'help@example.test',startsAt:'2026-11-27T09:00:00Z',endsAt:'2026-11-27T10:00:00Z',timeZone:'Africa/Tunis',joinMinutes:10,recording:false}}};
 const html=registrationReceiptHtml({event,attendee:{id:'attendee',name:'Example'},sessions:[{id:'session',title:'Selected workshop',starts_at:'2026-11-27T09:00:00Z',ends_at:'2026-11-27T10:00:00Z'}],origin:'https://eventra.cloud'});
 assert.match(html,/Join the online session/);assert.match(html,/Bring your questions/);
 assert.match(html,/Selected workshop/);assert.match(html,/10:00/);
 assert.ok(html.indexOf('Selected workshop')<html.indexOf('</body>'));
 assert.doesNotMatch(html,/Event check-in QR code/);
});

test('unknown schedules are labeled honestly and invalid timezone falls back to UTC',()=>{
 const html=registrationReceiptHtml({event:{id:'event',name:'Event',timezone:'bad-zone'},attendee:{id:'attendee',name:'Example'},sessions:[{id:'session',title:'Unscheduled'}],origin:'https://eventra.cloud'});
 assert.match(html,/Date to be announced/);assert.match(html,/Time to be announced/);assert.match(html,/Times shown in UTC/);
});

test('already prepared registration emails keep their frozen content on retry',async()=>{
 const app=setup({existing:{state:'failed',mail:{to:['saved@example.test'],subject:'Frozen subject',html:'frozen original receipt'}}});
 assert.equal(await app.run(),'sent');assert.equal(app.sent.html,'frozen original receipt');assert.equal(app.sent.subject,'Frozen subject');assert.equal(app.calls.includes('link'),false);
});
