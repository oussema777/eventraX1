import { X, Calendar, MapPin, Clock, Users, Mail, Linkedin, Globe, Phone, Twitter } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { useSessions } from '../../../hooks/useSessions';

interface Speaker {
  id?: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone?: string;
  photo?: string;
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
  const { eventId } = useParams();
  const { sessions } = useSessions(eventId);

  if (!isOpen || !speaker) return null;

  const speakerSessions = sessions.filter(session => 
    session.speakers && session.speakers.includes(speaker.id!)
  );

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
              className="w-[120px] h-[120px] mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center"
            >
              {speaker.photo ? (
                <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
              ) : (
                <Users size={48} style={{ color: '#9CA3AF' }} />
              )}
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
                  href={speaker.linkedin.startsWith('http') ? speaker.linkedin : `https://${speaker.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Linkedin size={20} style={{ color: '#FFFFFF' }} />
                </a>
              )}
              {speaker.twitter && (
                <a 
                  href={speaker.twitter.startsWith('http') ? speaker.twitter : `https://twitter.com/${speaker.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Twitter size={20} style={{ color: '#FFFFFF' }} />
                </a>
              )}
              {speaker.website && (
                <a 
                  href={speaker.website.startsWith('http') ? speaker.website : `https://${speaker.website}`}
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
                {speakerSessions.length > 0 ? (
                  speakerSessions.map(session => (
                    <div 
                      key={session.id}
                      className="rounded-lg p-5 border"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                    >
                      <h4 className="text-lg mb-3" style={{ fontWeight: 600, color: '#0B2641' }}>
                        {session.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} style={{ color: '#6B7280' }} />
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            {new Date(session.startTime).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: '#6B7280' }} />
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {session.duration} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} style={{ color: '#6B7280' }} />
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            {session.venue || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: '#6B7280' }} />
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            {session.registered} registered
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No sessions assigned yet.</p>
                )}
              </div>
            </div>

            <div className="w-full h-px mb-8" style={{ backgroundColor: '#E5E7EB' }} />

            {/* Section 4: Contact */}
            <div>
              <h3 className="text-xl mb-4" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.speakers.profileModal.contact')}
              </h3>
              <div className="flex flex-col gap-4">
                {/* Email */}
                <a 
                  href={`mailto:${speaker.email}`}
                  className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-gray-50 group"
                  style={{ borderColor: '#E5E7EB', textDecoration: 'none' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Mail size={20} style={{ color: '#0684F5' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>Email Address</p>
                    <p style={{ fontSize: '15px', color: '#0B2641', fontWeight: 600 }}>{speaker.email}</p>
                  </div>
                </a>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  {speaker.phone && (
                    <a 
                      href={`tel:${speaker.phone}`}
                      className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-gray-50 group"
                      style={{ borderColor: '#E5E7EB', textDecoration: 'none' }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Phone size={20} style={{ color: '#10B981' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>Phone Number</p>
                        <p style={{ fontSize: '15px', color: '#0B2641', fontWeight: 600 }}>{speaker.phone}</p>
                      </div>
                    </a>
                  )}

                  {/* LinkedIn */}
                  {speaker.linkedin && (
                    <a 
                      href={speaker.linkedin.startsWith('http') ? speaker.linkedin : `https://${speaker.linkedin}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-gray-50 group"
                      style={{ borderColor: '#E5E7EB', textDecoration: 'none' }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center group-hover:bg-[#0A66C2]/20 transition-colors">
                        <Linkedin size={20} style={{ color: '#0A66C2' }} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>LinkedIn</p>
                        <p style={{ fontSize: '14px', color: '#0B2641', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {speaker.linkedin.split('/').pop() || 'View Profile'}
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Twitter / X */}
                  {speaker.twitter && (
                    <a 
                      href={speaker.twitter.startsWith('http') ? speaker.twitter : `https://twitter.com/${speaker.twitter.replace('@', '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-gray-50 group"
                      style={{ borderColor: '#E5E7EB', textDecoration: 'none' }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-black transition-colors">
                        <Twitter size={20} style={{ color: '#FFFFFF' }} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>Twitter / X</p>
                        <p style={{ fontSize: '14px', color: '#0B2641', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {speaker.twitter.startsWith('@') ? speaker.twitter : `@${speaker.twitter}`}
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Website */}
                  {speaker.website && (
                    <a 
                      href={speaker.website.startsWith('http') ? speaker.website : `https://${speaker.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-gray-50 group"
                      style={{ borderColor: '#E5E7EB', textDecoration: 'none' }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Globe size={20} style={{ color: '#0B2641' }} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>Website</p>
                        <p style={{ fontSize: '14px', color: '#0B2641', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {speaker.website.replace(/(^\w+:|^)\/\//, '')}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
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
