export function networkingErrorKey(error: unknown): string | null {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  const keys: Record<string, string> = {
    B2B_PARTICIPANT_BUSY: 'participantBusy', B2B_PARTICIPANT_UNAVAILABLE: 'slotChanged',
    B2B_VENUE_FULL: 'venueFull', B2B_PARTICIPANT_INELIGIBLE: 'ineligible',
    B2B_FORMAT_NOT_ALLOWED: 'formatNotAllowed', B2B_SLOT_OUTSIDE_SCHEDULE: 'outsideSchedule',
    B2B_DUPLICATE_REQUEST: 'duplicateRequest'
  };
  if (message.includes('B2B_PROFILE_INCOMPLETE')) return 'networkingExperience.unlockHint';
  const code = Object.keys(keys).find(code => message.includes(code));
  return code ? `networkingScheduling.${keys[code]}` : null;
}
