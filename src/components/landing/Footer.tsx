import { Sparkles, Linkedin, Twitter, Facebook, Mail } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function Footer() {
  const { t, tList } = useI18n();

  return (
    <footer 
      className="py-16 px-6 sm:px-10"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Sparkles size={20} style={{ color: 'white' }} />
              </div>
              <span 
                className="text-2xl tracking-tight"
                style={{ fontWeight: 700, color: 'white' }}
              >
                {t('brand.name')}
              </span>
            </div>
            <p 
              className="text-sm mb-6"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6
              }}
            >
              {t('landing.footer.description')}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Linkedin size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </button>
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Twitter size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </button>
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Facebook size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </button>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 
              className="text-sm mb-4"
              style={{ 
                fontWeight: 600,
                color: 'white'
              }}
            >
              {t('landing.footer.product.title')}
            </h4>
            <ul className="space-y-3">
              {tList<string>('landing.footer.product.items').map((item) => (
                <li key={item}>
                  <button 
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 
              className="text-sm mb-4"
              style={{ 
                fontWeight: 600,
                color: 'white'
              }}
            >
              {t('landing.footer.company.title')}
            </h4>
            <ul className="space-y-3">
              {tList<string>('landing.footer.company.items').map((item) => (
                <li key={item}>
                  <button 
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 
              className="text-sm mb-4"
              style={{ 
                fontWeight: 600,
                color: 'white'
              }}
            >
              {t('landing.footer.newsletter.title')}
            </h4>
            <p 
              className="text-sm mb-4"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {t('landing.footer.newsletter.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t('landing.footer.newsletter.placeholder')}
                className="flex-1 px-3 py-2 rounded-lg text-sm border-0 outline-none"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <button 
                className="px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div 
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <p 
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            {t('landing.footer.legal.copyright')}
          </p>
          <div className="flex gap-6">
            <button 
              className="text-sm transition-colors hover:opacity-100"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {t('landing.footer.legal.privacyPolicy')}
            </button>
            <button 
              className="text-sm transition-colors hover:opacity-100"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {t('landing.footer.legal.terms')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
