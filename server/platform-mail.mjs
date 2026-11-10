import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createResendSender } from '../scripts/lib/review-delivery.mjs';
import { renderBrandedNotice } from '../supabase/functions/_shared/emailBrand.mjs';

const idPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class MailError extends Error { constructor(status,message){super(message);this.status=status;} }
const requireValue=(value)=>{if(!value)throw new MailError(403,'Email action not allowed');return value;};
async function row(query){const {data,error}=await query; if(error)throw new MailError(503,'Email data unavailable');return data;}

// Only this dispatcher determines recipients, content and links. The user client
// is used for existing role RPCs; service reads happen after explicit checks.
export async function authorizePlatformMail({command,actor,db,userDb,origin}) {
  if(!command || typeof command!=='object' || Array.isArray(command)
    || Object.keys(command).some(k=>!['kind','entityId','recipientId','subject','message','channel'].includes(k))
    || typeof command.kind!=='string' || !idPattern.test(command.entityId)) throw new MailError(400,'Invalid email command');
  const {kind,entityId,recipientId}=command;
  if(command.channel!==undefined&&!['email','bell','both'].includes(command.channel))throw new MailError(400,'Invalid delivery channel');
  if(recipientId!==undefined && !idPattern.test(recipientId))throw new MailError(400,'Invalid recipient reference');
  if(kind!=='broadcast' && (command.subject!==undefined || command.message!==undefined))throw new MailError(400,'Content is server generated');
  const base=new URL(origin);
  if(base.protocol!=='https:' || base.username || base.password || base.pathname!=='/' || base.search || base.hash)throw new MailError(503,'Email origin not configured');
  let target, notificationRecipient, email, title, body, settingEvent, settingTrigger, path='/my-networking', revision='';
  const details=[];
  const can=async(event,permission)=>requireValue(await row(userDb.rpc('event_can',{p_event_id:event,p_permission:permission}))===true);
  const profileEmail=async id=>{
    const {data,error}=await db.auth.admin.getUserById(id);
    if(error || !data?.user?.email)throw new MailError(409,'Recipient unavailable');return data.user.email;
  };
  if(kind==='welcome') {
    requireValue(entityId===actor.id);target=actor.id;title='Welcome to Eventra';body='Your account is ready. Open your profile to complete your details.';path=`/profile/${actor.id}`;
  } else if(kind==='meeting') {
    const m=requireValue(await row(db.from('event_b2b_meetings').select('*').eq('id',entityId).maybeSingle()));
    requireValue([m.profile_a_id,m.profile_b_id].includes(actor.id) || await row(userDb.rpc('event_can',{p_event_id:m.event_id,p_permission:'b2b'}))===true);
    requireValue([m.profile_a_id,m.profile_b_id].includes(recipientId));
    const permit=await row(db.from('event_review_meeting_permits').select('meeting_id').eq('meeting_id',entityId).maybeSingle());
    if(permit) return {managed:true}; // Only transactional outbox can deliver protected invitations.
    for(const side of ['a','b'])if(await row(db.rpc('platform_mail_investor_protected',{p_event:m.event_id,p_attendee:m[`attendee_${side}_id`],p_profile:m[`profile_${side}_id`]})))return {managed:true};
    // New meetings are queued in the booking transaction; never send a second copy.
    if (Number(m.notification_revision || 0) > 0) return { queued: true };
    requireValue(['pending','confirmed','cancelled'].includes(m.status) && m.start_at);
    target=recipientId;title=m.status==='pending'?'Meeting invitation':m.status==='confirmed'?'Meeting confirmed':'Meeting cancelled';
    body='Open Eventra to see the current meeting details and available actions.';path=`/event/${m.event_id}/networking`;
    revision=JSON.stringify([m.status,m.start_at,m.end_at,m.meta]);
    settingEvent=m.event_id;settingTrigger='meeting_booked';
    const event=await row(db.from('events').select('name,timezone').eq('id',m.event_id).maybeSingle());
    const partner=await row(db.from('profiles').select('full_name').eq('id',recipientId===m.profile_a_id?m.profile_b_id:m.profile_a_id).maybeSingle());
    if(event?.name)details.push(['Event',event.name]);
    if(partner?.full_name)details.push(['With',partner.full_name]);
    let zone='UTC';try{if(event?.timezone){new Intl.DateTimeFormat('en',{timeZone:event.timezone}).format();zone=event.timezone;}}catch{/* Explicit UTC fallback for invalid legacy settings. */}
    if(Number.isFinite(Date.parse(m.start_at))){
      const format=new Intl.DateTimeFormat('en',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:false});
      details.push(['Date',new Intl.DateTimeFormat('en',{timeZone:zone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(m.start_at))],['Time',format.format(new Date(m.start_at))+(m.end_at&&Number.isFinite(Date.parse(m.end_at))?` – ${format.format(new Date(m.end_at))}`:'')],['Time zone',zone]);
    }
    if(m.location)details.push(['Location',m.location]);
  } else if(['broadcast','b2b_invite','b2b_matches','registration_cancelled'].includes(kind)) {
    const a=requireValue(await row(db.from('event_attendees').select('*').eq('id',entityId).maybeSingle()));
    await can(a.event_id,kind==='broadcast'?'manage':kind==='registration_cancelled'?'attendees':'b2b');
    email=a.email;target=a.id;notificationRecipient=a.profile_id||null;path=`/event/${a.event_id}`;
    const event=await row(db.from('events').select('name').eq('id',a.event_id).maybeSingle());
    if(event?.name)details.push(['Event',event.name]);
    if(kind==='registration_cancelled') {requireValue(['cancelled','rejected'].includes(a.status));title='Registration update';body='Your registration has been cancelled or declined. Open the event for details.';}
    else if(kind==='broadcast') {
      if(typeof command.subject!=='string'||typeof command.message!=='string'||command.subject.length>180||command.message.length>5000||!command.subject.trim()||!command.message.trim())throw new MailError(400,'Invalid broadcast');
      title=command.subject;body=command.message;
    } else {
      requireValue(['registered','approved','checked_in'].includes(a.status));
      if(kind==='b2b_matches') {
        // Protected recipient match notices must never advertise unreviewed invitations.
        const protectedRecipient=await row(db.rpc('platform_mail_investor_protected',{p_event:a.event_id,p_attendee:a.id,p_profile:a.profile_id}));
        if(protectedRecipient)return {managed:true};
      }
      title='Event networking';body=kind==='b2b_matches'?'Your networking suggestions are available in Eventra.':'Explore networking at your event. Sign in with your registration email.';path+=`/networking`;
    }
  } else if(['event_approved','event_rejected'].includes(kind)) {
    const admin=await row(db.from('profiles').select('role').eq('id',actor.id).maybeSingle());requireValue(admin?.role==='admin');
    const event=requireValue(await row(db.from('events').select('*').eq('id',entityId).maybeSingle()));
    requireValue(event.moderation_status===(kind==='event_approved'?'approved':'rejected'));
    target=event.owner_id||event.organizer_id;title='Event moderation update';body=`Your event has been ${kind==='event_approved'?'approved':'rejected'}. Open Eventra for details.`;path=`/manage-event/${event.id}`;
    details.push(['Event',event.name]);
  } else if(kind==='message') {
    const m=requireValue(await row(db.from('message_messages').select('id,thread_id,sender_id').eq('id',entityId).maybeSingle()));requireValue(m.sender_id===actor.id);
    const members=await row(db.from('message_thread_participants').select('profile_id').eq('thread_id',m.thread_id));
    requireValue(members.some(p=>p.profile_id===actor.id) && members.some(p=>p.profile_id===recipientId) && recipientId!==actor.id);
    target=recipientId;title='New message on Eventra';body='You have a new message. Sign in to read it.';path='/messages';
  } else if(['connection_request','connection_accepted','connection_declined'].includes(kind)) {
    const query=db.from('b2b_requests').select('id,sender_id,recipient_id,status').eq('sender_id',kind==='connection_request'?actor.id:entityId)
      .eq('recipient_id',kind==='connection_request'?entityId:actor.id).eq('status',kind==='connection_request'?'pending':kind==='connection_accepted'?'accepted':'declined').order('created_at',{ascending:false}).limit(1);
    const records=await row(query);requireValue(records?.length===1);target=entityId;revision=records[0].id;
    title=kind==='connection_request'?'Connection request':kind==='connection_accepted'?'Connection accepted':'Connection declined';body='Open Eventra to view your connections.';
  } else if(kind==='meeting_checkin') {
    const m=requireValue(await row(db.from('event_b2b_meetings').select('*').eq('id',entityId).maybeSingle()));await can(m.event_id,'checkin');
    requireValue(m.status==='confirmed' && [m.profile_a_id,m.profile_b_id].includes(recipientId));
    const arrivals=await row(db.from('event_checkins').select('id,attendee_id').eq('event_id',m.event_id).eq('meeting_id',m.id).eq('type','b2b'));
    const otherAttendee=recipientId===m.profile_a_id?m.attendee_b_id:m.attendee_a_id;
    requireValue(arrivals.some(a=>a.attendee_id===otherAttendee));
    revision=arrivals.filter(a=>a.attendee_id===otherAttendee).map(a=>a.id).sort()[0];
    target=recipientId;title='Meeting check-in update';body='Check your confirmed meeting in Eventra.';path=`/event/${m.event_id}/networking`;
  } else throw new MailError(400,'Unsupported email action');
  if(!email)email=await profileEmail(target);
  if(typeof email!=='string'|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new MailError(409,'Recipient unavailable');
  const url=new URL(path,base).href;
  // Keep the deployed dedup identity independent of presentation. Existing leases
  // return their frozen mail, so a theme change cannot duplicate or alter a retry.
  const legacyMail={to:[email],subject:title,text:`${body}\n\n${url}`,html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#153047"><h1>Eventra</h1><h2>${escape(title)}</h2><p style="white-space:pre-line">${escape(body)}</p><p><a href="${escape(url)}">Open Eventra</a></p></div>`};
  const key=createHash('sha256').update(JSON.stringify([kind,entityId,target,revision,legacyMail])).digest('hex');
  const actions={welcome:'Complete my profile',meeting:'View my meeting',message:'Read my message',broadcast:'View event',registration_cancelled:'View registration',b2b_invite:'Explore networking',b2b_matches:'View my matches',event_approved:'Manage my event',event_rejected:'Review my event',connection_request:'View connection request',connection_accepted:'View my connections',connection_declined:'View my connections',meeting_checkin:'View my meeting'};
  const mail={...legacyMail,text:`${body}\n\n${details.map(([label,value])=>`${label}: ${value}`).join('\n')}\n\n${url}`,html:renderBrandedNotice({title,body,url,action:actions[kind],details})};
  const settings=settingEvent ? await row(db.from('event_notification_settings').select('is_email_enabled,is_bell_enabled').eq('event_id',settingEvent).eq('trigger_type',settingTrigger).maybeSingle()) : null;
  return {mail,key,emailEnabled:settings?.is_email_enabled!==false,bellEnabled:settings?.is_bell_enabled!==false,notification:{recipient_id:notificationRecipient===undefined?target:notificationRecipient,actor_id:actor.id,type:'action',title,body,action_url:path,source_key:`platform:${key}`}};
}

export async function executePlatformMail({authorization,command,env=process.env,fetchImpl=fetch}) {
  if(!/^Bearer [^\s]+$/.test(authorization||''))throw new MailError(401,'Sign in required');
  const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','EVENTRA_APP_ORIGIN'];
  if(required.some(k=>!env[k]))throw new MailError(503,'Email service not configured');
  const options={auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>fetchImpl(url,{...init,signal:AbortSignal.timeout(15000)})}};
  const db=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,options);
  const userDb=createClient(env.SUPABASE_URL,env.SUPABASE_ANON_KEY,{...options,global:{...options.global,headers:{Authorization:authorization}}});
  const {data,error}=await db.auth.getUser(authorization.slice(7));
  if(error||!data?.user)throw new MailError(401,'Sign in required');
  const authorized=await authorizePlatformMail({command,actor:data.user,db,userDb,origin:env.EVENTRA_APP_ORIGIN});
  if(authorized.managed)return {success:true,managed:true};
  if(authorized.queued)return {success:true,queued:true};
  if(['bell','both'].includes(command.channel)&&authorized.bellEnabled&&authorized.notification.recipient_id){
    const {error:noticeError}=await db.from('notifications').upsert(authorized.notification,{onConflict:'source_key'});
    if(noticeError)throw new MailError(503,'Notification could not be saved');
  }
  if(command.channel==='bell'||!authorized.emailEnabled)return {success:true,skipped:!authorized.emailEnabled};
  if(!env.RESEND_API_KEY)throw new MailError(503,'Email service not configured');
  const from=env.EVENTRA_MAIL_FROM||'Eventra <contact@eventra.cloud>';
  const claimed=await row(db.rpc('claim_platform_mail',{p_key:authorized.key,p_actor:data.user.id,p_mail:{...authorized.mail,from}}));
  if(claimed.sent)return {success:true};
  if(!claimed.token)throw new MailError(409,'Email already being processed or requires reconciliation');
  const result=await createResendSender({apiKey:env.RESEND_API_KEY,fetchImpl})(claimed.mail,`eventra-platform/${claimed.id}`).catch(()=>({error:'NETWORK_ERROR'}));
  const saved=await row(db.rpc('finish_platform_mail',{p_id:claimed.id,p_token:claimed.token,p_provider:result.id||null,p_permanent:!!result.permanent}));
  if(!saved||!result.id)throw new MailError(503,'Email delivery not confirmed');
  return {success:true};
}

export async function platformMailHandler(req,res) {
  if(req.method==='OPTIONS'){res.status(204).end();return;}
  if(req.method!=='POST'){res.status(405).json({error:'Method not allowed'});return;}
  try {
    if(JSON.stringify(req.body??null).length>16384)throw new MailError(413,'Email command too large');
    res.status(200).json(await executePlatformMail({authorization:req.headers.authorization,command:req.body}));
  }
  catch(error){res.status(error instanceof MailError?error.status:503).json({error:error instanceof MailError?error.message:'Email service unavailable'});}
}
