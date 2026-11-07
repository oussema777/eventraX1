// No environment reads or network side effects on import. All I/O is injected.
const copy = {
  confirmed: { participant: ['Votre rendez-vous est confirmé. Consultez les détails dans Eventra.', 'Your meeting is confirmed. View the details in Eventra.', 'تم تأكيد اجتماعك. اطّلع على التفاصيل في Eventra.'] },
  cancelled: { participant: ['Votre rendez-vous a été annulé ou l’invitation a été refusée. Consultez Eventra.', 'Your meeting was cancelled or the invitation was declined. View Eventra for details.', 'تم إلغاء الاجتماع أو رفض الدعوة. اطّلع على التفاصيل في Eventra.'] },
  submitted: {
    requester: ['Votre demande attend la validation de l’organisation.', 'Your meeting request is awaiting organizer review.', 'طلب اجتماعك بانتظار مراجعة المنظم.'],
    reviewer: ['Une demande de rendez-vous attend votre validation.', 'A meeting request is awaiting your review.', 'طلب اجتماع بانتظار مراجعتك.'],
  },
  forwarded: {
    requester: ['Votre invitation a été transmise. La confirmation du destinataire reste nécessaire.', 'Your invitation has been forwarded. The recipient still needs to confirm.', 'تم إرسال دعوتك. لا يزال تأكيد المستلم مطلوبًا.'],
    recipient: ['Vous avez une invitation à un rendez-vous. Connectez-vous pour accepter ou refuser.', 'You have a meeting invitation. Sign in to accept or decline.', 'لديك دعوة لاجتماع. سجّل الدخول للقبول أو الرفض.'],
  },
  rejected: { requester: ['Votre demande n’a pas été approuvée. Consultez les détails dans Eventra.', 'Your request was not approved. View the details in Eventra.', 'لم تتم الموافقة على طلبك. اطّلع على التفاصيل في Eventra.'] },
  needs_new_slot: { requester: ['Le créneau demandé n’est plus disponible. Consultez votre demande dans Eventra.', 'The requested time is no longer available. View your request in Eventra.', 'الموعد المطلوب لم يعد متاحًا. اطّلع على طلبك في Eventra.'] },
  withdrawn: { requester: ['Votre demande a été retirée.', 'Your request has been withdrawn.', 'تم سحب طلبك.'] },
  expired: { requester: ['Votre demande a expiré.', 'Your request has expired.', 'انتهت صلاحية طلبك.'] },
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderReviewDelivery(payload, { origin, from }) {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('INVALID_ORIGIN');
  const messages = copy[payload.kind]?.[payload.audience];
  const entityId = ['confirmed','cancelled'].includes(payload.kind) ? payload.meeting_id : payload.request_id;
  if (payload.version !== 1 || !messages || !uuid.test(payload.event_id) || !uuid.test(entityId)
      || typeof payload.to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to)
      || typeof from !== 'string' || /[\r\n]/.test(from) || !from.includes('@')) throw new Error('INVALID_PAYLOAD');
  const url = new URL(payload.audience === 'reviewer' ? `/manage-event/${payload.event_id}?tab=b2b` : '/my-networking', base).href;
  // Trilingual until a verified per-recipient language preference is available.
  // No sensitive details in email: sign-in and live authorization guard the UI.
  return { from, to: [payload.to], subject: 'Eventra — Rendez-vous / Meetings / الاجتماعات',
    text: `${messages.join('\n\n')}\n\nEventra: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#153047;padding:24px"><h1>Eventra</h1>${messages.map((m,i)=>`<p lang="${['fr','en','ar'][i]}" dir="${i===2?'rtl':'ltr'}">${escape(m)}</p>`).join('')}<p><a href="${escape(url)}">Ouvrir Eventra · Open Eventra · فتح Eventra</a></p></div>` };
}

export async function deliverReviewJob({ rpc, send, origin, from }) {
  const lease = await rpc('claim_review_delivery', {});
  if (!lease) return { state: 'idle' };
  const args = { p_id: lease.id, p_lease: lease.lease_token };
  // Revalidate immediately before contacting the provider, not just at claim time.
  const payload = await rpc('prepare_review_delivery', args);
  if (!payload) return { state: 'suppressed', id: lease.id };
  let mail;
  try { mail = renderReviewDelivery(payload, { origin, from }); }
  catch {
    await rpc('finish_review_delivery', { ...args, p_error: 'INVALID_PAYLOAD', p_permanent: true });
    return { state: 'failed', id: lease.id };
  }
  let result;
  try { result = await send(mail, `eventra-review-v1/${lease.id}`); }
  catch { result = { error: 'NETWORK_ERROR', permanent: false }; }
  // If acknowledgement fails, leave the lease for recovery. Do not issue a new
  // send or mark a possibly successful provider operation as a new email.
  const acknowledged = await rpc('finish_review_delivery', { ...args,
    p_provider_id: result.id || null, p_error: result.id ? null : result.error || 'PROVIDER_ERROR',
    p_permanent: Boolean(result.permanent) });
  return { state: acknowledged ? (result.id ? 'sent' : 'failed') : 'lease_lost', id: lease.id };
}

export function createResendSender({ apiKey, fetchImpl = fetch }) {
  return async (mail, idempotencyKey) => {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(mail),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && typeof data.id === 'string' && data.id.length>0 && data.id.length<=200) return { id: data.id };
    const transient = response.ok || response.status>=500 || response.status===429 || response.status===408
      || (response.status===409 && data.name==='concurrent_idempotent_requests');
    return { error: `PROVIDER_${response.status}`, permanent: !transient };
  };
}
