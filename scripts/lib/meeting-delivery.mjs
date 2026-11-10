import { renderBrandedNotice } from '../../supabase/functions/_shared/emailBrand.mjs';

export function renderQueuedMeeting(payload, { origin, from }) {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash || base.username || base.password) throw new Error('INVALID_ORIGIN');
  const uuid = /^[a-f0-9-]{36}$/i;
  if (payload.version !== 1 || !uuid.test(payload.event_id) || !uuid.test(payload.meeting_id)
    || !['pending', 'confirmed', 'cancelled'].includes(payload.kind)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to || '') || !from || /[\r\n]/.test(from)) throw new Error('INVALID_PAYLOAD');
  const title = { pending: 'Meeting invitation', confirmed: 'Meeting confirmed', cancelled: 'Meeting cancelled' }[payload.kind];
  const body = payload.kind === 'pending'
    ? 'This invitation is awaiting acceptance. The appointment and table are not reserved until confirmation.'
    : payload.kind === 'confirmed' ? 'Your meeting is confirmed. Open Eventra for the latest details and your meeting pass.'
    : 'This meeting has been cancelled or declined. Please check your updated schedule in Eventra.';
  const url = new URL(`/event/${payload.event_id}/networking?tab=schedule&meetingId=${payload.meeting_id}`, base).href;
  let zone = payload.timezone || 'UTC';
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); } catch { zone = 'UTC'; }
  const details = [['Event', payload.event_name || 'Event'], ['With', payload.partner || 'Participant']];
  if (Number.isFinite(Date.parse(payload.start_at))) {
    details.push(['Date and time', new Intl.DateTimeFormat('en', { timeZone: zone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(payload.start_at))], ['Time zone', zone]);
  }
  if (payload.kind === 'pending') details.push(['Location', payload.format === 'video' ? 'Online — joining details in Eventra' : 'Table assigned on confirmation']);
  if (payload.kind === 'confirmed' && payload.location) details.push(['Location', payload.location]);
  return { from, to: [payload.to], subject: title, text: `${body}\n\n${details.map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n${url}`,
    html: renderBrandedNotice({ title, body, url, action: 'View my meeting', details }) };
}

export async function deliverMeetingJob({ rpc, send, origin, from }) {
  const lease = await rpc('claim_meeting_delivery', {});
  if (!lease) return { state: 'idle' };
  const args = { p_id: lease.id, p_token: lease.token };
  const prepared = await rpc('prepare_meeting_delivery', args);
  if (!prepared) return { state: 'suppressed', id: lease.id };
  let mail;
  try {
    mail = prepared.mail || renderQueuedMeeting(prepared.payload, { origin, from });
  } catch {
    await rpc('finish_meeting_delivery', { ...args, p_error: 'INVALID_PAYLOAD', p_permanent: true });
    return { state: 'reconcile', id: lease.id };
  }
  // Freeze the exact provider request: deployments and retries must not alter it.
  mail = await rpc('freeze_meeting_mail', { ...args, p_mail: mail });
  if (!mail) return { state: 'lease_lost', id: lease.id };
  // Revalidate immediately before delivery to suppress obsolete invitations.
  if (!await rpc('prepare_meeting_delivery', args)) return { state: 'suppressed', id: lease.id };
  const result = await send(mail, `eventra-meeting-v1/${lease.id}`).catch(() => ({ error: 'NETWORK_ERROR' }));
  const saved = await rpc('finish_meeting_delivery', { ...args, p_provider: result.id || null,
    p_error: result.id ? null : result.error || 'PROVIDER_ERROR', p_permanent: !!result.permanent });
  return { state: !saved ? 'lease_lost' : result.id ? 'sent' : result.permanent ? 'reconcile' : 'failed', id: lease.id };
}
