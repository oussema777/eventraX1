// Email-safe tables and inline styles; no scripts, fonts, images or tracking requests.
const titles = {
  confirmed: 'Votre rendez-vous est confirmé',
  cancelled: 'Votre rendez-vous a été annulé',
  submitted: 'Votre demande est en cours',
  forwarded: 'Une nouvelle étape pour votre rencontre',
  rejected: 'Une réponse à votre demande',
  needs_new_slot: 'Choisissez un nouveau créneau',
  withdrawn: 'Votre demande a été retirée',
  expired: 'Votre demande a expiré',
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function brandedReviewEmail(payload, messages, url) {
  const reviewer = payload.audience === 'reviewer';
  const title = reviewer ? 'Une demande attend votre validation' : payload.kind === 'forwarded' && payload.audience === 'recipient' ? 'Vous avez une invitation' : titles[payload.kind];
  const action = reviewer ? 'Examiner la demande' : 'Voir mon planning';
  const caption = reviewer ? 'Review request · مراجعة الطلب' : 'View my schedule · عرض جدول مواعيدي';
  const confirmed = payload.kind === 'confirmed';
  const accent = confirmed ? '#187460' : '#087fea';
  const tint = confirmed ? '#e8f5ef' : '#eaf3fe';
  const status = confirmed ? 'CONFIRMATION' : reviewer ? 'ACTION REQUISE' : 'VOS RENCONTRES';
  const safeUrl = escape(url);
  return {
    subject: `Eventra — ${title}`,
    html: `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>${escape(title)}</title>
<style>@media(max-width:480px){.mail-pad{padding-left:24px!important;padding-right:24px!important}.mail-title{font-size:27px!important}}@media(prefers-color-scheme:dark){.mail-body,.mail-background{background:#0b1e31!important}.mail-card{background:#14324b!important}.mail-title{color:#eef5fb!important}.mail-copy{color:#c9d9e6!important}.mail-muted{color:#9fb5c8!important}.mail-divider{border-color:#355269!important}.mail-secondary{background:#102c43!important}}</style></head>
<body class="mail-body" style="margin:0;padding:0;background:#edf2f6;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escape(messages[0])}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf2f6" class="mail-background"><tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="mail-card" style="max-width:600px;border:1px solid #dce5ec;border-radius:18px;overflow:hidden">
<tr><td bgcolor="#0b2641" class="mail-pad" style="padding:26px 36px;border-bottom:4px solid #38bdf8"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:29px;font-weight:800;letter-spacing:-1px;color:#ffffff">eventra<span style="color:#38bdf8">.</span></td><td align="right" style="font-size:10px;letter-spacing:2px;color:#bbd4e6">NETWORKING</td></tr></table></td></tr>
<tr><td class="mail-pad" style="padding:32px 36px 0"><span style="display:inline-block;padding:7px 11px;border-radius:6px;background:${tint};color:${accent};font-size:10px;font-weight:700;letter-spacing:1px">${status}</span>
<h1 class="mail-title" style="color:#0b2641;font-size:32px;line-height:1.2;letter-spacing:-.7px;margin:18px 0 16px;font-weight:700">${escape(title)}.</h1>
<p lang="fr" class="mail-copy" style="font-size:16px;line-height:1.7;color:#526579;margin:0">${escape(messages[0])}</p></td></tr>
<tr><td class="mail-pad" style="padding:26px 36px 30px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#087fea" align="center" style="border-radius:9px;mso-padding-alt:16px 26px"><a href="${safeUrl}" style="display:inline-block;padding:16px 26px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9px">${action}&nbsp; &#8599;</a></td></tr></table><p class="mail-muted" style="font-size:11px;color:#74869a;margin:11px 0 0;line-height:1.6">${caption}</p></td></tr>
<tr><td class="mail-pad" style="padding:0 36px 30px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f8fb" class="mail-secondary" style="border-radius:10px"><tr><td style="padding:19px 22px"><p class="mail-muted" style="font-size:10px;font-weight:700;letter-spacing:1px;color:#74869a;margin:0 0 7px">ENGLISH</p><p lang="en" class="mail-copy" style="font-size:13px;line-height:1.65;color:#526579;margin:0">${escape(messages[1])}</p><div class="mail-divider" style="border-top:1px solid #dce5ec;margin:17px 0"></div><p lang="ar" dir="rtl" class="mail-muted" style="font-size:11px;font-weight:700;color:#74869a;text-align:right;margin:0 0 7px">العربية</p><p lang="ar" dir="rtl" class="mail-copy" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.8;color:#526579;text-align:right;margin:0">${escape(messages[2])}</p></td></tr></table></td></tr>
<tr><td class="mail-pad mail-divider" style="padding:22px 36px;border-top:1px solid #e1e9f0"><p class="mail-muted" style="font-size:11px;line-height:1.7;color:#74869a;margin:0">Retrouvez les informations à jour dans votre espace Eventra.</p><p style="margin:8px 0 0;font-size:11px;line-height:1.5;word-break:break-all"><a href="${safeUrl}" style="color:#087fea;text-decoration:underline">${safeUrl}</a></p></td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
<p class="mail-muted" style="font-size:11px;line-height:1.6;color:#74869a;margin:18px 0 0">eventra. &nbsp; Des rencontres qui font avancer vos projets.</p>
</td></tr></table></body></html>`,
  };
}
