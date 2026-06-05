-- =============================================================================
-- Migration: 2026-06-05_01_guest_fk_set_null.sql
-- Purpose  : Make every profile_* foreign key SET NULL on DELETE so that when a
--            guest attendee's `profiles` row is removed during cleanup the
--            referencing rows survive (FK column set to NULL) rather than being
--            cascade-deleted or blocking the delete.
--
-- Affected (table, column) pairs
--   b2b_matches                  profile_id, matched_profile_id
--   b2b_requests                 sender_id,  recipient_id
--   b2b_connections              profile_a_id, profile_b_id
--   event_b2b_meetings           profile_a_id, profile_b_id
--   message_thread_participants  profile_id   (PRIMARY KEY column -> see below)
--   event_attendees              profile_id
--
-- PRIMARY-KEY COLUMNS
--   A PK column cannot be NULL, so it cannot use ON DELETE SET NULL. For any
--   listed column that is part of a primary key (e.g.
--   message_thread_participants.profile_id), this migration uses ON DELETE
--   CASCADE instead — deleting the guest removes only that join/participant row;
--   the thread, the other participant, and the messages survive.
--
-- INTENTIONALLY EXCLUDED
--   event_b2b_meetings.attendee_a_id / attendee_b_id — these reference the
--   retained `event_attendees` rows (not `profiles`) and keep their behaviour.
--
-- Safe to re-run: idempotent (drops a constraint only if found, recreates it).
-- Single transaction: if anything errors, the whole block rolls back unchanged.
--
-- DIAGNOSTIC: after the loop it RAISEs a NOTICE for every OTHER foreign key that
-- references public.profiles and still has a delete rule that would BLOCK a
-- profile delete (NO ACTION / RESTRICT) — e.g. a `messages` sender FK. Review
-- those and extend the list above if they must survive guest deletion.
-- =============================================================================

DO $$
DECLARE
  target        RECORD;
  fk            RECORD;
  blocker       RECORD;
  col_notnull   BOOLEAN;
  is_pk         BOOLEAN;
  delete_action TEXT;
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
      con.conname    AS constraint_name,
      ns_ref.nspname AS ref_schema,
      ref_tbl.relname AS ref_table,
      ref_att.attname AS ref_column
    INTO fk
    FROM pg_constraint  con
    JOIN pg_class       tbl     ON tbl.oid = con.conrelid
    JOIN pg_namespace   ns_tbl  ON ns_tbl.oid = tbl.relnamespace
    JOIN pg_attribute   src_att ON src_att.attrelid = tbl.oid
                               AND src_att.attnum = ANY(con.conkey)
    JOIN pg_class       ref_tbl ON ref_tbl.oid = con.confrelid
    JOIN pg_namespace   ns_ref  ON ns_ref.oid = ref_tbl.relnamespace
    JOIN pg_attribute   ref_att ON ref_att.attrelid = ref_tbl.oid
                               AND ref_att.attnum = ANY(con.confkey)
    WHERE con.contype = 'f'
      AND ns_tbl.nspname  = target.column1
      AND tbl.relname     = target.column2
      AND src_att.attname = target.column3
    LIMIT 1;

    -- ── 2. No FK found — skip this pair ─────────────────────────────────────
    IF NOT FOUND THEN
      RAISE NOTICE 'No FK found on %.%.% — skipping.',
        target.column1, target.column2, target.column3;
      CONTINUE;
    END IF;

    -- ── 3. Is the column part of a primary key? (PK cols cannot be SET NULL) ─
    SELECT EXISTS (
      SELECT 1
      FROM pg_constraint pk
      JOIN pg_class     c ON c.oid = pk.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(pk.conkey)
      WHERE pk.contype = 'p'
        AND n.nspname = target.column1
        AND c.relname = target.column2
        AND a.attname = target.column3
    ) INTO is_pk;

    IF is_pk THEN
      -- PK column: must stay NOT NULL; CASCADE removes the join row on delete.
      delete_action := 'CASCADE';
      RAISE NOTICE '%.%.% is part of a primary key — using ON DELETE CASCADE.',
        target.column1, target.column2, target.column3;
    ELSE
      delete_action := 'SET NULL';
      -- Make the column NULLable if it is currently NOT NULL.
      SELECT attnotnull
      INTO col_notnull
      FROM pg_attribute
      JOIN pg_class     ON pg_class.oid     = pg_attribute.attrelid
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = target.column1
        AND pg_class.relname     = target.column2
        AND pg_attribute.attname = target.column3;

      IF col_notnull THEN
        EXECUTE format(
          'ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL',
          target.column1, target.column2, target.column3
        );
        RAISE NOTICE 'Dropped NOT NULL on %.%.%.',
          target.column1, target.column2, target.column3;
      END IF;
    END IF;

    -- ── 4. Drop the old FK constraint ───────────────────────────────────────
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
      target.column1, target.column2, fk.constraint_name
    );

    -- ── 5. Re-add the FK with the chosen delete action ──────────────────────
    EXECUTE format(
      'ALTER TABLE %I.%I
         ADD CONSTRAINT %I
         FOREIGN KEY (%I)
         REFERENCES %I.%I (%I)
         ON DELETE %s',
      target.column1, target.column2, fk.constraint_name,
      target.column3, fk.ref_schema, fk.ref_table, fk.ref_column,
      delete_action
    );
    RAISE NOTICE 'Recreated % on %.% → %.% (ON DELETE %).',
      fk.constraint_name, target.column2, target.column3,
      fk.ref_table, fk.ref_column, delete_action;

  END LOOP;

  -- ── 6. Diagnostic: other FKs that still BLOCK deleting a profiles row ──────
  FOR blocker IN
    SELECT ns.nspname AS sch, tbl.relname AS tbl, att.attname AS col,
           con.conname AS cons, con.confdeltype AS del
    FROM pg_constraint con
    JOIN pg_class      tbl ON tbl.oid = con.conrelid
    JOIN pg_namespace  ns  ON ns.oid = tbl.relnamespace
    JOIN pg_attribute  att ON att.attrelid = tbl.oid AND att.attnum = ANY(con.conkey)
    JOIN pg_class      ref ON ref.oid = con.confrelid
    JOIN pg_namespace  rns ON rns.oid = ref.relnamespace
    WHERE con.contype = 'f'
      AND rns.nspname = 'public' AND ref.relname = 'profiles'
      AND con.confdeltype IN ('a', 'r')   -- NO ACTION / RESTRICT block deletes
  LOOP
    RAISE NOTICE 'BLOCKER: %.% .% (FK %) still references profiles with delete rule % — review for guest cleanup.',
      blocker.sch, blocker.tbl, blocker.col, blocker.cons, blocker.del;
  END LOOP;

END;
$$;
