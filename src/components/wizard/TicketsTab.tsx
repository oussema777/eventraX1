import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Plus,
  MoreVertical,
  Edit2,
  Copy,
  Calendar,
  Tag,
  Settings,
  ChevronDown,
  Crown,
  Archive,
  Trash2,
  Check,
  X,
  Info
} from 'lucide-react';
import TicketCreationModal from './modals/TicketCreationModal';
import SuccessToast from './SuccessToast';
import { useTickets, TicketType } from '../../hooks/useTickets';
import { usePlan } from '../../hooks/usePlan';
import { useI18n } from '../../i18n/I18nContext';

interface TicketsTabProps {
  eventId: string;
}

export default function TicketsTab({ eventId }: TicketsTabProps) {
  const navigate = useNavigate();
  const { tickets, isLoading, createTicket, updateTicket, deleteTicket } = useTickets(eventId);
  const { t } = useI18n();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [globalPurchaseLimit, setGlobalPurchaseLimit] = useState(false);
  const [globalMaxTickets, setGlobalMaxTickets] = useState(10);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  
  const { isPro: hasPro } = usePlan();

  const handleToggleTicket = async (id: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) return;
    const nextStatus = ticket.status === 'active' ? 'draft' : 'active';
    await updateTicket(id, { status: nextStatus });
    setToastMessage(t('wizard.step3.ticketsTab.toasts.statusUpdated'));
    setShowToast(true);
  };

  const handleSelectTicket = (id: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTickets(newSelected);
  };

  const handleSaveTicket = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description || '',
      price: data.pricingType === 'free' ? 0 : data.price || 0,
      total: data.quantity || null,
      includes: data.includes || [],
      status: 'active',
      isPro: data.isVIP,
      startDate: data.startDate,
      endDate: data.endDate,
      maxPerPerson: data.maxPerPerson || 10,
      currency: data.currency || 'USD',
      visibility: data.visibility,
      isEarlyBird: data.enableEarlyBird,
      earlyBirdDiscount: data.earlyBirdDiscount,
      earlyBirdEndDate: data.earlyBirdEnd
    };

    let success = false;

    if (editingTicket?.id) {
      const result = await updateTicket(editingTicket.id, payload as any);
      if (result) {
        setToastMessage(t('wizard.step3.ticketsTab.toasts.updated'));
        success = true;
      }
    } else {
      const result = await createTicket(payload as any);
      if (result) {
        setToastMessage(t('wizard.step3.ticketsTab.toasts.created'));
        success = true;
      }
    }

    if (success) {
      setShowToast(true);
      setEditingTicket(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('wizard.step3.ticketsTab.confirmDelete'))) {
      await deleteTicket(id);
      setToastMessage(t('wizard.step3.ticketsTab.toasts.deleted'));
      setShowToast(true);
    }
  };

  // Simulate event capacity from Event Details if not available
  const eventCapacity = 1000;

  return (
    <div className="tickets-container rounded-xl p-10" style={{ backgroundColor: '#0B2641', minHeight: 'calc(100vh - 300px)' }}>
      <style>{`
        @media (max-width: 768px) {
          .tickets-container { padding: 1.25rem !important; }
          .tickets-header { flex-direction: column !important; gap: 1rem !important; }
          .tickets-grid { grid-template-columns: 1fr !important; }
          .tickets-add-btn { width: 100% !important; justify-content: center !important; }
          .ticket-card-header { margin-left: 0 !important; margin-top: 2.5rem !important; }
          .ticket-bulk-bar { flex-direction: column !important; gap: 1rem !important; }
          .ticket-bulk-actions { width: 100% !important; justify-content: center !important; flex-wrap: wrap !important; }
          .ticket-bulk-btn { flex: 1 1 auto !important; min-width: 120px !important; justify-content: center !important; }
        }
        @media (max-width: 500px) {
          .tickets-container { padding: 0.75rem !important; }
          .tickets-grid { gap: 0.75rem !important; }
          .ticket-card-header { margin-top: 2rem !important; }
        }
      `}</style>
      {/* Header */}
      <div className="tickets-header flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2" style={{ color: '#FFFFFF', fontWeight: 600 }}>
            {t('wizard.step3.ticketsTab.title')}
          </h2>
          <p className="text-base" style={{ color: '#94A3B8' }}>
            {t('wizard.step3.ticketsTab.subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTicket(null);
            setIsModalOpen(true);
          }}
          className="tickets-add-btn flex items-center gap-2 px-6 h-11 rounded-lg transition-transform hover:scale-105"
          style={{ backgroundColor: '#0684F5', color: '#FFFFFF', fontWeight: 600 }}
        >
          <Plus size={20} />
          {t('wizard.step3.ticketsTab.addTicket')}
        </button>
      </div>

      {/* Ticket Cards */}
      <div className="tickets-grid grid grid-cols-2 gap-5 mb-8 max-w-[1200px]">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl p-6 border transition-shadow hover:shadow-lg"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: ticket.isPro ? '#F59E0B' : 'rgba(255,255,255,0.1)',
              borderWidth: ticket.isPro ? '2px' : '1px',
              opacity: ticket.status === 'expired' ? 0.7 : 1,
              position: 'relative'
            }}
          >
            {/* PRO Overlay */}
            {ticket.isPro && !hasPro && (
              <div 
                className="absolute inset-0 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 10 }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
                  >
                    <Crown size={28} style={{ color: '#FFFFFF' }} />
                  </div>
                  <h3 className="text-xl mb-2" style={{ color: '#0B2641', fontWeight: 600 }}>
                    PRO Feature
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                    Upgrade to create VIP tickets
                  </p>
                  <button
                    className="px-6 h-10 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox for bulk selection */}
            <input
              type="checkbox"
              checked={selectedTickets.has(ticket.id)}
              onChange={() => handleSelectTicket(ticket.id)}
              className="absolute top-6 left-6 w-5 h-5 cursor-pointer"
              style={{ accentColor: 'var(--primary)' }}
            />

            {/* Card Header */}
            <div className="ticket-card-header flex items-start justify-between mb-5 ml-8">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)' }}
                >
                  <Ticket size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl" style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {ticket.name}
                    </h3>
                    {ticket.status === 'active' && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 600 }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
                        Active
                      </span>
                    )}
                    {ticket.status === 'expired' && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
                      >
                        Expired
                      </span>
                    )}
                    {ticket.status === 'draft' && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#E5E7EB', color: '#6B7280', fontWeight: 600 }}
                      >
                        Disabled
                      </span>
                    )}
                    {ticket.isPro && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ 
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#FFFFFF',
                          fontWeight: 700
                        }}
                      >
                        <Crown size={12} />
                        PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#94A3B8', fontWeight: 500 }}>
                    {ticket.status === 'active' ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleTicket(ticket.id)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: ticket.status === 'active' ? 'var(--primary)' : '#E5E7EB'
                    }}
                    disabled={ticket.status === 'expired'}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{
                        left: ticket.status === 'active' ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                </div>
                <button 
                    onClick={() => handleDelete(ticket.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" 
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <Trash2 size={18} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>

            {/* Card Content - Simple Info Only */}
            <div className="grid grid-cols-2 gap-6 mb-5">
              {/* Pricing */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#94A3B8', fontWeight: 500 }}>Price</p>
                <p 
                  className="text-4xl mb-1"
                  style={{ 
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textDecoration: ticket.status === 'expired' ? 'line-through' : 'none'
                  }}
                >
                  ${ticket.price}
                </p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>per attendee</p>
              </div>

              {/* Total Available */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#94A3B8', fontWeight: 500 }}>Total Available</p>
                <p className="text-4xl mb-1" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {ticket.total}
                </p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  tickets
                </p>
              </div>
            </div>

            {/* Card Details */}
            <div 
              className="flex items-center gap-8 pt-4 mb-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: '#94A3B8' }} />
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  Sale ends: {ticket.endDate || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} style={{ color: '#94A3B8' }} />
                <span className="text-sm" style={{ color: '#94A3B8' }}>
                  Includes: {ticket.includes.join(', ')}
                </span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center gap-2">
              {ticket.status === 'expired' ? (
                <button className="flex items-center gap-2 px-4 h-9 rounded-lg border transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
                  <Archive size={16} />
                  <span className="text-sm" style={{ fontWeight: 600 }}>Archive</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                        setEditingTicket(ticket);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg border transition-colors" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
                    <Edit2 size={16} />
                    <span className="text-sm" style={{ fontWeight: 600 }}>Edit Ticket</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Empty State - Free Ticket */}
        <div
          className="rounded-xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.2)',
            minHeight: '200px',
            cursor: 'pointer'
          }}
          onClick={() => {
            setEditingTicket(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={48} style={{ color: '#94A3B8', marginBottom: '12px' }} />
          <h3 className="text-lg mb-2" style={{ color: '#FFFFFF', fontWeight: 600 }}>
            Add Free Ticket Option
          </h3>
          <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
            Great for networking events or community meetups
          </p>
          <button 
            className="px-5 h-10 rounded-lg border transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 600 }}
          >
            Add Free Ticket
          </button>
        </div>
      </div>

      {/* Ticket Settings Panel */}
      <div className="max-w-[1000px] mt-8">
        <button
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <Settings size={20} style={{ color: '#FFFFFF' }} />
            <span className="text-lg" style={{ color: '#FFFFFF', fontWeight: 600 }}>
              Ticket Settings
            </span>
          </div>
          <ChevronDown 
            size={20} 
            style={{ 
              color: '#FFFFFF',
              transform: settingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          />
        </button>

        {settingsExpanded && (
          <div className="rounded-xl p-6 mt-2 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="space-y-6">
              {/* Global Ticket Limit */}
              <div>
                <h4 className="text-base mb-3" style={{ color: '#0B2641', fontWeight: 600 }}>
                  Global Ticket Limit
                </h4>
                <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  Limit the total number of tickets one person can purchase across all ticket types
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setGlobalPurchaseLimit(!globalPurchaseLimit)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: globalPurchaseLimit ? 'var(--primary)' : '#E5E7EB'
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{
                        left: globalPurchaseLimit ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                  <span className="text-sm" style={{ color: '#0B2641', fontWeight: 500 }}>
                    Enable global ticket limit
                  </span>
                </div>

                {globalPurchaseLimit && (
                  <div 
                    className="rounded-lg p-4 border"
                    style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
                  >
                    <label className="block text-sm mb-2" style={{ color: '#6B7280', fontWeight: 500 }}>
                      Maximum tickets per person
                    </label>
                    <input
                      type="number"
                      value={globalMaxTickets}
                      onChange={(e) => setGlobalMaxTickets(Number(e.target.value))}
                      placeholder="e.g., 10"
                      min="1"
                      className="w-full h-11 px-4 rounded-lg border outline-none mb-3"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641', backgroundColor: '#FFFFFF' }}
                    />
                    <div 
                      className="flex items-start gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(6, 132, 245, 0.05)' }}
                    >
                      <Info size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                      <div className="text-xs" style={{ color: '#0B2641', lineHeight: '1.5' }}>
                        <strong>Example:</strong> If set to {globalMaxTickets}, a person can buy up to {globalMaxTickets} tickets total in any combination (e.g., {Math.floor(globalMaxTickets * 0.6)} General + {Math.floor(globalMaxTickets * 0.4)} VIP), but cannot exceed {globalMaxTickets} tickets total.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add visual spacing after Event Settings */}
      <div className="h-12" />

      {/* Bulk Actions Bar */}
      {selectedTickets.size > 0 && (
        <div 
          className="ticket-bulk-bar fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between shadow-lg"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
            zIndex: 50
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#0B2641', fontWeight: 500 }}>
              {selectedTickets.size} tickets selected
            </span>
            <button
              onClick={() => setSelectedTickets(new Set())}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Deselect All
            </button>
          </div>
          <div className="ticket-bulk-actions flex items-center gap-2">
            <button className="ticket-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-gray-50">
              <Check size={16} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#6B7280', fontWeight: 600 }}>Enable All</span>
            </button>
            <button className="ticket-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-gray-50">
              <X size={16} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#6B7280', fontWeight: 600 }}>Disable All</span>
            </button>
            <button className="ticket-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg border transition-colors hover:bg-gray-50">
              <Copy size={16} />
              <span className="text-sm" style={{ fontWeight: 600 }}>Duplicate</span>
            </button>
            <button className="ticket-bulk-btn flex items-center gap-2 px-4 h-9 rounded-lg transition-colors hover:bg-red-50">
              <Trash2 size={16} style={{ color: '#EF4444' }} />
              <span className="text-sm" style={{ color: '#EF4444', fontWeight: 600 }}>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <TicketCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        eventCapacity={eventCapacity}
        hasPro={hasPro}
        ticket={editingTicket} // Pass editing ticket if present (Modal needs to support it)
      />

      {/* Toast */}
      <SuccessToast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}