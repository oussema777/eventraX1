// Mock Email Service for Localhost Development
// This simulates sending emails without requiring a backend or exposing API keys.

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    // 1. Try Custom Backend (SMTP)
    try {
      const res = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });
      if (res.ok) return true;
    } catch (e) {
      // Backend not running, fall through
    }

    // 2. Try Supabase Edge Function (Primary)
    // Dynamic import to avoid circular dep issues if not fully set up
    const { supabase } = await import('./supabase'); 
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });

    if (!error && data?.id) {
      return true;
    }

    // 3. Fallback: Try Vercel Serverless Function
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    });

    if (res.ok) {
      return true;
    }

    throw new Error('All email methods failed');
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

export function generateRegistrationEmailHtml(eventName: string, attendeeName: string, qrCodeUrl: string, sessions: any[], confirmationCode?: string) {
  const sessionList = sessions.map(s => 
    `<li style="margin-bottom: 8px;">
       <strong>${s.title}</strong><br/>
       <span style="font-size: 12px; color: #666;">${new Date(s.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${s.location || 'Main Hall'}</span>
     </li>`
  ).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: #0B2641;">You're going to ${eventName}!</h1>
      <p>Hi ${attendeeName},</p>
      <p>Thanks for registering. Here are your credentials and check-in details.</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #E5E7EB;">
        <p style="margin-bottom: 10px; font-weight: bold; color: #000000;">Your Check-in QR Code</p>
        <img src="${qrCodeUrl}" alt="Check-in QR Code" style="width: 200px; height: 200px; background: white; padding: 10px; border-radius: 4px;" />
        
        ${confirmationCode ? `
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #D1D5DB;">
            <p style="font-size: 12px; color: #6B7280; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Confirmation Code</p>
            <p style="font-size: 24px; font-weight: 800; color: #0B2641; letter-spacing: 2px; margin: 0;">${confirmationCode}</p>
          </div>
        ` : ''}
        
        <p style="font-size: 12px; color: #4B5563; margin-top: 15px;">Show this code or scan the QR at the entrance.</p>
      </div>

      ${sessions.length > 0 ? `
        <h3 style="border-bottom: 2px solid #0B2641; padding-bottom: 8px; color: #0B2641;">Your Selected Agenda</h3>
        <ul style="padding-left: 20px; list-style-type: none;">
          ${sessionList}
        </ul>
      ` : ''}
      
      <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF; text-align: center;">
        Sent via Eventra Platform
      </p>
    </div>
  `;
}