import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { useEventWizard } from './hooks/useEventWizard';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider } from './i18n/I18nContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';

// ─── React Query Client ─────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes — data considered fresh
      gcTime: 30 * 60 * 1000,        // 30 minutes — cache kept in memory
      retry: 1,                       // Retry failed queries once
      refetchOnWindowFocus: false,    // Don't refetch on tab switch
    },
  },
});

// ─── Lazy-loaded Pages ──────────────────────────────────────────
// Public pages
const LandingPage = lazy(() => import('./pages/01_Landing_Page'));
const AuthFlowDemo = lazy(() => import('./pages/00_Auth_Flow_Demo'));
const AuthCallback = lazy(() => import('./pages/99_Auth_Callback'));
const EventAuthBridge = lazy(() => import('./pages/98_Event_Auth_Bridge'));
const FormResponsePage = lazy(() => import('./pages/FormResponsePage'));
const BrowseEventsDiscoveryPage = lazy(() => import('./pages/24_Browse_Events_Discovery'));
const B2BMarketplaceDiscoveryPage = lazy(() => import('./pages/27_B2B_Marketplace_Discovery'));
const CommunityPeopleDiscovery = lazy(() => import('./pages/34_Community_People_Discovery'));
const FreightCalculatorPage = lazy(() => import('./pages/35_Freight_Calculator'));
const LoadCalculatorPage = lazy(() => import('./pages/36_Load_Calculator'));
const ContainerShippingCostsPage = lazy(() => import('./pages/37_Container_Shipping_Costs'));
const BusinessProductPage = lazy(() => import('./pages/BusinessProductPage'));
const BusinessProfilePageRoute = lazy(() => import('./pages/21_Business_Profile_Page'));
const SingleEventLandingPage = lazy(() => import('./pages/25_Single_Event_Landing_Page'));
const EventSectionPage = lazy(() => import('./pages/EventSectionPage'));
const SponsorshipInquiryPage = lazy(() => import('./pages/38_Sponsorship_Inquiry_Page'));
const EventRegistrationFlow = lazy(() => import('./pages/32_Event_Registration_Flow'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));

