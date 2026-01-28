import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  Building,
  User,
  GraduationCap,
  Award,
  Users,
  Handshake,
  MessageCircle,
  Video,
  Phone,
  Info,
  Edit,
  Share2,
  Linkedin,
  Twitter,
  ExternalLink,
  TrendingUp,
  Rocket,
  BarChart3,
  Check,
  Lock,
  Mail,
  ChevronRight,
  Target,
  Lightbulb,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, signOut } = useAuth();
  const { t } = useI18n();
  const { profile, isLoading, error } = useProfile(userId);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30 min');

  // Auth Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  // Auth Handlers
  const handleGoogleSignup = async () => setShowRegistrationModal(false);
  const handleEmailSignup = async () => setShowRegistrationModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);
  const handleGoogleLogin = async () => setShowLoginModal(false);
  
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0684F5]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4">{t('publicProfilePage.notFound.title')}</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          {t('publicProfilePage.notFound.subtitle')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#0684F5] rounded-lg font-semibold"
        >
          {t('publicProfilePage.notFound.returnHome')}
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const fullName = profile.full_name || t('publicProfilePage.defaults.fullName');
  const avatarUrl =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0684F5&color=fff&size=256`;

  // Map database data to UI structure
  const skills: string[] = profile.b2b_profile?.skills || profile.professional_data?.skills || [];
  const interests: string[] = profile.b2b_profile?.interests || profile.professional_data?.interests || [];
  
  const lookingFor = [
    { id: 1, label: t('publicProfilePage.lookingFor.clients'), key: 'clients' },
    { id: 2, label: t('publicProfilePage.lookingFor.partnerships'), key: 'partnerships' },
    { id: 3, label: t('publicProfilePage.lookingFor.learning'), key: 'learning' },
    { id: 4, label: t('publicProfilePage.lookingFor.investment'), key: 'investment' },
    { id: 5, label: t('publicProfilePage.lookingFor.hiring'), key: 'hiring' },
    { id: 6, label: t('publicProfilePage.lookingFor.sharing'), key: 'sharing' }
  ].map(item => ({
    ...item,
    checked: profile.b2b_profile?.meeting_goals?.includes(item.key) || false
  }));

  const industriesOfInterest = (profile.b2b_profile?.industries_of_interest || []).map((name: string, i: number) => {
    const colors = ['#0684F5', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];
    return { name, color: colors[i % colors.length] };
  });

  const companyStages = (profile.b2b_profile?.company_stages || []).map((name: string) => {
    let icon = Rocket;
    if (name.toLowerCase().includes('early')) icon = TrendingUp;
    if (name.toLowerCase().includes('growth')) icon = BarChart3;
    return { name, icon };
  });

  const discussionTopics = (profile.b2b_profile?.meeting_topics || []).map((name: string) => ({
    name,
    level: 'Expert' // Default level if not in DB
  }));

  const preferredFormats = [
    { id: 'inperson', label: t('publicProfilePage.meeting.formats.inPerson'), icon: Users },
    { id: 'virtual', label: t('publicProfilePage.meeting.formats.virtual'), icon: Video },
    { id: 'phone', label: t('publicProfilePage.meeting.formats.phone'), icon: Phone }
  ].map(f => ({
    ...f,
    selected: profile.b2b_profile?.meeting_formats?.includes(f.id) || false
  }));

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'Expert': return '#10B981';
      case 'Intermediate': return '#0684F5';
      case 'Beginner': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  const getExpertiseLabel = (level: string) => {
    switch (level) {
      case 'Expert': return t('publicProfilePage.expertise.expert');
      case 'Intermediate': return t('publicProfilePage.expertise.intermediate');
      case 'Beginner': return t('publicProfilePage.expertise.beginner');
      default: return level;
    }
  };

  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'always': return t('publicProfilePage.meeting.availability.always');
      case 'events-only': return t('publicProfilePage.meeting.availability.eventsOnly');
      case 'closed': return t('publicProfilePage.meeting.availability.closed');
      default: return t('publicProfilePage.meeting.availability.open');
    }
  };

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      {currentUser ? (
        <NavbarLoggedIn onLogout={handleLogout} />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}

      <div style={{ paddingTop: '112px', maxWidth: '1200px', margin: '0 auto', padding: '112px 40px 80px' }}>
        
        {/* Navigation/Actions Bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors"
            style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={20} />
            <span>{t('publicProfilePage.actions.back')}</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              className="p-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success(t('publicProfilePage.toasts.linkCopied'));
                } catch (_err) {}
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              height: '140px',
              background: 'linear-gradient(135deg, #0684F5 0%, #4A7C6D 100%)',
              position: 'relative'
            }}
          />

          <div style={{ padding: '0 40px 40px', marginTop: '-70px', position: 'relative' }}>
            <div style={{ position: 'relative', width: 'fit-content', marginBottom: '20px' }}>
              <img
                src={avatarUrl}
                alt={fullName}
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  border: '6px solid #0B2641',
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)',
                  objectFit: 'cover',
                  background: '#0B2641'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '4px solid #0B2641',
                  boxShadow: '0px 0px 12px rgba(16, 185, 129, 0.6)'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {fullName}
              </h1>
              <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px', fontWeight: 500 }}>
                {profile.job_title} {profile.company ? `@ ${profile.company}` : ''}
              </p>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {profile.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.timezone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <Globe size={16} />
                    <span>{profile.timezone}</span>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <Calendar size={16} />
                    <span>{t('publicProfilePage.details.bornOn', { date: new Date(profile.date_of_birth).toLocaleDateString() })}</span>
                  </div>
                )}
                {profile.gender && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <User size={16} />
                    <span style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
                  </div>
                )}
              </div>

              {profile.b2b_profile?.enabled && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                    {t('publicProfilePage.badges.openToNetworking')}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isOwnProfile && (
                <>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setShowLoginModal(true);
                        return;
                      }
                      setShowMeetingModal(true);
                    }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: '#0684F5',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0px 4px 16px rgba(6, 132, 245, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Calendar size={18} />
                    {t('publicProfilePage.actions.requestMeeting')}
                  </button>
                  <button
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageCircle size={18} />
                    {t('publicProfilePage.actions.sendMessage')}
                  </button>
                </>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => navigate('/my-profile')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  >
                    <Edit size={18} />
                    {t('publicProfilePage.actions.editProfile')}
                  </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('publicProfilePage.sections.about')}
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {profile.bio || t('publicProfilePage.placeholders.noBio')}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
                {t('publicProfilePage.sections.professionalInfo')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {profile.industry && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Briefcase size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('publicProfilePage.labels.industry')}</span>
                    </div>
                    <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500 }}>
                      {profile.industry === 'Other' ? profile.professional_data?.industry_other || t('publicProfilePage.labels.otherIndustry') : profile.industry}
                    </p>
                  </div>
                )}
                {profile.department && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Building size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('publicProfilePage.labels.department')}</span>
                    </div>
                    <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500 }}>{profile.department}</p>
                  </div>
                )}
                {profile.years_experience && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Calendar size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('publicProfilePage.labels.experience')}</span>
                    </div>
                    <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500 }}>
                      {t('publicProfilePage.labels.yearsExperience', { count: profile.years_experience })}
                    </p>
                  </div>
                )}
                {profile.company_size && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Users size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('publicProfilePage.labels.companySize')}</span>
                    </div>
                    <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 500 }}>{profile.company_size}</p>
                  </div>
                )}
              </div>

              {skills.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>{t('publicProfilePage.sections.skills')}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((skill) => (
                      <span key={skill} style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.08)', fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {interests.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>{t('publicProfilePage.sections.interests')}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {interests.map((interest) => (
                      <span key={interest} style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(6, 132, 245, 0.15)', fontSize: '14px', fontWeight: 500, color: '#0684F5', border: '1px solid rgba(6, 132, 245, 0.3)' }}>{interest}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>{t('publicProfilePage.sections.education')}</h3>
                {profile.profile_education?.map((edu: any) => (
                  <div key={edu.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6, 132, 245, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(6, 132, 245, 0.3)' }}>
                      <GraduationCap size={24} style={{ color: '#0684F5' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{edu.degree}</p>
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2px' }}>{edu.institution}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>{edu.years}</p>
                    </div>
                  </div>
                ))}
                {profile.profile_certifications?.map((cert: any) => (
                  <div key={cert.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <Award size={24} style={{ color: '#F59E0B' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{cert.name}</p>
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{cert.organization} - {cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {profile.b2b_profile?.enabled && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{t('publicProfilePage.b2b.title')}</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{t('publicProfilePage.b2b.subtitle')}</p>
                  </div>
                </div>

                {lookingFor.some(i => i.checked) && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Target size={20} style={{ color: '#0684F5' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{t('publicProfilePage.sections.lookingFor')}</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {lookingFor.filter(i => i.checked).map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <Check size={14} style={{ color: '#10B981' }} />
                          <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 500 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {industriesOfInterest.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Building size={20} style={{ color: '#0684F5' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{t('publicProfilePage.sections.industriesOfInterest')}</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {industriesOfInterest.map((industry: any) => (
                        <span key={industry.name} style={{ padding: '10px 18px', borderRadius: '24px', background: industry.color + '20', fontSize: '14px', fontWeight: 600, color: industry.color, border: `2px solid ${industry.color}50` }}>{industry.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {discussionTopics.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Lightbulb size={20} style={{ color: '#0684F5' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{t('publicProfilePage.sections.discussionTopics')}</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {discussionTopics.map((topic: any) => (
                        <div key={topic.name} style={{ padding: '10px 16px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>{topic.name}</span>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', background: getExpertiseColor(topic.level) + '25', fontSize: '11px', fontWeight: 600, color: getExpertiseColor(topic.level), textTransform: 'uppercase' }}>{getExpertiseLabel(topic.level)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 04. MEETING AVAILABILITY SECTION */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
                {t('publicProfilePage.meeting.title')}
              </h2>

              {/* Availability Status */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  {t('publicProfilePage.meeting.availability.title')}
                </h3>
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    background: 'rgba(6, 132, 245, 0.15)',
                    border: '2px solid rgba(6, 132, 245, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#0684F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check size={20} style={{ color: '#FFFFFF' }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#0684F5' }}>
                    {getAvailabilityLabel(profile.b2b_profile?.availability_status || 'always')}
                  </span>
                </div>
              </div>

              {/* Preferred Meeting Formats */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  {t('publicProfilePage.meeting.formats.title')}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {preferredFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div
                        key={format.id}
                        style={{
                          flex: '1 1 auto',
                          minWidth: '140px',
                          padding: '16px',
                          borderRadius: '10px',
                          background: format.selected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: `2px solid ${format.selected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          opacity: format.selected ? 1 : 0.5
                        }}
                      >
                        <Icon size={20} style={{ color: format.selected ? '#10B981' : 'rgba(255, 255, 255, 0.5)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: format.selected ? '#10B981' : 'rgba(255, 255, 255, 0.5)' }}>
                          {format.label}
                        </span>
                        {format.selected && (
                          <Check size={16} style={{ color: '#10B981', marginLeft: 'auto' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Duration */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  {t('publicProfilePage.meeting.durationTitle')}
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(profile.b2b_profile?.meeting_durations || ['30 min']).map((duration: string) => (
                    <div
                      key={duration}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        background: 'rgba(6, 132, 245, 0.15)',
                        border: '2px solid #0684F5',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF'
                      }}
                    >
                      {duration}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Instructions */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <Info size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B', marginBottom: '4px' }}>
                    {t('publicProfilePage.meeting.instructions.title')}
                  </p>
                  <p style={{ fontSize: '14px', color: 'rgba(245, 158, 11, 0.9)', lineHeight: '1.6' }}>
                    {profile.b2b_profile?.meeting_instructions || t('publicProfilePage.meeting.instructions.placeholder')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isOwnProfile && (
              <div style={{ background: 'linear-gradient(135deg, #0684F5 0%, #4A7C6D 100%)', padding: '24px', borderRadius: '12px', boxShadow: '0px 4px 20px rgba(6, 132, 245, 0.3)', color: '#FFFFFF' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{t('publicProfilePage.connect.title')}</h3>
                <p style={{ fontSize: '14px', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.9)' }}>{t('publicProfilePage.connect.subtitle')}</p>
                <button onClick={() => setShowMeetingModal(true)} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#FFFFFF', border: 'none', fontSize: '15px', fontWeight: 600, color: '#0684F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px' }}>
                  <Calendar size={18} /> {t('publicProfilePage.actions.requestMeeting')}
                </button>
              </div>
            )}

            {/* Profile Activity Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('publicProfilePage.activity.title')}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{t('publicProfilePage.activity.views')}</span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0684F5' }}>{profile.profile_views || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{t('publicProfilePage.activity.connections')}</span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0684F5' }}>{profile.connections_made || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Handshake size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{t('publicProfilePage.activity.meetings')}</span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0684F5' }}>{profile.total_meetings || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{t('publicProfilePage.activity.responseRate')}</span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{profile.response_rate || '100%'}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>{t('publicProfilePage.connectElsewhere.title')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Linkedin size={18} style={{ color: '#0A66C2' }} /><span style={{ fontSize: '14px', color: 'white' }}>{t('publicProfilePage.connectElsewhere.linkedin')}</span></div>
                    <ChevronRight size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Twitter size={18} style={{ color: '#1DA1F2' }} /><span style={{ fontSize: '14px', color: 'white' }}>{t('publicProfilePage.connectElsewhere.twitter')}</span></div>
                    <ChevronRight size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ExternalLink size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} /><span style={{ fontSize: '14px', color: 'white' }}>{t('publicProfilePage.connectElsewhere.website')}</span></div>
                    <ChevronRight size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </a>
                )}
                {profile.phone_number && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} style={{ color: 'rgba(255, 255, 255, 0.5)' }} /><span style={{ fontSize: '14px', color: 'white' }}>{profile.phone_number}</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Pro Feature Upsell */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0px 4px 20px rgba(245, 158, 11, 0.25)',
                color: '#FFFFFF'
              }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Award size={20} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('publicProfilePage.proUpsell.title')}
                </h3>
              </div>
              <p style={{ fontSize: '13px', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.5' }}>
                {t('publicProfilePage.proUpsell.subtitle')}
              </p>
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#F59E0B',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t('publicProfilePage.proUpsell.button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMeetingModal && (
        <div onClick={() => setShowMeetingModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#0B2641', borderRadius: '16px', padding: '32px', maxWidth: '540px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{t('publicProfilePage.modal.title')}</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>{t('publicProfilePage.modal.withName', { name: fullName })}</p>
            <textarea placeholder={t('publicProfilePage.modal.placeholder')} style={{ width: '100%', minHeight: '140px', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowMeetingModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'white', cursor: 'pointer' }}>{t('publicProfilePage.modal.cancel')}</button>
              <button onClick={() => setShowMeetingModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', background: '#0684F5', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{t('publicProfilePage.modal.send')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />
    </div>
  );
}
