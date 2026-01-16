import { Star } from 'lucide-react';
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

  return (
    <section className="py-20 px-6 sm:px-10 bg-background">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-4xl mb-3"
            style={{ fontWeight: 600, color: 'var(--foreground)' }}
          >
            {t('landing.testimonials.title')}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-xl p-6 border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill="#F59E0B"
                    style={{ color: '#F59E0B' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p 
                className="text-base mb-6 italic"
                style={{ 
                  color: '#6B7280',
                  lineHeight: 1.6
                }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Divider */}
              <div 
                className="h-px mb-4"
                style={{ backgroundColor: '#E5E7EB' }}
              />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  {testimonial.authorInitials}
                </div>
                <div>
                  <p 
                    className="text-sm"
                    style={{ fontWeight: 600, color: '#0B2641' }}
                  >
                    {testimonial.authorName}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: '#6B7280' }}
                  >
                    {testimonial.authorTitle}, {testimonial.authorCompany}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
