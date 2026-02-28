import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;
  
  console.log(`[EMAIL_DEBUG] Sending email to: ${to} | Subject: ${subject}`);

  // Using the provided test key directly for verification
  const resend = new Resend('re_ZMze45ed_7J5Jut3C5REzRxzPmy64t2Ez');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eventra <contact@eventra.cloud>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[EMAIL_DEBUG] Resend Error:', JSON.stringify(error, null, 2));
      return res.status(400).json(error);
    }

    console.log('[EMAIL_DEBUG] Success:', data.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error('[EMAIL_DEBUG] System Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}