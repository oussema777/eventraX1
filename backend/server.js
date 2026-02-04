require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to call this
app.use(express.json());

// SMTP Configuration
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465, // Auto-secure for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    rejectUnauthorized: false // Helps with self-signed certificates common on some hosts
  }
};

// Check if credentials are provided
const isMockMode = !process.env.SMTP_USER || !process.env.SMTP_PASS;

let transporter;

if (isMockMode) {
  console.log('\n⚠️  MISSING SMTP CREDENTIALS IN .env');
  console.log('🔄 Server starting in MOCK MODE. Emails will be logged to console but NOT sent.\n');
} else {
  transporter = nodemailer.createTransport(smtpConfig);
  // Verify connection
  transporter.verify(function (error, success) {
    if (error) {
      console.log('⚠️ SMTP Connection Error:', error);
    } else {
      console.log('✅ SMTP Server is ready to take our messages');
    }
  });
}

// Email Endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    if (isMockMode) {
      // MOCK MODE: Log email to console
      console.log('---------------------------------------------------');
      console.log(`📧 [MOCK EMAIL] To: ${to}`);
      console.log(`📝 Subject: ${subject}`);
      console.log('---------------------------------------------------');
      return res.status(200).json({ success: true, messageId: 'mock-id-' + Date.now() });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Eventra" <no-reply@eventra.com>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Custom Email Backend running on http://localhost:${PORT}`);
});
