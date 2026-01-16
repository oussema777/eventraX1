// Wizard navigation utility
// Handles smart routing between wizard steps with event type awareness

import { NavigateFunction } from 'react-router-dom';
import { getEventStatus } from './eventStorage';
export type WizardStep = 1 | 2 | 3 | 4 | '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9';

/**
 * Get the first substep for Step 3 based on event type
 * - Paid events: Start with Tickets (3.1)
 * - Free events: Start with Speakers (3.2)
 */
export function getFirstStep3Substep(): '3.1' | '3.2' {
  return getEventStatus() === 'free' ? '3.2' : '3.1';
}

/**
 * Navigate to a wizard step with smart substep handling
 * @param step - The step to navigate to
 * @param navigate - React Router navigate function
 * @param setSubStep - Optional state setter for substeps (used when already on Step 3)
 */
export function navigateToWizardStep(
  step: WizardStep,
  navigate: NavigateFunction,
  setSubStep?: (substep: '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9') => void
) {
  // Handle substeps
  if (typeof step === 'string' && step.startsWith('3.')) {
    // If we have a substep setter and we're navigating to a Step 3 substep
    if (setSubStep) {
      setSubStep(step as '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9');
    } else {
      // Navigate to Step 3 page with the substep in URL (for future implementation)
      navigate('/create-event');
    }
    return;
  }

  // Handle main steps
  switch (step) {
    case 1:
      navigate('/create-event');
      break;
    case 2:
      navigate('/create-event');
      break;
    case 3:
      // When clicking on Step 3 from another page, go to Registration page
      // The Registration page will handle routing to the correct substep
      navigate('/create-event');
      break;
    case 4:
      navigate('/create-event');
      break;
  }
}

/**
 * Get all available substeps for Step 3 based on event type
 * - Paid events: Include Tickets
 * - Free events: Skip Tickets
 */
export function getAvailableStep3Substeps(): Array<{key: '3.1' | '3.2' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | '3.8' | '3.9', title: string}> {
  const isFreeEvent = getEventStatus() === 'free';
  const steps = [
    { key: '3.1' as const, title: 'Tickets' },
    { key: '3.2' as const, title: 'Speakers' },
    { key: '3.3' as const, title: 'Attendees' },
    { key: '3.4' as const, title: 'Exhibitors' },
    { key: '3.5' as const, title: 'Schedule' },
    { key: '3.6' as const, title: 'Sponsors' },
    { key: '3.7' as const, title: 'QR Badges' },
    { key: '3.8' as const, title: 'Custom Forms' },
    { key: '3.9' as const, title: 'Marketing Tools' }
  ];
  return isFreeEvent ? steps.filter((step) => step.key !== '3.1') : steps;
}

/**
 * Check if a substep is available based on event type
 */
export function isSubstepAvailable(substep: string): boolean {
  if (getEventStatus() === 'free' && substep === '3.1') {
    return false;
  }
  return true;
}
