import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Define allowed admin emails
const ADMIN_EMAILS = [
  'admin@eventra.com',
  'demo@eventra.com', 
  'marketing@redstart.tn'
];

export default function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  // Check if user is logged in and is an admin
  const isAdmin = user?.email && (
    ADMIN_EMAILS.includes(user.email) || 
    user.email.endsWith('@eventra.com') // Allow all domain emails for dev
  );

  if (!user || !isAdmin) {
    // Redirect unauthorized users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
