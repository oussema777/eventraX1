import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Globe, 
  Users, 
  Calendar, 
  Ticket,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import ProgressStepper from '../components/wizard/ProgressStepper';
import { ROUTES } from '../utils/navigation';

export default function CreateEventWizardStep4() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [eventVisibility, setEventVisibility] = useState<'public' | 'private'>('public');
  const [communityVisibility, setCommunityVisibility] = useState(true);
  const navigate = useNavigate();

  const handlePublish = () => {
    // Navigate to success page
    navigate(ROUTES.SUCCESS_LIVE);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B2641' }}>
      {/* Fixed Navigation */}
      <NavbarLoggedIn 
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="wizard"
      />

      {/* Progress Stepper */}
      <div style={{ marginTop: '72px' }}>
        <ProgressStepper currentStep={4} />
      </div>

      {/* Main Content - Centered */}
      <main className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 72px - 80px)' }}>
        <div style={{ width: '600px', maxWidth: '100%' }}>
          {/* LAUNCH CONFIGURATION CARD */}
          <div 
            className="rounded-2xl p-10 mb-8"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl mb-3" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                Ready to Launch?
              </h1>
              <p className="text-lg" style={{ color: '#94A3B8' }}>
                Review your settings before going live.
              </p>
            </div>

            {/* Setting 1: Event Visibility */}
            <div className="mb-8">
              <label className="block text-base mb-3" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                Event Visibility
              </label>
              <div className="relative">
                <select
                  value={eventVisibility}
                  onChange={(e) => setEventVisibility(e.target.value as 'public' | 'private')}
                  className="w-full h-12 px-4 rounded-lg outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="public" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
                    Public - Anyone can discover and register
                  </option>
                  <option value="private" style={{ backgroundColor: '#0B2641', color: '#FFFFFF' }}>
                    Private - Only people with the link can register
                  </option>
                </select>
                <ChevronDown 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
              <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
                {eventVisibility === 'public' 
                  ? 'Your event will appear in search results and the Eventra event directory.'
                  : 'Your event will be hidden from public listings. Share the registration link directly.'}
              </p>
            </div>

            {/* Setting 2: Community Visibility */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <label className="block text-base mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                    Community Visibility
                  </label>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    Do you want your attendees to come out in Eventra communities?
                  </p>
                </div>
                <button
                  onClick={() => setCommunityVisibility(!communityVisibility)}
                  className="relative ml-4 flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    backgroundColor: communityVisibility ? '#0684F5' : 'rgba(255, 255, 255, 0.2)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: communityVisibility ? 'calc(100% - 26px)' : '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      transition: 'left 0.2s',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </button>
              </div>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                This allows attendees to network globally within Eventra.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px my-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Summary Stats (Review) */}
            <div>
              <p className="text-sm mb-4" style={{ color: '#94A3B8', fontWeight: 600 }}>
                Event Summary
              </p>
              <div className="grid grid-cols-3 gap-4">
                {/* Speakers */}
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                >
                  <Users size={24} style={{ color: '#8B5CF6', margin: '0 auto 8px' }} />
                  <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    5
                  </div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>
                    Speakers
                  </div>
                </div>

                {/* Sessions */}
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', border: '1px solid rgba(6, 132, 245, 0.3)' }}
                >
                  <Calendar size={24} style={{ color: '#0684F5', margin: '0 auto 8px' }} />
                  <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    3
                  </div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>
                    Sessions
                  </div>
                </div>

                {/* Ticket Types */}
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  <Ticket size={24} style={{ color: '#10B981', margin: '0 auto 8px' }} />
                  <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    2
                  </div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>
                    Ticket Types
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PUBLISH ACTION */}
          <div className="text-center">
            {/* Primary Button */}
            <button
              onClick={handlePublish}
              className="w-full h-14 rounded-lg flex items-center justify-center gap-3 mb-4 transition-all"
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Rocket size={20} />
              Publish Event
            </button>

            {/* Disclaimer Text - WHITE */}
            <p className="text-sm leading-relaxed px-8" style={{ color: '#FFFFFF' }}>
              Once published, your event will be live and accessible to attendees. 
              You can still make changes after publishing.
            </p>

            {/* Back to Draft Option */}
            <button
              onClick={() => navigate(ROUTES.WIZARD_STEP_1)}
              className="mt-6 text-sm transition-colors"
              style={{ color: '#94A3B8', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E2E8F0';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              ← Back to Marketing Tools
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
