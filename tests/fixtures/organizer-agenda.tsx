import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../src/i18n/I18nContext';
import { AuthProvider } from '../../src/contexts/AuthContext';
import EventScheduleTab from '../../src/components/dashboard/EventScheduleTab';
import '../../src/index.css';
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><I18nProvider><AuthProvider><EventScheduleTab eventId="event-one" /></AuthProvider></I18nProvider></MemoryRouter></QueryClientProvider>);
