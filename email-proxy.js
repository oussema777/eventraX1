import http from 'http';
import https from 'https';

const PORT = 5001;
const RESEND_KEY = 're_ZMze45ed_7J5Jut3C5REzRxzPmy64t2Ez';

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
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
        console.log(`[PROXY] Sending to: ${payload.to} | Subject: ${payload.subject}`);

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
            console.log(`[PROXY] Resend Response: ${resendRes.statusCode} ${resendRes.statusCode === 200 ? '✅' : '❌'}`);
            if (resendRes.statusCode !== 200) {
              console.log(`[PROXY] Error Detail: ${resendBody}`);
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
  console.log('\x1b[36m%s\x1b[0m', `\n🚀 EMAIL PROXY RUNNING ON http://localhost:${PORT}/send-email`);
  console.log('Using Resend Domain: contact@eventra.cloud');
  console.log('Press Ctrl+C to stop.\n');
});
