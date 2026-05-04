import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Tag } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface AgendaBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
  isSaving?: boolean;
}

export default function AgendaBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: AgendaBlockSettingsModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    showSpeakerTags: true
  });

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current && settings) {
      setFormData({
        showSpeakerTags: settings.showSpeakerTags !== false
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
              {t('wizard.designStudio.modals.agendaBlock.title', { defaultValue: 'Program Settings' })}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('wizard.designStudio.modals.agendaBlock.subtitle', { defaultValue: 'Customize how the program section appears' })}
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

          {/* Display Options */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              {t('wizard.designStudio.modals.agendaBlock.sections.displayOptions', { defaultValue: 'Display Options' })}
            </h3>

            {/* Show Speaker Tags Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #F3F4F6'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: formData.showSpeakerTags ? 'rgba(139, 92, 246, 0.1)' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Tag size={18} style={{ color: formData.showSpeakerTags ? '#8B5CF6' : '#9CA3AF' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    {t('wizard.designStudio.modals.agendaBlock.labels.showSpeakerTags', { defaultValue: 'Show speaker role tags' })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {t('wizard.designStudio.modals.agendaBlock.labels.showSpeakerTagsHint', { defaultValue: 'Display tags like Expert, Coach, Trainer next to speaker names' })}
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, showSpeakerTags: !formData.showSpeakerTags })}
                style={{
                  width: '48px',
                  height: '26px',
                  borderRadius: '13px',
                  border: 'none',
                  backgroundColor: formData.showSpeakerTags ? '#0684F5' : '#D1D5DB',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '3px',
                  left: formData.showSpeakerTags ? '25px' : '3px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            {/* Preview hint */}
            {!formData.showSpeakerTags && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: '#FFF7ED',
                borderRadius: '8px',
                border: '1px solid #FED7AA',
                fontSize: '12px',
                color: '#9A3412',
                lineHeight: 1.5
              }}>
                {t('wizard.designStudio.modals.agendaBlock.labels.tagsHiddenNote', { defaultValue: 'Speaker role tags (Expert, Coach, Trainer) will be hidden in the published program section. Speaker types are still saved internally.' })}
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
              {t('wizard.designStudio.modals.agendaBlock.actions.cancel', { defaultValue: 'Cancel' })}
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
              {isSaving
                ? t('wizard.designStudio.modals.agendaBlock.actions.updating', { defaultValue: 'Updating...' })
                : t('wizard.designStudio.modals.agendaBlock.actions.updateSection', { defaultValue: 'Update Section' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
