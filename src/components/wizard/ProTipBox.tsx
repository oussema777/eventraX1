import { Lightbulb } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function ProTipBox() {
  const { t } = useI18n();
  return (
    <div 
      className="p-4 rounded-lg flex items-start gap-3"
      style={{
        backgroundColor: '#FEF3C7',
        borderLeft: '4px solid var(--warning)'
      }}
    >
      <Lightbulb 
        size={24} 
        className="flex-shrink-0"
        style={{ color: '#D97706' }}
      />
      <p 
        className="text-sm"
        style={{ color: '#92400E' }}
      >
        <span style={{ fontWeight: 600 }}>{t('wizard.details.proTip.title')}</span>{' '}
        {t('wizard.details.proTip.body')}
      </p>
    </div>
  );
}
