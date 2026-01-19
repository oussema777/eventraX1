import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Handshake,
  Sparkles,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Plus,
  Download,
  Settings,
  ArrowUp,
  Star,
  Briefcase,
  Target,
  Brain,
  X,
  Send,
  Crown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type TabType = 'ai-matchmaker' | 'all-meetings' | 'analytics' | 'suggestions';

export default function EventB2BMatchmakingTab({ eventId }: { eventId?: string }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('ai-matchmaker');
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<'analyzing' | 'generating' | 'complete'>('analyzing');
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  // AI Matching Criteria States
  const [matchingSelection, setMatchingSelection] = useState('all');
  const [industryAlignment, setIndustryAlignment] = useState(85);
  const [roleCompatibility, setRoleCompatibility] = useState(60);
  const [companyStage, setCompanyStage] = useState(70);
  const [sharedInterests, setSharedInterests] = useState(90);
  const [goalAlignment, setGoalAlignment] = useState(80);
  const [minMatchScore, setMinMatchScore] = useState(75);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [meetingsData, setMeetingsData] = useState<any[]>([]);
  const [suggestionsData, setSuggestionsData] = useState<any[]>([]);
  const [selectedPair, setSelectedPair] = useState<any>(null);
  const [attendeesData, setAttendeesData] = useState<any[]>([]);
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [meetingDateFilter, setMeetingDateFilter] = useState('all');
  const [meetingSort, setMeetingSort] = useState('recent');
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([]);
  const [lastRunMeta, setLastRunMeta] = useState<any>(null);
  const [suggestionStats, setSuggestionStats] = useState({ total: 0, pending: 0, accepted: 0, dismissed: 0 });
  const [aiRunStats, setAiRunStats] = useState({ matchesCreated: 0, avgScore: 0, attendeesMatched: 0 });

  const [createMeetingDateTime, setCreateMeetingDateTime] = useState('');
  const [createMeetingDuration, setCreateMeetingDuration] = useState('30');
  const [createMeetingLocation, setCreateMeetingLocation] = useState('');

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const date = d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${date} at ${time}`;
  };

  const statusToColor = (s?: string | null) => {
    const v = String(s || '').toLowerCase();
    if (v === 'confirmed') return '#10B981';
    if (v === 'completed') return '#64748B';
    if (v === 'cancelled') return '#EF4444';
    return '#F59E0B';
  };

  const idToMeetingCode = (id?: string) => {
    if (!id) return '#B2B-00000';
    const tail = id.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
    return `#B2B-${tail.padStart(5, '0')}`;
  };

  const buildFallbackPair = () => {
    const pair = attendeesData.filter((a) => a?.id).slice(0, 2);
    if (pair.length < 2) return null;
    const [a, b] = pair;
    return {
      aId: a.id,
      bId: b.id,
      aName: a.name || a.email || 'Attendee A',
      bName: b.name || b.email || 'Attendee B',
      aTitle: a.meta?.jobTitle || a.meta?.job_title || a.meta?.title || a.meta?.role || '',
      bTitle: b.meta?.jobTitle || b.meta?.job_title || b.meta?.title || b.meta?.role || '',
      aCompany: a.company || '',
      bCompany: b.company || '',
      score: 0,
      tags: [],
      breakdown: [],
      insights: [],
      topics: []
    };
  };

  const normalizeTokens = (...values: any[]) => {
    const tokens: string[] = [];
    values.forEach((value) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'string') {
            tokens.push(...item.split(/[,;|/]+/g));
          } else if (item != null) {
            tokens.push(String(item));
          }
        });
        return;
      }
      if (typeof value === 'string') {
        tokens.push(...value.split(/[,;|/]+/g));
        return;
      }
      if (typeof value === 'number') {
        tokens.push(String(value));
      }
    });
    return Array.from(new Set(tokens.map((t) => t.trim()).filter(Boolean)));
  };

  const overlapScore = (aList: string[], bList: string[]) => {
    if (!aList.length || !bList.length) return { score: null, common: [] as string[] };
    const aSet = new Set(aList.map((v) => v.toLowerCase()));
    const bSet = new Set(bList.map((v) => v.toLowerCase()));
    const common = Array.from(aSet).filter((v) => bSet.has(v));
    const unionSize = new Set([...aSet, ...bSet]).size || 1;
    const score = Math.round((common.length / unionSize) * 100);
    return { score, common };
  };

  const normalizeStage = (stage?: string) => {
    if (!stage) return { label: '', rank: null as number | null };
    const s = stage.toLowerCase();
    if (s.includes('pre')) return { label: 'Pre-seed', rank: 1 };
    if (s.includes('seed')) return { label: 'Seed', rank: 2 };
    if (s.includes('series a') || s.includes('series-a') || s.includes('seriesa')) return { label: 'Series A', rank: 3 };
    if (s.includes('series b') || s.includes('series-b') || s.includes('seriesb')) return { label: 'Series B', rank: 4 };
    if (s.includes('series c') || s.includes('series-c') || s.includes('seriesc')) return { label: 'Series C', rank: 5 };
    if (s.includes('growth') || s.includes('scale')) return { label: 'Growth', rank: 6 };
    if (s.includes('enterprise')) return { label: 'Enterprise', rank: 7 };
    if (s.includes('startup')) return { label: 'Startup', rank: 2 };
    return { label: stage, rank: 4 };
  };

  const roleCategory = (role?: string) => {
    if (!role) return '';
    const r = role.toLowerCase();
    if (r.includes('cto') || r.includes('engineer') || r.includes('developer') || r.includes('tech') || r.includes('data')) return 'tech';
    if (r.includes('product')) return 'product';
    if (r.includes('sales') || r.includes('business development') || r.includes('bd')) return 'sales';
    if (r.includes('marketing') || r.includes('growth')) return 'marketing';
    if (r.includes('founder') || r.includes('ceo') || r.includes('co-founder') || r.includes('owner')) return 'leadership';
    if (r.includes('investor') || r.includes('vc') || r.includes('venture') || r.includes('angel')) return 'investor';
    if (r.includes('operations') || r.includes('ops') || r.includes('finance') || r.includes('cfo')) return 'ops';
    return 'other';
  };

  const roleScore = (aRole?: string, bRole?: string) => {
    if (!aRole || !bRole) return { score: null, detail: '' };
    const aCat = roleCategory(aRole);
    const bCat = roleCategory(bRole);
    if (!aCat || !bCat) return { score: null, detail: '' };
    if (aCat === bCat) return { score: 90, detail: 'Similar roles' };
    if (
      (aCat === 'investor' && bCat === 'leadership') ||
      (bCat === 'investor' && aCat === 'leadership')
    ) {
      return { score: 95, detail: 'Investor ↔ Founder pairing' };
    }
    if (
      (aCat === 'product' && bCat === 'tech') ||
      (bCat === 'product' && aCat === 'tech')
    ) {
      return { score: 85, detail: 'Product ↔ Technical leadership' };
    }
    if (
      (aCat === 'sales' && bCat === 'marketing') ||
      (bCat === 'sales' && aCat === 'marketing')
    ) {
      return { score: 82, detail: 'Sales ↔ Marketing alignment' };
    }
    return { score: 60, detail: 'Complementary roles' };
  };

  const buildMatchProfile = (attendee: any) => {
    const meta = attendee?.meta || {};
    const title = meta.jobTitle || meta.job_title || meta.title || meta.role || '';
    const industries = normalizeTokens(meta.industry, meta.industries, meta.sector, meta.sectors, meta.market, meta.markets, meta.industryFocus);
    const interests = normalizeTokens(meta.interests, meta.interest, meta.topics, meta.tags);
    const goals = normalizeTokens(meta.goals, meta.goal, meta.objectives, meta.networkingGoals, meta.networking_goals);
    const stage = normalizeStage(meta.companyStage || meta.company_stage || meta.stage);
    const category = meta.category || meta.attendeeCategory || attendee?.ticket_type || meta.ticketType || '';
    const optIn = meta.b2bOptIn ?? meta.b2b_opt_in ?? meta.matchmakingOptIn ?? meta.matchmaking_opt_in ?? meta.matchmaking ?? meta.selectedForMatch ?? meta.shortlist ?? meta.isSelected ?? meta.b2b_selected;
    return {
      title,
      industries,
      interests,
      goals,
      stage,
      category,
      optIn: optIn === true,
      meta
    };
  };

  const buildMatchMeta = (a: any, b: any) => {
    const aProfile = buildMatchProfile(a);
    const bProfile = buildMatchProfile(b);
    const industry = overlapScore(aProfile.industries, bProfile.industries);
    const interests = overlapScore(aProfile.interests, bProfile.interests);
    const goals = overlapScore(aProfile.goals, bProfile.goals);
    const role = roleScore(aProfile.title, bProfile.title);
    const stageScore = aProfile.stage.rank != null && bProfile.stage.rank != null
      ? { score: Math.max(0, 100 - Math.abs(aProfile.stage.rank - bProfile.stage.rank) * 15), detail: `${aProfile.stage.label} ↔ ${bProfile.stage.label}` }
      : { score: null, detail: '' };

    const criteria = [
      {
        key: 'industry',
        label: 'Industry Alignment',
        weight: industryAlignment,
        score: industry.score,
        detail: industry.common.length ? `Both in ${industry.common.slice(0, 2).join(', ')}` : 'Industry overlap'
      },
      {
        key: 'role',
        label: 'Job Role Compatibility',
        weight: roleCompatibility,
        score: role.score,
        detail: role.detail || 'Role compatibility'
      },
      {
        key: 'stage',
        label: 'Company Stage Alignment',
        weight: companyStage,
        score: stageScore.score,
        detail: stageScore.detail || 'Company stages'
      },
      {
        key: 'goals',
        label: 'Goal Alignment',
        weight: goalAlignment,
        score: goals.score,
        detail: goals.common.length ? `Shared goals: ${goals.common.slice(0, 2).join(', ')}` : 'Networking goals'
      },
      {
        key: 'interests',
        label: 'Common Interests',
        weight: sharedInterests,
        score: interests.score,
        detail: interests.common.length ? `Shared interests: ${interests.common.slice(0, 3).join(', ')}` : 'Shared interests'
      }
    ];

    const weighted = criteria
      .filter((c) => typeof c.score === 'number')
      .reduce(
        (acc, c) => {
          const weight = Math.max(0, Number(c.weight) || 0);
          return {
            weightSum: acc.weightSum + weight,
            total: acc.total + (Number(c.score) || 0) * weight
          };
        },
        { weightSum: 0, total: 0 }
      );
    const hasSignal = weighted.weightSum > 0;
    const finalScore = hasSignal ? Math.round(weighted.total / weighted.weightSum) : 60;

    const tags = Array.from(new Set([
      industry.common[0] ? `Industry: ${industry.common[0]}` : '',
      role.detail ? role.detail : '',
      goals.common[0] ? `Goal: ${goals.common[0]}` : '',
      interests.common[0] ? `Interest: ${interests.common[0]}` : '',
      aProfile.stage.label && bProfile.stage.label ? `Stage: ${aProfile.stage.label}` : ''
    ].filter(Boolean)));

    const insights = Array.from(new Set([
      industry.common.length ? `Both operate in ${industry.common.slice(0, 2).join(', ')}` : '',
      role.detail || '',
      goals.common.length ? `Aligned on ${goals.common.slice(0, 2).join(', ')}` : '',
      interests.common.length ? `Shared interests include ${interests.common.slice(0, 2).join(', ')}` : ''
    ].filter(Boolean)));

    const topics = Array.from(new Set([
      ...goals.common.slice(0, 3),
      ...interests.common.slice(0, 3)
    ]));

    const breakdown = criteria.map((c) => ({
      key: c.key,
      label: c.label,
      score: typeof c.score === 'number' ? Math.round(c.score) : 0,
      detail: c.detail
    }));

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      hasSignal,
      tags,
      insights,
      topics,
      breakdown
    };
  };

  const fetchB2BSettings = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_b2b_settings')
        .select('criteria,min_match_score')
        .eq('event_id', eventId)
        .maybeSingle();
      if (error) return;
      const c: any = data?.criteria || null;
      if (!c) return;
      if (c.matchingSelection) setMatchingSelection(c.matchingSelection);
      if (typeof c.industryAlignment === 'number') setIndustryAlignment(c.industryAlignment);
      if (typeof c.roleCompatibility === 'number') setRoleCompatibility(c.roleCompatibility);
      if (typeof c.jobRoleCompatibility === 'number') setRoleCompatibility(c.jobRoleCompatibility);
      if (typeof c.companyStage === 'number') setCompanyStage(c.companyStage);
      if (typeof c.goalAlignment === 'number') setGoalAlignment(c.goalAlignment);
      if (typeof c.sharedInterests === 'number') setSharedInterests(c.sharedInterests);
      if (typeof c.commonInterests === 'number') setSharedInterests(c.commonInterests);
      if (typeof c.minMatchScore === 'number') setMinMatchScore(c.minMatchScore);
      if (typeof data?.min_match_score === 'number') setMinMatchScore(data.min_match_score);
      const lastRunAt = c.lastRunAt || c.last_run_at;
      if (lastRunAt) {
        setLastRunMeta({
          at: lastRunAt,
          matchesCreated: c.lastRunCount ?? c.last_run_count ?? 0,
          avgScore: c.lastRunAvgScore ?? c.last_run_avg_score ?? 0,
          attendeesMatched: c.lastRunAttendeesMatched ?? c.last_run_attendees_matched ?? 0
        });
      }
    } catch {
      toast.error('Failed to dismiss suggestion');
    }
  };

  const persistB2BSettings = async (extraCriteria?: Record<string, any>) => {
    if (!eventId) return;
    if (savingSettings) return;
    setSavingSettings(true);
    try {
      const criteria = {
        matchingSelection,
        industryAlignment,
        roleCompatibility,
        companyStage,
        goalAlignment,
        sharedInterests,
        minMatchScore,
        ...extraCriteria
      };
      const { error } = await supabase
        .from('event_b2b_settings')
        .upsert({ event_id: eventId, criteria, min_match_score: minMatchScore }, { onConflict: 'event_id' });
      if (error) throw error;
    } catch {}
    finally {
      setSavingSettings(false);
    }
  };

  const createNotification = async (payload: {
    title: string;
    message: string;
    channel: 'email' | 'in_app' | 'sms' | 'push';
    audience: Record<string, any>;
  }) => {
    if (!eventId) return false;
    const { title, message, channel, audience } = payload;
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return false;
    }
    const { error } = await supabase.from('event_notifications').insert({
      event_id: eventId,
      created_by: user?.id || null,
      title: title.trim(),
      message: message.trim(),
      channel,
      status: 'sent',
      audience
    } as any);
    if (error) {
      toast.error('Failed to send notification');
      return false;
    }
    return true;
  };

  const fetchAttendees = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id,name,email,company,photo_url,avatar_url,ticket_type,meta,created_at')
        .eq('event_id', eventId)
        .limit(600);
      if (error) return;
      setAttendeesData(data || []);
    } catch {}
  };

  const fetchSuggestionStats = async () => {
    if (!eventId) return;
    try {
      const [pending, accepted, dismissed] = await Promise.all([
        supabase.from('event_b2b_suggestions').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('status', 'pending'),
        supabase.from('event_b2b_suggestions').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('status', 'accepted'),
        supabase.from('event_b2b_suggestions').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('status', 'dismissed')
      ]);
      const pendingCount = pending.count || 0;
      const acceptedCount = accepted.count || 0;
      const dismissedCount = dismissed.count || 0;
      setSuggestionStats({
        pending: pendingCount,
        accepted: acceptedCount,
        dismissed: dismissedCount,
        total: pendingCount + acceptedCount + dismissedCount
      });
    } catch {}
  };

  const fetchMeetings = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_b2b_meetings')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) return;
      const rows: any[] = data || [];
      const ids = Array.from(new Set(rows.flatMap(r => [r.attendee_a_id, r.attendee_b_id]).filter(Boolean)));
      let attendeeMap: Record<string, any> = {};
      if (ids.length) {
        const { data: a } = await supabase
          .from('event_attendees')
          .select('id,name,company,photo_url,avatar_url,ticket_type,meta')
          .in('id', ids);
        (a || []).forEach((x: any) => { attendeeMap[x.id] = x; });
      }

      const mapped = rows.map((r) => {
        const a = attendeeMap[r.attendee_a_id] || {};
        const b = attendeeMap[r.attendee_b_id] || {};
        const score = Number(r.match_score || 0) || 0;
        const status = r.status ? String(r.status).charAt(0).toUpperCase() + String(r.status).slice(1) : 'Pending';
        return {
          id: idToMeetingCode(r.id),
          rawId: r.id,
          ai: !!r.is_ai,
          p1: a.name || 'Attendee A',
          p2: b.name || 'Attendee B',
          aId: r.attendee_a_id,
          bId: r.attendee_b_id,
          aTitle: a.meta?.jobTitle || a.meta?.job_title || a.meta?.title || a.meta?.role || '',
          bTitle: b.meta?.jobTitle || b.meta?.job_title || b.meta?.title || b.meta?.role || '',
          aCompany: a.company || '',
          bCompany: b.company || '',
          aPhoto: a.photo_url || a.avatar_url || a.meta?.photo || '',
          bPhoto: b.photo_url || b.avatar_url || b.meta?.photo || '',
          aTicketType: a.ticket_type || '',
          bTicketType: b.ticket_type || '',
          aMeta: a.meta || {},
          bMeta: b.meta || {},
          score,
          tag: r.tag || '',
          date: r.start_at ? formatDateTime(r.start_at) : 'TBD',
          dateRaw: r.start_at || r.created_at || null,
          status,
          statusKey: String(r.status || 'pending').toLowerCase(),
          statusColor: statusToColor(r.status),
          location: r.location || '',
          createdAt: r.created_at,
          matchMeta: r.meta || {}
        };
      });
      setMeetingsData(mapped);
    } catch {}
  };

  const fetchSuggestions = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_b2b_suggestions')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) return;
      const rows: any[] = data || [];
      const ids = Array.from(new Set(rows.flatMap(r => [r.attendee_a_id, r.attendee_b_id]).filter(Boolean)));
      let attendeeMap: Record<string, any> = {};
      if (ids.length) {
        const { data: a } = await supabase
          .from('event_attendees')
          .select('id,name,company,photo_url,ticket_type,meta')
          .in('id', ids);
        (a || []).forEach((x: any) => { attendeeMap[x.id] = x; });
      }
      const mapped = rows.map((r) => {
        const a = attendeeMap[r.attendee_a_id] || {};
        const b = attendeeMap[r.attendee_b_id] || {};
        const tags = Array.isArray(r.meta?.tags) ? r.meta.tags : [];
        return {
          id: r.id,
          aId: r.attendee_a_id,
          bId: r.attendee_b_id,
          aName: a.name || 'Attendee A',
          aTitle: (a.meta && (a.meta.jobTitle || a.meta.job_title || a.meta.title || a.meta.role)) || '',
          aCompany: a.company || '',
          aPhoto: a.photo_url || a.avatar_url || a.meta?.photo || '',
          bName: b.name || 'Attendee B',
          bTitle: (b.meta && (b.meta.jobTitle || b.meta.job_title || b.meta.title || b.meta.role)) || '',
          bCompany: b.company || '',
          bPhoto: b.photo_url || b.avatar_url || b.meta?.photo || '',
          score: Number(r.score || 0) || 0,
          tags,
          breakdown: Array.isArray(r.meta?.breakdown) ? r.meta.breakdown : [],
          insights: Array.isArray(r.meta?.insights) ? r.meta.insights : [],
          topics: Array.isArray(r.meta?.topics) ? r.meta.topics : [],
          createdAt: r.created_at
        };
      });
      setSuggestionsData(mapped);
    } catch {}
  };

  const dismissSuggestion = async (id?: string) => {
    if (!eventId || !id) return;
    try {
      const { error } = await supabase
        .from('event_b2b_suggestions')
        .update({ status: 'dismissed' })
        .eq('id', id);
      if (error) throw error;
      fetchSuggestions();
      fetchSuggestionStats();
      toast.success(t('manageEvent.b2b.toasts.suggestionsDismissed'));
    } catch {}
  };

  const generateSuggestions = async () => {
    if (!eventId) return { created: 0, avgScore: 0, attendeesMatched: 0 };
    try {
      let list: any[] = attendeesData;
      if (!list.length) {
        const { data: attendees } = await supabase
          .from('event_attendees')
          .select('id,name,company,photo_url,avatar_url,ticket_type,meta')
          .eq('event_id', eventId)
          .limit(600);
        list = attendees || [];
      }
      if (list.length < 2) return { created: 0, avgScore: 0, attendeesMatched: 0 };

      const { data: existingSuggestions } = await supabase
        .from('event_b2b_suggestions')
        .select('attendee_a_id,attendee_b_id,status')
        .eq('event_id', eventId);
      const { data: existingMeetings } = await supabase
        .from('event_b2b_meetings')
        .select('attendee_a_id,attendee_b_id')
        .eq('event_id', eventId);

      const blockedPairs = new Set<string>();
      (existingSuggestions || []).forEach((s: any) => {
        const key = [s.attendee_a_id, s.attendee_b_id].sort().join(':');
        blockedPairs.add(key);
      });
      (existingMeetings || []).forEach((m: any) => {
        const key = [m.attendee_a_id, m.attendee_b_id].sort().join(':');
        blockedPairs.add(key);
      });

      let pool = list;
      if (matchingSelection === 'individuals') {
        const opted = pool.filter((attendee) => buildMatchProfile(attendee).optIn);
        if (opted.length) {
          pool = opted;
        } else {
          toast.info('No individuals marked for matchmaking. Matching all attendees instead.');
        }
      }

      const maxSuggestions = Math.min(200, Math.max(10, Math.round(pool.length * 0.4)));
        const pairs: any[] = [];
        const candidates: any[] = [];
        for (let i = 0; i < pool.length - 1; i += 1) {
          for (let j = i + 1; j < pool.length; j += 1) {
            const a = pool[i];
            const b = pool[j];
            if (!a?.id || !b?.id) continue;
            const key = [a.id, b.id].sort().join(':');
            if (blockedPairs.has(key)) continue;
          if (matchingSelection === 'category') {
            const aCategory = buildMatchProfile(a).category;
            const bCategory = buildMatchProfile(b).category;
            if (!aCategory || !bCategory || aCategory.toLowerCase() !== bCategory.toLowerCase()) {
              continue;
            }
            }
            const meta = buildMatchMeta(a, b);
            candidates.push({ a, b, score: meta.score, meta });
            const threshold = meta.hasSignal ? Math.max(0, Math.min(100, Number(minMatchScore) || 0)) : 0;
            if (meta.score < threshold) continue;
            pairs.push({ a, b, score: meta.score, meta });
          }
        }

        pairs.sort((a, b) => b.score - a.score);
        if (!pairs.length && candidates.length) {
          candidates.sort((a, b) => b.score - a.score);
          pairs.push(candidates[0]);
        }
      const perAttendeeLimit = Math.max(3, Math.round(maxSuggestions / Math.max(1, pool.length) * 6));
      const attendeeCounts: Record<string, number> = {};
      const picked: any[] = [];
      for (const pair of pairs) {
        if (picked.length >= maxSuggestions) break;
        const aId = pair.a.id;
        const bId = pair.b.id;
        const aCount = attendeeCounts[aId] || 0;
        const bCount = attendeeCounts[bId] || 0;
        if (aCount >= perAttendeeLimit || bCount >= perAttendeeLimit) continue;
        picked.push(pair);
        attendeeCounts[aId] = aCount + 1;
        attendeeCounts[bId] = bCount + 1;
      }

      await supabase
        .from('event_b2b_suggestions')
        .delete()
        .eq('event_id', eventId)
        .eq('status', 'pending');

      if (!picked.length) return { created: 0, avgScore: 0, attendeesMatched: 0 };
      const payload = picked.map((pair) => ({
        event_id: eventId,
        attendee_a_id: pair.a.id,
        attendee_b_id: pair.b.id,
        score: pair.score,
        status: 'pending',
        meta: {
          tags: pair.meta.tags,
          breakdown: pair.meta.breakdown,
          insights: pair.meta.insights,
          topics: pair.meta.topics
        }
      }));
      const { error } = await supabase
        .from('event_b2b_suggestions')
        .insert(payload);
      if (error) return { created: 0, avgScore: 0, attendeesMatched: 0 };

      const avgScore = Math.round(picked.reduce((sum, pair) => sum + pair.score, 0) / picked.length);
      const attendeesMatched = Object.keys(attendeeCounts).length;
      return { created: picked.length, avgScore, attendeesMatched };
    } catch {
      return { created: 0, avgScore: 0, attendeesMatched: 0 };
    }
  };

  const createMeeting = async () => {
    if (!eventId) return;
    if (savingMeeting) return;

      const fallbackAttendees = attendeesData.filter((a) => a?.id).slice(0, 2);
      const fallbackPair = fallbackAttendees.length >= 2
        ? { aId: fallbackAttendees[0].id, bId: fallbackAttendees[1].id }
        : null;
      const aId = selectedPair?.aId || suggestionsData?.[0]?.aId || fallbackPair?.aId;
      const bId = selectedPair?.bId || suggestionsData?.[0]?.bId || fallbackPair?.bId;
      if (!aId || !bId) {
        toast.error('Select a match suggestion first');
        return;
      }
      if (!selectedPair?.aId && !suggestionsData?.length && fallbackPair) {
        toast.info('No AI suggestion selected. Scheduling a direct meeting.');
      }

    const startIso = createMeetingDateTime ? new Date(createMeetingDateTime).toISOString() : null;
    const mins = Math.max(5, parseInt(String(createMeetingDuration || '30'), 10) || 30);
    const endIso = startIso ? new Date(new Date(startIso).getTime() + mins * 60 * 1000).toISOString() : null;

    setSavingMeeting(true);
    try {
      const payload: any = {
        event_id: eventId,
        attendee_a_id: aId,
        attendee_b_id: bId,
        start_at: startIso,
        end_at: endIso,
        location: createMeetingLocation || null,
        status: 'confirmed',
        is_ai: !!selectedPair?.score,
        match_score: selectedPair?.score || null,
        meta: selectedPair?.breakdown ? { breakdown: selectedPair.breakdown, insights: selectedPair.insights, topics: selectedPair.topics, tags: selectedPair.tags || [] } : undefined
      };
      if (selectedPair?.meetingId) {
        const { error } = await supabase
          .from('event_b2b_meetings')
          .update(payload)
          .eq('id', selectedPair.meetingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_b2b_meetings')
          .insert(payload);
        if (error) throw error;
      }

      if (selectedPair?.suggestionId) {
        await supabase
          .from('event_b2b_suggestions')
          .update({ status: 'accepted' })
          .eq('id', selectedPair.suggestionId);
      }

      const notifyOk = await createNotification({
        title: 'B2B meeting scheduled',
        message: `Your networking meeting has been scheduled${startIso ? ` for ${formatDateTime(startIso)}` : ''}.`,
        channel: 'email',
        audience: { type: 'attendee', attendee_ids: [aId, bId], category: 'b2b_meeting' }
      });
      if (notifyOk) {
        toast.success(selectedPair?.meetingId ? t('manageEvent.b2b.toasts.notificationsSent') : t('manageEvent.b2b.toasts.invitationsSent'));
      } else {
        toast.success(selectedPair?.meetingId ? t('manageEvent.b2b.toasts.meetingUpdated') : t('manageEvent.b2b.toasts.meetingCreated'));
      }
      setShowCreateMeeting(false);
      setCreateMeetingDateTime('');
      setCreateMeetingDuration('30');
      setCreateMeetingLocation('');
      fetchMeetings();
      fetchSuggestions();
      fetchSuggestionStats();
    } catch {
      toast.error(t('manageEvent.b2b.toasts.meetingCreateError'));
    } finally {
      setSavingMeeting(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;
    (async () => {
      setIsLoadingData(true);
      await fetchB2BSettings();
      if (!mounted) return;
      await Promise.all([fetchAttendees(), fetchMeetings(), fetchSuggestions(), fetchSuggestionStats()]);
      setIsLoadingData(false);
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  useEffect(() => {
    setSelectedMeetingIds((prev) => prev.filter((id) => meetingsData.some((m: any) => m.rawId === id)));
  }, [meetingsData]);

  // Stats
  const stats = useMemo(() => {
    if (!eventId) {
      return {
        totalMeetings: 0,
        pendingSuggestions: 0,
        activeConnections: 0,
        newConnectionsWeek: 0,
        avgMatchScore: 0,
        successRate: 0,
        completionRate: 0,
        completedMeetings: 0,
        networkingScore: 0,
        newThisWeek: 0,
        aiMatchSuccess: 0
      };
    }

    const totalMeetings = meetingsData.length;
    const pendingSuggestions = suggestionStats.pending || suggestionsData.length;
    const scored = meetingsData.filter((m: any) => (m?.score || 0) > 0).map((m: any) => Number(m.score || 0) || 0);
    const avgMatchScore = scored.length ? Math.round(scored.reduce((a: number, b: number) => a + b, 0) / scored.length) : 0;
    const completed = meetingsData.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'completed').length;
    const confirmed = meetingsData.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'confirmed').length;
    const successRate = totalMeetings ? Math.round(((completed + confirmed) / totalMeetings) * 100) : 0;
    const completionRate = totalMeetings ? Math.round((completed / totalMeetings) * 100) : 0;
    const activeConnections = totalMeetings;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newConnectionsWeek = meetingsData.filter((m: any) => {
      const date = m.createdAt || m.dateRaw;
      if (!date) return false;
      const d = new Date(date);
      return !Number.isNaN(d.getTime()) && d >= weekAgo;
    }).length;
    const aiMatchSuccess = suggestionStats.total
      ? Math.round((suggestionStats.accepted / suggestionStats.total) * 100)
      : 0;

    return {
      totalMeetings,
      pendingSuggestions,
      activeConnections,
      newConnectionsWeek,
      avgMatchScore,
      successRate,
      completionRate,
      completedMeetings: completed,
      networkingScore: Number((avgMatchScore / 10).toFixed(1)),
      newThisWeek: newConnectionsWeek,
      aiMatchSuccess
    };
  }, [eventId, meetingsData, suggestionsData, suggestionStats]);

  const attendeeInsights = useMemo(() => {
    const total = attendeesData.length;
    const industryCounts: Record<string, number> = {};
    const goalCounts: Record<string, number> = {};
    let optInCount = 0;
    let categoryCount = 0;
    attendeesData.forEach((attendee) => {
      const profile = buildMatchProfile(attendee);
      if (profile.optIn) optInCount += 1;
      if (profile.category) categoryCount += 1;
      profile.industries.forEach((industry) => {
        const key = industry.trim();
        if (!key) return;
        industryCounts[key] = (industryCounts[key] || 0) + 1;
      });
      profile.goals.forEach((goal) => {
        const key = goal.trim();
        if (!key) return;
        goalCounts[key] = (goalCounts[key] || 0) + 1;
      });
    });
    const toTop = (counts: Record<string, number>, limit = 4) => {
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return entries.slice(0, limit).map(([label, count]) => ({
        label,
        percentage: total ? Math.round((count / total) * 100) : 0
      }));
    };
    const matchedAttendees = new Set(suggestionsData.flatMap((s: any) => [s.aId, s.bId]).filter(Boolean)).size;
    return {
      total,
      potentialPercent: total ? Math.round((matchedAttendees / total) * 100) : 0,
      optInCount,
      categoryCount,
      topIndustries: toTop(industryCounts, 4),
      topGoals: toTop(goalCounts, 4)
    };
  }, [attendeesData, suggestionsData]);

  const meetingFilters = useMemo(() => {
    const today = new Date();
    const isToday = (value?: string | null) => {
      if (!value) return false;
      const d = new Date(value);
      return d.toDateString() === today.toDateString();
    };
    const counts = {
      all: meetingsData.length,
      today: meetingsData.filter((m: any) => isToday(m.dateRaw)).length,
      ai: meetingsData.filter((m: any) => m.ai).length,
      manual: meetingsData.filter((m: any) => !m.ai).length,
      pending: meetingsData.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'pending').length,
      completed: meetingsData.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'completed').length
    };
    return [
      { key: 'all', label: 'All', count: counts.all, icon: false },
      { key: 'today', label: 'Today', count: counts.today, icon: false },
      { key: 'ai', label: 'AI Generated', count: counts.ai, icon: true },
      { key: 'manual', label: 'Manual', count: counts.manual, icon: false },
      { key: 'pending', label: 'Pending', count: counts.pending, icon: false },
      { key: 'completed', label: 'Completed', count: counts.completed, icon: false }
    ];
  }, [meetingsData]);

  const filteredMeetings = useMemo(() => {
    let rows = [...meetingsData];
    const term = meetingSearch.trim().toLowerCase();
    if (term) {
      rows = rows.filter((m: any) => {
        const hay = [
          m.id,
          m.p1,
          m.p2,
          m.tag,
          m.aCompany,
          m.bCompany,
          m.aTitle,
          m.bTitle
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(term);
      });
    }
    if (meetingFilter === 'today') {
      const today = new Date().toDateString();
      rows = rows.filter((m: any) => {
        const d = m.dateRaw ? new Date(m.dateRaw).toDateString() : '';
        return d === today;
      });
    }
    if (meetingFilter === 'ai') rows = rows.filter((m: any) => m.ai);
    if (meetingFilter === 'manual') rows = rows.filter((m: any) => !m.ai);
    if (meetingFilter === 'pending') rows = rows.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'pending');
    if (meetingFilter === 'completed') rows = rows.filter((m: any) => String(m.statusKey || '').toLowerCase() === 'completed');

    if (meetingDateFilter === 'today') {
      const today = new Date().toDateString();
      rows = rows.filter((m: any) => m.dateRaw && new Date(m.dateRaw).toDateString() === today);
    }
    if (meetingDateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      rows = rows.filter((m: any) => m.dateRaw && new Date(m.dateRaw) >= weekAgo);
    }

    if (meetingSort === 'score') {
      rows.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    } else if (meetingSort === 'upcoming') {
      rows.sort((a: any, b: any) => {
        const aTime = a.dateRaw ? new Date(a.dateRaw).getTime() : 0;
        const bTime = b.dateRaw ? new Date(b.dateRaw).getTime() : 0;
        return aTime - bTime;
      });
    } else {
      rows.sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    return rows;
  }, [meetingsData, meetingSearch, meetingFilter, meetingDateFilter, meetingSort]);

  const handleGenerateMatches = async () => {
    if (!isLoadingData && attendeeInsights.total < 2) {
      toast.error('Add at least two attendees to generate matches');
      return;
    }
    await persistB2BSettings();
    setShowAIProcessing(true);
    setProcessingState('analyzing');
    setProgress(0);

    let finished = false;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (finished) return 100;
        if (prev >= 50) setProcessingState('generating');
        return Math.min(95, prev + 5);
      });
    }, 150);

    const result = await generateSuggestions();
    finished = true;
    clearInterval(interval);
    setProcessingState('complete');
    setProgress(100);
    setAiRunStats({
      matchesCreated: result.created,
      avgScore: result.avgScore,
      attendeesMatched: result.attendeesMatched
    });
    const lastRunAt = new Date().toISOString();
    setLastRunMeta({
      at: lastRunAt,
      matchesCreated: result.created,
      avgScore: result.avgScore,
      attendeesMatched: result.attendeesMatched
    });
    if (!result.created) {
      toast.error('No matches found with the current criteria');
    }
    await persistB2BSettings({
      lastRunAt,
      lastRunCount: result.created,
      lastRunAvgScore: result.avgScore,
      lastRunAttendeesMatched: result.attendeesMatched
    });
    await fetchSuggestions();
    await fetchSuggestionStats();
  };

  const handleCompleteMatching = () => {
    setShowAIProcessing(false);
    setActiveTab('all-meetings');
    if (aiRunStats.matchesCreated) {
      toast.success(t('manageEvent.b2b.toasts.matchesSuccess', { count: aiRunStats.matchesCreated }));
    } else {
      toast.success(t('manageEvent.b2b.toasts.matchesComplete'));
    }
  };

  const escapeCsvValue = (value: any) => `"${String(value ?? '').replace(/\"/g, '""')}"`;

  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    const lines = [headers.join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (activeTab === 'suggestions') {
      if (!suggestionsData.length) {
        toast.error(t('manageEvent.b2b.toasts.noSuggestionsExport'));
        return;
      }
      downloadCsv(
        `b2b-suggestions-${eventId || 'event'}.csv`,
        ['Match Score', 'Attendee A', 'Company A', 'Attendee B', 'Company B', 'Tags', 'Created At'],
        suggestionsData.map((s: any) => [
          String(s.score || 0),
          s.aName || '',
          s.aCompany || '',
          s.bName || '',
          s.bCompany || '',
          Array.isArray(s.tags) ? s.tags.join('; ') : '',
          s.createdAt ? formatDateTime(s.createdAt) : ''
        ])
      );
      toast.success(t('manageEvent.b2b.toasts.suggestionsExported'));
      return;
    }

    const rows = selectedMeetingIds.length
      ? meetingsData.filter((m: any) => selectedMeetingIds.includes(m.rawId))
      : meetingsData;
    if (!rows.length) {
      toast.error(t('manageEvent.b2b.toasts.noMeetingsExport'));
      return;
    }
    downloadCsv(
      `b2b-meetings-${eventId || 'event'}.csv`,
      ['Meeting ID', 'Attendee A', 'Attendee B', 'Match Score', 'Status', 'Date', 'Location', 'AI Generated'],
      rows.map((m: any) => [
        m.id,
        m.p1 || '',
        m.p2 || '',
        String(m.score || 0),
        m.status || '',
        m.date || '',
        m.location || '',
        m.ai ? 'Yes' : 'No'
      ])
    );
    toast.success(t('manageEvent.b2b.toasts.meetingsExported'));
  };

  const handleSettingsClick = async () => {
    await persistB2BSettings();
    setActiveTab('ai-matchmaker');
    toast.success(t('manageEvent.b2b.toasts.settingsSaved'));
  };

  const handleSendReminders = async () => {
    if (!suggestionsData.length) {
      toast.error(t('manageEvent.b2b.toasts.noPendingRemind'));
      return;
    }
    const attendeeIds = Array.from(new Set(suggestionsData.flatMap((s: any) => [s.aId, s.bId]).filter(Boolean)));
    const ok = await createNotification({
      title: 'Reminder: Review your B2B match',
      message: 'You have a pending match suggestion. Log in to accept or dismiss the match.',
      channel: 'email',
      audience: { type: 'attendee', attendee_ids: attendeeIds, category: 'b2b_reminder' }
    });
    if (ok) toast.success(t('manageEvent.b2b.toasts.remindersSent'));
  };

  const handleSendMatchNotification = async () => {
    const aId = selectedPair?.aId;
    const bId = selectedPair?.bId;
    if (!aId || !bId) {
      toast.error(t('manageEvent.b2b.toasts.selectMatchFirst'));
      return;
    }
    const ok = await createNotification({
      title: 'New B2B match suggestion',
      message: 'We found a high-potential connection for you at this event.',
      channel: 'email',
      audience: { type: 'attendee', attendee_ids: [aId, bId], category: 'b2b_match' }
    });
    if (ok) toast.success(t('manageEvent.b2b.toasts.matchNotifSent'));
  };

  const handleSendMatchBatchNotification = async () => {
    if (!suggestionsData.length) {
      toast.error(t('manageEvent.b2b.toasts.selectSuggestion'));
      return;
    }
    const attendeeIds = Array.from(new Set(suggestionsData.flatMap((s: any) => [s.aId, s.bId]).filter(Boolean)));
    const ok = await createNotification({
      title: 'New AI match suggestions',
      message: 'Your event has new AI match suggestions ready for review.',
      channel: 'email',
      audience: { type: 'attendee', attendee_ids: attendeeIds, category: 'b2b_match' }
    });
    if (ok) toast.success(t('manageEvent.b2b.toasts.notifSent'));
  };

  const toggleSelectAllMeetings = (checked: boolean) => {
    if (!checked) {
      setSelectedMeetingIds([]);
      return;
    }
    const allIds = filteredMeetings.map((m: any) => m.rawId).filter(Boolean);
    setSelectedMeetingIds(allIds);
  };

  const toggleMeetingSelection = (meetingId: string, checked: boolean) => {
    setSelectedMeetingIds((prev) => {
      if (checked) return Array.from(new Set([...prev, meetingId]));
      return prev.filter((id) => id !== meetingId);
    });
  };

  const Slider = ({ label, value, onChange, helper }: { label: string; value: number; onChange: (val: number) => void; helper: string }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>{label}</label>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          background: `linear-gradient(to right, #0684F5 0%, #0684F5 ${value}%, rgba(255,255,255,0.1) ${value}%, rgba(255,255,255,0.1) 100%)`,
          appearance: 'none',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{helper}</p>
    </div>
  );

  const matchScore = selectedPair?.score || 0;
  const matchBreakdown = Array.isArray(selectedPair?.breakdown) ? selectedPair.breakdown : [];
  const matchInsights = Array.isArray(selectedPair?.insights) ? selectedPair.insights : [];
  const matchTopics = Array.isArray(selectedPair?.topics) ? selectedPair.topics : [];
  const networkStarRating = Math.round((stats.networkingScore / 10) * 5);
  const aiMatchLabel = stats.aiMatchSuccess >= 80
    ? 'Excellent'
    : stats.aiMatchSuccess >= 60
      ? 'Good'
      : stats.aiMatchSuccess >= 40
        ? 'Fair'
        : 'Low';

  return (
    <div className="event-b2b" style={{ padding: '32px 40px 80px', backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 600px) {
          .event-b2b {
            padding: 24px 16px 80px;
          }

          .event-b2b__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-b2b__header-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-b2b__header-actions > * {
            width: 100%;
            justify-content: center;
          }

          .event-b2b__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px;
          }

          .event-b2b__tabs {
            flex-wrap: wrap;
          }

          .event-b2b__tabs button {
            flex: 1 1 160px;
          }

          .event-b2b__grid {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }

          .event-b2b__filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .event-b2b__filter-tabs {
            flex-wrap: wrap;
          }

          .event-b2b__filter-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-b2b__filter-actions input {
            width: 100% !important;
          }

          .event-b2b__filter-actions > * {
            flex: 1 1 160px;
          }

          .event-b2b [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 400px) {
          .event-b2b {
            padding: 20px 12px 72px;
          }

          .event-b2b__stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div className="event-b2b__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('manageEvent.b2b.header.title')}
              </h1>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Crown size={12} />
                PRO
              </span>
            </div>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('manageEvent.b2b.header.subtitle')}
            </p>
          </div>

          <div className="event-b2b__header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={async () => {
                  setActiveTab('ai-matchmaker');
                  await handleGenerateMatches();
                }}
                style={{
                  height: '44px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #0684F5 0%, #0EA5E9 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(6,132,245,0.4)'
              }}
            >
              <Sparkles size={18} />
              {t('manageEvent.b2b.header.aiMatchmaker')}
            </button>
              <button
                onClick={() => {
                  const firstSuggestion = suggestionsData?.[0];
                  if (firstSuggestion) {
                    setSelectedPair({
                      aId: firstSuggestion.aId,
                      bId: firstSuggestion.bId,
                      aName: firstSuggestion.aName,
                      bName: firstSuggestion.bName,
                      score: firstSuggestion.score,
                      suggestionId: firstSuggestion.id,
                      aTitle: firstSuggestion.aTitle,
                      bTitle: firstSuggestion.bTitle,
                      aCompany: firstSuggestion.aCompany,
                      bCompany: firstSuggestion.bCompany,
                      tags: firstSuggestion.tags,
                      breakdown: firstSuggestion.breakdown,
                      insights: firstSuggestion.insights,
                      topics: firstSuggestion.topics
                    });
                    setShowCreateMeeting(true);
                    return;
                  }
                  const fallback = buildFallbackPair();
                  if (fallback) {
                    setSelectedPair(fallback);
                    setShowCreateMeeting(true);
                    return;
                  }
                  toast.error(t('manageEvent.b2b.toasts.addTwo'));
                }}
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
              <Plus size={18} />
              {t('manageEvent.b2b.header.createMeeting')}
            </button>
            <button
              onClick={handleDownload}
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleSettingsClick}
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* LIVE STATS DASHBOARD */}
        <div
          className="event-b2b__stats"
          style={{
            background: 'linear-gradient(90deg, rgba(6,132,245,0.15) 0%, rgba(236,72,153,0.15) 100%)',
            padding: '28px 32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '24px'
          }}
        >
          {/* Stat 1: Active Connections */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Handshake size={32} style={{ color: '#0684F5', filter: 'drop-shadow(0 0 8px rgba(6,132,245,0.5))' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.activeConnections')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1', marginBottom: '8px' }}>
              {stats.activeConnections}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.totalMeetings')}
            </p>
            <p style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', animation: 'pulse 2s infinite' }}>
              <ArrowUp size={12} />
              +{stats.newThisWeek} {t('manageEvent.b2b.stats.newThisWeek').split('} ')[1]}
            </p>
          </div>

          {/* Stat 2: AI Match Success */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Sparkles size={32} style={{ color: '#EC4899', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.5))' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.aiMatchSuccess')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1', marginBottom: '8px' }}>
              {stats.aiMatchSuccess}%
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.ofAiAccepted')}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {aiMatchLabel}
            </span>
          </div>

          {/* Stat 3: Pending Suggestions */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Clock size={32} style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.pendingSuggestions')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1', marginBottom: '8px' }}>
              {stats.pendingSuggestions}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.awaitingResponse')}
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSendReminders();
              }}
              style={{ fontSize: '12px', color: '#0684F5', textDecoration: 'none' }}
            >
              {t('manageEvent.b2b.stats.sendReminders')}
            </a>
          </div>

          {/* Stat 4: Completed Meetings */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <CheckCircle size={32} style={{ color: '#10B981', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.completed')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1', marginBottom: '8px' }}>
              {stats.completedMeetings}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.completionRate', { percent: stats.completionRate })}
            </p>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.completionRate}%`, height: '100%', backgroundColor: '#10B981' }} />
            </div>
          </div>

          {/* Stat 5: Networking Score */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <TrendingUp size={32} style={{ color: '#8B5CF6', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.networkingScore')}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1', marginBottom: '8px' }}>
              {stats.networkingScore}/10
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.b2b.stats.overallEngagement')}
            </p>
              <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= networkStarRating ? '#F59E0B' : 'none'}
                  stroke="#F59E0B"
                  opacity={star <= networkStarRating ? 1 : 0.4}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div
          className="event-b2b__tabs"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '8px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            gap: '8px'
          }}
        >
          {[
            { id: 'ai-matchmaker' as const, icon: Sparkles, label: t('manageEvent.b2b.tabs.aiMatchmaker') },
            { id: 'all-meetings' as const, icon: Handshake, label: t('manageEvent.b2b.tabs.allMeetings') },
            { id: 'analytics' as const, icon: TrendingUp, label: t('manageEvent.b2b.tabs.analytics') },
            { id: 'suggestions' as const, icon: Target, label: t('manageEvent.b2b.tabs.suggestions') }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: isActive ? '#0684F5' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 0 20px rgba(6,132,245,0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI MATCHMAKER */}
        {activeTab === 'ai-matchmaker' && (
          <div className="event-b2b__grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '32px' }}>
            {/* LEFT COLUMN: AI Matching Engine */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <Sparkles
                  size={40}
                  style={{
                    color: '#EC4899',
                    filter: 'drop-shadow(0 0 12px rgba(236,72,153,0.6))',
                    animation: 'spin 3s linear infinite'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
                      {t('manageEvent.b2b.aiMatchmaker.title')}
                    </h3>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Crown size={10} />
                      PRO
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('manageEvent.b2b.aiMatchmaker.subtitle')}
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

              {/* Step 1: Select Attendees */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('manageEvent.b2b.aiMatchmaker.whoToMatch')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      value: 'all',
                      label: t('manageEvent.b2b.aiMatchmaker.options.all.label'),
                      desc: t('manageEvent.b2b.aiMatchmaker.options.all.desc'),
                      count: attendeeInsights.total ? t('manageEvent.b2b.aiMatchmaker.options.all.count', { count: attendeeInsights.total }) : t('manageEvent.b2b.aiMatchmaker.options.noAttendees'),
                      recommended: true
                    },
                    {
                      value: 'category',
                      label: t('manageEvent.b2b.aiMatchmaker.options.category.label'),
                      desc: t('manageEvent.b2b.aiMatchmaker.options.category.desc'),
                      count: attendeeInsights.categoryCount ? t('manageEvent.b2b.aiMatchmaker.options.category.count', { count: attendeeInsights.categoryCount }) : t('manageEvent.b2b.aiMatchmaker.options.noCategories'),
                      recommended: false
                    },
                    {
                      value: 'individuals',
                      label: t('manageEvent.b2b.aiMatchmaker.options.individuals.label'),
                      desc: t('manageEvent.b2b.aiMatchmaker.options.individuals.desc'),
                      count: attendeeInsights.optInCount ? t('manageEvent.b2b.aiMatchmaker.options.individuals.count', { count: attendeeInsights.optInCount }) : t('manageEvent.b2b.aiMatchmaker.options.noOptIn'),
                      recommended: false
                    }
                  ].map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: matchingSelection === option.value ? 'rgba(6,132,245,0.1)' : 'rgba(255,255,255,0.03)',
                        border: matchingSelection === option.value ? '2px solid #0684F5' : '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMatchingSelection(option.value)}
                    >
                      <input
                        type="radio"
                        name="matching-selection"
                        checked={matchingSelection === option.value}
                        onChange={() => {}}
                        style={{ marginTop: '2px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                            {option.label}
                          </span>
                          {option.recommended && (
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(16,185,129,0.15)',
                                color: '#10B981',
                                fontSize: '10px',
                                fontWeight: 600
                              }}
                            >
                              {t('manageEvent.b2b.aiMatchmaker.options.recommended')}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: option.count ? '4px' : 0 }}>
                          {option.desc}
                        </p>
                        {option.count && (
                          <p style={{ fontSize: '12px', color: '#10B981' }}>
                            {option.count}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Matching Parameters */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.b2b.aiMatchmaker.criteria.title')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Slider
                    label={t('manageEvent.b2b.aiMatchmaker.criteria.industry')}
                    value={industryAlignment}
                    onChange={setIndustryAlignment}
                    helper={t('manageEvent.b2b.aiMatchmaker.criteria.industryDesc')}
                  />
                  <Slider
                    label={t('manageEvent.b2b.aiMatchmaker.criteria.role')}
                    value={roleCompatibility}
                    onChange={setRoleCompatibility}
                    helper={t('manageEvent.b2b.aiMatchmaker.criteria.roleDesc')}
                  />
                  <Slider
                    label={t('manageEvent.b2b.aiMatchmaker.criteria.stage')}
                    value={companyStage}
                    onChange={setCompanyStage}
                    helper={t('manageEvent.b2b.aiMatchmaker.criteria.stageDesc')}
                  />
                  <Slider
                    label={t('manageEvent.b2b.aiMatchmaker.criteria.interests')}
                    value={sharedInterests}
                    onChange={setSharedInterests}
                    helper={t('manageEvent.b2b.aiMatchmaker.criteria.interestsDesc')}
                  />
                  <Slider
                    label={t('manageEvent.b2b.aiMatchmaker.criteria.goals')}
                    value={goalAlignment}
                    onChange={setGoalAlignment}
                    helper={t('manageEvent.b2b.aiMatchmaker.criteria.goalsDesc')}
                  />
                </div>
              </div>

              {/* Step 3: Match Quality Threshold */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.b2b.aiMatchmaker.threshold.title')}
                </p>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                    {minMatchScore}%
                  </p>
                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {t('manageEvent.b2b.aiMatchmaker.threshold.subtitle', { percent: minMatchScore })}
                  </p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #0684F5 0%, #0684F5 ${minMatchScore}%, rgba(255,255,255,0.1) ${minMatchScore}%, rgba(255,255,255,0.1) 100%)`,
                    appearance: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16,185,129,0.15)',
                      color: '#10B981',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {t('manageEvent.b2b.aiMatchmaker.threshold.recommended')}
                  </span>
                </div>
              </div>

              {/* Step 4: Generate Matches */}
              <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(6,132,245,0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <Sparkles size={20} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>
                      {t('manageEvent.b2b.aiMatchmaker.generate.info', { total: attendeeInsights.total || 0, count: Math.max(0, Math.round(attendeeInsights.total * 0.4)) })}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {t('manageEvent.b2b.aiMatchmaker.generate.time')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateMatches}
                  style={{
                    width: '100%',
                    height: '52px',
                    background: 'linear-gradient(135deg, #0684F5 0%, #0EA5E9 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 0 30px rgba(6,132,245,0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(6,132,245,0.7)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(6,132,245,0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Sparkles size={20} />
                  {t('manageEvent.b2b.aiMatchmaker.generate.button')}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Match Preview & Insights */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h4 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('manageEvent.b2b.aiMatchmaker.insights.title')}
              </h4>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
                {t('manageEvent.b2b.aiMatchmaker.insights.subtitle')}
              </p>
              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />

              {/* Insight Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* Insight 1 */}
                <div
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #10B981',
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <TrendingUp size={24} style={{ color: '#10B981', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                      {t('manageEvent.b2b.aiMatchmaker.insights.potential')}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {t('manageEvent.b2b.aiMatchmaker.insights.potentialDesc', { percent: attendeeInsights.potentialPercent })}
                    </p>
                  </div>
                </div>

                {/* Insight 2 */}
                <div
                  style={{
                    backgroundColor: 'rgba(6,132,245,0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0684F5',
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <Briefcase size={24} style={{ color: '#0684F5', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                      {t('manageEvent.b2b.aiMatchmaker.insights.industries')}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(attendeeInsights.topIndustries.length
                        ? attendeeInsights.topIndustries
                        : [{ label: 'No industry data', percentage: 0 }]).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(6,132,245,0.15)',
                            color: '#0684F5',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {tag.label} {tag.percentage ? `${tag.percentage}%` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insight 3 */}
                <div
                  style={{
                    backgroundColor: 'rgba(139,92,246,0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #8B5CF6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Target size={24} style={{ color: '#8B5CF6' }} />
                    <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                      {t('manageEvent.b2b.aiMatchmaker.insights.goals')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(attendeeInsights.topGoals.length
                      ? attendeeInsights.topGoals
                      : [{ label: 'No goal data', percentage: 0 }]).map((goal, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#FFFFFF' }}>{goal.label}</span>
                          <span style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 600 }}>{goal.percentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${goal.percentage}%`, height: '100%', backgroundColor: '#8B5CF6' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Previous Match Summary */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                  {t('manageEvent.b2b.aiMatchmaker.insights.lastRun')}
                </p>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '16px',
                    borderRadius: '8px'
                  }}
                >
                  <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '8px' }}>
                    {lastRunMeta?.at ? formatDateTime(lastRunMeta.at) : t('manageEvent.b2b.aiMatchmaker.insights.noRun')}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginBottom: '4px' }}>
                    {t('manageEvent.b2b.aiMatchmaker.insights.generated', { count: lastRunMeta?.matchesCreated ?? 0 })}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
                    {t('manageEvent.b2b.aiMatchmaker.insights.accepted', { percent: suggestionStats.total ? Math.round((suggestionStats.accepted / suggestionStats.total) * 100) : 0 })}
                  </p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('suggestions');
                    }}
                    style={{ fontSize: '13px', color: '#0684F5', textDecoration: 'none' }}
                  >
                    {t('manageEvent.b2b.aiMatchmaker.insights.viewResults')} →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL MEETINGS */}
        {activeTab === 'all-meetings' && (
          <div>
            {/* Filter Bar */}
            <div
              className="event-b2b__filter-bar"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '20px 24px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div className="event-b2b__filter-tabs" style={{ display: 'flex', gap: '12px' }}>
                {meetingFilters.map((filter, idx) => {
                  const isActive = meetingFilter === filter.key;
                  const label = filter.key === 'all' ? t('manageEvent.b2b.allMeetings.filters.all') :
                               filter.key === 'today' ? t('manageEvent.b2b.allMeetings.filters.today') :
                               filter.key === 'ai' ? t('manageEvent.b2b.allMeetings.filters.ai') :
                               filter.key === 'manual' ? t('manageEvent.b2b.allMeetings.filters.manual') :
                               filter.key === 'pending' ? t('manageEvent.b2b.allMeetings.filters.pending') :
                               filter.key === 'completed' ? t('manageEvent.b2b.allMeetings.filters.completed') : filter.label;
                  return (
                  <button
                    key={idx}
                    onClick={() => setMeetingFilter(filter.key)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isActive ? '#0684F5' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {filter.icon && <Sparkles size={14} />}
                    {label}
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
              </div>

              <div className="event-b2b__filter-actions" style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder={t('manageEvent.b2b.allMeetings.filters.search')}
                  value={meetingSearch}
                  onChange={(e) => setMeetingSearch(e.target.value)}
                  style={{
                    width: '280px',
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
                <select
                  value={meetingDateFilter}
                  onChange={(e) => setMeetingDateFilter(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">{t('manageEvent.b2b.allMeetings.filters.allDates')}</option>
                  <option value="today">{t('manageEvent.b2b.allMeetings.filters.today')}</option>
                  <option value="week">{t('manageEvent.b2b.allMeetings.filters.thisWeek')}</option>
                </select>
                <select
                  value={meetingSort}
                  onChange={(e) => setMeetingSort(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  <option value="recent">{t('manageEvent.b2b.allMeetings.filters.recent')}</option>
                  <option value="score">{t('manageEvent.b2b.allMeetings.filters.score')}</option>
                  <option value="upcoming">{t('manageEvent.b2b.allMeetings.filters.upcoming')}</option>
                </select>
              </div>
            </div>

            {/* Meetings Table */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '16px 24px',
                  display: 'grid',
                  gridTemplateColumns: '40px 150px 1fr 120px 180px 140px 100px',
                  gap: '16px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="checkbox"
                  checked={filteredMeetings.length > 0 && selectedMeetingIds.length === filteredMeetings.length}
                  onChange={(e) => toggleSelectAllMeetings(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.id')}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.participants')}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.score')}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.dateTime')}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.status')}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{t('manageEvent.b2b.allMeetings.table.headers.actions')}</p>
              </div>

              {filteredMeetings.length ? filteredMeetings.map((meeting: any, idx: number) => (
                <div
                  key={meeting.rawId || idx}
                  style={{
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '40px 150px 1fr 120px 180px 140px 100px',
                    gap: '16px',
                    alignItems: 'center',
                    borderBottom: idx < filteredMeetings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={selectedMeetingIds.includes(meeting.rawId)}
                    onChange={(e) => {
                      if (!meeting.rawId) return;
                      toggleMeetingSelection(meeting.rawId, e.target.checked);
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{meeting.id}</p>
                    {meeting.ai && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: '#FFFFFF',
                          fontSize: '9px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Sparkles size={8} />
                        AI
                      </span>
                    )}
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>
                      {meeting.p1} ↔ {meeting.p2}
                    </p>
                    {meeting.tag && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(139,92,246,0.15)',
                          color: '#8B5CF6',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        {meeting.tag}
                      </span>
                    )}
                  </div>

                  <div>
                    {meeting.score > 0 ? (
                      <div
                        onClick={() => {
                          const computedMeta = meeting.matchMeta?.breakdown?.length
                            ? meeting.matchMeta
                            : buildMatchMeta(
                                { meta: meeting.aMeta || {}, ticket_type: meeting.aTicketType || '' },
                                { meta: meeting.bMeta || {}, ticket_type: meeting.bTicketType || '' }
                              );
                          setSelectedPair({
                            aId: meeting.aId,
                            bId: meeting.bId,
                            aName: meeting.p1,
                            bName: meeting.p2,
                            score: meeting.score,
                            meetingId: meeting.rawId,
                            aTitle: meeting.aTitle,
                            bTitle: meeting.bTitle,
                            aCompany: meeting.aCompany,
                            bCompany: meeting.bCompany,
                            tags: computedMeta.tags,
                            breakdown: computedMeta.breakdown,
                            insights: computedMeta.insights,
                            topics: computedMeta.topics
                          });
                          setShowMatchDetails(true);
                        }}
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                      >
                        <p
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: meeting.score >= 90 ? '#10B981' : meeting.score >= 75 ? '#0684F5' : '#F59E0B',
                            marginBottom: '4px'
                          }}
                        >
                          {meeting.score}%
                        </p>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${meeting.score}%`,
                              height: '100%',
                              backgroundColor: meeting.score >= 90 ? '#10B981' : meeting.score >= 75 ? '#0684F5' : '#F59E0B'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{t('manageEvent.b2b.allMeetings.table.manual')}</p>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: '#94A3B8' }}>{meeting.date}</p>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: `${meeting.statusColor}20`,
                      color: meeting.statusColor,
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {meeting.status}
                  </span>

                  <button
                    onClick={() => {
                      const computedMeta = meeting.matchMeta?.breakdown?.length
                        ? meeting.matchMeta
                        : buildMatchMeta(
                            { meta: meeting.aMeta || {}, ticket_type: meeting.aTicketType || '' },
                            { meta: meeting.bMeta || {}, ticket_type: meeting.bTicketType || '' }
                          );
                      setSelectedPair({
                        aId: meeting.aId,
                        bId: meeting.bId,
                        aName: meeting.p1,
                        bName: meeting.p2,
                        score: meeting.score,
                        meetingId: meeting.rawId,
                        aTitle: meeting.aTitle,
                        bTitle: meeting.bTitle,
                        aCompany: meeting.aCompany,
                        bCompany: meeting.bCompany,
                        tags: computedMeta.tags,
                        breakdown: computedMeta.breakdown,
                        insights: computedMeta.insights,
                        topics: computedMeta.topics
                      });
                      setShowMatchDetails(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {t('manageEvent.b2b.allMeetings.table.view')}
                  </button>
                </div>
              )) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                  {t('manageEvent.b2b.allMeetings.table.empty')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <TrendingUp size={80} style={{ color: '#6B7280', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
              {t('manageEvent.b2b.analytics.title')}
            </h3>
            <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '560px', margin: '0 auto 12px' }}>
              {t('manageEvent.b2b.analytics.summary', { total: stats.totalMeetings, avg: stats.avgMatchScore, rate: stats.successRate })}
            </p>
            <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '560px', margin: '0 auto' }}>
              {t('manageEvent.b2b.analytics.topIndustry', { industry: attendeeInsights.topIndustries[0]?.label || 'N/A', goal: attendeeInsights.topGoals[0]?.label || 'N/A' })}
            </p>
          </div>
        )}

        {/* TAB 4: SUGGESTIONS */}
        {activeTab === 'suggestions' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('manageEvent.b2b.suggestions.title')}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {t('manageEvent.b2b.suggestions.subtitle', { count: stats.pendingSuggestions })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {suggestionsData.length ? suggestionsData.map((suggestion: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(6,132,245,0.3)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={10} />
                      {t('manageEvent.b2b.suggestions.card.match')}
                    </span>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                      {suggestion.score}%
                    </p>
                  </div>

                  {/* Participants */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                      <img
                        src={suggestion.aPhoto}
                        alt="Person"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {suggestion.aName}
                        </p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                          {suggestion.aTitle}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          {suggestion.aCompany}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '12px 0' }}>
                      <Handshake size={32} style={{ color: '#0684F5', margin: '0 auto' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={suggestion.bPhoto}
                        alt="Person"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {suggestion.bName}
                        </p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                          {suggestion.bTitle}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          {suggestion.bCompany}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                      {t('manageEvent.b2b.suggestions.card.why')}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(Array.isArray(suggestion.tags) && suggestion.tags.length ? suggestion.tags : [t('manageEvent.b2b.suggestions.card.noCriteria')]).map((tag: any, tagIdx: number) => (
                        <span
                          key={tagIdx}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            backgroundColor: tagIdx === 0 ? 'rgba(6,132,245,0.15)' : tagIdx === 1 ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                            color: tagIdx === 0 ? '#0684F5' : tagIdx === 1 ? '#8B5CF6' : '#10B981',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => {
                        setSelectedPair({
                          aId: suggestion.aId,
                          bId: suggestion.bId,
                          aName: suggestion.aName,
                          bName: suggestion.bName,
                          score: suggestion.score,
                          suggestionId: suggestion.id,
                          aTitle: suggestion.aTitle,
                          bTitle: suggestion.bTitle,
                          aCompany: suggestion.aCompany,
                          bCompany: suggestion.bCompany,
                          tags: suggestion.tags,
                          breakdown: suggestion.breakdown,
                          insights: suggestion.insights,
                          topics: suggestion.topics
                        });
                        setShowCreateMeeting(true);
                      }}
                      style={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: '#0684F5',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      {t('manageEvent.b2b.suggestions.card.createMeeting')}
                    </button>
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#6B7280',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('manageEvent.b2b.suggestions.card.dismiss')}
                    </button>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '12px', textAlign: 'center' }}>
                    {suggestion.createdAt ? t('manageEvent.b2b.suggestions.card.sent', { date: formatDateTime(suggestion.createdAt) }) : t('manageEvent.b2b.suggestions.card.sentRecently')}
                  </p>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                  {t('manageEvent.b2b.suggestions.empty')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI PROCESSING MODAL */}
      {showAIProcessing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
        >
          <div
            style={{
              width: '700px',
              backgroundColor: '#1E3A5F',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            {processingState === 'analyzing' && (
              <>
                <Sparkles
                  size={80}
                  style={{
                    color: '#EC4899',
                    margin: '0 auto 24px',
                    filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.6))',
                    animation: 'spin 3s linear infinite'
                  }}
                />
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.b2b.modals.processing.analyzing.title')}
                </h2>
                <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px' }}>
                  {t('manageEvent.b2b.modals.processing.analyzing.subtitle', { count: attendeeInsights.total || 0 })}
                </p>
              </>
            )}

            {processingState === 'generating' && (
              <>
                <Brain
                  size={80}
                  style={{
                    color: '#0684F5',
                    margin: '0 auto 24px',
                    filter: 'drop-shadow(0 0 20px rgba(6,132,245,0.6))',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.b2b.modals.processing.generating.title')}
                </h2>
                <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px' }}>
                  {t('manageEvent.b2b.modals.processing.generating.subtitle')}
                </p>
              </>
            )}

            {processingState === 'complete' && (
              <>
                <CheckCircle
                  size={100}
                  style={{
                    color: '#10B981',
                    margin: '0 auto 24px',
                    filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.6))'
                  }}
                />
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.b2b.modals.processing.complete.title')}
                </h2>
                <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px' }}>
                  {t('manageEvent.b2b.modals.processing.complete.subtitle')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  {[
                    { icon: Sparkles, label: t('manageEvent.b2b.modals.processing.complete.stats.created'), value: String(aiRunStats.matchesCreated || 0), color: '#EC4899' },
                    { icon: TrendingUp, label: t('manageEvent.b2b.modals.processing.complete.stats.avgScore'), value: `${aiRunStats.avgScore || 0}%`, color: '#10B981' },
                    { icon: Users, label: t('manageEvent.b2b.modals.processing.complete.stats.matched'), value: String(aiRunStats.attendeesMatched || 0), color: '#0684F5' }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          padding: '20px',
                          borderRadius: '12px'
                        }}
                      >
                        <Icon size={32} style={{ color: stat.color, margin: '0 auto 12px' }} />
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                          {stat.label}
                        </p>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCompleteMatching}
                    style={{
                      flex: 1,
                      height: '48px',
                      background: 'linear-gradient(135deg, #0684F5 0%, #0EA5E9 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {t('manageEvent.b2b.modals.processing.complete.actions.viewAll')}
                    <ArrowUp size={18} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <button
                    style={{
                      flex: 1,
                      height: '48px',
                      backgroundColor: 'transparent',
                      border: '1px solid #FFFFFF',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={handleSendMatchBatchNotification}
                  >
                    <Send size={18} />
                    {t('manageEvent.b2b.modals.processing.complete.actions.sendNotif')}
                  </button>
                </div>
              </>
            )}

            {processingState !== 'complete' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
                    {progress}%
                  </p>
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0684F5 0%, #EC4899 100%)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                  {processingState === 'analyzing' ? t('manageEvent.b2b.modals.processing.progress.analyzing') : t('manageEvent.b2b.modals.processing.progress.generating')}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                  {t('manageEvent.b2b.modals.processing.progress.remaining', { count: Math.max(0, Math.ceil((100 - progress) / 5 * 1.5)) })}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI MATCH DETAILS MODAL */}
      {showMatchDetails && (
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
          onClick={() => setShowMatchDetails(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '900px',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Sparkles size={32} style={{ color: '#EC4899' }} />
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
                    {t('manageEvent.b2b.modals.details.title')}
                  </h2>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16,185,129,0.15)',
                      color: '#10B981',
                      fontSize: '16px',
                      fontWeight: 700
                    }}
                  >
                    {t('manageEvent.b2b.modals.details.score', { percent: matchScore })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowMatchDetails(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '60% 40%', gap: '32px' }}>
              {/* Left Column */}
              <div>
                {/* Participants */}
                <div style={{ marginBottom: '24px' }}>
                  {/* Participant details would go here */}
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('manageEvent.b2b.modals.details.breakdown')}
                  </p>

                  {(matchBreakdown.length
                    ? matchBreakdown
                    : [{ label: t('manageEvent.b2b.modals.details.noDetails'), score: 0, detail: '' }]
                  ).map((criterion: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{criterion.label}</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: criterion.score >= 90 ? '#10B981' : '#0684F5' }}>
                          {criterion.score}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div
                          style={{
                            width: `${criterion.score}%`,
                            height: '100%',
                            backgroundColor: criterion.score >= 90 ? '#10B981' : '#0684F5'
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>{criterion.detail}</p>
                    </div>
                  ))}

                  <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                      {t('manageEvent.b2b.modals.details.overall', { percent: matchScore })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div
                  style={{
                    backgroundColor: 'rgba(236,72,153,0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}
                >
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} style={{ color: '#EC4899' }} />
                    {t('manageEvent.b2b.modals.details.insights')}
                  </p>

                  {(matchInsights.length ? matchInsights : [t('manageEvent.b2b.modals.details.noInsights')]).map((insight: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {typeof insight === 'string' ? insight : insight.title}
                      </p>
                      {typeof insight === 'string' ? null : (
                        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                          {insight.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
                    {t('manageEvent.b2b.modals.details.topics')}
                  </p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                    {(matchTopics.length ? matchTopics : [t('manageEvent.b2b.modals.details.noTopics')]).map((topic: any, idx: number) => (
                      <li key={idx} style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setShowMatchDetails(false);
                      setShowCreateMeeting(true);
                    }}
                    style={{
                      width: '100%',
                      height: '44px',
                      backgroundColor: '#0684F5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {t('manageEvent.b2b.modals.details.actions.schedule')}
                  </button>
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={handleSendMatchNotification}
                  >
                    {t('manageEvent.b2b.modals.details.actions.sendBoth')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {showCreateMeeting && (
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
          onClick={() => setShowCreateMeeting(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '700px',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  {t('manageEvent.b2b.modals.create.title')}
                </h2>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={10} />
                  {t('manageEvent.b2b.modals.create.matchInfo', { percent: matchScore })}
                </span>
              </div>
              <button
                onClick={() => setShowCreateMeeting(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(236,72,153,0.1)',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} style={{ color: '#EC4899' }} />
                <p style={{ fontSize: '13px', color: '#FFFFFF' }}>
                  {t('manageEvent.b2b.modals.create.perfectMatch', { tags: selectedPair?.tags?.length
                    ? selectedPair.tags.slice(0, 3).join(', ')
                    : matchTopics.length
                      ? matchTopics.slice(0, 3).join(', ')
                      : 'Meeting alignment' })}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>
                    {t('manageEvent.b2b.modals.create.fields.dateTime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={createMeetingDateTime}
                    onChange={(e) => setCreateMeetingDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>
                    {t('manageEvent.b2b.modals.create.fields.duration')}
                  </label>
                  <select
                    value={createMeetingDuration}
                    onChange={(e) => setCreateMeetingDuration(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px'
                    }}
                  >
                    <option value="30">{t('manageEvent.b2b.modals.create.durations.m30')}</option>
                    <option value="45">{t('manageEvent.b2b.modals.create.durations.m45')}</option>
                    <option value="60">{t('manageEvent.b2b.modals.create.durations.m60')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>
                    {t('manageEvent.b2b.modals.create.fields.location')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('manageEvent.b2b.modals.create.placeholders.location')}
                    value={createMeetingLocation}
                    onChange={(e) => setCreateMeetingLocation(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCreateMeeting(false)}
                  style={{
                    flex: 1,
                    height: '44px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('manageEvent.b2b.modals.create.actions.cancel')}
                </button>
                <button
                  onClick={createMeeting}
                  style={{
                    flex: 2,
                    height: '44px',
                    backgroundColor: '#0684F5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={18} />
                  {t('manageEvent.b2b.modals.create.actions.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: #0684F5;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(6,132,245,0.5);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #0684F5;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(6,132,245,0.5);
          }
        `}
      </style>
    </div>
  );
}
