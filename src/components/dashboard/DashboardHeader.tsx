import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEventWizard } from '../../hooks/useEventWizard';
import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { saveDraft, resetWizard } = useEventWizard();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async () => {
    setIsCreating(true);
    try {
      resetWizard();
      // Navigate directly to the first step of the wizard
      navigate('/create/details/new');
    } catch (error) {
      console.error('Failed to initialize wizard:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end mb-10" style={{ justifyContent: 'space-between' }}>
      {/* Left Side - Title */}
      <div>
        <h1 
          className="text-4xl mb-2"
          style={{ fontWeight: 600, color: 'var(--foreground)' }}
        >
          {t('dashboard.header.title')}
        </h1>
        <p 
          className="text-base"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {t('dashboard.header.subtitle')}
        </p>
      </div>

      {/* Right Side - Create Button */}
      <button
        onClick={handleCreateEvent}
        disabled={isCreating}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontWeight: 600,
          boxShadow: 'var(--shadow-light)'
        }}
      >
        {isCreating ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Plus size={20} />
        )}
        {isCreating ? t('dashboard.header.initializing') : t('dashboard.header.create')}
      </button>
    </div>
  );
}
