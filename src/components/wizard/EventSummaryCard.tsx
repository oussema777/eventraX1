import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useEventWizard } from '../../hooks/useEventWizard';
import { useI18n } from '../../i18n/I18nContext';

export default function EventSummaryCard() {
  const { eventData } = useEventWizard();
  const { t } = useI18n();

  return (
    <div 
      className="rounded-xl p-8 border"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex gap-6">
        {/* Left - Event Cover */}
        <div className="relative">
          <img
            src={eventData.cover_image_url || "https://images.unsplash.com/photo-1700936655767-7049129f1995?w=400&h=300&fit=crop"}
            alt={t('wizard.step4.summary.coverAlt')}
            className="w-[200px] h-[150px] rounded-lg object-cover"
          />
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs bg-white/90"
            style={{
              color: '#6B7280',
              fontWeight: 600
            }}
          >
            {eventData.status?.toUpperCase() || t('wizard.common.statusDraft')}
          </div>
        </div>

        {/* Right - Event Details */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 
              className="text-2xl"
              style={{ fontWeight: 600, color: '#0B2641' }}
            >
              {eventData.name}
            </h2>
            <span 
              className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-bold"  style={{color:"#3c3c3cff"}}
            >
              {eventData.event_type || t('wizard.common.eventLabel')}
            </span>
          </div>

          {/* Key Details */}
          <div className="space-y-1.5 mt-2 text-sm text-gray-500" style={{color:"#888888ff"}}>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#0684F5]" />
              <span>{eventData.start_date || t('wizard.step4.summary.noDate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#0684F5]" />
              <span>{eventData.location_address || t('wizard.step4.summary.tbd')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#0684F5]" />
              <span>
                {eventData.capacity_limit
                  ? t('wizard.step4.summary.maxAttendees', { count: eventData.capacity_limit })
                  : t('wizard.step4.summary.unlimited')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
