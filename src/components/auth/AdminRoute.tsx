import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { isEmailAdmin } from '../../config/admin';

export default function AdminRoute() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  // Secure authorization check: 
  // 1. Check if role is 'admin' in database (Secure)
  // 2. Check if email is in the admin config list (Flexible)
  const isAdmin = profile?.role === 'admin' || isEmailAdmin(user?.email);

  if (!user || !isAdmin) {
    // Redirect unauthorized users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
