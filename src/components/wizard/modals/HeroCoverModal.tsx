import { X, Upload, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface HeroCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HeroCoverData) => void;
  initialData: HeroCoverData;
}

export interface HeroCoverData {
  headline: string;
  tagline: string;
  overlayOpacity: number;
  showButton: boolean;
  buttonText: string;
  backgroundImage?: string;
}

export default function HeroCoverModal({ isOpen, onClose, onSave, initialData }: HeroCoverModalProps) {
  const [formData, setFormData] = useState<HeroCoverData>(initialData);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleRestore = () => {
    setFormData({
      headline: 'SaaS Summit 2024',
      tagline: 'Future of Innovation',
      overlayOpacity: 50,
      showButton: true,
      buttonText: 'Register Now'
    });
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
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)' }}
              >
                <Upload size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 
                className="text-xl"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                Edit Hero Cover
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: '#6B7280' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: 'calc(90vh - 200px)' }}
          >
            <div className="space-y-5">
              {/* Background Image */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Cover Image
                </label>
                <div 
                  className="w-full h-[120px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                >
                  <Upload size={24} style={{ color: '#9CA3AF' }} />
                  <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
                    Click to upload or drag image
                  </p>
                </div>
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                  Recommended: 1920x600px, max 5MB
                </p>
              </div>

              {/* Headline */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Event Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Enter your event title"
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Tagline */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Enter tagline"
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Overlay Opacity */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Image Overlay Opacity ({formData.overlayOpacity}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.overlayOpacity}
                  onChange={(e) => setFormData({ ...formData, overlayOpacity: Number(e.target.value) })}
                  className="w-full"
                />
                <div 
                  className="mt-3 h-12 rounded-lg relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      backgroundColor: '#000000',
                      opacity: formData.overlayOpacity / 100
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm" style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      Preview
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Call-to-Action Button
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setFormData({ ...formData, showButton: !formData.showButton })}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: formData.showButton ? 'var(--primary)' : '#E5E7EB'
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                      style={{
                        left: formData.showButton ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    Show Register Button
                  </span>
                </div>
                {formData.showButton && (
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Button text"
                    className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#0B2641',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <button
              onClick={handleRestore}
              className="text-sm transition-colors hover:underline"
              style={{ color: '#6B7280', fontWeight: 500 }}
            >
              Restore Default
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#0B2641', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-11 px-5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
