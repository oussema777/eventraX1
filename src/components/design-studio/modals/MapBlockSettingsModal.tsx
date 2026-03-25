import { useState, useEffect } from 'react';
import { X, Save, MapPin, Loader2, Navigation, Info } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface MapBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
  isSaving?: boolean;
}

export default function MapBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: MapBlockSettingsModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    venueName: '',
    address: '',
    googleMapsEmbedUrl: '',
    showInfoCard: true
  });

  useEffect(() => {
    if (settings && isOpen) {
      setFormData({
        title: settings.title || '',
        subtitle: settings.subtitle || '',
        venueName: settings.venueName || '',
        address: settings.address || '',
        googleMapsEmbedUrl: settings.googleMapsEmbedUrl || '',
        showInfoCard: settings.showInfoCard !== false
      });
    }
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
              {t('wizard.designStudio.modals.mapBlock.title')}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('wizard.designStudio.modals.mapBlock.subtitle')}
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
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.mapBlock.sections.sectionHeader')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.mapBlock.labels.mainTitle')}
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
                placeholder={t('wizard.designStudio.modals.mapBlock.placeholders.title')}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '24px' }} />

          {/* Venue Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.mapBlock.sections.venueDetails')}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.mapBlock.labels.venueName')}
              </label>
              <input
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
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
                placeholder={t('wizard.designStudio.modals.mapBlock.placeholders.venueName')}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.mapBlock.labels.fullAddress')}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                placeholder={t('wizard.designStudio.modals.mapBlock.placeholders.address')}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#F3F4F6', marginBottom: '24px' }} />

          {/* Map Embed */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{t('wizard.designStudio.modals.mapBlock.sections.interactiveMap')}</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t('wizard.designStudio.modals.mapBlock.labels.googleMapsEmbedUrl')}
              </label>
              <div style={{ position: 'relative' }}>
                <Navigation size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  value={formData.googleMapsEmbedUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsEmbedUrl: e.target.value })}
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
                  placeholder={t('wizard.designStudio.modals.mapBlock.placeholders.embedUrl')}
                />
              </div>
            </div>
            
            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE', display: 'flex', gap: '10px' }}>
              <Info size={16} style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: '#1E40AF', lineHeight: '1.5' }} dangerouslySetInnerHTML={{__html: t('wizard.designStudio.modals.mapBlock.labels.mapHint')}} />
            </div>
          </div>

          {/* Display Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Info size={18} style={{ color: '#6B7280' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{t('wizard.designStudio.modals.mapBlock.labels.displayInfoCard')}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{t('wizard.designStudio.modals.mapBlock.labels.infoCardDesc')}</div>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={formData.showInfoCard} 
              onChange={(e) => setFormData({ ...formData, showInfoCard: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#0684F5', cursor: 'pointer' }}
            />
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
              {t('wizard.designStudio.modals.mapBlock.actions.cancel')}
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
              {isSaving ? t('wizard.designStudio.modals.mapBlock.actions.updating') : t('wizard.designStudio.modals.mapBlock.actions.updateSection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}