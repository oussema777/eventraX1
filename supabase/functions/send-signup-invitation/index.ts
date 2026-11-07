import { renderBrandedNotice } from '../_shared/emailBrand.mjs'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function generateSignupInvitationEmailHtml(name: string, email: string, eventName: string): string {
  const signupUrl = `https://app.eventra.cloud/signup?email=${encodeURIComponent(email)}&ref=event-invite`
  return renderBrandedNotice({title:`You're registered for ${eventName}!`,body:`Hi ${name || 'there'}, create your Eventra profile to connect with attendees and prepare your meetings. Your event registration stays active either way.`,url:signupUrl,action:'Create my account',category:'YOUR EVENT EXPERIENCE',details:[['B2B networking','Connect with attendees and exhibitors.'],['Meeting scheduling','Arrange one-to-one conversations during the event.'],['Professional profile','Help other participants discover your business.'],['Smart check-in','Keep your personal QR code ready for the entrance.']]})
}

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eventra <contact@eventra.cloud>',
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error(`[INVITATION] Resend error for ${to}:`, err)
      return false
    }

    const data = await res.json()
    console.log(`[INVITATION] Email sent to ${to}, id: ${data.id}`)
    return true
  } catch (error) {
    console.error(`[INVITATION] Failed to send to ${to}:`, error)
    return false
  }
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Get eligible anonymous registrants
    const { data: registrants, error: rpcError } = await supabase.rpc('get_eligible_anonymous_registrants')

    if (rpcError) {
      console.error('[INVITATION] RPC error:', rpcError)
      return new Response(JSON.stringify({ error: rpcError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, message: 'No eligible registrants' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    console.log(`[INVITATION] Found ${registrants.length} eligible registrants`)

    let sent = 0
    let failed = 0

    for (const reg of registrants) {
      // 2. Claim: insert with conflict handling to prevent duplicates
      const { data: claimed, error: claimError } = await supabase
        .from('anonymous_signup_invitations')
        .insert({ email: reg.email, event_id: reg.event_id, event_name: reg.event_name, status: 'pending' })
        .select('id')
        .single()

      if (claimError) {
        if (claimError.code === '23505') {
          console.log(`[INVITATION] Already claimed: ${reg.email}`)
          continue
        }
        console.error(`[INVITATION] Claim error for ${reg.email}:`, claimError)
        continue
      }

      // 3. Send email
      const subject = `Get more from ${reg.event_name} — Create your free Eventra account`
      const html = generateSignupInvitationEmailHtml(reg.name, reg.email, reg.event_name)
      const success = await sendEmailViaResend(reg.email, subject, html)

      // 4. Update status
      if (success) {
        await supabase.from('anonymous_signup_invitations').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', claimed.id)
        sent++
      } else {
        await supabase.from('anonymous_signup_invitations').update({ status: 'failed' }).eq('id', claimed.id)
        failed++
      }
    }

    console.log(`[INVITATION] Done. Sent: ${sent}, Failed: ${failed}`)
    return new Response(JSON.stringify({ sent, failed }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[INVITATION] Unexpected error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
