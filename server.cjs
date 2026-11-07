const express = require('express');
const path = require('path');
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* Environment may be supplied by the process manager. */ }
const app = express();
app.use(express.json({ limit: '16kb' }));
app.post('/api/send-email', async (req, res) => {
  try { const { platformMailHandler } = await import('./server/platform-mail.mjs'); await platformMailHandler(req, res); }
  catch { res.status(503).json({ error: 'Email service unavailable' }); }
});
app.listen(process.env.EMAIL_PORT || 5000, '127.0.0.1', () => console.log('Authorized email service started.'));
