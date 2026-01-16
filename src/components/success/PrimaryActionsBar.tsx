import { Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';

export default function PrimaryActionsBar() {
  const navigate = useNavigate();

  const handleCreateAnother = () => {
    navigate(ROUTES.WIZARD_STEP_1);
  };

  const handleGoToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const handleViewEvent = () => {
    console.log('Open event page in new tab');
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-16">
      <button
        onClick={handleCreateAnother}
        className="h-12 px-6 rounded-xl border flex items-center gap-2 transition-colors"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          color: '#0B2641',
          fontWeight: 600
        }}
      >
        <Plus size={20} />
        Create Another Event
      </button>

      <button
        onClick={handleGoToDashboard}
        className="h-12 px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          fontWeight: 700
        }}
      >
        Go to Dashboard
        <ArrowRight size={20} />
      </button>

      <button
        onClick={handleViewEvent}
        className="h-12 px-6 rounded-xl border flex items-center gap-2 transition-colors"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          color: '#0B2641',
          fontWeight: 600
        }}
      >
        View Event Page
        <ExternalLink size={20} />
      </button>
    </div>
  );
}