import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useI18n } from '../../i18n/I18nContext';

interface NavbarLoggedOutProps {
  onSignUpClick?: () => void;
  onLoginClick?: () => void;
}

export default function NavbarLoggedOut({ onSignUpClick, onLoginClick }: NavbarLoggedOutProps) {
  const { t, tList, locale, setLocale } = useI18n();
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const [isLogisticOpen, setIsLogisticOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const communitiesRef = useRef<HTMLDivElement>(null);
  const logisticRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isCommunitiesLocked = false;
  const isLogisticsLocked = false;
  const isMarketplaceLocked = false;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (communitiesRef.current && !communitiesRef.current.contains(event.target as Node)) {
        setIsCommunitiesOpen(false);
      }
      if (logisticRef.current && !logisticRef.current.contains(event.target as Node)) {
        setIsLogisticOpen(false);
      }
    }

    document?.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const communities = tList<string>('nav.communities.items');
  const logisticSolutions = tList<string>('nav.logistics.items');
  const logisticsRoutes = [
    '/logistics/freight-calculator',
    '/logistics/load-calculator',
    '/logistics/container-shipping'
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50"
      style={{ 
        height: '72px',
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="h-full px-6 md:px-10 flex items-center justify-between max-w-[1440px] mx-auto">
        {/* LEFT SECTION - Logo */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer transition-opacity hover:opacity-80"
        >
          <Logo size="md" />
        </button>

        {/* CENTER SECTION - Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Communities Dropdown */}
          <div ref={communitiesRef} className="relative">
            <button
              onClick={() => {
                if (isCommunitiesLocked) return;
                navigate('/communities');
                setIsCommunitiesOpen(false);
              }}
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
              disabled={isCommunitiesLocked}
              aria-disabled={isCommunitiesLocked}
              style={{ 
                color: 'var(--foreground)',
                fontWeight: 500,
                opacity: isCommunitiesLocked ? 0.6 : 1,
                cursor: isCommunitiesLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {t('nav.communities.label')}
              </span>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommunitiesOpen(!isCommunitiesOpen);
                  setIsLogisticOpen(false);
                }}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isCommunitiesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </div>
            </button>

            {/* Communities Dropdown Menu */}
            {isCommunitiesOpen && !isCommunitiesLocked && (
              <div 
                className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-medium)',
                  minWidth: '280px',
                  maxHeight: '480px',
                  overflowY: 'auto'
                }}
              >
                {communities.map((community, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsCommunitiesOpen(false);
                      navigate(`/communities?sector=${encodeURIComponent(community)}`);
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-opacity-80"
                    style={{ 
                      color: 'var(--foreground)',
                      backgroundColor: 'transparent',
                      whiteSpace: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {community}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Marketplace */}
          <button 
            onClick={() => {
              if (isMarketplaceLocked) return;
              navigate('/b2b-marketplace');
            }}
            className="text-sm transition-colors hover:opacity-80"
            disabled={isMarketplaceLocked}
            aria-disabled={isMarketplaceLocked}
            style={{ 
              color: 'var(--foreground)',
              fontWeight: 500,
              opacity: isMarketplaceLocked ? 0.6 : 1,
              cursor: isMarketplaceLocked ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {t('nav.marketplace')}
              {isMarketplaceLocked && (
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'var(--foreground)',
                    opacity: 0.9,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </span>
          </button>

          {/* Browse Events */}
          <button 
            onClick={() => navigate('/browse-events')}
            className="text-sm transition-colors hover:opacity-80"
            style={{ 
              color: 'var(--foreground)',
              fontWeight: 500
            }}
          >
            {t('nav.browseEvents')}
          </button>

          {/* Logistic Solutions Dropdown */}
          <div ref={logisticRef} className="relative">
            <button
              onClick={() => {
                if (isLogisticsLocked) return;
                setIsLogisticOpen(!isLogisticOpen);
                setIsCommunitiesOpen(false);
              }}
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
              disabled={isLogisticsLocked}
              aria-disabled={isLogisticsLocked}
              style={{ 
                color: 'var(--foreground)',
                fontWeight: 500,
                opacity: isLogisticsLocked ? 0.6 : 1,
                cursor: isLogisticsLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {t('nav.logistics.label')}
                {isLogisticsLocked && (
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'var(--foreground)',
                      opacity: 0.9,
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </span>
              <ChevronDown 
                size={16} 
                style={{
                  transform: isLogisticOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </button>

            {/* Logistic Dropdown Menu */}
            {isLogisticOpen && !isLogisticsLocked && (
              <div 
                className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-medium)',
                  minWidth: '320px'
                }}
              >
                {logisticSolutions.map((solution, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsLogisticOpen(false);
                      navigate(logisticsRoutes[index] || '/');
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors"
                    style={{ 
                      color: 'var(--foreground)',
                      backgroundColor: 'transparent',
                      whiteSpace: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {solution}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION - Auth Buttons & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Login Button - Ghost/Secondary */}
            <button 
              className="px-6 py-3 rounded-lg text-sm transition-all"
              style={{ 
                color: 'var(--foreground)',
                border: '1px solid var(--primary)',
                backgroundColor: 'transparent',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={onLoginClick}
            >
              {t('nav.auth.login')}
            </button>

            {/* Sign Up Button - Primary CTA */}
            <button 
              className="px-6 py-3 rounded-lg text-sm transition-all"
              style={{ 
                color: 'var(--primary-foreground)',
                backgroundColor: 'var(--primary)',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
              onClick={onSignUpClick}
            >
              {t('nav.auth.signUp')}
            </button>
          </div>
          <div className="hidden md:flex items-center">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'en' | 'fr')}
              aria-label={t('nav.language.label')}
              style={{
                height: '32px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--foreground)',
                fontSize: '12px',
                fontWeight: 600,
                minWidth: '78px'
              }}
            >
              <option value="en">{t('nav.language.en')}</option>
              <option value="fr">{t('nav.language.fr')}</option>
            </select>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden absolute top-full left-0 right-0 overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)',
            maxHeight: 'calc(100vh - 72px)',
            boxShadow: 'var(--shadow-medium)'
          }}
        >
          <div className="px-6 py-4 space-y-4">
            {/* Mobile Communities */}
            <div>
              <button
                onClick={() => {
                  if (isCommunitiesLocked) return;
                  navigate('/communities');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-3 text-sm"
                disabled={isCommunitiesLocked}
                aria-disabled={isCommunitiesLocked}
                style={{ 
                  color: 'var(--foreground)',
                  fontWeight: 500,
                  opacity: isCommunitiesLocked ? 0.6 : 1,
                  cursor: isCommunitiesLocked ? 'not-allowed' : 'pointer'
                }}
              >
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {t('nav.communities.label')}
                </span>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommunitiesOpen(!isCommunitiesOpen);
                  }}
                  className="p-2"
                >
                  <ChevronDown 
                    size={16}
                    style={{
                      transform: isCommunitiesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </div>
              </button>
              {isCommunitiesOpen && !isCommunitiesLocked && (
                <div className="pl-4 space-y-2 mt-2">
                  {communities.map((community, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(`/communities?sector=${encodeURIComponent(community)}`);
                      }}
                      className="w-full text-left py-2 text-sm"
                      style={{ color: 'var(--muted-foreground)', whiteSpace: 'normal' }}
                    >
                      {community}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Marketplace */}
            <button 
              onClick={() => {
                if (isMarketplaceLocked) return;
                navigate('/b2b-marketplace');
              }}
              className="w-full text-left py-3 text-sm"
              disabled={isMarketplaceLocked}
              aria-disabled={isMarketplaceLocked}
              style={{ 
                color: 'var(--foreground)',
                fontWeight: 500,
                opacity: isMarketplaceLocked ? 0.6 : 1,
                cursor: isMarketplaceLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {t('nav.marketplace')}
                {isMarketplaceLocked && (
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'var(--foreground)',
                      opacity: 0.9,
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </span>
            </button>

            {/* Mobile Browse Events */}
            <button 
              className="w-full text-left py-3 text-sm"
              style={{ 
                color: 'var(--foreground)',
                fontWeight: 500
              }}
            >
            {t('nav.browseEvents')}
            </button>

            {/* Mobile Logistic Solutions */}
            <div>
              <button
                onClick={() => {
                  if (isLogisticsLocked) return;
                  setIsLogisticOpen(!isLogisticOpen);
                }}
                className="w-full flex items-center justify-between py-3 text-sm"
                disabled={isLogisticsLocked}
                aria-disabled={isLogisticsLocked}
                style={{ 
                  color: 'var(--foreground)',
                  fontWeight: 500,
                  opacity: isLogisticsLocked ? 0.6 : 1,
                  cursor: isLogisticsLocked ? 'not-allowed' : 'pointer'
                }}
              >
                <span style={{ position: 'relative', display: 'inline-block' }}>
                    {t('nav.logistics.label')}
                  {isLogisticsLocked && (
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--foreground)',
                        opacity: 0.9,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </span>
                <ChevronDown 
                  size={16}
                  style={{
                    transform: isLogisticOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              {isLogisticOpen && !isLogisticsLocked && (
                <div className="pl-4 space-y-2 mt-2">
                  {logisticSolutions.map((solution, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(logisticsRoutes[index] || '/');
                      }}
                      className="w-full text-left py-2 text-sm"
                      style={{ color: 'var(--muted-foreground)', whiteSpace: 'normal' }}
                    >
                      {solution}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                <label
                  className="block mb-2 text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {t('nav.language.label')}
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as 'en' | 'fr')}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  <option value="en">{t('nav.language.en')}</option>
                  <option value="fr">{t('nav.language.fr')}</option>
                </select>
              </div>
              <button 
                className="w-full py-3 rounded-lg text-sm"
                style={{ 
                  color: 'var(--foreground)',
                  border: '1px solid var(--primary)',
                  backgroundColor: 'transparent',
                  fontWeight: 500
                }}
                onClick={onLoginClick}
              >
                {t('nav.auth.login')}
              </button>
              <button 
                className="w-full py-3 rounded-lg text-sm"
                style={{ 
                  color: 'var(--primary-foreground)',
                  backgroundColor: 'var(--primary)',
                  fontWeight: 500
                }}
                onClick={onSignUpClick}
              >
                {t('nav.auth.signUp')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
