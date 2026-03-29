import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noindex
      />
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0B2641',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        color: '#FFFFFF',
        textAlign: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '72px', fontWeight: 800, marginBottom: '8px', color: '#0684F5' }}>404</h1>
          <p style={{ fontSize: '20px', color: '#94A3B8', marginBottom: '32px' }}>
            This page doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
