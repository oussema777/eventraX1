import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, Mail, Send, Filter, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, Eye, Save, RotateCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createNotification } from '../../lib/notifications';
import { sendEmail } from '../../lib/email';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

interface Props {
  eventId: string | undefined;
}

type SubTab = 'settings' | 'broadcast' | 'log';

interface TriggerType {
  key: string;
  label: string;
  description: string;
  defaultSubject: string;
  defaultBody: string;
}

const TRIGGER_KEYS = [
  { key: 'meeting_booked', i18nKey: 'meetingBooked', defaultSubject: 'Meeting Request: {{recipient_name}} at {{event_name}}', defaultBody: 'Hi {{recipient_name}},\n\nYou have a new meeting request from {{organizer_name}} for {{event_name}}.\n\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nLocation: {{location}}\n\nPlease review and confirm your meeting.\n\nBest regards,\n{{event_name}} Team' },
  { key: 'event_registration', i18nKey: 'eventRegistration', defaultSubject: 'Registration Confirmed: {{event_name}}', defaultBody: 'Hi {{attendee_name}},\n\nYour registration for {{event_name}} is confirmed!\n\nYour check-in QR code is attached. Please show it at the entrance.\n\nWe look forward to seeing you!\n\nBest regards,\n{{event_name}} Team' },
  { key: 'form_submitted', i18nKey: 'formSubmitted', defaultSubject: 'Form Received: {{event_name}}', defaultBody: 'Hi {{attendee_name}},\n\nThank you for completing the form for {{event_name}}.\n\nYour submission has been recorded successfully.\n\nBest regards,\n{{event_name}} Team' },
  { key: 'session_reminder', i18nKey: 'sessionReminder', defaultSubject: 'Session Starting Soon: {{session_title}} — {{event_name}}', defaultBody: 'Hi {{attendee_name}},\n\nThis is a reminder that your session "{{session_title}}" starts soon.\n\nTime: {{session_time}}\nRoom: {{session_location}}\n\nSee you there!\n\n{{event_name}} Team' },
];

const buildTriggerTypes = (t: (key: string) => string): TriggerType[] =>
  TRIGGER_KEYS.map(tk => ({
    key: tk.key,
    label: t(`manageEvent.notifications.triggers.${tk.i18nKey}.label`),
    description: t(`manageEvent.notifications.triggers.${tk.i18nKey}.description`),
    defaultSubject: tk.defaultSubject,
    defaultBody: tk.defaultBody,
  }));

interface NotificationSetting {
  trigger_type: string;
  is_email_enabled: boolean;
  is_bell_enabled: boolean;
  custom_subject: string | null;
  custom_body: string | null;
}

interface EmailDraft {
  subject: string;
  body: string;
}

interface NotificationLog {
  id: string;
  trigger_type: string;
  channel: string;
  status: string;
  sent_at: string;
  recipient_id: string;
}

interface Attendee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

