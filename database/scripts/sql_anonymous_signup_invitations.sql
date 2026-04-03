-- 1. Create dedup table
CREATE TABLE IF NOT EXISTS public.anonymous_signup_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anonymous_signup_invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_anon_signup_inv_email ON public.anonymous_signup_invitations (email);

-- 2. RPC function to get eligible anonymous registrants (SECURITY DEFINER to access auth.users)
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
    AND ea.email NOT IN (SELECT asi.email FROM public.anonymous_signup_invitations asi)
    AND ea.email NOT IN (SELECT u.email FROM auth.users u WHERE u.email IS NOT NULL)
  ORDER BY ea.email, ea.created_at DESC;
$$;
