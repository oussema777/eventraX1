import test from 'node:test';
import assert from 'node:assert/strict';
import {createResendSender,deliverReviewJob,renderReviewDelivery} from '../scripts/lib/review-delivery.mjs';
const payload={version:1,to:'person@example.test',event_id:'20000000-0000-4000-8000-000000000001',request_id:'30000000-0000-4000-8000-000000000001',kind:'submitted',audience:'requester'};
const config={origin:'https://app.eventra.cloud',from:'Eventra <contact@eventra.cloud>'};
const lease={id:'40000000-0000-4000-8000-000000000001',lease_token:'50000000-0000-4000-8000-000000000001'};
test('email content uses authorized states, all three languages and authenticated destination',()=>{
  const mail=renderReviewDelivery(payload,config);
  assert.match(mail.html,/lang="fr"/); assert.match(mail.html,/dir="rtl"/);
  assert.match(mail.text,/https:\/\/app.eventra.cloud\/my-networking/);
  assert.match(renderReviewDelivery({...payload,audience:'reviewer'},config).text,/manage-event\/.*\?tab=b2b/);
  assert.throws(()=>renderReviewDelivery({...payload,audience:'recipient'},config));
  assert.throws(()=>renderReviewDelivery(payload,{...config,origin:'http://evil.test'}));
});
test('stale authorization after claim never calls provider',async()=>{
  let sends=0;
  const result=await deliverReviewJob({...config,rpc:async name=>name==='claim_review_delivery'?lease:null,send:async()=>sends++});
  assert.equal(sends,0);assert.equal(result.state,'suppressed');
});
test('successful provider result acknowledged with stable key and lease',async()=>{
  let finish;
  const result=await deliverReviewJob({...config,rpc:async(name,args)=>{
    if(name==='claim_review_delivery')return lease;
    if(name==='prepare_review_delivery')return payload;
    finish=args;return true;
  },send:async(mail,key)=>{assert.equal(key,`eventra-review-v1/${lease.id}`);assert.deepEqual(mail.to,[payload.to]);return {id:'sent-id'};}});
  assert.equal(result.state,'sent');assert.equal(finish.p_provider_id,'sent-id');assert.equal(finish.p_lease,lease.lease_token);
});
test('acknowledgement failure does not resend or overwrite uncertain delivery',async()=>{
  let sends=0,acks=0;
  await assert.rejects(deliverReviewJob({...config,rpc:async name=>{
    if(name==='claim_review_delivery')return lease;
    if(name==='prepare_review_delivery')return payload;
    acks++;throw new Error('database offline');
  },send:async()=>{sends++;return {id:'sent-id'};}}));
  assert.equal(sends,1);assert.equal(acks,1);
});
test('provider network failure produces safe retry code without raw content',async()=>{
  let finish;
  await deliverReviewJob({...config,rpc:async(name,args)=>{
    if(name==='claim_review_delivery')return lease;if(name==='prepare_review_delivery')return payload;
    finish=args;return true;
  },send:async()=>{throw new Error('secret provider response');}});
  assert.equal(finish.p_error,'NETWORK_ERROR');assert.equal(finish.p_permanent,false);
});
test('provider classifies rate limit, concurrent idempotency and payload conflict',async()=>{
  for(const [status,name,permanent] of [[429,'rate_limit_exceeded',false],[503,'server_error',false],[409,'concurrent_idempotent_requests',false],[409,'invalid_idempotent_request',true],[401,'validation_error',true]]){
    const send=createResendSender({apiKey:'test-only',fetchImpl:async(url,options)=>{
      assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'stable-key');
      return new Response(JSON.stringify({name}),{status});
    }});
    assert.equal((await send({},'stable-key')).permanent,permanent);
  }
});
test('provider returns accepted identifier and retries an ambiguous successful response',async()=>{
  const success=createResendSender({apiKey:'test-only',fetchImpl:async()=>new Response(JSON.stringify({id:'accepted-id'}),{status:200})});
  assert.deepEqual(await success({},'stable-key'),{id:'accepted-id'});
  const ambiguous=createResendSender({apiKey:'test-only',fetchImpl:async()=>new Response('invalid response',{status:200})});
  assert.equal((await ambiguous({},'stable-key')).permanent,false);
});
test('meeting responses accept only participant payloads and use a meeting identifier',()=>{
  for (const kind of ['confirmed','cancelled']) {
    const response={...payload,kind,audience:'participant',meeting_id:payload.request_id};
    delete response.request_id;
    assert.match(renderReviewDelivery(response,config).text,/my-networking/);
    assert.throws(()=>renderReviewDelivery({...response,audience:'reviewer'},config));
    assert.throws(()=>renderReviewDelivery({...response,meeting_id:undefined},config));
  }
});
