import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return reply({ error: 'Sign-in required' }, 401);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user?.email) return reply({ error: 'Invalid session' }, 401);
  if (user.app_metadata?.account_type !== 'event_guest') return reply({ activated: false, member: true });

  // The token proves access to the registered email. The attendee link proves
  // this is an event B2B account rather than an unrelated guest identity.
  const { data: attendee, error: attendeeError } = await admin.from('event_attendees')
    .select('id, event_id').eq('profile_id', user.id)
    .ilike('email', user.email)
    .contains('meta', { b2bOptIn: true })
    .neq('status', 'cancelled')
    .limit(1).maybeSingle();
  if (attendeeError) return reply({ error: 'Unable to verify registration' }, 503);
  if (!attendee) return reply({ error: 'B2B registration required' }, 403);

  const { error: profileError } = await admin.from('profiles')
    .update({ account_type: 'user' }).eq('id', user.id);
  if (profileError) return reply({ error: 'Unable to activate profile' }, 503);
  const { error: userError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, account_type: 'user' },
  });
  if (userError) return reply({ error: 'Unable to activate account' }, 503);
  await admin.from('event_attendees').update({ guest_expires_at: null }).eq('profile_id', user.id);
  return reply({ activated: true, member: true, event_id: attendee.event_id });
});
