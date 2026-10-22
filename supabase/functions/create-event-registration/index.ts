import { renderOnlineEmail } from '../_shared/onlineExperience.ts';
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
}

function jsonResponse(body: Record<string, any>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, character => entities[character] || character);
}

async function sendB2BAccessEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  details: { email: string; name: string; eventName: string; eventId: string; attendeeId: string; confirmationCode: string; event: any },
): Promise<boolean> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const appOrigin = (Deno.env.get('EVENTRA_APP_ORIGIN') || 'https://eventra.cloud').replace(/\/$/, '');
  if (!resendKey || !/^https:\/\/[^/]+$/.test(appOrigin)) return false;
  const destination = `${appOrigin}/event/${encodeURIComponent(details.eventId)}/networking`;
  const redirectTo = `${appOrigin}/auth/callback?next=${encodeURIComponent(destination)}`;
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: details.email,
    options: { redirectTo },
  });
  if (error || !data?.properties?.action_link) return false;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(details.attendeeId)}`;
  const html = renderOnlineEmail(details.event, details.name, `${appOrigin}/event/${details.eventId}/access`, data.properties.action_link, qrUrl) || `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0B2641">
    <h1>You're registered for ${escapeHtml(details.eventName)}</h1>
    <p>Hi ${escapeHtml(details.name)}, your registration is confirmed. Your Eventra account is ready to use.</p>
    <p><a href="${escapeHtml(data.properties.action_link)}" style="display:inline-block;padding:14px 22px;background:#0684F5;color:#fff;border-radius:8px;text-decoration:none">Open your event and sign in</a></p>
    <p>This secure link signs you in directly. Your profile already includes the details you entered during registration. You can edit it, create a business profile, message participants, and arrange B2B meetings.</p>
    <p>If this link expires, open your event networking page and request a fresh sign-in link using this email address.</p>
    <p><a href="${escapeHtml(destination)}">Open event networking</a></p>
    <h2>Your check-in code</h2><p>${escapeHtml(details.confirmationCode)}</p>
    <img src="${escapeHtml(qrUrl)}" width="180" height="180" alt="Event check-in QR code" />
    <p>Keep this email for event day.</p>
  </div>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Eventra <contact@eventra.cloud>',
        to: [details.email],
        subject: `Registration confirmed + Eventra access: ${details.eventName}`,
        html,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
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
      .select('id, name, event_status, start_date, end_date, capacity_limit, owner_id, workshop_selection_limit, event_format, attendee_settings, access_code, location_address, is_public')
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

    // --- Resolve identity ---
    // Always look up an existing profile so registered members get linked
    // regardless of b2b_opt_in. New account creation is gated on b2b_opt_in.
    let userId: string | null = null;
    let isNewUser = false;

    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone_number, company, company_description, industry, sector, social_url')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (profileError) return jsonResponse({ error: 'Unable to check registration account' }, 503);

    if (existingProfile) {
      // Case 1 & 2: existing member — always link
      userId = existingProfile.id;

      if (b2b_opt_in) {
        // Enrich profile — fill empty fields only
        const updates: Record<string, any> = {};
        if (!existingProfile.full_name) updates.full_name = full_name;
        if (!existingProfile.phone_number) updates.phone_number = phone;
        if (!existingProfile.company) updates.company = company_name;
        if (!existingProfile.company_description) updates.company_description = company_description;
        if (!existingProfile.industry) updates.industry = sector;
        if (!existingProfile.sector) updates.sector = sector;
        if (!existingProfile.social_url) updates.social_url = social_url;
        // Note: interests is intentionally not written to profiles — there is no
        // profiles.interests column. Interests are persisted in event_attendees.meta
        // (below), which is where B2B matching reads them.

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
          if (updateError) return jsonResponse({ error: 'Unable to prepare registration profile' }, 503);
        }
      }
    } else if (b2b_opt_in) {
      // Case 3: no existing profile + opted in → create a new guest account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name, phone, company: company_name, created_via: 'event_b2b' },
        app_metadata: { account_type: 'event_guest' },
      });

      if (createError || !newUser?.user) {
        return jsonResponse({ error: 'Failed to create user', details: createError?.message }, 500);
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Upsert so profile prefill works even if the auth trigger is still pending.
      const { error: seedError } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email,
        full_name,
        phone_number: phone,
        company: company_name,
        company_description,
        industry: sector,
        sector,
        social_url,
        account_type: 'event_guest',
      }, { onConflict: 'id' });
      if (seedError) return jsonResponse({ error: 'Unable to prepare registration profile' }, 503);
    }
    // Case 4: no existing profile + not opted in → userId stays null, no account created

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
      fullName: full_name,
      email,
      phone,
      companyName: company_name,
      companyDescription: company_description,
      interests,
      sector,
      socialUrl: social_url,
      b2bOptIn: b2b_opt_in,
      confirmation_code: confirmationCode,
      ...custom_fields,
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
      if (b2b_opt_in && userId) {
        if (existing.profile_id && existing.profile_id !== userId) {
          return jsonResponse({ error: 'Registration account mismatch' }, 409);
        }
        const { data: linked, error: linkError } = await supabaseAdmin
          .from('event_attendees')
          .update({ profile_id: userId, meta: { ...existing.meta, b2bOptIn: true },
            ...(guestExpiresAt ? { guest_expires_at: guestExpiresAt } : {}) })
          .eq('id', existing.id)
          .or(`profile_id.is.null,profile_id.eq.${userId}`)
          .select('id')
          .single();
        if (linkError || !linked) return jsonResponse({ error: 'Unable to finish B2B access' }, 503);
      }

      const existingConfirmationCode = existing?.meta?.confirmation_code || confirmationCode;
      const accessEmailSent = b2b_opt_in && userId
        ? await sendB2BAccessEmail(supabaseAdmin, {
          email, name: full_name, eventName: event.name || 'Event', eventId: event_id,
          attendeeId: existing.id, confirmationCode: existingConfirmationCode, event,
        })
        : false;

      return jsonResponse({
        success: true,
        attendee_id: existing?.id,
        confirmation_code: existingConfirmationCode,
        already_registered: true,
        user_id: userId,
        access_email_sent: accessEmailSent,
      });
    }

    if (attendeeError) {
      return jsonResponse({ error: 'Failed to register', details: attendeeError.message }, 500);
    }

    // Deliver the one-time token server-side. It must never enter a browser response.
    const accessEmailSent = b2b_opt_in && userId
      ? await sendB2BAccessEmail(supabaseAdmin, {
        email, name: full_name, eventName: event.name || 'Event', eventId: event_id,
        attendeeId: attendee.id, confirmationCode, event,
      })
      : false;

    // --- Return success ---
    return jsonResponse({
      success: true,
      attendee_id: attendee.id,
      confirmation_code: confirmationCode,
      already_registered: false,
      is_new_user: isNewUser,
      user_id: userId,
      access_email_sent: accessEmailSent,
    });

  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: String(err) }, 500);
  }
});
