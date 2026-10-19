// Email HTML also renders outside the browser. Escape attribute delimiters as
// well as markup, without depending on document or a DOM implementation.
const escapeHTML = (value: string): string => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export type MeetingEmailLocale = 'en' | 'fr' | 'ar';
const copy = {
  en: {
    networking: 'B2B NETWORKING', eyebrow: 'A conversation worth having', pending: 'Awaiting confirmation', confirmed: 'Confirmed', cancelled: 'Cancelled',
    sentTitle: 'Your invitation is on its way.', requestTitle: 'A new connection starts here.', confirmedTitle: 'Your meeting is confirmed.', cancelledTitle: 'Your meeting was cancelled.',
    sent: 'Your invitation has been sent. The meeting is confirmed once your guest accepts.', request: 'You have a new meeting invitation. Review the details and respond from your networking space.',
    confirm: 'You’re all set. Keep these details handy and bring your meeting pass when you arrive.', cancel: 'This meeting is no longer scheduled. You can find another time or connect with someone new.',
    hello: 'Hello', with: 'Meeting with', event: 'Event', date: 'Date', time: 'Time', location: 'Location', zone: 'Time zone',
    review: 'Review invitation', view: 'View meeting', browse: 'Back to networking', join: 'Join video call',
    pass: 'Your personal meeting pass', hint: 'Show this code to staff at the meeting area. It checks in only you.',
    reference: 'Meeting reference', fallback: 'Images not showing? Open the meeting to display your pass, or give staff the reference above.',
    footer: 'Your event. Your people. Your next opportunity.', notification: 'You received this update about a B2B meeting on Eventra.',
    online: 'Join using the video link at the scheduled time.', copiedLink: 'If the button does not work, open this link:',
  },
  fr: {
    networking: 'RENCONTRES B2B', eyebrow: 'Une rencontre qui compte', pending: 'En attente de confirmation', confirmed: 'Confirmé', cancelled: 'Annulé',
    sentTitle: 'Votre invitation est envoyée.', requestTitle: 'Une nouvelle rencontre vous attend.', confirmedTitle: 'Votre rendez-vous est confirmé.', cancelledTitle: 'Votre rendez-vous a été annulé.',
    sent: 'Votre invitation a été envoyée. Le rendez-vous sera confirmé lorsque votre invité l’acceptera.', request: 'Vous avez reçu une invitation. Consultez les détails et répondez depuis votre espace de réseautage.',
    confirm: 'Tout est prêt. Gardez ces informations et présentez votre pass à votre arrivée.', cancel: 'Ce rendez-vous n’est plus programmé. Vous pouvez choisir un autre créneau ou découvrir de nouveaux contacts.',
    hello: 'Bonjour', with: 'Rendez-vous avec', event: 'Événement', date: 'Date', time: 'Heure', location: 'Lieu', zone: 'Fuseau horaire',
    review: 'Consulter l’invitation', view: 'Voir le rendez-vous', browse: 'Retour au réseautage', join: 'Rejoindre la visioconférence',
    pass: 'Votre pass personnel', hint: 'Présentez ce code au personnel de l’espace de rencontre. Il confirme uniquement votre présence.',
    reference: 'Référence du rendez-vous', fallback: 'Les images ne s’affichent pas ? Ouvrez le rendez-vous pour afficher votre pass ou communiquez la référence ci-dessus au personnel.',
    footer: 'Votre événement. Vos rencontres. Vos prochaines opportunités.', notification: 'Vous recevez cette mise à jour concernant un rendez-vous B2B sur Eventra.',
    online: 'Utilisez le lien vidéo à l’heure prévue.', copiedLink: 'Si le bouton ne fonctionne pas, ouvrez ce lien :',
  },
  ar: {
    networking: 'لقاءات الأعمال', eyebrow: 'لقاء يصنع الفرص', pending: 'بانتظار التأكيد', confirmed: 'مؤكد', cancelled: 'ملغى',
    sentTitle: 'تم إرسال دعوتك.', requestTitle: 'لقاء جديد بانتظارك.', confirmedTitle: 'تم تأكيد اجتماعك.', cancelledTitle: 'تم إلغاء اجتماعك.',
    sent: 'تم إرسال دعوتك. يُؤكّد الاجتماع عندما يقبل الطرف الآخر.', request: 'وصلتك دعوة لاجتماع جديد. راجع التفاصيل وردّ من مساحة التواصل المهني.',
    confirm: 'كل شيء جاهز. احتفظ بهذه التفاصيل وأبرز بطاقة اجتماعك عند الوصول.', cancel: 'لم يعد هذا الاجتماع مجدولًا. يمكنك اختيار موعد آخر أو التواصل مع مشاركين جدد.',
    hello: 'مرحبًا', with: 'اجتماع مع', event: 'الفعالية', date: 'التاريخ', time: 'الوقت', location: 'المكان', zone: 'المنطقة الزمنية',
    review: 'مراجعة الدعوة', view: 'عرض الاجتماع', browse: 'العودة إلى التواصل المهني', join: 'الانضمام إلى مكالمة الفيديو',
    pass: 'بطاقتك الشخصية للاجتماع', hint: 'أبرز هذا الرمز للموظفين في منطقة الاجتماعات. يؤكد حضورك أنت فقط.',
    reference: 'مرجع الاجتماع', fallback: 'الصور لا تظهر؟ افتح الاجتماع لعرض بطاقتك أو أعطِ الموظف المرجع أعلاه.',
    footer: 'فعاليتك. لقاءاتك. فرصتك القادمة.', notification: 'تلقيت هذا التحديث بشأن اجتماع مهني على Eventra.',
    online: 'انضم باستخدام رابط الفيديو في الموعد المحدد.', copiedLink: 'إذا لم يعمل الزر، افتح هذا الرابط:',
  },
};

