export const bookingProfileFields = ['full_name', 'job_title', 'company', 'industry'] as const;
export type BookingProfileField = typeof bookingProfileFields[number];
export function missingBookingFields(profile: Record<string, any> | null) {
  return bookingProfileFields.filter(field => {
    const value = field === 'industry' ? profile?.industry || profile?.sector : profile?.[field];
    return typeof value !== 'string' || !value.trim();
  });
}
