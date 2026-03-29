-- Add SEO fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_slug TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Create unique index on seo_slug for URL routing
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_seo_slug ON events(seo_slug) WHERE seo_slug IS NOT NULL;
