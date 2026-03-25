import { Ticket, ClipboardList, Users, Mic, Calendar, Briefcase, Award, Megaphone, QrCode } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface RegistrationTabsProps {
  activeTab: 'tickets' | 'forms' | 'attendees' | 'speakers' | 'sessions' | 'exhibitors' | 'sponsors' | 'badges' | 'marketing';
  setActiveTab: (tab: 'tickets' | 'forms' | 'attendees' | 'speakers' | 'sessions' | 'exhibitors' | 'sponsors' | 'badges' | 'marketing') => void;
}

export default function RegistrationTabs({ activeTab, setActiveTab }: RegistrationTabsProps) {
  const { t } = useI18n();

  const getLabel = (id: string) => {
    switch(id) {
      case 'tickets': return t('wizard.step3.subSteps.tickets');
      case 'speakers': return t('wizard.step3.subSteps.speakers');
      case 'sessions': return t('wizard.step3.subSteps.schedule');
      case 'exhibitors': return t('wizard.step3.subSteps.exhibitors');
      case 'sponsors': return t('wizard.step3.subSteps.sponsors');
      case 'badges': return t('wizard.step3.subSteps.qrBadges');
      case 'forms': return t('wizard.step3.subSteps.customForms');
      case 'attendees': return t('wizard.step3.subSteps.attendees');
      case 'marketing': return t('wizard.step3.subSteps.marketingTools');
      default: return id;
    }
  };

  const getTooltip = (id: string) => {
    switch(id) {
      case 'tickets': return t('wizard.step3.descriptions.tickets');
      case 'speakers': return t('wizard.step3.descriptions.speakers');
      case 'sessions': return t('wizard.step3.descriptions.schedule');
      case 'exhibitors': return t('wizard.step3.descriptions.exhibitors');
      case 'sponsors': return t('wizard.step3.descriptions.sponsors');
      case 'badges': return t('wizard.step3.descriptions.qrBadges');
      case 'forms': return t('wizard.step3.descriptions.customForms');
      case 'attendees': return t('wizard.step3.descriptions.attendees');
      case 'marketing': return t('wizard.step3.descriptions.marketingTools');
      default: return '';
    }
  };

  const tabs = [
    { id: 'tickets' as const, icon: Ticket },
    { id: 'speakers' as const, icon: Mic },
    { id: 'sessions' as const, icon: Calendar },
    { id: 'exhibitors' as const, icon: Briefcase },
    { id: 'sponsors' as const, icon: Award },
    { id: 'badges' as const, icon: QrCode },
    { id: 'forms' as const, icon: ClipboardList },
    { id: 'attendees' as const, icon: Users },
    { id: 'marketing' as const, icon: Megaphone }
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
        const label = getLabel(tab.id);
        const tooltip = getTooltip(tab.id);

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
            title={tooltip}
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
              {label}
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