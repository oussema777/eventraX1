import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Linkedin, Twitter, Globe, 
  Calendar, Handshake, Users, Star, Mail, Phone, MapPin, Building2,
  Eye, Check, X, Lock, Trash2, Plus, Edit2, Crown, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { uploadFile } from '../utils/storage';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';

// Default user data (no mock values)
const userData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  location: '',
  timezone: '',
  jobTitle: '',
  company: '',
  department: '',
  industry: '',
  yearsExperience: 0,
  companySize: '',
  memberSince: '',
  profilePhoto: '',
  profileCompletion: 0,
  bio: '',
  linkedinConnected: false,
  hasPro: false,
  stats: {
    eventsAttended: 0,
    b2bMeetings: 0,
    connections: 0,
    profileViews: 0
  }
};

const skills: string[] = [];
const interests: string[] = [];
const meetingTopics: string[] = [];
const industriesOfInterest: string[] = [];
const educationEntries: any[] = [];
const certifications: any[] = [];

const buildFallbackAvatar = (name: string) => (
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0684F5&color=fff&size=256`
);

type ProfileOption = {
  value: string;
  label: string;
  helper?: string;
  checked?: boolean;
};

const getDefaultOptionValue = (options: ProfileOption[]) =>
  options.find((option) => option.checked)?.value ?? options[0]?.value ?? '';

export default function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tList } = useI18n();
  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addCertification,
    updateCertification,
    deleteCertification
  } = useProfile();
  const fallbackUserName = t('nav.placeholders.userName');
  const initialAvatarName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    fallbackUserName;
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const cropContainerSize = 300;
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationDraft, setEducationDraft] = useState({ id: '', degree: '', institution: '', years: '' });
  const [isEducationSaving, setIsEducationSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorQr, setTwoFactorQr] = useState('');
  const [twoFactorFactorId, setTwoFactorFactorId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isTwoFactorSaving, setIsTwoFactorSaving] = useState(false);
  const [isDeleteAccepted, setIsDeleteAccepted] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteFields, setPendingDeleteFields] = useState<string[]>([]);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const [baseCropScale, setBaseCropScale] = useState(1);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropCenter, setCropCenter] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropStartCenter, setCropStartCenter] = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!user && !isProfileLoading) {
      navigate('/');
    }
  }, [user, isProfileLoading, navigate]);

  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [phoneNumber, setPhoneNumber] = useState(userData.phone);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState(userData.location);
  const [timezone, setTimezone] = useState(userData.timezone);
  const [jobTitle, setJobTitle] = useState(userData.jobTitle);
  const [company, setCompany] = useState(userData.company);
  const [department, setDepartment] = useState(userData.department);
  const [industry, setIndustry] = useState(userData.industry);
  const [customIndustry, setCustomIndustry] = useState('');
  const [isCustomSectorVisible, setIsCustomSectorVisible] = useState(false);
  const [gender, setGender] = useState('');
  const [yearsExperience, setYearsExperience] = useState(userData.yearsExperience.toString());
  const [companySize, setCompanySize] = useState(userData.companySize);
  const [bio, setBio] = useState(userData.bio);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(buildFallbackAvatar(initialAvatarName));
  const [skillsState, setSkillsState] = useState<string[]>(skills);
  const [interestsState, setInterestsState] = useState<string[]>(interests);
  const [industriesState, setIndustriesState] = useState<string[]>(industriesOfInterest);
  const [topicsState, setTopicsState] = useState<string[]>(meetingTopics);
  const [b2bEnabled, setB2bEnabled] = useState(true);

  const [meetingGoals, setMeetingGoals] = useState(() =>
    tList<ProfileOption>('profile.options.meetingGoals', []).map((option) => ({
      value: option.value,
      checked: option.checked ?? false
    }))
  );

  const [companyStages, setCompanyStages] = useState(() =>
    tList<ProfileOption>('profile.options.companyStages', []).map((option) => ({
      value: option.value,
      checked: option.checked ?? false
    }))
  );

  const [availabilityPreference, setAvailabilityPreference] = useState(() =>
    getDefaultOptionValue(tList<ProfileOption>('profile.options.availability', []))
  );
  const [meetingFormats, setMeetingFormats] = useState(() =>
    tList<ProfileOption>('profile.options.meetingFormats', []).map((option) => ({
      value: option.value,
      checked: option.checked ?? false
    }))
  );
  const [meetingDuration, setMeetingDuration] = useState(() =>
    getDefaultOptionValue(tList<ProfileOption>('profile.options.meetingDurations', []))
  );
  const [meetingNotes, setMeetingNotes] = useState('');

  const [notificationPrefs, setNotificationPrefs] = useState(() =>
    tList<ProfileOption>('profile.options.notificationPrefs', []).map((option) => ({
      value: option.value,
      checked: option.checked ?? false
    }))
  );

  const [aiMatchmakingEnabled, setAiMatchmakingEnabled] = useState(true);
  const [aiSuggestionFrequency, setAiSuggestionFrequency] = useState(() =>
    getDefaultOptionValue(tList<ProfileOption>('profile.options.aiSuggestionFrequency', []))
  );

  const [profileVisibility, setProfileVisibility] = useState(() =>
    getDefaultOptionValue(tList<ProfileOption>('profile.options.profileVisibility', []))
  );
  const [contactVisibility, setContactVisibility] = useState(() =>
    tList<ProfileOption>('profile.options.contactVisibility', []).map((option) => ({
      value: option.value,
      checked: option.checked ?? false
    }))
  );
  const [showActivity, setShowActivity] = useState(true);
  const [showBio, setShowBio] = useState(true);
  const [language, setLanguage] = useState(() =>
    getDefaultOptionValue(tList<ProfileOption>('profile.options.languages', []))
  );
  const industryOptions = tList<ProfileOption>('profile.options.industries', []);
  const industryOtherValue = t('profile.options.industryOtherValue');
  const genderOptions = tList<ProfileOption>('profile.options.gender', []);
  const timezoneOptions = tList<ProfileOption>('profile.options.timezones', []);
  const companySizeOptions = tList<ProfileOption>('profile.options.companySizes', []);
  const meetingGoalOptions = tList<ProfileOption>('profile.options.meetingGoals', []);
  const companyStageOptions = tList<ProfileOption>('profile.options.companyStages', []);
  const availabilityOptions = tList<ProfileOption>('profile.options.availability', []);
  const meetingFormatOptions = tList<ProfileOption>('profile.options.meetingFormats', []);
  const meetingDurationOptions = tList<ProfileOption>('profile.options.meetingDurations', []);
  const notificationOptions = tList<ProfileOption>('profile.options.notificationPrefs', []);
  const profileVisibilityOptions = tList<ProfileOption>('profile.options.profileVisibility', []);
  const contactVisibilityOptions = tList<ProfileOption>('profile.options.contactVisibility', []);
  const aiSuggestionOptions = tList<ProfileOption>('profile.options.aiSuggestionFrequency', []);
  const languageOptions = tList<ProfileOption>('profile.options.languages', []);

  const profileCompletionStats = useMemo(() => {
    const hasValue = (value?: string | null) => typeof value === 'string' && value.trim().length > 0;
    const resolvedIndustry = industry === industryOtherValue ? customIndustry : industry;
    const hasCustomAvatar =
      !!profile?.avatar_url || (!!avatarUrl && !avatarUrl.includes('ui-avatars.com'));
    const checks = [
      hasValue(firstName),
      hasValue(lastName),
      hasValue(jobTitle),
      hasValue(company),
      hasValue(location),
      hasValue(phoneNumber),
      hasValue(resolvedIndustry),
      hasValue(bio),
      hasValue(linkedinUrl),
      hasValue(websiteUrl),
      hasCustomAvatar
    ];
    const total = checks.length || 1;
    const completed = checks.filter(Boolean).length;
    const percent = Math.round((completed / total) * 100);
    const hasLinkedIn = hasValue(linkedinUrl);
    const linkedInTarget = hasLinkedIn
      ? percent
      : Math.min(100, Math.round(((completed + 1) / total) * 100));
    return { percent, hasLinkedIn, linkedInTarget };
  }, [
    firstName,
    lastName,
    jobTitle,
    company,
    location,
    phoneNumber,
    industry,
    customIndustry,
    bio,
    linkedinUrl,
    websiteUrl,
    avatarUrl,
    profile?.avatar_url,
    industryOtherValue
  ]);

  const formatDateValue = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const applyProfileToState = (sourceProfile?: any | null) => {
    if (!sourceProfile) return;
    const fallbackName =
      sourceProfile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      fallbackUserName;
    const nameParts = fallbackName.split(' ').filter(Boolean);
    setFirstName(nameParts[0] || userData.firstName);
    setLastName(nameParts.slice(1).join(' ') || userData.lastName);
    setPhoneNumber(sourceProfile?.phone_number || userData.phone);
    setDateOfBirth(formatDateValue(sourceProfile?.date_of_birth) || formatDateValue(userData.dateOfBirth));
    setLocation(sourceProfile?.location || userData.location);
    setTimezone(sourceProfile?.timezone || userData.timezone);
    setJobTitle(sourceProfile?.job_title || userData.jobTitle);
    setCompany(sourceProfile?.company || userData.company);
    setDepartment(sourceProfile?.department || userData.department);
    const storedIndustry = sourceProfile?.industry || userData.industry;
    const industryValues = industryOptions.map((option) => option.value);
    if (storedIndustry && !industryValues.includes(storedIndustry)) {
      setIndustry(industryOtherValue);
      setCustomIndustry(storedIndustry);
    } else {
      setIndustry(storedIndustry);
      setCustomIndustry(
        storedIndustry === industryOtherValue
          ? sourceProfile?.professional_data?.industry_other || ''
          : ''
      );
    }
    setGender(sourceProfile?.gender || '');
    setYearsExperience(
      sourceProfile?.years_experience?.toString() || userData.yearsExperience.toString()
    );
    setCompanySize(sourceProfile?.company_size || userData.companySize);
    setBio(sourceProfile?.bio || userData.bio);
    setLinkedinUrl(sourceProfile?.linkedin_url || '');
    setTwitterUrl(sourceProfile?.twitter_url || '');
    setWebsiteUrl(sourceProfile?.website_url || '');
    setAvatarUrl(sourceProfile?.avatar_url || buildFallbackAvatar(fallbackName));

    const b2bProfile = sourceProfile?.b2b_profile || {};
    setB2bEnabled(b2bProfile.enabled ?? true);
    setSkillsState(b2bProfile.skills || skills);
    setInterestsState(b2bProfile.interests || interests);
    setIndustriesState(b2bProfile.industries_of_interest || industriesOfInterest);
    setTopicsState(b2bProfile.meeting_topics || meetingTopics);
    setMeetingGoals((prev) =>
      prev.map((item) => ({
        ...item,
        checked: Array.isArray(b2bProfile.meeting_goals)
          ? b2bProfile.meeting_goals.includes(item.value)
          : item.checked
      }))
    );
    setCompanyStages((prev) =>
      prev.map((item) => ({
        ...item,
        checked: Array.isArray(b2bProfile.company_stages)
          ? b2bProfile.company_stages.includes(item.value)
          : item.checked
      }))
    );
    setAvailabilityPreference(b2bProfile.availability || availabilityPreference);
    setMeetingFormats((prev) =>
      prev.map((item) => ({
        ...item,
        checked: Array.isArray(b2bProfile.meeting_formats)
          ? b2bProfile.meeting_formats.includes(item.value)
          : item.checked
      }))
    );
    setMeetingDuration(b2bProfile.meeting_duration || meetingDuration);
    setMeetingNotes(b2bProfile.meeting_notes || '');

    const prefs = sourceProfile?.app_preferences || {};
    setNotificationPrefs((prev) =>
      prev.map((item) => ({
        ...item,
        checked: Array.isArray(prefs.notifications)
          ? prefs.notifications.includes(item.value)
          : item.checked
      }))
    );
    setProfileVisibility(prefs.profile_visibility || profileVisibility);
    setContactVisibility((prev) =>
      prev.map((item) => ({
        ...item,
        checked: Array.isArray(prefs.contact_visibility)
          ? prefs.contact_visibility.includes(item.value)
          : item.checked
      }))
    );
    setShowActivity(prefs.show_activity ?? true);
    setShowBio(prefs.show_bio ?? true);
    setAiMatchmakingEnabled(prefs.ai_matchmaking_enabled ?? true);
    setAiSuggestionFrequency(prefs.ai_suggestion_frequency || aiSuggestionFrequency);
    setLanguage(prefs.language || language);
  };

  useEffect(() => {
    applyProfileToState(profile);
  }, [profile]);

  const buildProfilePayload = () => ({
    full_name: `${firstName} ${lastName}`.trim(),
    phone_number: phoneNumber,
    date_of_birth: dateOfBirth || null,
    location,
    timezone,
    job_title: jobTitle,
    company,
    department,
    industry,
    gender,
    years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
    company_size: companySize,
    bio,
    linkedin_url: linkedinUrl,
    twitter_url: twitterUrl,
    website_url: websiteUrl,
    avatar_url: avatarUrl,
    professional_data: {
      ...(profile?.professional_data || {}),
      industry_other: industry === industryOtherValue ? customIndustry : null
    },
    b2b_profile: {
      enabled: b2bEnabled,
      skills: skillsState,
      interests: interestsState,
      industries_of_interest: industriesState,
      meeting_topics: topicsState,
      meeting_goals: meetingGoals.filter(item => item.checked).map(item => item.value),
      company_stages: companyStages.filter(item => item.checked).map(item => item.value),
      availability: availabilityPreference,
      meeting_formats: meetingFormats.filter(item => item.checked).map(item => item.value),
      meeting_duration: meetingDuration,
      meeting_notes: meetingNotes
    },
    app_preferences: {
      notifications: notificationPrefs.filter(item => item.checked).map(item => item.value),
      profile_visibility: profileVisibility,
      contact_visibility: contactVisibility.filter(item => item.checked).map(item => item.value),
      show_activity: showActivity,
      show_bio: showBio,
      ai_matchmaking_enabled: aiMatchmakingEnabled,
      ai_suggestion_frequency: aiSuggestionFrequency,
      language
    }
  });

  const collectDeletionWarnings = (sourceProfile: any | null, payload: ReturnType<typeof buildProfilePayload>) => {
    if (!sourceProfile) return [];
    const warnings: string[] = [];
    const hasText = (value?: string | null) => typeof value === 'string' && value.trim().length > 0;
    const hasArray = (value?: any[]) => Array.isArray(value) && value.length > 0;

    const checkText = (label: string, previous?: string | null, next?: string | null) => {
      if (hasText(previous) && !hasText(next)) warnings.push(label);
    };
    const checkNumber = (label: string, previous?: number | null, next?: number | null) => {
      const hadValue = typeof previous === 'number' && !Number.isNaN(previous);
      const hasValue = typeof next === 'number' && !Number.isNaN(next);
      if (hadValue && !hasValue) warnings.push(label);
    };
    const checkArray = (label: string, previous?: any[], next?: any[]) => {
      if (hasArray(previous) && !hasArray(next)) warnings.push(label);
    };

    checkText(t('profile.fields.phoneNumber'), sourceProfile.phone_number, payload.phone_number);
    checkText(t('profile.fields.dateOfBirth'), sourceProfile.date_of_birth, payload.date_of_birth);
    checkText(t('profile.fields.location'), sourceProfile.location, payload.location);
    checkText(t('profile.fields.timezone'), sourceProfile.timezone, payload.timezone);
    checkText(t('profile.fields.jobTitle'), sourceProfile.job_title, payload.job_title);
    checkText(t('profile.fields.company'), sourceProfile.company, payload.company);
    checkText(t('profile.fields.department'), sourceProfile.department, payload.department);
    checkText(t('profile.fields.industry'), sourceProfile.industry, payload.industry);
    checkText(t('profile.fields.gender'), sourceProfile.gender, payload.gender);
    checkNumber(t('profile.fields.yearsExperience'), sourceProfile.years_experience, payload.years_experience);
    checkText(t('profile.fields.companySize'), sourceProfile.company_size, payload.company_size);
    checkText(t('profile.fields.bio'), sourceProfile.bio, payload.bio);
    checkText(t('profile.fields.linkedinUrl'), sourceProfile.linkedin_url, payload.linkedin_url);
    checkText(t('profile.fields.twitterUrl'), sourceProfile.twitter_url, payload.twitter_url);
    checkText(t('profile.fields.websiteUrl'), sourceProfile.website_url, payload.website_url);
    checkText(t('profile.fields.customIndustry'), sourceProfile.professional_data?.industry_other, payload.professional_data?.industry_other);

    const prevB2b = sourceProfile.b2b_profile || {};
    const nextB2b = payload.b2b_profile || {};
    checkArray(t('profile.fields.meetingTopics'), prevB2b.meeting_topics, nextB2b.meeting_topics);
    checkArray(t('profile.fields.meetingGoals'), prevB2b.meeting_goals, nextB2b.meeting_goals);
    checkArray(t('profile.fields.companyStages'), prevB2b.company_stages, nextB2b.company_stages);
    checkArray(t('profile.fields.meetingFormats'), prevB2b.meeting_formats, nextB2b.meeting_formats);
    checkText(t('profile.fields.availabilityPreference'), prevB2b.availability, nextB2b.availability);
    checkText(t('profile.fields.meetingDuration'), prevB2b.meeting_duration, nextB2b.meeting_duration);
    checkText(t('profile.fields.meetingNotes'), prevB2b.meeting_notes, nextB2b.meeting_notes);

    const prevPrefs = sourceProfile.app_preferences || {};
    const nextPrefs = payload.app_preferences || {};
    checkArray(t('profile.fields.notificationPreferences'), prevPrefs.notifications, nextPrefs.notifications);
    checkArray(t('profile.fields.contactVisibility'), prevPrefs.contact_visibility, nextPrefs.contact_visibility);
    checkText(t('profile.fields.profileVisibility'), prevPrefs.profile_visibility, nextPrefs.profile_visibility);
    checkText(t('profile.fields.language'), prevPrefs.language, nextPrefs.language);

    return warnings;
  };

  useEffect(() => {
    if (!user || !supabase.auth.mfa) return;
    const loadFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return;
      const totpFactors = data?.totp || [];
      const factor = totpFactors[0];
      setIsTwoFactorEnabled(!!factor);
      setTwoFactorFactorId(factor?.id || '');
    };
    loadFactors();
  }, [user]);

  useEffect(() => {
    if (!cropImageUrl) return;
    const img = new Image();
    img.onload = () => {
      const minScale = Math.max(
        cropContainerSize / img.naturalWidth,
        cropContainerSize / img.naturalHeight
      );
      setCropImage(img);
      setBaseCropScale(minScale);
      setCropZoom(1);
      setCropCenter({ x: img.naturalWidth / 2, y: img.naturalHeight / 2 });
    };
    img.src = cropImageUrl;
  }, [cropImageUrl, cropContainerSize]);

  useEffect(() => {
    if (!cropImage) return;
    const scale = baseCropScale * cropZoom;
    const minX = cropContainerSize / (2 * scale);
    const maxX = cropImage.naturalWidth - minX;
    const minY = cropContainerSize / (2 * scale);
    const maxY = cropImage.naturalHeight - minY;
    setCropCenter((prev) => ({
      x: Math.min(Math.max(prev.x, minX), maxX),
      y: Math.min(Math.max(prev.y, minY), maxY)
    }));
  }, [cropImage, baseCropScale, cropZoom, cropContainerSize]);

  useEffect(() => {
    if (!cropImage || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = baseCropScale * cropZoom;
    const drawWidth = cropImage.naturalWidth * scale;
    const drawHeight = cropImage.naturalHeight * scale;
    const drawX = cropContainerSize / 2 - cropCenter.x * scale;
    const drawY = cropContainerSize / 2 - cropCenter.y * scale;

    ctx.clearRect(0, 0, cropContainerSize, cropContainerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cropContainerSize, cropContainerSize);
    ctx.drawImage(cropImage, drawX, drawY, drawWidth, drawHeight);
  }, [cropImage, baseCropScale, cropZoom, cropCenter, cropContainerSize]);

  const handleSaveChanges = async (overrideDeleteAccepted?: boolean) => {
    try {
      const payload = buildProfilePayload();
      const deletionWarnings = collectDeletionWarnings(profile, payload);
      const deleteAccepted = overrideDeleteAccepted ?? isDeleteAccepted;
      if (deletionWarnings.length > 0 && !deleteAccepted) {
        setPendingDeleteFields(deletionWarnings);
        setShowDeleteConfirmModal(true);
        return;
      }
      const saved = await updateProfile(payload);
      if (!saved) {
        throw new Error(t('profile.toasts.updateFailed'));
      }
      toast.success(t('profile.toasts.updateSuccess'));
      setIsDeleteAccepted(false);
      setPendingDeleteFields([]);
      setShowDeleteConfirmModal(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error(t('profile.toasts.updateFailed'));
    }
  };

  const handleDiscard = () => {
    applyProfileToState(profile);
    setHasUnsavedChanges(false);
    toast.info(t('profile.toasts.changesDiscarded'));
  };

  const openEducationModal = (edu?: { id?: string; degree?: string; institution?: string; years?: string }) => {
    setEducationDraft({
      id: edu?.id || '',
      degree: edu?.degree || '',
      institution: edu?.institution || '',
      years: edu?.years || ''
    });
    setShowEducationModal(true);
  };

  const handleEducationSave = async () => {
    const degree = educationDraft.degree.trim();
    const institution = educationDraft.institution.trim();
    const years = educationDraft.years.trim();
    if (!degree || !institution || !years) {
      toast.error(t('profile.toasts.educationMissing'));
      return;
    }
    setIsEducationSaving(true);
    try {
      if (educationDraft.id) {
        await updateEducation(educationDraft.id, { degree, institution, years });
        toast.success(t('profile.toasts.educationUpdated'));
      } else {
        await addEducation({ degree, institution, years });
        toast.success(t('profile.toasts.educationAdded'));
      }
      setShowEducationModal(false);
    } catch (error) {
      toast.error(t('profile.toasts.educationFailed'));
    } finally {
      setIsEducationSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user?.email) {
      toast.error(t('profile.toasts.passwordSignIn'));
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('profile.toasts.passwordFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.toasts.passwordMismatch'));
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (loginError) {
        toast.error(t('profile.toasts.passwordIncorrect'));
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }

      toast.success(t('profile.toasts.passwordUpdated'));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || t('profile.toasts.passwordFailed'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!supabase.auth.mfa) {
      toast.error(t('profile.toasts.twoFactorUnavailable'));
      return;
    }
    setIsTwoFactorSaving(true);
    try {
      if (isTwoFactorEnabled) {
        if (!twoFactorFactorId) {
          toast.error(t('profile.toasts.twoFactorDisableFailed'));
          return;
        }
        const { error } = await supabase.auth.mfa.unenroll({ factorId: twoFactorFactorId });
        if (error) throw error;
        setIsTwoFactorEnabled(false);
        setTwoFactorFactorId('');
        toast.success(t('profile.toasts.twoFactorDisabled'));
      } else {
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error) throw error;
        if (!data?.totp?.qr_code) {
          throw new Error(t('profile.modals.twoFactor.qrUnavailable'));
        }
        setTwoFactorFactorId(data?.id || '');
        setTwoFactorQr(data.totp.qr_code);
        setTwoFactorCode('');
        setShowTwoFactorModal(true);
      }
    } catch (error: any) {
      toast.error(error.message || t('profile.toasts.twoFactorFailed'));
    } finally {
      setIsTwoFactorSaving(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!supabase.auth.mfa || !twoFactorFactorId) return;
    if (!twoFactorCode.trim()) {
      toast.error(t('profile.toasts.twoFactorEnterCode'));
      return;
    }
    setIsTwoFactorSaving(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: twoFactorFactorId
      });
      if (challengeError) throw challengeError;
      const { error } = await supabase.auth.mfa.verify({
        factorId: twoFactorFactorId,
        challengeId: challengeData?.id,
        code: twoFactorCode.trim()
      });
      if (error) throw error;
      setIsTwoFactorEnabled(true);
      setShowTwoFactorModal(false);
      toast.success(t('profile.toasts.twoFactorEnabled'));
    } catch (error: any) {
      toast.error(error.message || t('profile.toasts.twoFactorVerifyFailed'));
    } finally {
      setIsTwoFactorSaving(false);
    }
  };

  const handleAvatarSelect = async (file: File) => {
    if (!user) {
      toast.error(t('profile.toasts.photoSignIn'));
      return;
    }

    const extension = file.name.split('.').pop() || 'png';
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const publicUrl = await uploadFile('profiles', path, file);

    if (!publicUrl) {
      toast.error(t('profile.toasts.photoUploadFailed'));
      return;
    }

    try {
      const saved = await updateProfile({ avatar_url: publicUrl });
      if (!saved) {
        throw new Error(t('profile.toasts.updateFailed'));
      }
      setAvatarUrl(publicUrl);
      setHasUnsavedChanges(false);
      toast.success(t('profile.toasts.photoUpdated'));
    } catch (error) {
      setAvatarUrl(publicUrl);
      setHasUnsavedChanges(true);
      toast.error(t('profile.toasts.photoSaveFailed'));
    }
  };

  const handleAvatarFileChange = (file: File) => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    const url = URL.createObjectURL(file);
    setCropImageUrl(url);
    setShowCropModal(true);
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDraggingCrop(true);
    setCropDragStart({ x: event.clientX, y: event.clientY });
    setCropStartCenter(cropCenter);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    const dx = event.clientX - cropDragStart.x;
    const dy = event.clientY - cropDragStart.y;
    const scale = baseCropScale * cropZoom;
    if (!cropImage) return;
    const minX = cropContainerSize / (2 * scale);
    const maxX = cropImage.naturalWidth - minX;
    const minY = cropContainerSize / (2 * scale);
    const maxY = cropImage.naturalHeight - minY;
    const nextCenter = {
      x: cropStartCenter.x - dx / scale,
      y: cropStartCenter.y - dy / scale
    };
    setCropCenter({
      x: Math.min(Math.max(nextCenter.x, minX), maxX),
      y: Math.min(Math.max(nextCenter.y, minY), maxY)
    });
  };

  const handleCropPointerUp = () => {
    setIsDraggingCrop(false);
  };

  const closeCropModal = () => {
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }
    setShowCropModal(false);
    setCropImageUrl(null);
    setCropImage(null);
  };

  const handleApplyCrop = async () => {
    if (!cropImage || !cropImageUrl) return;
    const outputSize = 400;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const factor = outputSize / cropContainerSize;
    const scale = baseCropScale * cropZoom * factor;
    const drawWidth = cropImage.naturalWidth * scale;
    const drawHeight = cropImage.naturalHeight * scale;
    const drawX = outputSize / 2 - cropCenter.x * scale;
    const drawY = outputSize / 2 - cropCenter.y * scale;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputSize, outputSize);
    ctx.drawImage(
      cropImage,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) return;

    const croppedFile = new File([blob], `avatar-${Date.now()}.png`, { type: 'image/png' });
    await handleAvatarSelect(croppedFile);
    closeCropModal();
  };

  const profileStats = {
    eventsAttended: profile?.events_attended ?? userData.stats.eventsAttended,
    b2bMeetings: profile?.b2b_meetings ?? userData.stats.b2bMeetings,
    connections: profile?.connections_made ?? userData.stats.connections,
    profileViews: profile?.profile_views ?? userData.stats.profileViews
  };
  const aiCriteria = [
    { key: 'industry', value: 85 },
    { key: 'role', value: 60 },
    { key: 'stage', value: 70 },
    { key: 'interests', value: 90 }
  ];
  const hasPro = profile?.has_pro ?? userData.hasPro;
  const educationItems = profile?.profile_education?.length ? profile.profile_education : educationEntries;
  const certificationItems = profile?.profile_certifications?.length ? profile.profile_certifications : certifications;
  const hasEducation = !!profile?.profile_education?.length;
  const hasCertifications = !!profile?.profile_certifications?.length;

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      {/* NAVBAR - Using Landing Page Navbar */}
      <NavbarLoggedIn
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        currentPage="my-profile"
      />

      {/* MAIN CONTENT */}
      <main
        className="profile-main"
        style={{ paddingTop: '112px', paddingBottom: '80px', paddingLeft: '40px', paddingRight: '40px' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* PAGE HEADER */}
          <div
            className="profile-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}
          >
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('profile.header.title')}
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                {t('profile.header.subtitle')}
              </p>
            </div>
            
            <div className="profile-header-actions" style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate(`/profile/${user?.id}`)}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #FFFFFF',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Eye size={18} />
                {t('profile.header.preview')}
              </button>
              
              <button
                onClick={handleSaveChanges}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0571D0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
              >
                <Check size={18} />
                {t('profile.header.save')}
              </button>
            </div>
          </div>

          {/* 2-COLUMN LAYOUT */}
          <div className="profile-columns" style={{ display: 'flex', gap: '32px' }}>
            
            {/* LEFT COLUMN: Profile Card & Stats */}
            <div className="profile-left-column" style={{ width: '35%', flexShrink: 0 }}>
              
              {/* PROFILE CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                {/* Profile Photo */}
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onMouseEnter={() => setIsPhotoHovered(true)}
                  onMouseLeave={() => setIsPhotoHovered(false)}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <img
                    src={avatarUrl}
                    alt={`${firstName} ${lastName}`}
                    style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                    }}
                  />
                  {isPhotoHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#FFFFFF'
                      }}
                    >
                      <Upload size={24} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('profile.card.changePhoto')}</span>
                    </div>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarFileChange(file);
                  }}
                />

                {/* User Info */}
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                    {firstName} {lastName}
                  </h2>
                  <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '4px' }}>
                    {jobTitle}
                  </p>
                  <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '12px' }}>
                    {company}
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      color: '#94A3B8'
                    }}
                  >
                    {t('profile.card.memberSince', { date: userData.memberSince })}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

                {/* Profile Completion */}
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>{t('profile.card.profileCompletion')}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#10B981' }}>
                      {t('profile.card.completion', { percent: profileCompletionStats.percent })}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${profileCompletionStats.percent}%`, height: '100%', backgroundColor: '#0684F5' }} />
                  </div>
                  {!profileCompletionStats.hasLinkedIn && (
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                      {t('profile.card.addLinkedInHint', { percent: profileCompletionStats.linkedInTarget })}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* Social Links */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Linkedin size={20} style={{ color: '#0A66C2' }} />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('profile.card.social.linkedin')}</span>
                    </div>
                    {linkedinUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#10B981', color: '#FFFFFF', borderRadius: '12px' }}>
                          {t('profile.card.connected')}
                        </span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                          onClick={() => {
                            const next = window.prompt(t('profile.prompts.linkedin'), linkedinUrl);
                            if (next !== null) {
                              setLinkedinUrl(next);
                              setHasUnsavedChanges(true);
                            }
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#0684F5' }}
                        onClick={() => {
                          const next = window.prompt(t('profile.prompts.linkedin'));
                          if (next) {
                            setLinkedinUrl(next);
                            setHasUnsavedChanges(true);
                          }
                        }}
                      >
                        + {t('profile.card.connect')}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Twitter size={20} style={{ color: '#FFFFFF' }} />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('profile.card.social.twitter')}</span>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#0684F5' }}
                      onClick={() => {
                        const next = window.prompt(t('profile.prompts.twitter'), twitterUrl);
                        if (next !== null) {
                          setTwitterUrl(next);
                          setHasUnsavedChanges(true);
                        }
                      }}
                    >
                      {twitterUrl ? t('profile.card.edit') : `+ ${t('profile.card.connect')}`}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Globe size={20} style={{ color: '#0684F5' }} />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('profile.card.social.website')}</span>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#0684F5' }}
                      onClick={() => {
                        const next = window.prompt(t('profile.prompts.website'), websiteUrl);
                        if (next !== null) {
                          setWebsiteUrl(next);
                          setHasUnsavedChanges(true);
                        }
                      }}
                    >
                      {websiteUrl ? t('profile.card.edit') : `+ ${t('profile.card.add')}`}
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK STATS CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginTop: '24px'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('profile.stats.title')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Calendar size={16} style={{ color: '#0684F5' }} />
                      <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('profile.stats.eventsAttended')}</span>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{profileStats.eventsAttended}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Handshake size={16} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('profile.stats.b2bMeetings')}</span>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{profileStats.b2bMeetings}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Users size={16} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('profile.stats.connectionsMade')}</span>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{profileStats.connections}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Star size={16} style={{ color: '#F59E0B' }} />
                      <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('profile.stats.profileViews')}</span>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{profileStats.profileViews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Tabs Content */}
            <div style={{ flex: 1 }}>
              
              {/* TAB NAVIGATION */}
              <div
                className="profile-tabs"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px'
                }}
              >
                {[
                  { id: 'basic', label: t('profile.tabs.basic') },
                  { id: 'professional', label: t('profile.tabs.professional') },
                  { id: 'b2b', label: t('profile.tabs.b2b') },
                  { id: 'preferences', label: t('profile.tabs.preferences') }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      backgroundColor: activeTab === tab.id ? '#0684F5' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {/* TAB 1: BASIC INFO */}
                {activeTab === 'basic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Personal Information Section */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.sections.personal.title')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div
                        className="profile-grid"
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}
                      >
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.firstName')} <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.lastName')} <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.email')} <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                              type="email"
                              value={profile?.email || user?.email || ''}
                              readOnly
                              disabled
                              style={{
                                width: '100%',
                                height: '48px',
                                paddingLeft: '44px',
                                paddingRight: '44px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '15px'
                              }}
                            />
                            <Lock size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10B981' }} />
                          </div>
                          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                            {t('profile.sections.personal.emailHelper')}
                          </p>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.phone')}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              style={{
                                width: '100%',
                                height: '48px',
                                paddingLeft: '44px',
                                paddingRight: '16px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '15px'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.dateOfBirth')}
                          </label>
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                              setDateOfBirth(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          />
                          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px', fontStyle: 'italic' }}>
                            {t('profile.sections.personal.dobHelper')}
                          </p>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.gender')}
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => {
                              setGender(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          >
                            <option value="" style={{ color: '#111827', backgroundColor: '#FFFFFF' }}>{t('profile.common.select')}</option>
                            {genderOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                style={{ color: '#111827', backgroundColor: '#FFFFFF' }}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.location')}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => {
                                setLocation(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              style={{
                                width: '100%',
                                height: '48px',
                                paddingLeft: '44px',
                                paddingRight: '16px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '15px'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.personal.timezone')}
                          </label>
                          <select
                            value={timezone}
                            onChange={(e) => {
                              setTimezone(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          >
                            {timezoneOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* About Me Section */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.sections.about.title')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.sections.about.bioLabel')}
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => {
                            setBio(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          style={{
                            width: '100%',
                            height: '180px',
                            padding: '16px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>
                            {t('profile.sections.about.bioHelper')}
                          </p>
                          <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                            {t('profile.sections.about.counter', { current: bio.length, max: 500 })}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
                            {t('profile.sections.about.showBio')}
                          </span>
                          <div
                            onClick={() => {
                              setShowBio(!showBio);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '48px',
                              height: '24px',
                              backgroundColor: showBio ? '#0684F5' : 'rgba(255,255,255,0.2)',
                              borderRadius: '12px',
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              left: showBio ? '26px' : '2px',
                              transition: 'all 0.2s'
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PROFESSIONAL DETAILS */}
                {activeTab === 'professional' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.sections.professional.title')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div
                        className="profile-grid"
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}
                      >
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.professional.jobTitle')} <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => {
                              setJobTitle(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.professional.company')} <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                              type="text"
                              value={company}
                              onChange={(e) => {
                                setCompany(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              style={{
                                width: '100%',
                                height: '48px',
                                paddingLeft: '44px',
                                paddingRight: '16px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '15px'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                            {t('profile.sections.professional.sector')}
                          </label>
                          
                          {/* Tags Container */}
                          <div 
                            style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '10px', 
                              marginBottom: '16px',
                              padding: industriesState.length > 0 ? '16px' : '0',
                              backgroundColor: industriesState.length > 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                              borderRadius: '12px',
                              border: industriesState.length > 0 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                            }}
                          >
                            {industriesState.map(item => (
                              <div 
                                key={item} 
                                className="group"
                                style={{ 
                                  padding: '8px 14px', 
                                  backgroundColor: 'rgba(6, 132, 245, 0.12)', 
                                  color: '#0684F5', 
                                  borderRadius: '10px', 
                                  fontSize: '13px', 
                                  fontWeight: 500,
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px',
                                  border: '1px solid rgba(6, 132, 245, 0.2)',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {item}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newIndustries = industriesState.filter(i => i !== item);
                                    setIndustriesState(newIndustries);
                                    if (industry === item) {
                                        setIndustry(newIndustries[0] || '');
                                    }
                                    setHasUnsavedChanges(true);
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0, 
                                    cursor: 'pointer', 
                                    color: 'rgba(6, 132, 245, 0.6)',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(6, 132, 245, 0.6)'}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div style={{ position: 'relative' }}>
                            <select
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                    setIsCustomSectorVisible(true);
                                } else if (val && !industriesState.includes(val)) {
                                  setIndustriesState([...industriesState, val]);
                                  if (!industry) setIndustry(val);
                                  setHasUnsavedChanges(true);
                                  setIsCustomSectorVisible(false);
                                }
                              }}
                              style={{
                                width: '100%',
                                height: '52px',
                                padding: '0 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                color: '#FFFFFF',
                                fontSize: '15px',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#0684F5'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            >
                              <option value="" disabled hidden>{t('profile.common.selectSector')}</option>
                              <option value="">{t('profile.common.selectSector')}</option>
                              {industryOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  style={{ color: '#111827', backgroundColor: '#FFFFFF' }}
                                >
                                  {option.label}
                                </option>
                              ))}
                              <option value="custom" style={{ color: '#111827', backgroundColor: '#FFFFFF', fontWeight: 'bold' }}>
                                {t('profile.options.industryOtherValue') || "Other"}
                              </option>
                            </select>
                            <ChevronDown 
                              size={18} 
                              style={{ 
                                position: 'absolute', 
                                right: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'rgba(255, 255, 255, 0.4)', 
                                pointerEvents: 'none' 
                              }} 
                            />
                          </div>

                          {isCustomSectorVisible && (
                            <div style={{ marginTop: '12px', animation: 'fadeIn 0.2s ease-out' }}>
                                <input
                                    type="text"
                                    placeholder={t('profile.prompts.customSector') || "Enter custom sector..."}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = (e.target as HTMLInputElement).value.trim();
                                            if (val && !industriesState.includes(val)) {
                                                setIndustriesState([...industriesState, val]);
                                                if (!industry) setIndustry(val);
                                                setHasUnsavedChanges(true);
                                                setIsCustomSectorVisible(false);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        if (val && !industriesState.includes(val)) {
                                            setIndustriesState([...industriesState, val]);
                                            if (!industry) setIndustry(val);
                                            setHasUnsavedChanges(true);
                                        }
                                        setIsCustomSectorVisible(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        padding: '0 16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1.5px solid #0684F5',
                                        borderRadius: '10px',
                                        color: '#FFFFFF',
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                          )}
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.professional.department')}
                          </label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => {
                              setDepartment(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder={t('profile.placeholders.department') || "e.g. Engineering, Marketing, HR..."}
                            style={{
                              width: '100%',
                              height: '52px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1.5px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: '#FFFFFF',
                              fontSize: '15px',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0684F5'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.professional.yearsExperience')}
                          </label>
                          <input
                            type="number"
                            value={yearsExperience}
                            onChange={(e) => {
                              setYearsExperience(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.sections.professional.companySize')}
                          </label>
                          <select
                            value={companySize}
                            onChange={(e) => {
                              setCompanySize(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          >
                            {companySizeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.sections.skills.title')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.sections.skills.skillsLabel')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          {skillsState.map(skill => (
                            <div
                              key={skill}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(6,132,245,0.15)',
                                color: '#0684F5',
                                borderRadius: '20px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {skill}
                              <X
                                size={14}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSkillsState(skillsState.filter(item => item !== skill));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          ))}
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#0684F5',
                              border: '1px dashed rgba(6,132,245,0.5)',
                              borderRadius: '20px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const next = window.prompt(t('profile.prompts.addSkill'));
                              if (next) {
                                setSkillsState([...skillsState, next]);
                                setHasUnsavedChanges(true);
                              }
                            }}
                          >
                            + {t('profile.sections.skills.addSkill')}
                          </button>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6B7280' }}>{t('profile.sections.skills.skillsLimit')}</p>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.sections.skills.interestsLabel')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {interestsState.map(interest => (
                            <div
                              key={interest}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(74,124,109,0.15)',
                                color: '#4A7C6D',
                                borderRadius: '20px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {interest}
                              <X
                                size={14}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setInterestsState(interestsState.filter(item => item !== interest));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          ))}
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#4A7C6D',
                              border: '1px dashed rgba(74,124,109,0.5)',
                              borderRadius: '20px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const next = window.prompt(t('profile.prompts.addInterest'));
                              if (next) {
                                setInterestsState([...interestsState, next]);
                                setHasUnsavedChanges(true);
                              }
                            }}
                          >
                            + {t('profile.sections.skills.addInterest')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Education Section */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.sections.education.title')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      {educationItems.map((edu: any) => (
                        <div
                          key={edu.id}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '16px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                              onClick={async () => {
                                if (!hasEducation || !edu.id) return;
                                openEducationModal(edu);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                              onClick={async () => {
                                if (hasEducation && edu.id) {
                                  await deleteEducation(edu.id);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                            {edu.degree}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>
                            {edu.institution}
                          </p>
                          <p style={{ fontSize: '13px', color: '#6B7280' }}>
                            {edu.years}
                          </p>
                        </div>
                      ))}

                      <button
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 20px',
                          backgroundColor: 'transparent',
                          border: '1px dashed rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onClick={async () => {
                          openEducationModal();
                        }}
                      >
                        <Plus size={16} />
                        {t('profile.sections.education.add')}
                      </button>
                    </div>

                    {/* Certifications Section */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '16px' }}>
                        {t('profile.sections.certifications.label')}
                      </label>
                      
                      {certificationItems.map((cert: any) => (
                        <div
                          key={cert.id}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '16px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                              onClick={async () => {
                                if (!hasCertifications || !cert.id) return;
                                const name = window.prompt(t('profile.prompts.certificationName'), cert.name);
                                const organization = window.prompt(t('profile.prompts.certificationOrganization'), cert.organization);
                                const year = window.prompt(t('profile.prompts.certificationYear'), cert.year);
                                if (name && organization && year) {
                                  await updateCertification(cert.id, { name, organization, year });
                                }
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                              onClick={async () => {
                                if (hasCertifications && cert.id) {
                                  await deleteCertification(cert.id);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', marginBottom: '8px' }}>
                            {cert.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>
                            {cert.organization}
                          </p>
                          <p style={{ fontSize: '13px', color: '#6B7280' }}>
                            {cert.year}
                          </p>
                        </div>
                      ))}

                      <button
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 20px',
                          backgroundColor: 'transparent',
                          border: '1px dashed rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onClick={async () => {
                          const name = window.prompt(t('profile.prompts.certificationName'));
                          const organization = window.prompt(t('profile.prompts.certificationOrganization'));
                          const year = window.prompt(t('profile.prompts.certificationYear'));
                          if (name && organization && year) {
                            await addCertification({ name, organization, year });
                          }
                        }}
                      >
                        <Plus size={16} />
                        {t('profile.sections.certifications.add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: B2B NETWORKING */}
                {activeTab === 'b2b' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                        {t('profile.b2b.title')}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                        {t('profile.b2b.subtitle')}
                      </p>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                            {t('profile.b2b.enableTitle')}
                          </div>
                          <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                            {t('profile.b2b.enableHelper')}
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            setB2bEnabled(!b2bEnabled);
                            setHasUnsavedChanges(true);
                          }}
                          style={{
                            width: '48px',
                            height: '24px',
                            backgroundColor: b2bEnabled ? '#0684F5' : 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: b2bEnabled ? '26px' : '2px'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Preferences */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.b2b.meetingPreferences')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.b2b.meetingGoalsLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {meetingGoalOptions.map((option) => {
                            const checked = meetingGoals.find((goal) => goal.value === option.value)?.checked ?? false;
                            return (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setMeetingGoals(
                                    meetingGoals.map((goal) =>
                                      goal.value === option.value ? { ...goal, checked: !goal.checked } : goal
                                    )
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          );
                          })}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.b2b.industriesLabel')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {industriesState.map(industry => (
                            <div
                              key={industry}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(6,132,245,0.15)',
                                color: '#0684F5',
                                borderRadius: '20px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {industry}
                              <X
                                size={14}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setIndustriesState(industriesState.filter(item => item !== industry));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          ))}
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#0684F5',
                              border: '1px dashed rgba(6,132,245,0.5)',
                              borderRadius: '20px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const next = window.prompt(t('profile.prompts.addIndustry'));
                              if (next) {
                                setIndustriesState([...industriesState, next]);
                                setHasUnsavedChanges(true);
                              }
                            }}
                          >
                            + {t('profile.b2b.addIndustry')}
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.b2b.companyStagesLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {companyStageOptions.map((option) => {
                            const checked = companyStages.find((stage) => stage.value === option.value)?.checked ?? false;
                            return (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setCompanyStages(
                                    companyStages.map((stage) =>
                                      stage.value === option.value ? { ...stage, checked: !stage.checked } : stage
                                    )
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.b2b.topicsLabel')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {topicsState.map(topic => (
                            <div
                              key={topic}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(74,124,109,0.15)',
                                color: '#4A7C6D',
                                borderRadius: '20px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {topic}
                              <X
                                size={14}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setTopicsState(topicsState.filter(item => item !== topic));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          ))}
                          <button
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#4A7C6D',
                              border: '1px dashed rgba(74,124,109,0.5)',
                              borderRadius: '20px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const next = window.prompt(t('profile.prompts.addTopic'));
                              if (next) {
                                setTopicsState([...topicsState, next]);
                                setHasUnsavedChanges(true);
                              }
                            }}
                          >
                            + {t('profile.b2b.addTopic')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Availability Settings */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.b2b.availabilityTitle')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.b2b.availabilityLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {availabilityOptions.map((option) => (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="availability"
                                checked={availabilityPreference === option.value}
                                onChange={() => {
                                  setAvailabilityPreference(option.value);
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.b2b.meetingFormatLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {meetingFormatOptions.map((option) => {
                            const checked = meetingFormats.find((format) => format.value === option.value)?.checked ?? false;
                            return (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setMeetingFormats(
                                    meetingFormats.map((format) =>
                                      format.value === option.value ? { ...format, checked: !format.checked } : format
                                    )
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          );
                          })}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.b2b.meetingDurationLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {meetingDurationOptions.map((option) => (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="duration"
                                checked={meetingDuration === option.value}
                                onChange={() => {
                                  setMeetingDuration(option.value);
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.b2b.meetingNotesLabel')}
                        </label>
                        <textarea
                          placeholder={t('profile.b2b.meetingNotesPlaceholder')}
                          value={meetingNotes}
                          onChange={(e) => {
                            setMeetingNotes(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          style={{
                            width: '100%',
                            height: '100px',
                            padding: '16px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>

                    {/* AI Matchmaking Settings (PRO) */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                          {t('profile.ai.title')}
                        </h3>
                        <div
                          style={{
                            padding: '4px 12px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Crown size={12} />
                          {t('profile.ai.proBadge')}
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      {!hasPro && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(11,38,65,0.85)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '16px',
                            zIndex: 10
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Lock size={18} style={{ color: '#FFFFFF' }} />
                          </div>
                          <p style={{ fontSize: '14px', color: '#FFFFFF', textAlign: 'center' }}>
                            {t('profile.ai.lockedMessage')}
                          </p>
                          <button
                            style={{
                              height: '38px',
                              padding: '0 24px',
                              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onClick={() => navigate('/pricing')}
                          >
                            <Crown size={16} />
                            {t('profile.ai.upgrade')}
                          </button>
                        </div>
                      )}

                      <div style={{ opacity: hasPro ? 1 : 0.3, pointerEvents: hasPro ? 'auto' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                              {t('profile.ai.receiveTitle')}
                            </div>
                            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                              {t('profile.ai.receiveHelper')}
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setAiMatchmakingEnabled(!aiMatchmakingEnabled);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '48px',
                              height: '24px',
                              backgroundColor: aiMatchmakingEnabled ? '#0684F5' : 'rgba(255,255,255,0.2)',
                              borderRadius: '12px',
                              position: 'relative',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              left: aiMatchmakingEnabled ? '26px' : '2px'
                            }} />
                          </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                            {t('profile.ai.frequencyLabel')}
                          </label>
                          <select
                            value={aiSuggestionFrequency}
                            onChange={(e) => {
                              setAiSuggestionFrequency(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '15px'
                            }}
                          >
                            {aiSuggestionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '16px' }}>
                            {t('profile.ai.prioritiesLabel')}
                          </label>
                          {aiCriteria.map((criteria) => (
                            <div key={criteria.key} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t(`profile.ai.criteria.${criteria.key}`)}</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0684F5' }}>{criteria.value}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${criteria.value}%`, height: '100%', backgroundColor: '#0684F5' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: PREFERENCES */}
                {activeTab === 'preferences' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Notifications */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.preferences.notificationsTitle')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      {notificationOptions.map((option) => {
                        const checked = notificationPrefs.find((pref) => pref.value === option.value)?.checked ?? false;
                        return (
                        <div key={option.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                              {option.label}
                            </div>
                            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                              {option.helper}
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setNotificationPrefs(
                                notificationPrefs.map((pref) =>
                                  pref.value === option.value ? { ...pref, checked: !pref.checked } : pref
                                )
                              );
                              setHasUnsavedChanges(true);
                            }}
                            style={{
                              width: '48px',
                              height: '24px',
                              backgroundColor: checked ? '#0684F5' : 'rgba(255,255,255,0.2)',
                              borderRadius: '12px',
                              position: 'relative',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              left: checked ? '26px' : '2px',
                              transition: 'left 0.2s'
                            }} />
                          </div>
                        </div>
                      );
                      })}
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.preferences.privacyTitle')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.preferences.profileVisibilityLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {profileVisibilityOptions.map((option) => (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="profile-visibility"
                                checked={profileVisibility === option.value}
                                onChange={() => {
                                  setProfileVisibility(option.value);
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '12px' }}>
                          {t('profile.preferences.contactVisibilityLabel')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {contactVisibilityOptions.map((option) => {
                            const checked = contactVisibility.find((contact) => contact.value === option.value)?.checked ?? false;
                            return (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setContactVisibility(
                                    contactVisibility.map((contact) =>
                                      contact.value === option.value ? { ...contact, checked: !contact.checked } : contact
                                    )
                                  );
                                  setHasUnsavedChanges(true);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '15px', color: '#FFFFFF' }}>{option.label}</span>
                            </label>
                          );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>
                            {t('profile.preferences.activityTitle')}
                          </div>
                          <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                            {t('profile.preferences.activityHelper')}
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            setShowActivity(!showActivity);
                            setHasUnsavedChanges(true);
                          }}
                          style={{
                            width: '48px',
                            height: '24px',
                            backgroundColor: showActivity ? '#0684F5' : 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: showActivity ? '26px' : '2px'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Account Settings */}
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                        {t('profile.preferences.accountTitle')}
                      </h3>
                      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />
                      
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 20px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '20px'
                        }}
                      >
                        <Lock size={18} />
                        {t('profile.preferences.changePassword')}
                      </button>

                      <div
                        className="profile-twofactor-row"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF' }}>
                            {t('profile.preferences.twoFactor')}
                          </span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#10B981', color: '#FFFFFF', borderRadius: '12px' }}>
                            {t('profile.preferences.recommended')}
                          </span>
                        </div>
                        <div
                          className="profile-twofactor-toggle"
                          onClick={() => {
                            if (!isTwoFactorSaving) {
                              handleTwoFactorToggle();
                            }
                          }}
                          style={{
                            width: '48px',
                            height: '24px',
                            backgroundColor: isTwoFactorEnabled ? '#10B981' : 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            position: 'relative',
                            cursor: isTwoFactorSaving ? 'not-allowed' : 'pointer',
                            opacity: isTwoFactorSaving ? 0.7 : 1
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: isTwoFactorEnabled ? '26px' : '2px',
                            transition: 'left 0.2s ease'
                          }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                          {t('profile.preferences.language')}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '15px'
                          }}
                        >
                          {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Danger Zone */}
                      <div
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '24px',
                          borderRadius: '8px'
                        }}
                      >
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
                          {t('profile.preferences.dangerTitle')}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
                          {t('profile.preferences.dangerHelper')}
                        </p>
                        <button
                          style={{
                            height: '40px',
                            padding: '0 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid #EF4444',
                            borderRadius: '8px',
                            color: '#EF4444',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <Trash2 size={16} />
                          {t('profile.preferences.deleteAccount')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STICKY SAVE BAR */}
      {hasUnsavedChanges && (
        <div
          className="profile-sticky"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#0684F5',
            padding: '16px 40px',
            boxShadow: '0px -4px 16px rgba(0,0,0,0.3)',
            zIndex: 100
          }}
        >
          <div
            className="profile-sticky-inner"
            style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#FFFFFF' }}>
              {t('profile.sticky.unsaved')}
            </span>
            <div className="profile-sticky-actions" style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDiscard}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.sticky.discard')}
              </button>
              <button
                onClick={handleSaveChanges}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0684F5',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Check size={18} />
                {t('profile.sticky.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {showEducationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setShowEducationModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '520px',
              maxWidth: '90vw',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>
                {educationDraft.id ? t('profile.modals.education.editTitle') : t('profile.modals.education.addTitle')}
              </h2>
              <button
                onClick={() => setShowEducationModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.education.degree')}
                </label>
                <input
                  type="text"
                  value={educationDraft.degree}
                  onChange={(e) => setEducationDraft((prev) => ({ ...prev, degree: e.target.value }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.education.institution')}
                </label>
                <input
                  type="text"
                  value={educationDraft.institution}
                  onChange={(e) => setEducationDraft((prev) => ({ ...prev, institution: e.target.value }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.education.years')}
                </label>
                <input
                  type="text"
                  value={educationDraft.years}
                  onChange={(e) => setEducationDraft((prev) => ({ ...prev, years: e.target.value }))}
                  placeholder={t('profile.modals.education.yearsPlaceholder')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEducationModal(false)}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.modals.common.cancel')}
              </button>
              <button
                onClick={handleEducationSave}
                disabled={isEducationSaving}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: isEducationSaving ? '#2A4B6D' : '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isEducationSaving ? 'not-allowed' : 'pointer',
                  opacity: isEducationSaving ? 0.7 : 1
                }}
              >
                {isEducationSaving ? t('profile.modals.common.saving') : t('profile.modals.common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '500px',
              maxWidth: '90vw',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.password.title')}</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.password.current')}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.password.new')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
                  <div style={{ color: '#10B981' }}>✓ {t('profile.modals.password.requirements.length')}</div>
                  <div style={{ color: '#EF4444' }}>✗ {t('profile.modals.password.requirements.uppercase')}</div>
                  <div style={{ color: '#10B981' }}>✓ {t('profile.modals.password.requirements.number')}</div>
                  <div style={{ color: '#10B981' }}>✓ {t('profile.modals.password.requirements.special')}</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.password.confirm')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.modals.common.cancel')}
              </button>
              <button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: isUpdatingPassword ? '#2A4B6D' : '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                  opacity: isUpdatingPassword ? 0.7 : 1
                }}
              >
                {isUpdatingPassword ? t('profile.modals.password.updating') : t('profile.modals.password.update')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TWO-FACTOR SETUP MODAL */}
      {showTwoFactorModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setShowTwoFactorModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '520px',
              maxWidth: '90vw',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.twoFactor.title')}</h2>
              <button
                onClick={() => setShowTwoFactorModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>
                {t('profile.modals.twoFactor.instructions')}
              </p>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {twoFactorQr ? (
                  <div dangerouslySetInnerHTML={{ __html: twoFactorQr }} />
                ) : (
                  <span style={{ color: '#111827', fontSize: '14px' }}>{t('profile.modals.twoFactor.qrUnavailable')}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.modals.twoFactor.codeLabel')}
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={t('profile.modals.twoFactor.codePlaceholder')}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowTwoFactorModal(false)}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.modals.common.cancel')}
              </button>
              <button
                onClick={handleTwoFactorVerify}
                disabled={isTwoFactorSaving}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: isTwoFactorSaving ? '#2A4B6D' : '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isTwoFactorSaving ? 'not-allowed' : 'pointer',
                  opacity: isTwoFactorSaving ? 0.7 : 1
                }}
              >
                {isTwoFactorSaving ? t('profile.modals.twoFactor.verifying') : t('profile.modals.twoFactor.verify')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 210
          }}
          onClick={() => setShowDeleteConfirmModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '540px',
              maxWidth: '90vw',
              backgroundColor: '#1E3A5F',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.modals.deleteConfirm.title')}</h2>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {t('profile.modals.deleteConfirm.message')}
              </p>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                {pendingDeleteFields.map((field) => (
                  <div key={field} style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '6px' }}>
                    - {field}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={isDeleteAccepted}
                  onChange={(e) => setIsDeleteAccepted(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                  {t('profile.modals.deleteConfirm.accept')}
                </span>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsDeleteAccepted(false);
                  setShowDeleteConfirmModal(false);
                }}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.modals.common.cancel')}
              </button>
              <button
                onClick={() => handleSaveChanges(true)}
                disabled={!isDeleteAccepted}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: isDeleteAccepted ? '#0684F5' : '#2A4B6D',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDeleteAccepted ? 'pointer' : 'not-allowed',
                  opacity: isDeleteAccepted ? 1 : 0.7
                }}
              >
                {t('profile.modals.deleteConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC PROFILE PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '40px'
          }}
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '800px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Cover & Profile Photo */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #0684F5 0%, #4A7C6D 100%)'
                }}
              />
              <button
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
              <div style={{ position: 'absolute', bottom: '-60px', left: '40px' }}>
                <img
                  src={avatarUrl}
                  alt={t('profile.preview.avatarAlt')}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '4px solid #FFFFFF',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '80px 40px 40px', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                {firstName} {lastName}
              </h2>
              <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '4px' }}>
                {jobTitle}
              </p>
              <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>
                {company}
              </p>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.about')}</h3>
                <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.6' }}>
                  {bio}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.skills')}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skillsState.map(skill => (
                    <div
                      key={skill}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#E0F2FE',
                        color: '#0284C7',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>{t('profile.preview.interests')}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {interestsState.map(interest => (
                    <div
                      key={interest}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#D1FAE5',
                        color: '#059669',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: '32px' }}>
                {t('profile.preview.hint')}
              </p>
            </div>

            <div style={{ padding: '20px 40px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  height: '44px',
                  padding: '0 32px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.preview.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CROP PHOTO MODAL */}
      {showCropModal && cropImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11,38,65,0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 220,
            padding: '40px'
          }}
          onClick={closeCropModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '520px',
              maxWidth: '90vw',
              backgroundColor: '#1E3A5F',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>{t('profile.crop.title')}</h2>
              <button
                onClick={closeCropModal}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  width: `${cropContainerSize}px`,
                  height: `${cropContainerSize}px`,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: isDraggingCrop ? 'grabbing' : 'grab'
                }}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerLeave={handleCropPointerUp}
              >
                <canvas
                  ref={cropCanvasRef}
                  width={cropContainerSize}
                  height={cropContainerSize}
                  style={{ display: 'block' }}
                />
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>
                  {t('profile.crop.zoom')}
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeCropModal}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.modals.common.cancel')}
              </button>
              <button
                onClick={handleApplyCrop}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  backgroundColor: '#0684F5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('profile.crop.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
