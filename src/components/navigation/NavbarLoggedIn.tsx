import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Bell, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import UserDropdownMenu from './UserDropdownMenu';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsDropdown from './NotificationsDropdown';
import { useI18n } from '../../i18n/I18nContext';

interface NavbarLoggedInProps {
  userName?: string;
  userEmail?: string;
  hasUnreadNotifications?: boolean;
  onLogout?: () => void;
  isUserMenuOpen?: boolean;
  setIsUserMenuOpen?: (value: boolean) => void;
  currentPage?: string;
}

export default function NavbarLoggedIn({
  userName: initialUserName,
  userEmail: initialUserEmail,
  hasUnreadNotifications = true,
  onLogout,
  isUserMenuOpen: externalIsUserMenuOpen,
  setIsUserMenuOpen: externalSetIsUserMenuOpen,
  currentPage
}: NavbarLoggedInProps) {
  const { profile, user, signOut } = useAuth();
  const { t, tList, locale, setLocale } = useI18n();
  const fallbackUserName = t('nav.placeholders.userName');
  const fallbackUserEmail = t('nav.placeholders.userEmail');
  const userName = profile?.full_name || initialUserName || fallbackUserName;
  const userEmail = user?.email || initialUserEmail || fallbackUserEmail;
  const handleLogout = onLogout || signOut;
  
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);  const [isLogisticOpen, setIsLogisticOpen] = useState(false);
  const [internalIsUserMenuOpen, setInternalIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, isLoading: isNotificationsLoading, markAsRead, markAllAsRead } = useNotifications();
  const isCommunitiesLocked = false;
  const isLogisticsLocked = false;
  const isMarketplaceLocked = false;
  
  // Use external state if provided, otherwise use internal state
  const isUserMenuOpen = externalIsUserMenuOpen !== undefined ? externalIsUserMenuOpen : internalIsUserMenuOpen;
  const setIsUserMenuOpen = externalSetIsUserMenuOpen || setInternalIsUserMenuOpen;
  
  const communitiesRef = useRef<HTMLDivElement>(null);
  const logisticRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleBusinessProfileClick = () => {
    if (hasBusinessProfile) {
      navigate('/business-management');
    } else {
      navigate('/business-profile-wizard');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (communitiesRef.current && !communitiesRef.current.contains(event.target as Node)) {
        setIsCommunitiesOpen(false);
      }
      if (logisticRef.current && !logisticRef.current.contains(event.target as Node)) {
        setIsLogisticOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document?.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) {
        setHasBusinessProfile(false);
        return;
      }
      const { data, error } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('owner_profile_id', user.id)
        .maybeSingle();
      if (!error && data?.id) {
        setHasBusinessProfile(true);
      } else {
        setHasBusinessProfile(false);
      }
    };

    fetchBusinessProfile();
  }, [user?.id]);

  const communities = tList<string>('nav.communities.items');
  const logisticSolutions = tList<string>('nav.logistics.items');
  const logisticsRoutes = [
    '/logistics/freight-calculator',
    '/logistics/load-calculator',
    '/logistics/container-shipping'
  ];

  return (
    <nav 
      className="navbar-logged-in fixed top-0 left-0 right-0 z-50"
      style={{ 
        height: '72px',
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .navbar-logged-in__inner {
            padding-left: 16px;
            padding-right: 16px;
          }

          .navbar-logged-in__logo {
            transform: scale(0.92);
            transform-origin: left center;
          }

          .navbar-logged-in__mobile-content {
            padding: 16px;
          }
        }

        @media (max-width: 400px) {
          .navbar-logged-in__inner {
            padding-left: 12px;
            padding-right: 12px;
          }

          .navbar-logged-in__logo {
            transform: scale(0.86);
          }

          .navbar-logged-in__mobile-content {
            padding: 12px;
          }
        }
      `}</style>
      <div className="navbar-logged-in__inner h-full px-6 md:px-10 flex items-center justify-between max-w-[1440px] mx-auto">
        {/* LEFT SECTION - Logo */}
        <button 
          onClick={() => navigate('/')}
          className="navbar-logged-in__logo flex items-center cursor-pointer transition-opacity hover:opacity-80"
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
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80 relative"
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
                  setIsUserMenuOpen(false);
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
            className="text-sm transition-colors hover:opacity-80 relative"
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
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80 relative"
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

        {/* RIGHT SECTION - Notifications & User Profile */}
        <div className="flex items-center gap-4">
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <div ref={notificationsRef} className="relative">
              <button
                className="relative p-2 rounded-lg transition-colors"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                  setIsCommunitiesOpen(false);
                  setIsLogisticOpen(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Bell size={20} style={{ color: 'var(--foreground)' }} />
                {(unreadCount > 0 || hasUnreadNotifications) && (
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#DC2626' }}
                  />
                )}
              </button>

              <NotificationsDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                isLoading={isNotificationsLoading}
                onMarkAsRead={markAsRead}
                onMarkAllRead={markAllAsRead}
              />
            </div>

            {/* User Profile Button */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsCommunitiesOpen(false);
                  setIsLogisticOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontWeight: 700 }}>{userName.charAt(0)}</span>
                  )}
                </div>
                <ChevronDown 
                  size={16}
                  style={{
                    color: 'var(--foreground)',
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {/* User Dropdown Menu */}
              <UserDropdownMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                userName={userName}
                userEmail={userEmail}
                onLogout={handleLogout}
                hasBusinessProfile={hasBusinessProfile}
              />
            </div>
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
          className="navbar-logged-in__mobile-menu lg:hidden absolute top-full left-0 right-0 overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)',
            maxHeight: 'calc(100vh - 72px)',
            boxShadow: 'var(--shadow-medium)'
          }}
        >
          <div className="navbar-logged-in__mobile-content px-6 py-4 space-y-4">
            {/* Mobile User Info */}
            <div 
              className="pb-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm mb-0.5"
                    style={{ 
                      color: 'var(--foreground)',
                      fontWeight: 600
                    }}
                  >
                    {userName}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {userEmail}
                  </p>
                </div>
                {/* Notification Badge */}
                <button className="relative p-2">
                  <Bell size={20} style={{ color: 'var(--foreground)' }} />
                  {hasUnreadNotifications && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#DC2626' }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Communities */}
            <div>
              <button
                onClick={() => {
                  if (isCommunitiesLocked) return;
                  navigate('/communities');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-3 text-sm relative"
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
              className="w-full text-left py-3 text-sm relative"
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
              onClick={() => navigate('/browse-events')}
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
                className="w-full flex items-center justify-between py-3 text-sm relative"
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

            {/* Mobile User Menu Items */}
            <div className="pt-4 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="pt-2 pb-3">
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
              <button className="w-full text-left py-2 text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                {t('nav.userMenu.myProfile')}
              </button>
              <button
                onClick={() => {
                  handleBusinessProfileClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm"
                style={{ 
                  color: 'var(--foreground)',
                  fontWeight: 500
                }}
              >
                {t('nav.userMenu.businessProfile')}
              </button>
              <button className="w-full text-left py-2 text-sm" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                {t('nav.userMenu.myEvents')}
              </button>
              <button
                onClick={() => {
                  navigate('/messages');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm"
                style={{ 
                  color: 'var(--foreground)', 
                  fontWeight: 500
                }}
              >
                {t('nav.userMenu.viewMessages')}
              </button>
              <button 
                onClick={() => {
                  handleLogout?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm" 
                style={{ color: '#DC2626', fontWeight: 500 }}
              >
                {t('nav.userMenu.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
