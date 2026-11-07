import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/send-registration-email/index.ts',import.meta.url),'utf8').replace(/^import .*?;\r?\n/gm,''));
function setup(){let handler;const calls=[];vm.runInNewContext(source,{serve:fn=>{handler=fn;},Request,Response,AbortSignal,Deno:{env:{get:()=> 'https://eventra.cloud'}},fetch:async(url,options)=>{calls.push({url,options});return Response.json({success:true});}});return {calls,run:body=>handler(new Request('https://example.test/mail',{method:'POST',headers:{Authorization:'Bearer fixture-token'},body:JSON.stringify(body)}))};}
test('legacy HTML transport cannot bypass the authorized branded renderer',async()=>{const app=setup();assert.equal((await app.run({to:'person@example.test',subject:'Untrusted',html:'<p>Untrusted</p>'})).status,400);assert.equal(app.calls.length,0);});
test('compatibility endpoint forwards only named commands with original authorization',async()=>{const app=setup();const command={kind:'welcome',entityId:'10000000-0000-4000-8000-000000000001'};assert.equal((await app.run(command)).status,200);assert.equal(app.calls[0].url,'https://eventra.cloud/api/send-email');assert.equal(app.calls[0].options.headers.Authorization,'Bearer fixture-token');assert.equal(app.calls[0].options.redirect,'error');assert.deepEqual(JSON.parse(app.calls[0].options.body),command);});
