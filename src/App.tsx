import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import AuthFlowDemo from './pages/00_Auth_Flow_Demo';
import LandingPage from './pages/01_Landing_Page';
import MyEventsDashboard from './pages/02_My_Events_Dashboard';
import WizardStep1Details from './pages/03_Wizard_Step1_Details';
import WizardStep2Design from './pages/04_Wizard_Step2_Design';
import WizardStep2DesignStudio from './pages/04_Wizard_Step2_DesignStudio';
import WizardStep3Registration from './pages/05_Wizard_Step3_Registration';
import WizardStep4Launch from './pages/06_Wizard_Step4_Launch';
import CreateEventWizardStep4 from './pages/30_Create_Event_Wizard_Step4';
import SuccessPublished from './pages/07_Success_Published';
import EventLiveSuccess from './pages/31_Event_Live_Success';
import DraftSaved from './pages/08_Draft_Saved';
import EventManagementDashboard from './pages/06_Event_Management_Dashboard';
import MyProfile from './pages/09_My_Profile';
import BusinessProfileWizardPage from './pages/20_Business_Profile_Wizard';
import BusinessProfilePageRoute from './pages/21_Business_Profile_Page';
import UserB2BCenterPage from './pages/22_User_B2B_Center';
import UserMessagesCenterPage from './pages/23_User_Messages_Center';
import BrowseEventsDiscoveryPage from './pages/24_Browse_Events_Discovery';
import SingleEventLandingPage from './pages/25_Single_Event_Landing_Page';
import BusinessManagementDashboardPage from './pages/26_Business_Management_Dashboard';
import B2BMarketplaceDiscoveryPage from './pages/27_B2B_Marketplace_Discovery';
import CommunityPeopleDiscovery from './pages/34_Community_People_Discovery';
import ViewCreatedEvent from './pages/28_View_Created_Event';
import EventRegistrationFlow from './pages/32_Event_Registration_Flow';
import EventCreationWizard from './pages/EventCreationWizard';
import PublicProfilePage from './pages/PublicProfilePage';
import NotificationsPage from './pages/Notifications';
import AuthCallback from './pages/99_Auth_Callback'; 
import DesignStudioPreview from './pages/DesignStudioPreview';
import EventAuthBridge from './pages/98_Event_Auth_Bridge';
import PricingPage from './pages/33_Pricing';
import FreightCalculatorPage from './pages/35_Freight_Calculator';
import LoadCalculatorPage from './pages/36_Load_Calculator';
import ContainerShippingCostsPage from './pages/37_Container_Shipping_Costs';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/auth/AdminRoute';
import { useEventWizard } from './hooks/useEventWizard';
import { useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';

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
    <I18nProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/register" element={<LandingPage />} />
            <Route path="/auth-flow-demo" element={<AuthFlowDemo />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/event-auth" element={<EventAuthBridge />} />
            <Route path="/browse-events" element={<BrowseEventsDiscoveryPage />} />
            <Route path="/b2b-marketplace" element={<B2BMarketplaceDiscoveryPage />} />
            <Route path="/communities" element={<CommunityPeopleDiscovery />} />
            <Route path="/logistics/freight-calculator" element={<FreightCalculatorPage />} />
            <Route path="/logistics/load-calculator" element={<LoadCalculatorPage />} />
            <Route path="/logistics/container-shipping" element={<ContainerShippingCostsPage />} />
            <Route path="/business/:businessId" element={<BusinessProfilePageRoute />} />
            <Route path="/event/:eventId/landing" element={<SingleEventLandingPage />} />
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
          </Routes>
        </Router>
      </AuthProvider>
    </I18nProvider>
  );
}
