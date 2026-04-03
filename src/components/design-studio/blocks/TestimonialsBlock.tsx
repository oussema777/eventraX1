import { useState } from 'react';
import { Quote, Star, MessageSquare, Plus, Crown } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsBlockProps {
  testimonials?: Testimonial[];
  brandColor?: string;
  settings?: {
    title?: string;
    subtitle?: string;
    showRating?: boolean;
    columns?: number;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
}

export default function TestimonialsBlock({
  testimonials = [],
  brandColor = '#635BFF',
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false
}: TestimonialsBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const title = settings?.title || 'What Our Community Says';
  const subtitle = settings?.subtitle || `Don't just take our word for it. Hear from our amazing attendees and speakers about their experiences.`;

  return (
    <div
      style={{
        position: 'relative',
        padding: '100px 40px',
        backgroundColor: '#FFFFFF',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule 
          blockName="Testimonials" 
          onEdit={onEdit} 
          quickActions={[
            { icon: <Plus size={16} />, label: 'Add Review', onClick: onEdit },
            { icon: <Star size={16} />, label: 'Manage Ratings', onClick: onEdit }
          ]}
        />
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#111827', marginBottom: '16px', letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{subtitle}</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '32px' 
        }}>
          {testimonials.length > 0 ? (
            testimonials.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '40px',
                  borderRadius: '32px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                  border: '1px solid #F3F4F6',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '40px', 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: brandColor,
                    boxShadow: `0 8px 16px ${brandColor}30`
                  }}
                >
                  <Quote size={20} style={{ color: '#FFFFFF' }} />
                </div>

                <div style={{ marginBottom: '24px', display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={(item.rating || 5) > i ? '#F59E0B' : 'transparent'} 
                      stroke={(item.rating || 5) > i ? '#F59E0B' : '#D1D5DB'} 
                    />
                  ))}
                </div>

                <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '32px', flex: 1 }}>
                  "{item.content}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '24px', borderTop: '1px solid #F9FAFB' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '100px', backgroundColor: '#F3F4F6', overflow: 'hidden', border: '2px solid #FFFFFF', boxShadow: '0 0 0 1px #F3F4F6' }}>
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: 700, fontSize: '20px' }}>
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '80px 40px', 
              border: '2px dashed #F3F4F6', 
              borderRadius: '32px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#D1D5DB' 
            }}>
              <MessageSquare size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#9CA3AF' }}>No testimonials yet.</p>
              <p style={{ fontSize: '14px', color: '#BDC3C7' }}>Click the gear icon to manage your attendee reviews.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}