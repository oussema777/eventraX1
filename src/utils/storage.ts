import { supabase } from '../lib/supabase';
import { validateFileUpload, FILE_VALIDATION_PRESETS } from './security';

function getExtensionFromMime(file: File): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };
  return mimeMap[file.type] || file.name.split('.').pop() || 'bin';
}

/**
 * Compresses an image file using canvas.
 * Resizes to maxWidth, converts to JPEG at given quality.
 * Returns the original file if it's not an image or compression fails.
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  // Skip SVGs and small files (under 100KB)
  if (file.type === 'image/svg+xml' || file.size < 100 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Skip if already small enough
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 * Validates file type and size before uploading.
 * Images are automatically compressed before upload.
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
    // Compress images before upload (max 1200px wide, 80% quality)
    const processedFile = preset === 'image' ? await compressImage(file) : file;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, processedFile, {
        cacheControl: '2592000',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Cache-buster needed because upsert replaces files at the same path.
    // The timestamp is stored in DB, not regenerated on each page load.
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
  const extension = getExtensionFromMime(file);
  const path = `${businessId}/logo.${extension}`;
  return uploadFile('business-logos', path, file);
}

/**
 * Helper for event cover uploads
 */
export async function uploadEventCover(eventId: string, file: File) {
  const extension = getExtensionFromMime(file);
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
  const extension = getExtensionFromMime(file);
  const path = `events/${eventId}/exhibitors/${exhibitorId}/logo.${extension}`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for generic event asset uploads (e.g., block images)
 */
export async function uploadEventAsset(eventId: string, file: File) {
  const extension = getExtensionFromMime(file);
  const timestamp = Date.now();
  const path = `events/${eventId}/assets/${timestamp}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  return uploadFile('profiles', path, file);
}

/**
 * Helper for form submission file uploads
 */
export async function uploadFormSubmissionFile(eventId: string, attendeeId: string, file: File) {
  const extension = getExtensionFromMime(file);
  const timestamp = Date.now();
  const path = `events/${eventId}/submissions/${attendeeId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
  return uploadFile('submissions', path, file, 'submission');
}
