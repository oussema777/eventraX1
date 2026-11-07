import { renderBrandedNotice } from './emailBrand.mjs';
import { renderOnlineEmail } from './onlineExperience.ts';
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function receiptTimeZone(event:any) {
  for (const zone of [event.timezone, event.attendee_settings?.onlineExperience?.timeZone, 'UTC']) {
    try { if (zone) { new Intl.DateTimeFormat('en', {timeZone:zone}).format(); return zone; } } catch { /* Try the next explicit fallback. */ }
  }
  return 'UTC';
}

export function registrationAgendaHtml(sessions:any[], zone:string) {
  if (!sessions.length) return '';
  const day = new Intl.DateTimeFormat('en', {timeZone:zone,weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const dateKey = new Intl.DateTimeFormat('en-CA', {timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
  const clock = new Intl.DateTimeFormat('en', {timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:false});
  const parsed = (value:any) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value) : null;
  const groups = new Map<string,{date:Date|null,sessions:any[]}>();
  const ordered = [...sessions].sort((a,b) => {
    const at=parsed(a.starts_at)?.getTime()??Infinity, bt=parsed(b.starts_at)?.getTime()??Infinity;
    const ao=typeof a.sort_order==='number'?a.sort_order:Infinity, bo=typeof b.sort_order==='number'?b.sort_order:Infinity;
    return (at===bt?0:at<bt?-1:1) || (ao===bo?0:ao<bo?-1:1) || String(a.title||'').localeCompare(String(b.title||''),'en',{numeric:true}) || String(a.id).localeCompare(String(b.id));
  });
  for (const session of ordered) {
    const date=parsed(session.starts_at), key=date?dateKey.format(date):'undated';
    if (!groups.has(key)) groups.set(key,{date,sessions:[]});
    groups.get(key)!.sessions.push(session);
  }
  return `<h2 style="font-size:21px;color:#0b2641;margin:0 0 8px">Your selected agenda</h2><p style="font-size:12px;line-height:1.6;color:#64748b;margin:0 0 18px">${sessions.length} ${sessions.length===1?'session':'sessions'} selected &middot; Times shown in ${escape(zone.replace(/_/g,' '))}</p>${[...groups.values()].map(group=>`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dce5ec;border-radius:10px;margin:0 0 18px"><tr><td style="background:#eaf4ff;padding:12px 16px;color:#0b2641;font-size:13px;font-weight:700">${group.date?escape(day.format(group.date)):'Date to be announced'}</td></tr>${group.sessions.map(session=>{
    const start=parsed(session.starts_at), end=parsed(session.ends_at);
    return `<tr><td style="padding:16px;border-top:1px solid #e1e9f0"><p style="font-size:13px;color:#087fea;font-weight:700;margin:0 0 6px">${start?escape(clock.format(start)):'Time to be announced'}${end?` &ndash; ${escape(clock.format(end))}`:''}</p><p style="color:#0b2641;font-size:15px;line-height:1.5;font-weight:700;margin:0">${escape(session.title||'Session')}</p>${session.location?`<p style="font-size:12px;color:#64748b;line-height:1.6;margin:6px 0 0">${escape(session.location)}</p>`:''}</td></tr>`;
  }).join('')}</table>`).join('')}`;
}

