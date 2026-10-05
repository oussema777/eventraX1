import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import Logo from '../ui/Logo';

export default function Footer() {
  const { t } = useI18n();
  const links = [
    { to: '/browse-events', label: t('nav.browseEvents') },
    { to: '/b2b-marketplace', label: t('nav.marketplace') },
    { to: '/communities', label: t('nav.communities.label') },
  ];
  const linkClass = 'inline-flex items-center gap-2 py-1 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-sm';

  return (
    <footer className="py-12 px-6 sm:px-10" style={{ backgroundColor: 'var(--navy)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link to="/" className="inline-flex mb-4 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Logo size="lg" />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              {t('landing.footer.description')}
            </p>
          </div>

          <nav aria-label={t('landing.footer.explore')}>
            <h2 className="text-sm font-semibold text-white mb-4">{t('landing.footer.explore')}</h2>
            <ul className="space-y-2">
              {links.map(link => (
                <li key={link.to}><Link to={link.to} className={linkClass}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white mb-4">{t('landing.footer.contact')}</h2>
            <a href="mailto:contact@eventra.cloud" className={`${linkClass} break-all`}>
              <Mail size={16} aria-hidden="true" className="shrink-0" />
              contact@eventra.cloud
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-sm text-white/50">
            {t('landing.footer.legal.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
