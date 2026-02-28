const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = 5000; // Your Nginx is likely proxying to this port
const RESEND_KEY = 're_ZMze45ed_7J5Jut3C5REzRxzPmy64t2Ez';
const resend = new Resend(RESEND_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  
  console.log(`[PROD_EMAIL] Sending to: ${to} | Subject: ${subject}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eventra <contact@eventra.cloud>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[PROD_EMAIL] Resend Error:', error);
      return res.status(400).json(error);
    }

    console.log('[PROD_EMAIL] Success:', data.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error('[PROD_EMAIL] System Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 PRODUCTION EMAIL SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/send-email
`);
});
