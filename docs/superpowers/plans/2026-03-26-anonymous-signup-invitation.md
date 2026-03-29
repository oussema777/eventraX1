# Anonymous Signup Invitation Email — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically send invitation emails to anonymous event registrants 5 minutes after registration, encouraging them to create an Eventra account.

**Architecture:** A Supabase Edge Function triggered by pg_cron every 5 minutes queries for anonymous registrants (profile_id IS NULL) via a SECURITY DEFINER RPC function, claims them in a dedup table, and sends invitation emails via the Resend API.

**Tech Stack:** Supabase Edge Functions (Deno/TypeScript), PostgreSQL (pg_cron, RPC functions), Resend API for email delivery.

**Spec:** `docs/superpowers/specs/2026-03-26-anonymous-signup-invitation-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `database/scripts/sql_create_anonymous_signup_invitations.sql` | Create | Table schema + RLS |
| `database/scripts/sql_create_eligible_registrants_rpc.sql` | Create | SECURITY DEFINER RPC function |
| `database/scripts/sql_setup_signup_invitation_cron.sql` | Create | pg_cron schedule |
| `supabase/functions/send-signup-invitation/index.ts` | Create | Edge Function: claim + send + update |

---

### Task 1: Create the `anonymous_signup_invitations` table

**Files:**
- Create: `database/scripts/sql_create_anonymous_signup_invitations.sql`

- [ ] **Step 1: Write the SQL migration script**

```sql
-- Create the anonymous_signup_invitations table for deduplication tracking.
-- Each email address can only appear once, ensuring one invitation per person.

CREATE TABLE IF NOT EXISTS public.anonymous_signup_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
  sent_at TIMESTAMPTZ,                     -- NULL until email actually sends
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS enabled with NO policies. This is intentional:
-- Only the service role can read/write this table.
-- Non-service-role connections (anon, authenticated) get zero rows.
ALTER TABLE public.anonymous_signup_invitations ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups during the claim phase
CREATE INDEX IF NOT EXISTS idx_anonymous_signup_invitations_email
  ON public.anonymous_signup_invitations (email);

CREATE INDEX IF NOT EXISTS idx_anonymous_signup_invitations_status
  ON public.anonymous_signup_invitations (status);
```

- [ ] **Step 2: Run the SQL in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run the script.
Expected: Table `anonymous_signup_invitations` created with RLS enabled and no policies.

- [ ] **Step 3: Verify the table exists**

Run in SQL Editor:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'anonymous_signup_invitations'
ORDER BY ordinal_position;
```
Expected: 7 columns (id, email, event_id, event_name, status, sent_at, created_at).

- [ ] **Step 4: Commit**

```bash
git add database/scripts/sql_create_anonymous_signup_invitations.sql
git commit -m "feat: add anonymous_signup_invitations table for signup email dedup"
```

---

### Task 2: Create the SECURITY DEFINER RPC function

**Files:**
- Create: `database/scripts/sql_create_eligible_registrants_rpc.sql`

- [ ] **Step 1: Write the RPC function SQL**

```sql
-- SECURITY DEFINER function to query eligible anonymous registrants.
-- This is needed because auth.users is not accessible via the JS client,
-- even with the service role key when using the from() query builder.

CREATE OR REPLACE FUNCTION public.get_eligible_anonymous_registrants()
RETURNS TABLE (
  email TEXT,
  name TEXT,
  event_id UUID,
  event_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (ea.email)
    ea.email,
    ea.name,
    ea.event_id,
    e.title AS event_name
  FROM public.event_attendees ea
  JOIN public.events e ON e.id = ea.event_id
  WHERE ea.profile_id IS NULL
    AND ea.created_at >= NOW() - INTERVAL '10 minutes'
    AND ea.created_at <= NOW() - INTERVAL '5 minutes'
    AND ea.email IS NOT NULL
    AND ea.email != ''
    AND ea.email NOT IN (
      SELECT asi.email FROM public.anonymous_signup_invitations asi
    )
    AND ea.email NOT IN (
      SELECT u.email FROM auth.users u WHERE u.email IS NOT NULL
    )
  ORDER BY ea.email, ea.created_at DESC;
$$;
```

- [ ] **Step 2: Run the SQL in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run.
Expected: Function `get_eligible_anonymous_registrants` created.

- [ ] **Step 3: Test the RPC function**

Run in SQL Editor:
```sql
SELECT * FROM get_eligible_anonymous_registrants();
```
Expected: Returns empty set or rows matching the criteria (anonymous registrants from 5-10 min ago without an invitation or Eventra account).

