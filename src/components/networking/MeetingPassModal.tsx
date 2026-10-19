import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Calendar, Clock, MapPin, Download, Printer, Copy, X, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../i18n/I18nContext';
import { meetingLink } from '../../utils/meetingQr';
import { networkingTimeZone } from '../../utils/networkingSchedule';
import './MeetingPassModal.css';

export interface MeetingPass {
  id: string; eventId?: string | null; event: string; name: string;
  startAt?: string | null; time: string; location: string; meetingUrl?: string;
  meetingFormat?: 'video' | 'in-person' | 'hybrid'; timeZone?: string;
}
export default function MeetingPassModal({ meeting, profileId, holderName, onClose }: {
  meeting: MeetingPass; profileId: string; holderName: string; onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [image, setImage] = useState('');
  const [failed, setFailed] = useState(false);
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  const value = meetingLink(window.location.origin, meeting.id, meeting.eventId, profileId);
  useEffect(() => {
    let active = true;
    setImage(''); setFailed(false);
    import('qrcode').then(module => module.toDataURL(value, { width: 720, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#0b2641', light: '#ffffff' } }))
      .then(url => { if (active) setImage(url); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [value]);
  const date = meeting.startAt ? new Date(meeting.startAt) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const timeZone = networkingTimeZone(meeting.eventId || undefined, null, meeting.timeZone);
  const dateLabel = validDate ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone }).format(date) : t('networking.common.tbd');
  const timeLabel = validDate ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(date) : meeting.time;
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(value); toast.success(t('meetingPass.copied')); }
    catch { toast.error(t('businessFlows.copyFailed')); }
  };
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="meeting-pass-overlay" />
      <Dialog.Content className="meeting-pass" dir={locale === 'ar' ? 'rtl' : 'ltr'} onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <header className="meeting-pass__header">
          <div className="meeting-pass__brand">eventra<span>.</span></div>
          <span className="meeting-pass__confirmed"><Check aria-hidden="true" size={14} />{t('networking.status.confirmed')}</span>
          <Dialog.Close className="meeting-pass__close" aria-label={t('common.close')}><X aria-hidden="true" size={20} /></Dialog.Close>
          <p className="meeting-pass__eyebrow">{t('meetingPass.eyebrow')}</p>
          <Dialog.Title>{t('meetingPass.title')}</Dialog.Title>
          <Dialog.Description>{t('meetingPass.subtitle')}</Dialog.Description>
        </header>
        <div className="meeting-pass__body">
          <section className="meeting-pass__qr" aria-label={t('networking.ticket.qrAlt')}>
            <div className="meeting-pass__code">
              {image ? <img src={image} width="240" height="240" alt={t('networking.ticket.qrAlt')} />
                : <p role="status">{t(failed ? 'meetingPass.qrFailed' : 'meetingPass.preparing')}</p>}
            </div>
            <p className="meeting-pass__holder-label">{t('meetingPass.holder')}</p>
            <strong>{holderName}</strong>
            <p className="meeting-pass__qr-hint">{t('meetingPass.personalHint')}</p>
          </section>
          <section className="meeting-pass__details">
            <p className="meeting-pass__eyebrow">{meeting.event}</p>
            <span className="meeting-pass__with">{t('networking.ticket.with')}</span><h3>{meeting.name}</h3>
            <dl>
              <div><Calendar aria-hidden="true" size={19} /><dt>{t('registrationFlow.voucher.date')}</dt><dd>{dateLabel}</dd></div>
              <div><Clock aria-hidden="true" size={19} /><dt>{t('networking.ticket.time')}</dt><dd>{timeLabel}<small>{timeZone}</small></dd></div>
              <div><MapPin aria-hidden="true" size={19} /><dt>{t('networking.ticket.location')}</dt><dd>{meeting.location}</dd></div>
            </dl>
            {meeting.meetingUrl && <a className="meeting-pass__video" href={meeting.meetingUrl} target="_blank" rel="noreferrer"><Video aria-hidden="true" size={16} />{t('networking.actions.joinCall')}</a>}
            <p className="meeting-pass__reference">{t('meetingPass.reference')}<span>{meeting.id}</span></p>
          </section>
        </div>
        <footer className="meeting-pass__footer">
          <p>{t('meetingPass.arrivalHint')}</p>
          <div>
            {image && <a className="meeting-pass__primary" href={image} download={`eventra-meeting-${meeting.id}.png`}><Download aria-hidden="true" size={16} />{t('meetingPass.saveQr')}</a>}
            <button onClick={() => window.print()}><Printer aria-hidden="true" size={16} />{t('meetingPass.print')}</button>
            <button onClick={copyCode}><Copy aria-hidden="true" size={16} />{t('meetingPass.copy')}</button>
          </div>
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
