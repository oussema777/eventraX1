import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/retry-registration-access/index.ts',import.meta.url),'utf8').replace(/^import .*?;\r?\n/gm,''));
function setup({state='ready',optIn=true,linked=true,receipt='sent'}={}) {
 let handler,claimed=false,emails=0,resolutions=0;
 const calls=[];
 const db={async rpc(name,args){
   calls.push({name,args});
   if(name==='claim_registration_access_job'){
     if(claimed)return {data:null};claimed=true;
     return {data:{token:'lease',event:{id:'event'},attendee:{id:'attendee',email:'guest@example.test',status:'registered',name:'Guest',meta:{b2bOptIn:optIn}}}};
   }
   if(name==='link_registration_access')return {data:linked};
   return {data:true};
 }};
 vm.runInNewContext(source,{Response,Date,
   createClient:()=>db,
   resolveRegistrationAccess:async()=>{resolutions++;return {state,userId:state==='ready'?'user':null};},
   sendRegistrationReceipt:async()=>{emails++;return receipt;},
   Deno:{env:{get:()=> 'worker-secret'},serve:fn=>{handler=fn;}}
 });
 return {calls,get emails(){return emails;},get resolutions(){return resolutions;},
  run:secret=>handler(new Request('https://example.test/worker',{method:'POST',headers:{'x-registration-retry-secret':secret??'worker-secret'}}))};
}
test('worker rejects public callers before looking at participant data',async()=>{
 const app=setup();assert.equal((await app.run('wrong')).status,401);assert.equal(app.calls.length,0);
});
test('ready account is linked with current email and lease before receipt delivery',async()=>{
 const app=setup();assert.equal((await app.run()).status,200);assert.equal(app.emails,1);
 const link=app.calls.find(c=>c.name==='link_registration_access');
 assert.equal(link.args.p_email,'guest@example.test');assert.equal(link.args.p_token,'lease');
 assert.equal(app.calls.find(c=>c.name==='finish_registration_access_job').args.p_outcome,'sent');
});
for(const [state,outcome] of [['pending','retry'],['review','review']])test(`${state} account never receives a false access email`,async()=>{
 const app=setup({state});await app.run();assert.equal(app.emails,0);
 assert.equal(app.calls.some(c=>c.name==='link_registration_access'),false);
 assert.equal(app.calls.find(c=>c.name==='finish_registration_access_job').args.p_outcome,outcome);
});
test('changed or conflicting registration is not emailed',async()=>{
 const app=setup({linked:false});await app.run();assert.equal(app.emails,0);
 assert.equal(app.calls.find(c=>c.name==='finish_registration_access_job').args.p_outcome,'review');
});
test('withdrawn networking opt-in cancels work without creating accounts or email',async()=>{
 const app=setup({optIn:false});await app.run();assert.equal(app.emails,0);assert.equal(app.resolutions,0);
 assert.equal(app.calls.find(c=>c.name==='finish_registration_access_job').args.p_outcome,'cancelled');
});
test('email delivery failure remains retryable after account linkage',async()=>{
 const app=setup({receipt:'failed'});await app.run();
 assert.equal(app.calls.find(c=>c.name==='finish_registration_access_job').args.p_outcome,'retry');
});
