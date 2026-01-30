import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Mic,
  Users,
  Building,
  Ticket,
  Handshake,
  Megaphone,
  Wrench,
  BarChart3,
  ExternalLink,
  Settings,
  Eye,
  ArrowLeft,
  Loader2,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import EventOverviewTab from '../components/dashboard/EventOverviewTab';
import EventAttendeesTab from '../components/dashboard/EventAttendeesTab';
import EventScheduleTab from '../components/dashboard/EventScheduleTab';
import EventSpeakersTab from '../components/dashboard/EventSpeakersTab';
import EventExhibitorsTab from '../components/dashboard/EventExhibitorsTab';
import EventTicketingTab from '../components/dashboard/EventTicketingTab';
import EventB2BMatchmakingTab from '../components/dashboard/EventB2BMatchmakingTab';
import EventMarketingTab from '../components/dashboard/EventMarketingTab';
import EventDayOfTab from '../components/dashboard/EventDayOfTab';
import EventReportingTab from '../components/dashboard/EventReportingTab';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';

type NavigationTab = 
  | 'overview' 
  | 'agenda' 
  | 'speakers' 
  | 'attendees' 
  | 'exhibitors' 
  | 'ticketing' 
  | 'b2b' 
  | 'marketing' 
  | 'dayof'
  | 'reporting';

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: any;
  description: string;
}

