import { useEffect, useState } from 'react';
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
  Package,
  Zap,
  MapPin,
  Clock,
  TrendingUp,
  Heart,
  ExternalLink
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildTagline = (description: string, fallback: string) => {
  const trimmed = description.replace(/\s+/g, ' ').trim();
  if (!trimmed) return fallback;
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}...`;
};

const buildLongDescription = (description: string | undefined, title: string) => {
  if (!description) return '';
  return `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>`;
};

const formatPrice = (price: number | string | null | undefined) => {
  if (price === null || price === undefined || price === '') return null;
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return String(price);
  return numeric.toFixed(2);
};

const resolveTypeLabel = (
  type: string | undefined,
  fallback: string,
  labels: { product: string; service: string }
) => {
  if (!type) return fallback;
  if (type === 'service') return labels.service;
  if (type === 'product') return labels.product;
  return type;
};

const toNumberOrNull = (value: any) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

export default function BusinessProductPage() {
  const navigate = useNavigate();
  const { businessId, productId } = useParams();
  const { t } = useI18n();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadOffering = async () => {
      setIsLoading(true);
      setNotFound(false);
      setProduct(null);
      setSelectedImageIndex(0);

      if (!productId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: offering, error } = await supabase
          .from('business_offerings')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) throw error;

        if (!offering) {
          setNotFound(true);
          return;
        }

        let businessProfile = null;
        const targetBusinessId = offering.business_id || businessId;
        if (targetBusinessId) {
          const { data: businessData, error: businessError } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', targetBusinessId)
            .maybeSingle();

          if (!businessError) {
            businessProfile = businessData;
          }
        }

        const sellerRating = toNumberOrNull(businessProfile?.branding?.rating);
        const sellerReviewCount = toNumberOrNull(businessProfile?.branding?.review_count);
        const priceLabel = formatPrice(offering.price);
        const tags = Array.isArray(offering.tags) ? offering.tags.filter(Boolean) : [];
        const images = Array.isArray(offering.images) ? offering.images.filter(Boolean) : [];
        const memberSince = businessProfile?.created_at
          ? new Date(businessProfile.created_at).getFullYear().toString()
          : '';
        const typeLabels = {
          product: t('businessProductPage.types.product'),
          service: t('businessProductPage.types.service')
        };
        const specifications = [
          offering.type
            ? {
                label: t('businessProductPage.specifications.type'),
                value: resolveTypeLabel(offering.type, offering.type, typeLabels)
              }
            : null,
          offering.is_unlimited !== null && offering.is_unlimited !== undefined
            ? {
                label: t('businessProductPage.specifications.availability'),
                value: offering.is_unlimited
                  ? t('businessProductPage.specifications.unlimited')
                  : t('businessProductPage.specifications.limited')
              }
            : null,
          offering.quantity_total !== null && offering.quantity_total !== undefined
            ? { label: t('businessProductPage.specifications.quantity'), value: offering.quantity_total.toString() }
            : null,
          tags.length > 0
            ? { label: t('businessProductPage.specifications.tags'), value: tags.join(', ') }
            : null
        ].filter(Boolean);

        const sellerId = businessProfile?.id || offering.business_id || businessId || '';

        setProduct({
          id: offering.id,
          name: offering.name,
          type: resolveTypeLabel(offering.type, offering.type || t('businessProductPage.types.product'), typeLabels),
          tagline: offering.description ? buildTagline(offering.description, '') : '',
          description: offering.description || '',
          longDescription: buildLongDescription(offering.description, t('businessProductPage.overview')),
          price: priceLabel,
          currency: offering.currency || '',
          tags,
          images,
          rating: sellerRating,
          reviewCount: sellerReviewCount,
          specifications,
          reviews: [],
          features: [],
          pricingModel: '',
          showQuantity: offering.type === 'product' && offering.is_unlimited !== true && offering.quantity_total !== null && offering.quantity_total !== undefined,
          quantityTotal: offering.quantity_total,
          seller: {
            id: sellerId,
            name: businessProfile?.company_name || t('businessProductPage.seller.fallbackName'),
            logo: businessProfile?.logo_url || '',
            location: businessProfile?.address || '',
            email: businessProfile?.email || '',
            phone: businessProfile?.phone || '',
            memberSince,
            rating: sellerRating,
            reviewCount: sellerReviewCount
          },
          sellerVerified: businessProfile?.verification_status === 'verified',
          originalPrice: undefined,
          discount: undefined
        });
        setNotFound(false);
      } catch (err) {
        console.error('Error loading offering:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOffering();
  }, [productId, businessId]);

  useEffect(() => {
    if (!product) return;
    const hasSpecifications = Array.isArray(product.specifications) && product.specifications.length > 0;
    const hasReviews = Array.isArray(product.reviews) && product.reviews.length > 0;
    const availableTabs: Array<'description' | 'specifications' | 'reviews'> = ['description'];
    if (hasSpecifications) availableTabs.push('specifications');
    if (hasReviews) availableTabs.push('reviews');
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('description');
    }
  }, [product, activeTab]);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex items-center justify-center text-white">
        {t('businessProductPage.loading')}
      </div>
    );
  }

  if (!product || notFound) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex items-center justify-center">
        <NavbarLoggedIn />
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold text-white mb-4">{t('businessProductPage.notFound.title')}</h1>
          <button
            onClick={() => navigate('/b2b-marketplace')}
            className="px-6 py-3 bg-[#00D4D4] hover:bg-[#00B8B8] text-white font-semibold rounded-lg transition-colors"
          >
            {t('businessProductPage.notFound.back')}
          </button>
        </div>
      </div>
    );
  }

  const handlePreviousImage = () => {
    if (!product.images?.length) return;
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product.images?.length) return;
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  const hasTags = Array.isArray(product.tags) && product.tags.length > 0;
  const hasRating = product.rating !== null && product.rating !== undefined;
  const hasReviewCount = product.reviewCount !== null && product.reviewCount !== undefined;
  const hasSpecifications = Array.isArray(product.specifications) && product.specifications.length > 0;
  const hasReviews = Array.isArray(product.reviews) && product.reviews.length > 0;
  const hasFeatures = Array.isArray(product.features) && product.features.length > 0;
  const contactPriceLabel = t('businessProductPage.pricing.contact');
  const priceLabel = product.price ? product.price : contactPriceLabel;
  const showCurrency = !!product.currency;
  const showPricingModel = !!product.pricingModel;
  const showQuantity = !!product.showQuantity;
  const showDeliveryTime = !!product.deliveryTime;
  const showSellerLocation = !!product.seller?.location;
  const ratingValue = hasRating ? Math.floor(product.rating) : 0;
  const showSellerResponse = !!product.seller?.responseTime;
  const showSellerMemberSince = !!product.seller?.memberSince;
  const showSellerMeta = showSellerResponse || showSellerMemberSince;
  const tabLabels: Record<'description' | 'specifications' | 'reviews', string> = {
    description: t('businessProductPage.tabs.description'),
    specifications: t('businessProductPage.tabs.specifications'),
    reviews: t('businessProductPage.tabs.reviews')
  };
  const availableTabs: Array<'description' | 'specifications' | 'reviews'> = [
    'description',
    ...(hasSpecifications ? (['specifications'] as const) : []),
    ...(hasReviews ? (['reviews'] as const) : [])
  ];

  return (
    <div className="min-h-screen bg-[#0B2641] text-white font-sans business-product-page">
      <style>{`
        @media (max-width: 900px) {
          .business-product-page .product-breadcrumb {
            flex-wrap: wrap;
            row-gap: 8px;
          }
          .business-product-page .product-tabs {
            flex-wrap: wrap;
          }
          .business-product-page .product-tabs button {
            padding: 12px 16px;
          }
          .business-product-page .product-thumbnails {
            gap: 12px;
          }
          .business-product-page .product-thumbnail {
            width: 72px;
          }
          .business-product-page .product-action-card {
            padding: 20px;
          }
          .business-product-page .product-seller-card {
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .business-product-page .product-title {
            font-size: 28px;
          }
          .business-product-page .product-price {
            font-size: 36px;
          }
          .business-product-page .product-thumbnail {
            width: 64px;
          }
          .business-product-page .seller-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <NavbarLoggedIn />
      
      {/* Breadcrumb - Polished */}
      <div className="max-w-7xl mx-auto px-6 py-8" style={{ marginTop: '72px' }}>
        <nav className="flex items-center gap-3 text-sm text-slate-400 product-breadcrumb">
          <button 
            onClick={() => navigate('/b2b-marketplace')}
            className="hover:text-[#00D4D4] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            {t('businessProductPage.breadcrumb.marketplace')}
          </button>
          <span className="opacity-30">/</span>
          <button 
            onClick={() => {
              if (businessId) {
                navigate(`/business/${businessId}`);
                return;
              }
              if (product.seller.id) {
                navigate(`/business/${product.seller.id}`);
                return;
              }
              navigate('/business-profile');
            }}
            className="hover:text-[#00D4D4] transition-colors"
          >
            {product.seller.name}
          </button>
          <span className="opacity-30">/</span>
          <span className="text-slate-200 font-medium">{product.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE: Visuals & Core Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Image Showcase */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-[#1E293B] rounded-2xl overflow-hidden border border-white/5 group">
                {hasImages ? (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Package size={56} />
                  </div>
                )}
                
                {/* Navigation */}
                {hasImages && product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00D4D4] hover:border-[#00D4D4]"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00D4D4] hover:border-[#00D4D4]"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-[#00D4D4]/90 backdrop-blur-sm text-black text-xs font-bold rounded-lg tracking-wider uppercase">
                    {product.type}
                  </span>
                  {product.discount && (
                    <span className="px-3 py-1.5 bg-[#FF5722] text-white text-xs font-bold rounded-lg tracking-wider uppercase">
                      {product.discount}
                    </span>
                  )}
                </div>

                {hasImages && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide product-thumbnails">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 product-thumbnail ${selectedImageIndex === idx ? 'border-[#00D4D4] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Header Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight product-title">
                  {product.name}
                </h1>
                {product.tagline && (
                  <p className="text-xl text-slate-400 font-medium italic">
                    "{product.tagline}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
                {hasRating && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-[#F59E0B]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} fill={i < ratingValue ? 'currentColor' : 'none'} className={i >= ratingValue ? 'opacity-30' : ''} />
                        ))}
                      </div>
                      <span className="text-lg font-bold">{product.rating}</span>
                      {hasReviewCount && (
                        <span className="text-slate-500">
                          {t('businessProductPage.reviews.count', { count: product.reviewCount })}
                        </span>
                      )}
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden md:block" />
                  </>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <Package size={18} className="text-[#00D4D4]" />
                  <span className="font-medium">
                    {t('businessProductPage.labels.id')}: {product.id}
                  </span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                {product.sellerVerified && (
                  <div className="flex items-center gap-2 text-[#10B981]">
                    <Shield size={18} />
                    <span className="font-semibold">{t('businessProductPage.labels.verified')}</span>
                  </div>
                )}
              </div>

              {hasTags && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-[#1E293B] text-slate-300 rounded-full text-xs font-semibold border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs Section */}
            <div className="space-y-8">
              <div className="flex border-b border-white/10 product-tabs">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 text-sm font-bold tracking-wide uppercase transition-all relative ${activeTab === tab ? 'text-[#00D4D4]' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tabLabels[tab]}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00D4D4] rounded-t-full shadow-[0_-4px_12px_rgba(0,212,212,0.4)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="prose prose-invert max-w-none prose-h3:text-2xl prose-h3:font-bold prose-h3:text-[#00D4D4] prose-p:text-slate-300 prose-li:text-slate-300 whitespace-pre-wrap">
                      {product.description && (
                        <p className="text-lg leading-relaxed mb-8">{product.description}</p>
                      )}
                      {product.longDescription && (
                        <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                      )}
                    </div>

                    {hasFeatures && (
                      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features.map((feature: any, idx: number) => {
                          const Icon = feature.icon;
                          return (
                            <div key={idx} className="p-6 bg-[#1E293B]/50 rounded-2xl border border-white/5 hover:border-[#00D4D4]/30 transition-all group">
                              <div className="w-12 h-12 rounded-xl bg-[#00D4D4]/10 flex items-center justify-center mb-4 text-[#00D4D4] group-hover:scale-110 transition-transform">
                                <Icon size={24} />
                              </div>
                              <h4 className="text-lg font-bold mb-2">{feature.label}</h4>
                              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && hasSpecifications && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-[#1E293B]/30 rounded-xl border border-white/5">
                        <span className="text-slate-500 font-medium">{spec.label}</span>
                        <span className="text-white font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && hasReviews && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Reviews Summary Header */}
                    <div className="p-8 bg-gradient-to-br from-[#1E293B] to-[#0B2641] rounded-3xl border border-white/10 flex flex-col md:flex-row gap-10 items-center">
                      <div className="text-center md:border-r border-white/10 md:pr-10">
                        <div className="text-6xl font-black text-white mb-2">{hasRating ? product.rating : 'N/A'}</div>
                        <div className="flex items-center justify-center gap-1 text-[#F59E0B] mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} fill={i < ratingValue ? 'currentColor' : 'none'} className={i >= ratingValue ? 'opacity-30' : ''} />
                          ))}
                        </div>
                        <div className="text-slate-400 text-sm font-medium">
                          {t('businessProductPage.reviews.globalSatisfaction')}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const percent = stars === 5 ? 85 : stars === 4 ? 12 : 3;
                          return (
                            <div key={stars} className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-500 w-12">
                                {t('businessProductPage.reviews.starsLabel', { count: stars })}
                              </span>
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00D4D4]" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-400 w-10 text-right">{percent}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Cards */}
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="p-6 bg-[#1E293B]/20 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#00D4D4]/20 flex items-center justify-center text-[#00D4D4] font-bold">
                              {review.author[0]}
                            </div>
                            <div>
                              <div className="font-bold">{review.author}</div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest">{review.company}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 font-medium">{review.date}</div>
                        </div>
                        <div className="flex text-[#F59E0B]">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'opacity-20' : ''} />)}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{review.text}</p>
                        <div className="pt-2">
                          <button className="text-xs font-bold text-[#00D4D4] hover:underline flex items-center gap-2">
                            <TrendingUp size={14} />
                            {t('businessProductPage.reviews.helpful', { count: review.helpful })}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Pricing & Seller (4 Cols) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            
            {/* Action Card */}
            <div className="p-8 bg-[#1E293B] rounded-3xl border border-white/10 shadow-2xl space-y-8 product-action-card">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {showCurrency && (
                    <span className="text-sm font-bold text-[#00D4D4] uppercase tracking-widest">{product.currency}</span>
                  )}
                  <span className="text-5xl font-black text-white product-price">{priceLabel}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-slate-500 line-through">{product.originalPrice}</span>
                    <span className="text-sm font-bold text-[#FF5722]">{product.discount}</span>
                  </div>
                )}
                {showPricingModel && <p className="text-slate-400 font-medium">{product.pricingModel}</p>}
              </div>

              <div className="space-y-4">
                {showQuantity && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {t('businessProductPage.pricing.quantityLabel')}
                    </label>
                    <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00D4D4] transition-colors">-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="flex-1 bg-transparent text-center font-bold text-lg outline-none"
                      />
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:text-[#00D4D4] transition-colors">+</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <button className="w-full h-14 bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_rgba(255,87,34,0.3)] flex items-center justify-center gap-3">
                    <Zap size={20} />
                    {t('businessProductPage.actions.requestQuote')}
                  </button>
                  <button className="w-full h-14 bg-[#00D4D4]/10 hover:bg-[#00D4D4]/20 border border-[#00D4D4] text-[#00D4D4] font-bold rounded-xl transition-all flex items-center justify-center gap-3">
                    <MessageSquare size={20} />
                    {t('businessProductPage.actions.messageSeller')}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex-1 h-12 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${isSaved ? 'bg-[#D5006D]/10 border-[#D5006D] text-[#D5006D]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? t('businessProductPage.actions.saved') : t('businessProductPage.actions.wishlist')}
                </button>
                <button className="flex-1 h-12 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm">
                  <Share2 size={18} />
                  {t('businessProductPage.actions.share')}
                </button>
              </div>

              {(showDeliveryTime || showSellerLocation) && (
                <div className="pt-6 border-t border-white/5 space-y-4">
                  {showDeliveryTime && (
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <Clock size={16} className="text-[#00D4D4]" />
                      <span>{t('businessProductPage.labels.deliveryTime', { value: product.deliveryTime })}</span>
                    </div>
                  )}
                  {showSellerLocation && (
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <MapPin size={16} className="text-[#00D4D4]" />
                      <span>{t('businessProductPage.labels.shipsFrom', { value: product.seller.location })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seller Quick Card */}
            <div className="p-6 bg-[#1E293B]/50 rounded-3xl border border-white/5 space-y-6 product-seller-card">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('businessProductPage.seller.managedBy')}
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {product.seller.logo ? (
                    <img src={product.seller.logo} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00D4D4]" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#00D4D4] bg-[#0B2641] flex items-center justify-center text-sm font-bold text-[#00D4D4]">
                      {product.seller.name?.[0] || 'S'}
                    </div>
                  )}
                  {product.sellerVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center text-white border-4 border-[#1E293B]">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-black text-xl">{product.seller.name}</div>
                  {hasRating && (
                    <div className="flex items-center gap-2 text-[#F59E0B] text-sm">
                      <Star size={14} fill="currentColor" />
                      <span className="font-bold">{product.seller.rating}</span>
                      {hasReviewCount && (
                        <span className="text-slate-500">
                          {t('businessProductPage.seller.deals', { count: product.seller.reviewCount })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {showSellerMeta && (
                <div className="grid grid-cols-2 gap-4 seller-meta-grid">
                  {showSellerResponse && (
                    <div className="p-3 bg-black/20 rounded-xl text-center">
                      <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">
                        {t('businessProductPage.seller.response')}
                      </div>
                      <div className="font-bold text-white tracking-tight">{product.seller.responseTime}</div>
                    </div>
                  )}
                  {showSellerMemberSince && (
                    <div className="p-3 bg-black/20 rounded-xl text-center">
                      <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">
                        {t('businessProductPage.seller.memberSince')}
                      </div>
                      <div className="font-bold text-white tracking-tight">{product.seller.memberSince}</div>
                    </div>
                  )}
                </div>
              )}
              <button 
                onClick={() => {
                  if (businessId) {
                    navigate(`/business/${businessId}`);
                    return;
                  }
                  if (product.seller.id) {
                    navigate(`/business/${product.seller.id}`);
                    return;
                  }
                  navigate('/business-profile');
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
              >
                {t('businessProductPage.seller.viewProfile')}
                <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

