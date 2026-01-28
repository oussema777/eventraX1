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
  Tag,
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
  const [registrationRows, setRegistrationRows] = useState<Array<any>>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const buildFallbackActivity = async (activeEventId: string) => {
    const [tickets, sessions, speakers, exhibitors, forms, templates, links, promos, comms] = await Promise.all([
      supabase.from('event_tickets').select('id,name,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_sessions').select('id,title,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_speakers').select('id,name,full_name,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_exhibitors').select('id,company_name,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_forms').select('id,title,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_email_templates').select('id,name,subject,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_tracking_links').select('id,name,slug,created_at,updated_at').eq('event_id', activeEventId).order('updated_at', { ascending: false }).limit(1),
      supabase.from('event_promos').select('id,code,created_at').eq('event_id', activeEventId).order('created_at', { ascending: false }).limit(1),
      supabase.from('event_communications').select('id,subject,created_at,meta').eq('event_id', activeEventId).eq('kind', 'email').order('created_at', { ascending: false }).limit(1)
    ]);

    const rows = [
      ...(tickets.data || []).map((row: any) => ({ ...row, entity_type: 'event_tickets', entity_title: row.name })),
      ...(sessions.data || []).map((row: any) => ({ ...row, entity_type: 'event_sessions', entity_title: row.title })),
      ...(speakers.data || []).map((row: any) => ({ ...row, entity_type: 'event_speakers', entity_title: row.name || row.full_name })),
      ...(exhibitors.data || []).map((row: any) => ({ ...row, entity_type: 'event_exhibitors', entity_title: row.company_name })),
      ...(forms.data || []).map((row: any) => ({ ...row, entity_type: 'event_forms', entity_title: row.title })),
      ...(templates.data || []).map((row: any) => ({ ...row, entity_type: 'event_email_templates', entity_title: row.name || row.subject })),
      ...(links.data || []).map((row: any) => ({ ...row, entity_type: 'event_tracking_links', entity_title: row.name || row.slug })),
      ...(promos.data || []).map((row: any) => ({ ...row, entity_type: 'event_promos', entity_title: row.code })),
      ...(comms.data || []).map((row: any) => ({ ...row, entity_type: 'event_communications', entity_title: row.meta?.name || row.subject }))
    ];

    return rows
      .filter((row) => row.id && (row.updated_at || row.created_at))
      .map((row) => ({
        id: row.id,
        action: 'update',
        entity_type: row.entity_type,
        entity_id: row.id,
        entity_title: row.entity_title,
        created_at: row.updated_at || row.created_at
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  };
  useEffect(() => {
    if (!eventId) return;
    let mounted = true;
    (async () => {
      try {
        const eventReq = supabase
          .from('events')
          .select('id, event_type, cover_image_url, badge_settings, marketing_settings, start_date, end_date, location_address, status, is_public')
          .eq('id', eventId)
          .single();

        const ticketsCountReq = supabase.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const sessionsCountReq = supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const speakersCountReq = supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const exhibitorsCountReq = supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const formsCountReq = supabase.from('event_forms').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingTemplatesReq = supabase.from('event_email_templates').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingLinksReq = supabase.from('event_tracking_links').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingPromosReq = supabase.from('event_promos').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
        const marketingCommsReq = supabase.from('event_communications').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('kind', 'email');
        const ticketsSummaryReq = supabase
          .from('event_tickets')
          .select('price, currency, quantity_sold, quantity_total')
          .eq('event_id', eventId);
        const registrationsReq = supabase
          .from('event_registrations')
          .select('id, created_at')
          .eq('event_id', eventId);
        const attendeesReq = supabase
          .from('event_attendees')
          .select('id, created_at')
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
          marketingPromosRes,
          marketingCommsRes,
          ticketsSummaryRes,
          registrationsRes,
          attendeesRes,
          activityRes
        ] = await Promise.all([
          eventReq,
          ticketsCountReq,
          sessionsCountReq,
          speakersCountReq,
          exhibitorsCountReq,
          formsCountReq,
          marketingTemplatesReq,
          marketingLinksReq,
          marketingPromosReq,
          marketingCommsReq,
          ticketsSummaryReq,
          registrationsReq,
          attendeesReq,
          activityReq
        ]);

        if (!mounted) return;

        if (!eventRes.error) setEventMeta(eventRes.data);

        const ticketsCount = ticketsCountRes.count ?? 0;
        const sessionsCount = sessionsCountRes.count ?? 0;
        const speakersCount = speakersCountRes.count ?? 0;
        const exhibitorsCount = exhibitorsCountRes.count ?? 0;
        const formsCount = formsCountRes.count ?? 0;
        const marketingCount = (marketingTemplatesRes.count ?? 0)
          + (marketingLinksRes.count ?? 0)
          + (marketingPromosRes.count ?? 0)
          + (marketingCommsRes.count ?? 0);

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

        const registrationData = (registrationsRes.data && registrationsRes.data.length)
          ? registrationsRes.data
          : (attendeesRes.data || []);
        setRegistrationRows(registrationData);

        if (!activityRes.error && Array.isArray(activityRes.data) && activityRes.data.length > 0) {
          setActivity(activityRes.data);
        } else {
          const fallback = await buildFallbackActivity(eventId);
          if (!mounted) return;
          setActivity(fallback);
        }
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
    const hasRegistrationSchema = counts.forms > 0;
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
        case 'event_communications':
        case 'event_marketing_links':
        case 'event_tracking_links': return 'marketing';
        case 'event_promos': return 'marketing';
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
      if (entityType === 'event_communications') return Mail;
      if (entityType === 'event_promos') return Tag;
      if (entityType === 'event_marketing_links' || entityType === 'event_tracking_links') return ExternalLink;
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
      if (entityType === 'event_communications') return t('manageEvent.overview.activity.items.emailCampaign');
      if (entityType === 'event_promos') return t('manageEvent.overview.activity.items.promoCode');
      if (entityType === 'event_marketing_links' || entityType === 'event_tracking_links') return t('manageEvent.overview.activity.items.marketingLink');
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

  const registrationSeries = useMemo(() => {
    const dates = registrationRows
      .map((r) => (r.created_at ? new Date(r.created_at) : null))
      .filter((d) => d instanceof Date && !Number.isNaN(d?.getTime?.())) as Date[];

    const now = new Date();
    const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date(now.getTime() - 6 * 86400000);
    const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : now;
    const start = eventMeta?.start_date ? new Date(eventMeta.start_date) : minDate;
    const end = eventMeta?.end_date ? new Date(eventMeta.end_date) : maxDate;

    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const dayMs = 86400000;
    const totalDays = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / dayMs) + 1);
    const stepDays = totalDays <= 6 ? 1 : Math.ceil(totalDays / 6);

    const buckets: { label: string; count: number }[] = [];
    for (let i = 0; i < totalDays; i += stepDays) {
      const bucketStart = new Date(startDay.getTime() + i * dayMs);
      const bucketEnd = new Date(Math.min(endDay.getTime() + dayMs, bucketStart.getTime() + stepDays * dayMs));
      const count = dates.filter((d) => d >= bucketStart && d < bucketEnd).length;
      buckets.push({
        label: bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    return buckets.length ? buckets : [{ label: startDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: 0 }];
  }, [registrationRows, eventMeta?.start_date, eventMeta?.end_date]);

  const registrationChart = useMemo(() => {
    const width = 600;
    const height = 200;
    const pad = 16;
    const max = Math.max(1, ...registrationSeries.map((d) => d.count));
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const stepX = registrationSeries.length > 1 ? innerW / (registrationSeries.length - 1) : 0;
    const points = registrationSeries
      .map((d, i) => {
        const x = pad + stepX * i;
        const y = pad + innerH - (d.count / max) * innerH;
        return `${x},${y}`;
      })
      .join(' ');
    const baseY = pad + innerH;
    const area = points ? `${pad},${baseY} ${points} ${pad + stepX * (registrationSeries.length - 1)},${baseY}` : '';
    return { width, height, points, area };
  }, [registrationSeries]);


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
            <div className="flex items-center gap-4">
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                {t('manageEvent.overview.header.title')}
              </h2>
              {eventMeta?.event_type && (
                <span 
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    backgroundColor: '#0684F5', 
                    color: '#FFFFFF', 
                    fontSize: '14px', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 4px rgba(6, 132, 245, 0.3)'
                  }}
                >
                  {eventMeta.event_type}
                </span>
              )}
            </div>
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
              {registrationRows.length > 0 ? (
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${registrationChart.width} ${registrationChart.height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="overviewTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0684F5" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0684F5" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={registrationChart.width}
                    height={registrationChart.height}
                    fill="transparent"
                  />
                  {registrationChart.area && (
                    <polygon
                      points={registrationChart.area}
                      fill="url(#overviewTrendFill)"
                    />
                  )}
                  {registrationChart.points && (
                    <polyline
                      points={registrationChart.points}
                      fill="none"
                      stroke="#0684F5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              ) : (
                <div className="text-center">
                  <BarChart3 size={48} style={{ color: '#64748B', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('manageEvent.overview.charts.registrationTrends.visualization')}
                  </p>
                </div>
              )}
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
