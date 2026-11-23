import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Mail, Send } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { loadSessionRegistrations, resolveRosterPerson } from '../../lib/dashboardSessionRoster';
import { requestPlatformMail } from '../../lib/email';
import { resolveAgendaTimeZone } from '../../utils/agendaDates';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel, AlertDialogFooter,
} from '../ui/alert-dialog';

type Recipient = { id: string; email: string; name: string };
type Session = { id: string; title: string; location: string; starts_at: string | null };
type Delivery = { total: number; sent: number; skipped: number; failed: string[] };

async function loadAudience(eventId: string, sessionId: string | null) {
  const rows = await loadSessionRegistrations(eventId, sessionId);
  const addresses = new Map<string, Recipient>();
  let missing = 0;
  for (const row of rows.values()) {
    const { id, name, email } = resolveRosterPerson(row);
    const address = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) missing++;
    else if (!addresses.has(address)) addresses.set(address, { id, name, email });
  }
  return { people: [...addresses.values()], missing };
}

export default function SessionReminderDialog({ eventId, session, timeZone, onClose }: {
  eventId: string; session: Session | null; timeZone?: string; onClose: () => void;
}) {
  const { t, locale, isRTL } = useI18n();
  const [subject, setSubject] = useState(() => session ? t('sessionReminder.subjectDraft', { title: session.title }).slice(0, 180) : t('sessionReminder.allSubject'));
  const [message, setMessage] = useState(() => {
    if (!session) return t('sessionReminder.allMessage');
    const lines = [t('sessionReminder.bodyDraft', { title: session.title })];
    if (session.starts_at && Number.isFinite(Date.parse(session.starts_at))) {
      const zone = resolveAgendaTimeZone(timeZone, 'UTC');
      const date = new Intl.DateTimeFormat(locale, { timeZone: zone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(session.starts_at));
      lines.push(t('sessionReminder.when') + ' · ' + date + ' (' + zone + ')');
    }
    if (session.location && session.location !== 'TBD') lines.push(t('sessionReminder.where') + ' · ' + session.location);
    return lines.join('\n\n');
  });
  const audience = useQuery({
    queryKey: ['reminder-audience', eventId, session?.id], queryFn: () => loadAudience(eventId, session?.id ?? null),
    retry: false, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false,
  });
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [localPreview, setLocalPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const people = audience.data?.people || [];
  const send = async () => {
    if (busy.current || !people.length || !subject.trim() || !message.trim()) return;
    const ids = delivery ? delivery.failed : people.map(p => p.id);
    if (!ids.length) return;
    busy.current = true;
    setSending(true);
    let progress: Delivery = { sent: delivery?.sent || 0, skipped: delivery?.skipped || 0, total: delivery?.total || ids.length, failed: [] };
    setDelivery(progress);
    try {
      for (const recipientId of ids) {
        if (!mounted.current) break;
        const result = await requestPlatformMail({ kind: session ? 'session_reminder' : 'workshops_reminder', entityId: session?.id ?? eventId, recipientId,
          subject: subject.trim(), message: message.trim(), channel: 'email' });
        if (!mounted.current) break;
        if (result?.localPreview) {
          setLocalPreview(true);
          setDelivery(null);
          break;
        }
        if (!result?.success) progress = { ...progress, failed: [...progress.failed, recipientId] };
        else if (result.skipped) progress = { ...progress, skipped: progress.skipped + 1 };
        else progress = { ...progress, sent: progress.sent + 1 };
        setDelivery(progress);
      }
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  };
  const complete = !!delivery && !sending && !delivery.failed.length;
  return <Dialog open onOpenChange={open => { if (!open && !busy.current) onClose(); }}>
    <DialogContent className="session-reminder" dir={isRTL ? 'rtl' : 'ltr'} aria-busy={sending}>
      <header><DialogTitle>{t('sessionReminder.title')}</DialogTitle>
        <DialogDescription>{session?.title ?? t('sessionReminder.allAudience')}</DialogDescription></header>
      {audience.isLoading ? <p role="status">{t('sessionReminder.loading')}</p> : audience.isError ?
        <div role="alert">{t('eventImprovements.rosterError')} <button className="reminder-secondary" onClick={() => void audience.refetch()}>{t('eventImprovements.retry')}</button></div> : <>
        <details className="reminder-recipients"><summary><Mail size={16} />{t('sessionReminder.recipients', { count: people.length })}</summary>
          <ul>{people.map(p => <li key={p.id}>{p.name} <bdi>{p.email}</bdi></li>)}</ul>
        </details>
        {!!audience.data?.missing && <p>{t('sessionReminder.excluded', { count: audience.data.missing })}</p>}
        {people.length ? <>
          <label>{t('sessionReminder.subject')}<input value={subject} maxLength={180} readOnly={!!delivery} onChange={e => setSubject(e.target.value)} /></label>
          <label>{t('sessionReminder.message')}<textarea rows={6} value={message} maxLength={5000} readOnly={!!delivery} onChange={e => setMessage(e.target.value)} /></label>
          <p>{t('sessionReminder.hint')}</p>
        </> : <p role="status">{t('sessionReminder.empty')}</p>}
      </>}
      {localPreview && <p role="status">{t('sessionReminder.localPreview')}</p>}
      {delivery && <div role="status" className="reminder-result">
        {sending ? t('sessionReminder.sending', { processed: delivery.sent + delivery.skipped + delivery.failed.length, total: delivery.total })
          : <><div>{complete && <CheckCircle size={16} />} {t('sessionReminder.result', { sent: delivery.sent, total: delivery.total })}</div>
            {!!delivery.skipped && <p>{t('sessionReminder.skipped', { count: delivery.skipped })}</p>}
            {!!delivery.failed.length && <p>{t('sessionReminder.failed', { count: delivery.failed.length })}</p>}</>}
      </div>}
      <footer><button className="reminder-secondary" disabled={sending} onClick={onClose}>
        {t(delivery || localPreview ? 'sessionReminder.done' : 'manageEvent.agenda.modals.notification.actions.cancel')}</button>
        {!complete && !localPreview && <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="reminder-primary" disabled={sending || !people.length || !subject.trim() || !message.trim() || audience.isError}>
              <Send size={16} />{t(delivery && !sending ? 'sessionReminder.retry' : 'sessionReminder.send')}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="reminder-confirm" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <AlertDialogTitle>{t('sessionReminder.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('sessionReminder.confirmNotice', { count: delivery ? delivery.failed.length : people.length })}</AlertDialogDescription>
            <p><strong>{session?.title ?? t('sessionReminder.allAudience')}</strong><br />{subject.trim()}</p>
            {import.meta.env.DEV && <p>{t('sessionReminder.localPreview')}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>{t('sessionReminder.back')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void send()}>{t('sessionReminder.confirmSend')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>}
      </footer>
    </DialogContent>
  </Dialog>;
}