- [ ] **Step 4: Commit**

```bash
git add database/scripts/sql_create_eligible_registrants_rpc.sql
git commit -m "feat: add RPC function to query eligible anonymous registrants"
```

---

### Task 3: Create the Supabase Edge Function

**Files:**
- Create: `supabase/functions/send-signup-invitation/index.ts`

- [ ] **Step 1: Initialize the Supabase functions directory**

```bash
mkdir -p supabase/functions/send-signup-invitation
```

- [ ] **Step 2: Write the Edge Function**

Create `supabase/functions/send-signup-invitation/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function generateSignupInvitationEmailHtml(
  name: string,
  email: string,
  eventName: string
): string {
  const signupUrl = `https://app.eventra.cloud/signup?email=${encodeURIComponent(email)}&ref=event-invite`

  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; padding: 40px 20px; background-color: #F9FAFB;">
      <div style="background-color: #FFFFFF; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #E5E7EB;">
        <!-- Eventra Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #0684F5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Eventra</h2>
        </div>

        <h1 style="color: #111827; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 16px;">
          You're registered for ${eventName}!
        </h1>

        <p style="font-size: 16px; line-height: 1.6; color: #4B5563; text-align: center; margin-bottom: 32px;">
          Hi ${name || 'there'}, get the most out of your event experience by creating a free Eventra account.
        </p>

        <!-- Benefits Section -->
        <div style="background-color: #F3F4F6; padding: 28px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #E5E7EB;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; text-align: center;">Unlock these features</h3>
          <ul style="padding: 0; margin: 0; list-style: none; font-size: 14px; color: #4B5563;">
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f91d;</span>
              <div>
                <strong style="color: #111827;">B2B Networking</strong><br/>
                Connect with other attendees and exhibitors at the event
              </div>
            </li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f4c5;</span>
              <div>
                <strong style="color: #111827;">Meeting Scheduling</strong><br/>
                Book 1-on-1 meetings with other participants during the event
              </div>
            </li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f464;</span>
              <div>
                <strong style="color: #111827;">Professional Profile</strong><br/>
                Get discovered by fellow attendees and exhibitors
              </div>
            </li>
            <li style="margin-bottom: 0; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x26a1;</span>
              <div>
                <strong style="color: #111827;">Smart Check-in</strong><br/>
                Use your personal QR code for instant event check-in
              </div>
            </li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${signupUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Create Your Free Account</a>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #9CA3AF; text-align: center;">
          It only takes a minute. Your event registration stays active either way.
        </p>
      </div>

      <p style="margin-top: 32px; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
        &copy; 2026 Eventra.cloud. All rights reserved.<br/>
        You received this email because you registered for ${eventName}.<br/>
        <a href="https://eventra.cloud" style="color: #9CA3AF;">eventra.cloud</a>
      </p>
    </div>
  `
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eventra <contact@eventra.cloud>',
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error(`[INVITATION] Resend error for ${to}:`, err)
      return false
    }

    const data = await res.json()
    console.log(`[INVITATION] Email sent to ${to}, id: ${data.id}`)
    return true
  } catch (error) {
    console.error(`[INVITATION] Failed to send to ${to}:`, error)
    return false
  }
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Get eligible anonymous registrants via RPC
    const { data: registrants, error: rpcError } = await supabase
      .rpc('get_eligible_anonymous_registrants')

    if (rpcError) {
      console.error('[INVITATION] RPC error:', rpcError)
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, message: 'No eligible registrants' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[INVITATION] Found ${registrants.length} eligible registrants`)

    let sent = 0
    let failed = 0

    for (const reg of registrants) {
      // 2. Claim phase: INSERT with ON CONFLICT DO NOTHING
      const { data: claimed, error: claimError } = await supabase
        .from('anonymous_signup_invitations')
        .insert({
          email: reg.email,
          event_id: reg.event_id,
          event_name: reg.event_name,
          status: 'pending',
        })
        .select('id')
        .single()

      if (claimError) {
        // 23505 = unique violation = already claimed by another invocation
        if (claimError.code === '23505') {
          console.log(`[INVITATION] Already claimed: ${reg.email}`)
          continue
        }
        console.error(`[INVITATION] Claim error for ${reg.email}:`, claimError)
        continue
      }

      // 3. Send phase
      const subject = `Get more from ${reg.event_name} — Create your free Eventra account`
      const html = generateSignupInvitationEmailHtml(reg.name, reg.email, reg.event_name)
      const success = await sendEmailViaResend(reg.email, subject, html)

      // 4. Update phase
      if (success) {
        await supabase
          .from('anonymous_signup_invitations')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', claimed.id)
        sent++
      } else {
        await supabase
          .from('anonymous_signup_invitations')
          .update({ status: 'failed' })
          .eq('id', claimed.id)
        failed++
      }
    }

    console.log(`[INVITATION] Done. Sent: ${sent}, Failed: ${failed}`)

    return new Response(JSON.stringify({ sent, failed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[INVITATION] Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/send-signup-invitation/index.ts
git commit -m "feat: add Edge Function for anonymous signup invitation emails"
```

---

### Task 4: Deploy the Edge Function and set secrets

- [ ] **Step 1: Install Supabase CLI (if not already installed)**

```bash
npm install -g supabase
```

- [ ] **Step 2: Link to the Supabase project**

```bash
supabase link --project-ref kvfoswfaifxqnjqhftwc
```

- [ ] **Step 3: Set the Resend API key secret**

```bash
supabase secrets set RESEND_API_KEY=<your-resend-api-key>
```

Use the production Resend API key from `.env` (`RESEND_API_KEY`).

- [ ] **Step 4: Deploy the Edge Function**

```bash
supabase functions deploy send-signup-invitation
```

Expected: Function deployed successfully.

- [ ] **Step 5: Test the Edge Function manually**

```bash
curl -X POST \
  https://kvfoswfaifxqnjqhftwc.supabase.co/functions/v1/send-signup-invitation \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `{"sent":0,"failed":0,"message":"No eligible registrants"}` (or actual sends if there are eligible registrants).

---

### Task 5: Set up pg_cron schedule

**Files:**
- Create: `database/scripts/sql_setup_signup_invitation_cron.sql`

- [ ] **Step 1: Write the cron schedule SQL**

```sql
-- Schedule the anonymous signup invitation Edge Function to run every 5 minutes.
-- Note: The service role key must be hardcoded as pg_cron cannot access Supabase env vars.
-- The key is stored in pg_cron.job, accessible only to the database superuser.

-- First, ensure pg_cron and pg_net extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the job
SELECT cron.schedule(
  'send-anonymous-signup-invitations',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://kvfoswfaifxqnjqhftwc.supabase.co/functions/v1/send-signup-invitation',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body   := '{}'::jsonb
  );
  $$
);
```

Replace `<SERVICE_ROLE_KEY>` with the actual service role key before running.

- [ ] **Step 2: Run in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run (with actual service role key).
Expected: Cron job scheduled.

- [ ] **Step 3: Verify the cron job is active**

```sql
SELECT jobid, schedule, command FROM cron.job
WHERE jobname = 'send-anonymous-signup-invitations';
```

Expected: One row with `*/5 * * * *` schedule.

- [ ] **Step 4: Commit**

```bash
git add database/scripts/sql_setup_signup_invitation_cron.sql
git commit -m "feat: add pg_cron schedule for anonymous signup invitations"
```

---

### Task 6: End-to-end testing

- [ ] **Step 1: Create a test anonymous registration**

Open an event landing page in an incognito/private browser window (not logged in). Register for the event with a test email address.

- [ ] **Step 2: Verify the attendee row**

Run in Supabase SQL Editor:
```sql
SELECT email, profile_id, created_at
FROM event_attendees
WHERE email = '<test-email>'
ORDER BY created_at DESC
LIMIT 1;
```

Expected: Row with `profile_id = NULL`.

- [ ] **Step 3: Wait 5 minutes and check for the invitation**

After ~5 minutes, check:
```sql
SELECT * FROM anonymous_signup_invitations
WHERE email = '<test-email>';
```

Expected: One row with `status = 'sent'` and `sent_at` populated.

Also check the test email inbox for the invitation email.

- [ ] **Step 4: Test deduplication — register same email for another event**

Register the same test email for a different event. Wait 5+ minutes.

```sql
SELECT COUNT(*) FROM anonymous_signup_invitations
WHERE email = '<test-email>';
```

Expected: Still 1 row (no duplicate).

- [ ] **Step 5: Test existing-account exclusion**

Register for an event using an email that already has an Eventra account. Wait 5+ minutes. Verify no invitation was sent.

- [ ] **Step 6: Check cron job history**

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-anonymous-signup-invitations')
ORDER BY start_time DESC
LIMIT 10;
```

Expected: Successful runs every 5 minutes.
