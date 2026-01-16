import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { 
  Home,
  Edit,
  Users,
  Sparkles,
  Globe,
  Palette,
  BarChart3,
  Eye,
  Check,
  Plus,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  MousePointer,
  Bookmark,
  RefreshCw,
  Download,
  Share2,
  RotateCcw,
  Upload,
  FileText,
  X,
  ChevronDown,
  Menu,
  Mail,
  Phone,
  MapPin,
  Lightbulb,
  Target,
  Award,
  Package,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ProductsManagementTab from './ProductsManagementTab';
import { toast } from 'sonner@2.0.3';
import { uploadBusinessLogo, uploadFile } from '../../utils/storage';
import { createNotification } from '../../lib/notifications';
import { useI18n } from '../../i18n/I18nContext';

type ProfileStatus = 'draft' | 'pending' | 'live';
type TabKey = 'dashboard' | 'profile' | 'team' | 'products' | 'ai' | 'visibility' | 'appearance' | 'analytics';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited';
  avatar?: string;
}

interface BusinessDocument {
  id: string;
  name: string;
  type?: string;
  file_url: string;
}

const SUGGESTED_TAGS = ['SaaS', 'EventTech', 'Registration', 'Analytics', 'B2B'];
const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Spain',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Singapore',
  'Australia'
];

