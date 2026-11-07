import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { I18nProvider } from '../../src/i18n/I18nContext';
import EventInvestorsTab from '../../src/components/dashboard/EventInvestorsTab';
import EventInvestorManager from '../../src/components/dashboard/EventInvestorManager';
import EventReviewSettings from '../../src/components/dashboard/EventReviewSettings';
import InvestorReviewRequests from '../../src/components/networking/InvestorReviewRequests';
import InvestorInvitation from '../../src/pages/InvestorInvitation';
import '../../src/index.css';
const event = '20000000-0000-4000-8000-000000000001';
const mode = new URLSearchParams(location.search).get('mode');
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><BrowserRouter><I18nProvider><AuthProvider>
  <main style={{maxWidth:1100,margin:'24px auto',padding:16}}>{mode==='directory' ? <EventInvestorsTab eventId={event} /> : mode==='settings' ? <EventReviewSettings eventId={event} /> : mode==='invitation' ? <InvestorInvitation /> : mode==='queue' ? <InvestorReviewRequests eventId={event} reviewer /> : <EventInvestorManager eventId={event} attendees={[{id:'attendee-1',name:'Amel Ben Salah',email:'amel@example.test'}]} />}</main>
</AuthProvider></I18nProvider></BrowserRouter></QueryClientProvider>);
