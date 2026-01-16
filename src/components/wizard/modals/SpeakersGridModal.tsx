import { X, Users, CheckCircle, Lock, Crown, ChevronDown, ChevronUp, Plus, Upload } from 'lucide-react';
import { useState } from 'react';

interface SpeakersGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SpeakersGridData) => void;
  initialData: SpeakersGridData;
  hasPro: boolean;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  photo?: string;
}

export interface SpeakersGridData {
  speakerCount: number;
  layout: '2-cols' | '3-cols' | '4-cols';
  speakers: Speaker[];
}

export default function SpeakersGridModal({ isOpen, onClose, onSave, initialData, hasPro }: SpeakersGridModalProps) {
  const [formData, setFormData] = useState<SpeakersGridData>(initialData);
  const [expandedSpeaker, setExpandedSpeaker] = useState<string | null>(initialData.speakers[0]?.id || null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleAddSpeaker = () => {
    const newSpeaker: Speaker = {
      id: `speaker-${Date.now()}`,
      name: '',
      title: '',
      company: '',
      bio: ''
    };
    setFormData({
      ...formData,
      speakers: [...formData.speakers, newSpeaker],
      speakerCount: formData.speakerCount + 1
    });
    setExpandedSpeaker(newSpeaker.id);
  };

  const handleUpdateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleRemoveSpeaker = (id: string) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter(s => s.id !== id),
      speakerCount: formData.speakerCount - 1
    });
  };

  // If user doesn't have PRO, show upgrade card
  if (!hasPro) {
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
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
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
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                >
                  <Users size={20} style={{ color: '#F59E0B' }} />
                </div>
                <h2 
                  className="text-xl"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  Edit Speakers Grid
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

            {/* Upgrade Content */}
            <div className="p-12 text-center">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                }}
              >
                <Lock size={32} style={{ color: '#FFFFFF' }} />
              </div>
              <h3 
                className="text-2xl mb-3"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                Upgrade to Edit Speakers
              </h3>
              <p 
                className="text-base mb-8 max-w-md mx-auto"
                style={{ color: '#6B7280' }}
              >
                Add and showcase event speakers with Pro. Create professional speaker profiles with photos, bios, and social links.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  className="h-12 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  <Crown size={20} />
                  Upgrade to Pro
                </button>
                <button
                  className="text-sm transition-colors hover:underline"
                  style={{ color: 'var(--primary)', fontWeight: 500 }}
                >
                  Learn More About Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // PRO user - show full editing form
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
                <Users size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 
                className="text-xl"
                style={{ fontWeight: 600, color: '#0B2641' }}
              >
                Edit Speakers Grid
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
              {/* Number of Speakers & Layout */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 500, color: '#0B2641' }}
                  >
                    Number of Speakers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.speakerCount}
                    onChange={(e) => setFormData({ ...formData, speakerCount: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#0B2641',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontWeight: 500, color: '#0B2641' }}
                  >
                    Layout
                  </label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value as any })}
                    className="w-full h-11 px-4 rounded-lg border outline-none cursor-pointer transition-colors focus:border-blue-400"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#0B2641',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="2-cols">Grid (2 columns)</option>
                    <option value="3-cols">Grid (3 columns)</option>
                    <option value="4-cols">Grid (4 columns)</option>
                  </select>
                </div>
              </div>

              {/* Speaker Cards */}
              <div>
                <label 
                  className="block text-sm mb-3"
                  style={{ fontWeight: 500, color: '#0B2641' }}
                >
                  Speakers ({formData.speakers.length})
                </label>
                <div className="space-y-2">
                  {formData.speakers.map((speaker, index) => (
                    <div 
                      key={speaker.id}
                      className="border rounded-lg overflow-hidden"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedSpeaker(expandedSpeaker === speaker.id ? null : speaker.id)}
                        className="w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                        style={{ backgroundColor: expandedSpeaker === speaker.id ? '#F9FAFB' : 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: '#E5E7EB',
                              color: '#6B7280'
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <div 
                              className="text-sm"
                              style={{ fontWeight: 600, color: '#0B2641' }}
                            >
                              {speaker.name || `Speaker ${index + 1}`}
                            </div>
                            {speaker.title && (
                              <div 
                                className="text-xs"
                                style={{ color: '#6B7280' }}
                              >
                                {speaker.title}
                              </div>
                            )}
                          </div>
                        </div>
                        {expandedSpeaker === speaker.id ? (
                          <ChevronUp size={20} style={{ color: '#6B7280' }} />
                        ) : (
                          <ChevronDown size={20} style={{ color: '#6B7280' }} />
                        )}
                      </button>

                      {/* Accordion Content */}
                      {expandedSpeaker === speaker.id && (
                        <div 
                          className="p-4 space-y-4"
                          style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                          {/* Photo Upload */}
                          <div>
                            <label 
                              className="block text-xs mb-2"
                              style={{ fontWeight: 500, color: '#0B2641' }}
                            >
                              Photo
                            </label>
                            <div 
                              className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                              style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
                            >
                              <Upload size={20} style={{ color: '#9CA3AF' }} />
                              <span className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Upload</span>
                            </div>
                          </div>

                          {/* Name */}
                          <div>
                            <label 
                              className="block text-xs mb-2"
                              style={{ fontWeight: 500, color: '#0B2641' }}
                            >
                              Name
                            </label>
                            <input
                              type="text"
                              value={speaker.name}
                              onChange={(e) => handleUpdateSpeaker(speaker.id, { name: e.target.value })}
                              placeholder="Speaker name"
                              className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-400"
                              style={{ 
                                borderColor: '#E5E7EB',
                                color: '#0B2641',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>

                          {/* Title */}
                          <div>
                            <label 
                              className="block text-xs mb-2"
                              style={{ fontWeight: 500, color: '#0B2641' }}
                            >
                              Title
                            </label>
                            <input
                              type="text"
                              value={speaker.title}
                              onChange={(e) => handleUpdateSpeaker(speaker.id, { title: e.target.value })}
                              placeholder="Job title"
                              className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-400"
                              style={{ 
                                borderColor: '#E5E7EB',
                                color: '#0B2641',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>

                          {/* Company */}
                          <div>
                            <label 
                              className="block text-xs mb-2"
                              style={{ fontWeight: 500, color: '#0B2641' }}
                            >
                              Company
                            </label>
                            <input
                              type="text"
                              value={speaker.company}
                              onChange={(e) => handleUpdateSpeaker(speaker.id, { company: e.target.value })}
                              placeholder="Company name"
                              className="w-full h-10 px-3 rounded-lg border outline-none transition-colors focus:border-blue-400"
                              style={{ 
                                borderColor: '#E5E7EB',
                                color: '#0B2641',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>

                          {/* Bio */}
                          <div>
                            <label 
                              className="block text-xs mb-2"
                              style={{ fontWeight: 500, color: '#0B2641' }}
                            >
                              Bio (Optional)
                            </label>
                            <textarea
                              value={speaker.bio}
                              onChange={(e) => handleUpdateSpeaker(speaker.id, { bio: e.target.value })}
                              placeholder="Brief biography..."
                              className="w-full h-20 p-3 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                              style={{ 
                                borderColor: '#E5E7EB',
                                color: '#0B2641',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          </div>

                          {/* Remove Button */}
                          {formData.speakers.length > 1 && (
                            <button
                              onClick={() => handleRemoveSpeaker(speaker.id)}
                              className="text-xs transition-colors hover:underline"
                              style={{ color: '#EF4444', fontWeight: 500 }}
                            >
                              Remove Speaker
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Speaker Button */}
                {formData.speakers.length < 12 && (
                  <button
                    onClick={handleAddSpeaker}
                    className="w-full h-11 mt-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors hover:border-blue-400 hover:bg-blue-50"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: 'var(--primary)',
                      fontWeight: 600
                    }}
                  >
                    <Plus size={18} />
                    Add Another Speaker
                  </button>
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
              onClick={() => setFormData(initialData)}
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
