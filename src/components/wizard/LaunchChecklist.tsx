import { Check, AlertCircle, Circle } from 'lucide-react';
import { useEventWizard } from '../../hooks/useEventWizard';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface LaunchChecklistProps {
  eventId: string;
  onNavigate?: (step: any) => void;
}

export default function LaunchChecklist({ eventId, onNavigate }: LaunchChecklistProps) {
  const { t } = useI18n();
  const { eventData } = useEventWizard(eventId);
  const [ticketCount, setTicketCount] = useState(0);
  const isFreeEvent = eventData.event_status === 'free';

  useEffect(() => {
    if (eventId) {
      supabase
        .from('event_tickets')
        .select('id', { count: 'exact' })
        .eq('event_id', eventId)
        .then(({ count }) => setTicketCount(count || 0));
    }
  }, [eventId]);

  const checklistItems = [
    {
      id: 1,
      status: eventData.name && eventData.start_date ? 'complete' as const : 'warning' as const,
      title: t('wizard.step4.checklist.items.details'),
      link: t('wizard.step4.checklist.actions.edit'),
      step: 1
    },
    {
      id: 2,
      status: (eventData.branding_settings && (eventData.branding_settings.primaryColor || eventData.branding_settings.primary_color)) || eventData.primary_color ? 'complete' as const : 'pending' as const,
      title: t('wizard.step4.checklist.items.design'),
      link: t('wizard.step4.checklist.actions.edit'),
      step: 2
    },
    {
      id: 3,
      status: isFreeEvent || ticketCount > 0 ? 'complete' as const : 'warning' as const,
      title: isFreeEvent
        ? t('wizard.step4.checklist.items.freeTickets')
        : t('wizard.step4.checklist.items.ticketRequired'),
      link: isFreeEvent
        ? t('wizard.step4.checklist.actions.view')
        : t('wizard.step4.checklist.actions.addTicket'),
      step: isFreeEvent ? '3.2' : '3.1'
    }
  ];

  const completedCount = checklistItems.filter(item => item.status === 'complete').length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const getIcon = (status: 'complete' | 'warning' | 'pending') => {
    switch (status) {
      case 'complete':
        return (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--success)' }}
          >
            <Check size={14} style={{ color: 'white' }} />
          </div>
        );
      case 'warning':
        return (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            <AlertCircle size={14} style={{ color: 'white' }} />
          </div>
        );
      case 'pending':
        return (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--gray-200)' }}
          >
            <Circle size={14} style={{ color: 'var(--gray-400)' }} />
          </div>
        );
    }
  };

  const getTextColor = (status: 'complete' | 'warning' | 'pending') => {
    switch (status) {
      case 'complete':
        return '#0B2641';
      case 'warning':
        return 'var(--warning)';
      case 'pending':
        return '#9CA3AF';
    }
  };

  return (
    <div 
      className="rounded-xl p-8 border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <h2 
        className="text-2xl mb-2"
        style={{ fontWeight: 600, color: '#0B2641' }}
      >
        {t('wizard.step4.checklist.title')}
      </h2>
      <p 
        className="text-sm mb-5"
        style={{ color: '#6B7280' }}
      >
        {t('wizard.step4.checklist.subtitle')}
      </p>
      
      <div 
        className="w-full h-px mb-6"
        style={{ backgroundColor: '#E5E7EB' }}
      />

      {/* Checklist Items */}
      <div className="space-y-3 mb-6">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 flex-1">
              {getIcon(item.status)}
              <span 
                className="text-base"
                style={{ color: getTextColor(item.status) }}
              >
                {item.title}
              </span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate(item.step)}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ 
                color: 'var(--primary)',
                fontWeight: 500
              }}
            >
              {item.link}
            </button>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-sm"
            style={{ color: '#6B7280' }}
          >
            {t('wizard.step4.checklist.progress', { completed: completedCount, total: totalCount })}
          </span>
          <span 
            className="text-sm"
            style={{ color: 'var(--primary)', fontWeight: 600 }}
          >
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div 
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
