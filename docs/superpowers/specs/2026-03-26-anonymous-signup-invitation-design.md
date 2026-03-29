# Anonymous Registrant Signup Invitation Email

**Date:** 2026-03-26
**Status:** Approved

## Problem

When users register for an event anonymously (without an Eventra account), they miss out on B2B networking, meeting scheduling, profile visibility, and other platform features. There is currently no mechanism to invite them to create an account after registration.

## Solution

Send an automated invitation email 5 minutes after anonymous event registration, encouraging the registrant to create a free Eventra account. Each email address receives the invitation only once, regardless of how many events they register for.

## Architecture

### Components

1. **Database table** — `anonymous_signup_invitations` for deduplication and status tracking
2. **Database RPC function** — `get_eligible_anonymous_registrants` (SECURITY DEFINER) to safely query across `event_attendees` and `auth.users`
3. **Supabase Edge Function** — `send-signup-invitation` to claim eligible registrants and send emails via Resend
4. **pg_cron job** — runs every 5 minutes, triggers the Edge Function

### Flow

```
Anonymous user registers → event_attendees row (profile_id = NULL)
        ↓ (~5 minutes)
pg_cron triggers Edge Function
        ↓
Edge Function calls RPC get_eligible_anonymous_registrants()
  → Returns registrants with profile_id IS NULL, 5-10 min old,
    not in anonymous_signup_invitations, not in auth.users
        ↓
Edge Function claims rows: INSERT into anonymous_signup_invitations
  with status='pending' (ON CONFLICT DO NOTHING)
        ↓
Sends invitation email via Resend API
        ↓
Updates status to 'sent' (or 'failed' on error)
```

## Database

### New table: `anonymous_signup_invitations`

```sql
CREATE TABLE public.anonymous_signup_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
  sent_at TIMESTAMPTZ,                     -- NULL until email actually sends
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS enabled with NO policies. This is intentional: only the service role
-- can read/write this table. Non-service-role connections get zero rows.
ALTER TABLE public.anonymous_signup_invitations ENABLE ROW LEVEL SECURITY;
```

### New RPC function: `get_eligible_anonymous_registrants`

This function is `SECURITY DEFINER` to allow querying `auth.users` (which is not accessible via the JS client even with service role key).

```sql
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
  FROM event_attendees ea
  JOIN events e ON e.id = ea.event_id
  WHERE ea.profile_id IS NULL
    AND ea.created_at >= NOW() - INTERVAL '10 minutes'
    AND ea.created_at <= NOW() - INTERVAL '5 minutes'
    AND ea.email IS NOT NULL
    AND ea.email != ''
    AND ea.email NOT IN (SELECT asi.email FROM public.anonymous_signup_invitations asi)
    AND ea.email NOT IN (SELECT u.email FROM auth.users u WHERE u.email IS NOT NULL)
  ORDER BY ea.email, ea.created_at DESC;
$$;
```

Note: `ORDER BY ea.created_at DESC` returns the most recent registration per email (the event they just registered for).

## Supabase Edge Function: `send-signup-invitation`

**Location:** `supabase/functions/send-signup-invitation/index.ts`

### Logic (Claim-Then-Send Pattern)

This pattern prevents duplicate emails under concurrent execution:

1. Call `supabase.rpc('get_eligible_anonymous_registrants')` to get eligible registrants
2. **Claim phase:** For each eligible registrant, INSERT into `anonymous_signup_invitations` with `status = 'pending'` using `ON CONFLICT (email) DO NOTHING`. Only rows successfully inserted are "claimed" by this invocation.
3. **Send phase:** For each claimed row, send the invitation email via Resend API
4. **Update phase:** Set `status = 'sent'` and `sent_at = NOW()` on success, or `status = 'failed'` on Resend error
5. Return a summary of how many emails were sent/failed

### Resend API Key

Stored as a Supabase Edge Function secret (set via `supabase secrets set RESEND_API_KEY=...`), accessed in the function via `Deno.env.get('RESEND_API_KEY')`.

## Email Template

**Subject:** "Get more from {event_name} — Create your free Eventra account"

**Content highlights:**
- Greeting with attendee name
- Acknowledgment: "You're registered for {event_name}!"
- Benefits section:
  - **B2B Networking** — Connect with other attendees and schedule meetings
  - **Professional Profile** — Get discovered by fellow attendees and exhibitors
  - **Meeting Scheduling** — Book 1-on-1 meetings with other participants
  - **Smart Check-in** — Use your personal QR code for instant event check-in
- CTA button: "Create Your Free Account" → `https://app.eventra.cloud/signup?email={email}&ref=event-invite`
- Footer: Eventra branding, unsubscribe note

**Template location:** Defined directly in the Edge Function file (`supabase/functions/send-signup-invitation/index.ts`) as a standalone function. NOT placed in `src/lib/email.ts` because that module uses browser globals (`window.location`) which are unavailable in the Deno Edge Function runtime.

**Signup page behavior:** The `email` query parameter pre-fills but does NOT lock the email field on the signup page — users can change it if needed.

## pg_cron Configuration

```sql
-- Note: The service role key must be hardcoded here as a string literal.
-- pg_cron does not have access to Supabase env vars via current_setting().
-- The key is stored in the pg_cron.job table, accessible only to superuser.
SELECT cron.schedule(
  'send-anonymous-signup-invitations',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://<project-ref>.supabase.co/functions/v1/send-signup-invitation',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body   := '{}'::jsonb
  );
  $$
);
```

Replace `<project-ref>` and `<SERVICE_ROLE_KEY>` with actual values when deploying.

## Error Handling

- If Resend API fails for a specific email, set status to `'failed'` and continue processing other emails
- Failed emails remain in `anonymous_signup_invitations` with `status = 'failed'` — they are NOT retried automatically (prevents spam on persistent failures). Manual investigation needed.
- If the Edge Function itself crashes, pg_cron retries on the next 5-minute cycle
- The 5-10 minute time window prevents old records from being reprocessed
- Check `cron.job_run_details` and Supabase Edge Function logs for observability

## Security

- Edge Function requires service role key (not accessible from frontend)
- `anonymous_signup_invitations` table has RLS enabled with zero policies (intentional — service role only)
- RPC function is `SECURITY DEFINER` with explicit `search_path` to prevent search_path attacks
- Resend API key stored as Supabase Edge Function secret, not hardcoded
- Email pre-fill in signup link is the only data exposed in the URL

## Testing

- Create an anonymous registration and verify the email arrives ~5 minutes later
- Register the same email for a second event and verify no duplicate invitation
- Create an Eventra account with an email, then register anonymously for an event — verify no invitation sent
- Verify the Edge Function handles Resend API failures gracefully (marks as 'failed', continues others)
- Verify that a registration older than 10 minutes is NOT processed (time window boundary test)
- Verify concurrent Edge Function invocations do not send duplicate emails (claim pattern test)

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/send-signup-invitation/index.ts` | Create — Edge Function with email template |
| `database/scripts/create_anonymous_signup_invitations.sql` | Create — table + RLS |
| `database/scripts/create_eligible_registrants_rpc.sql` | Create — SECURITY DEFINER RPC function |
| `database/scripts/setup_signup_invitation_cron.sql` | Create — pg_cron schedule |
