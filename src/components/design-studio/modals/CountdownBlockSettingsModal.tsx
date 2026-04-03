import { useState, useEffect, useRef } from 'react';
import { X, Save, Timer, Loader2, Link, Calendar } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import DOMPurify from 'dompurify';

interface CountdownBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
  isSaving?: boolean;
}

export default function CountdownBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: CountdownBlockSettingsModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonUrl: ''
  });

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current && settings) {
      setFormData({
        title: settings.title || '',
        subtitle: settings.subtitle || '',
        buttonText: settings.buttonText || '',
        buttonUrl: settings.buttonUrl || ''
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
              {t('wizard.designStudio.modals.countdownBlock.title')}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('wizard.designStudio.modals.countdownBlock.subtitle')}
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
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.countdownBlock.sections.sectionHeader')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.countdownBlock.labels.mainTitle')}
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
                placeholder={t('wizard.designStudio.modals.countdownBlock.placeholders.title')}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.countdownBlock.labels.subtitleLabel')}
              </label>
              <input
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
                  outline: 'none'
                }}
                placeholder={t('wizard.designStudio.modals.countdownBlock.placeholders.subtitle')}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '24px' }} />

          {/* Button Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.countdownBlock.sections.callToAction')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.countdownBlock.labels.buttonText')}
              </label>
              <input
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
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
                placeholder={t('wizard.designStudio.modals.countdownBlock.placeholders.buttonText')}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.countdownBlock.labels.buttonLink')}
              </label>
              <div style={{ position: 'relative' }}>
                <Link size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  value={formData.buttonUrl}
                  onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '8px',
                    border: '2px solid #E5E7EB',
                    fontSize: '14px',
                    color: '#111827',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                  placeholder={t('wizard.designStudio.modals.countdownBlock.placeholders.buttonLink')}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <Calendar size={20} style={{ color: '#0284C7', shrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#0369A1', lineHeight: '1.5' }} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(t('wizard.designStudio.modals.countdownBlock.autoSync'))}} />
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
              {t('wizard.designStudio.modals.countdownBlock.actions.cancel')}
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
              {isSaving ? t('wizard.designStudio.modals.countdownBlock.actions.updating') : t('wizard.designStudio.modals.countdownBlock.actions.updateSection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}