export function registrationReceiptHtml({event,attendee,sessions,origin,accessLink}:{event:any;attendee:any;sessions:any[];origin:string;accessLink?:string}) {
  const qr=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(attendee.id)}`;
  const link=accessLink||`${origin}/event/${event.id}/register`;
  const agenda=registrationAgendaHtml(sessions,receiptTimeZone(event));
  const online=renderOnlineEmail(event,attendee.name||'Attendee',`${origin}/event/${event.id}/access`,accessLink||null,qr,agenda);
  if (online) return online;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Registration confirmed</title><style>@media(max-width:480px){.receipt-pad{padding-left:22px!important;padding-right:22px!important}}</style></head><body style="margin:0;background:#edf2f6;font-family:Arial,Helvetica,sans-serif;color:#0b2641"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">Your registration for ${escape(event.name)} is confirmed. Your check-in pass and selected agenda are inside.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf2f6"><tr><td align="center" style="padding:24px 12px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:600px;border:1px solid #dce5ec;border-radius:16px;overflow:hidden">
<tr><td class="receipt-pad" bgcolor="#0b2641" style="padding:26px 34px;border-bottom:4px solid #38bdf8;font-size:29px;font-weight:800;letter-spacing:-1px;color:#ffffff">eventra<span style="color:#38bdf8">.</span></td></tr>
<tr><td class="receipt-pad" style="padding:30px 34px 24px"><p style="font-size:11px;letter-spacing:1px;font-weight:700;color:#187460;margin:0 0 12px">REGISTRATION CONFIRMED</p><h1 style="font-size:28px;line-height:1.3;color:#0b2641;margin:0 0 16px;word-break:break-word">${escape(event.name)}</h1><p style="font-size:15px;color:#526579;line-height:1.7;margin:0">Hi ${escape(attendee.name||'Attendee')}, your place is confirmed. Keep this email for check-in and your selected program.</p>${event.location_address?`<p style="font-size:13px;line-height:1.6;color:#526579;margin:14px 0 0">${escape(event.location_address)}</p>`:''}</td></tr>
<tr><td class="receipt-pad" style="padding:0 34px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f8fb" style="border:1px solid #e1e9f0;border-radius:12px"><tr><td align="center" style="padding:24px"><h2 style="font-size:18px;margin:0 0 18px;color:#0b2641">Your check-in pass</h2><img src="${escape(qr)}" width="180" height="180" alt="Event check-in QR code" style="display:block;border:10px solid #ffffff;background:#ffffff">${attendee.meta?.confirmation_code?`<p style="font-size:16px;font-family:monospace;color:#0b2641;letter-spacing:2px;margin:16px 0 0">${escape(attendee.meta.confirmation_code)}</p>`:''}<p style="font-size:12px;line-height:1.6;color:#64748b;margin:14px 0 0">Show this code at the entrance.</p></td></tr></table></td></tr>
${agenda?`<tr><td class="receipt-pad" style="padding:0 34px 12px">${agenda}</td></tr>`:''}
<tr><td class="receipt-pad" style="padding:0 34px 30px">${accessLink?'<h2 style="font-size:20px;margin:0 0 10px;color:#0b2641">Prepare for your B2B meetings</h2><p style="font-size:14px;line-height:1.7;color:#526579;margin:0 0 20px">Complete your profile and arrange your conversations before the event.</p>':''}<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#087fea" style="border-radius:8px;mso-padding-alt:15px 24px"><a href="${escape(link)}" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none">${accessLink?'Open my networking space':'View my event'}</a></td></tr></table>${accessLink?'<p style="font-size:11px;line-height:1.6;color:#64748b;margin:14px 0 0">This link may sign you in. Keep it private. If it expires, request a fresh sign-in link from your event networking page.</p>':''}</td></tr>
<tr><td class="receipt-pad" style="padding:20px 34px;border-top:1px solid #e1e9f0;color:#74869a;font-size:11px;line-height:1.6">Sent via Eventra &middot; Keep your check-in pass private.</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}

export async function sendRegistrationReceipt(db:any,attendeeId:string,event:any,env:(key:string)=>string|undefined,fetchImpl:typeof fetch=fetch):Promise<'sent'|'skipped'|'failed'> {
  try {
    const key=env('EVENTRA_REGISTRATION_RESEND_API_KEY')||env('RESEND_API_KEY');
    const origin=env('EVENTRA_APP_ORIGIN');
    if(!key||!origin)return 'failed';
    const base=new URL(origin);if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash)return 'failed';
    const {data:a,error:ae}=await db.from('event_attendees').select('*').eq('id',attendeeId).eq('event_id',event.id).single();
    if(ae||!a||!['registered','approved','checked_in'].includes(a.status))return 'failed';
    const {data:settings,error:se}=await db.from('event_notification_settings').select('is_email_enabled').eq('event_id',event.id).eq('trigger_type','event_registration').maybeSingle();
    if(se)return 'failed';
    // B2B sign-in access is operational, independent of optional receipt settings.
    const access=!!a.profile_id && a.meta?.b2bOptIn===true;
    if(settings?.is_email_enabled===false&&!access)return 'skipped';
    if(access){
      const {data:identity,error:ie}=await db.auth.admin.getUserById(a.profile_id);
      if(ie||identity?.user?.email?.toLowerCase()!==a.email?.toLowerCase())return 'failed';
    }
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`registration-v1:${a.id}:${access?'access':'receipt'}`));
    const dedup=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
    const {data:existing,error:ee}=await db.from('platform_mail_deliveries').select('mail,state').eq('dedup_key',dedup).maybeSingle();
    if(ee)return 'failed';if(existing?.state==='sent')return 'sent';
    let mail=existing?.mail;
    if(mail && (mail.to?.length!==1 || mail.to[0]?.toLowerCase()!==a.email?.toLowerCase()))return 'failed';
    if(!mail){
      const {data:preparing,error:preparationError}=await db.rpc('claim_registration_preparation',{p_key:dedup});
      if(preparationError||preparing!==true)return 'failed';
      let accessLink:string|undefined;
      if(access){
        const {data:identity,error:ie}=await db.auth.admin.getUserById(a.profile_id);
        if(ie||identity?.user?.email?.toLowerCase()!==a.email?.toLowerCase())return 'failed';
        const destination=`${base.origin}/event/${event.id}/networking`;
        const {data,error}=await db.auth.admin.generateLink({type:'magiclink',email:identity.user.email,options:{redirectTo:`${base.origin}/auth/callback?next=${encodeURIComponent(destination)}`}});
        if(error||!data?.properties?.action_link)return 'failed';accessLink=data.properties.action_link;
      }
      const {data:booked,error:be}=await db.from('event_attendee_sessions').select('session_id').eq('attendee_id',a.id);if(be)return 'failed';
      const {data:sessions,error:pe}=booked?.length?await db.from('event_sessions').select('id,title,starts_at,ends_at,location,sort_order').eq('event_id',event.id).in('id',booked.map((s:any)=>s.session_id)):{data:[],error:null};if(pe)return 'failed';
      mail={from:env('EVENTRA_MAIL_FROM')||'Eventra <contact@eventra.cloud>',to:[a.email],subject:`Registration confirmed${access?' + Eventra access':''}: ${event.name}`,html:registrationReceiptHtml({event,attendee:a,sessions:sessions||[],origin:base.origin,accessLink})};
    }
    const {data:lease,error:le}=await db.rpc('claim_platform_mail',{p_key:dedup,p_actor:null,p_mail:mail});
    if(le)return 'failed';if(lease?.sent)return 'sent';if(!lease?.token)return 'failed';
    let provider:string|null=null;let permanent=false;
    try {
      const result=await fetchImpl('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`eventra-platform/${lease.id}`},body:JSON.stringify(lease.mail)});
      const body=await result.json().catch(()=>({}));provider=result.ok&&typeof body.id==='string'?body.id:null;
      permanent=!result.ok && result.status<500 && ![408,429].includes(result.status) && !(result.status===409&&body.name==='concurrent_idempotent_requests');
    }catch{/* Uncertain acceptance is retried with the same payload and provider key. */}
    const {data:ack,error:fe}=await db.rpc('finish_platform_mail',{p_id:lease.id,p_token:lease.token,p_provider:provider,p_permanent:permanent});
    return !fe&&ack&&provider?'sent':'failed';
  }catch{return 'failed';}
}

export async function sendRegistrationCapacityAlert(db:any,event:any,env:(key:string)=>string|undefined,fetchImpl:typeof fetch=fetch):Promise<void> {
  try {
    const owner=event.owner_id||event.organizer_id;
    const origin=env('EVENTRA_APP_ORIGIN'),key=env('EVENTRA_REGISTRATION_RESEND_API_KEY')||env('RESEND_API_KEY');
    if(!owner||!origin||!key)return;
    const base=new URL(origin);if(base.protocol!=='https:'||base.username||base.password)return;
    let capacity=Number(event.capacity_limit);
    if(!(capacity>0)){
      const {data:tickets,error}=await db.from('event_tickets').select('quantityTotal').eq('event_id',event.id);if(error)return;
      capacity=(tickets||[]).reduce((sum:number,t:any)=>sum+Math.max(0,Number(t.quantityTotal)||0),0);
    }
    if(!(capacity>0))return;
    const {count,error}=await db.from('event_attendees').select('id',{head:true,count:'exact'}).eq('event_id',event.id).in('status',['registered','approved','checked_in']);
    if(error||!count||count/capacity<0.8)return;
    const threshold=count>=capacity?100:80;
    const {data:identity,error:ae}=await db.auth.admin.getUserById(owner);if(ae||!identity?.user?.email)return;
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`capacity-v1:${event.id}:${capacity}:${threshold}`));
    const dedup=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
    const mail={from:env('EVENTRA_MAIL_FROM')||'Eventra <contact@eventra.cloud>',to:[identity.user.email],subject:`Registration capacity update: ${event.name}`,html:renderBrandedNotice({title:'Your event is filling up',body:`${event.name} has reached ${threshold}% of its registration capacity.`,url:base.origin+'/manage-event/'+event.id,action:'View registrations',category:'EVENT MANAGEMENT',details:[['Event',event.name],['Registered',String(count)],['Capacity',String(capacity)]]})};
    const {data:lease,error:le}=await db.rpc('claim_platform_mail',{p_key:dedup,p_actor:null,p_mail:mail});if(le||lease?.sent||!lease?.token)return;
    let provider=null;
    try{const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`eventra-platform/${lease.id}`},body:JSON.stringify(lease.mail)});const data=await response.json();if(response.ok&&typeof data.id==='string')provider=data.id;}catch{/* Stable retry on a later registration. */}
    await db.rpc('finish_platform_mail',{p_id:lease.id,p_token:lease.token,p_provider:provider,p_permanent:false});
  }catch{/* Optional organizer alert must not undo a saved registration. */}
}

export async function notifyRegistrationOwner(db:any,event:any,attendeeId:string):Promise<void> {
  try {
  const owner=event.owner_id||event.organizer_id;if(!owner)return;
  const {data:settings,error}=await db.from('event_notification_settings').select('is_bell_enabled').eq('event_id',event.id).eq('trigger_type','event_registration').maybeSingle();
  if(error||settings?.is_bell_enabled===false)return;
  await db.from('notifications').upsert({recipient_id:owner,actor_id:null,type:'system',title:'New event registration',body:'A participant has registered. Open attendee management for details.',action_url:`/manage-event/${event.id}?tab=attendees`,source_key:`registration:${attendeeId}`},{onConflict:'source_key'});
  } catch { /* Optional organizer notification must not turn saved registration into failure. */ }
}
