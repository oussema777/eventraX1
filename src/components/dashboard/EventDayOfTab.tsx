import DayOfScanner from './DayOfScanner';
import { networkingTimeZone } from '../../utils/networkingSchedule';
const ATTENDEE_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#244963"/><circle cx="40" cy="29" r="13" fill="#b9d4e9"/><path d="M16 70c0-28 48-28 48 0" fill="#b9d4e9"/></svg>');
import { resolveCheckin, saveCheckin } from '../../lib/eventCheckin';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  Calendar,
  Handshake,
  QrCode,
  Eye,
  Download,
  Settings,
  X,
  RefreshCw,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import { sendMeetingCheckinAlertEmail } from '../../lib/email';

type ScannerType = 'event' | 'session' | 'b2b' | null;
type ScanResult = 'success' | 'error' | 'duplicate' | null;
type DuplicatePolicy = 'allow' | 'block' | 'confirm';
type ScannerSettings = {
  autoAdvance: boolean;
  soundOnSuccess: boolean;
  vibrateOnSuccess: boolean;
  offlineScanning: boolean;
  duplicatePolicy: DuplicatePolicy;
};
const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  autoAdvance: false,
  soundOnSuccess: true,
  vibrateOnSuccess: true,
  offlineScanning: false,
  duplicatePolicy: 'allow'
};

