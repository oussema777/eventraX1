import { escapeHTML } from '../utils/security';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    const isLocal = window.location.hostname === 'localhost';
    const endpoint = isLocal ? 'http://localhost:5001/send-email' : '/api/send-email';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, subject, html })
    });

    if (!res.ok) {
      return false;
    }

    await res.json();
    return true;
  } catch {
    return false;
  }
}

export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[], isAnonymous: boolean = false, magicLink?: string | null) {
  const safeEventName = escapeHTML(eventName);
  const safeAttendeeName = escapeHTML(attendeeName);

  const sessionList = (sessions || []).map(s =>
    `<li style="margin-bottom: 8px;">
       <strong>${escapeHTML(s.title)}</strong><br/>
       <span style="font-size: 12px; color: #666;">${s.starts_at ? new Date(s.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'} - ${escapeHTML(s.location || 'Main Hall')}</span>
     </li>`
  ).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: #0B2641;">You're going to ${safeEventName}!</h1>
      <p>Hi ${safeAttendeeName},</p>
      <p>Thanks for registering. Here is your recap and check-in details.</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #E5E7EB;">
        <p style="margin-bottom: 10px; font-weight: bold; color: #000000;">Your Check-in QR Code</p>
        <img src="${qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; background: white; padding: 10px; border-radius: 4px;" />
        <p style="font-size: 12px; color: #4B5563; margin-top: 10px;">Show this code at the entrance.</p>
      </div>

      ${(sessions || []).length > 0 ? `
        <h3 style="border-bottom: 2px solid #0B2641; padding-bottom: 8px; color: #0B2641;">Your Selected Agenda</h3>
        <ul style="padding-left: 20px; list-style-type: none;">
          ${sessionList}
        </ul>
      ` : ''}

      ${magicLink ? `
      <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #EFF6FF, #F0F9FF); border-radius: 12px; text-align: center; border: 1px solid #BFDBFE;">
        <h3 style="margin-top: 0; margin-bottom: 8px; color: #0B2641; font-size: 16px;">🤝 B2B Networking Access</h3>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px; line-height: 1.5;">
          You opted in for B2B matchmaking. Click below to access your networking dashboard and discover your matches.
        </p>
        <a href="${magicLink}" style="display: inline-block; padding: 12px 28px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Access B2B Networking
        </a>
      </div>
      ` : ''}

      ${isAnonymous ? `
      <div style="background: linear-gradient(135deg, #EFF6FF, #F0F9FF); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #BFDBFE;">
        <h3 style="margin-top: 0; margin-bottom: 12px; color: #0B2641; font-size: 16px;">Get more from this event</h3>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">
          Create a free Eventra account to unlock powerful networking features:
        </p>
        <ul style="padding: 0; margin: 0 0 20px 0; list-style: none; font-size: 13px; color: #4B5563;">
          <li style="margin-bottom: 8px;">&#x1f91d; <strong>B2B Networking</strong> — Connect with attendees & exhibitors</li>
          <li style="margin-bottom: 8px;">&#x1f4c5; <strong>Meeting Scheduling</strong> — Book 1-on-1 meetings at the event</li>
          <li style="margin-bottom: 8px;">&#x1f464; <strong>Professional Profile</strong> — Get discovered by other participants</li>
          <li style="margin-bottom: 0;">&#x26a1; <strong>Smart Check-in</strong> — Your personal QR code for instant access</li>
        </ul>
        <div style="text-align: center;">
          <a href="https://app.eventra.cloud/signup" style="display: inline-block; padding: 12px 28px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Create Your Free Account</a>
        </div>
      </div>
      ` : ''}

      <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF; text-align: center;">
        Sent via Eventra Platform
      </p>
    </div>
  `;
}

export function generateWelcomeEmailHtml(params: {
  userName: string;
  profileUrl: string;
  qrCodeUrl: string;
}) {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; padding: 40px 20px; background-color: #F9FAFB;">
      <div style="background-color: #FFFFFF; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #E5E7EB;">
        <!-- Logo placeholder if any -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #0684F5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Eventra</h2>
        </div>

        <h1 style="color: #111827; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 16px;">Welcome to the community, ${escapeHTML(params.userName)}!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4B5563; text-align: center; margin-bottom: 32px;">
          We're excited to have you on board. Your professional profile is now live and ready for networking.
        </p>
        
        <div style="background-color: #F3F4F6; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px; border: 1px dashed #D1D5DB;">
          <p style="margin-top: 0; margin-bottom: 16px; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Digital Business Card</p>
          <div style="display: inline-block; padding: 12px; background: white; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <img src="${params.qrCodeUrl}" alt="Profile QR Code" style="width: 180px; height: 180px; display: block;" />
          </div>
          <p style="font-size: 13px; color: #6B7280; margin-top: 20px; line-height: 1.5;">
            Others can scan this code to view your public profile and schedule meetings with you.
          </p>
          <div style="margin-top: 24px;">
            <a href="${params.profileUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">View Your Profile</a>
          </div>
        </div>

        <div style="border-top: 1px solid #E5E7EB; pt: 32px; margin-top: 32px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px;">What's next?</h3>
          <ul style="padding: 0; margin: 0; list-style: none; font-size: 14px; color: #4B5563;">
            <li style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="color: #0684F5; margin-right: 8px;">•</span> Explore upcoming events in your sector
            </li>
            <li style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="color: #0684F5; margin-right: 8px;">•</span> Connect with industry peers
            </li>
            <li style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="color: #0684F5; margin-right: 8px;">•</span> Manage your B2B meetings
            </li>
          </ul>
        </div>
      </div>
      
      <p style="margin-top: 32px; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
        © 2026 Eventra.cloud. All rights reserved.<br/>
        This email was sent to you as part of your registration on Eventra.
      </p>
    </div>
  `;
}

