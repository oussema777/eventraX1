import React, { useState, useEffect, useRef } from 'react';
import { X, Code, Palette, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface CustomHTMLBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: {
    html?: string;
    css?: string;
  };
  onSave: (settings: { html: string; css: string }) => void;
  isSaving?: boolean;
}

export default function CustomHTMLBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: CustomHTMLBlockSettingsModalProps) {
  const { t } = useI18n();
  const [html, setHtml] = useState(settings?.html || '');
  const [css, setCss] = useState(settings?.css || '');
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setHtml(settings?.html || '');
      setCss(settings?.css || '');
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ html, css });
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
          maxWidth: '600px',
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
              {t('wizard.designStudio.modals.customHtmlBlock.title')}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {t('wizard.designStudio.modals.customHtmlBlock.subtitle')}
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

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 28px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
          <button
            onClick={() => setActiveTab('html')}
            style={{
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'html' ? '3px solid #0684F5' : '3px solid transparent',
              color: activeTab === 'html' ? '#0684F5' : '#6B7280',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Code size={16} />
            {t('wizard.designStudio.modals.customHtmlBlock.tabs.html')}
          </button>
          <button
            onClick={() => setActiveTab('css')}
            style={{
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'css' ? '3px solid #0684F5' : '3px solid transparent',
              color: activeTab === 'css' ? '#0684F5' : '#6B7280',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Palette size={16} />
            {t('wizard.designStudio.modals.customHtmlBlock.tabs.css')}
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {activeTab === 'html' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                  {t('wizard.designStudio.modals.customHtmlBlock.labels.htmlContent')}
                </label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder={t('wizard.designStudio.modals.customHtmlBlock.placeholders.html')}
                  spellCheck={false}
                  style={{ 
                    flex: 1,
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '2px solid #E5E7EB', 
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                  {t('wizard.designStudio.modals.customHtmlBlock.labels.cssStyles')}
                </label>
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  placeholder={t('wizard.designStudio.modals.customHtmlBlock.placeholders.css')}
                  spellCheck={false}
                  style={{ 
                    flex: 1,
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '2px solid #E5E7EB', 
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FFF7ED', borderRadius: '10px', border: '1px solid #FFEDD5', display: 'flex', gap: '10px' }}>
                  <AlertCircle size={18} style={{ color: '#F97316', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#9A3412', lineHeight: '1.5' }} dangerouslySetInnerHTML={{__html: t('wizard.designStudio.modals.customHtmlBlock.cssWarning')}} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              {t('wizard.designStudio.modals.customHtmlBlock.actions.cancel')}
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
              {isSaving ? t('wizard.designStudio.modals.customHtmlBlock.actions.updating') : t('wizard.designStudio.modals.customHtmlBlock.actions.updateSection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
