import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';
import {
  Mail,
  Send,
  Eye,
  MousePointerClick,
  Tag,
  DollarSign,
  TrendingUp,
  Plus,
  MoreVertical,
  FileText,
  Copy,
  Trash2,
  Edit,
  Power,
  X,
  Calendar,
  Percent,
  Users,
  Ticket,
  Check,
  AlertCircle,
  Globe,
  Crown,
  ExternalLink
} from 'lucide-react';

type MarketingTab = 'email' | 'promo';

interface EventMarketingTabProps {
  eventId: string;
}


interface EmailCampaign {
  id: string;
  name: string;
  status: 'sent' | 'draft' | 'scheduled';
  audience: string;
  openRate: number;
  clickRate: number;
  sentOn: string;
  totalSent: number;
}

interface PromotionCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageCount: number;
  usageLimit: number;
  status: 'active' | 'expired' | 'inactive';
  appliesTo: string[];
  startDate: string;
  endDate: string;
  onePerCustomer: boolean;
}

export default function EventMarketingTab({ eventId }: EventMarketingTabProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<MarketingTab>('email');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionCode | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<{ id: string; name: string; price: number }[]>([]);

  // Email campaigns data
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);

  // Promotion codes data
  const [promoCodes, setPromoCodes] = useState<PromotionCode[]>([]);

  // Form state for promo code modal
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    appliesTo: 'all' as 'all' | 'specific',
    specificTickets: [] as string[],
    hasUsageLimit: false,
    usageLimit: 0,
    onePerCustomer: false,
    startDate: '',
    endDate: ''
  });

  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    status: 'draft' as 'sent' | 'draft' | 'scheduled',
    audience: 'All Attendees',
    sentOn: '',
    totalSent: 0,
    openRate: 0,
    clickRate: 0
  });

const [marketingLoaded, setMarketingLoaded] = useState(false);
const saveTimerRef = useRef<any>(null);
const loadingRef = useRef(false);

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const isTempId = (id: string) => id.startsWith('tmp-');

const buildPromoStatus = (startsAt?: string | null, endsAt?: string | null) => {
  const now = new Date();
  const start = startsAt ? new Date(startsAt) : null;
  const end = endsAt ? new Date(endsAt) : null;
  if (end && end < now) return 'expired';
  if (start && start > now) return 'inactive';
  return 'active';
};