// Protected pages — Dashboard
const MyEventsDashboard = lazy(() => import('./pages/02_My_Events_Dashboard'));
const EventManagementDashboard = lazy(() => import('./pages/06_Event_Management_Dashboard'));
const ViewCreatedEvent = lazy(() => import('./pages/28_View_Created_Event'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const MyProfile = lazy(() => import('./pages/09_My_Profile'));
const PricingPage = lazy(() => import('./pages/33_Pricing'));

// Protected pages — Wizard
const WizardStep1Details = lazy(() => import('./pages/03_Wizard_Step1_Details'));
const WizardStep2DesignStudio = lazy(() => import('./pages/04_Wizard_Step2_DesignStudio'));
const DesignStudioPreview = lazy(() => import('./pages/DesignStudioPreview'));
const WizardStep3Registration = lazy(() => import('./pages/05_Wizard_Step3_Registration'));
const WizardStep4Launch = lazy(() => import('./pages/06_Wizard_Step4_Launch'));
const CreateEventWizardStep4 = lazy(() => import('./pages/30_Create_Event_Wizard_Step4'));
const SuccessPublished = lazy(() => import('./pages/07_Success_Published'));
const EventLiveSuccess = lazy(() => import('./pages/31_Event_Live_Success'));
const DraftSaved = lazy(() => import('./pages/08_Draft_Saved'));

// Protected pages — Business
const BusinessProfileWizardPage = lazy(() => import('./pages/20_Business_Profile_Wizard'));
const BusinessManagementDashboardPage = lazy(() => import('./pages/26_Business_Management_Dashboard'));
const UserB2BCenterPage = lazy(() => import('./pages/22_User_B2B_Center'));
const UserMessagesCenterPage = lazy(() => import('./pages/23_User_Messages_Center'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// 404
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Loading Fallback ───────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background, #0B2641)'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#0684F5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Legacy Redirect ────────────────────────────────────────────
function RedirectLegacyWizard() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { resetWizard } = useEventWizard(eventId);

  useEffect(() => {
    if (eventId) {
      navigate(`/create/details/${eventId}`, { replace: true });
      return;
    }
    // Start fresh without creating a DB record yet
    resetWizard();
    navigate('/create/details/new', { replace: true });
  }, [eventId, navigate, resetWizard]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <HelmetProvider>
        <AuthProvider>
          <Router>
          <Toaster position="top-right" richColors closeButton />
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/register" element={<LandingPage />} />
            <Route path="/auth-flow-demo" element={<AuthFlowDemo />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/event-auth" element={<EventAuthBridge />} />
            <Route path="/forms/:formId" element={<FormResponsePage />} />
            <Route path="/browse-events" element={<BrowseEventsDiscoveryPage />} />
            <Route path="/b2b-marketplace" element={<B2BMarketplaceDiscoveryPage />} />
            <Route path="/communities" element={<CommunityPeopleDiscovery />} />
            <Route path="/logistics/freight-calculator" element={<FreightCalculatorPage />} />
            <Route path="/logistics/load-calculator" element={<LoadCalculatorPage />} />
            <Route path="/logistics/container-shipping" element={<ContainerShippingCostsPage />} />
            <Route path="/business/:businessId/offerings/:productId" element={<BusinessProductPage />} />

            <Route path="/business/:businessId" element={<BusinessProfilePageRoute />} />
            <Route path="/event/:eventId/landing" element={<SingleEventLandingPage />} />
            <Route path="/event/:eventId/agenda" element={<EventSectionPage type="agenda" />} />
            <Route path="/event/:eventId/speakers" element={<EventSectionPage type="speakers" />} />
            <Route path="/event/:eventId/sponsors" element={<EventSectionPage type="sponsors" />} />
            <Route path="/event/:eventId/packages" element={<EventSectionPage type="packages" />} />
            <Route path="/event/:eventId/tickets" element={<EventSectionPage type="tickets" />} />
            <Route path="/event/:eventId/sponsor-inquiry/:packageId" element={<SponsorshipInquiryPage />} />
            <Route path="/event/:eventId/exhibitors" element={<EventSectionPage type="exhibitors" />} />
            <Route path="/event/:eventId/attendees" element={<EventSectionPage type="attendees" />} />
            <Route path="/event/:eventId/register" element={<EventRegistrationFlow />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route path="/dashboard" element={<MyEventsDashboard />} />
              <Route path="/my-events" element={<MyEventsDashboard />} />
              <Route path="/event/:eventId" element={<EventManagementDashboard />} />
              <Route path="/event/:eventId/preview" element={<ViewCreatedEvent />} />

              {/* New Event Creation Wizard with Sidebar Navigation */}
              <Route path="/create-event" element={<RedirectLegacyWizard />} />
              <Route path="/create-event/:eventId" element={<RedirectLegacyWizard />} />

              {/* Redirect old route to correct route */}
              <Route path="/event-management-dashboard" element={<Navigate to="/event/saas-summit-2024" replace />} />

              <Route path="/create/details/:eventId" element={<WizardStep1Details />} />
              <Route path="/create/design/:eventId" element={<WizardStep2DesignStudio />} />
              <Route path="/design-studio-preview" element={<DesignStudioPreview />} />
              <Route path="/create/registration/:eventId" element={<WizardStep3Registration />} />
              <Route path="/create/launch/:eventId" element={<WizardStep4Launch />} />
              <Route path="/create/launch-new" element={<CreateEventWizardStep4 />} />
              <Route path="/success" element={<SuccessPublished />} />
              <Route path="/success-live" element={<EventLiveSuccess />} />
              <Route path="/draft-saved" element={<DraftSaved />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/business-profile-wizard" element={<BusinessProfileWizardPage />} />
              <Route path="/business-profile" element={<BusinessProfilePageRoute />} />
              <Route path="/business-management" element={<BusinessManagementDashboardPage />} />
              <Route path="/my-networking" element={<UserB2BCenterPage />} />
              <Route path="/messages" element={<UserMessagesCenterPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </I18nProvider>
    </QueryClientProvider>
  );
}
