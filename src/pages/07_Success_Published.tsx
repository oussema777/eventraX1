import { useState } from 'react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import SuccessAnimation from '../components/success/SuccessAnimation';
import SuccessHeader from '../components/success/SuccessHeader';
import EventQuickInfoCard from '../components/success/EventQuickInfoCard';
import NextStepsSection from '../components/success/NextStepsSection';
import SocialShareSection from '../components/success/SocialShareSection';
import PromotionalBanner from '../components/success/PromotionalBanner';
import PrimaryActionsBar from '../components/success/PrimaryActionsBar';
import FooterNote from '../components/success/FooterNote';

export default function SuccessPublished() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B2641' }}>
      {/* Fixed Navigation */}
      <NavbarLoggedIn 
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="success"
      />

      {/* Main Content */}
      <main className="px-10 py-20" style={{ marginTop: '72px' }}>
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          {/* Success Animation */}
          <SuccessAnimation />

          {/* Heading Section */}
          <SuccessHeader />

          {/* Event Quick Info */}
          <EventQuickInfoCard />

          {/* Next Steps */}
          <NextStepsSection />

          {/* Social Share */}
          <SocialShareSection />

          {/* Promotional Banner */}
          <PromotionalBanner />

          {/* Primary Actions */}
          <PrimaryActionsBar />

          {/* Footer Note */}
          <FooterNote />
        </div>
      </main>
    </div>
  );
}