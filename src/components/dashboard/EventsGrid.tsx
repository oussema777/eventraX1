import EventCard from './EventCard';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useEventWizard } from '../../hooks/useEventWizard';
import { useI18n } from '../../i18n/I18nContext';

interface EventsGridProps {
  events: any[];
  isLoading: boolean;
  refreshEvents: () => Promise<void> | void;
}

export default function EventsGrid({ events, isLoading, refreshEvents }: EventsGridProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { saveDraft, resetWizard } = useEventWizard();
  const [isCreating, setIsCreating] = useState(false);
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US';
  const fallbackCover = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';

  const resolveCoverImage = (event: any) => {
    const brandingSettings = event?.branding_settings;
    const designStudioLogo = brandingSettings?.design_studio?.logoUrl;
    const brandingLogo = brandingSettings?.logoUrl;
    const logoUrl = event?.logo_url || event?.event_logo_url || designStudioLogo || brandingLogo;
    return event?.cover_image_url || logoUrl || fallbackCover;
  };

  const handleCreateEvent = async () => {
    setIsCreating(true);
    try {
      resetWizard();
      navigate('/create/details/new');
    } catch (error) {
      console.error('Failed to initialize wizard:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string | number) => {
    try {
      // Optimistic update or wait for refresh
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      await refreshEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={{
            id: event.id,
            title: event.name || t('event.untitled'),
            type: event.event_type || t('dashboard.event.typeFallback'),
            status: event.status, // draft, published, etc
            date: event.start_date
              ? new Date(event.start_date).toLocaleDateString(localeTag)
              : t('dashboard.event.noDate'),
            location: event.location_address || t('dashboard.event.locationTbd'),
            attendees: t('dashboard.card.registered', { count: 0 }), // Placeholder until attendee table linked
            views: '0',
            ticketsSold: '0%',
            coverImage: resolveCoverImage(event),
            isFavorite: false
          }}
          onDelete={handleDeleteEvent}
          onDuplicate={async (eventId) => {
            const source = events.find((item) => item.id === eventId);
            if (!source || !user) return;
            try {
              const payload = {
                name: t('dashboard.event.copyName', { name: source.name }),
                tagline: source.tagline || null,
                description: source.description || null,
                event_type: source.event_type || t('dashboard.event.typeFallback'),
                event_status: source.event_status || 'free',
                event_format: source.event_format || 'in-person',
                start_date: source.start_date || null,
                end_date: source.end_date || null,
                timezone: source.timezone || null,
                location_address: source.location_address || null,
                capacity_limit: source.capacity_limit || null,
                waitlist_enabled: source.waitlist_enabled || false,
                cover_image_url: source.cover_image_url || null,
                primary_color: source.primary_color || null,
                secondary_color: source.secondary_color || null,
                branding_settings: source.branding_settings || null,
                status: 'draft',
                is_public: false,
                owner_id: user.id
              };
              let currentPayload = { ...payload };
              let created: any = null;
              for (let attempt = 0; attempt < 5; attempt += 1) {
                const { data, error } = await supabase
                  .from('events')
                  .insert([currentPayload])
                  .select()
                  .single();
                if (!error) {
                  created = data;
                  break;
                }
                if (error.code === 'PGRST204') {
                  const match = error.message?.match(/'([^']+)'/);
                  const missingColumn = match?.[1];
                  if (missingColumn && missingColumn in currentPayload) {
                    const { [missingColumn]: _removed, ...rest } = currentPayload;
                    currentPayload = rest;
                    continue;
                  }
                }
                throw error;
              }
              if (created?.id) {
                await refreshEvents();
                navigate(`/create/details/${created.id}`);
              }
            } catch (error) {
              console.error('Failed to duplicate event:', error);
            }
          }}
          onMoreActions={(eventId) => {
            navigate(`/event/${eventId}`);
          }}
        />
      ))}

      {/* Empty State Card - Create New Event */}
      <button
        onClick={handleCreateEvent}
        disabled={isCreating}
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group"
        style={{
          minHeight: '420px',
          borderColor: '#D1D5DB',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#0684F5]/20"
          style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)' }}
        >
          {isCreating ? (
            <Loader2 className="animate-spin text-[#0684F5]" size={32} />
          ) : (
            <Plus size={32} style={{ color: '#0684F5' }} />
          )}
        </div>
        <div className="text-center">
          <p 
            className="text-base mb-1"
            style={{ fontWeight: 600, color: '#0B2641' }}
          >
            {isCreating ? t('dashboard.header.initializing') : t('dashboard.empty.create')}
          </p>
          <p 
            className="text-sm text-gray-500"
          >
            {isCreating ? t('dashboard.empty.waiting') : t('dashboard.empty.subtitle')}
          </p>
        </div>
      </button>
    </div>
  );
}
