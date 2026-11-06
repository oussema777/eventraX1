// Preserve registration state: a public registration is not a manual approval.
export function attendeeStatus(value: string | null | undefined): string {
  return value?.trim().toLowerCase() || 'pending';
}

export function attendeeStatusCounts(attendees: { status?: string | null }[]): Record<string, number> {
  const counts: Record<string, number> = Object.create(null);
  for (const attendee of attendees) {
    const status = attendeeStatus(attendee.status);
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

export function attendeeStatusLabel(status: string): string {
  return attendeeStatus(status).replace(/[_-]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
