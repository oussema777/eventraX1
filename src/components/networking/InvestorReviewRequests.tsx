import BookMeetingModal from './BookMeetingModal';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { investorCapabilities, investorFailure, investorRpc, type BookingReviewRequest } from '../../lib/investorReview';
import { networkingTimeZone } from '../../utils/networkingSchedule';
import { investorReviewCopy } from './investorReviewCopy';
import './InvestorReview.css';

export default function InvestorReviewRequests({ eventId, reviewer = false }: { eventId?: string; reviewer?: boolean }) {
  const { user } = useAuth(); const { locale } = useI18n(); const c = investorReviewCopy[locale] || investorReviewCopy.en;
  const [editing, setEditing] = useState<BookingReviewRequest | null>(null);
  const [note, setNote] = useState<Record<string,string>>({});
  const self = useQuery({queryKey:['review-editor-profile',user?.id],enabled:!!editing&&!!user,queryFn:async()=>{const {data,error}=await supabase.from('profiles').select('*').eq('id',user!.id).single();if(error)throw error;return data;}});
  const [page, setPage] = useState(0); const [busy, setBusy] = useState(''); const [error, setError] = useState(''); const [reasons, setReasons] = useState<Record<string,string>>({});
  useEffect(() => { setEditing(null); setNote({}); setReasons({}); setError(''); setPage(0); }, [user?.id,eventId,reviewer]);
  const capabilities = useQuery({ queryKey: ['investor-capabilities', eventId, user?.id], enabled: reviewer && !!eventId && !!user, queryFn: () => investorCapabilities(eventId!), retry: false });
  const allowed = !reviewer || !!capabilities.data?.enabled && capabilities.data.can_review;
  const requests = useQuery({ queryKey: ['investor-requests', eventId, user?.id, reviewer, page], enabled: !!user && allowed, retry: false, queryFn: async () => {
    let query = supabase.from('event_booking_requests').select('id,event_id,requester_id,recipient_id,starts_at,ends_at,format,message,state,revision,requester_reason,meeting_id,created_by').order('created_at', { ascending: false }).range(page*20, page*20+19);
    if (eventId) query = query.eq('event_id',eventId);
    if (reviewer) query = query.eq('state','awaiting_review'); else query = query.eq('requester_id',user!.id);
    const { data, error: failure } = await query;
    if (failure && ['PGRST205','42P01'].includes(failure.code)) return { notes: [] as {id:string;request_id:string;body:string;created_at:string}[], items: [] as BookingReviewRequest[], profiles: [] as {id:string;full_name:string;company:string}[], zones: new Map<string,string>(), meetings: new Map<string,string>() };
    if (failure) throw failure;
    const items = data as BookingReviewRequest[];
    const ids = [...new Set(items.flatMap(item => [item.requester_id,item.recipient_id]).filter(Boolean))];
    const events = [...new Set(items.map(item => item.event_id))];
    const meetingIds = items.map(item=>item.meeting_id).filter((id): id is string=>!!id);
    const [profiles,eventRows,venues,meetings] = await Promise.all([
      ids.length ? supabase.from('profiles').select('id,full_name,company').in('id',ids) : Promise.resolve({data:[],error:null}),
      events.length ? supabase.from('events').select('id,timezone').in('id',events) : Promise.resolve({data:[],error:null}),
      events.length ? supabase.from('event_b2b_settings').select('event_id,venue_config').in('event_id',events) : Promise.resolve({data:[],error:null}),
      meetingIds.length ? supabase.from('event_b2b_meetings').select('id,status').in('id',meetingIds) : Promise.resolve({data:[],error:null}),
    ]);
    if (profiles.error || eventRows.error || venues.error || meetings.error) throw profiles.error || eventRows.error || venues.error || meetings.error;
    const notes=reviewer&&items.length?await supabase.from('event_booking_review_notes').select('id,request_id,body,created_at').in('request_id',items.map(i=>i.id)).order('created_at',{ascending:false}).limit(100):{data:[],error:null};
    if(notes.error)throw notes.error;
    return { notes:notes.data||[], items, profiles: profiles.data || [], zones: new Map(events.map(id => [id,networkingTimeZone(id,venues.data?.find(v => v.event_id===id)?.venue_config,eventRows.data?.find(e=>e.id===id)?.timezone)])), meetings:new Map((meetings.data || []).map(m=>[m.id,m.status])) };
  }});
  if (!user || !allowed || (!reviewer && page===0 && !requests.isError && !requests.data?.items.length)) return null;
  const report = async () => {try {const data=await investorRpc('get_event_review_report',{p_event:eventId});const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='meeting-review-report.json';link.click();URL.revokeObjectURL(url);}catch{setError(c.failed);}};
  const act = async (item: BookingReviewRequest, decision: string) => {
    if (busy) return; setBusy(item.id); setError('');
    try {
      if (decision==='withdraw') await investorRpc('withdraw_investor_booking',{p_request:item.id,p_revision:item.revision});
      else await investorRpc('decide_investor_booking',{p_request:item.id,p_revision:item.revision,p_decision:decision,p_reason:reasons[item.id] || ''});
      await requests.refetch();
    } catch (failure) { setError(c[investorFailure(failure) as keyof typeof c]); await requests.refetch(); }
    finally { setBusy(''); }
  };
  return <section className="investor-review" dir={locale==='ar'?'rtl':'ltr'} aria-label={reviewer?c.queue:c.outgoing}><h2>{reviewer?c.queue:c.outgoing}</h2>
    <div className="investor-review__actions investor-review__toolbar">{reviewer && <button onClick={()=>void report()}>{c.exportReport}</button>}
    <button disabled={!!busy || requests.isFetching} onClick={()=>void requests.refetch()}>{c.refresh}</button></div>
    {(error || requests.isError) && <p role="alert" className="investor-review__notice investor-review__error">{error || c.failed}<button onClick={()=>void requests.refetch()}>{c.retry}</button></p>}
    {requests.isLoading ? <p role="status">{c.loading}</p> : !requests.data?.items.length ? <p>{c.empty}</p> : <div className="investor-review__list">{requests.data.items.map(item=>{
      const requester=requests.data.profiles.find(p=>p.id===item.requester_id); const recipient=requests.data.profiles.find(p=>p.id===item.recipient_id);
      const zone=requests.data.zones.get(item.event_id) || 'UTC';
      const meetingState=item.meeting_id ? requests.data.meetings.get(item.meeting_id) : null;
      const status = item.state==='forwarded' && meetingState==='confirmed' ? c.meetingConfirmed : item.state==='forwarded' && meetingState==='cancelled' ? c.meetingCancelled : item.state==='forwarded' && meetingState==='completed' ? c.meetingCompleted : c[item.state as keyof typeof c] || item.state;
      return <article className="investor-review__card" key={item.id}><div className="investor-review__meta">
        {reviewer && <div><p>{c.from}</p><Link className="investor-review__link" to={`/event/${item.event_id}/profile/${item.requester_id}`}>{requester?.full_name || c.viewProfile}{requester?.company ? ` · ${requester.company}` : ''}</Link></div>}
        <div><p>{c.to}</p><Link className="investor-review__link" to={`/event/${item.event_id}/profile/${item.recipient_id}`}>{recipient?.full_name || c.viewRecipient}</Link></div>
      </div><p><time dateTime={item.starts_at}>{new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',timeZone:zone}).format(new Date(item.starts_at))}</time> · {zone}</p>
        <p>{item.format==='video' ? c.video : item.format==='hybrid' ? c.hybrid : c.inPerson} · {new Intl.NumberFormat(locale,{style:'unit',unit:'minute',unitDisplay:'long'}).format(Math.round((Date.parse(item.ends_at)-Date.parse(item.starts_at))/60000))}</p>
        <strong>{status}</strong><p className="investor-review__purpose">{item.message || c.noPurpose}</p>
        {item.requester_reason && <p>{item.requester_reason}</p>}
        {reviewer ? <>{requests.data.notes.filter(n=>n.request_id===item.id).map(n=><p className="investor-review__notice" key={n.id}>{c.privateNote}: {n.body}</p>)}<label>{c.privateNote}<textarea maxLength={4000} value={note[item.id]||''} onChange={e=>setNote(n=>({...n,[item.id]:e.target.value}))} /></label><button disabled={!!busy||!note[item.id]?.trim()} onClick={async()=>{setBusy(item.id);try{await investorRpc('add_review_note',{p_request:item.id,p_body:note[item.id]});setNote(n=>({...n,[item.id]:''}));await requests.refetch();}catch{setError(c.failed);}finally{setBusy('');}}}>{c.saveNote}</button><label>{c.reason}<textarea maxLength={2000} value={reasons[item.id] || ''} disabled={!!busy} onChange={e=>setReasons(current=>({...current,[item.id]:e.target.value}))} /></label>
          <div className="investor-review__actions"><button className="investor-review__primary" disabled={!!busy || [item.requester_id,item.recipient_id,item.created_by].includes(user.id)} onClick={()=>void act(item,'approve')}>{busy===item.id?c.working:c.approve}</button><button disabled={!!busy || [item.requester_id,item.recipient_id,item.created_by].includes(user.id)} onClick={()=>void act(item,'reject')}>{c.reject}</button></div>
          {[item.requester_id,item.recipient_id,item.created_by].includes(user.id) && <p>{c.selfReview}</p>}
        </> : ['awaiting_review','needs_new_slot'].includes(item.state) && <div className="investor-review__actions"><button disabled={!!busy} onClick={()=>setEditing(item)}>{c.needs_new_slot}</button><button disabled={!!busy} onClick={()=>void act(item,'withdraw')}>{busy===item.id?c.working:c.withdraw}</button></div>}
      </article>;
    })}</div>}
    {(page>0 || requests.data?.items.length===20) && <nav className="investor-review__actions" aria-label={reviewer?c.queue:c.outgoing}><button aria-label={locale==='fr'?'Page précédente':locale==='ar'?'الصفحة السابقة':'Previous page'} disabled={page===0 || !!busy} onClick={()=>setPage(value=>value-1)}>←</button><span>{page+1}</span><button aria-label={locale==='fr'?'Page suivante':locale==='ar'?'الصفحة التالية':'Next page'} disabled={requests.data?.items.length!==20 || !!busy} onClick={()=>setPage(value=>value+1)}>→</button></nav>}
    {editing && self.data && <BookMeetingModal isOpen eventId={editing.event_id} currentUser={{...user,...self.data}} recipient={{id:editing.recipient_id,name:requests.data?.profiles.find(p=>p.id===editing.recipient_id)?.full_name||c.viewRecipient}} reviewRequest={{id:editing.id,revision:editing.revision}} onClose={()=>{setEditing(null);void requests.refetch();}} />}
    {editing && self.isError && <p role="alert">{c.failed}</p>}
  </section>;
}
