// supabase/functions/cleanup-event-guests/index.ts
//
// Lifecycle cleanup for event guests (auth users with
// profiles.account_type = 'event_guest').
//
// For each guest we derive thresholds from their events (not a stored stamp,
// so multi-event guests are handled correctly):
//   latestEnd = max(end_date ?? start_date) across all their event_attendees
//   blockAt   = latestEnd + 7 days   -> ban the auth user (~100 years)
//   destroyAt = latestEnd + 30 days  -> redact attendee PII + delete auth user
//
// Deleting the auth user cascades the hidden profiles row (FKs null/redact the
// rest). event_attendees.profile_id is ON DELETE SET NULL, so attendee rows are
// RETAINED — that's why we redact their PII before deleting the user.
//
// Invocation is restricted to the scheduler via the `x-cron-secret` header.
// Pass { "dry_run": true } to compute intended actions without executing them.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const BLOCK_DAYS = 7;
const DESTROY_DAYS = 30;
const BAN_DURATION = '876000h'; // ~100 years

// meta keys that hold PII and must be redacted on destroy.
const REDACT_META_KEYS = ['email', 'phone', 'fullName', 'companyName', 'socialUrl'];
// meta keys to preserve verbatim (do NOT drop the rest of meta).
// Kept: sector, interests, confirmation_code, b2bOptIn.

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type AttendeeRow = {
  id: string;
  meta: Record<string, unknown> | null;
  events: { end_date: string | null; start_date: string | null } | null;
};

/**
 * Compute the latest "end" timestamp (ms) across a guest's attendee rows.
 * Uses event end_date, falling back to start_date. Returns null if the guest
 * has no datable events.
 */
function computeLatestEnd(rows: AttendeeRow[]): number | null {
  let latest: number | null = null;
  for (const row of rows) {
    const ev = row.events;
    if (!ev) continue;
    const stamp = ev.end_date ?? ev.start_date;
    if (!stamp) continue;
    const ms = new Date(stamp).getTime();
    if (Number.isNaN(ms)) continue;
    if (latest === null || ms > latest) latest = ms;
  }
  return latest;
}

/**
 * Produce a redacted copy of a meta object: PII keys overwritten with
 * '[redacted]', everything else (sector, interests, confirmation_code,
 * b2bOptIn, and any other key) preserved.
 */
function redactMeta(meta: Record<string, unknown> | null): Record<string, unknown> {
  const next: Record<string, unknown> = { ...(meta ?? {}) };
  for (const key of REDACT_META_KEYS) {
    // Overwrite regardless of whether the key currently exists, so redaction is
    // explicit and idempotent.
    next[key] = '[redacted]';
  }
  return next;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Auth check FIRST: only the scheduler may invoke this. ---
  const cronSecret = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('x-cron-secret');
  if (!cronSecret || providedSecret !== cronSecret) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Parse optional body { dry_run?: boolean }. Tolerate empty body.
    let dryRun = false;
    try {
      const body = await req.json();
      dryRun = body?.dry_run === true;
    } catch (_) {
      dryRun = false;
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = Date.now();

    // --- Load all guest profile ids ---
    const { data: guests, error: guestsError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('account_type', 'event_guest');

    if (guestsError) {
      return jsonResponse({ error: 'Failed to load guests', details: guestsError.message }, 500);
    }

    const blocked: string[] = [];
    const destroyed: string[] = [];
    let skipped = 0;
    const scanned = guests?.length ?? 0;

    for (const guest of guests ?? []) {
      const guestId = guest.id as string;

      // Load this guest's attendee rows + joined event dates.
      const { data: rows, error: rowsError } = await supabaseAdmin
        .from('event_attendees')
        .select('id, meta, events:event_id ( end_date, start_date )')
        .eq('profile_id', guestId);

      if (rowsError) {
        console.error(`[cleanup] guest=${guestId} failed to load attendees: ${rowsError.message}`);
        skipped++;
        continue;
      }

      const attendeeRows = (rows ?? []) as unknown as AttendeeRow[];
      const latestEnd = computeLatestEnd(attendeeRows);

      // No datable events → cannot derive thresholds → skip and note.
      if (latestEnd === null) {
        console.log(`[cleanup] guest=${guestId} action=skip reason=no-datable-events`);
        skipped++;
        continue;
      }

      const blockAt = latestEnd + BLOCK_DAYS * DAY_MS;
      const destroyAt = latestEnd + DESTROY_DAYS * DAY_MS;

      if (now > destroyAt) {
        // --- DESTROY: redact retained attendee rows, then delete auth user. ---
        console.log(
          `[cleanup] guest=${guestId} action=destroy${dryRun ? '(dry-run)' : ''} rows=${attendeeRows.length}`
        );
        if (!dryRun) {
          // Redact PII on every retained attendee row.
          for (const row of attendeeRows) {
            const { error: redactError } = await supabaseAdmin
              .from('event_attendees')
              .update({
                name: '[redacted]',
                email: '[redacted]',
                meta: redactMeta(row.meta),
              })
              .eq('id', row.id);
            if (redactError) {
              console.error(`[cleanup] guest=${guestId} attendee=${row.id} redact failed: ${redactError.message}`);
            }
          }
          // Delete the auth user (cascades the hidden profiles row).
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(guestId);
          if (deleteError) {
            console.error(`[cleanup] guest=${guestId} deleteUser failed: ${deleteError.message}`);
            skipped++;
            continue;
          }
        }
        destroyed.push(guestId);
      } else if (now > blockAt) {
        // --- BLOCK: ban the auth user (~100 years). ---
        console.log(`[cleanup] guest=${guestId} action=block${dryRun ? '(dry-run)' : ''}`);
        if (!dryRun) {
          const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(guestId, {
            ban_duration: BAN_DURATION,
          });
          if (banError) {
            console.error(`[cleanup] guest=${guestId} ban failed: ${banError.message}`);
            skipped++;
            continue;
          }
        }
        blocked.push(guestId);
      } else {
        // Still active.
        skipped++;
      }
    }

    return jsonResponse({
      dry_run: dryRun,
      scanned,
      blocked,
      destroyed,
      skipped,
    });
  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: String(err) }, 500);
  }
});
