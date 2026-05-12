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
  Eye,
  QrCode
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { sanitizeError } from '../../utils/errorHandler';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';
import { useMessageThread } from '../../hooks/useMessageThread';
import BookMeetingModal from './BookMeetingModal';
import { sendEmail, generateMeetingConfirmationEmailHtml, sendMeetingConfirmationEmails, sendMeetingCancelledEmail, sendConnectionRequestEmail, sendConnectionAcceptedEmail } from '../../lib/email';

const MATCHES_TABLE = 'b2b_matches';
const REQUESTS_TABLE = 'b2b_requests';
const CONNECTIONS_TABLE = 'b2b_connections';
const MEETINGS_TABLE = 'event_b2b_meetings';

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
  qrCodeUrl?: string;
  attendeeAId?: string | null;
  attendeeBId?: string | null;
  isCurrentUserA?: boolean;
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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [highlightedMeetingId, setHighlightedMeetingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showPastMeetings, setShowPastMeetings] = useState(true);
  const [showSentRequests, setShowSentRequests] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [eventOptions, setEventOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [currentUserName, setCurrentUserName] = useState(t('networking.defaults.someone'));
  const didGenerateMatchesRef = useRef(false);
  
  // Meeting Modal State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTarget, setMeetingTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [activeMeetingEventId, setActiveMeetingEventId] = useState<string | undefined>(undefined);
  const [qrModalMeeting, setQrModalMeeting] = useState<Meeting | null>(null);

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

  const toMeetingStatus = (status?: string | null): Meeting['status'] => {
    const s = String(status || '').toLowerCase();
    if (s === 'cancelled') return 'cancelled';
    if (s === 'confirmed') return 'confirmed';
    return 'pending';
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
      // 1. Get user's attendee IDs
      let myAttendeeIds: string[] = [];
      const { data: myAttendees } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('profile_id', user.id);
      
      myAttendeeIds = (myAttendees || []).map(a => a.id);

      // 2. Fetch all networking data in parallel
      // Build meetings query: profile-based + attendee-based for full coverage
      const meetingsOrFilters = [`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id},organizer_id.eq.${user.id}`];
      if (myAttendeeIds.length > 0) {
        // Also fetch by attendee IDs for edge cases where profile_id columns may not be set
        myAttendeeIds.forEach(aid => {
          meetingsOrFilters.push(`attendee_a_id.eq.${aid}`);
          meetingsOrFilters.push(`attendee_b_id.eq.${aid}`);
        });
      }

      const [
        profileResult,
        matchesResult,
        receivedResult,
        sentResult,
        connectionsResult,
        meetingsResult,
        legacyResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from(MATCHES_TABLE).select('*').eq('profile_id', user.id),
        supabase.from(REQUESTS_TABLE).select('*').eq('recipient_id', user.id),
        supabase.from(REQUESTS_TABLE).select('*').eq('sender_id', user.id),
        supabase.from(CONNECTIONS_TABLE).select('*').or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`),
        supabase.from(MEETINGS_TABLE).select('*').or(meetingsOrFilters.join(',')),
        supabase.from('b2b_meetings').select('*').then(r => r, () => ({ data: [] }))
      ]);

      // 3. Process Meetings
      const allRawMeetings = [
        ...(meetingsResult.data || []),
        ...(legacyResult?.data || [])
      ];
      
      const meetingsData = allRawMeetings.filter(m => {
        const isA = m.profile_a_id === user.id || (m.attendee_a_id && myAttendeeIds.includes(m.attendee_a_id));
        const isB = m.profile_b_id === user.id || (m.attendee_b_id && myAttendeeIds.includes(m.attendee_b_id));
        const isOrg = m.organizer_id === user.id;
        return isA || isB || isOrg;
      }).filter((m, i, self) => self.findIndex(x => x.id === m.id) === i);

      if (profileResult.data?.full_name) {
        setCurrentUserName(profileResult.data.full_name);
      }

      // 4. Collect all related IDs
      const profileIds = new Set<string>();
      const eventIds = new Set<string>();
      const attendeeIds = new Set<string>();

      matchesResult.data?.forEach(m => {
        if (m.matched_profile_id) profileIds.add(m.matched_profile_id);
        if (m.event_id) eventIds.add(m.event_id);
      });

      [...(receivedResult.data || []), ...(sentResult.data || [])].forEach(r => {
        const otherId = r.sender_id === user.id ? r.recipient_id : r.sender_id;
        if (otherId) profileIds.add(otherId);
        if (r.event_id) eventIds.add(r.event_id);
      });

      connectionsResult.data?.forEach(c => {
        const otherId = c.profile_a_id === user.id ? c.profile_b_id : c.profile_a_id;
        if (otherId) profileIds.add(otherId);
        if (c.event_id) eventIds.add(c.event_id);
      });

      meetingsData.forEach(m => {
        if (m.profile_a_id) profileIds.add(m.profile_a_id);
        if (m.profile_b_id) profileIds.add(m.profile_b_id);
        if (m.organizer_id) profileIds.add(m.organizer_id);
        if (m.event_id) eventIds.add(m.event_id);
        if (m.attendee_a_id) attendeeIds.add(m.attendee_a_id);
        if (m.attendee_b_id) attendeeIds.add(m.attendee_b_id);
      });

      // 5. Fetch Profile, Event, and Attendee details
      const cleanProfileIds = Array.from(profileIds).filter(id => !!id && id !== 'null');
      const cleanEventIds = Array.from(eventIds).filter(id => !!id && id !== 'null');
      const cleanAttendeeIds = Array.from(attendeeIds).filter(id => !!id && id !== 'null');

      const [profilesData, eventsData, attendeesData] = await Promise.all([
        cleanProfileIds.length > 0 
          ? supabase.from('profiles').select('*').in('id', cleanProfileIds)
          : { data: [] },
        cleanEventIds.length > 0
          ? supabase.from('events').select('*').in('id', cleanEventIds)
          : { data: [] },
        cleanAttendeeIds.length > 0
          ? supabase.from('event_attendees').select('*').in('id', cleanAttendeeIds)
          : { data: [] }
      ]);

      const profileMap: Record<string, any> = {};
      (profilesData.data || []).forEach(p => {
        profileMap[p.id] = {
          name: p.full_name || p.email || t('networking.defaults.unknownUser'),
          title: p.job_title || t('networking.defaults.professional'),
          company: p.company || '',
          avatar: p.avatar_url
        };
      });

      const attendeeMap: Record<string, any> = {};
      (attendeesData.data || []).forEach(a => {
        attendeeMap[a.id] = a;
      });

      const eventsLookup: Record<string, string> = {};
      (eventsData.data || []).forEach(e => {
        eventsLookup[e.id] = e.name || 'Event';
      });
      setEventOptions((eventsData.data || []).map(e => ({ id: e.id, name: e.name || 'Event' })));

      // 6. Map State
      setMatches((matchesResult.data || []).map(row => {
        const p = profileMap[row.matched_profile_id] || { name: t('networking.defaults.unknownUser'), title: t('networking.defaults.professional'), company: '' };
        return {
          id: row.id,
          profileId: row.matched_profile_id,
          name: p.name,
          title: p.title,
          company: p.company,
          avatar: p.avatar,
          score: row.score ?? 0,
          reason: row.reason || t('networking.matches.reasonFallback'),
          tags: Array.isArray(row.tags) ? row.tags : [],
          status: row.status || 'new',
          eventId: row.event_id || null
        };
      }));

      setReceivedRequests((receivedResult.data || []).map(row => ({
        id: row.id,
        profileId: row.sender_id,
        name: profileMap[row.sender_id]?.name || t('networking.defaults.unknownUser'),
        title: profileMap[row.sender_id]?.title || t('networking.defaults.professional'),
        company: profileMap[row.sender_id]?.company || '',
        avatar: profileMap[row.sender_id]?.avatar,
        message: row.message || t('networking.requests.defaultMessage'),
        date: formatRelative(row.created_at),
        type: 'received',
        status: row.status || 'pending',
        eventId: row.event_id || null
      })));

      setSentRequests((sentResult.data || []).map(row => ({
        id: row.id,
        profileId: row.recipient_id,
        name: profileMap[row.recipient_id]?.name || t('networking.defaults.unknownUser'),
        title: profileMap[row.recipient_id]?.title || t('networking.defaults.professional'),
        company: profileMap[row.recipient_id]?.company || '',
        avatar: profileMap[row.recipient_id]?.avatar,
        message: row.message || t('networking.requests.defaultMessage'),
        date: formatRelative(row.created_at),
        type: 'sent',
        status: row.status || 'pending',
        eventId: row.event_id || null
      })));

      setConnections((connectionsResult.data || []).map(row => {
        const otherId = row.profile_a_id === user.id ? row.profile_b_id : row.profile_a_id;
        return {
          id: row.id,
          profileId: otherId,
          name: profileMap[otherId]?.name || t('networking.defaults.unknownUser'),
          title: profileMap[otherId]?.title || t('networking.defaults.professional'),
          company: profileMap[otherId]?.company || '',
          avatar: profileMap[otherId]?.avatar,
          dateConnected: formatDate(row.created_at),
          event: row.event_id ? eventsLookup[row.event_id] || t('networking.defaults.event') : t('networking.defaults.generalNetworking'),
          eventId: row.event_id || null
        };
      }));

      setMeetings(meetingsData.map(row => {
        const isCurrentUserA = row.profile_a_id === user.id || 
                               (row.attendee_a_id && myAttendeeIds.includes(row.attendee_a_id));
        
        const otherProfileId = isCurrentUserA 
          ? (row.profile_b_id || attendeeMap[row.attendee_b_id]?.profile_id) 
          : (row.profile_a_id || attendeeMap[row.attendee_a_id]?.profile_id);
        
        const otherAttendee = isCurrentUserA ? attendeeMap[row.attendee_b_id] : attendeeMap[row.attendee_a_id];
        const p = profileMap[otherProfileId || ''] || { name: otherAttendee?.name || t('networking.defaults.networkingMeeting'), avatar: null };
        
        const eventName = eventsLookup[row.event_id] || t('networking.defaults.event');
        const mDate = formatDate(row.start_at);
        const mTime = formatTime(row.start_at);
        
        const qrData = JSON.stringify({
          meetingId: row.id,
          event: eventName,
          organizer: isCurrentUserA ? currentUserName : p.name,
          recipient: isCurrentUserA ? p.name : currentUserName,
          time: `${mDate} ${mTime}`,
          location: row.location || t('networking.common.tbd')
        });
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

        return {
          id: row.id,
          profileId: otherProfileId || '',
          name: p.name,
          avatar: p.avatar,
          time: mTime,
          status: toMeetingStatus(row.status),
          location: row.location || (row.meta?.meeting_type === 'video' ? t('networking.meetings.videoCall') : t('networking.common.tbd')),
          type: row.meta?.meeting_type || 'in-person',
          event: eventName,
          eventId: row.event_id || null,
          startAt: row.start_at,
          organizerId: row.organizer_id || (isCurrentUserA ? user.id : otherProfileId),
          meetingFormat: row.meta?.meeting_format || (row.meta?.meeting_type === 'video' ? 'video' : 'in-person'),
          meetingUrl: row.meta?.video_url || (row.meta?.meeting_type === 'video' ? `https://meet.jit.si/Eventra${row.id.replace(/-/g, '').slice(0, 12)}` : undefined),
          qrCodeUrl: row.status === 'confirmed' ? qrCodeUrl : undefined,
          attendeeAId: row.attendee_a_id || null,
          attendeeBId: row.attendee_b_id || null,
          isCurrentUserA
        };
      }));

    } catch (error: any) {
      console.error('[Networking] CRITICAL ERROR:', error);
      toast.error(sanitizeError(error, t('networking.errors.loadData')));
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
      .select('*')
      .eq('id', user.id)
      .single();

    const selfSignals = extractProfileSignals(selfProfile);
    if (!selfSignals.enabled) return [];

    const { data: others } = await supabase
      .from('profiles')
      .select('*')
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
      .select('*');
    if (error) {
      toast.error(sanitizeError(error, t('networking.errors.generateMatches')));
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

  const handleScheduleMeeting = async (profileId: string, defaultEventId?: string | null, meeting?: Meeting | null) => {
    let resolvedProfileId = profileId;

    // If profileId is empty (bulk matches without profile IDs), resolve from attendee record
    if (!resolvedProfileId && meeting) {
      const otherAttendeeId = meeting.isCurrentUserA ? meeting.attendeeBId : meeting.attendeeAId;
      if (otherAttendeeId) {
        try {
          const { data: attendee } = await supabase
            .from('event_attendees')
            .select('profile_id')
            .eq('id', otherAttendeeId)
            .maybeSingle();
          if (attendee?.profile_id) {
            resolvedProfileId = attendee.profile_id;
          }
        } catch { /* fallback below */ }
      }
    }

    if (!resolvedProfileId) {
      toast.error('Cannot identify the meeting participant. The attendee may not have a linked profile.');
      return;
    }

    const name = profileNameMap.get(resolvedProfileId) || (meeting?.name) || t('networking.defaults.user');
    const existing = meetingByProfileId.get(resolvedProfileId) || meeting || null;

    // For unscheduled bulk matches (no start time), pass meeting ID but mark as unscheduled
    // so the modal updates the existing row but doesn't lock the type selection
    const isUnscheduled = existing && !existing.startAt && existing.status === 'pending';
    const meetingForModal = isUnscheduled
      ? { ...existing, meetingFormat: '', _isUnscheduled: true }
      : existing;

    setMeetingTarget({ id: resolvedProfileId, name });
    setActiveMeeting(meetingForModal);
    setActiveMeetingEventId(defaultEventId || existing?.eventId || undefined);
    setIsMeetingModalOpen(true);
  };

  const handleCancelMeeting = async (meetingId: string, profileId: string) => {
    await supabase.from(MEETINGS_TABLE).update({ status: 'cancelled' }).eq('id', meetingId);

    // Send cancellation email to the other party
    const { data: meeting } = await supabase
      .from(MEETINGS_TABLE)
      .select('*, event:event_id(name), profile_a:profile_a_id(full_name, email), profile_b:profile_b_id(full_name, email)')
      .eq('id', meetingId).single();
    if (meeting) {
      const isA = meeting.profile_a?.full_name === currentUserName;
      const other = isA ? meeting.profile_b : meeting.profile_a;
      if (other?.email) {
        sendMeetingCancelledEmail(other.email, {
          recipientName: other.full_name || other.email,
          cancellerName: currentUserName,
          eventName: meeting.event?.name || 'Event',
          meetingDate: formatDate(meeting.start_at),
          meetingTime: formatTime(meeting.start_at)
        }).catch(() => {});
      }
    }

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

  const handleConfirmMeeting = async (meetingId: string, otherProfileId: string) => {
    try {
      // 1. Update status in database
      const { error: updateError } = await supabase
        .from(MEETINGS_TABLE)
        .update({ status: 'confirmed' })
        .eq('id', meetingId);

      if (updateError) throw updateError;

      // 2. Fetch full meeting details for email
      const { data: meeting, error: fetchError } = await supabase
        .from(MEETINGS_TABLE)
        .select(`
          *,
          event:event_id(id, name),
          organizer:organizer_id(id, full_name, email),
          profile_a:profile_a_id(id, full_name, email),
          profile_b:profile_b_id(id, full_name, email)
        `)
        .eq('id', meetingId)
        .single();

      if (fetchError || !meeting) {
        console.error('Could not fetch meeting details for email:', fetchError);
      } else {
        // 2b. Auto-generate Jitsi link for video meetings without a custom URL
        let videoUrl = meeting.meta?.video_url || '';
        if (meeting.meta?.meeting_type === 'video' && !videoUrl) {
          videoUrl = `https://meet.jit.si/Eventra${meetingId.replace(/-/g, '').slice(0, 12)}`;
          // Persist the auto-generated link so both participants see it
          const updatedMeta = { ...meeting.meta, video_url: videoUrl };
          await supabase.from(MEETINGS_TABLE).update({ meta: updatedMeta }).eq('id', meetingId);
        }

        // 3. Prepare Email Data
        const eventName = meeting.event?.name || 'Event';
        const meetingDate = formatDate(meeting.start_at);
        const meetingTime = formatTime(meeting.start_at);
        const location = meeting.location || 'TBD';

        // Identify participants
        const organizer = meeting.organizer || meeting.profile_a;
        const recipient = meeting.profile_b;

        if (organizer?.email && recipient?.email) {
          sendMeetingConfirmationEmails({
            organizerEmail: organizer.email,
            organizerName: organizer.full_name || organizer.email,
            recipientEmail: recipient.email,
            recipientName: recipient.full_name || recipient.email,
            meetingDate,
            meetingTime,
            location,
            eventName,
            meetingId: meeting.id,
            status: 'confirmed',
            videoUrl: videoUrl || undefined
          }).catch(err => console.error('Failed to send confirmation emails:', err));
        }
      }

      // 6. Send DB Notification
      await safeNotify({
        recipient_id: otherProfileId,
        type: 'action',
        title: t('networking.notifications.meetingConfirmed.title'),
        body: t('networking.notifications.meetingConfirmed.body', { name: currentUserName }),
        action_url: '/my-networking',
        actor_id: user?.id || null
      });

      toast.success(t('networking.toasts.meetingConfirmed'));
      await loadNetworkingData();
    } catch (error: any) {
      console.error('Error confirming meeting:', error);
      toast.error(sanitizeError(error, 'Failed to confirm meeting'));
    }
  };

  const handleDeclineMeeting = async (meetingId: string, profileId: string) => {
    await supabase.from(MEETINGS_TABLE).update({ status: 'cancelled' }).eq('id', meetingId);

    // Send decline email to the meeting organizer
    const { data: meeting } = await supabase
      .from(MEETINGS_TABLE)
      .select('*, event:event_id(name), profile_a:profile_a_id(full_name, email), profile_b:profile_b_id(full_name, email)')
      .eq('id', meetingId).single();
    if (meeting) {
      const isA = meeting.profile_a?.full_name === currentUserName;
      const other = isA ? meeting.profile_b : meeting.profile_a;
      if (other?.email) {
        sendMeetingCancelledEmail(other.email, {
          recipientName: other.full_name || other.email,
          cancellerName: currentUserName,
          eventName: meeting.event?.name || 'Event',
          meetingDate: formatDate(meeting.start_at),
          meetingTime: formatTime(meeting.start_at)
        }).catch(() => {});
      }
    }

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

    // Send connection request email
    const { data: recipientProfile } = await supabase
      .from('profiles').select('email, full_name, job_title, organization').eq('id', match.profileId).single();
    if (recipientProfile?.email) {
      const { data: senderProfile } = await supabase
        .from('profiles').select('job_title, organization').eq('id', user.id).single();
      sendConnectionRequestEmail(recipientProfile.email, {
        recipientName: recipientProfile.full_name || recipientProfile.email,
        senderName: currentUserName,
        senderJobTitle: senderProfile?.job_title || '',
        senderOrganization: senderProfile?.organization || ''
      }).catch(() => {});
    }

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

    // Send connection accepted email to the requester
    const { data: requesterProfile } = await supabase
      .from('profiles').select('email, full_name').eq('id', request.profileId).single();
    if (requesterProfile?.email) {
      sendConnectionAcceptedEmail(requesterProfile.email, {
        requesterName: requesterProfile.full_name || requesterProfile.email,
        accepterName: currentUserName
      }).catch(() => {});
    }

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

  useEffect(() => {
    loadNetworkingData();
  }, [user?.id, t]);

  // Handle ?meetingId= from email links — switch to schedule tab and highlight meeting
  useEffect(() => {
    const meetingIdParam = searchParams.get('meetingId');
    if (meetingIdParam) {
      setActiveTab('schedule');
      setHighlightedMeetingId(meetingIdParam);
      // Scroll to the meeting card after render
      setTimeout(() => {
        const el = document.getElementById(`meeting-${meetingIdParam}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      // Clear highlight after 5 seconds
      setTimeout(() => setHighlightedMeetingId(null), 5000);
    }
  }, [searchParams, meetings]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`b2b:${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: MATCHES_TABLE,
        filter: `profile_id=eq.${user.id}`
      }, () => loadNetworkingData())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: REQUESTS_TABLE,
        filter: `recipient_id=eq.${user.id}`
      }, () => loadNetworkingData())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: MEETINGS_TABLE
      }, () => loadNetworkingData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter((meeting) => {
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
      <div style={{ height: '72px' }} /> {/* Navbar Spacer */}
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
          className="networking-hub__tabs flex items-center gap-2 md:gap-8 mb-8"
          style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={() => setActiveTab('schedule')}
            className="pb-4 transition-colors relative flex items-center gap-2"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'schedule' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <Calendar size={18} />
            <span className="tab-label">{t('networking.tabs.schedule')}</span>
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
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <Sparkles size={18} />
            <span className="tab-label">{t('networking.tabs.matches')}</span>
            {newMatchesCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#A855F7',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  marginLeft: '2px'
                }}
              >
                {newMatchesCount}
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
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <UserPlus size={18} />
            <span className="tab-label">{t('networking.tabs.requests')}</span>
            {pendingRequestsCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  marginLeft: '2px'
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
            className="pb-4 transition-colors relative flex items-center gap-2"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: activeTab === 'connections' ? '#FFFFFF' : '#94A3B8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <Users size={18} />
            <span className="tab-label">{t('networking.tabs.connections')}</span>
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
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <div key={meeting.id} id={`meeting-${meeting.id}`} className="networking-hub__meeting-row flex gap-6" style={highlightedMeetingId === meeting.id ? { outline: '2px solid #0684F5', outlineOffset: '4px', borderRadius: '12px', transition: 'outline 0.3s ease' } : undefined}>
                    {/* Time & Date */}
                    <div className="flex-shrink-0" style={{ width: '120px' }}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} style={{ color: '#0684F5' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                            {meeting.startAt ? formatDate(meeting.startAt) : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: '#94A3B8' }} />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                            {meeting.time}
                          </span>
                        </div>
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
                            className="rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: 'rgba(6, 132, 245, 0.2)',
                              border: '2px solid #0684F5'
                            }}
                          >
                            {meeting.avatar ? (
                              <img src={meeting.avatar} alt={meeting.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Users size={24} style={{ color: '#0684F5' }} />
                            )}
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
                          {/* QR Code Button - Only for confirmed meetings */}
                        {meeting.status === 'confirmed' && meeting.qrCodeUrl && (
                          <button
                            onClick={() => setQrModalMeeting(meeting)}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 600,
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                          >
                            <QrCode size={14} />
                            QR Code
                          </button>
                        )}

                        {meeting.type === 'video' && meeting.status === 'confirmed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
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
                              {meeting.meetingUrl?.includes('meet.jit.si') && (
                                <span style={{ fontSize: '10px', color: '#F59E0B', lineHeight: 1.3 }}>
                                  Jitsi — first person signs in with Google to start
                                </span>
                              )}
                            </div>
                          )}
                          {meeting.status === 'pending' && meeting.organizerId !== user?.id && meeting.startAt && (
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
                          
                          {meeting.status !== 'cancelled' && (meeting.organizerId === user?.id || (!meeting.startAt && meeting.status === 'pending')) && (
                            <button
                              onClick={() => handleScheduleMeeting(meeting.profileId, meeting.eventId, meeting)}
                              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                              style={{
                                backgroundColor: !meeting.startAt ? '#0684F5' : 'rgba(6, 132, 245, 0.1)',
                                color: !meeting.startAt ? '#FFFFFF' : '#0684F5',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: !meeting.startAt ? 'none' : '1px solid rgba(6, 132, 245, 0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = !meeting.startAt ? '#0570D6' : 'rgba(6, 132, 245, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = !meeting.startAt ? '#0684F5' : 'rgba(6, 132, 245, 0.1)';
                              }}
                            >
                              <Calendar size={14} />
                              {!meeting.startAt ? t('networking.actions.scheduleMeeting', 'Schedule Meeting') : t('networking.actions.reschedule', 'Reschedule')}
                            </button>
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
                ))
              ) : (
                <div 
                  className="text-center py-16 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                  <Calendar size={48} style={{ color: '#94A3B8', margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px', color: '#FFFFFF', fontWeight: 600 }}>
                    {t('networking.meetings.noMeetings')}
                  </p>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                    {t('networking.meetings.noMeetingsSubtitle')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
              {t('networking.matches.subtitle')}
            </p>

            <div className="networking-hub__matches-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.filter(m => m.status !== 'dismissed').length > 0 ? (
                matches.filter(m => m.status !== 'dismissed').map((match) => {
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
                          className="mx-auto mb-3 rounded-full flex items-center justify-center overflow-hidden"
                          style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: 'rgba(6, 132, 245, 0.2)',
                            border: '2px solid #0684F5'
                          }}
                        >
                          {match.avatar ? (
                            <img src={match.avatar} alt={match.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={28} style={{ color: '#0684F5' }} />
                          )}
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
                                  onClick={() => handleScheduleMeeting(match.profileId, match.eventId, existingMeeting)}
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
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
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
                          >
                            <UserPlus size={14} />
                            {t('networking.actions.connect')}
                          </button>
                          <button
                            className="w-full py-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              fontSize: '12px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                            onClick={() => handleScheduleMeeting(match.profileId, match.eventId)}
                          >
                            {t('networking.actions.scheduleMeeting')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <Sparkles size={48} style={{ color: '#94A3B8', margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ color: '#FFFFFF' }}>{t('networking.matches.noMatches')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('networking.requests.receivedTitle', { count: visibleReceivedRequests.length })}
              </h2>
              <div className="space-y-3">
                {visibleReceivedRequests.map((request) => (
                  <div key={request.id} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: '56px', height: '56px', backgroundColor: 'rgba(6, 132, 245, 0.2)', border: '2px solid #0684F5' }}>
                        {request.avatar ? <img src={request.avatar} alt={request.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={24} style={{ color: '#0684F5' }} />}
                      </div>
                      <div className="flex-1">
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{request.name}</h3>
                        <p style={{ fontSize: '13px', color: '#94A3B8' }}>{request.title} at {request.company}</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontStyle: 'italic' }}>"{request.message}"</p>
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => handleAcceptRequest(request.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">{t('networking.actions.accept')}</button>
                          <button onClick={() => handleDeclineRequest(request.id)} className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 text-sm">{t('networking.actions.decline')}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {visibleReceivedRequests.length === 0 && <p style={{ color: '#94A3B8', textAlign: 'center' }}>{t('networking.requests.noPending')}</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-4">
            {connections.map(c => (
              <div key={c.id} className="rounded-xl p-5 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-4">
                  <div className="rounded-full overflow-hidden" style={{ width: '48px', height: '48px' }}>
                    {c.avatar ? <img src={c.avatar} alt={c.name} /> : <div className="w-full h-full bg-blue-900 flex items-center justify-center"><Users size={20} /></div>}
                  </div>
                  <div>
                    <h3 style={{ color: '#FFF', fontWeight: 600 }}>{c.name}</h3>
                    <p style={{ color: '#94A3B8', fontSize: '13px' }}>{c.title}</p>
                  </div>
                </div>
                <button onClick={() => handleMessage(c.profileId)} className="p-2 rounded-lg bg-blue-600 text-white"><MessageSquare size={18} /></button>
              </div>
            ))}
            {connections.length === 0 && <p style={{ color: '#94A3B8', textAlign: 'center' }}>No connections yet.</p>}
          </div>
        )}
      </div>

      {isMeetingModalOpen && meetingTarget && (
        <BookMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false);
            loadNetworkingData();
          }}
          currentUser={{
            id: user?.id || '',
            full_name: currentUserName,
            email: user?.email || ''
          }}
          recipient={{
            id: meetingTarget.id,
            name: meetingTarget.name
          }}
          existingMeeting={activeMeeting}
          eventId={activeMeetingEventId}
        />
      )}

      {qrModalMeeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setQrModalMeeting(null)}
        >
          <div
            className="rounded-2xl p-8 max-w-sm w-full text-center"
            style={{ 
              backgroundColor: '#1E3A5F',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>Meeting Ticket</h3>
              <button 
                onClick={() => setQrModalMeeting(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div 
              style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '16px', 
                display: 'inline-block',
                marginBottom: '24px'
              }}
            >
              <img 
                src={qrModalMeeting.qrCodeUrl} 
                alt="Meeting QR Code" 
                style={{ width: '200px', height: '200px', display: 'block' }} 
              />
            </div>

            <div className="text-left space-y-3">
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event</p>
                <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 600 }}>{qrModalMeeting.event}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</p>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>{qrModalMeeting.time}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>{qrModalMeeting.location}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>With</p>
                <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 600 }}>{qrModalMeeting.name}</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-8 w-full py-3 rounded-xl transition-all font-bold text-white"
              style={{ backgroundColor: '#0684F5' }}
            >
              Print / Save Ticket
            </button>
          </div>
        </div>
      )}

      <style>{`
        .networking-hub { font-family: 'Inter', sans-serif; }
        .tab-label { transition: all 0.2s; }
        @media (max-width: 768px) {
          .tab-label { display: none; }
        }
      `}</style>
    </div>
  );
}
