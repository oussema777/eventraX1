import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Calendar, 
  UserPlus, 
  Sparkles,
  Video,
  MapPin,
  Clock,
  Users,
  Mail,
  X,
  Check,
  ChevronDown,
  MessageSquare,
  Trash2,
  Target,
  Building2,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';
import { useMessageThread } from '../../hooks/useMessageThread';

const MATCHES_TABLE = 'b2b_matches';
const REQUESTS_TABLE = 'b2b_requests';
const CONNECTIONS_TABLE = 'b2b_connections';
const MEETINGS_TABLE = 'b2b_meetings';

type TabType = 'schedule' | 'matches' | 'requests' | 'connections';

interface Meeting {
  id: string;
  time: string;
  name: string;
  avatar?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  type: 'video' | 'in-person';
  event: string;
  profileId: string;
  eventId?: string | null;
  startAt?: string | null;
  meetingUrl?: string;
  organizerId?: string;
  meetingFormat?: 'video' | 'in-person' | 'hybrid';
}

interface Match {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  score: number;
  reason: string;
  tags: string[];
  status: 'new' | 'pending' | 'dismissed';
  requestStatus?: Request['status'];
  profileId: string;
  eventId?: string | null;
}

interface Request {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  message: string;
  date: string;
  type: 'received' | 'sent';
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'cancelled';
  profileId: string;
  eventId?: string | null;
}

interface Connection {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  dateConnected: string;
  event: string;
  profileId: string;
  eventId?: string | null;
}

