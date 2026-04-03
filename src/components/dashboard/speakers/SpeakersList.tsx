import { useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Users, CheckCircle, Calendar, FileText, Star, Mail, Upload,
  Search, Grid3x3, List, ChevronDown, MoreVertical, Eye, Edit2,
  Clock, AlertCircle, Download, Send, Trash2, Crown, MapPin,
  Linkedin, Globe, Phone, Copy, X, Bell
} from 'lucide-react';
import type { Speaker, SessionSummary, SpeakerStatus, MaterialStatus } from './types';
import { formatDateLabel, formatTimeLabel, formatRelativeTime, escapeCsv } from './types';

export function SpeakerCard({ speaker, onView, onSelect, isSelected, onContact, onEdit, onRemove, onEmail, menuOpen, onMenuToggle }: {
  speaker: Speaker;
  onView: () => void;
  onSelect: () => void;
  isSelected: boolean;
  onContact: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onEmail: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { t } = useI18n();
  const statusColors = {
    confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
  };

  const typeColors = {
    keynote: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    panel: '#0684F5',
    workshop: '#8B5CF6',
    regular: '#6B7280'
  };

  return (
    <div
      onClick={onView}
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        opacity: speaker.status === 'pending' ? 0.9 : 1,
        zIndex: menuOpen ? 20 : 1
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header Section */}
      <div
        style={{
          height: '180px',
          background: speaker.type === 'keynote'
            ? 'linear-gradient(135deg, #8B5CF6 0%, #0684F5 100%)'
            : speaker.type === 'panel'
            ? 'linear-gradient(135deg, #0684F5 0%, #06B6D4 100%)'
            : speaker.type === 'workshop'
            ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
            : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11,38,65,0.3) 0%, rgba(11,38,65,0.7) 100%)'
          }}
        />

        {/* Speaker Type Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            background: typeColors[speaker.type],
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {speaker.type === 'keynote' && <Star size={12} style={{ color: '#FFFFFF' }} />}
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
            {speaker.type === 'keynote' ? t('manageEvent.speakers.allSpeakers.badges.keynote') :
             speaker.type === 'panel' ? t('manageEvent.speakers.allSpeakers.badges.panel') :
             speaker.type === 'workshop' ? t('manageEvent.speakers.allSpeakers.badges.workshop') :
             'REGULAR SPEAKER'}
          </span>
        </div>

        {/* New Badge */}
        {speaker.isNew && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '12px',
              height: '12px',
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        )}

        {/* VIP Crown for Keynote with Multiple Sessions */}
        {speaker.type === 'keynote' && speaker.sessions.length > 1 && (
          <Crown size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#F59E0B' }} />
        )}
      </div>

      {/* Profile Photo */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '4px solid #FFFFFF',
          boxShadow: '0px 4px 16px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          backgroundColor: '#0B2641'
        }}
      >
        <img src={speaker.photo} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '190px',
          left: '16px',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          accentColor: '#0684F5',
          zIndex: 10
        }}
      />

      {/* Content Section */}
      <div style={{ padding: '80px 24px 24px' }}>
        {/* Name & Title */}
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px' }}>
          {speaker.name}
        </h3>
        <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', marginBottom: '2px' }}>
          {speaker.jobTitle}
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: '12px' }}>
          {speaker.company}
        </p>

        {/* Expertise Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          {speaker.expertise.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(6,132,245,0.15)',
                color: '#0684F5',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '12px'
              }}
            >
              {tag}
            </span>
          ))}
          {speaker.expertise.length > 3 && (
            <span style={{ fontSize: '11px', color: '#0684F5' }}>
              +{speaker.expertise.length - 3} {t('manageEvent.speakers.allSpeakers.card.more')}
            </span>
          )}
        </div>

        {/* Session Assignment */}
        <div
          style={{
            padding: '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '12px'
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
            {t('manageEvent.speakers.allSpeakers.card.speakingAt')}:
          </p>
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <Calendar size={14} style={{ color: '#0684F5', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {speaker.sessions.length > 0 ? (
                <>
                  <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '2px' }}>
                    {speaker.sessions[0]?.name} - {speaker.sessions[0]?.date}, {speaker.sessions[0]?.time}
                  </p>
                  {speaker.sessions?.length > 1 && (
                    <p style={{ fontSize: '12px', color: '#0684F5', marginTop: '4px' }}>
                      +{speaker.sessions?.length - 1} {t('manageEvent.speakers.allSpeakers.card.moreSessions')}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#94A3B8'}}>{t('manageEvent.speakers.allSpeakers.card.noSessions')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: (statusColors[speaker.status] || statusColors.pending).bg,
            borderRadius: '12px',
            marginBottom: '12px'
          }}
        >
          <CheckCircle size={12} style={{ color: (statusColors[speaker.status] || statusColors.pending).text }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: (statusColors[speaker.status] || statusColors.pending).text, textTransform: 'capitalize' }}>
            {speaker.status}
          </span>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} style={{ color: '#94A3B8' }} />
            <span style={{ fontSize: '11px', color: speaker.materials.submitted ? '#10B981' : '#F59E0B' }}>
              {speaker.materials.submitted ? t('manageEvent.speakers.allSpeakers.card.materialsSubmitted') : t('manageEvent.speakers.allSpeakers.card.materialsPending')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} style={{ color: '#94A3B8' }} />
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              {speaker.expectedAttendance ? `${speaker.expectedAttendance}` : t('manageEvent.header.tbd')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '11px', color: '#FFFFFF' }}>
              {speaker.rating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.03)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          style={{
            flex: 1,
            height: '36px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Eye size={14} />
          {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
        </button>
        <div style={{ position: 'relative' }} data-speaker-menu>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '180px',
                backgroundColor: '#1E3A5F',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                boxShadow: '0px 6px 20px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                zIndex: 60
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Eye size={14} />
                {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={14} />
                {t('manageEvent.speakers.allSpeakers.card.edit')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                  onMenuToggle();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                {t('manageEvent.speakers.allSpeakers.card.remove')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Speakers List View Component
export function SpeakersListView({ speakers, selectedSpeakers, onSelect, onView, onEmail, onEdit, onRemove, openMenuId, onMenuToggle }: {
  speakers: Speaker[];
  selectedSpeakers: Set<string>;
  onSelect: (id: string) => void;
  onView: (speaker: Speaker) => void;
  onEmail: (speaker: Speaker) => void;
  onEdit: (speaker: Speaker) => void;
  onRemove: (speaker: Speaker) => void;
  openMenuId: string | null;
  onMenuToggle: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="event-speakers__list" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', minHeight: '450px' }}>
      {/* Table Header */}
      <div
        className="event-speakers__list-header"
        style={{
          display: 'grid',
          gridTemplateColumns: '4% 35% 12% 25% 20% 4%',
          padding: '16px 24px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div></div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.allSpeakers.card.speaker')}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Type</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Sessions</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Status</span>
        <div></div>
      </div>

      {/* Table Rows */}
      {speakers.map(speaker => {
        const statusColors = {
          confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
          pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
          declined: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' }
        };

        return (
          <div
            key={speaker.id}
            className="event-speakers__list-row"
            onClick={() => onView(speaker)}
            style={{
              display: 'grid',
              gridTemplateColumns: '4% 35% 12% 25% 20% 4%',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Checkbox */}
            <div>
              <input
                type="checkbox"
                checked={selectedSpeakers.has(speaker.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(speaker.id);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
              />
            </div>

            {/* Speaker Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={speaker.photo}
                alt={speaker.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                  objectFit: 'cover'
                }}
              />
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {speaker.name}
                </p>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                  {speaker.jobTitle}, {speaker.company}
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {speaker.expertise.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(6,132,245,0.15)',
                        color: '#0684F5',
                        fontSize: '10px',
                        borderRadius: '10px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <span
                style={{
                  padding: '4px 10px',
                  backgroundColor: speaker.type === 'keynote' ? 'rgba(245,158,11,0.15)' : 'rgba(6,132,245,0.15)',
                  color: speaker.type === 'keynote' ? '#F59E0B' : '#0684F5',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {speaker.type === 'keynote' && <Star size={10} />}
                {speaker.type.charAt(0).toUpperCase() + speaker.type.slice(1)}
              </span>
            </div>

            {/* Sessions */}
            <div>
              {speaker.sessions.length > 0 ? (
                <>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                    {speaker.sessions[0].name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {speaker.sessions[0].date}, {speaker.sessions[0].time}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('manageEvent.speakers.allSpeakers.card.noSessions')}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: statusColors[speaker.status].bg,
                  color: statusColors[speaker.status].text,
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'capitalize'
                }}
              >
                <CheckCircle size={12} />
                {speaker.status}
              </span>
            </div>

            {/* Actions */}
            <div>
              <div className="event-speakers__list-actions" style={{ position: 'relative' }} data-speaker-menu>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuToggle(speaker.id);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {openMenuId === speaker.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '38px',
                      width: '180px',
                      backgroundColor: '#1E3A5F',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      boxShadow: '0px 6px 20px rgba(0,0,0,0.35)',
                      overflow: 'hidden',
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.viewProfile')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(speaker);
                        onMenuToggle(speaker.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      {t('manageEvent.speakers.allSpeakers.card.remove')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// By Session View Component
export function BySessionView({
  sessions,
  onAssign,
  onContact,
  onView,
  onAddSession
}: {
  sessions: SessionSummary[];
  onAssign: (session: SessionSummary) => void;
  onContact: (recipients: Speaker[]) => void;
  onView: (speaker: Speaker) => void;
  onAddSession: () => void;
}) {
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!sessions.length && (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.2)',
            padding: '32px',
            textAlign: 'center',
            color: '#94A3B8'
          }}
        >
          {t('manageEvent.speakers.bySession.empty')}
        </div>
      )}
      {sessions.map(session => (
        <div key={session.id}>
          {/* Session Header */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '24px',
              borderRadius: '12px 12px 0 0',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Calendar size={28} style={{ color: '#0684F5' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                    {session.name}
                  </h3>
                  <span
                    style={{
                      padding: '4px 10px',
                      backgroundColor: session.type === 'keynote' ? 'rgba(245,158,11,0.15)' : session.type === 'workshop' ? 'rgba(139,92,246,0.15)' : 'rgba(6,132,245,0.15)',
                      color: session.type === 'keynote' ? '#F59E0B' : session.type === 'workshop' ? '#8B5CF6' : '#0684F5',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {session.type}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>
                  {session.date} {t('manageEvent.speakers.bySession.columns.dateTime')} {session.time}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{session.location}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                <Users size={16} style={{ color: '#FFFFFF' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{session.expected}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                <Clock size={14} style={{ color: '#94A3B8' }} />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{session.duration}</span>
              </div>
            </div>
          </div>

          {/* Speaker Assignments */}
          <div
            style={{
              borderLeft: '4px solid #0684F5',
              backgroundColor: 'rgba(6,132,245,0.05)',
              padding: '20px 24px',
              borderRadius: '0 0 12px 12px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: 'none'
            }}
          >
            {session.speakers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {session.speakers.map(speaker => (
                  <div
                    key={speaker.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={speaker.photo}
                        alt={speaker.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.2)',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {speaker.name}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '2px' }}>
                          {speaker.sessions.find(s => s.id === session.id)?.role || 'Primary Speaker'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          {speaker.company}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'rgba(16,185,129,0.15)',
                          color: '#10B981',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle size={12} />
                        Confirmed
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: speaker.materials.submitted ? '#10B981' : '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {speaker.materials.submitted ? t('manageEvent.speakers.allSpeakers.card.materialsSubmitted') : t('manageEvent.speakers.allSpeakers.card.materialsPending')}
                      </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => onContact([speaker])}
                            style={{
                              height: '36px',
                              padding: '0 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t('manageEvent.speakers.bySession.actions.contact')}
                          </button>
                          <button
                            onClick={() => onView(speaker)}
                            style={{
                              height: '36px',
                              padding: '0 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t('manageEvent.speakers.bySession.actions.view')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                  {t('manageEvent.speakers.stats.needSpeakers', { count: 1 })}
                </p>
                <button
                  onClick={() => onAssign(session)}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    backgroundColor: '#0684F5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  {t('manageEvent.speakers.bySession.actions.assign')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Session Button */}
      <button
        onClick={onAddSession}
        style={{
          width: '100%',
          height: '44px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <Plus size={18} />
        {t('manageEvent.speakers.bySession.actions.addSession')}
      </button>
    </div>
  );
}

// Materials Tracking View Component
export function MaterialsTrackingView({ speakers, onReminder }: { speakers: Speaker[]; onReminder: (speakers: Speaker[]) => void }) {
  const { t } = useI18n();
  const materials = speakers.map((speaker) => {
    const materialType = speaker.materials.type || 'Materials';
    const deadline = speaker.materials.deadline || t('manageEvent.header.tbd');
    const size = speaker.materials.size || (speaker.materials.submitted ? 'Uploaded' : '-');
    return {
      speaker,
      materialType,
      status: speaker.materials.status,
      deadline,
      size,
      fileUrl: speaker.materials.fileUrl
    };
  });

  return (
    <div>
      {/* Materials Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <CheckCircle size={32} style={{ color: '#10B981', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'submitted').length} {t('manageEvent.speakers.materials.status.submitted')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
            {materials.length ? Math.round((materials.filter(m => m.status === 'submitted').length / materials.length) * 100) : 0}% completion
          </p>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div
              style={{
                width: `${materials.length ? (materials.filter(m => m.status === 'submitted').length / materials.length) * 100 : 0}%`,
                height: '100%',
                backgroundColor: '#10B981',
                borderRadius: '2px'
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <Clock size={32} style={{ color: '#F59E0B', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'pending').length} {t('manageEvent.speakers.materials.status.pending')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Awaiting uploads
          </p>
        </div>

        <div
          style={{
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <AlertCircle size={32} style={{ color: '#EF4444', marginBottom: '12px' }} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            {materials.filter(m => m.status === 'overdue').length} {t('manageEvent.speakers.materials.status.overdue')}
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Deadline passed
          </p>
        </div>
      </div>

      {/* Materials Table */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '25% 20% 15% 12% 12% 10% 6%',
            padding: '16px 24px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.speaker')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Session</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.presentation')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.status')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.speakers.materials.columns.deadline')}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>Size</span>
          <div></div>
        </div>

        {/* Table Rows */}
        {materials.map(item => {
          const statusIcons: Record<MaterialStatus, any> = {
            submitted: CheckCircle,
            pending: Clock,
            overdue: AlertCircle
          };
          const StatusIcon = statusIcons[item.status];
          
          const statusColors: Record<MaterialStatus, string> = {
            submitted: '#10B981',
            pending: '#F59E0B',
            overdue: '#EF4444'
          };

          return (
            <div
              key={item.speaker.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '25% 20% 15% 12% 12% 10% 6%',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center'
              }}
            >
              {/* Speaker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={item.speaker.photo}
                  alt={item.speaker.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.15)',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                  {item.speaker.name}
                </span>
              </div>

              {/* Session */}
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                {item.speaker.sessions[0]?.name ? `${item.speaker.sessions[0].name.substring(0, 25)}...` : 'No session assigned'}
              </span>

              {/* Material Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} style={{ color: '#94A3B8' }} />
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item.materialType}</span>
              </div>

              {/* Status */}
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: `${statusColors[item.status]}20`,
                  color: statusColors[item.status],
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'capitalize'
                }}
              >
                <StatusIcon size={12} />
                {item.status}
              </span>

              {/* Deadline */}
              <span
                style={{
                  fontSize: '13px',
                  color: item.status === 'overdue' ? '#EF4444' : '#94A3B8',
                  textDecoration: item.status === 'overdue' ? 'line-through' : 'none'
                }}
              >
                {item.deadline}
              </span>

              {/* Size */}
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                {item.size}
              </span>

              {/* Actions */}
              <div>
                {item.status === 'submitted' ? (
                  <button
                    onClick={() => {
                      if (item.fileUrl) {
                        window.open(item.fileUrl, '_blank', 'noopener');
                      } else {
                        toast.error('No file available');
                      }
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => onReminder([item.speaker])}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: item.status === 'overdue' ? '#EF4444' : '#F59E0B',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {t('manageEvent.speakers.materials.actions.remind')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      <button
        onClick={() => onReminder(speakers.filter((speaker) => !speaker.materials.submitted))}
        style={{
          width: '100%',
          height: '44px',
          marginTop: '24px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <Send size={18} />
        {t('manageEvent.speakers.materials.actions.remindAll')}
      </button>
    </div>
  );
}

// Communication Log View Component
export function CommunicationLogView({
  eventId,
  speakers,
  refreshKey
}: {
  eventId: string;
  speakers: Speaker[];
  refreshKey: number;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'email' | 'reminder' | 'updates'>('all');
  const [range, setRange] = useState<'30' | '7' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setIsLoading(true);
      const query = supabase
        .from('event_notifications')
        .select('id,title,message,channel,created_at,audience,status')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      if (range !== 'all') {
        const days = range === '7' ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query.gte('created_at', since.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        setItems([]);
        setIsLoading(false);
        toast.error('Failed to load communications');
        return;
      }
      setItems(data || []);
      setIsLoading(false);
    };
    load();
  }, [eventId, limit, range, refreshKey]);

  const speakerNameById = useMemo(() => {
    const map = new Map<string, string>();
    speakers.forEach((speaker) => map.set(speaker.id, speaker.name));
    return map;
  }, [speakers]);

  const resolveAudienceLabel = (audience: any) => {
    if (!audience || typeof audience !== 'object') {
      return 'Speakers';
    }
    if (audience.type === 'all_speakers') {
      return `All Speakers (${speakers.length} recipients)`;
    }
    const ids = Array.isArray(audience.speaker_ids) ? audience.speaker_ids : [];
    const speakerId = audience.speaker_id ? [audience.speaker_id] : [];
    const list = [...ids, ...speakerId].filter(Boolean);
    if (!list.length) return 'Speakers';
    const names = list.map((id) => speakerNameById.get(String(id)) || 'Unknown');
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} (+${names.length - 2} others)`;
  };

  const mappedItems = items.map((item) => {
    let audience: any = item.audience || {};
    if (typeof audience === 'string') {
      try {
        audience = JSON.parse(audience);
      } catch {
        audience = {};
      }
    }
    const type =
      audience.category === 'reminder' || audience.type === 'material_reminder' || audience.type === 'reminder'
        ? 'reminder'
        : audience.category === 'status' || audience.type === 'status'
        ? 'status'
        : item.channel === 'email'
        ? 'email'
        : 'updates';
    const icon =
      type === 'reminder' ? Bell : type === 'status' ? CheckCircle : Mail;
    const borderColor =
      type === 'reminder' ? '#F59E0B' : type === 'status' ? '#10B981' : '#0684F5';
    return {
      id: item.id,
      type,
      icon,
      title: item.title || 'Notification sent',
      to: resolveAudienceLabel(audience),
      subject: item.title || 'Notification sent',
      preview: item.message || '',
      time: formatRelativeTime(item.created_at),
      stats: '',
      borderColor,
      badge: type === 'reminder' ? 'AUTOMATED' : undefined
    };
  });

  const filtered = mappedItems.filter((item) => {
    if (filter === 'email' && item.type !== 'email') return false;
    if (filter === 'reminder' && item.type !== 'reminder') return false;
    if (filter === 'updates' && !['updates', 'status'].includes(item.type)) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.preview.toLowerCase().includes(query) ||
      item.to.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[ 
            { key: 'all', label: 'All Communications' },
            { key: 'email', label: 'Emails' },
            { key: 'reminder', label: 'Reminders' },
            { key: 'updates', label: 'Updates' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === item.key ? '#0684F5' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: filter === item.key ? '#FFFFFF' : '#94A3B8',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            style={{
              height: '36px',
              padding: '0 12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="all">All time</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search communications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: '36px',
                paddingLeft: '36px',
                paddingRight: '12px',
                width: '250px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading && (
          <div style={{ color: '#94A3B8' }}>Loading communications...</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div style={{ color: '#94A3B8' }}>No communications found.</div>
        )}
        {!isLoading && filtered.map(comm => {
          const Icon = comm.icon;
          return (
            <div
              key={comm.id}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: `4px solid ${comm.borderColor}`
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} style={{ color: comm.borderColor }} />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF' }}>
                    {comm.title}
                  </span>
                  {comm.badge && (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'rgba(245,158,11,0.15)',
                        color: '#F59E0B',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '8px'
                      }}
                    >
                      {comm.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{comm.time}</span>
              </div>

              {/* Content */}
              {comm.to && (
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                  <strong style={{ color: '#FFFFFF' }}>To:</strong> {comm.to}
                </p>
              )}
              <p style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '8px' }}>
                <strong>Subject:</strong> {comm.subject}
              </p>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px', lineHeight: 1.5 }}>
                {comm.preview}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (!comm.preview) {
                      toast.error('No message content');
                      return;
                    }
                    navigator.clipboard.writeText(`${comm.subject}\n\n${comm.preview}`);
                    toast.success('Message copied');
                  }}
                  style={{
                    padding: '0',
                    border: 'none',
                    background: 'none',
                    color: '#0684F5',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  View Full Email
                </button>
                {comm.stats && (
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {comm.stats}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <button
        onClick={() => setLimit((prev) => prev + 10)}
        style={{
          width: '100%',
          height: '44px',
          marginTop: '24px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Load More
      </button>
    </div>
  );
}

// Analytics View Component
export function AnalyticsView({ speakers, sessions }: { speakers: Speaker[]; sessions: SessionSummary[] }) {
  const { t } = useI18n();
  const sortedSpeakers = useMemo(() => {
    return [...speakers].sort((a, b) => b.rating - a.rating);
  }, [speakers]);

  const sessionMetrics = useMemo(() => {
    const totalCapacity = sessions.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalAttendees = sessions.reduce((sum, session) => sum + (session.attendees || 0), 0);
    const fillRate = totalCapacity ? Math.round((totalAttendees / totalCapacity) * 100) : 0;
    return { totalCapacity, totalAttendees, fillRate };
  }, [sessions]);

  const engagementMetrics = useMemo(() => {
    const totalSpeakers = speakers.length;
    const confirmed = speakers.filter((s) => s.status === 'confirmed').length;
    const confirmationRate = totalSpeakers ? Math.round((confirmed / totalSpeakers) * 100) : 0;
    const materialRate = totalSpeakers ? Math.round((speakers.filter((s) => s.materials.submitted).length / totalSpeakers) * 100) : 0;
    const avgConfirmationDays = (() => {
      const confirmedSpeakers = speakers.filter((s) => s.status === 'confirmed' && s.created_at && s.updated_at);
      if (!confirmedSpeakers.length) return 0;
      const sum = confirmedSpeakers.reduce((acc, speaker) => {
        const start = new Date(speaker.created_at || '');
        const end = new Date(speaker.updated_at || '');
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return acc;
        return acc + Math.max(0, (end.getTime() - start.getTime()) / 86400000);
      }, 0);
      return Math.round((sum / confirmedSpeakers.length) * 10) / 10;
    })();
    return { confirmationRate, materialRate, avgConfirmationDays };
  }, [speakers]);

  const keywordItems = useMemo(() => {
    const counts = new Map<string, number>();
    speakers.forEach((speaker) => {
      const tags = [...(speaker.expertise || [])];
      tags.forEach((tag) => {
        const key = String(tag || '').trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return sorted.map(([word, count]) => ({
      word,
      size: 14 + count * 4
    }));
  }, [speakers]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      {/* Speaker Performance Chart */}
      <div
        style={{
          gridColumn: '1 / -1',
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          Speaker Ratings & Feedback
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedSpeakers.length === 0 && (
            <div style={{ color: '#94A3B8' }}>No speaker ratings yet.</div>
          )}
          {sortedSpeakers.slice(0, 5).map((speaker, index) => (
            <div key={speaker.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {index < 3 && (
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : '#CD7F32'
                      }}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF' }}>
                    {speaker.name}
                  </span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  {speaker.rating ? `${speaker.rating}/5` : '0/5'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(speaker.rating / 5) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${speaker.rating < 4 ? '#F59E0B' : '#10B981'} 0%, ${speaker.rating < 4 ? '#D97706' : '#059669'} 100%)`,
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Attendance */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.popularity')}
        </h3>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {sessions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              No session attendance data yet
            </p>
          ) : (
            <>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                {sessionMetrics.fillRate}%
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {sessionMetrics.totalAttendees} attendees across {sessions.length} sessions
              </p>
            </>
          )}
        </div>
      </div>

      {/* Material Submission Timeline */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.materialCompletion')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {speakers.slice(0, 5).map(speaker => (
            <div key={speaker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{speaker.name}</span>
              <span
                style={{
                  padding: '4px 10px',
                  backgroundColor: speaker.materials.submitted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: speaker.materials.submitted ? '#10B981' : '#F59E0B',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '12px'
                }}
              >
                {speaker.materials.submitted ? 'On Time' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Engagement */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          Speaker Engagement
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Email Open Rate</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.confirmationRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Response Rate</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.confirmationRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Material Submission</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>{engagementMetrics.materialRate}%</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>Avg Confirmation Time</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
              {engagementMetrics.avgConfirmationDays ? `${engagementMetrics.avgConfirmationDays}d` : '0d'}
            </p>
          </div>
        </div>
      </div>

      {/* Audience Feedback Keywords */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
          {t('manageEvent.speakers.analytics.feedbackTrends')}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {keywordItems.length === 0 && (
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>No feedback keywords yet</span>
          )}
          {keywordItems.map(item => (
            <span
              key={item.word}
              style={{
                fontSize: `${item.size}px`,
                fontWeight: 600,
                color: '#0684F5',
                opacity: 0.7 + (item.size / 100)
              }}
            >
              {item.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Speaker Detail Modal Component
