import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { useI18n } from '../../i18n/I18nContext';

export default function Breadcrumb() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleNavigate = (page: string) => {
    if (page === '01_Landing_Page') {
      navigate(ROUTES.LANDING);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="max-w-[1200px] mx-auto flex items-center gap-2 text-sm">
        <button 
          onClick={() => handleNavigate('01_Landing_Page')}
          className="transition-colors hover:opacity-80"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {t('dashboard.breadcrumb.home')}
        </button>
        <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
          {t('dashboard.breadcrumb.current')}
        </span>
      </div>
    </div>
  );
}
