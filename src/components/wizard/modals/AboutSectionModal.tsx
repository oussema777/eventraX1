import { X, AlignLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface AboutSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AboutSectionData) => void;
  initialData: AboutSectionData;
}

export interface AboutSectionData {
  title: string;
  description: string;
  backgroundColor: 'white' | 'light-gray' | 'custom';
  customColor?: string;
  textAlign: 'left' | 'center' | 'right';
}

export default function AboutSectionModal({ isOpen, onClose, onSave, initialData }: AboutSectionModalProps) {
  const [formData, setFormData] = useState<AboutSectionData>(initialData);
  const [charCount, setCharCount] = useState(initialData.description.length);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleRestore = () => {
    const defaultData = {
      title: 'About This Event',
      description: '',
      backgroundColor: 'white' as const,
      textAlign: 'center' as const
    };
    setFormData(defaultData);
    setCharCount(0);
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length <= 1000) {
      setFormData({ ...formData, description: value });
      setCharCount(value.length);
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
                <AlignLeft size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 
                className="text-xl"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                Edit About Section
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
              {/* Section Title */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Section Heading
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section heading"
                  className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label 
                  className="block text-sm mb-2"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Event Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Tell attendees about your event..."
                  className="w-full h-[200px] p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#0B2641',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <div className="flex justify-end mt-2">
                  <span 
                    className="text-xs"
                    style={{ color: charCount > 900 ? '#EF4444' : '#9CA3AF' }}
                  >
                    {charCount}/1000
                  </span>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Section Background
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'white', label: 'White', color: '#FFFFFF' },
                    { value: 'light-gray', label: 'Light Gray', color: '#F3F4F6' },
                    { value: 'custom', label: 'Custom Color', color: formData.customColor || '#E0F2FE' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, backgroundColor: option.value as any })}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-blue-400"
                      style={{
                        borderColor: formData.backgroundColor === option.value ? 'var(--primary)' : '#E5E7EB',
                        backgroundColor: formData.backgroundColor === option.value ? 'rgba(6, 132, 245, 0.05)' : 'transparent'
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          borderColor: formData.backgroundColor === option.value ? 'var(--primary)' : '#D1D5DB'
                        }}
                      >
                        {formData.backgroundColor === option.value && (
                          <div 
                            className="w-full h-full rounded-full scale-50"
                            style={{ backgroundColor: 'var(--primary)' }}
                          />
                        )}
                      </div>
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ 
                          backgroundColor: option.color,
                          borderColor: '#E5E7EB'
                        }}
                      />
                      <span 
                        className="text-sm"
                        style={{ 
                          color: '#0B2641',
                          fontWeight: formData.backgroundColor === option.value ? 600 : 400
                        }}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                {formData.backgroundColor === 'custom' && (
                  <input
                    type="color"
                    value={formData.customColor || '#E0F2FE'}
                    onChange={(e) => setFormData({ ...formData, customColor: e.target.value })}
                    className="w-full h-10 mt-3 rounded-lg cursor-pointer"
                  />
                )}
              </div>

              {/* Text Alignment */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setFormData({ ...formData, textAlign: align.value as any })}
                      className="flex-1 h-10 rounded-lg border transition-all hover:border-blue-400"
                      style={{
                        borderColor: formData.textAlign === align.value ? 'var(--primary)' : '#E5E7EB',
                        backgroundColor: formData.textAlign === align.value ? 'var(--primary)' : 'transparent',
                        color: formData.textAlign === align.value ? '#FFFFFF' : '#0B2641',
                        fontWeight: formData.textAlign === align.value ? 600 : 400
                      }}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
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