export default function BusinessManagementDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileStrength, setProfileStrength] = useState(0);
  const [originalDescription, setOriginalDescription] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [dashboardCounts, setDashboardCounts] = useState({
    offerings: 0,
    documents: 0,
    members: 0
  });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [primarySector, setPrimarySector] = useState('');
  const [secondarySector, setSecondarySector] = useState('');
  const [accentColor, setAccentColor] = useState('#0684F5');
  const [layoutStyle, setLayoutStyle] = useState<'standard' | 'modern'>('standard');
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showComparison, setShowComparison] = useState(false);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  const [isExportingAnalytics, setIsExportingAnalytics] = useState(false);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);
  const [isSharingAnalytics, setIsSharingAnalytics] = useState(false);
  const [isEmailingSummary, setIsEmailingSummary] = useState(false);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [description, setDescription] = useState('');
  const [sectorTags, setSectorTags] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<BusinessDocument[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (user) {
      fetchBusinessProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!openMemberMenuId) return;
    const handleClickOutside = () => setOpenMemberMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMemberMenuId]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => setIsMobileViewport(window.innerWidth <= 600);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  const fetchBusinessProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_profile_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBusiness(data);
        setOriginalDescription(data.description || '');
        setSelectedCountries(data.branding?.reach_countries || []);
        setPrimarySector(data.branding?.primary_sector || data.sectors?.[0] || '');
        setSecondarySector(data.branding?.secondary_sector || data.sectors?.[1] || '');
        setAccentColor(data.branding?.accent_color || '#0684F5');
        setLayoutStyle(data.branding?.layout_style === 'modern' ? 'modern' : 'standard');
        const [offeringsRes, docsRes, membersRes] = await Promise.all([
          supabase.from('business_offerings').select('id', { count: 'exact', head: true }).eq('business_id', data.id),
          supabase.from('business_documents').select('id, name, type, file_url', { count: 'exact' }).eq('business_id', data.id),
          supabase.from('business_members').select('profile_id, role, profiles:profiles(id, full_name, email, avatar_url)').eq('business_id', data.id)
        ]);

        if (!membersRes.error) {
          const mapped = (membersRes.data || []).map((member: any) => {
            const name = member.profiles?.full_name || member.profiles?.email || 'Team Member';
            const email = member.profiles?.email || '';
            const role = member.role === 'owner' ? 'owner' : (member.role === 'admin' || member.role === 'editor' ? 'admin' : 'member');
            return {
              id: member.profile_id,
              name,
              email,
              role,
              status: 'active',
              avatar: member.profiles?.avatar_url || undefined
            } as TeamMember;
          });
          setTeamMembers(mapped);
        } else {
          setTeamMembers([]);
        }

        setUploadedFiles(docsRes.data || []);

        setDashboardCounts({
          offerings: offeringsRes.count ?? 0,
          documents: docsRes.count ?? 0,
          members: membersRes.data?.length ?? 0
        });

        calculateStrength(data, {
          offerings: offeringsRes.count ?? 0,
          documents: docsRes.count ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!business) return;
    setCompanyName(business.company_name || '');
    setCompanySize(business.company_size || '');
    setDescription(business.description || '');
    setSectorTags(business.sectors || []);
    setBusinessEmail(business.email || '');
    setBusinessPhone(business.phone || '');
    setWebsite(business.website || '');
    setAddress(business.address || '');
    setLogoUrl(business.logo_url || '');
    setCoverUrl(business.cover_url || '');
  }, [business]);

  const calculateStrength = (biz: any, counts?: { offerings: number; documents: number }) => {
    let score = 0;
    if (biz.company_name) score += 20;
    if (biz.description) score += 20;
    if (biz.logo_url) score += 20;
    if (biz.sectors?.length > 0) score += 20;
    if (biz.website) score += 20;
    if ((counts?.offerings ?? 0) > 0) score += 10;
    if ((counts?.documents ?? 0) > 0) score += 10;
    setProfileStrength(score);
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
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B2641] text-white">
        <h2 className="text-2xl font-bold mb-4">{t('businessDashboard.notFound')}</h2>
        <button onClick={() => navigate('/business-profile-wizard')} className="px-6 py-2 bg-[#0684F5] rounded-lg">{t('businessDashboard.actions.createProfile')}</button>
      </div>
    );
  }

  const menuItems = [
    { key: 'dashboard' as TabKey, label: t('businessDashboard.tabs.dashboard'), icon: Home },
    { key: 'profile' as TabKey, label: t('businessDashboard.tabs.profile'), icon: Edit },
    { key: 'team' as TabKey, label: t('businessDashboard.tabs.team'), icon: Users },
    { key: 'products' as TabKey, label: t('businessDashboard.tabs.products'), icon: Package },
    { key: 'ai' as TabKey, label: t('businessDashboard.tabs.ai'), icon: Sparkles, highlight: true },
    { key: 'visibility' as TabKey, label: t('businessDashboard.tabs.visibility'), icon: Globe },
    { key: 'appearance' as TabKey, label: t('businessDashboard.tabs.appearance'), icon: Palette },
    { key: 'analytics' as TabKey, label: t('businessDashboard.tabs.analytics'), icon: BarChart3 }
  ];
  const activeTabLabel = menuItems.find((item) => item.key === activeTab)?.label ?? t('businessDashboard.tabs.dashboard');

  const getStatusConfig = (isPublic: boolean, status: string) => {
    if (!isPublic) return { label: t('businessDashboard.status.draft'), color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
    if (status === 'pending') return { label: t('businessDashboard.status.pending'), color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: t('businessDashboard.status.live'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
  };

  const handleOptimizeContent = () => {
    setIsGenerating(true);
    setShowAISuggestion(false);
    
    setTimeout(() => {
      const suggestion = "Elevate your event experiences with our cutting-edge software solutions. We specialize in creating powerful, intuitive platforms that streamline event management, enhance attendee engagement, and deliver measurable results for organizers worldwide.";
      setAiSuggestion(suggestion);
      setShowAISuggestion(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    setOriginalDescription(aiSuggestion);
    handleUpdateBusiness({ description: aiSuggestion });
    setShowAISuggestion(false);
    setAiSuggestion('');
  };

  const updateBranding = (updates: Record<string, any>) => {
    const nextBranding = { ...(business?.branding || {}), ...updates };
    handleUpdateBusiness({ branding: nextBranding });
  };

  const buildSectorList = (primary: string, secondary: string) => {
    const base = [primary, secondary].filter(Boolean);
    const existing = business?.sectors || [];
    const extras = existing.filter((sector: string) => !base.includes(sector));
    return [...base, ...extras];
  };

  const toggleCountry = (country: string) => {
    const next = selectedCountries.includes(country)
      ? selectedCountries.filter((item) => item !== country)
      : [...selectedCountries, country];
    setSelectedCountries(next);
    updateBranding({ reach_countries: next });
  };

  const clearCountries = () => {
    setSelectedCountries([]);
    updateBranding({ reach_countries: [] });
  };

  const handlePrimarySectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setPrimarySector(next);
    handleUpdateBusiness({
      sectors: buildSectorList(next, secondarySector),
      branding: { ...(business?.branding || {}), primary_sector: next, secondary_sector: secondarySector }
    });
  };

  const handleSecondarySectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setSecondarySector(next);
    handleUpdateBusiness({
      sectors: buildSectorList(primarySector, next),
      branding: { ...(business?.branding || {}), primary_sector: primarySector, secondary_sector: next }
    });
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    updateBranding({ accent_color: color });
  };

  const handleLayoutStyleChange = (style: 'standard' | 'modern') => {
    setLayoutStyle(style);
    updateBranding({ layout_style: style });
  };

  const handleApplySuggestedTags = () => {
    const next = Array.from(new Set([...(business?.sectors || []), ...SUGGESTED_TAGS]));
    handleUpdateBusiness({ sectors: next });
  };

  const handlePublicListingToggle = async (nextValue: boolean) => {
    const updates: any = { is_public: nextValue };
    
    // Automatically request validation if making public and not already verified
    if (nextValue && business.verification_status !== 'verified') {
      updates.verification_status = 'pending';
    }
    
    await handleUpdateBusiness(updates);
    if (business?.owner_profile_id) {
      try {
        await createNotification({
          recipient_id: business.owner_profile_id,
          actor_id: business.owner_profile_id,
          title: nextValue ? 'Marketplace listing enabled' : 'Marketplace listing disabled',
          body: nextValue
            ? 'Your business profile is now visible in the public directory.'
            : 'Your business profile is no longer visible in the public directory.',
          type: 'system',
          action_url: '/business-management'
        });
      } catch {
        // Ignore notification errors
      }
    }
  };

  const handleSectorKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const trimmed = sectorInput.trim();
    if (!trimmed || sectorTags.includes(trimmed)) return;
    setSectorTags([...sectorTags, trimmed]);
    setSectorInput('');
  };

  const removeSectorTag = (tagToRemove: string) => {
    setSectorTags(sectorTags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover' | 'document'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !business?.id) return;

    try {
      if (type === 'logo') {
        const url = await uploadBusinessLogo(business.id, file);
        if (!url) throw new Error('Logo upload failed');
        setLogoUrl(url);
        await handleUpdateBusiness({ logo_url: url });
      } else if (type === 'cover') {
        const extension = file.name.split('.').pop();
        const path = `${business.id}/cover.${extension}`;
        const url = await uploadFile('business-assets', path, file);
        if (!url) throw new Error('Cover upload failed');
        setCoverUrl(url);
        await handleUpdateBusiness({ cover_url: url });
      } else {
        const path = `${business.id}/docs/${Date.now()}_${file.name}`;
        const url = await uploadFile('business-docs', path, file);
        if (!url) throw new Error('Document upload failed');
        const { data, error } = await supabase
          .from('business_documents')
          .insert([
            {
              business_id: business.id,
              name: file.name,
              type: 'legal',
              file_url: url
            }
          ])
          .select()
          .single();
        if (error) throw error;
        setUploadedFiles((prev) => [...prev, data]);
        setDashboardCounts((prev) => ({ ...prev, documents: prev.documents + 1 }));
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase.from('business_documents').delete().eq('id', docId);
      if (error) throw error;
      setUploadedFiles((prev) => prev.filter((file) => file.id !== docId));
      setDashboardCounts((prev) => ({ ...prev, documents: Math.max(0, prev.documents - 1) }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleSaveProfileDetails = async () => {
    await handleUpdateBusiness({
      company_name: companyName.trim(),
      company_size: companySize.trim(),
      description: description.trim(),
      sectors: sectorTags,
      email: businessEmail.trim(),
      phone: businessPhone.trim(),
      website: website.trim(),
      address: address.trim(),
      logo_url: logoUrl,
      cover_url: coverUrl
    });
    setOriginalDescription(description.trim());
  };

  const getMetricValue = (key: string) => {
    const metrics = business?.branding?.metrics || {};
    const rangeKey = `${key}_${analyticsRange}`;
    return Number(metrics[rangeKey] ?? metrics[`${key}_30d`] ?? metrics[key] ?? 0);
  };

  const handleRefreshAnalytics = () => {
    setIsRefreshingAnalytics(true);
    setTimeout(() => {
      setIsRefreshingAnalytics(false);
      toast.success('Analytics refreshed');
    }, 700);
  };

  const handleExportAnalytics = () => {
    if (!business) return;
    setIsExportingAnalytics(true);
    const rows = [
      ['metric', 'value', 'range'],
      ['views', String(getMetricValue('views')), analyticsRange],
      ['leads', String(getMetricValue('leads')), analyticsRange],
      ['saved', String(getMetricValue('saved')), analyticsRange]
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${business.company_name || 'business'}_analytics_${analyticsRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExportingAnalytics(false), 300);
  };

  const handleSnapshotDownload = () => {
    if (!business) return;
    setIsGeneratingSnapshot(true);
    const snapshot = {
      business_id: business.id,
      range: analyticsRange,
      metrics: {
        views: getMetricValue('views'),
        leads: getMetricValue('leads'),
        saved: getMetricValue('saved')
      },
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${business.company_name || 'business'}_snapshot.json`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsGeneratingSnapshot(false), 300);
  };

  const handleShareAnalytics = async () => {
    setIsSharingAnalytics(true);
    const shareUrl = `${window.location.origin}/business-profile/${business?.id || ''}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied');
    } catch {
      toast.error('Copy failed');
    } finally {
      setIsSharingAnalytics(false);
    }
  };

  const handleEmailSummary = () => {
    if (!businessEmail) {
      toast.error('Add a business email to send a summary');
      return;
    }
    setIsEmailingSummary(true);
    const subject = encodeURIComponent('Business Analytics Summary');
    const body = encodeURIComponent(
      `Here is your ${analyticsRange} analytics summary:\n\nViews: ${getMetricValue('views')}\nLeads: ${getMetricValue('leads')}\nSaved: ${getMetricValue('saved')}`
    );
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
    setTimeout(() => setIsEmailingSummary(false), 300);
  };

  const handleResetAnalytics = () => {
    setAnalyticsRange('30d');
    setShowComparison(false);
    toast.success('Analytics reset');
  };

  const handleMemberRoleChange = async (memberId: string, role: TeamMember['role']) => {
    if (!business?.id) return;
    try {
      setMemberActionId(memberId);
      const { error } = await supabase
        .from('business_members')
        .update({ role })
        .eq('business_id', business.id)
        .eq('profile_id', memberId);
      if (error) throw error;
      setTeamMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role } : member)));
      try {
        await createNotification({
          recipient_id: memberId,
          actor_id: business.owner_profile_id,
          title: 'Team role updated',
          body: `Your role on ${business.company_name} is now ${role}.`,
          type: 'action',
          action_url: `/business-profile/${business.id}`
        });
      } catch {
        // Ignore notification errors
      }
      toast.success('Member role updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    } finally {
      setMemberActionId(null);
      setOpenMemberMenuId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!business?.id) return;
    try {
      setMemberActionId(memberId);
      const { error } = await supabase
        .from('business_members')
        .delete()
        .eq('business_id', business.id)
        .eq('profile_id', memberId);
      if (error) throw error;
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      setDashboardCounts((prev) => ({ ...prev, members: Math.max(0, prev.members - 1) }));
      try {
        await createNotification({
          recipient_id: memberId,
          actor_id: business.owner_profile_id,
          title: 'Removed from team',
          body: `You were removed from ${business.company_name}.`,
          type: 'action',
          action_url: `/business/${business.id}`
        });
      } catch {
        // Ignore notification errors
      }
      toast.success('Member removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    } finally {
      setMemberActionId(null);
      setOpenMemberMenuId(null);
    }
  };

  const handleAddExistingUser = async (profile: any) => {
    if (!business?.id) return;
    
    try {
      setIsSaving(true);
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
          role: 'member'
        });

      if (insertError) throw insertError;

      setTeamMembers((prev) => [
        ...prev,
        { 
          id: profile.id, 
          name: profile.full_name || profile.email || 'Team Member', 
          email: profile.email || '',
          role: 'member', 
          status: 'active',
          avatar: profile.avatar_url || undefined 
        }
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
      setIsSaving(false);
    }
  };

  const handleInviteMember = async () => {
    if (!searchEmail.trim() || !business?.id) return;
    
    try {
      setIsSaving(true);
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
          role: 'member'
        });

      if (insertError) throw insertError;

      setTeamMembers((prev) => [
        ...prev,
        { 
          id: profile.id, 
          name: profile.full_name || profile.email || 'Team Member', 
          email: profile.email || '',
          role: 'member', 
          status: 'active',
          avatar: profile.avatar_url || undefined 
        }
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
      setIsSaving(false);
    }
  };

  const handleUpdateBusiness = async (updates: any) => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from('business_profiles').update(updates).eq('id', business.id);
      if (error) throw error;
      setBusiness({ ...business, ...updates });
      toast.success('Updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestValidation = () => {
    handleUpdateBusiness({ verification_status: 'pending' });
  };

  const profileStatus: ProfileStatus = business.is_public
    ? (business.verification_status === 'pending' ? 'pending' : 'live')
    : 'draft';

  const metrics = business.branding?.metrics || {};
  const viewsCount = Number(metrics.views_30d) || 0;
  const leadsCount = Number(metrics.leads_30d) || 0;
  const savedCount = Number(metrics.saved_30d) || 0;
  const viewsDelta = Number(metrics.views_change_pct) || 0;
  const leadsDelta = Number(metrics.leads_change_pct) || 0;
  const savedDelta = Number(metrics.saved_change_pct) || 0;
  const formatDelta = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;

  const offeringsNeeded = Math.max(0, 2 - dashboardCounts.offerings);

  const statusConfig = getStatusConfig(business.is_public, business.verification_status);
  const filteredCountries = COUNTRY_OPTIONS.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const analyticsViews = getMetricValue('views');
  const analyticsLeads = getMetricValue('leads');
  const analyticsSaved = getMetricValue('saved');
  const analyticsActivity = Array.isArray(metrics.activity)
    ? metrics.activity
    : [18, 26, 34, 22, 40, 28, 36];
  const leadRate = analyticsViews > 0 ? Math.round((analyticsLeads / analyticsViews) * 100) : 0;
  const saveRate = analyticsViews > 0 ? Math.round((analyticsSaved / analyticsViews) * 100) : 0;
  const statusActions = (
    <>
      <button
        onClick={() => navigate('/business-profile-wizard')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer'
        }}
      >
        {t('businessDashboard.actions.editWizard')}
      </button>
      <button
        onClick={() => navigate('/business-profile')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: 'rgba(6, 132, 245, 0.15)',
          color: '#0684F5',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid rgba(6, 132, 245, 0.4)',
          cursor: 'pointer'
        }}
      >
        <Eye size={18} />
        {t('businessDashboard.actions.viewProfile')}
      </button>
      <button
        onClick={() => navigate(`/profile/${business.owner_profile_id}`)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer'
        }}
      >
        <Eye size={18} />
        {t('businessDashboard.actions.viewPublic')}
      </button>
    </>
  );

  return (
    <div className="business-dashboard" style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`
        @media (max-width: 600px) {
          .business-dashboard__status-bar {
            height: auto;
          }

          .business-dashboard__status-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
          }

          .business-dashboard__company-name {
            font-size: 16px;
          }

          .business-dashboard__status-actions {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }

          .business-dashboard__status-actions button {
            flex: 1 1 160px;
            justify-content: center;
          }

          .business-dashboard__status-actions {
            display: none;
          }

          .business-dashboard__mobile-actions {
            display: flex !important;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
          }

          .business-dashboard__mobile-actions button {
            flex: 1 1 160px;
            justify-content: center;
          }

          .business-dashboard__layout {
            flex-direction: column;
          }

          .business-dashboard__mobile-trigger {
            display: flex;
            position: sticky;
            top: 0;
            z-index: 55;
          }

          .business-dashboard__sidebar {
            display: none;
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0 !important;
            background-color: rgba(11, 38, 65, 0.95) !important;
          }

          .business-dashboard__sidebar.is-open {
            background-color: #0B2641 !important;
          }

          .business-dashboard__sidebar.is-open {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 100vh;
            overflow-y: auto;
            z-index: 60;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
          }

          .business-dashboard__nav-backdrop {
            display: none;
          }

          .business-dashboard__nav-backdrop.is-visible {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.55);
            z-index: 50;
          }

          .business-dashboard__nav {
            display: block;
            padding: 0 16px 12px;
          }

          .business-dashboard__nav button {
            width: 100%;
            border-left: 0 !important;
            text-align: left;
            white-space: normal;
          }

          .business-dashboard__nav.is-collapsed {
            display: none;
          }

          .business-dashboard__nav-toggle {
            display: none;
          }

          .business-dashboard__main {
            padding: 20px 16px;
          }

          .business-dashboard__health-layout {
            flex-direction: column;
            align-items: flex-start;
          }

          .business-dashboard__health-meter {
            width: 110px !important;
            height: 110px !important;
            margin: 0 auto 8px;
            overflow: visible;
          }

          .business-dashboard__health-meter svg {
            width: 110px;
            height: 110px;
            overflow: visible;
          }

          .business-dashboard__health-percent {
            font-size: 24px !important;
          }

          .business-dashboard__health-label {
            font-size: 10px !important;
          }

          .business-dashboard__health-card {
            padding: 20px !important;
            overflow: visible;
          }

          .business-dashboard__health-layout {
            align-items: center;
            text-align: center;
          }

          .business-dashboard__health-content {
            width: 100%;
          }

          .business-dashboard__mobile-trigger {
            margin-bottom: 12px;
          }

          .business-dashboard__analytics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .business-dashboard .grid.grid-cols-3,
          .business-dashboard .grid.grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .business-dashboard__modal {
            width: calc(100% - 24px) !important;
            max-width: 100% !important;
            padding: 20px !important;
            max-height: calc(100vh - 32px);
            overflow-y: auto;
          }
        }

        @media (max-width: 400px) {
          .business-dashboard__status-inner {
            padding: 10px 12px;
          }

          .business-dashboard__company-name {
            font-size: 15px;
          }

          .business-dashboard__nav {
            padding: 0 12px 12px;
          }

          .business-dashboard__mobile-toggle {
            right: 12px;
            bottom: 16px;
          }

          .business-dashboard__nav button {
            padding: 10px 12px;
            font-size: 12px;
          }

          .business-dashboard__main {
            padding: 16px 12px;
          }

          .business-dashboard__mobile-actions button {
            flex: 1 1 100%;
          }

          .business-dashboard__health-meter {
            width: 96px !important;
            height: 96px !important;
            margin: 0 auto 8px;
          }

          .business-dashboard__health-meter svg {
            width: 96px;
            height: 96px;
          }

          .business-dashboard__health-percent {
            font-size: 22px !important;
          }

          .business-dashboard__health-label {
            font-size: 9px !important;
          }

          .business-dashboard__team-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .business-dashboard__team-header button {
            width: 100%;
            justify-content: center;
          }

          .business-dashboard__team-table-header {
            display: none;
          }

          .business-dashboard__team-row {
            display: block;
            padding: 16px;
          }

          .business-dashboard__team-name,
          .business-dashboard__team-role,
          .business-dashboard__team-status,
          .business-dashboard__team-actions {
            width: 100%;
            margin-bottom: 10px;
          }

          .business-dashboard__team-actions {
            justify-content: flex-start;
          }

          .business-dashboard__status-actions button {
            font-size: 12px;
            padding: 10px 12px;
          }

          .business-dashboard__modal {
            width: calc(100% - 16px) !important;
            padding: 16px !important;
            max-height: calc(100vh - 24px);
          }
        }
      `}</style>
      {/* Top Status Bar */}
      <div
        className="business-dashboard__status-bar"
        style={{
          height: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(11, 38, 65, 0.95)'
        }}
      >
        <div className="business-dashboard__status-inner h-full flex items-center justify-between px-8">
          {/* Left - Company Name */}
          <div>
            <h1 className="business-dashboard__company-name" style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
              {business.company_name}
            </h1>
          </div>

          {/* Center - Status Badge */}
          <div
            className="px-4 py-2 rounded-full flex items-center gap-2"
            style={{
              backgroundColor: statusConfig.bg,
              border: `1px solid ${statusConfig.color}`
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statusConfig.color
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: statusConfig.color }}>
              {statusConfig.label}
            </span>
          </div>

          {/* Right - Profile Links */}
          <div className="business-dashboard__status-actions flex items-center gap-3">
            {statusActions}
          </div>
        </div>
      </div>

      {isMobileViewport && (
        <button
          className="business-dashboard__mobile-toggle"
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
          style={{
            position: 'fixed',
            left: isMobileViewport ? '16px' : undefined,
            bottom: isMobileViewport ? '20px' : undefined,
            width: '48px',
            height: '48px',
            borderRadius: '999px',
            backgroundColor: '#0684F5',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 12px 24px rgba(6, 132, 245, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      <div
        className={`business-dashboard__nav-backdrop ${isMobileNavOpen ? 'is-visible' : ''}`}
        onClick={() => setIsMobileNavOpen(false)}
      />
      <div className="business-dashboard__layout flex">
        {/* Sidebar Navigation */}
        <aside
          className={`business-dashboard__sidebar ${isMobileNavOpen ? 'is-open' : ''}`}
          style={{
            width: '260px',
            minHeight: 'calc(100vh - 132px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(11, 38, 65, 0.5)',
            padding: '24px 0'
          }}
        >
          <nav className={`business-dashboard__nav ${isMobileNavOpen ? 'is-open' : 'is-collapsed'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-3 transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(6, 132, 245, 0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #0684F5' : '3px solid transparent',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderBottom: 'none',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  <Icon size={20} style={{ color: item.highlight ? '#F59E0B' : 'inherit' }} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span
                      className="ml-auto px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        color: '#F59E0B',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="business-dashboard__main flex-1" style={{ padding: '40px' }}>
          {/* Profile Details Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl space-y-8">
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                  {t('businessDashboard.profile.title')}
                </h2>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('businessDashboard.profile.subtitle')}
                </p>
              </div>

              {/* Company Essentials */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
                  {t('businessDashboard.profile.essentials')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.companyName')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('businessProfileWizard.essentials.companyNamePlaceholder')}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 rounded-lg border outline-none transition-colors"
                      style={{
                        height: '48px',
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.companySize')}
                    </label>
                    <div className="relative">
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-4 rounded-lg border outline-none appearance-none transition-colors"
                        style={{
                          height: '48px',
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: companySize ? '#FFFFFF' : '#94A3B8',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">{t('businessProfileWizard.essentials.companySizePlaceholder')}</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                      <ChevronDown
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: '#94A3B8' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.description')}
                    </label>
                    <textarea
                      placeholder={t('businessProfileWizard.essentials.companyDescriptionPlaceholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border outline-none resize-none transition-colors"
                      style={{
                        height: '120px',
                        backgroundColor: '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: '14px'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                      {t('businessProfileWizard.essentials.charCount', { count: description.length })}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.legalDocs')}
                    </label>
                    <input
                      type="file"
                      ref={docInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'document')}
                    />
                    <div
                      onClick={() => docInputRef.current?.click()}
                      className="rounded-lg p-8 text-center border-2 border-dashed cursor-pointer transition-colors"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <Upload size={32} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('businessProfileWizard.essentials.uploadHint')} <span style={{ color: '#0684F5' }}>{t('businessProfileWizard.essentials.uploadBrowse')}</span>
                      </p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('businessProfileWizard.essentials.uploadSupport')}
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText size={20} style={{ color: '#0684F5' }} />
                              <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{file.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument(file.id)}
                              className="transition-colors"
                              style={{ color: '#94A3B8' }}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Industry Sectors */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="mb-6">
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {t('businessDashboard.profile.sectors.title')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessDashboard.profile.sectors.subtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: '#0B2641',
                      borderColor: 'rgba(255,255,255,0.2)',
                      minHeight: '120px'
                    }}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sectorTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                          style={{
                            backgroundColor: '#0684F5',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => removeSectorTag(tag)}
                            className="transition-colors"
                            style={{ color: '#FFFFFF' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder={t('businessProfileWizard.sectors.placeholder')}
                      value={sectorInput}
                      onChange={(e) => setSectorInput(e.target.value)}
                      onKeyDown={handleSectorKeyPress}
                      className="w-full bg-transparent border-none outline-none"
                      style={{ color: '#FFFFFF', fontSize: '14px' }}
                    />
                  </div>

                  <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                    {t('businessProfileWizard.sectors.hint')}
                  </p>
                </div>
              </div>

              {/* Branding */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
                  {t('businessDashboard.profile.branding.title')}
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.branding.logo')}
                    </label>
                    <input type="file" ref={logoInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} />
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center justify-center rounded-full border-2 border-dashed cursor-pointer transition-colors overflow-hidden"
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        margin: '0 auto'
                      }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload size={24} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '11px', color: '#94A3B8' }}>{t('businessProfileWizard.identity.uploadLogo')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.branding.cover')}
                    </label>
                    <input type="file" ref={coverInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'cover')} />
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors overflow-hidden"
                      style={{
                        height: '120px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      {coverUrl ? (
                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload size={28} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '4px' }}>
                            {t('businessProfileWizard.identity.uploadCover')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="rounded-2xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
                  {t('businessDashboard.profile.contact.title')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.contact.email')}
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8' }}
                      />
                      <input
                        type="email"
                        placeholder="contact@company.com"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        className="w-full pl-12 pr-4 rounded-lg border outline-none"
                        style={{
                          height: '48px',
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.contact.phone')}
                    </label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8' }}
                      />
                      <input
                        type="tel"
                        placeholder="+1 555-0123"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        className="w-full pl-12 pr-4 rounded-lg border outline-none"
                        style={{
                          height: '48px',
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.contact.website')}
                    </label>
                    <div className="relative">
                      <Globe
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8' }}
                      />
                      <input
                        type="url"
                        placeholder="www.company.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full pl-12 pr-4 rounded-lg border outline-none"
                        style={{
                          height: '48px',
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>
                      {t('businessDashboard.profile.contact.address')}
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8' }}
                      />
                      <input
                        type="text"
                        placeholder="123 Business St, City, Country"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-12 pr-4 rounded-lg border outline-none"
                        style={{
                          height: '48px',
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProfileDetails}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-lg font-bold transition-colors"
                  style={{
                    backgroundColor: isSaving ? '#334155' : '#0684F5',
                    color: '#FFFFFF',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? t('businessDashboard.profile.saving') : t('businessDashboard.profile.save')}
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="business-dashboard__mobile-actions" style={{ display: 'none' }}>
                {statusActions}
              </div>
              {/* Business Health Widget */}
              <div
                className="business-dashboard__health-card rounded-2xl p-8 mb-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,132,245,0.15) 0%, rgba(124,58,237,0.15) 100%)',
                  border: '1px solid rgba(6,132,245,0.3)'
                }}
              >
                <div className="business-dashboard__health-layout flex items-start gap-8">
                  {/* Circular Progress */}
                  <div className="business-dashboard__health-meter relative" style={{ width: '140px', height: '140px' }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="#0684F5"
                        strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 60}`}
                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - profileStrength / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <span className="business-dashboard__health-percent" style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF' }}>
                        {profileStrength}%
                      </span>
                      <span className="business-dashboard__health-label" style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Complete
                      </span>
                    </div>
                  </div>

                  {/* Action List */}
                  <div className="business-dashboard__health-content flex-1">
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                      {t('businessDashboard.strength.title')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid #10B981'
                          }}
                        >
                          <Check size={14} style={{ color: '#10B981' }} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#E2E8F0' }}>
                          {business.company_name && business.description ? t('businessDashboard.strength.basicInfo') : t('businessDashboard.strength.basicInfoIncomplete')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(6, 132, 245, 0.2)',
                            border: '1px solid #0684F5'
                          }}
                        >
                          <span style={{ fontSize: '10px', color: '#0684F5', fontWeight: 700 }}>
                            +5
                          </span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                          {offeringsNeeded > 0 ? t('businessDashboard.strength.offeringsNeeded', { count: offeringsNeeded }) : t('businessDashboard.strength.offeringsComplete')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid #F59E0B'
                          }}
                        >
                          <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 700 }}>
                            !
                          </span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                          {dashboardCounts.documents > 0 ? t('businessDashboard.strength.docsUploaded') : t('businessDashboard.strength.uploadDocs')}
                        </span>
                      </div>
                    </div>

                    <button
                      className="mt-6 px-6 py-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: '#0684F5',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveTab('profile')}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                    >
                      {t('businessDashboard.strength.improve')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(6, 132, 245, 0.1)'
                      }}
                    >
                      <Eye size={24} style={{ color: '#0684F5' }} />
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981'
                      }}
                    >
                      {formatDelta(viewsDelta)}
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    {viewsCount}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessDashboard.stats.views')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    {t('businessDashboard.stats.last30days')}
                  </div>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)'
                      }}
                    >
                      <MousePointer size={24} style={{ color: '#7C3AED' }} />
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981'
                      }}
                    >
                      {formatDelta(leadsDelta)}
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    {leadsCount}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessDashboard.stats.leads')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    {t('businessDashboard.stats.contactClicks')}
                  </div>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
                      }}
                    >
                      <Bookmark size={24} style={{ color: '#F59E0B' }} />
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981'
                      }}
                    >
                      {formatDelta(savedDelta)}
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    {savedCount}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessDashboard.stats.shortlisted')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    {t('businessDashboard.stats.savedUsers')}
                  </div>
                </div>
              </div>

              {/* Request Validation CTA */}
              {profileStatus === 'draft' && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid #F59E0B'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                        Ready to Go Live?
                      </h3>
                      <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                        Submit your profile for admin validation to appear in the marketplace
                      </p>
                    </div>
                    <button
                      onClick={handleRequestValidation}
                      className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
                      style={{
                        backgroundColor: '#F59E0B',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D97706'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F59E0B'}
                    >
                      {t('businessDashboard.actions.requestValidation')}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Advisor Tab */}
          {activeTab === 'ai' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={32} style={{ color: '#F59E0B' }} />
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('businessDashboard.ai.title')}
                </h2>
              </div>
              <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '32px' }}>
                {t('businessDashboard.ai.subtitle')}
              </p>

              {/* Content Optimizer */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Edit size={20} style={{ color: '#F59E0B' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {t('businessDashboard.ai.optimizer.title')}
                  </h3>
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                    {t('businessDashboard.ai.optimizer.current')}
                  </label>
                  <textarea
                    value={originalDescription}
                    onChange={(e) => setOriginalDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg p-4"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  onClick={handleOptimizeContent}
                  disabled={isGenerating}
                  className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all mb-4"
                  style={{
                    backgroundColor: isGenerating ? '#6B7280' : '#F59E0B',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating) e.currentTarget.style.backgroundColor = '#D97706';
                  }}
                  onMouseLeave={(e) => {
                    if (!isGenerating) e.currentTarget.style.backgroundColor = '#F59E0B';
                  }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {t('businessDashboard.ai.optimizer.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t('businessDashboard.ai.optimizer.rewrite')}
                    </>
                  )}
                </button>

                {showAISuggestion && (
                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid #F59E0B'
                    }}
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <Sparkles size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B', marginBottom: '8px' }}>
                          {t('businessDashboard.ai.optimizer.suggestion')}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: '1.6' }}>
                          {aiSuggestion}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptSuggestion}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                      >
                        {t('businessDashboard.ai.optimizer.accept')}
                      </button>
                      <button
                        onClick={handleOptimizeContent}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      >
                        {t('businessDashboard.ai.optimizer.tryAgain')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tag Generator */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target size={20} style={{ color: '#F59E0B' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {t('businessDashboard.ai.tags.title')}
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>
                  {t('businessDashboard.ai.tags.subtitle')}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        border: '1px solid #0684F5',
                        color: '#0684F5',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="px-5 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid #F59E0B',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'}
                  onClick={handleApplySuggestedTags}
                >
                  {t('businessDashboard.ai.tags.apply')}
                </button>
              </div>

              {/* Competitor Insight */}
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} style={{ color: '#F59E0B' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {t('businessDashboard.ai.competitor.title')}
                  </h3>
                </div>
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#E2E8F0', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "Similar businesses in your sector typically list 3-5 case studies. You currently have 0. Adding case studies can increase credibility by up to 60%."
                  </p>
                </div>
              </div>

              {/* Best Practices */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={20} style={{ color: '#F59E0B' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {t('businessDashboard.ai.bestPractices.title')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { tip: 'Profiles with a cover video get 40% more engagement', impact: 'High Impact' },
                    { tip: 'Adding team member profiles increases trust by 35%', impact: 'Medium Impact' },
                    { tip: 'Regular content updates improve search rankings', impact: 'Medium Impact' }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <Award size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                      <div className="flex-1">
                        <p style={{ fontSize: '14px', color: '#E2E8F0', marginBottom: '4px' }}>
                          {item.tip}
                        </p>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {item.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <div>
              <div className="business-dashboard__team-header flex items-center justify-between mb-6">
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                  {t('businessDashboard.team.title')}
                </h2>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-5 py-2 rounded-lg flex items-center gap-2 transition-all"
                  style={{
                    backgroundColor: '#0684F5',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                >
                  <Plus size={18} />
                  {t('businessDashboard.team.addMember')}
                </button>
              </div>

              <div
                className="rounded-xl"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {/* Table Header */}
                <div
                  className="business-dashboard__team-table-header grid grid-cols-12 gap-4 px-6 py-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="col-span-5" style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('businessDashboard.team.table.name')}
                  </div>
                  <div className="col-span-3" style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('businessDashboard.team.table.role')}
                  </div>
                  <div className="col-span-3" style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                    {t('businessDashboard.team.table.status')}
                  </div>
                  <div className="col-span-1" style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                    
                  </div>
                </div>

                {/* Team Members */}
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="business-dashboard__team-row grid grid-cols-12 gap-4 px-6 py-5 transition-colors items-center"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="business-dashboard__team-name col-span-5 flex items-center gap-4">
                      <div
                        className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#0684F5]/30 shadow-lg"
                        style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        }}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0684F5]/20 to-[#0684F5]/5">
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0684F5' }}>
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }} className="truncate">
                          {member.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }} className="truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="business-dashboard__team-role col-span-3 flex items-center">
                      <span
                        className="px-3 py-1 rounded-lg text-xs capitalize"
                        style={{
                          backgroundColor: member.role === 'owner' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(6, 132, 245, 0.1)',
                          color: member.role === 'owner' ? '#7C3AED' : '#0684F5',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {member.role}
                      </span>
                    </div>

                    <div className="business-dashboard__team-status col-span-3 flex items-center">
                      <span
                        className="px-3 py-1 rounded-lg text-xs capitalize"
                        style={{
                          backgroundColor: member.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: member.status === 'active' ? '#10B981' : '#F59E0B',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {member.status}
                      </span>
                    </div>

                    <div className="business-dashboard__team-actions col-span-1 flex items-center justify-end relative">
                      <button
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: openMemberMenuId === member.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: openMemberMenuId === member.id ? '#FFFFFF' : '#94A3B8'
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMemberMenuId((prev) => (prev === member.id ? null : member.id));
                        }}
                        onMouseEnter={(e) => {
                          if (openMemberMenuId !== member.id) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (openMemberMenuId !== member.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#94A3B8';
                          }
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMemberMenuId === member.id && (
                        <div
                          className="absolute right-0 top-full mt-2 rounded-lg overflow-hidden z-20"
                          style={{
                            backgroundColor: '#0B2641',
                            border: '1px solid rgba(255,255,255,0.15)',
                            minWidth: '180px',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
                            zIndex : 1000
                          }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-sm transition-colors"
                            style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                            onClick={() => handleMemberRoleChange(member.id, 'admin')}
                            disabled={memberActionId === member.id || member.role === 'admin' || member.role === 'owner'}
                          >
                            {t('businessDashboard.team.actions.makeAdmin')}
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm transition-colors"
                            style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                            onClick={() => handleMemberRoleChange(member.id, 'member')}
                            disabled={memberActionId === member.id || member.role === 'member' || member.role === 'owner'}
                          >
                            {t('businessDashboard.team.actions.setMember')}
                          </button>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                          <button
                            className="w-full text-left px-4 py-2 text-sm transition-colors"
                            style={{ color: '#F87171', backgroundColor: 'transparent' }}
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={memberActionId === member.id || member.role === 'owner'}
                          >
                            {t('businessDashboard.team.actions.remove')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products & Services Tab */}
          {activeTab === 'products' && (
            <ProductsManagementTab businessId={business.id} />
          )}

          {/* Visibility & Reach Tab */}
          {activeTab === 'visibility' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '32px' }}>
                {t('businessDashboard.visibility.title')}
              </h2>

              <div className="space-y-6">
                {/* Geographic Reach */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('businessDashboard.visibility.geographic.title')}
                  </h3>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                    {t('businessDashboard.visibility.geographic.label')}
                  </label>
                  <div className="space-y-3">
                    <div
                      className="rounded-lg border px-4 py-3 cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)'
                      }}
                      onClick={() => setIsCountryMenuOpen((prev) => !prev)}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: '14px', color: selectedCountries.length ? '#FFFFFF' : '#94A3B8' }}>
                          {selectedCountries.length ? t('businessDashboard.visibility.geographic.selected', { count: selectedCountries.length }) : t('businessDashboard.visibility.geographic.select')}
                        </span>
                        <ChevronDown size={18} style={{ color: '#94A3B8' }} />
                      </div>
                      {selectedCountries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedCountries.map((country) => (
                            <span
                              key={country}
                              className="px-3 py-1 rounded-full text-xs"
                              style={{ backgroundColor: 'rgba(6, 132, 245, 0.2)', color: '#BBD8FF', fontWeight: 600 }}
                            >
                              {country}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isCountryMenuOpen && (
                      <div
                        className="rounded-lg border p-4 space-y-3"
                        style={{
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.15)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={t('businessDashboard.visibility.geographic.search')}
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full rounded-lg px-3 py-2 outline-none"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#FFFFFF',
                              fontSize: '13px'
                            }}
                          />
                          <button
                            onClick={clearCountries}
                            className="px-3 py-2 rounded-lg text-xs font-semibold"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              color: '#94A3B8',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {t('businessDashboard.visibility.geographic.clear')}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {filteredCountries.map((country) => (
                            <button
                              key={country}
                              onClick={() => toggleCountry(country)}
                              className="flex items-center justify-between rounded-lg px-3 py-2"
                              style={{
                                backgroundColor: selectedCountries.includes(country)
                                  ? 'rgba(6, 132, 245, 0.15)'
                                  : 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: selectedCountries.includes(country) ? '#FFFFFF' : '#94A3B8',
                                fontSize: '13px'
                              }}
                            >
                              <span>{country}</span>
                              {selectedCountries.includes(country) && (
                                <Check size={14} style={{ color: '#0684F5' }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sectors */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('businessDashboard.visibility.sectors.title')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                        {t('businessDashboard.visibility.sectors.primary')}
                      </label>
                      <select
                        className="w-full rounded-lg p-3"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        value={primarySector}
                        onChange={handlePrimarySectorChange}
                      >
                        <option value="technology">Technology</option>
                        <option value="marketing">Marketing</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                        {t('businessDashboard.visibility.sectors.secondary')}
                      </label>
                      <select
                        className="w-full rounded-lg p-3"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        value={secondarySector}
                        onChange={handleSecondarySectorChange}
                      >
                        <option value="">Select secondary sector</option>
                        <option value="marketing-services">Marketing Services</option>
                        <option value="consulting">Consulting</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Marketplace Listing */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                        {t('businessDashboard.visibility.publicListing.title')}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                        {t('businessDashboard.visibility.publicListing.subtitle')}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {t('businessDashboard.visibility.publicListing.hint')}
                      </p>
                    </div>
                    <label className="relative inline-block" style={{ width: '60px', height: '32px' }}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={business.is_public} 
                        onChange={e => handlePublicListingToggle(e.target.checked)} 
                      />
                      <div
                        className="block rounded-full transition-colors cursor-pointer"
                        style={{
                          width: '60px',
                          height: '32px',
                          backgroundColor: business.is_public ? '#0684F5' : 'rgba(255,255,255,0.2)'
                        }}
                      >
                        <div
                          className="absolute left-1 top-1 rounded-full transition-transform"
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#FFFFFF',
                            transform: business.is_public ? 'translateX(28px)' : 'translateX(0)'
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '32px' }}>
                {t('businessDashboard.appearance.title')}
              </h2>

              <div className="space-y-6">
                {/* Accent Color */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('businessDashboard.appearance.accentColor.title')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                    {t('businessDashboard.appearance.accentColor.subtitle')}
                  </p>
                  <div className="flex gap-3">
                    {['#0684F5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((color) => (
                      <button
                        key={color}
                        className="rounded-lg transition-all"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: color,
                          border: color === accentColor ? '3px solid #FFFFFF' : '3px solid transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleAccentColorChange(color)}
                      />
                    ))}
                  </div>
                </div>

                {/* Layout Style */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('businessDashboard.appearance.layout.title')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4 cursor-pointer transition-all"
                      style={{
                        backgroundColor: layoutStyle === 'standard' ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: layoutStyle === 'standard' ? '2px solid #0684F5' : '2px solid rgba(255,255,255,0.1)'
                      }}
                      onClick={() => handleLayoutStyleChange('standard')}
                    >
                      <div
                        className="rounded mb-3"
                        style={{
                          height: '100px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px dashed rgba(255,255,255,0.3)'
                        }}
                      />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('businessDashboard.appearance.layout.standard')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('businessDashboard.appearance.layout.standardDesc')}
                      </div>
                    </div>

                    <div
                      className="rounded-lg p-4 cursor-pointer transition-all"
                      style={{
                        backgroundColor: layoutStyle === 'modern' ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: layoutStyle === 'modern' ? '2px solid #0684F5' : '2px solid rgba(255,255,255,0.1)'
                      }}
                      onClick={() => handleLayoutStyleChange('modern')}
                    >
                      <div
                        className="rounded mb-3"
                        style={{
                          height: '100px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px dashed rgba(255,255,255,0.3)'
                        }}
                      />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                        {t('businessDashboard.appearance.layout.modern')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {t('businessDashboard.appearance.layout.modernDesc')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="business-dashboard__analytics-header flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    {t('businessDashboard.analytics.title')}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('businessDashboard.analytics.subtitle')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(['7d', '30d', '90d'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setAnalyticsRange(range)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: analyticsRange === range ? 'rgba(6, 132, 245, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${analyticsRange === range ? '#0684F5' : 'rgba(255,255,255,0.1)'}`,
                        color: analyticsRange === range ? '#FFFFFF' : '#94A3B8'
                      }}
                    >
                      {range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleRefreshAnalytics}
                  disabled={isRefreshingAnalytics}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(6, 132, 245, 0.15)',
                    border: '1px solid rgba(6, 132, 245, 0.4)',
                    color: '#0684F5',
                    cursor: isRefreshingAnalytics ? 'not-allowed' : 'pointer',
                    opacity: isRefreshingAnalytics ? 0.7 : 1
                  }}
                >
                  <RefreshCw size={16} className={isRefreshingAnalytics ? 'animate-spin' : undefined} />
                  {t('businessDashboard.analytics.actions.refresh')}
                </button>
                <button
                  onClick={handleExportAnalytics}
                  disabled={isExportingAnalytics}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                    cursor: isExportingAnalytics ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FileText size={16} />
                  {t('businessDashboard.analytics.actions.export')}
                </button>
                <button
                  onClick={handleSnapshotDownload}
                  disabled={isGeneratingSnapshot}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                    cursor: isGeneratingSnapshot ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Download size={16} />
                  {t('businessDashboard.analytics.actions.snapshot')}
                </button>
                <button
                  onClick={handleShareAnalytics}
                  disabled={isSharingAnalytics}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                    cursor: isSharingAnalytics ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Share2 size={16} />
                  {t('businessDashboard.analytics.actions.share')}
                </button>
                <button
                  onClick={handleEmailSummary}
                  disabled={isEmailingSummary}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0',
                    cursor: isEmailingSummary ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Mail size={16} />
                  {t('businessDashboard.analytics.actions.email')}
                </button>
                <button
                  onClick={() => setShowComparison((prev) => !prev)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: showComparison ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${showComparison ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
                    color: showComparison ? '#10B981' : '#E2E8F0'
                  }}
                >
                  <TrendingUp size={16} />
                  {t('businessDashboard.analytics.actions.compare')}
                </button>
                <button
                  onClick={handleResetAnalytics}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0'
                  }}
                >
                  <RotateCcw size={16} />
                  {t('businessDashboard.analytics.actions.reset')}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: t('businessDashboard.stats.views'), value: analyticsViews, delta: viewsDelta, accent: '#0684F5' },
                  { label: t('businessDashboard.stats.leads'), value: analyticsLeads, delta: leadsDelta, accent: '#10B981' },
                  { label: t('businessDashboard.stats.shortlisted'), value: analyticsSaved, delta: savedDelta, accent: '#F59E0B' }
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>{card.label}</p>
                    <div className="flex items-end justify-between">
                      <span style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                        {card.value}
                      </span>
                      {showComparison && (
                        <span style={{ fontSize: '12px', color: card.delta >= 0 ? '#10B981' : '#F97316' }}>
                          {formatDelta(card.delta)}
                        </span>
                      )}
                    </div>
                    <div
                      className="mt-4 h-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(12, card.value))}%`,
                          backgroundColor: card.accent
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>{t('businessDashboard.analytics.engagement.title')}</h3>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Last {analyticsRange.toUpperCase()}</span>
                  </div>
                  <div className="flex items-end gap-2" style={{ height: '140px' }}>
                    {analyticsActivity.map((value: number, index: number) => (
                      <div
                        key={`${value}-${index}`}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${Math.max(12, value)}%`,
                          backgroundColor: index === analyticsActivity.length - 1 ? '#0684F5' : 'rgba(255,255,255,0.15)'
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('businessDashboard.analytics.engagement.leadConversion')}</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{leadRate}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>{t('businessDashboard.analytics.engagement.saveRate')}</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#F59E0B' }}>{saveRate}%</p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                    {t('businessDashboard.analytics.highlights.title')}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: t('businessDashboard.analytics.highlights.topSector'), value: business.sectors?.[0] || 'General' },
                      { label: t('businessDashboard.analytics.highlights.trendingRegion'), value: selectedCountries[0] || 'Global' },
                      { label: t('businessDashboard.analytics.highlights.profileStrength'), value: `${profileStrength}% complete` }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg px-4 py-3"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowAddMemberModal(false)}
        >
          <div
            className="business-dashboard__modal relative rounded-xl p-6"
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
                disabled={!searchEmail.trim()}
                className="flex-1 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: searchEmail.trim() ? '#0684F5' : '#334155',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: searchEmail.trim() ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (searchEmail.trim()) e.currentTarget.style.backgroundColor = '#0570D6';
                }}
                onMouseLeave={(e) => {
                  if (searchEmail.trim()) e.currentTarget.style.backgroundColor = '#0684F5';
                }}
              >
                {t('businessDashboard.modals.addMember.sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
