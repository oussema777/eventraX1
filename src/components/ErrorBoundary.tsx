import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const errorMessages: Record<string, { title: string; message: string; button: string }> = {
  en: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try reloading the page.',
    button: 'Reload Page'
  },
  fr: {
    title: "Quelque chose s'est mal passé",
    message: 'Une erreur inattendue s\'est produite. Veuillez essayer de recharger la page.',
    button: 'Recharger la page'
  },
  ar: {
    title: 'حدث خطأ ما',
    message: 'حدث خطأ غير متوقع. يرجى محاولة إعادة تحميل الصفحة.',
    button: 'إعادة تحميل الصفحة'
  }
};

const getLang = (): string => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const lang = getLang();
      const msgs = errorMessages[lang] || errorMessages.en;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B2641',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          direction: lang === 'ar' ? 'rtl' : 'ltr',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>{msgs.title}</h1>
          <p style={{ color: '#94A3B8', maxWidth: '400px' }}>
            {msgs.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0684F5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {msgs.button}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
