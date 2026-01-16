import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, Link as LinkIcon, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface FooterBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    copyrightText?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialUrls?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
    quickLinks?: Array<{ label: string; url: string }>;
  };
  onSave: (settings: any) => Promise<void>;
  isSaving?: boolean;
}

export default function FooterBlockSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false
}: FooterBlockSettingsModalProps) {
  const { t } = useI18n();
  const [copyrightText, setCopyrightText] = useState(settings.copyrightText || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
  const [socialUrls, setSocialUrls] = useState(settings.socialUrls || {});
  const [quickLinks, setQuickLinks] = useState(settings.quickLinks || []);
  
  // New link state
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCopyrightText(settings.copyrightText || '');
      setContactEmail(settings.contactEmail || '');
      setContactPhone(settings.contactPhone || '');
      setSocialUrls(settings.socialUrls || {});
      setQuickLinks(settings.quickLinks || []);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      copyrightText,
      contactEmail,
      contactPhone,
      socialUrls,
      quickLinks
    });
    onClose();
  };

  const handleAddLink = () => {
    if (newLinkLabel.trim()) {
      setQuickLinks([...quickLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() || '#' }]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              Footer Configuration
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Update the contact information and links shown at the bottom of your page.
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

        <form onSubmit={handleSubmit} style={{ padding: '28px', overflowY: 'auto' }}>
          
          {/* General Info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Contact Details & Copyright
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Copyright Notice
              </label>
              <input
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="dark-placeholder"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="e.g. © 2024 Eventra. All rights reserved."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Support Email
                </label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="dark-placeholder"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="contact@your-event.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Contact Number
                </label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="dark-placeholder"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Social Media Links
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Facebook size={20} className="text-blue-600" />
                <input
                  value={socialUrls.facebook || ''}
                  onChange={(e) => setSocialUrls({ ...socialUrls, facebook: e.target.value })}
                  className="dark-placeholder"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="Link to Facebook profile"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Twitter size={20} className="text-sky-500" />
                <input
                  value={socialUrls.twitter || ''}
                  onChange={(e) => setSocialUrls({ ...socialUrls, twitter: e.target.value })}
                  className="dark-placeholder"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="Link to Twitter / X profile"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Linkedin size={20} className="text-blue-700" />
                <input
                  value={socialUrls.linkedin || ''}
                  onChange={(e) => setSocialUrls({ ...socialUrls, linkedin: e.target.value })}
                  className="dark-placeholder"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="Link to LinkedIn profile"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Instagram size={20} className="text-pink-600" />
                <input
                  value={socialUrls.instagram || ''}
                  onChange={(e) => setSocialUrls({ ...socialUrls, instagram: e.target.value })}
                  className="dark-placeholder"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  placeholder="Link to Instagram profile"
                />
              </div>
            </div>
          </div>

          {/* Useful Links */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
              External Navigation Links
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="dark-placeholder"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="Label (e.g. Terms of Use)"
              />
              <input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="dark-placeholder"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', color: '#111827', fontWeight: 500, outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="URL (https://...)"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
              />
              <button
                type="button"
                onClick={handleAddLink}
                style={{
                  padding: '0 16px',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickLinks.map((link, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <LinkIcon size={14} className="text-gray-400" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{link.label}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{link.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    style={{
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {quickLinks.length === 0 && (
                <div style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  No custom links added yet.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
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
              {isSaving ? 'Updating...' : 'Update Footer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
