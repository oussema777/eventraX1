export const REGISTRATION_SYSTEM_FIELDS = [
  { id: 'system-fullName', type: 'text', label: 'Full Name', required: true },
  { id: 'system-email', type: 'email', label: 'Email Address', required: true },
  { id: 'system-phone', type: 'phone', label: 'Phone Number', required: true },
  { id: 'system-companyName', type: 'text', label: 'Company Name', required: true },
  { id: 'system-companyDescription', type: 'textarea', label: 'Short Company Description', required: true },
  { id: 'system-interests', type: 'multichoice', label: 'Interests', required: true },
  { id: 'system-sector', type: 'dropdown', label: 'Sector', required: true },
  { id: 'system-socialUrl', type: 'url', label: 'Social / Website URL', required: true },
  { id: 'system-b2bOptIn', type: 'checkbox', label: 'Want B2B Matching?', required: true },
] as const;

export const isRegistrationSystemField = (id: string) =>
  REGISTRATION_SYSTEM_FIELDS.some(field => field.id === id);

// Registration fields are required platform-wide, including forms saved with
// older optional-field overrides. B2B requires an explicit yes/no answer.
export const isRegistrationSystemFieldRequired = (id: string, _overrides: Record<string, boolean> = {}) =>
  isRegistrationSystemField(id);

// Older registration forms store name and email as custom fields, even though
// the attendee page already renders them as built-in fields.
export const isLegacyRegistrationField = (id: string) =>
  id === 'default-name' || id === 'default-email' || id === 'fullName' || id === 'email';

export const isVisibleRegistrationCustomField = (field: { id: string; label: string; type: string }) => {
  if (isLegacyRegistrationField(field.id) || isRegistrationSystemField(field.id)) return false;
  const label = field.label.toLowerCase();
  return !(label.includes('full name') || label === 'name' || label === 'nom' ||
    label.includes('email') || label.includes('e-mail') ||
    (field.type === 'phone' && (label.includes('phone') || label.includes('téléphone') || label.includes('هاتف'))) ||
    (label.includes('company') && !label.includes('size') && !label.includes('stage')) ||
    label.includes('campany') || label.includes('sector') || label.includes('secteur') ||
    label.includes('قطاع') || label.includes('entreprise'));
};

export const getRegistrationFieldOrder = (
  customIds: string[],
  savedOrder?: string[]
) => {
  const systemIds = REGISTRATION_SYSTEM_FIELDS.map(field => field.id);
  const validIds = [...systemIds, ...customIds.filter(id => !isLegacyRegistrationField(id) && !isRegistrationSystemField(id))];
  if (!savedOrder?.length) return validIds;
  const ordered = savedOrder.filter(id => validIds.includes(id));
  return [...new Set([...ordered, ...validIds])];
};