const persistMarketingSettings = async (nextEmailCampaigns: EmailCampaign[], nextPromoCodes: PromotionCode[]) => {
  const payload = { emailCampaigns: nextEmailCampaigns, promoCodes: nextPromoCodes };

  const campaignPayload = nextEmailCampaigns.map((campaign) => ({
    id: campaign.id,
    event_id: eventId,
    kind: 'email',
    subject: campaign.name,
    message: null,
    meta: {
      name: campaign.name,
      status: campaign.status,
      audience: campaign.audience,
      openRate: campaign.openRate,
      clickRate: campaign.clickRate,
      totalSent: campaign.totalSent,
      sentOn: campaign.sentOn || null
    }
  }));

  const promoPayload = nextPromoCodes.map((promo) => ({
    id: promo.id,
    event_id: eventId,
    title: promo.code,
    code: promo.code,
    discount_value: promo.discountValue,
    discount_type: promo.discountType,
    starts_at: promo.startDate || null,
    ends_at: promo.endDate || null
  }));

  const queries: Promise<any>[] = [];
  if (campaignPayload.length > 0) {
    queries.push(
      supabase.from('event_communications').upsert(campaignPayload)
    );
  }
  if (promoPayload.length > 0) {
    queries.push(
      supabase.from('event_promos').upsert(promoPayload)
    );
  }
  queries.push(
    supabase
      .from('events')
      .update({ marketing_settings: payload, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select('id')
  );

  const results = await Promise.all(queries);
  const eventsResult = results[results.length - 1];
  if (eventsResult?.error) throw eventsResult.error;
};

useEffect(() => {
  if (!eventId) return;
  let cancelled = false;
  const run = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const [
      { data: eventRow, error: eventError },
      { data: promoRows },
      { data: commRows }
    ] = await Promise.all([
      supabase.from('events').select('marketing_settings').eq('id', eventId).maybeSingle(),
      supabase.from('event_promos').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
      supabase.from('event_communications').select('*').eq('event_id', eventId).eq('kind', 'email').order('created_at', { ascending: false })
    ]);

    loadingRef.current = false;
    if (cancelled) return;
    if (eventError) {
      console.error('marketing_settings load error', eventError);
    }

    const ms: any = eventRow?.marketing_settings || null;
    const savedCampaigns = Array.isArray(ms?.emailCampaigns) ? ms.emailCampaigns : [];
    const savedPromos = Array.isArray(ms?.promoCodes) ? ms.promoCodes : [];

    const campaignsFromDb = (commRows || []).map((row: any) => ({
      id: row.id,
      name: row.meta?.name || row.subject || t('manageEvent.marketing.email.defaultName'),
      status: row.meta?.status || 'draft',
      audience: row.meta?.audience || 'All Attendees',
      openRate: Number(row.meta?.openRate || 0),
      clickRate: Number(row.meta?.clickRate || 0),
      sentOn: row.meta?.sentOn || '',
      totalSent: Number(row.meta?.totalSent || 0)
    }));

    const promoMetaByCode = new Map(
      savedPromos.map((promo: any) => [String(promo.code || '').toLowerCase(), promo])
    );
    const promosFromDb = (promoRows || []).map((row: any) => {
      const code = row.code || '';
      const saved = promoMetaByCode.get(String(code).toLowerCase()) || {};
      return {
        id: row.id,
        code,
        discountType: row.discount_type === 'fixed' ? 'fixed' : 'percentage',
        discountValue: Number(row.discount_value || 0),
        usageCount: Number(saved.usageCount || 0),
        usageLimit: Number(saved.usageLimit || 0),
        status: saved.status || buildPromoStatus(row.starts_at, row.ends_at),
        appliesTo: Array.isArray(saved.appliesTo) ? saved.appliesTo : ['All Ticket Types'],
        startDate: row.starts_at ? new Date(row.starts_at).toISOString().slice(0, 10) : '',
        endDate: row.ends_at ? new Date(row.ends_at).toISOString().slice(0, 10) : '',
        onePerCustomer: Boolean(saved.onePerCustomer)
      };
    });

    const finalCampaigns = campaignsFromDb.length > 0 ? campaignsFromDb : savedCampaigns.map((campaign: any) => ({
      ...campaign,
      id: campaign.id || makeId()
    }));
    const finalPromos = promosFromDb.length > 0 ? promosFromDb : savedPromos.map((promo: any) => ({
      ...promo,
      id: promo.id || makeId()
    }));

    setEmailCampaigns(finalCampaigns);
    setPromoCodes(finalPromos);
    setMarketingLoaded(true);
  };
  run();
  return () => {
    cancelled = true;
  };
}, [eventId, t]);

useEffect(() => {
  if (!eventId) return;
  let cancelled = false;
  const loadTickets = async () => {
    const { data, error } = await supabase
      .from('event_tickets')
      .select('id,name,price')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    if (cancelled) return;
    if (!error) {
      setTicketTypes((data || []).map((ticket: any) => ({
        id: ticket.id,
        name: ticket.name,
        price: Number(ticket.price || 0)
      })));
    }
  };
  loadTickets();
  return () => {
    cancelled = true;
  };
}, [eventId]);

useEffect(() => {
  if (!marketingLoaded) return;
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  saveTimerRef.current = setTimeout(async () => {
    try {
      await persistMarketingSettings(emailCampaigns, promoCodes);
    } catch (e) {
      console.error('marketing_settings save error', e);
    }
  }, 700);
  return () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  };
}, [marketingLoaded, emailCampaigns, promoCodes]);

const handleCreateEmailCampaign = () => {
  setEditingCampaign(null);
  setCampaignFormData({
    name: '',
    status: 'draft',
    audience: 'All Attendees',
    sentOn: '',
    totalSent: 0,
    openRate: 0,
    clickRate: 0
  });
  setShowCampaignModal(true);
};

const handleDuplicateEmailCampaign = (campaign: EmailCampaign) => {
  const nextId = makeId();
  setEmailCampaigns((prev) => [
    ...prev,
    { ...campaign, id: nextId, name: `${campaign.name} (Copy)`, status: 'draft', sentOn: '', totalSent: 0, openRate: 0, clickRate: 0 }
  ]);
  setActiveMenu(null);
};

const handleDeleteEmailCampaign = async (id: string) => {
  setEmailCampaigns((prev) => prev.filter(c => c.id !== id));
  setActiveMenu(null);
  if (!eventId || isTempId(id)) return;
  const { error } = await supabase
    .from('event_communications')
    .delete()
    .eq('id', id)
    .eq('event_id', eventId);
  if (error) console.error('Failed to delete campaign', error);
};

