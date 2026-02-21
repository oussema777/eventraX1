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
  maxAttendees?: number;
  hasCapacityLimit: boolean;
  enableWaitlist: boolean;
  waitlistCapacity?: number;
}

const BASE_STORAGE_KEY = 'eventra_wizard_state';

function getStorageKey(eventId?: string) {
  return eventId ? `${BASE_STORAGE_KEY}_${eventId}` : BASE_STORAGE_KEY;
}

export function saveEventBasicDetails(details: Partial<EventBasicDetails>, eventId?: string) {
  const existing = getEventBasicDetails(eventId);
  const updated = { ...existing, ...details };
  localStorage.setItem(getStorageKey(eventId), JSON.stringify(updated));
}

export function getEventBasicDetails(eventId?: string): Partial<EventBasicDetails> {
  const stored = localStorage.getItem(getStorageKey(eventId));
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function getEventStatus(eventId?: string): EventStatus {
  const details = getEventBasicDetails(eventId);
  return details.eventStatus || 'free';
}

export function isEventPaid(eventId?: string): boolean {
  return getEventStatus(eventId) === 'paid';
}

export function clearEventWizardState(eventId?: string) {
  localStorage.removeItem(getStorageKey(eventId));
  if (!eventId) {
    // Also clean up any legacy global state
    localStorage.removeItem(BASE_STORAGE_KEY);
  }
}
