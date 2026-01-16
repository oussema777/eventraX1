import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFBFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
      </div>
    );
  }

  // If not logged in, redirect to home (or landing) where sign-in is available
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Optional: Enforce email verification for protected routes
  // if (!user.email_confirmed_at) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return <Outlet />;
}
