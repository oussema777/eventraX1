import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { I18nProvider } from '../../src/i18n/I18nContext';
import EventB2BMatchmakingTab from '../../src/components/dashboard/EventB2BMatchmakingTab';
import { Toaster } from 'sonner';
import '../../src/index.css';
createRoot(document.getElementById('root')!).render(<BrowserRouter><I18nProvider><AuthProvider>
  <main style={{ padding: 24, background: '#0B2641', minHeight: '100vh' }}><EventB2BMatchmakingTab eventId="20000000-0000-4000-8000-000000000001" /></main><Toaster />
</AuthProvider></I18nProvider></BrowserRouter>);
