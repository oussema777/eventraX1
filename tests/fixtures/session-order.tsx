import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../src/i18n/I18nContext';
import { useSessions } from '../../src/hooks/useSessions';
import SessionOrderDialog from '../../src/components/events/SessionOrderDialog';
import '../../src/index.css';

function Harness() {
  const { sessions, isLoading, reorderSessions, reloadSessions } = useSessions('event-one');
  const [open, setOpen] = useState(true);
  if (isLoading) return null;
  return open ? <SessionOrderDialog sessions={sessions} onReload={reloadSessions} onSave={reorderSessions} onClose={() => setOpen(false)} /> : <button onClick={() => setOpen(true)}>Open order</button>;
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><I18nProvider><Harness /></I18nProvider></MemoryRouter></QueryClientProvider>);
