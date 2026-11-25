import test from 'node:test';
import assert from 'node:assert/strict';
import { renderQueuedMeeting, deliverMeetingJob } from '../scripts/lib/meeting-delivery.mjs';
const config={origin:'https://eventra.cloud',from:'Eventra <contact@eventra.cloud>'};
const payload={version:1,to:'person@example.test',kind:'pending',meeting_id:'50000000-0000-4000-8000-000000000001',event_id:'20000000-0000-4000-8000-000000000001',start_at:'2026-11-26T16:00:00Z',timezone:'Africa/Tunis',location:'Table-A01',event_name:'<script>bad</script>',partner:'Guest'};
test('pending email never promises a table; confirmed email uses assigned table',()=>{
 const pending=renderQueuedMeeting(payload,config);
 assert.ok(pending.text.includes('Table assigned on confirmation'));assert.ok(!pending.html.includes('Table-A01'));assert.ok(!pending.html.includes('<script>'));
 assert.ok(renderQueuedMeeting({...payload,kind:'confirmed'},config).text.includes('Table-A01'));
 assert.ok(!renderQueuedMeeting({...payload,kind:'cancelled'},config).text.includes('Table-A01'));
});
test('retry uses frozen mail, stable key, and records transient failure',async()=>{
 const calls=[];const frozen=renderQueuedMeeting(payload,config);
 const rpc=async(name,args)=>{calls.push({name,args});if(name==='claim_meeting_delivery')return {id:'job',token:'lease'};if(name==='prepare_meeting_delivery')return {payload,mail:frozen};if(name==='freeze_meeting_mail')return frozen;return true;};
 const result=await deliverMeetingJob({...config,rpc,send:async(mail,key)=>{assert.deepEqual(mail,frozen);assert.equal(key,'eventra-meeting-v1/job');return {error:'PROVIDER_429'};}});
 assert.equal(result.state,'failed');assert.equal(calls.at(-1).args.p_permanent,false);assert.equal(calls.at(-1).args.p_error,'PROVIDER_429');
});
test('state change immediately before send suppresses obsolete email',async()=>{
 let prepared=0;let sends=0;
 const rpc=async(name,args)=>{if(name==='claim_meeting_delivery')return {id:'job',token:'lease'};if(name==='prepare_meeting_delivery')return ++prepared===1?{payload}:null;if(name==='freeze_meeting_mail')return args.p_mail;};
 const result=await deliverMeetingJob({...config,rpc,send:async()=>{sends++;}});assert.equal(result.state,'suppressed');assert.equal(sends,0);
});
test('lost acknowledgement leaves the lease for safe recovery',async()=>{
 let sends=0;
 const rpc=async(name,args)=>{if(name==='claim_meeting_delivery')return {id:'job',token:'lease'};if(name==='prepare_meeting_delivery')return {payload};if(name==='freeze_meeting_mail')return args.p_mail;if(name==='finish_meeting_delivery')throw Error('database unavailable');};
 await assert.rejects(deliverMeetingJob({...config,rpc,send:async()=>{sends++;return {id:'provider-1'};}}));assert.equal(sends,1);
});

test('both workers embed a decodable pass for the addressed participant only on physical confirmations', async () => {
  const { deliverReviewJob } = await import('../scripts/lib/review-delivery.mjs');
  const { PNG } = await import('pngjs');
  const { default: decode } = await import('jsqr');
  const first = '10000000-0000-4000-8000-000000000001';
  const second = '10000000-0000-4000-8000-000000000002';
  for (const worker of [deliverMeetingJob, deliverReviewJob]) {
    const reviewed = worker === deliverReviewJob;
    for (const [kind, format, person] of [
      ['confirmed', 'in-person', first], ['confirmed', 'hybrid', second],
      ['confirmed', 'video', first], ['pending', 'in-person', first], ['cancelled', 'hybrid', first]
    ]) {
      if (reviewed && kind === 'pending') continue;
      const job = { ...payload, version: reviewed ? 2 : 1, audience: 'participant', participant_id: person, kind, format };
      let sent;
      const rpc = async (name, args) => {
        if (name.startsWith('claim_')) return { id: 'test', token: 'lease', lease_token: 'lease' };
        if (name.startsWith('prepare_')) return reviewed ? job : { payload: job };
        if (name === 'freeze_meeting_mail') return args.p_mail;
        return true;
      };
      await worker({ ...config, rpc, send: async mail => { sent = mail; return { id: 'accepted' }; } });
      assert.ok(sent);
      if (kind !== 'confirmed' || format === 'video') {
        assert.equal(sent.attachments, undefined);
        assert.doesNotMatch(sent.html, /cid:meeting-pass/);
        continue;
      }
      const [attachment] = sent.attachments;
      assert.match(sent.html, /src="cid:meeting-pass"/);
      assert.equal(attachment.content_id, 'meeting-pass');
      const image = PNG.sync.read(Buffer.from(attachment.content, 'base64'));
      const url = new URL(decode(new Uint8ClampedArray(image.data), image.width, image.height).data);
      assert.equal(url.origin, config.origin);
      assert.equal(url.pathname, `/event/${job.event_id}/networking`);
      assert.equal(url.searchParams.get('meetingId'), job.meeting_id);
      assert.equal(url.searchParams.get('participant'), person);
      assert.ok(sent.text.includes(url.href));
    }
  }
});
