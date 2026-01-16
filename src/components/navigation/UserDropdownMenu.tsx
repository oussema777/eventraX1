import { User, Briefcase, Calendar, Building2, Mail, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

interface UserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  hasBusinessProfile?: boolean;
}

export default function UserDropdownMenu({ 
  isOpen, 
  onClose,
  userName,
  userEmail,
  onLogout,
  hasBusinessProfile = false
}: UserDropdownMenuProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const resolvedUserName = userName || t('nav.placeholders.userName');
  const resolvedUserEmail = userEmail || t('nav.placeholders.userEmail');
  
  if (!isOpen) return null;

  const handleBusinessProfileClick = () => {
    if (hasBusinessProfile) {
      navigate('/business-management');
    } else {
      navigate('/business-profile-wizard');
    }
    onClose();
  };

  const menuItems = [
    { label: t('nav.userMenu.myProfile'), icon: User, onClick: () => navigate('/my-profile') },
    { label: t('nav.userMenu.businessProfile'), icon: Briefcase, onClick: handleBusinessProfileClick },
    { label: t('nav.userMenu.myEvents'), icon: Calendar, onClick: () => navigate('/my-events') },
    { label: t('nav.userMenu.myNetworking'), icon: Building2, onClick: () => navigate('/my-networking') },
    { label: t('nav.userMenu.messages'), icon: Mail, onClick: () => navigate('/messages') }
  ];

  return (
    <div 
      className="absolute top-full right-0 mt-2 rounded-lg overflow-hidden"
      style={{ 
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-medium)',
        minWidth: '280px',
        zIndex: 1000
      }}
    >
      {/* User Info Section */}
      <div 
        className="px-4 py-3"
        style={{ 
          borderBottom: '1px solid var(--border)'
        }}
      >
        <p 
          className="text-sm mb-1 truncate"
          style={{ 
            color: 'var(--foreground)',
            fontWeight: 600
          }}
        >
          {resolvedUserName}
        </p>
        <p 
          className="text-xs truncate"
          style={{ 
            color: 'var(--muted-foreground)'
          }}
        >
          {resolvedUserEmail}
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLocked = Boolean(item.locked);
          return (
            <button
              key={index}
              onClick={() => {
                if (isLocked) {
                  return;
                }
                item.onClick();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 transition-colors relative"
              disabled={isLocked}
              style={{ 
                height: '44px',
                color: 'var(--foreground)',
                backgroundColor: 'transparent',
                opacity: isLocked ? 0.55 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (isLocked) return;
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                if (isLocked) return;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm" style={{ fontWeight: 500 }}>
                {item.label}
              </span>
              {isLocked && (
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--foreground)',
                    opacity: 0.9
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

      {/* Logout */}
      <div className="py-2 bg-[rgb(255,255,255)]">
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              console.log('Logout');
            }
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 transition-colors"
          style={{ 
            height: '44px',
            color: '#DC2626',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={18} />
          <span className="text-sm" style={{ fontWeight: 500 }}>
            {t('nav.userMenu.logout')}
          </span>
        </button>
      </div>
    </div>
  );
}
