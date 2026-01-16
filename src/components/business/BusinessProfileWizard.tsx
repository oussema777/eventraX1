import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  Upload, 
  FileText, 
  Plus, 
  Edit2, 
  Trash2,
  Check,
  ChevronDown,
  Globe,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Package,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { uploadBusinessLogo, uploadFile } from '../../utils/storage';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessOfferings } from '../../hooks/useBusinessOfferings';
import { useI18n } from '../../i18n/I18nContext';

type WizardStep = 1 | 2 | 3 | 4;

export default function BusinessProfileWizard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  // Custom Hooks
  const { 
    businessProfile, 
    isLoading: isProfileLoading, 
    isSaving: isProfileSaving, 
    updateBusinessProfile, 
    uploadDocument: hookUploadDocument,
    deleteDocument: hookDeleteDocument
  } = useBusinessProfile();

  const businessId = businessProfile?.id || null;

  const { 
    offerings, 
    isLoading: isOfferingsLoading, 
    isSaving: isOfferingsSaving, 
    fetchOfferings, 
    addOffering: hookAddOffering, 
    deleteOffering: hookDeleteOffering 
  } = useBusinessOfferings(businessId);

  const isLoading = isProfileLoading || isOfferingsLoading;
  const isSaving = isProfileSaving || isOfferingsSaving;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Essentials
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Step 2: Sectors
  const [sectorTags, setSectorTags] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState('');
  
  // Step 4: Identity
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Sync profile data to local state
  useEffect(() => {
    if (businessProfile) {
      setCompanyName(businessProfile.company_name || '');
      setCompanySize(businessProfile.company_size || '');
      setDescription(businessProfile.description || '');
      setSectorTags(businessProfile.sectors || []);
      setBusinessEmail(businessProfile.email || '');
      setBusinessPhone(businessProfile.phone || '');
      setWebsite(businessProfile.website || '');
      setAddress(businessProfile.address || '');
      setLogoUrl(businessProfile.logo_url || '');
      setCoverUrl(businessProfile.cover_url || '');
      setUploadedFiles(businessProfile.business_documents || []);
    }
  }, [businessProfile]);

  // Fetch offerings when businessId is available
  useEffect(() => {
    if (businessId) {
      fetchOfferings();
    }
  }, [businessId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ensureProfile = async () => {
        if (businessProfile?.id) return businessProfile;
        if (!companyName.trim() || !companySize.trim() || !description.trim()) {
          toast.error('Complete company essentials before uploading files.');
          return null;
        }
        return updateBusinessProfile({
          company_name: companyName.trim(),
          company_size: companySize.trim(),
          description: description.trim(),
          sectors: sectorTags
        });
      };

      const activeProfile = businessId ? businessProfile : await ensureProfile();
      if (!activeProfile?.id) return;

      let url = '';
      if (type === 'logo') {
        url = await uploadBusinessLogo(activeProfile.id, file) || '';
        if (url) {
          setLogoUrl(url);
          await updateBusinessProfile({ logo_url: url });
        }
      } else if (type === 'cover') {
        const path = `${activeProfile.id}/cover.${file.name.split('.').pop()}`;
        url = await uploadFile('business-assets', path, file) || '';
        if (url) {
          setCoverUrl(url);
          await updateBusinessProfile({ cover_url: url });
        }
      } else if (type === 'document') {
        // Use the hook for document upload
        await hookUploadDocument(file, 'legal', activeProfile.id);
        toast.success('File uploaded');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveStepData = async () => {
    const payload = {
      company_name: companyName.trim(),
      company_size: companySize.trim(),
      description: description.trim(),
      sectors: sectorTags,
      email: businessEmail,
      phone: businessPhone,
      website: website,
      address: address,
      logo_url: logoUrl,
      cover_url: coverUrl
    };

    const result = await updateBusinessProfile(payload);
    return !!result;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!companyName.trim()) {
        toast.error('Company name is required.');
        return;
      }
      if (!companySize.trim()) {
        toast.error('Company size is required.');
        return;
      }
      if (!description.trim()) {
        toast.error('Company description is required.');
        return;
      }
    }
    if (currentStep === 2 && sectorTags.length === 0) {
      toast.error('Add at least one sector to continue.');
      return;
    }

    const success = await saveStepData();
    if (!success) return;

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step: Publish the profile
      await updateBusinessProfile({ 
        is_public: true,
        verification_status: 'pending'
      });
      toast.success('Business profile published and sent for validation!');
      navigate('/business-management');
    }
  };

  // New offering form state
  const [newItemType, setNewItemType] = useState<'product' | 'service'>('product');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState('USD');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnlimited, setNewItemUnlimited] = useState(false);
  const [newItemTags, setNewItemTags] = useState<string[]>([]);
  const [newItemTagInput, setNewItemTagInput] = useState('');
  const [newItemImages, setNewItemImages] = useState<string[]>([]);

  const offeringImageInputRef = useRef<HTMLInputElement>(null);

  const handleOfferingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    if (newItemImages.length >= 4) {
      toast.error('You can upload up to 4 images.');
      return;
    }

    try {
      const tempId = Math.random().toString(36).substring(7);
      const path = `${businessId}/offerings/${tempId}/${file.name}`;
      
      const url = await uploadFile('business-assets', path, file) || '';
      
      if (url) {
        setNewItemImages([...newItemImages, url]);
        toast.success('Image uploaded');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const steps = [
    { number: 1, label: t('businessProfileWizard.steps.essentials'), isActive: currentStep === 1, isCompleted: currentStep > 1 },
    { number: 2, label: t('businessProfileWizard.steps.sectors'), isActive: currentStep === 2, isCompleted: currentStep > 2 },
    { number: 3, label: t('businessProfileWizard.steps.offerings'), isActive: currentStep === 3, isCompleted: currentStep > 3 },
    { number: 4, label: t('businessProfileWizard.steps.identity'), isActive: currentStep === 4, isCompleted: false }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectorKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && sectorInput.trim()) {
      e.preventDefault();
      if (!sectorTags.includes(sectorInput.trim())) {
        setSectorTags([...sectorTags, sectorInput.trim()]);
      }
      setSectorInput('');
    }
  };

  const removeSectorTag = (tagToRemove: string) => {
    setSectorTags(sectorTags.filter(tag => tag !== tagToRemove));
  };

  const handleOfferingTagKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newItemTagInput.trim()) {
      e.preventDefault();
      if (!newItemTags.includes(newItemTagInput.trim())) {
        setNewItemTags([...newItemTags, newItemTagInput.trim()]);
      }
      setNewItemTagInput('');
    }
  };

  const removeOfferingTag = (tagToRemove: string) => {
    setNewItemTags(newItemTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddOffering = async () => {
    if (newItemName.trim() && businessId) {
      const payload = {
        type: newItemType,
        name: newItemName,
        description: newItemDescription,
        price: newItemPrice ? parseFloat(newItemPrice) : undefined,
        currency: newItemCurrency,
        quantity_total: newItemUnlimited ? null : (newItemQuantity ? parseInt(newItemQuantity) : null),
        is_unlimited: newItemUnlimited,
        tags: newItemTags,
        images: newItemImages
      };

      const result = await hookAddOffering(payload);
      
      if (result) {
        // Reset form
        setNewItemName('');
        setNewItemDescription('');
        setNewItemPrice('');
        setNewItemCurrency('USD');
        setNewItemQuantity('');
        setNewItemUnlimited(false);
        setNewItemTags([]);
        setNewItemTagInput('');
        setNewItemImages([]);
        setShowAddItemModal(false);
      }
    }
  };

  const handleDeleteOffering = async (id: string) => {
    await hookDeleteOffering(id);
  };

  const handleSaveAndExit = async () => {
    const success = await saveStepData();
    if (!success) return;
    toast.success('Business profile saved');
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B2641]">
        <Loader2 className="animate-spin text-[#0684F5]" size={40} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <div 
        className="sticky top-0 z-40 flex items-center justify-between px-10"
        style={{ 
          height: '80px',
          backgroundColor: '#0B2641',
          borderBottom: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
          {t('businessProfileWizard.title')} {isSaving && <span className="ml-4 text-xs text-[#0684F5] animate-pulse">{t('businessProfileWizard.saving')}</span>}
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-3">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: step.isActive ? '#0684F5' : step.isCompleted ? '#10B981' : 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {step.isCompleted ? <Check size={16} /> : step.number}
                </div>
                <span 
                  style={{ 
                    fontSize: '14px', 
                    color: step.isActive ? '#FFFFFF' : '#94A3B8',
                    fontWeight: step.isActive ? 600 : 400
                  }}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  style={{ 
                    width: '40px', 
                    height: '2px', 
                    backgroundColor: step.isCompleted ? '#10B981' : 'rgba(255,255,255,0.2)' 
                  }} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Save & Exit */}
        <button
          onClick={handleSaveAndExit}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: '#94A3B8',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)'
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
          {t('businessProfileWizard.actions.saveExit')}
        </button>
      </div>

      {/* Content Area */}
      <div 
        className="mx-auto"
        style={{ 
          maxWidth: '800px', 
          paddingTop: '40px', 
          paddingBottom: '120px',
          paddingLeft: '20px',
          paddingRight: '20px'
        }}
      >
        {/* STEP 1: ESSENTIALS */}
        {currentStep === 1 && (
          <div 
            className="rounded-2xl p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
              {t('businessProfileWizard.essentials.title')}
            </h2>
            
            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label 
                  className="block mb-2"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                >
                  {t('businessProfileWizard.essentials.companyName')}
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
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
              </div>

              {/* Company Size */}
              <div>
                <label 
                  className="block mb-2"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                >
                  {t('businessProfileWizard.essentials.companySize')}
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
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

              {/* Description */}
              <div>
                <label 
                  className="block mb-2"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                >
                  {t('businessProfileWizard.essentials.companyDescription')}
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
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                  {t('businessProfileWizard.essentials.charCount', { count: description.length })}
                </p>
              </div>

              {/* Legal Documents Upload */}
              <div>
                <label 
                  className="block mb-2"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                >
                  {t('businessProfileWizard.essentials.legalDocs')}
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

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} style={{ color: '#0684F5' }} />
                          <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{file.name}</span>
                        </div>
                        <button
                          onClick={async () => {
                             await hookDeleteDocument(file.id);
                             setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                          }}
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
        )}

        {/* STEP 2: SECTORS (Free-form Tags) */}
        {currentStep === 2 && (
          <div 
            className="rounded-2xl p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="mb-6">
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                {t('businessProfileWizard.sectors.title')}
              </h2>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {t('businessProfileWizard.sectors.subtitle')}
              </p>
            </div>

            {/* Tag Input */}
            <div className="space-y-4">
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  backgroundColor: '#0B2641',
                  borderColor: 'rgba(255,255,255,0.2)',
                  minHeight: '120px'
                }}
              >
                {/* Existing Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {sectorTags.map((tag, index) => (
                    <div
                      key={index}
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
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder={t('businessProfileWizard.sectors.placeholder')}
                  value={sectorInput}
                  onChange={(e) => setSectorInput(e.target.value)}
                  onKeyPress={handleSectorKeyPress}
                  className="w-full bg-transparent border-none outline-none"
                  style={{
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                {t('businessProfileWizard.sectors.hint')}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: OFFERINGS */}
        {currentStep === 3 && (
          <div 
            className="rounded-2xl p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('businessProfileWizard.offerings.title')}
              </h2>
              <button
                onClick={async () => {
                  if (!businessProfile?.id) {
                    if (!companyName.trim() || !companySize.trim() || !description.trim()) {
                      toast.error(t('businessProfileWizard.essentials.errors.completeEssentials'));
                      return;
                    }
                    const created = await updateBusinessProfile({
                      company_name: companyName.trim(),
                      company_size: companySize.trim(),
                      description: description.trim(),
                      sectors: sectorTags
                    });
                    if (!created?.id) return;
                  }
                  setShowAddItemModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
              >
                <Plus size={18} />
                {t('businessProfileWizard.actions.addOffering')}
              </button>
            </div>

            {/* Offerings List */}
            <div className="space-y-3">
              {offerings.map((offering) => (
                <div
                  key={offering.id}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {offering.images?.[0] ? (
                      <img
                        src={offering.images[0]}
                        alt={offering.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={32} style={{ color: '#94A3B8' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                        {offering.name}
                      </h4>
                      <span
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: offering.type === 'product' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(74, 124, 109, 0.2)',
                          color: offering.type === 'product' ? '#C084FC' : '#4A7C6D',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {offering.type === 'product' ? t('businessProfileWizard.offerings.modal.product') : t('businessProfileWizard.offerings.modal.service')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>
                        {offering.price ? `${offering.currency || 'USD'} ${offering.price}` : 'Free'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                        Qty: {offering.is_unlimited ? t('businessProfileWizard.offerings.modal.unlimited') : (offering.quantity_total ?? 'N/A')}
                      </span>
                    </div>

                    {/* Tags */}
                    {Array.isArray(offering.tags) && offering.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {offering.tags.map((tag, idx) => (
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#94A3B8', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteOffering(offering.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#94A3B8', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#EF4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {offerings.length === 0 && (
              <div 
                className="text-center py-12 rounded-lg border-2 border-dashed"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <Package size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {t('businessProfileWizard.offerings.emptyTitle')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: IDENTITY */}
        {currentStep === 4 && (
          <div 
            className="rounded-2xl p-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF', marginBottom: '24px' }}>
              {t('businessProfileWizard.identity.title')}
            </h2>

            <div className="space-y-8">
              {/* Branding Section */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('businessProfileWizard.identity.branding')}
                </h3>
                
                <div className="grid grid-cols-3 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.logo')}
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

                  {/* Cover Image Upload */}
                  <div className="col-span-2">
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.cover')}
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
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
                  {t('businessProfileWizard.identity.contact')}
                </h3>

                <div className="space-y-4">
                  {/* Business Email */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.email')}
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

                  {/* Phone */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.phone')}
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

                  {/* Website */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.website')}
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

                  {/* Address */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.identity.address')}
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
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ 
          height: '100px',
          backgroundColor: '#0B2641',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingBottom: '40px'
        }}
      >
        <div 
          className="flex items-center justify-between h-full mx-auto"
          style={{ maxWidth: '800px', paddingLeft: '20px', paddingRight: '20px' }}
        >
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: currentStep === 1 ? '#6B7280' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
            onMouseEnter={(e) => {
              if (currentStep !== 1) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (currentStep !== 1) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {t('businessProfileWizard.actions.back')}
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-lg transition-colors"
            style={{
              width: '160px',
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
          >
            {currentStep === 4 ? t('businessProfileWizard.actions.createProfile') : t('businessProfileWizard.actions.next')}
          </button>
        </div>
      </div>

      {/* Add Offering Modal */}
      {showAddItemModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowAddItemModal(false)}
        >
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              width: '700px',
              maxHeight: '85vh',
              backgroundColor: '#1E3A5F',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0px 10px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('businessProfileWizard.offerings.modal.title')}
              </h3>
              <button 
                onClick={() => setShowAddItemModal(false)}
                style={{ color: '#94A3B8' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div 
              className="px-6 py-6 space-y-6 overflow-y-auto"
              style={{ maxHeight: 'calc(85vh - 140px)' }}
            >
              {/* Type Toggle */}
              <div>
                <label 
                  className="block mb-2"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                >
                  {t('businessProfileWizard.offerings.modal.type')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewItemType('product')}
                    className="flex-1 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: newItemType === 'product' ? '#0684F5' : 'rgba(255,255,255,0.05)',
                      color: newItemType === 'product' ? '#FFFFFF' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: newItemType === 'product' ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {t('businessProfileWizard.offerings.modal.product')}
                  </button>
                  <button
                    onClick={() => setNewItemType('service')}
                    className="flex-1 py-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: newItemType === 'service' ? '#0684F5' : 'rgba(255,255,255,0.05)',
                      color: newItemType === 'service' ? '#FFFFFF' : '#94A3B8',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: newItemType === 'service' ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {t('businessProfileWizard.offerings.modal.service')}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('businessProfileWizard.offerings.modal.basicInfo')}
                </h4>
                
                {/* Name */}
                <div className="mb-4">
                  <label 
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                  >
                    {t('businessProfileWizard.offerings.modal.name')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('businessProfileWizard.offerings.modal.namePlaceholder')}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: '#0B2641',
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                  >
                    {t('businessProfileWizard.offerings.modal.description')}
                  </label>
                  <textarea
                    placeholder={t('businessProfileWizard.offerings.modal.descPlaceholder')}
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                    style={{
                      backgroundColor: '#0B2641',
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('businessProfileWizard.offerings.modal.pricing')}
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Currency */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.offerings.modal.currency')}
                    </label>
                    <div className="relative">
                      <select
                        value={newItemCurrency}
                        onChange={(e) => setNewItemCurrency(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border outline-none appearance-none"
                        style={{
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      >
                        {currencies.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                      <ChevronDown 
                        size={18} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: '#94A3B8' }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label 
                      className="block mb-2"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                    >
                      {t('businessProfileWizard.offerings.modal.price')}
                    </label>
                    <div className="relative">
                      <DollarSign 
                        size={18} 
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#94A3B8' }}
                      />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none"
                        style={{
                          backgroundColor: '#0B2641',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}
                  >
                    {t('businessProfileWizard.offerings.modal.quantity')}
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      disabled={newItemUnlimited}
                      className="flex-1 px-4 py-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: newItemUnlimited ? 'rgba(255,255,255,0.05)' : '#0B2641',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: newItemUnlimited ? '#6B7280' : '#FFFFFF',
                        fontSize: '14px'
                      }}
                    />
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newItemUnlimited}
                        onChange={(e) => setNewItemUnlimited(e.target.checked)}
                        className="w-5 h-5 rounded"
                        style={{ accentColor: '#0684F5' }}
                      />
                      <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{t('businessProfileWizard.offerings.modal.unlimited')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags/Specifications */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('businessProfileWizard.offerings.modal.tags')}
                </h4>
                
                <div 
                  className="rounded-lg p-3 border"
                  style={{ 
                    backgroundColor: '#0B2641',
                    borderColor: 'rgba(255,255,255,0.2)',
                    minHeight: '80px'
                  }}
                >
                  {/* Existing Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newItemTags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(6, 132, 245, 0.2)',
                          color: '#0684F5',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeOfferingTag(tag)}
                          className="transition-colors"
                          style={{ color: '#0684F5' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder={t('businessProfileWizard.offerings.modal.tagsPlaceholder')}
                    value={newItemTagInput}
                    onChange={(e) => setNewItemTagInput(e.target.value)}
                    onKeyPress={handleOfferingTagKeyPress}
                    className="w-full bg-transparent border-none outline-none"
                    style={{
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                  {t('businessProfileWizard.offerings.modal.images')}
                </h4>
                
                <input 
                  type="file" 
                  ref={offeringImageInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleOfferingImageUpload}
                  accept="image/*"
                />
                <div
                  onClick={() => offeringImageInputRef.current?.click()}
                  className="rounded-lg p-8 text-center border-2 border-dashed cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = '#0684F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  <ImageIcon size={32} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '4px' }}>
                    {t('businessProfileWizard.offerings.modal.imagesHint')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {t('businessProfileWizard.offerings.modal.coverHint')}
                  </p>
                </div>

                {/* Placeholder for uploaded images */}
                {newItemImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {newItemImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          aspectRatio: '1',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                      >
                        {idx === 0 && (
                          <span
                            className="absolute top-1 left-1 px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: '#0684F5',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 600
                            }}
                          >
                            {t('businessProfileWizard.offerings.modal.coverBadge')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
            >
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-5 py-2.5 rounded-lg transition-colors"
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
                {t('businessProfileWizard.actions.cancel')}
              </button>
              <button
                onClick={handleAddOffering}
                className="px-5 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#0684F5',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0570D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0684F5'}
              >
                {t('businessProfileWizard.offerings.modal.addBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
