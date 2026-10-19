// Reserved import identity. It holds legacy records, never a real person's inbox.
export const IMPORT_SYSTEM_PROFILE_ID = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f';

export function isSystemProfile(profile?: { id?: string; account_type?: string | null } | null) {
  return profile?.id === IMPORT_SYSTEM_PROFILE_ID || profile?.account_type === 'system';
}

export function businessContactEmail(business: { email?: string; contacts?: unknown }) {
  const contacts = Array.isArray(business.contacts) ? business.contacts : [];
  const values = [business.email, ...contacts.filter(c => c && typeof c === 'object' && (!c.kind || c.kind === 'email')).map(c => c.value)];
  return values.find(value => typeof value === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim()))?.trim() || null;
}
