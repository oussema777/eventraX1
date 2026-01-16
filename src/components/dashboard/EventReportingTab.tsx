import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users,
  CheckCircle,
  Calendar,
  Handshake,
  Download,
  Share,
  TrendingUp,
  Star,
  Smartphone,
  Eye,
  X,
  Copy,
  ChevronDown,
  ChevronRight,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

export default function EventReportingTab({ eventId }: { eventId: string }) {
  const [dateRange, setDateRange] = useState('event-duration');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportType, setExportType] = useState<'attendees' | 'checkins' | 'sessions' | 'b2b' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  
  
  const { t } = useI18n();
  const exportTypeLabel = exportType ? t(`manageEvent.reporting.quickExport.${exportTypeLabel}`) : '';
// Data states
  const [eventDates, setEventDates] = useState<{ start?: string | null; end?: string | null }>({ start: null, end: null });
  const [ticketsRows, setTicketsRows] = useState<any[]>([]);
  const [attendeesRows, setAttendeesRows] = useState<any[]>([]);
  const [sessionsRows, setSessionsRows] = useState<any[]>([]);
  const [meetingsRows, setMeetingsRows] = useState<any[]>([]);
  const [checkinsRows, setCheckinsRows] = useState<any[]>([]);
  const [feedbackRows, setFeedbackRows] = useState<any[]>([]);
  const [showBottomSessions, setShowBottomSessions] = useState(false);

  const palette = ['#F59E0B', '#0684F5', '#10B981', '#8B5CF6', '#EF4444'];

  const range = useMemo(() => {
    const now = new Date();
    const startDate = eventDates.start ? new Date(eventDates.start) : null;
    const endDate = eventDates.end ? new Date(eventDates.end) : null;

    if (dateRange === 'last-7') {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { from, to: now };
    }
    if (dateRange === 'last-30') {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { from, to: now };
    }
    if (startDate && endDate) return { from: startDate, to: endDate };
    if (startDate && !endDate) return { from: startDate, to: now };
    return { from: null as any, to: null as any };
  }, [dateRange, eventDates.start, eventDates.end]);

  const safeSelect = async (table: string, select: string, extra: (q: any) => any) => {
    try {
      let q = supabase.from(table).select(select);
      q = extra(q);
      const { data, error } = await q;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!eventId) return;

    let alive = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data: ev, error: evErr } = await supabase
          .from('events')
          .select('id,start_date,end_date')
          .eq('id', eventId)
          .maybeSingle();

        if (alive) {
          if (!evErr && ev) setEventDates({ start: ev.start_date, end: ev.end_date });
          else setEventDates({ start: null, end: null });
        }

        const fromIso = range.from ? new Date(range.from).toISOString() : null;
        const toIso = range.to ? new Date(range.to).toISOString() : null;

        const withRange = (q: any) => {
          q = q.eq('event_id', eventId);
          if (fromIso) q = q.gte('created_at', fromIso);
          if (toIso) q = q.lte('created_at', toIso);
          return q;
        };

        const [tickets, attendees, sessions, meetings, checkins, feedback] = await Promise.all([
          safeSelect('event_tickets', 'id,name,price,quantity_sold,created_at', withRange),
          safeSelect('event_attendees', '*', withRange),
          safeSelect('event_sessions', '*', withRange),
          safeSelect('event_b2b_meetings', '*', withRange),
          safeSelect('event_checkins', 'id,created_at,checkin_type,attendee_id,session_id,meeting_id', withRange),
          safeSelect('event_feedback_responses', '*', withRange),
        ]);

        if (!alive) return;
        setTicketsRows(tickets);
        setAttendeesRows(attendees);
        setSessionsRows(sessions);
        setMeetingsRows(meetings);
        setCheckinsRows(checkins);
        setFeedbackRows(feedback);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [eventId, dateRange, range.from, range.to]);

  const stats = useMemo(() => {
    const registered = attendeesRows.length;
    const checkedIn = attendeesRows.filter((a) => a.checked_in || a.check_in_at).length;
    const attendanceRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

    const revenue = ticketsRows.reduce((sum, t) => {
      const sold = Number(t.quantity_sold || 0);
      const price = Number(t.price || 0);
      return sum + sold * price;
    }, 0);

    const paidTickets = ticketsRows.reduce((sum, t) => {
      const sold = Number(t.quantity_sold || 0);
      const price = Number(t.price || 0);
      return sum + (price > 0 ? sold : 0);
    }, 0);

    const sessionCheckins = checkinsRows.filter((c) => c.checkin_type === 'session' && c.session_id).length;
    const b2bCheckins = checkinsRows.filter((c) => c.checkin_type === 'b2b' && c.meeting_id).length;

    const engagementScore = registered > 0 ? Math.min(10, Math.round(((sessionCheckins + b2bCheckins) / registered) * 10 * 10) / 10) : 0;

    const surveyResponses = feedbackRows.length;
    const npsBase = feedbackRows
      .map((r) => Number(r.nps_score))
      .filter((v) => Number.isFinite(v));
    const promoters = npsBase.filter((v) => v >= 9).length;
    const detractors = npsBase.filter((v) => v <= 6).length;
    const nps = npsBase.length > 0 ? Math.round(((promoters - detractors) / npsBase.length) * 100) : 0;

    return {
      attendanceRate,
      checkedIn,
      registered,
      revenue,
      paidTickets,
      engagementScore,
      nps,
      surveyResponses,
    };
  }, [attendeesRows, ticketsRows, checkinsRows, feedbackRows]);

  const ticketSales = useMemo(() => {
    const rows = ticketsRows
      .map((t, i) => {
        const sold = Number(t.quantity_sold || 0);
        const price = Number(t.price || 0);
        return {
          type: t.name || 'Ticket',
          sold,
          revenue: sold * price,
          percentage: 0,
          color: palette[i % palette.length],
        };
      })
      .filter((r) => r.sold > 0 || r.revenue > 0);

    const totalSold = rows.reduce((s, r) => s + r.sold, 0);
    const totalRev = rows.reduce((s, r) => s + r.revenue, 0);

    return rows.map((r) => ({
      ...r,
      percentage: totalSold > 0 ? Math.round((r.sold / totalSold) * 100) : totalRev > 0 ? Math.round((r.revenue / totalRev) * 100) : 0,
    }));
  }, [ticketsRows]);

  const engagementStars = useMemo(() => {
    return Math.max(1, Math.min(5, Math.round(stats.engagementScore / 2)));
  }, [stats.engagementScore]);

  const sessionAttendanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of checkinsRows) {
      if (c.checkin_type !== 'session' || !c.session_id) continue;
      const k = String(c.session_id);
      m.set(k, (m.get(k) || 0) + 1);
    }
    return m;
  }, [checkinsRows]);

  const attendanceSeries = useMemo(() => {
    const dates = attendeesRows
      .map((a) => (a.created_at ? new Date(a.created_at) : null))
      .filter((d) => d instanceof Date && !Number.isNaN(d?.getTime?.())) as Date[];

    const now = new Date();
    const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date(now.getTime() - 5 * 86400000);
    const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : now;
    const start = range.from ? new Date(range.from) : minDate;
    const end = range.to ? new Date(range.to) : maxDate;

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
  }, [attendeesRows, range.from, range.to]);

  const attendanceChart = useMemo(() => {
    const max = Math.max(1, ...attendanceSeries.map((d) => d.count));
    const width = 600;
    const height = 200;
    const stepX = attendanceSeries.length > 1 ? width / (attendanceSeries.length - 1) : 0;
    const points = attendanceSeries
      .map((d, i) => {
        const x = stepX * i;
        const y = height - (d.count / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
    const step = Math.max(1, Math.ceil(max / 5));
    const axis = [step * 5, step * 4, step * 3, step * 2, step, 0];
    return { points, labels: attendanceSeries.map((d) => d.label), axis, width, height };
  }, [attendanceSeries]);

  const sessionsRanked = useMemo(() => {
    return sessionsRows
      .map((s: any) => {
        const cap = Number(s.capacity || 0);
        const att = sessionAttendanceMap.get(String(s.id)) || 0;
        const pct = cap > 0 ? Math.round((att / cap) * 100) : 0;
        const rating = Number(s.avg_rating ?? s.rating ?? s.score ?? 0);
        return {
          id: s.id,
          name: s.title || 'Session',
          attendance: `${att} / ${cap || '-'}`,
          capacity: cap > 0 ? pct : 0,
          rating: Number.isFinite(rating) ? Math.round(rating * 10) / 10 : 0,
          insight: pct > 80 ? t('manageEvent.reporting.sessions.insights.high') : pct < 20 ? t('manageEvent.reporting.sessions.insights.low') : t('manageEvent.reporting.sessions.insights.normal'),
        };
      })
      .sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
  }, [sessionsRows, sessionAttendanceMap]);

  const topSessions = useMemo(() => sessionsRanked.slice(0, 3), [sessionsRanked]);
  const bottomSessions = useMemo(() => sessionsRanked.slice(3, 6), [sessionsRanked]);

  const attendeeById = useMemo(() => {
    const map = new Map<string, any>();
    attendeesRows.forEach((a) => {
      if (a?.id != null) map.set(String(a.id), a);
    });
    return map;
  }, [attendeesRows]);

  const topNetworkers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of meetingsRows) {
      const a = m.from_attendee_id ? String(m.from_attendee_id) : m.attendee_a_id ? String(m.attendee_a_id) : null;
      const b = m.to_attendee_id ? String(m.to_attendee_id) : m.attendee_b_id ? String(m.attendee_b_id) : null;
      if (a) counts.set(a, (counts.get(a) || 0) + 1);
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    return top.map(([id, meetings], idx) => ({
      name: attendeeById.get(id)?.name
        || attendeeById.get(id)?.full_name
        || [attendeeById.get(id)?.first_name, attendeeById.get(id)?.last_name].filter(Boolean).join(' ')
        || `Attendee ${idx + 1}`,
      role: attendeeById.get(id)?.company || t('manageEvent.reporting.b2b.active.defaultRole'),
      meetings,
      rating: 0,
      photo: attendeeById.get(id)?.photo_url
        || attendeeById.get(id)?.avatar_url
        || `https://api.dicebear.com/7.x/initials/svg?seed=${id}`,
      rank: idx + 1
    }));
  }, [meetingsRows, attendeeById, t]);

  const attendanceStats = useMemo(() => {
    const totalDays = Math.max(1, attendanceSeries.length);
    const peak = attendanceSeries.reduce((max, row) => (row.count > max.count ? row : max), attendanceSeries[0]);
    const avg = stats.registered ? Math.round((stats.registered / totalDays) * 10) / 10 : 0;
    return {
      peakLabel: peak?.label || t('manageEvent.reporting.analytics.noData'),
      peakCount: peak?.count || 0,
      avgPerDay: avg,
      conversionRate: stats.attendanceRate
    };
  }, [attendanceSeries, stats.registered, stats.attendanceRate, t]);

  const engagementMetrics = useMemo(() => {
    const registered = stats.registered || 0;
    const sessionCheckins = checkinsRows.filter((c) => c.checkin_type === 'session').length;
    const avgSessions = registered ? Math.round((sessionCheckins / registered) * 10) / 10 : 0;

    const totalMeetings = meetingsRows.length;
    const networkingScore = registered ? Math.min(10, Math.round((totalMeetings / registered) * 10 * 10) / 10) : 0;

    const activeAttendees = new Set(checkinsRows.map((c) => c.attendee_id).filter(Boolean)).size;
    const appUsage = registered ? Math.round((activeAttendees / registered) * 100) : 0;

    const totalDownloads = sessionsRows.reduce((sum, s) => {
      const val = Number(s.materials_downloads ?? s.downloads ?? s.download_count ?? s.resource_downloads ?? 0);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    const topContent = [...sessionsRows]
      .map((s) => ({
        title: s.title || 'Session',
        downloads: Number(s.materials_downloads ?? s.downloads ?? s.download_count ?? s.resource_downloads ?? 0)
      }))
      .sort((a, b) => b.downloads - a.downloads)[0];

    return [
      {
        icon: Users,
        color: '#0684F5',
        label: t('manageEvent.reporting.engagement.sessionAvg'),
        value: avgSessions ? String(avgSessions) : '0',
        sub: t('manageEvent.reporting.engagement.sessionAvgSub'),
        comparison: registered ? `Registered: ${registered}` : t('manageEvent.reporting.analytics.noData'),
        compColor: '#10B981'
      },
      {
        icon: Handshake,
        color: '#10B981',
        label: t('manageEvent.reporting.engagement.networking'),
        value: `${networkingScore}/10`,
        sub: t('manageEvent.reporting.engagement.networkingSub'),
        badge: totalMeetings > 0 ? 'Engaged' : undefined
      },
      {
        icon: Smartphone,
        color: '#8B5CF6',
        label: t('manageEvent.reporting.engagement.app'),
        value: `${appUsage}%`,
        sub: t('manageEvent.reporting.engagement.appSub'),
        detail: `${activeAttendees} active users`
      },
      {
        icon: Download,
        color: '#F59E0B',
        label: t('manageEvent.reporting.engagement.downloads'),
        value: totalDownloads ? totalDownloads.toLocaleString() : '0',
        sub: t('manageEvent.reporting.engagement.downloadsSub'),
        detail: topContent?.downloads ? `Top: ${topContent.title}` : 'No downloads yet'
      }
    ];
  }, [stats.registered, checkinsRows, meetingsRows, sessionsRows, t]);

  const meetingStats = useMemo(() => {
    const scheduled = meetingsRows.filter((m) => ['scheduled', 'pending', 'confirmed'].includes(String(m.status || '').toLowerCase())).length;
    const completed = meetingsRows.filter((m) => String(m.status || '').toLowerCase() === 'completed').length;
    const cancelled = meetingsRows.filter((m) => String(m.status || '').toLowerCase() === 'cancelled').length;
    const durations = meetingsRows
      .map((m) => {
        const startValue = m.starts_at || m.start_at;
        const endValue = m.ends_at || m.end_at;
        const start = startValue ? new Date(startValue) : null;
        const end = endValue ? new Date(endValue) : null;
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
      })
      .filter((v) => typeof v === 'number') as number[];
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { scheduled, completed, cancelled, avgDuration, total: meetingsRows.length };
  }, [meetingsRows]);

  const meetingTypes = useMemo(() => {
    const buckets = new Map<string, number>();
    const mapType = (m: any) => {
      const raw = String(m.meeting_type || m.type || m.category || m.purpose || m.topic || '').toLowerCase();
      if (raw.includes('partner')) return t('manageEvent.reporting.b2b.types.partnership');
      if (raw.includes('sale') || raw.includes('demo')) return t('manageEvent.reporting.b2b.types.salesDemo');
      if (raw.includes('invest')) return t('manageEvent.reporting.b2b.types.investment');
      if (raw.includes('network')) return t('manageEvent.reporting.b2b.types.networking');
      return t('manageEvent.reporting.b2b.types.other');
    };
    meetingsRows.forEach((m) => {
      const type = mapType(m);
      buckets.set(type, (buckets.get(type) || 0) + 1);
    });
    const total = Math.max(1, meetingsRows.length);
    const colors = ['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#94A3B8'];
    return [...buckets.entries()].map(([type, count], idx) => ({
      type,
      percentage: Math.round((count / total) * 100),
      color: colors[idx % colors.length]
    }));
  }, [meetingsRows, t]);

  const meetingTypeSegments = useMemo(() => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const base = meetingTypes.length
      ? meetingTypes
      : [{ type: t('manageEvent.reporting.b2b.types.other'), percentage: 100, color: '#94A3B8' }];
    let offset = 0;
    return base.map((item) => {
      const length = (item.percentage / 100) * circumference;
      const dasharray = `${length} ${Math.max(0, circumference - length)}`;
      const dashoffset = -offset;
      offset += length;
      return { ...item, dasharray, dashoffset };
    });
  }, [meetingTypes, t]);

  const feedbackSummary = useMemo(() => {
    const vals = feedbackRows.map((r) => Number(r.overall_rating)).filter((v) => Number.isFinite(v));
    const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
    const responseRate = stats.registered ? Math.round((stats.surveyResponses / stats.registered) * 100) : 0;
    const comments = feedbackRows
      .map((r) => {
        const text = r.comment || r.comments || r.feedback_text || r.feedback || r.notes;
        if (!text || typeof text !== 'string' || !text.trim()) return null;
        return {
          quote: String(text).trim(),
          author: r.name || r.attendee_name || 'Attendee'
        };
      })
      .filter(Boolean)
      .slice(0, 2) as { quote: string; author: string }[];
    return { avg, responseRate, comments };
  }, [feedbackRows, stats.registered, stats.surveyResponses]);

  const feedbackCategories = useMemo(() => {
    const pickAvg = (key: string) => {
      const vals = feedbackRows.map((r) => Number(r[key])).filter((v) => Number.isFinite(v));
      if (!vals.length) return { score: 0, pct: 0 };
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { score: Math.round(avg * 10) / 10, pct: Math.round((avg / 5) * 100) };
    };

    const venue = pickAvg('venue_rating');
    const content = pickAvg('content_rating');
    const networking = pickAvg('networking_rating');
    const org = pickAvg('organization_rating');
    const value = pickAvg('value_rating');

    return [
      { category: t('manageEvent.reporting.feedback.categories.venue'), score: venue.score, percentage: venue.pct, color: venue.pct >= 90 ? '#10B981' : '#0684F5' },
      { category: t('manageEvent.reporting.feedback.categories.content'), score: content.score, percentage: content.pct, color: content.pct >= 90 ? '#10B981' : '#0684F5' },
      { category: t('manageEvent.reporting.feedback.categories.networking'), score: networking.score, percentage: networking.pct, color: networking.pct >= 90 ? '#10B981' : '#0684F5' },
      { category: t('manageEvent.reporting.feedback.categories.organization'), score: org.score, percentage: org.pct, color: org.pct >= 90 ? '#10B981' : '#0684F5' },
      { category: t('manageEvent.reporting.feedback.categories.value'), score: value.score, percentage: value.pct, color: value.pct >= 90 ? '#10B981' : '#0684F5' },
    ];
  }, [feedbackRows]);

  const ratingDistribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as any;
    for (const r of feedbackRows) {
      const v = Number(r.overall_rating);
      if (v >= 1 && v <= 5) counts[v] += 1;
    }
    const total = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number;
    const colors = { 5: '#10B981', 4: '#0684F5', 3: '#F59E0B', 2: '#EF4444', 1: '#EF4444' } as any;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars];
      return { stars, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0, color: colors[stars] };
    });
}, [feedbackRows]);

