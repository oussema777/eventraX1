import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../../src/i18n/I18nContext';
import EventAttendeesTab from '../../src/components/dashboard/EventAttendeesTab';
import '../../src/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../src/contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={new QueryClient()}><I18nProvider><AuthProvider><EventAttendeesTab eventId="test-event" /></AuthProvider></I18nProvider></QueryClientProvider>
);
