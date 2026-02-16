import React, { useState, useEffect } from 'react';
import { X, Code, Palette, Save, AlertCircle, Loader2 } from 'lucide-react';

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
  const [html, setHtml] = useState(settings?.html || '');
  const [css, setCss] = useState(settings?.css || '');
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');

  useEffect(() => {
    if (isOpen) {
      setHtml(settings?.html || '');
      setCss(settings?.css || '');
    }
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
              Custom HTML Block Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Add custom HTML and CSS to your event page.
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
            HTML
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
            CSS
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {activeTab === 'html' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                  HTML Content
                </label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<div class='my-section'>Hello World</div>"
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
                  CSS Styles
                </label>
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  placeholder=".my-section { background: blue; }"
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
                  <p style={{ fontSize: '12px', color: '#9A3412', lineHeight: '1.5' }}>
                    <strong>Note:</strong> Styles are injected globally. Use specific classes to avoid affecting other sections of your event page.
                  </p>
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
              Cancel
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
              {isSaving ? 'Updating...' : 'Update Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