const handleExport = (type: 'attendees' | 'checkins' | 'sessions' | 'b2b') => {
    setExportType(type);
    setShowExportModal(true);
  };

    const downloadCSV = (filename: string, rows: Record<string, any>[]) => {
    const header = rows.length ? Object.keys(rows[0]) : [];
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      const needs = /[\",\n]/.test(s);
      const out = s.replace(/"/g, '""');
      return needs ? `"${out}"` : out;
    };
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((k) => escape(r[k])).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportConfirm = async () => {
    setShowExportModal(false);
    if (!exportType) return;

    try {
      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      switch (exportType) {
        case 'attendees': {
          const { data, error } = await supabase
            .from('event_attendees')
            .select('*')
            .eq('event_id', eventId);
          if (error) throw error;
          const rows = (data || []).map((a: any) => ({
            id: a.id,
            status: a.status,
            checked_in: a.checked_in,
            check_in_at: a.check_in_at,
            created_at: a.created_at,
          }));
          downloadCSV(`event-${eventId}-attendees-${stamp}.csv`, rows);
          toast.success(t('manageEvent.reporting.toasts.attendeesExported'));
          return;
        }
        case 'checkins': {
          const { data, error } = await supabase
            .from('event_checkins')
            .select('*')
            .eq('event_id', eventId);
          if (error) throw error;
          const rows = (data || []).map((c: any) => ({
            id: c.id,
            checkin_type: c.checkin_type,
            attendee_id: c.attendee_id,
            session_id: c.session_id,
            meeting_id: c.meeting_id,
            created_at: c.created_at,
          }));
          downloadCSV(`event-${eventId}-checkins-${stamp}.csv`, rows);
          toast.success(t('manageEvent.reporting.toasts.checkinsExported'));
          return;
        }
        case 'sessions': {
          const rows = (sessionsRows || []).map((s: any) => {
            const cap = Number(s.capacity || 0);
            const att = sessionAttendanceMap.get(String(s.id)) || 0;
            const pct = cap > 0 ? Math.round((att / cap) * 100) : 0;
            return {
              id: s.id,
              title: s.title,
              start_time: s.start_time,
              capacity: cap,
              attendance: att,
              occupancy_pct: pct,
            };
          });
          downloadCSV(`event-${eventId}-sessions-${stamp}.csv`, rows);
          toast.success(t('manageEvent.reporting.toasts.sessionsExported'));
          return;
        }
        case 'b2b': {
          const { data, error } = await supabase
            .from('event_b2b_meetings')
            .select('*')
            .eq('event_id', eventId);
          if (error) throw error;
          const rows = (data || []).map((m: any) => ({
            id: m.id,
            status: m.status,
            from_attendee_id: m.from_attendee_id,
            to_attendee_id: m.to_attendee_id,
            starts_at: m.starts_at,
            ends_at: m.ends_at,
            created_at: m.created_at,
          }));
          downloadCSV(`event-${eventId}-b2b-${stamp}.csv`, rows);
          toast.success(t('manageEvent.reporting.toasts.b2bExported'));
          return;
        }
        default:
          toast.error(t('manageEvent.reporting.toasts.unsupported'));
      }
    } catch (e: any) {
      console.error('Export failed:', e);
      toast.error(t('manageEvent.reporting.toasts.failed'));
    }
  };


  return (
    <div className="event-reporting" style={{ padding: '0', backgroundColor: 'transparent' }}>
      <style>{`
        @media (max-width: 600px) {
          .event-reporting__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-reporting__header-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-reporting__header-actions > * {
            width: 100%;
            justify-content: center;
          }

          .event-reporting__sessions-header {
            display: none !important;
          }

          .event-reporting__sessions-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-reporting__quick-grid,
          .event-reporting__kpi-grid,
          .event-reporting__analytics-grid,
          .event-reporting__tickets-grid,
          .event-reporting__b2b-grid,
          .event-reporting__feedback-grid,
          .event-reporting__builder-grid,
          .event-reporting__engagement-grid {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }

          .event-reporting__chart {
            height: 220px !important;
            padding: 16px !important;
          }

          .event-reporting__chart svg {
            width: 100% !important;
            height: 180px !important;
          }

          .event-reporting__chart-labels {
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-reporting__tickets-chart {
            width: 100% !important;
            max-width: 240px;
            height: 240px !important;
            margin: 0 auto;
          }

          .event-reporting__feedback-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .event-reporting [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 400px) {
          .event-reporting__sessions-row {
            padding: 14px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div className="event-reporting__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>{t('manageEvent.reporting.header.title')}</h1>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>{t('manageEvent.reporting.header.subtitle')}</p>
          </div>

          <div className="event-reporting__header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Date Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#FFFFFF' }} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px'
                }}
              >
                <option value="event-duration">{t('manageEvent.reporting.filters.eventDuration')}</option>
                <option value="last-7">{t('manageEvent.reporting.filters.last7')}</option>
                <option value="last-30">{t('manageEvent.reporting.filters.last30')}</option>
                <option value="custom">{t('manageEvent.reporting.filters.custom')}</option>
              </select>
            </div>

            <button
              onClick={() => toast.success(t('manageEvent.reporting.toasts.exported'))}
              style={{
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#10B981',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={18} />{t('manageEvent.reporting.header.exportAll')}</button>

            <button
              onClick={() => setShowShareModal(true)}
              style={{
                height: '44px',
                padding: '0 20px',
                backgroundColor: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Share size={18} />{t('manageEvent.reporting.header.share')}</button>
          </div>
        </div>

        {/* QUICK EXPORT CARDS */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>{t('manageEvent.reporting.quickExport.title')}</h2>

          <div className="event-reporting__quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              {
                type: 'attendees',
                icon: Users,
                color: '#0684F5',
                title: t('manageEvent.reporting.quickExport.attendees'),
                desc: t('manageEvent.reporting.quickExport.descriptions.attendees'),
                count: t('manageEvent.reporting.quickExport.counts.attendees', { count: stats.registered }),
                countColor: '#10B981'
              },
              {
                type: 'checkins',
                icon: CheckCircle,
                color: '#10B981',
                title: t('manageEvent.reporting.quickExport.checkins'),
                desc: t('manageEvent.reporting.quickExport.descriptions.checkins'),
                count: t('manageEvent.reporting.quickExport.counts.checkins', { count: stats.checkedIn, percent: stats.attendanceRate }),
                countColor: '#10B981'
              },
              {
                type: 'sessions',
                icon: Calendar,
                color: '#8B5CF6',
                title: t('manageEvent.reporting.quickExport.sessions'),
                desc: t('manageEvent.reporting.quickExport.descriptions.sessions'),
                count: t('manageEvent.reporting.quickExport.counts.sessions', { count: sessionsRows.length }),
                countColor: '#8B5CF6'
              },
              {
                type: 'b2b',
                icon: Handshake,
                color: '#F59E0B',
                title: t('manageEvent.reporting.quickExport.b2b'),
                desc: t('manageEvent.reporting.quickExport.descriptions.b2b'),
                count: t('manageEvent.reporting.quickExport.counts.meetings', { count: meetingsRows.length }),
                countColor: '#F59E0B'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleExport(card.type)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = card.color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${card.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <Icon size={32} style={{ color: card.color }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
                    {card.desc}
                  </p>
                  <p style={{ fontSize: '14px', color: card.countColor, marginBottom: '12px' }}>
                    {card.count}
                  </p>
                  <button
                    style={{
                      width: '100%',
                      height: '36px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={16} />{t('manageEvent.reporting.modals.export.actions.confirm')}</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* KEY METRICS OVERVIEW */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>{t('manageEvent.reporting.performance.title')}</h2>

          <div className="event-reporting__kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {/* Metric 1: Overall Attendance Rate */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.reporting.performance.attendance.label')}</p>
              <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {stats.attendanceRate}%
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                {t('manageEvent.reporting.performance.attendance.desc', { checkedIn: stats.checkedIn, total: stats.registered })}
              </p>
              <p style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                <TrendingUp size={14} />{t('manageEvent.reporting.performance.attendance.target', { percent: 5 })}</p>

              {/* Circular Progress */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.attendanceRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Metric 2: Revenue Generated */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.reporting.performance.revenue.label')}</p>
              <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                ${stats.revenue.toLocaleString()}
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                {t('manageEvent.reporting.performance.revenue.desc', { count: stats.paidTickets })}
              </p>
              <p style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                <TrendingUp size={14} />{t('manageEvent.reporting.performance.revenue.forecast', { percent: 12 })}</p>

              {/* Mini Bar Chart */}
              <div style={{ marginTop: '16px' }}>
                {ticketSales.map((ticket, idx) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{ticket.type}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{ticket.percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${ticket.percentage}%`, height: '100%', backgroundColor: ticket.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric 3: Engagement Score */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.reporting.performance.engagement.label')}</p>
              <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {stats.engagementScore}/10
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                {t('manageEvent.reporting.performance.engagement.desc')}
              </p>
              <p style={{ fontSize: '13px', color: '#10B981', marginBottom: '16px' }}>
                {t('manageEvent.reporting.performance.engagement.status')}
              </p>

              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= engagementStars ? '#F59E0B' : 'none'}
                    stroke={star <= engagementStars ? '#F59E0B' : '#94A3B8'}
                  />
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                {t('manageEvent.reporting.performance.engagement.basis')}
              </p>
            </div>

            {/* Metric 4: NPS */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>{t('manageEvent.reporting.performance.nps.label')}</p>
              <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                +{stats.nps}
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                {t('manageEvent.reporting.performance.nps.desc', { count: stats.surveyResponses })}
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#10B981'
                }}
              >
                {t('manageEvent.reporting.performance.nps.status')}
              </div>

              {/* NPS Gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <svg width="120" height="70">
                  <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#EF4444" strokeWidth="8" />
                  <path d="M 10 60 A 50 50 0 0 1 60 10" fill="none" stroke="#F59E0B" strokeWidth="8" />
                  <path d="M 60 10 A 50 50 0 0 1 110 60" fill="none" stroke="#10B981" strokeWidth="8" />
                  <circle cx="60" cy="60" r="4" fill="#FFFFFF" />
                  <line x1="60" y1="60" x2="95" y2="30" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE ANALYTICS */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{t('manageEvent.reporting.analytics.title')}</h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>{t('manageEvent.reporting.analytics.subtitle')}</p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          {/* Line Chart Placeholder */}
          <div
            className="event-reporting__chart"
            style={{
              height: '300px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
              position: 'relative'
            }}
          >
            {/* Chart Grid */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
              {attendanceChart.axis.map((value, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', width: '30px' }}>{value}</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                </div>
              ))}
            </div>

            {/* Chart Line */}
            <svg
              className="event-reporting__chart-line"
              style={{ position: 'absolute', top: '20px', left: '50px', right: '20px', bottom: '40px' }}
              width="calc(100% - 70px)"
              height="240"
              viewBox={`0 0 ${attendanceChart.width} ${attendanceChart.height}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={attendanceChart.points}
                fill="none"
                stroke="#0684F5"
                strokeWidth="3"
              />
              <polyline
                points={attendanceChart.points}
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0684F5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0684F5" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-axis labels */}
            <div className="event-reporting__chart-labels" style={{ position: 'absolute', bottom: '10px', left: '50px', right: '20px', display: 'flex', justifyContent: 'space-between' }}>
              {attendanceChart.labels.map((date, idx) => (
                <span key={idx} style={{ fontSize: '11px', color: '#94A3B8' }}>{date}</span>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="event-reporting__analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[ 
              { label: t('manageEvent.reporting.analytics.peak'), value: attendanceStats.peakLabel, sub: t('manageEvent.reporting.analytics.registrations', { count: attendanceStats.peakCount }), subColor: '#10B981' },
              { label: t('manageEvent.reporting.analytics.avg'), value: attendanceStats.avgPerDay.toString(), sub: `${stats.registered} total`, subColor: '#10B981' },
              { label: t('manageEvent.reporting.analytics.conversion'), value: `${attendanceStats.conversionRate}%`, sub: t('manageEvent.reporting.analytics.conversionDesc'), subColor: '#94A3B8' }
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '16px',
                  borderRadius: '8px'
                }}
              >
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: stat.subColor }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TICKET SALES BREAKDOWN */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>{t('manageEvent.reporting.tickets.title')}</h3>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div className="event-reporting__tickets-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Left: Donut Chart */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="event-reporting__tickets-chart" style={{ position: 'relative', width: '280px', height: '280px' }}>
                <svg width="280" height="280">
                  <circle cx="140" cy="140" r="100" fill="none" stroke="#F59E0B" strokeWidth="40" strokeDasharray="282.6" strokeDashoffset="0" />
                  <circle cx="140" cy="140" r="100" fill="none" stroke="#0684F5" strokeWidth="40" strokeDasharray="282.6" strokeDashoffset="-127" />
                  <circle cx="140" cy="140" r="100" fill="none" stroke="#10B981" strokeWidth="40" strokeDasharray="282.6" strokeDashoffset="-240" />
                  <circle cx="140" cy="140" r="100" fill="none" stroke="#8B5CF6" strokeWidth="40" strokeDasharray="282.6" strokeDashoffset="-268" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>
                    ${stats.revenue.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.reporting.performance.revenue.label')}</p>
                </div>
              </div>
            </div>

            {/* Right: Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ticketSales.map((ticket, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: `${ticket.color}10`,
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${ticket.color}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {ticket.type}
                      </p>
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {ticket.sold} sold
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: ticket.color }}>
                        ${ticket.revenue.toLocaleString()}
                      </p>
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {ticket.percentage}%
                      </p>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ticket.percentage}%`, height: '100%', backgroundColor: ticket.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SESSION PERFORMANCE */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{t('manageEvent.reporting.sessions.title')}</h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>{t('manageEvent.reporting.sessions.subtitle')}</p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>{t('manageEvent.reporting.sessions.top')}</p>

          {/* Table Header */}
          <div
            className="event-reporting__sessions-header"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '12px 16px',
              borderRadius: '8px 8px 0 0',
              display: 'grid',
              gridTemplateColumns: '50% 20% 15% 15%',
              gap: '16px'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.reporting.sessions.headers.name')}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.reporting.sessions.headers.attendance')}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.reporting.sessions.headers.capacity')}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.reporting.sessions.headers.rating')}</p>
          </div>

          {/* Table Rows */}
          {topSessions.map((session, idx) => (
            <div
              className="event-reporting__sessions-row"
              key={idx}
              style={{
                backgroundColor: idx === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                padding: '16px',
                borderLeft: idx === 0 ? '3px solid #10B981' : 'none',
                display: 'grid',
                gridTemplateColumns: '50% 20% 15% 15%',
                gap: '16px',
                alignItems: 'center'
              }}
            >
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF' }}>
                {session.name}
              </p>
              <p style={{ fontSize: '14px', color: '#FFFFFF' }}>
                {session.attendance}
              </p>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: session.capacity >= 90 ? '#10B981' : '#0684F5', marginBottom: '4px' }}>
                  {session.capacity}%
                </p>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${session.capacity}%`, height: '100%', backgroundColor: session.capacity >= 90 ? '#10B981' : '#0684F5' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {session.rating ? (
                  <>
                    <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B' }}>
                      {session.rating}/10
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '14px', color: '#94A3B8' }}>N/A</span>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Sessions */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => setShowBottomSessions(!showBottomSessions)}
              style={{
                background: 'none',
                border: 'none',
                color: '#F59E0B',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {t('manageEvent.reporting.sessions.underperforming')}
              {showBottomSessions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {showBottomSessions && (
              <div style={{ marginTop: '16px' }}>
                {bottomSessions.map((session, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.08)',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #F59E0B',
                      marginBottom: '12px'
                    }}
                  >
                    <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                      {session.name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                      {session.attendance} • {session.capacity}% capacity
                    </p>
                    <p style={{ fontSize: '12px', color: '#F59E0B', fontStyle: 'italic' }}>
                      💡 {session.insight}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* B2B NETWORKING INSIGHTS */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>{t('manageEvent.reporting.b2b.title')}</h3>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div className="event-reporting__b2b-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {/* Meeting Statistics */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '24px',
                borderRadius: '8px'
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>{t('manageEvent.reporting.b2b.stats.title')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{t('manageEvent.reporting.b2b.stats.scheduled', { count: meetingStats.scheduled })}</p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.reporting.b2b.stats.labels.scheduled')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{t('manageEvent.reporting.b2b.stats.completed', { count: meetingStats.completed, percent: meetingStats.total ? Math.round((meetingStats.completed / meetingStats.total) * 100) : 0 })}</p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.reporting.b2b.stats.completed', { count: meetingStats.completed, percent: meetingStats.total ? Math.round((meetingStats.completed / meetingStats.total) * 100) : 0 })}</p>
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>{t('manageEvent.reporting.b2b.stats.cancelled', { count: meetingStats.cancelled, percent: meetingStats.total ? Math.round((meetingStats.cancelled / meetingStats.total) * 100) : 0 })}</p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.reporting.b2b.stats.cancelled', { count: meetingStats.cancelled, percent: meetingStats.total ? Math.round((meetingStats.cancelled / meetingStats.total) * 100) : 0 })}</p>
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{t('manageEvent.reporting.b2b.stats.avgDuration', { count: meetingStats.avgDuration })}</p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.reporting.b2b.stats.labels.avgDuration')}</p>
                </div>
              </div>
            </div>

            {/* Meeting Types */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '24px',
                borderRadius: '8px'
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>{t('manageEvent.reporting.b2b.types.title')}</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="180" height="180">
                  {meetingTypeSegments.map((segment, idx) => (
                    <circle
                      key={idx}
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="30"
                      strokeDasharray={segment.dasharray}
                      strokeDashoffset={segment.dashoffset}
                    />
                  ))}
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meetingTypeSegments.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '13px', color: '#FFFFFF' }}>{item.type}</span>
                    <span style={{ fontSize: '13px', color: '#94A3B8', marginLeft: 'auto' }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Networkers */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '24px',
                borderRadius: '8px'
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>{t('manageEvent.reporting.b2b.active.title')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topNetworkers.map((networker, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={networker.photo}
                      alt={networker.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                        {networker.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('manageEvent.reporting.b2b.active.meetings', { count: networker.meetings })}
                      </p>
                    </div>
                    {networker.rank === 1 && <Trophy size={16} style={{ color: '#F59E0B' }} />}
                    {networker.rank === 2 && <Medal size={16} style={{ color: '#94A3B8' }} />}
                    {networker.rank === 3 && <Award size={16} style={{ color: '#CD7F32' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT METRICS */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>{t('manageEvent.reporting.engagement.title')}</h3>

          <div className="event-reporting__engagement-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {engagementMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Icon size={28} style={{ color: metric.color, marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                    {metric.label}
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                    {metric.value}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
                    {metric.sub}
                  </p>
                  {metric.badge && (
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#10B981'
                      }}
                    >
                      {metric.badge}
                    </div>
                  )}
                  {metric.comparison && (
                    <p style={{ fontSize: '12px', color: metric.compColor }}>
                      {metric.comparison}
                    </p>
                  )}
                  {metric.detail && (
                    <p style={{ fontSize: '12px', color: metric.color }}>
                      {metric.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SURVEY & FEEDBACK */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}
        >
          <div className="event-reporting__feedback-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('manageEvent.reporting.feedback.title')}</h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {t('manageEvent.reporting.feedback.responses', { count: stats.surveyResponses, percent: feedbackSummary.responseRate })}
            </p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          <div className="event-reporting__feedback-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Left: Rating Distribution */}
            <div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '16px' }}>{t('manageEvent.reporting.feedback.overall')}</p>

              {/* Rating Bars */}
              {ratingDistribution.map((rating, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{rating.stars} stars</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {rating.count} responses ({rating.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rating.percentage}%`, height: '100%', backgroundColor: rating.color }} />
                  </div>
                </div>
              ))}

              {/* Average */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {feedbackSummary.avg ? `${feedbackSummary.avg} / 5.0` : '0 / 5.0'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= Math.round(feedbackSummary.avg) ? '#F59E0B' : 'none'}
                      stroke="#F59E0B"
                      opacity={star <= Math.round(feedbackSummary.avg) ? 1 : 0.4}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Category Scores */}
            <div>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '16px' }}>{t('manageEvent.reporting.feedback.satisfaction')}</p>

              {feedbackCategories.map((category, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#FFFFFF' }}>
                      {category.category}
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: category.color }}>
                      {category.score}/5
                    </p>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${category.percentage}%`, height: '100%', backgroundColor: category.color }} />
                  </div>
                </div>
              ))}

              {/* Featured Comments */}
              <div style={{ marginTop: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>{t('manageEvent.reporting.feedback.featured')}</p>
                {(feedbackSummary.comments.length ? feedbackSummary.comments : [{ quote: 'No comments yet.', author: 'Eventra' }]).map((comment, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #10B981',
                      marginBottom: '12px'
                    }}
                  >
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontStyle: 'italic', marginBottom: '8px' }}>
                      "{comment.quote}"
                    </p>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      - {comment.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM REPORT BUILDER */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '80px'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{t('manageEvent.reporting.builder.title')}</h3>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>{t('manageEvent.reporting.builder.subtitle')}</p>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

          {/* Checkboxes */}
          <div className="event-reporting__builder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[ 
                'Event Overview & Summary',
                'Attendance Analytics',
                'Revenue Breakdown',
                'Session Performance',
                'Ticket Sales Analysis'
              ].map((item, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{item}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[ 
                'B2B Meeting Insights',
                'Engagement Metrics',
                'Feedback & Survey Results',
                'Detailed Attendee List',
                'Marketing Performance'
              ].map((item, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    defaultChecked={idx < 3}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Options */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>{t('manageEvent.reporting.builder.format')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[ 
                { label: 'PDF Report', value: 'pdf', checked: true },
                { label: 'Excel Workbook (.xlsx)', value: 'xlsx', checked: false },
                { label: 'PowerPoint Presentation (.pptx)', value: 'pptx', checked: false },
                { label: 'CSV Data Export', value: 'csv', checked: false }
              ].map((format, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="format"
                    defaultChecked={format.checked}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {[ 
              { label: 'Include charts and graphs', checked: true },
              { label: 'Add company logo and branding', checked: true }
            ].map((toggle, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{toggle.label}</span>
                <div
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: toggle.checked ? '#0684F5' : 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: toggle.checked ? '26px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Eye size={18} />{t('manageEvent.reporting.builder.actions.preview')}</button>
            <button
              onClick={() => toast.success(t('manageEvent.reporting.toasts.generated'))}
              style={{
                height: '48px',
                padding: '0 32px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={18} />{t('manageEvent.reporting.builder.actions.generate')}</button>
          </div>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{t('manageEvent.reporting.modals.export.title')}</h2>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>{exportTypeLabel}</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Format Selection */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>{t('manageEvent.reporting.modals.export.format')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[ 
                    { label: 'Excel (.xlsx)', value: 'xlsx', checked: true },
                    { label: 'CSV (.csv)', value: 'csv', checked: false },
                    { label: 'PDF Report', value: 'pdf', checked: false }
                  ].map((format, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="export-format"
                        defaultChecked={format.checked}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{format.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Options */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>{t('manageEvent.reporting.modals.export.options')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[ 
                    'Include all columns',
                    'Include summary statistics',
                    'Include charts/visualizations',
                    'Include timestamps'
                  ].map((option, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        defaultChecked={idx !== 2}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >{t('manageEvent.reporting.modals.export.actions.cancel')}</button>
              <button
                onClick={handleExportConfirm}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: '#10B981',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />{t('manageEvent.reporting.quickExport.action')}</button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>{t('manageEvent.reporting.header.share')}</h2>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Shareable Link */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>{t('manageEvent.reporting.modals.share.link')}</p>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '12px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <p style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    https://eventra.app/reports/saas-summit-2024/abc123xyz
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://eventra.app/reports/saas-summit-2024/abc123xyz');
                      toast.success('Link copied to clipboard');
                    }}
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      backgroundColor: '#0684F5',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0
                    }}
                  >
                    <Copy size={14} />{t('manageEvent.reporting.modals.share.copy')}</button>
                </div>
              </div>

              {/* Link Settings */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.reporting.modals.share.password')}</span>
                  <div
                    style={{
                      width: '48px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: '2px'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.reporting.modals.share.expiration')}</span>
                  <div
                    style={{
                      width: '48px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: '2px'
                    }} />
                  </div>
                </div>
              </div>

              {/* Email Share */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>{t('manageEvent.reporting.modals.share.email')}</p>
                <input
                  type="text"
                  placeholder="Enter email addresses..."
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    marginBottom: '12px'
                  }}
                />
                <textarea
                  placeholder="Add a message... (optional)"
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >{t('manageEvent.reporting.modals.export.actions.cancel')}</button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  toast.success('Report shared successfully');
                }}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Share size={18} />{t('manageEvent.reporting.header.share')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
