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
    const { event_id, email, full_name, phone, company_name, company_description,
            interests, sector, social_url, b2b_opt_in, custom_fields,
            ticket_type, ticket_color, price, selected_sessions, redirect_base } = payload;

    // --- Validate event exists and is active ---
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, name, event_status, start_date, end_date, capacity_limit, owner_id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return jsonResponse({ error: 'Event not found' }, 404);
    }

    // --- Check/create user (only when B2B opted in) ---
    let userId: string | null = null;
    let isNewUser = false;

    if (b2b_opt_in) {
      // Look up existing user by email in profiles table (indexed, scalable)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, phone_number, company, company_description, sector, social_url')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;

        // Enrich profile — fill empty fields only
        const updates: Record<string, any> = {};
        if (!existingProfile.phone_number) updates.phone_number = phone;
        if (!existingProfile.company) updates.company = company_name;
        if (!existingProfile.company_description) updates.company_description = company_description;
        if (!existingProfile.sector) updates.sector = sector;
        if (!existingProfile.social_url) updates.social_url = social_url;
        // Note: interests is intentionally not written to profiles — there is no
        // profiles.interests column. Interests are persisted in event_attendees.meta
        // (below), which is where B2B matching reads them.

        if (Object.keys(updates).length > 0) {
          await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
        }
      } else {
        // Create new user via admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name, phone, company: company_name },
          app_metadata: { account_type: 'event_guest' },
        });

        if (createError || !newUser?.user) {
          return jsonResponse({ error: 'Failed to create user', details: createError?.message }, 500);
        }

        userId = newUser.user.id;
        isNewUser = true;

        // Wait briefly for DB trigger to create profile row, then enrich
        await new Promise(resolve => setTimeout(resolve, 500));

        await supabaseAdmin.from('profiles').update({
          full_name,
          phone_number: phone,
          company: company_name,
          company_description,
          sector,
          social_url,
        }).eq('id', userId);
      }
    }

    // --- Compute guest expiry (opt-in only: event end + 7 days) ---
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
    const guestExpiresAt = b2b_opt_in
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

    // --- Insert event_attendees ---
    const { data: attendee, error: attendeeError } = await supabaseAdmin
      .from('event_attendees')
      .insert({
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
      })
      .select('id')
      .single();

    // Handle duplicate registration (unique constraint on email + event_id)
    if (attendeeError?.code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('event_attendees')
        .select('id, meta')
        .eq('event_id', event_id)
        .eq('email', email)
        .single();

      return jsonResponse({
        success: true,
        attendee_id: existing?.id,
        confirmation_code: existing?.meta?.confirmation_code || confirmationCode,
        already_registered: true,
        user_id: userId,
      });
    }

    if (attendeeError) {
      return jsonResponse({ error: 'Failed to register', details: attendeeError.message }, 500);
    }

    // --- Insert session selections ---
    if (selected_sessions && selected_sessions.length > 0) {
      const sessionRows = selected_sessions.map(sessionId => ({
        attendee_id: attendee.id,
        session_id: sessionId,
      }));
      await supabaseAdmin.from('event_attendee_sessions').insert(sessionRows);
    }

    // --- Generate magic link if B2B opted in ---
    let magicLink: string | null = null;
    if (b2b_opt_in) {
      // Supabase ignores relative redirectTo paths and falls back to the Site URL,
      // so we must pass a full, allow-listed URL. Use the caller's origin when
      // provided (works on localhost + production), else fall back to production.
      const base = (redirect_base || 'https://eventra.cloud').replace(/\/+$/, '');
      const redirectUrl = `${base}/event-auth?redirect=/event/${event_id}/networking`;
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: redirectUrl },
      });
      magicLink = linkData?.properties?.action_link || null;
    }

    // --- Return success ---
    return jsonResponse({
      success: true,
      attendee_id: attendee.id,
      confirmation_code: confirmationCode,
      already_registered: false,
      is_new_user: isNewUser,
      magic_link: magicLink,
      user_id: userId,
    });

  } catch (err) {
    return jsonResponse({ error: 'Internal error', details: String(err) }, 500);
  }
});
