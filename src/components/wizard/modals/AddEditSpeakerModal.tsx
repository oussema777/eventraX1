import { X, CheckCircle, Upload, Star, Users as UsersIcon, Settings, User, Plus, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { uploadFile } from '../../../utils/storage';
import { useI18n } from '../../../i18n/I18nContext';

interface Speaker {
  id?: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  shortBio: string;
  email: string;
  photo?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  type: 'keynote' | 'panel' | 'workshop' | 'regular';
  status: 'confirmed' | 'pending' | 'declined';
  tags: string[];
  sessions: number;
  expectedAttendees: string;
}

interface AddEditSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  speaker: Speaker | null;
}

export default function AddEditSpeakerModal({ isOpen, onClose, onSave, speaker }: AddEditSpeakerModalProps) {
  const { t } = useI18n();
  const { eventId } = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<Partial<Speaker>>(speaker || {
    name: '',
    title: '',
    company: '',
    bio: '',
    shortBio: '',
    email: '',
    phone: '',
    linkedin: '',
    twitter: '',
    website: '',
    type: 'regular',
    status: 'confirmed',
    tags: [],
    sessions: 0,
    expectedAttendees: ''
  });

  const [bioCharCount, setBioCharCount] = useState(speaker?.bio?.length || 0);
  const [shortBioCharCount, setShortBioCharCount] = useState(speaker?.shortBio?.length || 0);
  const [currentTag, setCurrentTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const next = speaker ? {
      ...speaker,
      name: speaker.name || (speaker as any).full_name || ''
    } : {
      name: '',
      title: '',
      company: '',
      bio: '',
      shortBio: '',
      email: '',
      phone: '',
      linkedin: '',
      twitter: '',
      website: '',
      type: 'regular',
      status: 'confirmed',
      tags: [],
      sessions: 0,
      expectedAttendees: ''
    };
    setFormData(next);
    setBioCharCount(next.bio?.length || 0);
    setShortBioCharCount(next.shortBio?.length || 0);
    setCurrentTag('');
  }, [isOpen, speaker]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `events/${eventId || 'draft'}/speakers/${Date.now()}_${safeName}`;
      const url = await uploadFile('profiles', path, file);
      if (url) {
        setFormData((prev) => ({ ...prev, photo: url }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleBioChange = (value: string) => {
    if (value.length <= 500) {
      setFormData({ ...formData, bio: value });
      setBioCharCount(value.length);
    }
  };

  const handleShortBioChange = (value: string) => {
    if (value.length <= 150) {
      setFormData({ ...formData, shortBio: value });
      setShortBioCharCount(value.length);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && formData.tags && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index)
    });
  };

  const speakerTypes = [
    {
      value: 'keynote',
      icon: Star,
      label: t('wizard.step3.speakers.modal.types.keynote.label'),
      desc: t('wizard.step3.speakers.modal.types.keynote.desc')
    },
    {
      value: 'panel',
      icon: UsersIcon,
      label: t('wizard.step3.speakers.modal.types.panel.label'),
      desc: t('wizard.step3.speakers.modal.types.panel.desc')
    },
    {
      value: 'workshop',
      icon: Settings,
      label: t('wizard.step3.speakers.modal.types.workshop.label'),
      desc: t('wizard.step3.speakers.modal.types.workshop.desc')
    },
    {
      value: 'regular',
      icon: User,
      label: t('wizard.step3.speakers.modal.types.regular.label'),
      desc: t('wizard.step3.speakers.modal.types.regular.desc')
    }
  ];

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
          className="w-[800px] rounded-xl overflow-hidden"
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
            className="p-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 
                  className="text-2xl mb-1"
                  style={{ fontWeight: 600, color: '#0B2641' }}
                >
                  {speaker
                    ? t('wizard.step3.speakers.modal.titleEdit')
                    : t('wizard.step3.speakers.modal.titleCreate')}
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t('wizard.step3.speakers.modal.subtitle')}
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

          {/* Content - Single Column Layout */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: 'calc(90vh - 180px)' }}
          >
            <div className="space-y-6">
              {/* Profile Photo Upload - Top Section */}
              <div>
                <label className="block text-sm mb-3" style={{ fontWeight: 500, color: '#0B2641' }}>
                  {t('wizard.step3.speakers.modal.fields.photo.label')}
                </label>
                <div 
                  className="w-[200px] h-[200px] mx-auto rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Speaker"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <>
                      <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                      <p className="text-sm" style={{ color: '#0B2641', fontWeight: 500 }}>
                        {isUploading
                          ? t('wizard.step3.speakers.modal.fields.photo.uploading')
                          : t('wizard.step3.speakers.modal.fields.photo.cta')}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        {t('wizard.step3.speakers.modal.fields.photo.helper')}
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#E5E7EB' }} />

              {/* SECTION 1: Basic Information */}
              <div>
                <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                  {t('wizard.step3.speakers.modal.sections.basic')}
                </h3>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.name.label')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.name.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.email.label')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.email.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      {t('wizard.step3.speakers.modal.fields.email.helper')}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.phone.label')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.phone.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Professional Information */}
              <div>
                <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                  {t('wizard.step3.speakers.modal.sections.professional')}
                </h3>
                <div className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.title.label')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.title.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.company.label')}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.company.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.linkedin.label')}
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.linkedin.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.twitter.label')}
                    </label>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.twitter.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.website.label')}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder={t('wizard.step3.speakers.modal.fields.website.placeholder')}
                      className="w-full h-11 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Speaker Details */}
              <div>
                <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                  {t('wizard.step3.speakers.modal.sections.details')}
                </h3>
                <div className="space-y-4">
                  {/* Biography */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.bio.label')}
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleBioChange(e.target.value)}
                      placeholder={t('wizard.step3.speakers.modal.fields.bio.placeholder')}
                      className="w-full h-[150px] p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        {t('wizard.step3.speakers.modal.fields.bio.helper')}
                      </p>
                      <span 
                        className="text-xs"
                        style={{ color: bioCharCount > 450 ? '#EF4444' : '#9CA3AF' }}
                      >
                        {bioCharCount}/500
                      </span>
                    </div>
                  </div>

                  {/* Short Bio */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.shortBio.label')}
                    </label>
                    <textarea
                      value={formData.shortBio}
                      onChange={(e) => handleShortBioChange(e.target.value)}
                      placeholder={t('wizard.step3.speakers.modal.fields.shortBio.placeholder')}
                      className="w-full h-20 p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                    />
                    <div className="flex justify-end mt-1">
                      <span 
                        className="text-xs"
                        style={{ color: shortBioCharCount > 135 ? '#EF4444' : '#9CA3AF' }}
                      >
                        {shortBioCharCount}/150
                      </span>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#0B2641' }}>
                      {t('wizard.step3.speakers.modal.fields.tags.label')}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder={t('wizard.step3.speakers.modal.fields.tags.placeholder')}
                        className="flex-1 h-10 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                        style={{ borderColor: '#E5E7EB', color: '#0B2641' }}
                      />
                      <button
                        onClick={handleAddTag}
                        className="w-10 h-10 rounded-lg border flex items-center justify-center transition-colors hover:bg-blue-50"
                        style={{ borderColor: '#E5E7EB' }}
                      >
                        <Plus size={18} style={{ color: 'var(--primary)' }} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                          style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', color: 'var(--primary)' }}
                        >
                          {tag}
                          <button onClick={() => handleRemoveTag(index)}>
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      {t('wizard.step3.speakers.modal.fields.tags.helper')}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Speaker Classification */}
              <div>
                <h3 className="text-base mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                  {t('wizard.step3.speakers.modal.sections.type')}
                </h3>
                <div className="space-y-3">
                  {speakerTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, type: type.value as any })}
                        className="w-full flex items-start gap-3 p-3 rounded-lg border transition-all hover:border-blue-400"
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : '#E5E7EB',
                          backgroundColor: isSelected ? 'rgba(6, 132, 245, 0.05)' : 'transparent'
                        }}
                      >
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5"
                          style={{ borderColor: isSelected ? 'var(--primary)' : '#D1D5DB' }}
                        >
                          {isSelected && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: 'var(--primary)' }}
                            />
                          )}
                        </div>
                        <Icon size={20} style={{ color: isSelected ? 'var(--primary)' : '#6B7280' }} />
                        <div className="flex-1 text-left">
                          <p 
                            className="text-base mb-1"
                            style={{ 
                              fontWeight: isSelected ? 600 : 400,
                              color: '#0B2641'
                            }}
                          >
                            {type.label}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {type.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-2">
              <button className="text-sm transition-colors hover:underline" style={{ color: '#6B7280', fontWeight: 500 }}>
                {t('wizard.step3.speakers.modal.actions.saveDraft')}
              </button>
              <span className="text-xs" style={{ color: 'var(--success)' }}>
                {t('wizard.step3.speakers.modal.actions.saved')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="h-11 px-5 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#0B2641', fontWeight: 600 }}
              >
                {t('wizard.common.cancel')}
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
                {t('wizard.step3.speakers.modal.actions.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
