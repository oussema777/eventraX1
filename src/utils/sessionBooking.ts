export interface BookableSession {
  id: string;
  type?: string;
  registration_open?: boolean;
  status?: string;
}

export function isSessionOpen(session: BookableSession): boolean {
  return session.registration_open !== false && session.status !== 'cancelled';
}

export function getWorkshopLimit(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

export function validateSessionSelection(
  sessions: BookableSession[], selected: Set<string>, workshopLimit: number | null,
): 'sessionUnavailable' | 'workshopLimitReached' | null {
  const chosen = sessions.filter(session => selected.has(session.id));
  if (chosen.length !== selected.size || chosen.some(session => !isSessionOpen(session))) return 'sessionUnavailable';
  if (workshopLimit !== null && chosen.filter(session => session.type === 'workshop').length > workshopLimit) {
    return 'workshopLimitReached';
  }
  return null;
}

// A bulk action must never choose a limited workshop on an attendee's behalf.
export function getBulkSessionIds(sessions: BookableSession[], workshopLimit: number | null): string[] {
  return sessions.filter(session => isSessionOpen(session) && (workshopLimit === null || session.type !== 'workshop'))
    .map(session => session.id);
}
