import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Package,
  DollarSign,
  Tag as TagIcon,
  Image as ImageIcon,
  Save,
  Upload,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { uploadFile } from '../../utils/storage';
import { useI18n } from '../../i18n/I18nContext';

interface Product {
  id?: string;
  name: string;
  sector: string;
  subsector: string;
  description: string;
  price: string;
  currency: string;
  tags: string[];
  mainImage: string;
  gallery: string[];
}

const SECTORS_KEYS: Record<string, string[]> = {
  Technology: ['Software Development', 'Event Tech', 'AI Tools', 'Analytics'],
  'Professional Services': ['Consulting', 'Advisory', 'Operations', 'Legal'],
  Marketing: ['Digital Marketing', 'Brand Strategy', 'Growth', 'Content'],
  Finance: ['Accounting', 'Payments', 'Investment', 'FinTech'],
  Logistics: ['Shipping', 'Warehousing', 'Transportation', 'Fulfillment'],
  Production: ['A/V Production', 'Stage Design', 'Lighting', 'Sound']
};

export default function ProductsManagementTab({ businessId }: { businessId?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Product>({
    name: '',
    sector: 'Technology',
    subsector: 'Software Development',
    description: '',
    price: '',
    currency: 'USD',
    tags: [],
    mainImage: '',
    gallery: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (businessId) {
      fetchOfferings();
    }
  }, [businessId]);

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_offerings')
        .select('*')
        .eq('business_id', businessId);

      if (error) throw error;
      
      setProducts((data || []).map(item => ({
        id: item.id,
        name: item.name,
        sector: item.type === 'product' ? 'Technology' : 'Professional Services', // Map back if needed
        subsector: item.tags?.[0] || '',
        description: item.description || '',
        price: item.price?.toString() || '0',
        currency: item.currency || 'USD',
        tags: item.tags || [],
        mainImage: item.images?.[0] || '',
        gallery: item.images?.slice(1) || []
      })));
    } catch (error) {
      console.error('Error fetching offerings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sector: 'Technology',
      subsector: 'Software Development',
      description: '',
      price: '',
      currency: 'USD',
      tags: [],
      mainImage: '',
      gallery: []
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowProductModal(true);
  };

  const handleOpenProduct = (id?: string) => {
    if (!id || !businessId) return;
    navigate(`/business/${businessId}/offerings/${id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('business_offerings').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success(t('productsManagement.toasts.offeringRemoved'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveProduct = async () => {
    if (!businessId) return;
    try {
      setIsSaving(true);
      const payload = {
        business_id: businessId,
        type: formData.sector.toLowerCase().includes('service') ? 'service' : 'product',
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : 0,
        currency: formData.currency,
        tags: formData.tags,
        images: [formData.mainImage, ...formData.gallery].filter(Boolean)
      };

      let result;
      if (editingProduct?.id) {
        result = await supabase.from('business_offerings').update(payload).eq('id', editingProduct.id);
      } else {
        result = await supabase.from('business_offerings').insert([payload]);
      }

      if (result.error) throw result.error;
      
      toast.success(t('productsManagement.toasts.offeringSaved'));
      setShowProductModal(false);
      fetchOfferings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const trimmed = tagInput.trim();
    if (!trimmed || formData.tags.includes(trimmed)) return;
    setFormData({ ...formData, tags: [...formData.tags, trimmed] });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleImageUpload = async (file: File, isMain: boolean, index?: number) => {
    if (!businessId) return;
    try {
      const path = `${businessId}/offerings/${Date.now()}_${file.name}`;
      const url = await uploadFile('business-assets', path, file);
      if (url) {
        if (isMain) {
          setFormData({ ...formData, mainImage: url });
        } else if (index !== undefined) {
          const newGallery = [...formData.gallery];
          newGallery[index] = url;
          setFormData({ ...formData, gallery: newGallery });
        }
      }
    } catch (error) {
      toast.error(t('productsManagement.toasts.uploadFailed'));
    }
  };

  if (isLoading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="animate-spin text-[#0684F5]" size={40} />
    </div>
  );



  return (
    <div className="products-management">
      <style>{`
        @media (max-width: 600px) {
          .products-management__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .products-management__header button {
            width: 100%;
            justify-content: center;
          }

          .products-management__card-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .products-management__image {
            width: 100% !important;
            height: 180px !important;
          }

          .products-management__actions {
            margin-top: 12px;
            justify-content: flex-start;
          }

          .products-management__price-row {
            grid-template-columns: 1fr;
          }

          .products-management__gallery-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 400px) {
          .products-management__image {
            height: 160px !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="products-management__header flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            {t('productsManagement.title')}
          </h2>
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>
            {t('productsManagement.subtitle')}
          </p>
        </div>
        <button
          onClick={handleAddProduct}
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
          {t('productsManagement.addProduct')}
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-xl overflow-hidden transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={() => handleOpenProduct(product.id)}
          >
            <div className="products-management__card-content flex gap-6 p-6">
              {/* Main Image */}
              <div
                className="products-management__image flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: '200px',
                  height: '150px',
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '2px dashed rgba(255,255,255,0.1)'
                    }}
                  >
                    <ImageIcon size={32} style={{ color: '#6B7280' }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                        {product.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          color: '#7C3AED',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        {/* Translate Sector Display if possible, or fallback to key */}
                        {t(`constants.sectors.${product.sector.replace(/\s+/g, '')}`, { defaultValue: product.sector })}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#0684F5', marginBottom: '8px' }}>
                      {/* Translate Subsector Display */}
                      {t(`constants.subsectors.${product.subsector}`, { defaultValue: product.subsector })}
                    </p>
                    <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '12px' }}>
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="products-management__actions flex items-center gap-2">
                    <button
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        color: '#0684F5',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)'}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>
                    ${product.price} {product.currency}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        color: '#0684F5',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Gallery Preview */}
                {product.gallery.length > 0 && (
                  <div className="flex gap-2">
                    {product.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded overflow-hidden"
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '2px solid rgba(6, 132, 245, 0.3)'
                        }}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(11, 38, 65, 0.95)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            className="rounded-2xl w-full max-w-3xl overflow-hidden"
            style={{
              backgroundColor: '#0B2641',
              border: '1px solid rgba(255,255,255,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>
                {editingProduct ? t('productsManagement.editProduct') : t('productsManagement.addNewProduct')}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#94A3B8',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                  {t('productsManagement.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('productsManagement.form.namePlaceholder')}
                  className="w-full rounded-lg p-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Sector */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                  {t('productsManagement.form.sector')}
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => {
                    const newSector = e.target.value;
                    const firstSubsector = SECTORS_KEYS[newSector][0];
                    setFormData({ ...formData, sector: newSector, subsector: firstSubsector });
                  }}
                  className="w-full rounded-lg p-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  {Object.keys(SECTORS_KEYS).map((sector) => (
                    <option key={sector} value={sector}>{t(`constants.sectors.${sector.replace(/\s+/g, '')}`, { defaultValue: sector })}</option>
                  ))}
                </select>
              </div>

              {/* Subsector */}
              {formData.sector && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                    {t('productsManagement.form.subsector')}
                  </label>
                  <select
                    value={formData.subsector}
                    onChange={(e) => setFormData({ ...formData, subsector: e.target.value })}
                    className="w-full rounded-lg p-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {SECTORS_KEYS[formData.sector].map((subsector) => (
                      <option key={subsector} value={subsector}>{t(`constants.subsectors.${subsector}`, { defaultValue: subsector })}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                  {t('productsManagement.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('productsManagement.form.descriptionPlaceholder')}
                  rows={4}
                  className="w-full rounded-lg p-3"
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

              {/* Price & Currency */}
              <div className="products-management__price-row grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                    {t('productsManagement.form.price')}
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder={t('productsManagement.form.pricePlaceholder')}
                    className="w-full rounded-lg p-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                    {t('productsManagement.form.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-lg p-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                  {t('productsManagement.form.tags')}
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={t('productsManagement.form.tagsPlaceholder')}
                  className="w-full rounded-lg p-3 mb-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(6, 132, 245, 0.1)',
                        border: '1px solid #0684F5',
                        color: '#0684F5',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0684F5',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Main Image Upload */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px', display: 'block' }}>
                  {t('productsManagement.form.mainImage')}
                </label>
                <div
                  className="rounded-lg p-6 border-2 border-dashed cursor-pointer transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(6, 132, 245, 0.3)'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                    style={{ display: 'none' }}
                    id="mainImageInput"
                  />
                  <label htmlFor="mainImageInput" className="cursor-pointer flex flex-col items-center">
                    {formData.mainImage ? (
                      <div className="w-full text-center">
                        <img
                          src={formData.mainImage}
                          alt="Preview"
                          style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                        />
                        <p style={{ fontSize: '12px', color: '#10B981', marginTop: '8px' }}>
                          {t('productsManagement.form.imageUploaded')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} style={{ color: '#0684F5', marginBottom: '8px' }} />
                        <p style={{ fontSize: '14px', color: '#E2E8F0', marginBottom: '4px' }}>
                          {t('productsManagement.form.uploadMain')}
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Gallery Images Upload */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0', display: 'block' }}>
                    {t('productsManagement.form.gallery')}
                  </label>
                </div>
                <div className="products-management__gallery-grid grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border-2 border-dashed cursor-pointer transition-all relative"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(6, 132, 245, 0.3)',
                        aspectRatio: '16/9',
                        overflow: 'hidden'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, false, idx);
                        }}
                        style={{ display: 'none' }}
                        id={`galleryInput${idx}`}
                      />
                      <label htmlFor={`galleryInput${idx}`} className="cursor-pointer h-full flex flex-col items-center justify-center p-3">
                        {formData.gallery[idx] ? (
                          <>
                            <img
                              src={formData.gallery[idx]}
                              alt={`Gallery ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Upload size={20} style={{ color: '#0684F5', marginBottom: '4px' }} />
                            <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                              {t('productsManagement.form.upload')}
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-end gap-3 p-6"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button
                onClick={() => setShowProductModal(false)}
                className="px-5 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                {t('productsManagement.cancel')}
              </button>
              <button
                onClick={handleSaveProduct}
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
                <Save size={18} />
                {editingProduct ? t('productsManagement.updateProduct') : t('productsManagement.saveProduct')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
