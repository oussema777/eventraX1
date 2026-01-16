import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import {
  Plus,
  DollarSign,
  Ticket,
  TrendingUp,
  ShoppingCart,
  Edit,
  Eye,
  MoreVertical,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Archive,
  Info,
  Lock,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  revenue: number;
  status: 'on-sale' | 'sold-out' | 'off-sale' | 'scheduled';
  saleStartDate: string;
  saleEndDate: string;
  minPerOrder: number;
  maxPerOrder: number;
  visibility: 'public' | 'hidden';
  tier: 'standard' | 'vip';
  isEarlyBird: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
}

export default function EventTicketingTab({ eventId }: { eventId?: string }) {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<TicketType[]>([]);

  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Pro simulation state
  const [isProSimulation, setIsProSimulation] = useState(false);
  
  // Global settings
  const [globalTicketLimit, setGlobalTicketLimit] = useState<number>(5000);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantityTotal: 0,
    saleStartDate: '',
    saleEndDate: '',
    minPerOrder: 1,
    maxPerOrder: 10,
    visibility: 'public' as 'public' | 'hidden',
    status: 'on-sale' as 'on-sale' | 'off-sale' | 'scheduled' | 'sold-out',
    tier: 'standard' as 'standard' | 'vip',
    isEarlyBird: false,
    earlyBirdPrice: 0,
    earlyBirdEndDate: ''
  });

  const toISODate = (v: any) => {
    if (!v) return '';
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  const toIsoStartOfDay = (d: string) => {
    if (!d) return null as any;
    const dt = new Date(d + 'T00:00:00.000Z');
    if (Number.isNaN(dt.getTime())) return null as any;
    return dt.toISOString();
  };

  const fetchGlobalTicketLimit = async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('capacity_limit')
        .eq('id', eventId)
        .maybeSingle();
      if (error) return;
      if (data?.capacity_limit != null) setGlobalTicketLimit(Number(data.capacity_limit) || 0);
    } catch {}
  };

  const saveGlobalTicketLimit = async () => {
    if (!eventId) return;
    if (savingSettings) return;
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ capacity_limit: globalTicketLimit || null })
        .eq('id', eventId);
      if (error) throw error;
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingSettings(false);
    }
  };

  const mapDbStatus = (s: any): TicketType['status'] => {
    const v = String(s || '').toLowerCase();
    if (v === 'sold-out' || v === 'sold_out') return 'sold-out';
    if (v === 'off-sale' || v === 'off_sale' || v === 'archived' || v === 'inactive') return 'off-sale';
    if (v === 'scheduled') return 'scheduled';
    if (v === 'on-sale' || v === 'on_sale' || v === 'active') return 'on-sale';
    return 'on-sale';
  };

  const fetchTickets = async () => {
    if (!eventId) return;
    setIsLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = (data || []) as any[];
      const mapped: TicketType[] = rows.map((r) => {
        const price = Number(r.price || 0);
        const sold = Number(r.quantity_sold || 0);
        return {
          id: String(r.id),
          name: r.name || '',
          description: r.description || '',
          price,
          quantityTotal: Number(r.quantity_total || 0),
          quantitySold: sold,
          revenue: price * sold,
          status: mapDbStatus(r.status),
          saleStartDate: toISODate(r.sale_start_date || r.sales_start || ''),
          saleEndDate: toISODate(r.sale_end_date || r.sales_end || ''),
          minPerOrder: Number(r.min_per_order || 1),
          maxPerOrder: Number(r.max_per_order || 10),
          visibility: (r.visibility === 'hidden' ? 'hidden' : 'public'),
          tier: (r.tier === 'vip' ? 'vip' : 'standard'),
          isEarlyBird: !!r.is_early_bird,
          earlyBirdPrice: r.early_bird_price == null ? 0 : Number(r.early_bird_price || 0),
          earlyBirdEndDate: toISODate(r.early_bird_end_date || '')
        };
      });
      setTickets(mapped);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchTickets();
    fetchGlobalTicketLimit();
  }, [eventId]);

  // Calculate KPIs
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.revenue, 0);
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.quantitySold, 0);
  const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantityTotal, 0);
  const sellThroughRate = totalTicketsAvailable > 0 ? Math.round((totalTicketsSold / totalTicketsAvailable) * 100) : 0;
  const totalOrders = 1230; // Mock data
  const avgTicketsPerOrder = (totalTicketsSold / totalOrders).toFixed(1);
  const netRevenue = totalRevenue * 0.94; // Assuming 6% fees

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'on-sale':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };
      case 'sold-out':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        };
      case 'off-sale':
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
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-sale':
        return t('manageEvent.ticketing.status.onSale');
      case 'sold-out':
        return t('manageEvent.ticketing.status.soldOut');
      case 'off-sale':
        return t('manageEvent.ticketing.status.offSale');
      case 'scheduled':
        return t('manageEvent.ticketing.status.scheduled');
      default:
        return status;
    }
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantityTotal: 0,
      saleStartDate: '',
      saleEndDate: '',
      minPerOrder: 1,
      maxPerOrder: 10,
      visibility: 'public',
      status: 'on-sale',
      tier: 'standard',
      isEarlyBird: false,
      earlyBirdPrice: 0,
      earlyBirdEndDate: ''
    });
    setShowAdvanced(false);
    setShowModal(true);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description,
      price: ticket.price,
      quantityTotal: ticket.quantityTotal,
      saleStartDate: ticket.saleStartDate,
      saleEndDate: ticket.saleEndDate,
      minPerOrder: ticket.minPerOrder,
      maxPerOrder: ticket.maxPerOrder,
      visibility: ticket.visibility,
      status: ticket.status,
      tier: ticket.tier,
      isEarlyBird: ticket.isEarlyBird,
      earlyBirdPrice: ticket.earlyBirdPrice || 0,
      earlyBirdEndDate: ticket.earlyBirdEndDate || ''
    });
    setShowAdvanced(false);
    setShowModal(true);
  };

    const handleSaveTicket = async () => {
    if (!eventId) {
      toast.error('Missing event');
      return;
    }
    if (!isProSimulation && formData.price > 0) return;
    if (savingTicket) return;
    setSavingTicket(true);
    try {
      const payload: any = {
        event_id: eventId,
        name: formData.name,
        description: formData.description || null,
        price: formData.price || 0,
        quantity_total: formData.quantityTotal || null,
        status: formData.status,
        tier: formData.tier,
        sale_start_date: toIsoStartOfDay(formData.saleStartDate),
        sale_end_date: toIsoStartOfDay(formData.saleEndDate),
        min_per_order: formData.minPerOrder || 1,
        max_per_order: formData.maxPerOrder || 10,
        visibility: formData.visibility,
        is_early_bird: !!formData.isEarlyBird,
        early_bird_price: formData.isEarlyBird ? (formData.earlyBirdPrice || 0) : 0,
        early_bird_end_date: formData.isEarlyBird ? toIsoStartOfDay(formData.earlyBirdEndDate) : null
      };
      if (editingTicket) {
        const { error } = await supabase
          .from('event_tickets')
          .update(payload)
          .eq('id', editingTicket.id);
        if (error) throw error;
        toast.success('Changes saved');
      } else {
        payload.quantity_sold = 0;
        const { error } = await supabase
          .from('event_tickets')
          .insert(payload);
        if (error) throw error;
        toast.success('Ticket created');
      }
      setShowModal(false);
      setEditingTicket(null);
      await fetchTickets();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingTicket(false);
    }
  };

    const handleDuplicateTicket = async (ticket: TicketType) => {
    if (!eventId) return;
    try {
      const payload: any = {
        event_id: eventId,
        name: `${ticket.name} (Copy)`,
        description: ticket.description || null,
        price: ticket.price || 0,
        quantity_total: ticket.quantityTotal || null,
        quantity_sold: 0,
        status: ticket.status,
        tier: ticket.tier,
        sale_start_date: toIsoStartOfDay(ticket.saleStartDate),
        sale_end_date: toIsoStartOfDay(ticket.saleEndDate),
        min_per_order: ticket.minPerOrder || 1,
        max_per_order: ticket.maxPerOrder || 10,
        visibility: ticket.visibility,
        is_early_bird: !!ticket.isEarlyBird,
        early_bird_price: ticket.isEarlyBird ? (ticket.earlyBirdPrice || 0) : 0,
        early_bird_end_date: ticket.isEarlyBird ? toIsoStartOfDay(ticket.earlyBirdEndDate || '') : null
      };
      const { error } = await supabase
        .from('event_tickets')
        .insert(payload);
      if (error) throw error;
      toast.success('Duplicated');
      setActiveMenu(null);
      await fetchTickets();
    } catch {
      toast.error('Failed to duplicate');
      setActiveMenu(null);
    }
  };

  const handleArchiveTicket = async (ticket: TicketType) => {
    if (!eventId) return;
    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({ status: 'off-sale', visibility: 'hidden' })
        .eq('id', ticket.id);
      if (error) throw error;
      toast.success('Archived');
      setActiveMenu(null);
      await fetchTickets();
    } catch {
      toast.error('Failed to archive');
      setActiveMenu(null);
    }
  };

  // Check if paid ticket without Pro
  const showPaidTicketWarning = !isProSimulation && formData.price > 0;

  return (
    <div className="p-8" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-8">
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            {t('manageEvent.ticketing.header.title')}
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8' }}>
            {t('manageEvent.ticketing.header.subtitle')}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                {t('manageEvent.ticketing.stats.totalRevenue')}
              </span>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                <DollarSign size={20} style={{ color: '#10B981' }} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('manageEvent.ticketing.stats.netRevenue', { amount: netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
            </p>
          </div>

          {/* Tickets Sold */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                {t('manageEvent.ticketing.stats.ticketsSold')}
              </span>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}
              >
                <Ticket size={20} style={{ color: '#0684F5' }} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {totalTicketsSold.toLocaleString()}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('manageEvent.ticketing.stats.acrossTypes', { count: tickets.length })}
            </p>
          </div>

          {/* Sell-through Rate */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                {t('manageEvent.ticketing.stats.sellThroughRate')}
              </span>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
              >
                <TrendingUp size={20} style={{ color: '#8B5CF6' }} />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
                {sellThroughRate}%
              </div>
              {/* Circular Progress */}
              <div className="relative" style={{ width: '48px', height: '48px', marginBottom: '4px' }}>
                <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - sellThroughRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
              {t('manageEvent.ticketing.stats.soldOfTotal', { sold: totalTicketsSold, total: totalTicketsAvailable })}
            </p>
          </div>

          {/* Total Orders */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                {t('manageEvent.ticketing.stats.totalOrders')}
              </span>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(74, 124, 109, 0.15)' }}
              >
                <ShoppingCart size={20} style={{ color: '#4A7C6D' }} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {totalOrders.toLocaleString()}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('manageEvent.ticketing.stats.avgPerOrder', { count: avgTicketsPerOrder })}
            </p>
          </div>
        </div>

        {/* Ticket Types Management Section */}
        <div
          className="rounded-xl border mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('manageEvent.ticketing.ticketTypes.title')}
            </h3>
            <button
              onClick={handleAddTicket}
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
              {t('manageEvent.ticketing.ticketTypes.add')}
            </button>
          </div>

          {/* Ticket List */}
          <div>
            {tickets.map((ticket, index) => {
              const soldPercentage = (ticket.quantitySold / ticket.quantityTotal) * 100;
              
              return (
                <div
                  key={ticket.id}
                  className="p-6 border-b"
                  style={{
                    borderColor: index === tickets.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 120px 180px' }}>
                    {/* Ticket Name & Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                          {ticket.name}
                        </h4>
                        {ticket.tier === 'vip' && (
                          <span
                            className="px-2 py-0.5 rounded flex items-center gap-1"
                            style={{
                              backgroundColor: 'rgba(251, 191, 36, 0.15)',
                              color: '#FBB936',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <Sparkles size={10} />
                            VIP
                          </span>
                        )}
                        {ticket.isEarlyBird && (
                          <span
                            className="px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.15)',
                              color: '#8B5CF6',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            EARLY BIRD
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {t('manageEvent.ticketing.ticketTypes.salesEnd', { date: new Date(ticket.saleEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}
                      </p>
                    </div>

                    {/* Sales Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                          {t('manageEvent.ticketing.ticketTypes.soldCount', { sold: ticket.quantitySold, total: ticket.quantityTotal })}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                          {Math.round(soldPercentage)}%
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full overflow-hidden"
                        style={{
                          height: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${soldPercentage}%`,
                            backgroundColor: ticket.status === 'sold-out' ? '#EF4444' : '#10B981'
                          }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                        {t('manageEvent.ticketing.ticketTypes.price')}
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                        ${ticket.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Revenue */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                        {t('manageEvent.ticketing.ticketTypes.revenue')}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>
                        ${ticket.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                        {t('manageEvent.ticketing.ticketTypes.status')}
                      </span>
                      <span
                        className="px-3 py-1.5 rounded inline-block"
                        style={{
                          ...getStatusStyles(ticket.status),
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.15)',
                          border: '1px solid rgba(6, 132, 245, 0.3)',
                          color: '#0684F5',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} />
                        {t('manageEvent.ticketing.ticketTypes.actions.edit')}
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#94A3B8',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        {t('manageEvent.ticketing.ticketTypes.actions.orders')}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === ticket.id ? null : ticket.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: activeMenu === ticket.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94A3B8',
                            cursor: 'pointer'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === ticket.id && (
                          <div
                            className="absolute right-0 mt-2 rounded-lg border shadow-lg z-10"
                            style={{
                              backgroundColor: '#1E3A5F',
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              minWidth: '160px'
                            }}
                          >
                            <button
                              onClick={() => handleDuplicateTicket(ticket)}
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
                              {t('manageEvent.ticketing.ticketTypes.actions.duplicate')}
                            </button>
                            <button
                              onClick={() => handleArchiveTicket(ticket)}
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
                              <Archive size={16} />
                              {t('manageEvent.ticketing.ticketTypes.actions.archive')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Settings Section */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            {t('manageEvent.ticketing.settings.title')}
          </h3>
          
          <div style={{ maxWidth: '400px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
              {t('manageEvent.ticketing.settings.limitLabel')}
            </label>
            <input
              type="number"
              value={globalTicketLimit}
              onChange={(e) => setGlobalTicketLimit(parseInt(e.target.value) || 0)}
              onBlur={saveGlobalTicketLimit}
              placeholder={t('manageEvent.ticketing.settings.limitPlaceholder')}
              className="w-full rounded-lg px-4 py-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
              <Info size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {t('manageEvent.ticketing.settings.limitHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Ticket Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
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
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  {editingTicket ? t('manageEvent.ticketing.modals.add.titleEdit', { name: editingTicket.name }) : t('manageEvent.ticketing.modals.add.titleAdd')}
                </h3>
                {/* Pro Simulation Toggle */}
                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProSimulation}
                      onChange={(e) => setIsProSimulation(e.target.checked)}
                      style={{
                        width: '40px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#FBB936'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {t('manageEvent.ticketing.modals.add.simulatePro')}
                    </span>
                  </label>
                  {isProSimulation && (
                    <span
                      className="px-2 py-1 rounded flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        color: '#FBB936',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <Sparkles size={12} />
                      {t('manageEvent.ticketing.modals.add.proMode')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
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
              {/* Ticket Name */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.ticketing.modals.add.fields.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('manageEvent.ticketing.modals.add.fields.namePlaceholder')}
                  className="w-full rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Ticket Tier / Preset */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.ticketing.modals.add.fields.tier')}
                </label>
                <div className="space-y-3">
                  {/* Standard */}
                  <label
                    className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      backgroundColor: formData.tier === 'standard' ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: formData.tier === 'standard' ? '#0684F5' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === 'standard'}
                      onChange={() => setFormData({ ...formData, tier: 'standard' })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0684F5' }}
                    />
                    <div className="flex-1">
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                        {t('manageEvent.ticketing.modals.add.fields.standard')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('manageEvent.ticketing.modals.add.fields.standardDesc')}
                      </div>
                    </div>
                  </label>

                  {/* VIP - Pro Only */}
                  <label
                    className="flex items-center gap-3 p-4 rounded-lg border transition-all relative"
                    style={{
                      backgroundColor: formData.tier === 'vip' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: formData.tier === 'vip' ? '#FBB936' : 'rgba(255, 255, 255, 0.1)',
                      cursor: isProSimulation ? 'pointer' : 'not-allowed',
                      opacity: isProSimulation ? 1 : 0.6
                    }}
                    title={!isProSimulation ? t('manageEvent.ticketing.modals.add.warnings.vipUpgrade') : ''}
                  >
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === 'vip'}
                      onChange={() => isProSimulation && setFormData({ ...formData, tier: 'vip' })}
                      disabled={!isProSimulation}
                      style={{ width: '18px', height: '18px', cursor: isProSimulation ? 'pointer' : 'not-allowed', accentColor: '#FBB936' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {t('manageEvent.ticketing.modals.add.fields.vip')}
                        </span>
                        {!isProSimulation && (
                          <Lock size={14} style={{ color: '#FBB936' }} />
                        )}
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            color: '#FBB936',
                            fontSize: '10px',
                            fontWeight: 700
                          }}
                        >
                          PRO
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('manageEvent.ticketing.modals.add.fields.vipDesc')}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.ticketing.modals.add.fields.price')}
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
                      $
                    </span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full rounded-lg pl-8 pr-4 py-3"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: showPaidTicketWarning ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  {showPaidTicketWarning && (
                    <div
                      className="flex items-start gap-2 mt-2 p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <AlertCircle size={16} style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444', marginBottom: '4px' }}>
                          {t('manageEvent.ticketing.modals.add.warnings.upgradeRequired')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#FCA5A5' }}>
                          {t('manageEvent.ticketing.modals.add.warnings.upgradeDesc')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.ticketing.modals.add.fields.quantity')}
                  </label>
                  <input
                    type="number"
                    value={formData.quantityTotal}
                    onChange={(e) => setFormData({ ...formData, quantityTotal: parseInt(e.target.value) || 0 })}
                    placeholder="0"
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

              {/* Early Bird Pricing - Pro Only */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  opacity: isProSimulation ? 1 : 0.6
                }}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEarlyBird}
                    onChange={(e) => isProSimulation && setFormData({ ...formData, isEarlyBird: e.target.checked })}
                    disabled={!isProSimulation}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: isProSimulation ? 'pointer' : 'not-allowed',
                      accentColor: '#8B5CF6'
                    }}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                      {t('manageEvent.ticketing.modals.add.fields.earlyBird')}
                    </span>
                    {!isProSimulation && (
                      <Lock size={14} style={{ color: '#FBB936' }} />
                    )}
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        color: '#FBB936',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      PRO
                    </span>
                  </div>
                </label>
                {formData.isEarlyBird && isProSimulation && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                        {t('manageEvent.ticketing.modals.add.fields.earlyBirdPrice')}
                      </label>
                      <div className="relative">
                        <span
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94A3B8',
                            fontSize: '14px'
                          }}
                        >
                          $
                        </span>
                        <input
                          type="number"
                          value={formData.earlyBirdPrice}
                          onChange={(e) => setFormData({ ...formData, earlyBirdPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full rounded-lg pl-8 pr-4 py-2"
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
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                        {t('manageEvent.ticketing.modals.add.fields.earlyBirdUntil')}
                      </label>
                      <input
                        type="date"
                        value={formData.earlyBirdEndDate}
                        onChange={(e) => setFormData({ ...formData, earlyBirdEndDate: e.target.value })}
                        className="w-full rounded-lg px-3 py-2"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sale Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.ticketing.modals.add.fields.saleStarts')}
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
                      value={formData.saleStartDate}
                      onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
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
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                    {t('manageEvent.ticketing.modals.add.fields.saleEnds')}
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
                      value={formData.saleEndDate}
                      onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
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

              {/* Ticket Description */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                  {t('manageEvent.ticketing.modals.add.fields.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('manageEvent.ticketing.modals.add.fields.descriptionPlaceholder')}
                  rows={3}
                  className="w-full rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Advanced Options Accordion */}
              <div
                className="rounded-lg border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-4"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>{t('manageEvent.ticketing.modals.add.fields.advanced')}</span>
                  {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showAdvanced && (
                  <div className="p-4 pt-0 space-y-4">
                    {/* Tickets per Order */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                          {t('manageEvent.ticketing.modals.add.fields.minPerOrder')}
                        </label>
                        <input
                          type="number"
                          value={formData.minPerOrder}
                          onChange={(e) => setFormData({ ...formData, minPerOrder: parseInt(e.target.value) || 1 })}
                          min="1"
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
                          {t('manageEvent.ticketing.modals.add.fields.maxPerOrder')}
                        </label>
                        <input
                          type="number"
                          value={formData.maxPerOrder}
                          onChange={(e) => setFormData({ ...formData, maxPerOrder: parseInt(e.target.value) || 10 })}
                          min="1"
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

                    {/* Visibility */}
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                        {t('manageEvent.ticketing.modals.add.fields.visibility')}
                      </label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'hidden' })}
                        className="w-full rounded-lg px-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="public" style={{ backgroundColor: '#1E3A5F' }}>{t('manageEvent.ticketing.modals.add.fields.public')}</option>
                        <option value="hidden" style={{ backgroundColor: '#1E3A5F' }}>{t('manageEvent.ticketing.modals.add.fields.hidden')}</option>
                      </select>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                        <Info size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {t('manageEvent.ticketing.modals.add.fields.hiddenHint')}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'block' }}>
                        {t('manageEvent.ticketing.modals.add.fields.status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full rounded-lg px-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="on-sale" style={{ backgroundColor: '#1E3A5F' }}>{t('manageEvent.ticketing.status.onSale')}</option>
                        <option value="off-sale" style={{ backgroundColor: '#1E3A5F' }}>{t('manageEvent.ticketing.status.offSale')}</option>
                        <option value="scheduled" style={{ backgroundColor: '#1E3A5F' }}>{t('manageEvent.ticketing.status.scheduled')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E2E8F0',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('manageEvent.ticketing.modals.add.actions.cancel')}
              </button>
              <button
                onClick={handleSaveTicket}
                disabled={showPaidTicketWarning || !formData.name || formData.quantityTotal === 0}
                className="px-4 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: (showPaidTicketWarning || !formData.name || formData.quantityTotal === 0) ? '#475569' : '#0684F5',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (showPaidTicketWarning || !formData.name || formData.quantityTotal === 0) ? 'not-allowed' : 'pointer',
                  opacity: (showPaidTicketWarning || !formData.name || formData.quantityTotal === 0) ? 0.5 : 1
                }}
              >
                {editingTicket ? t('manageEvent.ticketing.modals.add.actions.save') : t('manageEvent.ticketing.modals.add.actions.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
