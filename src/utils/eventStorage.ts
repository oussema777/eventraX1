// Event creation wizard state management
// Using localStorage for persistence across wizard steps

export type EventStatus = 'free' | 'paid' | 'continuous';

interface EventBasicDetails {
  eventName: string;
  tagline: string;
  eventType: string;
  otherEventType?: string;
  eventStatus: EventStatus;
  eventFormat: 'in-person' | 'virtual' | 'hybrid';
  venueAddress?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  maxAttendees?: number;
  hasCapacityLimit: boolean;
  enableWaitlist: boolean;
  waitlistCapacity?: number;
}

const STORAGE_KEY = 'eventra_wizard_state';

export function saveEventBasicDetails(details: Partial<EventBasicDetails>) {
  const existing = getEventBasicDetails();
  const updated = { ...existing, ...details };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getEventBasicDetails(): Partial<EventBasicDetails> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function getEventStatus(): EventStatus {
  const details = getEventBasicDetails();
  return details.eventStatus || 'free';
}

export function isEventPaid(): boolean {
  return getEventStatus() === 'paid';
}

export function clearEventWizardState() {
  localStorage.removeItem(STORAGE_KEY);
}
