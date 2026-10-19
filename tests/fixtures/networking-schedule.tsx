import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { I18nProvider } from '../../src/i18n/I18nContext';
import BookMeetingModal from '../../src/components/networking/BookMeetingModal';
import MeetingAvailability from '../../src/components/networking/MeetingAvailability';
import '../../src/index.css';
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'viewer@example.test', full_name: 'Test Viewer' };
const recipient = { id: '22222222-2222-4222-8222-222222222222', name: 'Meeting Partner' };
const params = new URLSearchParams(location.search);
const eventId = params.get('event') || '769d7854-9bae-49e6-9db9-c88c0586a402';
const existingMeeting = params.get('mode') === 'reschedule'
  ? { id: 'existing-meeting', eventId, startAt: '2026-11-20T13:00:00Z', meetingFormat: 'in-person', status: 'confirmed', meta: {} }
  : undefined;
function App() {
  const [open, setOpen] = useState(true);
  return <I18nProvider><Toaster />{params.get('mode') === 'availability'
    ? <MeetingAvailability eventId={eventId} profileId={user.id} />
    : <><button onClick={() => setOpen(true)}>Open booking</button><BookMeetingModal isOpen={open} onClose={() => setOpen(false)} currentUser={user} recipient={recipient} eventId={eventId} existingMeeting={existingMeeting} /></>}</I18nProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