export function safeEmailUrl(value?: string) {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? escapeHTML(url.href) : ''; } catch { return ''; }
}

export function renderMeetingEmail(params: {
  status: 'pending' | 'confirmed' | 'cancelled'; role?: 'organizer' | 'recipient';
  recipientName: string; partnerName: string; eventName: string; meetingDate: string; meetingTime: string;
  location?: string; timeZone?: string; meetingId?: string; networkingUrl: string; qrCodeUrl?: string;
  videoUrl?: string; locale?: MeetingEmailLocale;
}) {
  const locale = params.locale || 'en';
  const c = copy[locale] || copy.en;
  const confirmed = params.status === 'confirmed', cancelled = params.status === 'cancelled';
  const sent = params.role === 'organizer';
  const title = cancelled ? c.cancelledTitle : confirmed ? c.confirmedTitle : sent ? c.sentTitle : c.requestTitle;
  const intro = cancelled ? c.cancel : confirmed ? (params.videoUrl ? c.online : c.confirm) : sent ? c.sent : c.request;
  const accent = cancelled ? '#a34246' : confirmed ? '#137653' : '#936318';
  const tint = cancelled ? '#fff0f0' : confirmed ? '#e8f6ef' : '#fff5dd';
  const action = cancelled ? c.browse : confirmed ? c.view : sent ? c.view : c.review;
  const link = safeEmailUrl(params.networkingUrl), video = safeEmailUrl(params.videoUrl), qr = safeEmailUrl(params.qrCodeUrl);
  const row = (label: string, value?: string, direction = 'auto') => value ? `<tr><td style="padding:10px 0;color:#69788b;font-size:13px;width:30%;vertical-align:top">${escapeHTML(label)}</td><td dir="${direction}" style="padding:10px 0;color:#142c43;font-size:15px;font-weight:600;word-break:break-word">${escapeHTML(value)}</td></tr>` : '';
  const button = (label: string, href: string) => href ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0"><tr><td bgcolor="#087fea" style="border-radius:10px;text-align:center"><a href="${href}" style="display:inline-block;padding:16px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">${escapeHTML(label)}</a></td></tr></table>` : '';
  return `<!doctype html><html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHTML(title)}</title></head>
<body style="margin:0;padding:0;background:#edf2f6;color:#142c43;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHTML(title)} ${escapeHTML(params.eventName)} · ${escapeHTML(params.meetingDate)} · ${escapeHTML(params.meetingTime)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#edf2f6"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dce5ec;border-radius:20px;overflow:hidden">
<tr><td bgcolor="#0b2641" style="padding:26px 28px;border-bottom:4px solid #38bdf8"><table role="presentation" width="100%"><tr><td dir="ltr" style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-1px">eventra<span style="color:#38bdf8">.</span></td><td align="right" style="font-size:11px;color:#b9d4e9;letter-spacing:2px">${escapeHTML(c.networking)}</td></tr></table></td></tr>
<tr><td style="padding:30px 28px 12px"><span style="display:inline-block;background:${tint};color:${accent};border-radius:20px;padding:8px 13px;font-size:12px;font-weight:700">${escapeHTML(c[params.status])}</span>
<p style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#69788b;margin:26px 0 10px">${escapeHTML(c.eyebrow)}</p>
<h1 style="font-size:30px;line-height:1.18;letter-spacing:-1px;margin:0 0 22px;color:#0b2641">${escapeHTML(title)}</h1>
<p style="font-size:15px;line-height:1.7;margin:0 0 8px">${escapeHTML(c.hello)} ${escapeHTML(params.recipientName)},</p>
<p style="font-size:15px;line-height:1.7;margin:0;color:#526579">${escapeHTML(intro)}</p></td></tr>
<tr><td style="padding:12px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f8fb;border:1px solid #e1e9f0;border-radius:14px"><tr><td style="padding:22px">
<p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#69788b;margin:0 0 8px">${escapeHTML(c.with)}</p>
<h2 style="font-size:23px;line-height:1.3;margin:0 0 16px;color:#0b2641;word-break:break-word">${escapeHTML(params.partnerName)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #dce5ec">${row(c.event, params.eventName)}${row(c.date, params.meetingDate)}${row(c.time, params.meetingTime, 'ltr')}${row(c.zone, params.timeZone, 'ltr')}${row(c.location, params.location)}</table>
</td></tr></table></td></tr>
${confirmed && qr ? `<tr><td align="center" style="padding:18px 28px"><h2 style="font-size:18px;margin:0 0 16px">${escapeHTML(c.pass)}</h2><img src="${qr}" alt="${escapeHTML(c.pass)}" width="200" height="200" style="display:block;border:12px solid #ffffff;background:#ffffff;max-width:100%"><p style="font-size:13px;line-height:1.7;color:#526579;max-width:360px;margin:12px auto">${escapeHTML(c.hint)}</p>${params.meetingId ? `<p style="font-size:11px;color:#69788b;margin:16px 0 6px">${escapeHTML(c.reference)}</p><p style="font-size:11px;word-break:break-all;margin:0;color:#142c43;font-family:monospace">${escapeHTML(params.meetingId)}</p>` : ''}<p style="font-size:12px;line-height:1.6;color:#69788b;margin:14px 0 0">${escapeHTML(c.fallback)}</p></td></tr>` : ''}
<tr><td align="center" style="padding:0 28px 28px">${confirmed && video ? button(c.join, video) : ''}${button(action, link)}<p style="font-size:11px;color:#69788b;margin:22px 0 6px">${escapeHTML(c.copiedLink)}</p><a href="${link}" style="font-size:11px;line-height:1.5;color:#087fea;word-break:break-all">${link}</a></td></tr>
<tr><td style="padding:22px 28px;border-top:1px solid #e1e9f0;text-align:center"><p style="font-size:12px;color:#526579;margin:0 0 8px">${escapeHTML(c.footer)}</p><p style="font-size:11px;line-height:1.6;color:#7c8b9b;margin:0">${escapeHTML(c.notification)}</p></td></tr>
</table></td></tr></table></body></html>`;
}
