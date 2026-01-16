import { useState } from 'react';
import { X, Lock, ChevronDown } from 'lucide-react';
import { countries } from '../../data/countries';
import { useI18n } from '../../i18n/I18nContext';

interface ModalProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onComplete: (profileData: ProfileData) => void;
  onSkip: () => void;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  country: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  industryOther?: string;
  department?: string;
  yearsOfExperience?: number;
  companySize?: string;
}

const toFlagEmoji = (code: string) => {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};


const parseYearsExperience = (value: string): number | null => {
  if (!value) return null;
  if (value.includes('+')) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (value.includes('-')) {
    const parts = value.split('-');
    const parsed = parseInt(parts[1], 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function ModalProfileSetup({ 
  isOpen, 
  onClose, 
  userEmail,
  onComplete,
  onSkip
}: ModalProfileSetupProps) {
  const { t, tList } = useI18n();
  const [internalStep, setInternalStep] = useState<1 | 2>(1);
  const industries = tList<string>('profileSetup.industries');
  const yearsOfExperienceOptions = tList<string>('profileSetup.yearsOfExperience');
  const companySizeOptions = tList<string>('profileSetup.companySizes');
  const otherIndustryLabel = industries[industries.length - 1] || 'Other';
  
  // Personal Info (Step 1)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Professional Info (Step 2)
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [department, setDepartment] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);

  if (!isOpen) return null;

  // Get selected country data
  const selectedCountryData = countries.find(c => c.code === selectedCountryCode) || countries[0];
  
  // Form validation for Step 1
  const isStep1Valid = firstName.trim() !== '' && lastName.trim() !== '' && phoneNumber.trim() !== '' && selectedCountry !== '';

  // Form validation for Step 2
  const isOtherIndustry = industry === otherIndustryLabel;
  const resolvedIndustryOther = customIndustry.trim();
  const isStep2Valid =
    jobTitle.trim() !== '' &&
    company.trim() !== '' &&
    industry !== '' &&
    (!isOtherIndustry || resolvedIndustryOther !== '') &&
    department.trim() !== '' &&
    yearsOfExperience !== '' &&
    companySize !== '';

  // Handle phone number input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9\s]/g, ''); // Only numbers and spaces
    setPhoneNumber(value);
    
    // Basic validation
    if (value.length > 0 && value.replace(/\s/g, '').length < 6) {
      setPhoneError(t('profileSetup.errors.phoneTooShort'));
    } else {
      setPhoneError('');
    }
  };

  // Handle Step 1 continue
  const handleStep1Continue = () => {
    if (!isStep1Valid) return;
    setInternalStep(2);
  };

  // Handle Step 2 complete
  const handleStep2Complete = () => {
    if (!isStep2Valid) return;

    const profileData: ProfileData = {
      firstName,
      lastName,
      phoneCountryCode: selectedCountryData.phoneCode,
      phoneNumber,
      country: selectedCountry,
      jobTitle,
      company,
      industry,
      industryOther: isOtherIndustry ? resolvedIndustryOther : undefined,
      department,
      yearsOfExperience: parseYearsExperience(yearsOfExperience),
      companySize
    };

    onComplete(profileData);
  };

  // Handle Step 2 skip (submit only Step 1 data)
  const handleStep2Skip = () => {
    const profileData: ProfileData = {
      firstName,
      lastName,
      phoneCountryCode: selectedCountryData.phoneCode,
      phoneNumber,
      country: selectedCountry,
      // Step 2 fields undefined
    };
    onComplete(profileData);
  };

  // Handle back button
  const handleBack = () => {
    if (internalStep === 2) {
      setInternalStep(1);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative pointer-events-auto"
          style={{ 
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div 
            className="px-8 pt-8 pb-6"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 flex items-center justify-center transition-colors rounded-lg"
              style={{
                width: '40px',
                height: '40px',
                color: '#6B7280'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span 
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6B7280'
                  }}
                >
                  {t('profileSetup.progress.stepLabel', { current: internalStep, total: 3 })}
                </span>
                <span 
                  style={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6B7280'
                  }}
                >
                  {t('profileSetup.progress.percentLabel', { percent: internalStep === 1 ? 33 : 66 })}
                </span>
              </div>
              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden"
                style={{ 
                  height: '4px',
                  backgroundColor: '#E5E7EB'
                }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: internalStep === 1 ? '33%' : '66%',
                    backgroundColor: '#0684F5'
                  }}
                />
              </div>
            </div>

            {/* Title and Subtitle */}
            {internalStep === 1 ? (
              <div>
                <h2 
                  className="mb-2"
                  style={{ 
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#111827',
                    lineHeight: '1.2'
                  }}
                >
                  {t('profileSetup.step1.title')}
                </h2>
                <p 
                  style={{ 
                    fontSize: '15px',
                    color: '#6B7280',
                    lineHeight: '1.5'
                  }}
                >
                  {t('profileSetup.step1.subtitle')}
                </p>
              </div>
            ) : (
              <div>
                <h2 
                  className="mb-2"
                  style={{ 
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#111827',
                    lineHeight: '1.2'
                  }}
                >
                  {t('profileSetup.step2.title')}
                </h2>
                <p 
                  style={{ 
                    fontSize: '15px',
                    color: '#6B7280',
                    lineHeight: '1.5'
                  }}
                >
                  {t('profileSetup.step2.subtitle')}
                </p>
              </div>
            )}
          </div>

          {/* Form Section - Step 1: Personal Info */}
          {internalStep === 1 && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleStep1Continue();
              }} 
              className="px-8 py-6"
            >
              <div className="space-y-5">
                {/* First Name */}
                <div>
                  <label 
                    htmlFor="firstName"
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.firstName')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('profileSetup.placeholders.firstName')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label 
                    htmlFor="lastName"
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.lastName')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('profileSetup.placeholders.lastName')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.phoneNumber')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                        className="flex items-center justify-between transition-all"
                        style={{
                          width: '90px',
                          height: '48px',
                          padding: '12px',
                          fontSize: '16px',
                          color: '#111827',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #D1D5DB',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#0684F5';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                        }}
                        onBlur={(e) => {
                          const target = e.currentTarget;
                          setTimeout(() => {
                            if (target) {
                              target.style.borderColor = '#D1D5DB';
                              target.style.boxShadow = 'none';
                            }
                          }, 200);
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{toFlagEmoji(selectedCountryData.code)}</span>
                        <ChevronDown size={16} style={{ color: '#6B7280' }} />
                      </button>

                      {/* Dropdown Menu */}
                      {showCountryCodeDropdown && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-lg z-10"
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            maxHeight: '240px',
                            overflowY: 'auto'
                          }}
                        >
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountryCode(country.code);
                                setShowCountryCodeDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                              style={{
                                border: 'none',
                                backgroundColor: selectedCountryCode === country.code ? '#F3F4F6' : 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedCountryCode !== country.code) {
                                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedCountryCode !== country.code) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                              <span style={{ fontSize: '14px', color: '#374151', flex: 1 }}>{country.name}</span>
                              <span style={{ fontSize: '14px', color: '#6B7280' }}>{country.phoneCode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder={t('profileSetup.placeholders.phoneNumber')}
                      className="flex-1 transition-all"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: '#111827',
                        backgroundColor: '#FFFFFF',
                        border: `1.5px solid ${phoneError ? '#EF4444' : '#D1D5DB'}`,
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!phoneError) {
                          e.currentTarget.style.borderColor = '#0684F5';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!phoneError) {
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    />
                  </div>
                  {phoneError && (
                    <p 
                      className="mt-1.5"
                      style={{ 
                        fontSize: '13px',
                        color: '#EF4444'
                      }}
                    >
                      {phoneError}
                    </p>
                  )}
                </div>

                {/* Email (Locked) */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      readOnly
                      className="w-full"
                      style={{
                        height: '48px',
                        padding: '12px 44px 12px 16px',
                        fontSize: '16px',
                        color: '#6B7280',
                        backgroundColor: '#F9FAFB',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'not-allowed'
                      }}
                    />
                    <div 
                      className="absolute right-0 top-0 flex items-center justify-center pointer-events-none"
                      style={{
                        width: '48px',
                        height: '48px'
                      }}
                    >
                      <Lock size={16} style={{ color: '#9CA3AF' }} />
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.country')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between transition-all"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: selectedCountry ? '#111827' : '#9CA3AF',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        textAlign: 'left'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0684F5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                      }}
                      onBlur={(e) => {
                        const target = e.currentTarget;
                        setTimeout(() => {
                          if (target) {
                            target.style.borderColor = '#D1D5DB';
                            target.style.boxShadow = 'none';
                          }
                        }, 200);
                      }}
                    >
                      {selectedCountry ? (
                        <span className="flex items-center gap-2">
                          <span style={{ fontSize: '20px' }}>
                            {toFlagEmoji(selectedCountry)}
                          </span>
                          {countries.find(c => c.code === selectedCountry)?.name}
                        </span>
                      ) : (
                        t('profileSetup.placeholders.country')
                      )}
                      <ChevronDown size={20} style={{ color: '#6B7280' }} />
                    </button>

                    {/* Dropdown Menu */}
                    {showCountryDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          maxHeight: '240px',
                          overflowY: 'auto'
                        }}
                      >
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country.code);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                            style={{
                              border: 'none',
                              backgroundColor: selectedCountry === country.code ? '#F3F4F6' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedCountry !== country.code) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCountry !== country.code) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{country.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Helper Text */}
                <p 
                  style={{ 
                    fontSize: '13px',
                    color: '#9CA3AF',
                    marginTop: '8px'
                  }}
                >
                  {t('profileSetup.requiredFields')}
                </p>

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className="w-full flex items-center justify-center gap-2 transition-all"
                  style={{
                    height: '48px',
                    marginTop: '32px',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: !isStep1Valid ? '#9CA3AF' : '#0684F5',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: !isStep1Valid ? 'not-allowed' : 'pointer',
                    opacity: !isStep1Valid ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (isStep1Valid) {
                      e.currentTarget.style.backgroundColor = '#0570D6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isStep1Valid) {
                      e.currentTarget.style.backgroundColor = '#0684F5';
                    }
                  }}
                >
                  {t('profileSetup.buttons.continue') || 'Next Step'}
                </button>
              </div>
            </form>
          )}

          {/* Form Section - Step 2: Professional Info */}
          {internalStep === 2 && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleStep2Complete();
              }} 
              className="px-8 py-6"
            >
              <div className="space-y-5">
                {/* Current Job Title */}
                <div>
                  <label 
                    htmlFor="jobTitle"
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.jobTitle')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={t('profileSetup.placeholders.jobTitle')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Company / Organization */}
                <div>
                  <label 
                    htmlFor="company"
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.company')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t('profileSetup.placeholders.company')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.industry')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                      className="w-full flex items-center justify-between transition-all"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: industry ? '#111827' : '#9CA3AF',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        textAlign: 'left'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0684F5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                      }}
                      onBlur={(e) => {
                        const target = e.currentTarget;
                        setTimeout(() => {
                          if (target) {
                            target.style.borderColor = '#D1D5DB';
                            target.style.boxShadow = 'none';
                          }
                        }, 200);
                      }}
                    >
                      {industry || t('profileSetup.placeholders.industry')}
                      <ChevronDown size={20} style={{ color: '#6B7280' }} />
                    </button>

                    {/* Dropdown Menu */}
                    {showIndustryDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          maxHeight: '240px',
                          overflowY: 'auto'
                        }}
                      >
                        {industries.map((ind) => (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              setIndustry(ind);
                              if (ind !== otherIndustryLabel) {
                                setCustomIndustry('');
                              }
                              setShowIndustryDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 transition-colors"
                            style={{
                              border: 'none',
                              backgroundColor: industry === ind ? '#F3F4F6' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '14px',
                              color: '#374151'
                            }}
                            onMouseEnter={(e) => {
                              if (industry !== ind) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (industry !== ind) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {ind}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {industry === otherIndustryLabel && (
                    <input
                      type="text"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      placeholder={t('profileSetup.placeholders.industryOther')}
                      className="w-full transition-all mt-3"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: '#111827',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0684F5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Department */}
                <div>
                  <label 
                    htmlFor="department"
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.department')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={t('profileSetup.placeholders.department')}
                    className="w-full transition-all"
                    style={{
                      height: '48px',
                      padding: '12px 16px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0684F5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.yearsExperience')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowYearsDropdown(!showYearsDropdown)}
                      className="w-full flex items-center justify-between transition-all"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: yearsOfExperience ? '#111827' : '#9CA3AF',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        textAlign: 'left'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0684F5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                      }}
                      onBlur={(e) => {
                        const target = e.currentTarget;
                        setTimeout(() => {
                          if (target) {
                            target.style.borderColor = '#D1D5DB';
                            target.style.boxShadow = 'none';
                          }
                        }, 200);
                      }}
                    >
                      {yearsOfExperience || t('profileSetup.placeholders.yearsExperience')}
                      <ChevronDown size={20} style={{ color: '#6B7280' }} />
                    </button>

                    {/* Dropdown Menu */}
                    {showYearsDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          maxHeight: '240px',
                          overflowY: 'auto'
                        }}
                      >
                        {yearsOfExperienceOptions.map((years) => (
                          <button
                            key={years}
                            type="button"
                            onClick={() => {
                              setYearsOfExperience(years);
                              setShowYearsDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 transition-colors"
                            style={{
                              border: 'none',
                              backgroundColor: yearsOfExperience === years ? '#F3F4F6' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '14px',
                              color: '#374151'
                            }}
                            onMouseEnter={(e) => {
                              if (yearsOfExperience !== years) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (yearsOfExperience !== years) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {years}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}
                  >
                    {t('profileSetup.labels.companySize')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
                      className="w-full flex items-center justify-between transition-all"
                      style={{
                        height: '48px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        color: companySize ? '#111827' : '#9CA3AF',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        textAlign: 'left'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0684F5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 132, 245, 0.1)';
                      }}
                      onBlur={(e) => {
                        const target = e.currentTarget;
                        setTimeout(() => {
                          if (target) {
                            target.style.borderColor = '#D1D5DB';
                            target.style.boxShadow = 'none';
                          }
                        }, 200);
                      }}
                    >
                      {companySize || t('profileSetup.placeholders.companySize')}
                      <ChevronDown size={20} style={{ color: '#6B7280' }} />
                    </button>

                    {/* Dropdown Menu */}
                    {showCompanySizeDropdown && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          maxHeight: '240px',
                          overflowY: 'auto'
                        }}
                      >
                        {companySizeOptions.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setCompanySize(size);
                              setShowCompanySizeDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 transition-colors"
                            style={{
                              border: 'none',
                              backgroundColor: companySize === size ? '#F3F4F6' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '14px',
                              color: '#374151'
                            }}
                            onMouseEnter={(e) => {
                              if (companySize !== size) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (companySize !== size) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Helper Text */}
                <p 
                  style={{ 
                    fontSize: '13px',
                    color: '#9CA3AF',
                    marginTop: '8px'
                  }}
                >
                  {t('profileSetup.requiredFields')}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3" style={{ marginTop: '32px' }}>
                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={handleBack}
                    className="transition-all"
                    style={{
                      height: '48px',
                      flex: 1,
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#374151',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    {t('profileSetup.buttons.back')}
                  </button>

                  {/* Complete Button */}
                  <button
                    type="submit"
                    disabled={!isStep2Valid}
                    className="transition-all"
                    style={{
                      height: '48px',
                      flex: 2,
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#FFFFFF',
                      backgroundColor: !isStep2Valid ? '#9CA3AF' : '#0684F5',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: !isStep2Valid ? 'not-allowed' : 'pointer',
                      opacity: !isStep2Valid ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (isStep2Valid) {
                        e.currentTarget.style.backgroundColor = '#0570D6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isStep2Valid) {
                        e.currentTarget.style.backgroundColor = '#0684F5';
                      }
                    }}
                  >
                    {t('profileSetup.buttons.completeProfile')}
                  </button>
                </div>

                {/* Skip Option */}
                <div className="text-center" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleStep2Skip}
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      padding: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {t('profileSetup.buttons.skip')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
