import { X, Calendar, MapPin, Clock, Users, Mail, Linkedin, Globe } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface Speaker {
  id?: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  tags: string[];
}

interface SpeakerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  speaker: Speaker | null;
}

export default function SpeakerProfileModal({ isOpen, onClose, speaker }: SpeakerProfileModalProps) {
  const { t } = useI18n();
  if (!isOpen || !speaker) return null;

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
          {/* Header with Gradient Background */}
          <div 
            className="relative p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
              style={{ color: '#FFFFFF' }}
            >
              <X size={20} />
            </button>
            
            {/* Profile Photo */}
            <div 
              className="w-[120px] h-[120px] mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '4px solid #FFFFFF',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Users size={48} style={{ color: '#9CA3AF' }} />
            </div>

            {/* Name & Title */}
            <h2 className="text-4xl mb-2" style={{ fontWeight: 700, color: '#FFFFFF' }}>
              {speaker.name}
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {speaker.title}, {speaker.company}
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {speaker.linkedin && (
                <a 
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Linkedin size={20} style={{ color: '#FFFFFF' }} />
                </a>
              )}
              {speaker.website && (
                <a 
                  href={speaker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Globe size={20} style={{ color: '#FFFFFF' }} />
                </a>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto p-8"
            style={{ maxHeight: 'calc(85vh - 280px)' }}
          >
            {/* Section 1: About */}
            <div className="mb-8">
              <h3 className="text-xl mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.speakers.profileModal.about')}
              </h3>
              <p className="text-base" style={{ color: '#6B7280', lineHeight: '1.6' }}>
                {speaker.bio}
              </p>
            </div>

            <div className="w-full h-px mb-8" style={{ backgroundColor: '#E5E7EB' }} />

            {/* Section 2: Expertise */}
            <div className="mb-8">
              <h3 className="text-xl mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.speakers.profileModal.expertise')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {speaker.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{ 
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: 500
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full h-px mb-8" style={{ backgroundColor: '#E5E7EB' }} />

            {/* Section 3: Sessions */}
            <div className="mb-8">
              <h3 className="text-xl mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.speakers.profileModal.speakingAt')}
              </h3>
              <div className="space-y-4">
                {/* Example Session Card 1 */}
                <div 
                  className="rounded-lg p-5 border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                >
                  <h4 className="text-lg mb-3" style={{ fontWeight: 600, color: '#0B2641' }}>
                    {t('wizard.step3.speakers.profileModal.sampleSessions.keynote.title')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.keynote.date')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.keynote.location')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.keynote.duration')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.keynote.attendees')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Example Session Card 2 */}
                <div 
                  className="rounded-lg p-5 border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                >
                  <h4 className="text-lg mb-3" style={{ fontWeight: 600, color: '#0B2641' }}>
                    {t('wizard.step3.speakers.profileModal.sampleSessions.panel.title')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.panel.date')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.panel.location')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.panel.duration')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: '#6B7280' }} />
                      <span className="text-sm" style={{ color: '#6B7280' }}>
                        {t('wizard.step3.speakers.profileModal.sampleSessions.panel.attendees')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px mb-8" style={{ backgroundColor: '#E5E7EB' }} />

            {/* Section 4: Contact */}
            <div>
              <h3 className="text-xl mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.speakers.profileModal.contact')}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  className="flex items-center gap-2 px-5 h-11 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', fontWeight: 600 }}
                >
                  <Mail size={18} style={{ color: '#6B7280' }} />
                  {t('wizard.step3.speakers.profileModal.actions.email')}
                </button>
                {speaker.linkedin && (
                  <button 
                    className="flex items-center gap-2 px-5 h-11 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#0A66C2', color: '#FFFFFF', fontWeight: 600 }}
                  >
                  <Linkedin size={18} />
                    {t('wizard.step3.speakers.profileModal.actions.linkedin')}
                </button>
                )}
                {speaker.website && (
                  <button 
                    className="flex items-center gap-2 px-5 h-11 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#E5E7EB', fontWeight: 600 }}
                  >
                  <Globe size={18} style={{ color: '#6B7280' }} />
                    {t('wizard.step3.speakers.profileModal.actions.website')}
                </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 text-center" style={{ borderTop: '1px solid #E5E7EB' }}>
            <button
              onClick={onClose}
              className="h-11 px-8 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: '#0B2641', fontWeight: 600 }}
            >
              {t('wizard.step3.speakers.profileModal.actions.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
