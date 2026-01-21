import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import DesignStudioLanding from '../components/events/DesignStudioLanding';

export default function SingleEventLandingPage() {
  return (
    <>
      <NavbarLoggedIn />
      <div style={{ height: '72px' }} /> {/* Space for fixed navbar if needed, or extra padding */}
      <DesignStudioLanding />
    </>
  );
}
