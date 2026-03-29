import { Calendar, Users, TrendingUp, DollarSign, ArrowUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useI18n } from '../../i18n/I18nContext';

export default function StatsRow() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t, locale } = useI18n();
  const [statsData, setStatsData] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    activeEvents: 0,
    revenue: 0
  });

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US'),
    [locale]
  );

  useEffect(() => {
    if (!user || !profile) return;
    const fetchStats = async () => {
      try {
        let query = supabase
          .from('events')
          .select('id, status');
        
        // Only filter by owner if not admin
        if (profile?.role !== 'admin') {
          query = query.eq('owner_id', user.id);
        }

        const { data: events, error } = await query;

        if (error) throw error;
        const eventIds = (events || []).map((item: any) => item.id);
        const totalEvents = eventIds.length;
        const activeEvents = (events || []).filter((item: any) => item.status !== 'archived').length;

        let totalAttendees = 0;
        if (eventIds.length) {
          const { count, error: attendeeError } = await supabase
            .from('event_attendees')
            .select('id', { count: 'exact', head: true })
            .in('event_id', eventIds);

          if (!attendeeError) {
            totalAttendees = count || 0;
          }
        }

        let revenue = 0;
        if (eventIds.length) {
          const ticketsResult = await supabase
            .from('event_tickets')
            .select('price, quantity_sold')
            .in('event_id', eventIds);
          if (!ticketsResult.error && Array.isArray(ticketsResult.data)) {
            revenue = ticketsResult.data.reduce((sum: number, ticket: any) => {
              const price = Number(ticket.price || 0);
              const sold = Number(ticket.quantity_sold || 0);
              return sum + price * sold;
            }, 0);
          }
        }

        setStatsData({
          totalEvents,
          totalAttendees,
          activeEvents,
          revenue
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };

    fetchStats();
  }, [user, profile]);

  const stats = [
    {
      icon: Calendar,
      value: numberFormatter.format(statsData.totalEvents),
      label: t('dashboard.stats.totalEvents'),
      trend: '+12%',
      color: 'var(--primary)'
    },
    {
      icon: Users,
      value: numberFormatter.format(statsData.totalAttendees),
      label: t('dashboard.stats.totalAttendees'),
      trend: '+8%',
      color: 'var(--success)'
    },
    {
      icon: TrendingUp,
      value: numberFormatter.format(statsData.activeEvents),
      label: t('dashboard.stats.activeEvents'),
      trend: '+3%',
      color: 'var(--accent)'
    },
    {
      icon: DollarSign,
      value: `$${numberFormatter.format(statsData.revenue)}`,
      label: t('dashboard.stats.revenue'),
      trend: '+15%',
      color: 'var(--secondary)'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Icon */}
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <Icon size={20} style={{ color: stat.color }} />
            </div>

            {/* Value */}
            <div 
              className="text-4xl mb-1"
              style={{ fontWeight: 700, color: '#0B2641' }}
            >
              {stat.value}
            </div>

            {/* Label */}
            <div 
              className="text-sm mb-3"
              style={{ 
                fontWeight: 500,
                color: '#6B7280' 
              }}
            >
              {stat.label}
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
              <ArrowUp size={12} />
              <span>{stat.trend} {t('dashboard.stats.trendSuffix')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
