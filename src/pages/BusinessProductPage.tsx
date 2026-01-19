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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';
import { useMessageThread } from '../hooks/useMessageThread';
import { useAuth } from '../contexts/AuthContext';

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

const buildLongDescription = (
  description: string | null | undefined,
  tags: string[],
  copy: {
    overviewTitle: string;
    whatYouGetTitle: string;
    whyItMattersTitle: string;
    overviewFallback: string;
    whyItMattersBody: string;
    fallbackList: string[];
  }
) => {
  const safeDescription = escapeHtml(description || '');
  const listItems = (tags.length ? tags.slice(0, 6) : copy.fallbackList)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `
    <h3>${escapeHtml(copy.overviewTitle)}</h3>
    <p>${safeDescription || escapeHtml(copy.overviewFallback)}</p>
    <h3>${escapeHtml(copy.whatYouGetTitle)}</h3>
    <ul>${listItems}</ul>
    <h3>${escapeHtml(copy.whyItMattersTitle)}</h3>
    <p>${escapeHtml(copy.whyItMattersBody)}</p>
  `;
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
  const { user } = useAuth();
  const { getOrCreateThread, loading: connecting } = useMessageThread();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [product, setProduct] = useState<Offering | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const longDescription = useMemo(
    () => buildLongDescription(product?.description, tags, longDescriptionCopy),
    [product?.description, tags, longDescriptionCopy]
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
    if (!user?.id) {
      toast.error(t('businessProductPage.errors.loginRequired'));
      return;
    }
    if (!business?.owner_profile_id) {
      toast.error(t('businessProductPage.errors.noOwner'));
      return;
    }
    if (business.owner_profile_id === user?.id) {
      toast.error(t('businessProductPage.errors.contactSelf'));
      return;
    }
    const threadId = await getOrCreateThread(business.owner_profile_id);
    if (threadId) {
      navigate('/messages', { state: { threadId } });
    }
  };

  const handleRequestQuote = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    if (!sessionUser?.id) {
      toast.error(t('businessProductPage.errors.loginRequired'));
      return;
    }
    if (!business?.owner_profile_id) {
      toast.error(t('businessProductPage.errors.noOwner'));
      return;
    }
    if (business.owner_profile_id === sessionUser.id) {
      toast.error(t('businessProductPage.errors.contactSelf'));
      return;
    }
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_recipient_id: business.owner_profile_id,
        p_title: t('businessProductPage.notifications.quoteTitle'),
        p_body: t('businessProductPage.notifications.quoteBody', { product: productName }),
        p_type: 'action',
        p_action_url: `/business/${business.id}/offerings/${product.id}`
      });
      if (error) throw error;
      toast.success(t('businessProductPage.toasts.quoteSent'));
    } catch (error: any) {
      toast.error(error?.message || t('businessProductPage.toasts.quoteFailed'));
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0B2641' }}>
        <NavbarLoggedIn />
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
        <NavbarLoggedIn />
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
    <div className="product-page" style={{ minHeight: '100vh', backgroundColor: '#0B2641' }}>
      <NavbarLoggedIn />

      <style>{`
        @media (max-width: 1024px) {
          .product-page__content {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .product-page__gallery {
            position: static !important;
          }
        }

        @media (max-width: 768px) {
          .product-page__content {
            padding: 16px !important;
            gap: 32px !important;
          }
          .product-page__breadcrumb {
            flex-wrap: wrap;
            row-gap: 6px;
          }
          .product-page__main-image {
            height: 360px !important;
          }
          .product-page__thumbs {
            grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)) !important;
          }
          .product-page__cta {
            flex-direction: column !important;
          }
          .product-page__cta button {
            width: 100% !important;
          }
          .product-page__secondary {
            flex-direction: column !important;
          }
          .product-page__secondary button {
            width: 100% !important;
          }
          .product-page__features-grid {
            grid-template-columns: 1fr !important;
          }
          .product-page__reviews-summary {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .product-page__tabs {
            margin-bottom: 24px !important;
          }
          .product-page__tablist {
            overflow-x: auto;
            white-space: nowrap;
          }
          .product-page__tablist button {
            flex: 0 0 auto;
          }
          .product-page__seller-card .flex.items-start {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          .product-page__main-image {
            height: 280px !important;
          }
          .product-page__thumbs button {
            height: 72px !important;
          }
          .product-page__seller-card {
            padding: 16px !important;
          }
        }
      `}</style>

      {/* Breadcrumb Navigation */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 20px 16px'
        }}
      >
        <div className="product-page__breadcrumb flex items-center gap-2" style={{ fontSize: '14px', color: '#94A3B8' }}>
          <button
            onClick={() => navigate('/b2b-marketplace')}
            className="flex items-center gap-2 transition-colors"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0684F5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={16} />
            {t('businessProductPage.breadcrumb.marketplace')}
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/business/${business.id}`)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0684F5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            {business.company_name || t('businessProductPage.seller.fallbackName')}
          </button>
          <span>/</span>
          <span style={{ color: '#E2E8F0' }}>{productName}</span>
        </div>
      </div>

      {/* Main Content - Split Screen Layout */}
      <div
        className="product-page__content"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        {/* LEFT SIDE: Image Gallery */}
        <div className="product-page__gallery" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          {/* Main Image Display */}
          <div
            className="product-page__main-image"
            style={{
              width: '100%',
              height: '600px',
              backgroundColor: '#152C48',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {images.length ? (
              <img
                src={images[selectedImageIndex]}
                alt={productName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#94A3B8]">
                {t('businessProductPage.pricing.contact')}
              </div>
            )}
            
            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="transition-all"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(11, 38, 65, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.9)'}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="transition-all"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(11, 38, 65, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(11, 38, 65, 0.9)'}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(11, 38, 65, 0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                {selectedImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Discount Badge */}
            {discount && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                  {discount}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div
            className="product-page__thumbs"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(images.length || 1, 5)}, 1fr)`,
              gap: '12px'
            }}
          >
            {images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImageIndex(index)}
                className="transition-all"
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: selectedImageIndex === index ? '2px solid #0684F5' : '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: '#152C48',
                  opacity: selectedImageIndex === index ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (selectedImageIndex !== index) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedImageIndex !== index) {
                    e.currentTarget.style.opacity = '0.6';
                  }
                }}
              >
                <img
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Product Information */}
        <div className="product-page__details">
          {/* Product Header */}
          <div style={{ marginBottom: '24px' }}>
            {/* Type Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'rgba(6, 132, 245, 0.1)',
                border: '1px solid rgba(6, 132, 245, 0.3)',
                marginBottom: '12px'
              }}
            >
              <Package size={14} style={{ color: '#0684F5' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0684F5' }}>
                {productTypeLabel}
              </span>
            </div>

            {/* Product Name */}
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px', lineHeight: 1.2 }}>
              {productName}
            </h1>

            {/* Tagline */}
            <p style={{ fontSize: '18px', color: '#94A3B8', marginBottom: '20px', lineHeight: 1.5 }}>
              {productTagline}
            </p>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`${product?.id || 'rating'}-${i}`}
                      size={18}
                      style={{
                        color: i < Math.floor(ratingValue) ? '#F59E0B' : '#475569',
                        fill: i < Math.floor(ratingValue) ? '#F59E0B' : 'none'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                  {ratingValue.toFixed(1)}
                </span>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('businessProductPage.reviews.count', { count: reviewCount })}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(74, 124, 109, 0.15)',
                    border: '1px solid rgba(74, 124, 109, 0.3)',
                    color: '#4A7C6D',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div
            className="product-page__pricing"
            style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}
          >
            <div className="flex items-end gap-3 mb-2">
              <div style={{ fontSize: '42px', fontWeight: 700, color: '#FFFFFF' }}>
                {priceValue !== null ? formatPrice(priceValue, currency) : t('businessProductPage.pricing.contact')}
              </div>
              {originalPrice !== null && originalPrice > 0 && (
                <div style={{ fontSize: '24px', color: '#64748B', textDecoration: 'line-through', marginBottom: '8px' }}>
                  {formatPrice(originalPrice, currency)}
                </div>
              )}
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
              {pricingModel ? `${currency} ${pricingModel}` : currency}
            </p>

            {/* Quantity Selector (if applicable) */}
            {showQuantity && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', display: 'block', marginBottom: '8px' }}>
                  {t('businessProductPage.pricing.licensesLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100px',
                    padding: '10px',
                    backgroundColor: '#152C48',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* CTA Buttons */}
            <div className="product-page__cta" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={handleRequestQuote}
                className="flex-1 transition-all"
                style={{
                  padding: '16px',
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
                disabled={connecting}
              >
                <FileText size={20} />
                {t('businessProductPage.actions.requestQuote')}
              </button>
              <button
                onClick={handleContactSeller}
                className="flex-1 transition-all"
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(6, 132, 245, 0.1)',
                  color: '#0684F5',
                  border: '1px solid #0684F5',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
                }}
                disabled={connecting}
              >
                <MessageSquare size={20} />
                {t('businessProductPage.actions.messageSeller')}
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="product-page__secondary" style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="flex-1 transition-all"
                style={{
                  padding: '12px',
                  backgroundColor: isSaved ? 'rgba(6, 132, 245, 0.1)' : 'rgba(255,255,255,0.05)',
                  color: isSaved ? '#0684F5' : '#94A3B8',
                  border: `1px solid ${isSaved ? '#0684F5' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSaved ? <Heart size={18} fill="#0684F5" /> : <Heart size={18} />}
                {isSaved ? t('businessProductPage.actions.saved') : t('businessProductPage.actions.wishlist')}
              </button>
              <button
                className="flex-1 transition-all"
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#94A3B8',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success(t('businessProductPage.toasts.linkCopied'));
                  } catch {
                    toast.error(t('businessProductPage.toasts.copyFailed'));
                  }
                }}
              >
                <Share2 size={18} />
                {t('businessProductPage.actions.share')}
              </button>
            </div>

            {/* Trust Indicators */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-4 text-sm">
                {isVerifiedSeller(business.verification_status) && (
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: '13px', color: '#10B981' }}>
                      {t('businessProductPage.seller.verified')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: '#94A3B8' }} />
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>{deliveryTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information Card */}
          <div
            className="product-page__seller-card"
            style={{
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              marginBottom: '32px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '16px' }}>
              {t('businessProductPage.seller.about')}
            </h3>
            <div className="flex items-start gap-4">
              <img
                src={business.logo_url || business.cover_url || ''}
                alt={business.company_name || t('businessProductPage.seller.fallbackName')}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(6, 132, 245, 0.3)'
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                    {business.company_name || t('businessProductPage.seller.fallbackName')}
                  </h4>
                  {isVerifiedSeller(business.verification_status) && (
                    <Check size={16} style={{ color: '#10B981' }} />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {ratingValue.toFixed(1)} {t('businessProductPage.reviews.count', { count: reviewCount })}
                    </span>
                  </div>
                  <span style={{ color: '#64748B' }}>-</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                    {business.created_at
                      ? t('businessProductPage.seller.memberSinceInline', {
                          value: new Date(business.created_at).getFullYear()
                        })
                      : t('businessProductPage.seller.memberSince')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>{business.address || t('marketplace.results.locationTbd')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>{t('businessProductPage.seller.responseInline', { value: sellerResponseTime })}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/business/${business.id}`)}
                  className="transition-all"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(6, 132, 245, 0.1)',
                    border: '1px solid #0684F5',
                    borderRadius: '6px',
                    color: '#0684F5',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'}
                >
                  {t('businessProductPage.seller.viewProfile')}
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs: Description, Specifications, Reviews */}
          <div className="product-page__tabs" style={{ marginBottom: '32px' }}>
            {/* Tab Headers */}
            <div
              className="product-page__tablist flex gap-1"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '24px'
              }}
            >
              {(['description', 'specifications', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="transition-all"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #0684F5' : '2px solid transparent',
                    color: activeTab === tab ? '#0684F5' : '#94A3B8',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = '#CBD5E1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  {t(`businessProductPage.tabs.${tab}`)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'description' && (
                <div>
                  <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: 1.7, marginBottom: '24px' }}>
                    {product.description || t('businessProductPage.longDescription.overviewFallback')}
                  </p>
                  
                  {/* Long Description with HTML */}
                  <div
                    style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{
                      __html: longDescription
                        .replace(/<h3>/g, '<h3 style="font-size: 18px; font-weight: 600; color: #E2E8F0; margin: 24px 0 12px;">')
                        .replace(/<ul>/g, '<ul style="margin-left: 20px; margin-bottom: 16px;">')
                        .replace(/<li>/g, '<li style="margin-bottom: 8px;">')
                        .replace(/<p>/g, '<p style="margin-bottom: 16px;">')
                    }}
                  />

                  {/* Key Features Grid */}
                  <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#E2E8F0', marginBottom: '16px' }}>
                      {t('businessProductPage.features.title')}
                    </h3>
                    <div
                      className="product-page__features-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                      }}
                    >
                      {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div
                            key={`${feature.label}-${index}`}
                            className="flex gap-3 p-4 rounded-lg transition-all"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(6, 132, 245, 0.15)',
                                flexShrink: 0
                              }}
                            >
                              <IconComponent size={20} style={{ color: '#0684F5' }} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '4px' }}>
                                {feature.label}
                              </h4>
                              <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    {[
                      { label: t('businessProductPage.specifications.type'), value: productTypeLabel },
                      {
                        label: t('businessProductPage.specifications.availability'),
                        value: t('businessProductPage.specifications.unlimited')
                      },
                      {
                        label: t('businessProductPage.specifications.quantity'),
                        value: showQuantity ? String(quantity) : t('businessProductPage.specifications.unlimited')
                      },
                      {
                        label: t('businessProductPage.specifications.tags'),
                        value: tags.length ? tags.slice(0, 4).join(', ') : t('businessProductPage.specifications.limited')
                      }
                    ].map((spec, index, list) => (
                      <div
                        key={spec.label}
                        className="flex justify-between py-4 px-5"
                        style={{
                          borderBottom: index < list.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                          {spec.label}
                        </span>
                        <span style={{ fontSize: '14px', color: '#E2E8F0', textAlign: 'right' }}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Reviews Summary */}
                  <div
                    className="product-page__reviews-summary flex items-center gap-8 p-6 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                        {ratingValue.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`summary-${i}`}
                            size={18}
                            style={{
                              color: i < Math.floor(ratingValue) ? '#F59E0B' : '#475569',
                              fill: i < Math.floor(ratingValue) ? '#F59E0B' : 'none'
                            }}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {t('businessProductPage.reviews.count', { count: reviewCount })}
                      </p>
                    </div>
                    <div className="flex-1">
                      {ratingBreakdown.map(({ stars, percentage }) => (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                          <span style={{ fontSize: '13px', color: '#94A3B8', width: '60px' }}>
                            {t('businessProductPage.reviews.starsLabel', { count: stars })}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: '#F59E0B',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', color: '#94A3B8', width: '40px', textAlign: 'right' }}>
                            {percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  {reviews.length ? (
                    <div className="product-page__review-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-5 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#E2E8F0', marginBottom: '4px' }}>
                                {review.author}
                              </h4>
                              {review.company && (
                                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                                  {review.company}
                                </p>
                              )}
                            </div>
                            {review.date && (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                {review.date}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={`${review.id}-star-${i}`}
                                size={14}
                                style={{
                                  color: i < (review.rating || 0) ? '#F59E0B' : '#475569',
                                  fill: i < (review.rating || 0) ? '#F59E0B' : 'none'
                                }}
                              />
                            ))}
                          </div>
                          {review.text && (
                            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '12px' }}>
                              {review.text}
                            </p>
                          )}
                          <button
                            style={{
                              fontSize: '13px',
                              color: '#94A3B8',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {t('businessProductPage.reviews.helpful', { count: review.helpful || 0 })}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#94A3B8', fontSize: '14px' }}>
                      {t('businessProductPage.reviews.empty')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