// ── Email HTML preview renderer ───────────────────────────────────────────────
function buildPreviewHtml(subject: string, body: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{margin:0;padding:20px;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
    .card{background:#fff;border-radius:12px;padding:28px 32px;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;}
    .header{border-bottom:3px solid #0684F5;padding-bottom:14px;margin-bottom:20px;}
    .logo{font-size:18px;font-weight:800;color:#0684F5;letter-spacing:-0.5px;}
    .subject{font-size:20px;font-weight:700;color:#111827;margin:0 0 18px;}
    .body{font-size:14px;color:#374151;line-height:1.7;}
    .tag{display:inline-block;background:#EFF6FF;color:#0684F5;border-radius:4px;padding:1px 6px;font-size:11px;font-family:monospace;}
    .footer{border-top:1px solid #f1f5f9;margin-top:28px;padding-top:14px;font-size:11px;color:#9ca3af;text-align:center;}
  </style></head><body>
  <div class="card">
    <div class="header"><span class="logo">Eventra</span></div>
    <div class="subject">${subject || '<em style="color:#9ca3af">No subject</em>'}</div>
    <div class="body">${escaped || '<em style="color:#9ca3af">No body</em>'}</div>
    <div class="footer">Sent via Eventra · <span class="tag">{{variables}}</span> are replaced at send time</div>
  </div></body></html>`;
}

export default function EventNotificationCenterTab({ eventId }: Props) {
  const { t } = useI18n();
  const TRIGGER_TYPES = useMemo(() => buildTriggerTypes(t), [t]);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('settings');
  const [settings, setSettings] = useState<Record<string, NotificationSetting>>({});
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Email editor state
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, EmailDraft>>({});
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastEmail, setBroadcastEmail] = useState(true);
  const [broadcastBell, setBroadcastBell] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number } | null>(null);

  // Log state
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [filterTrigger, setFilterTrigger] = useState('');
  const [filterChannel, setFilterChannel] = useState('');

  const fetchSettings = useCallback(async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('event_notification_settings')
      .select('trigger_type, is_email_enabled, is_bell_enabled, custom_subject, custom_body')
      .eq('event_id', eventId);

    if (data) {
      const map: Record<string, NotificationSetting> = {};
      data.forEach((row: NotificationSetting) => { map[row.trigger_type] = row; });
      setSettings(map);
    }
  }, [eventId]);

  const fetchAttendees = useCallback(async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('event_attendees')
      .select('id, user_id, name, email')
      .eq('event_id', eventId);
    if (data) setAttendees(data as Attendee[]);
  }, [eventId]);

  const fetchLogs = useCallback(async () => {
    if (!eventId) return;
    setIsLoadingLogs(true);
    let query = supabase
      .from('notification_logs')
      .select('id, trigger_type, channel, status, sent_at, recipient_id')
      .eq('event_id', eventId)
      .order('sent_at', { ascending: false })
      .limit(200);
    if (filterTrigger) query = query.eq('trigger_type', filterTrigger);
    if (filterChannel) query = query.eq('channel', filterChannel);
    const { data } = await query;
    setLogs((data as NotificationLog[]) || []);
    setIsLoadingLogs(false);
  }, [eventId, filterTrigger, filterChannel]);

  useEffect(() => { fetchSettings(); fetchAttendees(); }, [fetchSettings, fetchAttendees]);
  useEffect(() => { if (activeSubTab === 'log') fetchLogs(); }, [activeSubTab, fetchLogs]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getSettingValue = (key: string, field: 'is_email_enabled' | 'is_bell_enabled'): boolean =>
    settings[key] ? settings[key][field] : true;

  const getDraft = (trigger: TriggerType): EmailDraft => {
    if (emailDrafts[trigger.key]) return emailDrafts[trigger.key];
    const saved = settings[trigger.key];
    return {
      subject: saved?.custom_subject ?? trigger.defaultSubject,
      body: saved?.custom_body ?? trigger.defaultBody,
    };
  };

  const hasCustomEmail = (key: string) =>
    !!(settings[key]?.custom_subject || settings[key]?.custom_body);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleToggle = async (triggerKey: string, channel: 'is_email_enabled' | 'is_bell_enabled') => {
    if (!eventId) return;
    setTogglingKey(`${triggerKey}_${channel}`);
    const current = getSettingValue(triggerKey, channel);
    const existing = settings[triggerKey] || { trigger_type: triggerKey, is_email_enabled: true, is_bell_enabled: true, custom_subject: null, custom_body: null };
    const payload = {
      event_id: eventId,
      trigger_type: triggerKey,
      is_email_enabled: channel === 'is_email_enabled' ? !current : existing.is_email_enabled,
      is_bell_enabled: channel === 'is_bell_enabled' ? !current : existing.is_bell_enabled,
    };
    const { error } = await supabase.from('event_notification_settings').upsert(payload, { onConflict: 'event_id,trigger_type' });
    if (error) toast.error(t('manageEvent.notifications.toasts.updateFailed'));
    else setSettings(prev => ({ ...prev, [triggerKey]: { ...existing, ...payload } }));
    setTogglingKey(null);
  };

  const handleExpandToggle = (triggerKey: string) => {
    setExpandedTrigger(prev => (prev === triggerKey ? null : triggerKey));
  };

  const handleDraftChange = (triggerKey: string, field: 'subject' | 'body', value: string) => {
    setEmailDrafts(prev => ({
      ...prev,
      [triggerKey]: { ...getDraft(TRIGGER_TYPES.find(t => t.key === triggerKey)!), [field]: value },
    }));
  };

  const handleSaveEmail = async (trigger: TriggerType) => {
    if (!eventId) return;
    setSavingEmail(trigger.key);
    const draft = getDraft(trigger);
    const existing = settings[trigger.key] || { is_email_enabled: true, is_bell_enabled: true };
    const payload = {
      event_id: eventId,
      trigger_type: trigger.key,
      is_email_enabled: existing.is_email_enabled,
      is_bell_enabled: existing.is_bell_enabled,
      custom_subject: draft.subject.trim() || null,
      custom_body: draft.body.trim() || null,
    };
    const { error } = await supabase.from('event_notification_settings').upsert(payload, { onConflict: 'event_id,trigger_type' });
    if (error) {
      toast.error(t('manageEvent.notifications.toasts.templateSaveFailed'));
    } else {
      setSettings(prev => ({ ...prev, [trigger.key]: { ...existing, ...payload, trigger_type: trigger.key, custom_subject: payload.custom_subject, custom_body: payload.custom_body } }));
      // Clear draft (now persisted)
      setEmailDrafts(prev => { const next = { ...prev }; delete next[trigger.key]; return next; });
      toast.success(t('manageEvent.notifications.toasts.templateSaved'));
    }
    setSavingEmail(null);
  };

  const handleResetEmail = async (trigger: TriggerType) => {
    if (!eventId) return;
    setSavingEmail(trigger.key);
    const existing = settings[trigger.key] || { is_email_enabled: true, is_bell_enabled: true };
    const payload = {
      event_id: eventId,
      trigger_type: trigger.key,
      is_email_enabled: existing.is_email_enabled,
      is_bell_enabled: existing.is_bell_enabled,
      custom_subject: null,
      custom_body: null,
    };
    const { error } = await supabase.from('event_notification_settings').upsert(payload, { onConflict: 'event_id,trigger_type' });
    if (error) {
      toast.error(t('manageEvent.notifications.toasts.resetFailed'));
    } else {
      setSettings(prev => ({ ...prev, [trigger.key]: { ...existing, ...payload, trigger_type: trigger.key } }));
      setEmailDrafts(prev => { const next = { ...prev }; delete next[trigger.key]; return next; });
      toast.success(t('manageEvent.notifications.toasts.resetSuccess'));
    }
    setSavingEmail(null);
  };

  const handleBroadcast = async () => {
    if (!eventId) return;
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) { toast.error(t('manageEvent.notifications.toasts.fillFields')); return; }
    if (!broadcastEmail && !broadcastBell) { toast.error(t('manageEvent.notifications.toasts.selectChannel')); return; }
    if (attendees.length === 0) { toast.error(t('manageEvent.notifications.toasts.noAttendees')); return; }
    setIsSending(true);
    setSendProgress({ sent: 0, total: attendees.length });
    let sent = 0;
    for (const attendee of attendees) {
      if (broadcastBell && attendee.user_id) {
        try {
          await createNotification({ recipient_id: attendee.user_id, title: broadcastSubject, body: broadcastMessage, type: 'system' });
          await supabase.from('notification_logs').insert({ event_id: eventId, recipient_id: attendee.user_id, trigger_type: 'broadcast', channel: 'bell', status: 'sent' });
        } catch { /* continue */ }
      }
      if (broadcastEmail && attendee.email) {
        try {
          const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#0B2641;">${broadcastSubject}</h2><p style="color:#333;line-height:1.6;">${broadcastMessage.replace(/\n/g, '<br/>')}</p><p style="font-size:12px;color:#9CA3AF;margin-top:30px;">Sent via Eventra Event Manager</p></div>`;
          await sendEmail({ to: attendee.email, subject: broadcastSubject, html });
          await supabase.from('notification_logs').insert({ event_id: eventId, recipient_id: attendee.user_id || null, trigger_type: 'broadcast', channel: 'email', status: 'sent' });
        } catch { /* continue */ }
      }
      sent++;
      setSendProgress({ sent, total: attendees.length });
    }
    setIsSending(false);
    setSendProgress(null);
    setBroadcastSubject('');
    setBroadcastMessage('');
    toast.success(t('manageEvent.notifications.toasts.broadcastSent', { count: sent }));
  };

  // ── Sub-components ────────────────────────────────────────────────────────────

  const subTabStyle = (tab: SubTab): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    backgroundColor: activeSubTab === tab ? '#0684F5' : 'transparent',
    color: activeSubTab === tab ? '#fff' : '#94A3B8',
  });

  const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button onClick={onChange} disabled={disabled} style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
      cursor: disabled ? 'wait' : 'pointer',
      backgroundColor: checked ? '#0684F5' : 'rgba(255,255,255,0.15)',
      position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
        transition: 'left 0.2s', display: 'block',
      }} />
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{t('manageEvent.notifications.header.title')}</h2>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>{t('manageEvent.notifications.header.subtitle')}</p>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0D3052', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
        {(['settings', 'broadcast', 'log'] as SubTab[]).map(tab => (
          <button key={tab} style={subTabStyle(tab)} onClick={() => setActiveSubTab(tab)}>
            {t(`manageEvent.notifications.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ── SETTINGS VIEW ── */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {TRIGGER_TYPES.map(trigger => {
            const emailEnabled = getSettingValue(trigger.key, 'is_email_enabled');
            const bellEnabled = getSettingValue(trigger.key, 'is_bell_enabled');
            const isTogglingEmail = togglingKey === `${trigger.key}_is_email_enabled`;
            const isTogglingBell = togglingKey === `${trigger.key}_is_bell_enabled`;
            const isExpanded = expandedTrigger === trigger.key;
            const draft = getDraft(trigger);
            const isInPreview = previewMode[trigger.key];
            const isSaving = savingEmail === trigger.key;
            const isDirty = !!emailDrafts[trigger.key];
            const isCustomized = hasCustomEmail(trigger.key);

            return (
              <div key={trigger.key} style={{
                backgroundColor: '#0D3052', borderRadius: '12px',
                border: `1px solid ${isExpanded ? 'rgba(6,132,245,0.4)' : 'rgba(255,255,255,0.08)'}`,
                overflow: 'hidden', transition: 'border-color 0.2s',
              }}>
                {/* Card header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 24px' }}>
                  {/* Left: label + description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <Bell size={15} style={{ color: '#0684F5', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{trigger.label}</span>
                      {isCustomized && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#0684F5', backgroundColor: 'rgba(6,132,245,0.12)', borderRadius: '4px', padding: '1px 7px' }}>
                          {t('manageEvent.notifications.settings.custom')}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>{trigger.description}</p>
                  </div>

                  {/* Right: toggles + edit button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    {/* Email toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} style={{ color: emailEnabled ? '#0684F5' : '#64748B' }} />
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.notifications.settings.email')}</span>
                      {isTogglingEmail
                        ? <Loader2 size={18} style={{ color: '#0684F5', animation: 'spin 1s linear infinite' }} />
                        : <Toggle checked={emailEnabled} onChange={() => handleToggle(trigger.key, 'is_email_enabled')} />}
                    </div>

                    {/* Bell toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={15} style={{ color: bellEnabled ? '#0684F5' : '#64748B' }} />
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.notifications.settings.bell')}</span>
                      {isTogglingBell
                        ? <Loader2 size={18} style={{ color: '#0684F5', animation: 'spin 1s linear infinite' }} />
                        : <Toggle checked={bellEnabled} onChange={() => handleToggle(trigger.key, 'is_bell_enabled')} />}
                    </div>

                    {/* Edit email button */}
                    <button
                      onClick={() => handleExpandToggle(trigger.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                        borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
                        backgroundColor: isExpanded ? 'rgba(6,132,245,0.15)' : 'rgba(255,255,255,0.05)',
                        color: isExpanded ? '#0684F5' : '#94A3B8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Mail size={14} />
                      {t('manageEvent.notifications.settings.editEmail')}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded email editor */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
                    {/* Editor toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                        {t('manageEvent.notifications.settings.variablesHint')}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setPreviewMode(prev => ({ ...prev, [trigger.key]: !isInPreview }))}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                            borderRadius: '7px', border: '1px solid rgba(255,255,255,0.12)',
                            backgroundColor: isInPreview ? 'rgba(6,132,245,0.15)' : 'transparent',
                            color: isInPreview ? '#0684F5' : '#94A3B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Eye size={13} /> {isInPreview ? t('manageEvent.notifications.settings.edit') : t('manageEvent.notifications.settings.preview')}
                        </button>
                        {isCustomized && (
                          <button
                            onClick={() => handleResetEmail(trigger)}
                            disabled={isSaving}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                              borderRadius: '7px', border: '1px solid rgba(255,255,255,0.12)',
                              backgroundColor: 'transparent', color: '#EF4444', fontSize: '12px', fontWeight: 600,
                              cursor: isSaving ? 'wait' : 'pointer',
                            }}
                          >
                            <RotateCcw size={13} /> {t('manageEvent.notifications.settings.resetDefault')}
                          </button>
                        )}
                        <button
                          onClick={() => handleSaveEmail(trigger)}
                          disabled={isSaving}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px',
                            borderRadius: '7px', border: 'none',
                            backgroundColor: isDirty ? '#0684F5' : 'rgba(6,132,245,0.3)',
                            color: '#fff', fontSize: '12px', fontWeight: 600,
                            cursor: isSaving ? 'wait' : 'pointer',
                          }}
                        >
                          {isSaving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                          {t('manageEvent.notifications.settings.save')}
                        </button>
                      </div>
                    </div>

                    {isInPreview ? (
                      /* ── Live HTML preview ── */
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: '420px' }}>
                        <iframe
                          srcDoc={buildPreviewHtml(draft.subject, draft.body)}
                          title="Email preview"
                          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                        />
                      </div>
                    ) : (
                      /* ── Editor + side preview split ── */
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Editor column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '5px', fontWeight: 500 }}>{t('manageEvent.notifications.settings.subjectLine')}</label>
                            <input
                              value={draft.subject}
                              onChange={e => handleDraftChange(trigger.key, 'subject', e.target.value)}
                              placeholder={t('manageEvent.notifications.settings.subjectPlaceholder')}
                              style={inputStyle}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '5px', fontWeight: 500 }}>{t('manageEvent.notifications.settings.emailBody')}</label>
                            <textarea
                              value={draft.body}
                              onChange={e => handleDraftChange(trigger.key, 'body', e.target.value)}
                              placeholder={t('manageEvent.notifications.settings.bodyPlaceholder')}
                              rows={12}
                              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                            />
                          </div>

                          {/* Variable chips */}
                          <div>
                            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 6px', fontWeight: 500 }}>{t('manageEvent.notifications.settings.availableVars')}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {['{{attendee_name}}', '{{event_name}}', '{{organizer_name}}', '{{meeting_date}}', '{{meeting_time}}', '{{location}}', '{{session_title}}', '{{session_time}}'].map(v => (
                                <button
                                  key={v}
                                  onClick={() => {
                                    const textarea = document.activeElement as HTMLTextAreaElement;
                                    handleDraftChange(trigger.key, 'body', draft.body + v);
                                  }}
                                  title={t('manageEvent.notifications.settings.clickAppend')}
                                  style={{
                                    padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6,132,245,0.3)',
                                    backgroundColor: 'rgba(6,132,245,0.08)', color: '#60A5FA',
                                    fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer',
                                  }}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Live preview column */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '5px', fontWeight: 500 }}>{t('manageEvent.notifications.settings.livePreview')}</label>
                          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: '360px' }}>
                            <iframe
                              srcDoc={buildPreviewHtml(draft.subject, draft.body)}
                              title="Email preview"
                              style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── BROADCAST VIEW ── */}
      {activeSubTab === 'broadcast' && (
        <div style={{ backgroundColor: '#0D3052', borderRadius: '12px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '680px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600 }}>{t('manageEvent.notifications.broadcast.title')}</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px', fontWeight: 500 }}>{t('manageEvent.notifications.broadcast.subject')}</label>
            <input value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} placeholder={t('manageEvent.notifications.broadcast.subjectPlaceholder')} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px', fontWeight: 500 }}>{t('manageEvent.notifications.broadcast.message')}</label>
            <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder={t('manageEvent.notifications.broadcast.messagePlaceholder')} rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '10px', fontWeight: 500 }}>{t('manageEvent.notifications.broadcast.sendVia')}</label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={broadcastEmail} onChange={e => setBroadcastEmail(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0684F5' }} />
                <Mail size={15} style={{ color: '#94A3B8' }} /> {t('manageEvent.notifications.broadcast.email')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={broadcastBell} onChange={e => setBroadcastBell(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0684F5' }} />
                <Bell size={15} style={{ color: '#94A3B8' }} /> {t('manageEvent.notifications.broadcast.bellNotification')}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{t('manageEvent.notifications.broadcast.target', { count: attendees.length })}</span>
            <button onClick={handleBroadcast} disabled={isSending} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
              borderRadius: '8px', border: 'none', cursor: isSending ? 'wait' : 'pointer',
              backgroundColor: isSending ? '#1E3A5F' : '#0684F5', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              {isSending
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('manageEvent.notifications.broadcast.sending', { sent: sendProgress?.sent, total: sendProgress?.total })}</>
                : <><Send size={16} /> {t('manageEvent.notifications.broadcast.sendBroadcast')}</>}
            </button>
          </div>
        </div>
      )}

      {/* ── LOG VIEW ── */}
      {activeSubTab === 'log' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} style={{ color: '#64748B' }} />
            <select value={filterTrigger} onChange={e => setFilterTrigger(e.target.value)} style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: '#0D3052', color: '#fff', fontSize: '13px', cursor: 'pointer', outline: 'none',
            }}>
              <option value="">{t('manageEvent.notifications.log.allTriggers')}</option>
              {TRIGGER_TYPES.map(tr => <option key={tr.key} value={tr.key}>{tr.label}</option>)}
              <option value="broadcast">{t('manageEvent.notifications.log.broadcastLabel')}</option>
            </select>
            <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} style={{
              padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: '#0D3052', color: '#fff', fontSize: '13px', cursor: 'pointer', outline: 'none',
            }}>
              <option value="">{t('manageEvent.notifications.log.allChannels')}</option>
              <option value="email">{t('manageEvent.notifications.log.email')}</option>
              <option value="bell">{t('manageEvent.notifications.log.bell')}</option>
            </select>
            <button onClick={fetchLogs} style={{
              padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'transparent', color: '#94A3B8', fontSize: '13px', cursor: 'pointer',
            }}>{t('manageEvent.notifications.log.refresh')}</button>
          </div>

          <div style={{ backgroundColor: '#0D3052', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {[t('manageEvent.notifications.log.headers.dateTime'), t('manageEvent.notifications.log.headers.trigger'), t('manageEvent.notifications.log.headers.channel'), t('manageEvent.notifications.log.headers.recipientId'), t('manageEvent.notifications.log.headers.status')].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoadingLogs ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <Loader2 size={24} style={{ margin: '0 auto', display: 'block', animation: 'spin 1s linear infinite' }} />
                  </td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <Bell size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    {t('manageEvent.notifications.log.noLogs')}
                  </td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 16px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {new Date(log.sent_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {TRIGGER_TYPES.find(t => t.key === log.trigger_type)?.label || log.trigger_type}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px',
                        borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: log.channel === 'email' ? 'rgba(6,132,245,0.15)' : 'rgba(99,102,241,0.15)',
                        color: log.channel === 'email' ? '#0684F5' : '#818CF8',
                      }}>
                        {log.channel === 'email' ? <Mail size={11} /> : <Bell size={11} />}
                        {log.channel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.recipient_id ? `${log.recipient_id.slice(0, 8)}…` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: log.status === 'sent' ? '#22C55E' : '#EF4444' }}>
                        {log.status === 'sent' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
