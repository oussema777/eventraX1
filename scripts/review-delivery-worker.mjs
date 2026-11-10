// One bounded batch per invocation; install a scheduler only after rollout review.
// Deliberately does not load .env or enable the database release flag.
import { createClient } from '@supabase/supabase-js';
import { createResendSender, deliverReviewJob } from './lib/review-delivery.mjs';
import { deliverMeetingJob } from './lib/meeting-delivery.mjs';

if (process.env.EVENTRA_REVIEW_DELIVERY_ENABLED !== 'true') {
  console.log('Review delivery disabled.');
} else {
  const required = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','EVENTRA_APP_ORIGIN','EVENTRA_MAIL_FROM'];
  if (required.some(key=>!process.env[key])) throw new Error('Review delivery configuration incomplete');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) },
  });
  const rpc = async (name,args) => {
    const {data,error} = await client.rpc(name,args);
    // Supports deploying the worker before the forward-only migration.
    if (['claim_meeting_delivery','record_meeting_delivery_heartbeat'].includes(name) && error?.code === 'PGRST202') return null;
    if (error) throw new Error('DELIVERY_DATABASE_ERROR'); // Never log raw provider/DB payloads.
    return data;
  };
  const send = createResendSender({apiKey:process.env.RESEND_API_KEY});
  try {
    await rpc('expire_review_requests',{});
    const deadline = Date.now() + 45000;
    for (let i=0;i<40 && Date.now()<deadline;i++) {
      let idle = true;
      for (const deliver of [deliverReviewJob, deliverMeetingJob]) {
        const result=await deliver({rpc,send,origin:process.env.EVENTRA_APP_ORIGIN,from:process.env.EVENTRA_MAIL_FROM});
        console.log(JSON.stringify(result)); // IDs/states only; never email/content.
        idle = idle && result.state==='idle';
        // Pace all outbound attempts; provider 429s remain queued for backoff.
        if (result.state!=='idle') await new Promise(resolve=>setTimeout(resolve,600));
      }
      if (idle) break;
    }
    await rpc('record_meeting_delivery_heartbeat',{});
  } catch {
    console.error('Review delivery batch interrupted; inspect queue leases and failure codes.');
    process.exitCode=1;
  }
}
