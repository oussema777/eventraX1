export const normalizeNetworkingValue = (value: string) => value.trim().normalize('NFKC').toLocaleLowerCase('en');

export function resolveEventSector(registration: Record<string, unknown> = {}, profile: { sector?: unknown; industry?: unknown } = {}): string | null {
  // An event-specific answer wins. Do not confuse industries of interest with
  // the participant's own sector, or modify their account to fill a display gap.
  for (const value of [registration.sector, registration.Sector, registration.Industry, profile.sector, profile.industry]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function sectorOptions(people: { sector?: string | null }[]) {
  const labels = new Map<string, string>();
  for (const person of people) {
    if (person.sector) labels.set(normalizeNetworkingValue(person.sector), person.sector.trim());
  }
  return [...labels.values()].sort((a, b) => a.localeCompare(b));
}
