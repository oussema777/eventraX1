-- RPC function to batch-fetch form submission counts, avoiding N+1 queries.
-- Run this in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION get_form_submission_counts(form_ids UUID[])
RETURNS TABLE(form_id UUID, count BIGINT) AS $$
  SELECT form_id, COUNT(*) FROM event_form_submissions
  WHERE form_id = ANY(form_ids) GROUP BY form_id;
$$ LANGUAGE sql STABLE;
