import { ChevronLeft, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n, type Locale } from '../../i18n/I18nContext';
import { eventPublicPath } from '../../utils/eventLinks';

interface Props {
  event: { id: string; name?: string; seo_slug?: string | null; branding_settings?: any };
}

export default function RegistrationNavigation({ event }: Props) {
  const { t, locale, setLocale } = useI18n();
  const logo = event.branding_settings?.design_studio?.logoUrl;
  return <header className="registration-header no-print">
    <nav className="registration-header-inner" aria-label={t('registrationFlow.eventNavigation')}>
      <Link to={eventPublicPath(event)} className="registration-event-link"
        aria-label={`${t('registrationFlow.backToEventPage')}: ${event.name || 'Eventra'}`}>
        <ChevronLeft size={20} aria-hidden="true" />
        {logo && <img src={logo} alt="" className="registration-event-logo" />}
        <span className="registration-event-identity">
          <span className="registration-back-label">{t('registrationFlow.backToEventPage')}</span>
          <span className="registration-event-name">{event.name || 'Eventra'}</span>
        </span>
      </Link>
      <div className="registration-language">
        <Globe size={17} aria-hidden="true" />
        <select value={locale} onChange={e => setLocale(e.target.value as Locale)} aria-label={t('nav.language.label')}>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
        </select>
      </div>
    </nav>
  </header>;
}
