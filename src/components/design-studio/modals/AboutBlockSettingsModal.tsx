import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { uploadEventAsset } from '../../../utils/storage';
import { toast } from 'sonner';

interface AboutBlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    name?: string;
    tagline?: string;
    description?: string;
    features?: string[];
    image?: string;
  };
  onSave: (data: { name: string; tagline: string; description: string; features: string[]; image?: string }) => Promise<void>;
  isSaving?: boolean;
}

export default function AboutBlockSettingsModal({
  isOpen,
  onClose,
  eventData,
  onSave,
  isSaving = false
}: AboutBlockSettingsModalProps) {
  const { eventId } = useParams();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(eventData.name || '');
  const [tagline, setTagline] = useState(eventData.tagline || '');
  const [description, setDescription] = useState(eventData.description || '');
  const [features, setFeatures] = useState<string[]>(eventData.features || []);
  const [image, setImage] = useState(eventData.image || '');
  const [newFeature, setNewFeature] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(eventData.name || '');
      setTagline(eventData.tagline || '');
      setDescription(eventData.description || '');
      setFeatures(eventData.features || []);
      setImage(eventData.image || '');
    }
  }, [isOpen, eventData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!eventId) {
      toast.error('Event ID is missing. Please save the event first.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadEventAsset(eventId, file);
      if (url) {
        setImage(url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name, tagline, description, features, image });
    onClose();
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              About Section Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Personalize the content displayed in this section.
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Section Image
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="dark-placeholder"
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '2px solid #E5E7EB', 
                  fontSize: '15px',
                  color: '#111827',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="https://example.com/image.jpg"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  padding: '0 16px',
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '50px'
                }}
                title="Upload Image"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              </button>
            </div>
            {image && (
              <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB', height: '100px', width: '100%', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={image} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Section Headline
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark-placeholder"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px solid #E5E7EB', 
                fontSize: '15px',
                color: '#111827',
                fontWeight: 500,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              placeholder="Enter a catchy title for this section"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Brief Summary
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
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
              onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              placeholder="A short sentence summarizing the event"
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Main Information
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark-placeholder"
              style={{ 
                width: '100%', 
                minHeight: '140px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px solid #E5E7EB', 
                fontSize: '15px',
                color: '#111827',
                fontWeight: 500,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              placeholder="Tell your attendees exactly what this event is about"
            />
          </div>

          {/* Key Features Section */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Key Highlights / Takeaways
            </label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                className="dark-placeholder"
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '2px solid #E5E7EB', 
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
                placeholder="Add a bullet point..."
              />
              <button
                type="button"
                onClick={handleAddFeature}
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
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map((feature, idx) => (
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
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
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
              {features.length === 0 && (
                <div style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  No highlights added yet.
                </div>
              )}
            </div>
          </div>

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