export async function sendWelcomeEmail(to: string, userName: string, userId: string): Promise<boolean> {
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/profile/${userId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(profileUrl)}&size=250x250&bgcolor=ffffff&color=0684F5&margin=10`;
  
  const html = generateWelcomeEmailHtml({
    userName,
    profileUrl,
    qrCodeUrl
  });

  return sendEmail({
    to,
    subject: `Welcome to Eventra, ${escapeHTML(userName)}!`,
    html
  });
}

export async function sendMeetingConfirmationEmails(params: {
  organizerEmail: string;
  organizerName: string;
  recipientEmail: string;
  recipientName: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  eventName: string;
  meetingId: string;
  status: 'pending' | 'confirmed';
  videoUrl?: string;
}) {
  const meetingUrl = `${window.location.origin}/my-networking?meetingId=${params.meetingId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(meetingUrl)}&size=250x250&bgcolor=ffffff&color=0684F5&margin=10`;

  const commonParams = {
    eventName: params.eventName,
    meetingDate: params.meetingDate,
    meetingTime: params.meetingTime,
    location: params.location,
    organizerName: params.organizerName,
    recipientName: params.recipientName,
    qrCodeUrl,
    status: params.status,
    videoUrl: params.videoUrl
  };

  const safeRecipientName = escapeHTML(params.recipientName);
  const safeEventName = escapeHTML(params.eventName);

  const orgSubject = params.status === 'pending'
    ? `Meeting Request: ${safeRecipientName} at ${safeEventName}`
    : `Meeting Confirmed: ${safeRecipientName} at ${safeEventName}`;

  const recSubject = params.status === 'pending'
    ? `New Meeting Request for ${safeEventName}`
    : `Meeting Confirmed for ${safeEventName}`;

  // Send to Organizer
  const organizerHtml = generateMeetingConfirmationEmailHtml({ ...commonParams, role: 'organizer' });
  const organizerSent = sendEmail({
    to: params.organizerEmail,
    subject: orgSubject,
    html: organizerHtml
  });

  // Send to Recipient
  const recipientHtml = generateMeetingConfirmationEmailHtml({ ...commonParams, role: 'recipient' });
  const recipientSent = sendEmail({
    to: params.recipientEmail,
    subject: recSubject,
    html: recipientHtml
  });

  return Promise.all([organizerSent, recipientSent]);
}

// ─── EMAIL WRAPPER ───────────────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; padding: 40px 20px; background-color: #F9FAFB;">
  <div style="background-color: #FFFFFF; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #E5E7EB;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="color: #0684F5; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Eventra</span>
    </div>
    ${content}
  </div>
  <p style="margin-top: 24px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5;">
    &copy; 2026 Eventra.cloud. All rights reserved.<br/>You received this email because you are registered on Eventra.
  </p>
</div>`;
}

function detailRow(label: string, value: string, valueStyle = ''): string {
  return `<tr><td style="padding:8px 0;color:#64748B;width:120px;font-size:13px;">${label}</td><td style="padding:8px 0;font-weight:600;font-size:13px;${valueStyle}">${value}</td></tr>`;
}

function detailBox(rows: string): string {
  return `<div style="background:#F8FAFC;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #E2E8F0;">
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  </div>`;
}

