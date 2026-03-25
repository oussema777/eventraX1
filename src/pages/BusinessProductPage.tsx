import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Shield,
  Check,
  Share2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Package,
  Zap,
  Globe,
  MapPin,
  Clock,
  Users,
  Award,
  Heart,
  ExternalLink,
  Loader2,
  X,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';
import { useMessageThread } from '../hooks/useMessageThread';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../lib/notifications';
import { sendEmail } from '../lib/email';

type BusinessProfile = {
  id: string;
  company_name: string;
  logo_url: string;
  cover_url: string;
  verification_status: string;
  address: string;
  owner_profile_id: string;
  created_at: string;
  branding: {
    rating: number;
    review_count: number;
    response_time: string;
  };
};

type Offering = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  tags: string[];
  images: string[];
  pricing_model: string;
  delivery_time: string;
  original_price: number;
  discount: string;
  reviews: Array<{
    id: string;
    author: string;
    company: string;
    rating: number;
    date: string;
    text: string;
    helpful: number;
  }>;
  features: Array<{ label: string; description: string } | string>;
};

const FEATURE_ICONS = [Zap, Package, Shield, Globe, Users, Award];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatPrice = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const buildTagline = (description: string | null | undefined, tags: string[]) => {
  const cleaned = (description || '').replace(/\s+/g, ' ').trim();
  if (cleaned) {
    return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  }
  if (tags.length) {
    return `Built for ${tags.slice(0, 3).join(', ')}`;
  }
  return 'Built for modern event teams';
};

const resolveTypeLabel = (value: string | null | undefined, t: (key: string) => string) => {
  if (!value) return t('businessProductPage.types.product');
  return value === 'service'
    ? t('businessProductPage.types.service')
    : t('businessProductPage.types.product');
};

const buildFeatures = (rawFeatures: any, tags: string[]) => {
  const features: Array<{ label: string; description: string }> = [];

  if (Array.isArray(rawFeatures)) {
    rawFeatures.forEach((item) => {
      if (!item) return;
      if (typeof item === 'string') {
        features.push({ label: item, description: `Focused on ${item}` });
        return;
      }
      if (typeof item === 'object' && item.label) {
        features.push({
          label: String(item.label),
          description: item.description ? String(item.description) : 'Tailored to event needs'
        });
      }
    });
  }

  if (!features.length && tags.length) {
    tags.slice(0, 6).forEach((tag) => {
      features.push({ label: tag, description: `Designed around ${tag}` });
    });
  }

  if (!features.length) {
    features.push(

    );
  }

  return features.slice(0, 6).map((feature, index) => ({
    ...feature,
    icon: FEATURE_ICONS[index % FEATURE_ICONS.length]
  }));
};

const computeRating = (rating: number | null, reviews: Array<{ rating: number }>) => {
  if (rating !== null) return rating;
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  return Number((total / reviews.length).toFixed(1));
};

const isVerifiedSeller = (status: string | null | undefined) => {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return ['verified', 'approved', 'validated'].includes(normalized);
};

const normalizeImages = (images: string[], fallback: string) => {
  const unique = images.filter(Boolean);
  if (unique.length) return unique;
  return fallback ? [fallback] : [];
};

