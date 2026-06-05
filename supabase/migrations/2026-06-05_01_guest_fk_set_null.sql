-- =============================================================================
-- Migration: 2026-06-05_01_guest_fk_set_null.sql
-- Purpose  : Make every profile_* foreign key SET NULL on DELETE so that when
--            a guest attendee's `profiles` row is removed during cleanup the
--            referencing rows survive with their FK column set to NULL rather
--            than being cascade-deleted or blocking the delete.
--
-- Affected (table, column) pairs
--   b2b_matches              profile_id, matched_profile_id
--   b2b_requests             sender_id,  recipient_id
--   b2b_connections          profile_a_id, profile_b_id
--   event_b2b_meetings       profile_a_id, profile_b_id
--   message_thread_participants  profile_id  (skipped if no FK exists)
--   event_attendees          profile_id
--
-- INTENTIONALLY EXCLUDED
--   event_b2b_meetings.attendee_a_id / attendee_b_id
--   These reference the retained `event_attendees` rows (not `profiles`) and
--   must keep their existing ON DELETE behaviour.
--
-- Safe to re-run: the DO block is idempotent — it drops the old constraint
-- only if it finds one, then recreates it.  If no FK exists for a given
-- (table, column) pair the CONTINUE statement skips it silently.
-- =============================================================================

DO $$
DECLARE
  -- Each entry: schema, table, fk column
  target      RECORD;
  fk          RECORD;
  col_notnull BOOLEAN;
BEGIN

  FOR target IN
    VALUES
      ('public', 'b2b_matches',                  'profile_id'),
      ('public', 'b2b_matches',                  'matched_profile_id'),
      ('public', 'b2b_requests',                 'sender_id'),
      ('public', 'b2b_requests',                 'recipient_id'),
      ('public', 'b2b_connections',              'profile_a_id'),
      ('public', 'b2b_connections',              'profile_b_id'),
      ('public', 'event_b2b_meetings',           'profile_a_id'),
      ('public', 'event_b2b_meetings',           'profile_b_id'),
      ('public', 'message_thread_participants',  'profile_id'),
      ('public', 'event_attendees',              'profile_id')
  LOOP

    -- ── 1. Look up the FK constraint on (schema, table, column) ──────────────
    SELECT
      con.conname                           AS constraint_name,
      ns_ref.nspname                        AS ref_schema,
      ref_tbl.relname                       AS ref_table,
      ref_att.attname                       AS ref_column
    INTO fk
    FROM pg_constraint  con
    JOIN pg_class       tbl     ON tbl.oid = con.conrelid
    JOIN pg_namespace   ns_tbl  ON ns_tbl.oid = tbl.relnamespace
    -- FK column(s) in source table
    JOIN pg_attribute   src_att ON src_att.attrelid = tbl.oid
                               AND src_att.attnum = ANY(con.conkey)
    -- Referenced table + column
    JOIN pg_class       ref_tbl ON ref_tbl.oid = con.confrelid
    JOIN pg_namespace   ns_ref  ON ns_ref.oid = ref_tbl.relnamespace
    JOIN pg_attribute   ref_att ON ref_att.attrelid = ref_tbl.oid
                               AND ref_att.attnum = ANY(con.confkey)
    WHERE con.contype = 'f'
      AND ns_tbl.nspname = target.column1        -- source schema
      AND tbl.relname    = target.column2        -- source table
      AND src_att.attname = target.column3       -- source column
    LIMIT 1;

    -- ── 2. No FK found — skip this pair ─────────────────────────────────────
    IF NOT FOUND THEN
      RAISE NOTICE 'No FK found on %.%.% — skipping.',
        target.column1, target.column2, target.column3;
      CONTINUE;
    END IF;

    -- ── 3. Make the column NULLable if it is currently NOT NULL ─────────────
    SELECT NOT attnotnull
    INTO col_notnull
    FROM pg_attribute
    JOIN pg_class     ON pg_class.oid     = pg_attribute.attrelid
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_namespace.nspname = target.column1
      AND pg_class.relname     = target.column2
      AND pg_attribute.attname = target.column3;

    IF NOT col_notnull THEN
      EXECUTE format(
        'ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL',
        target.column1, target.column2, target.column3
      );
      RAISE NOTICE 'Dropped NOT NULL on %.%.%.',
        target.column1, target.column2, target.column3;
    END IF;

    -- ── 4. Drop the old FK constraint ───────────────────────────────────────
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
      target.column1, target.column2, fk.constraint_name
    );
    RAISE NOTICE 'Dropped constraint % on %.%.',
      fk.constraint_name, target.column2, target.column3;

    -- ── 5. Re-add the FK with ON DELETE SET NULL ─────────────────────────────
    EXECUTE format(
      'ALTER TABLE %I.%I
         ADD CONSTRAINT %I
         FOREIGN KEY (%I)
         REFERENCES %I.%I (%I)
         ON DELETE SET NULL',
      target.column1,   -- source schema
      target.column2,   -- source table
      fk.constraint_name,  -- reuse original name → idempotent re-run via DROP IF EXISTS above
      target.column3,   -- source column
      fk.ref_schema,    -- referenced schema
      fk.ref_table,     -- referenced table
      fk.ref_column     -- referenced column
    );
    RAISE NOTICE 'Recreated % on %.% → %.% (ON DELETE SET NULL).',
      fk.constraint_name,
      target.column2, target.column3,
      fk.ref_table,   fk.ref_column;

  END LOOP;

END;
$$;
