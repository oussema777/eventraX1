import { X, CheckCircle, Send, Monitor, Smartphone, Bold, Italic, Underline, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  enabled: boolean;
  preview: string;
  timing: string;
  recipients: string;
}

interface EmailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  template: EmailTemplate;
}

export default function EmailEditorModal({ isOpen, onClose, onSave, template }: EmailEditorModalProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [formData, setFormData] = useState({
    subject: 'You\'re Registered for SaaS Summit 2024!',
    previewText: 'Here\'s everything you need to know...',
    fromName: 'SaaS Summit Team',
    replyTo: 'hello@saassummit.com',
    body: `Hi {attendee_name},

Thank you for registering for {event_name}!

Event Details:
📅 Date: {event_date}
📍 Location: San Francisco Convention Center
🎟️ Ticket: {ticket_type}

What's Next:
1. Add the event to your calendar
2. Complete your profile
3. Explore the agenda

We look forward to seeing you!

Best regards,
The SaaS Summit Team`,
    ctaEnabled: true,
    ctaText: 'View Event Details',
    ctaUrl: 'https://eventra.app/events/saas-summit-2024',
    footer: `© 2024 SaaS Summit. All rights reserved.
[Unsubscribe] | [Update Preferences]`
  });

  if (!isOpen) return null;

  const getPreviewWidth = () => {
    return previewDevice === 'mobile' ? '375px' : '600px';
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
          className="w-[900px] rounded-xl overflow-hidden"
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
                  Edit Email Template
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {template.name}
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

          {/* Content - Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Editor Controls (45%) */}
            <div 
              className="w-[45%] overflow-y-auto p-6"
              style={{ borderRight: '1px solid #E5E7EB' }}
            >
              <div className="space-y-6">
                {/* Email Subject */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      Keep it under 50 characters for mobile
                    </p>
                    <span className="text-xs" style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {formData.subject.length}/100
                    </span>
                  </div>
                </div>

                {/* Preview Text */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    Preview Text
                  </label>
                  <input
                    type="text"
                    value={formData.previewText}
                    onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                    Appears in email client preview
                  </p>
                </div>

                {/* From Name */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    From Name
                  </label>
                  <input
                    type="text"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                  />
                </div>

                {/* Reply-To Email */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={formData.replyTo}
                    onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border outline-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    Email Content
                  </label>
                  
                  {/* Toolbar */}
                  <div 
                    className="flex items-center gap-2 p-2 mb-2 rounded-lg"
                    style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                  >
                    <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-200">
                      <Bold size={16} style={{ color: '#6B7280' }} />
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-200">
                      <Italic size={16} style={{ color: '#6B7280' }} />
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-200">
                      <Underline size={16} style={{ color: '#6B7280' }} />
                    </button>
                    <div className="w-px h-6" style={{ backgroundColor: '#E5E7EB' }} />
                    <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-200">
                      <LinkIcon size={16} style={{ color: '#6B7280' }} />
                    </button>
                    <select
                      className="px-2 h-8 rounded text-xs border-0 outline-none cursor-pointer"
                      style={{ backgroundColor: 'transparent', color: '#6B7280' }}
                    >
                      <option>Insert variable</option>
                      <option>{'{ attendee_name }'}</option>
                      <option>{'{ event_name }'}</option>
                      <option>{'{ event_date }'}</option>
                      <option>{'{ ticket_type }'}</option>
                    </select>
                  </div>

                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full h-[300px] p-4 rounded-lg border outline-none resize-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641', fontFamily: 'monospace' }}
                  />
                </div>

                {/* CTA Button */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm" style={{ fontWeight: 500, color: '#0B2641' }}>
                      CTA Button
                    </label>
                    <button
                      onClick={() => setFormData({ ...formData, ctaEnabled: !formData.ctaEnabled })}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ backgroundColor: formData.ctaEnabled ? 'var(--primary)' : '#E5E7EB' }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                        style={{ left: formData.ctaEnabled ? 'calc(100% - 22px)' : '2px' }}
                      />
                    </button>
                  </div>

                  {formData.ctaEnabled && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Button text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border outline-none"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                      <input
                        type="url"
                        placeholder="Button URL"
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border outline-none"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Text */}
                <div>
                  <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                    Email Footer
                  </label>
                  <textarea
                    value={formData.footer}
                    onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                    className="w-full h-20 p-3 rounded-lg border outline-none resize-none"
                    style={{ borderColor: '#E5E7EB', color: '#0B2641', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Live Preview (55%) */}
            <div 
              className="w-[55%] overflow-y-auto p-6"
              style={{ backgroundColor: '#F8F9FA' }}
            >
              {/* Device Toggle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map((device) => {
                  const Icon = device.icon;
                  const isActive = previewDevice === device.id;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setPreviewDevice(device.id as any)}
                      className="flex items-center gap-2 px-4 h-9 rounded-lg transition-colors"
                      style={{
                        backgroundColor: isActive ? 'var(--primary)' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#6B7280',
                        fontWeight: 600
                      }}
                    >
                      <Icon size={16} />
                      {device.label}
                    </button>
                  );
                })}
              </div>

              {/* Email Preview Canvas */}
              <div className="flex justify-center">
                <div 
                  className="rounded-lg overflow-hidden transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    width: getPreviewWidth(),
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Email Header */}
                  <div 
                    className="p-6 text-center"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <h3 className="text-xl" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      SaaS Summit 2024
                    </h3>
                  </div>

                  {/* Email Body */}
                  <div className="p-8">
                    {/* Subject (for preview) */}
                    <h4 className="text-xl mb-4" style={{ fontWeight: 700, color: '#0B2641' }}>
                      {formData.subject}
                    </h4>

                    {/* Body Content */}
                    <div 
                      className="text-sm mb-6 whitespace-pre-line"
                      style={{ color: '#4B5563', lineHeight: '1.6' }}
                    >
                      {formData.body}
                    </div>

                    {/* CTA Button */}
                    {formData.ctaEnabled && (
                      <div className="text-center mb-6">
                        <button
                          className="px-8 h-12 rounded-lg transition-transform hover:scale-105"
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            fontWeight: 700
                          }}
                        >
                          {formData.ctaText}
                        </button>
                      </div>
                    )}

                    {/* Footer */}
                    <div 
                      className="pt-6 text-center text-xs whitespace-pre-line"
                      style={{ 
                        borderTop: '1px solid #E5E7EB',
                        color: '#9CA3AF'
                      }}
                    >
                      {formData.footer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 h-11 rounded-lg transition-colors hover:bg-gray-100">
                <Send size={18} style={{ color: '#6B7280' }} />
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Send Test Email</span>
              </button>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-48 h-11 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#0B2641', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 h-11 px-5 rounded-lg transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={18} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
