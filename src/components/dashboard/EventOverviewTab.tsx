import {
  TrendingUp,
  Users,
  DollarSign,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Eye,
  Star,
  MessageCircle,
  Trash2,
  Mic,
  Building,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';
import DynamicKpiGrid from './DynamicKpiGrid';
import DashboardDebugger from './DashboardDebugger';

interface EventOverviewTabProps {
  eventId?: string;
}

export default function EventOverviewTab({ eventId }: EventOverviewTabProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [eventMeta, setEventMeta] = useState<any>(null);
  const [counts, setCounts] = useState({
    tickets: 0,
    sessions: 0,
    speakers: 0,
    exhibitors: 0,
    forms: 0,
    marketing: 0
  });
  const [ticketSummary, setTicketSummary] = useState({ sold: 0, total: 0, revenue: 0, avgPrice: 0, currency: 'TND' });
  const [activity, setActivity] = useState<Array<any>>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  useEffect(() => {
    if (!eventId) return;
    let mounted = true;
    (async () => {
      try {
        const eventReq = supabase
          .from('events')
          .select('id, cover_image_url, badge_settings, registration_form_schema, marketing_settings, start_date, location_address, status, is_public')
          .eq('id', eventId)
          .single();

        const ticketsCountReq = supabase.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const sessionsCountReq = supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const speakersCountReq = supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const exhibitorsCountReq = supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const formsCountReq = supabase.from('event_forms').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingTemplatesReq = supabase.from('event_email_templates').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingLinksReq = supabase.from('event_marketing_links').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const ticketsSummaryReq = supabase
          .from('event_tickets')
          .select('price, currency, quantity_sold, quantity_total')
          .eq('event_id', eventId);
        const activityReq = supabase
          .from('event_activity_log')
          .select('id, action, entity_type, entity_id, entity_title, created_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(8);

        const [
          eventRes,
          ticketsCountRes,
          sessionsCountRes,
          speakersCountRes,
          exhibitorsCountRes,
          formsCountRes,
          marketingTemplatesRes,
          marketingLinksRes,
          ticketsSummaryRes,
          activityRes
        ] = await Promise.all([
          eventReq,
          ticketsCountRes,
          sessionsCountRes,
          speakersCountRes,
          exhibitorsCountRes,
          formsCountRes,
          marketingTemplatesRes,
          marketingLinksRes,
          ticketsSummaryRes,
          activityReq
        ]);

        if (!mounted) return;

        if (!eventRes.error) setEventMeta(eventRes.data);

        const ticketsCount = ticketsCountRes.count ?? 0;
        const sessionsCount = sessionsCountRes.count ?? 0;
        const speakersCount = speakersCountRes.count ?? 0;
        const exhibitorsCount = exhibitorsCountRes.count ?? 0;
        const formsCount = formsCountRes.count ?? 0;
        const marketingCount = (marketingTemplatesRes.count ?? 0) + (marketingLinksRes.count ?? 0);

        setCounts({
          tickets: ticketsCount,
          sessions: sessionsCount,
          speakers: speakersCount,
          exhibitors: exhibitorsCount,
          forms: formsCount,
          marketing: marketingCount
        });

        if (!ticketsSummaryRes.error && Array.isArray(ticketsSummaryRes.data)) {
          const rows = ticketsSummaryRes.data;
          const sold = rows.reduce((s, r: any) => s + (Number(r.quantity_sold) || 0), 0);
          const total = rows.reduce((s, r: any) => s + (Number(r.quantity_total) || 0), 0);
          const revenue = rows.reduce((s, r: any) => s + (Number(r.price) || 0) * (Number(r.quantity_sold) || 0), 0);
          const currency = rows.find((r: any) => r.currency)?.currency || 'TND';
          const avgPrice = sold > 0 ? revenue / sold : rows.length > 0 ? rows.reduce((s, r: any) => s + (Number(r.price) || 0), 0) / rows.length : 0;
          setTicketSummary({ sold, total, revenue, avgPrice, currency });
        }

        if (!activityRes.error && Array.isArray(activityRes.data)) setActivity(activityRes.data);
        else setActivity([]);
      } finally {
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return '';
    const diff = Date.now() - t;
    if (diff < 60_000) return 'just now';
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const upcomingTasks = useMemo(() => {
    const items = [
      { key: 'tickets', title: t('manageEvent.overview.tasks.items.tickets'), target: 1, priority: 'high' as const, tab: 'ticketing' },
      { key: 'sessions', title: t('manageEvent.overview.tasks.items.sessions'), target: 4, priority: 'high' as const, tab: 'agenda' },
      { key: 'speakers', title: t('manageEvent.overview.tasks.items.speakers'), target: 2, priority: 'medium' as const, tab: 'speakers' },
      { key: 'exhibitors', title: t('manageEvent.overview.tasks.items.exhibitors'), target: 1, priority: 'medium' as const, tab: 'exhibitors' }
    ];
    return items.map((it) => {
      const current = (counts as any)[it.key] ?? 0;
      const completed = current >= it.target;
      return {
        ...it,
        completed,
        title: `${it.title} ${current}/${it.target}`,
        dueDate: `${current} / ${it.target}`
      };
    });
  }, [counts, t]);

  const pendingTasks = useMemo(() => upcomingTasks.filter((t) => !t.completed).length, [upcomingTasks]);

  const health = useMemo(() => {
    const ratio = (n: number, d: number) => (d <= 0 ? 0 : Math.min(1, Math.max(0, n / d)));
    const hasBadge = !!(eventMeta?.badge_settings && typeof eventMeta.badge_settings === 'object' && Object.keys(eventMeta.badge_settings).length > 0);
    const hasRegistrationSchema = !!(eventMeta?.registration_form_schema && typeof eventMeta.registration_form_schema === 'object' && Object.keys(eventMeta.registration_form_schema).length > 0);
    const hasMarketing = counts.marketing > 0;
    const hasCover = !!eventMeta?.cover_image_url;
    const hasDate = !!eventMeta?.start_date;
    const hasLocation = !!eventMeta?.location_address;

    const score =
      ratio(counts.tickets, 1) * 15 +
      ratio(counts.sessions, 4) * 25 +
      ratio(counts.speakers, 2) * 20 +
      ratio(counts.exhibitors, 1) * 15 +
      (hasBadge ? 10 : 0) +
      (hasRegistrationSchema ? 5 : 0) +
      (hasMarketing ? 5 : 0) +
      (hasCover ? 5 : 0) +
      (hasDate ? 3 : 0) +
      (hasLocation ? 2 : 0);

    const pct = Math.max(0, Math.min(100, Math.round(score)));
    const remaining = upcomingTasks.filter((t) => !t.completed);

    if (pct < 20) {
      return {
        pct,
        color: '#EF4444',
        boxBg: 'rgba(239, 68, 68, 0.12)',
        boxBorder: '1px solid rgba(239, 68, 68, 0.28)',
        icon: AlertCircle,
        text: remaining.length 
          ? t('manageEvent.overview.health.setupIncompleteNext', { items: remaining.slice(0, 2).map((t) => t.title).join(' + ') })
          : t('manageEvent.overview.health.setupIncomplete')
      };
    }
    if (pct < 50) {
      return {
        pct,
        color: '#F59E0B',
        boxBg: 'rgba(245, 158, 11, 0.12)',
        boxBorder: '1px solid rgba(245, 158, 11, 0.28)',
        icon: Star,
        text: remaining.length 
          ? t('manageEvent.overview.health.goodStartNext', { count: remaining.length })
          : t('manageEvent.overview.health.goodStart')
      };
    }
    if (pct < 60) {
      return {
        pct,
        color: '#F59E0B',
        boxBg: 'rgba(245, 158, 11, 0.12)',
        boxBorder: '1px solid rgba(245, 158, 11, 0.28)',
        icon: TrendingUp,
        text: remaining.length 
          ? t('manageEvent.overview.health.almostThereNext', { count: remaining.length })
          : t('manageEvent.overview.health.almostThere')
      };
    }
    return {
      pct,
      color: '#10B981',
      boxBg: 'rgba(16, 185, 129, 0.15)',
      boxBorder: '1px solid rgba(16, 185, 129, 0.3)',
      icon: CheckCircle,
      text: remaining.length 
        ? t('manageEvent.overview.health.greatProgressNext', { count: remaining.length })
        : t('manageEvent.overview.health.greatProgress')
    };
  }, [counts, eventMeta, upcomingTasks, t]);

  const recentActivity = useMemo(() => {
    const mapTab = (entityType: string) => {
      switch (entityType) {
        case 'event_speakers': return 'speakers';
        case 'event_sessions': return 'agenda';
        case 'event_tickets': return 'ticketing';
        case 'event_exhibitors': return 'exhibitors';
        case 'event_forms': return 'create-registration';
        case 'event_email_templates':
        case 'event_marketing_links': return 'marketing';
        default: return 'overview';
      }
    };

    const iconFor = (entityType: string, action: string) => {
      if (action === 'delete') return Trash2;
      if (entityType === 'event_speakers') return Mic;
      if (entityType === 'event_sessions') return Calendar;
      if (entityType === 'event_tickets') return Ticket;
      if (entityType === 'event_exhibitors') return Building;
      if (entityType === 'event_forms') return FileText;
      if (entityType === 'event_email_templates') return Mail;
      if (entityType === 'event_marketing_links') return ExternalLink;
      return CheckCircle;
    };

    const colorFor = (entityType: string, action: string) => {
      if (action === 'delete') return '#EF4444';
      if (entityType === 'event_sessions') return '#F59E0B';
      if (entityType === 'event_tickets') return '#8B5CF6';
      if (entityType === 'event_exhibitors') return '#0684F5';
      if (entityType === 'event_speakers') return '#10B981';
      return '#94A3B8';
    };

    const labelFor = (entityType: string) => {
      if (entityType === 'event_speakers') return t('manageEvent.overview.activity.items.speaker');
      if (entityType === 'event_sessions') return t('manageEvent.overview.activity.items.session');
      if (entityType === 'event_tickets') return t('manageEvent.overview.activity.items.ticket');
      if (entityType === 'event_exhibitors') return t('manageEvent.overview.activity.items.exhibitor');
      if (entityType === 'event_forms') return t('manageEvent.overview.activity.items.registrationForm');
      if (entityType === 'event_email_templates') return t('manageEvent.overview.activity.items.emailCampaign');
      if (entityType === 'event_marketing_links') return t('manageEvent.overview.activity.items.marketingLink');
      return t('manageEvent.overview.activity.items.update');
    };

    const actionVerb = (action: string) => {
      if (action === 'insert') return t('manageEvent.overview.activity.items.created');
      if (action === 'update') return t('manageEvent.overview.activity.items.updated');
      if (action === 'delete') return t('manageEvent.overview.activity.items.deleted');
      return t('manageEvent.overview.activity.items.updated');
    };

    return (activity || []).map((a) => {
      const Icon = iconFor(a.entity_type, a.action);
      const color = colorFor(a.entity_type, a.action);
      const tab = mapTab(a.entity_type);
      const title = a.entity_title ? `: ${a.entity_title}` : '';
      const message = `${labelFor(a.entity_type)} ${actionVerb(a.action)}${title}`;
      return {
        id: a.id,
        message,
        time: timeAgo(a.created_at),
        icon: Icon,
        color,
        onClick: () => {
          if (!eventId) return;
          if (tab === 'create-registration') {
            navigate(`/create/registration/${eventId}`);
            return;
          }
          navigate({ pathname: `/event/${eventId}`, search: `?tab=${tab}` });
        }
      };
    });
  }, [activity, eventId, navigate, t]);

  const pendingStyle = useMemo(() => {
    if (pendingTasks === 0) return { bg: 'rgba(16, 185, 129, 0.15)', fg: '#10B981' };
    if (pendingTasks <= 2) return { bg: 'rgba(245, 158, 11, 0.15)', fg: '#F59E0B' };
    return { bg: 'rgba(239, 68, 68, 0.15)', fg: '#EF4444' };
  }, [pendingTasks]);

  const isPublished = !!(eventMeta?.status === 'published' && eventMeta?.is_public);

  const handlePublish = async () => {
    if (!eventId || isPublished) return;
    try {
      setIsPublishing(true);
      const { error } = await supabase
        .from('events')
        .update({ 
          status: 'published', 
          is_public: true,
          moderation_status: 'pending' // Send to moderation queue
        })
        .eq('id', eventId);
      if (error) throw error;
      setEventMeta((prev: any) => (prev ? { ...prev, status: 'published', is_public: true } : prev));
      toast.success('Event submitted for review!');
      toast.success(t('manageEvent.overview.toasts.publishSuccess'));
    } catch (_err) {
      toast.error(t('manageEvent.overview.toasts.publishError'));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-8" style={{ backgroundColor: '#0B2641' }}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('manageEvent.overview.header.title')}
            </h2>
          </div>
          <p style={{ fontSize: '16px', color: '#94A3B8' }}>
            {t('manageEvent.overview.header.subtitle')}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <DynamicKpiGrid eventId={eventId} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Left Column: Registration Chart Placeholder */}
          <div
            className="col-span-2 rounded-xl p-6"
            style={{
              backgroundColor: '#0D3052',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('manageEvent.overview.charts.registrationTrends.title')}
                </h3>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('manageEvent.overview.charts.registrationTrends.subtitle')}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!eventId) return;
                  navigate({ pathname: `/event/${eventId}`, search: '?tab=reporting' });
                }}
                className="flex items-center gap-2 px-4 h-9 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E2E8F0',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <BarChart3 size={16} />
                {t('manageEvent.overview.charts.registrationTrends.viewDetails')}
              </button>
            </div>

            {/* Chart Placeholder */}
            <div
              className="rounded-lg flex items-center justify-center"
              style={{
                height: '280px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '2px dashed rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-center">
                <BarChart3 size={48} style={{ color: '#64748B', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('manageEvent.overview.charts.registrationTrends.visualization')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#0D3052',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              {t('manageEvent.overview.activity.title')}
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <button key={index} onClick={activity.onClick} className="w-full flex items-start gap-3 text-left">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}25` }}
                      >
                        <Icon size={16} style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                          {activity.message}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>
                          {activity.time}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(148, 163, 184, 0.12)' }}
                  >
                    <Clock size={16} style={{ color: '#94A3B8' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                      {t('manageEvent.overview.activity.noActivity')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>
                      {t('manageEvent.overview.activity.noActivityDesc')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              className="w-full mt-4 h-9 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E2E8F0',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {t('manageEvent.overview.activity.viewAll')}
            </button>
          </div>
        </div>

        {/* Bottom Row: Tasks & Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#0D3052',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('manageEvent.overview.tasks.title')}
              </h3>
              <span
                className="px-2 py-1 rounded-full"
                style={{
                  backgroundColor: pendingTasks === 0 ? 'rgba(16, 185, 129, 0.15)' : pendingTasks >= 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: pendingTasks === 0 ? '#10B981' : pendingTasks >= 3 ? '#EF4444' : '#F59E0B',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {t('manageEvent.overview.tasks.pending', { count: pendingTasks })}
              </span>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '2px',
                      cursor: 'pointer'
                    }}
                  />
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock size={12} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {task.dueDate}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            task.priority === 'high'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : task.priority === 'medium'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(6, 132, 245, 0.15)',
                          color:
                            task.priority === 'high'
                              ? '#EF4444'
                              : task.priority === 'medium'
                              ? '#F59E0B'
                              : '#0684F5',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-4 h-9 rounded-lg transition-colors"
              style={{
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t('manageEvent.overview.tasks.viewAll')}
            </button>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#0D3052',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              {t('manageEvent.overview.actions.title')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!eventId) return;
                  navigate({ pathname: `/event/${eventId}`, search: '?tab=marketing' });
                }}
              >
                <Mail size={24} style={{ color: '#0684F5' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.overview.actions.sendEmail')}
                </span>
              </button>
              <button
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!eventId) return;
                  navigate({ pathname: `/event/${eventId}`, search: '?tab=agenda' });
                }}
              >
                <Calendar size={24} style={{ color: '#0684F5' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.overview.actions.addSession')}
                </span>
              </button>
              <button
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!eventId) return;
                  navigate({ pathname: `/event/${eventId}`, search: '?tab=speakers' });
                }}
              >
                <Users size={24} style={{ color: '#0684F5' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.overview.actions.addSpeaker')}
                </span>
              </button>
              <button
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!eventId) return;
                  window.open(`/event/${eventId}/preview`, '_blank', 'noopener,noreferrer');
                }}
              >
                <Eye size={24} style={{ color: '#0684F5' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.overview.actions.previewSite')}
                </span>
              </button>
            </div>

            {/* Event Health Score */}
            <div
              className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: health.boxBg, border: health.boxBorder }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.overview.health.title')}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: health.color }}>
                  {health.pct}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div
                  style={{
                    width: `${health.pct}%`,
                    height: '100%',
                    backgroundColor: health.color,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                {(() => {
                  const Icon = health.icon;
                  return <Icon size={12} style={{ display: 'inline', marginRight: '4px', color: health.color }} />;
                })()}
                {health.text}
              </p>
            </div>
          </div>  
        </div>

      </div>
      <DashboardDebugger eventId={eventId} />
    </div>
  );
}
