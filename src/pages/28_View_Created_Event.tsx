import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Share2, Lock, Check } from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import SingleEventLanding from '../components/events/SingleEventLanding';
import UpgradeModal from '../components/wizard/modals/UpgradeModal';

export default function ViewCreatedEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  // For demo purposes - set to 'free' to show Pro feature placeholders
  const subscriptionTier: 'free' | 'pro' = 'free';

  const handleEditPage = () => {
    if (eventId) {
      navigate(`/create/design/${eventId}`);
      return;
    }
    navigate('/create-event');
  };

  const handleShare = () => {
    // Copy event URL to clipboard
    const eventUrl = window.location.origin + '/event/saas-summit-2024/landing';
    navigator.clipboard.writeText(eventUrl);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <>
      <NavbarLoggedIn />
      
      {/* Owner Control Bar - Fixed below navbar */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{
          top: '72px',
          height: '50px',
          backgroundColor: '#1E3A5F',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div
          className="h-full flex items-center justify-between mx-auto px-6"
          style={{ maxWidth: '1200px' }}
        >
          {/* Left - Viewing Message */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }}
            />
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
              You are viewing your event as a visitor.
            </span>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Edit Page Button */}
            <button
              onClick={handleEditPage}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = '#0684F5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <Pencil size={14} />
              Edit Page
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0570D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0684F5';
              }}
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Share Success Toast */}
      {showShareToast && (
        <div
          className="fixed right-6 transition-all"
          style={{
            top: '142px',
            zIndex: 50,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center gap-2">
            <Check size={18} />
            Event link copied to clipboard!
          </div>
        </div>
      )}

      {/* Main Event Content with additional top padding for control bar */}
      <div style={{ paddingTop: '50px' }}>
        <SingleEventLanding />
        
        {/* Pro Feature Placeholder Section (only shown for Free users) */}
        {subscriptionTier === 'free' && (
          <div style={{ backgroundColor: '#0B2641', padding: '80px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
              {/* Pro Content Block Placeholder */}
              <div
                className="rounded-xl p-12 text-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '2px dashed #6B7280',
                  position: 'relative'
                }}
              >
                {/* Lock Icon */}
                <div
                  className="mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '2px solid #F59E0B'
                  }}
                >
                  <Lock size={32} style={{ color: '#F59E0B' }} />
                </div>

                {/* Title */}
                <h3
                  className="mb-3"
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#FFFFFF'
                  }}
                >
                  Pro Content Block Hidden
                </h3>

                {/* Description */}
                <p
                  className="mb-6"
                  style={{
                    fontSize: '14px',
                    color: '#94A3B8',
                    maxWidth: '500px',
                    margin: '0 auto 24px'
                  }}
                >
                  This Pro Content Block (Video Gallery) is hidden from public view. 
                  Upgrade to Pro to unlock advanced content blocks, video backgrounds, and more.
                </p>

                {/* Features List */}
                <div className="flex justify-center gap-8 mb-8">
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '1px solid #0684F5'
                      }}
                    >
                      <Check size={12} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      Video Galleries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '1px solid #0684F5'
                      }}
                    >
                      <Check size={12} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      Custom HTML
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '1px solid #0684F5'
                      }}
                    >
                      <Check size={12} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      Advanced Animations
                    </span>
                  </div>
                </div>

                {/* Upgrade Button */}
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-8 py-3 rounded-lg transition-all inline-flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Lock size={16} />
                  Upgrade to Unlock
                </button>

                {/* Pro Badge */}
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '0.5px'
                  }}
                >
                  PRO ONLY
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
