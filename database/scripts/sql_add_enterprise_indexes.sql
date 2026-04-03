-- Enterprise indexes for Eventra platform
-- Run this script in your Supabase SQL Editor

-- Form submissions by form
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON event_form_submissions(form_id);

-- Event registrations by event
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);

-- Full-name search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_trgm ON profiles USING gin(full_name gin_trgm_ops);

-- Check-ins by event + type
CREATE INDEX IF NOT EXISTS idx_checkins_event_type ON event_checkins(event_id, type, created_at);

-- B2B matches by profile
CREATE INDEX IF NOT EXISTS idx_b2b_matches_profile ON b2b_matches(profile_id);

-- B2B requests by recipient
CREATE INDEX IF NOT EXISTS idx_b2b_requests_recipient ON b2b_requests(recipient_id, status);
