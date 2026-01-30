import {
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Mail,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Eye,
  Star,
  Trash2,
  Mic,
  Building,
  FileText,
  ExternalLink,
  Calendar,
  Ticket
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';
import DynamicKpiGrid from './DynamicKpiGrid';
import DashboardDebugger from './DashboardDebugger';
import { useEventStats } from '../../hooks/useEventStats';
import DashboardChartWidget from './DashboardChartWidget';

interface EventOverviewTabProps {
  eventId?: string;
}

export default function EventOverviewTab({ eventId }: EventOverviewTabProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // Use the unified stats hook
  const { baseStats, typeStats, kpiCharts, eventType, isLoading } = useEventStats(eventId);
  
  // Local state for non-stats things (Activity, Meta)
  const [eventMeta, setEventMeta] = useState<any>(null);
  const [activity, setActivity] = useState<Array<any>>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch meta and activity separately (or move to hook later)
  useMemo(() => {
    if (!eventId) return;
    let mounted = true;
    (async () => {
      // Fetch Event Meta
      const { data: meta } = await supabase
        .from('events')
        .select('id, event_type, cover_image_url, badge_settings, marketing_settings, start_date, end_date, location_address, status, is_public')
        .eq('id', eventId)
        .single();
        
      // Fetch Activity
      const { data: acts } = await supabase
        .from('event_activity_log')
        .select('id, action, entity_type, entity_id, entity_title, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (mounted) {
        if (meta) setEventMeta(meta);
        if (acts) setActivity(acts);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    if (diff < 60_000) return 'just now';
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    return `${days} d ago`;
  };

  const upcomingTasks = useMemo(() => {
    const items = [
      { key: 'tickets', title: t('manageEvent.overview.tasks.items.tickets'), target: 1, priority: 'high', tab: 'ticketing', current: baseStats.tickets },
      { key: 'sessions', title: t('manageEvent.overview.tasks.items.sessions'), target: 4, priority: 'high', tab: 'agenda', current: baseStats.sessions },
      { key: 'speakers', title: t('manageEvent.overview.tasks.items.speakers'), target: 2, priority: 'medium', tab: 'speakers', current: baseStats.speakers },
      { key: 'exhibitors', title: t('manageEvent.overview.tasks.items.exhibitors'), target: 1, priority: 'medium', tab: 'exhibitors', current: baseStats.exhibitors }
    ];
    return items.map((it) => ({
      ...it,
      completed: it.current >= it.target,
      title: `${it.title} ${it.current}/${it.target}`,
      dueDate: 'Action Required'
    }));
  }, [baseStats, t]);

  const pendingTasks = upcomingTasks.filter((t) => !t.completed).length;

  const health = useMemo(() => {
    const ratio = (n: number, d: number) => (d <= 0 ? 0 : Math.min(1, Math.max(0, n / d)));
    const hasBadge = !!(eventMeta?.badge_settings && Object.keys(eventMeta.badge_settings).length > 0);
    const hasMarketing = baseStats.marketing > 0;
    
    const score =
      ratio(baseStats.tickets, 1) * 15 +
      ratio(baseStats.sessions, 4) * 25 +
      ratio(baseStats.speakers, 2) * 20 +
      ratio(baseStats.exhibitors, 1) * 15 +
      (hasBadge ? 10 : 0) +
      (baseStats.forms > 0 ? 5 : 0) +
      (hasMarketing ? 5 : 0) +
      (eventMeta?.cover_image_url ? 5 : 0);

    const pct = Math.max(0, Math.min(100, Math.round(score)));
    
    if (pct < 50) return { pct, color: '#F59E0B', icon: Star, text: 'Good Start' };
    if (pct < 80) return { pct, color: '#0684F5', icon: TrendingUp, text: 'Almost There' };
    return { pct, color: '#10B981', icon: CheckCircle, text: 'Great Progress' };
  }, [baseStats, eventMeta]);

  // Construct chart data for Registration Trends (Mocking explicit dates for now as hook gives raw count)
  // In a real scenario, useEventStats could return time-series data
  const registrationTrendData = useMemo(() => {
      // Create a 7-day trend based on total registrations (simulated distribution)
      const total = baseStats.registrations;
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, i) => ({
          name: day,
          registrations: Math.round(total * (0.1 + (Math.random() * 0.1))) // Random distribution
      }));
  }, [baseStats.registrations]);

  const ticketSalesData = useMemo(() => {
     return [
         { name: 'Sold', value: baseStats.ticketsSold },
         { name: 'Remaining', value: Math.max(0, baseStats.ticketsTotal - baseStats.ticketsSold) }
     ];
  }, [baseStats]);

  return (
    <div className="p-8" style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                {t('manageEvent.overview.header.title')}
              </h2>
              {eventType && (
                <span 
                  className="px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-[#0684F5] text-white shadow-lg"
                >
                  {eventType}
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-400">
            {t('manageEvent.overview.header.subtitle')}
          </p>
        </div>

        {/* 1. Key Metrics Grid (Smart KPIs) */}
        <DynamicKpiGrid eventId={eventId} />

        {/* 2. Standard BI Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <DashboardChartWidget
                title={t('manageEvent.overview.charts.registrationTrends.title')}
                subtitle="Last 7 Days Activity"
                type="area"
                data={registrationTrendData}
                dataKey="registrations"
                color="#0684F5"
            />
            <DashboardChartWidget
                title="Ticket Sales"
                subtitle="Sold vs Remaining Capacity"
                type="pie"
                data={ticketSalesData}
                dataKey="value"
                nameKey="name"
                color="#10B981"
            />
        </div>

        {/* 3. Custom KPI Charts Row */}
        {kpiCharts.length > 0 && (
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-[#F59E0B]" />
                    Custom KPI Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {kpiCharts.map((chart, idx) => (
                        <DashboardChartWidget
                            key={idx}
                            title={chart.fieldLabel}
                            subtitle={`Distribution of answers`}
                            type={idx % 2 === 0 ? 'bar' : 'pie'}
                            data={chart.data}
                            dataKey="value"
                            nameKey="name"
                            color={idx % 2 === 0 ? '#8B5CF6' : '#EC4899'}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* 4. Management Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <div
                className="rounded-xl p-6"
                style={{
                backgroundColor: '#0D3052',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
            >
                <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">
                    {t('manageEvent.overview.tasks.title')}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${pendingTasks === 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                    {t('manageEvent.overview.tasks.pending', { count: pendingTasks })}
                </span>
                </div>
                <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                    <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                    >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                        <p className="text-sm text-white mb-1">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            {task.priority === 'high' && <span className="text-red-400 font-bold">HIGH</span>}
                            <span>{task.tab}</span>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div
                className="rounded-xl p-6"
                style={{
                backgroundColor: '#0D3052',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
            >
                <h3 className="text-lg font-semibold text-white mb-4">
                    {t('manageEvent.overview.activity.title')}
                </h3>
                <div className="space-y-4">
                    {activity.map((act, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Clock size={14} />
                            </div>
                            <div>
                                <p className="text-slate-200">
                                    <span className="text-[#0684F5] font-medium capitalize">
                                        {act.entity_type?.replace('event_', '')}
                                    </span>
                                    {' '}{act.action}
                                </p>
                                <p className="text-xs text-slate-500">{timeAgo(act.created_at)}</p>
                            </div>
                        </div>
                    ))}
                    {activity.length === 0 && (
                        <p className="text-slate-500 italic">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>

      </div>
      <DashboardDebugger eventId={eventId} />
    </div>
  );
}