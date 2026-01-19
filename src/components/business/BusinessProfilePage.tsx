import { useState, useEffect } from 'react';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Star,
  Share2,
  Bookmark,
  Edit,
  Check,
  Building2,
  Plus,
  X,
  Search,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Users,
  Handshake,
  Target,
  Settings,
  Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';
import { useMessageThread } from '../../hooks/useMessageThread';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export default function BusinessProfilePage() {
  const { businessId: urlBusinessId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [business, setBusiness] = useState<any>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Editable fields
  const [about, setAbout] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sectorTags, setSectorTags] = useState<string[]>([]);
  
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: ''
  });

  const [seekingTags, setSeekingTags] = useState<string[]>([]);
  const [offeringTags, setOfferingTags] = useState<string[]>([]);
  const [seekingInput, setSeekingInput] = useState('');
  const [offeringInput, setOfferingInput] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { getOrCreateThread, loading: connecting } = useMessageThread();

  const handleContact = async () => {
    if (!business?.owner_profile_id) {
      toast.error(t('businessProfilePage.errors.noOwner'));
      return;
    }
    if (business.owner_profile_id === user?.id) {
      toast.error(t('businessProfilePage.errors.contactSelf'));
      return;
    }
    const threadId = await getOrCreateThread(business.owner_profile_id);
    if (threadId) {
      navigate('/messages', { state: { threadId } });
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      const query = searchEmail.trim();
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(5);

        if (!error && data) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchEmail]);

  const handleAddExistingUser = async (profile: any) => {
    if (!business?.id) return;
    
    try {
      setIsLoading(true);
      // Check if already a member
      if (teamMembers.some(m => m.id === profile.id)) {
        toast.error('User is already a team member.');
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('business_members')
        .insert({
          business_id: business.id,
          profile_id: profile.id,
          role: 'viewer'
        });

      if (insertError) throw insertError;

      setTeamMembers((prev) => [
        ...prev,
        { id: profile.id, name: profile.full_name || 'Team Member', role: 'viewer', avatar: profile.avatar_url || undefined }
      ]);
      try {
        await createNotification({
          recipient_id: profile.id,
          actor_id: user?.id || null,
          title: 'Team invitation',
          body: `You were added to ${business.company_name}.`,
          type: 'action',
          action_url: `/business/${business.id}`
        });
      } catch {
        // Ignore notification errors
      }
      toast.success(`${profile.full_name || 'User'} added successfully.`);
      setSearchEmail('');
      setSearchResults([]);
      setShowAddMemberModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [urlBusinessId, user]);

  const fetchBusinessData = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('business_profiles').select('*, business_offerings(*)');
      
      if (urlBusinessId) {
        query = query.eq('id', urlBusinessId);
      } else if (user) {
        query = query.eq('owner_profile_id', user.id);
      } else {
        setIsLoading(false);
        return;
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116' && !urlBusinessId && user) {
           // No business yet, maybe redirect to wizard
           navigate('/business-profile-wizard');
           return;
        }
        throw error;
      }

      if (data) {
        setBusiness(data);
        setCompanyName(data.company_name);
        setAbout(data.description || '');
        setSectorTags(data.sectors || []);
        setOfferings(data.business_offerings || []);
        setIsOwner(user?.id === data.owner_profile_id);
        
        // Handle social links and tags from branding/settings if implemented, or placeholders
        // For now, let's assume we use JSONB branding for these extra fields
        if (data.branding) {
           setSocialLinks(data.branding.socialLinks || socialLinks);
           setSeekingTags(data.branding.seekingTags || []);
           setOfferingTags(data.branding.offeringTags || []);
        }

        const { data: membersData, error: membersError } = await supabase
          .from('business_members')
          .select('profile_id, role, profiles:profiles(id, full_name, avatar_url)')
          .eq('business_id', data.id);

        if (!membersError) {
          const mapped = (membersData || []).map((member: any) => ({
            id: member.profile_id,
            name: member.profiles?.full_name || 'Team Member',
            role: member.role || 'member',
            avatar: member.profiles?.avatar_url || undefined
          }));
          setTeamMembers(mapped);
        } else {
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          company_name: companyName,
          description: about,
          sectors: sectorTags,
          branding: {
            ...business.branding,
            socialLinks,
            seekingTags,
            offeringTags
          }
        })
        .eq('id', business.id);

      if (error) throw error;
      
      toast.success('Profile updated');
      setIsEditMode(false);
      fetchBusinessData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddSeekingTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && seekingInput.trim()) {
      e.preventDefault();
      if (!seekingTags.includes(seekingInput.trim())) {
        setSeekingTags([...seekingTags, seekingInput.trim()]);
      }
      setSeekingInput('');
    }
  };

  const handleAddOfferingTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && offeringInput.trim()) {
      e.preventDefault();
      if (!offeringTags.includes(offeringInput.trim())) {
        setOfferingTags([...offeringTags, offeringInput.trim()]);
      }
      setOfferingInput('');
    }
  };

  const handleInviteMember = async () => {
    if (!searchEmail.trim() || !business?.id) return;
    
    try {
      setIsLoading(true);
      // Search for profile by email or exact name match
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`email.eq."${searchEmail.trim()}",full_name.ilike."%${searchEmail.trim()}%"`)
        .limit(1);

      if (profileError || !profiles || profiles.length === 0) {
        toast.error('User not found on the platform.');
        return;
      }

      const profile = profiles[0];

      // Check if already a member
      if (teamMembers.some(m => m.id === profile.id)) {
        toast.error('User is already a team member.');
        return;
      }

      const { error: insertError } = await supabase
        .from('business_members')
        .insert({
          business_id: business.id,
          profile_id: profile.id,
          role: 'viewer'
        });

      if (insertError) throw insertError;

      setTeamMembers((prev) => [
        ...prev,
        { id: profile.id, name: profile.full_name || profile.email || 'Team Member', role: 'viewer', avatar: profile.avatar_url || undefined }
      ]);
      
      try {
        await createNotification({
          recipient_id: profile.id,
          actor_id: user?.id || null,
          title: 'Team invitation',
          body: `You were added to ${business.company_name}.`,
          type: 'action',
          action_url: `/business/${business.id}`
        });
      } catch {
        // Ignore notification errors
      }
      
      toast.success('Member added successfully.');
      setSearchEmail('');
      setShowAddMemberModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOffering = (offeringId: string) => {
    if (!business?.id) return;
    navigate(`/business/${business.id}/offerings/${offeringId}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641] text-white">
        {t('businessProfilePage.notFound')}
      </div>
    );
  }

  const ratingValue = Number(business?.branding?.rating) || 0;
  const reviewCount = Number(business?.branding?.review_count) || 0;
  const eventsManaged = Number(business?.branding?.metrics?.events_managed) || 0;
  const eventsManagedLabel = eventsManaged > 0 ? `${eventsManaged}+` : '0';

  return (
    <div className="business-profile-page" style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 1024px) {
          .business-profile-page .business-profile-grid {
            grid-template-columns: 1fr !important;
          }
          .business-profile-page .business-profile-left,
          .business-profile-page .business-profile-right {
            grid-column: 1 / -1 !important;
          }
        }

        @media (max-width: 900px) {
          .business-profile-page .business-profile-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .business-profile-page .business-profile-actions {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: flex-start !important;
          }
          .business-profile-page .business-profile-shell {
            padding: 0 20px !important;
          }
          .business-profile-page .business-profile-main {
            padding: 24px 20px 64px !important;
          }
          .business-profile-page .business-profile-card {
            padding: 20px !important;
            margin-top: -60px !important;
          }
          .business-profile-page .business-profile-cover {
            height: 240px !important;
          }
          .business-profile-page .business-profile-logo > div {
            width: 96px !important;
            height: 96px !important;
          }
          .business-profile-page .business-profile-title {
            font-size: 26px !important;
          }
          .business-profile-page .business-profile-team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .business-profile-page .business-profile-offerings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .business-profile-page .business-profile-shell {
            padding: 0 16px !important;
          }
          .business-profile-page .business-profile-main {
            padding: 20px 16px 56px !important;
          }
          .business-profile-page .business-profile-card {
            padding: 16px !important;
            margin-top: -48px !important;
          }
          .business-profile-page .business-profile-cover {
            height: 200px !important;
          }
          .business-profile-page .business-profile-logo > div {
            width: 80px !important;
            height: 80px !important;
          }
          .business-profile-page .business-profile-title {
            font-size: 22px !important;
          }
          .business-profile-page .business-profile-team-grid {
            grid-template-columns: 1fr !important;
          }
          .business-profile-page .business-profile-offering-gallery {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .business-profile-page .business-profile-actions button {
            width: 100% !important;
          }
        }
      `}</style>
      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="w-full business-profile-cover"
          style={{ 
            height: '300px',
            background: business.cover_url ? `url(${business.cover_url})` : 'linear-gradient(135deg, #0684F5 0%, #4A7C6D 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {/* Overlay Pattern */}
          {!business.cover_url && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
          )}
        </div>

        {/* Profile Card */}
        <div 
          className="relative business-profile-shell"
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            padding: '0 40px'
          }}
        >
          <div 
            className="relative rounded-2xl p-8 business-profile-card"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              marginTop: '-80px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-start gap-6 business-profile-header">
              {/* Logo + Manage Button */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3 business-profile-logo">
                <div
                  className="rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#FFFFFF',
                    border: '4px solid #0B2641'
                  }}
                >
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.company_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} style={{ color: '#0684F5' }} />
                  )}
                </div>

                {/* Manage Business Button - Only visible to owner */}
                {isOwner && !isEditMode && (
                  <button
                    onClick={() => navigate('/business-management')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.1)',
                      color: '#0684F5',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: '1px solid #0684F5',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0684F5';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
                      e.currentTarget.style.color = '#0684F5';
                    }}
                  >
                    <Settings size={16} />
                    {t('businessProfilePage.manageButton')}
                  </button>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="business-profile-title" style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
                        {isEditMode ? (
                           <input 
                             value={companyName} 
                             onChange={e => setCompanyName(e.target.value)} 
                             className="bg-transparent border-b border-white outline-none"
                           />
                        ) : business.company_name}
                      </h1>
                      {business.verification_status === 'verified' && (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                        >
                          <Check size={14} style={{ color: '#10B981' }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
                            {t('businessProfilePage.verified')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                      {business.sectors?.join(' - ') || t('businessProfilePage.noSectors')} - {business.company_size ? t('businessProfilePage.employees', { count: business.company_size }) : 'N/A'} - {business.address || t('businessProfilePage.locationTbd')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 business-profile-actions">
                    {isOwner ? (
                      isEditMode ? (
                        <>
                          <button
                            onClick={() => setIsEditMode(false)}
                            className="px-4 py-2.5 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: '#94A3B8',
                              fontSize: '14px',
                              fontWeight: 500,
                              border: '1px solid rgba(255,255,255,0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {t('businessProfilePage.actions.cancel')}
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="px-4 py-2.5 rounded-lg transition-colors"
                            style={{
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                          >
                            {t('businessProfilePage.actions.saveChanges')}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                          style={{
                            backgroundColor: '#0684F5',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                        >
                          <Edit size={16} />
                          {t('businessProfilePage.actions.edit')}
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          onClick={handleContact}
                          disabled={connecting}
                          className="px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                          style={{
                            backgroundColor: '#0684F5',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: connecting ? 'not-allowed' : 'pointer',
                            opacity: connecting ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => !connecting && (e.currentTarget.style.backgroundColor = '#0570D6')}
                          onMouseLeave={(e) => !connecting && (e.currentTarget.style.backgroundColor = '#0684F5')}
                        >
                          {connecting && <Loader2 size={16} className="animate-spin" />}
                          {t('businessProfilePage.actions.contact')}
                        </button>
                        <button
                          className="px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Bookmark size={16} />
                          {t('businessProfilePage.actions.save')}
                        </button>
                        <button
                          className="p-2.5 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(window.location.href);
                              toast.success(t('businessProfilePage.toasts.linkCopied'));
                            } catch (_err) {
                              toast.error(t('businessProfilePage.toasts.copyFailed'));
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }}
                        >
                          <Share2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Star size={18} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
                      {ratingValue.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                      {t('businessProfilePage.stats.reviews', { count: reviewCount })}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      width: '1px', 
                      height: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.2)' 
                    }} 
                  />
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{t('businessProfilePage.stats.eventsManaged', { count: eventsManagedLabel })}</span>
                  </div>
                  <div 
                    style={{ 
                      width: '1px', 
                      height: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.2)' 
                    }} 
                  />
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessProfilePage.stats.memberSince', { year: new Date(business.created_at).getFullYear() })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="relative business-profile-main"
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '40px 40px 80px'
        }}
      >
        <div className="grid grid-cols-12 gap-8 business-profile-grid">
          {/* LEFT COLUMN - Main Content */}
          <div className="col-span-8 space-y-8 business-profile-left">
            {/* About Section */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('businessProfilePage.about')}
              </h2>
              {isEditMode ? (
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                  rows={6}
                  style={{
                    backgroundColor: '#0B2641',
                    borderColor: '#0684F5',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                />
              ) : (
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94A3B8' }}>
                  {about || t('businessProfilePage.noDescription')}
                </p>
              )}

              {/* Legal Verified Badge */}
              {!isEditMode && business.verification_status === 'verified' && (
                <div 
                  className="flex items-center gap-2 mt-4 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  <Shield size={20} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                    {t('businessProfilePage.legalVerified')}
                  </span>
                </div>
              )}
            </div>

            {/* Team Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('businessProfilePage.team.title')}
                </h2>
                {isOwner && (
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#0684F5',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: '1px solid #0684F5'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Plus size={14} />
                    {t('businessProfilePage.team.addMember')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-6 business-profile-team-grid">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="group text-center p-4 rounded-xl transition-all hover:bg-white/5"
                  >
                    <div
                      className="mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        width: '96px',
                        height: '96px',
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        border: '3px solid rgba(6, 132, 245, 0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0684F5]/20 to-[#0684F5]/5">
                          <Users size={40} className="text-[#0684F5]" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#0684F5] transition-colors">
                      {member.name}
                    </h4>
                    <span 
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        color: '#0684F5',
                        border: '1px solid rgba(6, 132, 245, 0.2)'
                      }}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offerings Section */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('businessProfilePage.offerings.title')}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 business-profile-offerings-grid">
                {offerings.map((offering) => (
                  <div
                    key={offering.id}
                    className="rounded-xl overflow-hidden transition-all cursor-pointer"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onClick={() => handleOpenOffering(offering.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Main Product/Service Image */}
                    <div 
                      className="w-full overflow-hidden"
                      style={{ 
                        height: '200px',
                        position: 'relative',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {offering.images?.[0] ? (
                        <img
                          src={offering.images[0]}
                          alt={offering.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Package size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        </div>
                      )}
                      {/* Type Badge */}
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg backdrop-blur-sm"
                        style={{
                          backgroundColor: 'rgba(11, 38, 65, 0.8)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>
                          {offering.type}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                        {offering.name}
                      </h3>
                      
                      {/* Price */}
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', marginBottom: '8px' }}>
                        {offering.price ? `${offering.currency || 'USD'} ${offering.price}` : t('businessProfilePage.offerings.free')}
                      </p>

                      {/* Tags */}
                      {Array.isArray(offering.tags) && offering.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {offering.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: 'rgba(6, 132, 245, 0.15)',
                                color: '#0684F5',
                                fontSize: '11px',
                                fontWeight: 500
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#94A3B8', marginBottom: '12px' }}>
                        {offering.description}
                      </p>

                      {/* 4-Image Gallery */}
                      {Array.isArray(offering.images) && offering.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 business-profile-offering-gallery">
                          {offering.images.slice(0, 4).map((image: string, idx: number) => (
                            <div
                              key={idx}
                              className="overflow-hidden rounded-lg"
                              style={{
                                border: '2px solid rgba(6, 132, 245, 0.3)',
                                aspectRatio: '1',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0684F5';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(6, 132, 245, 0.3)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <img
                                src={image}
                                alt={`${offering.name} gallery ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {offerings.length === 0 && (
                   <div className="col-span-2 text-center py-10 text-gray-500">{t('businessProfilePage.offerings.empty')}</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="col-span-4 space-y-6 business-profile-right">
            {/* Contact Information */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('businessProfilePage.contact.title')}
              </h3>
              
              <div className="space-y-4">
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 transition-colors"
                    style={{ color: '#94A3B8' }}
                  >
                    <div 
                      className="flex items-center justify-center rounded-full"
                      style={{ width: '32px', height: '32px', backgroundColor: 'rgba(6, 132, 245, 0.2)' }}
                    >
                      <Globe size={16} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '14px' }}>{business.website}</span>
                  </a>
                )}

                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 transition-colors"
                  style={{ color: '#94A3B8' }}
                >
                  <div 
                    className="flex items-center justify-center rounded-full"
                    style={{ width: '32px', height: '32px', backgroundColor: 'rgba(6, 132, 245, 0.2)' }}
                  >
                    <Mail size={16} style={{ color: '#0684F5' }} />
                  </div>
                  <span style={{ fontSize: '14px' }}>{business.email}</span>
                </a>

                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-3 transition-colors"
                    style={{ color: '#94A3B8' }}
                  >
                    <div 
                      className="flex items-center justify-center rounded-full"
                      style={{ width: '32px', height: '32px', backgroundColor: 'rgba(6, 132, 245, 0.2)' }}
                    >
                      <Phone size={16} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '14px' }}>{business.phone}</span>
                  </a>
                )}

                {business.address && (
                  <div className="flex items-center gap-3" style={{ color: '#94A3B8' }}>
                    <div 
                      className="flex items-center justify-center rounded-full"
                      style={{ width: '32px', height: '32px', backgroundColor: 'rgba(6, 132, 245, 0.2)' }}
                    >
                      <MapPin size={16} style={{ color: '#0684F5' }} />
                    </div>
                    <span style={{ fontSize: '14px' }}>{business.address}</span>
                  </div>
                )}
              </div>
            </div>


            {/* Social Media Section */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('businessProfilePage.follow')}
              </h3>
              
              {isEditMode ? (
                <div className="space-y-3">
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px', display: 'block' }}>
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border outline-none"
                      style={{
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg transition-colors"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg transition-colors"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg transition-colors"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg transition-colors"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* B2B Parameters Section */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Handshake size={18} style={{ color: '#0684F5' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('businessProfilePage.b2b.title')}
                </h3>
              </div>
              
              {/* Seeking */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} style={{ color: '#4A7C6D' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    {t('businessProfilePage.b2b.seeking')}
                  </h4>
                </div>
                
                {isEditMode ? (
                  <div 
                    className="rounded-lg p-2 border"
                    style={{ 
                      backgroundColor: '#0B2641',
                      borderColor: 'rgba(255,255,255,0.2)',
                      minHeight: '60px'
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {seekingTags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(74, 124, 109, 0.2)',
                            color: '#4A7C6D',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => setSeekingTags(seekingTags.filter((_, i) => i !== index))}
                            style={{ color: '#4A7C6D' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder={t('businessProfilePage.b2b.placeholder')}
                      value={seekingInput}
                      onChange={(e) => setSeekingInput(e.target.value)}
                      onKeyPress={handleAddSeekingTag}
                      className="w-full bg-transparent border-none outline-none"
                      style={{
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {seekingTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(74, 124, 109, 0.2)',
                          color: '#4A7C6D',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid rgba(74, 124, 109, 0.3)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Offering */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={14} style={{ color: '#0684F5' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    {t('businessProfilePage.b2b.offering')}
                  </h4>
                </div>
                
                {isEditMode ? (
                  <div 
                    className="rounded-lg p-2 border"
                    style={{ 
                      backgroundColor: '#0B2641',
                      borderColor: 'rgba(255,255,255,0.2)',
                      minHeight: '60px'
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {offeringTags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'rgba(6, 132, 245, 0.2)',
                            color: '#0684F5',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => setOfferingTags(offeringTags.filter((_, i) => i !== index))}
                            style={{ color: '#0684F5' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder={t('businessProfilePage.b2b.placeholder')}
                      value={offeringInput}
                      onChange={(e) => setOfferingInput(e.target.value)}
                      onKeyPress={handleAddOfferingTag}
                      className="w-full bg-transparent border-none outline-none"
                      style={{
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {offeringTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.2)',
                          color: '#0684F5',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid rgba(6, 132, 245, 0.3)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specializations */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                {t('businessProfilePage.specializations')}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {sectorTags.map((sector, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.15)',
                      color: '#0684F5',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: '1px solid rgba(6, 132, 245, 0.3)'
                    }}
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            {!isOwner && (
              <div 
                className="rounded-xl p-6 text-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(6, 132, 245, 0.2) 0%, rgba(74, 124, 109, 0.2) 100%)',
                  border: '1px solid rgba(6, 132, 245, 0.3)'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                  {t('businessProfilePage.cta.title')}
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
                  {t('businessProfilePage.cta.subtitle')}
                </p>
                <button
                  onClick={handleContact}
                  disabled={connecting}
                  className="w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#0684F5',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: connecting ? 'not-allowed' : 'pointer',
                    opacity: connecting ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !connecting && (e.currentTarget.style.backgroundColor = '#0570D6')}
                  onMouseLeave={(e) => !connecting && (e.currentTarget.style.backgroundColor = '#0684F5')}
                >
                  {connecting && <Loader2 size={16} className="animate-spin" />}
                  {t('businessProfilePage.cta.button')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowAddMemberModal(false)}
        >
          <div
            className="relative rounded-xl p-6"
            style={{
              width: '500px',
              backgroundColor: '#1E3A5F',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0px 10px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('businessDashboard.modals.addMember.title')}
              </h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                style={{ color: '#94A3B8' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label 
                className="block mb-2"
                style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
              >
                {t('businessDashboard.modals.addMember.searchLabel')}
              </label>
              <div className="relative">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#94A3B8' }}
                />
                <input
                  type="text"
                  placeholder={t('businessDashboard.modals.addMember.searchPlaceholder')}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none"
                  style={{
                    backgroundColor: '#0B2641',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-[#0684F5]" />
                  </div>
                )}
              </div>

              {/* Search Results List */}
              {searchResults.length > 0 && (
                <div 
                  className="mt-2 rounded-lg overflow-hidden border border-rgba(255,255,255,0.1)"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleAddExistingUser(profile)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-[#0684F5] hover:bg-opacity-20 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold text-xs">
                            {profile.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {profile.email}
                        </p>
                      </div>
                      <Plus size={16} className="text-[#0684F5]" />
                    </button>
                  ))}
                </div>
              )}
              
              {searchEmail.length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="mt-2 text-xs text-gray-500 text-center">{t('businessDashboard.modals.addMember.noResults', { query: searchEmail })}</p>
              )}
            </div>

            {/* Info */}
            <div 
              className="mb-6 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', border: '1px solid rgba(6, 132, 245, 0.3)' }}
            >
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {t('businessDashboard.modals.addMember.info')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('businessDashboard.modals.addMember.cancel')}
              </button>
              <button
                onClick={handleInviteMember}
                disabled={!searchEmail.trim() || isSaving}
                className="flex-1 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: searchEmail.trim() ? '#0684F5' : '#334155',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (searchEmail.trim() && !isSaving) ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (searchEmail.trim() && !isSaving) e.currentTarget.style.backgroundColor = '#0570D6';
                }}
                onMouseLeave={(e) => {
                  if (searchEmail.trim() && !isSaving) e.currentTarget.style.backgroundColor = '#0684F5';
                }}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {t('businessDashboard.modals.addMember.addToTeam')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
