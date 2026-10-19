import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { I18nProvider, useI18n } from '../../src/i18n/I18nContext';
import EventDayOfTab from '../../src/components/dashboard/EventDayOfTab';
import MeetingPassModal from '../../src/components/networking/MeetingPassModal';
import { renderMeetingEmail } from '../../src/lib/meetingEmail';
import { meetingLink, qrImageUrl } from '../../src/utils/meetingQr';
import { networkingTimeZone } from '../../src/utils/networkingSchedule';
import '../../src/index.css';

const eventId = '769d7854-9bae-49e6-9db9-c88c0586a402';
const profileId = '11111111-1111-4111-8111-111111111111';
const meetingId = '44444444-4444-4444-8444-444444444444';
function Review() {
  const { locale, setLocale } = useI18n();
  const params = new URLSearchParams(location.search);
  const [pass, setPass] = useState(params.get('mode') === 'pass');
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  if (params.get('mode') === 'scanner') return <EventDayOfTab eventId={eventId} />;
  const sample = { id: meetingId, eventId, event: 'L’INVESTISSEMENT · Tunis 2027', name: 'Amira Mansour', startAt: '2027-11-20T13:00:00Z', time: '14:00', location: 'Networking Lounge · Table 04', timeZone: params.get('timeZone') || 'Africa/Tunis' };
  const url = meetingLink(location.origin, meetingId, eventId, profileId);
  return <>
    <nav style={{ padding: 20, display: 'flex', gap: 12, flexWrap: 'wrap', background: '#0b2641', color: 'white' }}>
      <strong>Eventra · Meeting design review</strong>
      <select aria-label="Language" value={locale} onChange={e => setLocale(e.target.value as any)} style={{ color: '#132f48' }}><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select>
      {(['pending', 'confirmed', 'cancelled'] as const).map(state => <button key={state} onClick={() => setStatus(state)} style={{ borderBottom: status === state ? '2px solid #38bdf8' : 'none' }}>{state}</button>)}
      <button onClick={() => setPass(true)}>Open meeting pass</button>
    </nav>
    <iframe title="Meeting email preview" style={{ width: '100%', height: 'calc(100vh - 74px)', border: 0 }} srcDoc={renderMeetingEmail({ status, role: 'recipient', recipientName: 'Youssef Ben Ali', partnerName: sample.name, eventName: sample.event, meetingDate: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: networkingTimeZone(eventId, null, sample.timeZone) }).format(new Date(sample.startAt)), meetingTime: '14:00 – 14:30', timeZone: sample.timeZone, location: sample.location, meetingId, networkingUrl: url, qrCodeUrl: qrImageUrl(url), locale })} />
    {pass && <MeetingPassModal meeting={sample} profileId={profileId} holderName="Youssef Ben Ali" onClose={() => setPass(false)} />}
  </>;
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><I18nProvider><Review /><Toaster richColors /></I18nProvider></BrowserRouter>);
