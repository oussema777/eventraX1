// Mock Email Service for Localhost Development
// This simulates sending emails without requiring a backend or exposing API keys.

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    // Attempt to send via Serverless Function (Vercel /api)
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn('Failed to send email via API:', err);
      throw new Error('Email API failed');
    }

    return true;
  } catch (error) {
    // Fallback for local dev without API running
    console.group('⚠️ [FALLBACK EMAIL] API Unavailable - Logging content');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- HTML ---');
    console.log(html);
    console.groupEnd();
    return true; // Return true to not block the UI flow
  }
}

export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[]) {
  const sessionList = (sessions || []).map(s => 
    `<li style="margin-bottom: 8px;">
       <strong>${s.title}</strong><br/>
       <span style="font-size: 12px; color: #666;">${s.starts_at ? new Date(s.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'} - ${s.location || 'Main Hall'}</span>
     </li>`
  ).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: #0B2641;">You're going to ${eventName}!</h1>
      <p>Hi ${attendeeName},</p>
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
      
      <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF; text-align: center;">
        Sent via Eventra Platform (Localhost Mode)
      </p>
    </div>
  `;
}

export function generateMeetingConfirmationEmailHtml(params: {
  eventName: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  organizerName: string;
  recipientName: string;
  qrCodeUrl: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: #0684F5;">Meeting Confirmed!</h1>
      <p>Hello,</p>
      <p>This is to confirm your B2B networking meeting for <strong>${params.eventName}</strong>.</p>
      
      <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #E2E8F0;">
        <h3 style="margin-top: 0; color: #1E293B;">Meeting Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
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
            <td style="padding: 8px 0; font-weight: 600;">${params.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Participants:</td>
            <td style="padding: 8px 0; font-weight: 600;">${params.organizerName} & ${params.recipientName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <p style="margin-bottom: 16px; font-weight: 700; color: #1E293B;">Meeting QR Code</p>
        <div style="display: inline-block; padding: 16px; background: white; border: 2px solid #0684F5; border-radius: 16px;">
          <img src="${params.qrCodeUrl}" alt="Meeting QR Code" style="width: 200px; height: 200px; display: block;" />
        </div>
        <p style="font-size: 13px; color: #64748B; margin-top: 16px;">Scan this code at the meeting table for check-in.</p>
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Please arrive on time. If you need to reschedule, you can do so through your <a href="https://eventra.ilab.tn/my-networking" style="color: #0684F5; text-decoration: none; font-weight: 600;">Networking Dashboard</a>.
      </p>
      
      <p style="margin-top: 40px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #F1F5F9; padding-top: 20px;">
        Sent via Eventra Networking Engine
      </p>
    </div>
  `;
}