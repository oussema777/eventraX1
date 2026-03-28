import { useState, useEffect, useRef } from 'react';
import { X, Save, Building2, Plus, Link, Loader2 } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface SponsorsBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
  isSaving?: boolean;
}

export default function SponsorsBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: SponsorsBlockSettingsModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    showBecomeSponsor: false,
    becomeSponsorText: '',
    becomeSponsorUrl: ''
  });

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current && settings) {
      setFormData({
        title: settings.title || '',
        subtitle: settings.subtitle || '',
        showBecomeSponsor: settings.showBecomeSponsor || false,
        becomeSponsorText: settings.becomeSponsorText || '',
        becomeSponsorUrl: settings.becomeSponsorUrl || ''
      });
    }
    prevOpenRef.current = isOpen;
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              {t('wizard.designStudio.modals.sponsorsBlock.title')}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('wizard.designStudio.modals.sponsorsBlock.subtitle')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: '#111827', 
              backgroundColor: '#F3F4F6',
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', overflowY: 'auto' }}>
          
          {/* Header Text */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.sponsorsBlock.sections.sectionHeader')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.sponsorsBlock.labels.mainTitle')}
              </label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '2px solid #E5E7EB', 
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 500,
                  outline: 'none'
                }}
                placeholder={t('wizard.designStudio.modals.sponsorsBlock.placeholders.title')}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.sponsorsBlock.labels.subtitleLabel')}
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '2px solid #E5E7EB', 
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 500,
                  outline: 'none',
                  minHeight: '80px',
                  resize: 'none'
                }}
                placeholder={t('wizard.designStudio.modals.sponsorsBlock.placeholders.subtitle')}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '24px' }} />

          {/* Become a Sponsor CTA */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{t('wizard.designStudio.modals.sponsorsBlock.labels.becomeSponsorButton')}</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.showBecomeSponsor} 
                  onChange={(e) => setFormData({ ...formData, showBecomeSponsor: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#0684F5' }}
                />
                {t('wizard.designStudio.modals.sponsorsBlock.labels.enabled')}
              </label>
            </div>
            
            {formData.showBecomeSponsor && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>{t('wizard.designStudio.modals.sponsorsBlock.labels.buttonText')}</label>
                  <input
                    value={formData.becomeSponsorText}
                    onChange={(e) => setFormData({ ...formData, becomeSponsorText: e.target.value })}
                    placeholder={t('wizard.designStudio.modals.sponsorsBlock.placeholders.buttonText')}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#111827' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>{t('wizard.designStudio.modals.sponsorsBlock.labels.linkUrl')}</label>
                  <input
                    value={formData.becomeSponsorUrl}
                    onChange={(e) => setFormData({ ...formData, becomeSponsorUrl: e.target.value })}
                    placeholder={t('wizard.designStudio.modals.sponsorsBlock.placeholders.linkUrl')}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#111827' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('wizard.designStudio.modals.sponsorsBlock.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: '#0684F5', 
                color: '#FFFFFF', 
                fontSize: '14px', 
                fontWeight: 700, 
                cursor: 'pointer', 
                opacity: isSaving ? 0.7 : 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(6, 132, 245, 0.2)'
              }}
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? t('wizard.designStudio.modals.sponsorsBlock.actions.updating') : t('wizard.designStudio.modals.sponsorsBlock.actions.updateSection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}