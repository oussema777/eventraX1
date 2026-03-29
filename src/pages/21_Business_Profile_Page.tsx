import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import BusinessProfilePage from '../components/business/BusinessProfilePage';
import SEOHead from '../components/SEOHead';

export default function BusinessProfilePageRoute() {
  return (
    <>
      <SEOHead
        title="Business Profile | Eventra"
        description="Manage your business profile on Eventra."
        noindex
      />
      <NavbarLoggedIn />
      <BusinessProfilePage />
    </>
  );
}
