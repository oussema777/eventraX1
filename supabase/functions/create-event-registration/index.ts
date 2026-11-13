import { resolveRegistrationAccess } from '../_shared/registrationAccess.ts';
import { sendRegistrationReceipt, sendRegistrationCapacityAlert, notifyRegistrationOwner } from '../_shared/registrationReceipt.ts';
// supabase/functions/create-event-registration/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RegistrationPayload {
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  company_description: string;
  interests: string[];
  sector: string;
  social_url: string;
  b2b_opt_in: boolean;
  custom_fields?: Record<string, any>;
  ticket_type?: string;
  ticket_color?: string;
  price?: number;
  selected_sessions?: string[];
  redirect_base?: string;
  allow_pending_networking?: boolean;
}

function jsonResponse(body: Record<string, any>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
    const payload: RegistrationPayload = await req.json();
    const { event_id, full_name, phone, company_name, company_description,
            interests, sector, social_url, b2b_opt_in, custom_fields,
            ticket_type, ticket_color, price, selected_sessions } = payload;
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Invalid email address' }, 400);
    }

    // --- Validate event exists and is active ---
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, name, event_status, start_date, end_date, timezone, capacity_limit, owner_id, workshop_selection_limit, event_format, attendee_settings, access_code, location_address, is_public')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return jsonResponse({ error: 'Event not found' }, 404);
    }

    // Check current rules before creating accounts or editing profiles.
    // The database repeats these checks transactionally when selections are saved.
    if (selected_sessions !== undefined && (!Array.isArray(selected_sessions) || selected_sessions.some(id => typeof id !== 'string'))) {
      return jsonResponse({ error: 'Invalid session selection' }, 400);
    }
    const sessionIds = [...new Set(selected_sessions || [])];
    if (sessionIds.length) {
      const { data: chosen, error: sessionError } = await supabaseAdmin.from('event_sessions')
        .select('id, type, registration_open, status').eq('event_id', event_id).in('id', sessionIds);
      if (sessionError) return jsonResponse({ error: 'Unable to check sessions' }, 400);
      if (!chosen || chosen.length !== sessionIds.length || chosen.some(s => !s.registration_open || s.status === 'cancelled')) {
        return jsonResponse({ error: 'SESSION_REGISTRATION_CLOSED' }, 409);
      }
      if (event.workshop_selection_limit !== null && chosen.filter(s => s.type === 'workshop').length > event.workshop_selection_limit) {
        return jsonResponse({ error: 'WORKSHOP_SELECTION_LIMIT' }, 409);
      }
    }

    // Admission is independent of networking setup. Failed account setup is
    // persisted with the registration and retried by the access job worker.
    const access = await resolveRegistrationAccess(supabaseAdmin, { ...payload, email });
    const { userId, isNewUser } = access;
    const accessState = b2b_opt_in ? access.state : 'not_requested';
    // Older browser bundles cannot display saved-but-pending networking. Keep
    // their existing failure contract until the new frontend is deployed.
    if (b2b_opt_in && access.state !== 'ready' && payload.allow_pending_networking !== true) {
      return jsonResponse({ error: 'Unable to prepare registration account' }, 503);
    }

    // --- Compute guest expiry (new guests only: event end + 7 days) ---
    // Members (linked existing profiles) must never receive an expiry.
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
    const guestExpiresAt = (b2b_opt_in && isNewUser)
      ? new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // --- Generate confirmation code ---
    const confirmationCode = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // --- Build meta (all form data for audit + B2B matching) ---
    const meta: Record<string, any> = {
      ...(custom_fields || {}),
      fullName: full_name,
      email,
      phone,
      companyName: company_name,
      companyDescription: company_description,
      interests,
      sector,
      socialUrl: social_url,
      b2bOptIn: b2b_opt_in,
      b2bAccessStatus: accessState,
      confirmation_code: confirmationCode,

    };

    // --- Insert attendee and sessions atomically ---
    const { data: attendee, error: attendeeError } = await supabaseAdmin
      .rpc('create_event_attendee_with_sessions', { p_attendee: {
        event_id,
        profile_id: userId,
        email,
        name: full_name,
        ticket_type: ticket_type || 'General',
        ticket_color: ticket_color || null,
        price: price || 0,
        status: 'registered',
        guest_expires_at: guestExpiresAt,
        meta,
      }, p_session_ids: sessionIds });

    // Handle duplicate registration (unique constraint on email + event_id)
    if (attendeeError?.code === '23505') {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('event_attendees')
        .select('id, meta, profile_id')
        .eq('event_id', event_id)
        .eq('email', email)
        .single();

      if (existingError || !existing) return jsonResponse({ error: 'Unable to check existing registration' }, 503);
      // Repair registrations saved by the old database-only fallback. Only
      // attach an unlinked row; never replace a different participant identity.
      if (b2b_opt_in) {
        if (userId && existing.profile_id && existing.profile_id !== userId) {
          if (payload.allow_pending_networking !== true) return jsonResponse({ error: 'Registration account mismatch' }, 409);
          access.state = 'review';
        }
        const { data: linked, error: linkError } = await supabaseAdmin
          .from('event_attendees')
          .update({ ...(userId && (!existing.profile_id || existing.profile_id === userId) ? { profile_id: userId } : {}), meta: { ...existing.meta, b2bOptIn: true, b2bAccessStatus: access.state },
            ...(guestExpiresAt ? { guest_expires_at: guestExpiresAt } : {}) })
          .eq('id', existing.id)
          .or(`profile_id.is.null,profile_id.eq.${existing.profile_id || userId || '00000000-0000-0000-0000-000000000000'}`)
          .select('id')
          .single();
        if (linkError || !linked) return jsonResponse({ error: 'Unable to finish B2B access' }, 503);
      }

      const existingConfirmationCode = existing?.meta?.confirmation_code || confirmationCode;
      await notifyRegistrationOwner(supabaseAdmin,event,existing.id);
      const receipt = await sendRegistrationReceipt(supabaseAdmin, existing.id, event, key => Deno.env.get(key));
      const accessEmailSent = b2b_opt_in && access.state === 'ready' && !!userId && receipt === 'sent';

      return jsonResponse({
        success: true,
        attendee_id: existing?.id,
        confirmation_code: existingConfirmationCode,
        already_registered: true,
        user_id: access.state === 'ready' ? userId : null,
        b2b_access_status: b2b_opt_in ? access.state : 'not_requested',
        access_email_sent: accessEmailSent,
        confirmation_email_sent: receipt === 'sent', confirmation_email_skipped: receipt === 'skipped',
      });
    }

    if (attendeeError) {
      return jsonResponse({ error: 'Failed to register', details: attendeeError.message }, 500);
    }

    // Deliver the one-time token server-side. It must never enter a browser response.
    await notifyRegistrationOwner(supabaseAdmin,event,attendee.id);
    const receipt = await sendRegistrationReceipt(supabaseAdmin, attendee.id, event, key => Deno.env.get(key));
    const accessEmailSent = b2b_opt_in && !!userId && receipt === 'sent';

    await sendRegistrationCapacityAlert(supabaseAdmin, event, key => Deno.env.get(key));
    // --- Return success ---
    return jsonResponse({
      success: true,
      attendee_id: attendee.id,
      confirmation_code: confirmationCode,
      already_registered: false,
      is_new_user: isNewUser,
      user_id: userId,
      b2b_access_status: accessState,
      access_email_sent: accessEmailSent,
        confirmation_email_sent: receipt === 'sent', confirmation_email_skipped: receipt === 'skipped',
    });

  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: String(err) }, 500);
  }
});
