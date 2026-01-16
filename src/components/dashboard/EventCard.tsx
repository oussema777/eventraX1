import { Calendar, MapPin, Users, Eye, Ticket, Edit, Copy, MoreVertical, Star, Crown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

interface Event {
  id: string | number;
  title: string;
  type: string;
  status: string;
  date: string;
  location: string;
  attendees: string;
  views: string;
  ticketsSold: string;
  coverImage: string;
  isPremium?: boolean;
  countdown?: string;
  isFavorite: boolean;
}

interface EventCardProps {
  event: Event;
  onDuplicate?: (id: string | number) => void;
  onMoreActions?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export default function EventCard({ event, onDuplicate, onMoreActions, onDelete }: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(event.isFavorite);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleNavigate = (page: string) => {
    if (page === '03_Wizard_Step1_Details') {
      navigate(`/create/details/${event.id}`);
    }
  };

  const handleCardClick = () => {
    // Navigate to the Event Management Dashboard
    navigate(`/event/${event.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return { bg: 'var(--success)', text: 'white' };
      case 'draft':
        return { bg: 'var(--gray-500)', text: 'white' };
      case 'upcoming':
        return { bg: 'var(--primary)', text: 'white' };
      case 'archived':
        return { bg: 'var(--gray-400)', text: 'white' };
      default:
        return { bg: 'var(--gray-400)', text: 'white' };
    }
  };

  const statusColors = getStatusColor(event.status);
  const statusKey = `dashboard.status.${event.status}`;
  const statusLabel = t(statusKey);
  const displayStatus = statusLabel === statusKey ? event.status : statusLabel;

  return (
    <div
      onClick={handleCardClick}
      className="rounded-xl border overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer relative group"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Premium Badge */}
      {event.isPremium && (
        <div 
          className="absolute top-0 right-0 z-20 px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #4A7C6D 100%)',
            color: 'white'
          }}
        >
          <Crown size={14} />
          <span className="text-xs font-bold">{t('dashboard.card.pro')}</span>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${event.coverImage})`,
          }}
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)'
          }}
        />

        {/* Status Badge */}
        <div 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs"
          style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            fontWeight: 600,
            textTransform: 'capitalize'
          }}
        >
          {displayStatus}
        </div>

        {/* Countdown Badge */}
        {event.countdown && (
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs mt-9"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)'
            }}
          >
            {event.countdown}
          </div>
        )}

        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Star 
            size={16} 
            style={{ 
              color: isFavorite ? '#F59E0B' : 'white',
              fill: isFavorite ? '#F59E0B' : 'none'
            }} 
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title */}
        <h3 
          className="text-lg mb-2 line-clamp-2"
          style={{ fontWeight: 600, color: '#0B2641' }}
        >
          {event.title}
        </h3>

        {/* Event Type Chip */}
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs mb-3"
          style={{
            backgroundColor: '#F3F4F6',
            color: '#6B7280',
            fontWeight: 500
          }}
        >
          {event.type}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
            <Calendar size={16} />
            <span>{event.date}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm" style={{ color: '#10B981', fontWeight: 500 }}>
            <Users size={16} />
            <span>{event.attendees}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div 
        className="px-5 py-4 border-t flex items-center justify-between"
        style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
      >
        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
            <Eye size={14} />
            <span>{t('dashboard.card.views', { count: event.views })}</span>
          </div>
          <div 
            className="flex items-center gap-1.5 text-xs"
            style={{ 
              color: parseFloat(event.ticketsSold) > 80 ? '#10B981' : '#6B7280',
              fontWeight: 500
            }}
          >
            <Ticket size={14} />
            <span>{t('dashboard.card.sold', { percent: event.ticketsSold })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate('03_Wizard_Step1_Details');
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            title={t('dashboard.card.edit')}
          >
            <Edit size={16} style={{ color: '#6B7280' }} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDuplicate) onDuplicate(event.id);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            title={t('dashboard.card.duplicate')}
          >
            <Copy size={16} style={{ color: '#6B7280' }} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const confirmed = window.confirm(t('dashboard.delete.confirm', 'Are you really sure you want to delete this event? This action cannot be undone.'));
              if (confirmed && onDelete) {
                onDelete(event.id);
              }
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
            title={t('dashboard.card.delete')}
          >
            <Trash2 size={16} style={{ color: '#EF4444' }} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onMoreActions) onMoreActions(event.id);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            title={t('dashboard.card.more')}
          >
            <MoreVertical size={16} style={{ color: '#6B7280' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
