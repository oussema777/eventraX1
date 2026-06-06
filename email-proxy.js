import http from 'http';
import https from 'https';

const PORT = 5001;
const RESEND_KEY = process.env.RESEND_API_KEY || '';

const ALLOWED_ORIGINS = [
  'https://app.eventra.cloud',
  'https://eventra.cloud',
  'http://localhost:3000',
  'http://localhost:5173',
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/send-email') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const resendReq = https.request('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_KEY}`
          }
        }, (resendRes) => {
          let resendBody = '';
          resendRes.on('data', d => { resendBody += d; });
          resendRes.on('end', () => {
            res.writeHead(resendRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(resendBody);
            if (resendRes.statusCode !== 200) {
              console.error(`[PROXY] Error: ${resendRes.statusCode}`);
            }
          });
        });

        resendReq.on('error', (e) => {
          console.error('[PROXY] Network Error:', e);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        });

        resendReq.write(JSON.stringify({
          from: 'Eventra <contact@eventra.cloud>',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html
        }));
        resendReq.end();

      } catch (e) {
        console.error('[PROXY] JSON Parse Error:', e.message);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Email proxy running on http://localhost:${PORT}/send-email`);
});
