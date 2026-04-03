import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function generateSignupInvitationEmailHtml(name: string, email: string, eventName: string): string {
  const signupUrl = `https://app.eventra.cloud/signup?email=${encodeURIComponent(email)}&ref=event-invite`

  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; padding: 40px 20px; background-color: #F9FAFB;">
      <div style="background-color: #FFFFFF; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #0684F5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Eventra</h2>
        </div>

        <h1 style="color: #111827; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 16px;">
          You're registered for ${eventName}!
        </h1>

        <p style="font-size: 16px; line-height: 1.6; color: #4B5563; text-align: center; margin-bottom: 32px;">
          Hi ${name || 'there'}, get the most out of your event experience by creating a free Eventra account.
        </p>

        <div style="background-color: #F3F4F6; padding: 28px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #E5E7EB;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; text-align: center;">Unlock these features</h3>
          <ul style="padding: 0; margin: 0; list-style: none; font-size: 14px; color: #4B5563;">
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f91d;</span>
              <div><strong style="color: #111827;">B2B Networking</strong><br/>Connect with other attendees and exhibitors at the event</div>
            </li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f4c5;</span>
              <div><strong style="color: #111827;">Meeting Scheduling</strong><br/>Book 1-on-1 meetings with other participants during the event</div>
            </li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x1f464;</span>
              <div><strong style="color: #111827;">Professional Profile</strong><br/>Get discovered by fellow attendees and exhibitors</div>
            </li>
            <li style="margin-bottom: 0; display: flex; align-items: flex-start;">
              <span style="color: #0684F5; margin-right: 10px; font-size: 18px;">&#x26a1;</span>
              <div><strong style="color: #111827;">Smart Check-in</strong><br/>Use your personal QR code for instant event check-in</div>
            </li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${signupUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Create Your Free Account</a>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #9CA3AF; text-align: center;">
          It only takes a minute. Your event registration stays active either way.
        </p>
      </div>

      <p style="margin-top: 32px; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
        &copy; 2026 Eventra.cloud. All rights reserved.<br/>
        You received this email because you registered for ${eventName}.<br/>
        <a href="https://eventra.cloud" style="color: #9CA3AF;">eventra.cloud</a>
      </p>
    </div>
  `
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