const handleEditEmailCampaign = (campaign: EmailCampaign) => {
  setEditingCampaign(campaign);
  setCampaignFormData({
    name: campaign.name,
    status: campaign.status,
    audience: campaign.audience,
    sentOn: campaign.sentOn || '',
    totalSent: campaign.totalSent || 0,
    openRate: campaign.openRate || 0,
    clickRate: campaign.clickRate || 0
  });
  setShowCampaignModal(true);
};

const handleSaveEmailCampaign = () => {
  const name = campaignFormData.name.trim();
  if (!name) return;
  const payload: EmailCampaign = {
    id: editingCampaign ? editingCampaign.id : makeId(),
    name,
    status: campaignFormData.status,
    audience: campaignFormData.audience,
    openRate: campaignFormData.status === 'sent' ? campaignFormData.openRate : 0,
    clickRate: campaignFormData.status === 'sent' ? campaignFormData.clickRate : 0,
    sentOn: campaignFormData.status === 'sent' || campaignFormData.status === 'scheduled'
      ? campaignFormData.sentOn
      : '',
    totalSent: campaignFormData.status === 'sent' ? campaignFormData.totalSent : 0
  };
  if (editingCampaign) {
    setEmailCampaigns((prev) => prev.map((campaign) => (campaign.id === editingCampaign.id ? payload : campaign)));
  } else {
    setEmailCampaigns((prev) => [...prev, payload]);
  }
  setShowCampaignModal(false);
  setEditingCampaign(null);
};

