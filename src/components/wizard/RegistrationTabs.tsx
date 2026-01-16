import { Ticket, ClipboardList, Users, Mic, Calendar, Briefcase, Award, Megaphone, QrCode } from 'lucide-react';

interface RegistrationTabsProps {
  activeTab: 'tickets' | 'forms' | 'attendees' | 'speakers' | 'sessions' | 'exhibitors' | 'sponsors' | 'badges' | 'marketing';
  setActiveTab: (tab: 'tickets' | 'forms' | 'attendees' | 'speakers' | 'sessions' | 'exhibitors' | 'sponsors' | 'badges' | 'marketing') => void;
}

export default function RegistrationTabs({ activeTab, setActiveTab }: RegistrationTabsProps) {
  const tabs = [
    { id: 'tickets' as const, icon: Ticket, label: 'Tickets', tooltip: 'Manage ticket types and pricing' },
    { id: 'speakers' as const, icon: Mic, label: 'Speakers', tooltip: 'Add and manage event speakers' },
    { id: 'sessions' as const, icon: Calendar, label: 'Schedule', tooltip: 'Create event schedule and sessions' },
    { id: 'exhibitors' as const, icon: Briefcase, label: 'Exhibitors', tooltip: 'Manage exhibitors and booths' },
    { id: 'sponsors' as const, icon: Award, label: 'Sponsors', tooltip: 'Add sponsors and packages' },
    { id: 'badges' as const, icon: QrCode, label: 'Badge Editor', tooltip: 'Design attendee badges' },
    { id: 'forms' as const, icon: ClipboardList, label: 'Custom Forms', tooltip: 'Create custom registration forms' },
    { id: 'attendees' as const, icon: Users, label: 'Attendees', tooltip: 'View and manage registrations' },
    { id: 'marketing' as const, icon: Megaphone, label: 'Marketing', tooltip: 'Marketing and promotion tools' }
  ];

  return (
    <div 
      className="rounded-xl p-1.5 mb-8 flex items-center gap-1 border"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        borderColor: 'rgba(255, 255, 255, 0.1)',
        maxWidth: 'fit-content',
        margin: '0 auto 32px auto'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative group flex items-center justify-center p-2.5 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: isActive ? '#0684F5' : 'transparent',
              color: isActive ? '#FFFFFF' : '#94A3B8',
              minWidth: '44px',
              minHeight: '44px',
              border: isActive ? '1px solid rgba(6, 132, 245, 0.3)' : '1px solid transparent'
            }}
            title={tab.tooltip}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            
            {/* Tooltip */}
            <div
              className="absolute top-full mt-2 px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {tab.label}
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                style={{ backgroundColor: '#1E3A5F', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}