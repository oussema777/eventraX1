import { useEffect, useRef, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Camera, Check, CheckCircle, Clock, Handshake, Keyboard, MapPin, QrCode, ScanLine, ShieldCheck, Users, X, AlertCircle, Zap } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import './DayOfScanner.css';

type Choice = { id: string; name?: string; email?: string; company?: string };
type Meeting = { id: string; profile_a_name?: string; profile_b_name?: string; start_at?: string; location?: string; status?: string };
type Session = { id: string; title: string; starts_at?: string; location?: string };
type Details = { name?: string; photo?: string; company?: string; email?: string; ticketCode?: string; attendeeId?: string; checkInTime?: string; firstCheckInTime?: string };
type Props = {
  kind: 'event' | 'session' | 'b2b'; timeZone: string; videoRef: RefObject<HTMLVideoElement>;
  cameraReady: boolean; cameraError: string; torchEnabled: boolean; busy: boolean;
  result: 'success' | 'error' | 'duplicate' | null; error: string; details: Details | null;
  manualOpen: boolean; code: string; meetings: Meeting[]; sessions: Session[];
  meetingId: string; sessionId: string; candidates?: Choice[]; canAllowDuplicate: boolean; totalToday: number;
  onClose: () => void; onSwitchCamera: () => void; onTorch: () => void;
  onManual: () => void; onCode: (value: string) => void; onMeeting: (id: string) => void; onSession: (id: string) => void;
  onScan: () => void; onChoose: (id: string) => void; onNext: () => void; onAllowDuplicate: () => void; onViewAttendee?: () => void;
};

