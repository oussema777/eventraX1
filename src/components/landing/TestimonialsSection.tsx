import { Star, Quote } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function TestimonialsSection() {
  const { t, tList } = useI18n();
  const testimonials = tList<{
    quote: string;
    authorName: string;
    authorTitle: string;
    authorCompany: string;
    authorInitials: string;
  }>('landing.testimonials.items');

  if (!testimonials.length) return null;

  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section style={{ backgroundColor: '#091D33' }}>
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px' }}
        className="testimonials-container"
      >
        {/* Section header */}
        <div style={{ marginBottom: '56px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0684F5',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            Testimonials
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#F1F5F9',
              letterSpacing: '-0.01em',
            }}
          >
            {t('landing.testimonials.title', { defaultValue: 'Loved by Event Professionals' })}
          </h2>
        </div>

        {/* Asymmetric layout: featured + smaller */}
        <div
          className="testimonials-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
          }}
        >
          {/* Featured testimonial */}
          {featured && (
            <div
              style={{
                padding: '40px',
                borderRadius: '16px',
                backgroundColor: 'rgba(6, 132, 245, 0.06)',
                border: '1px solid rgba(6, 132, 245, 0.12)',
                position: 'relative',
              }}
              className="testimonial-featured"
            >
              <Quote
                size={32}
                style={{
                  color: '#0684F5',
                  opacity: 0.2,
                  position: 'absolute',
                  top: '32px',
                  right: '32px',
                }}
              />

              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '24px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="#F59E0B"
                    style={{ color: '#F59E0B' }}
                  />
                ))}
              </div>

              <p
                style={{
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                  color: 'rgba(241, 245, 249, 0.9)',
                  marginBottom: '32px',
                  maxWidth: '540px',
                }}
              >
                &ldquo;{featured.quote}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#0684F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {featured.authorInitials}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#F1F5F9',
                    }}
                  >
                    {featured.authorName}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(148, 163, 184, 0.7)',
                    }}
                  >
                    {featured.authorTitle}, {featured.authorCompany}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remaining testimonials: stacked vertically on mobile, side-by-side in grid */}
          <div
            className="testimonials-rest"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px',
            }}
          >
            {rest.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  padding: '28px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#F59E0B"
                      style={{ color: '#F59E0B' }}
                    />
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.65,
                    color: 'rgba(148, 163, 184, 0.9)',
                    marginBottom: '20px',
                  }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(6, 132, 245, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0684F5',
                    }}
                  >
                    {testimonial.authorInitials}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#F1F5F9',
                      }}
                    >
                      {testimonial.authorName}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(148, 163, 184, 0.6)',
                      }}
                    >
                      {testimonial.authorTitle}, {testimonial.authorCompany}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1.2fr 1fr !important;
          }
          .testimonials-rest {
            grid-template-columns: 1fr !important;
          }
          .testimonials-container {
            padding: 96px 48px !important;
          }
          .testimonial-featured {
            grid-row: 1 / -1;
          }
        }
      `}</style>
    </section>
  );
}
