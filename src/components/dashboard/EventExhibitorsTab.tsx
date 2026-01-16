import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import {
  Plus,
  Link2,
  Search,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Edit,
  Send,
  Download,
  BarChart3,
  Trash2,
  LayoutGrid,
  List,
  Map,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Info,
  Store,
  Building2,
  Upload,
  Globe,
  Save,
  Copy,
  Check,
  MessageCircle,
  Linkedin,
  Twitter,
  QrCode,
  Award,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  DoorOpen,
  UtensilsCrossed,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpDown,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type TabMode = 'exhibitors' | 'sponsors';
type ManagementMode = 'manual' | 'self-fill';
type ViewMode = 'cards' | 'list' | 'booth-map';
type ProfileStatus = 'complete' | 'incomplete' | 'pending';
type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

interface Exhibitor {
  id: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  tags: string[];
  createdAt?: string | null;
  booth?: {
    number: string;
    hall: string;
    location: string;
  };
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  profileStatus: ProfileStatus;
  completionPercentage: number;
}

interface Sponsor {
  id: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  tier: SponsorTier;
  benefits: string[];
  createdAt?: string | null;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  profileStatus: ProfileStatus;
  completionPercentage: number;
}

export default function EventExhibitorsTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabMode>('exhibitors');
  const [managementMode, setManagementMode] = useState<ManagementMode>('manual');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'exhibitor' | 'sponsor'>('exhibitor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Exhibitor | Sponsor | null>(null);
  const [startAssignBooth, setStartAssignBooth] = useState(false);
  const [boothFilter, setBoothFilter] = useState<'all' | 'assigned' | 'unassigned' | 'premium'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | ProfileStatus>('all');
  const [tierFilter, setTierFilter] = useState<'all' | SponsorTier>('all');
  const [sortOption, setSortOption] = useState<'company' | 'booth' | 'date' | 'profile'>('company');
  const [selfFillCopied, setSelfFillCopied] = useState(false);

  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
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
      const [{ data: exData, error: exErr }, { data: spData, error: spErr }] = await Promise.all([
        supabase.from('event_exhibitors').select('*').eq('event_id', eventId),
        supabase.from('event_sponsors').select('*').eq('event_id', eventId)
      ]);
      if (!exErr) setExhibitors((exData || []).map(mapExhibitorRow));
      if (!spErr) setSponsors((spData || []).map(mapSponsorRow));
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

  useEffect(() => {
    if (managementMode !== 'self-fill') setSelfFillCopied(false);
  }, [managementMode]);

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
              { id: 'sponsors', label: t('manageEvent.exhibitors.tabs.sponsors') }
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
            onClick={() => setShowShareModal(true)}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: 'transparent',
              border: '2px solid #0684F5',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0684F5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Link2 size={18} />
            {t('manageEvent.exhibitors.header.shareLink')}
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
            <ChevronDown size={16} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      </div>

      {/* MANAGEMENT MODE SELECTOR BANNER */}
      <div
        className="event-exhibitors__management"
        style={{
          background: 'linear-gradient(90deg, rgba(6, 132, 245, 0.15) 0%, rgba(6, 132, 245, 0.05) 100%)',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(6, 132, 245, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        {/* Left Side: Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Info size={24} style={{ color: '#0684F5', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {t('manageEvent.exhibitors.managementMode.title')}
            </h3>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#94A3B8' }}>
              {t('manageEvent.exhibitors.managementMode.subtitle')}
            </p>
          </div>
        </div>

        {/* Right Side: Mode Toggle */}
        <div
          className="event-exhibitors__management-toggle"
          style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '4px',
            borderRadius: '8px'
          }}
        >
          {[
            { id: 'manual', label: t('manageEvent.exhibitors.managementMode.manual') },
            { id: 'self-fill', label: t('manageEvent.exhibitors.managementMode.selfFill') }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setManagementMode(mode.id as ManagementMode)}
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: managementMode === mode.id ? '#0684F5' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: managementMode === mode.id ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {managementMode === 'self-fill' && (
        <div
          className="event-exhibitors__self-fill"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {t('manageEvent.exhibitors.selfFill.title')}
            </h4>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
              {t('manageEvent.exhibitors.selfFill.subtitle', { type: activeTab === 'exhibitors' ? t('manageEvent.exhibitors.tabs.exhibitors').toLowerCase() : t('manageEvent.exhibitors.tabs.sponsors').toLowerCase() })}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}
            >
              <Link2 size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {getSelfFillLink(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor')}
              </span>
            </div>
          </div>
          <div className="event-exhibitors__self-fill-actions" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <button
              onClick={async () => {
                const ok = await handleCopyLink(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor');
                if (ok) {
                  setSelfFillCopied(true);
                  setTimeout(() => setSelfFillCopied(false), 2000);
                }
              }}
              style={{
                height: '40px',
                padding: '0 16px',
                backgroundColor: selfFillCopied ? '#1F7A3E' : 'transparent',
                border: `1px solid ${selfFillCopied ? '#1F7A3E' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {selfFillCopied ? <Check size={14} /> : <Copy size={14} />}
              {selfFillCopied ? t('manageEvent.exhibitors.selfFill.copied') : t('manageEvent.exhibitors.selfFill.copy')}
            </button>
            <button
              onClick={() => window.open(getSelfFillLink(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor'), '_blank', 'noopener,noreferrer')}
              style={{
                height: '40px',
                padding: '0 16px',
                backgroundColor: '#0684F5',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Eye size={14} />
              {t('manageEvent.exhibitors.selfFill.preview')}
            </button>
          </div>
        </div>
      )}

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
            return (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id as ViewMode)}
                title={view.label}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: viewMode === view.id ? '#0684F5' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(viewMode === view.id && { boxShadow: '0px 2px 4px rgba(6, 132, 245, 0.3)' })
                }}
              >
                <Icon size={18} style={{ color: viewMode === view.id ? '#FFFFFF' : '#94A3B8' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
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

      {showShareModal && (
        <ShareLinkModal
          activeTab={activeTab}
          onClose={() => setShowShareModal(false)}
          getSelfFillLink={getSelfFillLink}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  );
}

// Exhibitors Cards View Component
function ExhibitorsCardsView({ exhibitors, selectedItems, onSelectItem, onEdit, onAssignBooth, onEmail, onPhone, resolveLogo }: {
  exhibitors: Exhibitor[];
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onEdit: (exhibitor: Exhibitor) => void;
  onAssignBooth: (exhibitor: Exhibitor) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
  resolveLogo: (logo: string) => string;
}) {
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
            <div
              style={{
                height: '140px',
                background: 'linear-gradient(135deg, #635BFF 0%, #7C75FF 100%)',
                position: 'relative'
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectItem(exhibitor.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  accentColor: '#635BFF'
                }}
              />

              {/* Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  height: '28px',
                  padding: '0 12px',
                  backgroundColor: statusStyle.bg,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <StatusIcon size={14} style={{ color: statusStyle.text }} />
                <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: statusStyle.text }}>
                  {statusStyle.label}
                </span>
              </div>

              {/* Company Logo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-32px',
                  left: '24px',
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img src={resolveLogo(exhibitor.logo)} alt={exhibitor.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '48px 24px 24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
                {exhibitor.companyName}
              </h3>

              {/* Booth Assignment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <MapPin size={16} style={{ color: exhibitor.booth ? '#9A9FA5' : '#DC2626' }} />
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: exhibitor.booth ? '#6F767E' : '#DC2626',
                    fontStyle: exhibitor.booth ? 'normal' : 'italic'
                  }}
                >
                  {exhibitor.booth ? t('manageEvent.exhibitors.cards.booth', { number: exhibitor.booth.number }) : t('manageEvent.exhibitors.cards.noBooth')}
                </span>
                {!exhibitor.booth && (
                  <button
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#635BFF',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignBooth(exhibitor);
                    }}
                  >
                    {t('manageEvent.exhibitors.cards.assign')}
                  </button>
                )}
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#6F767E',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {exhibitor.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {exhibitor.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      height: '24px',
                      padding: '0 10px',
                      backgroundColor: '#F4F5F6',
                      borderRadius: '12px',
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#6F767E',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {exhibitor.tags.length > 3 && (
                  <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#635BFF', alignSelf: 'center' }}>
                    {t('manageEvent.exhibitors.cards.moreTags', { count: exhibitor.tags.length - 3 })}
                  </span>
                )}
              </div>
            </div>

            {/* Card Divider */}
            <div style={{ borderTop: '1px solid #E9EAEB' }} />

            {/* Card Footer */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Contact Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  title={exhibitor.contact.email}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmail(exhibitor.contact.email);
                  }}
                >
                  <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
                <button
                  title={exhibitor.contact.phone}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhone(exhibitor.contact.phone);
                  }}
                >
                  <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
              </div>

              {/* Action Menu */}
              <button
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exhibitor);
                }}
              >
                <MoreVertical size={20} style={{ color: '#6F767E' }} />
              </button>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#E9EAEB',
                borderRadius: '0 0 16px 16px',
                overflow: 'hidden'
              }}
              title={`Profile ${exhibitor.completionPercentage}% complete`}
            >
              <div
                style={{
                  height: '100%',
                  width: `${exhibitor.completionPercentage}%`,
                  background: 'linear-gradient(90deg, #635BFF 0%, #7C75FF 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Sponsors Cards View Component
function SponsorsCardsView({ sponsors, selectedItems, onSelectItem, onEdit, onEmail, onPhone, resolveLogo }: {
  sponsors: Sponsor[];
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onEdit: (sponsor: Sponsor) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
  resolveLogo: (logo: string) => string;
}) {
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
            <div
              style={{
                height: '100px',
                background: tierStyle.bg,
                position: 'relative'
              }}
            >
              {/* Tier Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  height: '32px',
                  padding: '0 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Award size={16} style={{ color: tierStyle.color }} />
                <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 700, color: tierStyle.color }}>
                  {tierStyle.label}
                </span>
              </div>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectItem(sponsor.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  accentColor: '#635BFF'
                }}
              />

              {/* Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '52px',
                  right: '12px',
                  height: '24px',
                  padding: '0 10px',
                  backgroundColor: statusStyle.bg,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <StatusIcon size={12} style={{ color: statusStyle.text }} />
                <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 600, color: statusStyle.text }}>
                  {statusStyle.label}
                </span>
              </div>

              {/* Company Logo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-32px',
                  left: '24px',
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img src={resolveLogo(sponsor.logo)} alt={sponsor.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '48px 24px 24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '8px' }}>
                {sponsor.companyName}
              </h3>

              {/* Sponsorship Package */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: '#635BFF' }} />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#635BFF' }}>
                  {t('manageEvent.exhibitors.cards.sponsorship', { tier: tierStyle.label })}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#6F767E',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {sponsor.description}
              </p>

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {sponsor.benefits.slice(0, 3).map((benefit, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                    <Check size={14} style={{ color: '#1F7A3E', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E', lineHeight: 1.4 }}>
                      {benefit}
                    </span>
                  </div>
                ))}
                {sponsor.benefits.length > 3 && (
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#635BFF', marginLeft: '22px' }}>
                    {t('manageEvent.exhibitors.cards.benefits', { count: sponsor.benefits.length - 3 })}
                  </span>
                )}
              </div>
            </div>

            {/* Card Divider */}
            <div style={{ borderTop: '1px solid #E9EAEB' }} />

            {/* Card Footer */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Contact Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  title={sponsor.contact.email}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmail(sponsor.contact.email);
                  }}
                >
                  <Mail size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
                <button
                  title={sponsor.contact.phone}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#F4F5F6',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#635BFF';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F5F6';
                    (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhone(sponsor.contact.phone);
                  }}
                >
                  <Phone size={16} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                </button>
              </div>

              {/* Action Menu */}
              <button
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sponsor);
                }}
              >
                <MoreVertical size={20} style={{ color: '#6F767E' }} />
              </button>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#E9EAEB',
                borderRadius: '0 0 16px 16px',
                overflow: 'hidden'
              }}
              title={`Profile ${sponsor.completionPercentage}% complete`}
            >
              <div
                style={{
                  height: '100%',
                  width: `${sponsor.completionPercentage}%`,
                  background: tierStyle.bg,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Exhibitors List View Component
function ExhibitorsListView({ exhibitors, selectedItems, onSelectAll, onSelectItem, onAssignBooth, onEdit, resolveLogo }: {
  exhibitors: Exhibitor[];
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onSelectItem: (id: string) => void;
  onAssignBooth: (exhibitor: Exhibitor) => void;
  onEdit: (exhibitor: Exhibitor) => void;
  resolveLogo: (logo: string) => string;
}) {
  const { t } = useI18n();
  return (
    <div className="event-exhibitors__list" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      {/* Table Header */}
      <div
        className="event-exhibitors__list-header"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          height: '48px',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: '40px 1fr 180px 140px 140px 120px 100px',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <input
          type="checkbox"
          checked={selectedItems.size === exhibitors.length && exhibitors.length > 0}
          onChange={onSelectAll}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
        />
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('manageEvent.exhibitors.list.headers.company')}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('manageEvent.exhibitors.list.headers.booth')}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('manageEvent.exhibitors.list.headers.contact')}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('manageEvent.exhibitors.list.headers.category')}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('manageEvent.exhibitors.list.headers.status')}
        </span>
        <div></div>
      </div>

      {/* Table Body */}
      {exhibitors.map(exhibitor => {
        const isSelected = selectedItems.has(exhibitor.id);

        return (
          <div
            key={exhibitor.id}
            className="event-exhibitors__list-row"
            style={{
              height: '72px',
              padding: '0 24px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 180px 140px 140px 120px 100px',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent',
              borderLeft: isSelected ? '4px solid #0684F5' : '4px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectItem(exhibitor.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
            />

            {/* Company Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img
                src={resolveLogo(exhibitor.logo)}
                alt={exhibitor.companyName}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #E9EAEB',
                  objectFit: 'cover',
                  backgroundColor: '#FFFFFF',
                  padding: '4px'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {exhibitor.companyName}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    color: '#94A3B8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {exhibitor.website}
                </div>
              </div>
            </div>

            {/* Booth Assignment */}
            <div>
              {exhibitor.booth ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <MapPin size={14} style={{ color: '#0684F5' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                      {t('manageEvent.exhibitors.cards.booth', { number: exhibitor.booth.number })}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>
                    {exhibitor.booth.hall}, {exhibitor.booth.location}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertTriangle size={14} style={{ color: '#DC2626' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#DC2626' }}>
                      {t('manageEvent.exhibitors.list.unassigned')}
                    </span>
                  </div>
                  <button
                    style={{
                      padding: '0',
                      border: 'none',
                      background: 'none',
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#0684F5',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignBooth(exhibitor);
                    }}
                  >
                    {t('manageEvent.exhibitors.list.assignNow')}
                  </button>
                </>
              )}
            </div>

            {/* Primary Contact */}
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>
                {exhibitor.contact.name}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>
                {exhibitor.contact.role}
              </div>
            </div>

            {/* Category */}
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  height: '26px',
                  padding: '0 12px',
                  backgroundColor: 'rgba(6, 132, 245, 0.15)',
                  borderRadius: '13px',
                  alignItems: 'center',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#0684F5'
                }}
              >
                {exhibitor.category}
              </span>
            </div>

            {/* Profile Status */}
            <div>
              {exhibitor.profileStatus === 'complete' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <CheckCircle size={16} style={{ color: '#1F7A3E' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#1F7A3E' }}>
                      Complete
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                    100%
                  </div>
                </>
              ) : exhibitor.profileStatus === 'incomplete' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertCircle size={16} style={{ color: '#B54708' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#B54708' }}>
                      Incomplete
                    </span>
                  </div>
                  <div style={{ width: '60px', height: '4px', backgroundColor: '#E9EAEB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${exhibitor.completionPercentage}%`,
                        height: '100%',
                        backgroundColor: '#B54708',
                        borderRadius: '2px'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} style={{ color: '#635BFF' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#635BFF' }}>
                      Pending Setup
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exhibitor);
                }}
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

// Sponsors List View Component
function SponsorsListView({ sponsors, selectedItems, onSelectAll, onSelectItem, onEdit, resolveLogo }: {
  sponsors: Sponsor[];
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onSelectItem: (id: string) => void;
  onEdit: (sponsor: Sponsor) => void;
  resolveLogo: (logo: string) => string;
}) {
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
      {/* Table Header */}
      <div
        className="event-exhibitors__list-header"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          height: '48px',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: '40px 1fr 160px 160px 140px 100px',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <input
          type="checkbox"
          checked={selectedItems.size === sponsors.length && sponsors.length > 0}
          onChange={onSelectAll}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
        />
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          COMPANY
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          TIER
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          PRIMARY CONTACT
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          PROFILE STATUS
        </span>
        <div></div>
      </div>

      {/* Table Body */}
      {sponsors.map((sponsor) => {
        const isSelected = selectedItems.has(sponsor.id);
        const tierStyle = getTierStyle(sponsor.tier);

        return (
          <div
            key={sponsor.id}
            className="event-exhibitors__list-row"
            style={{
              height: '72px',
              padding: '0 24px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 160px 160px 140px 100px',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.1)' : 'transparent',
              borderLeft: isSelected ? '4px solid #0684F5' : '4px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectItem(sponsor.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
            />

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img
                src={resolveLogo(sponsor.logo)}
                alt={sponsor.companyName}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #E9EAEB',
                  objectFit: 'cover',
                  backgroundColor: '#FFFFFF',
                  padding: '4px'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {sponsor.companyName}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    color: '#94A3B8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sponsor.website}
                </div>
              </div>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  height: '26px',
                  padding: '0 12px',
                  backgroundColor: tierStyle.bg,
                  borderRadius: '13px',
                  alignItems: 'center',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: tierStyle.color
                }}
              >
                {tierStyle.label}
              </span>
            </div>

            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '2px' }}>
                {sponsor.contact.name}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#94A3B8' }}>
                {sponsor.contact.role}
              </div>
            </div>

            <div>
              {sponsor.profileStatus === 'complete' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#1F7A3E' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#1F7A3E' }}>
                    Complete
                  </span>
                </div>
              ) : sponsor.profileStatus === 'incomplete' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} style={{ color: '#B54708' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#B54708' }}>
                    Incomplete
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: '#635BFF' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 600, color: '#635BFF' }}>
                    Pending Setup
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sponsor);
                }}
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

// Booth Map View Component  
function BoothMapView({ exhibitors, selectedBooth, onSelectBooth, onEditExhibitor, resolveLogo }: {
  exhibitors: Exhibitor[];
  selectedBooth: string | null;
  onSelectBooth: (booth: string | null) => void;
  onEditExhibitor: (exhibitor: Exhibitor) => void;
  resolveLogo: (logo: string) => string;
}) {
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
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        padding: '32px',
        minHeight: '700px',
        position: 'relative'
      }}
    >
      {/* Map Header */}
      <div
        className="event-exhibitors__map-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #E9EAEB',
          paddingBottom: '20px'
        }}
      >
        <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F' }}>
          {t('manageEvent.exhibitors.map.title')}
        </h2>

        <div className="event-exhibitors__map-controls" style={{ display: 'flex', gap: '12px' }}>
          {/* Hall Selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={activeHall}
              onChange={(e) => setActiveHall(e.target.value)}
              style={{
                width: '160px',
                height: '36px',
                padding: '0 40px 0 12px',
                backgroundColor: '#F4F5F6',
                border: '1px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#6F767E',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              {hallOptions.map((hall) => (
                <option key={hall} value={hall}>
                  {hall === 'Main Hall' ? t('manageEvent.exhibitors.map.mainHall') : hall}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
          </div>

          {/* Zoom Controls */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F4F5F6', padding: '4px', borderRadius: '8px' }}>
            {[ZoomIn, ZoomOut, RotateCcw].map((Icon, idx) => (
              <button
                key={idx}
                title={idx === 0 ? 'Zoom In' : idx === 1 ? 'Zoom Out' : 'Reset View'}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
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
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '32px',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
          zIndex: 5,
          width: '220px'
        }}
      >
        <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#1A1D1F', marginBottom: '12px' }}>
          {t('manageEvent.exhibitors.map.legend')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { color: '#635BFF', label: t('manageEvent.exhibitors.map.legendItems.assigned') },
            { color: '#E9EAEB', label: t('manageEvent.exhibitors.map.legendItems.available') },
            { color: '#F59E0B', label: t('manageEvent.exhibitors.map.legendItems.premium') }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: item.color, borderRadius: '4px' }} />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {item.label}
              </span>
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
                <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Canvas */}
      <div
        style={{
          backgroundColor: '#FAFBFC',
          border: '2px dashed #E9EAEB',
          borderRadius: '12px',
          minHeight: '600px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {visibleBooths.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Map size={64} style={{ color: '#E9EAEB', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#6F767E', marginBottom: '8px' }}>
              {t('manageEvent.exhibitors.map.empty.title')}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#9A9FA5' }}>
              {t('manageEvent.exhibitors.map.empty.subtitle')}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {visibleBooths.map((booth) => {
              const isSelected = booth.number === selectedBooth;
              return (
                <button
                  key={booth.number}
                  onClick={() => onSelectBooth(booth.number)}
                  style={{
                    padding: '16px',
                    backgroundColor: isSelected ? '#635BFF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#635BFF' : '#E9EAEB'}`,
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0px 8px 16px rgba(99, 91, 255, 0.2)' : '0px 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <img
                      src={resolveLogo(booth.exhibitor.logo)}
                      alt={booth.exhibitor.companyName}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#FFFFFF' }}
                    />
                    <div>
                      <div style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#1A1D1F' }}>
                        {t('manageEvent.exhibitors.map.boothLabel', { number: booth.number })}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#6F767E' }}>
                        {booth.exhibitor.companyName}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#9A9FA5' }}>
                    {booth.location || t('manageEvent.exhibitors.map.standardLocation')}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Assign Panel (if booth selected) */}
      {selectedBooth && (
        <div
          style={{
            position: 'absolute',
            right: '32px',
            top: '120px',
            width: '320px',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            border: '2px solid #635BFF',
            zIndex: 10
          }}
        >
          <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#1A1D1F', marginBottom: '16px' }}>
            {t('manageEvent.exhibitors.map.assignPanel.title', { number: selectedBooth })}
          </h3>

          {/* Booth Details */}
          <div
            style={{
              backgroundColor: '#F4F5F6',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.map.assignPanel.size')}
              </span>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.map.assignPanel.location', { hall: selectedBoothData?.hall || activeHall, location: selectedBoothData?.location || '' })}
              </span>
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {selectedBoothData?.location ? t('manageEvent.exhibitors.map.assignPanel.typeAssigned') : t('manageEvent.exhibitors.map.assignPanel.typeStandard')}
              </span>
            </div>
          </div>

          {/* Exhibitor Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '12px' }}>
              {t('manageEvent.exhibitors.map.assignPanel.selectLabel')}
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A9FA5' }} />
              <input
                type="text"
                placeholder={t('manageEvent.exhibitors.map.assignPanel.searchPlaceholder')}
                value={selectedBoothData?.exhibitor.companyName || ''}
                readOnly
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onSelectBooth(null)}
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer'
              }}
            >
              {t('manageEvent.exhibitors.map.assignPanel.cancel')}
            </button>
            <button
              disabled={!selectedBoothData}
              onClick={() => {
                if (selectedBoothData) {
                  onEditExhibitor(selectedBoothData.exhibitor);
                }
              }}
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#635BFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: selectedBoothData ? 'pointer' : 'not-allowed',
                opacity: selectedBoothData ? 1 : 0.6
              }}
            >
              {t('manageEvent.exhibitors.map.assignPanel.assign')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Exhibitor/Sponsor Modal Component
function AddExhibitorSponsorModal({ type, eventId, onClose, onAdded, initialData = null, startAssignBooth = false }: {
  type: 'exhibitor' | 'sponsor';
  eventId: string;
  onClose: () => void;
  onAdded: () => void;
  initialData?: Exhibitor | Sponsor | null;
  startAssignBooth?: boolean;
}) {
  const { t } = useI18n();
  const [assignBooth, setAssignBooth] = useState(startAssignBooth);
  const [selectedTier, setSelectedTier] = useState<SponsorTier>('gold');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [boothNumber, setBoothNumber] = useState('');
  const [boothHall, setBoothHall] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setCompanyName('');
      setWebsite('');
      setDescription('');
      setCategory('');
      setContactName('');
      setContactRole('');
      setContactEmail('');
      setContactPhone('');
      setBoothNumber('');
      setBoothHall('');
      setSelectedTier('gold');
      setAssignBooth(startAssignBooth);
      return;
    }

    setCompanyName(initialData.companyName || initialData.name || '');
    setWebsite(initialData.website || '');
    setDescription(initialData.description || '');
    setContactName(initialData.contact?.name || '');
    setContactRole(initialData.contact?.role || '');
    setContactEmail(initialData.contact?.email || '');
    setContactPhone(initialData.contact?.phone || '');

    if (type === 'exhibitor') {
      const exhibitor = initialData as Exhibitor;
      setCategory(exhibitor.category || '');
      setBoothNumber(exhibitor.booth?.number || '');
      setBoothHall(exhibitor.booth?.hall || '');
      setAssignBooth(startAssignBooth || !!exhibitor.booth);
    } else {
      const sponsor = initialData as Sponsor;
      setSelectedTier(sponsor.tier || 'gold');
    }
  }, [initialData, startAssignBooth, type]);

  const submit = async (draft: boolean) => {
    if (!eventId) return;
    if (!companyName.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!initialData;
      if (type === 'exhibitor') {
        const payload: any = {
          company_name: companyName.trim(),
          website_url: website.trim(),
          description: description.trim(),
          industry: category || '',
          category: category || '',
          contact_name: contactName.trim(),
          contact_role: contactRole.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim()
        };
        if (assignBooth) {
          payload.booth_number = boothNumber.trim();
          payload.booth_hall = boothHall || '';
          payload.booth_location = boothHall || '';
        } else {
          payload.booth_number = null;
          payload.booth_hall = null;
          payload.booth_location = null;
        }
        if (isEdit && initialData) {
          if (draft) payload.profile_status = 'pending';
          await supabase
            .from('event_exhibitors')
            .update(payload)
            .eq('id', initialData.id)
            .eq('event_id', eventId);
        } else {
          payload.event_id = eventId;
          payload.profile_status = draft ? 'pending' : 'incomplete';
          payload.completion_percentage = 0;
          await supabase.from('event_exhibitors').insert([payload]);
        }
      } else {
        const payload: any = {
          name: companyName.trim(),
          website_url: website.trim(),
          description: description.trim(),
          tier: selectedTier,
          benefits: [],
          category: category.trim() || '',
          contact_name: contactName.trim(),
          contact_role: contactRole.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim()
        };
        if (isEdit && initialData) {
          if (draft) payload.profile_status = 'pending';
          await supabase
            .from('event_sponsors')
            .update(payload)
            .eq('id', initialData.id)
            .eq('event_id', eventId);
        } else {
          payload.event_id = eventId;
          payload.profile_status = draft ? 'pending' : 'incomplete';
          payload.completion_percentage = 0;
          await supabase.from('event_sponsors').insert([payload]);
        }
      }
      onAdded();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '700px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.3s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F', marginBottom: '4px' }}>
              {initialData ? t('manageEvent.exhibitors.modals.add.edit') : t('manageEvent.exhibitors.modals.add.add')} {type === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor')}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
              {t('manageEvent.exhibitors.modals.add.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Company Information */}
          <div style={{ marginBottom: '32px' }}>
            {/* Logo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  backgroundColor: '#F4F5F6',
                  border: '2px dashed #E9EAEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={32} style={{ color: '#9A9FA5' }} />
              </div>
              <div>
                <button
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1D1F',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <Upload size={16} />
                  {t('manageEvent.exhibitors.modals.add.uploadLogo')}
                </button>
                <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                  {t('manageEvent.exhibitors.modals.add.logoHint')}
                </p>
              </div>
            </div>

            {/* Company Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.companyName')}
              </label>
              <input
                type="text"
                placeholder={t('manageEvent.exhibitors.modals.add.placeholders.companyName')}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Company Website */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.website')}
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9A9FA5' }} />
                <input
                  type="url"
                  placeholder={t('manageEvent.exhibitors.modals.add.placeholders.website')}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px 0 44px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#1A1D1F',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Industry/Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.category')}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 40px 0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#1A1D1F',
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none'
                  }}
                >
                  <option>{t('manageEvent.exhibitors.modals.add.placeholders.category')}</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.description')}
              </label>
              <textarea
                placeholder={t('manageEvent.exhibitors.modals.add.placeholders.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                  0 / 300
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '20px' }}>
              {t('manageEvent.exhibitors.modals.add.sections.contact')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.contactName')}
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.contactRole')}
                </label>
                <input
                  type="text"
                  placeholder="Sales Director"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.email')}
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.phone')}
                </label>
                <input
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Exhibitor - Booth Assignment OR Sponsor - Tier Selection */}
          {type === 'exhibitor' ? (
            <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '16px' }}>
                {t('manageEvent.exhibitors.modals.add.sections.booth')}
              </h3>

              {/* Assign Booth Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={assignBooth}
                  onChange={(e) => setAssignBooth(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.assignBooth')}
                </span>
              </label>

              {assignBooth && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                      {t('manageEvent.exhibitors.modals.add.fields.hall')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={boothHall}
                        onChange={(e) => setBoothHall(e.target.value)}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 40px 0 16px',
                          backgroundColor: '#F4F5F6',
                          border: '1px solid #E9EAEB',
                          borderRadius: '8px',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          cursor: 'pointer',
                          appearance: 'none',
                          outline: 'none'
                        }}
                      >
                        <option>Hall A</option>
                        <option>Hall B</option>
                        <option>Hall C</option>
                        <option>Outdoor</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                      {t('manageEvent.exhibitors.modals.add.fields.boothNumber')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., A-42"
                value={boothNumber}
                onChange={(e) => setBoothNumber(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        backgroundColor: '#F4F5F6',
                        border: '1px solid #E9EAEB',
                        borderRadius: '8px',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '16px' }}>
                {t('manageEvent.exhibitors.modals.add.sections.sponsorship')}
              </h3>

              {/* Tier Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { id: 'platinum', label: t('manageEvent.exhibitors.stats.platinum'), price: '$10,000', color: '#1A1D1F', brief: 'Top-tier benefits' },
                  { id: 'gold', label: t('manageEvent.exhibitors.stats.gold'), price: '$7,500', color: '#F59E0B', brief: 'Premium package' },
                  { id: 'silver', label: t('manageEvent.exhibitors.stats.silver'), price: '$5,000', color: '#6F767E', brief: 'Standard benefits' },
                  { id: 'bronze', label: t('manageEvent.exhibitors.filters.tier.bronze'), price: '$2,500', color: '#92400E', brief: 'Basic package' }
                ].map(tier => (
                  <label
                    key={tier.id}
                    style={{
                      padding: '16px',
                      border: selectedTier === tier.id ? '2px solid #635BFF' : '2px solid #E9EAEB',
                      backgroundColor: selectedTier === tier.id ? '#F8F7FF' : '#FAFBFC',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={tier.id}
                      checked={selectedTier === tier.id}
                      onChange={(e) => setSelectedTier(e.target.value as SponsorTier)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Award size={24} style={{ color: tier.color }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 700, color: '#1A1D1F' }}>
                        {tier.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#635BFF', marginBottom: '4px' }}>
                      {tier.price}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6F767E' }}>
                      {tier.brief}
                    </div>
                  </label>
                ))}
              </div>

              {/* Benefits Preview */}
              <div style={{ backgroundColor: '#F4F5F6', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#1A1D1F', marginBottom: '12px' }}>
                  {t('manageEvent.exhibitors.modals.add.sections.benefits')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Logo on all event materials',
                    'Keynote speaking opportunity',
                    'Premium booth location',
                    'VIP networking access'
                  ].map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <Check size={16} style={{ color: '#1F7A3E', marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 16px 16px'
          }}
        >
          {/* Left: Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                defaultChecked
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
              />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.modals.add.options.welcomeEmail')}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
              />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.modals.add.options.publicDirectory')}
              </span>
            </label>
          </div>

          {/* Right: Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer'
              }}
            >
              {t('manageEvent.exhibitors.map.assignPanel.cancel')}
            </button>
            <button disabled={saving} onClick={() => submit(true)}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              {t('manageEvent.exhibitors.modals.add.actions.draft')}
            </button>
            <button disabled={saving} onClick={() => submit(false)}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#635BFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              {initialData ? t('manageEvent.exhibitors.modals.add.actions.save') : t('manageEvent.exhibitors.modals.add.actions.add', { type: type === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor') })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Share Link Modal Component
function ShareLinkModal({ activeTab, onClose, getSelfFillLink, onCopyLink }: {
  activeTab: TabMode;
  onClose: () => void;
  getSelfFillLink: (kind: 'exhibitor' | 'sponsor') => string;
  onCopyLink: (kind: 'exhibitor' | 'sponsor') => Promise<boolean>;
}) {
  const { t } = useI18n();
  const [modalTab, setModalTab] = useState<'exhibitor' | 'sponsor'>(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor');
  const [linkCopied, setLinkCopied] = useState(false);
  const shareUrl = getSelfFillLink(modalTab);

  useEffect(() => {
    setLinkCopied(false);
  }, [modalTab]);

  const handleCopy = async () => {
    const ok = await onCopyLink(modalTab);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '550px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F', marginBottom: '4px' }}>
              {t('manageEvent.exhibitors.modals.share.title', { type: modalTab === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor') })}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
              {t('manageEvent.exhibitors.modals.share.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px' }}>
          {/* Mode Selector */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: '#F4F5F6',
              padding: '4px',
              borderRadius: '8px',
              width: 'fit-content',
              marginBottom: '24px'
            }}
          >
            {[
              { id: 'exhibitor', label: t('manageEvent.exhibitors.modals.share.tabs.exhibitor') },
              { id: 'sponsor', label: t('manageEvent.exhibitors.modals.share.tabs.sponsor') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setModalTab(tab.id as 'exhibitor' | 'sponsor')}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  backgroundColor: modalTab === tab.id ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: modalTab === tab.id ? '#635BFF' : '#6F767E',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(modalTab === tab.id && { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)' })
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6F767E', lineHeight: 1.5, marginBottom: '24px' }}>
            {t('manageEvent.exhibitors.modals.share.description')}
          </p>

          {/* Link Display */}
          <div
            style={{
              backgroundColor: '#F4F5F6',
              padding: '16px',
              borderRadius: '8px',
              border: '2px dashed #635BFF',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 500,
                color: '#635BFF',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                userSelect: 'all'
              }}
            >
              {shareUrl}
            </a>
            <button
              onClick={handleCopy}
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: linkCopied ? '#1F7A3E' : '#635BFF',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {linkCopied ? (
                <>
                  <Check size={14} />
                  {t('manageEvent.exhibitors.modals.share.copied')}
                </>
              ) : (
                <>
                  <Copy size={14} />
                  {t('manageEvent.exhibitors.modals.share.copy')}
                </>
              )}
            </button>
          </div>

          {/* QR Code Section */}
          <div
            style={{
              borderTop: '1px solid #E9EAEB',
              paddingTop: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: '#FFFFFF',
                padding: '12px',
                border: '2px solid #E9EAEB',
                borderRadius: '12px',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={140} style={{ color: '#6F767E' }} />
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E', marginBottom: '12px' }}>
              {t('manageEvent.exhibitors.modals.share.scan')}
            </p>
            <button
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={14} />
              {t('manageEvent.exhibitors.modals.share.downloadQr')}
            </button>
          </div>

          {/* Sharing Options */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '24px', marginBottom: '24px' }}>
            <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', marginBottom: '16px' }}>
              {t('manageEvent.exhibitors.modals.share.shareVia')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[
                { icon: Mail, label: 'Email' },
                { icon: MessageCircle, label: 'WhatsApp' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Link2, label: 'Copy Link' }
              ].map((option, idx) => {
                const Icon = option.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (option.label === 'Copy Link') {
                        handleCopy();
                        return;
                      }
                      if (option.label === 'Email') {
                        window.location.href = `mailto:?subject=Eventra Self-Fill Link&body=${encodeURIComponent(shareUrl)}`;
                        return;
                      }
                      if (option.label === 'WhatsApp') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                      if (option.label === 'LinkedIn') {
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                      if (option.label === 'Twitter') {
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                    }}
                    style={{
                      height: '48px',
                      backgroundColor: '#F4F5F6',
                      border: 'none',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#635BFF';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F4F5F6';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#6F767E';
                    }}
                  >
                    <Icon size={20} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 500, color: '#6F767E', transition: 'color 0.2s' }}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                  {t('manageEvent.exhibitors.modals.share.options.approval')}
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                  {t('manageEvent.exhibitors.modals.share.options.notification')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: '44px',
              padding: '0 24px',
              backgroundColor: '#635BFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            {t('manageEvent.exhibitors.modals.share.actions.done')}
          </button>
        </div>
      </div>
    </div>
  );
}
