import { X, CheckCircle, Calendar, Upload } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';

interface CampaignCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CampaignData) => void;
}

export interface CampaignData {
  name: string;
  template: string;
  recipients: 'all' | 'specific' | 'custom';
  ticketTypes?: string[];
  schedule: 'immediate' | 'scheduled';
  scheduleDate?: string;
  scheduleTime?: string;
  abTesting: boolean;
  subjectA?: string;
  subjectB?: string;
}

export default function CampaignCreatorModal({ isOpen, onClose, onSave }: CampaignCreatorModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<CampaignData>({
    name: '',
    template: '',
    recipients: 'all',
    schedule: 'scheduled',
    abTesting: false
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(11, 38, 65, 0.7)' }}
        onClick={onClose}
      >
        {/* Modal */}
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
          {/* Header */}
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
                  {t('wizard.step3.marketingTools.modals.campaignCreator.title')}
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t('wizard.step3.marketingTools.modals.campaignCreator.subtitle')}
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

          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.marketingTools.modals.campaignCreator.labels.campaignName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('wizard.step3.marketingTools.modals.campaignCreator.placeholders.campaignName')}
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Email Template */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.marketingTools.modals.campaignCreator.labels.emailTemplate')} *
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border outline-none cursor-pointer transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">{t('wizard.step3.marketingTools.modals.campaignCreator.templates.select')}</option>
                  <option value="confirmation">{t('wizard.step3.marketingTools.modals.campaignCreator.templates.confirmation')}</option>
                  <option value="reminder">{t('wizard.step3.marketingTools.modals.campaignCreator.templates.reminder')}</option>
                  <option value="custom">{t('wizard.step3.marketingTools.modals.campaignCreator.templates.custom')}</option>
                </select>
                <button 
                  className="text-xs mt-2 transition-colors hover:underline"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  {t('wizard.step3.marketingTools.modals.campaignCreator.templates.createNew')}
                </button>
              </div>

              {/* Recipients */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.marketingTools.modals.campaignCreator.labels.sendTo')}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: t('wizard.step3.marketingTools.modals.campaignCreator.recipients.all') },
                    { value: 'specific', label: t('wizard.step3.marketingTools.modals.campaignCreator.recipients.specific') },
                    { value: 'custom', label: t('wizard.step3.marketingTools.modals.campaignCreator.recipients.custom') }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, recipients: option.value as any })}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-blue-400"
                      style={{
                        borderColor: formData.recipients === option.value ? 'var(--primary)' : '#E5E7EB',
                        backgroundColor: formData.recipients === option.value ? 'rgba(6, 132, 245, 0.05)' : 'transparent'
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: formData.recipients === option.value ? 'var(--primary)' : '#D1D5DB'
                        }}
                      >
                        {formData.recipients === option.value && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: 'var(--primary)' }}
                          />
                        )}
                      </div>
                      <span 
                        className="text-sm"
                        style={{ 
                          color: '#0B2641',
                          fontWeight: formData.recipients === option.value ? 600 : 400
                        }}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Show ticket types if specific selected */}
                {formData.recipients === 'specific' && (
                  <div className="mt-3 space-y-2">
                    {['General Admission', 'VIP Pass', 'Early Bird'].map((ticket) => (
                      <label key={ticket} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded"
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span className="text-sm" style={{ color: '#0B2641' }}>{ticket}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Show file upload if custom selected */}
                {formData.recipients === 'custom' && (
                  <div 
                    className="mt-3 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                    <p className="text-sm mb-1" style={{ color: '#0B2641', fontWeight: 500 }}>
                      {t('wizard.step3.marketingTools.modals.campaignCreator.upload.title')}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {t('wizard.step3.marketingTools.modals.campaignCreator.upload.hint')}
                    </p>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  {t('wizard.step3.marketingTools.modals.campaignCreator.labels.sendTime')}
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'immediate', label: t('wizard.step3.marketingTools.modals.campaignCreator.schedule.immediate') },
                    { value: 'scheduled', label: t('wizard.step3.marketingTools.modals.campaignCreator.schedule.scheduled') }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, schedule: option.value as any })}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-blue-400"
                      style={{
                        borderColor: formData.schedule === option.value ? 'var(--primary)' : '#E5E7EB',
                        backgroundColor: formData.schedule === option.value ? 'rgba(6, 132, 245, 0.05)' : 'transparent'
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: formData.schedule === option.value ? 'var(--primary)' : '#D1D5DB'
                        }}
                      >
                        {formData.schedule === option.value && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: 'var(--primary)' }}
                          />
                        )}
                      </div>
                      <span 
                        className="text-sm"
                        style={{ 
                          color: '#0B2641',
                          fontWeight: formData.schedule === option.value ? 600 : 400
                        }}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Show date/time pickers if scheduled */}
                {formData.schedule === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.marketingTools.modals.campaignCreator.labels.date')}
                      </label>
                      <div className="flex items-center gap-2 px-3 h-11 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                        <Calendar size={16} style={{ color: '#6B7280' }} />
                        <input
                          type="date"
                          value={formData.scheduleDate || ''}
                          onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                          className="flex-1 outline-none text-sm"
                          style={{ color: '#0B2641' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.marketingTools.modals.campaignCreator.labels.time')}
                      </label>
                      <input
                        type="time"
                        value={formData.scheduleTime || ''}
                        onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                        className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                  </div>
                )}

                {formData.schedule === 'scheduled' && (
                  <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                    {t('wizard.step3.marketingTools.modals.campaignCreator.schedule.timezone')}
                  </p>
                )}
              </div>

              {/* A/B Testing (PRO) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label 
                      className="block text-sm"
                      style={{ fontWeight: 500, color: '#0B2641' }}
                    >
                      {t('wizard.step3.marketingTools.modals.campaignCreator.labels.abTesting')}
                    </label>
                    <span 
                      className="inline-block mt-1 px-2 py-0.5 rounded text-xs"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700
                      }}
                    >
                      {t('wizard.step3.marketingTools.modals.campaignCreator.abTest.pro')}
                    </span>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, abTesting: !formData.abTesting })}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: formData.abTesting ? 'var(--primary)' : '#E5E7EB'
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{
                        left: formData.abTesting ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                </div>

                {formData.abTesting && (
                  <div className="space-y-3">
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {t('wizard.step3.marketingTools.modals.campaignCreator.abTest.description')}
                    </p>
                    <div>
                      <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.marketingTools.modals.campaignCreator.labels.subjectLineA')}
                      </label>
                      <input
                        type="text"
                        value={formData.subjectA || ''}
                        onChange={(e) => setFormData({ ...formData, subjectA: e.target.value })}
                        placeholder={t('wizard.step3.marketingTools.modals.campaignCreator.placeholders.subjectA')}
                        className="w-full h-10 px-4 rounded-lg border outline-none"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.marketingTools.modals.campaignCreator.labels.subjectLineB')}
                      </label>
                      <input
                        type="text"
                        value={formData.subjectB || ''}
                        onChange={(e) => setFormData({ ...formData, subjectB: e.target.value })}
                        placeholder={t('wizard.step3.marketingTools.modals.campaignCreator.placeholders.subjectB')}
                        className="w-full h-10 px-4 rounded-lg border outline-none"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <button
              className="text-sm transition-colors hover:underline"
              style={{ color: '#6B7280', fontWeight: 500 }}
            >
              {t('wizard.step3.marketingTools.modals.campaignCreator.actions.saveDraft')}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#0B2641', fontWeight: 600 }}
              >
                {t('wizard.step3.marketingTools.modals.campaignCreator.actions.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="h-11 px-5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={18} />
                {formData.schedule === 'immediate' ? t('wizard.step3.marketingTools.modals.campaignCreator.actions.sendNow') : t('wizard.step3.marketingTools.modals.campaignCreator.actions.scheduleCampaign')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
