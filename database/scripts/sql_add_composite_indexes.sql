-- ============================================================
-- Eventra Performance Optimization — Phase 5: Composite Indexes
-- Run in Supabase SQL Editor
-- Date: April 2, 2026
-- ============================================================

-- 1. Events by owner + status (My Events Dashboard filtering)
CREATE INDEX IF NOT EXISTS idx_events_owner_status
  ON events(owner_id, status);

-- 2. Attendees by event + profile (registration checks, deduplication)
CREATE INDEX IF NOT EXISTS idx_attendees_event_profile
  ON event_attendees(event_id, profile_id);

-- 3. Sessions by event + location + status (venue conflict checks)
CREATE INDEX IF NOT EXISTS idx_sessions_event_location
  ON event_sessions(event_id, location, status);

-- 4. Sponsors by event + sort order (ordered listing)
CREATE INDEX IF NOT EXISTS idx_sponsors_event_sort
  ON event_sponsors(event_id, sort_order);

-- 5. Notifications by recipient + created_at DESC (notification feed)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_id, created_at DESC);

-- 6. Check-ins by event + date (attendance tracking)
CREATE INDEX IF NOT EXISTS idx_checkins_event_date
  ON event_checkins(event_id, created_at);

-- 7. Business profiles by owner (business dashboard lookup)
CREATE INDEX IF NOT EXISTS idx_business_owner
  ON business_profiles(owner_profile_id);

-- 8. Public events discovery (browse events page filtering)
CREATE INDEX IF NOT EXISTS idx_events_public
  ON events(is_public, status, moderation_status);

-- ============================================================
-- Verification: Run EXPLAIN ANALYZE on key queries after creating
-- indexes to confirm they're being used.
--
-- Example:
--   EXPLAIN ANALYZE
--   SELECT id, name, status FROM events
--   WHERE owner_id = '<user-id>' AND status = 'published';
-- ============================================================
