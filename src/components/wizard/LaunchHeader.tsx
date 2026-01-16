import { useI18n } from '../../i18n/I18nContext';

export default function LaunchHeader() {
  const { t } = useI18n();

  return (
    <div>
      <h1 
        className="text-4xl mb-2"
        style={{ fontWeight: 600, color: '#FFFFFF' }}
      >
        {t('wizard.step4.launchHeader.title')}
      </h1>
      <p 
        className="text-base"
        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
      >
        {t('wizard.step4.launchHeader.subtitle')}
      </p>
      <div 
        className="w-full h-px mt-6"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      />
    </div>
  );
}
