import { X, CheckCircle, ChevronDown, Share2 } from 'lucide-react';
import { useState } from 'react';

interface CustomLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; sourceTag: string; platform: string }) => void;
  baseUrl: string;
}

export default function CustomLinkModal({ isOpen, onClose, onSave, baseUrl }: CustomLinkModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sourceTag: '',
    selectedIcon: 'facebook'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
    { id: 'twitter', name: 'Twitter', color: '#000000' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', color: '#000000' },
    { id: 'email', name: 'Email', color: '#F59E0B' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' },
    { id: 'google', name: 'Google', color: '#4285F4' },
    { id: 'reddit', name: 'Reddit', color: '#FF4500' },
    { id: 'pinterest', name: 'Pinterest', color: '#E60023' },
    { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
    { id: 'telegram', name: 'Telegram', color: '#0088CC' }
  ];

  if (!isOpen) return null;

  const generateLivePreview = () => {
    const tag = formData.sourceTag || 'example-source';
    const safeBaseUrl = baseUrl || 'https://eventra.app';
    const separator = safeBaseUrl.includes('?') ? '&' : '?';
    return `${safeBaseUrl}${separator}ref=${tag}`;
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
          className="w-[600px] rounded-xl overflow-hidden"
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
                  className="text-xl mb-1"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  Create Custom Tracking Link
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Track registrations from specific sources
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

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >
            <div className="space-y-6">
              {/* Link Name */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Link Name (Internal)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Facebook Ads Campaign"
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Only you will see this name
                </p>
              </div>

              {/* Source Tag */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Source Tag (ref parameter)
                </label>
                <input
                  type="text"
                  value={formData.sourceTag}
                  onChange={(e) => setFormData({ ...formData, sourceTag: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="e.g., facebook-ads-dec"
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  Use lowercase and hyphens only
                </p>
                
                {/* Live Preview */}
                <div 
                  className="mt-3 p-3 rounded-md"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#6B7280', fontWeight: 500 }}>
                    Live Preview:
                  </p>
                  <code 
                    className="text-xs"
                    style={{ color: 'var(--primary)', fontFamily: 'monospace' }}
                  >
                    {generateLivePreview()}
                  </code>
                </div>
              </div>

              {/* Platform Icon */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Platform Icon (Optional)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setFormData({ ...formData, selectedIcon: platform.id })}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-blue-400"
                      style={{
                        borderColor: formData.selectedIcon === platform.id ? 'var(--primary)' : '#E5E7EB',
                        backgroundColor: formData.selectedIcon === platform.id ? 'rgba(6, 132, 245, 0.05)' : '#FFFFFF'
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: platform.color }}
                      >
                        <Share2 size={16} style={{ color: '#FFFFFF' }} />
                      </div>
                      <span 
                        className="text-xs text-center"
                        style={{ 
                          color: '#0B2641',
                          fontWeight: formData.selectedIcon === platform.id ? 600 : 400
                        }}
                      >
                        {platform.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UTM Parameters */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-blue-600"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  Advanced UTM Tracking
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#6B7280', fontWeight: 500 }}>
                        UTM Source
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., facebook"
                        className="w-full h-9 px-3 rounded-lg border outline-none text-sm"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#6B7280', fontWeight: 500 }}>
                        UTM Medium
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., paid-social"
                        className="w-full h-9 px-3 rounded-lg border outline-none text-sm"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#6B7280', fontWeight: 500 }}>
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., december-promo"
                        className="w-full h-9 px-3 rounded-lg border outline-none text-sm"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      Optional - for Google Analytics integration
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-end gap-3 p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <button
              onClick={onClose}
              className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: '#0B2641', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({
                name: formData.name.trim(),
                sourceTag: formData.sourceTag.trim(),
                platform: formData.selectedIcon
              })}
              className="flex items-center gap-2 h-11 px-5 rounded-lg transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <CheckCircle size={18} />
              Create Link
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