export default function EventManagementDashboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: t('manageEvent.nav.overview.label'), icon: Home, description: t('manageEvent.nav.overview.desc') },
    { id: 'agenda', label: t('manageEvent.nav.agenda.label'), icon: Calendar, description: t('manageEvent.nav.agenda.desc') },
    { id: 'speakers', label: t('manageEvent.nav.speakers.label'), icon: Mic, description: t('manageEvent.nav.speakers.desc') },
    { id: 'attendees', label: t('manageEvent.nav.attendees.label'), icon: Users, description: t('manageEvent.nav.attendees.desc') },
    { id: 'exhibitors', label: t('manageEvent.nav.exhibitors.label'), icon: Building, description: t('manageEvent.nav.exhibitors.desc') },
    { id: 'ticketing', label: t('manageEvent.nav.ticketing.label'), icon: Ticket, description: t('manageEvent.nav.ticketing.desc') },
    { id: 'b2b', label: t('manageEvent.nav.b2b.label'), icon: Handshake, description: t('manageEvent.nav.b2b.desc') },
    { id: 'dayof', label: t('manageEvent.nav.dayof.label'), icon: Wrench, description: t('manageEvent.nav.dayof.desc') }
  ];

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const tab = sp.get('tab') as any;
    if (tab && navigationItems.some(i => i.id === tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B2641] text-white">
        <h2 className="text-2xl font-bold mb-4">{t('manageEvent.notFound.title')}</h2>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-[#0684F5] rounded-lg">{t('manageEvent.notFound.return')}</button>
      </div>
    );
  }

  return (
    <div className="event-dashboard h-screen flex flex-col" style={{ backgroundColor: '#0B2641' }}>
      <style>{`
        .event-dashboard__mobile-toggle {
          display: none !important;
        }

        .event-dashboard__nav-label {
          display: none;
        }

        @media (max-width: 600px) {
          .event-dashboard__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
          }

          .event-dashboard__header-meta {
            flex-wrap: wrap;
            gap: 8px 12px;
          }

          .event-dashboard__header-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-dashboard__header-actions button {
            width: 100%;
            justify-content: center;
          }

          .event-dashboard__layout {
            flex-direction: column;
          }

          .event-dashboard__mobile-toggle {
            display: flex !important;
            position: fixed;
            left: 16px;
            bottom: 20px;
            z-index: 1000;
          }

          .event-dashboard__nav-backdrop {
            display: none;
          }

          .event-dashboard__nav-backdrop.is-visible {
            display: block;
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.55);
            z-index: 80;
          }

          .event-dashboard__sidebar {
            display: none;
          }

          .event-dashboard__sidebar.is-open {
            display: block;
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            height: calc(100vh - 72px);
            overflow-y: auto;
            z-index: 90;
            width: 100%;
            background-color: #0D3052;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .event-dashboard__nav {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .event-dashboard__nav button {
            border-left: none !important;
            justify-content: flex-start;
            gap: 10px;
          }

          .event-dashboard__nav-label {
            display: inline;
            font-size: 12px;
            font-weight: 600;
          }

          .event-dashboard__main {
            padding: 16px;
          }

          .event-dashboard .grid.grid-cols-4,
          .event-dashboard .grid.grid-cols-3,
          .event-dashboard .grid.grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 400px) {
          .event-dashboard__nav {
            grid-template-columns: 1fr;
          }

          .event-dashboard__main {
            padding: 12px;
          }

          .event-dashboard__mobile-toggle {
            left: 12px;
            bottom: 16px;
          }
        }
      `}</style>
      {/* Navbar with real user data */}
      <NavbarLoggedIn currentPage="dashboard" />

      {/* TOP HEADER */}
      <header className="event-dashboard__header flex items-center justify-between px-8 py-5 border-b mt-[72px]" style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.1)',marginTop: '70px' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {event.name}
            </h1>
            <div className="event-dashboard__header-meta flex items-center gap-3">
              <span className="px-3 py-1 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(6, 132, 245, 0.2)', fontSize: '13px', fontWeight: 600, color: '#0684F5' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0684F5' }} />
                {event.status.toUpperCase()}
              </span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                <MapPin size={14} className="inline mr-1" /> {event.location_address || t('manageEvent.header.tbd')}
              </span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                <Calendar size={14} className="inline mr-1" /> {event.start_date ? new Date(event.start_date).toLocaleDateString() : t('manageEvent.header.noDate')}
              </span>
            </div>
          </div>
        </div>

        <div className="event-dashboard__header-actions flex items-center gap-3">
          <button onClick={() => window.open(`/event/${event.id}/landing`, '_blank')} className="flex items-center gap-2 px-4 h-10 rounded-lg border border-white/10 text-[#E2E8F0] font-semibold text-sm hover:bg-white/10 transition-colors">
            <Eye size={16} /> {t('manageEvent.header.viewLive')}
          </button>
          <button onClick={() => navigate(`/create/details/${event.id}`)} className="flex items-center gap-2 px-4 h-10 rounded-lg border border-white/10 text-[#E2E8F0] font-semibold text-sm hover:bg-white/10 transition-colors">
            <Settings size={16} /> {t('manageEvent.header.editDetails')}
          </button>
        </div>
      </header>

      <button
        className="event-dashboard__mobile-toggle"
        onClick={() => setIsMobileNavOpen((prev) => !prev)}
        aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '999px',
          backgroundColor: '#0684F5',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 12px 24px rgba(6, 132, 245, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div
        className={`event-dashboard__nav-backdrop ${isMobileNavOpen ? 'is-visible' : ''}`}
        onClick={() => setIsMobileNavOpen(false)}
      />

      <div className="event-dashboard__layout flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className={`event-dashboard__sidebar flex flex-col border-r w-20 bg-[#0D3052] border-white/10 ${isMobileNavOpen ? 'is-open' : ''}`}>
          <div className="p-3 border-b border-white/10">
            <button onClick={() => navigate('/dashboard')} className="w-full flex justify-center p-3 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={22} />
            </button>
          </div>
          <nav className="event-dashboard__nav p-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                    if (eventId) navigate(`/event/${eventId}?tab=${item.id}`, { replace: true });
                  }}
                  className={`text-white w-full flex justify-center p-3 rounded-lg mb-2 transition-all relative group ${isActive ? 'bg-[#0684F5]/20 text-[#0684F5] text-blue border-l-4 border-[#0684F5]' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <Icon size={22} />
                  <span className="event-dashboard__nav-label">{item.label}</span>
                  <div className="absolute left-full ml-2 px-3 py-2 bg-[#1E3A5F] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <main className="event-dashboard__main flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && <EventOverviewTab eventId={eventId} />}
          {activeTab === 'agenda' && <EventScheduleTab eventId={eventId} />}
          {activeTab === 'speakers' && <EventSpeakersTab eventId={eventId} />}
          {activeTab === 'attendees' && <EventAttendeesTab eventId={eventId} />}
          {activeTab === 'exhibitors' && <EventExhibitorsTab eventId={eventId} />}
          {activeTab === 'ticketing' && <EventTicketingTab eventId={eventId} />}
          {activeTab === 'b2b' && <EventB2BMatchmakingTab eventId={eventId} />}
          {activeTab === 'marketing' && <EventMarketingTab eventId={eventId} />}
          {activeTab === 'dayof' && <EventDayOfTab eventId={eventId} />}
        </main>
      </div>
    </div>
  );
}
