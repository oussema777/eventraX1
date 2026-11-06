import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../../src/i18n/I18nContext';
import EventAttendeesTab from '../../src/components/dashboard/EventAttendeesTab';
import '../../src/index.css';

createRoot(document.getElementById('root')!).render(
  <I18nProvider><EventAttendeesTab eventId="test-event" /></I18nProvider>
);