const handleViewEmailReport = () => {
  setActiveMenu(null);
  navigate(`/event/${eventId}?tab=reporting`);
};


  const availableTicketTypes = ticketTypes.map((ticket) => ticket.name);

  // Calculate email KPIs
  const totalEmailsSent = emailCampaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const sentCampaigns = emailCampaigns.filter(c => c.status === 'sent');
  const avgOpenRate = sentCampaigns.length > 0 
    ? (sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) / sentCampaigns.length).toFixed(1)
    : '0.0';
  const avgClickRate = sentCampaigns.length > 0
    ? (sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / sentCampaigns.length).toFixed(1)
    : '0.0';

  // Calculate promo KPIs
  const activePromos = promoCodes.filter(p => p.status === 'active').length;
  const totalPromoUses = promoCodes.reduce((sum, p) => sum + p.usageCount, 0);
  const avgTicketPrice = ticketTypes.length
    ? ticketTypes.reduce((sum, ticket) => sum + (Number(ticket.price) || 0), 0) / ticketTypes.length
    : 0;
  const promoRevenue = totalPromoUses * avgTicketPrice;

  const getStatusStyles = (status: string, type: 'email' | 'promo') => {
    if (type === 'email') {
      switch (status) {
        case 'sent':
          return {
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          };
        case 'draft':
          return {
            backgroundColor: 'rgba(107, 114, 128, 0.15)',
            color: '#6B7280',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          };
        case 'scheduled':
          return {
            backgroundColor: 'rgba(6, 132, 245, 0.15)',
            color: '#0684F5',
            border: '1px solid rgba(6, 132, 245, 0.3)'
          };
        default:
          return {
            backgroundColor: 'rgba(107, 114, 128, 0.15)',
            color: '#6B7280',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          };
      }
    } else {
      switch (status) {
        case 'active':
          return {
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          };
        case 'expired':
          return {
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          };
        case 'inactive':
          return {
            backgroundColor: 'rgba(107, 114, 128, 0.15)',
            color: '#6B7280',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          };
        default:
          return {
            backgroundColor: 'rgba(107, 114, 128, 0.15)',
            color: '#6B7280',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          };
      }
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleCreatePromo = () => {
    setEditingPromo(null);
    setPromoFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      appliesTo: 'all',
      specificTickets: [],
      hasUsageLimit: false,
      usageLimit: 0,
      onePerCustomer: false,
      startDate: '',
      endDate: ''
    });
    setShowPromoModal(true);
  };

  const handleEditPromo = (promo: PromotionCode) => {
    setEditingPromo(promo);
    setPromoFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      appliesTo: promo.appliesTo.includes('All Ticket Types') ? 'all' : 'specific',
      specificTickets: promo.appliesTo.includes('All Ticket Types') ? [] : promo.appliesTo,
      hasUsageLimit: promo.usageLimit > 0,
      usageLimit: promo.usageLimit,
      onePerCustomer: promo.onePerCustomer,
      startDate: promo.startDate,
      endDate: promo.endDate
    });
    setShowPromoModal(true);
  };

  const handleSavePromo = () => {
    const code = promoFormData.code.trim();
    if (!code) return;
    const newPromo: PromotionCode = {
      id: editingPromo ? editingPromo.id : makeId(),
      code,
      discountType: promoFormData.discountType,
      discountValue: promoFormData.discountValue,
      usageCount: editingPromo ? editingPromo.usageCount : 0,
      usageLimit: promoFormData.hasUsageLimit ? promoFormData.usageLimit : 0,
      status: 'active',
      appliesTo: promoFormData.appliesTo === 'all' ? ['All Ticket Types'] : promoFormData.specificTickets,
      startDate: promoFormData.startDate,
      endDate: promoFormData.endDate,
      onePerCustomer: promoFormData.onePerCustomer
    };

    if (editingPromo) {
      setPromoCodes(promoCodes.map(p => p.id === editingPromo.id ? newPromo : p));
    } else {
      setPromoCodes([...promoCodes, newPromo]);
    }
    setShowPromoModal(false);
  };

  const handleDeletePromo = async (id: string) => {
    setPromoCodes(promoCodes.filter(p => p.id !== id));
    setActiveMenu(null);
    if (!eventId || isTempId(id)) return;
    const { error } = await supabase
      .from('event_promos')
      .delete()
      .eq('id', id)
      .eq('event_id', eventId);
    if (error) console.error('Failed to delete promo', error);
  };

  const handleDeactivatePromo = (id: string) => {
    setPromoCodes(promoCodes.map((promo) => (
      promo.id === id ? { ...promo, status: 'inactive' } : promo
    )));
    setActiveMenu(null);
  };

  const handleToggleTicket = (ticket: string) => {
    if (promoFormData.specificTickets.includes(ticket)) {
      setPromoFormData({
        ...promoFormData,
        specificTickets: promoFormData.specificTickets.filter(t => t !== ticket)
      });
    } else {
      setPromoFormData({
        ...promoFormData,
        specificTickets: [...promoFormData.specificTickets, ticket]
      });
    }
  };

  return (
    <div className="event-marketing p-8" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingBottom: '80px' }}>
      <style>{`
        @media (max-width: 600px) {
          .event-marketing {
            padding: 24px 16px 80px !important;
          }

          .event-marketing__tabs {
            flex-wrap: wrap;
          }

          .event-marketing__tabs button {
            flex: 1 1 160px;
          }

          .event-marketing__email-header,
          .event-marketing__promo-header {
            display: none !important;
          }

          .event-marketing__email-row,
          .event-marketing__promo-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px !important;
          }

          .event-marketing__email-row > *,
          .event-marketing__promo-row > * {
            width: 100%;
          }

          .event-marketing__table-actions {
            align-self: flex-start;
          }
        }

        @media (max-width: 400px) {
          .event-marketing {
            padding: 20px 12px 72px !important;
          }

          .event-marketing__email-row,
          .event-marketing__promo-row {
            padding: 14px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-8">
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            {t('manageEvent.marketing.header.title')}
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8' }}>
            {t('manageEvent.marketing.header.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="event-marketing__tabs flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('email')}
            className="px-6 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === 'email' ? 'rgba(6, 132, 245, 0.15)' : 'transparent',
              border: activeTab === 'email' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'email' ? '#0684F5' : '#94A3B8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Mail size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('manageEvent.marketing.tabs.email')}
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className="px-6 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === 'promo' ? 'rgba(6, 132, 245, 0.15)' : 'transparent',
              border: activeTab === 'promo' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'promo' ? '#0684F5' : '#94A3B8',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Tag size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('manageEvent.marketing.tabs.promo')}
          </button>
        </div>

        {/* EMAIL CAMPAIGNS TAB */}
        {activeTab === 'email' && (
          <div>
            {/* CUSTOM DOMAIN SECTION (PRO-ONLY) */}
            <div
              className="rounded-xl border mb-8"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                    >
                      <Globe size={24} style={{ color: '#F59E0B' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                          {t('manageEvent.marketing.email.customDomain.title')}
                        </h3>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid #F59E0B',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#F59E0B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          <Crown size={12} />
                          PRO
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                        {t('manageEvent.marketing.email.customDomain.subtitle')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  {/* Feature 1 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                    >
                      <Check size={16} style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('manageEvent.marketing.email.customDomain.url')}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {t('manageEvent.marketing.email.customDomain.urlDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                    >
                      <Check size={16} style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('manageEvent.marketing.email.customDomain.domain')}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {t('manageEvent.marketing.email.customDomain.domainDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                    >
                      <Check size={16} style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('manageEvent.marketing.email.customDomain.ssl')}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {t('manageEvent.marketing.email.customDomain.sslDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                    >
                      <Check size={16} style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('manageEvent.marketing.email.customDomain.branding')}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {t('manageEvent.marketing.email.customDomain.brandingDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <button
                    onClick={() => setShowProUpgradeModal(true)}
                    className="px-6 py-3 rounded-lg transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }}
                  >
                    <Crown size={16} />
                    {t('manageEvent.marketing.email.customDomain.upgrade')}
                  </button>
                  <a
                    href="#"
                    style={{
                      fontSize: '14px',
                      color: '#0684F5',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {t('manageEvent.marketing.email.customDomain.learnMore')}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Email KPIs */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Total Emails Sent */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('manageEvent.marketing.email.stats.totalSent')}
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}
                  >
                    <Send size={20} style={{ color: '#0684F5' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {totalEmailsSent.toLocaleString()}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {t('manageEvent.marketing.email.stats.across', { count: emailCampaigns.length })}
                </p>
              </div>

              {/* Average Open Rate */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('manageEvent.marketing.email.stats.openRate')}
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Eye size={20} style={{ color: '#10B981' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {avgOpenRate}%
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {sentCampaigns.length ? t('manageEvent.marketing.email.stats.basedOn') : t('manageEvent.marketing.email.stats.noSent')}
                </p>
              </div>

              {/* Average Click-Through Rate */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('manageEvent.marketing.email.stats.clickRate')}
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
                  >
                    <MousePointerClick size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {avgClickRate}%
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {sentCampaigns.length ? t('manageEvent.marketing.email.stats.basedOn') : t('manageEvent.marketing.email.stats.noSent')}
                </p>
              </div>
            </div>

            {/* Email Campaigns Table */}
            <div
              className="rounded-xl border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('manageEvent.marketing.email.table.title')}
                </h3>
                <button
                  onClick={handleCreateEmailCampaign}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: '#0684F5',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  {t('manageEvent.marketing.email.table.create')}
                </button>
              </div>

              {/* Table Header */}
              <div
                className="event-marketing__email-header grid gap-4 px-6 py-4 border-b"
                style={{
                  gridTemplateColumns: '2.5fr 1fr 1.5fr 1fr 1fr 1.5fr 80px',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.name')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.status')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.audience')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.open')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.click')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.sent')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.email.table.headers.actions')}</div>
              </div>

              {/* Campaign Rows */}
              {emailCampaigns.length ? (
                emailCampaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className="event-marketing__email-row grid gap-4 px-6 py-4 border-b"
                    style={{
                      gridTemplateColumns: '2.5fr 1fr 1.5fr 1fr 1fr 1.5fr 80px',
                      borderColor: index === emailCampaigns.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {campaign.name}
                      </div>
                    </div>

                    <div>
                      <span
                        className="px-3 py-1.5 rounded inline-block"
                        style={{
                          ...getStatusStyles(campaign.status, 'email'),
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                      {campaign.audience}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: campaign.openRate > 40 ? '#10B981' : '#FFFFFF' }}>
                      {campaign.status === 'sent' ? `${campaign.openRate}%` : '—'}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: campaign.clickRate > 8 ? '#10B981' : '#FFFFFF' }}>
                      {campaign.status === 'sent' ? `${campaign.clickRate}%` : '—'}
                    </div>

                    <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                      {campaign.sentOn ? new Date(campaign.sentOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not sent'}
                    </div>

                    <div>
                      <div className="event-marketing__table-actions relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === campaign.id ? null : campaign.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: activeMenu === campaign.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94A3B8',
                            cursor: 'pointer'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenu === campaign.id && (
                          <div
                            className="absolute right-0 mt-2 rounded-lg border shadow-lg z-10"
                            style={{
                              backgroundColor: '#1E3A5F',
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              minWidth: '160px'
                            }}
                          >
                            <button
                              onClick={() => {
                                handleEditEmailCampaign(campaign);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#E2E8F0',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={handleViewEmailReport}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#E2E8F0',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <FileText size={16} />
                              View Report
                            </button>
                            <button
                              onClick={() => handleDuplicateEmailCampaign(campaign)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#E2E8F0',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Copy size={16} />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteEmailCampaign(campaign.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#EF4444',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                  No campaigns yet. Create your first email campaign.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROMOTION CODES TAB */}
        {activeTab === 'promo' && (
          <div>
            {/* Promo KPIs */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Active Codes */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('manageEvent.marketing.promo.stats.activeCodes')}
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Tag size={20} style={{ color: '#10B981' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {activePromos}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {t('manageEvent.marketing.promo.stats.totalCodes', { count: promoCodes.length })}
                </p>
              </div>

              {/* Total Uses */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    Total Uses
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}
                  >
                    <TrendingUp size={20} style={{ color: '#0684F5' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {totalPromoUses.toLocaleString()}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  Promotion redemptions
                </p>
              </div>

              {/* Revenue from Promotions */}
              <div
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                    Revenue from Promotions
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(74, 124, 109, 0.15)' }}
                  >
                    <DollarSign size={20} style={{ color: '#4A7C6D' }} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  ${promoRevenue.toLocaleString()}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  {ticketTypes.length ? t('manageEvent.marketing.promo.stats.revenueDesc') : t('manageEvent.marketing.promo.stats.revenueNoPrice')}
                </p>
              </div>
            </div>

            {/* Promotion Codes Table */}
            <div
              className="rounded-xl border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('manageEvent.marketing.promo.table.title')}
                </h3>
                <button
                  onClick={handleCreatePromo}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: '#0684F5',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  {t('manageEvent.marketing.promo.table.create')}
                </button>
              </div>

              {/* Table Header */}
              <div
                className="event-marketing__promo-header grid gap-4 px-6 py-4 border-b"
                style={{
                  gridTemplateColumns: '1fr 1fr 2fr 1fr 2fr 80px',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.code')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.discount')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.usage')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.status')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.applies')}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>{t('manageEvent.marketing.promo.table.headers.actions')}</div>
              </div>

              {/* Promo Code Rows */}
              {promoCodes.length ? (
                promoCodes.map((promo, index) => {
                  const usagePercentage = promo.usageLimit > 0 ? (promo.usageCount / promo.usageLimit) * 100 : 0;
                  
                  return (
                    <div
                      key={promo.id}
                      className="event-marketing__promo-row grid gap-4 px-6 py-4 border-b"
                      style={{
                        gridTemplateColumns: '1fr 1fr 2fr 1fr 2fr 80px',
                        borderColor: index === promoCodes.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div>
                        <div
                          className="inline-block px-3 py-1.5 rounded"
                          style={{
                            backgroundColor: 'rgba(6, 132, 245, 0.15)',
                            border: '1px solid rgba(6, 132, 245, 0.3)',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0684F5',
                            fontFamily: 'monospace'
                          }}
                        >
                          {promo.code}
                        </div>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% Off` : `$${promo.discountValue.toFixed(2)} Off`}
                      </div>

                      <div>
                        {promo.usageLimit > 0 ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                                {promo.usageCount} / {promo.usageLimit} used
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                                {Math.round(usagePercentage)}%
                              </span>
                            </div>
                            <div
                              className="w-full rounded-full overflow-hidden"
                              style={{
                                height: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${usagePercentage}%`,
                                  backgroundColor: usagePercentage >= 90 ? '#EF4444' : '#0684F5'
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                            {promo.usageCount} uses (unlimited)
                          </span>
                        )}
                      </div>

                      <div>
                        <span
                          className="px-3 py-1.5 rounded inline-block"
                          style={{
                            ...getStatusStyles(promo.status, 'promo'),
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {getStatusLabel(promo.status)}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {promo.appliesTo.join(', ')}
                      </div>

                      <div>
                        <div className="event-marketing__table-actions relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === promo.id ? null : promo.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                              backgroundColor: activeMenu === promo.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#94A3B8',
                              cursor: 'pointer'
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenu === promo.id && (
                            <div
                              className="absolute right-0 mt-2 rounded-lg border shadow-lg z-10"
                              style={{
                                backgroundColor: '#1E3A5F',
                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                minWidth: '160px'
                              }}
                            >
                              <button
                                onClick={() => {
                                  handleEditPromo(promo);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#E2E8F0',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                            <button
                              onClick={() => handleDeactivatePromo(promo.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#E2E8F0',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                              <Power size={16} />
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#EF4444',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                  No promotion codes yet. Create your first promo code.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Promotion Code Modal */}
      {showPromoModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000
          }}
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="rounded-xl border"
            style={{
              backgroundColor: '#1E3A5F',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              maxWidth: '640px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                {editingPromo ? t('manageEvent.marketing.modals.promo.titleEdit', { code: editingPromo.code }) : t('manageEvent.marketing.modals.promo.titleAdd')}
              </h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Promotion Code */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.code')}
                </label>
                <input
                  type="text"
                  value={promoFormData.code}
                  onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                  placeholder={t('manageEvent.marketing.modals.promo.fields.codePlaceholder')}
                  className="w-full rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {/* Discount Type */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.type')}
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPromoFormData({ ...promoFormData, discountType: 'percentage' })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: promoFormData.discountType === 'percentage' ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: promoFormData.discountType === 'percentage' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
                      color: promoFormData.discountType === 'percentage' ? '#0684F5' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Percent size={18} />
                    {t('manageEvent.marketing.modals.promo.fields.typePercent')}
                  </button>
                  <button
                    onClick={() => setPromoFormData({ ...promoFormData, discountType: 'fixed' })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: promoFormData.discountType === 'fixed' ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: promoFormData.discountType === 'fixed' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
                      color: promoFormData.discountType === 'fixed' ? '#0684F5' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <DollarSign size={18} />
                    {t('manageEvent.marketing.modals.promo.fields.typeFixed')}
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.value')}
                </label>
                <div className="relative">
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {promoFormData.discountType === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    value={promoFormData.discountValue}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discountValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    step={promoFormData.discountType === 'percentage' ? '1' : '0.01'}
                    className="w-full rounded-lg pl-8 pr-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.applies')}
                </label>
                <div className="flex gap-4 mb-3">
                  <button
                    onClick={() => setPromoFormData({ ...promoFormData, appliesTo: 'all', specificTickets: [] })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: promoFormData.appliesTo === 'all' ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: promoFormData.appliesTo === 'all' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
                      color: promoFormData.appliesTo === 'all' ? '#0684F5' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Users size={18} />
                    {t('manageEvent.marketing.modals.promo.fields.appliesAll')}
                  </button>
                  <button
                    onClick={() => setPromoFormData({ ...promoFormData, appliesTo: 'specific' })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: promoFormData.appliesTo === 'specific' ? 'rgba(6, 132, 245, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: promoFormData.appliesTo === 'specific' ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.1)',
                      color: promoFormData.appliesTo === 'specific' ? '#0684F5' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Ticket size={18} />
                    {t('manageEvent.marketing.modals.promo.fields.appliesSpecific')}
                  </button>
                </div>

                {/* Specific Tickets Checkboxes */}
                {promoFormData.appliesTo === 'specific' && (
                  <div
                    className="rounded-lg p-4 border space-y-2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {availableTicketTypes.length ? (
                      availableTicketTypes.map((ticket) => (
                        <label
                          key={ticket}
                          className="flex items-center gap-3 cursor-pointer"
                          style={{ fontSize: '14px', color: '#E2E8F0' }}
                        >
                          <div
                            onClick={() => handleToggleTicket(ticket)}
                            className="flex items-center justify-center rounded"
                            style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: promoFormData.specificTickets.includes(ticket) ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                              border: promoFormData.specificTickets.includes(ticket) ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.2)',
                              cursor: 'pointer'
                            }}
                          >
                            {promoFormData.specificTickets.includes(ticket) && (
                              <Check size={14} style={{ color: '#FFFFFF' }} />
                            )}
                          </div>
                          {ticket}
                        </label>
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {t('manageEvent.marketing.modals.promo.fields.noTickets')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Usage Limits */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.usage')}
                </label>
                
                {/* Limit Total Uses */}
                <div
                  className="rounded-lg p-4 border mb-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <label className="flex items-start gap-3 cursor-pointer mb-3">
                    <div
                      onClick={() => setPromoFormData({ ...promoFormData, hasUsageLimit: !promoFormData.hasUsageLimit })}
                      className="flex items-center justify-center rounded flex-shrink-0"
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        backgroundColor: promoFormData.hasUsageLimit ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                        border: promoFormData.hasUsageLimit ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer'
                      }}
                    >
                      {promoFormData.hasUsageLimit && (
                        <Check size={14} style={{ color: '#FFFFFF' }} />
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                        {t('manageEvent.marketing.modals.promo.fields.limitTotal')}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                        Set a maximum number of times this code can be used
                      </span>
                    </div>
                  </label>
                  
                  {promoFormData.hasUsageLimit && (
                    <input
                      type="number"
                      value={promoFormData.usageLimit}
                      onChange={(e) => setPromoFormData({ ...promoFormData, usageLimit: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                      min="1"
                      className="w-full rounded-lg px-4 py-2.5"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '14px'
                      }}
                    />
                  )}
                </div>

                {/* One Use Per Customer */}
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div
                      onClick={() => setPromoFormData({ ...promoFormData, onePerCustomer: !promoFormData.onePerCustomer })}
                      className="flex items-center justify-center rounded flex-shrink-0"
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        backgroundColor: promoFormData.onePerCustomer ? '#0684F5' : 'rgba(255, 255, 255, 0.1)',
                        border: promoFormData.onePerCustomer ? '2px solid #0684F5' : '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer'
                      }}
                    >
                      {promoFormData.onePerCustomer && (
                        <Check size={14} style={{ color: '#FFFFFF' }} />
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                        {t('manageEvent.marketing.modals.promo.fields.limitCustomer')}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                        Each customer can only use this code once
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Active Dates */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.promo.fields.dates')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                      {t('manageEvent.marketing.modals.promo.fields.start')}
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8'
                        }}
                      />
                      <input
                        type="date"
                        value={promoFormData.startDate}
                        onChange={(e) => setPromoFormData({ ...promoFormData, startDate: e.target.value })}
                        className="w-full rounded-lg pl-10 pr-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                      {t('manageEvent.marketing.modals.promo.fields.end')}
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8'
                        }}
                      />
                      <input
                        type="date"
                        value={promoFormData.endDate}
                        onChange={(e) => setPromoFormData({ ...promoFormData, endDate: e.target.value })}
                        className="w-full rounded-lg pl-10 pr-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.marketing.modals.promo.actions.cancel')}
              </button>
              <button
                onClick={handleSavePromo}
                className="px-4 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#0684F5',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.marketing.modals.promo.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Upgrade Modal */}
      {showProUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowProUpgradeModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0B2641',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '500px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}
            >
              <Crown size={32} style={{ color: '#FFFFFF' }} />
            </div>
            
            <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
              {t('manageEvent.marketing.modals.upgrade.title')}
            </h3>
            <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '24px', lineHeight: '1.6' }}>
              {t('manageEvent.marketing.modals.upgrade.subtitle')}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowProUpgradeModal(false)}
                style={{
                  height: '48px',
                  padding: '0 24px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.marketing.modals.upgrade.cancel')}
              </button>
              <button
                style={{
                  height: '48px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Crown size={18} />
                {t('manageEvent.marketing.modals.upgrade.upgrade')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Email Campaign Modal */}
      {showCampaignModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000
          }}
          onClick={() => setShowCampaignModal(false)}
        >
          <div
            className="rounded-xl border"
            style={{
              backgroundColor: '#1E3A5F',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              maxWidth: '640px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                {editingCampaign ? t('manageEvent.marketing.modals.campaign.titleEdit', { name: editingCampaign.name }) : t('manageEvent.marketing.modals.campaign.titleAdd')}
              </h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.marketing.modals.campaign.fields.name')}
                </label>
                <input
                  type="text"
                  value={campaignFormData.name}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                  placeholder={t('manageEvent.marketing.modals.campaign.fields.namePlaceholder')}
                  className="w-full rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.status')}
                  </label>
                  <select
                    value={campaignFormData.status}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value as any })}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.audience')}
                  </label>
                  <input
                    type="text"
                    value={campaignFormData.audience}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, audience: e.target.value })}
                    placeholder={t('manageEvent.marketing.modals.campaign.fields.audience')}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.date')}
                  </label>
                  <input
                    type="date"
                    value={campaignFormData.sentOn}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, sentOn: e.target.value })}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.total')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={campaignFormData.totalSent}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, totalSent: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.open')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={campaignFormData.openRate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, openRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.marketing.modals.campaign.fields.click')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={campaignFormData.clickRate}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, clickRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setShowCampaignModal(false)}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.marketing.modals.campaign.actions.cancel')}
              </button>
              <button
                onClick={handleSaveEmailCampaign}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.marketing.modals.campaign.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
