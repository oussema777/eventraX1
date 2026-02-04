import { X, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { uploadFile } from '../../../utils/storage';
import { toast } from 'sonner';

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
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const path = `uploads/hero_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Use 'profiles' bucket as per existing convention in storage.ts, or generic 'public'
      const publicUrl = await uploadFile('profiles', path, file);
      
      if (publicUrl) {
        setFormData({ ...formData, backgroundImage: publicUrl });
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
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
                  className="relative w-full h-[160px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50 overflow-hidden"
                  style={{ 
                    borderColor: formData.backgroundImage ? 'transparent' : '#E5E7EB', 
                    backgroundColor: formData.backgroundImage ? '#F3F4F6' : '#F9FAFB' 
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file);
                    };
                    input.click();
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                      <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                  ) : formData.backgroundImage ? (
                    <>
                      <img 
                        src={formData.backgroundImage} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={24} className="text-white mb-2" />
                        <span className="text-white text-sm font-medium">Click to replace</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: '#9CA3AF' }} />
                      <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
                        Click to upload or drag image
                      </p>
                    </>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    Recommended: 1920x600px, max 5MB
                  </p>
                  {formData.backgroundImage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, backgroundImage: '' });
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
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
