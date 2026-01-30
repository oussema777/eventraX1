/**
 * Admin Configuration
 * 
 * Add email addresses here that should have full administrative access 
 * to the platform, regardless of their domain.
 */
export const ADMIN_EMAILS = [
  'marketing@redstart.tn',
  'admin@eventra.com',
  'demo@eventra.com'
];

/**
 * Check if a user email is in the admin list
 */
export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}