import { useState } from 'react';
import { Video, Mail, Calendar, MessageSquare } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function IntegrationsSection() {
  const { t } = useI18n();
  const [integrations, setIntegrations] = useState({
    zoom: false,
    mailchimp: false,
    googleCalendar: false,
    slack: false
  });

  const integrationsList = [
    {
      id: 'zoom' as const,
      name: t('wizard.step4.integrations.items.zoom.name'),
      description: t('wizard.step4.integrations.items.zoom.description'),
      icon: Video,
      color: '#2D8CFF'
    },
    {
      id: 'mailchimp' as const,
      name: t('wizard.step4.integrations.items.mailchimp.name'),
      description: t('wizard.step4.integrations.items.mailchimp.description'),
      icon: Mail,
      color: '#FFE01B'
    },
    {
      id: 'googleCalendar' as const,
      name: t('wizard.step4.integrations.items.googleCalendar.name'),
      description: t('wizard.step4.integrations.items.googleCalendar.description'),
      icon: Calendar,
      color: '#4285F4'
    },
    {
      id: 'slack' as const,
      name: t('wizard.step4.integrations.items.slack.name'),
      description: t('wizard.step4.integrations.items.slack.description'),
      icon: MessageSquare,
      color: '#4A154B'
    }
  ];

  return (
    <div 
      className="integrations-container rounded-xl p-8 border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .integrations-container { padding: 1.25rem !important; }
          .integrations-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .integration-card { flex-direction: column !important; align-items: stretch !important; text-align: center !important; }
          .integration-icon-wrapper { align-self: center !important; }
          .integration-actions { flex-direction: column !important; width: 100% !important; }
          .integration-connect-btn { width: 100% !important; }
          .integration-toggle-wrapper { justify-content: center !important; }
        }
      `}</style>
      <h2 
        className="text-2xl mb-2"
        style={{ fontWeight: 600, color: '#0B2641' }}
      >
        {t('wizard.step4.integrations.title')}
      </h2>
      <p 
        className="text-sm mb-5"
        style={{ color: '#6B7280' }}
      >
        {t('wizard.step4.integrations.subtitle')}
      </p>
      
      <div 
        className="w-full h-px mb-6"
        style={{ backgroundColor: '#E5E7EB' }}
      />

      {/* Integration Cards Grid */}
      <div className="integrations-grid grid grid-cols-2 gap-6">
        {integrationsList.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integrations[integration.id];

          return (
            <div
              key={integration.id}
              className="integration-card flex items-center gap-4 p-5 rounded-lg border transition-shadow hover:shadow-md"
              style={{ borderColor: '#E5E7EB' }}
            >
              {/* Logo */}
              <div 
                className="integration-icon-wrapper w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${integration.color}20` }}
              >
                <Icon size={24} style={{ color: integration.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div 
                  className="text-base mb-1"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  {integration.name}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: '#6B7280' }}
                >
                  {integration.description}
                </div>
              </div>

              {/* Toggle & Button */}
              <div className="integration-actions flex items-center gap-2 flex-shrink-0">
                <div className="integration-toggle-wrapper flex items-center">
                  <button
                    onClick={() => setIntegrations(prev => ({ ...prev, [integration.id]: !prev[integration.id] }))}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: isConnected ? 'var(--primary)' : '#E5E7EB' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{ left: isConnected ? 'calc(100% - 22px)' : '2px' }}
                    />
                  </button>
                </div>
                <button
                  className="integration-connect-btn px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-gray-50"
                style={{ 
                  borderColor: '#E5E7EB',
                  color: '#0B2641',
                  fontWeight: 500
                }}
              >
                {t('wizard.step4.integrations.connect')}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
