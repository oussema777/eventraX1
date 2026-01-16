import { X, CheckCircle, Calendar, Plus, XCircle, DollarSign, Gift, AlertTriangle, Info, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isEventPaid } from '../../../utils/eventStorage';
import { useI18n } from '../../../i18n/I18nContext';
import { TicketType } from '../../../hooks/useTickets';

interface TicketCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TicketFormData) => Promise<void>;
  eventCapacity?: number;
  hasPro?: boolean;
  ticket?: TicketType | null;
}

export interface TicketFormData {
  name: string;
  description: string;
  pricingType: 'paid' | 'free' | 'donation';
  price: number;
  currency: string;
  quantity: number;
  startDate: string;
  endDate: string;
  visibility: 'public' | 'hidden' | 'private';
  includes: string[];
  maxPerPerson: number;
  isVIP: boolean;
  enableEarlyBird: boolean;
  earlyBirdDiscount: number;
  earlyBirdStart: string;
  earlyBirdEnd: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'United States Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: '₣', name: 'Swiss Franc' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' }
];

export default function TicketCreationModal({ isOpen, onClose, onSave, eventCapacity, hasPro = false, ticket }: TicketCreationModalProps) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<TicketFormData>({
    name: '',
    description: '',
    pricingType: 'free',
    price: 0,
    currency: 'USD',
    quantity: 100,
    startDate: '',
    endDate: '',
    visibility: 'public',
    includes: [],
    maxPerPerson: 10,
    isVIP: false,
    enableEarlyBird: false,
    earlyBirdDiscount: 0,
    earlyBirdStart: '',
    earlyBirdEnd: ''
  });

  const [charCount, setCharCount] = useState(0);
  const [currentInclude, setCurrentInclude] = useState('');
  
  const isBlockedByPlan = !hasPro && (formData.pricingType !== 'free' || formData.isVIP);

  useEffect(() => {
    if (isOpen) {
      if (ticket) {
        setFormData({
          name: ticket.name,
          description: ticket.description || '',
          pricingType: ticket.price > 0 ? 'paid' : 'free',
          price: ticket.price,
          currency: ticket.currency || 'USD',
          quantity: ticket.total,
          startDate: ticket.startDate || '',
          endDate: ticket.endDate || '',
          visibility: ticket.visibility as any || 'public',
          includes: ticket.includes || [],
          maxPerPerson: ticket.maxPerPerson || 10,
          isVIP: ticket.isPro || ticket.tier === 'vip',
          enableEarlyBird: ticket.isEarlyBird || false,
          earlyBirdDiscount: ticket.earlyBirdDiscount || 0,
          earlyBirdStart: '',
          earlyBirdEnd: ticket.earlyBirdEndDate || ''
        });
        setCharCount(ticket.description?.length || 0);
      } else {
        const eventIsPaid = isEventPaid();
        setFormData({
          name: '',
          description: '',
          pricingType: eventIsPaid ? 'paid' : 'free',
          price: 0,
          currency: 'USD',
          quantity: 100,
          startDate: '',
          endDate: '',
          visibility: 'public',
          includes: [],
          maxPerPerson: 10,
          isVIP: false,
          enableEarlyBird: false,
          earlyBirdDiscount: 0,
          earlyBirdStart: '',
          earlyBirdEnd: ''
        });
        setCharCount(0);
      }
    }
  }, [isOpen, ticket]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isBlockedByPlan) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInclude = () => {
    if (currentInclude.trim()) {
      setFormData({
        ...formData,
        includes: [...formData.includes, currentInclude.trim()]
      });
      setCurrentInclude('');
    }
  };

  const handleRemoveInclude = (index: number) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter((_, i) => i !== index)
    });
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length <= 500) {
      setFormData({ ...formData, description: value });
      setCharCount(value.length);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(11, 38, 65, 0.7)' }}
        onClick={onClose}
      >
        <div 
          className="w-[700px] rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="p-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 
                  className="text-2xl mb-1"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.title')}
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t('wizard.step3.ticketsModal.subtitle')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#6B7280' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >
            <div className="space-y-6">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{ 
                  backgroundColor: formData.pricingType === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 132, 245, 0.1)', 
                  border: `1px solid ${formData.pricingType === 'paid' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 132, 245, 0.3)'}` 
                }}
              >
                {formData.pricingType === 'paid' ? (
                  <DollarSign size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Gift size={20} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <p className="text-sm mb-1" style={{ color: '#0B2641', fontWeight: 600 }}>
                    {formData.pricingType === 'paid'
                      ? t('wizard.step3.ticketsModal.eventType.paidTitle')
                      : t('wizard.step3.ticketsModal.eventType.freeTitle')}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {formData.pricingType === 'paid' 
                      ? t('wizard.step3.ticketsModal.eventType.paidBody')
                      : t('wizard.step3.ticketsModal.eventType.freeBody')}
                  </p>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.fields.name.label')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('wizard.step3.ticketsModal.fields.name.placeholder')}
                  maxLength={100}
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {formData.name.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.fields.description.label')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder={t('wizard.step3.ticketsModal.fields.description.placeholder')}
                  className="w-full h-[120px] p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <div className="flex justify-end mt-1">
                  <span 
                    className="text-xs"
                    style={{ color: charCount > 450 ? '#EF4444' : '#9CA3AF' }}
                  >
                    {charCount}/500
                  </span>
                </div>
              </div>

              <div
                className="relative rounded-lg p-4 border"
                style={{
                  backgroundColor: !hasPro ? 'rgba(249, 250, 251, 0.5)' : 'transparent',
                  borderColor: !hasPro ? '#F59E0B' : '#E5E7EB',
                  opacity: !hasPro ? 0.8 : 1
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label 
                      className="block text-sm"
                      style={{ fontWeight: 500, color: '#0B2641' }}
                    >
                      {t('wizard.step3.ticketsModal.fields.vip.label')}
                    </label>
                    {!hasPro && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: 'white',
                          fontWeight: 700
                        }}
                      >
                        <Crown size={10} />
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!hasPro) return;
                        setFormData({ ...formData, isVIP: !formData.isVIP });
                      }}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ 
                        backgroundColor: formData.isVIP ? 'var(--primary)' : '#E5E7EB',
                        cursor: !hasPro ? 'not-allowed' : 'pointer'
                      }}
                      disabled={!hasPro}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                        style={{
                          left: formData.isVIP ? 'calc(100% - 22px)' : '2px'
                        }}
                      />
                    </button>
                    <Crown size={16} style={{ color: formData.isVIP ? 'var(--primary)' : !hasPro ? '#F59E0B' : '#9CA3AF' }} />
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {!hasPro 
                    ? t('wizard.step3.ticketsModal.fields.vip.lockedHelper')
                    : t('wizard.step3.ticketsModal.fields.vip.helper')
                  }
                </p>
              </div>

              {formData.pricingType === 'paid' && (
                <>
                  <div>
                    <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 500, color: '#0B2641' }}
                  >
                    {t('wizard.step3.ticketsModal.fields.currency.label')}
                  </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border outline-none cursor-pointer"
                      style={{ 
                        borderColor: '#E5E7EB',
                        color: '#0B2641',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} {currency.symbol} ({currency.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 500, color: '#0B2641' }}
                  >
                    {t('wizard.step3.ticketsModal.fields.price.label')}
                  </label>
                    <div className="flex items-center gap-3">
                      <span className="text-base" style={{ color: '#0B2641', fontWeight: 500 }}>
                        {CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$'}
                      </span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder={t('wizard.step3.ticketsModal.fields.price.placeholder')}
                        step="0.01"
                        className="flex-1 h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                        style={{ 
                          borderColor: '#E5E7EB',
                          color: '#0B2641',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.isVIP && (
                <div>
                  <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.fields.vipQuantity.label')}
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder={t('wizard.step3.ticketsModal.fields.vipQuantity.placeholder')}
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                  {t('wizard.step3.ticketsModal.fields.vipQuantity.helper')}
                </p>

                  {eventCapacity && formData.quantity > eventCapacity && (
                    <div 
                      className="flex items-start gap-3 p-3 rounded-lg mt-3"
                      style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
                    >
                      <AlertTriangle size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
                      <div>
                        <p className="text-sm" style={{ color: '#0B2641', fontWeight: 600 }}>
                          {t('wizard.step3.ticketsModal.fields.vipQuantity.warningTitle', {
                            quantity: formData.quantity,
                            capacity: eventCapacity
                          })}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                          {t('wizard.step3.ticketsModal.fields.vipQuantity.warningBody')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.fields.salesPeriod.label')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                      {t('wizard.step3.ticketsModal.fields.salesPeriod.start')}
                    </label>
                    <div className="flex items-center gap-2 px-3 h-11 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                      <Calendar size={16} style={{ color: '#6B7280' }} />
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="flex-1 outline-none text-sm"
                        style={{ color: '#0B2641' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                      {t('wizard.step3.ticketsModal.fields.salesPeriod.end')}
                    </label>
                    <div className="flex items-center gap-2 px-3 h-11 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                      <Calendar size={16} style={{ color: '#6B7280' }} />
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="flex-1 outline-none text-sm"
                        style={{ color: '#0B2641' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {formData.pricingType === 'paid' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label 
                      className="block text-sm"
                      style={{ fontWeight: 500, color: '#0B2641' }}
                    >
                      {t('wizard.step3.ticketsModal.fields.earlyBird.label')}
                    </label>
                    <button
                      onClick={() => setFormData({ ...formData, enableEarlyBird: !formData.enableEarlyBird })}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ 
                        backgroundColor: formData.enableEarlyBird ? 'var(--primary)' : '#E5E7EB'
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                        style={{
                          left: formData.enableEarlyBird ? 'calc(100% - 22px)' : '2px'
                        }}
                      />
                    </button>
                  </div>

                  {formData.enableEarlyBird && (
                    <div className="space-y-4 mt-3 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <div>
                        <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                          {t('wizard.step3.ticketsModal.fields.earlyBird.discountLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.earlyBirdDiscount}
                            onChange={(e) => setFormData({ ...formData, earlyBirdDiscount: Number(e.target.value) })}
                            placeholder={t('wizard.step3.ticketsModal.fields.earlyBird.discountPlaceholder')}
                            min="0"
                            max="100"
                            className="flex-1 h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                            style={{ 
                              borderColor: '#E5E7EB',
                              color: '#0B2641',
                              backgroundColor: '#FFFFFF'
                            }}
                          />
                          <span className="text-sm" style={{ color: '#6B7280', fontWeight: 500 }}>
                            %
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                          {t('wizard.step3.ticketsModal.fields.earlyBird.start')}
                        </label>
                          <div className="flex items-center gap-2 px-3 h-11 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                            <Calendar size={16} style={{ color: '#6B7280' }} />
                            <input
                              type="datetime-local"
                              value={formData.earlyBirdStart}
                              onChange={(e) => setFormData({ ...formData, earlyBirdStart: e.target.value })}
                              className="flex-1 outline-none text-sm"
                              style={{ color: '#0B2641' }}
                            />
                          </div>
                        </div>
                        <div>
                        <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                          {t('wizard.step3.ticketsModal.fields.earlyBird.end')}
                        </label>
                          <div className="flex items-center gap-2 px-3 h-11 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                            <Calendar size={16} style={{ color: '#6B7280' }} />
                            <input
                              type="datetime-local"
                              value={formData.earlyBirdEnd}
                              onChange={(e) => setFormData({ ...formData, earlyBirdEnd: e.target.value })}
                              className="flex-1 outline-none text-sm"
                              style={{ color: '#0B2641' }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.ticketsModal.fields.earlyBird.helper')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.ticketsModal.fields.includes.label')}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentInclude}
                    onChange={(e) => setCurrentInclude(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInclude()}
                    placeholder={t('wizard.step3.ticketsModal.fields.includes.placeholder')}
                    className="flex-1 h-10 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#0B2641',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  <button
                    onClick={handleAddInclude}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50"
                    style={{ borderColor: '#E5E7EB', border: '1px solid' }}
                  >
                    <Plus size={18} style={{ color: 'var(--primary)' }} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.includes.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', color: 'var(--primary)' }}
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveInclude(index)}
                        className="transition-colors hover:opacity-70"
                      >
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isBlockedByPlan && (
            <div 
              className="mx-6 mb-4 p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
            >
              <AlertTriangle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>
                  {t('wizard.step3.ticketsModal.proWarning.title')}
                </p>
                <p className="text-xs" style={{ color: '#B45309' }}>
                  {t('wizard.step3.ticketsModal.proWarning.message')}
                </p>
              </div>
            </div>
          )}

          <div 
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <button
              className="text-sm transition-colors hover:underline"
              style={{ color: '#6B7280', fontWeight: 500 }}
            >
              {t('wizard.step3.ticketsModal.actions.saveDraft')}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#0B2641', fontWeight: 600 }}
                disabled={isSaving}
              >
                {t('wizard.common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isBlockedByPlan}
                className="h-11 px-5 rounded-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                style={{ 
                  backgroundColor: isBlockedByPlan ? '#9CA3AF' : 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={18} />
                {isSaving ? 'Saving...' : t('wizard.step3.ticketsModal.actions.addTicket')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}