import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

const source=['onlineExperience.ts','registrationReceipt.ts'].map(file=>stripTypeScriptTypes(readFileSync(new URL(`../supabase/functions/_shared/${file}`,import.meta.url),'utf8').replace(/^import .*?;\r?\n/gm,''))).join('\n').replace(/^export /gm,'');
const {sendRegistrationReceipt,notifyRegistrationOwner}=vm.runInNewContext(source+'\n({sendRegistrationReceipt,notifyRegistrationOwner})',{URL,TextEncoder,crypto,AbortSignal});
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
