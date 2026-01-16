import { Info } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function PublishConfirmation() {
  const { t } = useI18n();

  return (
    <div 
      className="rounded-lg p-5 border-l-4 flex items-start gap-4"
      style={{ 
        backgroundColor: 'rgba(6, 132, 245, 0.1)',
        borderColor: 'var(--primary)'
      }}
    >
      <Info size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      <p 
        className="text-sm"
        style={{ color: '#FFFFFF' }}
      >
        {t('wizard.step4.publishConfirmation.body')}
      </p>
    </div>
  );
}
