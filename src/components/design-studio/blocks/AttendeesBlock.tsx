import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import EditModule from './EditModule';

interface Attendee {
  id: string;
  name: string;
  company?: string;
  avatar?: string;
}

interface AttendeesBlockProps {
  brandColor?: string;
  buttonRadius?: number;
  settings?: {
    title?: string;
    subtitle?: string;
    showCount?: boolean;
    cardsPerPage?: number;
    autoSlide?: boolean;
  };
  onEdit?: () => void;
  showEditControls?: boolean;
  isLocked?: boolean;
  attendees?: Attendee[];
}

const MOCK_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Sarah Chen', company: 'TechCorp', avatar: '' },
  { id: '2', name: 'James Wilson', company: 'InnovateLab', avatar: '' },
  { id: '3', name: 'Amira Hassan', company: 'DataFlow', avatar: '' },
  { id: '4', name: 'Lucas Moreau', company: 'CloudSync', avatar: '' },
  { id: '5', name: 'Priya Sharma', company: 'FinEdge', avatar: '' },
  { id: '6', name: 'David Kim', company: 'NexGen AI', avatar: '' },
  { id: '7', name: 'Elena Rossi', company: 'MediaPulse', avatar: '' },
  { id: '8', name: 'Omar Benali', company: 'GreenTech', avatar: '' },
  { id: '9', name: 'Yuki Tanaka', company: 'DesignHub', avatar: '' },
  { id: '10', name: 'Maria Garcia', company: 'BioVenture', avatar: '' },
  { id: '11', name: 'Alex Turner', company: 'CyberShield', avatar: '' },
  { id: '12', name: 'Fatima Zahra', company: 'EduTech', avatar: '' },
];

const AVATAR_COLORS = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EF4444', '#14B8A6', '#F97316', '#06B6D4',
  '#A855F7', '#84CC16',
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AttendeesBlock({
  brandColor = '#635BFF',
  buttonRadius = 12,
  settings,
  onEdit,
  showEditControls = true,
  isLocked = false,
  attendees
}: AttendeesBlockProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const title = settings?.title || t('wizard.designStudio.blocks.attendees.name', 'Our Attendees');
  const subtitle = settings?.subtitle || t('wizard.designStudio.blocks.attendees.description', 'Meet the professionals joining this event');
  const showCount = settings?.showCount !== false;
  const cardsPerPage = settings?.cardsPerPage || 5;
  const autoSlide = settings?.autoSlide !== false;

  const data = attendees && attendees.length > 0 ? attendees : MOCK_ATTENDEES;
  const totalPages = Math.ceil(data.length / cardsPerPage);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(((page % totalPages) + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (autoSlide && totalPages > 1) {
      autoSlideRef.current = setInterval(() => {
        goToPage(currentPage + 1);
      }, 4000);
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [autoSlide, totalPages, currentPage, goToPage]);

  const visibleAttendees = data.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage
  );

  return (
    <div
      className="attendees-block"
      style={{
        position: 'relative',
        padding: '80px 40px',
        backgroundColor: '#FAFBFC',
        width: '100%',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .attendees-block__grid {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: nowrap;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .attendees-block__card {
          flex: 0 0 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 16px;
          border-radius: 16px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
          cursor: default;
        }
        .attendees-block__card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
        }
        .attendees-block__avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .attendees-block__name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .attendees-block__company {
          font-size: 13px;
          color: #6B7280;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .attendees-block__nav {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #E5E7EB;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .attendees-block__nav:hover {
          border-color: currentColor;
          background: #F9FAFB;
        }
        .attendees-block__dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 32px;
        }
        .attendees-block__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (max-width: 1024px) {
          .attendees-block {
            padding: 60px 24px !important;
          }
          .attendees-block__card {
            flex: 0 0 150px;
            padding: 24px 12px;
          }
          .attendees-block__avatar {
            width: 60px;
            height: 60px;
            font-size: 18px;
          }
        }

        @media (max-width: 640px) {
          .attendees-block__grid {
            gap: 12px;
          }
          .attendees-block__card {
            flex: 0 0 130px;
            padding: 20px 10px;
          }
          .attendees-block__avatar {
            width: 52px;
            height: 52px;
            font-size: 16px;
          }
          .attendees-block__name {
            font-size: 13px;
          }
          .attendees-block__company {
            font-size: 11px;
          }
        }
      `}</style>

      {/* Edit Module */}
      {isHovered && showEditControls && !isLocked && (
        <EditModule
          blockName="Attendees"
          onEdit={onEdit}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', backgroundColor: `${brandColor}15`, color: brandColor, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            <Users size={14} />
            {showCount && `${data.length} `}Attendees
          </div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#111827', marginBottom: '12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
            {subtitle}
          </p>
        </div>

        {/* Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {totalPages > 1 && (
            <button
              className="attendees-block__nav"
              style={{ color: brandColor }}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="attendees-block__grid" style={{ flex: 1, overflow: 'hidden' }}>
            {visibleAttendees.map((attendee, idx) => {
              const globalIdx = currentPage * cardsPerPage + idx;
              const colorIdx = globalIdx % AVATAR_COLORS.length;
              return (
                <div key={attendee.id} className="attendees-block__card">
                  {attendee.avatar ? (
                    <img
                      src={attendee.avatar}
                      alt={attendee.name}
                      loading="lazy"
                      className="attendees-block__avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="attendees-block__avatar"
                      style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
                    >
                      {getInitials(attendee.name)}
                    </div>
                  )}
                  <div className="attendees-block__name">{attendee.name}</div>
                  {attendee.company && (
                    <div className="attendees-block__company">{attendee.company}</div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <button
              className="attendees-block__nav"
              style={{ color: brandColor }}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="attendees-block__dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className="attendees-block__dot"
                style={{
                  backgroundColor: i === currentPage ? brandColor : '#D1D5DB',
                  transform: i === currentPage ? 'scale(1.2)' : 'scale(1)'
                }}
                onClick={() => goToPage(i)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
