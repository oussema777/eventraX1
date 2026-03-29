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

export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[], isAnonymous: boolean = false) {
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
    status: params.status
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