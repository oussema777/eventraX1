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

  // If not logged in, redirect to home (or landing) where sign-in is available
  if (!user) {
    if (/^\/event\/[^/]+\/networking\/?$/.test(location.pathname)) {
      return <Navigate to={eventAuthPath(location.pathname + location.search)} replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Optional: Enforce email verification for protected routes
  // if (!user.email_confirmed_at) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return <Outlet />;
}
