import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { toast } from 'sonner';
import {
  Plus, Search, ChevronDown, MapPin, Mail, Download, BarChart3, Trash2,
  LayoutGrid, List, Map, CheckCircle, Clock, Upload, Award, Sparkles,
  RefreshCw, FileText, ArrowUpDown, TrendingUp, Store, MessageCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TabMode, ViewMode, ProfileStatus, SponsorTier, Exhibitor, Sponsor, SponsorshipInquiry } from './exhibitors/types';
import { ExhibitorsCardsView, SponsorsCardsView, ExhibitorsListView, SponsorsListView, BoothMapView, InquiriesListView } from './exhibitors/ExhibitorsList';
import { AddExhibitorSponsorModal, ImportExcelModal } from './exhibitors/ExhibitorForm';

export default function EventExhibitorsTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabMode>('exhibitors');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'exhibitor' | 'sponsor'>('exhibitor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Exhibitor | Sponsor | null>(null);
  const [startAssignBooth, setStartAssignBooth] = useState(false);
  const [boothFilter, setBoothFilter] = useState<'all' | 'assigned' | 'unassigned' | 'premium'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | ProfileStatus>('all');
  const [tierFilter, setTierFilter] = useState<'all' | SponsorTier>('all');
  const [sortOption, setSortOption] = useState<'company' | 'booth' | 'date' | 'profile'>('company');

  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [inquiries, setInquiries] = useState<SponsorshipInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

  const mapExhibitorRow = (row: any): Exhibitor => ({
    id: String(row.id),
    companyName: row.company_name || '',
    logo: row.logo_url || row.logo || '',
    website: row.website || '',
    description: row.description || '',
    category: row.category || row.industry || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || null,
    booth: row.booth_number || row.booth_hall || row.booth_location
      ? { number: row.booth_number || '', hall: row.booth_hall || '', location: row.booth_location || '' }
      : undefined,
    contact: {
      name: row.contact_name || '',
      role: row.contact_role || '',
      email: row.contact_email || row.email || '',
      phone: row.contact_phone || row.phone || ''
    },
    profileStatus: (row.profile_status || row.profileStatus || 'incomplete') as ProfileStatus,
    completionPercentage: typeof row.completion_percentage === 'number'
      ? row.completion_percentage
      : (row.completionPercentage || 0)
  });

  const mapSponsorRow = (row: any): Sponsor => ({
    id: String(row.id),
    companyName: row.company_name || row.name || '',
    logo: row.logo_url || row.logo || '',
    website: row.website || '',
    description: row.description || '',
    category: row.category || row.industry || '',
    tier: (row.tier || 'gold') as SponsorTier,
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    createdAt: row.created_at || null,
    contact: {
      name: row.contact_name || '',
      role: row.contact_role || '',
      email: row.contact_email || row.email || '',
      phone: row.contact_phone || row.phone || ''
    },
    profileStatus: (row.profile_status || row.profileStatus || 'incomplete') as ProfileStatus,
    completionPercentage: typeof row.completion_percentage === 'number'
      ? row.completion_percentage
      : (row.completionPercentage || 0)
  });

  const refreshData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const [
        { data: exData, error: exErr }, 
        { data: spData, error: spErr },
        { data: inqData, error: inqErr }
      ] = await Promise.all([
        supabase.from('event_exhibitors').select('*').eq('event_id', eventId),
        supabase.from('event_sponsors').select('*').eq('event_id', eventId),
        supabase.from('event_sponsorship_inquiries').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      ]);
      
      if (exErr) {
        console.error('Error fetching exhibitors:', exErr);
        toast.error('Failed to load exhibitors: ' + exErr.message);
      } else {
        setExhibitors((exData || []).map(mapExhibitorRow));
      }

      if (spErr) {
        console.error('Error fetching sponsors:', spErr);
        toast.error('Failed to load sponsors: ' + spErr.message);
      } else {
        setSponsors((spData || []).map(mapSponsorRow));
      }

      if (inqErr) {
        if (inqErr.code !== '42P01') { // Ignore missing table error for now
          console.error('Error fetching inquiries:', inqErr);
        }
      } else {
        setInquiries((inqData || []).map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          companyName: row.company_name,
          email: row.email,
          message: row.message,
          packageId: row.package_id,
          status: row.status,
          createdAt: row.created_at
        })));
      }
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      toast.error('Refresh failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    setSelectedItems(new Set());
  }, [eventId]);

  const resolveLogo = (logo: string) => (logo && logo.trim() ? logo : fallbackLogo);

  const getSelfFillLink = (kind: 'exhibitor' | 'sponsor') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eventra.app';
    return `${origin}/business-profile-wizard?eventId=${eventId}&type=${kind}`;
  };

  const handleCopyLink = async (kind: 'exhibitor' | 'sponsor') => {
    const link = getSelfFillLink(kind);
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch {
      try {
        window.prompt('Copy link', link);
        return true;
      } catch {
        return false;
      }
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setStartAssignBooth(false);
    setAddModalType(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor');
    setShowAddModal(true);
  };

  const openEditModal = (type: 'exhibitor' | 'sponsor', item: Exhibitor | Sponsor, assignBooth = false) => {
    setEditingItem(item);
    setStartAssignBooth(assignBooth);
    setAddModalType(type);
    setShowAddModal(true);
  };

  const handleEmailClick = (email: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };


  const filteredExhibitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const premiumMatcher = (value: string) => value.toLowerCase().includes('premium') || value.toLowerCase().includes('corner');
    let list = [...exhibitors];

    if (boothFilter === 'assigned') list = list.filter((e) => !!e.booth);
    if (boothFilter === 'unassigned') list = list.filter((e) => !e.booth);
    if (boothFilter === 'premium') {
      list = list.filter((e) => {
        const hall = e.booth?.hall || '';
        const location = e.booth?.location || '';
        return premiumMatcher(hall) || premiumMatcher(location);
      });
    }

    if (profileFilter !== 'all') list = list.filter((e) => e.profileStatus === profileFilter);

    if (q) {
      list = list.filter((e) =>
        (e.companyName || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q) ||
        (e.website || '').toLowerCase().includes(q) ||
        (e.booth?.number || '').toLowerCase().includes(q) ||
        (e.contact?.name || '').toLowerCase().includes(q) ||
        (e.contact?.email || '').toLowerCase().includes(q)
      );
    }

    if (sortOption === 'company') {
      list.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else if (sortOption === 'booth') {
      list.sort((a, b) => (a.booth?.number || '').localeCompare(b.booth?.number || '', undefined, { numeric: true, sensitivity: 'base' }));
    } else if (sortOption === 'date') {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortOption === 'profile') {
      list.sort((a, b) => (b.completionPercentage || 0) - (a.completionPercentage || 0));
    }

    return list;
  }, [exhibitors, searchQuery, boothFilter, profileFilter, sortOption]);

  const filteredSponsors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...sponsors];

    if (tierFilter !== 'all') list = list.filter((sp) => sp.tier === tierFilter);
    if (profileFilter !== 'all') list = list.filter((sp) => sp.profileStatus === profileFilter);

    if (q) {
      list = list.filter((sp) =>
        (sp.companyName || '').toLowerCase().includes(q) ||
        (sp.tier || '').toLowerCase().includes(q) ||
        (sp.website || '').toLowerCase().includes(q) ||
        (sp.contact?.name || '').toLowerCase().includes(q) ||
        (sp.contact?.email || '').toLowerCase().includes(q)
      );
    }

    if (sortOption === 'company') {
      list.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else if (sortOption === 'date') {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortOption === 'profile') {
      list.sort((a, b) => (b.completionPercentage || 0) - (a.completionPercentage || 0));
    }

    return list;
  }, [sponsors, searchQuery, tierFilter, profileFilter, sortOption]);

  const stats = {
    exhibitors: {
      total: exhibitors.length,
      boothsAssigned: exhibitors.filter(e => e.booth).length,
      pendingSetup: exhibitors.filter(e => e.profileStatus === 'pending').length,
      profileComplete: exhibitors.filter(e => e.profileStatus === 'complete').length
    },
    sponsors: {
      total: sponsors.length,
      platinum: sponsors.filter(s => s.tier === 'platinum').length,
      gold: sponsors.filter(s => s.tier === 'gold').length,
      silver: sponsors.filter(s => s.tier === 'silver').length
    }
  };

  const statsCards = useMemo(() => {
    if (activeTab === 'exhibitors') {
      return [
        { label: t('manageEvent.exhibitors.stats.totalExhibitors'), value: stats.exhibitors.total, icon: Store, color: '#0684F5', bg: 'rgba(6, 132, 245, 0.15)' },
        { label: t('manageEvent.exhibitors.stats.boothsAssigned'), value: stats.exhibitors.boothsAssigned, icon: MapPin, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
        { label: t('manageEvent.exhibitors.stats.pendingSetup'), value: stats.exhibitors.pendingSetup, icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
        { label: t('manageEvent.exhibitors.stats.profilesComplete'), value: stats.exhibitors.profileComplete, icon: CheckCircle, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' }
      ];
    }
    if (activeTab === 'inquiries') {
      return [
        { label: 'Total Inquiries', value: inquiries.length, icon: FileText, color: '#0684F5', bg: 'rgba(6, 132, 245, 0.15)' },
        { label: 'New Leads', value: inquiries.filter(i => i.status === 'new').length, icon: Sparkles, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
        { label: 'Contacted', value: inquiries.filter(i => i.status === 'contacted').length, icon: MessageCircle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
        { label: 'Conversion Rate', value: inquiries.length > 0 ? `${Math.round((sponsors.length / (inquiries.length + sponsors.length)) * 100)}%` : '0%', icon: TrendingUp, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' }
      ];
    }
    return [
      { label: t('manageEvent.exhibitors.stats.totalSponsors'), value: stats.sponsors.total, icon: Award, color: '#0684F5', bg: 'rgba(6, 132, 245, 0.15)' },
      { label: t('manageEvent.exhibitors.stats.platinum'), value: stats.sponsors.platinum, icon: Sparkles, color: '#635BFF', bg: 'rgba(99, 91, 255, 0.15)' },
      { label: t('manageEvent.exhibitors.stats.gold'), value: stats.sponsors.gold, icon: BarChart3, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: t('manageEvent.exhibitors.stats.silver'), value: stats.sponsors.silver, icon: CheckCircle, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' }
    ];
  }, [activeTab, stats, t]);

  const currentItems = activeTab === 'exhibitors' ? filteredExhibitors : filteredSponsors;

  const handleSelectAll = () => {
    const items = activeTab === 'exhibitors' ? filteredExhibitors : filteredSponsors;
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const downloadCSV = (rows: Record<string, any>[], filename: string) => {
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const escape = (v: any) => {
      const val = v == null ? '' : String(v);
      if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
      return val;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
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

  const bulkRemove = async () => {
    const ids = Array.from(selectedItems);
    if (!ids.length) return;
    const table = activeTab === 'exhibitors' ? 'event_exhibitors' : 'event_sponsors';
    await supabase.from(table).delete().in('id', ids).eq('event_id', eventId);
    setSelectedItems(new Set());
    await refreshData();
  };

  const bulkExport = () => {
    const items = activeTab === 'exhibitors' ? filteredExhibitors : filteredSponsors;
    if (activeTab === 'exhibitors') {
      const rows = items.map(e => ({
        id: e.id,
        companyName: e.companyName,
        website: e.website,
        category: e.category,
        contactName: e.contact?.name || '',
        contactRole: e.contact?.role || '',
        contactEmail: e.contact?.email || '',
        contactPhone: e.contact?.phone || '',
        boothNumber: e.booth?.number || '',
        boothHall: e.booth?.hall || '',
        boothLocation: e.booth?.location || '',
        profileStatus: e.profileStatus,
        completionPercentage: e.completionPercentage
      }));
      downloadCSV(rows, 'exhibitors.csv');
    } else {
      const rows = items.map(sp => ({
        id: sp.id,
        companyName: sp.companyName || sp.name,
        website: sp.website,
        tier: sp.tier,
        category: sp.category,
        contactName: sp.contact?.name || '',
        contactRole: sp.contact?.role || '',
        contactEmail: sp.contact?.email || '',
        contactPhone: sp.contact?.phone || '',
        profileStatus: sp.profileStatus,
        completionPercentage: sp.completionPercentage
      }));
      downloadCSV(rows, 'sponsors.csv');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'remove') return bulkRemove();
    if (action === 'export') return bulkExport();
  };

  return (
    <div className="event-exhibitors" style={{ padding: '32px', paddingBottom: '80px', backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 600px) {
          .event-exhibitors {
            padding: 24px 16px 80px;
          }

          .event-exhibitors__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .event-exhibitors__actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-exhibitors__actions button {
            width: 100%;
            justify-content: center;
          }

          .event-exhibitors__mode-tabs {
            width: 100%;
            flex-wrap: wrap;
          }

          .event-exhibitors__stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .event-exhibitors__management,
          .event-exhibitors__self-fill,
          .event-exhibitors__filters {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .event-exhibitors__management-toggle,
          .event-exhibitors__self-fill-actions,
          .event-exhibitors__filters-controls {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-exhibitors__management-toggle button {
            flex: 1 1 160px;
          }

          .event-exhibitors__self-fill-actions button {
            width: 100%;
            justify-content: center;
          }

          .event-exhibitors__filters-search {
            width: 100% !important;
            max-width: 100%;
            min-width: 0;
          }

          .event-exhibitors__filters-controls > * {
            width: 100%;
          }

          .event-exhibitors__filters-controls select {
            width: 100% !important;
          }

          .event-exhibitors__filters-search input {
            width: 100% !important;
            box-sizing: border-box;
          }

          .event-exhibitors__view-toggle {
            justify-content: flex-start;
          }

          .event-exhibitors__cards-grid {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }

          .event-exhibitors__list-header {
            display: none !important;
          }

          .event-exhibitors__list-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            height: auto !important;
            padding: 16px !important;
            grid-template-columns: 1fr !important;
          }

          .event-exhibitors__list-row > * {
            width: 100%;
          }

          .event-exhibitors__map-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .event-exhibitors__map-controls {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .event-exhibitors__map-controls > div {
            width: 100%;
          }

          .event-exhibitors__map-controls select {
            width: 100% !important;
          }

          .event-exhibitors [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 400px) {
          .event-exhibitors {
            padding: 20px 12px 72px;
          }

          .event-exhibitors__list-row {
            padding: 14px !important;
          }

          .event-exhibitors [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* TAB HEADER SECTION */}
      <div className="event-exhibitors__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Left Side: Title & Mode Toggle */}
        <div>
          <h1 style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            {t('manageEvent.exhibitors.header.title')}
          </h1>

          {/* Mode Toggle Tabs */}
          <div
            className="event-exhibitors__mode-tabs"
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '4px',
              borderRadius: '10px',
              width: 'fit-content',
              marginBottom: '16px'
            }}
          >
            {[
              { id: 'exhibitors', label: t('manageEvent.exhibitors.tabs.exhibitors') },
              { id: 'sponsors', label: t('manageEvent.exhibitors.tabs.sponsors') },
              { id: 'inquiries', label: 'Inquiries' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  const nextTab = tab.id as TabMode;
                  setActiveTab(nextTab);
                  setSelectedItems(new Set());
                  if (nextTab === 'sponsors' && viewMode === 'booth-map') {
                    setViewMode('cards');
                  }
                }}
                style={{
                  height: '36px',
                  padding: '0 20px',
                  backgroundColor: activeTab === tab.id ? '#0684F5' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(activeTab === tab.id && { boxShadow: '0px 2px 6px rgba(6, 132, 245, 0.3)' })
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="event-exhibitors__stats grid grid-cols-4 gap-6">
            {statsCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl p-6 border transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                    {stat.label}
                  </p>
                  <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
                    {stat.value}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="event-exhibitors__actions" style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'transparent',
              border: '2px solid #10B981',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Upload size={18} />
            Import from Excel
          </button>

          <button
            onClick={openAddModal}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#0684F5',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0876D9';
              e.currentTarget.style.boxShadow = '0px 4px 12px rgba(6, 132, 245, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0684F5';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            {t('manageEvent.exhibitors.header.add')}
          </button>
        </div>
      </div>


      {/* FILTERS & SEARCH BAR */}
      <div
        className="event-exhibitors__filters"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        {/* Left: Search */}
        <div className="event-exhibitors__filters-search" style={{ position: 'relative', width: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder={t('manageEvent.exhibitors.filters.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '44px',
              paddingRight: '16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              color: '#FFFFFF',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '2px solid #0684F5';
              e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(6, 132, 245, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Right: Filters */}
        <div className="event-exhibitors__filters-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeTab === 'exhibitors' && (
            <div style={{ position: 'relative' }}>
              <select
                value={boothFilter}
                onChange={(e) => setBoothFilter(e.target.value as typeof boothFilter)}
                style={{
                  width: '150px',
                  height: '40px',
                  padding: '0 40px 0 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none'
                }}
              >
                <option value="all">{t('manageEvent.exhibitors.filters.booth.all')}</option>
                <option value="assigned">{t('manageEvent.exhibitors.filters.booth.assigned')}</option>
                <option value="unassigned">{t('manageEvent.exhibitors.filters.booth.unassigned')}</option>
                <option value="premium">{t('manageEvent.exhibitors.filters.booth.premium')}</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value as typeof profileFilter)}
              style={{
                width: '160px',
                height: '40px',
                padding: '0 40px 0 16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#FFFFFF',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option value="all">{t('manageEvent.exhibitors.filters.profile.all')}</option>
              <option value="complete">{t('manageEvent.exhibitors.filters.profile.complete')}</option>
              <option value="incomplete">{t('manageEvent.exhibitors.filters.profile.incomplete')}</option>
              <option value="pending">{t('manageEvent.exhibitors.filters.profile.pending')}</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          </div>

          {activeTab === 'sponsors' && (
            <div style={{ position: 'relative' }}>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
                style={{
                  width: '160px',
                  height: '40px',
                  padding: '0 40px 0 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none'
                }}
              >
                <option value="all">{t('manageEvent.exhibitors.filters.tier.all')}</option>
                <option value="platinum">{t('manageEvent.exhibitors.stats.platinum')}</option>
                <option value="gold">{t('manageEvent.exhibitors.stats.gold')}</option>
                <option value="silver">{t('manageEvent.exhibitors.stats.silver')}</option>
                <option value="bronze">{t('manageEvent.exhibitors.filters.tier.bronze')}</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
              style={{
                width: '140px',
                height: '40px',
                padding: '0 40px 0 40px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#FFFFFF',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              <option value="company">{t('manageEvent.exhibitors.filters.sort.company')}</option>
              <option value="booth">{t('manageEvent.exhibitors.filters.sort.booth')}</option>
              <option value="date">{t('manageEvent.exhibitors.filters.sort.date')}</option>
              <option value="profile">{t('manageEvent.exhibitors.filters.sort.profile')}</option>
            </select>
            <ArrowUpDown size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedItems.size > 0 && (
        <div
          style={{
            backgroundColor: '#0684F5',
            padding: '16px 24px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {/* Left: Selection Info */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={currentItems.length > 0 && selectedItems.size === currentItems.length}
              onChange={handleSelectAll}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#FFFFFF' }}
            />
            <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
              {t('manageEvent.exhibitors.bulk.selected', { count: selectedItems.size, type: activeTab === 'exhibitors' ? t('manageEvent.exhibitors.tabs.exhibitors').toLowerCase() : t('manageEvent.exhibitors.tabs.sponsors').toLowerCase() })}
            </span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'exhibitors' ? (
              <>
                {[
                  { icon: MapPin, label: t('manageEvent.exhibitors.bulk.assignBooths'), action: 'assign' },
                  { icon: Mail, label: t('manageEvent.exhibitors.bulk.sendMessage'), action: 'message' },
                  { icon: RefreshCw, label: t('manageEvent.exhibitors.bulk.updateStatus'), action: 'status' },
                  { icon: Download, label: t('manageEvent.exhibitors.bulk.exportData'), action: 'export' },
                  { icon: Trash2, label: t('manageEvent.exhibitors.bulk.remove'), action: 'remove' }
                ].map((actionItem, idx) => {
                  const Icon = actionItem.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleBulkAction(actionItem.action)}
                      style={{
                        height: '36px',
                        padding: '0 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'Inter',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = actionItem.action === 'remove' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <Icon size={16} />
                      {actionItem.label}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {[
                  { icon: Award, label: t('manageEvent.exhibitors.bulk.updateTier'), action: 'tier' },
                  { icon: FileText, label: t('manageEvent.exhibitors.bulk.sendMaterials'), action: 'materials' },
                  { icon: Download, label: t('manageEvent.exhibitors.bulk.exportData'), action: 'export' },
                  { icon: Trash2, label: t('manageEvent.exhibitors.bulk.remove'), action: 'remove' }
                ].map((actionItem, idx) => {
                  const Icon = actionItem.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleBulkAction(actionItem.action)}
                      style={{
                        height: '36px',
                        padding: '0 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'Inter',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = actionItem.action === 'remove' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <Icon size={16} />
                      {actionItem.label}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW LAYOUT TOGGLE */}
      <div className="event-exhibitors__view-toggle" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '4px',
            borderRadius: '8px'
          }}
        >
          {[
            { id: 'cards', icon: LayoutGrid, label: t('manageEvent.exhibitors.viewModes.cards') },
            { id: 'list', icon: List, label: t('manageEvent.exhibitors.viewModes.list') },
            ...(activeTab === 'exhibitors' ? [{ id: 'booth-map', icon: Map, label: t('manageEvent.exhibitors.viewModes.map') }] : [])
          ].map(view => {
            const Icon = view.icon;
            // Inquiries only support list view for now
            if (activeTab === 'inquiries' && view.id !== 'list') return null;
            
            return (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id as ViewMode)}
                title={view.label}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: viewMode === view.id || (activeTab === 'inquiries' && view.id === 'list') ? '#0684F5' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...((viewMode === view.id || (activeTab === 'inquiries' && view.id === 'list')) && { boxShadow: '0px 2px 4px rgba(6, 132, 245, 0.3)' })
                }}
              >
                <Icon size={18} style={{ color: viewMode === view.id || (activeTab === 'inquiries' && view.id === 'list') ? '#FFFFFF' : '#94A3B8' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      {activeTab === 'inquiries' && (
        <InquiriesListView 
          inquiries={inquiries} 
          onUpdateStatus={async (id, status) => {
            await supabase.from('event_sponsorship_inquiries').update({ status }).eq('id', id);
            await refreshData();
          }}
          onDelete={async (id) => {
            if (window.confirm('Delete this inquiry?')) {
              await supabase.from('event_sponsorship_inquiries').delete().eq('id', id);
              await refreshData();
            }
          }}
        />
      )}

      {viewMode === 'cards' && activeTab === 'exhibitors' && (
        <ExhibitorsCardsView
          exhibitors={filteredExhibitors}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onEdit={(exhibitor) => openEditModal('exhibitor', exhibitor)}
          onAssignBooth={(exhibitor) => openEditModal('exhibitor', exhibitor, true)}
          onEmail={handleEmailClick}
          onPhone={handlePhoneClick}
          resolveLogo={resolveLogo}
        />
      )}

      {viewMode === 'cards' && activeTab === 'sponsors' && (
        <SponsorsCardsView
          sponsors={filteredSponsors}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onEdit={(sponsor) => openEditModal('sponsor', sponsor)}
          onEmail={handleEmailClick}
          onPhone={handlePhoneClick}
          resolveLogo={resolveLogo}
        />
      )}

      {viewMode === 'list' && activeTab === 'exhibitors' && (
        <ExhibitorsListView
          exhibitors={filteredExhibitors}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onAssignBooth={(exhibitor) => openEditModal('exhibitor', exhibitor, true)}
          onEdit={(exhibitor) => openEditModal('exhibitor', exhibitor)}
          resolveLogo={resolveLogo}
        />
      )}

      {viewMode === 'list' && activeTab === 'sponsors' && (
        <SponsorsListView
          sponsors={filteredSponsors}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onEdit={(sponsor) => openEditModal('sponsor', sponsor)}
          resolveLogo={resolveLogo}
        />
      )}

      {viewMode === 'booth-map' && activeTab === 'exhibitors' && (
        <BoothMapView
          exhibitors={filteredExhibitors}
          selectedBooth={selectedBooth}
          onSelectBooth={setSelectedBooth}
          onEditExhibitor={(exhibitor) => openEditModal('exhibitor', exhibitor, true)}
          resolveLogo={resolveLogo}
        />
      )}

      {/* MODALS */}
      {showAddModal && (
        <AddExhibitorSponsorModal
          type={addModalType}
          eventId={eventId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => refreshData()}
          initialData={editingItem}
          startAssignBooth={startAssignBooth}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          type={activeTab}
          eventId={eventId}
          onClose={() => setShowImportModal(false)}
          onImported={() => refreshData()}
        />
      )}
    </div>
  );
}
