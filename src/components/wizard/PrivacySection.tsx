import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function PrivacySection() {
  const { t, tList } = useI18n();
  const [settings, setSettings] = useState({
    publicEvent: true,
    requireRegistration: true,
    showAttendeeList: false,
    allowSocialSharing: true
  });

  const privacySettings = tList<{
    id: 'publicEvent' | 'requireRegistration' | 'showAttendeeList' | 'allowSocialSharing';
    title: string;
    description: string;
  }>('wizard.step4.privacy.items', []);

  return (
    <div 
      className="rounded-xl p-8 border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <h2 
        className="text-2xl mb-5"
        style={{ fontWeight: 600, color: '#0B2641' }}
      >
        {t('wizard.step4.privacy.title')}
      </h2>
      
      <div 
        className="w-full h-px mb-6"
        style={{ backgroundColor: '#E5E7EB' }}
      />

      <div className="space-y-4">
        {privacySettings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between py-3">
            <div className="flex-1">
              <div 
                className="text-base mb-1"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                {setting.title}
              </div>
              <div 
                className="text-sm"
                style={{ color: '#6B7280' }}
              >
                {setting.description}
              </div>
            </div>

            <button
              onClick={() => setSettings(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ 
                backgroundColor: settings[setting.id] ? 'var(--primary)' : '#E5E7EB'
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: settings[setting.id] ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
