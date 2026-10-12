import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { eventAuthPath } from '../../utils/authRedirect';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFBFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
      </div>
    );
  }

  // Keep email destinations through sign-in, including meeting query parameters.
  if (!user) {
    if (/^\/event\/[^/]+\/networking\/?$/.test(location.pathname)) {
      return <Navigate to={eventAuthPath(location.pathname + location.search)} replace />;
    }
    if (/^\/my-networking\/?$/.test(location.pathname)) {
      return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Optional: Enforce email verification for protected routes
  // if (!user.email_confirmed_at) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return <Outlet />;
}
