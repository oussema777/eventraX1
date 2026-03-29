import { supabase } from '../lib/supabase';
import { validateFileUpload, FILE_VALIDATION_PRESETS } from './security';

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 * Validates file type and size before uploading.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  preset: 'image' | 'submission' = 'image'
): Promise<string | null> {
  try {
    const validationError = validateFileUpload(file, FILE_VALIDATION_PRESETS[preset]);
    if (validationError) {
      console.error('File validation failed:', validationError);
      return null;
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Append cache-buster so browsers/CDN show the new file after replacement
    return `${publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Helper for business logo uploads
 */
export async function uploadBusinessLogo(businessId: string, file: File) {
  const extension = file.name.split('.').pop();
  const path = `${businessId}/logo.${extension}`;
  return uploadFile('business-logos', path, file);
}

/**
 * Helper for event cover uploads
 */
export async function uploadEventCover(eventId: string, file: File) {
  const extension = file.name.split('.').pop();
  const path = `events/${eventId}/cover.${extension}`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for event logo uploads
 */
export async function uploadEventLogo(eventId: string, file: File) {
  // Always use the same path so upsert replaces the previous logo regardless of file extension
  const path = `events/${eventId}/logo`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for exhibitor logo uploads
 */
export async function uploadExhibitorLogo(eventId: string, exhibitorId: string, file: File) {
  const extension = file.name.split('.').pop();
  const path = `events/${eventId}/exhibitors/${exhibitorId}/logo.${extension}`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for generic event asset uploads (e.g., block images)
 */
export async function uploadEventAsset(eventId: string, file: File) {
  const extension = file.name.split('.').pop();
  const timestamp = Date.now();
  const path = `events/${eventId}/assets/${timestamp}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for form submission file uploads
 */
export async function uploadFormSubmissionFile(eventId: string, attendeeId: string, file: File) {
  const extension = file.name.split('.').pop();
  const timestamp = Date.now();
  const path = `events/${eventId}/submissions/${attendeeId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  return uploadFile('submissions', path, file, 'submission');
}
