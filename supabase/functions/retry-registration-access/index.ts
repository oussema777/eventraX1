import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveRegistrationAccess } from '../_shared/registrationAccess.ts';
import { sendRegistrationReceipt } from '../_shared/registrationReceipt.ts';

Deno.serve(async req => {
  const secret = Deno.env.get('EVENTRA_REGISTRATION_RETRY_SECRET');
  if (req.method !== 'POST' || !secret || req.headers.get('x-registration-retry-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const deadline = Date.now() + 45000;
  let processed = 0;
  for (let i = 0; i < 5 && Date.now() < deadline; i++) {
    const { data: job, error } = await db.rpc('claim_registration_access_job');
    if (error) return new Response('Queue unavailable', { status: 503 });
    if (!job) break;
    const a = job.attendee;
    let outcome = 'retry';
    try {
      if (!a || !job.event || !['registered','approved','checked_in'].includes(a.status) || a.meta?.b2bOptIn !== true) {
        outcome = 'cancelled';
      } else {
        const access = await resolveRegistrationAccess(db, {
          email: a.email.trim().toLowerCase(), full_name: a.name, phone: a.meta?.phone,
          company_name: a.meta?.companyName, company_description: a.meta?.companyDescription,
          interests: a.meta?.interests, sector: a.meta?.sector, social_url: a.meta?.socialUrl, b2b_opt_in: true,
        });
        if (access.state === 'review') outcome = 'review';
        else if (access.userId) {
          const { data: linked, error: linkError } = await db.rpc('link_registration_access', {
            p_attendee: a.id, p_token: job.token, p_user: access.userId, p_email: a.email,
          });
          if (!linkError && linked === true) {
            outcome = await sendRegistrationReceipt(db, a.id, job.event, key => Deno.env.get(key)) === 'sent' ? 'sent' : 'retry';
          } else if (!linkError) outcome = 'review';
        }
      }
    } catch { /* Lease-backed retry; do not log addresses, tokens or provider payloads. */ }
    const { error: finishError } = await db.rpc('finish_registration_access_job', {
      p_attendee: a?.id, p_token: job.token, p_outcome: outcome,
    });
    if (finishError) return new Response('Queue acknowledgement unavailable', { status: 503 });
    processed++;
  }
  return Response.json({ processed });
});
