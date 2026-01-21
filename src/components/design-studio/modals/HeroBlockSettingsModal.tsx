import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface HeroBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: {
    title?: string;
    subtitle?: string;
    button1?: { text: string; url: string; visible: boolean };
    button2?: { text: string; url: string; visible: boolean };
  };
  onSave: (data: any) => Promise<void>;
  isSaving?: boolean;
}

export default function HeroBlockSettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  isSaving = false
}: HeroBlockSettingsModalProps) {
  const [title, setTitle] = useState(currentSettings.title || '');
  const [subtitle, setSubtitle] = useState(currentSettings.subtitle || '');
  
  const [btn1Text, setBtn1Text] = useState(currentSettings.button1?.text || 'Register Now');
  const [btn1Url, setBtn1Url] = useState(currentSettings.button1?.url || '#register');
  const [btn1Visible, setBtn1Visible] = useState(currentSettings.button1?.visible !== false);

  const [btn2Text, setBtn2Text] = useState(currentSettings.button2?.text || 'Learn More');
  const [btn2Url, setBtn2Url] = useState(currentSettings.button2?.url || '#details');
  const [btn2Visible, setBtn2Visible] = useState(currentSettings.button2?.visible !== false);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentSettings.title || '');
      setSubtitle(currentSettings.subtitle || '');
      setBtn1Text(currentSettings.button1?.text || 'Register Now');
      setBtn1Url(currentSettings.button1?.url || '#register');
      setBtn1Visible(currentSettings.button1?.visible !== false);
      setBtn2Text(currentSettings.button2?.text || 'Learn More');
      setBtn2Url(currentSettings.button2?.url || '#details');
      setBtn2Visible(currentSettings.button2?.visible !== false);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title,
      subtitle,
      button1: { text: btn1Text, url: btn1Url, visible: btn1Visible },
      button2: { text: btn2Text, url: btn2Url, visible: btn2Visible }
    });
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
      <style>{`
        .dark-placeholder::placeholder {
          color: #4B5563 !important;
          opacity: 1 !important;
        }
      `}</style>
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
              Hero Section Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Customize the main banner of your event page.
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
          
          {/* Text Content */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Text Content</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Event Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="dark-placeholder"
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
                placeholder="Defaults to event name"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Tagline / Subtitle
              </label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="dark-placeholder"
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
                placeholder="Defaults to event tagline"
              />
            </div>
          </div>

          {/* Primary Button */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Primary Button</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={btn1Visible} 
                  onChange={(e) => setBtn1Visible(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0684F5' }}
                />
                Visible
              </label>
            </div>
            
            {btn1Visible && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Text</label>
                  <input
                    value={btn1Text}
                    onChange={(e) => setBtn1Text(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#111827' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Action (Locked)</label>
                  <input
                    value="Registration Page"
                    disabled
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '14px', color: '#9CA3AF', backgroundColor: '#F3F4F6', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Button */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Secondary Button</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={btn2Visible} 
                  onChange={(e) => setBtn2Visible(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0684F5' }}
                />
                Visible
              </label>
            </div>
            
            {btn2Visible && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Text</label>
                  <input
                    value={btn2Text}
                    onChange={(e) => setBtn2Text(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#111827' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Link / Action</label>
                  <input
                    value={btn2Url}
                    onChange={(e) => setBtn2Url(e.target.value)}
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
