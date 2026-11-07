import { renderOnlineEmail } from './onlineExperience.ts';
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function registrationReceiptHtml({event,attendee,sessions,origin,accessLink}:{event:any;attendee:any;sessions:any[];origin:string;accessLink?:string}) {
  const qr=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(attendee.id)}`;
  const link=accessLink||`${origin}/event/${event.id}/register`;
  const online=renderOnlineEmail(event,attendee.name||'Attendee',`${origin}/event/${event.id}/access`,accessLink||null,qr);
  const agenda=sessions.length?`<h2>Your selected sessions</h2><ul>${sessions.map(s=>`<li>${escape(s.title)}</li>`).join('')}</ul>`:'';
  return (online||`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#153047"><h1>Registration confirmed</h1><h2>${escape(event.name)}</h2><p>Hello ${escape(attendee.name)}, your registration is saved.</p><p><a href="${escape(link)}">${accessLink?'Open Eventra and sign in':'View event registration'}</a></p><p>${escape(attendee.meta?.confirmation_code)}</p><img src="${escape(qr)}" width="180" height="180" alt="Event check-in code" /></div>`)+agenda;
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
      const {data:sessions,error:pe}=booked?.length?await db.from('event_sessions').select('id,title').eq('event_id',event.id).in('id',booked.map((s:any)=>s.session_id)):{data:[],error:null};if(pe)return 'failed';
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
    const mail={from:env('EVENTRA_MAIL_FROM')||'Eventra <contact@eventra.cloud>',to:[identity.user.email],subject:`Registration capacity update: ${event.name}`,html:`<h1>Eventra</h1><p>${escape(event.name)} has reached ${threshold}% of its registration capacity.</p><a href="${escape(base.origin+'/manage-event/'+event.id)}">View registrations</a>`};
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
