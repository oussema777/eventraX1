import express from 'express';
import { platformMailHandler } from './server/platform-mail.mjs';
const app = express();
app.use(express.json({ limit: '16kb' }));
app.post('/send-email', platformMailHandler);
app.listen(process.env.EMAIL_PROXY_PORT || 5001, '127.0.0.1', () => console.log('Authorized email proxy started.'));
