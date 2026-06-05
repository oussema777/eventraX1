const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');

// Load environment from the .env next to this file.
// Node 20.12+/22 has this built in — no dotenv dependency required.
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (e) {
  /* .env is optional; env vars may already be provided by the process manager */
}

const app = express();
const PORT = process.env.EMAIL_PORT || 5000; // Nginx proxies /api/send-email to this port
const RESEND_KEY = process.env.RESEND_API_KEY;

if (!RESEND_KEY) {
  console.error('[PROD_EMAIL] WARNING: RESEND_API_KEY is not set (.env or env) — emails will fail.');
}

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
  console.log(`\n🚀 PRODUCTION EMAIL SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/send-email\n`);
});
