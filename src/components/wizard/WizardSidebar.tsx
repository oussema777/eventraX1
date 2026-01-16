import { useState, useEffect } from 'react';
import {
  FileText,
  Palette,
  ClipboardList,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Save,
  Calendar,
  Ticket,
  Mic,
  Users,
  Store,
  Award,
  QrCode,
  Mail,
  Menu,
  X
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
type WizardSubStep = '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9';
type WizardStepKey = 1 | 2 | 3 | 4 | WizardSubStep;

interface WizardSidebarProps {
  currentStep: WizardStepKey;
  onStepClick?: (step: WizardStepKey) => void;
  completedSteps?: WizardStepKey[];
  eventName?: string;
  onSaveDraft?: () => void;
  isSaving?: boolean;
  isFreeEvent?: boolean;
}

export default function WizardSidebar({
  currentStep,
  onStepClick,
  completedSteps = [],
  eventName,
  onSaveDraft,
  isSaving = false,
  isFreeEvent = false
}: WizardSidebarProps) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isUltraMobile, setIsUltraMobile] = useState(window.innerWidth <= 500);
  const [step3Expanded, setStep3Expanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsUltraMobile(width <= 500);
      if (width >= 768) {
        setMobileOverlayOpen(false);
      } else {
        setCollapsed(true);
      }
    };

    handleResize();
    window?.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-expand step 3 if on a sub-step
  useEffect(() => {
    if (typeof currentStep === 'string' && currentStep.startsWith('3.')) {
      setStep3Expanded(true);
    }
  }, [currentStep]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOverlayOpen(!mobileOverlayOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const steps = [
    { number: 1, title: t('wizard.sidebar.steps.details.title'), icon: FileText, label: t('wizard.sidebar.steps.details.label'), hasSubSteps: false },
    { number: 2, title: t('wizard.sidebar.steps.design.title'), icon: Palette, label: t('wizard.sidebar.steps.design.label'), hasSubSteps: false },
    { 
      number: 3, 
      title: t('wizard.sidebar.steps.registration.title'), 
      icon: ClipboardList, 
      label: t('wizard.sidebar.steps.registration.label'), 
      hasSubSteps: true,
      subSteps: [
        { key: '3.1' as const, title: t('wizard.sidebar.subSteps.tickets'), icon: Ticket },
        { key: '3.2', title: t('wizard.sidebar.subSteps.speakers'), icon: Mic },
        { key: '3.3', title: t('wizard.sidebar.subSteps.attendees'), icon: Users },
        { key: '3.4', title: t('wizard.sidebar.subSteps.exhibitors'), icon: Store },
        { key: '3.5', title: t('wizard.sidebar.subSteps.schedule'), icon: Calendar },
        { key: '3.6', title: t('wizard.sidebar.subSteps.sponsors'), icon: Award },
        { key: '3.7', title: t('wizard.sidebar.subSteps.qrBadges'), icon: QrCode },
        { key: '3.8', title: t('wizard.sidebar.subSteps.customForms'), icon: FileText },
        { key: '3.9', title: t('wizard.sidebar.subSteps.marketingTools'), icon: Mail }
      ]
    },
    { number: 4, title: t('wizard.sidebar.steps.launch.title'), icon: Rocket, label: t('wizard.sidebar.steps.launch.label'), hasSubSteps: false }
  ];

  const allSteps: WizardStepKey[] = isFreeEvent
    ? [1, 2, '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', 4]
    : [1, 2, '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', 4];
  const progress = {
    completed: completedSteps.length,
    total: allSteps.length,
    percentage: Math.round((completedSteps.length / allSteps.length) * 100)
  };

  const getStepState = (stepNumber: number | string) => {
    if (completedSteps.includes(stepNumber as any)) return 'completed';
    if (stepNumber === currentStep) return 'active';
    if (stepNumber === 3 && typeof currentStep === 'string' && currentStep.startsWith('3.')) return 'active';
    return 'default';
  };

  const handleStepClick = (stepNumber: WizardStepKey) => {
    if (onStepClick) {
      if (stepNumber === 3) {
        setStep3Expanded(true);
      }
      onStepClick(stepNumber);
      
      if (isMobile) {
        setMobileOverlayOpen(false);
      }
    }
  };

  const sidebarWidth = isMobile ? (mobileOverlayOpen ? 280 : 56) : (collapsed ? 56 : 280);

  return (
    <>
      <style>{`
        @media (max-width: 500px) {
          .wizard-sidebar-aside { display: none !important; }
          .wizard-sidebar-spacer { display: none !important; width: 0 !important; }
          .mobile-fab-trigger { display: flex !important; }
          .ultra-mobile-overlay { 
            display: flex !important;
            width: 100% !important; 
            z-index: 1000 !important;
          }
        }
      `}</style>

      {/* Mobile Overlay Backdrop */}
      {isMobile && mobileOverlayOpen && (
        <div
          onClick={() => setMobileOverlayOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: '72px',
            backgroundColor: 'rgba(11, 38, 65, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 99
          }}
        />
      )}

      {/* Ultra Mobile FAB Trigger */}
      <button
        className="mobile-fab-trigger"
        onClick={() => setMobileOverlayOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          left: '16px',
          bottom: '100px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#0684F5',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(6, 132, 245, 0.4)',
          zIndex: 98,
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`wizard-sidebar-aside ${mobileOverlayOpen && isUltraMobile ? 'ultra-mobile-overlay' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: '72px',
          width: isUltraMobile && mobileOverlayOpen ? '100%' : `${sidebarWidth}px`,
          height: 'calc(100vh - 72px)',
          backgroundColor: '#0B2641',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isMobile && mobileOverlayOpen ? '4px 0px 24px rgba(0, 0, 0, 0.4)' : '2px 0px 8px rgba(0, 0, 0, 0.2)',
          zIndex: isMobile && mobileOverlayOpen ? 100 : 50,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          display: (isUltraMobile && !mobileOverlayOpen) ? 'none' : 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Sidebar Header */}
        <div
          style={{
            paddingTop: collapsed && !mobileOverlayOpen ? '20px' : '24px',
            paddingBottom: collapsed && !mobileOverlayOpen ? '20px' : '24px',
            paddingLeft: collapsed && !mobileOverlayOpen ? '12px' : '20px',
            paddingRight: collapsed && !mobileOverlayOpen ? '12px' : '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'sticky',
            top: 0,
            backgroundColor: '#0B2641',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {(!collapsed || mobileOverlayOpen) ? (
            <>
              {/* Left: Event Icon */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(6, 132, 245, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(6, 132, 245, 0.3)'
                  }}
                >
                  <Calendar size={20} style={{ color: '#0684F5' }} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '2px'
                    }}
                  >
                    {t('wizard.sidebar.header.eyebrow')}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFFFFF'
                    }}
                  >
                    {t('wizard.sidebar.header.title')}
                  </div>
                </div>
              </div>

              {/* Right: Toggle Button */}
              <button
                onClick={() => mobileOverlayOpen ? setMobileOverlayOpen(false) : toggleSidebar()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                {mobileOverlayOpen ? <X size={20} style={{ color: '#FFFFFF' }} /> : <ChevronLeft size={20} style={{ color: '#FFFFFF' }} />}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '12px' }}>
              {/* Collapsed Icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(6, 132, 245, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(6, 132, 245, 0.3)'
                }}
              >
                <Calendar size={18} style={{ color: '#0684F5' }} />
              </div>
              
              {/* Collapsed Toggle Button */}
              <button
                onClick={toggleSidebar}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(6, 132, 245, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <ChevronRight size={20} style={{ color: '#FFFFFF' }} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Steps */}
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {steps.map((step) => {
            const stepState = getStepState(step.number);
            const isActive = step.number === currentStep || (step.number === 3 && typeof currentStep === 'string' && currentStep.startsWith('3.'));

            return (
              <div key={step.number} style={{ marginBottom: '8px' }}>
                {/* Main Step */}
                <div
                  onClick={() => handleStepClick(step.number as WizardStepKey)}
                  style={{
                    paddingTop: collapsed && !mobileOverlayOpen ? '8px' : '12px',
                    paddingRight: collapsed && !mobileOverlayOpen ? '8px' : '16px',
                    paddingBottom: collapsed && !mobileOverlayOpen ? '8px' : '12px',
                    paddingLeft: isActive && (!collapsed || mobileOverlayOpen) ? '12px' : (collapsed && !mobileOverlayOpen ? '8px' : '16px'),
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(6, 132, 245, 0.15)' : 'transparent',
                    borderLeft: isActive ? '4px solid #0684F5' : 'none',
                    transition: 'all 0.2s ease',
                    marginBottom: step.hasSubSteps && step3Expanded && (!collapsed || mobileOverlayOpen) ? '8px' : '0',
                    justifyContent: collapsed && !mobileOverlayOpen ? 'center' : 'flex-start',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Step Icon */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor:
                        stepState === 'completed' ? 'rgba(74, 124, 109, 0.2)' :
                        stepState === 'active' ? 'rgba(6, 132, 245, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: stepState === 'completed' ? '2px solid #4A7C6D' :
                             stepState === 'active' ? '2px solid #0684F5' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: stepState === 'active' ? '0px 4px 12px rgba(6, 132, 245, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {stepState === 'completed' ? (
                      <Check size={20} style={{ color: '#4A7C6D' }} />
                    ) : (
                      <step.icon
                        size={20}
                        style={{
                          color: stepState === 'active' ? '#0684F5' : '#9CA3AF'
                        }}
                      />
                    )}
                  </div>

                  {/* Step Text */}
                  {(!collapsed || mobileOverlayOpen) && (
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          marginBottom: '4px'
                        }}
                      >
                        {t('wizard.sidebar.stepLabel', { number: step.number })}
                      </div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: isActive ? '#0684F5' : '#FFFFFF'
                        }}
                      >
                        {step.label}
                      </div>
                    </div>
                  )}

                  {/* Expand/Collapse Icon for Step 3 */}
                  {step.hasSubSteps && (!collapsed || mobileOverlayOpen) && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setStep3Expanded(!step3Expanded);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronDown
                        size={18}
                        style={{
                          color: '#9CA3AF',
                          transform: step3Expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Sub-steps */}
                {step.hasSubSteps && step3Expanded && (!collapsed || mobileOverlayOpen) && (
                  <div
                    style={{
                      paddingLeft: '32px',
                      borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                      marginLeft: '32px',
                      maxHeight: step3Expanded ? '600px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease'
                    }}
                  >
                    {step.subSteps
                      ?.filter((subStep) => !isFreeEvent || subStep.key !== '3.1')
                      .map((subStep) => {
                      const subStepState = getStepState(subStep.key);
                      const isSubActive = currentStep === subStep.key;

                      return (
                        <div
                          key={subStep.key}
                          onClick={() => handleStepClick(subStep.key as WizardStepKey)}
                          style={{
                            padding: '10px 16px 10px 24px',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: isSubActive ? 'rgba(6, 132, 245, 0.1)' : 'transparent',
                            borderLeft: isSubActive ? '3px solid #0684F5' : 'none',
                            position: 'relative',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {/* Connection Dot */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-10px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor:
                                subStepState === 'completed' ? '#4A7C6D' :
                                subStepState === 'active' ? '#0684F5' : 'rgba(255, 255, 255, 0.2)',
                              border: '2px solid #0B2641',
                              transition: 'background-color 0.2s ease'
                            }}
                          />

                          {/* Sub-step Icon */}
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              backgroundColor:
                                subStepState === 'completed' ? 'rgba(74, 124, 109, 0.2)' :
                                subStepState === 'active' ? 'rgba(6, 132, 245, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {subStepState === 'completed' ? (
                              <Check size={14} style={{ color: '#4A7C6D' }} />
                            ) : (
                              <subStep.icon
                                size={14}
                                style={{
                                  color: subStepState === 'active' ? '#0684F5' : '#9CA3AF'
                                }}
                              />
                            )}
                          </div>

                          {/* Sub-step Text */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: isSubActive ? '#0684F5' : '#FFFFFF'
                              }}
                            >
                              {subStep.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#0B2641',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: collapsed && !mobileOverlayOpen ? '16px 8px' : '16px 20px',
            zIndex: 10
          }}
        >
          {(!collapsed || mobileOverlayOpen) ? (
            <>
              {/* Progress Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>
                  {t('wizard.sidebar.progressLabel', { completed: progress.completed, total: progress.total })}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0684F5' }}>
                  {progress.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(to right, #0684F5, #4A7C6D)',
                    width: `${progress.percentage}%`,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Save Draft Button */}
              {onSaveDraft && (
                <button
                  onClick={onSaveDraft}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: 'rgba(6, 132, 245, 0.1)',
                    border: '1px solid rgba(6, 132, 245, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0684F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.1)';
                  }}
                >
                  <Save size={16} />
                  {isSaving ? t('wizard.sidebar.saving') : t('wizard.sidebar.saveDraft')}
                </button>
              )}
            </>
          ) : (
            /* Collapsed Progress Circle */
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#0684F5"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress.percentage / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0684F5'
                }}
              >
                {progress.percentage}%
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Sidebar Width Spacer (for layout) */}
      <div
        className="wizard-sidebar-spacer"
        style={{
          width: isUltraMobile ? '0' : (isMobile ? '56px' : (collapsed ? '56px' : '280px')),
          flexShrink: 0,
          transition: 'width 0.3s ease',
          display: isUltraMobile ? 'none' : 'block'
        }}
      />
    </>
  );
}