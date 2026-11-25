import QRCode from 'qrcode';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export async function createMeetingPass(payload, origin) {
  if (payload.kind !== 'confirmed' || !payload.participant_id || !['in-person', 'hybrid'].includes(payload.format)) return null;
  if (![payload.event_id, payload.meeting_id, payload.participant_id].every(id => uuid.test(id))) throw new Error('INVALID_PAYLOAD');
  const url = new URL(`/event/${payload.event_id}/networking`, origin);
  url.searchParams.set('meetingId', payload.meeting_id);
  url.searchParams.set('participant', payload.participant_id);
  const png = await QRCode.toBuffer(url.href, { width: 480, margin: 4, errorCorrectionLevel: 'M' });
  return {
    url: url.href,
    html: '<p style="margin:18px 0"><img src="cid:meeting-pass" width="200" height="200" alt="B2B meeting QR" style="display:block;background:#fff"></p>',
    attachments: [{ filename: 'meeting-pass.png', content_id: 'meeting-pass', content_type: 'image/png', content: png.toString('base64') }]
  };
}
