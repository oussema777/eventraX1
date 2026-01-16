import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventWizard } from '../hooks/useEventWizard';
import { supabase } from '../lib/supabase';
import TicketsTab from '../components/wizard/TicketsTab';
import SpeakersTab from '../components/wizard/SpeakersTab';
import EventDetailsForm from '../components/wizard/EventDetailsForm';
import DesignTab from '../components/wizard/DesignTab';
import AttendeesTab from '../components/wizard/AttendeesTab';
import ExhibitorsTab from '../components/wizard/ExhibitorsTab';
import LaunchChecklist from '../components/wizard/LaunchChecklist';
import {
  FileText,
  Palette,
  LayoutList,
  CheckCircle,
  Check,
  Ticket,
  Users,
  Mic,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  HelpCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

// Step and sub-step type definitions
type MainStep = 1 | 2 | 3 | 4;
type SubStep = '3.1' | '3.2' | '3.3' | '3.4';
type CurrentStep = MainStep | SubStep;

interface StepState {
  completed: boolean;
  inProgress: boolean;
  locked: boolean;
}

interface WizardState {
  steps: {
    [key: string]: StepState;
  };
  currentStep: CurrentStep;
  eventName: string;
}

export default function EventCreationWizard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOverlayOpen, setMobileOverlayOpen] = useState(false);
  const [step3Expanded, setStep3Expanded] = useState(true);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Integration with Supabase Hook
  const { eventData, saveDraft, isSaving, lastSaved } = useEventWizard();
  const isFreeEvent = eventData.event_status === 'free';

  // Wizard state
  const [wizardState, setWizardState] = useState<WizardState>({
    steps: {
      '1': { completed: true, inProgress: false, locked: false },
      '2': { completed: true, inProgress: false, locked: false },
      '3': { completed: false, inProgress: false, locked: false },
      '3.1': { completed: true, inProgress: false, locked: false },
      '3.2': { completed: true, inProgress: false, locked: false },
      '3.3': { completed: false, inProgress: true, locked: false },
      '3.4': { completed: false, inProgress: false, locked: false },
      '4': { completed: false, inProgress: false, locked: true }
    },
    currentStep: '1', // Reset to step 1 for new flow
    eventName: eventData.name // Use real event name
  });

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOverlayOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window?.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-save logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventData.name && eventData.name !== 'Untitled Event') {
        saveDraft({ name: eventData.name }); // Basic auto-save
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [eventData, saveDraft]);

  const handleManualSave = async () => {
    await saveDraft({ name: wizardState.eventName });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const calculateProgress = () => {
    const allSteps = isFreeEvent ? ['1', '2', '3.2', '3.3', '3.4', '4'] : ['1', '2', '3.1', '3.2', '3.3', '3.4', '4'];
    const completedSteps = allSteps.filter(step => wizardState.steps[step]?.completed).length;
    return {
      completed: completedSteps,
      total: allSteps.length,
      percentage: Math.round((completedSteps / allSteps.length) * 100)
    };
  };

  const progress = calculateProgress();

  const canNavigateToStep = (step: string) => {
    return !wizardState.steps[step]?.locked;
  };

  const navigateToStep = (step: CurrentStep) => {
    if (canNavigateToStep(step.toString())) {
      setWizardState(prev => ({
        ...prev,
        currentStep: step
      }));
      setShowValidationError(false);
      
      // Close mobile overlay after navigation
      if (isMobile) {
        setMobileOverlayOpen(false);
      }

      // Auto-expand step 3 if navigating to a sub-step
      if (step.toString().startsWith('3.')) {
        setStep3Expanded(true);
      }
    }
  };

  const handleSaveAndContinue = async () => {
    // Simulate validation
    const isValid = true; // In real app, validate form fields

    if (!isValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    // Save to DB before continuing
    const isLastStep = wizardState.currentStep === 4;
    
    await saveDraft({
      name: wizardState.eventName || eventData.name,
      status: isLastStep ? 'published' : 'draft'
    });

    if (isLastStep) {
      navigate(`/success-live?eventId=${eventData.id || ''}`);
      return;
    }

    // Mark current step as completed
    const currentStepKey = wizardState.currentStep.toString();
    setWizardState(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [currentStepKey]: { completed: true, inProgress: false, locked: false }
      }
    }));

    // Navigate to next step
    const stepOrder: CurrentStep[] = isFreeEvent ? [1, 2, '3.2', '3.3', '3.4', 4] : [1, 2, '3.1', '3.2', '3.3', '3.4', 4];
    const currentIndex = stepOrder.indexOf(wizardState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      
      // Unlock next step
      setWizardState(prev => ({
        ...prev,
        currentStep: nextStep,
        steps: {
          ...prev.steps,
          [nextStep.toString()]: { completed: false, inProgress: true, locked: false }
        }
      }));
    }
  };

  const handleBack = () => {
    const stepOrder: CurrentStep[] = isFreeEvent ? [1, 2, '3.2', '3.3', '3.4', 4] : [1, 2, '3.1', '3.2', '3.3', '3.4', 4];
    const currentIndex = stepOrder.indexOf(wizardState.currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      navigateToStep(prevStep);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOverlayOpen(!mobileOverlayOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const getStepTitle = () => {
    switch (wizardState.currentStep) {
      case 1: return 'Event Information';
      case 2: return 'Design & Branding';
      case '3.1': return 'Tickets';
      case '3.2': return 'Attendees';
      case '3.3': return 'Speakers';
      case '3.4': return 'Exhibitors';
      case 4: return 'Review & Publish';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (wizardState.currentStep) {
      case 1: return 'Provide basic details about your event including name, date, location, and description.';
      case 2: return 'Customize the look and feel of your event with branding elements.';
      case '3.1': return 'Set up ticket types, pricing, and availability for your event.';
      case '3.2': return 'Configure attendee capacity, registration settings, and custom forms.';
      case '3.3': return 'Add speakers, manage speaker profiles, and organize session assignments.';
      case '3.4': return 'Manage exhibitors, booth assignments, and sponsorship tiers.';
      case 4: return 'Review all event details and publish your event to make it live.';
      default: return '';
    }
  };

  const getStepIndicator = () => {
    const stepOrder: CurrentStep[] = isFreeEvent ? [1, 2, '3.2', '3.3', '3.4', 4] : [1, 2, '3.1', '3.2', '3.3', '3.4', 4];
    const currentIndex = stepOrder.indexOf(wizardState.currentStep);
    return `STEP ${currentIndex + 1} OF ${stepOrder.length}`;
  };

  const getPrimaryButtonText = () => {
    if (wizardState.currentStep === 4) return 'Publish Event';
    if (wizardState.currentStep.toString().startsWith('3.')) {
      const subSteps: SubStep[] = isFreeEvent ? ['3.2', '3.3', '3.4'] : ['3.1', '3.2', '3.3', '3.4'];
      const currentIndex = subSteps.indexOf(wizardState.currentStep as SubStep);
      if (currentIndex < subSteps.length - 1) {
        const nextSubStepNames = isFreeEvent ? ['Speakers', 'Exhibitors', 'Review'] : ['Attendees', 'Speakers', 'Exhibitors', 'Review'];
        return `Continue to ${nextSubStepNames[currentIndex]}`;
      }
    }
    return 'Save & Continue';
  };

  // Main steps configuration
  const registrationSubSteps = isFreeEvent
    ? [
        { key: '3.2' as const, title: 'Attendees', icon: Users },
        { key: '3.3' as const, title: 'Speakers', icon: Mic },
        { key: '3.4' as const, title: 'Exhibitors', icon: Store }
      ]
    : [
        { key: '3.1' as const, title: 'Tickets', icon: Ticket },
        { key: '3.2' as const, title: 'Attendees', icon: Users },
        { key: '3.3' as const, title: 'Speakers', icon: Mic },
        { key: '3.4' as const, title: 'Exhibitors', icon: Store }
      ];

  const mainSteps = [
    {
      number: 1,
      key: '1',
      title: 'Event Info',
      icon: FileText,
      hasSubSteps: false
    },
    {
      number: 2,
      key: '2',
      title: 'Design & Branding',
      icon: Palette,
      hasSubSteps: false
    },
    {
      number: 3,
      key: '3',
      title: 'Event Details',
      icon: LayoutList,
      hasSubSteps: true,
      subSteps: registrationSubSteps
    },
    {
      number: 4,
      key: '4',
      title: 'Review & Publish',
      icon: CheckCircle,
      hasSubSteps: false
    }
  ];

  const isStepActive = (stepKey: string) => {
    if (stepKey === '3') {
      return wizardState.currentStep.toString().startsWith('3');
    }
    return wizardState.currentStep.toString() === stepKey;
  };

  const getStepIconState = (stepKey: string) => {
    const step = wizardState.steps[stepKey];
    if (step?.completed) return 'completed';
    if (isStepActive(stepKey)) return 'active';
    return 'default';
  };

  const sidebarWidth = sidebarCollapsed ? 56 : (isMobile && mobileOverlayOpen ? 280 : (isMobile ? 56 : 280));

  useEffect(() => {
    if (!isFreeEvent) return;
    if (wizardState.currentStep === '3.1') {
      navigateToStep('3.2');
    }
  }, [isFreeEvent, wizardState.currentStep]);

  return (
    <div style={{ backgroundColor: '#FAFBFC', minHeight: '100vh', paddingTop: '72px' }}>
      {/* Mobile Overlay Backdrop */}
      {isMobile && mobileOverlayOpen && (
        <div
          onClick={() => setMobileOverlayOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: '72px',
            backgroundColor: 'rgba(26, 29, 31, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 99
          }}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: '72px',
          width: `${sidebarWidth}px`,
          height: 'calc(100vh - 72px)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E9EAEB',
          boxShadow: isMobile && mobileOverlayOpen ? '4px 0px 24px rgba(0, 0, 0, 0.12)' : '2px 0px 8px rgba(0, 0, 0, 0.04)',
          zIndex: isMobile && mobileOverlayOpen ? 100 : 50,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: sidebarCollapsed && !mobileOverlayOpen ? '16px 8px' : '24px 20px',
            borderBottom: '1px solid #E9EAEB',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10
          }}
        >
          {(!sidebarCollapsed || mobileOverlayOpen) ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
              {/* Event Icon */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#E0E7FF',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Calendar size={24} style={{ color: '#635BFF' }} />
              </div>

              {/* Text Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#9A9FA5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}
                >
                  Creating Event
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#1A1D1F',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {wizardState.eventName || 'Untitled Event'}
                </div>
              </div>

              {/* Mobile Toggle Button */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '-16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E9EAEB',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 60
                  }}
                >
                  {mobileOverlayOpen ? (
                    <ChevronLeft size={18} style={{ color: '#6F767E' }} />
                  ) : (
                    <ChevronRight size={18} style={{ color: '#6F767E' }} />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#E0E7FF',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={20} style={{ color: '#635BFF' }} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Steps */}
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {mainSteps.map((step) => {
            const stepState = wizardState.steps[step.key];
            const isActive = isStepActive(step.key);
            const iconState = getStepIconState(step.key);
            const canNavigate = canNavigateToStep(step.key);

            return (
              <div key={step.key} style={{ marginBottom: '8px' }}>
                {/* Main Step */}
                <div
                  onClick={() => canNavigate && navigateToStep(step.number as MainStep)}
                  style={{
                    padding: sidebarCollapsed && !mobileOverlayOpen ? '8px' : '12px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    cursor: canNavigate ? 'pointer' : 'not-allowed',
                    backgroundColor: isActive ? '#E0E7FF' : 'transparent',
                    borderLeft: isActive ? '4px solid #635BFF' : 'none',
                    paddingLeft: isActive && (!sidebarCollapsed || mobileOverlayOpen) ? '12px' : undefined,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    justifyContent: sidebarCollapsed && !mobileOverlayOpen ? 'center' : 'flex-start',
                    opacity: canNavigate ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (canNavigate && !isActive) {
                      e.currentTarget.style.backgroundColor = '#FAFBFC';
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
                        iconState === 'completed' ? '#E6F4EA' :
                        iconState === 'active' ? '#635BFF' : '#F4F5F6',
                      border: iconState === 'completed' ? '2px solid #1F7A3E' : 
                             iconState === 'default' ? '2px solid #E9EAEB' : 'none',
                      boxShadow: iconState === 'active' ? '0px 4px 12px rgba(99, 91, 255, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {iconState === 'completed' ? (
                      <Check size={20} style={{ color: '#1F7A3E' }} />
                    ) : (
                      <step.icon
                        size={20}
                        style={{
                          color: iconState === 'active' ? '#FFFFFF' : '#9A9FA5'
                        }}
                      />
                    )}
                  </div>

                  {/* Step Text */}
                  {(!sidebarCollapsed || mobileOverlayOpen) && (
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#9A9FA5',
                          textTransform: 'uppercase',
                          marginBottom: '4px'
                        }}
                      >
                        Step {step.number}
                      </div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: isActive ? '#635BFF' : '#1A1D1F'
                        }}
                      >
                        {step.title}
                      </div>
                    </div>
                  )}

                  {/* Expand/Collapse Icon for Step 3 */}
                  {step.hasSubSteps && (!sidebarCollapsed || mobileOverlayOpen) && (
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
                          color: '#6F767E',
                          transform: step3Expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Sub-steps */}
        {step.hasSubSteps && step3Expanded && (!sidebarCollapsed || mobileOverlayOpen) && (
          <div
                    style={{
                      marginTop: '8px',
                      paddingLeft: '32px',
                      borderLeft: '2px solid #E9EAEB',
                      marginLeft: '32px',
                      maxHeight: step3Expanded ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease'
                    }}
                  >
            {step.subSteps?.filter((subStep) => !isFreeEvent || subStep.key !== '3.1').map((subStep) => {
                      const subStepState = wizardState.steps[subStep.key];
                      const isSubActive = wizardState.currentStep === subStep.key;
                      const subIconState = getStepIconState(subStep.key);
                      const canNavigateToSub = canNavigateToStep(subStep.key);

                      return (
                        <div
                          key={subStep.key}
                          onClick={() => canNavigateToSub && navigateToStep(subStep.key as SubStep)}
                          style={{
                            padding: '10px 16px 10px 24px',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            cursor: canNavigateToSub ? 'pointer' : 'not-allowed',
                            backgroundColor: isSubActive ? '#F8F7FF' : 'transparent',
                            borderLeft: isSubActive ? '3px solid #635BFF' : 'none',
                            position: 'relative',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease',
                            opacity: canNavigateToSub ? 1 : 0.5
                          }}
                          onMouseEnter={(e) => {
                            if (canNavigateToSub && !isSubActive) {
                              e.currentTarget.style.backgroundColor = '#FAFBFC';
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
                                subIconState === 'completed' ? '#1F7A3E' :
                                subIconState === 'active' ? '#635BFF' : '#E9EAEB',
                              border: '2px solid #FFFFFF',
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
                                subIconState === 'completed' ? '#E6F4EA' :
                                subIconState === 'active' ? '#E0E7FF' : '#F4F5F6',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {subIconState === 'completed' ? (
                              <Check size={14} style={{ color: '#1F7A3E' }} />
                            ) : (
                              <subStep.icon
                                size={14}
                                style={{
                                  color: subIconState === 'active' ? '#635BFF' : '#6F767E'
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
                                color: isSubActive ? '#635BFF' : '#1A1D1F'
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

        {/* Sidebar Footer */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E9EAEB',
            padding: sidebarCollapsed && !mobileOverlayOpen ? '16px 8px' : '16px 20px',
            zIndex: 10
          }}
        >
          {(!sidebarCollapsed || mobileOverlayOpen) ? (
            <>
              {/* Progress Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6F767E' }}>
                  {progress.completed} of {progress.total} completed
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#635BFF' }}>
                  {progress.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#E9EAEB',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(to right, #635BFF, #7C75FF)',
                    width: `${progress.percentage}%`,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Save Draft Button */}
              <button
                onClick={handleManualSave}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E9EAEB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#6F767E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F5F6';
                  e.currentTarget.style.borderColor = '#635BFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E9EAEB';
                }}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
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
                  stroke="#E9EAEB"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#635BFF"
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
                  color: '#635BFF'
                }}
              >
                {progress.percentage}%
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: isMobile && !mobileOverlayOpen ? '56px' : (sidebarCollapsed ? '56px' : '280px'),
          padding: '40px',
          minHeight: 'calc(100vh - 72px)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {/* Content Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Title & Description */}
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#635BFF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}
            >
              {getStepIndicator()}
            </div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#1A1D1F',
                marginBottom: '8px'
              }}
            >
              {getStepTitle()}
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: '#6F767E',
                lineHeight: '1.5'
              }}
            >
              {getStepDescription()}
            </p>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                height: '40px',
                padding: '0 20px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6F767E',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F5F6';
                e.currentTarget.style.borderColor = '#635BFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E9EAEB';
              }}
            >
              <Eye size={16} />
              Preview
            </button>

            <button
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #E9EAEB',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4F5F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <HelpCircle size={18} style={{ color: '#6F767E' }} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            backgroundColor: wizardState.currentStep === 2 ? 'transparent' : '#FFFFFF',
            borderRadius: '16px',
            boxShadow: wizardState.currentStep === 2 ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.04)',
            padding: wizardState.currentStep === 2 ? '0' : '40px',
            minHeight: '500px',
            marginBottom: '100px'
          }}
        >
          {wizardState.currentStep === 1 ? (
            <EventDetailsForm />
          ) : wizardState.currentStep === 2 ? (
            <DesignTab />
          ) : wizardState.currentStep === '3.1' ? (
            isFreeEvent ? <AttendeesTab /> : <TicketsTab eventId={eventData.id || ''} />
          ) : wizardState.currentStep === '3.2' ? (
            <AttendeesTab />
          ) : wizardState.currentStep === '3.3' ? (
            <SpeakersTab eventId={eventData.id || ''} />
          ) : wizardState.currentStep === '3.4' ? (
            <ExhibitorsTab eventId={eventData.id || ''} />
          ) : wizardState.currentStep === 4 ? (
            <LaunchChecklist eventId={eventData.id || ''} onNavigate={navigateToStep} />
          ) : (
            /* Step Content Placeholder for other steps */
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A9FA5' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1D1F', marginBottom: '8px' }}>
                {getStepTitle()} Content
              </h3>
              <p style={{ fontSize: '14px', color: '#6F767E' }}>
                Form fields and content for this step will appear here.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Content Footer - Fixed */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: isMobile && !mobileOverlayOpen ? '56px' : (sidebarCollapsed ? '56px' : '280px'),
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E9EAEB',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.04)',
          zIndex: 40,
          transition: 'left 0.3s ease'
        }}
      >
        {/* Validation Error Alert */}
        {showValidationError && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '40px',
              right: '40px',
              backgroundColor: '#FEE2E2',
              borderLeft: '4px solid #DC2626',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#DC2626' }}>
              Please complete all required fields before continuing
            </span>
          </div>
        )}

        {/* Left: Back Button */}
        <button
          onClick={handleBack}
          disabled={wizardState.currentStep === 1}
          style={{
            height: '44px',
            padding: '0 20px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E9EAEB',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#6F767E',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: wizardState.currentStep === 1 ? 'not-allowed' : 'pointer',
            opacity: wizardState.currentStep === 1 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (wizardState.currentStep !== 1) {
              e.currentTarget.style.backgroundColor = '#F4F5F6';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleManualSave}
            style={{
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E9EAEB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6F767E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F5F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Save size={16} />
            Save Draft
          </button>

          <button
            onClick={handleSaveAndContinue}
            style={{
              height: '44px',
              padding: '0 24px',
              backgroundColor: '#635BFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7C75FF';
              e.currentTarget.style.boxShadow = '0px 4px 12px rgba(99, 91, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#635BFF';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {getPrimaryButtonText()}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showSavedToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1A1D1F',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease'
          }}
        >
          <Check size={16} style={{ color: '#10B981' }} />
          Draft saved
        </div>
      )}
    </div>
  );
}
