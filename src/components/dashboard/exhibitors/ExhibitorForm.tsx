import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { toast } from 'sonner';
import {
  Plus, ChevronDown, X, Building2, Upload, Globe, Save, Check, Award,
  RefreshCw, Download, Link2, Mail, Copy, MessageCircle, Linkedin, Twitter, QrCode
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Exhibitor, Sponsor, SponsorTier, TabMode } from './types';

// Add Exhibitor/Sponsor Modal Component
export function AddExhibitorSponsorModal({ type, eventId, onClose, onAdded, initialData = null, startAssignBooth = false }: {
  type: 'exhibitor' | 'sponsor';
  eventId: string;
  onClose: () => void;
  onAdded: () => void;
  initialData?: Exhibitor | Sponsor | null;
  startAssignBooth?: boolean;
}) {
  const { t, tList } = useI18n();
  const [assignBooth, setAssignBooth] = useState(startAssignBooth);
  const [selectedTier, setSelectedTier] = useState<SponsorTier>('gold');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [boothNumber, setBoothNumber] = useState('');
  const [boothHall, setBoothHall] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  const communitySectors = tList<string>('nav.communities.items', []);
  const industryOptions = communitySectors.map(s => ({ value: s, label: s }));

  useEffect(() => {
    if (!initialData) {
      setCompanyName('');
      setWebsite('');
      setDescription('');
      setCategory('');
      setContactName('');
      setContactRole('');
      setContactEmail('');
      setContactPhone('');
      setBoothNumber('');
      setBoothHall('');
      setLogoUrl('');
      setSelectedTier('gold');
      setAssignBooth(startAssignBooth);
      return;
    }

    setCompanyName(initialData.companyName || initialData.name || '');
    setWebsite(initialData.website || '');
    setDescription(initialData.description || '');
    setContactName(initialData.contact?.name || '');
    setContactRole(initialData.contact?.role || '');
    setContactEmail(initialData.contact?.email || '');
    setContactPhone(initialData.contact?.phone || '');
    setLogoUrl(initialData.logo || '');

    if (type === 'exhibitor') {
      const exhibitor = initialData as Exhibitor;
      setCategory(exhibitor.category || '');
      setBoothNumber(exhibitor.booth?.number || '');
      setBoothHall(exhibitor.booth?.hall || '');
      setAssignBooth(startAssignBooth || !!exhibitor.booth);
    } else {
      const sponsor = initialData as Sponsor;
      setSelectedTier(sponsor.tier || 'gold');
    }
  }, [initialData, startAssignBooth, type]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;

    setUploadingLogo(true);
    try {
      // Use a temporary path if we don't have an exhibitor ID yet, 
      // or just upload it to a general event assets folder
      const extension = file.name.split('.').pop();
      const timestamp = Date.now();
      const filename = `logo_${timestamp}.${extension}`;
      const path = `events/${eventId}/exhibitors/temp_${filename}`;

      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(data.path);

      setLogoUrl(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const submit = async (draft: boolean) => {
    if (!eventId) return;
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!initialData;
      if (type === 'exhibitor') {
        const payload: any = {
          company_name: companyName.trim(),
          website_url: website.trim(),
          description: description.trim(),
          industry: category || '',
          category: category || '',
          logo_url: logoUrl,
          contact_name: contactName.trim(),
          contact_role: contactRole.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim()
        };
        if (assignBooth) {
          payload.booth_number = boothNumber.trim();
          payload.booth_hall = boothHall || '';
          payload.booth_location = boothHall || '';
        } else {
          payload.booth_number = null;
          payload.booth_hall = null;
          payload.booth_location = null;
        }
        if (isEdit && initialData) {
          if (draft) payload.profile_status = 'pending';
          const { error } = await supabase
            .from('event_exhibitors')
            .update(payload)
            .eq('id', initialData.id)
            .eq('event_id', eventId);
          if (error) throw error;
          toast.success('Exhibitor updated successfully');
        } else {
          payload.event_id = eventId;
          payload.profile_status = draft ? 'pending' : 'incomplete';
          payload.completion_percentage = 0;
          const { error } = await supabase.from('event_exhibitors').insert([payload]);
          if (error) throw error;
          toast.success('Exhibitor added successfully');
        }
      } else {
        const payload: any = {
          name: companyName.trim(),
          website_url: website.trim(),
          description: description.trim(),
          tier: selectedTier,
          benefits: [],
          logo_url: logoUrl,
          status: 'confirmed',
          contribution_amount: 0,
          notes: ''
        };
        if (isEdit && initialData) {
          const { error } = await supabase
            .from('event_sponsors')
            .update(payload)
            .eq('id', initialData.id)
            .eq('event_id', eventId);
          if (error) throw error;
          toast.success('Sponsor updated successfully');
        } else {
          payload.event_id = eventId;
          const { error } = await supabase.from('event_sponsors').insert([payload]);
          if (error) throw error;
          toast.success('Sponsor added successfully');
        }
      }
      await onAdded();
      onClose();
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '700px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.3s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F', marginBottom: '4px' }}>
              {initialData ? t('manageEvent.exhibitors.modals.add.edit') : t('manageEvent.exhibitors.modals.add.add')} {type === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor')}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
              {t('manageEvent.exhibitors.modals.add.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Company Information */}
          <div style={{ marginBottom: '32px' }}>
            {/* Logo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  backgroundColor: '#F4F5F6',
                  border: '2px dashed #E9EAEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={32} style={{ color: '#9A9FA5' }} />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="exhibitor-logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  disabled={uploadingLogo}
                  onClick={() => document.getElementById('exhibitor-logo-upload')?.click()}
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1D1F',
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    opacity: uploadingLogo ? 0.7 : 1
                  }}
                >
                  {uploadingLogo ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploadingLogo ? 'Uploading...' : t('manageEvent.exhibitors.modals.add.uploadLogo')}
                </button>
                <p style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                  {t('manageEvent.exhibitors.modals.add.logoHint')}
                </p>
              </div>
            </div>

            {/* Company Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.companyName')}
              </label>
              <input
                type="text"
                placeholder={t('manageEvent.exhibitors.modals.add.placeholders.companyName')}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #635BFF';
                  e.currentTarget.style.boxShadow = '0px 0px 0px 4px rgba(99, 91, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #E9EAEB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Company Website */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.website')}
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9A9FA5' }} />
                <input
                  type="url"
                  placeholder={t('manageEvent.exhibitors.modals.add.placeholders.website')}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px 0 44px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#1A1D1F',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Industry/Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.category')}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 40px 0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: '#1A1D1F',
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none'
                  }}
                >
                  <option value="">{t('manageEvent.exhibitors.modals.add.placeholders.category')}</option>
                  {industryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                {t('manageEvent.exhibitors.modals.add.fields.description')}
              </label>
              <textarea
                placeholder={t('manageEvent.exhibitors.modals.add.placeholders.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px 16px',
                  backgroundColor: '#F4F5F6',
                  border: '1px solid #E9EAEB',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  color: '#1A1D1F',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: '#9A9FA5' }}>
                  0 / 300
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '20px' }}>
              {t('manageEvent.exhibitors.modals.add.sections.contact')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.contactName')}
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.contactRole')}
                </label>
                <input
                  type="text"
                  placeholder="Sales Director"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.email')}
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.phone')}
                </label>
                <input
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: '#F4F5F6',
                    border: '1px solid #E9EAEB',
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Exhibitor - Booth Assignment OR Sponsor - Tier Selection */}
          {type === 'exhibitor' ? (
            <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '16px' }}>
                {t('manageEvent.exhibitors.modals.add.sections.booth')}
              </h3>

              {/* Assign Booth Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={assignBooth}
                  onChange={(e) => setAssignBooth(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F' }}>
                  {t('manageEvent.exhibitors.modals.add.fields.assignBooth')}
                </span>
              </label>

              {assignBooth && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                      {t('manageEvent.exhibitors.modals.add.fields.hall')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={boothHall}
                        onChange={(e) => setBoothHall(e.target.value)}
                        style={{
                          width: '100%',
                          height: '44px',
                          padding: '0 40px 0 16px',
                          backgroundColor: '#F4F5F6',
                          border: '1px solid #E9EAEB',
                          borderRadius: '8px',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          cursor: 'pointer',
                          appearance: 'none',
                          outline: 'none'
                        }}
                      >
                        <option>Hall A</option>
                        <option>Hall B</option>
                        <option>Hall C</option>
                        <option>Outdoor</option>
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6F767E', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', display: 'block', marginBottom: '8px' }}>
                      {t('manageEvent.exhibitors.modals.add.fields.boothNumber')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., A-42"
                value={boothNumber}
                onChange={(e) => setBoothNumber(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 16px',
                        backgroundColor: '#F4F5F6',
                        border: '1px solid #E9EAEB',
                        borderRadius: '8px',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '32px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, color: '#1A1D1F', marginBottom: '16px' }}>
                {t('manageEvent.exhibitors.modals.add.sections.sponsorship')}
              </h3>

              {/* Tier Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { id: 'platinum', label: t('manageEvent.exhibitors.stats.platinum'), price: '$10,000', color: '#1A1D1F', brief: 'Top-tier benefits' },
                  { id: 'gold', label: t('manageEvent.exhibitors.stats.gold'), price: '$7,500', color: '#F59E0B', brief: 'Premium package' },
                  { id: 'silver', label: t('manageEvent.exhibitors.stats.silver'), price: '$5,000', color: '#6F767E', brief: 'Standard benefits' },
                  { id: 'bronze', label: t('manageEvent.exhibitors.filters.tier.bronze'), price: '$2,500', color: '#92400E', brief: 'Basic package' }
                ].map(tier => (
                  <label
                    key={tier.id}
                    style={{
                      padding: '16px',
                      border: selectedTier === tier.id ? '2px solid #635BFF' : '2px solid #E9EAEB',
                      backgroundColor: selectedTier === tier.id ? '#F8F7FF' : '#FAFBFC',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={tier.id}
                      checked={selectedTier === tier.id}
                      onChange={(e) => setSelectedTier(e.target.value as SponsorTier)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Award size={24} style={{ color: tier.color }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 700, color: '#1A1D1F' }}>
                        {tier.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#635BFF', marginBottom: '4px' }}>
                      {tier.price}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#6F767E' }}>
                      {tier.brief}
                    </div>
                  </label>
                ))}
              </div>

              {/* Benefits Preview */}
              <div style={{ backgroundColor: '#F4F5F6', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#1A1D1F', marginBottom: '12px' }}>
                  {t('manageEvent.exhibitors.modals.add.sections.benefits')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Logo on all event materials',
                    'Keynote speaking opportunity',
                    'Premium booth location',
                    'VIP networking access'
                  ].map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <Check size={16} style={{ color: '#1F7A3E', marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 16px 16px'
          }}
        >
          {/* Left: Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                defaultChecked
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
              />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.modals.add.options.welcomeEmail')}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
              />
              <span style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E' }}>
                {t('manageEvent.exhibitors.modals.add.options.publicDirectory')}
              </span>
            </label>
          </div>

          {/* Right: Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer'
              }}
            >
              {t('manageEvent.exhibitors.map.assignPanel.cancel')}
            </button>
            <button disabled={saving} onClick={() => submit(true)}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              {t('manageEvent.exhibitors.modals.add.actions.draft')}
            </button>
            <button disabled={saving} onClick={() => submit(false)}
              style={{
                height: '44px',
                padding: '0 24px',
                backgroundColor: '#635BFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              {initialData ? t('manageEvent.exhibitors.modals.add.actions.save') : t('manageEvent.exhibitors.modals.add.actions.add', { type: type === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor') })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Excel Modal Component
export function ImportExcelModal({ type, eventId, onClose, onImported }: {
  type: 'exhibitors' | 'sponsors';
  eventId: string;
  onClose: () => void;
  onImported: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = type === 'exhibitors' 
      ? ['companyName', 'category', 'contactName', 'contactRole', 'contactEmail', 'contactPhone', 'boothNumber', 'boothHall', 'description']
      : ['companyName', 'tier', 'category', 'contactName', 'contactRole', 'contactEmail', 'contactPhone', 'description'];
    
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Read the file
      const text = await selectedFile.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      if (rows.length < 2) {
        toast.error('File is empty or has no data rows');
        setIsUploading(false);
        return;
      }
      
      // Parse CSV
      const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const dataRows = rows.slice(1);
      
      const parsedData = dataRows.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      // Insert data into Supabase
      if (type === 'exhibitors') {
        const exhibitorsToInsert = parsedData.map(data => ({
          event_id: eventId,
          company_name: data.companyName || '',
          category: data.category || '',
          contact_name: data.contactName || '',
          contact_role: data.contactRole || '',
          contact_email: data.contactEmail || '',
          contact_phone: data.contactPhone || '',
          booth_number: data.boothNumber || '',
          booth_hall: data.boothHall || '',
          description: data.description || '',
          profile_status: 'incomplete',
          completion_percentage: 0
        }));
        
        const { error } = await supabase
          .from('event_exhibitors')
          .insert(exhibitorsToInsert);
        
        if (error) {
          console.error('Error importing exhibitors:', error);
          toast.error('Failed to import exhibitors: ' + error.message);
          setIsUploading(false);
          return;
        }
      } else {
        const sponsorsToInsert = parsedData.map(data => ({
          event_id: eventId,
          company_name: data.companyName || '',
          tier: data.tier || 'gold',
          category: data.category || '',
          contact_name: data.contactName || '',
          contact_role: data.contactRole || '',
          contact_email: data.contactEmail || '',
          contact_phone: data.contactPhone || '',
          description: data.description || '',
          profile_status: 'incomplete',
          completion_percentage: 0
        }));
        
        const { error } = await supabase
          .from('event_sponsors')
          .insert(sponsorsToInsert);
        
        if (error) {
          console.error('Error importing sponsors:', error);
          toast.error('Failed to import sponsors: ' + error.message);
          setIsUploading(false);
          return;
        }
      }
      
      toast.success(`${parsedData.length} ${type === 'exhibitors' ? 'exhibitors' : 'sponsors'} imported successfully!`);
      setIsUploading(false);
      onImported();
      onClose();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please check the format.');
      setIsUploading(false);
    }
  };

  return (
    <div 
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div 
        style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B2641' }}>Import {type === 'exhibitors' ? 'Exhibitors' : 'Sponsors'}</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} style={{ color: '#6B7280' }} />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          Download the template, fill it with your data, and upload it back.
        </p>

        <button
          onClick={downloadTemplate}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: '#10B981',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Download size={18} />
          Download Template
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? '#10B981' : '#E5E7EB'}`,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: isDragging ? '#F0FDF4' : '#F9FAFB',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Upload size={48} style={{ color: isDragging ? '#10B981' : '#9CA3AF', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
            {selectedFile ? selectedFile.name : 'Drag and drop your file here, or click to browse'}
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Supports CSV and Excel files
          </p>
        </div>

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: isUploading ? '#9CA3AF' : '#0684F5',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isUploading ? 'default' : 'pointer',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload and Import'}
          </button>
        )}
      </div>
    </div>
  );
}
export function ShareLinkModal({ activeTab, onClose, getSelfFillLink, onCopyLink }: {
  activeTab: TabMode;
  onClose: () => void;
  getSelfFillLink: (kind: 'exhibitor' | 'sponsor') => string;
  onCopyLink: (kind: 'exhibitor' | 'sponsor') => Promise<boolean>;
}) {
  const { t } = useI18n();
  const [modalTab, setModalTab] = useState<'exhibitor' | 'sponsor'>(activeTab === 'exhibitors' ? 'exhibitor' : 'sponsor');
  const [linkCopied, setLinkCopied] = useState(false);
  const shareUrl = getSelfFillLink(modalTab);

  useEffect(() => {
    setLinkCopied(false);
  }, [modalTab]);

  const handleCopy = async () => {
    const ok = await onCopyLink(modalTab);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 31, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '550px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#1A1D1F', marginBottom: '4px' }}>
              {t('manageEvent.exhibitors.modals.share.title', { type: modalTab === 'exhibitor' ? t('manageEvent.exhibitors.termExhibitor') : t('manageEvent.exhibitors.termSponsor') })}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
              {t('manageEvent.exhibitors.modals.share.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F5F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} style={{ color: '#6F767E' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '32px' }}>
          {/* Mode Selector */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: '#F4F5F6',
              padding: '4px',
              borderRadius: '8px',
              width: 'fit-content',
              marginBottom: '24px'
            }}
          >
            {[
              { id: 'exhibitor', label: t('manageEvent.exhibitors.modals.share.tabs.exhibitor') },
              { id: 'sponsor', label: t('manageEvent.exhibitors.modals.share.tabs.sponsor') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setModalTab(tab.id as 'exhibitor' | 'sponsor')}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  backgroundColor: modalTab === tab.id ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: modalTab === tab.id ? '#635BFF' : '#6F767E',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(modalTab === tab.id && { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)' })
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <p style={{ fontFamily: 'Inter', fontSize: '15px', color: '#6F767E', lineHeight: 1.5, marginBottom: '24px' }}>
            {t('manageEvent.exhibitors.modals.share.description')}
          </p>

          {/* Link Display */}
          <div
            style={{
              backgroundColor: '#F4F5F6',
              padding: '16px',
              borderRadius: '8px',
              border: '2px dashed #635BFF',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: 500,
                color: '#635BFF',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                userSelect: 'all'
              }}
            >
              {shareUrl}
            </a>
            <button
              onClick={handleCopy}
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: linkCopied ? '#1F7A3E' : '#635BFF',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {linkCopied ? (
                <>
                  <Check size={14} />
                  {t('manageEvent.exhibitors.modals.share.copied')}
                </>
              ) : (
                <>
                  <Copy size={14} />
                  {t('manageEvent.exhibitors.modals.share.copy')}
                </>
              )}
            </button>
          </div>

          {/* QR Code Section */}
          <div
            style={{
              borderTop: '1px solid #E9EAEB',
              paddingTop: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: '#FFFFFF',
                padding: '12px',
                border: '2px solid #E9EAEB',
                borderRadius: '12px',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={140} style={{ color: '#6F767E' }} />
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#6F767E', marginBottom: '12px' }}>
              {t('manageEvent.exhibitors.modals.share.scan')}
            </p>
            <button
              style={{
                height: '36px',
                padding: '0 16px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '13px',
                fontWeight: 600,
                color: '#6F767E',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={14} />
              {t('manageEvent.exhibitors.modals.share.downloadQr')}
            </button>
          </div>

          {/* Sharing Options */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '24px', marginBottom: '24px' }}>
            <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, color: '#1A1D1F', marginBottom: '16px' }}>
              {t('manageEvent.exhibitors.modals.share.shareVia')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[
                { icon: Mail, label: 'Email' },
                { icon: MessageCircle, label: 'WhatsApp' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Link2, label: 'Copy Link' }
              ].map((option, idx) => {
                const Icon = option.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (option.label === 'Copy Link') {
                        handleCopy();
                        return;
                      }
                      if (option.label === 'Email') {
                        window.location.href = `mailto:?subject=Eventra Self-Fill Link&body=${encodeURIComponent(shareUrl)}`;
                        return;
                      }
                      if (option.label === 'WhatsApp') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                      if (option.label === 'LinkedIn') {
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                      if (option.label === 'Twitter') {
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
                        return;
                      }
                    }}
                    style={{
                      height: '48px',
                      backgroundColor: '#F4F5F6',
                      border: 'none',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#635BFF';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#FFFFFF';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F4F5F6';
                      (e.currentTarget.querySelector('svg') as SVGElement).style.color = '#6F767E';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#6F767E';
                    }}
                  >
                    <Icon size={20} style={{ color: '#6F767E', transition: 'color 0.2s' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 500, color: '#6F767E', transition: 'color 0.2s' }}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div style={{ borderTop: '1px solid #E9EAEB', paddingTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                  {t('manageEvent.exhibitors.modals.share.options.approval')}
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#635BFF' }}
                />
                <span style={{ fontFamily: 'Inter', fontSize: '14px', color: '#6F767E' }}>
                  {t('manageEvent.exhibitors.modals.share.options.notification')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid #E9EAEB',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: '44px',
              padding: '0 24px',
              backgroundColor: '#635BFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            {t('manageEvent.exhibitors.modals.share.actions.done')}
          </button>
        </div>
      </div>
    </div>
  );
}
