import { supabase } from '../lib/supabase';

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
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

    return publicUrl;
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
  const extension = file.name.split('.').pop();
  const path = `events/${eventId}/logo.${extension}`;
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