function ctaButton(text: string, url: string, color = '#0684F5'): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:12px 28px;background-color:${color};color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text}</a>
  </div>`;
}

function qrBox(qrUrl: string, caption: string): string {
  return `<div style="background:#F3F4F6;padding:24px;border-radius:12px;text-align:center;margin:20px 0;border:1px solid #E5E7EB;">
    <div style="display:inline-block;padding:12px;background:white;border-radius:12px;box-shadow:0 4px 8px rgba(0,0,0,0.08);">
      <img src="${qrUrl}" alt="QR Code" style="width:180px;height:180px;display:block;" />
    </div>
    <p style="font-size:12px;color:#6B7280;margin-top:12px;">${caption}</p>
  </div>`;
}

function footerLine(text: string): string {
  return `<p style="margin-top:32px;font-size:11px;color:#94A3B8;text-align:center;border-top:1px solid #F1F5F9;padding-top:16px;">${text}</p>`;
}

// ─── EVENT APPROVED (#2) ─────────────────────────────────────────────────────
export function generateEventApprovedEmailHtml(params: {
  organizerName: string;
  eventName: string;
  startDate: string;
  endDate: string;
  eventFormat: string;
  eventUrl: string;
}) {
  const safeName = escapeHTML(params.organizerName);
  const safeEvent = escapeHTML(params.eventName);
  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Your event is now live!</h1>
    <p>Hi ${safeName},</p>
    <p>Great news &mdash; <strong>${safeEvent}</strong> has been reviewed and approved. It is now publicly visible on Eventra and open for registrations.</p>
    ${detailBox(
      detailRow('Event:', safeEvent) +
      detailRow('Status:', '<span style="background:#ECFDF5;color:#065F46;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">APPROVED</span>') +
      detailRow('Dates:', `${escapeHTML(params.startDate)} &mdash; ${escapeHTML(params.endDate)}`) +
      detailRow('Format:', escapeHTML(params.eventFormat))
    )}
    ${ctaButton('View Your Event', params.eventUrl, '#10B981')}
    <p style="font-size:13px;color:#4B5563;">Share the link with your network and start building your attendee list!</p>
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendEventApprovedEmail(to: string, params: {
  organizerName: string;
  eventName: string;
  startDate: string;
  endDate: string;
  eventFormat: string;
  eventId: string;
}) {
  const eventUrl = `${window.location.origin}/event/${params.eventId}`;
  return sendEmail({
    to,
    subject: `Your event is live: ${escapeHTML(params.eventName)}`,
    html: generateEventApprovedEmailHtml({ ...params, eventUrl })
  });
}

// ─── EVENT NOT APPROVED (#3) ─────────────────────────────────────────────────
export function generateEventRejectedEmailHtml(params: {
  organizerName: string;
  eventName: string;
  rejectionReason: string;
  editUrl: string;
}) {
  const safeName = escapeHTML(params.organizerName);
  const safeEvent = escapeHTML(params.eventName);
  return emailWrapper(`
    <h1 style="color:#EF4444;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Event not approved</h1>
    <p>Hi ${safeName},</p>
    <p>Unfortunately, <strong>${safeEvent}</strong> was not approved after review. Please check the details below and resubmit.</p>
    <div style="background:#FEF2F2;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #FECACA;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Event:', safeEvent)}
        ${detailRow('Status:', '<span style="background:#FEF2F2;color:#991B1B;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">NOT APPROVED</span>')}
        ${detailRow('Reason:', escapeHTML(params.rejectionReason), 'color:#991B1B;')}
      </table>
    </div>
    ${ctaButton('Edit &amp; Resubmit', params.editUrl)}
    <p style="font-size:13px;color:#6B7280;">If you believe this was a mistake, please contact our support team.</p>
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendEventRejectedEmail(to: string, params: {
  organizerName: string;
  eventName: string;
  rejectionReason: string;
  eventId: string;
}) {
  const editUrl = `${window.location.origin}/create/details/${params.eventId}`;
  return sendEmail({
    to,
    subject: `Action required: ${escapeHTML(params.eventName)} was not approved`,
    html: generateEventRejectedEmailHtml({ ...params, editUrl })
  });
}

// ─── REGISTRATION CANCELLED (#5) ────────────────────────────────────────────
export function generateRegistrationCancelledEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#6B7280;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Registration cancelled</h1>
    <p>Hi ${escapeHTML(params.attendeeName)},</p>
    <p>Your registration for <strong>${escapeHTML(params.eventName)}</strong> has been cancelled as requested.</p>
    ${detailBox(
      detailRow('Event:', escapeHTML(params.eventName)) +
      detailRow('Date:', escapeHTML(params.eventDate)) +
      detailRow('Status:', '<span style="background:#F3F4F6;color:#374151;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">CANCELLED</span>')
    )}
    <p style="font-size:13px;color:#4B5563;">Changed your mind? You can register again any time before the event starts.</p>
    ${ctaButton('Re-register', params.eventUrl)}
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendRegistrationCancelledEmail(to: string, params: {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  eventId: string;
}) {
  const eventUrl = `${window.location.origin}/event/${params.eventId}`;
  return sendEmail({
    to,
    subject: `Registration Cancelled: ${escapeHTML(params.eventName)}`,
    html: generateRegistrationCancelledEmailHtml({ ...params, eventUrl })
  });
}

// ─── WAITLIST JOINED (#6) ───────────────────────────────────────────────────
export function generateWaitlistJoinedEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  position: number;
}) {
  return emailWrapper(`
    <h1 style="color:#F59E0B;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">You're on the waitlist</h1>
    <p>Hi ${escapeHTML(params.attendeeName)},</p>
    <p><strong>${escapeHTML(params.eventName)}</strong> is currently at full capacity. You have been placed on the waitlist.</p>
    <div style="background:#FFFBEB;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #FDE68A;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Event:', escapeHTML(params.eventName))}
        ${detailRow('Date:', escapeHTML(params.eventDate))}
        ${detailRow('Your Position:', `<span style="color:#F59E0B;font-size:20px;font-weight:800;">#${params.position}</span>`)}
      </table>
    </div>
    <p style="font-size:13px;color:#4B5563;">We'll notify you immediately if a spot opens up. No action needed on your end.</p>
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendWaitlistJoinedEmail(to: string, params: {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  position: number;
}) {
  return sendEmail({
    to,
    subject: `You're on the waitlist: ${escapeHTML(params.eventName)}`,
    html: generateWaitlistJoinedEmailHtml(params)
  });
}

// ─── WAITLIST PROMOTED (#7) ─────────────────────────────────────────────────
export function generateWaitlistPromotedEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  qrCodeUrl: string;
  eventUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">You're in!</h1>
    <p>Hi ${escapeHTML(params.attendeeName)},</p>
    <p>Great news! A spot opened up for <strong>${escapeHTML(params.eventName)}</strong> and you've been moved from the waitlist to confirmed.</p>
    ${qrBox(params.qrCodeUrl, 'Show this code at the entrance.')}
    ${ctaButton('View Event Details', params.eventUrl, '#10B981')}
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendWaitlistPromotedEmail(to: string, params: {
  attendeeName: string;
  eventName: string;
  eventId: string;
  registrationId: string;
}) {
  const eventUrl = `${window.location.origin}/event/${params.eventId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${window.location.origin}/checkin/${params.registrationId}`)}&size=250x250&bgcolor=ffffff&color=0684F5&margin=10`;
  return sendEmail({
    to,
    subject: `A spot opened up! You're in: ${escapeHTML(params.eventName)}`,
    html: generateWaitlistPromotedEmailHtml({ ...params, qrCodeUrl, eventUrl })
  });
}