export default function UserB2BCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [showSentRequests, setShowSentRequests] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [eventOptions, setEventOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [currentUserName, setCurrentUserName] = useState(t('networking.defaults.someone'));
  const didGenerateMatchesRef = useRef(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTarget, setMeetingTarget] = useState<{ profileId: string; name: string } | null>(null);
  const [meetingType, setMeetingType] = useState<'video' | 'in-person' | 'hybrid' | ''>('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingEventId, setMeetingEventId] = useState<string | null>(null);
  const [meetingSessionId, setMeetingSessionId] = useState<string | null>(null);
  const [meetingEditId, setMeetingEditId] = useState<string | null>(null);
  const [eventFilterCountry, setEventFilterCountry] = useState('');
  const [eventFilterDate, setEventFilterDate] = useState('');
  const [eventCatalog, setEventCatalog] = useState<Array<{
    id: string;
    name: string;
    startDate?: string | null;
    endDate?: string | null;
    format?: string | null;
    location?: string | null;
    capacity?: number | null;
    attendeeSettings?: any;
  }>>([]);
  const [eventMeetingCounts, setEventMeetingCounts] = useState<Record<string, number>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventSessions, setEventSessions] = useState<Array<{
    id: string;
    eventId: string;
    title: string;
    startsAt?: string | null;
    endsAt?: string | null;
    location?: string | null;
    capacity?: number | null;
    attendees?: number | null;
  }>>([]);
  const { getOrCreateThread, loading: connecting } = useMessageThread();

  const formatTime = (value?: string | null) => {
    if (!value) return t('networking.common.tbd');
    return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatRelative = (value: string) => {
    const diffMs = Date.now() - new Date(value).getTime();
    if (Number.isNaN(diffMs)) return '';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return t('networking.relative.justNow');
    if (minutes < 60) {
      return minutes === 1
        ? t('networking.relative.minute')
        : t('networking.relative.minutes', { count: minutes });
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1
        ? t('networking.relative.hour')
        : t('networking.relative.hours', { count: hours });
    }
    const days = Math.floor(hours / 24);
    return days === 1
      ? t('networking.relative.day')
      : t('networking.relative.days', { count: days });
  };

  const getOtherProfileId = (aId: string, bId: string) => (aId === user?.id ? bId : aId);

  const extractCountry = (location?: string | null) => {
    if (!location) return t('networking.defaults.unknownCountry');
    const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : t('networking.defaults.unknownCountry');
  };

  const toMeetingStatus = (status?: string | null): Meeting['status'] => {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'pending') return 'pending';
    return 'confirmed';
  };

  const getMeetingStatusLabel = (status: Meeting['status']) => {
    if (status === 'confirmed') return t('networking.status.confirmed');
    if (status === 'pending') return t('networking.status.pending');
    return t('networking.status.cancelled');
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#0684F5'; // Blue
    return '#F59E0B'; // Orange
  };

  const loadNetworkingData = async () => {
    if (!user?.id) return;
    try {
      const [
        profileResult,
        matchesResult,
        receivedResult,
        sentResult,
        connectionsResult,
        meetingsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name').eq('id', user.id).single(),
        supabase
          .from(MATCHES_TABLE)
          .select('id, matched_profile_id, event_id, score, reason, tags, status, created_at')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from(REQUESTS_TABLE)
          .select('id, sender_id, recipient_id, event_id, message, status, created_at')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from(REQUESTS_TABLE)
          .select('id, sender_id, recipient_id, event_id, message, status, created_at')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from(CONNECTIONS_TABLE)
          .select('id, profile_a_id, profile_b_id, event_id, created_at')
          .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
          .order('created_at', { ascending: false }),
        supabase
          .from(MEETINGS_TABLE)
          .select('id, organizer_id, profile_a_id, profile_b_id, event_id, start_at, end_at, location, meeting_type, status, meta, created_at')
          .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
          .order('start_at', { ascending: true })
      ]);

      if (profileResult.data?.full_name) {
        setCurrentUserName(profileResult.data.full_name);
      }

      const profileIds = new Set<string>();
      const generatedMatches = await maybeGenerateMatches(matchesResult.data || []);
      const effectiveMatches = (matchesResult.data || []).length > 0 ? matchesResult.data || [] : generatedMatches;

      effectiveMatches.forEach((row: any) => {
        if (row.matched_profile_id) profileIds.add(row.matched_profile_id);
      });
      (receivedResult.data || []).forEach((row: any) => {
        if (row.sender_id) profileIds.add(row.sender_id);
      });
      (sentResult.data || []).forEach((row: any) => {
        if (row.recipient_id) profileIds.add(row.recipient_id);
      });
      (connectionsResult.data || []).forEach((row: any) => {
        const otherId = getOtherProfileId(row.profile_a_id, row.profile_b_id);
        if (otherId) profileIds.add(otherId);
      });
      (meetingsResult.data || []).forEach((row: any) => {
        const otherId = getOtherProfileId(row.profile_a_id, row.profile_b_id);
        if (otherId) profileIds.add(otherId);
      });

      const { data: profilesData } =
        profileIds.size > 0
          ? await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url, job_title, department, company, b2b_profile, professional_data, industry, location, years_experience, company_size')
              .in('id', Array.from(profileIds))
          : { data: [] };

      const profileMap: Record<
        string,
        { name: string; title: string; company: string; avatar?: string }
      > = {};
      const profileLookup: Record<string, any> = {};
      (profilesData || []).forEach((profile: any) => {
        profileLookup[profile.id] = profile;
        profileMap[profile.id] = {
          name: profile.full_name || profile.email || t('networking.defaults.unknownUser'),
          title: profile.job_title || profile.department || profile.company || t('networking.defaults.professional'),
          company: profile.company || '',
          avatar: profile.avatar_url || undefined
        };
      });

      const tokenWeights: Record<string, number> = {};
      const { data: weightProfiles } = await supabase
        .from('profiles')
        .select('id, b2b_profile, professional_data, industry, job_title, department, company, location, years_experience, company_size')
        .neq('id', user.id)
        .limit(80);
      const tokenCounts: Record<string, number> = {};
      const totalProfiles = (weightProfiles || []).length || 1;
      (weightProfiles || []).forEach((profile: any) => {
        const signals = extractProfileSignals(profile);
        [
          ...signals.industries,
          ...signals.interests,
          ...signals.topics,
          ...signals.goals,
          ...signals.skills,
          ...signals.role,
          ...signals.company,
          ...signals.location
        ].forEach((token) => {
          const key = token.toLowerCase();
          tokenCounts[key] = (tokenCounts[key] || 0) + 1;
        });
      });
      Object.entries(tokenCounts).forEach(([token, count]) => {
        const idf = Math.log((totalProfiles + 1) / (count + 1)) + 1;
        tokenWeights[token] = Number(idf.toFixed(3));
      });

      if (effectiveMatches.length > 0) {
        await refreshExistingMatches(profileResult.data, effectiveMatches, tokenWeights, profileLookup);
      }

      const eventIds = new Set<string>();
      [
        ...effectiveMatches,
        ...(receivedResult.data || []),
        ...(sentResult.data || []),
        ...(connectionsResult.data || []),
        ...(meetingsResult.data || [])
      ].forEach((row: any) => {
        if (row.event_id) eventIds.add(row.event_id);
      });

      const { data: eventsData } =
        eventIds.size > 0
          ? await supabase.from('events').select('id, name').in('id', Array.from(eventIds))
          : { data: [] };

      const eventsLookup: Record<string, string> = {};
      (eventsData || []).forEach((event: any) => {
        eventsLookup[event.id] = event.name || 'Event';
      });
      setEventOptions((eventsData || []).map((event: any) => ({ id: event.id, name: event.name || 'Event' })));

      const requestStatusMap = new Map<string, Request['status']>();
      [...(receivedResult.data || []), ...(sentResult.data || [])].forEach((row: any) => {
        const otherId = row.sender_id === user.id ? row.recipient_id : row.sender_id;
        const eventKey = row.event_id || 'none';
        requestStatusMap.set(`${otherId}:${eventKey}`, row.status || 'pending');
      });

      setMatches(
        effectiveMatches.map((row: any) => {
          const profile = profileMap[row.matched_profile_id] || {
            name: t('networking.defaults.unknownUser'),
            title: t('networking.defaults.professional'),
            company: ''
          };
          const eventKey = row.event_id || 'none';
          const requestStatus = requestStatusMap.get(`${row.matched_profile_id}:${eventKey}`);
          const normalizedStatus = requestStatus === 'pending' ? 'pending' : (row.status || 'new');
          return {
            id: row.id,
            profileId: row.matched_profile_id,
            name: profile.name,
            title: profile.title,
            company: profile.company,
            avatar: profile.avatar,
            score: row.score ?? 0,
            reason: row.reason || t('networking.matches.reasonFallback'),
            tags: Array.isArray(row.tags) ? row.tags : [],
            status: normalizedStatus,
            requestStatus,
            eventId: row.event_id || null
          };
        })
      );

      const connectedProfileIds = new Set<string>();
      (connectionsResult.data || []).forEach((row: any) => {
        const otherId = getOtherProfileId(row.profile_a_id, row.profile_b_id);
        if (otherId) connectedProfileIds.add(otherId);
      });

      setReceivedRequests(
        (receivedResult.data || []).map((row: any) => {
          const profile = profileMap[row.sender_id] || {
            name: t('networking.defaults.unknownUser'),
            title: t('networking.defaults.professional'),
            company: ''
          };
          const status = connectedProfileIds.has(row.sender_id) ? 'accepted' : (row.status || 'pending');
          return {
            id: row.id,
            profileId: row.sender_id,
            name: profile.name,
            title: profile.title,
            company: profile.company,
            avatar: profile.avatar,
            message: row.message || t('networking.requests.defaultMessage'),
            date: formatRelative(row.created_at),
            type: 'received',
            status,
            eventId: row.event_id || null
          };
        })
      );

      setSentRequests(
        (sentResult.data || []).map((row: any) => {
          const profile = profileMap[row.recipient_id] || {
            name: t('networking.defaults.unknownUser'),
            title: t('networking.defaults.professional'),
            company: ''
          };
          const status = connectedProfileIds.has(row.recipient_id) ? 'accepted' : (row.status || 'pending');
          return {
            id: row.id,
            profileId: row.recipient_id,
            name: profile.name,
            title: profile.title,
            company: profile.company,
            avatar: profile.avatar,
            message: row.message || t('networking.requests.defaultMessage'),
            date: formatRelative(row.created_at),
            type: 'sent',
            status,
            eventId: row.event_id || null
          };
        })
      );

      const acceptedRequests = [...(receivedResult.data || []), ...(sentResult.data || [])].filter(
        (row: any) => row.status === 'accepted'
      );
      const acceptedConnections = acceptedRequests.map((row: any) => {
        const otherId = row.sender_id === user.id ? row.recipient_id : row.sender_id;
        const profile = profileMap[otherId] || { name: 'Unknown User', title: 'Professional', company: '' };
        return {
          id: row.id,
          profileId: otherId,
          name: profile.name,
          title: profile.title,
          company: profile.company,
          avatar: profile.avatar,
          dateConnected: formatDate(row.created_at),
          event: row.event_id ? eventsLookup[row.event_id] || t('networking.defaults.event') : t('networking.defaults.generalNetworking'),
          eventId: row.event_id || null
        };
      });

      setConnections(
        [
          ...(connectionsResult.data || []).map((row: any) => {
            const otherId = getOtherProfileId(row.profile_a_id, row.profile_b_id);
            const profile = profileMap[otherId] || { name: 'Unknown User', title: 'Professional', company: '' };
            return {
              id: row.id,
              profileId: otherId,
              name: profile.name,
              title: profile.title,
              company: profile.company,
              avatar: profile.avatar,
              dateConnected: formatDate(row.created_at),
              event: row.event_id ? eventsLookup[row.event_id] || t('networking.defaults.event') : t('networking.defaults.generalNetworking'),
              eventId: row.event_id || null
            };
          }),
          ...acceptedConnections
        ].filter((connection, index, all) => {
          return (
            all.findIndex(
              (item) =>
                item.profileId === connection.profileId &&
                (item.eventId || null) === (connection.eventId || null)
            ) === index
          );
        })
      );

      setMeetings(
        (meetingsResult.data || []).map((row: any) => {
          const otherId = getOtherProfileId(row.profile_a_id, row.profile_b_id);
          const profile = profileMap[otherId] || { name: t('networking.defaults.networkingMeeting'), title: '', company: '' };
          const meta = row.meta || {};
          return {
            id: row.id,
            profileId: otherId,
            name: profile.name,
            avatar: profile.avatar,
            time: formatTime(row.start_at),
            status: toMeetingStatus(row.status),
            location:
              row.location ||
              (row.meeting_type === 'video' ? t('networking.meetings.videoCall') : t('networking.common.tbd')),
            type: row.meeting_type === 'in-person' ? 'in-person' : 'video',
            event: row.event_id ? eventsLookup[row.event_id] || t('networking.defaults.event') : t('networking.defaults.generalNetworking'),
            eventId: row.event_id || null,
            startAt: row.start_at,
            meetingUrl: meta.meeting_url || undefined,
            organizerId: row.organizer_id,
            meetingFormat: meta.meeting_format || (row.meeting_type === 'in-person' ? 'in-person' : 'video')
          };
        })
      );
    } catch (error: any) {
      toast.error(error.message || t('networking.errors.loadData'));
    }
  };

  const normalizeTokens = (value: any) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const extractProfileSignals = (profile: any) => {
    const b2b = profile?.b2b_profile || {};
    const professional = profile?.professional_data || {};
    const titleTokens = normalizeTokens(profile?.job_title || '');
    const departmentTokens = normalizeTokens(profile?.department || '');
    const companyTokens = normalizeTokens(profile?.company || '');
    const industryTokens = normalizeTokens(profile?.industry || '');
    const locationTokens = normalizeTokens(profile?.location || '');
    return {
      industries: [
        ...normalizeTokens(b2b.industries || b2b.industries_of_interest || professional.industriesOfInterest),
        ...industryTokens
      ],
      interests: normalizeTokens(b2b.interests || professional.interests),
      topics: normalizeTokens(b2b.meeting_topics || professional.meetingTopics),
      goals: normalizeTokens(b2b.meeting_goals || b2b.lookingFor),
      skills: normalizeTokens(b2b.skills || professional.skills),
      role: [...titleTokens, ...departmentTokens],
      company: companyTokens,
      location: locationTokens,
      yearsExperience: Number(profile?.years_experience || 0),
      companySize: normalizeTokens(profile?.company_size || ''),
      enabled: b2b.enabled !== false
    };
  };

  const calculateMatch = (
    selfSignals: ReturnType<typeof extractProfileSignals>,
    otherSignals: ReturnType<typeof extractProfileSignals>,
    tokenWeights: Record<string, number>,
    seed?: string
  ) => {
    const categories = [
      { key: 'industries', weight: 30 },
      { key: 'interests', weight: 25 },
      { key: 'topics', weight: 20 },
      { key: 'goals', weight: 15 },
      { key: 'skills', weight: 10 },
      { key: 'role', weight: 8 },
      { key: 'company', weight: 6 },
      { key: 'location', weight: 4 }
    ] as const;

    let totalScore = 0;
    let bestCategory: { key: string; shared: string[]; score: number } | null = null;
    const tagSet = new Map<string, string>();

    const toWeightedSet = (tokens: string[]) =>
      tokens.map((token) => ({
        raw: token,
        key: token.toLowerCase(),
        weight: tokenWeights[token.toLowerCase()] || 1
      }));

    categories.forEach((category) => {
      const userTokens = selfSignals[category.key];
      const otherTokens = otherSignals[category.key];
      if (userTokens.length === 0 || otherTokens.length === 0) return;
      const userWeighted = toWeightedSet(userTokens);
      const otherWeighted = toWeightedSet(otherTokens);
      const userMap = new Map(userWeighted.map((item) => [item.key, item]));
      const otherMap = new Map(otherWeighted.map((item) => [item.key, item]));
      const sharedKeys = Array.from(userMap.keys()).filter((token) => otherMap.has(token));
      const shared = sharedKeys.map((key) => otherMap.get(key) || userMap.get(key));
      if (shared.length === 0) return;
      const unionKeys = new Set([...userMap.keys(), ...otherMap.keys()]);
      const weightedIntersection = shared.reduce((sum, item) => sum + (item?.weight || 1), 0);
      const weightedUnion = Array.from(unionKeys).reduce((sum, key) => {
        return sum + (userMap.get(key)?.weight || otherMap.get(key)?.weight || 1);
      }, 0);
      const overlap = weightedUnion === 0 ? 0 : weightedIntersection / weightedUnion;
      const categoryScore = category.weight * overlap;
      totalScore += categoryScore;
      shared.forEach((item) => {
        if (!item) return;
        if (!tagSet.has(item.key)) {
          tagSet.set(item.key, item.raw);
        }
      });
      if (!bestCategory || categoryScore > bestCategory.score) {
        bestCategory = {
          key: category.key,
          shared: shared.map((item) => (item ? item.raw : '')).filter(Boolean),
          score: categoryScore
        };
      }
    });

    let proximityBonus = 0;
    if (selfSignals.yearsExperience && otherSignals.yearsExperience) {
      const diff = Math.abs(selfSignals.yearsExperience - otherSignals.yearsExperience);
      proximityBonus += diff <= 2 ? 6 : diff <= 5 ? 3 : 0;
    }
    if (selfSignals.companySize.length && otherSignals.companySize.length) {
      const overlap = selfSignals.companySize.some((size) =>
        otherSignals.companySize.some((other) => other.toLowerCase() === size.toLowerCase())
      );
      proximityBonus += overlap ? 4 : 0;
    }

    const selfSignalCount =
      selfSignals.industries.length +
      selfSignals.interests.length +
      selfSignals.topics.length +
      selfSignals.goals.length +
      selfSignals.skills.length +
      selfSignals.role.length +
      selfSignals.company.length +
      selfSignals.location.length;
    const otherSignalCount =
      otherSignals.industries.length +
      otherSignals.interests.length +
      otherSignals.topics.length +
      otherSignals.goals.length +
      otherSignals.skills.length +
      otherSignals.role.length +
      otherSignals.company.length +
      otherSignals.location.length;
    const signalBoost = Math.min(12, Math.round((selfSignalCount + otherSignalCount) / 6));
    const baseScore = Math.min(100, Math.round(totalScore + proximityBonus + signalBoost));
    const coveragePenalty =
      selfSignals.industries.length + selfSignals.interests.length + selfSignals.topics.length === 0
        ? 25
        : 0;
    let score = Math.max(10, baseScore - coveragePenalty);
    if (seed) {
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 997;
      }
      const jitter = hash % 7;
      score = Math.min(100, score + jitter);
    }
    const tags = Array.from(tagSet.values()).slice(0, 4);
    let reason = 'Suggested based on your profile details.';
    if (bestCategory && bestCategory.shared.length > 0) {
      const label =
        bestCategory.key === 'industries'
          ? 'industry'
          : bestCategory.key === 'interests'
          ? 'interests'
          : bestCategory.key === 'topics'
          ? 'meeting topics'
          : bestCategory.key === 'goals'
          ? 'networking goals'
          : 'skills';
      const shared = bestCategory.shared.slice(0, 2).join(', ');
      reason = `Shared ${label} in ${shared}.`;
    }

    return { score, tags, reason };
  };

  const maybeGenerateMatches = async (existingMatches: Array<any>) => {
    if (didGenerateMatchesRef.current) return [];
    if (!user?.id || existingMatches.length > 0) return [];

    const { data: selfProfile } = await supabase
      .from('profiles')
      .select('id, full_name, b2b_profile, professional_data, industry, job_title, department, company, location, years_experience, company_size')
      .eq('id', user.id)
      .single();

    const selfSignals = extractProfileSignals(selfProfile);
    if (!selfSignals.enabled) return [];

    const { data: others } = await supabase
      .from('profiles')
      .select('id, full_name, b2b_profile, professional_data, industry, job_title, department, company, location, years_experience, company_size')
      .neq('id', user.id)
      .limit(60);

    const matchesToInsert: Array<any> = [];
    const fallbackCandidates: Array<any> = [];
    const tokenCounts: Record<string, number> = {};
    const totalProfiles = (others || []).length || 1;
    const addTokenCounts = (tokens: string[]) => {
      tokens.forEach((token) => {
        const key = token.toLowerCase();
        tokenCounts[key] = (tokenCounts[key] || 0) + 1;
      });
    };

    (others || []).forEach((profile: any) => {
      const signals = extractProfileSignals(profile);
      if (!signals.enabled) return;
      addTokenCounts([
        ...signals.industries,
        ...signals.interests,
        ...signals.topics,
        ...signals.goals,
        ...signals.skills,
        ...signals.role,
        ...signals.company,
        ...signals.location
      ]);
    });

    const tokenWeights: Record<string, number> = {};
    Object.entries(tokenCounts).forEach(([token, count]) => {
      const idf = Math.log((totalProfiles + 1) / (count + 1)) + 1;
      tokenWeights[token] = Number(idf.toFixed(3));
    });
    (others || []).forEach((profile: any) => {
      const otherSignals = extractProfileSignals(profile);
      if (!otherSignals.enabled) return;
      const { score, tags, reason } = calculateMatch(selfSignals, otherSignals, tokenWeights, `${user.id}:${profile.id}`);
      if (score >= 35) {
        matchesToInsert.push({
          profile_id: user.id,
          matched_profile_id: profile.id,
          score,
          reason,
          tags,
          status: 'new'
        });
      } else {
        const fallbackTags = [
          ...otherSignals.industries,
          ...otherSignals.interests,
          ...otherSignals.topics,
          ...otherSignals.skills,
          ...otherSignals.role
        ]
          .filter(Boolean)
          .slice(0, 3);
        fallbackCandidates.push({
          profile_id: user.id,
          matched_profile_id: profile.id,
          score: Math.max(10, score),
          reason: reason || 'Suggested based on overall profile signals.',
          tags: fallbackTags.length ? fallbackTags : ['Potential fit'],
          status: 'new'
        });
      }
    });

    matchesToInsert.sort((a, b) => b.score - a.score);
    let topMatches = matchesToInsert.slice(0, 12);
    if (topMatches.length === 0) {
      topMatches = fallbackCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }
    if (topMatches.length === 0) return [];

    const { data: inserted, error } = await supabase
      .from(MATCHES_TABLE)
      .insert(topMatches)
      .select('id, matched_profile_id, event_id, score, reason, tags, status, created_at');
    if (error) {
      toast.error(error.message || t('networking.errors.generateMatches'));
      return [];
    }
    didGenerateMatchesRef.current = true;
    return inserted || [];
  };

  const refreshExistingMatches = async (
    selfProfile: any,
    existingMatches: Array<any>,
    tokenWeights: Record<string, number>,
    profileLookup: Record<string, any>
  ) => {
    if (!selfProfile || existingMatches.length === 0) return;
    const scores = existingMatches.map((match) => match.score ?? 0);
    const uniqueScores = new Set(scores);
    if (uniqueScores.size > 2) return;
    const selfSignals = extractProfileSignals(selfProfile);
    const updates: Array<{ id: string; score: number; reason: string; tags: string[] }> = [];
    existingMatches.forEach((match) => {
      const otherProfile = profileLookup[match.matched_profile_id];
      if (!otherProfile) return;
      const otherSignals = extractProfileSignals(otherProfile);
      const { score, tags, reason } = calculateMatch(
        selfSignals,
        otherSignals,
        tokenWeights,
        `${selfProfile.id}:${otherProfile.id}`
      );
      updates.push({ id: match.id, score, reason, tags });
    });
    if (updates.length === 0) return;
    await Promise.all(
      updates.map((update) =>
        supabase
          .from(MATCHES_TABLE)
          .update({ score: update.score, reason: update.reason, tags: update.tags })
          .eq('id', update.id)
      )
    );
  };

  const safeNotify = async (input: Parameters<typeof createNotification>[0]) => {
    try {
      await createNotification(input);
    } catch (error) {
    }
  };

  const loadEventCatalog = async () => {
    setIsLoadingEvents(true);
    try {
      const { data: events } = await supabase
        .from('events')
        .select('id, name, start_date, end_date, event_format, location_address, capacity_limit, attendee_settings')
        .eq('visibility', 'public')
        .order('start_date', { ascending: true })
        .limit(100);

      const filtered = (events || []).filter((event: any) => {
        const settings = event.attendee_settings || {};
        return settings.b2bAccess !== false;
      });

      setEventCatalog(
        filtered.map((event: any) => ({
          id: event.id,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          format: event.event_format,
          location: event.location_address,
          capacity: event.capacity_limit,
          attendeeSettings: event.attendee_settings || {}
        }))
      );

      const eventIds = filtered.map((event: any) => event.id);
      if (eventIds.length > 0) {
        const { data: meetingsData } = await supabase
          .from(MEETINGS_TABLE)
          .select('event_id')
          .in('event_id', eventIds);
        const counts: Record<string, number> = {};
        (meetingsData || []).forEach((row: any) => {
          counts[row.event_id] = (counts[row.event_id] || 0) + 1;
        });
        setEventMeetingCounts(counts);
      } else {
        setEventMeetingCounts({});
      }
    } catch (error: any) {
      toast.error(error.message || t('networking.errors.loadEvents'));
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const openMeetingModal = (
    profileId: string,
    name: string,
    existingMeeting?: Meeting | null,
    defaultEventId?: string | null
  ) => {
    setMeetingTarget({ profileId, name });
    setMeetingType(existingMeeting?.meetingFormat || '');
    if (existingMeeting?.startAt) {
      const date = new Date(existingMeeting.startAt);
      setMeetingDate(date.toISOString().slice(0, 10));
      setMeetingTime(date.toTimeString().slice(0, 5));
    } else {
      setMeetingDate('');
      setMeetingTime('');
    }
    setMeetingEventId(existingMeeting?.eventId || defaultEventId || null);
    setMeetingSessionId(null);
    setMeetingEditId(existingMeeting?.id || null);
    setEventFilterCountry('');
    setEventFilterDate('');
    setIsMeetingModalOpen(true);
    loadEventCatalog();
  };

  const closeMeetingModal = () => {
    setIsMeetingModalOpen(false);
    setMeetingTarget(null);
    setMeetingType('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingEventId(null);
    setMeetingSessionId(null);
    setMeetingEditId(null);
  };

  const handleSubmitMeeting = async () => {
    if (!user?.id || !meetingTarget) return;
    if (!meetingType) {
      toast.error(t('networking.meetings.validation.selectType'));
      return;
    }

    const isVirtual = meetingType === 'video';
    if (isVirtual && (!meetingDate || !meetingTime)) {
      toast.error(t('networking.meetings.validation.selectDateTime'));
      return;
    }
    if (!isVirtual && !meetingEventId) {
      toast.error(t('networking.meetings.validation.selectEvent'));
      return;
    }
    if (!isVirtual && !meetingSessionId) {
      toast.error(t('networking.meetings.validation.selectSlot'));
      return;
    }

    let startAt: Date;
    let endAt: Date;
    let location = t('networking.meetings.videoCall');
    if (isVirtual) {
      startAt = new Date(`${meetingDate}T${meetingTime}:00`);
      if (Number.isNaN(startAt.getTime())) {
        toast.error(t('networking.meetings.validation.invalidDateTime'));
        return;
      }
      endAt = new Date(startAt.getTime() + 30 * 60000);
    } else {
      const slot = eventSessions.find((session) => session.id === meetingSessionId);
      if (!slot?.startsAt) {
        toast.error(t('networking.meetings.validation.slotNoTime'));
        return;
      }
      startAt = new Date(slot.startsAt);
      endAt = slot.endsAt ? new Date(slot.endsAt) : new Date(startAt.getTime() + 30 * 60000);
      location =
        slot.location ||
        eventCatalog.find((event) => event.id === meetingEventId)?.location ||
        t('networking.defaults.onSite');
      if (slot.capacity && slot.attendees && slot.attendees >= slot.capacity) {
        toast.error(t('networking.meetings.validation.slotFull'));
        return;
      }
    }

    const payload = {
      organizer_id: user.id,
      profile_a_id: user.id,
      profile_b_id: meetingTarget.profileId,
      event_id: isVirtual ? null : meetingEventId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      meeting_type: isVirtual ? 'video' : 'in-person',
      location,
      status: 'pending',
      meta: {
        meeting_format: meetingType,
        session_id: isVirtual ? null : meetingSessionId
      }
    };

    if (meetingEditId) {
      const { error } = await supabase.from(MEETINGS_TABLE).update(payload).eq('id', meetingEditId);
      if (error) {
        toast.error(error.message || t('networking.errors.rescheduleMeeting'));
        return;
      }
    } else {
      const { error } = await supabase.from(MEETINGS_TABLE).insert([payload]);
      if (error) {
        toast.error(error.message || t('networking.errors.scheduleMeeting'));
        return;
      }
    }

    await safeNotify({
      recipient_id: meetingTarget.profileId,
      type: 'action',
      title: meetingEditId ? t('networking.notifications.meetingRescheduled.title') : t('networking.notifications.meetingRequested.title'),
      body: meetingEditId
        ? t('networking.notifications.meetingRescheduled.body', { name: currentUserName })
        : t('networking.notifications.meetingRequested.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user.id
    });
    toast.success(meetingEditId ? t('networking.toasts.meetingRescheduled') : t('networking.toasts.meetingRequested'));
    closeMeetingModal();
    await loadNetworkingData();
  };

  const handleCancelMeeting = async (meetingId: string, profileId: string) => {
    await supabase.from(MEETINGS_TABLE).update({ status: 'cancelled' }).eq('id', meetingId);
    await safeNotify({
      recipient_id: profileId,
      type: 'action',
      title: t('networking.notifications.meetingCancelled.title'),
      body: t('networking.notifications.meetingCancelled.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user?.id || null
    });
    toast.success(t('networking.toasts.meetingCancelled'));
    await loadNetworkingData();
  };

  const handleConfirmMeeting = async (meetingId: string, profileId: string) => {
    await supabase.from(MEETINGS_TABLE).update({ status: 'confirmed' }).eq('id', meetingId);
    await safeNotify({
      recipient_id: profileId,
      type: 'action',
      title: t('networking.notifications.meetingConfirmed.title'),
      body: t('networking.notifications.meetingConfirmed.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user?.id || null
    });
    toast.success(t('networking.toasts.meetingConfirmed'));
    await loadNetworkingData();
  };

  const handleDeclineMeeting = async (meetingId: string, profileId: string) => {
    await supabase.from(MEETINGS_TABLE).update({ status: 'cancelled' }).eq('id', meetingId);
    await safeNotify({
      recipient_id: profileId,
      type: 'action',
      title: t('networking.notifications.meetingDeclined.title'),
      body: t('networking.notifications.meetingDeclined.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user?.id || null
    });
    toast.success(t('networking.toasts.meetingDeclined'));
    await loadNetworkingData();
  };

  useEffect(() => {
    loadNetworkingData();
  }, [user?.id, t]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = window.setInterval(loadNetworkingData, 10000);
    return () => window.clearInterval(interval);
  }, [user?.id, t]);

  const handleConnect = async (matchId: string) => {
    if (!user?.id) return;
    const match = matches.find((item) => item.id === matchId);
    if (!match) return;
    const { error: insertError } = await supabase.from(REQUESTS_TABLE).insert([
      {
        sender_id: user.id,
        recipient_id: match.profileId,
        event_id: match.eventId,
        message: t('networking.requests.defaultMessage'),
        status: 'pending'
      }
    ]);
    if (insertError) {
      toast.error(insertError.message || t('networking.errors.sendRequest'));
      return;
    }
    await supabase.from(MATCHES_TABLE).update({ status: 'pending' }).eq('id', matchId);
    await safeNotify({
      recipient_id: match.profileId,
      type: 'action',
      title: t('networking.notifications.newRequest.title'),
      body: t('networking.notifications.newRequest.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user.id
    });
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: 'pending' } : m)));
    toast.success(t('networking.toasts.requestSent'));
  };

  const handleDismiss = async (matchId: string) => {
    await supabase.from(MATCHES_TABLE).update({ status: 'dismissed' }).eq('id', matchId);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: 'dismissed' } : m)));
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) return;
    const request = receivedRequests.find((item) => item.id === requestId);
    if (!request) return;
    await supabase.from(REQUESTS_TABLE).update({ status: 'accepted' }).eq('id', requestId);
    const [profileA, profileB] = [user.id, request.profileId].sort();
    await supabase.from(CONNECTIONS_TABLE).upsert(
      [{ profile_a_id: profileA, profile_b_id: profileB, event_id: request.eventId }],
      { onConflict: 'profile_a_id,profile_b_id' }
    );
    await safeNotify({
      recipient_id: request.profileId,
      type: 'action',
      title: t('networking.notifications.connectionAccepted.title'),
      body: t('networking.notifications.connectionAccepted.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user.id
    });
    await loadNetworkingData();
  };

  const handleDeclineRequest = async (requestId: string) => {
    const request = receivedRequests.find((item) => item.id === requestId);
    await supabase.from(REQUESTS_TABLE).update({ status: 'declined' }).eq('id', requestId);
    if (request?.profileId) {
      await safeNotify({
        recipient_id: request.profileId,
        type: 'action',
        title: t('networking.notifications.connectionDeclined.title'),
        body: t('networking.notifications.connectionDeclined.body', { name: currentUserName }),
        action_url: '/my-networking',
        actor_id: user?.id || null
      });
    }
    await loadNetworkingData();
  };

  const handleWithdrawRequest = async (requestId: string) => {
    if (!user?.id) return;
    const request = sentRequests.find((item) => item.id === requestId);
    await supabase.from(REQUESTS_TABLE).update({ status: 'withdrawn' }).eq('id', requestId);
    if (request?.profileId) {
      let senderQuery = supabase
        .from(MATCHES_TABLE)
        .update({ status: 'new' })
        .eq('profile_id', user.id)
        .eq('matched_profile_id', request.profileId);
      let recipientQuery = supabase
        .from(MATCHES_TABLE)
        .update({ status: 'new' })
        .eq('profile_id', request.profileId)
        .eq('matched_profile_id', user.id);
      if (request.eventId) {
        senderQuery = senderQuery.eq('event_id', request.eventId);
        recipientQuery = recipientQuery.eq('event_id', request.eventId);
      } else {
        senderQuery = senderQuery.is('event_id', null);
        recipientQuery = recipientQuery.is('event_id', null);
      }
      await Promise.all([senderQuery, recipientQuery]);
      setMatches((prev) =>
        prev.map((match) =>
          match.profileId === request.profileId &&
          (request.eventId ? match.eventId === request.eventId : !match.eventId)
            ? { ...match, status: 'new' }
            : match
        )
      );
    }
    await loadNetworkingData();
  };

  const handleScheduleMeeting = (profileId: string, defaultEventId?: string | null) => {
    const name = profileNameMap.get(profileId) || t('networking.defaults.user');
    const existing = meetingByProfileId.get(profileId) || null;
    openMeetingModal(profileId, name, existing, defaultEventId);
  };

  const handleRemoveConnection = async (connectionId: string, profileId: string) => {
    await supabase.from(CONNECTIONS_TABLE).delete().eq('id', connectionId);
    await safeNotify({
      recipient_id: profileId,
      type: 'action',
      title: t('networking.notifications.connectionRemoved.title'),
      body: t('networking.notifications.connectionRemoved.body', { name: currentUserName }),
      action_url: '/my-networking',
      actor_id: user?.id || null
    });
    await loadNetworkingData();
  };

  const handleMessage = async (profileId: string) => {
    if (connecting) return;
    const threadId = await getOrCreateThread(profileId);
    if (threadId) {
      navigate('/messages', { state: { threadId } });
    }
  };

  const handleViewProfile = (profileId: string) => {
    if (!profileId) return;
    navigate(`/profile/${profileId}`);
  };

  const handleJoinCall = (meeting: Meeting) => {
    if (meeting.meetingUrl) {
      window.open(meeting.meetingUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(t('networking.errors.noMeetingLink'));
    }
  };

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter((meeting) => {
      if (!meeting.startAt) return false;
      if (selectedEvent !== 'all' && meeting.eventId !== selectedEvent) return false;
      if (!showPastMeetings && meeting.startAt) {
        return new Date(meeting.startAt) >= now;
      }
      return true;
    });
  }, [meetings, selectedEvent, showPastMeetings]);

  const meetingsTodayCount = useMemo(() => {
    const today = new Date();
    return meetings.filter((meeting) => {
      if (!meeting.startAt) return false;
      const date = new Date(meeting.startAt);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate() &&
        meeting.status !== 'cancelled'
      );
    }).length;
  }, [meetings]);

  const meetingByProfileId = useMemo(() => {
    const map = new Map<string, Meeting>();
    meetings.forEach((meeting) => {
      if (meeting.status === 'cancelled') return;
      if (!map.has(meeting.profileId)) {
        map.set(meeting.profileId, meeting);
      }
    });
    return map;
  }, [meetings]);

  const profileNameMap = useMemo(() => {
    const map = new Map<string, string>();
    matches.forEach((match) => map.set(match.profileId, match.name));
    connections.forEach((connection) => map.set(connection.profileId, connection.name));
    receivedRequests.forEach((request) => map.set(request.profileId, request.name));
    sentRequests.forEach((request) => map.set(request.profileId, request.name));
    meetings.forEach((meeting) => map.set(meeting.profileId, meeting.name));
    return map;
  }, [matches, connections, receivedRequests, sentRequests, meetings]);

  const eventCountries = useMemo(() => {
    const set = new Set<string>();
    eventCatalog.forEach((event) => {
      set.add(extractCountry(event.location));
    });
    return Array.from(set).filter(Boolean);
  }, [eventCatalog, t]);

  const filteredEventCatalog = useMemo(() => {
    if (!meetingType || meetingType === 'video') return [];
    return eventCatalog.filter((event) => {
      const format = (event.format || '').toLowerCase();
      if (format && (format === 'online' || format === 'virtual')) return false;
      if (eventFilterCountry && extractCountry(event.location) !== eventFilterCountry) return false;
      if (eventFilterDate && event.startDate) {
        const eventDate = new Date(event.startDate).toISOString().slice(0, 10);
        if (eventDate !== eventFilterDate) return false;
      }
      return true;
    });
  }, [eventCatalog, meetingType, eventFilterCountry, eventFilterDate, t]);

  const filteredEventSessions = useMemo(() => {
    if (!meetingEventId) return [];
    return eventSessions
      .filter((session) => session.eventId === meetingEventId)
      .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''));
  }, [eventSessions, meetingEventId]);

  useEffect(() => {
    const loadSessions = async () => {
      if (!meetingEventId || meetingType === 'video') {
        setEventSessions([]);
        return;
      }
      const { data } = await supabase
        .from('event_sessions')
        .select('id, event_id, title, starts_at, ends_at, location, capacity, attendees')
        .eq('event_id', meetingEventId)
        .eq('status', 'confirmed')
        .order('starts_at', { ascending: true });
      setEventSessions(
        (data || []).map((session: any) => ({
          id: session.id,
          eventId: session.event_id,
          title: session.title,
          startsAt: session.starts_at,
          endsAt: session.ends_at,
          location: session.location,
          capacity: session.capacity,
          attendees: session.attendees
        }))
      );
    };
    loadSessions();
  }, [meetingEventId, meetingType]);

  const visibleReceivedRequests = useMemo(
    () => receivedRequests.filter((request) => request.status === 'pending'),
    [receivedRequests]
  );
  const visibleSentRequests = useMemo(
    () => sentRequests.filter((request) => request.status === 'pending'),
    [sentRequests]
  );

  const newMatchesCount = useMemo(() => matches.filter(m => m.status === 'new').length, [matches]);
  const pendingRequestsCount = useMemo(
    () => visibleReceivedRequests.length,
    [visibleReceivedRequests]
  );

  return (
    <div className="networking-hub" style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      {/* Hero Header */}
      <div 
        className="networking-hub__hero relative"
        style={{ 
          background: 'linear-gradient(180deg, rgba(6,132,245,0.1) 0%, transparent 100%)',
          padding: '40px 40px 20px 40px'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="mb-8">
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('networking.title')}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('networking.subtitle')}
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="networking-hub__stats grid grid-cols-3 gap-6">
            {/* Meetings Today */}
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(6, 132, 245, 0.2)'
                  }}
                >
                  <Calendar size={28} style={{ color: '#0684F5' }} />
                </div>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                    {meetingsTodayCount}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                    {t('networking.stats.meetingsToday')}
                  </p>
                </div>
              </div>
            </div>

            {/* New Requests */}
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <UserPlus size={28} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                    {pendingRequestsCount}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                    {t('networking.stats.newRequests')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Matches */}
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)'
                  }}
                >
                  <Sparkles size={28} style={{ color: '#A855F7' }} />
                </div>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                    {newMatchesCount}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                    {t('networking.stats.newMatches')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="networking-hub__main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 40px 80px 40px' }}>
        {/* Tab Navigation */}
        <div 
          className="networking-hub__tabs flex items-center gap-8 mb-8"
          style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={() => setActiveTab('schedule')}
            className="pb-4 transition-colors relative"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'schedule' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('networking.tabs.schedule')}
            {activeTab === 'schedule' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#0684F5'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className="pb-4 transition-colors relative flex items-center gap-2"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'matches' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('networking.tabs.matches')}
            {newMatchesCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#A855F7',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {newMatchesCount} New
              </span>
            )}
            {activeTab === 'matches' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#0684F5'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className="pb-4 transition-colors relative flex items-center gap-2"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'requests' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('networking.tabs.requests')}
            {pendingRequestsCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {pendingRequestsCount}
              </span>
            )}
            {activeTab === 'requests' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#0684F5'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className="pb-4 transition-colors relative"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'connections' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {t('networking.tabs.connections')}
            {activeTab === 'connections' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#0684F5'
                }}
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <div>
            {/* Filters */}
            <div className="networking-hub__filters flex items-center gap-4 mb-6">
              <div className="relative">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="px-4 py-2 rounded-lg border outline-none appearance-none pr-10"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    minWidth: '200px'
                  }}
                >
                  <option value="all">{t('networking.filters.allEvents')}</option>
                  {eventOptions.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#94A3B8' }}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPastMeetings}
                  onChange={(e) => setShowPastMeetings(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#0684F5' }}
                />
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('networking.filters.showPastMeetings')}
                </span>
              </label>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {filteredMeetings.map((meeting) => (
                <div key={meeting.id} className="networking-hub__meeting-row flex gap-6">
                  {/* Time */}
                  <div className="flex-shrink-0" style={{ width: '100px' }}>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#94A3B8' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                        {meeting.time}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Card */}
                  <div 
                    className="flex-1 rounded-xl p-5"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="networking-hub__meeting-header flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 networking-hub__meeting-info">
                        {/* Avatar */}
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'rgba(6, 132, 245, 0.2)',
                            border: '2px solid #0684F5'
                          }}
                        >
                          <Users size={24} style={{ color: '#0684F5' }} />
                        </div>

                        <div className="networking-hub__meeting-details">
                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                            {meeting.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span
                              className="px-2 py-1 rounded"
                              style={{
                                backgroundColor: 
                                  meeting.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' :
                                  meeting.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                                  'rgba(239, 68, 68, 0.2)',
                                color:
                                  meeting.status === 'confirmed' ? '#10B981' :
                                  meeting.status === 'pending' ? '#F59E0B' :
                                  '#EF4444',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            >
                              {getMeetingStatusLabel(meeting.status)}
                            </span>
                            <div className="flex items-center gap-1.5" style={{ color: '#94A3B8', fontSize: '13px' }}>
                              {meeting.type === 'video' ? (
                                <><Video size={14} /> {t('networking.meetings.videoCall')}</>
                              ) : (
                                <><MapPin size={14} /> {meeting.location}</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {meeting.type === 'video' && (
                          <button
                            onClick={() => handleJoinCall(meeting)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            style={{
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 600
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                          >
                            <Video size={14} />
                            {t('networking.actions.joinCall')}
                          </button>
                        )}
                        {meeting.status === 'pending' && meeting.organizerId !== user?.id && (
                          <>
                            <button
                              onClick={() => handleConfirmMeeting(meeting.id, meeting.profileId)}
                              className="px-4 py-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: '#0684F5',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: 600
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0570D6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#0684F5';
                              }}
                            >
                              {t('networking.actions.confirm')}
                            </button>
                            <button
                              onClick={() => handleDeclineMeeting(meeting.id, meeting.profileId)}
                              className="px-4 py-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#94A3B8',
                                fontSize: '13px',
                                fontWeight: 500,
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#94A3B8';
                              }}
                            >
                              {t('networking.actions.decline')}
                            </button>
                          </>
                        )}
                        {meeting.status === 'pending' && meeting.organizerId === user?.id && (
                          <button
                            onClick={() => handleCancelMeeting(meeting.id, meeting.profileId)}
                            className="px-4 py-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }}
                          >
                            {t('networking.actions.cancel')}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewProfile(meeting.profileId)}
                          className="px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          {t('networking.actions.viewProfile')}
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {t('networking.labels.event', { event: meeting.event })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
              {t('networking.matches.subtitle')}
            </p>

            <div className="networking-hub__matches-grid grid grid-cols-3 gap-6">
              {matches.filter(m => m.status !== 'dismissed').map((match) => {
                const existingMeeting = meetingByProfileId.get(match.profileId);
                const requestedByThem =
                  existingMeeting && existingMeeting.organizerId && existingMeeting.organizerId !== user?.id;
                const requestStatus = match.requestStatus;
                const showConnect = !requestStatus || requestStatus === 'withdrawn';
                const showPending = requestStatus === 'pending';
                const showConnected = requestStatus === 'accepted';
                const showClosed = requestStatus === 'declined' || requestStatus === 'cancelled';
                return (
                  <div
                    key={match.id}
                    className="rounded-xl p-5 transition-all"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                  {/* Match Score */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: `${getMatchColor(match.score)}20`,
                        border: `2px solid ${getMatchColor(match.score)}`
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: 700, color: getMatchColor(match.score) }}>
                        {match.score}%
                      </span>
                    </div>

                    {showPending && (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: '#F59E0B',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        {t('networking.status.pending')}
                      </span>
                    )}
                  </div>

                  {/* Profile */}
                  <div className="mb-4">
                    <div
                      className="mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '2px solid #0684F5'
                      }}
                    >
                      <Users size={28} style={{ color: '#0684F5' }} />
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px', textAlign: 'center' }}>
                      {match.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px', textAlign: 'center' }}>
                      {match.title}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                      {match.company}
                    </p>
                  </div>

                  {/* Match Reason */}
                  <div 
                    className="mb-4 p-3 rounded-lg flex items-start gap-2"
                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                  >
                    <Sparkles size={14} style={{ color: '#A855F7', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.4' }}>
                      {match.reason}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.15)',
                          color: '#0684F5',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  {existingMeeting ? (
                    <div className="space-y-2">
                      {showConnect && (
                        <button
                          onClick={() => handleConnect(match.id)}
                          className="w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: '#0684F5',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                        >
                          <UserPlus size={14} />
                          {t('networking.actions.connect')}
                        </button>
                      )}
                      {showConnected && (
                        <div
                          className="px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'center'
                          }}
                        >
                          {t('networking.status.connected')}
                        </div>
                      )}
                      {showClosed && (
                        <div
                          className="px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'center'
                          }}
                        >
                          {t('networking.status.requestClosed')}
                        </div>
                      )}
                      {requestedByThem && (
                        <div
                          className="px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(168, 85, 247, 0.15)',
                            color: '#C4B5FD',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'center'
                          }}
                        >
                          {t('networking.matches.requestedByThem')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 networking-hub__meeting-actions">
                        {requestedByThem ? (
                          <>
                            <button
                              className="flex-1 py-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: '#0684F5',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                              onClick={() => handleConfirmMeeting(existingMeeting.id, match.profileId)}
                            >
                              {t('networking.actions.confirm')}
                            </button>
                            <button
                              onClick={() => handleDeclineMeeting(existingMeeting.id, match.profileId)}
                              className="flex-1 py-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#94A3B8',
                                fontSize: '12px',
                                fontWeight: 500,
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#94A3B8';
                              }}
                            >
                              {t('networking.actions.decline')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="flex-1 py-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: '#0684F5',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                              onClick={() => handleScheduleMeeting(match.profileId, match.eventId)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0570D6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#888888ff';
                              }}
                            >
                              {t('networking.actions.reschedule')}
                            </button>
                            <button
                              onClick={() => handleCancelMeeting(existingMeeting.id, match.profileId)}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#94A3B8',
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#94A3B8';
                              }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : showConnect ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConnect(match.id)}
                        className="w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: '#0684F5',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      >
                        <UserPlus size={14} />
                        {t('networking.actions.connect')}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex-1 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          onClick={() => handleScheduleMeeting(match.profileId, match.eventId)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          {t('networking.actions.scheduleMeeting')}
                        </button>
                        <button
                          onClick={() => handleDismiss(match.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : showPending ? (
                    <button
                      className="w-full py-2.5 rounded-lg"
                      disabled
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        color: '#F59E0B',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    >
                      {t('networking.status.requestSent')}
                    </button>
                  ) : showConnected ? (
                    <button
                      className="w-full py-2.5 rounded-lg"
                      disabled
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#10B981',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    >
                      {t('networking.status.connected')}
                    </button>
                  ) : (
                    <button
                      className="w-full py-2.5 rounded-lg"
                      disabled
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    >
                      {t('networking.status.requestClosed')}
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
            {/* Received Requests */}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('networking.requests.receivedTitle', { count: visibleReceivedRequests.length })}
              </h2>

              <div className="space-y-3">
                {visibleReceivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl p-5"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className="rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          width: '56px',
                          height: '56px',
                          backgroundColor: 'rgba(6, 132, 245, 0.2)',
                          border: '2px solid #0684F5'
                        }}
                      >
                        <Users size={24} style={{ color: '#0684F5' }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                              {request.name}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                              {request.title} at {request.company}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6B7280' }}>
                              {request.date}
                            </p>
                          </div>
                        </div>

                        <p 
                          className="mb-4 p-3 rounded-lg"
                          style={{ 
                            fontSize: '13px', 
                            color: '#94A3B8',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            lineHeight: '1.5'
                          }}
                        >
                          "{request.message}"
                        </p>

                        <div className="networking-hub__request-actions flex items-center gap-3">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            style={{
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 600
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                          >
                            <Check size={14} />
                            {t('networking.actions.accept')}
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }}
                          >
                            <X size={14} />
                            {t('networking.actions.decline')}
                          </button>
                          <button
                            onClick={() => handleViewProfile(request.profileId)}
                            className="px-4 py-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }}
                          >
                            <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {t('networking.actions.viewProfile')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleReceivedRequests.length === 0 && (
                  <div 
                    className="text-center py-12 rounded-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <UserPlus size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                      {t('networking.requests.noPending')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sent Requests */}
            <div>
              <button
                onClick={() => setShowSentRequests(!showSentRequests)}
                className="flex items-center gap-2 mb-4 transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('networking.requests.sentTitle', { count: visibleSentRequests.length })}
                </h2>
                <ChevronDown 
                  size={20} 
                  style={{ 
                    color: '#94A3B8',
                    transform: showSentRequests ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} 
                />
              </button>

              {showSentRequests && (
                <div className="space-y-3">
                  {visibleSentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="networking-hub__sent-card rounded-xl p-4 flex items-center justify-between"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'rgba(6, 132, 245, 0.2)',
                            border: '2px solid #0684F5'
                          }}
                        >
                          <Users size={20} style={{ color: '#0684F5' }} />
                        </div>

                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                            {request.name}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                            {request.title} at {request.company}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: '#F59E0B',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {t('networking.status.pending')}
                        </span>
                        <button
                          onClick={() => handleWithdrawRequest(request.id)}
                          className="px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          {t('networking.actions.withdraw')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {t('networking.connections.total', { count: connections.length })}
              </p>
            </div>

            <div className="space-y-3">
              {connections.map((connection) => {
                const existingMeeting = meetingByProfileId.get(connection.profileId);
                return (
                  <div
                    key={connection.id}
                    className="networking-hub__connection-card rounded-xl p-5 transition-all"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                  <div className="networking-hub__connection-row flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: '56px',
                          height: '56px',
                          backgroundColor: 'rgba(6, 132, 245, 0.2)',
                          border: '2px solid #0684F5'
                        }}
                      >
                        <Users size={24} style={{ color: '#0684F5' }} />
                      </div>

                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                          {connection.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                          {connection.title} at {connection.company}
                        </p>
                        <div className="flex items-center gap-3">
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>
                            {t('networking.connections.connectedOn', { date: connection.dateConnected })}
                          </p>
                          <span style={{ color: '#6B7280' }}>•</span>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>
                            {connection.event}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="networking-hub__connection-actions flex items-center gap-2">
                      <button
                        onClick={() => handleMessage(connection.profileId)}
                        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: '#0684F5',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      >
                        <MessageSquare size={14} />
                        {t('networking.actions.message')}
                      </button>
                      {existingMeeting ? (
                        <>
                          <button
                            onClick={() => handleScheduleMeeting(connection.profileId, connection.eventId)}
                            className="px-4 py-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 600
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#0570D6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#0684F5';
                            }}
                          >
                            {t('networking.actions.reschedule')}
                          </button>
                          <button
                            onClick={() => handleCancelMeeting(existingMeeting.id, connection.profileId)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleScheduleMeeting(connection.profileId, connection.eventId)}
                          className="px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          {t('networking.actions.scheduleMeeting')}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveConnection(connection.id, connection.profileId)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#94A3B8',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#94A3B8';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {isMeetingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={closeMeetingModal}
        >
        <div
          className="networking-hub__modal relative rounded-xl"
            style={{
              width: '720px',
              backgroundColor: '#1E3A5F',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0px 10px 40px rgba(0,0,0,0.5)',
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                  {meetingEditId ? t('networking.modals.rescheduleTitle') : t('networking.modals.scheduleTitle')}
                </h3>
                {meetingTarget && (
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                    {t('networking.modals.with', { name: meetingTarget.name })}
                  </p>
                )}
              </div>
              <button
                onClick={closeMeetingModal}
                className="transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = '#94A3B8';
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-6 py-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="mb-5">
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '10px' }}>
                  {t('networking.modals.meetingType')}
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'video', label: t('networking.meetings.types.online') },
                    { id: 'in-person', label: t('networking.meetings.types.inPerson') },
                    { id: 'hybrid', label: t('networking.meetings.types.hybrid') }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setMeetingType(option.id as any)}
                      className="px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: meetingType === option.id ? '#0684F5' : 'rgba(255,255,255,0.05)',
                        color: meetingType === option.id ? '#FFFFFF' : '#94A3B8',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {meetingType && meetingType !== 'video' && (
                <div className="mb-5">
                  <div className="networking-hub__modal-filters flex items-center gap-3 mb-3">
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.filterCountry')}</label>
                      <select
                        value={eventFilterCountry}
                        onChange={(event) => setEventFilterCountry(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.15)',
                          color: '#FFFFFF',
                          fontSize: '13px'
                        }}
                      >
                        <option value="">{t('networking.modals.allCountries')}</option>
                        {eventCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.filterDate')}</label>
                      <input
                        type="date"
                        value={eventFilterDate}
                        onChange={(event) => setEventFilterDate(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.15)',
                          color: '#FFFFFF',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {isLoadingEvents && (
                      <div style={{ color: '#94A3B8', fontSize: '13px' }}>
                        {t('networking.modals.loadingEvents')}
                      </div>
                    )}
                    {!isLoadingEvents && filteredEventCatalog.length === 0 && (
                      <div style={{ color: '#94A3B8', fontSize: '13px' }}>
                        {t('networking.modals.noEvents')}
                      </div>
                    )}
                    {!isLoadingEvents &&
                      filteredEventCatalog.map((event) => {
                        const capacity = event.capacity || null;
                        const used = eventMeetingCounts[event.id] || 0;
                        const remaining = capacity ? Math.max(capacity - used, 0) : null;
                        const isFull = remaining !== null && remaining <= 0;
                        return (
                          <button
                            key={event.id}
                            onClick={() => {
                              if (isFull) return;
                              setMeetingEventId(event.id);
                              setMeetingSessionId(null);
                              if (!meetingDate && event.startDate) {
                                setMeetingDate(new Date(event.startDate).toISOString().slice(0, 10));
                              }
                              if (!meetingTime && event.startDate) {
                                setMeetingTime(new Date(event.startDate).toTimeString().slice(0, 5));
                              }
                            }}
                            className="w-full text-left rounded-lg p-3 transition-colors"
                            style={{
                              backgroundColor:
                                meetingEventId === event.id ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              opacity: isFull ? 0.5 : 1
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{event.name}</p>
                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                                  {event.location || t('networking.defaults.onSite')} • {event.format || t('networking.defaults.inPerson')}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                {remaining !== null ? (
                                  <p style={{ fontSize: '12px', color: remaining > 0 ? '#10B981' : '#EF4444' }}>
                                    {t('networking.modals.slotsLeft', { count: remaining })}
                                  </p>
                                ) : (
                                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.noCapacityLimit')}</p>
                                )}
                                {isFull && (
                                  <p style={{ fontSize: '11px', color: '#EF4444' }}>{t('networking.modals.full')}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {meetingEventId && (
                    <div className="mt-4">
                      <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.meetingSlot')}</label>
                      <select
                        value={meetingSessionId || ''}
                        onChange={(event) => setMeetingSessionId(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.15)',
                          color: '#FFFFFF',
                          fontSize: '13px'
                        }}
                      >
                        <option value="">{t('networking.modals.selectSlot')}</option>
                        {filteredEventSessions.map((session) => {
                          const start = session.startsAt ? new Date(session.startsAt) : null;
                          const end = session.endsAt ? new Date(session.endsAt) : null;
                          const slotLabel = start
                            ? `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}`
                            : t('networking.common.tbd');
                          const remaining =
                            session.capacity && session.attendees !== null && session.attendees !== undefined
                              ? Math.max(session.capacity - session.attendees, 0)
                              : null;
                          return (
                            <option key={session.id} value={session.id} disabled={remaining !== null && remaining <= 0}>
                              {slotLabel} • {session.title}
                              {remaining !== null ? t('networking.modals.remainingShort', { count: remaining }) : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {meetingType === 'video' && (
                <div className="networking-hub__modal-time grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.meetingDate')}</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(event) => setMeetingDate(event.target.value)}
                      className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('networking.modals.meetingTime')}</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(event) => setMeetingTime(event.target.value)}
                      className="w-full px-3 py-2 rounded-lg border outline-none mt-1"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
            >
              <button
                onClick={closeMeetingModal}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  event.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.color = '#94A3B8';
                }}
              >
                {t('networking.actions.cancel')}
              </button>
              <button
                onClick={handleSubmitMeeting}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = '#0570D6';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = '#0684F5';
                }}
              >
                {meetingEditId ? t('networking.modals.rescheduleTitle') : t('networking.modals.scheduleTitle')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .networking-hub__hero {
            padding: 24px 16px 16px;
          }
          .networking-hub__main {
            padding: 16px 16px 64px;
          }
          .networking-hub__stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .networking-hub__tabs {
            flex-wrap: wrap;
            gap: 12px;
          }
          .networking-hub__filters {
            flex-direction: column;
            align-items: stretch;
          }
          .networking-hub__meeting-row {
            flex-direction: column;
            gap: 12px;
          }
          .networking-hub__meeting-row > div:first-child {
            width: 100%;
          }
          .networking-hub__meeting-info {
            flex-direction: column;
            align-items: center;
          }
          .networking-hub__meeting-header {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .networking-hub__meeting-details {
            text-align: center;
          }
          .networking-hub__meeting-details > div {
            justify-content: center;
          }
          .networking-hub__meeting-actions {
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }
          .networking-hub__meeting-actions button {
            width: 100%;
            justify-content: center;
          }
          .networking-hub__matches-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .networking-hub__request-actions {
            flex-wrap: wrap;
          }
          .networking-hub__sent-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .networking-hub__connection-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .networking-hub__connection-actions {
            flex-wrap: wrap;
            width: 100%;
          }
          .networking-hub__modal {
            width: 92vw;
          }
          .networking-hub__modal-filters {
            flex-direction: column;
          }
          .networking-hub__modal-time {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 400px) {
          .networking-hub__tabs {
            gap: 8px;
          }
          .networking-hub__meeting-row {
            gap: 10px;
          }
          .networking-hub__matches-grid {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
