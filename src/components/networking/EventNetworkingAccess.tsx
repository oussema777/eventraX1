import { ArrowRight, Mail, Ticket, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import './EventNetworkingAccess.css';

export default function EventNetworkingAccess({ b2bDisabled, onRegister, onAccess }: {
  b2bDisabled: boolean; onRegister: () => void; onAccess: () => void;
}) {
  const { t } = useI18n();
  return <div className="networking-access">
    <div className="networking-access__join">
      <span className="networking-access__eyebrow"><Sparkles size={14} />{t('attendeeExperience.accessEyebrow')}</span>
      <h3>{t(b2bDisabled ? 'attendeeExperience.enableTitle' : 'attendeeExperience.joinTitle')}</h3>
      <p>{t(b2bDisabled ? 'attendeeExperience.enableDescription' : 'attendeeExperience.joinDescription')}</p>
      <button type="button" className="networking-access__primary" onClick={onRegister}>
        <Ticket size={18} /><span>{t(b2bDisabled ? 'attendeeExperience.enableB2b' : 'attendeeExperience.register')}</span><ArrowRight size={18} />
      </button>
    </div>
    <div className="networking-access__return">
      <span className="networking-access__mail"><Mail size={22} /></span>
      <h4>{t('attendeeExperience.returnTitle')}</h4>
      <p>{t('attendeeExperience.returnDescription')}</p>
      <button type="button" onClick={onAccess}>{t('attendeeExperience.returnAction')}<ArrowRight size={16} /></button>
      <span className="networking-access__hint">{t('attendeeExperience.returnHint')}</span>
    </div>
  </div>;
}