export default function BusinessProductPage() {
  const navigate = useNavigate();
  const { businessId, productId } = useParams();
  const { t, tList } = useI18n();
  const { user, profile, signOut } = useAuth();
  const { getOrCreateThread, loading: connecting } = useMessageThread();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [product, setProduct] = useState<Offering | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Quote modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setProduct(null);
        setBusiness(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        let offeringQuery = supabase.from('business_offerings').select('*').eq('id', productId);
        if (businessId) {
          offeringQuery = offeringQuery.eq('business_id', businessId);
        }

        const { data: offering, error: offeringError } = await offeringQuery.single();
        if (offeringError) throw offeringError;

        setProduct(offering);

        const resolvedBusinessId = offering.business_id || businessId;
        if (resolvedBusinessId) {
          const { data: businessData, error: businessError } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', resolvedBusinessId)
            .single();

          if (businessError) throw businessError;
          setBusiness(businessData);
        } else {
          setBusiness(null);
        }
      } catch (error: any) {
        setLoadError(error?.message || t('businessProductPage.notFound.title'));
        setProduct(null);
        setBusiness(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [businessId, productId, t]);

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

  const tags = useMemo(
    () => (Array.isArray(product?.tags) ? product?.tags.filter(Boolean) : []),
    [product?.tags]
  );

  const images = useMemo(() => {
    const raw = Array.isArray(product?.images) ? product?.images : [];
    const fallback = business?.cover_url || business?.logo_url || '';
    return normalizeImages(raw, fallback);
  }, [product?.images, business?.cover_url, business?.logo_url]);

  useEffect(() => {
    if (selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images.length, selectedImageIndex]);

  const longDescriptionCopy = useMemo(
    () => ({
      overviewTitle: t('businessProductPage.longDescription.overviewTitle'),
      whatYouGetTitle: t('businessProductPage.longDescription.whatYouGetTitle'),
      whyItMattersTitle: t('businessProductPage.longDescription.whyItMattersTitle'),
      overviewFallback: t('businessProductPage.longDescription.overviewFallback'),
      whyItMattersBody: t('businessProductPage.longDescription.whyItMattersBody'),
      fallbackList: tList<string>('businessProductPage.longDescription.fallbackList', [
        'Tailored solutions for event teams',
        'Flexible delivery options',
        'Dedicated support'
      ])
    }),
    [t, tList]
  );

  const features = useMemo(
    () => buildFeatures(product?.features, tags),
    [product?.features, tags]
  );

  const reviews = useMemo(() => {
    const rawReviews = Array.isArray(product?.reviews) ? product?.reviews : [];
    return rawReviews.map((review, index) => ({
      id: review.id || `${product?.id || 'review'}-${index}`,
      author: review.author || t('messages.defaults.user'),
      company: review.company || '',
      rating: Number(review.rating) || 0,
      date: review.date || '',
      text: review.text || '',
      helpful: Number(review.helpful) || 0
    }));
  }, [product?.reviews, product?.id, t]);

  const ratingValue = useMemo(() => {
    const brandingRating = toNumberOrNull(business?.branding?.rating);
    return computeRating(brandingRating, reviews);
  }, [business?.branding?.rating, reviews]);

  const reviewCount = useMemo(() => {
    if (reviews.length) return reviews.length;
    const brandingCount = toNumberOrNull(business?.branding?.review_count);
    return brandingCount ? Math.max(0, Math.floor(brandingCount)) : 0;
  }, [reviews.length, business?.branding?.review_count]);

  const ratingBreakdown = useMemo(() => {
    if (!reviews.length) {
      return [5, 4, 3, 2, 1].map((stars) => ({ stars, percentage: 0 }));
    }
    const totals = reviews.reduce((acc, review) => {
      const rating = Math.min(5, Math.max(1, Math.round(review.rating || 0)));
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percentage: Math.round(((totals[stars] || 0) / reviews.length) * 100)
    }));
  }, [reviews]);

  const productName = product?.name || t('browseEventsPage.event.untitled');
  const productTypeLabel = resolveTypeLabel(product?.type, t);
  const productTagline = buildTagline(product?.description, tags);
  const pricingModel = product?.pricing_model || '';
  const currency = product?.currency || 'USD';
  const priceValue = toNumberOrNull(product?.price);
  const originalPrice = toNumberOrNull(product?.original_price);
  const discount = product?.discount;
  const deliveryTime = product?.delivery_time || t('networking.common.tbd');
  const sellerResponseTime = business?.branding?.response_time || t('networking.common.tbd');
  const showQuantity = (product?.type || '').toLowerCase() === 'product';

  const handlePreviousImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleContactSeller = async () => {
    if (!user?.id) { setShowLoginModal(true); return; }
    if (!business?.owner_profile_id) { toast.error(t('businessProductPage.errors.noOwner')); return; }
    if (business.owner_profile_id === user.id) { toast.error(t('businessProductPage.errors.contactSelf')); return; }

    const threadId = await getOrCreateThread(business.owner_profile_id);
    if (!threadId) return;

    // Send an opening message so the conversation isn't blank
    try {
      await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: user.id,
        content: `Hi! I'm interested in "${productName}". Could we discuss further?`,
      });
    } catch { /* non-fatal — thread is created, just no opener */ }

    navigate('/messages', { state: { threadId } });
  };

  // Opens the quote modal (auth-gated)
  const handleRequestQuote = () => {
    if (!user?.id) { setShowLoginModal(true); return; }
    if (!business?.owner_profile_id) { toast.error(t('businessProductPage.errors.noOwner')); return; }
    if (business.owner_profile_id === user.id) { toast.error(t('businessProductPage.errors.contactSelf')); return; }
    setQuoteMessage('');
    setQuoteQuantity(quantity);
    setShowQuoteModal(true);
  };

  // Submits the quote — notification + email + message thread
  const handleSubmitQuote = async () => {
    if (!quoteMessage.trim()) { toast.error('Please describe your requirements'); return; }
    if (!business?.owner_profile_id || !product || !user?.id) return;

    setIsSubmittingQuote(true);
    try {
      // 1. Bell notification to business owner
      await createNotification({
        recipient_id: business.owner_profile_id,
        actor_id: user.id,
        title: `New quote request: ${productName}`,
        body: `${profile?.full_name || user.email} requested a quote for "${productName}". Qty: ${quoteQuantity}. "${quoteMessage.slice(0, 80)}${quoteMessage.length > 80 ? '…' : ''}"`,
        type: 'action',
        action_url: `/business/${business.id}/offerings/${product.id}`,
      });

      // 2. Email to business owner
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', business.owner_profile_id)
        .single();

      if (ownerProfile?.email) {
        const senderName = profile?.full_name || user.email || 'A potential buyer';
        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
            <h2 style="color:#0B2641;margin-bottom:4px;">New Quote Request</h2>
            <p style="color:#6B7280;font-size:13px;margin-top:0;">via Eventra B2B Marketplace</p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0;"/>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6B7280;width:120px;">Product</td><td style="padding:8px 0;font-weight:600;color:#111827;">${escapeHtml(productName)}</td></tr>
              <tr><td style="padding:8px 0;color:#6B7280;">From</td><td style="padding:8px 0;color:#111827;">${escapeHtml(senderName)}</td></tr>
              <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;color:#111827;">${escapeHtml(user.email || '')}</td></tr>
              <tr><td style="padding:8px 0;color:#6B7280;">Quantity</td><td style="padding:8px 0;color:#111827;">${quoteQuantity}</td></tr>
            </table>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Requirements</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(quoteMessage).replace(/\n/g, '<br/>')}</p>
            </div>
            <a href="${window.location.origin}/business/${business.id}/offerings/${product.id}" style="display:inline-block;padding:12px 24px;background:#0684F5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">View Offering</a>
            <p style="font-size:11px;color:#9ca3af;margin-top:24px;">Reply directly to this email or use the Eventra messaging system.</p>
          </div>`;

        await sendEmail({
          to: ownerProfile.email,
          subject: `Quote Request: ${productName} from ${senderName}`,
          html,
        });
      }

      // 3. Create/get message thread and post quote as first message
      const threadId = await getOrCreateThread(business.owner_profile_id);
      if (threadId) {
        await supabase.from('messages').insert({
          thread_id: threadId,
          sender_id: user.id,
          content: `📋 **Quote Request for "${productName}"**\n\nQuantity: ${quoteQuantity}\n\n${quoteMessage}`,
        });
        setShowQuoteModal(false);
        toast.success('Quote sent! Redirecting to messages…');
        setTimeout(() => navigate('/messages', { state: { threadId } }), 1200);
      } else {
        setShowQuoteModal(false);
        toast.success(t('businessProductPage.toasts.quoteSent'));
      }
    } catch (err: any) {
      toast.error(err?.message || t('businessProductPage.toasts.quoteFailed'));
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0B2641' }}>
        {user ? (
          <NavbarLoggedIn onLogout={handleLogout} />
        ) : (
          <NavbarLoggedOut 
            onSignUpClick={() => setShowRegistrationModal(true)}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
        <div className="flex items-center justify-center" style={{ minHeight: '70vh' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#0684F5]" size={40} />
            <p style={{ color: '#94A3B8' }}>{t('businessProductPage.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !business) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0B2641',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {user ? (
          <NavbarLoggedIn onLogout={handleLogout} />
        ) : (
          <NavbarLoggedOut 
            onSignUpClick={() => setShowRegistrationModal(true)}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
        <div style={{ textAlign: 'center', color: '#FFFFFF', padding: '40px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{t('businessProductPage.notFound.title')}</h1>
          {loadError && (
            <p style={{ color: '#94A3B8', marginBottom: '16px' }}>{loadError}</p>
          )}
          <button
            onClick={() => navigate('/b2b-marketplace')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {t('businessProductPage.notFound.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page" style={{ minHeight: '100vh', backgroundColor: '#07192e' }}>
      {user ? (
        <NavbarLoggedIn onLogout={handleLogout} />
      ) : (
        <NavbarLoggedOut
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}

      <style>{`
        .pp-btn-primary { transition: opacity 0.15s, transform 0.1s; }
        .pp-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .pp-btn-ghost:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .pp-thumb:hover { border-color: rgba(6,132,245,0.6) !important; opacity: 1 !important; }
        .pp-feature-card:hover { border-color: rgba(6,132,245,0.3) !important; background: rgba(6,132,245,0.05) !important; }
        .pp-review-card:hover { border-color: rgba(255,255,255,0.15) !important; }
        .pp-tab-btn { transition: color 0.15s, background 0.15s; }

        @media (max-width: 1100px) {
          .pp-layout { grid-template-columns: 1fr !important; }
          .pp-sticky { position: static !important; }
        }
        @media (max-width: 700px) {
          .pp-layout { padding: 16px !important; gap: 32px !important; }
          .pp-hero { padding: 20px 16px 0 !important; }
          .pp-main-img { height: 300px !important; }
          .pp-cta-row { flex-direction: column !important; }
          .pp-cta-row button { width: 100% !important; }
          .pp-sec-row { flex-direction: column !important; }
          .pp-sec-row button { width: 100% !important; }
          .pp-feat-grid { grid-template-columns: 1fr !important; }
          .pp-rev-summary { flex-direction: column !important; }
          .pp-tablist { overflow-x: auto; white-space: nowrap; }
          .pp-tablist button { flex: 0 0 auto; }
          .pp-title { font-size: 26px !important; }
          .pp-price-num { font-size: 34px !important; }
        }
      `}</style>

      {/* ── AMBIENT HERO STRIP ───────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '72px' }}>
        {images[0] && (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${images[0]})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'blur(60px) brightness(0.18)',
              transform: 'scale(1.1)',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,25,46,0.2), #07192e)' }} />
          </>
        )}

        {/* Breadcrumb */}
        <div className="pp-hero" style={{ position: 'relative', maxWidth: '1340px', margin: '0 auto', padding: '28px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/b2b-marketplace')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#0684F5'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
              <ArrowLeft size={14} /> {t('businessProductPage.breadcrumb.marketplace')}
            </button>
            <span style={{ opacity: 0.4 }}>/</span>
            <button onClick={() => navigate(`/business/${business.id}`)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#0684F5'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
              {business.company_name || t('businessProductPage.seller.fallbackName')}
            </button>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: '#94A3B8' }}>{productName}</span>
          </div>
        </div>

        {/* Spacer so hero strip has some height */}
        <div style={{ height: '24px', position: 'relative' }} />
      </div>

      {/* ── MAIN TWO-COLUMN LAYOUT ───────────────────────────────────────────── */}
      <div className="pp-layout" style={{
        maxWidth: '1340px', margin: '0 auto', padding: '0 32px 80px',
        display: 'grid', gridTemplateColumns: '52% 1fr', gap: '48px', alignItems: 'start',
      }}>

        {/* ═══════ LEFT — Gallery ═══════ */}
        <div className="pp-sticky" style={{ position: 'sticky', top: '88px' }}>

          {/* Main image */}
          <div className="pp-main-img" style={{
            width: '100%', height: '520px', borderRadius: '20px', overflow: 'hidden',
            position: 'relative', marginBottom: '14px',
            background: '#0D2540',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            {images.length ? (
              <img src={images[selectedImageIndex]} alt={productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A6080', flexDirection: 'column', gap: '12px' }}>
                <Package size={48} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '14px' }}>{t('businessProductPage.pricing.contact')}</span>
              </div>
            )}

            {/* Discount badge */}
            {discount && (
              <div style={{ position: 'absolute', top: '18px', left: '18px', padding: '6px 14px', borderRadius: '999px', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {discount}
              </div>
            )}

            {/* Type badge */}
            <div style={{ position: 'absolute', top: '18px', right: '18px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', backgroundColor: 'rgba(6,132,245,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(6,132,245,0.35)', fontSize: '12px', fontWeight: 700, color: '#60B4FF' }}>
              <Package size={12} /> {productTypeLabel}
            </div>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                {[{ side: 'left', handler: handlePreviousImage, Icon: ChevronLeft }, { side: 'right', handler: handleNextImage, Icon: ChevronRight }].map(({ side, handler, Icon }) => (
                  <button key={side} onClick={handler} style={{
                    position: 'absolute', top: '50%', [side]: '14px', transform: 'translateY(-50%)',
                    width: '42px', height: '42px', borderRadius: '50%', border: 'none',
                    backgroundColor: 'rgba(7,25,46,0.85)', backdropFilter: 'blur(8px)',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.85)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(7,25,46,0.85)')}>
                    <Icon size={20} />
                  </button>
                ))}
              </>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(7,25,46,0.85)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, i) => (
                <button key={img} className="pp-thumb" onClick={() => setSelectedImageIndex(i)} style={{
                  flexShrink: 0, width: '80px', height: '64px', borderRadius: '10px', overflow: 'hidden', padding: 0,
                  border: i === selectedImageIndex ? '2px solid #0684F5' : '2px solid rgba(255,255,255,0.08)',
                  opacity: i === selectedImageIndex ? 1 : 0.55, cursor: 'pointer', background: '#0D2540', transition: 'all 0.15s',
                }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Quick trust strip */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            {isVerifiedSeller(business.verification_status) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Shield size={14} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>{t('businessProductPage.seller.verified')}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Clock size={14} style={{ color: '#94A3B8' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{deliveryTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <MapPin size={14} style={{ color: '#94A3B8' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{business.address || t('marketplace.results.locationTbd')}</span>
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT — Details ═══════ */}
        <div>

          {/* ── Product header ── */}
          <div style={{ marginBottom: '28px' }}>
            <h1 className="pp-title" style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.5px' }}>
              {productName}
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.65, marginBottom: '18px' }}>
              {productTagline}
            </p>

            {/* Stars + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16}
                    style={{ color: i < Math.floor(ratingValue) ? '#F59E0B' : '#2D4A6E', fill: i < Math.floor(ratingValue) ? '#F59E0B' : 'none' }} />
                ))}
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{ratingValue.toFixed(1)}</span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{t('businessProductPage.reviews.count', { count: reviewCount })}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: '999px', backgroundColor: 'rgba(6,132,245,0.08)', border: '1px solid rgba(6,132,245,0.2)', color: '#60A5FA', fontSize: '12px', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Pricing card ── */}
          <div style={{
            borderRadius: '16px', marginBottom: '20px', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(13,53,87,0.8) 0%, rgba(11,38,65,0.9) 100%)',
            border: '1px solid rgba(6,132,245,0.2)',
            boxShadow: '0 0 0 1px rgba(6,132,245,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            {/* Price row */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span className="pp-price-num" style={{ fontSize: '40px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                  {priceValue !== null ? formatPrice(priceValue, currency) : t('businessProductPage.pricing.contact')}
                </span>
                {originalPrice !== null && originalPrice > 0 && (
                  <span style={{ fontSize: '20px', color: '#475569', textDecoration: 'line-through', marginBottom: '4px' }}>
                    {formatPrice(originalPrice, currency)}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: '#4A6080' }}>
                {pricingModel ? `${pricingModel}` : currency}
              </span>
            </div>

            {/* Quantity */}
            {showQuantity && (
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('businessProductPage.pricing.licensesLabel')}
                </label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '90px', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: 600, outline: 'none' }} />
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ padding: '20px 24px 16px' }}>
              <div className="pp-cta-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button className="pp-btn-primary" onClick={handleRequestQuote} disabled={connecting}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: connecting ? 'wait' : 'pointer', background: 'linear-gradient(135deg, #0684F5, #0457C8)', color: '#fff', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(6,132,245,0.35)' }}>
                  <FileText size={18} /> {t('businessProductPage.actions.requestQuote')}
                </button>
                <button className="pp-btn-primary" onClick={handleContactSeller} disabled={connecting}
                  style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1.5px solid rgba(6,132,245,0.5)', cursor: connecting ? 'wait' : 'pointer', background: 'rgba(6,132,245,0.1)', color: '#60B4FF', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <MessageSquare size={18} /> {t('businessProductPage.actions.messageSeller')}
                </button>
              </div>

              <div className="pp-sec-row" style={{ display: 'flex', gap: '10px' }}>
                <button className="pp-btn-ghost" onClick={() => setIsSaved(!isSaved)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1.5px solid ${isSaved ? 'rgba(6,132,245,0.5)' : 'rgba(255,255,255,0.1)'}`, background: isSaved ? 'rgba(6,132,245,0.1)' : 'transparent', color: isSaved ? '#60B4FF' : '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                  <Heart size={16} fill={isSaved ? '#60B4FF' : 'none'} />
                  {isSaved ? t('businessProductPage.actions.saved') : t('businessProductPage.actions.wishlist')}
                </button>
                <button className="pp-btn-ghost"
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                  onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success(t('businessProductPage.toasts.linkCopied')); } catch { toast.error(t('businessProductPage.toasts.copyFailed')); } }}>
                  <Share2 size={16} /> {t('businessProductPage.actions.share')}
                </button>
              </div>
            </div>
          </div>

          {/* ── Seller card ── */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.07)', background: '#0B2240' }}>
            {/* Cover strip */}
            <div style={{ height: '72px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0D355A, #0B2745)' }}>
              {(business.cover_url || business.logo_url) && (
                <img src={business.cover_url || business.logo_url} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(11,34,64,0.8))' }} />
            </div>

            {/* Body */}
            <div style={{ padding: '0 20px 20px', position: 'relative' }}>
              {/* Overlapping logo */}
              <div style={{ marginTop: '-24px', marginBottom: '12px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(6,132,245,0.4)', background: '#0D2540', flexShrink: 0 }}>
                  <img src={business.logo_url || business.cover_url || ''} alt={business.company_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      {business.company_name || t('businessProductPage.seller.fallbackName')}
                    </span>
                    {isVerifiedSeller(business.verification_status) && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#10B981' }}>
                        <Check size={11} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{ratingValue.toFixed(1)} · {t('businessProductPage.reviews.count', { count: reviewCount })}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#4A6080' }}>
                      {business.created_at
                        ? t('businessProductPage.seller.memberSinceInline', { value: new Date(business.created_at).getFullYear() })
                        : t('businessProductPage.seller.memberSince')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <Clock size={12} style={{ color: '#4A6080' }} />
                    <span style={{ fontSize: '12px', color: '#4A6080' }}>{t('businessProductPage.seller.responseInline', { value: sellerResponseTime })}</span>
                  </div>
                </div>

                <button onClick={() => navigate(`/business/${business.id}`)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(6,132,245,0.4)', background: 'rgba(6,132,245,0.08)', color: '#60B4FF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,132,245,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,132,245,0.08)'}>
                  {t('businessProductPage.seller.viewProfile')} <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ marginBottom: '8px' }}>
            {/* Tab bar */}
            <div className="pp-tablist" style={{ display: 'flex', gap: '4px', backgroundColor: '#0D2540', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
              {(['description', 'specifications', 'reviews'] as const).map(tab => (
                <button key={tab} className="pp-tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                    background: activeTab === tab ? '#0684F5' : 'transparent',
                    color: activeTab === tab ? '#fff' : '#64748B',
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(6,132,245,0.3)' : 'none',
                  }}>
                  {t(`businessProductPage.tabs.${tab}`)}
                </button>
              ))}
            </div>

            {/* ─ Description tab ─ */}
            {activeTab === 'description' && (
              <div>
                {/* Overview */}
                <div style={{ borderLeft: '3px solid #0684F5', paddingLeft: '20px', marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px' }}>
                    {t('businessProductPage.longDescription.overviewTitle')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.75, margin: 0 }}>
                    {product.description || t('businessProductPage.longDescription.overviewFallback')}
                  </p>
                </div>

                {/* What you get */}
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#E2E8F0', marginBottom: '14px' }}>
                    {t('businessProductPage.longDescription.whatYouGetTitle')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(tags.length ? tags.slice(0, 6) : longDescriptionCopy.fallbackList).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} style={{ color: '#10B981' }} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why it matters */}
                <div style={{ marginBottom: '32px', padding: '18px 20px', borderRadius: '12px', background: 'rgba(6,132,245,0.05)', border: '1px solid rgba(6,132,245,0.12)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#60B4FF', marginBottom: '8px' }}>
                    {t('businessProductPage.longDescription.whyItMattersTitle')}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
                    {t('businessProductPage.longDescription.whyItMattersBody')}
                  </p>
                </div>

                {/* Features grid */}
                {features.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#E2E8F0', marginBottom: '14px' }}>
                      {t('businessProductPage.features.title')}
                    </h3>
                    <div className="pp-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                      {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={`${feature.label}-${i}`} className="pp-feature-card"
                            style={{ display: 'flex', gap: '14px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,132,245,0.2), rgba(6,132,245,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(6,132,245,0.15)' }}>
                              <Icon size={18} style={{ color: '#0684F5' }} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0', marginBottom: '3px' }}>{feature.label}</h4>
                              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{feature.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Specifications tab ─ */}
            {activeTab === 'specifications' && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0B2240' }}>
                {[
                  { label: t('businessProductPage.specifications.type'), value: productTypeLabel },
                  { label: t('businessProductPage.specifications.availability'), value: t('businessProductPage.specifications.unlimited') },
                  { label: t('businessProductPage.specifications.quantity'), value: showQuantity ? String(quantity) : t('businessProductPage.specifications.unlimited') },
                  { label: t('businessProductPage.specifications.tags'), value: tags.length ? tags.slice(0, 4).join(', ') : t('businessProductPage.specifications.limited') },
                ].map((spec, i, list) => (
                  <div key={spec.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < list.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4A6080', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{spec.label}</span>
                    <span style={{ fontSize: '14px', color: '#CBD5E1', fontWeight: 500 }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ─ Reviews tab ─ */}
            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary card */}
                <div className="pp-rev-summary" style={{ display: 'flex', gap: '32px', padding: '24px', borderRadius: '16px', background: '#0B2240', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '52px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>{ratingValue.toFixed(1)}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '8px 0 4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} style={{ color: i < Math.floor(ratingValue) ? '#F59E0B' : '#2D4A6E', fill: i < Math.floor(ratingValue) ? '#F59E0B' : 'none' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#4A6080' }}>{t('businessProductPage.reviews.count', { count: reviewCount })}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    {ratingBreakdown.map(({ stars, percentage }) => (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#4A6080', width: '40px', textAlign: 'right', flexShrink: 0 }}>{stars}★</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', borderRadius: '3px', transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#4A6080', width: '32px', flexShrink: 0 }}>{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                {reviews.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.map(review => (
                      <div key={review.id} className="pp-review-card"
                        style={{ padding: '18px 20px', borderRadius: '14px', background: '#0B2240', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                          {/* Avatar */}
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0684F5, #0457C8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                            {(review.author || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2E8F0' }}>{review.author}</span>
                                {review.company && <span style={{ fontSize: '12px', color: '#4A6080', marginLeft: '6px' }}>· {review.company}</span>}
                              </div>
                              {review.date && <span style={{ fontSize: '11px', color: '#2D4A6E' }}>{review.date}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} style={{ color: i < (review.rating || 0) ? '#F59E0B' : '#1E3A5F', fill: i < (review.rating || 0) ? '#F59E0B' : 'none' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.text && (
                          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.65, margin: '0 0 10px' }}>{review.text}</p>
                        )}
                        <button style={{ fontSize: '12px', color: '#2D4A6E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          {t('businessProductPage.reviews.helpful', { count: review.helpful || 0 })}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#2D4A6E' }}>
                    <Star size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: '14px' }}>{t('businessProductPage.reviews.empty')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* ── Quote Request Modal ── */}
      {showQuoteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Backdrop */}
          <div
            onClick={() => !isSubmittingQuote && setShowQuoteModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal card */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: '520px', borderRadius: '20px',
            background: 'linear-gradient(160deg, #0D2F50, #0B2240)',
            border: '1px solid rgba(6,132,245,0.2)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,132,245,0.15)', border: '1px solid rgba(6,132,245,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} style={{ color: '#0684F5' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Request a Quote</h2>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Sending to <span style={{ color: '#94A3B8', fontWeight: 600 }}>{business?.company_name}</span> for <span style={{ color: '#94A3B8' }}>"{productName}"</span>
                </p>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                disabled={isSubmittingQuote}
                style={{ background: 'none', border: 'none', color: '#4A6080', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#4A6080'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Quantity row */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Quantity / Units
                </label>
                <input
                  type="number" min="1" value={quoteQuantity}
                  onChange={e => setQuoteQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100px', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Requirements */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Your Requirements <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={e => setQuoteMessage(e.target.value)}
                  placeholder={`Describe what you need from ${business?.company_name}...\n\nInclude: timeline, specifications, budget range, or any specific requirements.`}
                  rows={6}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${quoteMessage.trim() ? 'rgba(6,132,245,0.4)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.6', transition: 'border-color 0.15s' }}
                />
                <p style={{ fontSize: '12px', color: '#2D4A6E', margin: '6px 0 0' }}>
                  Your message will also appear in your inbox — you can continue the conversation there.
                </p>
              </div>

              {/* Sender info row */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(6,132,245,0.05)', border: '1px solid rgba(6,132,245,0.1)', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#4A6080', margin: '0 0 2px', fontWeight: 600 }}>Sending as</p>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                  {profile?.full_name && <strong style={{ color: '#CBD5E1' }}>{profile.full_name} · </strong>}
                  {user?.email}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  disabled={isSubmittingQuote}
                  style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748B', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuote}
                  disabled={isSubmittingQuote || !quoteMessage.trim()}
                  style={{
                    flex: 2, padding: '13px', borderRadius: '10px', border: 'none',
                    background: isSubmittingQuote || !quoteMessage.trim() ? 'rgba(6,132,245,0.3)' : 'linear-gradient(135deg, #0684F5, #0457C8)',
                    color: '#fff', fontSize: '14px', fontWeight: 700, cursor: isSubmittingQuote || !quoteMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: isSubmittingQuote || !quoteMessage.trim() ? 'none' : '0 6px 20px rgba(6,132,245,0.35)',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSubmittingQuote ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                  ) : (
                    <><Send size={16} /> Send Quote Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
