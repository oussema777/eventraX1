import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Link as LinkIcon,
  Share2,
  Calendar,
  MessageCircle,
  Eye,
  ChevronDown,
  CheckCircle,
  Megaphone,
  Edit2,
  Send,
  Copy,
  BarChart3,
  Plus,
  MoreVertical,
  Crown,
  Lock,
  Info,
  Check,
  Clock,
  Globe,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import EmailEditorModal from './modals/EmailEditorModal';
import CustomLinkModal from './modals/CustomLinkModal';
import CampaignCreatorModal from './modals/CampaignCreatorModal';
import SuccessToast from './SuccessToast';
import { useProfile } from '../../hooks/useProfile';
import { useI18n } from '../../i18n/I18nContext';

interface EmailTemplate {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  enabled: boolean;
  preview: string;
  timing: string;
  recipients: string;
  isPro?: boolean;
}

interface CustomLink {
  id: string;
  name: string;
  platform: string;
  sourceTag: string;
  clicks: number;
  registrations: number;
}

interface SocialShareSettings {
  title: string;
  description: string;
  includeDate: boolean;
  includeLink: boolean;
  includeHashtag: boolean;
  hashtag: string;
}

interface MarketingToolsTabProps {
  eventId?: string;
}

export default function MarketingToolsTab({ eventId }: MarketingToolsTabProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEmailEditorOpen, setIsEmailEditorOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);

  const hasPro = Boolean(profile?.has_pro);
  const [eventDetails, setEventDetails] = useState({
    name: '',
    tagline: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    coverImageUrl: ''
  });
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: 'registration-confirmation',
      name: t('wizard.step3.marketingTools.emailTemplates.default.name'),
      icon: CheckCircle,
      iconColor: '#10B981',
      enabled: true,
      preview: t('wizard.step3.marketingTools.emailTemplates.default.preview'),
      timing: t('wizard.step3.marketingTools.emailTemplates.default.timing'),
      recipients: '',
      isPro: false
    }
  ]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [socialShare, setSocialShare] = useState<SocialShareSettings>({
    title: '',
    description: '',
    includeDate: true,
    includeLink: true,
    includeHashtag: true,
    hashtag: ''
  });
  const [marketingLoaded, setMarketingLoaded] = useState(false);
  const marketingSettingsRef = useRef<any>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseRegistrationUrl = useMemo(() => {
    if (!eventId) return '';
    return `${window.location.origin}/event/${eventId}/register`;
  }, [eventId]);

  const platformConfig: Record<string, { icon: any; color: string; label: string }> = {
    facebook: { icon: Share2, color: '#1877F2', label: t('wizard.step3.marketingTools.platforms.facebook') },
    linkedin: { icon: Share2, color: '#0A66C2', label: t('wizard.step3.marketingTools.platforms.linkedin') },
    twitter: { icon: Share2, color: '#000000', label: t('wizard.step3.marketingTools.platforms.twitter') },
    instagram: { icon: Share2, color: '#E4405F', label: t('wizard.step3.marketingTools.platforms.instagram') },
    tiktok: { icon: Share2, color: '#000000', label: t('wizard.step3.marketingTools.platforms.tiktok') },
    email: { icon: Mail, color: '#F59E0B', label: t('wizard.step3.marketingTools.platforms.email') },
    youtube: { icon: Share2, color: '#FF0000', label: t('wizard.step3.marketingTools.platforms.youtube') },
    google: { icon: Share2, color: '#4285F4', label: t('wizard.step3.marketingTools.platforms.google') },
    reddit: { icon: Share2, color: '#FF4500', label: t('wizard.step3.marketingTools.platforms.reddit') },
    pinterest: { icon: Share2, color: '#E60023', label: t('wizard.step3.marketingTools.platforms.pinterest') },
    whatsapp: { icon: MessageCircle, color: '#25D366', label: t('wizard.step3.marketingTools.platforms.whatsapp') },
    telegram: { icon: Share2, color: '#0088CC', label: t('wizard.step3.marketingTools.platforms.telegram') },
    link: { icon: LinkIcon, color: '#8B5CF6', label: t('wizard.step3.marketingTools.platforms.link') }
  };
  const planRoute = '/pricing';

  const handleUpgradeClick = () => {
    setShowProUpgradeModal(false);
    navigate(planRoute);
  };

  const buildTrackedUrl = (sourceTag?: string) => {
    if (!baseRegistrationUrl) return '';
    if (!sourceTag) return baseRegistrationUrl;
    const separator = baseRegistrationUrl.includes('?') ? '&' : '?';
    return `${baseRegistrationUrl}${separator}ref=${encodeURIComponent(sourceTag)}`;
  };

  const extractSourceTag = (url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.searchParams.get('ref') || '';
    } catch (error) {
      return '';
    }
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return t('wizard.step3.marketingTools.dateTba');
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const format = (date: Date) =>
      date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        return format(startDate);
      }
      return `${format(startDate)} - ${format(endDate)}`;
    }
    return startDate ? format(startDate) : format(endDate as Date);
  };

  const buildShareMessage = () => {
    const parts: string[] = [];
    if (socialShare.title.trim()) parts.push(socialShare.title.trim());
    if (socialShare.description.trim()) parts.push(socialShare.description.trim());
    if (socialShare.includeDate) {
      parts.push(formatDateRange(eventDetails.startDate, eventDetails.endDate));
    }
    if (socialShare.includeHashtag) {
      const rawHashtag = socialShare.hashtag.trim();
      const fallback = eventDetails.name.replace(/[^a-zA-Z0-9]/g, '');
      const tag = rawHashtag || fallback;
      if (tag) {
        parts.push(`#${tag.replace(/^#/, '')}`);
      }
    }
    return parts.filter(Boolean).join(' · ');
  };

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    const loadMarketingSettings = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('name,tagline,description,start_date,end_date,location_address,cover_image_url,marketing_settings')
        .eq('id', eventId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('marketing_settings load error', error);
        setMarketingLoaded(true);
        return;
      }
      const settings = data?.marketing_settings || {};
      marketingSettingsRef.current = settings;
      setEventDetails({
        name: data?.name || '',
        tagline: data?.tagline || '',
        description: data?.description || '',
        startDate: data?.start_date || '',
        endDate: data?.end_date || '',
        location: data?.location_address || '',
        coverImageUrl: data?.cover_image_url || ''
      });

      const storedTemplates = Array.isArray(settings.emailTemplates) ? settings.emailTemplates : [];
      const defaultTemplate: EmailTemplate = {
        id: 'registration-confirmation',
        name: t('wizard.step3.marketingTools.emailTemplates.default.name'),
        icon: CheckCircle,
        iconColor: '#10B981',
        enabled: true,
        preview: t('wizard.step3.marketingTools.emailTemplates.default.previewWithEvent', {
          eventName: data?.name || t('wizard.common.yourEvent')
        }),
        timing: t('wizard.step3.marketingTools.emailTemplates.default.timing'),
        recipients: '',
        isPro: false
      };
      const normalizedTemplates = storedTemplates.map((template: any, index: number) => ({
        ...template,
        id: String(template?.id || `template-${index}`),
        name: String(template?.name || t('wizard.step3.marketingTools.emailTemplates.default.name')),
        icon: template?.icon || CheckCircle,
        iconColor: String(template?.iconColor || '#10B981'),
        enabled: template?.enabled ?? true,
        preview: String(template?.preview || t('wizard.step3.marketingTools.emailTemplates.default.previewWithEvent', {
          eventName: data?.name || t('wizard.common.yourEvent')
        })),
        timing: String(template?.timing || t('wizard.step3.marketingTools.emailTemplates.default.timing')),
        recipients: String(template?.recipients || '')
      }));
      setEmailTemplates(normalizedTemplates.length ? normalizedTemplates : [defaultTemplate]);

      const storedLinks = Array.isArray(settings.customLinks) ? settings.customLinks : [];
      const normalizedLinks = storedLinks.map((link: any, index: number) => {
        const sourceTag = String(link?.sourceTag || link?.source_tag || extractSourceTag(link?.url) || '');
        return {
          id: String(link?.id || Date.now() + index),
          name: String(link?.name || t('wizard.step3.marketingTools.links.defaultName')),
          platform: String(link?.platform || 'link'),
          sourceTag,
          clicks: Number(link?.clicks || 0),
          registrations: Number(link?.registrations || 0)
        };
      });
      setCustomLinks(normalizedLinks);

      const socialDefaults = {
        title: data?.name
          ? t('wizard.step3.marketingTools.social.defaults.titleWithEvent', { eventName: data.name })
          : t('wizard.step3.marketingTools.social.defaults.title'),
        description: data?.tagline || data?.description || '',
        includeDate: true,
        includeLink: true,
        includeHashtag: true,
        hashtag: ''
      };
      const storedSocial = settings.socialShare || {};
      setSocialShare({
        title: storedSocial.title ?? socialDefaults.title,
        description: storedSocial.description ?? socialDefaults.description,
        includeDate: storedSocial.includeDate ?? socialDefaults.includeDate,
        includeLink: storedSocial.includeLink ?? socialDefaults.includeLink,
        includeHashtag: storedSocial.includeHashtag ?? socialDefaults.includeHashtag,
        hashtag: storedSocial.hashtag ?? socialDefaults.hashtag
      });

      setMarketingLoaded(true);
    };

    loadMarketingSettings();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !marketingLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const serializedTemplates = emailTemplates.map(({ icon, ...rest }) => rest);
      const payload = {
        ...marketingSettingsRef.current,
        emailTemplates: serializedTemplates,
        customLinks,
        socialShare
      };
      const { error } = await supabase
        .from('events')
        .update({ marketing_settings: payload, updated_at: new Date().toISOString() })
        .eq('id', eventId);
      if (!error) {
        marketingSettingsRef.current = payload;
      }
    }, 700);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [eventId, marketingLoaded, emailTemplates, customLinks, socialShare]);

  const handleToggleTemplate = (id: string) => {
    const template = emailTemplates.find(t => t.id === id);
    if (template?.isPro && !hasPro) {
      setShowProUpgradeModal(true);
      return;
    }
    setEmailTemplates((prev) => prev.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
    setToastMessage(t('wizard.step3.marketingTools.toasts.templateStatusUpdated'));
    setShowToast(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEmailEditorOpen(true);
  };

  const handleCopyLink = (url: string) => {
    if (!url) {
      setToastMessage(t('wizard.step3.marketingTools.toasts.createLinkFirst'));
      setShowToast(true);
      return;
    }
    navigator.clipboard.writeText(url);
    setToastMessage(t('wizard.step3.marketingTools.toasts.linkCopied'));
    setShowToast(true);
  };

  const handleCreateLink = (payload: { name: string; sourceTag: string; platform: string }) => {
    if (!eventId) {
      setToastMessage(t('wizard.step3.marketingTools.toasts.createEventFirstLinks'));
      setShowToast(true);
      return;
    }
    if (!payload.name || !payload.sourceTag) {
      setToastMessage(t('wizard.step3.marketingTools.toasts.addNameAndSource'));
      setShowToast(true);
      return;
    }
    if (!hasPro && customLinks.length >= 10) {
      setShowProUpgradeModal(true);
      return;
    }
    const normalizedTag = payload.sourceTag.trim();
    if (customLinks.some((link) => link.sourceTag === normalizedTag)) {
      setToastMessage(t('wizard.step3.marketingTools.toasts.sourceTagExists'));
      setShowToast(true);
      return;
    }
    setCustomLinks((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: payload.name.trim(),
        platform: payload.platform,
        sourceTag: normalizedTag,
        clicks: 0,
        registrations: 0
      }
    ]);
    setToastMessage(t('wizard.step3.marketingTools.toasts.customLinkCreated'));
    setShowToast(true);
    setIsLinkModalOpen(false);
  };

  const handleShare = (platform: 'facebook' | 'linkedin' | 'twitter') => {
    if (!baseRegistrationUrl) {
      setToastMessage(t('wizard.step3.marketingTools.toasts.createEventFirstShare'));
      setShowToast(true);
      return;
    }
    const shareMessage = buildShareMessage();
    const encodedUrl = encodeURIComponent(baseRegistrationUrl);
    const encodedText = encodeURIComponent(shareMessage);
    let shareLink = '';
    if (platform === 'facebook') {
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    } else if (platform === 'linkedin') {
      shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    } else {
      shareLink = socialShare.includeLink
        ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        : `https://twitter.com/intent/tweet?text=${encodedText}`;
    }
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  const handleSendTest = () => {
    setToastMessage(t('wizard.step3.marketingTools.toasts.testEmailSent'));
    setShowToast(true);
  };

  const sharePreviewTitle = socialShare.title || eventDetails.name || t('wizard.step3.marketingTools.social.previewTitleFallback');
  const sharePreviewDescription = socialShare.description || eventDetails.tagline || eventDetails.description || t('wizard.step3.marketingTools.social.previewDescriptionFallback');
  const sharePreviewDate = formatDateRange(eventDetails.startDate, eventDetails.endDate);
  const sharePreviewLocation = eventDetails.location || t('wizard.step3.marketingTools.social.previewLocationFallback');
  const shareDomain = baseRegistrationUrl ? new URL(baseRegistrationUrl).host : window.location.host;
  const titleCharCount = socialShare.title.length;
  const descriptionCharCount = socialShare.description.length;

  return (
    <div 
      className="marketing-tools-container mx-auto"
      style={{ 
        backgroundColor: '#0B2641',
        maxWidth: '1200px',
        padding: '40px 40px 80px 40px'
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .marketing-tools-container { padding: 1.25rem !important; }
          .marketing-header { flex-direction: column !important; gap: 1rem !important; align-items: stretch !important; }
          .marketing-header-actions { width: 100% !important; flex-direction: column !important; }
          .marketing-header-actions button { width: 100% !important; justify-content: center !important; }
          
          .marketing-section { padding: 1.5rem !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .templates-grid { grid-template-columns: 1fr !important; }
          .share-buttons-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .link-stats-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          
          .custom-link-card-header { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
          .custom-link-url-wrapper { flex-direction: column !important; align-items: stretch !important; }
          .custom-link-url-code { overflow-x: auto !important; }
          
          .share-preview-card { padding: 1rem !important; }
          .share-preview-image { height: 180px !important; }
          .share-preview-image h3 { fontSize: 1.5rem !important; }
        }
        @media (max-width: 640px) {
          .share-buttons-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .marketing-tools-container { padding: 0.5rem !important; }
          .marketing-section { padding: 1rem !important; }
        }
      `}</style>
      {/* PAGE HEADER */}
      <div className="marketing-header flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
            {t('wizard.step3.marketingTools.title')}
          </h2>
          <p className="text-base" style={{ color: '#94A3B8' }}>
            {t('wizard.step3.marketingTools.subtitle')}
          </p>
        </div>
        <div className="marketing-header-actions flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-5 h-11 rounded-lg border transition-colors"
            style={{ 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#E2E8F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Eye size={18} />
            <span style={{ fontWeight: 600 }}>{t('wizard.step3.marketingTools.actions.previewAll')}</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 h-11 rounded-lg transition-colors"
            style={{ 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#E2E8F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontWeight: 600 }}>{t('wizard.step3.marketingTools.actions.moreActions')}</span>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* SECTION 1: CUSTOM DOMAIN (PRO-ONLY) */}
      <div 
        className="marketing-section rounded-xl p-8 mb-6"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '2px solid #F59E0B' }}
      >
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
          >
            <Globe size={28} style={{ color: '#F59E0B' }} />
          </div>
          <div className="flex-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 className="text-2xl" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                {t('wizard.step3.marketingTools.customDomain.title')}
              </h3>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #F59E0B',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#F59E0B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <Crown size={12} />
                PRO
              </div>
            </div>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.marketingTools.customDomain.subtitle')}
            </p>
          </div>
        </div>
        <div className="w-full h-px mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-2 gap-5 mb-5">
          {/* Feature 1 */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <Check size={16} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.marketingTools.customDomain.features.registrationUrl.title')}
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {t('wizard.step3.marketingTools.customDomain.features.registrationUrl.subtitle')}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <Check size={16} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.marketingTools.customDomain.features.emailDomain.title')}
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {t('wizard.step3.marketingTools.customDomain.features.emailDomain.subtitle')}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <Check size={16} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.marketingTools.customDomain.features.ssl.title')}
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {t('wizard.step3.marketingTools.customDomain.features.ssl.subtitle')}
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <Check size={16} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                {t('wizard.step3.marketingTools.customDomain.features.branding.title')}
              </div>
              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                {t('wizard.step3.marketingTools.customDomain.features.branding.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-wrap items-center gap-4 pt-5 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleUpgradeClick}
            className="px-6 py-3 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            <Crown size={16} />
            {t('wizard.step3.marketingTools.actions.upgradeToPro')}
          </button>
          <a
            href="#"
            style={{
              fontSize: '14px',
              color: '#0684F5',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {t('wizard.step3.marketingTools.customDomain.learnMore')}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* SECTION 2: EMAIL TEMPLATES */}
      <div 
        className="marketing-section rounded-xl p-8 mb-6"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(6, 132, 245, 0.15)' }}
          >
            <Mail size={28} style={{ color: '#0684F5' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.emailTemplates.title')}
            </h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.marketingTools.emailTemplates.subtitle')}
            </p>
          </div>
        </div>
        <div className="w-full h-px mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Template Cards Grid */}
        <div className="templates-grid grid grid-cols-2 gap-5">
          {/* Email Templates */}
          {emailTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="rounded-lg p-6 border transition-shadow hover:shadow-md"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon size={24} style={{ color: template.iconColor }} />
                    <h4 className="text-lg" style={{ fontWeight: 600, color: '#0B2641' }}>
                      {template.name}
                    </h4>
                  </div>
                  {/* Toggle only - no text */}
                  <button
                    onClick={() => handleToggleTemplate(template.id)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: template.enabled ? '#0684F5' : '#E5E7EB'
                    }}
                    title={template.enabled ? t('wizard.step3.marketingTools.emailTemplates.enabled') : t('wizard.step3.marketingTools.emailTemplates.disabled')}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                      style={{
                        left: template.enabled ? 'calc(100% - 22px)' : '2px'
                      }}
                    />
                  </button>
                </div>

                {/* Preview Text */}
                <p 
                  className="text-sm mb-3 italic line-clamp-2"
                  style={{ color: '#6B7280' }}
                >
                  "{template.preview}"
                </p>

                {/* Info Row */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#6B7280' }}>
                      {template.timing}
                    </span>
                  </div>
                </div>

                {/* Actions - Icons only */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                    style={{ backgroundColor: '#0684F5', color: '#FFFFFF' }}
                    title={t('wizard.step3.marketingTools.emailTemplates.edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-gray-100"
                    title={t('wizard.step3.marketingTools.emailTemplates.preview')}
                  >
                    <Eye size={16} style={{ color: '#6B7280' }} />
                  </button>
                  <button
                    onClick={handleSendTest}
                    className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-gray-100"
                    title={t('wizard.step3.marketingTools.emailTemplates.sendTest')}
                  >
                    <Send size={16} style={{ color: '#6B7280' }} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Custom Campaign - PRO */}
          <div
            className="rounded-lg p-6 border relative overflow-hidden"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB'
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Megaphone size={24} style={{ color: '#F59E0B' }} />
                <span 
                  className="px-2 py-1 rounded text-xs flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  <Crown size={12} />
                  PRO
                </span>
              </div>
              <h4 className="text-lg mb-2" style={{ fontWeight: 600, color: '#0B2641' }}>
                {t('wizard.step3.marketingTools.emailTemplates.customCampaign.title')}
              </h4>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                {t('wizard.step3.marketingTools.emailTemplates.customCampaign.subtitle')}
              </p>
              
              {/* Lock Notice */}
              <div 
                className="p-3 rounded-lg flex items-center gap-2 mb-4"
                style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
              >
                <Lock size={16} style={{ color: '#F59E0B' }} />
                <p style={{ fontSize: '12px', color: '#92400E' }}>
                  {t('wizard.step3.marketingTools.emailTemplates.proUnlock')}
                </p>
              </div>

              <button
                onClick={handleUpgradeClick}
                className="w-full h-10 rounded-lg transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700
                }}
              >
                {t('wizard.step3.marketingTools.emailTemplates.upgradeToUse')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CUSTOM REGISTRATION LINKS */}
      <div 
        className="marketing-section rounded-xl p-8 mb-6"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <LinkIcon size={28} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.links.title')}
            </h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.marketingTools.links.subtitle')}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div 
          className="flex items-start gap-2 p-3 rounded-md mb-5"
          style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', border: '1px solid rgba(6, 132, 245, 0.3)' }}
        >
          <Info size={16} style={{ color: '#0684F5', marginTop: '2px' }} />
          <p className="text-xs" style={{ color: '#E2E8F0' }}>
            {t('wizard.step3.marketingTools.links.info')}
          </p>
        </div>

        <div className="w-full h-px mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Link Cards */}
        <div className="space-y-4 mb-5">
          {customLinks.map((link) => {
            const platform = platformConfig[link.platform] || platformConfig.link;
            const Icon = platform.icon;
            const linkUrl = buildTrackedUrl(link.sourceTag);
            const conversion = link.clicks > 0
              ? ((link.registrations / link.clicks) * 100).toFixed(1)
              : '0.0';
            return (
              <div
                key={link.id}
                className="rounded-lg p-5 border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                {/* Row 1 */}
                <div className="custom-link-card-header flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon size={20} style={{ color: platform.color }} />
                    <h4 className="text-base" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {link.name}
                    </h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 600 }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                      {t('wizard.step3.marketingTools.links.active')}
                    </span>
                  </div>
                  <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.1)]">
                    <MoreVertical size={16} style={{ color: '#94A3B8' }} />
                  </button>
                </div>

                {/* Row 2 - URL */}
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="custom-link-url-wrapper flex-1 flex items-center justify-between px-3 py-2.5 rounded-md gap-3"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', minWidth: 0 }}
                  >
                    <code className="custom-link-url-code text-sm truncate" style={{ color: '#0684F5', fontFamily: 'monospace' }}>
                      {linkUrl}
                    </code>
                    <button
                      onClick={() => handleCopyLink(linkUrl)}
                      className="flex items-center gap-1 px-2 h-7 rounded transition-colors hover:bg-[rgba(255,255,255,0.1)] flex-shrink-0"
                    >
                      <Copy size={14} style={{ color: '#94A3B8' }} />
                      <span className="text-xs" style={{ color: '#94A3B8', fontWeight: 600 }}>
                        {t('wizard.step3.marketingTools.links.copy')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Row 3 - Stats */}
                <div className="link-stats-grid grid grid-cols-3 gap-5 mb-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#94A3B8', fontWeight: 500 }}>
                      {t('wizard.step3.marketingTools.links.clicks')}
                    </p>
                    <p className="text-xl" style={{ color: '#FFFFFF', fontWeight: 700 }}>{link.clicks}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#94A3B8', fontWeight: 500 }}>
                      {t('wizard.step3.marketingTools.links.registrations')}
                    </p>
                    <p className="text-xl" style={{ color: '#FFFFFF', fontWeight: 700 }}>{link.registrations}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#94A3B8', fontWeight: 500 }}>
                      {t('wizard.step3.marketingTools.links.conversion')}
                    </p>
                    <p 
                      className="text-xl"
                      style={{ color: '#10B981', fontWeight: 700 }}
                    >
                      {conversion}%
                    </p>
                  </div>
                </div>

                {/* Row 4 - Analytics Link */}
                <button className="flex items-center gap-1 text-xs transition-colors hover:underline" style={{ color: '#0684F5', fontWeight: 600 }}>
                  <BarChart3 size={12} />
                  {t('wizard.step3.marketingTools.links.analytics')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Link Button */}
        <button
          onClick={() => setIsLinkModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-lg transition-colors"
          style={{ backgroundColor: '#0684F5', color: '#FFFFFF', fontWeight: 600 }}
        >
          <Plus size={18} />
          {t('wizard.step3.marketingTools.links.create')}
        </button>
        <p className="text-xs text-center mt-2" style={{ color: '#6B7280' }}>
          {t('wizard.step3.marketingTools.links.limit')}
        </p>
      </div>

      {/* SECTION 4: SOCIAL MEDIA SHARING */}
      <div 
        className="marketing-section rounded-xl p-8 mb-6"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          >
            <Share2 size={28} style={{ color: 'var(--success)' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.social.title')}
            </h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.marketingTools.social.subtitle')}
            </p>
          </div>
        </div>
        <div className="w-full h-px mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Share Preview Card */}
        <div 
          className="share-preview-card p-6 rounded-lg mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(6, 132, 245, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p className="text-sm mb-3" style={{ color: '#94A3B8', fontWeight: 500 }}>
            {t('wizard.step3.marketingTools.social.preview')}
          </p>
          <div 
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
          >
            {/* Image */}
            <div 
              className="share-preview-image relative"
              style={{ 
                height: '240px',
                backgroundImage: eventDetails.coverImageUrl
                  ? `url('${eventDetails.coverImageUrl}')`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="text-center px-4">
                <h3 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {sharePreviewTitle}
                </h3>
                <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {sharePreviewDate} - {sharePreviewLocation}
                </p>
              </div>
            </div>
            {/* Text */}
            <div className="p-4">
              <h4 className="text-lg mb-2" style={{ fontWeight: 600, color: '#0B2641' }}>
                {sharePreviewTitle}
              </h4>
              <p className="text-sm mb-2 line-clamp-2" style={{ color: '#6B7280' }}>
                {sharePreviewDescription}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{shareDomain}</span>
                <span 
                  className="px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: 'rgba(6, 132, 245, 0.1)', color: 'var(--primary)', fontWeight: 600 }}
                >
                  {sharePreviewDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Share Settings Form */}
        <div className="space-y-6 mb-6">
          {/* Social Title */}
          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.social.fields.title')}
            </label>
            <input
              type="text"
              value={socialShare.title}
              onChange={(e) => setSocialShare((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full h-11 px-4 rounded-lg border outline-none"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF' }}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {t('wizard.step3.marketingTools.social.fields.titleHint')}
              </p>
              <span className="text-xs" style={{ color: '#10B981', fontWeight: 600 }}>{titleCharCount}/60</span>
            </div>
          </div>

          {/* Social Description */}
          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.social.fields.description')}
            </label>
            <textarea
              value={socialShare.description}
              onChange={(e) => setSocialShare((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full h-24 p-4 rounded-lg border outline-none resize-none"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF' }}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {t('wizard.step3.marketingTools.social.fields.descriptionHint')}
              </p>
              <span className="text-xs" style={{ color: '#10B981', fontWeight: 600 }}>{descriptionCharCount}/155</span>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#FFFFFF' }}>{t('wizard.step3.marketingTools.social.options.includeDate')}</span>
              <button
                className="relative w-11 h-6 rounded-full transition-colors"
                onClick={() => setSocialShare((prev) => ({ ...prev, includeDate: !prev.includeDate }))}
                style={{ backgroundColor: socialShare.includeDate ? '#0684F5' : 'rgba(255, 255, 255, 0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{ left: socialShare.includeDate ? 'calc(100% - 22px)' : '2px' }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#FFFFFF' }}>{t('wizard.step3.marketingTools.social.options.includeLink')}</span>
              <button
                className="relative w-11 h-6 rounded-full transition-colors"
                onClick={() => setSocialShare((prev) => ({ ...prev, includeLink: !prev.includeLink }))}
                style={{ backgroundColor: socialShare.includeLink ? '#0684F5' : 'rgba(255, 255, 255, 0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{ left: socialShare.includeLink ? 'calc(100% - 22px)' : '2px' }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#FFFFFF' }}>{t('wizard.step3.marketingTools.social.options.includeHashtag')}</span>
              <button
                className="relative w-11 h-6 rounded-full transition-colors"
                onClick={() => setSocialShare((prev) => ({ ...prev, includeHashtag: !prev.includeHashtag }))}
                style={{ backgroundColor: socialShare.includeHashtag ? '#0684F5' : 'rgba(255, 255, 255, 0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{ left: socialShare.includeHashtag ? 'calc(100% - 22px)' : '2px' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div>
          <p className="text-sm mb-3" style={{ color: '#94A3B8', fontWeight: 500 }}>{t('wizard.step3.marketingTools.social.quickShare')}</p>
          <div className="share-buttons-grid grid grid-cols-4 gap-3">
            <button
              onClick={() => handleShare('facebook')}
              className="h-10 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: '#1877F2', color: '#FFFFFF', fontWeight: 600 }}
            >
              <Share2 size={16} />
              {t('wizard.step3.marketingTools.platforms.facebook')}
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="h-10 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: '#0A66C2', color: '#FFFFFF', fontWeight: 600 }}
            >
              <Share2 size={16} />
              {t('wizard.step3.marketingTools.platforms.linkedin')}
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="h-10 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: '#000000', color: '#FFFFFF', fontWeight: 600 }}
            >
              <Share2 size={16} />
              {t('wizard.step3.marketingTools.platforms.twitter')}
            </button>
            <button
              onClick={() => {
                handleCopyLink(socialShare.includeLink ? baseRegistrationUrl : '');
              }}
              className="h-10 rounded-lg flex items-center justify-center gap-2 border transition-colors"
              style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'transparent', color: '#E2E8F0', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Copy size={16} />
              {t('wizard.step3.marketingTools.links.copy')}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: SCHEDULED CAMPAIGNS (PRO) */}
      <div 
        className="marketing-section rounded-xl p-8 mb-6 relative overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid #F59E0B'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
            >
              <Calendar size={28} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {t('wizard.step3.marketingTools.scheduled.title')}
                </h3>
                <span 
                  className="px-2 py-1 rounded text-xs flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  <Crown size={12} />
                  PRO
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleUpgradeClick}
            className="h-10 px-5 rounded-lg transition-transform hover:scale-105 w-full sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontWeight: 700
            }}
          >
            {t('wizard.step3.marketingTools.actions.upgradeToPro')}
          </button>
        </div>

        {/* Upgrade Card */}
        {!hasPro && (
          <div 
            className="rounded-lg p-8 text-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
            >
              <Lock size={32} style={{ color: '#FFFFFF' }} />
            </div>
            <h4 className="text-xl mb-4" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.scheduled.lockedTitle')}
            </h4>
            <div className="space-y-2 mb-6">
              {[
                t('wizard.step3.marketingTools.scheduled.features.schedule'),
                t('wizard.step3.marketingTools.scheduled.features.drip'),
                t('wizard.step3.marketingTools.scheduled.features.abTesting'),
                t('wizard.step3.marketingTools.scheduled.features.reminders'),
                t('wizard.step3.marketingTools.scheduled.features.analytics')
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 justify-center">
                  <Check size={16} style={{ color: '#10B981' }} />
                  <span className="text-sm" style={{ color: '#E2E8F0' }}>{feature}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgradeClick}
              className="w-full h-13 rounded-lg mb-2 transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                padding: '12px 0'
              }}
            >
              {t('wizard.step3.marketingTools.actions.upgradeToProWithPrice', { price: '$49/month' })}
            </button>
            <button className="text-xs transition-colors hover:underline" style={{ color: '#0684F5' }}>
              {t('wizard.step3.marketingTools.actions.learnMore')}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 6: WHATSAPP INTEGRATION (PRO) */}
      <div 
        className="marketing-section rounded-xl p-8 mb-20 relative overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(37, 211, 102, 0.5)'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between mb-5 gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={28} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {t('wizard.step3.marketingTools.whatsapp.title')}
                </h3>
                <span 
                  className="px-2 py-1 rounded text-xs flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  <Crown size={12} />
                  PRO
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleUpgradeClick}
            className="h-10 px-5 rounded-lg transition-transform hover:scale-105 w-full sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontWeight: 700
            }}
          >
            {t('wizard.step3.marketingTools.actions.upgradeToPro')}
          </button>
        </div>

        {/* Upgrade Card */}
        {!hasPro && (
          <div 
            className="rounded-lg p-8 text-center"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)' }}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={32} style={{ color: '#FFFFFF' }} />
            </div>
            <h4 className="text-xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.marketingTools.whatsapp.lockedTitle')}
            </h4>
            <p className="text-base mb-6" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.marketingTools.whatsapp.lockedSubtitle')}
            </p>
            <div className="space-y-2 mb-6">
              {[
                t('wizard.step3.marketingTools.whatsapp.features.confirmations'),
                t('wizard.step3.marketingTools.whatsapp.features.reminders'),
                t('wizard.step3.marketingTools.whatsapp.features.twoWay'),
                t('wizard.step3.marketingTools.whatsapp.features.broadcast'),
                t('wizard.step3.marketingTools.whatsapp.features.richMedia')
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 justify-center">
                  <Check size={16} style={{ color: '#25D366' }} />
                  <span className="text-sm" style={{ color: '#E2E8F0' }}>{feature}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgradeClick}
              className="w-full h-13 rounded-lg mb-2 transition-transform hover:scale-105"
              style={{
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                padding: '12px 0'
              }}
            >
              {t('wizard.step3.marketingTools.actions.upgradeToPro')}
            </button>
            <button className="text-xs transition-colors hover:underline" style={{ color: '#0684F5' }}>
              {t('wizard.step3.marketingTools.actions.learnMore')}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isEmailEditorOpen && editingTemplate && (
        <EmailEditorModal
          isOpen={isEmailEditorOpen}
          onClose={() => {
            setIsEmailEditorOpen(false);
            setEditingTemplate(null);
          }}
          template={editingTemplate}
          onSave={() => {
            setToastMessage(t('wizard.step3.marketingTools.toasts.templateSaved'));
            setShowToast(true);
            setIsEmailEditorOpen(false);
            setEditingTemplate(null);
          }}
        />
      )}

      <CustomLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        baseUrl={baseRegistrationUrl || 'https://eventra.app'}
        onSave={handleCreateLink}
      />

      <CampaignCreatorModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSave={() => {
          setToastMessage(t('wizard.step3.marketingTools.toasts.campaignScheduled'));
          setShowToast(true);
          setIsCampaignModalOpen(false);
        }}
      />

      {/* Toast */}
      <SuccessToast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />

      {/* PRO Upgrade Modal */}
      {showProUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowProUpgradeModal(false)}
        >
          <div
            className="relative rounded-xl p-8 max-w-md"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
            >
              <Crown size={32} style={{ color: '#FFFFFF' }} />
            </div>
            <h3 className="text-center mb-2" style={{ fontSize: '24px', fontWeight: 600, color: '#0B2641' }}>
              {t('wizard.step3.marketingTools.proModal.title')}
            </h3>
            <p className="text-center mb-6" style={{ fontSize: '14px', color: '#6B7280' }}>
              {t('wizard.step3.marketingTools.proModal.subtitle')}
            </p>
            <div className="space-y-2 mb-6">
              {[
                t('wizard.step3.marketingTools.proModal.features.reminder'),
                t('wizard.step3.marketingTools.proModal.features.thankYou'),
                t('wizard.step3.marketingTools.proModal.features.customCampaigns'),
                t('wizard.step3.marketingTools.proModal.features.abTesting'),
                t('wizard.step3.marketingTools.proModal.features.analytics')
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  <span className="text-sm" style={{ color: '#0B2641' }}>{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProUpgradeModal(false)}
                className="flex-1 px-4 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
                {t('wizard.step3.marketingTools.actions.maybeLater')}
              </button>
              <button
                onClick={handleUpgradeClick}
                className="flex-1 px-4 py-3 rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t('wizard.step3.marketingTools.actions.upgradeToPro')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