export default function EventDayOfTab({ eventId, canManageSettings = true, scannerOnly = false }: { eventId: string; canManageSettings?: boolean; scannerOnly?: boolean }) {
  const { t, locale } = useI18n();
  const [scannerTimeZone, setScannerTimeZone] = useState(() => networkingTimeZone(eventId));

  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);

  const checkinLockRef = useRef(false);
  const cameraGenerationRef = useRef(0);
  const attemptIds = useRef(new Map<string, string>());
  const handleDetectedCodeRef = useRef<(code: string) => Promise<void>>(async () => {});
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scanError, setScanError] = useState('');
  const [participantChoice, setParticipantChoice] = useState<{ code: string; meetingId: string; candidates: any[] } | null>(null);
  const flushLockRef = useRef(false);
  const [showScanner, setShowScanner] = useState<ScannerType>(null);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState('');
  const [scannerSettingsBase, setScannerSettingsBase] = useState<any>({});
  const [scannerSettings, setScannerSettings] = useState<ScannerSettings>(DEFAULT_SCANNER_SETTINGS);
  const [savingScannerSettings, setSavingScannerSettings] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [lastScanDetails, setLastScanDetails] = useState<any>(null);
  const [pendingDuplicate, setPendingDuplicate] = useState<any>(null);
  const [sessionCheckinCount, setSessionCheckinCount] = useState(0);
  // Live stats
  const [stats, setStats] = useState({
    checkedIn: 0,
    registered: 0,
    checkInsToday: 0,
    checkInsLastHour: 0,
    totalScansToday: 0,
    activeSessions: 0,
    upcomingSessions: 0,
    activeB2BMeetings: 0,
    scheduledB2BMeetings: 0,
    sessionScans: 0,
    b2bCompleted: 0
  });

  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [reportType, setReportType] = useState<'event' | 'session' | 'b2b' | 'all'>('event');
  const [reportIncludes, setReportIncludes] = useState({
    attendeeInfo: true,
    timestamps: true,
    ticketTypes: true,
    details: true,
    summary: true
  });
  const [loadingData, setLoadingData] = useState(false);
  const scannerStateRef = useRef({ showScanner, scanResult, manualEntryOpen, participantChoice });
  scannerStateRef.current = { showScanner, scanResult, manualEntryOpen, participantChoice };

  const parseMaybeDate = (v: any) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: scannerTimeZone });
  };

  const resolveTicketBadgeKey = (ticketType?: string, ticketColor?: string) => {
    if (ticketColor) return ticketColor;
    const label = (ticketType || '').toLowerCase();
    if (label.includes('vip')) return 'gold';
    if (label.includes('premium')) return 'purple';
    if (label.includes('staff')) return 'teal';
    return 'gray';
  };

  const refreshDayOfData = async () => {
    if (!eventId) return;
    try {
      setLoadingData(true);

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      const [
        registeredRes,
        checkedInRes,
        checkInsTodayRes,
        scansTodayRes,
        scansLastHourRes,
        sessionScansRes,
        sessionsRes,
        meetingsRes
      ] = await Promise.all([
        supabase.from('event_attendees').select('id', { head: true, count: 'exact' }).eq('event_id', eventId),
        supabase.from('event_attendees').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('checked_in', true),
        supabase.from('event_attendees').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('checked_in', true).gte('check_in_at', todayStart.toISOString()),
        supabase.from('event_checkins').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).gte('created_at', todayStart.toISOString()),
        supabase.from('event_checkins').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).gte('created_at', lastHour.toISOString()),
        supabase.from('event_checkins').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('type', 'session').gte('created_at', todayStart.toISOString()),
        supabase.from('event_sessions').select('id,title,location,starts_at,ends_at').eq('event_id', eventId).order('starts_at', { ascending: true }),
        supabase.from('event_b2b_meetings').select('id,start_at,end_at,status,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,location').eq('event_id', eventId).in('status', ['confirmed', 'completed']).order('start_at', { ascending: true }).limit(200)
      ]);

      const sessionsData = sessionsRes.data || [];
      const meetingsRaw = meetingsRes.data || [];

      // Resolve profile names for B2B meeting display
      const profileIds = new Set<string>();
      meetingsRaw.forEach((m: any) => {
        if (m.profile_a_id) profileIds.add(m.profile_a_id);
        if (m.profile_b_id) profileIds.add(m.profile_b_id);
      });
      let profileNameMap: Record<string, string> = {};
      if (profileIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(profileIds));
        (profiles || []).forEach((p: any) => {
          profileNameMap[p.id] = p.full_name || '';
        });
      }
      const meetingsData = meetingsRaw.map((m: any) => ({
        ...m,
        profile_a_name: profileNameMap[m.profile_a_id] || '',
        profile_b_name: profileNameMap[m.profile_b_id] || ''
      }));

      setSessions(sessionsData);
      setMeetings(meetingsData);

      const activeSessions = sessionsData.filter((x: any) => {
        const st = parseMaybeDate(x.starts_at);
        const et = parseMaybeDate(x.ends_at);
        if (!st || !et) return false;
        return st <= now && et >= now;
      }).length;

      const upcomingSessions = sessionsData.filter((x: any) => {
        const st = parseMaybeDate(x.starts_at);
        if (!st) return false;
        return st > now;
      }).length;

      const activeB2BMeetings = meetingsData.filter((x: any) => {
        const st = parseMaybeDate(x.start_at);
        const et = parseMaybeDate(x.end_at);
        if (!st || !et) return false;
        return st <= now && et >= now;
      }).length;

      const scheduledB2BMeetings = meetingsData.filter((x: any) => {
        const st = parseMaybeDate(x.start_at);
        if (!st) return false;
        return st > now;
      }).length;

      const b2bCompleted = meetingsData.filter((x: any) => String(x.status || '').toLowerCase() === 'completed').length;

      setStats({
        checkedIn: checkedInRes.count || 0,
        registered: registeredRes.count || 0,
        checkInsToday: checkInsTodayRes.count || 0,
        checkInsLastHour: scansLastHourRes.count || 0,
        totalScansToday: scansTodayRes.count || 0,
        activeSessions,
        upcomingSessions,
        activeB2BMeetings,
        scheduledB2BMeetings,
        sessionScans: sessionScansRes.count || 0,
        b2bCompleted
      });

      const { data: checkinsData, error: checkinsErr } = await supabase
        .from('event_checkins')
        .select('id,type,created_at,scanned_code, attendee:event_attendees(id,name,email,company,photo_url,avatar_url,ticket_type,ticket_color), session:event_sessions(id,title,location,starts_at), meeting:event_b2b_meetings(id,start_at,location)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!checkinsErr) {
        const typeMeta: Record<string, { label: string; color: string }> = {
          event: { label: t('manageEvent.dayOf.checkInTypes.event'), color: '#10B981' },
          session: { label: t('manageEvent.dayOf.checkInTypes.session'), color: '#8B5CF6' },
          b2b: { label: t('manageEvent.dayOf.checkInTypes.b2b'), color: '#F59E0B' }
        };

        const mapped = (checkinsData || []).map((checkIn: any) => {
          const attendee = checkIn.attendee || {};
          const name = attendee.name || attendee.email || 'Attendee';
          const photo = attendee.photo_url || attendee.avatar_url || ATTENDEE_PLACEHOLDER;
          const ticketType = attendee.ticket_type || 'General';
          const ticketBadgeColor = resolveTicketBadgeKey(ticketType, attendee.ticket_color);
          const meta = typeMeta[checkIn.type] || { label: t('manageEvent.dayOf.checkInTypes.default'), color: '#94A3B8' };
          let typeLabel = meta.label;
          if (checkIn.type === 'session' && checkIn.session?.title) {
            typeLabel = `Session - ${checkIn.session.title}`;
          }
          if (checkIn.type === 'b2b' && checkIn.meeting?.id) {
            typeLabel = `B2B - ${String(checkIn.meeting.id).slice(0, 8).toUpperCase()}`;
          }
          return {
            id: checkIn.id,
            attendeeId: attendee.id,
            name,
            company: attendee.company || '',
            photo,
            ticketType,
            ticketBadgeColor,
            borderColor: meta.color,
            typeColor: meta.color,
            type: typeLabel,
            time: formatTime(checkIn.created_at),
            createdAt: checkIn.created_at
          };
        });

        setRecentCheckIns(mapped);
      }
    } catch (e) {
      console.error('DayOf load error', e);
    } finally {
      setLoadingData(false);
    }
  };

  const getOfflineQueueKey = () => `eventra:dayof:checkins:${eventId || 'unknown'}`;

  const readOfflineQueue = () => {
    if (typeof window === 'undefined' || !eventId) return [];
    try {
      const raw = localStorage.getItem(getOfflineQueueKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeOfflineQueue = (items: any[]) => {
    if (typeof window === 'undefined' || !eventId) return;
    localStorage.setItem(getOfflineQueueKey(), JSON.stringify(items));
  };

  const loadScannerSettings = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('attendee_settings, timezone')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      const { data: settings } = await supabase.from('event_b2b_settings').select('venue_config').eq('event_id', eventId).maybeSingle();
      setScannerTimeZone(networkingTimeZone(eventId, settings?.venue_config, data?.timezone));
      const base = data?.attendee_settings || {};
      setScannerSettingsBase(base);
      const stored = base.day_of?.scanner_settings || base.scanner_settings || {};
      setScannerSettings({ ...DEFAULT_SCANNER_SETTINGS, ...stored });
    } catch (e) {
      console.error('Failed to load scanner settings', e);
    }
  };

  const saveScannerSettings = async (nextSettings: ScannerSettings) => {
    if (!eventId || !canManageSettings) return false;
    setSavingScannerSettings(true);
    try {
      const base = scannerSettingsBase || {};
      const nextBase = { ...base };
      const dayOf = { ...(nextBase.day_of || {}) };
      dayOf.scanner_settings = nextSettings;
      nextBase.day_of = dayOf;

      const { error } = await supabase
        .from('events')
        .update({ attendee_settings: nextBase })
        .eq('id', eventId);

      if (error) throw error;
      setScannerSettingsBase(nextBase);
      setScannerSettings(nextSettings);
      toast.success(t('manageEvent.dayOf.toasts.settingsSaved'));
      return true;
    } catch (e) {
      console.error('Scanner settings save error', e);
      toast.error(t('manageEvent.dayOf.toasts.settingsFailed'));
      return false;
    } finally {
      setSavingScannerSettings(false);
    }
  };

  const flushOfflineQueue = async () => {
    if (!eventId || typeof navigator === 'undefined' || !navigator.onLine) return;
    if (flushLockRef.current) return;
    const queue = readOfflineQueue();
    if (!queue.length) return;
    flushLockRef.current = true;

    try {
      const remaining: any[] = [];
      for (const item of queue) {
        try {
          const resolved = await resolveCheckin(supabase, { eventId, kind: item.type, code: item.attendee_id,
            sessionId: item.session_id, meetingId: item.meeting_id });
          if (!resolved.attendee) throw new Error('attendeeNotFound');
          item.id ||= crypto.randomUUID();
          writeOfflineQueue(queue);
          await saveCheckin(supabase, { id: item.id, event_id: eventId, attendee_id: resolved.attendee.id,
            type: item.type, session_id: item.session_id || null, meeting_id: item.meeting_id || null,
            scanned_code: item.scanned_code || null, created_at: item.created_at || new Date().toISOString()
          }, resolved.attendee, item.check_in_at || item.created_at || new Date().toISOString());
          if (resolved.meeting) await completeB2bAttendance(resolved.meeting);
        } catch (e) {
          remaining.push(item);
        }
      }

      writeOfflineQueue(remaining);
      if (queue.length && remaining.length !== queue.length) {
        toast.success(t('manageEvent.dayOf.toasts.synced'));
        refreshDayOfData();
      }
    } finally {
      flushLockRef.current = false;
    }
  };

  const fetchSessionCheckinCount = async (sessionId?: string) => {
    const sid = sessionId || selectedSession;
    if (!eventId || !sid) { setSessionCheckinCount(0); return; }
    try {
      const { count } = await supabase
        .from('event_checkins')
        .select('id', { head: true, count: 'exact' })
        .eq('event_id', eventId)
        .eq('type', 'session')
        .eq('session_id', sid);
      setSessionCheckinCount(count || 0);
    } catch { setSessionCheckinCount(0); }
  };

  useEffect(() => {
    refreshDayOfData();
    loadScannerSettings();
  }, [eventId]);

  useEffect(() => {
    if (!sessions?.length) {
      if (selectedSession) setSelectedSession('');
      return;
    }
    if (!selectedSession || !sessions.find((x: any) => x.id === selectedSession)) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  useEffect(() => {
    if (selectedSession && showScanner === 'session') {
      fetchSessionCheckinCount(selectedSession);
    }
  }, [selectedSession, showScanner]);

  useEffect(() => {
    if (!meetings?.length) {
      if (selectedMeeting) setSelectedMeeting('');
      return;
    }
    if (!selectedMeeting || !meetings.find((x: any) => x.id === selectedMeeting)) {
      // Prefer first non-completed meeting
      const active = meetings.find((x: any) => x.status !== 'completed');
      setSelectedMeeting(active ? active.id : meetings[0].id);
    }
  }, [meetings, selectedMeeting]);

  useEffect(() => {
    if (!scannerSettings.offlineScanning) return;
    flushOfflineQueue();
  }, [scannerSettings.offlineScanning, eventId]);

  useEffect(() => {
    if (!scannerSettings.offlineScanning) return;
    const onOnline = () => flushOfflineQueue();
    window?.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [scannerSettings.offlineScanning, eventId]);

  const handleOpenScanner = (type: ScannerType) => {
    setShowScanner(type);
    setScanResult(null);
    setManualEntryOpen(false);
    setLastScanDetails(null);
    setPendingDuplicate(null);
    setParticipantChoice(null); setScanError('');
    lastScanRef.current = null;
  };

  const handleCloseScanner = () => {
    setShowScanner(null);
    setScanResult(null);
    setManualEntryOpen(false);
    setLastScanDetails(null);
    setPendingDuplicate(null);
    setCameraError('');
    setParticipantChoice(null); setScanError('');
    stopScannerCamera();
  };

  const stopScannerCamera = () => {
    cameraGenerationRef.current += 1;
    if (scanIntervalRef.current !== null) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setTorchEnabled(false);
  };

  const scanWithJsQR = async (): Promise<string | null> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { default: jsQR } = await import('jsqr');
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  const startScannerLoop = () => {
    if (scanIntervalRef.current !== null) return;
    const generation = cameraGenerationRef.current;
    const Detector = (window as any).BarcodeDetector;
    const useBarcodeDetector = !!Detector;
    let detector: any = null;
    try { detector = useBarcodeDetector ? new Detector({ formats: ['qr_code'] }) : null; } catch { /* Use jsQR below. */ }

    scanIntervalRef.current = window.setInterval(async () => {
      const current = scannerStateRef.current;
      if (!videoRef.current || !current.showScanner || current.scanResult || current.manualEntryOpen || current.participantChoice) return;
      if (scanLockRef.current) return;
      if (videoRef.current.readyState < 2) return;
      scanLockRef.current = true;
      try {
        let rawValue: string | null = null;
        if (detector) {
          try {
            const codes = await detector.detect(videoRef.current);
            rawValue = codes?.[0]?.rawValue || codes?.[0]?.data || null;
          } catch { detector = null; rawValue = await scanWithJsQR(); }
        } else {
          rawValue = await scanWithJsQR();
        }
        const latest = scannerStateRef.current;
        if (rawValue && generation === cameraGenerationRef.current && latest.showScanner && !latest.scanResult && !latest.manualEntryOpen && !latest.participantChoice) {
          await handleDetectedCodeRef.current(rawValue);
        }
      } catch {
        // ignore scanner errors
      } finally {
        scanLockRef.current = false;
      }
    }, 450);
  };

  const startScannerCamera = async () => {
    if (!showScanner) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t('scannerFlow.cameraUnavailable'));
      setManualEntryOpen(true);
      return;
    }
    stopScannerCamera();
    const generation = cameraGenerationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode }
      });
      if (generation !== cameraGenerationRef.current || !scannerStateRef.current.showScanner) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if (generation !== cameraGenerationRef.current) return;
      setCameraReady(true);
      setCameraError('');
      startScannerLoop();
    } catch (e) {
      if (generation !== cameraGenerationRef.current) return;
      setCameraError(t('scannerFlow.cameraDenied'));
      setManualEntryOpen(true);
    }
  };

  const handleDetectedCode = async (rawValue: string) => {
    const value = String(rawValue || '').trim();
    if (!value) return;
    const now = Date.now();
    const last = lastScanRef.current;
    if (last && last.value === value && now - last.at < 2500) return;
    lastScanRef.current = { value, at: now };
    if (showScanner === 'session') return doCheckin('session', undefined, value);
    if (showScanner === 'b2b') return doCheckin('b2b', undefined, value);
    return doCheckin('event', undefined, value);
  };

  const toggleTorch = async () => {
    try {
      const track = streamRef.current?.getVideoTracks?.()[0];
      if (!track) {
        toast.error(t('manageEvent.dayOf.toasts.cameraInactive'));
        return;
      }
      const caps = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
      if (!caps?.torch) {
        toast.error(t('manageEvent.dayOf.toasts.torchUnsupported'));
        return;
      }
      const next = !torchEnabled;
      await (track as any).applyConstraints({ advanced: [{ torch: next }] });
      setTorchEnabled(next);
    } catch (e) {
      toast.error(t('manageEvent.dayOf.toasts.torchFailed'));
    }
  };

  const playSuccessTone = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
      oscillator.onended = () => ctx.close();
    } catch {
      // ignore audio errors
    }
  };

  useEffect(() => {
    if (!showScanner) {
      stopScannerCamera();
      return;
    }
    startScannerCamera();
    return () => stopScannerCamera();
  }, [showScanner, cameraFacingMode]);

  useEffect(() => {
    if (autoAdvanceRef.current !== null) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (scanResult === 'success') {
      if (scannerSettings.soundOnSuccess) playSuccessTone();
      if (scannerSettings.vibrateOnSuccess && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(120);
      }
      if (scannerSettings.autoAdvance) {
        autoAdvanceRef.current = window.setTimeout(() => {
          handleNextScan();
        }, 1500);
      }
    }
    return () => {
      if (autoAdvanceRef.current !== null) {
        window.clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };
  }, [scanResult, scannerSettings.autoAdvance, scannerSettings.soundOnSuccess, scannerSettings.vibrateOnSuccess]);
  const buildScanDetails = (attendee: any, kind: 'event' | 'session' | 'b2b', checkInAt: string, previousCount: number, firstCheckInAt?: string | null) => ({
    attendeeId: attendee.id,
    name: attendee.name || attendee.email || 'Attendee',
    email: attendee.email || '',
    company: attendee.company || '',
    photo: attendee.photo_url || attendee.avatar_url || attendee.meta?.photo || ATTENDEE_PLACEHOLDER,
    ticketType: attendee.ticket_type || 'General',
    ticketCode: attendee.meta?.confirmation_code || attendee.ticket_code || attendee.confirmation_code || attendee.qr_token || '',
    isVip: !!attendee.is_vip,
    kind,
    checkInTime: formatTime(checkInAt),
    firstCheckInTime: firstCheckInAt ? formatTime(firstCheckInAt) : '',
    previousCount
  });

  const completeB2bAttendance = async (meeting: any) => {
    const { data: attendees, error: attendeeError } = await supabase.from('event_attendees')
      .select('id,profile_id').eq('event_id', eventId);
    const { data: checkins, error: checkinError } = await supabase.from('event_checkins')
      .select('attendee_id').eq('event_id', eventId).eq('type', 'b2b').eq('meeting_id', meeting.id);
    if (attendeeError || checkinError) throw new Error('completionFailed');
    const present = new Set((checkins || []).map(row => row.attendee_id));
    const sidePresent = (side: 'a' | 'b') => (attendees || []).some(person => present.has(person.id) &&
      (person.id === meeting['attendee_' + side + '_id'] || (person.profile_id && person.profile_id === meeting['profile_' + side + '_id'])));
    if (sidePresent('a') && sidePresent('b') && meeting.status === 'confirmed') {
      const { data, error } = await supabase.from('event_b2b_meetings').update({ status: 'completed' })
        .eq('event_id', eventId).eq('id', meeting.id).eq('status', 'confirmed').select('id').maybeSingle();
      if (error || !data?.id) throw new Error('completionFailed');
    }
  };

  const notifyB2bArrival = async (meeting: any, attendee: any) => {
    const isA = attendee.id === meeting.attendee_a_id || (attendee.profile_id && attendee.profile_id === meeting.profile_a_id);
    const otherId = isA ? meeting.profile_b_id : meeting.profile_a_id;
    if (!otherId) return;
    const [{ data: other }, { data: event }] = await Promise.all([
      supabase.from('profiles').select('full_name,email').eq('id', otherId).maybeSingle(),
      supabase.from('events').select('name').eq('id', eventId).maybeSingle()
    ]);
    if (!other?.email) return;
    const delivered = await sendMeetingCheckinAlertEmail(other.email, { recipientName: other.full_name || t('networking.defaults.user'),
      partnerName: attendee.name || t('networking.defaults.user'),
      eventName: event?.name || t('networking.defaults.event'), meetingTime: formatTime(meeting.start_at),
      location: meeting.location || t('networking.common.tbd'), checkinTime: formatTime(new Date().toISOString()), meetingId: meeting.id });
    if (!delivered) toast.warning(t('networking.notifications.emailFailed'));
  };

  const doCheckin = async (kind: 'event' | 'session' | 'b2b', chosenAttendeeId?: string, codeOverride?: string, allowDuplicate = false) => {
    if (checkinLockRef.current) return;
    const code = (codeOverride || manualCode || '').trim();
    if (!code) { toast.error(t('manageEvent.dayOf.toasts.enterCode')); return; }
    checkinLockRef.current = true; setIsCheckingIn(true); setScanError(''); setScanResult(null);
    const scannerSession = cameraGenerationRef.current;
    try {
      const resolved = await resolveCheckin(supabase, { eventId, kind, code, chosenAttendeeId, sessionId: selectedSession, meetingId: selectedMeeting });
      if (scannerSession !== cameraGenerationRef.current) return;
      if (resolved.meeting) setSelectedMeeting(resolved.meeting.id);
      if (resolved.candidates) {
        setParticipantChoice({ code, meetingId: resolved.meeting.id, candidates: resolved.candidates });
        return;
      }
      setParticipantChoice(null);
      const attendee = resolved.attendee;
      const meetingId = resolved.meeting?.id || null;
      let query = supabase.from('event_checkins').select('id,created_at', { count: 'exact' })
        .eq('event_id', eventId).eq('attendee_id', attendee.id).eq('type', kind);
      if (kind === 'session') query = query.eq('session_id', selectedSession);
      if (kind === 'b2b') query = query.eq('meeting_id', meetingId);
      const { data: existing, count, error } = await query.order('created_at', { ascending: true }).limit(1);
      if (scannerSession !== cameraGenerationRef.current) return;
      if (error) throw new Error('lookupFailed');
      const previousCount = count || existing?.length || 0;
      const duplicate = (kind === 'event' && attendee.checked_in) || previousCount > 0;
      const nowIso = new Date().toISOString();
      const details = buildScanDetails(attendee, kind, nowIso, previousCount, existing?.[0]?.created_at || attendee.check_in_at);
      const attemptKey = [eventId, kind, attendee.id, resolved.sessionId || '', meetingId || ''].join(':');
      // A refresh loses in-memory attempts. Recover the saved log when its
      // attendee update was interrupted, without creating another arrival.
      const retryId = attemptIds.current.get(attemptKey)
        || (!attendee.checked_in ? existing?.[0]?.id : undefined);
      if (duplicate && !retryId && scannerSettings.duplicatePolicy !== 'allow' && !(allowDuplicate && scannerSettings.duplicatePolicy === 'confirm')) {
        setScanResult('duplicate'); setLastScanDetails(details);
        setPendingDuplicate(scannerSettings.duplicatePolicy === 'confirm' ? { kind, code, attendeeId: attendee.id } : null);
        return;
      }
      const id = retryId || crypto.randomUUID(); attemptIds.current.set(attemptKey, id);
      await saveCheckin(supabase, { id, event_id: eventId, attendee_id: attendee.id, type: kind,
        session_id: kind === 'session' ? selectedSession : null, meeting_id: meetingId, scanned_code: code }, attendee, nowIso);
      attemptIds.current.delete(attemptKey);
      if (kind === 'b2b') {
        try { await completeB2bAttendance(resolved.meeting); } catch { toast.warning(t('scannerFlow.completionFailed')); }
        if (!duplicate) void notifyB2bArrival(resolved.meeting, attendee).catch(() => toast.warning(t('networking.notifications.emailFailed')));
      }
      if (scannerSession !== cameraGenerationRef.current) return;
      setManualCode(''); setScanResult('success'); setLastScanDetails(details); setPendingDuplicate(null);
      if (kind === 'session') setSessionCheckinCount(value => value + 1);
      void refreshDayOfData();
    } catch (error) {
      if (scannerSession !== cameraGenerationRef.current) return;
      const key = error instanceof Error ? error.message : 'saveFailed';
      const message = t('scannerFlow.' + key, { defaultValue: t('manageEvent.dayOf.toasts.checkInFailed') });
      setScanResult('error'); setScanError(message); toast.error(message);
    } finally { checkinLockRef.current = false; setIsCheckingIn(false); }
  };
  handleDetectedCodeRef.current = async (code: string) => { await handleDetectedCode(code); };

  const handleNextScan = () => {
    setScanResult(null); setManualEntryOpen(false); setLastScanDetails(null); setPendingDuplicate(null);
    setParticipantChoice(null); setScanError(''); setManualCode(''); lastScanRef.current = null;
  };
  const handleAllowDuplicate = async () => {
    if (!pendingDuplicate || scannerSettings.duplicatePolicy !== 'confirm') return;
    await doCheckin(pendingDuplicate.kind, pendingDuplicate.attendeeId, pendingDuplicate.code, true);
  };

  const updateReportInclude = (key: keyof typeof reportIncludes, value: boolean) => {
    setReportIncludes((prev) => ({ ...prev, [key]: value }));
  };

  const getTicketBadgeColor = (color: string) => {
    const colors: { [key: string]: { bg: string, text: string } } = {
      gold: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
      gray: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
      purple: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
      teal: { bg: 'rgba(20,184,166,0.15)', text: '#14B8A6' },
      orange: { bg: 'rgba(249,115,22,0.15)', text: '#F97316' }
    };
    if (!color) return colors.gray;
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const intVal = parseInt(normalized, 16);
      if (!Number.isNaN(intVal) && normalized.length === 6) {
        const r = (intVal >> 16) & 255;
        const g = (intVal >> 8) & 255;
        const b = intVal & 255;
        return { bg: `rgba(${r},${g},${b},0.15)`, text: color };
      }
    }
    const key = color.toLowerCase();
    return colors[key] || colors.gray;
  };

  return (
    <div className="event-dayof" style={{ padding: '32px 40px 80px', backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
          .scanner-participants { padding:24px; border:1px solid #3c6286; border-radius:16px; background:#102f4c; color:white; }
          .scanner-participants h3 { margin:0 0 8px; font-size:20px; }
          .scanner-participants p { color:#bdd0e1; font-size:14px; line-height:1.6; }
          .scanner-participants button { width:100%; display:flex; flex-direction:column; gap:6px; text-align:left; background:#1d466b; border:1px solid #6284a3; color:white; padding:16px; border-radius:10px; margin-top:12px; cursor:pointer; }
          .scanner-participants button span { font-size:13px; color:#bdd0e1; }
          .scanner-participants button:focus-visible { outline:3px solid #45c6f4; outline-offset:3px; }

        @media (max-width: 900px) {
          .event-dayof {
            padding: 24px 20px 80px !important;
          }
          .event-dayof__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 20px !important;
            padding: 20px 24px !important;
          }
          .event-dayof__divider {
            display: none !important;
          }
          .event-dayof__scanner-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 600px) {
          .event-dayof {
            padding: 20px 16px 80px !important;
          }

          .event-dayof__header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }

          .event-dayof__actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-dayof__actions > * {
            flex: 1;
            min-width: 0;
            justify-content: center;
          }

          .event-dayof__stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
            padding: 16px !important;
          }
          .event-dayof__stats p[style*="42px"] {
            font-size: 28px !important;
          }

          .event-dayof__scanner-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .event-dayof__recent-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }

          .event-dayof__recent-item {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            padding: 12px 16px !important;
          }

          .event-dayof__recent-actions {
            width: 100%;
            justify-content: flex-start !important;
            flex-wrap: wrap;
          }

          .event-dayof__settings-footer {
            flex-direction: column;
            gap: 8px;
          }

          .event-dayof__settings-footer > * {
            width: 100%;
            justify-content: center;
          }

          .event-dayof__scanner-card-icon {
            width: 80px !important;
            height: 80px !important;
          }
          .event-dayof__scanner-card-icon svg {
            width: 48px !important;
            height: 48px !important;
          }

          /* Settings & Download modals responsive */
          .event-dayof__modal-settings {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }

        @media (max-width: 400px) {
          .event-dayof {
            padding: 16px 12px 72px !important;
          }

          .event-dayof__stats {
            grid-template-columns: 1fr !important;
          }
        }

        /* Scanner modal responsive */
        @media (max-width: 768px) {
          .event-dayof__scanner-overlay {
            padding: 0 !important;
          }
          .event-dayof__scanner-modal {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .event-dayof__scanner-modal-header {
            padding: 12px 16px !important;
          }
          .event-dayof__scanner-modal-header h2 {
            font-size: 18px !important;
          }
          .event-dayof__scanner-modal-header select {
            max-width: 200px !important;
          }
          .event-dayof__modal-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 16px !important;
          }
          .event-dayof__camera-area {
            height: 260px !important;
          }
          .event-dayof__modal-actions {
            flex-direction: column;
            width: 100%;
          }
          .event-dayof__modal-actions > * {
            width: 100%;
            justify-content: center;
          }
          .event-dayof__scanner-status-badge {
            display: none !important;
          }
        }
      `}</style>
      <div className="event-dayof__inner" style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div className="event-dayof__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('manageEvent.dayOf.header.title')}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('manageEvent.dayOf.header.subtitle')}
            </p>
          </div>

          <div className="event-dayof__actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Event Live Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(239,68,68,0.15)',
                borderRadius: '20px'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.5px' }}>
                {t('manageEvent.dayOf.header.live')}
              </span>
            </div>

            {!scannerOnly && <button
              onClick={() => setShowDownload(true)}
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
              <Download size={18} />
              {t('manageEvent.dayOf.header.reports')}
            </button>}

            {canManageSettings && <button
              onClick={() => setShowSettings(true)}
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
            </button>}
          </div>
        </div>

        {/* LIVE STATS BANNER */}
        <div
          className="event-dayof__stats"
          style={{
            background: 'linear-gradient(90deg, rgba(6,132,245,0.2) 0%, rgba(16,185,129,0.2) 100%)',
            padding: '24px 32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px'
          }}
        >
          {/* Stat 1: Current Attendance */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Users size={28} style={{ color: '#0684F5' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', color: '#10B981' }}>{t('manageEvent.dayOf.stats.live')}</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.dayOf.stats.checkedIn')}
            </p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>
              {stats.checkedIn}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
              {t('manageEvent.dayOf.stats.registered', { percent: stats.registered ? Math.round((stats.checkedIn / stats.registered) * 100) : 0, total: stats.registered })}
            </p>
          </div>

          <div className="event-dayof__divider" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          {/* Stat 2: Check-ins Today */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <CheckCircle size={28} style={{ color: '#10B981' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.dayOf.stats.today')}
            </p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>
              {stats.checkInsToday}
            </p>
            <p style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} />
              {t('manageEvent.dayOf.stats.lastHour', { count: stats.checkInsLastHour })}
            </p>
          </div>

          <div className="event-dayof__divider" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          {/* Stat 3: Active Sessions */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Calendar size={28} style={{ color: '#8B5CF6' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.dayOf.stats.activeSessions')}
            </p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>
              {stats.activeSessions}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
              {t('manageEvent.dayOf.stats.upcomingSessions', { count: stats.upcomingSessions })}
            </p>
          </div>

          <div className="event-dayof__divider" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          {/* Stat 4: B2B Meetings */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Handshake size={28} style={{ color: '#F59E0B' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.dayOf.stats.activeMeetings')}
            </p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>
              {stats.activeB2BMeetings}
            </p>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
              {t('manageEvent.dayOf.stats.scheduledMeetings', { count: stats.scheduledB2BMeetings })}
            </p>
          </div>
        </div>

        {/* SCANNER TOOLS SECTION */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
            {t('manageEvent.dayOf.tools.title')}
          </h2>

          <div className="event-dayof__scanner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            
            {/* Scanner Card 1: General Event Check-in */}
            <div
              onClick={() => handleOpenScanner('event')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0684F5';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(6,132,245,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="event-dayof__scanner-card-icon"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(6,132,245,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <QrCode size={80} style={{ color: '#0684F5' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.dayOf.tools.event.title')}
                </h3>
                <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '280px', margin: '0 auto' }}>
                  {t('manageEvent.dayOf.tools.event.desc')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.tools.event.checkedIn')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.checkedIn}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.tools.event.pending')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{Math.max(stats.registered - stats.checkedIn, 0)}</p>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  height: '48px',
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
                <QrCode size={18} />
                {t('manageEvent.dayOf.tools.action')}
              </button>
            </div>

            {/* Scanner Card 2: Session Check-in */}
            <div
              onClick={() => handleOpenScanner('session')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="event-dayof__scanner-card-icon"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(139,92,246,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={80} style={{ color: '#8B5CF6' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.dayOf.tools.session.title')}
                </h3>
                <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '280px', margin: '0 auto' }}>
                  {t('manageEvent.dayOf.tools.session.desc')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.stats.activeSessions')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.activeSessions}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.tools.session.scans')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.sessionScans}</p>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  height: '48px',
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
                <QrCode size={18} />
                {t('manageEvent.dayOf.tools.action')}
              </button>
            </div>

            {/* Scanner Card 3: B2B Meeting Check-in */}
            <div
              onClick={() => handleOpenScanner('b2b')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="event-dayof__scanner-card-icon"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245,158,11,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Handshake size={80} style={{ color: '#F59E0B' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.dayOf.tools.b2b.title')}
                </h3>
                <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '280px', margin: '0 auto' }}>
                  {t('manageEvent.dayOf.tools.b2b.desc')}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.tools.b2b.active')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.activeB2BMeetings}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.tools.b2b.completed')}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.b2bCompleted}</p>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  height: '48px',
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
                <QrCode size={18} />
                {t('manageEvent.dayOf.tools.action')}
              </button>
            </div>
          </div>
        </div>

        {/* RECENT CHECK-INS SECTION */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="event-dayof__recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
              {t('manageEvent.dayOf.recent.title')}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} style={{ color: '#10B981', animation: 'spin 2s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.dayOf.recent.autoUpdate')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentCheckIns.map((checkIn, index) => {
              const badgeColor = getTicketBadgeColor(checkIn.ticketBadgeColor);
              return (
                <div
                  key={checkIn.id}
                  className="event-dayof__recent-item"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${checkIn.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={checkIn.photo}
                      alt={checkIn.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.2)',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                          {checkIn.name}
                        </p>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: badgeColor.bg,
                            color: badgeColor.text
                          }}
                        >
                          {checkIn.ticketType}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {checkIn.company}
                      </p>
                    </div>
                  </div>

                  <div className="event-dayof__recent-actions" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: index === 0 ? '#10B981' : '#94A3B8', marginBottom: '4px' }}>
                        {checkIn.time}
                      </p>
                      <p style={{ fontSize: '12px', color: checkIn.typeColor || '#94A3B8' }}>
                        {checkIn.type}
                      </p>
                    </div>
                    <CheckCircle size={20} style={{ color: '#10B981' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {!scannerOnly && <button
            onClick={() => setShowDownload(true)}
            style={{
              width: '100%',
              height: '40px',
              marginTop: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
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
            {t('manageEvent.dayOf.recent.viewAll')}
            <ArrowRight size={16} />
          </button>}
        </div>
      </div>

      {showScanner && <DayOfScanner
        kind={showScanner} timeZone={scannerTimeZone} videoRef={videoRef} cameraReady={cameraReady} cameraError={cameraError}
        torchEnabled={torchEnabled} busy={isCheckingIn} result={scanResult} error={scanError} details={lastScanDetails}
        manualOpen={manualEntryOpen} code={manualCode} meetings={meetings} sessions={sessions}
        meetingId={selectedMeeting} sessionId={selectedSession} candidates={participantChoice?.candidates}
        canAllowDuplicate={!!pendingDuplicate && scannerSettings.duplicatePolicy === 'confirm'} totalToday={stats.totalScansToday}
        onClose={handleCloseScanner} onSwitchCamera={() => setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
        onTorch={toggleTorch} onManual={() => setManualEntryOpen(open => cameraError ? true : !open)} onCode={setManualCode}
        onMeeting={setSelectedMeeting} onSession={setSelectedSession} onScan={() => void doCheckin(showScanner)}
        onChoose={id => { if (participantChoice) void doCheckin('b2b', id, participantChoice.code); }}
        onNext={handleNextScan} onAllowDuplicate={handleAllowDuplicate}
        onViewAttendee={scannerOnly ? undefined : () => { handleCloseScanner(); navigate(`/event/${eventId}?tab=attendees`); }}
      />}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px'
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="event-dayof__modal-settings"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              maxWidth: '100%',
              maxHeight: '90vh',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'auto'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>{t('manageEvent.dayOf.settings.title')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Setting toggles */}
              {[
                { key: 'autoAdvance', label: t('manageEvent.dayOf.settings.toggles.autoAdvance'), helper: '', checked: scannerSettings.autoAdvance },
                { key: 'soundOnSuccess', label: t('manageEvent.dayOf.settings.toggles.sound'), helper: '', checked: scannerSettings.soundOnSuccess },
                { key: 'vibrateOnSuccess', label: t('manageEvent.dayOf.settings.toggles.vibrate'), helper: '', checked: scannerSettings.vibrateOnSuccess },
                { key: 'offlineScanning', label: t('manageEvent.dayOf.settings.toggles.offline'), helper: t('scannerFlow.offlineHint'), checked: scannerSettings.offlineScanning }
              ].map((setting) => (
                <div key={setting.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                      {setting.label}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {setting.helper}
                    </p>
                  </div>
                  <div
                    onClick={() => setScannerSettings((prev) => {
                      const key = setting.key as keyof ScannerSettings;
                      return { ...prev, [key]: !prev[key] };
                    })}
                    style={{
                      width: '48px',
                      height: '24px',
                      backgroundColor: setting.checked ? '#0684F5' : 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: setting.checked ? '26px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </div>
                </div>
              ))}

              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('manageEvent.dayOf.settings.duplicatePolicy')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: t('manageEvent.dayOf.settings.policyOptions.allow'), value: 'allow' },
                    { label: t('manageEvent.dayOf.settings.policyOptions.block'), value: 'block' },
                    { label: t('manageEvent.dayOf.settings.policyOptions.confirm'), value: 'confirm' }
                  ].map((option) => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="duplicate-policy"
                        checked={scannerSettings.duplicatePolicy === option.value}
                        onChange={() => setScannerSettings((prev) => ({ ...prev, duplicatePolicy: option.value as DuplicatePolicy }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="event-dayof__settings-footer" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={async () => {
                  setScannerSettings(DEFAULT_SCANNER_SETTINGS);
                  await saveScannerSettings(DEFAULT_SCANNER_SETTINGS);
                }}
                style={{
                  padding: '0 20px',
                  height: '40px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.dayOf.settings.reset')}
              </button>
              <button
                onClick={async () => {
                  const ok = await saveScannerSettings(scannerSettings);
                  if (ok) setShowSettings(false);
                }}
                disabled={savingScannerSettings}
                style={{
                  padding: '0 32px',
                  height: '44px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: savingScannerSettings ? 'default' : 'pointer',
                  opacity: savingScannerSettings ? 0.7 : 1
                }}
              >
                {savingScannerSettings ? t('manageEvent.dayOf.settings.saving') : t('manageEvent.dayOf.settings.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOWNLOAD REPORTS MODAL */}
      {showDownload && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '16px'
          }}
          onClick={() => setShowDownload(false)}
        >
          <div
            className="event-dayof__modal-settings"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              maxWidth: '100%',
              maxHeight: '90vh',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'auto'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.title')}</h2>
              <button
                onClick={() => setShowDownload(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('manageEvent.dayOf.reportsModal.reportType')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    t('manageEvent.dayOf.reportsModal.types.general'),
                    t('manageEvent.dayOf.reportsModal.types.session'),
                    t('manageEvent.dayOf.reportsModal.types.b2b'),
                    t('manageEvent.dayOf.reportsModal.types.all')
                  ].map((type, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="report-type"
                        checked={(idx === 0 && reportType === 'event') || (idx === 1 && reportType === 'session') || (idx === 2 && reportType === 'b2b') || (idx === 3 && reportType === 'all')}
                        onChange={() => setReportType(idx === 0 ? 'event' : idx === 1 ? 'session' : idx === 2 ? 'b2b' : 'all')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('manageEvent.dayOf.reportsModal.include')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reportIncludes.attendeeInfo}
                      onChange={(e) => updateReportInclude('attendeeInfo', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.fields.attendee')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reportIncludes.timestamps}
                      onChange={(e) => updateReportInclude('timestamps', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.fields.timestamps')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reportIncludes.ticketTypes}
                      onChange={(e) => updateReportInclude('ticketTypes', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.fields.ticketTypes')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reportIncludes.details}
                      onChange={(e) => updateReportInclude('details', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.fields.details')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reportIncludes.summary}
                      onChange={(e) => updateReportInclude('summary', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{t('manageEvent.dayOf.reportsModal.fields.summary')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="event-dayof__settings-footer" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDownload(false)}
                style={{
                  padding: '0 20px',
                  height: '44px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.dayOf.settings.cancel')}
              </button>
              <button
                onClick={async () => {
                  try {
                    const types = reportType === 'all' ? ['event', 'session', 'b2b'] : [reportType];
                    const { data, error } = await supabase
                      .from('event_checkins')
                      .select('id,type,created_at,scanned_code, attendee:event_attendees(name,email,ticket_type), session:event_sessions(title,location), meeting:event_b2b_meetings(id,location)')
                      .eq('event_id', eventId)
                      .in('type', types as any)
                      .order('created_at', { ascending: false })
                      .limit(5000);

                    if (error) throw error;

                    const rows = (data || []).map((r: any) => {
                      const rawMeeting = r.meeting?.id ? String(r.meeting.id) : '';
                      const meetingCode = rawMeeting ? `B2B-${rawMeeting.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}` : '';
                      return {
                        time: r.created_at,
                        type: r.type,
                        attendee: r.attendee?.name || '',
                        email: r.attendee?.email || '',
                        ticket_type: r.attendee?.ticket_type || '',
                        session: r.session?.title || '',
                        meeting: meetingCode,
                        location: r.session?.location || r.meeting?.location || '',
                        code: r.scanned_code || ''
                      };
                    });

                    const header: string[] = [];
                    if (reportIncludes.timestamps) header.push('time');
                    header.push('type');
                    if (reportIncludes.attendeeInfo) header.push('attendee', 'email', 'code');
                    if (reportIncludes.ticketTypes) header.push('ticket_type');
                    if (reportIncludes.details) header.push('session', 'meeting', 'location');

                    const csvLines = [header.join(',')].concat(
                      rows.map((row: any) => header.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))
                    );

                    if (reportIncludes.summary) {
                      const total = rows.length;
                      const eventCount = rows.filter((r: any) => r.type === 'event').length;
                      const sessionCount = rows.filter((r: any) => r.type === 'session').length;
                      const b2bCount = rows.filter((r: any) => r.type === 'b2b').length;
                      const summaryRow = (label: string, value: string) => (
                        header.map((_, idx) => {
                          if (idx === 0) return label;
                          if (idx === 1) return value;
                          return '';
                        }).map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
                      );
                      csvLines.push('');
                      csvLines.push(summaryRow('Summary', ''));
                      csvLines.push(summaryRow('Total check-ins', String(total)));
                      csvLines.push(summaryRow('Event check-ins', String(eventCount)));
                      csvLines.push(summaryRow('Session check-ins', String(sessionCount)));
                      csvLines.push(summaryRow('B2B check-ins', String(b2bCount)));
                    }

                    const csv = csvLines.join('\n');

                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `event-${eventId}-checkins-${reportType}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);

                    setShowDownload(false);
                    toast.success(t('manageEvent.dayOf.toasts.reportDownloaded'));
                  } catch (e) {
                    console.error('Report download error', e);
                    toast.error(t('manageEvent.dayOf.toasts.reportFailed'));
                  }
                }}
                style={{
                  padding: '0 32px',
                  height: '44px',
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
                <Download size={18} />
                {t('manageEvent.dayOf.reportsModal.download')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes scan {
            0% { top: 30%; }
            50% { top: 60%; }
            100% { top: 30%; }
          }
        `}
      </style>
    </div>
  );
}
