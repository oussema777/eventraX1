import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import {
  MapPin, Mail, Phone, MoreVertical, CheckCircle, AlertCircle, Clock, Check,
  Award, Sparkles, AlertTriangle, Map, Search, ChevronDown, ZoomIn, ZoomOut,
  RotateCcw, DoorOpen, UtensilsCrossed, User, FileText, Trash2
} from 'lucide-react';
import type { Exhibitor, Sponsor, SponsorTier, ProfileStatus, SponsorshipInquiry } from './types';

// ─── Exhibitors Cards View ───────────────────────────────────────────────────

interface ExhibitorsCardsViewProps {
  exhibitors: Exhibitor[];
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onEdit: (exhibitor: Exhibitor) => void;
  onAssignBooth: (exhibitor: Exhibitor) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
  resolveLogo: (logo: string) => string;
}

export function ExhibitorsCardsView({ exhibitors, selectedItems, onSelectItem, onEdit, onAssignBooth, onEmail, onPhone, resolveLogo }: ExhibitorsCardsViewProps) {
  const { t } = useI18n();
  const getStatusStyle = (status: ProfileStatus) => {
    const styles = {
      complete: { bg: 'rgba(230, 244, 234, 0.95)', text: '#1F7A3E', icon: CheckCircle, label: t('manageEvent.exhibitors.status.complete') },
      incomplete: { bg: 'rgba(255, 243, 224, 0.95)', text: '#B54708', icon: AlertCircle, label: t('manageEvent.exhibitors.status.incomplete') },
      pending: { bg: 'rgba(224, 231, 255, 0.95)', text: '#635BFF', icon: Clock, label: t('manageEvent.exhibitors.status.pending') }
    };
    return styles[status];
  };

  return (
    <div className="event-exhibitors__cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
      {exhibitors.map(exhibitor => {
        const statusStyle = getStatusStyle(exhibitor.profileStatus);
        const StatusIcon = statusStyle.icon;
        const isSelected = selectedItems.has(exhibitor.id);

        return (
          <div
            key={exhibitor.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Card Header */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg, #635BFF 0%, #7C75FF 100%)', position: 'relative' }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectItem(exhibitor.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'absolute', top: '12px', left: '12px', width: '20px', height: '20px', cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', accentColor: '#635BFF' }}
              />
              <div style={{ position: 'absolute', top: '12px', right: '12px', height: '28px', padding: '0 12px', backgroundColor: statusStyle.bg, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(8px)' }}>
                <StatusIcon size={14} style={{ color: statusStyle.text }} />
                <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: statusStyle.text }}>{statusStyle.label}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '-32px', left: '24px', width: '80px', height: '80px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '4px solid #FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={resolveLogo(exhibitor.logo)} alt={exhibitor.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '48px 24px 24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>{exhibitor.companyName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <MapPin size={16} style={{ color: exhibitor.booth ? '#9A9FA5' : '#DC2626' }} />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: exhibitor.booth ? '#6F767E' : '#DC2626', fontStyle: exhibitor.booth ? 'normal' : 'italic' }}>
                  {exhibitor.booth ? t('manageEvent.exhibitors.cards.booth', { number: exhibitor.booth.number }) : t('manageEvent.exhibitors.cards.noBooth')}
                </span>
                {!exhibitor.booth && (
                  <button style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: '#635BFF', border: 'none', background: 'none', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onAssignBooth(exhibitor); }}>
                    {t('manageEvent.exhibitors.cards.assign')}
                  </button>
                )}
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {exhibitor.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {exhibitor.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} style={{ height: '24px', padding: '0 10px', backgroundColor: '#F4F5F6', borderRadius: '12px', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#6F767E', display: 'inline-flex', alignItems: 'center' }}>{tag}</span>
                ))}
                {exhibitor.tags.length > 3 && (
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#635BFF', alignSelf: 'center' }}>
                    {t('manageEvent.exhibitors.cards.moreTags', { count: exhibitor.tags.length - 3 })}
                  </span>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E9EAEB' }} />

            {/* Card Footer */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button title={exhibitor.contact.email} style={{ width: '36px', height: '36px', backgroundColor: '#F4F5F6', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#635BFF'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F6'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E'; }}
                  onClick={(e) => { e.stopPropagation(); onEmail(exhibitor.contact.email); }}
                >
                  <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
                <button title={exhibitor.contact.phone} style={{ width: '36px', height: '36px', backgroundColor: '#F4F5F6', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#635BFF'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F6'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E'; }}
                  onClick={(e) => { e.stopPropagation(); onPhone(exhibitor.contact.phone); }}
                >
                  <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
              </div>
              <button style={{ width: '36px', height: '36px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => { e.stopPropagation(); onEdit(exhibitor); }}
              >
                <MoreVertical size={20} style={{ color: '#6F767E' }} />
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#E9EAEB', borderRadius: '0 0 16px 16px', overflow: 'hidden' }} title={`Profile ${exhibitor.completionPercentage}% complete`}>
              <div style={{ height: '100%', width: `${exhibitor.completionPercentage}%`, background: 'linear-gradient(90deg, #635BFF 0%, #7C75FF 100%)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sponsors Cards View ─────────────────────────────────────────────────────

interface SponsorsCardsViewProps {
  sponsors: Sponsor[];
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onEdit: (sponsor: Sponsor) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
  resolveLogo: (logo: string) => string;
}

export function SponsorsCardsView({ sponsors, selectedItems, onSelectItem, onEdit, onEmail, onPhone, resolveLogo }: SponsorsCardsViewProps) {
  const { t } = useI18n();

  const getTierStyle = (tier: SponsorTier) => {
    const styles = {
      platinum: { bg: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)', color: '#1A1D1F', label: t('manageEvent.exhibitors.stats.platinum') },
      gold: { bg: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)', color: '#F59E0B', label: t('manageEvent.exhibitors.stats.gold') },
      silver: { bg: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', color: '#6F767E', label: t('manageEvent.exhibitors.stats.silver') },
      bronze: { bg: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)', color: '#92400E', label: t('manageEvent.exhibitors.filters.tier.bronze') }
    };
    return styles[tier];
  };

  const getStatusStyle = (status: ProfileStatus) => {
    const styles = {
      complete: { bg: 'rgba(230, 244, 234, 0.95)', text: '#1F7A3E', icon: CheckCircle, label: t('manageEvent.exhibitors.status.complete') },
      incomplete: { bg: 'rgba(255, 243, 224, 0.95)', text: '#B54708', icon: AlertCircle, label: t('manageEvent.exhibitors.status.incomplete') },
      pending: { bg: 'rgba(224, 231, 255, 0.95)', text: '#635BFF', icon: Clock, label: t('manageEvent.exhibitors.status.pending') }
    };
    return styles[status];
  };

  return (
    <div className="event-exhibitors__cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
      {sponsors.map(sponsor => {
        const tierStyle = getTierStyle(sponsor.tier);
        const statusStyle = getStatusStyle(sponsor.profileStatus);
        const StatusIcon = statusStyle.icon;
        const isSelected = selectedItems.has(sponsor.id);

        return (
          <div
            key={sponsor.id}
            style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', overflow: 'hidden', position: 'relative', transition: 'all 0.3s', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0px 8px 24px rgba(0, 0, 0, 0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ height: '100px', background: tierStyle.bg, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', height: '32px', padding: '0 14px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} style={{ color: tierStyle.color }} />
                <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 700, color: tierStyle.color }}>{tierStyle.label}</span>
              </div>
              <input type="checkbox" checked={isSelected} onChange={() => onSelectItem(sponsor.id)} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', accentColor: '#635BFF' }} />
              <div style={{ position: 'absolute', top: '52px', right: '12px', height: '24px', padding: '0 10px', backgroundColor: statusStyle.bg, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)' }}>
                <StatusIcon size={12} style={{ color: statusStyle.text }} />
                <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 600, color: statusStyle.text }}>{statusStyle.label}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '-32px', left: '24px', width: '80px', height: '80px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '4px solid #FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={resolveLogo(sponsor.logo)} alt={sponsor.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ padding: '48px 24px 24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>{sponsor.companyName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: '#635BFF' }} />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#635BFF' }}>
                  {t('manageEvent.exhibitors.cards.sponsorship', { tier: tierStyle.label })}
                </span>
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sponsor.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {sponsor.benefits.slice(0, 3).map((benefit, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                    <Check size={14} style={{ color: '#1F7A3E', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E', lineHeight: 1.4 }}>{benefit}</span>
                  </div>
                ))}
                {sponsor.benefits.length > 3 && (
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#635BFF', marginLeft: '22px' }}>
                    {t('manageEvent.exhibitors.cards.benefits', { count: sponsor.benefits.length - 3 })}
                  </span>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E9EAEB' }} />

            <div style={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button title={sponsor.contact.email} style={{ width: '36px', height: '36px', backgroundColor: '#F4F5F6', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#635BFF'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F6'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E'; }}
                  onClick={(e) => { e.stopPropagation(); onEmail(sponsor.contact.email); }}
                >
                  <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
                <button title={sponsor.contact.phone} style={{ width: '36px', height: '36px', backgroundColor: '#F4F5F6', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#635BFF'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F4F5F6'; (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E'; }}
                  onClick={(e) => { e.stopPropagation(); onPhone(sponsor.contact.phone); }}
                >
                  <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
              </div>
              <button style={{ width: '36px', height: '36px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => { e.stopPropagation(); onEdit(sponsor); }}
              >
                <MoreVertical size={20} style={{ color: '#6F767E' }} />
              </button>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#E9EAEB', borderRadius: '0 0 16px 16px', overflow: 'hidden' }} title={`Profile ${sponsor.completionPercentage}% complete`}>
              <div style={{ height: '100%', width: `${sponsor.completionPercentage}%`, background: tierStyle.bg, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Exhibitors List View ────────────────────────────────────────────────────

interface ExhibitorsListViewProps {
  exhibitors: Exhibitor[];
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onSelectItem: (id: string) => void;
  onAssignBooth: (exhibitor: Exhibitor) => void;
  onEdit: (exhibitor: Exhibitor) => void;
  resolveLogo: (logo: string) => string;
}

export function ExhibitorsListView({ exhibitors, selectedItems, onSelectAll, onSelectItem, onAssignBooth, onEdit, resolveLogo }: ExhibitorsListViewProps) {
  const { t } = useI18n();
  return (
    <div className="event-exhibitors__list" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <div
        className="event-exhibitors__list-header"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', height: '48px', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '40px 1fr 180px 140px 140px 120px 100px', alignItems: 'center', gap: '16px' }}
      >
        <input type="checkbox" checked={selectedItems.size === exhibitors.length && exhibitors.length > 0} onChange={onSelectAll} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }} />
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('manageEvent.exhibitors.list.headers.company')}</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('manageEvent.exhibitors.list.headers.booth')}</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('manageEvent.exhibitors.list.headers.contact')}</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('manageEvent.exhibitors.list.headers.category')}</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('manageEvent.exhibitors.list.headers.status')}</span>
        <div></div>
      </div>

      {exhibitors.map(exhibitor => {
        const isSelected = selectedItems.has(exhibitor.id);
        return (
          <div
            key={exhibitor.id}
            className="event-exhibitors__list-row"
            style={{ height: '72px', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '40px 1fr 180px 140px 140px 120px 100px', alignItems: 'center', gap: '16px', backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent', borderLeft: isSelected ? '4px solid #0684F5' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <input type="checkbox" checked={isSelected} onChange={() => onSelectItem(exhibitor.id)} onClick={(e) => e.stopPropagation()} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={resolveLogo(exhibitor.logo)} alt={exhibitor.companyName} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid #E9EAEB', objectFit: 'cover', backgroundColor: '#FFFFFF', padding: '4px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>{exhibitor.companyName}</div>
                <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exhibitor.website}</div>
              </div>
            </div>
            <div>
              {exhibitor.booth ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <MapPin size={14} style={{ color: '#0684F5' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>{t('manageEvent.exhibitors.cards.booth', { number: exhibitor.booth.number })}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>{exhibitor.booth.hall}, {exhibitor.booth.location}</div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertTriangle size={14} style={{ color: '#DC2626' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#DC2626' }}>{t('manageEvent.exhibitors.list.unassigned')}</span>
                  </div>
                  <button style={{ padding: '0', border: 'none', background: 'none', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#0684F5', cursor: 'pointer', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={(e) => { e.stopPropagation(); onAssignBooth(exhibitor); }}
                  >
                    {t('manageEvent.exhibitors.list.assignNow')}
                  </button>
                </>
              )}
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>{exhibitor.contact.name}</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>{exhibitor.contact.role}</div>
            </div>
            <div>
              <span style={{ display: 'inline-flex', height: '26px', padding: '0 12px', backgroundColor: 'rgba(6, 132, 245, 0.15)', borderRadius: '13px', alignItems: 'center', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#0684F5' }}>{exhibitor.category}</span>
            </div>
            <div>
              {exhibitor.profileStatus === 'complete' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <CheckCircle size={16} style={{ color: '#1F7A3E' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#1F7A3E' }}>Complete</span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>100%</div>
                </>
              ) : exhibitor.profileStatus === 'incomplete' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertCircle size={16} style={{ color: '#B54708' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#B54708' }}>Incomplete</span>
                  </div>
                  <div style={{ width: '60px', height: '4px', backgroundColor: '#E9EAEB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${exhibitor.completionPercentage}%`, height: '100%', backgroundColor: '#B54708', borderRadius: '2px' }} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: '#635BFF' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#635BFF' }}>Pending Setup</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ width: '32px', height: '32px', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => { e.stopPropagation(); onEdit(exhibitor); }}
              >
                <MoreVertical size={18} style={{ color: '#94A3B8' }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sponsors List View ──────────────────────────────────────────────────────

interface SponsorsListViewProps {
  sponsors: Sponsor[];
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onSelectItem: (id: string) => void;
  onEdit: (sponsor: Sponsor) => void;
  resolveLogo: (logo: string) => string;
}

export function SponsorsListView({ sponsors, selectedItems, onSelectAll, onSelectItem, onEdit, resolveLogo }: SponsorsListViewProps) {
  const getTierStyle = (tier: SponsorTier) => {
    const styles = {
      platinum: { bg: 'rgba(229, 231, 235, 0.9)', color: '#1A1D1F', label: 'Platinum' },
      gold: { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', label: 'Gold' },
      silver: { bg: 'rgba(148, 163, 184, 0.2)', color: '#94A3B8', label: 'Silver' },
      bronze: { bg: 'rgba(146, 64, 14, 0.2)', color: '#92400E', label: 'Bronze' }
    };
    return styles[tier];
  };

  return (
    <div className="event-exhibitors__list" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <div className="event-exhibitors__list-header" style={{ backgroundColor: 'rgba(255,255,255,0.05)', height: '48px', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '40px 1fr 160px 160px 140px 100px', alignItems: 'center', gap: '16px' }}>
        <input type="checkbox" checked={selectedItems.size === sponsors.length && sponsors.length > 0} onChange={onSelectAll} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }} />
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>COMPANY</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIER</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRIMARY CONTACT</span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PROFILE STATUS</span>
        <div></div>
      </div>

      {sponsors.map((sponsor) => {
        const isSelected = selectedItems.has(sponsor.id);
        const tierStyle = getTierStyle(sponsor.tier);
        return (
          <div
            key={sponsor.id}
            className="event-exhibitors__list-row"
            style={{ height: '72px', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '40px 1fr 160px 160px 140px 100px', alignItems: 'center', gap: '16px', backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent', borderLeft: isSelected ? '4px solid #0684F5' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <input type="checkbox" checked={isSelected} onChange={() => onSelectItem(sponsor.id)} onClick={(e) => e.stopPropagation()} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={resolveLogo(sponsor.logo)} alt={sponsor.companyName} style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid #E9EAEB', objectFit: 'cover', backgroundColor: '#FFFFFF', padding: '4px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>{sponsor.companyName}</div>
                <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sponsor.website}</div>
              </div>
            </div>
            <div>
              <span style={{ display: 'inline-flex', height: '26px', padding: '0 12px', backgroundColor: tierStyle.bg, borderRadius: '13px', alignItems: 'center', fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: tierStyle.color }}>{tierStyle.label}</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>{sponsor.contact.name}</div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>{sponsor.contact.role}</div>
            </div>
            <div>
              {sponsor.profileStatus === 'complete' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#1F7A3E' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#1F7A3E' }}>Complete</span>
                </div>
              ) : sponsor.profileStatus === 'incomplete' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} style={{ color: '#B54708' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#B54708' }}>Incomplete</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: '#635BFF' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#635BFF' }}>Pending Setup</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ width: '32px', height: '32px', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => { e.stopPropagation(); onEdit(sponsor); }}
              >
                <MoreVertical size={18} style={{ color: '#94A3B8' }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Booth Map View ──────────────────────────────────────────────────────────

interface BoothMapViewProps {
  exhibitors: Exhibitor[];
  selectedBooth: string | null;
  onSelectBooth: (booth: string | null) => void;
  onEditExhibitor: (exhibitor: Exhibitor) => void;
  resolveLogo: (logo: string) => string;
}

export function BoothMapView({ exhibitors, selectedBooth, onSelectBooth, onEditExhibitor, resolveLogo }: BoothMapViewProps) {
  const { t } = useI18n();
  const booths = useMemo(() => {
    return exhibitors
      .filter((exhibitor) => exhibitor.booth?.number)
      .map((exhibitor) => ({
        number: exhibitor.booth?.number || '',
        hall: exhibitor.booth?.hall || 'Main Hall',
        location: exhibitor.booth?.location || '',
        exhibitor
      }));
  }, [exhibitors]);

  const hallOptions = useMemo(() => {
    const halls = Array.from(new Set(booths.map((booth) => booth.hall).filter(Boolean)));
    return halls.length ? halls : ['Main Hall'];
  }, [booths]);

  const [activeHall, setActiveHall] = useState(hallOptions[0]);

  useEffect(() => {
    if (!hallOptions.includes(activeHall)) {
      setActiveHall(hallOptions[0]);
    }
  }, [activeHall, hallOptions]);

  const visibleBooths = booths.filter((booth) => booth.hall === activeHall);
  const selectedBoothData = visibleBooths.find((booth) => booth.number === selectedBooth) || null;

  useEffect(() => {
    if (selectedBooth && !selectedBoothData) {
      onSelectBooth(null);
    }
  }, [selectedBooth, selectedBoothData, onSelectBooth]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', padding: '32px', minHeight: '700px', position: 'relative' }}>
      <div className="event-exhibitors__map-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E9EAEB', paddingBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F' }}>{t('manageEvent.exhibitors.map.title')}</h2>
        <div className="event-exhibitors__map-controls" style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <select value={activeHall} onChange={(e) => setActiveHall(e.target.value)} style={{ width: '160px', height: '36px', padding: '0 40px 0 12px', backgroundColor: '#F4F5F6', border: '1px solid #E9EAEB', borderRadius: '8px', fontFamily: 'Inter', fontSize: '14px', color: '#6F767E', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
              {hallOptions.map((hall) => (
                <option key={hall} value={hall}>{hall === 'Main Hall' ? t('manageEvent.exhibitors.map.mainHall') : hall}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F4F5F6', padding: '4px', borderRadius: '8px' }}>
            {[ZoomIn, ZoomOut, RotateCcw].map((Icon, idx) => (
              <button key={idx} title={idx === 0 ? 'Zoom In' : idx === 1 ? 'Zoom Out' : 'Reset View'} style={{ width: '32px', height: '32px', backgroundColor: 'transparent', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icon size={16} style={{ color: '#6F767E' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div style={{ position: 'absolute', top: '80px', left: '32px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)', zIndex: 5, width: '220px' }}>
        <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#1A1D1F', marginBottom: '12px' }}>{t('manageEvent.exhibitors.map.legend')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { color: '#635BFF', label: t('manageEvent.exhibitors.map.legendItems.assigned') },
            { color: '#E9EAEB', label: t('manageEvent.exhibitors.map.legendItems.available') },
            { color: '#F59E0B', label: t('manageEvent.exhibitors.map.legendItems.premium') }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: item.color, borderRadius: '4px' }} />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>{item.label}</span>
            </div>
          ))}
          {[
            { icon: DoorOpen, label: t('manageEvent.exhibitors.map.legendItems.entry'), color: '#1F7A3E' },
            { icon: UtensilsCrossed, label: t('manageEvent.exhibitors.map.legendItems.food'), color: '#F59E0B' },
            { icon: User, label: t('manageEvent.exhibitors.map.legendItems.restrooms'), color: '#635BFF' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} style={{ color: item.color }} />
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ backgroundColor: '#FAFBFC', border: '2px dashed #E9EAEB', borderRadius: '12px', minHeight: '600px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {visibleBooths.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Map size={64} style={{ color: '#E9EAEB', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#6F767E', marginBottom: '8px' }}>{t('manageEvent.exhibitors.map.empty.title')}</p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#9A9FA5' }}>{t('manageEvent.exhibitors.map.empty.subtitle')}</p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {visibleBooths.map((booth) => {
              const isSelected = booth.number === selectedBooth;
              return (
                <button key={booth.number} onClick={() => onSelectBooth(booth.number)} style={{ padding: '16px', backgroundColor: isSelected ? '#635BFF' : '#FFFFFF', border: `1px solid ${isSelected ? '#635BFF' : '#E9EAEB'}`, borderRadius: '12px', textAlign: 'left', cursor: 'pointer', boxShadow: isSelected ? '0px 8px 16px rgba(99, 91, 255, 0.2)' : '0px 2px 8px rgba(0, 0, 0, 0.04)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <img src={resolveLogo(booth.exhibitor.logo)} alt={booth.exhibitor.companyName} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#FFFFFF' }} />
                    <div>
                      <div style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#1A1D1F' }}>{t('manageEvent.exhibitors.map.boothLabel', { number: booth.number })}</div>
                      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#6F767E' }}>{booth.exhibitor.companyName}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#9A9FA5' }}>{booth.location || t('manageEvent.exhibitors.map.standardLocation')}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Assign Panel */}
      {selectedBooth && (
        <div style={{ position: 'absolute', right: '32px', top: '120px', width: '320px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)', border: '2px solid #635BFF', zIndex: 10 }}>
          <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '16px' }}>{t('manageEvent.exhibitors.map.assignPanel.title', { number: selectedBooth })}</h3>
          <div style={{ backgroundColor: '#F4F5F6', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>{t('manageEvent.exhibitors.map.assignPanel.size')}</span>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>{t('manageEvent.exhibitors.map.assignPanel.location', { hall: selectedBoothData?.hall || activeHall, location: selectedBoothData?.location || '' })}</span>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>{selectedBoothData?.location ? t('manageEvent.exhibitors.map.assignPanel.typeAssigned') : t('manageEvent.exhibitors.map.assignPanel.typeStandard')}</span>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '12px' }}>{t('manageEvent.exhibitors.map.assignPanel.selectLabel')}</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A9FA5' }} />
              <input type="text" placeholder={t('manageEvent.exhibitors.map.assignPanel.searchPlaceholder')} value={selectedBoothData?.exhibitor.companyName || ''} readOnly style={{ width: '100%', height: '44px', paddingLeft: '40px', paddingRight: '16px', backgroundColor: '#FFFFFF', border: '2px solid #E9EAEB', borderRadius: '8px', fontFamily: 'Inter', fontSize: '14px', color: '#1A1D1F', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => onSelectBooth(null)} style={{ flex: 1, height: '40px', backgroundColor: '#FFFFFF', border: '2px solid #E9EAEB', borderRadius: '8px', fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#6F767E', cursor: 'pointer' }}>{t('manageEvent.exhibitors.map.assignPanel.cancel')}</button>
            <button disabled={!selectedBoothData} onClick={() => { if (selectedBoothData) onEditExhibitor(selectedBoothData.exhibitor); }} style={{ flex: 1, height: '40px', backgroundColor: '#635BFF', border: 'none', borderRadius: '8px', fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: selectedBoothData ? 'pointer' : 'not-allowed', opacity: selectedBoothData ? 1 : 0.6 }}>{t('manageEvent.exhibitors.map.assignPanel.assign')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inquiries List View ─────────────────────────────────────────────────────

interface InquiriesListViewProps {
  inquiries: SponsorshipInquiry[];
  onUpdateStatus: (id: string, status: 'new' | 'contacted' | 'closed') => void;
  onDelete: (id: string) => void;
}

export function InquiriesListView({ inquiries, onUpdateStatus, onDelete }: InquiriesListViewProps) {
  return (
    <div className="event-inquiries-list" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Inquirer</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Package</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '15px' }}>{inq.companyName}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>{inq.fullName} &bull; {inq.email}</div>
                  {inq.message && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '12px', color: '#64748B', fontStyle: 'italic', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                      &ldquo;{inq.message}&rdquo;
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: 'rgba(6, 132, 245, 0.15)', color: '#0684F5', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid rgba(6, 132, 245, 0.3)' }}>{inq.packageId}</span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#94A3B8' }}>
                  {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '16px' }}>
                  <select value={inq.status} onChange={(e) => onUpdateStatus(inq.id, e.target.value as any)} style={{
                    backgroundColor: inq.status === 'new' ? 'rgba(16, 185, 129, 0.15)' : inq.status === 'contacted' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.08)',
                    color: inq.status === 'new' ? '#10B981' : inq.status === 'contacted' ? '#F59E0B' : '#94A3B8',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none'
                  }}>
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={() => window.location.href = `mailto:${inq.email}?subject=Sponsorship Inquiry - Eventra`} title="Send Email" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(6, 132, 245, 0.1)', color: '#0684F5', border: '1px solid rgba(6, 132, 245, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'}
                    >
                      <Mail size={18} />
                    </button>
                    <button onClick={() => onDelete(inq.id)} title="Delete Inquiry" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '80px 40px', textAlign: 'center', color: '#94A3B8' }}>
                  <div style={{ opacity: 0.3, marginBottom: '16px' }}>
                    <FileText size={64} style={{ margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 500 }}>No sponsorship inquiries yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>When potential partners inquire about your packages, they will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
