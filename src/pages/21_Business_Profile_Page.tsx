import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import BusinessProfilePage from '../components/business/BusinessProfilePage';
import SEOHead from '../components/SEOHead';

export default function BusinessProfilePageRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);
  return (
    <>
      <SEOHead
        title="Business Profile | Eventra"
        description="Manage your business profile on Eventra."
        noindex
      />
      {user ? <NavbarLoggedIn /> : <NavbarLoggedOut
        onLoginClick={() => navigate(`/login?next=${returnTo}`)}
        onSignUpClick={() => navigate(`/register?next=${returnTo}`)} /> }
      <BusinessProfilePage />
    </>
  );
}
