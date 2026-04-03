-- Add sort_order column to event_sponsors for drag-to-reorder functionality
ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
UPDATE event_sponsors SET sort_order = 0 WHERE sort_order IS NULL;