// ─── EVENT REMINDER (#8) ────────────────────────────────────────────────────
export function generateEventReminderEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  startDate: string;
  startTime: string;
  location: string;
  qrCodeUrl: string;
  agendaUrl: string;
  timeframe: '24h' | '1h';
}) {
  const headline = params.timeframe === '24h'
    ? `${escapeHTML(params.eventName)} starts tomorrow!`
    : `${escapeHTML(params.eventName)} begins in 1 hour!`;
  return emailWrapper(`
    <h1 style="color:#0684F5;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">${headline}</h1>
    <p>Hi ${escapeHTML(params.attendeeName)},</p>
    <p>This is a friendly reminder that <strong>${escapeHTML(params.eventName)}</strong> is starting soon.</p>
    ${detailBox(
      detailRow('Event:', escapeHTML(params.eventName)) +
      detailRow('Date:', escapeHTML(params.startDate)) +
      detailRow('Time:', escapeHTML(params.startTime)) +
      detailRow('Location:', escapeHTML(params.location))
    )}
    ${qrBox(params.qrCodeUrl, 'Have this ready for quick entry.')}
    ${ctaButton('View Your Agenda', params.agendaUrl)}
    ${footerLine('Sent via Eventra Platform')}
  `);
}

// ─── MEETING CANCELLED (#11) ────────────────────────────────────────────────
export function generateMeetingCancelledEmailHtml(params: {
  recipientName: string;
  cancellerName: string;
  eventName: string;
  meetingDate: string;
  meetingTime: string;
  networkingUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#EF4444;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Meeting Cancelled</h1>
    <p>Hi ${escapeHTML(params.recipientName)},</p>
    <p>Unfortunately, your meeting with <strong>${escapeHTML(params.cancellerName)}</strong> for <strong>${escapeHTML(params.eventName)}</strong> has been cancelled.</p>
    <div style="background:#FEF2F2;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #FECACA;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Meeting with:', escapeHTML(params.cancellerName))}
        ${detailRow('Was scheduled:', `${escapeHTML(params.meetingDate)} at ${escapeHTML(params.meetingTime)}`)}
        ${detailRow('Status:', '<span style="background:#F3F4F6;color:#374151;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">CANCELLED</span>')}
      </table>
    </div>
    <p style="font-size:13px;color:#4B5563;">You can schedule new meetings from your Networking Dashboard.</p>
    ${ctaButton('Browse Available Slots', params.networkingUrl)}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

export async function sendMeetingCancelledEmail(to: string, params: {
  recipientName: string;
  cancellerName: string;
  eventName: string;
  meetingDate: string;
  meetingTime: string;
}) {
  const networkingUrl = `${window.location.origin}/my-networking`;
  return sendEmail({
    to,
    subject: `Meeting Cancelled: ${escapeHTML(params.cancellerName)} at ${escapeHTML(params.eventName)}`,
    html: generateMeetingCancelledEmailHtml({ ...params, networkingUrl })
  });
}

// ─── MEETING RESCHEDULED (#12) ──────────────────────────────────────────────
export function generateMeetingRescheduledEmailHtml(params: {
  recipientName: string;
  reschedulerName: string;
  eventName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  location: string;
  networkingUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#F59E0B;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Meeting Rescheduled</h1>
    <p>Hi ${escapeHTML(params.recipientName)},</p>
    <p><strong>${escapeHTML(params.reschedulerName)}</strong> has rescheduled your meeting for <strong>${escapeHTML(params.eventName)}</strong>.</p>
    ${detailBox(
      detailRow('Previous:', `<span style="text-decoration:line-through;color:#9CA3AF;">${escapeHTML(params.oldDate)} at ${escapeHTML(params.oldTime)}</span>`) +
      detailRow('New Date:', escapeHTML(params.newDate), 'color:#0684F5;') +
      detailRow('New Time:', escapeHTML(params.newTime), 'color:#0684F5;') +
      detailRow('Location:', escapeHTML(params.location))
    )}
    ${ctaButton('View Meeting Details', params.networkingUrl)}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

export async function sendMeetingRescheduledEmail(to: string, params: {
  recipientName: string;
  reschedulerName: string;
  eventName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  location: string;
}) {
  const networkingUrl = `${window.location.origin}/my-networking`;
  return sendEmail({
    to,
    subject: `Meeting Rescheduled: ${escapeHTML(params.reschedulerName)} at ${escapeHTML(params.eventName)}`,
    html: generateMeetingRescheduledEmailHtml({ ...params, networkingUrl })
  });
}

// ─── MEETING REMINDER (#13) ────────────────────────────────────────────────
export function generateMeetingReminderEmailHtml(params: {
  userName: string;
  partnerName: string;
  meetingTime: string;
  location: string;
  qrCodeUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#0684F5;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Your meeting is in 30 minutes</h1>
    <p>Hi ${escapeHTML(params.userName)},</p>
    <p>Quick reminder &mdash; your B2B meeting with <strong>${escapeHTML(params.partnerName)}</strong> is coming up soon.</p>
    ${detailBox(
      detailRow('With:', escapeHTML(params.partnerName)) +
      detailRow('Time:', escapeHTML(params.meetingTime), 'color:#0684F5;font-size:16px;') +
      detailRow('Location:', escapeHTML(params.location))
    )}
    ${qrBox(params.qrCodeUrl, 'Scan at the meeting table to check in.')}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

// ─── MEETING CHECK-IN ALERT (#14) ──────────────────────────────────────────
export function generateMeetingCheckinAlertEmailHtml(params: {
  recipientName: string;
  partnerName: string;
  meetingTime: string;
  location: string;
  checkinTime: string;
  qrCodeUrl: string;
  eventName: string;
}) {
  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">${escapeHTML(params.partnerName)} is waiting for you!</h1>
    <p>Hi ${escapeHTML(params.recipientName)},</p>
    <p><strong>${escapeHTML(params.partnerName)}</strong> has arrived and checked in for your meeting. They're ready and waiting at the meeting point.</p>
    <div style="background:#ECFDF5;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #A7F3D0;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Meeting with:', escapeHTML(params.partnerName), 'font-size:16px;')}
        ${detailRow('Time:', escapeHTML(params.meetingTime))}
        ${detailRow('Location:', escapeHTML(params.location), 'color:#065F46;font-size:15px;')}
        ${detailRow('Checked in at:', escapeHTML(params.checkinTime))}
      </table>
    </div>
    ${qrBox(params.qrCodeUrl, 'Scan this when you arrive at the meeting table.')}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

export async function sendMeetingCheckinAlertEmail(to: string, params: {
  recipientName: string;
  partnerName: string;
  meetingTime: string;
  location: string;
  checkinTime: string;
  meetingId: string;
  eventName: string;
}) {
  const meetingUrl = `${window.location.origin}/my-networking?meetingId=${params.meetingId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(meetingUrl)}&size=250x250&bgcolor=ffffff&color=0684F5&margin=10`;
  return sendEmail({
    to,
    subject: `${escapeHTML(params.partnerName)} is waiting for you — ${escapeHTML(params.eventName)}`,
    html: generateMeetingCheckinAlertEmailHtml({ ...params, qrCodeUrl })
  });
}

// ─── CONNECTION REQUEST (#15) ───────────────────────────────────────────────
export function generateConnectionRequestEmailHtml(params: {
  recipientName: string;
  senderName: string;
  senderJobTitle: string;
  senderOrganization: string;
  networkingUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#0684F5;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">New Connection Request</h1>
    <p>Hi ${escapeHTML(params.recipientName)},</p>
    <p><strong>${escapeHTML(params.senderName)}</strong> (${escapeHTML(params.senderJobTitle)} at ${escapeHTML(params.senderOrganization)}) wants to connect with you on Eventra.</p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
      <div style="width:64px;height:64px;border-radius:50%;background:#D1D5DB;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <span style="color:#6B7280;font-size:24px;font-weight:700;">${escapeHTML(params.senderName.charAt(0))}</span>
      </div>
      <p style="font-weight:700;color:#0B2641;margin:0 0 4px;">${escapeHTML(params.senderName)}</p>
      <p style="font-size:12px;color:#6B7280;margin:0;">${escapeHTML(params.senderJobTitle)} &middot; ${escapeHTML(params.senderOrganization)}</p>
    </div>
    ${ctaButton('View Request', params.networkingUrl)}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

export async function sendConnectionRequestEmail(to: string, params: {
  recipientName: string;
  senderName: string;
  senderJobTitle: string;
  senderOrganization: string;
}) {
  const networkingUrl = `${window.location.origin}/my-networking`;
  return sendEmail({
    to,
    subject: `${escapeHTML(params.senderName)} wants to connect with you on Eventra`,
    html: generateConnectionRequestEmailHtml({ ...params, networkingUrl })
  });
}

// ─── CONNECTION ACCEPTED (#16) ──────────────────────────────────────────────
export function generateConnectionAcceptedEmailHtml(params: {
  requesterName: string;
  accepterName: string;
  networkingUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">You're now connected!</h1>
    <p>Hi ${escapeHTML(params.requesterName)},</p>
    <p><strong>${escapeHTML(params.accepterName)}</strong> accepted your connection request. You can now schedule B2B meetings together.</p>
    ${ctaButton('Schedule a Meeting', params.networkingUrl)}
    ${footerLine('Sent via Eventra Networking Engine')}
  `);
}

export async function sendConnectionAcceptedEmail(to: string, params: {
  requesterName: string;
  accepterName: string;
}) {
  const networkingUrl = `${window.location.origin}/my-networking`;
  return sendEmail({
    to,
    subject: `${escapeHTML(params.accepterName)} accepted your connection request`,
    html: generateConnectionAcceptedEmailHtml({ ...params, networkingUrl })
  });
}

// ─── QUOTE REQUEST (#17) ───────────────────────────────────────────────────
export function generateQuoteRequestEmailHtml(params: {
  sellerName: string;
  buyerName: string;
  buyerOrganization: string;
  productName: string;
  quoteMessage: string;
  dashboardUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#0684F5;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">New Quote Request</h1>
    <p>Hi ${escapeHTML(params.sellerName)},</p>
    <p><strong>${escapeHTML(params.buyerName)}</strong> (${escapeHTML(params.buyerOrganization)}) has requested a quote for your listing:</p>
    ${detailBox(
      detailRow('Product:', escapeHTML(params.productName)) +
      detailRow('Buyer:', `${escapeHTML(params.buyerName)} &mdash; ${escapeHTML(params.buyerOrganization)}`) +
      detailRow('Message:', `<em style="color:#4B5563;">"${escapeHTML(params.quoteMessage)}"</em>`)
    )}
    ${ctaButton('Respond to Quote', params.dashboardUrl)}
    ${footerLine('Sent via Eventra Marketplace')}
  `);
}

export async function sendQuoteRequestEmail(to: string, params: {
  sellerName: string;
  buyerName: string;
  buyerOrganization: string;
  productName: string;
  quoteMessage: string;
}) {
  const dashboardUrl = `${window.location.origin}/business/dashboard`;
  return sendEmail({
    to,
    subject: `New quote request for ${escapeHTML(params.productName)}`,
    html: generateQuoteRequestEmailHtml({ ...params, dashboardUrl })
  });
}

// ─── QUOTE RESPONSE (#18) ──────────────────────────────────────────────────
export function generateQuoteResponseEmailHtml(params: {
  buyerName: string;
  sellerName: string;
  sellerOrganization: string;
  productName: string;
  quoteResponse: string;
  productUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">You received a quote!</h1>
    <p>Hi ${escapeHTML(params.buyerName)},</p>
    <p><strong>${escapeHTML(params.sellerName)}</strong> (${escapeHTML(params.sellerOrganization)}) has responded to your quote request for <strong>${escapeHTML(params.productName)}</strong>.</p>
    <div style="background:#ECFDF5;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #A7F3D0;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Product:', escapeHTML(params.productName))}
        ${detailRow('Seller:', `${escapeHTML(params.sellerName)} &mdash; ${escapeHTML(params.sellerOrganization)}`)}
        ${detailRow('Response:', `<em style="color:#065F46;">"${escapeHTML(params.quoteResponse)}"</em>`)}
      </table>
    </div>
    ${ctaButton('View Full Details', params.productUrl)}
    ${footerLine('Sent via Eventra Marketplace')}
  `);
}

export async function sendQuoteResponseEmail(to: string, params: {
  buyerName: string;
  sellerName: string;
  sellerOrganization: string;
  productName: string;
  quoteResponse: string;
  productId: string;
}) {
  const productUrl = `${window.location.origin}/marketplace/product/${params.productId}`;
  return sendEmail({
    to,
    subject: `Quote response for ${escapeHTML(params.productName)}`,
    html: generateQuoteResponseEmailHtml({ ...params, productUrl })
  });
}

// ─── CAPACITY ALERT (#19) ──────────────────────────────────────────────────
export function generateCapacityAlertEmailHtml(params: {
  organizerName: string;
  eventName: string;
  currentRegistrations: number;
  maxCapacity: number;
  percentage: number;
  settingsUrl: string;
}) {
  const isSoldOut = params.percentage >= 100;
  const accentColor = isSoldOut ? '#EF4444' : '#F59E0B';
  const headline = isSoldOut ? 'Your event is SOLD OUT!' : 'Your event is filling up!';
  return emailWrapper(`
    <h1 style="color:${accentColor};font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">${headline}</h1>
    <p>Hi ${escapeHTML(params.organizerName)},</p>
    <p><strong>${escapeHTML(params.eventName)}</strong> has reached <strong>${params.percentage}%</strong> of its capacity.</p>
    <div style="background:${isSoldOut ? '#FEF2F2' : '#FFFBEB'};padding:24px;border-radius:12px;margin:20px 0;border:1px solid ${isSoldOut ? '#FECACA' : '#FDE68A'};text-align:center;">
      <div style="font-size:48px;font-weight:800;color:${accentColor};">${params.currentRegistrations}/${params.maxCapacity}</div>
      <p style="font-size:13px;color:${isSoldOut ? '#991B1B' : '#92400E'};margin-top:4px;">registered attendees</p>
      <div style="background:${isSoldOut ? '#FECACA' : '#FDE68A'};border-radius:20px;height:12px;margin:16px 0;overflow:hidden;">
        <div style="background:${accentColor};height:100%;width:${Math.min(params.percentage, 100)}%;border-radius:20px;"></div>
      </div>
    </div>
    ${!isSoldOut ? '<p style="font-size:13px;color:#4B5563;">Consider increasing capacity or enabling the waitlist if you haven\'t already.</p>' : '<p style="font-size:13px;color:#4B5563;">Congratulations! Consider enabling the waitlist to capture additional interest.</p>'}
    ${ctaButton('Manage Event Settings', params.settingsUrl)}
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendCapacityAlertEmail(to: string, params: {
  organizerName: string;
  eventName: string;
  currentRegistrations: number;
  maxCapacity: number;
  eventId: string;
}) {
  const percentage = Math.round((params.currentRegistrations / params.maxCapacity) * 100);
  const settingsUrl = `${window.location.origin}/manage-event/${params.eventId}`;
  const isSoldOut = percentage >= 100;
  return sendEmail({
    to,
    subject: isSoldOut
      ? `${escapeHTML(params.eventName)} is SOLD OUT!`
      : `${escapeHTML(params.eventName)} is filling up — ${percentage}% capacity reached`,
    html: generateCapacityAlertEmailHtml({ ...params, percentage, settingsUrl })
  });
}

// ─── POST-EVENT SUMMARY (#20) ──────────────────────────────────────────────
export function generatePostEventSummaryEmailHtml(params: {
  organizerName: string;
  eventName: string;
  totalRegistrations: number;
  totalCheckins: number;
  totalMeetings: number;
  attendanceRate: number;
  sessionsCount: number;
  connectionsCount: number;
  formsCount: number;
  analyticsUrl: string;
}) {
  return emailWrapper(`
    <h1 style="color:#0B2641;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Your event results are in!</h1>
    <p>Hi ${escapeHTML(params.organizerName)},</p>
    <p>Here's a summary of how <strong>${escapeHTML(params.eventName)}</strong> performed:</p>
    <div style="display:flex;gap:12px;margin:24px 0;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:36px;font-weight:800;color:#0684F5;">${params.totalRegistrations}</div>
        <div style="font-size:11px;color:#1E40AF;font-weight:600;text-transform:uppercase;">Registrations</div>
      </div>
      <div style="flex:1;min-width:120px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:36px;font-weight:800;color:#10B981;">${params.totalCheckins}</div>
        <div style="font-size:11px;color:#065F46;font-weight:600;text-transform:uppercase;">Check-ins</div>
      </div>
      <div style="flex:1;min-width:120px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:36px;font-weight:800;color:#F59E0B;">${params.totalMeetings}</div>
        <div style="font-size:11px;color:#92400E;font-weight:600;text-transform:uppercase;">B2B Meetings</div>
      </div>
    </div>
    ${detailBox(
      detailRow('Attendance Rate:', `${params.attendanceRate}%`) +
      detailRow('Sessions Held:', `${params.sessionsCount}`) +
      detailRow('Connections Made:', `${params.connectionsCount}`) +
      detailRow('Forms Submitted:', `${params.formsCount}`)
    )}
    ${ctaButton('View Full Analytics', params.analyticsUrl)}
    ${footerLine('Sent via Eventra Platform')}
  `);
}

export async function sendPostEventSummaryEmail(to: string, params: {
  organizerName: string;
  eventName: string;
  totalRegistrations: number;
  totalCheckins: number;
  totalMeetings: number;
  attendanceRate: number;
  sessionsCount: number;
  connectionsCount: number;
  formsCount: number;
  eventId: string;
}) {
  const analyticsUrl = `${window.location.origin}/manage-event/${params.eventId}?tab=reporting`;
  return sendEmail({
    to,
    subject: `${escapeHTML(params.eventName)} recap — Your event results are in`,
    html: generatePostEventSummaryEmailHtml({ ...params, analyticsUrl })
  });
}

// ─── EXISTING: MEETING CONFIRMATION ─────────────────────────────────────────
export function generateMeetingConfirmationEmailHtml(params: {
  eventName: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  organizerName: string;
  recipientName: string;
  qrCodeUrl: string;
  status: 'pending' | 'confirmed';
  role: 'organizer' | 'recipient';
  videoUrl?: string;
}) {
  const isConfirmed = params.status === 'confirmed';
  const title = isConfirmed ? 'Meeting Confirmed!' : 'New Meeting Request';
  const accentColor = isConfirmed ? '#0684F5' : '#F59E0B';
  const safeEventName = escapeHTML(params.eventName);
  const safeOrganizerName = escapeHTML(params.organizerName);
  const safeRecipientName = escapeHTML(params.recipientName);
  const safeLocation = escapeHTML(params.location);

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: ${accentColor};">${title}</h1>
      <p>Hello,</p>
      <p>
        ${params.status === 'pending'
          ? (params.role === 'organizer'
              ? `Your meeting request for <strong>${safeEventName}</strong> has been sent.`
              : `You have received a new meeting request for <strong>${safeEventName}</strong>.`)
          : `This is to confirm your B2B networking meeting for <strong>${safeEventName}</strong>.`
        }
      </p>
      
      <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #E2E8F0;">
        <h3 style="margin-top: 0; color: #1E293B;">Meeting Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 120px;">Status:</td>
            <td style="padding: 8px 0; font-weight: 600; color: ${accentColor}; text-transform: uppercase; font-size: 12px;">${params.status}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 120px;">Date:</td>
            <td style="padding: 8px 0; font-weight: 600;">${params.meetingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Time:</td>
            <td style="padding: 8px 0; font-weight: 600;">${params.meetingTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Location:</td>
            <td style="padding: 8px 0; font-weight: 600;">${safeLocation}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Participants:</td>
            <td style="padding: 8px 0; font-weight: 600;">${safeOrganizerName} & ${safeRecipientName}</td>
          </tr>
        </table>
      </div>

      ${isConfirmed && params.videoUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${escapeHTML(params.videoUrl)}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0684F5, #0570D6); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">🎥 Join Video Call</a>
        <p style="font-size: 12px; color: #64748B; margin-top: 12px; word-break: break-all;">
          Or copy this link: <a href="${escapeHTML(params.videoUrl)}" style="color: #0684F5; text-decoration: none;">${escapeHTML(params.videoUrl)}</a>
        </p>
      </div>
      ` : ''}
      ${isConfirmed ? `
      <div style="text-align: center; margin: 32px 0;">
        <p style="margin-bottom: 16px; font-weight: 700; color: #1E293B;">Meeting QR Code</p>
        <div style="display: inline-block; padding: 16px; background: white; border: 2px solid #0684F5; border-radius: 16px;">
          <img src="${params.qrCodeUrl}" alt="Meeting QR Code" style="width: 200px; height: 200px; display: block;" />
        </div>
        <p style="font-size: 13px; color: #64748B; margin-top: 16px;">Scan this code at the meeting table for check-in.</p>
      </div>
      ` : `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${window.location.origin}/my-networking" style="display: inline-block; padding: 14px 32px; background-color: #0684F5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600;">Review Request</a>
      </div>
      `}

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Please manage your meetings through your <a href="${window.location.origin}/my-networking" style="color: #0684F5; text-decoration: none; font-weight: 600;">Networking Dashboard</a>.
      </p>
      
      <p style="margin-top: 40px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 20px;">
        Sent via Eventra Networking Engine
      </p>
    </div>
  `;
}

// ─── B2B INVITATION EMAIL ───────────────────────────────────────────────────
export function generateB2BInvitationEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  networkingUrl: string;
}) {
  const safeName = escapeHTML(params.attendeeName);
  const safeEvent = escapeHTML(params.eventName);
  return emailWrapper(`
    <h1 style="color:#0684F5;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Unlock B2B Networking</h1>
    <p>Hi ${safeName},</p>
    <p>You're registered for <strong>${safeEvent}</strong> &mdash; and we've activated our <strong>AI-powered B2B matchmaking</strong> to help you make the most of this event!</p>
    <div style="background:#F0F9FF;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #BAE6FD;">
      <h3 style="margin-top:0;color:#0369A1;font-size:16px;">What you can do:</h3>
      <ul style="margin:0;padding-left:20px;color:#334155;line-height:2;">
        <li>Browse other attendees &amp; exhibitors</li>
        <li>Request 1-on-1 B2B meetings</li>
        <li>Get AI-matched with high-potential connections</li>
        <li>Join video or in-person meetings at the event</li>
      </ul>
    </div>
    ${ctaButton('Explore B2B Networking', params.networkingUrl)}
    <p style="font-size:13px;color:#64748B;text-align:center;">Start booking meetings before spots fill up!</p>
    ${footerLine('Sent via Eventra B2B Networking Engine')}
  `);
}

// ─── MATCH NOTIFICATION EMAIL ───────────────────────────────────────────────
export function generateMatchNotificationEmailHtml(params: {
  attendeeName: string;
  eventName: string;
  matches: { name: string; company: string }[];
  networkingUrl: string;
}) {
  const safeName = escapeHTML(params.attendeeName);
  const safeEvent = escapeHTML(params.eventName);
  const matchRows = params.matches.map(m =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;font-weight:600;font-size:14px;">${escapeHTML(m.name)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:14px;">${escapeHTML(m.company || 'N/A')}</td>
    </tr>`
  ).join('');

  return emailWrapper(`
    <h1 style="color:#10B981;font-size:22px;font-weight:700;text-align:center;margin-bottom:12px;">Your B2B Matches Are Ready!</h1>
    <p>Hi ${safeName},</p>
    <p>Great news! We've matched you with <strong>${params.matches.length} attendee${params.matches.length > 1 ? 's' : ''}</strong> at <strong>${safeEvent}</strong> for B2B networking meetings.</p>
    <div style="background:#F8FAFC;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #E2E8F0;">
      <h3 style="margin-top:0;color:#1E293B;font-size:15px;">Your Matches</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#F1F5F9;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748B;font-weight:600;">Name</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748B;font-weight:600;">Company</th>
          </tr>
        </thead>
        <tbody>${matchRows}</tbody>
      </table>
    </div>
    ${ctaButton('View Your Matches', params.networkingUrl, '#10B981')}
    <p style="font-size:13px;color:#64748B;text-align:center;">Log in to confirm meeting times and start networking.</p>
    ${footerLine('Sent via Eventra AI Matchmaker')}
  `);
}