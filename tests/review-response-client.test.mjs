import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = readFileSync(new URL('../src/lib/investorReview.ts',import.meta.url),'utf8')
  .replace("import { supabase } from './supabase';",'const supabase = globalThis.__responseClientTest;');
let response;
const calls=[];
globalThis.__responseClientTest={rpc:async(name,args)=>{calls.push({name,args});return response;}};
const {respondToProtectedMeeting}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
test('protected response uses the server result and exact expected state',async()=>{
  response={data:true,error:null};calls.length=0;
  assert.equal(await respondToProtectedMeeting('meeting','pending','confirmed'),true);
  assert.deepEqual(calls,[{name:'respond_protected_meeting',args:{p_meeting:'meeting',p_expected:'pending',p_status:'confirmed'}}]);
});
test('ordinary meeting and absent migration are the only fallback responses',async()=>{
  response={data:false,error:null};assert.equal(await respondToProtectedMeeting('meeting','confirmed','cancelled'),false);
  response={data:null,error:{code:'PGRST202'}};assert.equal(await respondToProtectedMeeting('meeting','pending','cancelled'),false);
});
test('authorization, concurrency and network errors cannot enter legacy sends',async()=>{
  for (const code of ['42501','40001','503']) {
    response={data:null,error:{code,message:'failed'}};
    await assert.rejects(respondToProtectedMeeting('meeting','pending','confirmed'),error=>error.code===code);
  }
});
test('malformed successful response fails closed',async()=>{
  for (const data of [null,[],{},'false',0]) {
    response={data,error:null};
    await assert.rejects(respondToProtectedMeeting('meeting','pending','confirmed'),/Invalid meeting response/);
  }
});
