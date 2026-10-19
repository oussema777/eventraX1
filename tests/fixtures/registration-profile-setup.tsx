import { createRoot } from 'react-dom/client';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { I18nProvider } from '../../src/i18n/I18nContext';
import ModalProfileSetup from '../../src/components/modals/ModalProfileSetup';
import '../../src/index.css';

const params = new URLSearchParams(location.search);
createRoot(document.getElementById('root')!).render(
  <AuthProvider><I18nProvider>
    <ModalProfileSetup
      isOpen={true}
      onClose={() => {}}
      userEmail={params.get('email') || 'viewer@example.test'}
      onComplete={() => {}}
      onSkip={() => {}}
    />
  </I18nProvider></AuthProvider>
);