export default function DayOfScanner({ videoRef, ...p }: Props) {
  const { t, locale } = useI18n();
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!p.busy && (p.result || p.candidates) && window.matchMedia('(max-width: 750px)').matches) {
      feedback.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [p.result, p.candidates, p.busy]);
  const meeting = p.meetings.find(item => item.id === p.meetingId);
  const paused = !!(p.result || p.candidates || p.manualOpen || p.busy);
  const ready = p.cameraReady && !paused;
  const title = t(`manageEvent.dayOf.tools.${p.kind}.title`);
  const time = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: p.timeZone }) : '';
  const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const next = <button className="dayof-scanner__primary" onClick={p.onNext}>{t('manageEvent.dayOf.scanner.success.next')}<ArrowRight size={17} aria-hidden="true" /></button>;

  return <Dialog.Root open onOpenChange={open => { if (!open) p.onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="dayof-scanner-overlay" />
      <Dialog.Content className="dayof-scanner" dir={locale === 'ar' ? 'rtl' : 'ltr'} onCloseAutoFocus={e => { e.preventDefault(); returnFocus.current?.focus(); }}>
        <header className="dayof-scanner__header">
          <div className="dayof-scanner__identity"><span className="dayof-scanner__brand" dir="ltr">eventra<span>.</span></span><span className="dayof-scanner__eyebrow">{t('scannerDesign.desk')}</span></div>
          <div className="dayof-scanner__heading"><div className="dayof-scanner__title-icon">{p.kind === 'b2b' ? <Handshake size={25} aria-hidden="true" /> : <ScanLine size={25} aria-hidden="true" />}</div><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{t(p.kind === 'b2b' ? 'scannerDesign.subtitle' : 'scannerDesign.entrySubtitle')}</Dialog.Description></div></div>
          <Dialog.Close className="dayof-scanner__close" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></Dialog.Close>
        </header>

        <div className="dayof-scanner__workspace">
          <section className="dayof-scanner__capture" aria-label={t('scannerDesign.capture')}>
            <div className="dayof-scanner__section-label"><span><span className="dayof-scanner__step">01</span>{t('scannerDesign.capture')}</span><span className={`dayof-scanner__status ${ready ? 'is-live' : ''}`}><i />{t(p.busy ? 'scannerFlow.saving' : ready ? 'scannerDesign.live' : p.result || p.candidates ? 'scannerDesign.paused' : p.manualOpen || p.cameraError ? 'scannerFlow.manualReady' : 'manageEvent.dayOf.scanner.initializing')}</span></div>
            <div className={`dayof-scanner__camera ${ready ? 'is-live' : ''} ${p.result === 'success' ? 'is-success' : ''}`}>
              <video ref={videoRef} autoPlay playsInline muted style={{ opacity: p.cameraReady ? 1 : 0 }} />
              <div className="dayof-scanner__camera-shade" />
              <span className="dayof-scanner__camera-label"><QrCode size={14} aria-hidden="true" />{t('scannerDesign.passLabel')}</span>
              <div className="dayof-scanner__viewfinder" aria-hidden="true"><i /><i /><i /><i />
                {!p.cameraReady && !p.result && <div className="dayof-scanner__qr-symbol"><QrCode size={66} strokeWidth={1.2} /></div>}
                {p.result === 'success' && <div className="dayof-scanner__camera-check"><Check size={45} strokeWidth={2} /></div>}
              </div>
              <div className="dayof-scanner__camera-caption"><strong>{t(p.result === 'success' ? 'scannerDesign.arrivalRecorded' : p.cameraError ? 'scannerDesign.cameraFallback' : paused ? 'scannerDesign.cameraPaused' : 'scannerDesign.frameTitle')}</strong><span>{t(p.result || p.candidates ? 'scannerDesign.continueHint' : p.cameraError ? 'scannerDesign.manualHint' : paused ? 'scannerDesign.continueHint' : 'scannerDesign.frameHint')}</span></div>
            </div>
            <div className="dayof-scanner__controls">
              <button onClick={p.onSwitchCamera} disabled={p.busy}><Camera size={17} aria-hidden="true" />{t('manageEvent.dayOf.scanner.switchCamera')}</button>
              <button className="dayof-scanner__torch" onClick={p.onTorch} disabled={!p.cameraReady || p.busy} aria-label={t('scannerDesign.flashlight')} aria-pressed={p.torchEnabled}><Zap size={17} aria-hidden="true" /></button>
              <button className={p.manualOpen ? 'is-selected' : ''} onClick={p.onManual} aria-expanded={p.manualOpen}><Keyboard size={17} aria-hidden="true" />{t('manageEvent.dayOf.scanner.manualEntry')}</button>
            </div>
            {p.manualOpen && p.result !== 'success' && p.result !== 'duplicate' && <form className="dayof-scanner__manual" onSubmit={e => { e.preventDefault(); p.onScan(); }}>
              <label htmlFor="dayof-manual-code">{t('scannerDesign.codeLabel')}</label>
              <div><input id="dayof-manual-code" value={p.code} onChange={e => p.onCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); p.onScan(); } }} autoComplete="off" spellCheck={false} aria-label={t('manageEvent.dayOf.scanner.placeholder')} placeholder={t('manageEvent.dayOf.scanner.placeholder')} /><button className="dayof-scanner__primary" disabled={p.busy || !p.code.trim()} type="submit">{t(p.busy ? 'scannerFlow.saving' : 'manageEvent.dayOf.scanner.checkIn')}<ArrowRight size={16} aria-hidden="true" /></button></div>
            </form>}
            {p.cameraError && !p.result && <p className="dayof-scanner__camera-note"><Camera size={15} aria-hidden="true" /><span>{p.cameraError}</span></p>}
            <div className="dayof-scanner__assurance"><ShieldCheck size={19} aria-hidden="true" /><p>{t('scannerDesign.assurance')}</p></div>
          </section>

          <section className="dayof-scanner__review" aria-label={t('scannerDesign.review')}>
            <div className="dayof-scanner__section-label"><span><span className="dayof-scanner__step">02</span>{t('scannerDesign.review')}</span></div>
            {(p.kind === 'b2b' || p.kind === 'session') && <div className="dayof-scanner__meeting">
              <label htmlFor="dayof-meeting-selector">{t(p.kind === 'b2b' ? 'scannerDesign.meetingLabel' : 'scannerFlow.selectSession')}</label>
              <select id="dayof-meeting-selector" aria-label={t(p.kind === 'b2b' ? 'scannerFlow.selectMeeting' : 'scannerFlow.selectSession')} disabled={p.busy || !!p.candidates} value={p.kind === 'b2b' ? p.meetingId : p.sessionId} onChange={e => p.kind === 'b2b' ? p.onMeeting(e.target.value) : p.onSession(e.target.value)}>
                {p.kind === 'b2b' ? p.meetings.length ? p.meetings.map(item => <option key={item.id} value={item.id}>{time(item.start_at)}{item.location ? ` · ${item.location}` : ''} — {item.profile_a_name || t('networking.defaults.user')} ↔ {item.profile_b_name || t('networking.defaults.user')}</option>) : <option value="">{t('manageEvent.dayOf.meetings.noMeetings')}</option>
                  : p.sessions.length ? p.sessions.map(item => <option key={item.id} value={item.id}>{item.title} · {time(item.starts_at)}</option>) : <option value="">{t('manageEvent.dayOf.sessions.noSessions')}</option>}
              </select>
              {p.kind === 'b2b' && meeting && <><div className="dayof-scanner__pair">{[meeting.profile_a_name, meeting.profile_b_name].map((name, index) => <div key={index}><span className={`dayof-scanner__avatar person-${index}`} aria-hidden="true">{name ? initials(name) : <Users size={20} />}</span><strong>{name || t('networking.defaults.user')}</strong></div>)}<span className="dayof-scanner__pair-link" aria-hidden="true"><Handshake size={18} /></span></div><div className="dayof-scanner__meeting-meta"><span><Clock size={14} aria-hidden="true" />{time(meeting.start_at) || t('networking.common.tbd')}</span><span><MapPin size={14} aria-hidden="true" />{meeting.location || t('networking.common.tbd')}</span></div></>}
              {p.kind === 'b2b' && <p className="dayof-scanner__hint">{t('scannerDesign.meetingHint')}</p>}
            </div>}

            <div ref={feedback} className="dayof-scanner__feedback" aria-live="polite" aria-busy={p.busy}>
              {p.busy ? <div className="dayof-scanner__waiting"><ShieldCheck size={30} aria-hidden="true" /><h3>{t('scannerFlow.saving')}</h3><p>{t('scannerDesign.verifying')}</p></div>
                : p.candidates ? <div className="dayof-scanner__candidates"><h3>{t('scannerFlow.chooseParticipant')}</h3><p>{t('scannerFlow.legacyHint')}</p>{p.candidates.map(person => <button key={person.id} onClick={() => p.onChoose(person.id)}><span className="dayof-scanner__avatar" aria-hidden="true">{initials(person.name || person.email || '?')}</span><span><strong>{person.name || person.email}</strong><small>{person.company || person.email}</small></span><ArrowRight size={17} aria-hidden="true" /></button>)}</div>
                : !p.result ? <div className="dayof-scanner__waiting"><div className="dayof-scanner__welcome-icon"><Handshake size={28} strokeWidth={1.6} aria-hidden="true" /></div><h3>{t('scannerDesign.welcome')}</h3><p>{t('scannerDesign.welcomeHint')}</p><div className="dayof-scanner__welcome-steps"><span><Check size={13} />{t('scannerDesign.stepScan')}</span><span><Check size={13} />{t('scannerDesign.stepWelcome')}</span></div></div>
                : <div className={`dayof-scanner__result is-${p.result}`}>
                  <div className="dayof-scanner__result-icon">{p.result === 'success' ? <CheckCircle size={29} aria-hidden="true" /> : <AlertCircle size={29} aria-hidden="true" />}</div>
                  <h3>{t(p.result === 'success' ? 'manageEvent.dayOf.scanner.success.title' : p.result === 'duplicate' ? 'manageEvent.dayOf.scanner.duplicate.title' : 'scannerFlow.scanFailed')}</h3>
                  {p.result === 'error' ? <p>{p.error || t('manageEvent.dayOf.scanner.error.invalidDesc')}</p> : <>
                    <div className="dayof-scanner__person">{p.details?.photo && <img src={p.details.photo} alt="" />}<div><strong>{p.details?.name || t('networking.defaults.user')}</strong><span>{p.details?.company}</span></div></div>
                    <dl><div><dt>{t('manageEvent.dayOf.lastScan.checkInTime')}</dt><dd>{p.result === 'duplicate' ? p.details?.firstCheckInTime : p.details?.checkInTime}</dd></div>{p.details?.ticketCode && <div><dt>{t('manageEvent.dayOf.lastScan.registration')}</dt><dd>{p.details.ticketCode}</dd></div>}</dl>
                  </>}
                  {p.result === 'error' ? <button className="dayof-scanner__primary" onClick={p.onNext}>{t('manageEvent.dayOf.scanner.error.tryAgain')}<ArrowRight size={17} aria-hidden="true" /></button> : next}
                  {p.result === 'duplicate' && p.canAllowDuplicate && <button className="dayof-scanner__text-button" onClick={p.onAllowDuplicate}>{t('manageEvent.dayOf.scanner.duplicate.allow')}</button>}
                  {p.result === 'success' && p.onViewAttendee && <button className="dayof-scanner__text-button" onClick={p.onViewAttendee}>{t('manageEvent.dayOf.scanner.success.viewProfile')}</button>}
                </div>}
            </div>
          </section>
        </div>
        <footer className="dayof-scanner__footer"><span><ShieldCheck size={15} aria-hidden="true" />{t('scannerDesign.footer')}</span><span><strong>{p.totalToday}</strong>{t('manageEvent.dayOf.metrics.totalToday')}</span></footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
