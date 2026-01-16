import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  UserPlus,
  MessageCircle,
  Calendar,
  Filter,
  X,
  Sparkles,
  MapPin,
  Briefcase,
  Building,
  Check,
  Clock,
  Video,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

interface Person {
  id: string;
  name: string;
  position: string;
  company: string;
  location: string;
  profileImage: string;
  matchScore: number;
  bio: string;
  tags: string[];
  isOnline: boolean;
  openToMeetings: boolean;
  role: string;
  industry: string;
  sectors: string[];
}

export default function CommunityPeopleDiscovery() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedSector = searchParams.get('sector');
  const { user: currentUser } = useAuth();
  const { t } = useI18n();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-01-15');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');

  // Data State
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [openToMeetingsOnly, setOpenToMeetingsOnly] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchPeople();
    }
  }, [currentUser?.id]);

  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      const query = supabase.from('profiles').select('*').limit(20);
      if (currentUser?.id) {
        query.neq('id', currentUser.id); // Don't show self
      }
      const { data, error } = await query;

      if (error) throw error;

      const mapped: Person[] = (data || []).map(profile => {
        const profData = profile.professional_data || {};
        const b2b = profile.b2b_profile || {};
        
        return {
          id: profile.id,
          name: profile.full_name || t('communityPage.defaults.member'),
          position: profile.job_title || t('communityPage.defaults.position'),
          company: profile.company || t('communityPage.defaults.company'),
          location: profile.location || t('communityPage.defaults.location'),
          profileImage: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0684F5&color=fff`,
          matchScore: Math.floor(Math.random() * (100 - 70 + 1)) + 70, // Simulated match for demo
          bio: profile.bio || t('communityPage.defaults.bio'),
          tags: Array.isArray(profData.skills) ? profData.skills.slice(0, 3) : [t('communityPage.defaults.tag')],
          isOnline: Math.random() > 0.5,
          openToMeetings: b2b.enabled !== false,
          role: profile.industry || t('communityPage.defaults.role'),
          industry: profile.industry || t('communityPage.defaults.industry'),
          sectors: Array.isArray(b2b.industries_of_interest) ? b2b.industries_of_interest : []
        };
      });

      setPeople(mapped);
    } catch (err: any) {
      console.error('Error fetching people:', err);
      toast.error(t('communityPage.errors.loadMembers'));
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    t('communityPage.roles.technology'),
    t('communityPage.roles.marketing'),
    t('communityPage.roles.consulting'),
    t('communityPage.roles.finance'),
    t('communityPage.roles.education')
  ];
  const industries = [
    t('communityPage.industries.saas'),
    t('communityPage.industries.fintech'),
    t('communityPage.industries.healthcare'),
    t('communityPage.industries.eventtech'),
    t('communityPage.industries.media')
  ];
  const interests = [
    t('communityPage.interests.ai'),
    t('communityPage.interests.marketing'),
    t('communityPage.interests.sales'),
    t('communityPage.interests.product'),
    t('communityPage.interests.engineering'),
    t('communityPage.interests.leadership'),
    t('communityPage.interests.growth'),
    t('communityPage.interests.b2b')
  ];

  const availableDates = [
    { date: '2026-01-15', label: t('communityPage.dates.today'), day: t('communityPage.dates.days.wed') },
    { date: '2026-01-16', label: t('communityPage.dates.tomorrow'), day: t('communityPage.dates.days.thu') },
    { date: '2026-01-17', label: t('communityPage.dates.fri17'), day: t('communityPage.dates.days.fri') },
    { date: '2026-01-20', label: t('communityPage.dates.mon20'), day: t('communityPage.dates.days.mon') },
    { date: '2026-01-21', label: t('communityPage.dates.tue21'), day: t('communityPage.dates.days.tue') }
  ];

  const timeSlots = [
    t('communityPage.timeSlots.slot0900'),
    t('communityPage.timeSlots.slot0930'),
    t('communityPage.timeSlots.slot1000'),
    t('communityPage.timeSlots.slot1030'),
    t('communityPage.timeSlots.slot1100'),
    t('communityPage.timeSlots.slot1130'),
    t('communityPage.timeSlots.slot1400'),
    t('communityPage.timeSlots.slot1430'),
    t('communityPage.timeSlots.slot1500'),
    t('communityPage.timeSlots.slot1530'),
    t('communityPage.timeSlots.slot1600'),
    t('communityPage.timeSlots.slot1630')
  ];

  // Filter logic
  const filteredPeople = people.filter(person => {
    if (selectedSector) {
      const matchesSector = person.industry === selectedSector || (person.sectors && person.sectors.includes(selectedSector));
      if (!matchesSector) return false;
    }
    if (searchQuery && !person.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !person.position.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !person.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (person.matchScore < minMatchScore) return false;
    if (selectedRoles.length > 0 && !selectedRoles.includes(person.role)) return false;
    if (selectedIndustries.length > 0 && !selectedIndustries.includes(person.industry)) return false;
    if (selectedInterests.length > 0 && !selectedInterests.some(interest => person.tags.includes(interest))) return false;
    if (onlineOnly && !person.isOnline) return false;
    if (openToMeetingsOnly && !person.openToMeetings) return false;
    return true;
  });

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleConnect = (person: Person) => {
    toast.success(t('communityPage.toasts.requestSent', { name: person.name }));
  };

  const handleMessage = (person: Person) => {
    navigate('/messages');
  };

  const handleBookMeeting = (person: Person) => {
    navigate(`/profile/${person.id}`);
  };

  const handleSendMeetingRequest = () => {
    if (!selectedTime) {
      toast.error(t('communityPage.errors.selectTime'));
      return;
    }
    toast.success(t('communityPage.toasts.meetingSent', { name: selectedPerson?.name || '' }));
    setShowMeetingModal(false);
    setSelectedTime('');
    setMeetingMessage('');
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'linear-gradient(135deg, #00D4D4 0%, #0684F5 100%)';
    if (score >= 80) return 'linear-gradient(135deg, #0684F5 0%, #667EEA 100%)';
    return 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)';
  };

  useEffect(() => {
    if (selectedSector) {
      // Auto-filter if sector matches an industry
      // Note: In a real app, you might want more robust matching or a dedicated API filter
      if (!selectedIndustries.includes(selectedSector)) {
        // We can optionally set it, but for now just the title is requested.
        // Uncomment next line to auto-filter:
        // setSelectedIndustries([selectedSector]);
      }
    }
  }, [selectedSector]);

  return (
    <div className="community-page" style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <NavbarLoggedIn
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="communities"
      />

      {/* Page Header */}
      <div
        className="community-header"
        style={{
          paddingTop: '132px',
          background: 'linear-gradient(180deg, #0B2641 0%, #0E3356 100%)',
          paddingBottom: '60px',
          paddingLeft: '40px',
          paddingRight: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 className="community-header-title" style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', textAlign: 'center' }}>
            {selectedSector ? `${selectedSector}` : t('communityPage.hero.title')}
          </h1>
          <p className="community-header-subtitle" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px', textAlign: 'center' }}>
            {t('communityPage.hero.subtitle')}
          </p>

          <div className="community-search" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)'
              }}
            />
            <input
              className="community-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('communityPage.hero.searchPlaceholder')}
              style={{
                width: '100%',
                padding: '16px 20px 16px 52px',
                fontSize: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: '#FFFFFF',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="community-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        <div className="community-layout" style={{ display: 'flex', gap: '32px' }}>
          
          {/* Sidebar Filters */}
          <div
            className="community-sidebar"
            style={{
              width: '280px',
              flexShrink: 0,
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              height: 'fit-content',
              position: 'sticky',
              top: '100px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} style={{ color: '#0684F5' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>{t('communityPage.filters.title')}</h3>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                {t('communityPage.filters.status.label')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
                  {t('communityPage.filters.status.online')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={openToMeetingsOnly} onChange={(e) => setOpenToMeetingsOnly(e.target.checked)} />
                  {t('communityPage.filters.status.openToMeetings')}
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                {t('communityPage.filters.industries.label')}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roles.map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* People Grid */}
          <div style={{ flex: 1 }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-[#0684F5]" />
              </div>
            ) : (
            <>
                <div className="community-results" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t('communityPage.results.count', { count: filteredPeople.length })}
                  </p>
                </div>

                <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                  {filteredPeople.map(person => (
                    <div
                      key={person.id}
                      onClick={() => navigate(`/profile/${person.id}`)}
                      className="community-card"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div
                        className="community-card-match"
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          background: getMatchColor(person.matchScore),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Sparkles size={12} style={{ color: '#FFFFFF' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                          {t('communityPage.results.matchLabel', { score: person.matchScore })}
                        </span>
                      </div>

                      <div className="community-card-header" style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 16px' }}>
                          <img
                            src={person.profileImage}
                            alt={person.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              border: '3px solid rgba(255, 255, 255, 0.2)',
                              objectFit: 'cover'
                            }}
                          />
                          {person.isOnline && (
                            <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#10B981', border: '3px solid #0B2641' }} />
                          )}
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{person.name}</h3>
                        <p style={{ fontSize: '14px', color: '#00D4D4', fontWeight: 500, marginBottom: '2px' }}>{person.position}</p>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Building size={12} /> {t('communityPage.results.atCompany', { company: person.company })}
                        </p>
                      </div>

                      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '12px', minHeight: '40px' }}>
                        {person.bio}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {person.tags.map(tag => (
                          <span key={tag} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 500, borderRadius: '12px', background: 'rgba(6, 132, 245, 0.15)', color: '#0684F5' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="community-card-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${person.id}`); }}
                          style={{ flex: 1, padding: '10px 16px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', background: '#0684F5', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          {t('communityPage.actions.viewProfile')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMessage(person); }}
                          style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 600px) {
            .community-header {
              padding-left: 20px !important;
              padding-right: 20px !important;
              padding-bottom: 40px !important;
            }
            .community-header-title {
              font-size: 28px !important;
            }
            .community-header-subtitle {
              font-size: 14px !important;
            }
            .community-search-input {
              font-size: 14px !important;
              padding: 14px 16px 14px 46px !important;
            }
            .community-content {
              padding: 24px 20px !important;
            }
            .community-layout {
              flex-direction: column !important;
              gap: 20px !important;
            }
            .community-sidebar {
              width: 100% !important;
              position: static !important;
              top: auto !important;
            }
            .community-grid {
              grid-template-columns: 1fr !important;
            }
            .community-card {
              padding: 20px !important;
            }
            .community-card-header {
              text-align: left !important;
            }
            .community-card-header p {
              justify-content: flex-start !important;
            }
            .community-results {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 8px !important;
            }
          }

          @media (max-width: 400px) {
            .community-header {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            .community-content {
              padding: 20px 16px !important;
            }
            .community-card {
              padding: 16px !important;
            }
            .community-card-actions {
              flex-direction: column !important;
            }
          }
        `}
      </style>
    </div>
  );
}
