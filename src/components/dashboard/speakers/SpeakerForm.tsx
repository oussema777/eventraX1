import { useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Users, CheckCircle, Calendar, FileText, Star, Mail, Upload,
  Search, ChevronDown, MoreVertical, Eye, Edit2,
  Clock, AlertCircle, Download, Send, Trash2, Crown, MapPin,
  Linkedin, Globe, Phone, Copy, X, Bell
} from 'lucide-react';
import type { Speaker, SessionSummary, SpeakerStatus } from './types';
import { formatDateLabel, formatTimeLabel } from './types';

export function ComposeMessageModal({
  isOpen,
  onClose,
  recipients,
  subject,
  message,
  channel,
  onSubjectChange,
  onMessageChange,
  onChannelChange,
  onSend,
  isSending
}: {
  isOpen: boolean;
  onClose: () => void;
  recipients: Speaker[];
  subject: string;
  message: string;
  channel: 'email' | 'in_app' | 'sms' | 'push';
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onChannelChange: (value: 'email' | 'in_app' | 'sms' | 'push') => void;
  onSend: () => void;
  isSending: boolean;
}) {
  const { t } = useI18n();
  if (!isOpen) return null;
  const recipientLabel = (() => {
    if (!recipients.length) return t('manageEvent.speakers.modals.compose.noRecipients');
    if (recipients.length === 1) return recipients[0].name;
    if (recipients.length === 2) return `${recipients[0].name}, ${recipients[1].name}`;
    return `${recipients[0].name}, ${recipients[1].name} (${t('manageEvent.speakers.modals.compose.others', { count: recipients.length - 2 })})`;
  })();

  return (
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.compose.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{recipientLabel}</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.subject')}</label>
            <input
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full rounded-lg px-4"
              style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.channel')}</label>
            <select
              value={channel}
              onChange={(e) => onChannelChange(e.target.value as any)}
              className="w-full rounded-lg px-4"
              style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
            >
              <option value="email">Email</option>
              <option value="in_app">In-app</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.compose.fields.message')}</label>
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="w-full rounded-lg px-4 py-3"
              style={{ minHeight: '140px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none', resize: 'none' }}
            />
          </div>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={onClose}
            className="px-5 rounded-lg border"
            style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {t('manageEvent.speakers.modals.compose.actions.cancel')}
          </button>
          <button
            onClick={onSend}
            disabled={isSending}
            className="px-5 rounded-lg"
            style={{ height: '44px', backgroundColor: '#8B5CF6', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1 }}
          >
            {isSending ? t('manageEvent.speakers.modals.compose.actions.sending') : t('manageEvent.speakers.modals.compose.actions.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusUpdateModal({
  isOpen,
  onClose,
  status,
  onStatusChange,
  onSave,
  isSaving,
  count
}: {
  isOpen: boolean;
  onClose: () => void;
  status: SpeakerStatus;
  onStatusChange: (value: SpeakerStatus) => void;
  onSave: () => void;
  isSaving: boolean;
  count: number;
}) {
  const { t } = useI18n();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.status.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{t('manageEvent.speakers.modals.status.count', { count }) }</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px', display: 'block' }}>{t('manageEvent.speakers.modals.status.fields.status')}</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as SpeakerStatus)}
            className="w-full rounded-lg px-4"
            style={{ height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
          >
            <option value="confirmed">{t('manageEvent.speakers.allSpeakers.filters.confirmed')}</option>
            <option value="pending">{t('manageEvent.speakers.allSpeakers.filters.pending')}</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={onClose}
            className="px-5 rounded-lg border"
            style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {t('manageEvent.speakers.modals.status.actions.cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 rounded-lg"
            style={{ height: '44px', backgroundColor: '#0684F5', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? t('manageEvent.speakers.modals.status.actions.saving') : t('manageEvent.speakers.modals.status.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AssignSpeakersModal({
  isOpen,
  session,
  speakers,
  selection,
  onToggle,
  onClose,
  onSave,
  isSaving
}: {
  isOpen: boolean;
  session: SessionSummary | null;
  speakers: Speaker[];
  selection: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const { t } = useI18n();
  if (!isOpen || !session) return null;
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] rounded-2xl border"
        style={{ backgroundColor: '#0D3052', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{t('manageEvent.speakers.modals.assign.title')}</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{session.name}</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6" style={{ maxHeight: '420px', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {speakers.length === 0 && (
              <div style={{ color: '#94A3B8' }}>{t('manageEvent.speakers.modals.assign.empty')}</div>
            )}
            {speakers.map((speaker) => {
              const isSelected = selection.has(speaker.id);
              return (
                <label
                  key={speaker.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(6,132,245,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? '#0684F5' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(speaker.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>{speaker.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '12px' }}>{speaker.jobTitle}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-5 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('manageEvent.speakers.modals.assign.selected', { count: selection.size })}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 rounded-lg border"
              style={{ height: '44px', backgroundColor: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              {t('manageEvent.speakers.modals.assign.actions.cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-5 rounded-lg"
              style={{ height: '44px', backgroundColor: '#0684F5', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? t('manageEvent.speakers.modals.assign.actions.saving') : t('manageEvent.speakers.modals.assign.actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function SpeakerDetailModal({ speaker, activeTab, onTabChange, onEdit, onEmail, onRemove, onCopyEmail, onClose }: {
  speaker: Speaker;
  activeTab: 'overview' | 'sessions' | 'materials' | 'communication' | 'analytics';
  onTabChange: (tab: 'overview' | 'sessions' | 'materials' | 'communication' | 'analytics') => void;
  onEdit: () => void;
  onEmail: () => void;
  onRemove: () => void;
  onCopyEmail: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11,38,65,0.90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '1000px',
          maxHeight: '90vh',
          backgroundColor: '#1E3A5F',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0px 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: speaker.type === 'keynote'
              ? 'linear-gradient(135deg, #8B5CF6 0%, #0684F5 100%)'
              : speaker.type === 'panel'
              ? 'linear-gradient(135deg, #0684F5 0%, #06B6D4 100%)'
              : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            padding: '40px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={speaker.photo}
              alt={speaker.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: '0px 4px 16px rgba(0,0,0,0.3)',
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                {speaker.name}
              </h2>
              <p style={{ fontSize: '18px', color: '#E0E7FF', marginBottom: '12px' }}>
                {speaker.jobTitle}, {speaker.company}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      textDecoration: 'none'
                    }}
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {speaker.website && (
                  <a
                    href={speaker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      textDecoration: 'none'
                    }}
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
              <span
                style={{
                  padding: '8px 16px',
                  background: speaker.type === 'keynote'
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : '#0684F5',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {speaker.type === 'keynote' && <Star size={14} />}
                {speaker.type === 'keynote' ? t('manageEvent.speakers.allSpeakers.badges.keynote') : 
                 speaker.type === 'panel' ? t('manageEvent.speakers.allSpeakers.badges.panel') : 
                 speaker.type === 'workshop' ? t('manageEvent.speakers.allSpeakers.badges.workshop') : 
                 'REGULAR SPEAKER'}
              </span>
            </div>
            <span
              style={{
                padding: '8px 16px',
                backgroundColor: speaker.status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                color: speaker.status === 'confirmed' ? '#10B981' : '#F59E0B',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'capitalize'
              }}
            >
              <CheckCircle size={16} />
              {speaker.status}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 40px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {[ 
            { id: 'overview', label: t('manageEvent.speakers.detailModal.tabs.overview') },
            { id: 'sessions', label: t('manageEvent.speakers.detailModal.tabs.sessions') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as typeof activeTab)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.id ? '#0684F5' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '40px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Biography */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.about')}
                </h3>
                <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.6 }}>
                  {speaker.bio}
                </p>
              </div>

              {/* Expertise & Topics */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.expertise')}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {speaker.expertise.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '14px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.detailModal.overview.contact')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{speaker.email}</span>
                    <button
                      onClick={onCopyEmail}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#0684F5',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Copy size={12} />
                      {t('manageEvent.speakers.detailModal.overview.copy')}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{speaker.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {speaker.sessions.length === 0 && (
                <div style={{ color: '#94A3B8' }}>{t('manageEvent.speakers.detailModal.sessions.empty')}</div>
              )}
              {speaker.sessions.map(session => (
                <div
                  key={session.id}
                  style={{
                    padding: '24px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {session.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>
                    {session.date}, {session.time}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      {session.role}
                    </span>
                    <span
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(16,185,129,0.15)',
                        color: '#10B981',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    >
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '24px 40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={onRemove}
            style={{
              padding: '0',
              border: 'none',
              background: 'none',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {t('manageEvent.speakers.detailModal.footer.remove')}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onEmail}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Mail size={18} />
              {t('manageEvent.speakers.detailModal.footer.sendEmail')}
            </button>
            <button
              onClick={onEdit}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Edit2 size={18} />
              {t('manageEvent.speakers.detailModal.footer.edit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
