import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

const copy = {
 en: { title: 'Meeting email delivery', queued: 'Queued', sending: 'Processing', sent: 'Provider accepted', failed: 'Retry scheduled', suppressed: 'Obsolete / disabled', reconcile: 'Needs review', retry: 'Retry safely', error: 'Delivery status unavailable', note: 'Tracks new ordinary meeting emails. Provider acceptance does not confirm inbox delivery. Historical emails and investor-review emails are separate.', waiting: 'Oldest waiting since' },
 fr: { title: 'Envoi des e-mails de rendez-vous', queued: 'En attente', sending: 'En cours', sent: 'Accepté par le prestataire', failed: 'Nouvel essai prévu', suppressed: 'Obsolète / désactivé', reconcile: 'À vérifier', retry: 'Réessayer', error: 'Suivi des envois indisponible', note: 'Suivi des nouveaux e-mails de rencontres ordinaires. L’acceptation ne garantit pas la réception. Les anciens envois et le circuit investisseurs sont séparés.', waiting: 'Plus ancien en attente depuis' },
 ar: { title: 'إرسال رسائل الاجتماعات', queued: 'في الانتظار', sending: 'قيد الإرسال', sent: 'قبله مزود البريد', failed: 'إعادة محاولة مجدولة', suppressed: 'قديم / معطل', reconcile: 'يحتاج مراجعة', retry: 'إعادة المحاولة', error: 'حالة الإرسال غير متاحة', note: 'يتتبع رسائل الاجتماعات العادية الجديدة. قبول المزود لا يؤكد وصول الرسالة. الرسائل السابقة ورسائل مراجعة المستثمرين منفصلة.', waiting: 'أقدم رسالة تنتظر منذ' }
};

export default function MeetingDeliveryMonitor({ eventId }: { eventId: string }) {
 const { locale } = useI18n();
 const c = copy[locale];
 const [report, setReport] = useState<any>(null);
 const [error, setError] = useState(false);
 const [revision, setRevision] = useState(0);
 const [retrying, setRetrying] = useState<string | null>(null);
 useEffect(() => {
   let cancelled = false;
   const refresh = async () => {
     if (document.visibilityState === 'hidden') return;
     const { data, error } = await supabase.rpc('get_meeting_delivery_status', { p_event: eventId });
     if (cancelled) return;
     if (error?.code === 'PGRST202') { setReport(null); return; }
     setError(!!error);
     if (!error) setReport(data);
   };
   setReport(null); void refresh();
   const interval = setInterval(refresh, 30000);
   window.addEventListener('focus', refresh);
   return () => { cancelled = true; clearInterval(interval); window.removeEventListener('focus', refresh); };
 }, [eventId, revision]);
 if (!report && !error) return null;
 return <details style={{ marginTop: 16, padding: 16, border: '1px solid #345069', borderRadius: 12, color: '#CBD5E1' }}>
   <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{c.title}{report ? ` · ${(report.counts?.failed || 0) + (report.counts?.reconcile || 0)} ${c.reconcile}` : ''}</summary>
   {error && <p role="alert">{c.error}</p>}
   {report && <>
     {(!report.worker_checked_at || Date.now() - Date.parse(report.worker_checked_at) > 300000) && <p role="alert" style={{ color: '#FBBF24', marginTop: 12 }}>
       {{ en: 'Delivery worker has not checked in within five minutes. Check the scheduler before relying on email delivery.', fr: 'Aucun signal du service d’envoi depuis cinq minutes. Vérifiez le planificateur avant de compter sur les envois.', ar: 'لم يتم رصد خدمة الإرسال خلال خمس دقائق. تحقق من المجدول قبل الاعتماد على إرسال البريد.' }[locale]}
     </p>}
     <p style={{ fontSize: 12, margin: '12px 0' }}>{c.note}</p>
     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>{(['queued','sending','sent','failed','suppressed','reconcile'] as const).map(state => <span key={state}>{c[state]}: <strong>{report.counts?.[state] || 0}</strong></span>)}</div>
     {report.oldest_waiting && <p style={{ marginTop: 12 }}>{c.waiting}: {new Date(report.oldest_waiting).toLocaleString(locale)}</p>}
     <ul style={{ marginTop: 12 }}>{(report.recent || []).filter((job: any) => ['failed','reconcile'].includes(job.state)).map((job: any) => <li key={job.id} style={{ marginTop: 8 }}>
       #{job.meeting_id.slice(-5).toUpperCase()} · {c[job.state as 'failed' | 'reconcile']} · {job.error_code}
       {job.can_retry && <button disabled={retrying !== null} style={{ marginInlineStart: 12, padding: '4px 10px', background: '#17334D', borderRadius: 6 }} onClick={async () => {
         setRetrying(job.id);
         try { const { data, error } = await supabase.rpc('retry_meeting_delivery', { p_job: job.id }); setError(!!error || data !== true); if (!error && data) setRevision(v => v + 1); }
         finally { setRetrying(null); }
       }}>{c.retry}</button>}
     </li>)}</ul>
   </>}
 </details>;
}
