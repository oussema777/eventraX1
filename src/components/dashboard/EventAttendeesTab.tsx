import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Plus,
  Download,
  Search,
  Filter,
  ChevronDown,
  Eye,
  MoreVertical,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  Mail,
  Edit,
  RefreshCw,
  QrCode,
  Trash,
  Phone,
  Linkedin,
  Utensils,
  Accessibility,
  User,
  Copy
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';

type AttendeeFormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  ticketType: string;
  ticketColor: string;
  price: string;
  status: 'pending' | 'approved' | 'declined';
  checkedIn: boolean;
  isVIP: boolean;
};

const emptyAttendeeForm: AttendeeFormState = {
  name: '',
  email: '',
  company: '',
  phone: '',
  ticketType: '',
  ticketColor: '#9CA3AF',
  price: '',
  status: 'pending',
  checkedIn: false,
  isVIP: false
};

export default function EventAttendeesTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [editingAttendee, setEditingAttendee] = useState<any>(null);
  const [attendeeForm, setAttendeeForm] = useState<AttendeeFormState>(emptyAttendeeForm);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'status' | 'checkin' | 'ticket'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventCapacity, setEventCapacity] = useState<number | null>(null);
  const [eventName, setEventName] = useState('');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [exportFields, setExportFields] = useState<Record<string, boolean>>({
    nameEmail: true,
    ticketPrice: true,
    registrationDate: true,
    checkInStatus: true,
    contact: true,
    dietary: true,
    notes: true
  });
  const [exportFilter, setExportFilter] = useState<'all' | 'approved' | 'pending' | 'checkedIn'>('all');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const listAnchorRef = useRef<HTMLDivElement | null>(null);

  const formatReg = (ts: string | null | undefined) => {
    if (!ts) return { regDate: '', regTime: '' };
    const d = new Date(ts);
    const regDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const regTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { regDate, regTime };
  };

  const formatCheckIn = (ts: string | null | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${date}, ${time}`;
  };

  const parseCsvRows = (text: string) => {
    const rows: string[][] = [];
    let row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
        continue;
      }
      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') {
          i += 1;
        }
        row.push(current);
        current = '';
        if (row.some((cell) => cell.trim() !== '')) rows.push(row);
        row = [];
        continue;
      }
      current += char;
    }
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
    return rows;
  };

  const normalizeHeader = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');

  const parseBoolean = (value: string) => {
    const normalized = (value || '').trim().toLowerCase();
    if (!normalized) return false;
    return ['true', 'yes', '1', 'y', 'checked', 'checkedin'].includes(normalized);
  };

  const loadAttendees = async () => {
    if (!eventId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load attendees:', error);
      toast.error(t('manageEvent.attendees.toasts.loadError'));
      setAttendees([]);
      setLoading(false);
      return;
    }
    const mapped = (data || []).map((row: any) => {
      const reg = formatReg(row.created_at);
      return {
        id: row.id,
        profileId: row.profile_id || row.profileId || null,
        createdAt: row.created_at,
        name: row.name || row.meta?.name || '',
        email: row.email || row.meta?.email || '',
        company: row.company || row.meta?.company || '',
        photo: row.photo_url || row.meta?.photo || '',
        ticketType: row.ticket_type || row.meta?.ticketType || 'General Admission',
        ticketColor: row.ticket_color || row.meta?.ticketColor || '#9CA3AF',
        price: typeof row.price === 'number' ? row.price : Number(row.price || row.meta?.price || 0),
        regDate: reg.regDate,
        regTime: reg.regTime,
        status: (row.status || 'pending').toLowerCase(),
        checkedIn: !!row.checked_in,
        checkInAt: row.check_in_at,
        checkInTime: row.check_in_at ? formatCheckIn(row.check_in_at) : '',
        isVIP: !!row.is_vip,
        phone: row.phone || row.meta?.phone || '',
        country: row.meta?.country || '',
        dietaryRequirements: row.meta?.dietaryRequirements || row.meta?.dietary || '',
        specialAssistance: row.meta?.specialAssistance || row.meta?.accessibility || '',
        dietary: row.meta?.dietaryRequirements || row.meta?.dietary || '',
        accessibility: row.meta?.specialAssistance || row.meta?.accessibility || '',
        jobTitle: row.meta?.jobTitle || row.meta?.job_title || '',
        linkedin: row.meta?.linkedin || '',
        notes: row.meta?.notes || '',
        interests: row.meta?.interests || [],
        sessions: row.meta?.sessions || [],
        isNew: !!row.meta?.isNew,
        confirmationCode: row.confirmation_code || row.meta?.confirmationCode || '',
        meta: row.meta || {}
      };
    });
    setAttendees(mapped);
    setLoading(false);
  };

  const loadEventDetails = async () => {
    if (!eventId) return;
    const { data, error } = await supabase
      .from('events')
      .select('capacity_limit,name')
      .eq('id', eventId)
      .maybeSingle();
    if (error) {
      console.error('Failed to load event details:', error);
      return;
    }
    setEventCapacity(data?.capacity_limit ?? null);
    setEventName(data?.name || '');
  };

  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const updateAttendee = async (id: string, patch: any) => {
    const payload: any = { ...patch };
    if ('checkedIn' in patch) {
      payload.checked_in = !!patch.checkedIn;
      delete payload.checkedIn;
      if (payload.checked_in && !payload.check_in_at) {
        payload.check_in_at = new Date().toISOString();
      }
      if (!payload.checked_in) {
        payload.check_in_at = null;
      }
    }
    if ('isVIP' in patch) {
      payload.is_vip = !!patch.isVIP;
      delete payload.isVIP;
    }
    if ('ticketType' in patch) { payload.ticket_type = patch.ticketType; delete payload.ticketType; }
    if ('ticketColor' in patch) { payload.ticket_color = patch.ticketColor; delete payload.ticketColor; }
    if ('confirmationCode' in patch) { payload.confirmation_code = patch.confirmationCode; delete payload.confirmationCode; }
    if ('photo' in patch) { payload.photo_url = patch.photo; delete payload.photo; }
    const { data, error } = await supabase
      .from('event_attendees')
      .update(payload)
      .eq('id', id)
      .eq('event_id', eventId)
      .select('id');
    if (error) {
      console.error('Failed to update attendee:', error);
      toast.error(t('manageEvent.attendees.toasts.saveError'));
      return false;
    }
    if (!data || data.length === 0) {
      console.error('No attendee updated (0 rows). Check RLS / ownership.');
      toast.error(t('manageEvent.attendees.toasts.saveBlocked'));
      return false;
    }
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              checkInAt: payload.check_in_at,
              checkInTime: payload.check_in_at ? formatCheckIn(payload.check_in_at) : ''
            }
          : a
      )
    );
    setSelectedAttendee((prev: any) =>
      prev?.id === id
        ? {
            ...prev,
            ...patch,
            checkInAt: payload.check_in_at,
            checkInTime: payload.check_in_at ? formatCheckIn(payload.check_in_at) : ''
          }
        : prev
    );
    return true;
  };

  const notifyAttendee = async (attendee: any, title: string, body: string, actionUrl?: string) => {
    if (!attendee?.profileId) return;
    try {
      await createNotification({
        recipient_id: attendee.profileId,
        actor_id: null,
        title,
        body,
        type: 'action',
        action_url: actionUrl || `/event/${eventId}`
      });
    } catch {
      // Ignore notification failures
    }
  };

  const deleteAttendee = async (id: string) => {
    const { data, error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('id', id)
      .eq('event_id', eventId)
      .select('id');
    if (error) {
      console.error('Failed to delete attendee:', error);
      toast.error(t('manageEvent.attendees.toasts.deleteError'));
      return false;
    }
    if (!data || data.length === 0) {
      console.error('No attendee deleted (0 rows). Check RLS / ownership.');
      toast.error(t('manageEvent.attendees.toasts.deleteBlocked'));
      return false;
    }
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    setSelectedAttendees((prev) => prev.filter((x) => x !== id));
    setSelectedAttendee((prev: any) => (prev?.id === id ? null : prev));
    if (selectedAttendee?.id === id) setShowDetailModal(false);
    return true;
  };

  const sortLabels: Record<string, string> = {
    recent: t('manageEvent.attendees.filters.sortOptions.recent'),
    name: t('manageEvent.attendees.filters.sortOptions.name'),
    status: t('manageEvent.attendees.filters.sortOptions.status'),
    checkin: t('manageEvent.attendees.filters.sortOptions.checkin'),
    ticket: t('manageEvent.attendees.filters.sortOptions.ticket')
  };

  const handleSortClick = () => {
    const order: Array<'recent' | 'name' | 'status' | 'checkin' | 'ticket'> = ['recent', 'name', 'status', 'checkin', 'ticket'];
    const idx = order.indexOf(sortOption);
    const next = order[(idx + 1) % order.length];
    setSortOption(next);
  };

  const handleReviewPending = () => {
    setActiveFilterTab('pending');
    setSearchTerm('');
    setCurrentPage(1);
    listAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAddModal = () => {
    setEditingAttendee(null);
    setAttendeeForm(emptyAttendeeForm);
    setShowAddModal(true);
  };

  const openEditModal = (attendee: any) => {
    setEditingAttendee(attendee);
    setAttendeeForm({
      name: attendee.name || '',
      email: attendee.email || '',
      company: attendee.company || '',
      phone: attendee.phone || '',
      ticketType: attendee.ticketType || '',
      ticketColor: attendee.ticketColor || '#9CA3AF',
      price: attendee.price != null ? String(attendee.price) : '',
      status: attendee.status || 'pending',
      checkedIn: !!attendee.checkedIn,
      isVIP: !!attendee.isVIP
    });
    setShowAddModal(true);
  };

  const handleSaveAttendee = async () => {
    if (!eventId) {
      toast.error(t('manageEvent.attendees.toasts.missingEvent'));
      return;
    }
    const name = attendeeForm.name.trim();
    if (!name) {
      toast.error(t('manageEvent.attendees.toasts.nameRequired'));
      return;
    }

    const priceValue = attendeeForm.price.trim();
    const parsedPrice = priceValue ? Number(priceValue) : null;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;

    const patch = {
      name,
      email: attendeeForm.email.trim(),
      company: attendeeForm.company.trim(),
      phone: attendeeForm.phone.trim(),
      ticketType: attendeeForm.ticketType.trim(),
      ticketColor: attendeeForm.ticketColor.trim() || '#9CA3AF',
      price,
      status: attendeeForm.status,
      checkedIn: attendeeForm.checkedIn,
      isVIP: attendeeForm.isVIP
    };

    if (editingAttendee?.id) {
      const ok = await updateAttendee(editingAttendee.id, patch);
      if (ok) {
        toast.success(t('manageEvent.attendees.toasts.updateSuccess'));
        setShowAddModal(false);
      }
      return;
    }

    const payload: any = {
      event_id: eventId,
      name: patch.name,
      email: patch.email || null,
      company: patch.company || null,
      phone: patch.phone || null,
      ticket_type: patch.ticketType || null,
      ticket_color: patch.ticketColor || '#9CA3AF',
      price: patch.price,
      status: patch.status,
      checked_in: patch.checkedIn,
      is_vip: patch.isVIP,
      check_in_at: patch.checkedIn ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('event_attendees')
      .insert([payload])
      .select('id');
    if (error) {
      console.error('Failed to add attendee:', error);
      toast.error(t('manageEvent.attendees.toasts.addError'));
      return;
    }
    if (!data || data.length === 0) {
      toast.error(t('manageEvent.attendees.toasts.addBlocked'));
      return;
    }
    toast.success(t('manageEvent.attendees.toasts.addSuccess'));
    setShowAddModal(false);
    await loadAttendees();
  };

  const handleImportClick = () => {
    if (!eventId) {
      toast.error(t('manageEvent.attendees.toasts.missingEvent'));
      return;
    }
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error(t('manageEvent.attendees.toasts.csvError'));
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsvRows(text);
      if (rows.length < 2) {
        toast.error(t('manageEvent.attendees.toasts.noRows'));
        event.target.value = '';
        return;
      }
      const headers = rows[0].map(normalizeHeader);
      const records = rows.slice(1).map((row) => {
        const record: Record<string, string> = {};
        headers.forEach((header, idx) => {
          record[header] = (row[idx] || '').trim();
        });
        return record;
      });

      const getValue = (record: Record<string, string>, keys: string[]) =>
        keys.map((key) => record[key]).find((value) => value && value.trim() !== '') || '';

      const inserts = records
        .map((record) => {
          const name = getValue(record, ['name', 'full_name', 'fullname', 'attendee_name']);
          if (!name) return null;
          const email = getValue(record, ['email']);
          const company = getValue(record, ['company']);
          const phone = getValue(record, ['phone', 'phone_number']);
          const ticketType = getValue(record, ['ticket_type', 'ticket', 'tickettype']);
          const ticketColor = getValue(record, ['ticket_color', 'ticketcolor']) || '#9CA3AF';
          const statusRaw = getValue(record, ['status']).toLowerCase();
          const status = ['approved', 'pending', 'declined'].includes(statusRaw) ? statusRaw : 'pending';
          const checkedIn = parseBoolean(getValue(record, ['checked_in', 'checkedin', 'check_in', 'checkin']));
          const isVIP = parseBoolean(getValue(record, ['is_vip', 'vip']));
          const priceValue = getValue(record, ['price']);
          const parsedPrice = priceValue ? Number(priceValue.replace(/[^0-9.-]/g, '')) : null;
          const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
          const confirmationCode = getValue(record, ['confirmation_code', 'confirmation']);

          const meta: Record<string, any> = {};
          const country = getValue(record, ['country']);
          const dietary = getValue(record, ['dietary', 'dietary_requirements']);
          const assistance = getValue(record, ['special_assistance', 'accessibility']);
          const linkedin = getValue(record, ['linkedin']);
          const notes = getValue(record, ['notes']);
          if (country) meta.country = country;
          if (dietary) meta.dietaryRequirements = dietary;
          if (assistance) meta.specialAssistance = assistance;
          if (linkedin) meta.linkedin = linkedin;
          if (notes) meta.notes = notes;

          return {
            event_id: eventId,
            name,
            email: email || null,
            company: company || null,
            phone: phone || null,
            ticket_type: ticketType || null,
            ticket_color: ticketColor || '#9CA3AF',
            price,
            status,
            checked_in: checkedIn,
            is_vip: isVIP,
            confirmation_code: confirmationCode || null,
            check_in_at: checkedIn ? new Date().toISOString() : null,
            meta
          };
        })
        .filter(Boolean) as any[];

      if (!inserts.length) {
        toast.error(t('manageEvent.attendees.toasts.noValidRows')); // Use existing or fallback key
        event.target.value = '';
        return;
      }

      const { data, error } = await supabase
        .from('event_attendees')
        .insert(inserts)
        .select('id');
      if (error) {
        console.error('Failed to import attendees:', error);
        toast.error(t('manageEvent.attendees.toasts.importFailed'));
        event.target.value = '';
        return;
      }
      toast.success(t('manageEvent.attendees.toasts.importSuccess', { count: data?.length || inserts.length }));
      await loadAttendees();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(t('manageEvent.attendees.toasts.importFailed'));
    } finally {
      event.target.value = '';
    }
  };

  const downloadCSV = (rows: Record<string, any>[], filename: string) => {
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const escape = (value: any) => {
      const val = value == null ? '' : String(value);
      if (/[\",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
      return val;
    };
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
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

  const exportToPdf = (rows: Record<string, any>[], title: string) => {
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) {
      toast.error('Popup blocked');
      return;
    }
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 18px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #E5E7EB; padding: 6px 8px; text-align: left; }
            th { background: #F3F4F6; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows
                .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`)
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const buildExportRows = (list: any[]) =>
    list.map((attendee) => {
      const row: Record<string, any> = {};
      if (exportFields.nameEmail) {
        row['Name'] = attendee.name;
        row['Email'] = attendee.email;
      }
      if (exportFields.ticketPrice) {
        row['Ticket Type'] = attendee.ticketType;
        row['Ticket Price'] = attendee.price;
      }
      if (exportFields.registrationDate) {
        row['Registration Date'] = attendee.regDate;
        row['Registration Time'] = attendee.regTime;
      }
      if (exportFields.checkInStatus) {
        row['Checked In'] = attendee.checkedIn ? 'Yes' : 'No';
        row['Check-in Time'] = attendee.checkInTime || '';
      }
      if (exportFields.contact) {
        row['Company'] = attendee.company;
        row['Phone'] = attendee.phone;
        row['LinkedIn'] = attendee.linkedin;
      }
      if (exportFields.dietary) {
        row['Dietary Requirements'] = attendee.dietaryRequirements;
        row['Special Assistance'] = attendee.specialAssistance;
      }
      if (exportFields.notes) {
        row['Notes'] = attendee.notes;
      }
      return row;
    });

  const filterExportList = (list: any[]) => {
    if (exportFilter === 'approved') return list.filter((a) => a.status === 'approved');
    if (exportFilter === 'pending') return list.filter((a) => a.status === 'pending');
    if (exportFilter === 'checkedIn') return list.filter((a) => a.checkedIn);
    return list;
  };

  const handleExportAttendees = (list: any[], formatOverride?: 'xlsx' | 'csv' | 'pdf') => {
    const hasFields = Object.values(exportFields).some(Boolean);
    if (!hasFields) {
      toast.error(t('manageEvent.attendees.toasts.selectField'));
      return false;
    }
    if (!list.length) {
      toast.error(t('manageEvent.attendees.toasts.noExport'));
      return false;
    }
    const rows = buildExportRows(list);
    const format = formatOverride || exportFormat;
    const stamp = new Date().toISOString().slice(0, 10);
    const filenameBase = `event-${eventId || 'attendees'}-${stamp}`;
    if (format === 'pdf') {
      exportToPdf(rows, 'Attendees Export');
      return true;
    }
    const extension = format === 'xlsx' ? 'xlsx' : 'csv';
    downloadCSV(rows, `${filenameBase}.${extension}`);
    return true;
  };

  const handleExportConfirm = () => {
    const list = filterExportList(attendees);
    const ok = handleExportAttendees(list);
    if (ok) {
      setShowExportModal(false);
      toast.success(t('manageEvent.attendees.toasts.exportSuccess'));
    }
  };

  const handleExportSelected = () => {
    const list = attendees.filter((a) => selectedAttendees.includes(a.id));
    const ok = handleExportAttendees(list, 'csv');
    if (ok) {
      setSelectedAttendees([]);
      toast.success(t('manageEvent.attendees.toasts.exportSuccess'));
    }
  };

  const handleBulkStatusUpdate = async (status: 'approved' | 'declined') => {
    if (!selectedAttendees.length) return;
    const { data, error } = await supabase
      .from('event_attendees')
      .update({ status })
      .in('id', selectedAttendees)
      .eq('event_id', eventId)
      .select('id');
    if (error) {
      console.error('Bulk update failed:', error);
      toast.error(t('manageEvent.attendees.toasts.bulkUpdateError'));
      return;
    }
    const updatedIds = new Set((data || []).map((row: any) => row.id));
    setAttendees((prev) => prev.map((a) => (updatedIds.has(a.id) ? { ...a, status } : a)));
    setSelectedAttendees([]);
    setSelectedAttendee((prev: any) => (prev?.id && updatedIds.has(prev.id) ? { ...prev, status } : prev));
    const affected = attendees.filter((attendee) => updatedIds.has(attendee.id));
    await Promise.all(
      affected.map((attendee) =>
        notifyAttendee(
          attendee,
          status === 'approved' ? 'Registration approved' : 'Registration declined',
          `Your registration for ${eventName || 'this event'} was ${status}.`,
          `/event/${eventId}/landing`
        )
      )
    );
    toast.success(t('manageEvent.attendees.toasts.bulkUpdateSuccess', { status }));
  };

  const handleBulkDelete = async () => {
    if (!selectedAttendees.length) return;
    const { data, error } = await supabase
      .from('event_attendees')
      .delete()
      .in('id', selectedAttendees)
      .eq('event_id', eventId)
      .select('id');
    if (error) {
      console.error('Bulk delete failed:', error);
      toast.error(t('manageEvent.attendees.toasts.bulkDeleteError'));
      return;
    }
    const deletedIds = new Set((data || []).map((row: any) => row.id));
    setAttendees((prev) => prev.filter((a) => !deletedIds.has(a.id)));
    setSelectedAttendees([]);
    const affected = attendees.filter((attendee) => deletedIds.has(attendee.id));
    await Promise.all(
      affected.map((attendee) =>
        notifyAttendee(
          attendee,
          'Registration removed',
          `Your registration for ${eventName || 'this event'} was removed.`,
          `/event/${eventId}/landing`
        )
      )
    );
    if (selectedAttendee?.id && deletedIds.has(selectedAttendee.id)) {
      setSelectedAttendee(null);
      setShowDetailModal(false);
    }
    toast.error(t('manageEvent.attendees.toasts.bulkDeleteSuccess'));
  };

  const counts = useMemo(() => {
    const total = attendees.length;
    const approved = attendees.filter((a) => a.status === 'approved').length;
    const pending = attendees.filter((a) => a.status === 'pending').length;
    const declined = attendees.filter((a) => a.status === 'declined').length;
    const checkedIn = attendees.filter((a) => a.checkedIn).length;
    const vip = attendees.filter((a) => a.isVIP).length;
    const noShows = attendees.filter((a) => a.status === 'approved' && !a.checkedIn).length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = attendees.filter((a) => a.createdAt && new Date(a.createdAt) >= weekAgo).length;
    return { total, approved, pending, declined, checkedIn, vip, noShows, thisWeek };
  }, [attendees]);

  const pageSize = 50;

  const filteredAttendees = useMemo(() => {
    let list = attendees;
    if (activeFilterTab === 'approved') list = list.filter((a) => a.status === 'approved');
    else if (activeFilterTab === 'pending') list = list.filter((a) => a.status === 'pending');
    else if (activeFilterTab === 'declined') list = list.filter((a) => a.status === 'declined');
    else if (activeFilterTab === 'checkedIn') list = list.filter((a) => a.checkedIn);
    else if (activeFilterTab === 'vip') list = list.filter((a) => a.isVIP);
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.ticketType || '').toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [attendees, activeFilterTab, searchTerm]);

  const sortedAttendees = useMemo(() => {
    const list = [...filteredAttendees];
    if (sortOption === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'status') {
      list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    } else if (sortOption === 'checkin') {
      list.sort((a, b) => {
        const checkDiff = Number(!!b.checkedIn) - Number(!!a.checkedIn);
        if (checkDiff !== 0) return checkDiff;
        return new Date(b.checkInAt || 0).getTime() - new Date(a.checkInAt || 0).getTime();
      });
    } else if (sortOption === 'ticket') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return list;
  }, [filteredAttendees, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedAttendees.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilterTab, searchTerm, sortOption]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleAttendees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAttendees.slice(start, start + pageSize);
  }, [sortedAttendees, currentPage, pageSize]);

  const handleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedAttendees((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedAttendees((prev) => Array.from(new Set([...prev, ...pageIds])));
  };

  const handleSelectAttendee = (id: string) => {
    if (selectedAttendees.includes(id)) {
      setSelectedAttendees(selectedAttendees.filter(aId => aId !== id));
    } else {
      setSelectedAttendees([...selectedAttendees, id]);
    }
  };

  const handleViewAttendee = (attendee: any) => {
    setSelectedAttendee(attendee);
    setShowDetailModal(true);
  };

  const handleApproveAttendee = async (attendee: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    const ok = await updateAttendee(attendee.id, { status: 'approved' });
    if (ok) {
      toast.success(t('manageEvent.attendees.toasts.approved', { name: attendee.name }));
      await notifyAttendee(
        attendee,
        'Registration approved',
        `Your registration for ${eventName || 'this event'} was approved.`,
        `/event/${eventId}/landing`
      );
    }
  };

  const handleDeclineAttendee = async (attendee: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    const ok = await updateAttendee(attendee.id, { status: 'declined' });
    if (ok) {
      toast.error(t('manageEvent.attendees.toasts.declined', { name: attendee.name }));
      await notifyAttendee(
        attendee,
        'Registration declined',
        `Your registration for ${eventName || 'this event'} was declined.`,
        `/event/${eventId}/landing`
      );
    }
  };

  const handleDropdownAction = async (action: string, attendee: any) => {
    setOpenDropdownId(null);
    switch (action) {
      case 'edit':
        openEditModal(attendee);
        break;
      case 'email':
        if (attendee.email) {
          window.location.href = `mailto:${attendee.email}`;
        } else {
          toast.error(t('manageEvent.attendees.toasts.noEmail'));
        }
        break;
      case 'resend':
        toast.success(t('manageEvent.attendees.toasts.resendSuccess', { name: attendee.name }));
        break;
      case 'checkin': {
        const nextChecked = !attendee.checkedIn;
        const ok = await updateAttendee(attendee.id, { checkedIn: nextChecked });
        if (ok) {
          toast.success(t('manageEvent.attendees.toasts.checkinSuccess', { name: attendee.name, status: nextChecked ? 'checked in' : 'unchecked' }));
          await notifyAttendee(
            attendee,
            nextChecked ? 'Check-in complete' : 'Check-in removed',
            nextChecked
              ? `You were checked in for ${eventName || 'the event'}.`
              : `Your check-in was removed for ${eventName || 'the event'}.`,
            `/event/${eventId}`
          );
        }
        break;
      }
      case 'vip': {
        const nextVip = !attendee.isVIP;
        const ok = await updateAttendee(attendee.id, { isVIP: nextVip });
        if (ok) {
          toast.success(t('manageEvent.attendees.toasts.vipSuccess', { name: attendee.name, status: nextVip ? 'marked as VIP' : 'removed from VIP' }));
          await notifyAttendee(
            attendee,
            nextVip ? 'VIP status added' : 'VIP status removed',
            nextVip
              ? `You were marked VIP for ${eventName || 'this event'}.`
              : `Your VIP status was removed for ${eventName || 'this event'}.`,
            `/event/${eventId}`
          );
        }
        break;
      }
      case 'qr':
        toast.info(t('manageEvent.attendees.toasts.qrInfo', { name: attendee.name }));
        break;
      case 'delete': {
        const ok = await deleteAttendee(attendee.id);
        if (ok) {
          toast.error(t('manageEvent.attendees.toasts.deleteSuccess', { name: attendee.name }));
          await notifyAttendee(
            attendee,
            'Registration removed',
            `Your registration for ${eventName || 'this event'} was removed.`,
            `/event/${eventId}/landing`
          );
        }
        break;
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      approved: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10B981', icon: CheckCircle, label: t('manageEvent.attendees.filters.approved') },
      pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B', icon: Clock, label: t('manageEvent.attendees.filters.pending') },
      declined: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#EF4444', icon: XCircle, label: t('manageEvent.attendees.filters.declined') }
    };
    const key = (status || 'pending').toLowerCase() as keyof typeof configs;
    return configs[key] || configs.pending;
  };

  const pageIds = useMemo(() => visibleAttendees.map((attendee) => attendee.id), [visibleAttendees]);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedAttendees.includes(id));
  const pageButtons = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
      if (i > 1 && i < totalPages) pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result: Array<number | string> = [];
    let prev = 0;
    sorted.forEach((page) => {
      if (prev && page - prev > 1) result.push('...');
      result.push(page);
      prev = page;
    });
    return result;
  }, [currentPage, totalPages]);
  const startIndex = sortedAttendees.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, sortedAttendees.length);
  const capacityPercent = eventCapacity && eventCapacity > 0 ? Math.min(100, Math.round((counts.total / eventCapacity) * 100)) : 0;
  const capacityLabel = eventCapacity ? t('manageEvent.attendees.stats.capacity', { percent: capacityPercent, total: eventCapacity }) : t('manageEvent.attendees.stats.capacityUnset');
  const attendanceRate = counts.total ? Math.round((counts.checkedIn / counts.total) * 100) : 0;
  const attendanceLabel = t('manageEvent.attendees.stats.attendanceRate', { percent: attendanceRate });
  const growthLabel = t('manageEvent.attendees.stats.growth', { count: counts.thisWeek });

  return (
    <div 
      className="event-attendees p-8" 
      style={{ backgroundColor: '#0B2641', paddingBottom: '80px', overflowX: 'hidden' }}
      onClick={() => setOpenDropdownId(null)}
    >
      <style>{`
        @media (max-width: 600px) {
          .event-attendees {
            padding: 24px 16px 80px;
          }

          .event-attendees__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-attendees__actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-attendees__actions button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 400px) {
          .event-attendees {
            padding: 20px 12px 72px;
          }
        }
      `}</style>
      <div style={{ maxWidth: '100%', width: '100%' }}>
        {/* PAGE HEADER */}
        <div className="event-attendees__header flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('manageEvent.attendees.header.title')}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('manageEvent.attendees.header.subtitle')}
            </p>
          </div>
          <div className="event-attendees__actions flex items-center gap-3">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-5 rounded-lg border transition-colors"
              style={{
                height: '44px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Upload size={18} />
              {t('manageEvent.attendees.header.import')}
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 rounded-lg border transition-colors"
              style={{
                height: '44px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              {t('manageEvent.attendees.header.add')}
            </button>
            <button
              onClick={() => {
                setExportFormat('xlsx');
                setShowExportModal(true);
              }}
              className="flex items-center gap-2 px-5 rounded-lg transition-colors"
              style={{
                height: '44px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              {t('manageEvent.attendees.header.export')}
            </button>
          </div>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />

        {/* ATTENDEE STATS ROW */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Total Attendees */}
          <div
            className="rounded-xl p-6 border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}
            >
              <Users size={24} style={{ color: '#0684F5' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.attendees.stats.total')}</p>
             <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
               {counts.total}
             </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {capacityLabel}
            </p>
            <div className="flex items-center gap-1" style={{ fontSize: '12px', color: '#10B981' }}>
              <TrendingUp size={12} />
              <span>{growthLabel}</span>
            </div>
          </div>

          {/* Pending Approval */}
          <div
            className="rounded-xl p-6 border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
            >
              <Clock size={24} style={{ color: '#F59E0B' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.attendees.stats.pending')}</p>
             <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
               {counts.pending}
             </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.attendees.stats.awaiting')}
            </p>
            <button
              onClick={handleReviewPending}
              style={{ fontSize: '12px', color: '#0684F5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('manageEvent.attendees.stats.review')}
            </button>
          </div>

          {/* Checked In */}
          <div
            className="rounded-xl p-6 border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <CheckCircle size={24} style={{ color: '#10B981' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.attendees.stats.checkedIn')}</p>
             <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
               {counts.checkedIn}
             </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
              {attendanceLabel}
            </p>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div style={{ width: `${attendanceRate}%`, height: '100%', backgroundColor: '#10B981' }} />
            </div>
          </div>

          {/* No-Shows */}
          <div
            className="rounded-xl p-6 border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
            >
              <XCircle size={24} style={{ color: '#EF4444' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
              {t('manageEvent.attendees.stats.noShows')}</p>
             <h3 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
               {counts.noShows}
             </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              {counts.total ? t('manageEvent.attendees.stats.noShowRate', { percent: Math.round((counts.noShows / counts.total) * 100) }) : t('manageEvent.attendees.stats.noShowRate', { percent: 0 })}
            </p>
          </div>
        </div>

        {/* FILTER & ACTIONS BAR */}
        <div
          ref={listAnchorRef}
          className="rounded-xl p-5 mb-6 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', overflowX: 'auto' }}>
              {[ 
                { id: 'all', label: t('manageEvent.attendees.filters.all'), count: counts.total },
                { id: 'approved', label: t('manageEvent.attendees.filters.approved'), count: counts.approved },
                { id: 'pending', label: t('manageEvent.attendees.filters.pending'), count: counts.pending },
                { id: 'declined', label: t('manageEvent.attendees.filters.declined'), count: counts.declined },
                { id: 'checkedIn', label: t('manageEvent.attendees.filters.checkedIn'), count: counts.checkedIn },
                { id: 'vip', label: t('manageEvent.attendees.filters.vip'), count: counts.vip }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: activeFilterTab === tab.id ? '#0684F5' : 'transparent',
                    color: activeFilterTab === tab.id ? '#FFFFFF' : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      fontSize: '11px',
                      color: '#FFFFFF'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <div className="relative" style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '400px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8'
                  }}
                />
                <input
                  type="text"
                  placeholder={t('manageEvent.attendees.filters.search')}
                  className="rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setActiveFilterTab('all');
                  setSearchTerm('');
                  setSortOption('recent');
                  setCurrentPage(1);
                  toast.success(t('manageEvent.attendees.toasts.filterReset'));
                }}
                className="flex items-center justify-center rounded-lg transition-colors"
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                <Filter size={20} style={{ color: '#FFFFFF' }} />
              </button>
              <button
                onClick={handleSortClick}
                className="flex items-center gap-2 px-4 rounded-lg"
                style={{
                  height: '44px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.attendees.filters.sort', { option: sortLabels[sortOption] })}
                <ChevronDown size={16} style={{ color: '#94A3B8' }} />
              </button>
            </div>
          </div>
        </div>

        {/* ATTENDEES TABLE */}
        <div
          className="rounded-xl border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            overflowX: 'auto'
          }}
        >
          <div style={{ minWidth: '1200px' }}>
            {/* Table Header */}
            <div
              className="flex items-center px-6 py-4 border-b"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ width: '5%', minWidth: '50px' }}>
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={handleSelectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <div style={{ width: '35%', minWidth: '300px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('manageEvent.attendees.table.headers.attendee')}
              </div>
              <div style={{ width: '18%', minWidth: '160px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('manageEvent.attendees.table.headers.date')}
              </div>
              <div style={{ width: '15%', minWidth: '140px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('manageEvent.attendees.table.headers.status')}
              </div>
              <div style={{ width: '17%', minWidth: '150px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('manageEvent.attendees.table.headers.checkin')}
              </div>
              <div style={{ width: '10%', minWidth: '80px', fontSize: '12px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('manageEvent.attendees.table.headers.actions')}
              </div>
            </div>

          {/* Table Rows */}
          {visibleAttendees.map((attendee) => {
            const statusConfig = getStatusBadge(attendee.status);
            const isDeclined = attendee.status === 'declined';
            
            return (
              <div
                key={attendee.id}
                onClick={() => handleViewAttendee(attendee)}
                className="flex items-center px-6 py-5 border-b transition-all cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  opacity: isDeclined ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                {/* Checkbox */}
                <div style={{ width: '5%', minWidth: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedAttendees.includes(attendee.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectAttendee(attendee.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {/* Attendee */}
                <div style={{ width: '35%', minWidth: '300px' }} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={attendee.photo}
                      alt={attendee.name}
                      className="rounded-full"
                      style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'cover',
                        border: '2px solid rgba(255, 255, 255, 0.15)'
                      }}
                    />
                    {attendee.isVIP && (
                      <div
                        className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#FFA500'
                        }}
                      >
                        <Star size={12} style={{ color: '#FFFFFF', fill: '#FFFFFF' }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                        {attendee.name}
                      </p>
                      {attendee.isGroupLeader && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(6, 132, 245, 0.15)',
                            color: '#0684F5',
                            fontSize: '10px',
                            fontWeight: 600
                          }}
                        >
                          {t('manageEvent.attendees.table.rows.groupLeader')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {attendee.email}
                    </p>
                    {attendee.company && (
                      <p style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                        {attendee.company}
                      </p>
                    )}
                    {attendee.isGroupLeader && attendee.groupSize && (
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        {t('manageEvent.attendees.table.rows.groupSize', { count: attendee.groupSize })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Registration Date */}
                <div style={{ width: '18%', minWidth: '160px' }}>
                  <p style={{ fontSize: '14px', color: '#FFFFFF' }}>
                    {attendee.regDate}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {attendee.regTime}
                  </p>
                  {attendee.isNew && (
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        fontSize: '10px',
                        fontWeight: 600
                      }}
                    >
                      {t('manageEvent.attendees.table.rows.new')}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div style={{ width: '15%', minWidth: '140px' }}>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: statusConfig.bg,
                      border: `1px solid ${statusConfig.border}`,
                      color: statusConfig.color,
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    <statusConfig.icon size={12} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Check-in */}
                <div style={{ width: '17%', minWidth: '150px' }}>
                  {attendee.checkedIn ? (
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.15)',
                          border: '1px solid rgba(6, 132, 245, 0.3)',
                          color: '#0684F5',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        <Check size={12} />
                        {t('manageEvent.attendees.table.rows.checkedIn')}
                      </span>
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                        {attendee.checkInTime}
                      </p>
                    </div>
                  ) : attendee.status === 'declined' ? (
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>—</span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.15)',
                        border: '1px solid rgba(107, 114, 128, 0.3)',
                        color: '#9CA3AF',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      {t('manageEvent.attendees.table.rows.notYet')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ width: '10%', minWidth: '100px', position: 'relative' }} className="flex items-center justify-center gap-2">
                  {attendee.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => handleApproveAttendee(attendee, e)}
                        className="flex items-center justify-center rounded-lg transition-colors"
                        title={t('manageEvent.attendees.table.actions.approve')}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1.5px solid rgba(16, 185, 129, 0.4)',
                          color: '#10B981',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => handleDeclineAttendee(attendee, e)}
                        className="flex items-center justify-center rounded-lg transition-colors"
                        title={t('manageEvent.attendees.table.actions.decline')}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1.5px solid rgba(239, 68, 68, 0.4)',
                          color: '#EF4444',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === attendee.id ? null : attendee.id);
                    }}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Three-dot Dropdown Menu */}
                  {openDropdownId === attendee.id && (
                    <div
                      className="absolute rounded-lg overflow-hidden"
                      style={{
                        top: '40px',
                        right: '0',
                        width: '220px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                        zIndex: 50
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setOpenDropdownId(null);
                          handleViewAttendee(attendee);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0B2641',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Eye size={16} style={{ color: '#0B2641' }} />
                        {t('manageEvent.attendees.table.actions.view')}
                      </button>
                      {attendee.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => handleApproveAttendee(attendee, e)}
                            className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#10B981',
                              fontSize: '14px',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Check size={16} style={{ color: '#10B981' }} />
                            {t('manageEvent.attendees.table.actions.approve')}
                          </button>
                          <button
                            onClick={(e) => handleDeclineAttendee(attendee, e)}
                            className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#EF4444',
                              fontSize: '14px',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <X size={16} style={{ color: '#EF4444' }} />
                            {t('manageEvent.attendees.table.actions.decline')}
                          </button>
                          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />
                        </>
                      )}
                      <button
                        onClick={() => handleDropdownAction('edit', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0B2641',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit size={16} style={{ color: '#0B2641' }} />
                        {t('manageEvent.attendees.table.actions.edit')}
                      </button>
                      <button
                        onClick={() => handleDropdownAction('email', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0B2641',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Mail size={16} style={{ color: '#0B2641' }} />
                        {t('manageEvent.attendees.table.actions.email')}
                      </button>
                      <button
                        onClick={() => handleDropdownAction('resend', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0B2641',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <RefreshCw size={16} style={{ color: '#0B2641' }} />
                        {t('manageEvent.attendees.table.actions.resend')}
                      </button>
                      <button
                        onClick={() => handleDropdownAction('checkin', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#10B981',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Check size={16} style={{ color: '#10B981' }} />
                        {t('manageEvent.attendees.table.actions.checkin')}
                      </button>
                      <button
                        onClick={() => handleDropdownAction('vip', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#F59E0B',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Star size={16} style={{ color: '#F59E0B' }} />
                        {t('manageEvent.attendees.table.actions.vip')}
                      </button>
                      <button
                        onClick={() => handleDropdownAction('qr', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#0684F5',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <QrCode size={16} style={{ color: '#0684F5' }} />
                        {t('manageEvent.attendees.table.actions.qr')}
                      </button>
                      <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />
                      <button
                        onClick={() => handleDropdownAction('delete', attendee)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#EF4444',
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash size={16} style={{ color: '#EF4444' }} />
                        {t('manageEvent.attendees.table.actions.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-2 mt-6" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 rounded-lg"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={16} />
            {t('manageEvent.attendees.pagination.previous')}
          </button>
          
          {pageButtons.map((page, idx) => (
            <button
              key={idx}
              className="rounded-lg"
              onClick={() => {
                if (typeof page === 'number') setCurrentPage(page);
              }}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: page === currentPage ? '#0684F5' : 'transparent',
                border: page === currentPage ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                color: page === currentPage ? '#FFFFFF' : '#94A3B8',
                fontSize: '14px',
                fontWeight: page === currentPage ? 700 : 500,
                cursor: page === '...' ? 'default' : 'pointer'
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-2 px-4 rounded-lg transition-colors"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1
            }}
          >
            {t('manageEvent.attendees.pagination.next')}
            <ChevronRight size={16} />
          </button>

          <div style={{ width: '16px' }} />

          <p style={{ fontSize: '14px', color: '#94A3B8' }}>
            {t('manageEvent.attendees.pagination.showing', { start: startIndex, end: endIndex, total: sortedAttendees.length })}
          </p>
        </div>

        {/* BULK ACTIONS BAR */}
        {selectedAttendees.length > 0 && (
          <div
            className="fixed rounded-t-xl px-8 py-4"
            style={{
              bottom: 0,
              left: '80px', // Adjusted to match w-20 sidebar (80px)
              right: 0,
              backgroundColor: '#0D3052',
              borderTop: '2px solid #0684F5',
              boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(6, 132, 245, 0.2)' }}
              >
                <Users size={20} style={{ color: '#0684F5' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('manageEvent.attendees.bulk.selected', { count: selectedAttendees.length })}
                </p>
                <button
                  onClick={() => setSelectedAttendees([])}
                  style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {t('manageEvent.attendees.bulk.deselect')}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkStatusUpdate('approved')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#0D9463] text-white text-sm font-bold transition-all shadow-lg"
              >
                <CheckCircle size={18} />
                {t('manageEvent.attendees.bulk.approve')}
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('declined')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-bold transition-all shadow-lg"
              >
                <XCircle size={18} />
                {t('manageEvent.attendees.bulk.decline')}
              </button>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
              <button
                onClick={handleExportSelected}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all"
              >
                <Download size={18} />
                {t('manageEvent.attendees.bulk.export')}
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-[#EF4444] text-sm font-semibold transition-all"
              >
                <Trash size={18} />
                {t('manageEvent.attendees.bulk.delete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
