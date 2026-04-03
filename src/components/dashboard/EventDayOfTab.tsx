import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import {
  Users,
  CheckCircle,
  Calendar,
  Handshake,
  QrCode,
  Eye,
  Download,
  Settings,
  Upload,
  Camera,
  Zap,
  Keyboard,
  X,
  Minimize,
  RefreshCw,
  ArrowRight,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Crown,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

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

export default function EventDayOfTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();

  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);

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

  const parseMaybeDate = (v: any) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        supabase.from('event_checkins').select('id', { head: true, count: 'exact' }).eq('event_id', eventId).eq('type', 'session'),
        supabase.from('event_sessions').select('id,title,location,starts_at,ends_at').eq('event_id', eventId).order('starts_at', { ascending: true }),
        supabase.from('event_b2b_meetings').select('id,start_at,end_at,status,attendee_a_id,attendee_b_id,location').eq('event_id', eventId).order('start_at', { ascending: true }).limit(200)
      ]);

      const sessionsData = sessionsRes.data || [];
      const meetingsData = meetingsRes.data || [];

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
          const photo = attendee.photo_url || attendee.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80';
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
        .select('attendee_settings')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      const base = data?.attendee_settings || {};
      setScannerSettingsBase(base);
      const stored = base.day_of?.scanner_settings || base.scanner_settings || {};
      setScannerSettings({ ...DEFAULT_SCANNER_SETTINGS, ...stored });
    } catch (e) {
      console.error('Failed to load scanner settings', e);
    }
  };

  const saveScannerSettings = async (nextSettings: ScannerSettings) => {
    if (!eventId) return false;
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
          if (item.attendee_id) {
            await supabase
              .from('event_attendees')
              .update({ checked_in: true, check_in_at: item.check_in_at || item.created_at })
              .eq('id', item.attendee_id);
          }

          await supabase
            .from('event_checkins')
            .insert([{
              event_id: eventId,
              attendee_id: item.attendee_id,
              type: item.type,
              session_id: item.session_id,
              meeting_id: item.meeting_id,
              scanned_code: item.scanned_code || null,
              created_at: item.created_at || new Date().toISOString()
            }]);

          if (item.type === 'b2b' && item.meeting_id) {
            const { data } = await supabase
              .from('event_checkins')
              .select('attendee_id')
              .eq('event_id', eventId)
              .eq('type', 'b2b')
              .eq('meeting_id', item.meeting_id);
            const unique = new Set((data || []).map((r: any) => r.attendee_id));
            if (unique.size >= 2) {
              await supabase
                .from('event_b2b_meetings')
                .update({ status: 'completed' })
                .eq('id', item.meeting_id);
            }
          }
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
      setSelectedMeeting(meetings[0].id);
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
    lastScanRef.current = null;
  };

  const handleCloseScanner = () => {
    setShowScanner(null);
    setScanResult(null);
    setManualEntryOpen(false);
    setLastScanDetails(null);
    setPendingDuplicate(null);
    setCameraError('');
    stopScannerCamera();
  };

  const stopScannerCamera = () => {
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

  const scanWithJsQR = (): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  const startScannerLoop = () => {
    if (scanIntervalRef.current !== null) return;
    const Detector = (window as any).BarcodeDetector;
    const useBarcodeDetector = !!Detector;
    const detector = useBarcodeDetector ? new Detector({ formats: ['qr_code'] }) : null;

    scanIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !showScanner || scanResult) return;
      if (scanLockRef.current) return;
      if (videoRef.current.readyState < 2) return;
      scanLockRef.current = true;
      try {
        let rawValue: string | null = null;
        if (detector) {
          const codes = await detector.detect(videoRef.current);
          rawValue = codes?.[0]?.rawValue || codes?.[0]?.data || null;
        } else {
          rawValue = scanWithJsQR();
        }
        if (rawValue) {
          await handleDetectedCode(rawValue);
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
      setCameraError('Camera access not available');
      toast.error(t('manageEvent.dayOf.toasts.cameraUnavailable'));
      return;
    }
    stopScannerCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setCameraError('');
      startScannerLoop();
    } catch (e) {
      setCameraError('Unable to access camera');
      toast.error(t('manageEvent.dayOf.toasts.cameraDenied'));
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
  const resolveAttendee = async (codeOrId: string) => {
    let raw = (codeOrId || '').trim();
    if (!raw) return null;

    // Extract UUID from URL if the QR code contains a full URL
    const uuidInUrl = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidInUrl && raw.includes('/')) {
      raw = uuidInUrl[0];
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
    const isEmail = raw.includes('@');

    let attendee: any = null;

    // 1. Try UUID / Primary ID
    if (isUuid) {
      const { data } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('id', raw)
        .maybeSingle();
      if (data) attendee = data;
    }

    // 2. Try Email
    if (!attendee && isEmail) {
      const { data } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', raw)
        .maybeSingle();
      if (data) attendee = data;
    }

    // 3. Try Standard Columns one by one
    if (!attendee) {
      for (const col of ['ticket_code', 'confirmation_code', 'qr_token']) {
        const { data } = await supabase
          .from('event_attendees')
          .select('*')
          .eq('event_id', eventId)
          .eq(col, raw)
          .maybeSingle();
        if (data) { attendee = data; break; }
      }
    }

    // 4. Fallback: try without event_id filter
    if (!attendee && isUuid) {
      const { data } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('id', raw)
        .maybeSingle();
      if (data) attendee = data;
    }

    if (!attendee) return null;

    // 6. Fetch Profile Avatar independently
    if (attendee.profile_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', attendee.profile_id)
        .maybeSingle();
      
      if (profile?.avatar_url) {
        attendee.photo_url = profile.avatar_url;
      }
    }

    return attendee;
  };

  const flattenProfilePhoto = (attendee: any) => {
    return attendee; // No longer needed as we merged it above
  };

  const insertCheckin = async (payload: any) => {
    const { data, error } = await supabase.from('event_checkins').insert([payload]).select('id').maybeSingle();
    if (error) throw error;
    return data;
  };

  const buildScanDetails = (attendee: any, kind: 'event' | 'session' | 'b2b', checkInAt: string, previousCount: number, firstCheckInAt?: string | null) => ({
    attendeeId: attendee.id,
    name: attendee.name || attendee.email || 'Attendee',
    email: attendee.email || '',
    company: attendee.company || '',
    photo: attendee.photo_url || attendee.avatar_url || attendee.meta?.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    ticketType: attendee.ticket_type || 'General',
    ticketCode: attendee.ticket_code || attendee.confirmation_code || attendee.qr_token || '',
    isVip: !!attendee.is_vip,
    kind,
    checkInTime: formatTime(checkInAt),
    firstCheckInTime: firstCheckInAt ? formatTime(firstCheckInAt) : '',
    previousCount
  });

  const doCheckin = async (kind: 'event' | 'session' | 'b2b', forcedAttendeeId?: string, codeOverride?: string) => {
    try {
      const code = (codeOverride || forcedAttendeeId || manualCode || '').trim();
      if (!code) {
        toast.error(t('manageEvent.dayOf.toasts.enterCode'));
        return;
      }

      const attendee = await resolveAttendee(code);
      if (!attendee?.id) {
        setScanResult('error');
        toast.error(t('manageEvent.dayOf.toasts.invalidCode'));
        return;
      }

      if (kind === 'session' && !selectedSession) {
        setScanResult('error');
        toast.error(t('manageEvent.dayOf.toasts.selectSession'));
        return;
      }

      if (kind === 'b2b' && !selectedMeeting) {
        setScanResult('error');
        toast.error(t('manageEvent.dayOf.toasts.selectMeeting'));
        return;
      }

      if (kind === 'b2b') {
        const localMeeting = meetings.find((mm: any) => mm.id === selectedMeeting);
        let meetingRecord = localMeeting;
        if (!meetingRecord) {
          const { data } = await supabase
            .from('event_b2b_meetings')
            .select('id,attendee_a_id,attendee_b_id')
            .eq('id', selectedMeeting)
            .maybeSingle();
          meetingRecord = data || null;
        }
        if (!meetingRecord) {
          setScanResult('error');
          toast.error(t('manageEvent.dayOf.toasts.meetingNotFound'));
          return;
        }
        if (meetingRecord.attendee_a_id !== attendee.id && meetingRecord.attendee_b_id !== attendee.id) {
          setScanResult('error');
          toast.error(t('manageEvent.dayOf.toasts.notAssigned'));
          return;
        }
      }

      let existingQuery = supabase
        .from('event_checkins')
        .select('id,created_at', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('attendee_id', attendee.id)
        .eq('type', kind);
      if (kind === 'session') existingQuery = existingQuery.eq('session_id', selectedSession);
      if (kind === 'b2b') existingQuery = existingQuery.eq('meeting_id', selectedMeeting);

      const { data: existingRows, count: existingCount } = await existingQuery
        .order('created_at', { ascending: true })
        .limit(1);
      const previousCount = existingCount || 0;
      const firstCheckInAt = existingRows?.[0]?.created_at || attendee.check_in_at || null;
      const hasDuplicate = kind === 'event'
        ? !!attendee.checked_in || previousCount > 0
        : previousCount > 0;

      const nowIso = new Date().toISOString();
      const details = buildScanDetails(attendee, kind, nowIso, previousCount, firstCheckInAt);

      if (hasDuplicate && scannerSettings.duplicatePolicy !== 'allow') {
        setLastScanDetails(details);
        setScanResult('duplicate');
        if (scannerSettings.duplicatePolicy === 'confirm') {
          setPendingDuplicate({
            attendee,
            kind,
            code,
            sessionId: selectedSession,
            meetingId: selectedMeeting,
            previousCount,
            firstCheckInAt
          });
        } else {
          setPendingDuplicate(null);
          toast.error(t('manageEvent.dayOf.toasts.duplicateBlocked'));
        }
        return;
      }

      const payload = {
        event_id: eventId,
        attendee_id: attendee.id,
        type: kind,
        session_id: kind === 'session' ? selectedSession : null,
        meeting_id: kind === 'b2b' ? selectedMeeting : null,
        scanned_code: forcedAttendeeId ? null : code
      };

      // Mark attendee as checked in
      if (!attendee.checked_in) {
        await supabase
          .from('event_attendees')
          .update({ checked_in: true, check_in_at: nowIso })
          .eq('id', attendee.id);
      }

      // Try to insert checkin log (non-blocking)
      try {
        await insertCheckin(payload);
      } catch (logErr) {
        console.error('Checkin log insert failed (non-blocking):', logErr);
      }

      // B2B meeting completion check
      if (kind === 'b2b' && selectedMeeting) {
        try {
          const { data } = await supabase
            .from('event_checkins')
            .select('attendee_id')
            .eq('event_id', eventId)
            .eq('type', 'b2b')
            .eq('meeting_id', selectedMeeting);
          const unique = new Set((data || []).map((r: any) => r.attendee_id));
          if (unique.size >= 2) {
            await supabase
              .from('event_b2b_meetings')
              .update({ status: 'completed' })
              .eq('id', selectedMeeting);
          }
        } catch { /* ignore */ }
      }

      setManualCode('');
      setScanResult('success');
      setLastScanDetails(details);
      setPendingDuplicate(null);
      toast.success(hasDuplicate ? t('manageEvent.dayOf.toasts.reentryLogged') : t('manageEvent.dayOf.toasts.checkInSuccess'));
      if (kind === 'session') setSessionCheckinCount((prev) => prev + 1);
      refreshDayOfData();
    } catch (e) {
      console.error('Check-in error', e);
      setScanResult('error');
      toast.error(t('manageEvent.dayOf.toasts.checkInFailed'));
    }
  };

  const handleNextScan = () => {
    setScanResult(null);
    setManualEntryOpen(false);
    setLastScanDetails(null);
    setPendingDuplicate(null);
    setManualCode('');
    lastScanRef.current = null;
  };

  const handleAllowDuplicate = async () => {
    if (scannerSettings.duplicatePolicy === 'block') {
      toast.error(t('manageEvent.dayOf.toasts.duplicateBlocked'));
      return;
    }
    if (!pendingDuplicate?.attendee) {
      toast.error(t('manageEvent.dayOf.toasts.noDuplicate'));
      return;
    }

    const { attendee, kind, code, sessionId, meetingId, previousCount, firstCheckInAt } = pendingDuplicate;
    const nowIso = new Date().toISOString();
    const details = buildScanDetails(attendee, kind, nowIso, previousCount || 0, firstCheckInAt || attendee.check_in_at);

    try {
      if (!attendee.checked_in) {
        await supabase
          .from('event_attendees')
          .update({ checked_in: true, check_in_at: nowIso })
          .eq('id', attendee.id);
      }

      await insertCheckin({
        event_id: eventId,
        attendee_id: attendee.id,
        type: kind,
        session_id: sessionId || null,
        meeting_id: meetingId || null,
        scanned_code: code || null
      });

      if (kind === 'b2b' && meetingId) {
        const { data } = await supabase
          .from('event_checkins')
          .select('attendee_id')
          .eq('event_id', eventId)
          .eq('type', 'b2b')
          .eq('meeting_id', meetingId);
        const unique = new Set((data || []).map((r: any) => r.attendee_id));
        if (unique.size >= 2) {
          await supabase
            .from('event_b2b_meetings')
            .update({ status: 'completed' })
            .eq('id', meetingId);
        }
      }
    } catch (e) {
      if (scannerSettings.offlineScanning) {
        const queue = readOfflineQueue();
        queue.push({
          event_id: eventId,
          attendee_id: attendee.id,
          type: kind,
          session_id: sessionId || null,
          meeting_id: meetingId || null,
          scanned_code: code || null,
          created_at: nowIso,
          check_in_at: nowIso
        });
        writeOfflineQueue(queue);
        setScanResult('success');
        setLastScanDetails(details);
        setPendingDuplicate(null);
        setManualCode('');
        toast.info(t('manageEvent.dayOf.toasts.queuedOffline'));
        return;
      }
      console.error('Check-in error', e);
      setScanResult('error');
      toast.error(t('manageEvent.dayOf.toasts.checkInFailed'));
      return;
    }

    setScanResult('success');
    setLastScanDetails(details);
    setPendingDuplicate(null);
    setManualCode('');
    toast.success(t('manageEvent.dayOf.toasts.reentryLogged'));
    if (kind === 'session') setSessionCheckinCount((prev) => prev + 1);
    refreshDayOfData();
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

            <button
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
            </button>

            <button
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
            </button>
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

          <button
            onClick={() => navigate(`/event/${eventId}?tab=reporting`)}
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
          </button>
        </div>
      </div>

      {/* SCANNER MODAL */}
      {showScanner && (
        <div
          className="event-dayof__scanner-overlay"
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
            zIndex: 200,
            padding: '40px',
            overflow: 'auto'
          }}
          onClick={handleCloseScanner}
        >
          <div
            className="event-dayof__scanner-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '900px',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 80px)',
              backgroundColor: '#1E3A5F',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0px 8px 32px rgba(0,0,0,0.5)',
              overflow: 'auto'
            }}
          >
            {/* Modal Header */}
            <div
              className="event-dayof__scanner-modal-header"
              style={{
                backgroundColor: showScanner === 'event' ? 'rgba(6,132,245,0.15)' :
                               showScanner === 'session' ? 'rgba(139,92,246,0.15)' :
                               'rgba(245,158,11,0.15)',
                padding: '24px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {showScanner === 'event' && <QrCode size={32} style={{ color: '#0684F5' }} />}
                {showScanner === 'session' && <Calendar size={32} style={{ color: '#8B5CF6' }} />}
                {showScanner === 'b2b' && <Handshake size={32} style={{ color: '#F59E0B' }} />}
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                    {showScanner === 'event' && t('manageEvent.dayOf.tools.event.title')}
                    {showScanner === 'session' && t('manageEvent.dayOf.tools.session.title')}
                    {showScanner === 'b2b' && t('manageEvent.dayOf.tools.b2b.title')}
                  </h2>
                  {showScanner === 'session' && (
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        marginTop: '8px'
                      }}
                    >
                      {sessions.length ? sessions.map((ss: any) => (
                        <option key={ss.id} value={ss.id}>
                          {ss.title}{ss.location ? ` - ${ss.location}` : ''}{ss.starts_at ? ` (${new Date(ss.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                        </option>
                      )) : (
                        <option value="" disabled>{t('manageEvent.dayOf.sessions.noSessions')}</option>
                      )}
                    </select>
                  )}
                  {showScanner === 'b2b' && (
                    <select
                      value={selectedMeeting}
                      onChange={(e) => setSelectedMeeting(e.target.value)}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        marginTop: '8px'
                      }}
                    >
                      {meetings.length ? meetings.map((mm: any) => (
                        <option key={mm.id} value={mm.id}>
                          Meeting #{mm.id?.toString().slice(0, 8)}{mm.start_at ? ` - ${new Date(mm.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </option>
                      )) : (
                        <option value="" disabled>{t('manageEvent.dayOf.meetings.noMeetings')}</option>
                      )}
                    </select>
                  )}
                </div>
                {showScanner === 'session' && selectedSession && (
                  <div
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'rgba(139,92,246,0.15)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Users size={14} />
                    {sessionCheckinCount} {t('manageEvent.dayOf.stats.checkedIn')}
                  </div>
                )}
                <div
                  className="event-dayof__scanner-status-badge"
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#10B981'
                  }}
                >
                  {t('manageEvent.dayOf.scanner.status')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCloseScanner}
                  style={{
                    width: '40px',
                    height: '40px',
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
                  <Minimize size={20} />
                </button>
                <button
                  onClick={handleCloseScanner}
                  style={{
                    width: '40px',
                    height: '40px',
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
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="event-dayof__modal-grid" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '60% 40%', gap: '32px' }}>
              
              {/* Left: Scanner Area */}
              <div>
                <div
                  className="event-dayof__camera-area"
                  style={{
                    width: '100%',
                    height: '400px',
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: cameraReady ? 0.9 : 0
                    }}
                  />
                  {/* Scanning overlay */}
                  <div style={{ position: 'absolute', top: '30%', left: '30%', width: '40%', height: '2px', backgroundColor: '#0684F5', animation: 'scan 2s linear infinite' }} />
                  
                  {/* Corner brackets */}
                  <svg style={{ position: 'absolute', width: '60%', height: '60%' }}>
                    <path d="M0,0 L50,0 M0,0 L0,50" stroke="#0684F5" strokeWidth="4" fill="none"/>
                    <path d="M300,0 L250,0 M300,0 L300,50" stroke="#0684F5" strokeWidth="4" fill="none"/>
                    <path d="M0,300 L50,300 M0,300 L0,250" stroke="#0684F5" strokeWidth="4" fill="none"/>
                    <path d="M300,300 L250,300 M300,300 L300,250" stroke="#0684F5" strokeWidth="4" fill="none"/>
                  </svg>

                  <div
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#FFFFFF'
                    }}
                  >
                    {cameraError || (scanResult ? t('manageEvent.dayOf.scanner.complete') : cameraReady ? t('manageEvent.dayOf.scanner.ready') : t('manageEvent.dayOf.scanner.initializing'))}
                  </div>
                </div>

                {/* Scanner Controls */}
                <div className="event-dayof__modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={() => setCameraFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                    style={{
                      height: '40px',
                      padding: '0 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Camera size={18} />
                    {t('manageEvent.dayOf.scanner.switchCamera')}
                  </button>
                  <button
                    onClick={toggleTorch}
                    style={{
                      width: '40px',
                      height: '40px',
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
                    <Zap size={18} />
                  </button>
                  <button
                    onClick={() => setManualEntryOpen(!manualEntryOpen)}
                    style={{
                      height: '40px',
                      padding: '0 20px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Keyboard size={18} />
                    {t('manageEvent.dayOf.scanner.manualEntry')}
                  </button>
                </div>

                {/* Manual Entry */}
                {manualEntryOpen && (
                  <div className="event-dayof__modal-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder={t('manageEvent.dayOf.scanner.placeholder')}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '0 16px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '15px'
                      }}
                    />
                    <button
                      onClick={() => {
                      if (showScanner === 'session') return doCheckin('session');
                      if (showScanner === 'b2b') return doCheckin('b2b');
                      return doCheckin('event');
                    }}
                      style={{
                        height: '48px',
                        padding: '0 24px',
                        backgroundColor: '#0684F5',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {t('manageEvent.dayOf.scanner.checkIn')}
                    </button>
                  </div>
                )}

              </div>

              {/* Right: Scan Results */}
              <div>
                {!scanResult && (
                  <div
                    style={{
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6B7280'
                    }}
                  >
                    <Users size={64} style={{ color: '#6B7280', marginBottom: '16px' }} />
                    <p style={{ fontSize: '15px', color: '#94A3B8', textAlign: 'center', maxWidth: '250px' }}>
                      {t('manageEvent.dayOf.empty.scanPrompt')}
                    </p>
                  </div>
                )}

                {scanResult === 'success' && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.15)',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '2px solid #10B981'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <CheckCircle size={56} style={{ color: '#10B981', margin: '0 auto 12px' }} />
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                        {t('manageEvent.dayOf.scanner.success.title')}
                      </h3>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <img
                        src={lastScanDetails?.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'}
                        alt={lastScanDetails?.name || 'Profile'}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          border: '3px solid #10B981',
                          margin: '0 auto 12px',
                          objectFit: 'cover'
                        }}
                      />
                      <h4 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                        {lastScanDetails?.name || 'Attendee'}
                      </h4>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(245,158,11,0.15)',
                          color: '#F59E0B',
                          marginBottom: '4px'
                        }}
                      >
                        {lastScanDetails?.ticketType || 'General'}
                      </span>
                      <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                        {lastScanDetails?.company || ''}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.lastScan.registration')}</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF' }}>{lastScanDetails?.ticketCode || lastScanDetails?.attendeeId || '-'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.lastScan.checkInTime')}</p>
                        <p style={{ fontSize: '14px', color: '#FFFFFF' }}>{lastScanDetails?.checkInTime || '-'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.lastScan.previous')}</p>
                        <p style={{ fontSize: '14px', color: '#10B981' }}>
                          {lastScanDetails?.previousCount ? t('manageEvent.dayOf.scanner.success.prior', { count: lastScanDetails.previousCount }) : t('manageEvent.dayOf.scanner.success.firstTime')}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t('manageEvent.dayOf.lastScan.email')}</p>
                        <p style={{ fontSize: '13px', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastScanDetails?.email || '-'}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => {
                          if (eventId) navigate(`/event/${eventId}?tab=attendees`);
                        }}
                        style={{
                          width: '100%',
                          height: '40px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {t('manageEvent.dayOf.scanner.success.viewProfile')}
                      </button>
                      <button
                        onClick={handleNextScan}
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
                        {t('manageEvent.dayOf.scanner.success.next')}
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {scanResult === 'error' && (
                  <div
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.15)',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '2px solid #EF4444',
                      textAlign: 'center'
                    }}
                  >
                    <XCircle size={56} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
                      {t('manageEvent.dayOf.scanner.error.invalid')}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
                      {t('manageEvent.dayOf.scanner.error.invalidDesc')}
                    </p>
                    <button
                      onClick={handleNextScan}
                      style={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {t('manageEvent.dayOf.scanner.error.tryAgain')}
                    </button>
                  </div>
                )}

                {scanResult === 'duplicate' && (
                  <div
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '2px solid #F59E0B'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <AlertCircle size={56} style={{ color: '#F59E0B', margin: '0 auto 12px' }} />
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#F59E0B' }}>
                        {t('manageEvent.dayOf.scanner.duplicate.title')}
                      </h3>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <img
                        src={lastScanDetails?.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'}
                        alt={lastScanDetails?.name || 'Profile'}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          border: '3px solid #F59E0B',
                          margin: '0 auto 12px',
                          objectFit: 'cover'
                        }}
                      />
                      <h4 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                        {lastScanDetails?.name || 'Attendee'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>
                        {lastScanDetails?.company || ''}
                      </p>
                      <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                        {t('manageEvent.dayOf.scanner.duplicate.first', { time: lastScanDetails?.firstCheckInTime || '-' })}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={handleAllowDuplicate}
                        style={{
                          width: '100%',
                          height: '40px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {t('manageEvent.dayOf.scanner.duplicate.allow')}
                      </button>
                      <button
                        onClick={handleNextScan}
                        style={{
                          width: '100%',
                          height: '48px',
                          backgroundColor: '#0684F5',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {t('manageEvent.dayOf.scanner.success.next')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Stats */}
                {scanResult && (
                  <div
                    style={{
                      marginTop: '24px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '16px',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.dayOf.metrics.scannedNow')}</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{scanResult ? 1 : 0}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.dayOf.metrics.totalToday')}</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{stats.totalScansToday}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.dayOf.metrics.scanRate')}</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{t('manageEvent.dayOf.metrics.perHour', { count: stats.checkInsLastHour })}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                { key: 'offlineScanning', label: t('manageEvent.dayOf.settings.toggles.offline'), helper: '', checked: scannerSettings.offlineScanning }
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
